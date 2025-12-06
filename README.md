# AuthLogin

A full-stack authentication system using FastAPI and React. Handles user registration, login/logout, password hashing, and JWT-based sessions with refresh tokens.

[![Python](https://img.shields.io/badge/python-3.8+-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.123.10-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- User registration with email validation
- Login/logout with password hashing
- JWT sessions with refresh tokens
- Protected routes
- CORS-enabled API
- Dark-themed UI with Tailwind CSS
- Form validation and error handling

## Tech Stack

### Backend
- **FastAPI** - Web framework for building APIs with Python
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite** - Lightweight database (configurable for PostgreSQL/MySQL)
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation using Python type annotations

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Frontend build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Radix UI** - Accessible UI components
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/ibarrajavi/AuthLogin.git
cd AuthLogin
```

2. Set up the backend
```bash
# Create and activate virtual environment
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

3. Set up the frontend
```bash
cd frontend
npm install
cd ..
```

4. Install root dependencies
```bash
npm install
```

### Running the Application

#### Development Mode (Both Frontend & Backend)
```bash
npm run dev
```

This will start:
- Backend API on `http://localhost:8000`
- Frontend on `http://localhost:5173`

#### Run Separately

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## License

MIT