# RefinedTech Complete System Testing Guide 🧪

## Prerequisites
1. Ensure Laravel backend is running: `php artisan serve`
2. Ensure React frontend is running: `npm run dev` (in frontend directory)
3. Have Thunder Client extension installed in VS Code
4. Create test images (≤2MB) for file upload testing

## 🔧 API Base URL
```
http://localhost:8000/api
```

## 📋 Complete Testing Sequence

### 1. BUYER REGISTRATION ✅
**Endpoint:** `POST /api/register`

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
  "name": "Test Buyer",
  "first_name": "Test",
  "last_name": "Buyer",
  "email": "testbuyer@example.com",
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
  "message": "User registered successfully and is pending approval.",
  "user": {
    "id": X,
    "name": "Test Buyer",
    "email": "testbuyer@example.com",
    "role": "Buyer",
    "status": "pending"
  }
}
```

---

### 2. SELLER REGISTRATION WITH FILE UPLOADS 📄
**Endpoint:** `POST /api/register`

**Headers:**
```json
{
  "Accept": "application/json"
}
```

**Body (form-data):**
```
name: Test Seller
first_name: Test  
last_name: Seller
email: testseller@example.com
password: password123
password_confirmation: password123
role: Seller
country: United States
phone_number: +1234567890
shop_username: testshop123
date_of_birth: 1990-05-15
business_address: 123 Business St, City, State
national_id: [Upload image file ≤2MB]
proof_of_ownership: [Upload image file ≤2MB]
```

**Expected Response:**
```json
{
  "message": "User registered successfully and is pending approval.",
  "user": {
    "id": X,
    "role": "Seller",
    "status": "pending",
    "shop_username": "testshop123",
    "files": {
      "national_id": "national_ids/filename.jpg",
      "proof_of_ownership": "proof_of_ownership/filename.jpg"
    }
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
  "codes": [
    {
      "access_code": "ADM-SYSTEM01",
      "description": "System generated admin access code",
      "is_used": false
    },
    {
      "access_code": "ADM-E5A91765",
      "description": "Access code #1 for new admin (auto-generated)",
      "is_used": false
    }
  ]
}
```

---

### 4. ADMIN REGISTRATION WITH ACCESS CODE 👨‍💼
**Endpoint:** `POST /api/register`

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
  "name": "Test Admin",
  "first_name": "Test",
  "last_name": "Admin",
  "email": "testadmin2@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "Admin",
  "admin_access_code": "ADM-SYSTEM01",
  "admin_username": "testadmin2",
  "country": "United States",
  "id_proof_reference": "ADMIN-ID-12345"
}
```

**Expected Response:**
```json
{
  "message": "User registered successfully and is pending approval.",
  "user": {
    "id": X,
    "role": "Admin",
    "status": "pending",
    "admin_username": "testadmin2"
  }
}
```

---

### 5. LOGIN TEST 🔐
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
  "email": "testbuyer@example.com",
  "password": "password123"
}
```

**Expected Response (if approved):**
```json
{
  "token": "X|XXXXXXXXXXXXXXX",
  "user": {
    "id": X,
    "name": "Test Buyer",
    "email": "testbuyer@example.com",
    "role": "Buyer",
    "status": "approved"
  }
}
```

---

### 6. ADMIN APPROVAL PROCESS 🎯
**Endpoint:** `PUT /api/admin/users/{id}/approve`

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
  "message": "User approved successfully. 3 admin access codes have been generated.",
  "user": {
    "id": X,
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

## 🚫 Error Testing Scenarios

### Invalid Admin Access Code
**Body:**
```json
{
  "name": "Test Admin",
  "email": "testadmin3@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "Admin",
  "admin_access_code": "INVALID-CODE"
}
```

**Expected Response:**
```json
{
  "message": "The admin access code is invalid or has already been used."
}
```

### File Upload Too Large (>2MB)
Upload a file larger than 2MB for `national_id` or `proof_of_ownership`.

**Expected Response:**
```json
{
  "message": "The national id field must not be greater than 2048 kilobytes."
}
```

### Password Mismatch
```json
{
  "password": "password123",
  "password_confirmation": "differentpassword"
}
```

**Expected Response:**
```json
{
  "message": "The password field confirmation does not match."
}
```

---

## 📊 Database Verification Commands

After testing, verify data in database:

```bash
# Check users table
php artisan tinker
>>> User::all()->pluck('name', 'email', 'role', 'status')

# Check admin access codes
>>> AdminAccessCode::all()->pluck('access_code', 'is_used', 'used_by_user_id')

# Check file storage
>>> Storage::files('national_ids')
>>> Storage::files('proof_of_ownership')
```

---

## ✅ Success Criteria

1. **Buyer Registration:** ✅ Creates user with pending status
2. **Seller Registration:** ✅ Creates user with file uploads stored correctly
3. **Admin Registration:** ✅ Validates access code before registration
4. **File Upload:** ✅ Validates file size (≤2MB) and type (images)
5. **Admin Approval:** ✅ Auto-generates 3 new access codes
6. **Login:** ✅ Returns token for approved users
7. **Error Handling:** ✅ Proper validation messages

---

## 🐛 Troubleshooting

### Common Issues:
- **File upload fails:** Check file size ≤2MB and format (JPG, PNG, GIF)
- **Admin registration fails:** Verify access code exists and unused
- **Login fails:** Ensure user status is "approved"
- **CORS errors:** Check Laravel backend is running on correct port

### Debug Commands:
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:list | findstr api
php artisan queue:work (if using queues)
```

Happy Testing! 🎉
