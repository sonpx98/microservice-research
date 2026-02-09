package services

import (
	"auth-service/internal/repository"
	"auth-service/internal/utils"
	"context"
	"crypto/rand"
	"fmt"
	"log"
	"math/big"
	"time"
)

type AuthService struct {
	userRepo     *repository.UserRepository
	otpRepo      *repository.OTPRepository
	tokenRepo    *repository.TokenRepository
	emailService *EmailService
	jwtSecret    string
}

func NewAuthService(
	userRepo *repository.UserRepository,
	otpRepo *repository.OTPRepository,
	tokenRepo *repository.TokenRepository,
	emailService *EmailService,
	jwtSecret string,
) *AuthService {
	return &AuthService{
		userRepo:     userRepo,
		otpRepo:      otpRepo,
		tokenRepo:    tokenRepo,
		emailService: emailService,
		jwtSecret:    jwtSecret,
	}
}

func (s *AuthService) RequestOTP(ctx context.Context, email string) error {
	otp, err := generateOTP()
	if err != nil {
		return err
	}

	// Store OTP in Redis with 5 minutes expiration
	err = s.otpRepo.SaveOTP(ctx, email, otp, 5*time.Minute)
	if err != nil {
		return fmt.Errorf("failed to save OTP: %v", err)
	}

	// Send OTP via Email
	s.emailService.SendOTP(email, otp)

	return nil
}

func (s *AuthService) VerifyOTP(ctx context.Context, email string, otp string) (*utils.TokenPair, error) {
	valid, err := s.otpRepo.VerifyOTP(ctx, email, otp)
	if err != nil {
		return nil, fmt.Errorf("failed to verify OTP: %v", err)
	}
	if !valid {
		return nil, fmt.Errorf("invalid or expired OTP")
	}

	// Check if user exists, if not create
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("database error: %v", err)
	}

	if user == nil {
		user, err = s.userRepo.CreateUser(ctx, email)
		if err != nil {
			return nil, fmt.Errorf("failed to create user: %v", err)
		}
		log.Printf("New user created: %s", email)
	}

	// Generate Token Pair (Access + Refresh)
	tokenPair, err := utils.GenerateTokenPair(user.ID.Hex(), user.Email, s.jwtSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %v", err)
	}

	// Store refresh token in Redis
	err = s.tokenRepo.SaveRefreshToken(ctx, user.ID.Hex(), tokenPair.RefreshToken, utils.RefreshTokenTTL)
	if err != nil {
		return nil, fmt.Errorf("failed to save refresh token: %v", err)
	}

	return tokenPair, nil
}

// RefreshTokens generates new token pair using a valid refresh token
func (s *AuthService) RefreshTokens(ctx context.Context, refreshToken string) (*utils.TokenPair, error) {
	// 1. Parse and validate refresh token
	claims, err := utils.ValidateRefreshToken(refreshToken, s.jwtSecret)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token: %v", err)
	}

	// 2. Check if token is blacklisted
	blacklisted, err := s.tokenRepo.IsBlacklisted(ctx, refreshToken)
	if err != nil {
		return nil, fmt.Errorf("failed to check blacklist: %v", err)
	}
	if blacklisted {
		return nil, fmt.Errorf("token has been revoked")
	}

	// 3. Verify token exists in Redis (matches stored token)
	storedToken, err := s.tokenRepo.GetRefreshToken(ctx, claims.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get stored token: %v", err)
	}
	if storedToken == "" || storedToken != refreshToken {
		return nil, fmt.Errorf("refresh token not found or invalid")
	}

	// 4. Generate new token pair
	tokenPair, err := utils.GenerateTokenPair(claims.UserID, claims.Email, s.jwtSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %v", err)
	}

	// 5. Update refresh token in Redis
	err = s.tokenRepo.SaveRefreshToken(ctx, claims.UserID, tokenPair.RefreshToken, utils.RefreshTokenTTL)
	if err != nil {
		return nil, fmt.Errorf("failed to save new refresh token: %v", err)
	}

	// 6. Blacklist old refresh token (optional extra security)
	_ = s.tokenRepo.BlacklistToken(ctx, refreshToken, utils.RefreshTokenTTL)

	return tokenPair, nil
}

// Logout invalidates the refresh token
func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
	// 1. Parse token to get userID
	claims, err := utils.ValidateRefreshToken(refreshToken, s.jwtSecret)
	if err != nil {
		return fmt.Errorf("invalid refresh token: %v", err)
	}

	// 2. Delete refresh token from Redis
	err = s.tokenRepo.DeleteRefreshToken(ctx, claims.UserID)
	if err != nil {
		return fmt.Errorf("failed to delete refresh token: %v", err)
	}

	// 3. Blacklist the token
	err = s.tokenRepo.BlacklistToken(ctx, refreshToken, utils.RefreshTokenTTL)
	if err != nil {
		return fmt.Errorf("failed to blacklist token: %v", err)
	}

	return nil
}

func generateOTP() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n), nil
}
