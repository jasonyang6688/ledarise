package database

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"ledarise-backend/models"
)

type productSeed struct {
	sku           string
	name          string
	price         float64
	originalPrice float64
	category      string
	color         string
	length        string
	material      string
	stock         int
	tone          string
	accent        string
	tagline       string
	description   string
	sales         int
	rating        float64
	reviews       int
	features      []string
}

type customerSeed struct {
	name    string
	email   string
	phone   string
	country string
	city    string
}

type orderSeedItem struct {
	productIdx int
	qty        int
}

type orderSeed struct {
	no     string
	custID int // index into customers slice
	items  []orderSeedItem
	sub    float64
	ship   float64
	status string
	date   string
}

var productSeeds = []productSeed{
	{
		sku: "EBP-1208", name: "Edinburgh Hand-Tied Toupee",
		price: 289, originalPrice: 349, category: "Toupee", color: "Dark Brown", length: "6 inch", material: "Swiss Lace",
		stock: 24, tone: "#3a2a1f", accent: "#a07b51",
		tagline:     "Ultra-thin Swiss lace with a hand-tied front hairline.",
		description: "A 0.03mm Swiss lace base with single-knot hand-tied front knots produces a parting indistinguishable from natural scalp. Density grades from 90% at the crown down to 70% at the hairline for a lived-in look.",
		sales:       412, rating: 4.9, reviews: 187,
		features: []string{"100% Hand-Tied", "Natural Hairline", "Breathable Cap", "6-Month Guarantee"},
	},
	{
		sku: "BRIGHT-09", name: "Brighton Mono Top System",
		price: 339, originalPrice: 399, category: "Medium", color: "Medium Brown", length: "8 inch", material: "Mono Top",
		stock: 18, tone: "#2c1f17", accent: "#c89865",
		tagline:     "Reinforced mono-top base built for daily wear.",
		description: "A reinforced fine-mono crown gives Brighton its durability — the kind of system you can wear, swim, and sleep in for six months without thinning.",
		sales:       358, rating: 4.8, reviews: 142,
		features: []string{"Mono Top", "Polyurethane Perimeter", "Tape-Friendly", "180% Density"},
	},
	{
		sku: "HOLLY-22", name: "Hollywood Full Lace",
		price: 549, originalPrice: 649, category: "Long", color: "Natural Black", length: "10 inch", material: "Full Lace",
		stock: 9, tone: "#1a1410", accent: "#d4a574",
		tagline:     "Full lace cap, multi-direction parting, runway-grade.",
		description: "Built for editorial shoots and on-camera work. The full lace cap allows multi-direction parting, the 10-inch indian remy strands handle styling heat without fiber stress.",
		sales:       198, rating: 5.0, reviews: 88,
		features: []string{"Full Lace Cap", "Indian Remy", "Multi-Direction Parting", "Heat Stylable"},
	},
	{
		sku: "HS-04", name: "Heritage Salt & Pepper",
		price: 269, originalPrice: 329, category: "Gray", color: "Salt & Pepper", length: "6 inch", material: "French Lace",
		stock: 31, tone: "#3d3833", accent: "#bfb4a3",
		tagline:     "Distinguished gray blend for the considered gentleman.",
		description: "A 60/40 salt-and-pepper blend hand-mixed at the root. Built for men who want presence without pretense.",
		sales:       287, rating: 4.7, reviews: 116,
		features: []string{"Hand-Blended Color", "French Lace Front", "Skin Perimeter", "Easy Maintenance"},
	},
	{
		sku: "EBP-1404", name: "Cambridge Skin Base",
		price: 219, originalPrice: 269, category: "Short", color: "Dark Brown", length: "4 inch", material: "Skin Base",
		stock: 42, tone: "#2e2018", accent: "#b8895c",
		tagline:     "Ultra-thin skin base — the most discreet system we make.",
		description: "A 0.06mm transparent polyurethane base disappears against the scalp. Engineered for active men who refuse compromise on natural appearance.",
		sales:       521, rating: 4.8, reviews: 234,
		features: []string{"0.06mm Skin", "Invisible Edge", "Sweat Resistant", "Tape Compatible"},
	},
	{
		sku: "BRIGHT-15", name: "Mayfair Lace Front",
		price: 389, originalPrice: 449, category: "Medium", color: "Honey Blonde", length: "8 inch", material: "Swiss Lace",
		stock: 12, tone: "#3d2e20", accent: "#d6b07e",
		tagline:     "Honey-blonde lace front with hand-tied knots throughout.",
		description: "Each knot is single-tied by hand for a parting that holds up under bright light and close inspection. The honey blonde is a custom warm blend developed for Western complexions.",
		sales:       156, rating: 4.9, reviews: 73,
		features: []string{"Single-Knot", "Hand-Tied", "Custom Color", "Light Density"},
	},
	{
		sku: "HS-09", name: "Westminster Curly",
		price: 319, originalPrice: 379, category: "Curly", color: "Natural Black", length: "6 inch", material: "Mono Top",
		stock: 16, tone: "#1f1812", accent: "#a87a4f",
		tagline:     "A natural curl pattern, hand-set at the root.",
		description: "Curl memory is hand-set at the root and locked with a steam treatment. Holds its shape through humidity, sweat, and a full day of meetings.",
		sales:       144, rating: 4.7, reviews: 61,
		features: []string{"Curl Memory", "Hand-Set", "Mono Crown", "Humidity Resistant"},
	},
	{
		sku: "HOLLY-31", name: "Manhattan Toupee",
		price: 459, originalPrice: 529, category: "Toupee", color: "Ash Blonde", length: "6 inch", material: "Swiss Lace",
		stock: 7, tone: "#2a2218", accent: "#c4a57f",
		tagline:     "Ash blonde with a bleached-knot front for invisible parting.",
		description: "Bleached front knots make the parting visually disappear at any angle. The ash-blonde tone is engineered to neither yellow nor brass under fluorescent light.",
		sales:       198, rating: 4.9, reviews: 92,
		features: []string{"Bleached Knots", "Color Stable", "Swiss Lace", "Invisible Parting"},
	},
	{
		sku: "EBP-1801", name: "Oxford Standard",
		price: 189, originalPrice: 229, category: "Short", color: "Medium Brown", length: "4 inch", material: "Mono Top",
		stock: 58, tone: "#332518", accent: "#a87a4f",
		tagline:     "The starter system — entry price, professional finish.",
		description: "Our most accessible system without compromising the hand-tied front. Indian Remy throughout, mono crown, six-month wear life.",
		sales:       642, rating: 4.6, reviews: 298,
		features: []string{"Indian Remy", "Mono Crown", "6-Month Life", "Tape & Bond Compatible"},
	},
	{
		sku: "HS-12", name: "Knightsbridge Silver",
		price: 309, originalPrice: 369, category: "Gray", color: "Silver Gray", length: "6 inch", material: "French Lace",
		stock: 14, tone: "#3a3835", accent: "#c8c2b6",
		tagline:     "Pure silver-gray, hand-blended without dye.",
		description: "A no-dye silver gray achieved through selective sourcing rather than chemical bleaching. Color will not fade or shift to yellow over its wear life.",
		sales:       167, rating: 4.9, reviews: 84,
		features: []string{"No-Dye Color", "French Lace", "Color Permanent", "Hand-Blended"},
	},
	{
		sku: "BRIGHT-22", name: "Chelsea Lace Top",
		price: 369, originalPrice: 429, category: "Medium", color: "Dark Brown", length: "8 inch", material: "Swiss Lace",
		stock: 21, tone: "#241a13", accent: "#b8895c",
		tagline:     "A full lace top, perimeter-reinforced for daily wear.",
		description: "The lace top extends across the entire crown for maximum styling freedom — comb back, side part, or wear it forward without exposing the base.",
		sales:       234, rating: 4.8, reviews: 117,
		features: []string{"Lace Top", "Reinforced Edge", "Style-Free", "180% Density"},
	},
	{
		sku: "HOLLY-44", name: "Park Avenue Long",
		price: 599, originalPrice: 699, category: "Long", color: "Dark Brown", length: "12 inch", material: "Full Lace",
		stock: 5, tone: "#1f1611", accent: "#c89865",
		tagline:     "12-inch full lace, our longest standard system.",
		description: "A full 12 inches of European-textured Indian Remy, hand-tied across a Swiss lace cap. Built for men who want length without the wig look.",
		sales:       89, rating: 5.0, reviews: 41,
		features: []string{"12-inch Length", "Full Lace", "European Texture", "Multi-Style"},
	},
}

var hairProductImages = []string{
	"/hair/hair-01.jpeg",
	"/hair/hair-02.jpeg",
	"/hair/hair-03.jpeg",
	"/hair/hair-04.png",
	"/hair/hair-05.jpeg",
	"/hair/hair-06.jpeg",
	"/hair/hair-07.jpeg",
	"/hair/hair-08.jpeg",
}

var customerSeeds = []customerSeed{
	{name: "David Van Buren", email: "d.vanburen@example.com", phone: "+1 778-228-2828", country: "United States", city: "Griffin, GA"},
	{name: "Marcus Holloway", email: "m.holloway@example.com", phone: "+1 415-552-9001", country: "United States", city: "San Francisco, CA"},
	{name: "James Whitfield", email: "james.w@example.com", phone: "+44 20 7946 0521", country: "United Kingdom", city: "London"},
	{name: "Klaus Brenner", email: "k.brenner@example.de", phone: "+49 30 8765 4321", country: "Germany", city: "Berlin"},
	{name: "Robert McKenzie", email: "r.mckenzie@example.com", phone: "+1 312-808-1144", country: "United States", city: "Chicago, IL"},
	{name: "William Ashford", email: "w.ashford@example.co.uk", phone: "+44 161 882 4421", country: "United Kingdom", city: "Manchester"},
	{name: "Henrik Mueller", email: "h.mueller@example.de", phone: "+49 89 4421 0098", country: "Germany", city: "Munich"},
	{name: "Thomas Reinhardt", email: "t.reinhardt@example.com", phone: "+1 212-554-7799", country: "United States", city: "New York, NY"},
	{name: "Edward Pemberton", email: "e.pem@example.co.uk", phone: "+44 117 909 1212", country: "United Kingdom", city: "Bristol"},
	{name: "Charles Henderson", email: "c.h@example.com", phone: "+1 503-222-9889", country: "United States", city: "Portland, OR"},
	{name: "Sebastian Vogel", email: "s.vogel@example.de", phone: "+49 40 7654 3322", country: "Germany", city: "Hamburg"},
	{name: "Frank Donovan", email: "f.donovan@example.com", phone: "+1 617-441-2287", country: "United States", city: "Boston, MA"},
}

var streetNames = []string{"Country Club", "Park Ave", "Main St", "Oak Lane", "Westminster Rd"}

var orderSeeds = []orderSeed{
	{no: "PO000418277", custID: 0, items: []orderSeedItem{{0, 1}}, sub: 289, ship: 25, status: "complete", date: "2026-04-22"},
	{no: "PO000418421", custID: 2, items: []orderSeedItem{{2, 1}, {5, 1}}, sub: 938, ship: 45, status: "complete", date: "2026-04-21"},
	{no: "PO000418502", custID: 4, items: []orderSeedItem{{8, 2}}, sub: 378, ship: 25, status: "processing", date: "2026-04-25"},
	{no: "PO000418517", custID: 11, items: []orderSeedItem{{11, 1}}, sub: 599, ship: 45, status: "complete", date: "2026-04-26"},
	{no: "PO000418601", custID: 3, items: []orderSeedItem{{3, 1}}, sub: 269, ship: 25, status: "complete", date: "2026-04-15"},
	{no: "PO000418645", custID: 8, items: []orderSeedItem{{6, 1}, {1, 1}}, sub: 658, ship: 25, status: "complete", date: "2026-04-23"},
	{no: "PO000418709", custID: 5, items: []orderSeedItem{{4, 1}}, sub: 219, ship: 25, status: "pending", date: "2026-04-27"},
	{no: "PO000418815", custID: 1, items: []orderSeedItem{{7, 1}}, sub: 459, ship: 45, status: "processing", date: "2026-04-26"},
	{no: "PO000418892", custID: 6, items: []orderSeedItem{{3, 1}}, sub: 269, ship: 25, status: "complete", date: "2026-04-12"},
	{no: "PO000418951", custID: 9, items: []orderSeedItem{{0, 1}, {8, 1}}, sub: 478, ship: 25, status: "complete", date: "2026-04-17"},
	{no: "PO000419023", custID: 7, items: []orderSeedItem{{5, 1}}, sub: 389, ship: 45, status: "complete", date: "2026-04-20"},
	{no: "PO000419088", custID: 10, items: []orderSeedItem{{9, 1}}, sub: 309, ship: 25, status: "cancelled", date: "2026-04-19"},
	{no: "PO000419145", custID: 11, items: []orderSeedItem{{2, 1}, {11, 1}}, sub: 1148, ship: 45, status: "processing", date: "2026-04-27"},
	{no: "PO000419201", custID: 0, items: []orderSeedItem{{10, 1}}, sub: 369, ship: 25, status: "complete", date: "2026-04-25"},
	{no: "PO000419244", custID: 8, items: []orderSeedItem{{1, 1}}, sub: 339, ship: 25, status: "pending", date: "2026-04-28"},
}

func SeedData() {
	var productCount int64
	DB.Model(&models.Product{}).Count(&productCount)
	if productCount > 0 {
		fmt.Println("Seed skipped: products table already has data")
		return
	}

	// Seed products
	products := make([]models.Product, 0, len(productSeeds))
	for i, ps := range productSeeds {
		featJSON, _ := json.Marshal(ps.features)
		p := models.Product{
			SKU:           ps.sku,
			Name:          ps.name,
			Price:         ps.price,
			OriginalPrice: ps.originalPrice,
			Category:      ps.category,
			Color:         ps.color,
			Length:        ps.length,
			Material:      ps.material,
			Stock:         ps.stock,
			Status:        models.ProductStatusPublished,
			Tone:          ps.tone,
			Accent:        ps.accent,
			Tagline:       ps.tagline,
			Description:   ps.description,
			Sales:         ps.sales,
			Rating:        ps.rating,
			Reviews:       ps.reviews,
			Features:      string(featJSON),
		}
		if err := DB.Create(&p).Error; err != nil {
			fmt.Printf("Failed to seed product %s: %v\n", ps.sku, err)
			return
		}
		imageURL := hairProductImages[(i*5+3)%len(hairProductImages)]
		if err := DB.Create(&models.ProductImage{
			ProductID: p.ID,
			URL:       imageURL,
			SortOrder: 0,
		}).Error; err != nil {
			fmt.Printf("Failed to seed image for product %s: %v\n", ps.sku, err)
			return
		}
		products = append(products, p)
	}

	// Seed customers with addresses
	customers := make([]models.Customer, 0, len(customerSeeds))
	for _, cs := range customerSeeds {
		city, state := parseCity(cs.city)
		cust := models.Customer{
			Name:    cs.name,
			Email:   cs.email,
			Phone:   cs.phone,
			Country: cs.country,
		}
		if err := DB.Create(&cust).Error; err != nil {
			fmt.Printf("Failed to seed customer %s: %v\n", cs.name, err)
			return
		}
		addr := models.Address{
			CustomerID:  cust.ID,
			AddressLine: "1 Main Street",
			City:        city,
			State:       state,
			Country:     cs.country,
			IsDefault:   true,
		}
		DB.Create(&addr)
		customers = append(customers, cust)
	}

	// Seed orders
	for i, os := range orderSeeds {
		cust := customers[os.custID]
		custSeed := customerSeeds[os.custID]
		city, _ := parseCity(custSeed.city)

		purchasedAt, _ := time.Parse("2006-01-02", os.date)
		purchasedAtUTC := time.Date(purchasedAt.Year(), purchasedAt.Month(), purchasedAt.Day(), 0, 0, 0, 0, time.UTC)

		shippingMethod := "Standard Shipping"
		if os.ship == 45 {
			shippingMethod = "Express Shipping"
		}

		streetNum := i*137 + 100
		streetName := streetNames[i%len(streetNames)]
		shipAddr := fmt.Sprintf("%d %s, %s", streetNum, streetName, custSeed.city)

		custID := cust.ID
		order := models.Order{
			OrderNo:        os.no,
			CustomerID:     &custID,
			Status:         os.status,
			Subtotal:       os.sub,
			ShippingAmount: os.ship,
			Discount:       0,
			GrandTotal:     os.sub + os.ship,
			ShippingMethod: shippingMethod,
			ShipName:       cust.Name,
			ShipPhone:      cust.Phone,
			ShipAddress:    shipAddr,
			ShipCity:       city,
			ShipCountry:    custSeed.country,
			PurchasedAt:    &purchasedAtUTC,
		}
		if err := DB.Create(&order).Error; err != nil {
			fmt.Printf("Failed to seed order %s: %v\n", os.no, err)
			return
		}

		for _, item := range os.items {
			prod := products[item.productIdx]
			prodID := prod.ID
			oi := models.OrderItem{
				OrderID:     order.ID,
				ProductID:   &prodID,
				SKU:         prod.SKU,
				ProductName: prod.Name,
				Price:       prod.Price,
				Quantity:    item.qty,
				Subtotal:    prod.Price * float64(item.qty),
			}
			DB.Create(&oi)
		}
	}

	fmt.Printf("Seeded %d products, %d customers, %d orders\n",
		len(products), len(customers), len(orderSeeds))
}

// parseCity splits "City, State" into (city, state), or returns (city, "") if no comma.
func parseCity(cityStr string) (string, string) {
	parts := strings.SplitN(cityStr, ", ", 2)
	if len(parts) == 2 {
		return parts[0], parts[1]
	}
	return cityStr, ""
}
