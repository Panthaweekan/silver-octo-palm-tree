# 🔌 FitJourney - API Design Documentation

## API Overview

**Base URL**: `https://api.fitjourney.app`  
**API Version**: v1  
**Protocol**: REST + WebSocket  
**Authentication**: JWT Bearer Token  
**Rate Limiting**: 100 requests/minute per user

---

## 1. Authentication Endpoints

### 1.1 Register New User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "fituser",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "fituser",
      "first_name": "John",
      "last_name": "Doe"
    },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 900
  }
}
```

### 1.2 Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 900,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "fituser"
    }
  }
}
```

### 1.3 Refresh Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}
```

### 1.4 OAuth Login

```http
POST /api/v1/auth/oauth/{provider}
Content-Type: application/json

{
  "access_token": "provider_access_token",
  "provider": "google" // or "apple", "facebook"
}
```

### 1.5 Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer {access_token}
```

---

## 2. User Profile Endpoints

### 2.1 Get Current User Profile

```http
GET /api/v1/users/me
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "fituser",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1990-05-15",
    "gender": "male",
    "height_cm": 175.5,
    "current_weight_kg": 75.0,
    "target_weight_kg": 70.0,
    "daily_calorie_goal": 2000,
    "daily_protein_goal": 150,
    "avatar_url": "https://...",
    "is_premium": false,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### 2.2 Update User Profile

```http
PATCH /api/v1/users/me
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "first_name": "John",
  "height_cm": 175.5,
  "target_weight_kg": 70.0,
  "daily_calorie_goal": 2000
}
```

### 2.3 Upload Avatar

```http
POST /api/v1/users/me/avatar
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: [binary image data]
```

---

## 3. Workout Endpoints

### 3.1 List Workouts

```http
GET /api/v1/workouts?from_date=2025-01-01&to_date=2025-01-31&limit=20&offset=0
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "workouts": [
      {
        "id": "uuid",
        "title": "Morning Run",
        "workout_date": "2025-01-15",
        "start_time": "2025-01-15T06:00:00Z",
        "end_time": "2025-01-15T06:45:00Z",
        "duration_minutes": 45,
        "total_calories_burned": 450,
        "mood": "excellent",
        "exercises": [
          {
            "id": "uuid",
            "exercise_name": "Running",
            "category": "cardio",
            "duration_minutes": 45,
            "distance_km": 7.5,
            "calories_burned": 450
          }
        ]
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  }
}
```

### 3.2 Create Workout

```http
POST /api/v1/workouts
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Morning Run",
  "workout_date": "2025-01-15",
  "start_time": "2025-01-15T06:00:00Z",
  "end_time": "2025-01-15T06:45:00Z",
  "mood": "excellent",
  "notes": "Felt great today!",
  "exercises": [
    {
      "exercise_type_id": "uuid",
      "duration_minutes": 45,
      "distance_km": 7.5,
      "exercise_order": 1
    }
  ]
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Morning Run",
    "total_calories_burned": 450,
    "ai_insights": {
      "performance": "above_average",
      "recommendation": "Great pace! Try adding 5 minutes next time."
    }
  }
}
```

### 3.3 Get Workout Details

```http
GET /api/v1/workouts/{workout_id}
Authorization: Bearer {access_token}
```

### 3.4 Update Workout

```http
PATCH /api/v1/workouts/{workout_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Updated Morning Run",
  "notes": "Added extra 2km"
}
```

### 3.5 Delete Workout

```http
DELETE /api/v1/workouts/{workout_id}
Authorization: Bearer {access_token}
```

### 3.6 List Exercise Types

```http
GET /api/v1/exercises/types?category=cardio
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Running",
      "category": "cardio",
      "met_value": 8.0,
      "tracks_distance": true,
      "tracks_duration": true
    }
  ]
}
```

---

## 4. Nutrition Endpoints

### 4.1 List Meals

```http
GET /api/v1/meals?date=2025-01-15
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "meals": [
      {
        "id": "uuid",
        "meal_type": "breakfast",
        "meal_time": "2025-01-15T08:00:00Z",
        "meal_name": "Oatmeal & Banana",
        "total_calories": 350,
        "total_protein_g": 12,
        "total_carbs_g": 65,
        "total_fat_g": 8,
        "food_items": [
          {
            "food_name": "Oatmeal",
            "quantity": 50,
            "unit": "g",
            "calories": 190
          },
          {
            "food_name": "Banana",
            "quantity": 1,
            "unit": "piece",
            "calories": 105
          }
        ]
      }
    ],
    "daily_totals": {
      "calories": 1850,
      "protein_g": 120,
      "carbs_g": 210,
      "fat_g": 55,
      "goal_calories": 2000,
      "remaining_calories": 150
    }
  }
}
```

### 4.2 Create Meal

```http
POST /api/v1/meals
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "meal_date": "2025-01-15",
  "meal_type": "breakfast",
  "meal_time": "2025-01-15T08:00:00Z",
  "meal_name": "Oatmeal & Banana",
  "food_items": [
    {
      "food_item_id": "uuid",
      "quantity": 50,
      "serving_unit": "g"
    },
    {
      "food_item_id": "uuid",
      "quantity": 1,
      "serving_unit": "piece"
    }
  ]
}
```

### 4.3 Search Food Database

```http
GET /api/v1/foods/search?q=chicken&limit=10
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Chicken Breast (Grilled)",
      "brand": null,
      "serving_size": 100,
      "serving_unit": "g",
      "calories": 165,
      "protein_g": 31,
      "carbs_g": 0,
      "fat_g": 3.6,
      "category": "protein"
    }
  ]
}
```

### 4.4 Scan Food Image (AI)

```http
POST /api/v1/meals/scan
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: [binary image data]
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "image_url": "https://...",
    "detected_foods": [
      {
        "name": "Rice",
        "confidence": 0.92,
        "estimated_calories": 200,
        "estimated_protein_g": 4,
        "estimated_carbs_g": 45,
        "estimated_fat_g": 0.5
      },
      {
        "name": "Grilled Chicken",
        "confidence": 0.88,
        "estimated_calories": 165,
        "estimated_protein_g": 31,
        "estimated_carbs_g": 0,
        "estimated_fat_g": 3.6
      }
    ],
    "total_estimated_calories": 365
  }
}
```

### 4.5 Create Custom Food

```http
POST /api/v1/foods
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "My Protein Shake",
  "serving_size": 300,
  "serving_unit": "ml",
  "calories": 250,
  "protein_g": 30,
  "carbs_g": 15,
  "fat_g": 5
}
```

---

## 5. Body Metrics Endpoints

### 5.1 Log Weight

```http
POST /api/v1/weight
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "log_date": "2025-01-15",
  "weight_kg": 74.5,
  "body_fat_percentage": 18.5,
  "notes": "Morning weight after workout"
}
```

### 5.2 Get Weight History

```http
GET /api/v1/weight?from_date=2025-01-01&to_date=2025-01-31
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "weight_logs": [
      {
        "log_date": "2025-01-15",
        "weight_kg": 74.5,
        "body_fat_percentage": 18.5
      }
    ],
    "statistics": {
      "start_weight": 76.0,
      "current_weight": 74.5,
      "change_kg": -1.5,
      "change_percentage": -1.97,
      "average_weekly_change": -0.38
    }
  }
}
```

### 5.3 Log Body Measurements

```http
POST /api/v1/measurements
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "measurement_date": "2025-01-15",
  "waist_cm": 85.0,
  "chest_cm": 100.0,
  "hips_cm": 95.0
}
```

### 5.4 Get Measurement History

```http
GET /api/v1/measurements?from_date=2025-01-01&to_date=2025-01-31
Authorization: Bearer {access_token}
```

---

## 6. Habit Tracking Endpoints

### 6.1 List User Habits

```http
GET /api/v1/habits?active_only=true
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Drink Water",
      "category": "hydration",
      "tracking_type": "numeric",
      "unit": "glasses",
      "target_value": 8,
      "is_active": true,
      "current_streak": 12,
      "best_streak": 30
    }
  ]
}
```

### 6.2 Create Habit

```http
POST /api/v1/habits
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "habit_template_id": "uuid", // optional
  "name": "Drink Water",
  "category": "hydration",
  "tracking_type": "numeric",
  "unit": "glasses",
  "target_value": 8,
  "reminder_time": "08:00:00"
}
```

### 6.3 Log Habit

```http
POST /api/v1/habits/{habit_id}/logs
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "log_date": "2025-01-15",
  "completed": true,
  "value": 8
}
```

### 6.4 Get Habit Stats

```http
GET /api/v1/habits/{habit_id}/stats?period=30days
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "habit_id": "uuid",
    "period": "30days",
    "completion_rate": 83.3,
    "current_streak": 12,
    "best_streak": 20,
    "total_completions": 25,
    "chart_data": [
      { "date": "2025-01-01", "completed": true, "value": 8 },
      { "date": "2025-01-02", "completed": true, "value": 7 }
    ]
  }
}
```

---

## 7. Journal Endpoints

### 7.1 Create Journal Entry

```http
POST /api/v1/journal
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "entry_date": "2025-01-15",
  "title": "Great Day!",
  "content": "Had an amazing workout and stayed on track with meals...",
  "mood": "excellent",
  "energy_level": 8,
  "stress_level": 3,
  "tags": ["productive", "energized"]
}
```

### 7.2 Get Journal Entry

```http
GET /api/v1/journal/{date}
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "entry_date": "2025-01-15",
    "title": "Great Day!",
    "content": "Had an amazing workout...",
    "mood": "excellent",
    "energy_level": 8,
    "stress_level": 3,
    "ai_summary": "You had a highly productive day with excellent workout performance...",
    "ai_recommendations": [
      "Continue your current momentum",
      "Consider adding more protein to support recovery"
    ]
  }
}
```

### 7.3 List Journal Entries

```http
GET /api/v1/journal?from_date=2025-01-01&to_date=2025-01-31
Authorization: Bearer {access_token}
```

---

## 8. Analytics & Dashboard Endpoints

### 8.1 Get Daily Summary

```http
GET /api/v1/analytics/daily?date=2025-01-15
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "date": "2025-01-15",
    "workouts": {
      "total": 2,
      "duration_minutes": 90,
      "calories_burned": 650
    },
    "nutrition": {
      "calories_consumed": 1850,
      "calories_goal": 2000,
      "protein_g": 120,
      "carbs_g": 210,
      "fat_g": 55
    },
    "net_calories": 1200,
    "weight_kg": 74.5,
    "habits": {
      "completed": 7,
      "total": 8,
      "completion_rate": 87.5
    },
    "mood": "excellent"
  }
}
```

### 8.2 Get Weekly Summary

```http
GET /api/v1/analytics/weekly?week_start=2025-01-08
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "week_start": "2025-01-08",
    "week_end": "2025-01-14",
    "workouts": {
      "total": 5,
      "workout_days": 5,
      "total_minutes": 225,
      "total_calories": 1500,
      "best_day": "2025-01-10"
    },
    "nutrition": {
      "avg_calories": 1950,
      "calorie_deficit": 350
    },
    "weight": {
      "start": 76.0,
      "end": 75.0,
      "change": -1.0,
      "change_percentage": -1.32
    },
    "habits": {
      "completion_rate": 82.5
    },
    "ai_summary": "Great week! You've been consistent with workouts and maintained a healthy calorie deficit..."
  }
}
```

### 8.3 Get Progress Trends

```http
GET /api/v1/analytics/trends?metric=weight&period=3months
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "metric": "weight",
    "period": "3months",
    "data_points": [
      { "date": "2024-10-15", "value": 78.0 },
      { "date": "2024-11-15", "value": 76.5 },
      { "date": "2025-01-15", "value": 74.5 }
    ],
    "trend": "decreasing",
    "change": -3.5,
    "change_percentage": -4.49,
    "prediction": {
      "next_month_estimate": 73.0,
      "confidence": 0.75
    }
  }
}
```

### 8.4 Get Dashboard Overview

```http
GET /api/v1/analytics/dashboard
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "today": {
      "workouts": 1,
      "calories_burned": 450,
      "calories_consumed": 1200,
      "habits_completed": 5
    },
    "this_week": {
      "workout_days": 4,
      "total_workouts": 5,
      "weight_change": -0.5
    },
    "streaks": {
      "workout_streak": 12,
      "logging_streak": 30
    },
    "achievements": [
      {
        "id": "uuid",
        "title": "7-Day Streak",
        "description": "Logged workouts for 7 consecutive days",
        "earned_at": "2025-01-10T00:00:00Z"
      }
    ]
  }
}
```

---

## 9. AI Insights Endpoints

### 9.1 Get AI Insights

```http
GET /api/v1/insights?unread_only=true&limit=10
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "insight_type": "recommendation",
      "category": "workout",
      "title": "Increase Cardio Intensity",
      "content": "Based on your progress, consider increasing your running pace by 10%...",
      "priority": 3,
      "confidence_score": 0.87,
      "is_read": false,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### 9.2 Generate Personalized Recommendations

```http
POST /api/v1/insights/generate
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "category": "workout",
        "suggestion": "Try adding strength training 2x per week",
        "reasoning": "Your cardio is excellent, but adding strength will accelerate fat loss"
      },
      {
        "category": "nutrition",
        "suggestion": "Increase protein intake by 20g/day",
        "reasoning": "Your workout intensity has increased, more protein will aid recovery"
      }
    ]
  }
}
```

---

## 10. WebSocket API (Real-time Updates)

**Connection**: `wss://api.fitjourney.app/ws`

### 10.1 Connect

```javascript
const ws = new WebSocket('wss://api.fitjourney.app/ws?token=JWT_TOKEN');

ws.onopen = () => {
  console.log('Connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleUpdate(data);
};
```

### 10.2 Event Types

**Daily Summary Updated**
```json
{
  "event": "daily_summary_updated",
  "data": {
    "date": "2025-01-15",
    "calories_consumed": 1850,
    "calories_burned": 450
  }
}
```

**New AI Insight**
```json
{
  "event": "new_insight",
  "data": {
    "id": "uuid",
    "title": "Great Progress!",
    "content": "You've lost 2kg this month..."
  }
}
```

**Habit Reminder**
```json
{
  "event": "habit_reminder",
  "data": {
    "habit_id": "uuid",
    "habit_name": "Drink Water",
    "reminder_time": "08:00:00"
  }
}
```

---

## 11. Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or expired token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid input data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 12. Pagination

All list endpoints support pagination:

```http
GET /api/v1/workouts?limit=20&offset=0
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

---

## 13. Filtering & Sorting

Most list endpoints support filtering and sorting:

```http
GET /api/v1/workouts?category=cardio&sort_by=workout_date&order=desc
```

---

## 14. API Versioning

Version specified in URL: `/api/v1/`, `/api/v2/`

Legacy versions supported for 12 months after deprecation.

---

**Document Version**: 1.0  
**Last Updated**: December 4, 2025  
**Total Endpoints**: 50+  
**API Style**: RESTful
