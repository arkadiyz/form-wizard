# Form Wizard - Job Application System

A modern, multi-step form wizard built with Next.js (frontend) and .NET 8 (backend) for collecting job application data.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- .NET 8 SDK
- SQL Server (LocalDB or full instance)

### 1. Clone & Install

```bash
git clone <repository-url>
cd FormWizard

# Install client dependencies
cd client
npm install

# Restore server dependencies
cd ../server
dotnet restore
```

### 2. Database Setup

**Important:** A database backup (`form_wizard_db.bak`) is included in the project root. It's recommended to use this backup as it contains all necessary tables and sample data.

#### Option A: Restore from Backup (Recommended)

1. Open SQL Server Management Studio
2. Right-click "Databases" → "Restore Database"
3. Select "Device" → Browse to `form_wizard_db.bak`
4. Restore to database name: `FormWizardDB`

#### Option B: Create from Scripts

```bash
# Run the SQL scripts manually:
# 1. Database/CreateTables.sql
# 2. Database/BackupTables.sql (optional - sample data)
```

### 3. Configuration

Update connection string in `server/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=FormWizardDB;Trusted_Connection=true;"
  }
}
```

### 4. Run the Application

**Terminal 1 - Backend:**

```bash
cd server
dotnet run
# API will run on: https://localhost:5202
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
# App will run on: http://localhost:3000
```

## 🛠 Tech Stack

**Frontend:**

- Next.js 14 (App Router)
- TypeScript
- React Hook Form + Zod
- Zustand (state management)
- React Query (data fetching)
- CSS Modules

**Backend:**

- .NET 8 Web API
- Entity Framework Core
- SQL Server
- Dapper (for optimized queries)

## 📁 Project Structure

```
FormWizard/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── store/         # Zustand store
├── server/                # .NET 8 backend
│   ├── Controllers/       # API controllers
│   ├── Services/         # Business logic
│   ├── Models/           # DTOs and models
│   └── Database/         # SQL scripts
└── form_wizard_db.bak    # Database backup
```



## 📝 License

This project is for demonstration purposes.
