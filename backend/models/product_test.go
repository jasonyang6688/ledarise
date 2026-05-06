package models

import (
	"reflect"
	"strings"
	"testing"
)

func TestProductPriceFieldsUseDecimalTenTwo(t *testing.T) {
	productType := reflect.TypeOf(Product{})

	for _, fieldName := range []string{"Price", "OriginalPrice"} {
		field, ok := productType.FieldByName(fieldName)
		if !ok {
			t.Fatalf("Product.%s field is missing", fieldName)
		}

		gormTag := field.Tag.Get("gorm")
		if !strings.Contains(gormTag, "type:decimal(10,2)") {
			t.Fatalf("Product.%s gorm tag = %q, want decimal(10,2)", fieldName, gormTag)
		}
	}
}
