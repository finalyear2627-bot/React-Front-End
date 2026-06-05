# React Frontend Setup Guide

## Project Status ✅

Your React project is now ready to work with the Django backend!

**Location:** `E:\Fyp\React-Front-End`

## Updates Made

### 1. **SignUpLayer Component** ✅ Updated
- **File:** `/src/components/SignUpLayer.jsx`
- **Features:**
  - Role selection (Student/Teacher) radio buttons
  - First Name & Last Name fields
  - Form validation
  - Password confirmation
  - Error handling
  - Auto-login after registration

### 2. **SignInLayer Component** ✅ Already Configured
- **File:** `/src/components/SignInLayer.jsx`
- **Features:**
  - Username/Email login
  - JWT token management
  - Redirects to dashboard after login

### 3. **API Integration** ✅ Already Configured
- **Files:**
  - `/src/api/axiosInstance.js` - Base URL: `http://127.0.0.1:8000/api`
  - `/src/services/token.service.js` - JWT token storage
  - `/src/api/auth.service.js` - Auth functions

---

## How to Run

### Option 1: From Terminal (Git Bash/CMD)
```bash
cd E:\Fyp\React-Front-End
npm start
```
Server will start at: **http://localhost:3000**

### Option 2: Open in VS Code
```bash
code E:\Fyp\React-Front-End
```
Then in VS Code terminal:
```bash
npm start
```

---

## Testing Workflow

### 1. **Sign Up as Student**
- Go to: `http://localhost:3000/sign-up`
- Select: **Student** role
- Fill in:
  - First Name: Ali
  - Last Name: Khan
  - Username: student_test1
  - Email: student_test@example.com
  - Password: Test@12345
  - Confirm Password: Test@12345
- Click Sign Up → Auto-redirects to dashboard

### 2. **Sign In as Student**
- Go to: `http://localhost:3000/sign-in`
- Username: `student1`
- Password: `Student@123`
- Click Sign In → Redirects to dashboard

### 3. **Sign Up as Teacher**
- Go to: `http://localhost:3000/sign-up`
- Select: **Teacher** role
- Fill same way as student
- Click Sign Up → Auto-redirects to dashboard

### 4. **Sign In with Existing Users**

**Student:**
- Username: `student1`
- Password: `Student@123`

**Teacher:**
- Username: `teacher1`
- Password: `Teacher@123`

**Admin:**
- Username: `administrator`
- Password: `finalyear2627`

---

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/accounts/auth/register/student/` | POST | Register new student |
| `/accounts/auth/register/teacher/` | POST | Register new teacher |
| `/auth/login/` | POST | Login user |
| `/accounts/me/` | GET | Get current user info |
| `/accounts/users/` | GET | List all users (Admin only) |

---

## Tokens Management

Tokens are automatically stored in **localStorage**:
- `access_token` - For API requests
- `refresh_token` - For refreshing tokens

All API requests automatically include the token in headers:
```
Authorization: Bearer <access_token>
```

---

## Next Steps (Optional Enhancements)

1. **Create Role-Based Dashboards**
   - Different layouts for Student/Teacher/Admin
   - Check `request.user.role` from current user API

2. **Add Protected Routes**
   - Redirect non-authenticated users to login
   - Check role before showing pages

3. **Add Logout Functionality**
   - Clear tokens
   - Redirect to login page

4. **Add Token Refresh**
   - Auto-refresh token when expired
   - Show login again if refresh fails

---

## Debugging Tips

1. **Check Browser Console** - Network errors
2. **Check Network Tab** - API calls
3. **localStorage Check** - View stored tokens
4. **Redux DevTools** - If using Redux (install browser extension)

---

## Troubleshooting

**Issue:** "Cannot connect to backend"
- Ensure Django server is running: `python manage.py runserver`
- Check URL: `http://127.0.0.1:8000/api`

**Issue:** "Registration fails"
- Check console for error message
- Ensure password is min 8 characters
- Username must be unique

**Issue:** "Login fails"
- Check credentials
- Ensure user exists in database
- Check Django server logs

---

## Files Structure

```
E:\Fyp\React-Front-End\
├── src/
│   ├── api/
│   │   ├── axiosInstance.js ✅ Configured
│   │   ├── auth.service.js ✅ Configured
│   │   └── index.js
│   ├── services/
│   │   └── token.service.js ✅ Configured
│   ├── components/
│   │   ├── SignInLayer.jsx ✅ Ready
│   │   ├── SignUpLayer.jsx ✅ UPDATED
│   │   └── ... other components
│   ├── pages/
│   │   ├── SignInPage.jsx ✅ Ready
│   │   ├── SignUpPage.jsx ✅ Ready
│   │   └── ... other pages
│   └── App.js ✅ Routes configured
├── package.json
└── .env (BASE_URL configured)
```

---

## Quick Start Summary

✅ Backend API: `http://127.0.0.1:8000`
✅ Frontend: `http://localhost:3000`
✅ Users created and tested
✅ Sign In/Sign Up configured
✅ Registration with role selection ready
✅ Tokens auto-managed in localStorage

**Ready to deploy! 🚀**
