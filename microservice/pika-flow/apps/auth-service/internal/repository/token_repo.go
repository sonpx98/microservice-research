package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type TokenRepository struct {
	client *redis.Client
}

func NewTokenRepository(client *redis.Client) *TokenRepository {
	return &TokenRepository{client: client}
}

// SaveRefreshToken stores a refresh token for a user
func (r *TokenRepository) SaveRefreshToken(ctx context.Context, userID string, token string, duration time.Duration) error {
	key := fmt.Sprintf("refresh:%s", userID)
	return r.client.Set(ctx, key, token, duration).Err()
}

// GetRefreshToken retrieves the stored refresh token for a user
func (r *TokenRepository) GetRefreshToken(ctx context.Context, userID string) (string, error) {
	key := fmt.Sprintf("refresh:%s", userID)
	val, err := r.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", nil // Token not found
	}
	return val, err
}

// DeleteRefreshToken removes the refresh token (used for logout)
func (r *TokenRepository) DeleteRefreshToken(ctx context.Context, userID string) error {
	key := fmt.Sprintf("refresh:%s", userID)
	return r.client.Del(ctx, key).Err()
}

// BlacklistToken adds a token to the blacklist
func (r *TokenRepository) BlacklistToken(ctx context.Context, token string, duration time.Duration) error {
	key := fmt.Sprintf("blacklist:%s", token)
	return r.client.Set(ctx, key, "1", duration).Err()
}

// IsBlacklisted checks if a token is in the blacklist
func (r *TokenRepository) IsBlacklisted(ctx context.Context, token string) (bool, error) {
	key := fmt.Sprintf("blacklist:%s", token)
	_, err := r.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return false, nil // Not blacklisted
	}
	if err != nil {
		return false, err
	}
	return true, nil
}
