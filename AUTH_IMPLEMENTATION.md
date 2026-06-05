# Authentication System Implementation

## Overview
The authentication system now supports **JSON API** with role-based login for **Student**, **Admin**, and **Teacher** users.

## Updated Files

### 1. **SignInLayer.jsx** - Login Component
**File:** `src/components/SignInLayer.jsx`

**Key Features:**
- Role selector (Student, Teacher, Admin)
- Dynamic API endpoint based on selected role
- User credentials stored in localStorage:
  - `access_token`
  - `refresh_token`
  - `user_role`
  - `user_id`
  - `username`

**API Endpoints Used:**
```javascript
// Student
POST /auth/login/

// Teacher
POST /auth/login/teacher/

// Admin
POST /auth/login/admin/
```

**Expected JSON Response:**
```json
{
  "access": "your_access_token",
  "refresh": "your_refresh_token",
  "user_id": "user_id_value"
}
```

---

### 2. **SignUpLayer.jsx** - Registration Component
**File:** `src/components/SignUpLayer.jsx`

**Key Features:**
- Role selection added: **Student**, **Teacher**, **Admin**
- Dynamic API endpoint based on selected role
- Auto-login after successful registration
- Form validation

**API Endpoints Used:**
```javascript
// Student Registration
POST /accounts/auth/register/student/

// Teacher Registration
POST /accounts/auth/register/teacher/

// Admin Registration
POST /accounts/auth/register/admin/
```

**Request JSON Body:**
```json
{
  "username": "username",
  "email": "email@example.com",
  "password": "password",
  "password_confirm": "password",
  "first_name": "John",
  "last_name": "Doe"
}
```

---

### 3. **auth.service.js** - Authentication Service
**File:** `src/api/auth.service.js`

**Methods:**

```javascript
// Login with role
authService.login(username, password, role = "STUDENT")

// Register with role
authService.register(userData, role = "STUDENT")

// Logout
authService.logout()

// Get current user info
authService.getCurrentUser()
```

---

### 4. **ProtectedRoute.jsx** - Route Protection
**File:** `src/components/ProtectedRoute.jsx`

**Features:**
- Token validation
- Role-based access control
- Optional allowed roles parameter

**Usage:**
```javascript
// Any authenticated user
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

// Specific roles only
<Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminPanel /></ProtectedRoute>} />
```

---

## Storage Structure

### localStorage Keys
```
- access_token: JWT access token
- refresh_token: JWT refresh token
- user_role: "STUDENT" | "TEACHER" | "ADMIN"
- user_id: User's ID from server
- username: User's username
```

---

## API Integration

### Axios Configuration
**File:** `src/api/axiosInstance.js`

The axios instance automatically:
- Adds `Authorization: Bearer {access_token}` header
- Uses base URL: `http://127.0.0.1:8000/api`
- Returns JSON responses

---

## Error Handling

The login/signup components handle:
- Invalid credentials (401)
- Non-field errors from API
- Detailed error messages from server
- Connection errors

---

## Usage Example

### Login Flow
1. User selects role (Student/Teacher/Admin)
2. Enters username and password
3. Component posts to appropriate endpoint
4. Tokens and role stored in localStorage
5. User redirected to `/dashboard`

### SignUp Flow
1. User selects role
2. Fills registration form
3. Component posts to appropriate endpoint
4. Auto-login with same credentials
5. Tokens stored
6. User redirected to `/dashboard`

---

## Backend Requirements

Your backend should provide these endpoints:

```
POST /api/auth/login/
POST /api/auth/login/teacher/
POST /api/auth/login/admin/
POST /api/accounts/auth/register/student/
POST /api/accounts/auth/register/teacher/
POST /api/accounts/auth/register/admin/
```

All endpoints should return JSON:
```json
{
  "access": "access_token_string",
  "refresh": "refresh_token_string",
  "user_id": "user_id_value"
}
```

---

## Next Steps

1. Ensure backend endpoints match the expected format
2. Test login/signup with each role
3. Verify tokens are properly stored
4. Test protected routes with role-based access
5. Implement logout functionality in navbar/sidebar
