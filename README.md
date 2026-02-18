# E-Ticketing System

A modern, full-stack web-based e-ticketing system for booking, managing, and issuing digital tickets. Built using **React** with **Vite** for the frontend, **Node.js** with **Express** for the backend, and **PostgreSQL** as the database.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **User Management**
  - User registration and authentication
  - JWT-based secure authentication with 24-hour token expiration
  - Role-based access control (User/Admin)
  
- **Event Management**
  - Browse events and available tickets
  - Real-time ticket availability updates via Socket.IO
  - Event search and filtering
  
- **Booking System**
  - Book and purchase tickets
  - Generate QR code digital tickets
  - View booking history
  - Real-time booking notifications
  
- **Admin Features**
  - Event creation and management
  - Ticket inventory management
  - Activity logs and analytics
  - User management dashboard
  
- **Security**
  - Input validation on all endpoints
  - Password hashing with bcrypt
  - JWT authentication
  - CORS protection
  - SQL injection prevention

## 🛠️ Tech Stack

### Frontend
- **React 19.1** - UI framework
- **Vite 6.3** - Build tool and dev server
- **React Router 7.6** - Client-side routing
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Axios 1.10** - HTTP client
- **Socket.IO Client 4.8** - Real-time communication
- **QRCode.react 4.2** - QR code generation
- **Recharts 3.7** - Data visualization
- **React Quill 2.0** - Rich text editor
- **date-fns 4.1** - Date utilities
- **Sonner 2.0** - Toast notifications
- **Lucide React 0.563** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express 5.1** - Web framework
- **PostgreSQL (pg 8.16)** - Database client
- **JWT (jsonwebtoken 9.0)** - Authentication
- **bcrypt 6.0** - Password hashing
- **Socket.IO 4.8** - Real-time communication
- **CORS 2.8** - Cross-origin resource sharing
- **dotenv 16.5** - Environment configuration

### Database
- **PostgreSQL** - Relational database

## 📁 Project Structure

```
e-ticketing/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── assets/        # Images, fonts, etc.
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API services
│   │   ├── App.jsx        # Main App component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── index.html
│   ├── vite.config.js     # Vite configuration
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── controllers/       # Route controllers
│   ├── database/         # Database connection and schema
│   │   ├── db.js         # PostgreSQL connection pool
│   │   └── db.sql        # Database schema
│   ├── middleware/       # Express middleware (auth, etc.)
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions (validation, etc.)
│   ├── app.js           # Express app setup
│   ├── .env             # Environment variables
│   └── package.json
│
├── .gitignore
└── README.md
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/downloads)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/tina-codertz/e-ticketing.git
cd e-ticketing
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Install Client Dependencies

```bash
cd client
npm install
cd ..
```

### 4. Install Server Dependencies

```bash
cd server
npm install
cd ..
```

## ⚙️ Configuration

### Server Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
PORT=3000
CLIENT_URL=http://localhost:5173

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=ticketing_db
DB_PASSWORD=your_database_password
DB_PORT=5432
```

**Note:** Generate a secure JWT secret using:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Client Configuration

The client is configured to connect to `http://localhost:3000` by default. If you change the server port, update the API base URL in your client code.

## 🗄️ Database Setup

### 1. Create the Database

Connect to PostgreSQL and create the database:

```bash
psql -U postgres
```

```sql
CREATE DATABASE ticketing_db;
\q
```

### 2. Run the Schema

Execute the database schema to create tables:

```bash
psql -U postgres -d ticketing_db -f server/database/db.sql
```

The schema creates the following tables:
- `users` - User accounts and authentication
- `events` - Event information and ticket inventory
- `bookings` - Ticket bookings and transactions
- `activity_logs` - System activity tracking

## 🏃 Running the Application

### Development Mode

#### Option 1: Run Both Client and Server Separately

**Terminal 1 - Start the Backend Server:**
```bash
cd server
npm run dev
# Server will run on http://localhost:3000
```

**Terminal 2 - Start the Frontend Client:**
```bash
cd client
npm run dev
# Client will run on http://localhost:5173
```

#### Option 2: Using a Process Manager (Optional)

You can use tools like `concurrently` or `pm2` to run both servers simultaneously.

### Production Mode

#### Build the Client

```bash
cd client
npm run build
```

The build output will be in `client/dist/`.

#### Start the Server

```bash
cd server
npm start
```

For production deployment, consider using:
- **PM2** for process management
- **Nginx** as a reverse proxy
- **SSL/TLS** certificates for HTTPS

## 📡 API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get user bookings (authenticated)

### Admin (Requires Admin Role)
- `POST /api/admin/events` - Create a new event
- `PUT /api/admin/events/:id` - Update an event
- `DELETE /api/admin/events/:id` - Delete an event
- `GET /api/admin/logs` - View activity logs

## 🧪 Testing

Run linting:

```bash
# Client
cd client
npm run lint

# Server (requires ESLint setup)
cd server
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow ESLint rules configured in the project
- Use ES6+ modules (import/export)
- Include `.js` extensions in import statements
- Use meaningful variable and function names
- Add comments for complex logic

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- **tina-codertz** - [GitHub Profile](https://github.com/tina-codertz)

## 🙏 Acknowledgments

- React and Vite teams for excellent developer tools
- PostgreSQL community for robust database system
- All open-source contributors whose libraries made this project possible

---

**Note:** This is a learning project. For production use, ensure proper security measures, environment configurations, and testing are in place.


