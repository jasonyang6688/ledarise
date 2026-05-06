package services

import "testing"

func TestLookupImportCachePrefersBatchCache(t *testing.T) {
	global := map[string]uint{"customer": 10}
	batch := map[string]uint{"customer": 20}

	got, ok := lookupImportCache(global, batch, "customer")
	if !ok {
		t.Fatal("expected cache hit")
	}
	if got != 20 {
		t.Fatalf("expected batch cache ID 20, got %d", got)
	}
}

func TestCommitImportCacheMergesOnlyAfterExplicitCommit(t *testing.T) {
	global := map[string]uint{"existing": 1}
	batch := map[string]uint{"created-in-transaction": 2}

	if _, ok := global["created-in-transaction"]; ok {
		t.Fatal("transaction-local ID leaked before commit")
	}

	commitImportCache(global, batch)

	if got := global["created-in-transaction"]; got != 2 {
		t.Fatalf("expected committed ID 2, got %d", got)
	}
}

func TestLimitStringPreservesShortValue(t *testing.T) {
	got := limitString("M5V 3A9", 20)
	if got != "M5V 3A9" {
		t.Fatalf("expected short value to be unchanged, got %q", got)
	}
}

func TestLimitStringTruncatesLongValueByRunes(t *testing.T) {
	got := limitString("Île-de-France postal routing overflow", 12)
	if got != "Île-de-Franc" {
		t.Fatalf("expected rune-safe truncation, got %q", got)
	}
}

func TestImportProductPriceIsRoundedToTwoDecimals(t *testing.T) {
	price := importProductPrice(10.005, 0.001)

	if price != 10.00 {
		t.Fatalf("importProductPrice() = %.12f, want 10.00", price)
	}
}

func TestImportProductPriceDoesNotGoNegative(t *testing.T) {
	price := importProductPrice(5.00, 9.99)

	if price != 0 {
		t.Fatalf("importProductPrice() = %.12f, want 0", price)
	}
}
