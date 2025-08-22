# RefinedTech Separate Tables Testing Guide 🎯

## 🆕 NEW STRUCTURE OVERVIEW
Your data is now properly separated into dedicated tables:
- **`buyers`** - All buyer accounts  
- **`sellers`** - All seller accounts with file uploads
- **`admins`** - All admin accounts with access codes
- **`admin_access_codes`** - Admin access code management

## Prerequisites ✅
1. Backend running: `php artisan serve`
2. Frontend running: `npm run dev`
3. Thunder Client extension in VS Code
4. Test images (≤2MB) for seller file uploads

## 🔧 API Base URL
```
http://localhost:8000/api
```

---

## 📋 COMPLETE TESTING SEQUENCE

### 1. BUYER REGISTRATION ✅
**Endpoint:** `POST /api/signup`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

**Body:**
```json
{
  "name": "Test Buyer User",
  "first_name": "Test",
  "last_name": "Buyer",
  "email": "buyer@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "Buyer",
  "country": "United States",
  "phone_number": "+1234567890"
}
```

**Expected Response:**
```json
{
  "message": "User registered successfully and is approved.",
  "user": {
    "id": 2,
    "name": "Test Buyer User",
    "email": "buyer@example.com",
    "role": "Buyer",
    "status": "approved"
  }
}
```

---

### 2. SELLER REGISTRATION WITH FILE UPLOADS 📄
**Endpoint:** `POST /api/signup`

**Headers:**
```json
{
  "Accept": "application/json"
}
```

**Body (form-data):**
```
name: Test Seller User
first_name: Test  
last_name: Seller
email: seller@example.com
password: password123
password_confirmation: password123
role: Seller
country: Canada
phone_number: +1234567891
shop_username: testsellershop
date_of_birth: 1985-03-20
business_address: 456 Seller Ave, Toronto, ON
national_id: [Upload image file ≤2MB]
proof_of_ownership: [Upload image file ≤2MB]
```

**Expected Response:**
```json
{
  "message": "User registered successfully and is pending approval.",
  "user": {
    "id": 2,
    "name": "Test Seller User",
    "email": "seller@example.com",
    "role": "Seller",
    "status": "pending"
  }
}
```

---

### 3. GET AVAILABLE ADMIN ACCESS CODES 🔑
**Endpoint:** `GET /api/admin/access-codes/available`

**Headers:**
```json
{
  "Accept": "application/json"
}
```

**Expected Response:**
```json
{
  "success": true,
  "my_codes": [],
  "codes": [
    {
      "access_code": "ADM-SYSTEM01",
      "description": "System generated admin access code #1",
      "created_by_admin_id": null
    },
    {
      "access_code": "ADM-SYSTEM02",
      "description": "System generated admin access code #2",
      "created_by_admin_id": null
    }
  ],
  "total_unused_codes": 7
}
```

---

### 4. ADMIN REGISTRATION WITH ACCESS CODE 👨‍💼
**Endpoint:** `POST /api/signup`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

**Body:**
```json
{
  "name": "Test Admin User",
  "first_name": "Test",
  "last_name": "Admin",
  "email": "admin@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "Admin",
  "admin_access_code": "ADM-SYSTEM02",
  "admin_username": "testadminuser",
  "country": "United Kingdom",
  "id_proof_reference": "ADMIN-UK-789"
}
```

**Expected Response:**
```json
{
  "message": "User registered successfully and is pending approval.",
  "user": {
    "id": 2,
    "name": "Test Admin User",
    "email": "admin@example.com",
    "role": "Admin",
    "status": "pending"
  }
}
```

---

### 5. LOGIN TEST (Any Role) 🔐
**Endpoint:** `POST /api/login`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

**Body:**
```json
{
  "email": "buyer@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 2,
    "name": "Test Buyer User",
    "email": "buyer@example.com",
    "role": "Buyer",
    "status": "approved",
    "created_at": "2025-08-22T11:24:58.000000Z",
    "updated_at": "2025-08-22T11:24:58.000000Z"
  },
  "token": "2|XXXXXXXXXXXXXXX"
}
```

---

### 6. VIEW ALL USERS (Admin Only) 👥
**Endpoint:** `GET /api/admin/users`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer YOUR_ADMIN_TOKEN"
}
```

**Expected Response:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Test Buyer User",
      "email": "buyer@example.com",
      "status": "approved",
      "role": "Buyer",
      "table_type": "buyers"
    },
    {
      "id": 1,
      "name": "Test Seller User", 
      "email": "seller@example.com",
      "status": "approved",
      "role": "Seller",
      "table_type": "sellers"
    }
  ],
  "total": 2,
  "buyers": 1,
  "sellers": 1,
  "admins": 0
}
```

---

### 7. VIEW PENDING USERS (Admin Only) ⏳
**Endpoint:** `GET /api/admin/pending-users`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer YOUR_ADMIN_TOKEN"
}
```

**Expected Response:**
```json
{
  "pending_users": [
    {
      "id": 1,
      "name": "Test Seller User",
      "email": "seller@example.com",
      "status": "pending",
      "role": "Seller",
      "table_type": "sellers"
    },
    {
      "id": 1,
      "name": "Test Admin User",
      "email": "admin@example.com", 
      "status": "pending",
      "role": "Admin",
      "table_type": "admins"
    }
  ],
  "total": 2,
  "buyers": 0,
  "sellers": 1,
  "admins": 1
}
```

---

### 8. APPROVE SELLER 🎯
**Endpoint:** `PUT /api/admin/users/seller/1/approve`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer YOUR_ADMIN_TOKEN"
}
```

**Expected Response:**
```json
{
  "message": "Seller approved successfully.",
  "user": {
    "id": 1,
    "name": "Test Seller User",
    "email": "seller@example.com",
    "role": "Seller",
    "status": "approved"
  }
}
```

---

### 9. APPROVE ADMIN (Auto-generates Access Codes) 🚀
**Endpoint:** `PUT /api/admin/users/admin/1/approve`

**Headers:**
```json
{
  "Content-Type": "application/json", 
  "Accept": "application/json",
  "Authorization": "Bearer YOUR_ADMIN_TOKEN"
}
```

**Expected Response:**
```json
{
  "message": "Admin approved successfully. 3 admin access codes have been generated.",
  "user": {
    "id": 1,
    "name": "Test Admin User",
    "email": "admin@example.com",
    "role": "Admin",
    "status": "approved"
  },
  "generated_codes": [
    {
      "access_code": "ADM-XXXXXXXX",
      "description": "Access code #1 for new admin (auto-generated)"
    },
    {
      "access_code": "ADM-XXXXXXXX",
      "description": "Access code #2 for new admin (auto-generated)"
    },
    {
      "access_code": "ADM-XXXXXXXX", 
      "description": "Access code #3 for new admin (auto-generated)"
    }
  ]
}
```

---

### 10. GET USER DETAILS BY ROLE AND ID 🔍
**Endpoint:** `GET /api/admin/users/seller/1`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer YOUR_ADMIN_TOKEN"
}
```

**Expected Response:**
```json
{
  "user": {
    "id": 1,
    "name": "Test Seller User",
    "first_name": "Test",
    "last_name": "Seller", 
    "email": "seller@example.com",
    "shop_username": "testsellershop",
    "date_of_birth": "1985-03-20",
    "business_address": "456 Seller Ave, Toronto, ON",
    "national_id_path": "national_ids/filename.jpg",
    "proof_of_ownership_path": "proof_of_ownership/filename.jpg",
    "role": "Seller"
  }
}
```

---

## 🚫 ERROR TESTING SCENARIOS

### Duplicate Email Across Tables
Try registering a buyer with email `buyer@example.com` as seller:
```json
{
  "email": "buyer@example.com",
  "role": "Seller"
}
```

**Expected Response:**
```json
{
  "errors": {
    "email": ["The email has already been taken."]
  }
}
```

### Invalid Admin Access Code  
```json
{
  "admin_access_code": "INVALID-CODE"
}
```

**Expected Response:**
```json
{
  "message": "The admin access code is invalid or has already been used."
}
```

### Missing Required Seller Fields
```json
{
  "role": "Seller",
  "name": "Test Seller"
}
```

**Expected Response:**
```json
{
  "errors": {
    "shop_username": ["The shop username field is required."],
    "date_of_birth": ["The date of birth field is required."],
    "national_id": ["The national id field is required."],
    "proof_of_ownership": ["The proof of ownership field is required."]
  }
}
```

---

## 🗄️ DATABASE VERIFICATION

Check each table separately now:

```bash
# Check buyers table
php artisan tinker
>>> App\Models\Buyer::all()->pluck('name', 'email')

# Check sellers table  
>>> App\Models\Seller::all()->pluck('name', 'email', 'shop_username')

# Check admins table
>>> App\Models\Admin::all()->pluck('name', 'email', 'admin_username')

# Check admin access codes
>>> App\Models\AdminAccessCode::all()->pluck('access_code', 'is_used')
```

---

## ✅ SUCCESS CRITERIA

1. **Clean Data Separation:** ✅ Buyers, sellers, and admins in separate tables
2. **Email Uniqueness:** ✅ No duplicate emails across all tables
3. **File Upload Handling:** ✅ Seller files properly stored and linked
4. **Admin Access Codes:** ✅ Validation and usage tracking works
5. **Auto Code Generation:** ✅ Admin approval generates 3 new codes
6. **Role-Based Authentication:** ✅ Login works from any table
7. **Admin Management:** ✅ Approve/reject users by role and ID

---

## 🎉 ADVANTAGES OF NEW STRUCTURE

### 🎯 **Clean Data Management**
- **Buyers Table:** Only buyer-specific fields
- **Sellers Table:** Business data + file uploads
- **Admins Table:** Administrative fields + access codes

### 🔍 **Easy Data Retrieval**
- View only buyers: `SELECT * FROM buyers`
- View only sellers: `SELECT * FROM sellers` 
- View only admins: `SELECT * FROM admins`

### 📈 **Better Performance**
- Smaller table sizes
- Faster queries
- Cleaner indexes

### 🛡️ **Enhanced Security**
- Role-specific validation
- Isolated data access
- Better permission management

---

## 🐛 TROUBLESHOOTING

### Common Issues:
- **Login fails:** Check if user exists in correct table (buyers/sellers/admins)
- **Admin approval fails:** Ensure role parameter is lowercase ('admin', not 'Admin')
- **File upload issues:** Check storage permissions and file size limits
- **Email validation errors:** Verify email uniqueness across all three tables

### Debug Commands:
```bash
php artisan cache:clear
php artisan route:list | findstr admin
php artisan tinker
>>> App\Models\Buyer::count()
>>> App\Models\Seller::count() 
>>> App\Models\Admin::count()
```

**Congratulations! 🎉 Your data is now properly organized in separate tables for much cleaner management!**
