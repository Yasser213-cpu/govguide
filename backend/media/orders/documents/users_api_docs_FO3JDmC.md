# Users Module — API Documentation

> For Frontend Developers  
> Base URL prefix: `/api/users/`  
> All requests and responses use **JSON**. All OTP codes expire in **5 minutes**.

---

## Table of Contents

1. [Authentication Flow Overview](#1-authentication-flow-overview)
2. [Data Models](#2-data-models)
3. [Endpoints](#3-endpoints)
   - [Register](#31-register)
   - [Login (Obtain Token)](#32-login-obtain-token)
   - [Refresh Token](#33-refresh-token)
   - [Verify Email](#34-verify-email)
   - [Resend OTP](#35-resend-otp)
   - [Forget Password](#36-forget-password)
   - [Reset Password](#37-reset-password)
4. [Validation Rules](#4-validation-rules)
5. [Error Reference](#5-error-reference)
6. [Frontend Integration Guide](#6-frontend-integration-guide)

---

## 1. Authentication Flow Overview

### New User Flow

```
Register → Email arrives with OTP → Verify Email → Login → Access App
```

### Password Reset Flow

```
Forget Password → Email arrives with OTP → Reset Password → Login
```

> **Note:** A user **cannot log in** until their email is verified. Login will return a specific error with a `next_step` hint telling you where to redirect.

---

## 2. Data Models

### User

| Field         | Type      | Notes                                      |
|---------------|-----------|--------------------------------------------|
| `id`          | integer   | Auto-generated primary key                 |
| `username`    | string    | 3–30 chars, letters/numbers/underscores only, must start with a letter |
| `email`       | string    | Unique, used as login identifier           |
| `role`        | string    | Either `"client"` or `"company"`           |
| `is_verified` | boolean   | `false` until email OTP is confirmed       |

### JWT Tokens

After a successful login, you receive two tokens:

| Token     | Purpose                              | Storage Recommendation |
|-----------|--------------------------------------|------------------------|
| `access`  | Sent in `Authorization` header for all protected requests | Memory / `sessionStorage` |
| `refresh` | Used to get a new `access` token when it expires | `httpOnly` cookie (preferred) or `localStorage` |

Send the access token as:
```
Authorization: Bearer <access_token>
```

---

## 3. Endpoints

---

### 3.1 Register

**`POST /api/users/register/client`**

Creates a new user account and automatically sends a verification OTP to the provided email.

#### Request Body

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "MyPass@123",
  "role": "client"
}
```

| Field      | Type   | Required | Notes                              |
|------------|--------|----------|------------------------------------|
| `username` | string | ✅        | See validation rules below         |
| `email`    | string | ✅        | Must be unique                     |
| `password` | string | ✅        | See password rules below           |
| `role`     | string | ✅        | Must be `"client"` or `"company"`  |

#### Success Response — `200 OK`

```json
{
  "detail": "Registration successful. An OTP has been sent to your email address. Please verify your email to activate your account."
}
```

> **Next step:** Redirect the user to the **email verification screen**.

#### Error Response — `400 Bad Request`

```json
{
  "email": ["Email already exists"],
  "username": ["username already exist"],
  "password": ["Password must be at least 8 characters..."]
}
```

---

### 3.2 Login (Obtain Token)

**`POST /api/users/token`**

Authenticates a user and returns JWT tokens. Login is **only possible after email verification**.

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "MyPass@123"
}
```

#### Success Response — `200 OK`

```json
{
  "access": "<access_token>",
  "refresh": "<refresh_token>",
  "role": "client",
  "next_step": "home"
}
```

For `role: "company"`, the `next_step` field guides post-login routing:

| `next_step` value  | Meaning                                          |
|--------------------|--------------------------------------------------|
| `"home"`           | Regular client — go to home/dashboard            |
| `"dashboard"`      | Company with an existing company profile         |
| `"create_company"` | Company user who hasn't set up their company yet |

> **Important:** Always check `next_step` after login to decide where to route the user.

#### Error — Unverified Email — `400 Bad Request`

```json
{
  "detail": "Please verify your email before logging in.",
  "next_step": "verify_email"
}
```

> **Next step:** Redirect to the email verification screen. Optionally offer a "Resend OTP" button.

#### Error — Wrong Credentials — `401 Unauthorized`

```json
{
  "detail": "Invalid email or password"
}
```

---

### 3.3 Refresh Token

**`POST /api/users/token/refresh`**

Gets a new `access` token using a valid `refresh` token.

#### Request Body

```json
{
  "refresh": "<refresh_token>"
}
```

#### Success Response — `200 OK`

```json
{
  "access": "<new_access_token>"
}
```

#### Error — `401 Unauthorized`

```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

> Handle this by logging the user out and redirecting to the login page.

---

### 3.4 Verify Email

**`POST /api/users/verify`**

Verifies a user's email using the OTP they received.

#### Request Body

```json
{
  "email": "john@example.com",
  "otp": "482910"
}
```

| Field   | Type   | Required | Notes                    |
|---------|--------|----------|--------------------------|
| `email` | string | ✅        | The registered email     |
| `otp`   | string | ✅        | 6-digit code from email  |

#### Success Response — `200 OK`

```json
{
  "detail": "Email verified successfully. You can log in now."
}
```

> **Next step:** Redirect to the login screen.

#### Error — Expired OTP — `400 Bad Request`

```json
{
  "detail": "OTP has expired. Please request a new verification code."
}
```

#### Error — Invalid OTP or Email — `400 Bad Request`

```json
{
  "detail": "Invalid email or OTP."
}
```

---

### 3.5 Resend OTP

**`POST /api/users/resend-otp`**

Deletes any existing OTP and sends a fresh one to the user's email.

#### Request Body

```json
{
  "email": "john@example.com"
}
```

#### Success Response — `200 OK`

```json
{
  "detail": "If an account with this email exists, an OTP has been sent."
}
```

> The response is intentionally the same whether the email exists or not (security measure).

#### Error — Already Verified — `400 Bad Request`

```json
{
  "detail": "This email has been verified"
}
```

---

### 3.6 Forget Password

**`POST /api/users/forget-password`**

Sends a password reset OTP to the user's email.

#### Request Body

```json
{
  "email": "john@example.com"
}
```

#### Success Response — `200 OK`

```json
{
  "detail": "If an account with this email exists, an OTP has been sent."
}
```

> Always returns `200 OK` regardless of whether the email exists (security measure against enumeration).

> **Next step:** Show an OTP input screen for password reset.

---

### 3.7 Reset Password

**`POST /api/users/reset-password`**

Resets the user's password after validating the OTP.

#### Request Body

```json
{
  "email": "john@example.com",
  "otp": "738291",
  "password": "NewPass@456"
}
```

| Field      | Type   | Required | Notes                       |
|------------|--------|----------|-----------------------------|
| `email`    | string | ✅        | The registered email        |
| `otp`      | string | ✅        | 6-digit code from email     |
| `password` | string | ✅        | Must meet password rules    |

#### Success Response — `200 OK`

```json
{
  "detail": "Your password has been reset successfully."
}
```

> **Next step:** Redirect to the login screen.

#### Error — Expired OTP — `400 Bad Request`

```json
{
  "detail": "OTP has expired. Please request a new  code."
}
```

#### Error — Invalid OTP or Email — `400 Bad Request`

```json
{
  "detail": "Invalid email or OTP."
}
```

---

## 4. Validation Rules

### Username

- Must be **3 to 30 characters** long
- Must **start with a letter** (a–z or A–Z)
- Can contain **letters, numbers, and underscores** only
- No spaces or special characters

**Valid:** `john_doe`, `User99`, `abc`  
**Invalid:** `_john`, `99user`, `jo`, `john doe`

### Password

Must meet **all** of the following:

| Rule | Requirement |
|------|-------------|
| Minimum length | At least **8 characters** |
| Uppercase | At least **1 uppercase letter** (A–Z) |
| Lowercase | At least **1 lowercase letter** (a–z) |
| Digit | At least **1 number** (0–9) |
| Special character | At least **1** of: `@ $ ! % * ? & . # _ -` |

**Valid examples:** `MyPass@123`, `Secure!99`, `Hello_World1`

### OTP

- Always **6 digits**
- Expires in **5 minutes** from when it was created
- Single-use — deleted after successful verification

---

## 5. Error Reference

| HTTP Status | Meaning | Common Cause |
|-------------|---------|--------------|
| `200 OK` | Success | — |
| `400 Bad Request` | Validation failed or business rule violation | Invalid field, duplicate email, expired OTP |
| `401 Unauthorized` | Authentication failed | Wrong credentials, invalid/expired token |

### Field-Level Errors (400)

Validation errors return an object where each key is a field name:

```json
{
  "email": ["Email already exists"],
  "password": ["Password must be at least 8 characters long..."]
}
```

### Non-Field Errors (400/401)

Logic errors return a `detail` key:

```json
{
  "detail": "OTP has expired. Please request a new verification code."
}
```

---

## 6. Frontend Integration Guide

### Recommended Screen Flow

```
/register
    ↓ (success)
/verify-email?email=...
    ↓ (success)
/login
    ↓ (success, check next_step)
    ├── next_step = "home"           → /home
    ├── next_step = "dashboard"      → /dashboard
    └── next_step = "create_company" → /company/create
```

### Storing Tokens

```js
// After login
const { access, refresh, role, next_step } = response.data;

// Store access token in memory or sessionStorage
sessionStorage.setItem('access', access);

// Store refresh token in httpOnly cookie via backend (preferred)
// or localStorage as a fallback (less secure)
localStorage.setItem('refresh', refresh);
```

### Attaching Token to Requests (Axios example)

```js
axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
```

### Handling Token Expiry (Axios Interceptor)

```js
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      try {
        const refresh = localStorage.getItem('refresh');
        const { data } = await axios.post('/api/users/token/refresh', { refresh });
        // Update stored token and retry request
        sessionStorage.setItem('access', data.access);
        error.config.headers['Authorization'] = `Bearer ${data.access}`;
        return axios(error.config);
      } catch {
        // Refresh failed — log the user out
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### OTP Input UX Tips

- Use a 6-character input (or 6 individual digit boxes) with auto-focus
- Show a countdown timer from 5:00 and reveal the "Resend OTP" button only after expiry
- Disable the resend button immediately after clicking to prevent spam
- Do not auto-submit on fill — let the user confirm to avoid accidental submission on paste

### Role-Based Routing After Login

```js
const { role, next_step } = loginResponse;

if (next_step === 'verify_email') {
  navigate('/verify-email');
} else if (next_step === 'create_company') {
  navigate('/company/create');
} else if (next_step === 'dashboard') {
  navigate('/dashboard');
} else {
  navigate('/home');
}
```

---

*Generated from source code analysis of the `users` Django app — `models.py`, `api/views.py`, `api/serializers.py`, `api/urls.py`, `api/services.py`, `signals.py`.*
