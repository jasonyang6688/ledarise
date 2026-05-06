package handlers

import "testing"

func TestProductKeywordLikeTrimsWhitespace(t *testing.T) {
	like, ok := productKeywordLike("  EBP-1208  ")
	if !ok {
		t.Fatal("productKeywordLike() ok = false, want true")
	}
	if like != "%EBP-1208%" {
		t.Fatalf("productKeywordLike() like = %q, want %%EBP-1208%%", like)
	}
}

func TestProductKeywordLikeRejectsBlankKeyword(t *testing.T) {
	like, ok := productKeywordLike("   ")
	if ok {
		t.Fatal("productKeywordLike() ok = true, want false")
	}
	if like != "" {
		t.Fatalf("productKeywordLike() like = %q, want empty string", like)
	}
}
