# RaftLabs — Order Management System

A food delivery order management feature built as a full-stack application.

## Project Structure

\`\`\`
raftlabs-order-management/
├── backend/      → Node.js + Express REST API
├── frontend/     → React + Vite SPA
└── README.md
\`\`\`

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS      |
| Backend   | Node.js, Express 5                |
| Database  | PostgreSQL (Neon), Prisma ORM     |
| Real-time | Server-Sent Events (SSE)          |
| Testing   | Jest, Supertest, React Testing Library |
| Deploy    | Vercel (frontend), Railway (backend) |

## Quick Start

\`\`\`bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
\`\`\`

## Live Demo

- Frontend: [deployed-url]
- API Base: [api-url]/api
\`\`\`

### 0.4 Initial Commit

```bash
git add .
git commit -m "chore: initialize project with root gitignore and readme"
```

---

## PHASE 1 — Backend Setup

### 1.1 Initialize Node.js Project

```bash
mkdir backend
cd backend
npm init -y
```

### 1.2 Install Dependencies

```bash
# Core
npm install express cors helmet dotenv

# Database
npm install @prisma/client
npm install -D prisma

# Validation
npm install zod

# Testing
npm install -D jest supertest

# Dev tools
npm install -D nodemon
```

### 1.3 Update `backend/package.json`

```json
{
  "name": "raftlabs-backend",
  "version": "1.0.0",
  "description": "RaftLabs Order Management API",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "jest --runInBand --forceExit",
    "test:watch": "jest --watch",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "node prisma/seed.js",
    "db:studio": "prisma studio"
  },
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/__tests__/**/*.test.js"]
  }
}
```

### 1.4 Create Backend Folder Structure

```bash
mkdir -p src/controllers src/models src/routes src/helpers src/middleware src/validations src/utils
mkdir -p __tests__ prisma
```

Final structure: