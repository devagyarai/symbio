# Symbio

![Symbio Banner](/placeholder-banner.png)

> **Symbio** is a multi-tenant, enterprise-grade project management SaaS platform designed for high-performance collaboration.

Symbio provides robust Role-Based Access Control (RBAC), real-time collaborative workspaces, comprehensive audit logging, and deeply integrated analytics dashboards. Built as a scalable turborepo, it strictly separates frontend UX from backend business logic.

---

## 🎯 Features

- **Multi-Tenant Architecture:** Complete data isolation between organizations and workspaces.
- **Enterprise RBAC:** Granular roles (Super Admin, Org Owner, Workspace Admin, Member, Guest).
- **Real-Time Collaboration:** Socket.IO integration for live presence and instant updates.
- **Audit Logging:** Immutably records critical actions across all entities.
- **File Management:** Cloudinary-backed secure file uploads.
- **Analytics Dashboard:** Live metrics, active session tracking, and storage utilization.
- **Secure Authentication:** JWT with HttpOnly Refresh Token rotation and Resend-backed email verification.

---

## 🏗️ Architecture & Tech Stack

Symbio is structured as a **Turborepo** monorepo containing tightly scoped packages and isolated applications.

### 🌐 Frontend (Web)
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand + React Query
- **Forms & Validation:** React Hook Form + Zod

### ⚙️ Backend (API)
- **Framework:** Node.js + Express
- **Language:** TypeScript
- **Real-Time:** Socket.IO
- **Validation:** Zod
- **Security:** Helmet, CORS, Express Rate Limit

### 🗄️ Database & Services
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Prisma
- **Storage:** Cloudinary
- **Emails:** Resend

---

## 📂 Folder Structure

```text
symbio/
├── apps/
│   ├── api/          # Node.js Express Backend
│   └── web/          # Next.js Frontend UI
├── packages/
│   ├── config/       # Shared environment configuration
│   ├── database/     # Prisma schema and generated client
│   ├── errors/       # Standardized AppErrors
│   ├── logger/       # Winston-based structured logging
│   ├── types/        # Shared TypeScript interfaces
│   ├── utils/        # Shared utility functions
│   └── validation/   # Zod schemas used across API and Web
├── docs/             # Technical & architectural documentation
├── turbo.json        # Turborepo build orchestration
└── package.json      # Monorepo dependencies
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v9+)
- A running PostgreSQL database (e.g. Neon or local Docker)

### 2. Installation
Clone the repository and install dependencies from the root:
```bash
git clone https://github.com/your-org/symbio.git
cd symbio
pnpm install
```

### 3. Environment Variables
Copy the example environment file and fill in your secrets.
```bash
cp .env.example .env
```
Ensure you have active credentials for **Cloudinary**, **Resend**, and a **PostgreSQL** instance.

### 4. Database Setup
Push the Prisma schema to your database:
```bash
pnpm --filter database prisma db push
```

### 5. Running Locally
Start the entire turborepo (both API and Web) in development mode:
```bash
pnpm dev
```
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend:** [http://localhost:4000](http://localhost:4000)

---

## 🧪 Running Tests

Symbio uses **Jest** and **Supertest** for comprehensive integration testing.
```bash
pnpm test
```
*Tests are located in `apps/api/src/tests/`.*

---

## 🚢 Deployment

Symbio is architected to be deployed across Vercel (Frontend) and Render/Railway (Backend).

Please refer to the complete **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** for detailed provisioning steps.

---

## 📖 Documentation

The `docs/` folder contains extensive architectural blueprints:
- [API Documentation](docs/API_DOCUMENTATION.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Project Walkthrough](PROJECT_WALKTHROUGH.md)
- [Demo Script](DEMO_SCRIPT.md)

---

## 📸 Screenshots

### Dashboard Overview
![Dashboard Placeholder](/placeholder-dashboard.png)

### Workspace Management
![Workspace Placeholder](/placeholder-workspace.png)

---

## 📄 License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🤝 Contributors
- **Symbio Engineering Team** - [GitHub Profile](https://github.com/your-org)
