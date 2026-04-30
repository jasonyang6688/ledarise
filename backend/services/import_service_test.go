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
