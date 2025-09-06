# No-Broker Kathmandu

A comprehensive property rental platform for Kathmandu, Nepal, connecting tenants and property owners without intermediaries.

## 🚀 Features

### For Tenants
- Browse available properties with advanced search and filtering
- Schedule property visits
- Manage visit history and feedback
- User profile management with KYC verification
- Real-time notifications

### For Property Owners
- Create and manage property listings
- Upload property images
- Handle visit requests
- Track property performance
- Manage tenant agreements

### Core Features
- **Authentication & Authorization**: Secure login/registration with role-based access
- **Property Listings**: Comprehensive property management with search and filters
- **Visit Management**: Schedule, track, and manage property visits
- **KYC Verification**: Built-in identity verification system
- **Responsive Design**: Mobile-friendly interface
- **Network Access**: Accessible from any device on your network

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication
- **Multer** for file uploads
- **CORS** enabled for network access

### Frontend
- **React** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd no-broker-kathmandu
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Database Setup
- Create a PostgreSQL database
- Update the database configuration in `backend/.env`
- Run the database schema: `database/schema.sql`

### 4. Environment Variables
Create `backend/.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=no_broker_kathmandu
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
BCRYPT_ROUNDS=10
FRONTEND_URL=http://localhost:3000
```

### 5. Frontend Setup
```bash
cd frontend
npm install
```

### 6. Start the Application

#### Development Mode
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

#### Production Mode
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm start
```

## 🌐 Network Access

The application is configured to be accessible from other devices on your network:

### Backend API
- **Local**: http://localhost:5000
- **Network**: http://YOUR_IP:5000

### Frontend App
- **Local**: http://localhost:3000
- **Network**: http://YOUR_IP:3000

### Get Your Network IP
Run the provided script:
```bash
get-network-info.bat
```

## 📱 Usage

### For Tenants
1. **Register/Login**: Create an account or sign in
2. **Browse Properties**: Use search and filters to find properties
3. **Schedule Visits**: Book property visits with owners
4. **Manage Profile**: Update personal information and KYC status

### For Property Owners
1. **Register/Login**: Create an owner account
2. **Create Listings**: Add property details and upload images
3. **Manage Visits**: Handle tenant visit requests
4. **Track Performance**: Monitor listing views and inquiries

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Listings
- `GET /api/listings` - Get all listings
- `POST /api/listings` - Create new listing
- `GET /api/listings/:id` - Get listing by ID
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Visits
- `GET /api/visits` - Get user visits
- `POST /api/visits` - Schedule visit
- `PUT /api/visits/:id` - Update visit status
- `DELETE /api/visits/:id` - Cancel visit

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. **Database Connection Error**
   - Check PostgreSQL service is running
   - Verify database credentials in `.env`
   - Ensure database exists

3. **CORS Errors**
   - Check CORS configuration in `server.js`
   - Verify frontend URL in environment variables

4. **Network Access Issues**
   - Check Windows Firewall settings
   - Ensure both backend and frontend are running
   - Verify IP address is correct

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Payment integration
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Video tours
- [ ] AI-powered recommendations

---

**No-Broker Kathmandu** - Making property rental simple and transparent in Kathmandu Valley.
