package models

import (
	"testing"
)

func TestResume_GenerateShareToken(t *testing.T) {
	resume := &Resume{ID: 1, Title: "Test Resume"}

	err := resume.GenerateShareToken()
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	if resume.ShareToken == nil {
		t.Error("share token should not be nil")
	}

	if *resume.ShareToken == "" {
		t.Error("share token should not be empty")
	}

	// 32 bytes = 64 hex chars
	if len(*resume.ShareToken) != 64 {
		t.Errorf("expected token length 64, got %d", len(*resume.ShareToken))
	}
}

func TestResume_EnableShare(t *testing.T) {
	resume := &Resume{ID: 1, Title: "Test Resume"}

	// Enable share should generate a token if none exists
	err := resume.EnableShare()
	if err != nil {
		t.Fatalf("failed to enable share: %v", err)
	}

	if resume.ShareToken == nil || *resume.ShareToken == "" {
		t.Error("share token should be generated")
	}

	// Calling again should not regenerate
	firstToken := *resume.ShareToken
	err = resume.EnableShare()
	if err != nil {
		t.Fatalf("failed to enable share again: %v", err)
	}

	if *resume.ShareToken != firstToken {
		t.Error("token should not change on second call")
	}
}

func TestResume_DisableShare(t *testing.T) {
	resume := &Resume{ID: 1, Title: "Test Resume"}

	// First enable share
	err := resume.EnableShare()
	if err != nil {
		t.Fatalf("failed to enable share: %v", err)
	}

	// Then disable
	err = resume.DisableShare()
	if err != nil {
		t.Fatalf("failed to disable share: %v", err)
	}

	if resume.ShareToken != nil {
		t.Error("share token should be nil after disable")
	}
}