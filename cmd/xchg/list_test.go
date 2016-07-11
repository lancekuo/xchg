package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"testing"

	"github.com/Patrolavia/jsonapi"
)

func TestList(t *testing.T) {
	h := &list{mgr}

	resp, err := jsonapi.HandlerTest(h.Handle).Post("/api/list", "", `{"code":"USD"}`)

	if err != nil {
		t.Fatalf("unexpected error occured when testing list: %s", err)
	}

	if resp.Code != http.StatusOK {
		t.Fatalf("unexpected error occured when testing list with status code %d: %s", resp.Code, resp.Body.String())
	}

	var orders []Order
	if resp.Body == nil {
		t.Fatal(resp)
	}
	if err := json.Unmarshal(resp.Body.Bytes(), &orders); err != nil {
		t.Fatalf("cannot encode returned data from list: %s", err)
	}

	msgs := validateOrders(presetUSD, orders)
	for _, msg := range msgs {
		t.Errorf("list: %s", msg)
	}
}

func TestListEmpty(t *testing.T) {
	h := &list{mgr}

	resp, err := jsonapi.HandlerTest(h.Handle).Post("/api/list", "", `{"code":"NTD"}`)

	if err != nil {
		t.Fatalf("unexpected error occured when testing list: %s", err)
	}

	if resp.Code != http.StatusOK {
		t.Fatalf("unexpected error occured when testing list with status code %d: %s", resp.Code, resp.Body.String())
	}

	if resp.Body == nil {
		t.Fatal(resp)
	}
	if str := strings.TrimSpace(resp.Body.String()); str != "[]" {
		t.Errorf("list: not returning empty array: '%s'", str)
	}
}
