package handlers

import (
	"net/http"
	"strings"
	"time"

	"resume-ai-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var JWTSecret = []byte("resume-ai-secret-key-change-in-production")

type AuthHandler struct{}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6,max=20"`
	Nickname string `json:"nickname"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UpdateProfileRequest struct {
	Nickname string `json:"nickname"`
	Avatar   string `json:"avatar"`
	Phone    string `json:"phone"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6,max=20"`
}

type TokenClaims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func GenerateToken(userID uint, username string) (string, error) {
	claims := TokenClaims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * 7 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JWTSecret)
}

func ParseToken(tokenString string) (*TokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &TokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		return JWTSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*TokenClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrSignatureInvalid
}

func GetCurrentUserID(c *gin.Context) (uint, bool) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return 0, false
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || parts[0] != "Bearer" {
		return 0, false
	}

	claims, err := ParseToken(parts[1])
	if err != nil {
		return 0, false
	}

	return claims.UserID, true
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 1, "message": "参数错误: " + err.Error()})
		return
	}

	existingUser, _ := models.GetUserByUsername(req.Username)
	if existingUser != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 1, "message": "用户名已存在"})
		return
	}

	if req.Email != "" {
		existingUser, _ = models.GetUserByEmail(req.Email)
		if existingUser != nil {
			c.JSON(http.StatusBadRequest, gin.H{"code": 1, "message": "邮箱已被注册"})
			return
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 1, "message": "密码加密失败"})
		return
	}

	user := &models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: string(hashedPassword),
		Nickname: req.Nickname,
		Status:   "active",
	}

	if err := models.CreateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 1, "message": "创建用户失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"message": "注册成功",
		"data": gin.H{
			"id":         user.ID,
			"username":   user.Username,
			"email":      user.Email,
			"nickname":   user.Nickname,
			"created_at": user.CreatedAt,
		},
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 1, "message": "参数错误: " + err.Error()})
		return
	}

	var user *models.User
	var err error

	if strings.Contains(req.Username, "@") {
		user, err = models.GetUserByEmail(req.Username)
	} else {
		user, err = models.GetUserByUsername(req.Username)
	}

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 1, "message": "用户名或密码错误"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 1, "message": "用户名或密码错误"})
		return
	}

	token, err := GenerateToken(user.ID, user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 1, "message": "生成token失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"message": "登录成功",
		"data": gin.H{
			"token": token,
			"user": gin.H{
				"id":       user.ID,
				"username": user.Username,
				"email":    user.Email,
				"nickname": user.Nickname,
				"avatar":   user.Avatar,
			},
		},
	})
}

// GuestLogin 游客登录 - 使用公共账号登录
func (h *AuthHandler) GuestLogin(c *gin.Context) {
	// 查找游客账号，如果不存在则创建
	username := "guest"
	password := "guest123"

	user, err := models.GetUserByUsername(username)
	if err != nil {
		// 游客账号不存在，创建它
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		user = &models.User{
			Username: username,
			Email:    "guest@poker.app",
			Password: string(hashedPassword),
			Nickname: "游客",
			Status:   "active",
		}
		if err := models.CreateUser(user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 1, "message": "游客登录失败"})
			return
		}
	}

	token, err := GenerateToken(user.ID, user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 1, "message": "生成token失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "游客登录成功",
		"data": gin.H{
			"token": token,
			"user": gin.H{
				"id":       user.ID,
				"username": user.Username,
				"email":    user.Email,
				"nickname": user.Nickname,
				"avatar":   user.Avatar,
			},
			"is_guest": true,
		},
	})
}

func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	userID, ok := GetCurrentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 1, "message": "未授权"})
		return
	}

	user, err := models.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 1, "message": "用户不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": gin.H{
			"id":         user.ID,
			"username":   user.Username,
			"email":      user.Email,
			"nickname":   user.Nickname,
			"avatar":     user.Avatar,
			"phone":      user.Phone,
			"status":     user.Status,
			"created_at": user.CreatedAt,
		},
	})
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID, ok := GetCurrentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 1, "message": "未授权"})
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 1, "message": "参数错误"})
		return
	}

	user, err := models.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 1, "message": "用户不存在"})
		return
	}

	if req.Nickname != "" {
		user.Nickname = req.Nickname
	}
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}

	if err := models.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 1, "message": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"message": "更新成功",
		"data": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"nickname": user.Nickname,
			"avatar":   user.Avatar,
			"phone":    user.Phone,
		},
	})
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, ok := GetCurrentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 1, "message": "未授权"})
		return
	}

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 1, "message": "参数错误"})
		return
	}

	user, err := models.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 1, "message": "用户不存在"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 1, "message": "旧密码错误"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 1, "message": "密码加密失败"})
		return
	}

	user.Password = string(hashedPassword)
	if err := models.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 1, "message": "修改密码失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "密码修改成功",
	})
}
