// cmd/gen-test-xlsx/main.go
// Generates a test Excel file for the Ledarise import smoke-test.
// Usage: go run ./cmd/gen-test-xlsx [output-path]
package main

import (
	"fmt"
	"os"
	"time"

	"github.com/xuri/excelize/v2"
)

func main() {
	outPath := "/tmp/ledarise-test.xlsx"
	if len(os.Args) > 1 {
		outPath = os.Args[1]
	}

	f := excelize.NewFile()
	sheet := "Sheet1"
	f.SetSheetName(f.GetSheetName(0), sheet)

	// Headers
	headers := []string{
		"ID",
		"Bill-to Name",
		"Ship-to Address",
		"Tel",
		"Status",
		"Grand Total (Base)",
		"Shipping Amount",
		"SKU",
		"Item Count",
		"Country Id",
		"Coupon Code",
		"Purchase Date",
	}
	for col, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(col+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	now := time.Now()
	rows := [][]interface{}{
		// 10 valid rows
		{"PO900000001", "Alice Johnson",   "416 Country Club Dr, Griffin, Georgia, 30223, US",  "+14045551001", "COMPLETE", 129.99, 12.99, "EBP-1208",  2, "US", "SAVE10",  now.AddDate(0, 0, -60).Format("2006-01-02")},
		{"PO900000002", "Bob Smith",        "12 Baker Street, London, England, W1U 6TY, GB",     "+447911123456", "complete", 89.50,  9.99,  "HOLLY-22",  1, "GB", "",        now.AddDate(0, 0, -55).Format("2006-01-02")},
		{"PO900000003", "Claudia Müller",   "Friedrichstr 20, Berlin, Berlin, 10117, DE",        "+4930987654",  "COMPLETE", 199.00, 14.50, "HS-04",     3, "DE", "WELCOME", now.AddDate(0, 0, -50).Format("2006-01-02")},
		{"PO900000004", "David Lee",        "555 Maple Ave, Chicago, Illinois, 60614, US",       "+13125554321", "complete", 59.95,  7.99,  "NEW-001",   1, "US", "",        now.AddDate(0, 0, -45).Format("2006-01-02")},
		{"PO900000005", "Emma Wilson",      "789 Oak Lane, Toronto, Ontario, M5V 3A9, CA",       "+14165556789", "COMPLETE", 145.00, 15.00, "EBP-1208",  1, "CA", "CA15",    now.AddDate(0, 0, -40).Format("01/02/2006")},
		{"PO900000006", "François Dubois",  "14 Rue de Rivoli, Paris, Île-de-France, 75001, FR", "+33140202000", "complete", 220.00, 18.00, "HOLLY-22",  2, "FR", "",        now.AddDate(0, 0, -35).Format("2006-01-02")},
		{"PO900000007", "Grace Kim",        "100 Orchard Rd, Singapore, Central, 238840, SG",    "+6591234567",  "COMPLETE", 175.50, 20.00, "HS-04",     1, "SG", "SG20",    now.AddDate(0, 0, -30).Format("2006-01-02")},
		{"PO900000008", "Henry Brown",      "22 Collins St, Melbourne, Victoria, 3000, AU",      "+61399998888", "complete", 95.00,  11.50, "NEW-001",   2, "AU", "",        now.AddDate(0, 0, -25).Format("2006/01/02")},
		{"PO900000009", "Isabella Rossi",   "Via Roma 10, Rome, Lazio, 00187, IT",               "+3906123456",  "COMPLETE", 310.00, 22.00, "EBP-1208",  4, "IT", "IT10",    now.AddDate(0, 0, -20).Format("2006-01-02")},
		{"PO900000010", "James Taylor",     "350 5th Ave, New York, New York, 10118, US",        "+12125555050", "complete", 78.00,  8.99,  "HOLLY-22",  1, "US", "",        now.AddDate(0, 0, -10).Format("2006-01-02 15:04:05")},
		// Row 11: missing SKU → should be skipped with error
		{"PO900000011", "Karen White",      "99 High St, Oxford, Oxfordshire, OX1 4BH, GB",     "+44186512345", "complete", 55.00,  6.00,  "",          1, "GB", "",        now.AddDate(0, 0, -5).Format("2006-01-02")},
		// Row 12: duplicate order_no PO900000001 → should be skipped
		{"PO900000001", "Alice Johnson",    "416 Country Club Dr, Griffin, Georgia, 30223, US",  "+14045551001", "complete", 129.99, 12.99, "EBP-1208",  2, "US", "SAVE10",  now.AddDate(0, 0, -60).Format("2006-01-02")},
	}

	for rowIdx, row := range rows {
		for col, val := range row {
			cell, _ := excelize.CoordinatesToCellName(col+1, rowIdx+2)
			f.SetCellValue(sheet, cell, val)
		}
	}

	if err := f.SaveAs(outPath); err != nil {
		fmt.Fprintf(os.Stderr, "error saving xlsx: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("Test xlsx written to %s (%d data rows: 10 valid, 1 missing SKU, 1 duplicate)\n", outPath, len(rows))
}
