# TrustGraph AI - Production-Ready MERN Application

A comprehensive full-stack job scam detection platform built with React, Node.js, Express, and MongoDB.

## 🎯 Project Overview

TrustGraph AI helps students and job seekers detect fake jobs, fake internships, and suspicious recruiters. The platform provides:

- **Job Scam Detection**: Analyze job descriptions, emails, and messages for scam patterns
- **Recruiter Verification**: Verify recruiter credentials and check community reports
- **Offer Letter Analysis**: Upload and analyze offer letters for red flags
- **Community Reporting**: Report and track suspicious opportunities
- **Admin Dashboard**: Comprehensive admin panel for managing users, reports, and recruiters

## 🏗️ Architecture

### Backend (Node.js + Express)
- RESTful API with full CRUD operations
- MongoDB database integration
- JWT authentication
- Mock service layer for AI integration
- Modular controller-service architecture

### Frontend (React + Tailwind)
- Modern cybersecurity-inspired UI
- Dark and light mode support (extensible)
- Protected routes with role-based access
- Responsive design for desktop, tablet, and mobile
- Smooth animations and loading states

### Database (MongoDB)
Models:
- **User**: Authentication and profile management
- **Analysis**: Job scam detection results
- **Recruiter**: Recruiter information and verification status
- **Company**: Company details and verification
- **CommunityReport**: User-submitted scam reports
- **OfferLetter**: Offer letter analysis results

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local or Atlas)

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your MongoDB URI and JWT secret:
   ```
   MONGODB_URI=mongodb://localhost:27017/trustgraph-ai
   PORT=5000
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRE=7d
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Application runs on `http://localhost:3000`

## 📁 Project Structure

```
trustgraph-ai/
├── server/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Auth and error handling
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Mock AI services
│   │   ├── utils/            # Helper functions
│   │   └── index.js          # Entry point
│   ├── package.json
│   └── .env.example
│
├── client/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   ├── context/          # React context
│   │   ├── hooks/            # Custom hooks
│   │   ├── styles/           # Global styles
│   │   ├── App.jsx           # Main component
│   │   └── index.jsx         # Entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login to account
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Analysis
- `POST /api/analysis` - Create job scam analysis
- `GET /api/analysis` - Get user's analyses
- `GET /api/analysis/:id` - Get specific analysis
- `PUT /api/analysis/:id/save` - Save analysis
- `DELETE /api/analysis/:id` - Delete analysis

### Recruiters
- `POST /api/recruiters/verify` - Verify recruiter
- `GET /api/recruiters` - Get all recruiters
- `GET /api/recruiters/:id` - Get recruiter details

### Reports
- `POST /api/reports` - Create scam report
- `GET /api/reports` - Get all reports (paginated)
- `GET /api/reports/:id` - Get report details
- `GET /api/reports/user/my-reports` - Get user's reports
- `PUT /api/reports/:id/verify` - Verify report

### Offer Letters
- `POST /api/offer-letters` - Analyze offer letter
- `GET /api/offer-letters` - Get user's analyzed letters
- `GET /api/offer-letters/:id` - Get letter details

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/reports` - Manage reports
- `PUT /api/admin/reports/:id` - Update report status
- `GET /api/admin/recruiters` - Manage recruiters

## 🎨 UI Features

### Landing Page
- Hero section with CTAs
- How it works guide
- Feature highlights
- Statistics
- Testimonials
- FAQ section

### Authentication
- Register form with profile fields
- Login form
- Forgot password flow (UI ready)
- Protected routes
- Session management

### Main Features
1. **Job Scam Detection**
   - Multiple content sources (job posting, email, message)
   - Risk scoring (0-100%)
   - Red flag identification
   - Recommendations

2. **Recruiter Verification**
   - Email domain validation
   - Community report tracking
   - Verification scoring
   - Risk assessment

3. **Offer Letter Analysis**
   - Drag-and-drop upload
   - Document preview
   - Missing information detection
   - Suspicious clause highlighting
   - Signature validation

4. **Community Reporting**
   - Multiple report types
   - Evidence attachment
   - Search and filters
   - Pagination
   - Verification system

### User Dashboard
- Analytics cards
- Recent activity feed
- Profile completion indicator
- Quick action buttons

### Admin Panel
- System statistics
- User management
- Report management with status updates
- Recruiter monitoring

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected API endpoints
- Role-based access control (RBAC)
- CORS configuration
- Input validation
- Environment variables for sensitive data

## 🤖 Mock AI Services

Currently using placeholder services that return mock data:

- `scamAnalysisService.js` - Simulates job scam detection
- `recruiterVerificationService.js` - Simulates recruiter verification
- `documentAnalysisService.js` - Simulates offer letter analysis

**These are designed to be easily replaced with actual AI services** (e.g., Sarvam AI) without changing the API contracts.

## 📦 Dependencies

### Backend
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - CORS middleware
- `express-validator` - Input validation

### Frontend
- `react` - UI library
- `react-router-dom` - Client-side routing
- `axios` - HTTP client
- `tailwindcss` - Utility CSS framework
- `lucide-react` - Icon library
- `recharts` - Charting library (optional)

## 🎯 Current Phase: Foundation

This is Phase 1 of the project:
- ✅ Complete frontend UI
- ✅ Complete backend API
- ✅ Database models
- ✅ Mock service layer
- ✅ Authentication system
- ✅ Protected routes
- ✅ Admin panel

Next phases will include:
- Actual AI integration
- Real-time notifications
- Advanced analytics
- Mobile app
- Webhooks and integrations

## 🧪 Testing the Application

### Test Account
```
Email: test@example.com
Password: test123
Role: student
```

### Quick Test Flow
1. Register a new account
2. Go to Analyze page and paste sample job description
3. View mock analysis results
4. Verify a recruiter
5. Submit a community report
6. Upload offer letter
7. View dashboard with recent activity

## 🔧 Configuration

### Tailwind CSS
Custom colors and utilities configured in `client/tailwind.config.js`

### Vite Configuration
Proxy setup for API requests in `client/vite.config.js`

## 📝 Environment Variables

### Server (.env)
```
MONGODB_URI=mongodb://localhost:27017/trustgraph-ai
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Client (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🚀 Deployment

### Backend Deployment (Heroku, Railway, etc.)
1. Set environment variables on platform
2. Deploy from git repository
3. Database connection handled via MONGODB_URI

### Frontend Deployment (Vercel, Netlify, etc.)
1. Build: `npm run build`
2. Output in `dist/` directory
3. Deploy static files

## 📱 Responsive Design

- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🎓 Learning Resources

This project demonstrates:
- MERN stack development
- RESTful API design
- Authentication and authorization
- Component-based UI architecture
- State management with Context API
- Form handling and validation
- Responsive design with Tailwind CSS
- Database schema design
- Error handling and loading states

## 📄 License

MIT

## 🤝 Contributing

This is a foundation project designed to be extended with actual AI services and features.

## 📧 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for a safer job search experience**
