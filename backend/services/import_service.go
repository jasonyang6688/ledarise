package services

import (
	"errors"
	"fmt"
	"hash/fnv"
	"math"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
	"ledarise-backend/database"
	"ledarise-backend/models"
)

// ─── Types ───────────────────────────────────────────────────────────────────

type ImportProgress struct {
	TaskID            string        `json:"task_id"`
	Status            string        `json:"status"` // pending|running|completed|failed
	TotalRows         int           `json:"total_rows"`
	ProcessedRows     int           `json:"processed_rows"`
	ImportedOrders    int           `json:"imported_orders"`
	ImportedCustomers int           `json:"imported_customers"`
	ImportedProducts  int           `json:"imported_products"`
	SkippedRows       int           `json:"skipped_rows"`
	Errors            []ImportError `json:"errors"`
	StartedAt         time.Time     `json:"started_at"`
	FinishedAt        *time.Time    `json:"finished_at,omitempty"`
	ErrorMessage      string        `json:"error_message,omitempty"`
}

type ImportError struct {
	Row    int    `json:"row"`
	Reason string `json:"reason"`
}

// ─── In-memory task store ─────────────────────────────────────────────────────

var (
	taskStore    sync.Map // string -> *taskEntry
	taskOrderMu  sync.Mutex
	taskOrder    []string // insertion order for eviction
	maxTasksKept = 20
)

type taskEntry struct {
	mu       sync.Mutex
	progress ImportProgress
}

func storeTask(taskID string, p ImportProgress) {
	entry := &taskEntry{progress: p}
	taskStore.Store(taskID, entry)

	taskOrderMu.Lock()
	defer taskOrderMu.Unlock()
	taskOrder = append(taskOrder, taskID)

	// Evict tasks beyond cap (only completed/failed)
	for len(taskOrder) > maxTasksKept {
		oldest := taskOrder[0]
		taskOrder = taskOrder[1:]
		taskStore.Delete(oldest)
	}
}

func updateTask(taskID string, fn func(*ImportProgress)) {
	if v, ok := taskStore.Load(taskID); ok {
		e := v.(*taskEntry)
		e.mu.Lock()
		defer e.mu.Unlock()
		fn(&e.progress)
	}
}

// GetImportProgress returns the progress for the given task ID.
func GetImportProgress(taskID string) (*ImportProgress, bool) {
	if v, ok := taskStore.Load(taskID); ok {
		e := v.(*taskEntry)
		e.mu.Lock()
		defer e.mu.Unlock()
		cp := e.progress
		return &cp, true
	}
	return nil, false
}

// StartImport saves the xlsx at filePath, spawns a background goroutine,
// and returns the task ID immediately.
func StartImport(filePath string) string {
	taskID := uuid.New().String()
	p := ImportProgress{
		TaskID:    taskID,
		Status:    "pending",
		Errors:    []ImportError{},
		StartedAt: time.Now(),
	}
	storeTask(taskID, p)
	go runImport(taskID, filePath)
	return taskID
}

// ─── Country lookup ──────────────────────────────────────────────────────────

var countryCodeMap = map[string]string{
	"US": "United States",
	"GB": "United Kingdom",
	"DE": "Germany",
	"FR": "France",
	"CA": "Canada",
	"AU": "Australia",
	"JP": "Japan",
	"CN": "China",
	"KR": "South Korea",
	"IT": "Italy",
	"ES": "Spain",
	"NL": "Netherlands",
	"SE": "Sweden",
	"NO": "Norway",
	"DK": "Denmark",
	"FI": "Finland",
	"CH": "Switzerland",
	"AT": "Austria",
	"BE": "Belgium",
	"PT": "Portugal",
	"PL": "Poland",
	"RU": "Russia",
	"BR": "Brazil",
	"MX": "Mexico",
	"IN": "India",
	"SG": "Singapore",
	"NZ": "New Zealand",
	"ZA": "South Africa",
	"AE": "United Arab Emirates",
	"SA": "Saudi Arabia",
}

func normalizeCountryCode(code string) string {
	code = strings.TrimSpace(code)
	upper := strings.ToUpper(code)
	if full, ok := countryCodeMap[upper]; ok {
		return full
	}
	return titleCase(code)
}

func titleCase(s string) string {
	words := strings.Fields(s)
	for i, w := range words {
		if len(w) > 0 {
			words[i] = strings.ToUpper(w[:1]) + strings.ToLower(w[1:])
		}
	}
	return strings.Join(words, " ")
}

// ─── Header normalisation ─────────────────────────────────────────────────────

var parenSuffix = regexp.MustCompile(`\s*\(.*?\)\s*$`)
var whitespaceRun = regexp.MustCompile(`\s+`)

func normalizeHeader(h string) string {
	h = strings.ToLower(strings.TrimSpace(h))
	h = parenSuffix.ReplaceAllString(h, "")
	h = whitespaceRun.ReplaceAllString(h, " ")
	return strings.TrimSpace(h)
}

// ─── Address parsing ──────────────────────────────────────────────────────────

// Known full country name → normalised form (lower → proper)
var fullCountryNames = map[string]string{
	"united states":  "United States",
	"united kingdom": "United Kingdom",
	"germany":        "Germany",
	"france":         "France",
	"canada":         "Canada",
	"australia":      "Australia",
}

var addrCityRegex = regexp.MustCompile(`(?i)^(.+?)\s+([A-Z][A-Za-z\s\-]+?)$`)

func parseShipAddress(raw string) (address, city, state, zip, country string) {
	if raw == "" {
		return
	}
	parts := strings.Split(raw, ",")
	for i, p := range parts {
		parts[i] = strings.TrimSpace(p)
	}
	n := len(parts)

	switch {
	case n >= 4:
		country = normalizeFullCountry(parts[n-1])
		zip = strings.TrimSpace(parts[n-2])
		state = strings.TrimSpace(parts[n-3])
		firstChunk := strings.Join(parts[:n-3], ", ")
		address, city = splitAddressCity(firstChunk)

	case n == 3:
		country = normalizeFullCountry(parts[2])
		zip = parts[1]
		address, city = splitAddressCity(parts[0])

	case n == 2:
		country = normalizeFullCountry(parts[1])
		address, city = splitAddressCity(parts[0])

	default:
		address = raw
	}
	return
}

func normalizeFullCountry(raw string) string {
	key := strings.ToLower(strings.TrimSpace(raw))
	if v, ok := fullCountryNames[key]; ok {
		return v
	}
	return titleCase(raw)
}

func splitAddressCity(chunk string) (address, city string) {
	chunk = strings.TrimSpace(chunk)
	m := addrCityRegex.FindStringSubmatch(chunk)
	if m != nil {
		address = strings.TrimSpace(m[1])
		city = strings.TrimSpace(m[2])
		return
	}
	// fallback: dump everything into address
	address = chunk
	return
}

// ─── Date parsing ────────────────────────────────────────────────────────────

var dateLayouts = []string{
	"2006-01-02 15:04:05",
	"2006-01-02 15:04",
	"2006-01-02",
	"2006-1-2 15:04:05",
	"2006-1-2 15:04",
	"2006-1-2",
	"01/02/2006 15:04:05",
	"01/02/2006 15:04",
	"01/02/2006",
	"1/2/2006 15:04:05",
	"1/2/2006 15:04",
	"1/2/2006",
	"2006/01/02 15:04:05",
	"2006/01/02 15:04",
	"2006/01/02",
	"2006/1/2 15:04:05",
	"2006/1/2 15:04",
	"2006/1/2",
	"2006-01-02T15:04:05Z07:00",
}

func parseDate(s string) *time.Time {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil
	}
	for _, layout := range dateLayouts {
		if t, err := time.Parse(layout, s); err == nil {
			return &t
		}
	}
	// Fallback: Excel serial number (e.g. "45822.7151967593")
	if f, err := strconv.ParseFloat(s, 64); err == nil && f > 0 && f < 200000 {
		if t, err := excelize.ExcelDateToTime(f, false); err == nil {
			return &t
		}
	}
	return nil
}

// ─── Status normalisation ────────────────────────────────────────────────────

var validStatuses = map[string]bool{
	"pending":    true,
	"processing": true,
	"complete":   true,
	"cancelled":  true,
}

func normalizeStatus(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	if validStatuses[s] {
		return s
	}
	return "complete"
}

// ─── Float helper ─────────────────────────────────────────────────────────────

func parseFloat(s string) float64 {
	s = strings.TrimSpace(s)
	s = strings.ReplaceAll(s, ",", "")
	f, _ := strconv.ParseFloat(s, 64)
	return f
}

func parseInt(s string) int {
	s = strings.TrimSpace(s)
	i, _ := strconv.Atoi(s)
	return i
}

func lookupImportCache(global, batch map[string]uint, key string) (uint, bool) {
	if id, ok := batch[key]; ok {
		return id, true
	}
	id, ok := global[key]
	return id, ok
}

func commitImportCache(global, batch map[string]uint) {
	for key, id := range batch {
		global[key] = id
	}
}

// ─── Main import goroutine ────────────────────────────────────────────────────

const batchSize = 500

func runImport(taskID, filePath string) {
	defer func() {
		if r := recover(); r != nil {
			msg := fmt.Sprintf("panic: %v", r)
			updateTask(taskID, func(p *ImportProgress) {
				p.Status = "failed"
				p.ErrorMessage = msg
				now := time.Now()
				p.FinishedAt = &now
			})
		}
		// Best-effort cleanup of uploaded file
		_ = os.Remove(filePath)
	}()

	updateTask(taskID, func(p *ImportProgress) { p.Status = "running" })

	db := database.DB

	// 1. Open file
	f, err := excelize.OpenFile(filePath)
	if err != nil {
		failTask(taskID, fmt.Sprintf("cannot open xlsx: %v", err))
		return
	}
	defer f.Close()

	sheets := f.GetSheetList()
	if len(sheets) == 0 {
		failTask(taskID, "xlsx has no sheets")
		return
	}
	sheetName := sheets[0]

	// Read with raw cell values so date columns come back as Excel serial
	// numbers (preserving seconds) instead of locale-formatted strings.
	rows, err := f.GetRows(sheetName, excelize.Options{RawCellValue: true})
	if err != nil {
		failTask(taskID, fmt.Sprintf("cannot read rows: %v", err))
		return
	}
	if len(rows) < 2 {
		failTask(taskID, "xlsx has no data rows")
		return
	}

	// 2. Build header map
	headerRow := rows[0]
	colIdx := make(map[string]int)
	for i, h := range headerRow {
		norm := normalizeHeader(h)
		colIdx[norm] = i
	}

	// Require critical headers
	for _, req := range []string{"id", "bill-to name", "sku"} {
		if _, ok := colIdx[req]; !ok {
			failTask(taskID, fmt.Sprintf("missing required header: %q", req))
			return
		}
	}

	// Handle "grand total (base)" vs "grand total"
	if _, ok := colIdx["grand total"]; !ok {
		if _, ok2 := colIdx["grand total (base)"]; ok2 {
			colIdx["grand total"] = colIdx["grand total (base)"]
		}
	}

	dataRows := rows[1:]
	totalRows := len(dataRows)
	updateTask(taskID, func(p *ImportProgress) { p.TotalRows = totalRows })

	// In-memory dedup caches for this run
	customerCache := make(map[string]uint) // "name|phone" -> customer ID
	productCache := make(map[string]uint)  // sku -> product ID
	orderCache := make(map[string]bool)    // order_no seen in THIS file
	// Note: we no longer pre-load existing order_nos. Existing orders will
	// be replaced (delete + re-insert) so re-importing the same file
	// updates fields like purchased_at instead of skipping.

	// Batch state
	type batchRow struct {
		rowNum      int
		orderNo     string
		custKey     string
		custName    string
		custPhone   string
		shipAddr    string
		shipCity    string
		shipState   string
		shipZip     string
		shipCountry string
		status      string
		grandTotal  float64
		shipping    float64
		sku         string
		qty         int
		coupon      string
		purchasedAt *time.Time
	}

	var (
		batch             []batchRow
		totalImported     int
		totalSkipped      int
		totalCustImported int
		totalProdImported int
		importErrors      []ImportError
	)

	flush := func(rows []batchRow) {
		if len(rows) == 0 {
			return
		}
		// Collect unique customers and products needed
		newCustomers := map[string]*models.Customer{}
		newProducts := map[string]*models.Product{}

		for _, r := range rows {
			if _, ok := customerCache[r.custKey]; !ok {
				if _, pending := newCustomers[r.custKey]; !pending {
					newCustomers[r.custKey] = &models.Customer{
						Name:  r.custName,
						Phone: r.custPhone,
					}
				}
			}
			if _, ok := productCache[r.sku]; !ok {
				if _, pending := newProducts[r.sku]; !pending {
					price := math.Max(0, r.grandTotal-r.shipping)
					newProducts[r.sku] = &models.Product{
						Name:     r.sku,
						SKU:      r.sku,
						Price:    price,
						Status:   models.ProductStatusPublished,
						Category: pickCategoryForSKU(r.sku),
						Tone:     "#3a2a1f",
						Accent:   "#b8895c",
					}
				}
			}
		}

		batchCustomerCache := make(map[string]uint, len(newCustomers))
		batchProductCache := make(map[string]uint, len(newProducts))
		batchCustImported := 0
		batchProdImported := 0
		batchOrdersImported := 0

		err := db.Transaction(func(tx *gorm.DB) error {
			// Upsert customers (update Country from import row's country)
			// Build name|phone -> country map from current batch
			custCountryByKey := map[string]string{}
			for _, r := range rows {
				if r.shipCountry != "" {
					custCountryByKey[r.custKey] = r.shipCountry
				}
			}
			for key, cust := range newCustomers {
				cust.Country = custCountryByKey[key]
				var existing models.Customer
				err := tx.Where("name = ? AND phone = ?", cust.Name, cust.Phone).First(&existing).Error
				if err == nil {
					// Update country if we have a non-empty value
					if cust.Country != "" && existing.Country != cust.Country {
						if err2 := tx.Model(&existing).Update("country", cust.Country).Error; err2 != nil {
							return fmt.Errorf("update customer %q: %w", key, err2)
						}
					}
					batchCustomerCache[key] = existing.ID
				} else if errors.Is(err, gorm.ErrRecordNotFound) {
					if err2 := tx.Create(cust).Error; err2 != nil {
						return fmt.Errorf("create customer %q: %w", key, err2)
					}
					batchCustomerCache[key] = cust.ID
					batchCustImported++
				} else {
					return fmt.Errorf("query customer %q: %w", key, err)
				}
			}

			// Upsert products (refresh Price from import; keep admin-edited
			// descriptive fields untouched)
			for sku, prod := range newProducts {
				var existing models.Product
				err := tx.Where("sku = ?", sku).First(&existing).Error
				if err == nil {
					updates := map[string]interface{}{}
					if prod.Price > 0 && existing.Price != prod.Price {
						updates["price"] = prod.Price
					}
					if existing.Category == "" || existing.Category == "Imported" {
						updates["category"] = prod.Category
					}
					if len(updates) > 0 {
						if err2 := tx.Model(&existing).Updates(updates).Error; err2 != nil {
							return fmt.Errorf("update product %q: %w", sku, err2)
						}
					}
					batchProductCache[sku] = existing.ID
				} else if errors.Is(err, gorm.ErrRecordNotFound) {
					if err2 := tx.Create(prod).Error; err2 != nil {
						return fmt.Errorf("create product %q: %w", sku, err2)
					}
					batchProductCache[sku] = prod.ID
					batchProdImported++
				} else {
					return fmt.Errorf("query product %q: %w", sku, err)
				}
			}

			// Insert orders + items (replace if order_no already exists)
			for _, r := range rows {
				custID, ok := lookupImportCache(customerCache, batchCustomerCache, r.custKey)
				if !ok || custID == 0 {
					return fmt.Errorf("missing customer reference for %q", r.custKey)
				}
				prodID, ok := lookupImportCache(productCache, batchProductCache, r.sku)
				if !ok || prodID == 0 {
					return fmt.Errorf("missing product reference for %q", r.sku)
				}

				price := math.Max(0, r.grandTotal-r.shipping)
				subtotal := price * float64(r.qty)

				// Replace existing order with the same order_no.
				var existing models.Order
				err := tx.Where("order_no = ?", r.orderNo).First(&existing).Error
				if err == nil {
					if err2 := tx.Where("order_id = ?", existing.ID).Delete(&models.OrderItem{}).Error; err2 != nil {
						return fmt.Errorf("delete old items for %q: %w", r.orderNo, err2)
					}
					if err2 := tx.Unscoped().Delete(&existing).Error; err2 != nil {
						return fmt.Errorf("delete old order %q: %w", r.orderNo, err2)
					}
				} else if !errors.Is(err, gorm.ErrRecordNotFound) {
					return fmt.Errorf("query order %q: %w", r.orderNo, err)
				}

				order := models.Order{
					OrderNo:        r.orderNo,
					CustomerID:     &custID,
					Status:         r.status,
					Subtotal:       subtotal,
					ShippingAmount: r.shipping,
					GrandTotal:     r.grandTotal,
					CouponCode:     r.coupon,
					ShipName:       r.custName,
					ShipPhone:      r.custPhone,
					ShipAddress:    r.shipAddr,
					ShipCity:       r.shipCity,
					ShipState:      r.shipState,
					ShipZip:        r.shipZip,
					ShipCountry:    r.shipCountry,
					PurchasedAt:    r.purchasedAt,
				}
				if err := tx.Create(&order).Error; err != nil {
					return fmt.Errorf("create order %q: %w", r.orderNo, err)
				}

				item := models.OrderItem{
					OrderID:     order.ID,
					ProductID:   &prodID,
					SKU:         r.sku,
					ProductName: r.sku,
					Price:       price,
					Quantity:    r.qty,
					Subtotal:    subtotal,
				}
				if err := tx.Create(&item).Error; err != nil {
					return fmt.Errorf("create order item for %q: %w", r.orderNo, err)
				}
				batchOrdersImported++
			}
			return nil
		})

		if err != nil {
			// Mark all rows in the batch as errored
			for _, r := range rows {
				importErrors = append(importErrors, ImportError{
					Row:    r.rowNum,
					Reason: fmt.Sprintf("batch error: %v", err),
				})
				totalSkipped++
			}
		} else {
			commitImportCache(customerCache, batchCustomerCache)
			commitImportCache(productCache, batchProductCache)
			totalCustImported += batchCustImported
			totalProdImported += batchProdImported
			totalImported += batchOrdersImported
		}
	}

	// 3. Process rows
	for i, row := range dataRows {
		rowNum := i + 2 // 1-based, accounting for header

		// Safe cell access
		getCell := func(key string) string {
			idx, ok := colIdx[key]
			if !ok || idx >= len(row) {
				return ""
			}
			return strings.TrimSpace(row[idx])
		}

		// Process each row defensively
		var rowErr error
		func() {
			defer func() {
				if r := recover(); r != nil {
					rowErr = fmt.Errorf("panic: %v", r)
				}
			}()

			orderNo := getCell("id")
			custName := getCell("bill-to name")
			sku := getCell("sku")

			// Skip rows with empty critical fields
			if orderNo == "" || sku == "" || custName == "" {
				reason := "missing required field:"
				if orderNo == "" {
					reason += " ID"
				}
				if sku == "" {
					reason += " SKU"
				}
				if custName == "" {
					reason += " Bill-to Name"
				}
				importErrors = append(importErrors, ImportError{Row: rowNum, Reason: strings.TrimSpace(reason)})
				totalSkipped++
				return
			}

			// Dedup duplicate rows within the same file (keep first occurrence)
			if orderCache[orderNo] {
				importErrors = append(importErrors, ImportError{
					Row:    rowNum,
					Reason: fmt.Sprintf("duplicate order_no %q in file — kept first occurrence", orderNo),
				})
				totalSkipped++
				return
			}
			orderCache[orderNo] = true

			phone := getCell("tel")
			shipRaw := getCell("ship-to address")
			statusRaw := getCell("status")
			gtRaw := getCell("grand total")
			shipAmtRaw := getCell("shipping amount")
			qtyRaw := getCell("item count")
			countryID := getCell("country id")
			coupon := getCell("coupon code")
			dateRaw := getCell("purchase date")

			grandTotal := parseFloat(gtRaw)
			shipping := parseFloat(shipAmtRaw)
			qty := parseInt(qtyRaw)
			if qty <= 0 {
				qty = 1
			}

			status := normalizeStatus(statusRaw)

			// Parse address
			addr, city, state, zip, country := parseShipAddress(shipRaw)
			// Country ID overrides parsed country if provided
			if countryID != "" {
				country = normalizeCountryCode(countryID)
			}

			purchasedAt := parseDate(dateRaw)
			custKey := custName + "|" + phone

			batch = append(batch, batchRow{
				rowNum:      rowNum,
				orderNo:     orderNo,
				custKey:     custKey,
				custName:    custName,
				custPhone:   phone,
				shipAddr:    addr,
				shipCity:    city,
				shipState:   state,
				shipZip:     zip,
				shipCountry: country,
				status:      status,
				grandTotal:  grandTotal,
				shipping:    shipping,
				sku:         sku,
				qty:         qty,
				coupon:      coupon,
				purchasedAt: purchasedAt,
			})
		}()

		if rowErr != nil {
			importErrors = append(importErrors, ImportError{Row: rowNum, Reason: rowErr.Error()})
			totalSkipped++
		}

		// Flush batch every batchSize valid rows
		if len(batch) >= batchSize {
			flush(batch)
			batch = batch[:0]
		}

		// Update progress
		processed := i + 1
		updateTask(taskID, func(p *ImportProgress) {
			p.ProcessedRows = processed
			p.ImportedOrders = totalImported
			p.ImportedCustomers = totalCustImported
			p.ImportedProducts = totalProdImported
			p.SkippedRows = totalSkipped
			p.Errors = importErrors
		})
	}

	// Flush remaining
	flush(batch)

	// Final update
	now := time.Now()
	updateTask(taskID, func(p *ImportProgress) {
		p.Status = "completed"
		p.ProcessedRows = totalRows
		p.ImportedOrders = totalImported
		p.ImportedCustomers = totalCustImported
		p.ImportedProducts = totalProdImported
		p.SkippedRows = totalSkipped
		p.Errors = importErrors
		p.FinishedAt = &now
	})
}

func failTask(taskID, msg string) {
	now := time.Now()
	updateTask(taskID, func(p *ImportProgress) {
		p.Status = "failed"
		p.ErrorMessage = msg
		p.FinishedAt = &now
	})
}

// importCategories matches the seed catalog so imported SKUs blend with the demo data.
var importCategories = []string{"Toupee", "Short", "Medium", "Long", "Curly", "Gray"}

// pickCategoryForSKU deterministically assigns a category based on SKU hash so
// re-imports stay stable (no random drift between runs).
func pickCategoryForSKU(sku string) string {
	if sku == "" {
		return importCategories[0]
	}
	h := fnv.New32a()
	_, _ = h.Write([]byte(sku))
	return importCategories[int(h.Sum32())%len(importCategories)]
}
