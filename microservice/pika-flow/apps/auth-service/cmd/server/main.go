package main

import (
	"auth-service/internal/config"
	"auth-service/internal/controllers"
	"auth-service/internal/repository"
	"auth-service/internal/services"
	"context"
	"crypto/tls"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// 1. Load Configuration
	cfg := config.LoadConfig()

	// 2. Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer func() {
		if err := mongoClient.Disconnect(context.Background()); err != nil {
			log.Printf("Error disconnecting MongoDB: %v", err)
		}
	}()
	
	// Create database instance (assuming db name 'pika_auth' or similar, could be in config)
	db := mongoClient.Database("pika_auth")

	// 3. Connect to Redis
	redisOpts := &redis.Options{
		Addr:     cfg.RedisHost + ":" + cfg.RedisPort,
		Password: cfg.RedisPassword,
		DB:       0, // use default DB
	}

	if cfg.RedisTLS {
		redisOpts.TLSConfig = &tls.Config{
			MinVersion: tls.VersionTLS12,
			// ServerName: cfg.RedisHost, // Often needed for cloud providers, uncomment if necessary
		}
	}

	redisClient := redis.NewClient(redisOpts)
	
	// Redis connection check
	if _, err := redisClient.Ping(context.Background()).Result(); err != nil {
		log.Printf("Warning: Failed to connect to Redis at %s:%s: %v", cfg.RedisHost, cfg.RedisPort, err)
	}

	// 4. Initialize Components
	userRepo := repository.NewUserRepository(db)
	otpRepo := repository.NewOTPRepository(redisClient)
	tokenRepo := repository.NewTokenRepository(redisClient)
	emailService := services.NewEmailService(cfg.ResendAPIKey)
	authService := services.NewAuthService(userRepo, otpRepo, tokenRepo, emailService, cfg.JWTSecret)
	authController := controllers.NewAuthController(authService)

	// 5. Setup Router
	r := gin.Default()
	
	authRoutes := r.Group("/auth")
	{
		authRoutes.POST("/otp", authController.RequestOTP)
		authRoutes.POST("/verify", authController.VerifyOTP)
		authRoutes.POST("/refresh", authController.RefreshToken)
		authRoutes.POST("/logout", authController.Logout)
	}

	// 6. Run Server with Graceful Shutdown
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	go func() {
		log.Printf("Server starting on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server with
	// a timeout of 5 seconds.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel = context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalln("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}
