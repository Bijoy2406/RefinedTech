# RefinedTech Backend

Laravel-based backend API for the RefinedTech e-commerce platform with AI-powered chatbot functionality.

## Features

- **RESTful API** for product management, user authentication, and orders
- **AI Chatbot** powered by Google Gemini API
- **Multi-user System** supporting Buyers, Sellers, and Admins
- **Image Upload** with Cloudinary integration
- **Database Support** for PostgreSQL and MySQL
- **Cart & Wishlist** management
- **Order Processing** system

## Requirements

- PHP 8.1 or higher
- Composer
- PostgreSQL or MySQL database
- Node.js (for asset compilation)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file with your settings:
   - Database credentials
   - Cloudinary API keys (for image uploads)
   - Gemini API key (for chatbot functionality)
   - Frontend URL

5. **Generate application key**
   ```bash
   php artisan key:generate
   ```

6. **Run database migrations**
   ```bash
   php artisan migrate
   ```

7. **Seed database (optional)**
   ```bash
   php artisan db:seed
   ```

8. **Start development server**
   ```bash
   php artisan serve
   ```

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product (Seller/Admin)
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product (Owner/Admin)
- `DELETE /api/products/{id}` - Delete product (Owner/Admin)

### Chatbot
- `POST /api/chatbot` - Send message to AI chatbot

### Cart & Wishlist
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/{id}` - Remove from cart
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add to wishlist

## Configuration

### Database
Configure your database connection in `.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=refinedtech
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

### Cloudinary (Image Upload)
Get credentials from [Cloudinary](https://cloudinary.com/):
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Gemini AI (Chatbot)
Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey):
```env
GEMINI_API_KEY=your_gemini_api_key
```

## Development

### Testing
Run tests with:
```bash
php artisan test
```

### Code Style
Follow PSR-12 coding standards. Format code with:
```bash
./vendor/bin/php-cs-fixer fix
```

### Debugging
Debug files and test scripts are excluded from version control. For debugging:
- Check `storage/logs/laravel.log` for application logs
- Use `php artisan tinker` for interactive debugging

## Production Deployment

1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false`
3. Configure proper database credentials
4. Run optimizations:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

## Security

- All API keys and sensitive data are in environment variables
- Authentication uses Laravel Sanctum
- Input validation and sanitization implemented
- CORS configured for frontend integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is proprietary software for RefinedTech.