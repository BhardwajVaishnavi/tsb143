# E-Commerce Admin Panel

A comprehensive admin panel for managing e-commerce operations, including warehouse management, inventory tracking, supplier management, and audit logging.

## Features

- **Dashboard**: Overview of key metrics and recent activities
- **Warehouse Management**: Track items in the warehouse
- **Inventory Management**: Monitor inventory levels and receive low stock alerts
- **Transfer System**: Move items from warehouse to inventory
- **Supplier Management**: Manage supplier information and relationships
- **Audit Dashboard**: Track all system activities for accountability

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL on NeonDB
- **ORM**: Prisma
- **Authentication**: JWT (planned)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database (or NeonDB account)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env` file:
   ```
   DATABASE_URL="postgresql://neondb_owner:npg_tJ74luxrsNSQ@ep-icy-forest-a4ouomqs-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Seed the database with initial data:
   ```bash
   npm run seed
   ```

### Running the Application

Start both frontend and backend concurrently:
```bash
npm run start
```

Or run them separately:
- Frontend only: `npm run dev`
- Backend only: `npm run dev:server`

## Project Structure

- `/src` - Frontend React application
  - `/components` - UI components organized by feature
  - `/api` - API client functions
  - `/lib` - Utility functions
  - `/hooks` - Custom React hooks
  - `/store` - State management
- `/prisma` - Database schema and migrations
- `server.ts` - Express backend server

## Database Schema

The application uses the following main entities:
- Users (Admins)
- Products
- Categories
- Suppliers
- Warehouse Items
- Inventory Items
- Transfers
- Audit Logs

## License

MIT
