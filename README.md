# RefinedTech

---

## 1. Project Description

**RefinedTech** is a comprehensive multi-user eCommerce marketplace specifically designed for buying and selling refurbished gadgets, PCs, and smartphones. The platform addresses the growing need for sustainable technology consumption by creating a secure, trust-based environment where buyers can access affordable, quality refurbished electronics while sellers can reach a verified customer base. 

The project solves key problems in the second-hand electronics market including lack of trust between buyers and sellers, unclear product condition descriptions, security concerns in transactions, and difficulty in finding reliable platforms for both buying and selling refurbished technology products. By implementing AI-powered features, robust role-based authentication, and comprehensive verification systems, RefinedTech creates a marketplace that prioritizes transparency, security, and user experience.

**Key Problem Areas Addressed:**
- **Trust & Security**: Multi-layered verification system and secure payment processing
- **Product Quality Assurance**: Standardized condition grading and detailed product documentation
- **User Experience**: AI-powered recommendations and intuitive interface design
- **Market Accessibility**: Platform for both individual sellers and small businesses
- **Environmental Impact**: Promoting circular economy through refurbished electronics

**Design Reference:** [Figma Design](https://www.figma.com/design/Vamwe21bV0AiM5MHPnyMqK/RefinedTech?node-id=0-1&t=9MeQwzWboM1RyzeW-1)

**Project Link(Frontend):** [RefinedTech](https://refinedtech.netlify.app/)

---

## 2. Workflow Overview

The RefinedTech platform follows a comprehensive multi-user workflow:

1. **User Registration & Authentication**: Users register as Buyers (auto-approved), Sellers (admin approval required), or Admins (access code required)
2. **Product Management**: Sellers list products with detailed specifications, condition grades, and images
3. **Product Discovery**: Buyers browse products using AI-powered search and recommendations
4. **Communication**: Integrated messaging system for buyer-seller interactions
5. **Transaction Processing**: Secure payment handling with escrow protection
6. **Order Management**: Complete order tracking and fulfillment system
7. **Administrative Oversight**: Comprehensive admin panel for user and platform management

---

## 3. Main Features

- Multi-user role-based authentication system (Buyers/Sellers/Admins)
- AI-powered chatbot with Gemini integration for intelligent product recommendations
- Comprehensive product management with condition verification system
- Real-time messaging between buyers and sellers
- Advanced admin panel with hierarchical permissions and user approval workflows
- Secure payment processing with escrow protection
- Responsive design with modern UI/UX principles
- Cloud-based image management via Cloudinary
- Docker containerization for scalable deployment
- Comprehensive search and filtering capabilities

---

## 4. Technologies Used

- **Frontend**: React 18, JavaScript, CSS, Vite, React Router DOM, Axios, Framer Motion, GSAP, Lottie React, Three.js
- **Backend**: Laravel (PHP 8.2+), Laravel Sanctum, Composer
- **Database**: MySQL, PostgreSQL support, Eloquent ORM
- **APIs**: RESTful APIs, Gemini AI API, Cloudinary API
- **Other Tools**: Docker, Git, VS Code, GitHub, Cloudinary Cloud Storage

---

## 5. System Architecture

**Frontend (React 18)** ↔ **Backend (Laravel PHP)** ↔ **Database (MySQL/PostgreSQL)**

**Key Components:**
- **Authentication Layer**: Multi-model authentication with Laravel Sanctum supporting separate user tables for Buyers, Sellers, and Admins
- **API Layer**: RESTful API endpoints with role-based middleware protection
- **Data Layer**: Comprehensive database schema with 20+ tables managing users, products, orders, conversations, and transactions
- **AI Integration**: Gemini AI service for chatbot functionality and product recommendations
- **Cloud Services**: Cloudinary for optimized image storage and management
- **Containerization**: Docker support for consistent deployment environments

---

## 6. Setup Guidelines

### Backend

```bash
# Clone the repository
git clone https://github.com/Bijoy2406/RefinedTech.git
cd RefinedTech/backend

# Install dependencies
composer install

# Setup environment variables
cp .env.example .env
# Edit .env as needed (database, API keys, etc.)

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Run backend server
php artisan serve
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env as needed (API base URL)

# Run frontend development server
npm run dev
```

---

## 7. Running the Application

**Local Development:**
1. Start the Laravel backend server: `php artisan serve` (runs on http://127.0.0.1:8000)
2. Start the React frontend server: `npm run dev` (runs on http://localhost:5173)
3. Access the application at http://localhost:5173

**Production Deployment:**
- Frontend: Deployable to Netlify/Vercel using `npm run build`
- Backend: Docker containerized for scalable cloud deployment
- Database: MySQL/PostgreSQL with migration support

---

## 8. Deployment Status & Tests

| Component | Is Deployed? | Is Dockerized? | Unit Tests Added? (Optional) | Is AI feature implemented? (Optional) |
|-----------|--------------|----------------|-------------------|--------------------------|
| Backend   |    No       |         YES    |  No              | Yes (Gemini AI Chatbot)                     |
| Frontend  |    Yes       |         No    |  No               | Yes (AI Chatbot Integration)                      |

*Note: The AI features include Gemini-powered chatbot with intelligent product search, recommendations, and natural language processing for customer support.*

---

## 9. Contribution Table

| Metric                      | Total | Backend | Frontend | Salman Faresi  | Maisha Momtaz Meem | Jarin Tasnim | Tajuddin Ahmed |
|-----------------------------|-------|---------|----------|----------|----------|----------|----------|
| Issues Solved                | 95%  |   55%   |    40%   |    26.5%   |    21%   |    20%   |    27.5%   |
| WakaTime Contribution (Hours)| 206+  |   114   |   92   |    65   |    38    |    33    |    70   |
| Percent Contribution (%)     | 100%  |   60%   |    40%   |    31.5%   |    18.4%   |    16.1%   |    34%   |

**Team Roles:**
- **Salman Faresi**: Backend Development , Frontend Development
- **Maisha Momtaz Meem**: Frontend Development , Backend Development
- **Jarin Tasnim**: Frontend Development  , Backend Development
- **Tajuddin Ahmed**: Project Lead, Full-stack coordination

| ID           | Name                         | Email                             | Role                  |
|--------------|------------------------------|-----------------------------------|-----------------------|
| 20220104007  | Salman Faresi                | faresisalman999@gmail.com         |            Backend , Frontend          |
| 20220104049  | Maisha Momtaz Meem           | maishamomtaz2003@gmail.com        |           Frontend , Backend           |
| 20210204105  | Jarin Tasnim                 | tasnim.cse.20210204105@aust.edu   |             Frontend , Backend         |
| 20220104157  | Tajuddin Ahmed               | bijoy.ahmed12555@gmail.com        |      Lead , Coordination                |


---

**WakaTime Badges:**

**Salman Faresi**

[![wakatime](https://wakatime.com/badge/user/744e9c10-3c2b-4064-b477-29247d78e375/project/b5d19699-d3de-4342-882d-aa0ad9826a1d.svg)](https://wakatime.com/badge/user/744e9c10-3c2b-4064-b477-29247d78e375/project/b5d19699-d3de-4342-882d-aa0ad9826a1d) 

**Maisha Momtaz Meem**

[![wakatime](https://wakatime.com/badge/user/616ef38b-bd7d-4b21-9300-1b605348a4a2/project/5ca7d186-ba62-4e6a-bc8f-cda0e34d7e23.svg)](https://wakatime.com/badge/user/616ef38b-bd7d-4b21-9300-1b605348a4a2/project/5ca7d186-ba62-4e6a-bc8f-cda0e34d7e23) 

**Tajuddin Ahmed**

[![wakatime](https://wakatime.com/badge/user/652acd96-cfb8-4029-a662-a80978f37e02/project/0349f369-f284-46d8-b5a1-67a32ae2a0cf.svg)](https://wakatime.com/badge/user/652acd96-cfb8-4029-a662-a80978f37e02/project/0349f369-f284-46d8-b5a1-67a32ae2a0cf) 

**Jarin Tasnim**

[![wakatime](https://wakatime.com/badge/user/85ee4f6f-8082-4100-93a5-40a68db92477/project/1b792482-608f-4422-9c96-a3b22420bda5.svg)](https://wakatime.com/badge/user/85ee4f6f-8082-4100-93a5-40a68db92477/project/1b792482-608f-4422-9c96-a3b22420bda5)

---

## 10. Screenshots


![alt text](image.png)

![alt text](image-1.png)

![alt text](image-2.png)

![alt text](image-3.png)

![alt text](image-4.png)

![alt text](image-5.png)

![alt text](image-6.png)

![alt text](image-7.png)

![alt text](image-8.png)

![alt text](image-9.png)

![alt text](image-10.png)

![alt text](image-11.png)

![alt text](image-12.png)

![alt text](image-13.png)

![alt text](image-14.png)



**Design Reference:** [Figma Design](https://www.figma.com/design/Vamwe21bV0AiM5MHPnyMqK/RefinedTech?node-id=0-1&t=9MeQwzWboM1RyzeW-1)

---

## 11. Limitations / Known Issues

- **Payment Integration**: Full payment gateway integration pending (currently using transaction logging)
- **Real-time Notifications**: WebSocket implementation for live notifications not yet implemented
- **Mobile App**: Currently web-based only, mobile app development planned for future
- **Advanced AI Features**: Enhanced machine learning recommendations system under development
- **Internationalization**: Multi-language support framework in place but translations pending
- **Performance Optimization**: Image optimization and caching strategies need enhancement for production scale
- **Testing Coverage**: Comprehensive unit and integration tests need to be implemented
