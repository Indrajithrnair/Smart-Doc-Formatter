# 👨‍💼 Admin Login Setup

## ✅ Admin Login Fixed!

The admin login now uses the correct email format.

---

## 🔑 Admin Credentials

**Email:** `admin@admin.com`  
**Password:** `admin`

---

## 🚀 How to Use

### **Method 1: Quick Admin Login (Recommended)**
1. Click **"Sign In"** button
2. Click **"Sign In as Admin"** (purple button with shield icon)
3. Automatically logs in with admin credentials

### **Method 2: Manual Login**
1. Click **"Sign In"** button
2. Enter email: `admin@admin.com`
3. Enter password: `admin`
4. Click **"Sign In"**

---

## ⚙️ Backend Setup Required

### **First Time Setup:**

You need to create the admin account in your backend. Here are two options:

### **Option 1: Using the Signup Form**
1. Go to the app
2. Click **"Sign Up"**
3. Enter:
   - Email: `admin@admin.com`
   - Username: `admin`
   - Password: `admin`
   - Confirm Password: `admin`
4. Sign up
5. Now admin login will work!

### **Option 2: Direct Database Creation (If using SQLite)**

If your backend uses SQLite, you can run this in Python:

```python
from smartdoc_agent.api.database import get_db
from smartdoc_agent.api.auth import get_password_hash

# Create admin user
db = next(get_db())
admin_user = {
    "email": "admin@admin.com",
    "username": "admin",
    "hashed_password": get_password_hash("admin")
}
# Insert into database
# (Specific code depends on your ORM)
```

### **Option 3: Backend Auto-Create Admin (Recommended)**

Add this to your backend startup (if not already present):

```python
# In main.py or startup script
@app.on_event("startup")
async def create_default_admin():
    db = next(get_db())
    # Check if admin exists
    admin = db.query(User).filter(User.email == "admin@admin.com").first()
    if not admin:
        # Create admin user
        admin = User(
            email="admin@admin.com",
            username="admin",
            hashed_password=get_password_hash("admin")
        )
        db.add(admin)
        db.commit()
        print("✅ Default admin user created")
```

---

## 🔒 Security Note

**⚠️ Important for Production:**

The default admin credentials (`admin@admin.com` / `admin`) should **ONLY** be used for development/testing.

### **For Production:**
1. Change the admin password immediately
2. Use a strong, unique password
3. Consider using environment variables for admin credentials
4. Implement role-based access control (RBAC)
5. Add two-factor authentication (2FA)

---

## 🐛 Troubleshooting

### **Error: "Invalid credentials"**
- **Cause:** Admin account doesn't exist in database
- **Solution:** Create the admin account using Option 1 above

### **Error: "422 Unprocessable Entity"**
- **Cause:** Invalid email format (now fixed!)
- **Solution:** We now use `admin@admin.com` instead of just `admin`

### **Error: "Cannot connect to server"**
- **Cause:** Backend not running
- **Solution:** Start backend with:
  ```bash
  cd smartdoc_formatter_j
  python -m uvicorn smartdoc_agent.api.main:app --reload --port 8000
  ```

---

## ✨ UI Feature

The admin login button has a special design:

```
┌─────────────────────────────┐
│  Email: [your-email]        │
│  Password: [********]       │
│  [Sign In]                  │
│                             │
│  ─────── Or ───────         │
│                             │
│  🛡️ [Sign In as Admin]     │  ← Purple themed
│                             │
│  Don't have an account?     │
│  Sign up here               │
└─────────────────────────────┘
```

**Visual Cues:**
- 🛡️ Shield icon (indicates admin access)
- Purple border (distinct from regular login)
- Hover effect (border glow)

---

## 🎯 Quick Start (Recommended)

1. **First time only:** Sign up manually with `admin@admin.com`
2. **Every time after:** Use "Sign In as Admin" button (1 click!)

---

## 📝 Credentials Summary

| Field | Value | Notes |
|-------|-------|-------|
| Email | `admin@admin.com` | Must be valid email format |
| Password | `admin` | Change in production! |
| Username | `admin` | Display name |
| Role | Admin | (If RBAC implemented) |

---

## ✅ Implementation Complete

The admin login is now fixed and working with the correct email format!

**Test it now:**
1. Click "Sign In"
2. Click "Sign In as Admin"
3. Should log in successfully! 🎉

---

**Note:** If you get "Invalid credentials", create the admin account first using the signup form with the credentials above.
