package services

import (
	"fmt"
	"log"

	"github.com/resend/resend-go/v2"
)

type EmailService struct {
	client *resend.Client
}

func NewEmailService(apiKey string) *EmailService {
	client := resend.NewClient(apiKey)
	return &EmailService{client: client}
}

func (s *EmailService) SendOTP(email string, otp string) {
	// Run in goroutine for non-blocking execution
	go func() {
		params := &resend.SendEmailRequest{
			From:    "onboarding@resend.dev", // Note: This should be configured or verified domain in production
			To:      []string{email},
			Subject: "Your Login OTP",
			Html:    fmt.Sprintf("<p>Your OTP code is: <strong>%s</strong></p><p>It expires in 5 minutes.</p>", otp),
		}

		_, err := s.client.Emails.Send(params)
		if err != nil {
			log.Printf("Failed to send OTP to %s: %v", email, err)
		} else {
			log.Printf("OTP sent to %s successfully", email)
		}
	}()
}
