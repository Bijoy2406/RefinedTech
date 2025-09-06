# RefinedTech 

## About the Project

**RefinedTech** is a secure multi-user eCommerce platform for buying and selling refurbished gadgets, PCs, and smartphones. 
Sellers can list used tech products with verified condition grades, while buyers enjoy AI-powered recommendations, escrow payment protection, and a seamless bidding/purchasing experience.

---
##  Project Objective  

RefinedTech is an online marketplace designed to make buying and selling used tech gadgets simple, safe, and smart. Our goal is to:
- Connect buyers and sellers of pre-owned electronics (phones, laptops, gaming gear) in one trusted platform.  
- Prevent scams with AI-powered fraud detection for all listings. 
- Guarantee fair deals using escrow payments - your money is only released when you receive the item.
- Simplify decisions with verified condition ratings (Like-new/Good/Fair) and real photos.
- Save you time with smart recommendations based on your preferences.

No more sketchy Craigslist deals - just easy, secure tech trading! 

---

##  Target Audience  
- **Budget-Conscious Shoppers**
- **Tech Resellers & Small Businesses**
- **Eco-Friendly Consumers**
- **Gamers & Tech Enthusiasts**
- **Global Users**

Why They’ll Love RefinedTech:
- ✨ First-time buyers: Guided purchasing with AI recommendations
- 💼 Small businesses: Bulk listing tools and seller analytics
- 🌱 Eco-warriors: Carbon footprint tracker for each purchase
- 🌎 International users: Multi-language support & local shipping partners

---

## Figma Design
Click Here: [RefinedTech](https://www.figma.com/design/Vamwe21bV0AiM5MHPnyMqK/RefinedTech?node-id=0-1&t=9MeQwzWboM1RyzeW-1)

---

## 👨‍💻 Team Members
| ID           | Name                         | Email                             | Role                  |
|--------------|------------------------------|-----------------------------------|-----------------------|
| 20220104007  | Salman Faresi                | faresisalman999@gmail.com         |           Lead            |
| 20220104049  | Maisha Momtaz Meem           | maishamomtaz2003@gmail.com        |           Frontend            |
| 20210204105  | Jarin Tasnim                 | tasnim.cse.20210204105@aust.edu   |             Frontend          |
| 20220104157  | Tajuddin Ahmed               | bijoy.ahmed12555@gmail.com        |      Backend                 |


---

## Wakatime Badges
 **Salman Faresi**

 [![wakatime](https://wakatime.com/badge/user/744e9c10-3c2b-4064-b477-29247d78e375/project/b5d19699-d3de-4342-882d-aa0ad9826a1d.svg)](https://wakatime.com/badge/user/744e9c10-3c2b-4064-b477-29247d78e375/project/b5d19699-d3de-4342-882d-aa0ad9826a1d)

 **Maisha Momtaz Meem**
 
 [![wakatime](https://wakatime.com/badge/user/616ef38b-bd7d-4b21-9300-1b605348a4a2/project/5ca7d186-ba62-4e6a-bc8f-cda0e34d7e23.svg)](https://wakatime.com/badge/user/616ef38b-bd7d-4b21-9300-1b605348a4a2/project/5ca7d186-ba62-4e6a-bc8f-cda0e34d7e23)
 

 **Tajuddin Ahmed**

[![wakatime](https://wakatime.com/badge/user/652acd96-cfb8-4029-a662-a80978f37e02/project/0349f369-f284-46d8-b5a1-67a32ae2a0cf.svg)](https://wakatime.com/badge/user/652acd96-cfb8-4029-a662-a80978f37e02/project/0349f369-f284-46d8-b5a1-67a32ae2a0cf)

 **Jarin Tasnim**

---

## Core Features
- **Role-based dashboards** (Buyers/Sellers/Admin)
- **AI-powered product recommendations** based on user behavior
- **Escrow payment system** for secure transactions
- **Condition verification** (Like-new/Good/Fair with photos)
- **Bidding & Fixed-price listings**
- **Advanced Admin Panel** with hierarchical permissions
- **Real-time approval system** for user requests

---

## Technology Stack
| Layer        | Technology                 |
|--------------|----------------------------|
| Frontend     | React 18, JavaScript, CSS |
| Backend      | Laravel (PHP)              |
| Database     | MySQL                      |

---

## Key Pages & Features

### 1. **Login / Signup**
- OAuth (Google/Github) + Email verification
- Separate flows for buyers/sellers/admins
- Role-based redirects after login

### 2. **Buyer Dashboard**
- Saved searches, watchlisted items
- Purchase history & tracking
- AI-recommended products

### 3. **Seller Dashboard**
- Inventory management
- Sales analytics
- Bidding management

### 4. **Admin Homepage** 
- **📊 Overview Dashboard**: Real-time statistics and quick actions
- **🏪 Pending Sellers**: Review and approve seller applications
- **🛒 Pending Buyers**: Review and approve buyer registrations
- **👤 Super Admin Features**: 
  - Approve pending admin requests (Super Admin only)
  - Generate admin access codes
  - Advanced user management

### 5. **Admin Management System**
- **Regular Admins**: Can approve sellers and buyers
- **Super Admins**: Additional permissions for admin approval
- **Hierarchical Access Control**: First admin or designated super admins
- **Admin Access Codes**: Controlled admin registration system

### 4. **Product Listing Page**
- Filter by: Price, Condition, Location
- Verified seller badges
- "Similar items" suggestions

### 5. **Product Detail Page**
- 360° image viewer
- Condition report (Battery health, scratches)
- Secure chat with seller

### 6. **Checkout Process**
- Escrow payment hold until delivery confirmation
- Shipping label generation
- Fraud detection alerts

### 7. **Admin Panel**
- User/product moderation
- Dispute resolution system
- Financial reporting

---

🎨 Design Principles
- User-Centric Minimalism
- Responsive Architecture
- Trust-Centric UX
- WCAG-Compliant Accessibility
- Performance-Optimized Interactions
- Cognitive Load Reduction
- Consistent Design Language
- Data-Driven Microinteractions

---

# Installation

## Clone Repository
```bash
git clone https://github.com/Bijoy2406/RefinedTech.git
cd RefinedTech
```

## Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
