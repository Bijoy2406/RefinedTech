# RefinedTech 

## About the Project

**RefinedTech** is a secure multi-user eCommerce platform for buying and selling refurbished gadgets, PCs, and smartphones. 
Sellers can list used tech products with verified condition grades, while buyers enjoy AI-powered recommendations, escrow payment protection, and a seamless bidding/purchasing experience.

---
##  Project Objective  
To create a trusted multi-user eCommerce platform where individuals can **buy/sell used electronics** (smartphones, PCs, gadgets) with:  
- **AI-powered fraud detection** for listings  
- Escrow-based secure payments  
- Verified condition grading  

---

##  Target Audience  
- **Tech Enthusiasts**
- **Sellers**
- **Eco-Conscious Users**

---

## Figma Design
Click Here: [RefinedTech](https://www.figma.com/design/Vamwe21bV0AiM5MHPnyMqK/RefinedTech?node-id=0-1&t=9MeQwzWboM1RyzeW-1)

---

## 👨‍💻 Team Members
| ID           | Name                         | Email                             | Role                  |
|--------------|------------------------------|-----------------------------------|-----------------------|
| 20220104007  | Salman Faresi                | faresisalman999@gmail.com         |                       |
| 20220104049  | Maisha Momtaz Meem           | @gmail.com                        |                       |
| 20220104157  | Tajuddin Ahmed               | @gmail.com                        |                       |
| 20210204104  | Jarin Tasnim                 | @gmail.com                        |                       |

---

## Wakatime Badges
-- **Salman Faresi**

-- **Maisha Momtaz Meem**

-- **Tajuddin Ahmed**

-- **Jarin Tasnim**

---

## Core Features
- **Role-based dashboards** (Buyers/Sellers/Admin)
- **AI-powered product recommendations** based on user behavior
- **Escrow payment system** for secure transactions
- **Condition verification** (Like-new/Good/Fair with photos)
- **Bidding & Fixed-price listings**

---

## Technology Stack
| Layer        | Technology                 |
|--------------|----------------------------|
| Frontend     | JavaScript, CSS (Tailwind) |
| Backend      | Laravel (PHP)              |
| Database     | MySQL                      |
| Payment      | Stripe/PayPal API          |

---

## Key Pages & Features

### 1. **Login / Signup**
- OAuth (Google/Github) + Email verification
- Separate flows for buyers/sellers

### 2. **Buyer Dashboard**
- Saved searches, watchlisted items
- Purchase history & tracking
- AI-recommended products

### 3. **Seller Dashboard**
- Inventory management
- Sales analytics
- Bidding management

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

## Design Principles
- **Mobile-first** responsive UI
- **Tech-themed color palette** (Neon blues/dark mode)
- **Accessibility** (WCAG AA compliant)

---

## Installation
```bash
# Clone repo
git clone https://github.com/your-username/RefinedTech.git
cd RefinedTech

# Install dependencies
npm install
composer install

# Configure .env (copy from .env.example)
# Set database and payment API keys

# Run migrations
php artisan migrate --seed

# Start dev server
npm run dev
php artisan serve
