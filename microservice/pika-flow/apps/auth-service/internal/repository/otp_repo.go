package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type OTPRepository struct {
	client *redis.Client
}

func NewOTPRepository(client *redis.Client) *OTPRepository {
	return &OTPRepository{client: client}
}

func (r *OTPRepository) SaveOTP(ctx context.Context, email string, otp string, duration time.Duration) error {
	key := fmt.Sprintf("otp:%s", email)
	return r.client.Set(ctx, key, otp, duration).Err()
}

func (r *OTPRepository) VerifyOTP(ctx context.Context, email string, otp string) (bool, error) {
	key := fmt.Sprintf("otp:%s", email)
	val, err := r.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return false, nil // Key does not exist
	}
	if err != nil {
		return false, err
	}
	
	if val == otp {
		// OTP matches, delete it to prevent reuse
		r.client.Del(ctx, key)
		return true, nil
	}
	
	return false, nil
}
