package repository

import (
	"auth-service/internal/models"
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserRepository struct {
	collection *mongo.Collection
}

func NewUserRepository(db *mongo.Database) *UserRepository {
	return &UserRepository{
		collection: db.Collection("users"),
	}
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) CreateUser(ctx context.Context, email string) (*models.User, error) {
	user := &models.User{
		Email:     email,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	
	res, err := r.collection.InsertOne(ctx, user)
	if err != nil {
		return nil, err
	}
	
	user.ID = res.InsertedID.(primitive.ObjectID)
	return user, nil
}
