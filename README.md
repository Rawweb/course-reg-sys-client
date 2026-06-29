# Course Registration System

A web-based Course Registration System built for the Departments of Computer Science, Mathematics, and Physics under the Faculty of Physical Sciences, Nnamdi Azikiwe University, Awka. This is a BSc final year project that automates course registration, prerequisite validation, unit load monitoring, and the registration approval workflow between students, lecturers, and admin.

## Table of Contents

- [Project Objectives](#project-objectives)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Seeding the Database](#seeding-the-database)
- [Environment Variables](#environment-variables)
- [User Roles](#user-roles)
- [API Overview](#api-overview)
- [Known Limitations / Out of Scope](#known-limitations--out-of-scope)
- [Author](#author)

## Project Objectives

- Allow students to register courses based on their current level and semester
- Automatically validate course prerequisites before allowing registration
- Monitor and enforce unit load limits (minimum/maximum credit units per semester)
- Support carryover course registration for previously failed or unregistered courses
- Provide a registration approval workflow: **pending → submitted → approved/rejected**
- Allow lecturers (level advisers) to review and approve/reject student registrations
- Allow admin to manage departments, courses, users, results, and student promotion

## Tech Stack

**Backend**
- Node.js + Express.js (ES Modules)
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

**Frontend**
- React + Vite
- Tailwind CSS v4
- React Query (TanStack Query)
- React Router DOM
- React Hook Form + Zod
- Axios
- React Hot Toast
- Framer Motion

## Features

| Role | Capabilities |
|---|---|
| **Student** | Register courses, view available courses (current level/semester + carryover), submit registration for approval, view registration status, view personal results |
| **Lecturer** | View submitted registrations, approve or reject student registrations with comments |
| **Admin** | Manage departments and courses, manage users (activate/deactivate accounts), enter and bulk-enter results, promote students (single or bulk) |

### Core Logic Highlights

- **Prerequisite validation** — a student cannot register a course unless they have a passing result for all of its prerequisites
- **Compound unique indexing** — course codes are unique per department (the same code, e.g. `MTH 101`, can exist independently across Computer Science, Mathematics, and Physics)
- **Carryover detection** — courses from levels below the student's current level that have not been passed are automatically surfaced for registration
- **Unit load enforcement** — registrations are validated against department-defined minimum and maximum credit unit limits, with a special exception for 400 level second semester (Teaching Practice / SIWES)
- **Role-based access control** — students, lecturers, and admins each have distinct permissions enforced at the route level

## Project Structure

```
course-registration-system/
├── client/                  # React frontend
│   └── src/
│       ├── api/             # Axios instance + API call functions
│       ├── assets/
│       ├── components/
│       │   ├── layouts/     # Role-specific layouts (sidebar + header)
│       │   └── router/      # Route guards (Public, Protected, Role-based)
│       ├── context/         # AuthContext
│       └── pages/
│           ├── auth/        # Login, Register
│           ├── student/
│           ├── lecturer/
│           ├── admin/
│           └── home/
│
└── server/                  # Express backend
    ├── config/               # Database connection
    ├── controllers/          # Business logic
    ├── middleware/           # Auth guards, error handler
    ├── models/                # Mongoose schemas
    ├── routes/               # Express route definitions
    ├── seed/                 # Database seed scripts and data
    ├── utils/                # JWT helper, etc.
    └── server.js              # Entry point
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (LTS version)
- [MongoDB Atlas](https://cloud.mongodb.com) account (or local MongoDB)
- A code editor (e.g. VS Code)

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside `server/` (see [Environment Variables](#environment-variables)).

Run the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file inside `client/` (see [Environment Variables](#environment-variables)).

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Seeding the Database

Seed departments first, then courses:

```bash
cd server
node seed/seedDepartments.js
node seed/seedCourses.js
```

This populates the database with the Computer Science, Mathematics, and Physics departments and their full course lists (including university-wide GST/EDU/ENT courses) across all five years, both semesters.

## Environment Variables

**`server/.env`**

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**`client/.env`**

```
VITE_API_URL=http://localhost:5000/api
```

> `.env` files are excluded from version control via `.gitignore` and must be created manually in each environment.

## User Roles

| Role | Description |
|---|---|
| `student` | Registers automatically on sign-up. Account is active immediately. |
| `lecturer` | Registers via sign-up but account starts **inactive** and must be activated by an admin before login is possible. |
| `admin` | Created directly (not via public registration) and manages the entire system. |

## API Overview

| Resource | Base Route |
|---|---|
| Authentication | `/api/auth` |
| Departments | `/api/departments` |
| Courses | `/api/courses` |
| Registrations | `/api/registrations` |
| Results | `/api/results` |
| Users | `/api/users` |

All protected routes require a `Bearer <token>` in the `Authorization` header, obtained from `/api/auth/login` or `/api/auth/register`.

## Known Limitations / Out of Scope

- Result correction/editing is intentionally **not supported** — once a result is submitted, it cannot be edited. The frontend displays a confirmation warning before submission to compensate for this.
- Graduation handling (what happens after 500 level, second semester) is out of scope.
- Automatic, results-based student promotion is out of scope — promotion is an explicit admin-triggered action (single or bulk), not automatically computed from academic performance.
- Fee payment integration is not part of this system.

## License

This project is for academic and portfolio purposes.