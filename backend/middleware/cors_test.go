package middleware

import (
	"reflect"
	"testing"
)

func TestAllowedOriginsTrimsAndSkipsBlankEntries(t *testing.T) {
	got := allowedOrigins(" http://localhost:3000, http://localhost:3001,,http://127.0.0.1:3001 ")
	want := []string{
		"http://localhost:3000",
		"http://localhost:3001",
		"http://127.0.0.1:3001",
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("allowedOrigins() = %#v, want %#v", got, want)
	}
}
