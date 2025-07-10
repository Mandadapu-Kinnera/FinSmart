# Financial Management App (FinSmart)

## Overview

FinSmart is a comprehensive financial management web application built with a modern full-stack architecture. It provides users with tools to track transactions, manage budgets, monitor bills and subscriptions, set financial goals, and get AI-powered financial insights.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with custom theme support via shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: PostgreSQL-based session store with fallback to memory store
- **Password Security**: Node.js crypto module with scrypt hashing

### Database Layer
- **Database**: PostgreSQL (configured for production deployment)
- **ORM**: Drizzle ORM with type-safe queries
- **Connection**: Node.js postgres driver with connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema management

## Key Components

### Authentication System
- Session-based authentication with secure password hashing
- User registration and login with validation
- Protected routes with authentication middleware
- Session persistence with configurable expiration

### Financial Data Management
- **Transactions**: Income/expense tracking with categorization
- **Categories**: Pre-defined spending categories with icons and colors
- **Budgets**: Monthly/weekly/yearly budget planning with progress tracking
- **Bills**: Recurring payment management with due date alerts
- **Subscriptions**: Subscription service tracking with cost analysis
- **Goals**: Savings goal setting with progress monitoring

### User Interface
- Responsive design with mobile-first approach
- Dark/light theme support with system preference detection
- Real-time notifications for bill payments and budget alerts
- Interactive charts and analytics dashboards
- Form validation with user-friendly error messages

### AI Features
- Financial chatbot for user assistance
- Currency conversion (USD to INR)
- Spending analytics and recommendations
- Budget optimization suggestions

## Data Flow

1. **User Authentication**: Users register/login → Session established → Protected routes accessible
2. **Data Entry**: User creates transactions/budgets/bills → Validated on client → Sent to API → Stored in database
3. **Data Retrieval**: React Query fetches data → Cached for performance → Displayed in UI components
4. **Real-time Updates**: Bill due dates checked → Notifications generated → Toast alerts displayed
5. **Analytics**: Transaction data processed → Charts generated → Insights provided

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Hook Form)
- UI components (@radix-ui/react-* components)
- Data visualization (recharts)
- Date utilities (date-fns)
- Form validation (zod, @hookform/resolvers)
- HTTP client (native fetch with TanStack Query)

### Backend Dependencies
- Express.js framework
- Authentication (passport, passport-local)
- Database (drizzle-orm, @neondatabase/serverless, pg)
- Session management (express-session, connect-pg-simple)
- Validation (drizzle-zod)

### Development Dependencies
- Build tools (vite, esbuild, tsx)
- Type checking (typescript)
- CSS processing (tailwindcss, postcss, autoprefixer)

## Deployment Strategy

### Production Build
- Frontend: Vite builds optimized static assets to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Database: Drizzle migrations applied via `db:push` script

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Session security via `SESSION_SECRET` environment variable
- SSL configuration for production PostgreSQL connections

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database (configured for Neon Database)
- Static file serving for frontend assets
- Environment variable support for configuration

### Development Workflow
- `npm run dev`: Starts development server with hot reload
- `npm run build`: Creates production build
- `npm run start`: Runs production server
- `npm run check`: Type checking
- `npm run db:push`: Database schema updates

The application is designed to be deployed on platforms like Replit, Heroku, or similar Node.js hosting services with PostgreSQL database support.