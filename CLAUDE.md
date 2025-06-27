# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Environment Setup
```bash
# Start the local PostgreSQL database (requires Docker/Podman)
./start-database.sh

# Install dependencies
npm install
```

### Database Operations
```bash
# Generate Prisma client
npm run postinstall

# Create new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema changes without migration
npm run db:push

# Open Prisma Studio to view/edit data
npm run db:studio
```

### Development
```bash
# Start development server with fast refresh
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Preview production build
npm run preview
```

### Code Quality
```bash
# Run all checks (linting and type checking)
npm run check

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type check without emitting files
npm run typecheck

# Check formatting
npm run format:check

# Fix formatting
npm run format:write
```

## Architecture Overview

This project is built with the T3 Stack:

- **Next.js**: React framework with App Router
- **tRPC**: Type-safe API layer connecting frontend and backend
- **Prisma**: ORM for database access
- **NextAuth.js**: Authentication
- **TailwindCSS**: Utility-first CSS

### Key Directories

- `/src/app`: Next.js App Router pages and components
- `/src/server`: Server-side code
  - `/api`: tRPC router definitions and procedures
  - `/auth`: Authentication configuration
  - `/db.ts`: Prisma client instance
- `/src/trpc`: tRPC client setup
- `/prisma`: Database schema and migrations
- `/docs`: Project documentation

### Data Models

The project implements a community platform with these main entities:

1. **Users** (via NextAuth): Account credentials and profile
2. **Weavers**: Community members with location data
3. **Associations**: Community groups with geographic location
4. **Applications**: Users applying to join associations
5. **Events**: Scheduled gatherings for association members
6. **RSVPs**: Event attendance responses
7. **Checkins**: Event attendance records

### User Flows

1. **User Registration**: Register and create a Weaver profile
2. **Association Discovery**: Find nearby associations by location
3. **Association Application**: Apply to join specific associations
4. **Event Participation**: View, RSVP to, and attend events

### Authentication

The app uses NextAuth.js with Prisma adapter. Authentication is managed through the `/src/server/auth` directory, with route handlers in `/src/app/api/auth`.

### API Structure

- API routes are defined in `/src/server/api/routers/`
- The main router is in `/src/server/api/root.ts`
- Both public and protected procedures are available
- Client-side access is via `/src/trpc/react.tsx`

### Page Structure

The app follows the pages structure outlined in `/docs/pages.md`:
- Public user pages
- Association admin pages 
- Platform admin pages
- Shared legal pages

## Context7 Usage

When working in this codebase, use Context7 to access documentation for these key technologies:

### Create T3 App
- Use for questions about T3 Stack architecture and configuration
- Reference when setting up new routes or features following T3 patterns
- Example: `/vercel/create-t3-app`

### DaisyUI for Tailwind CSS
- Use when implementing UI components that follow Tailwind conventions
- Reference for theme customization and component styling
- Example: `/saadeghi/daisyui`

### Prisma
- Use for database schema modifications and queries
- Reference for complex database operations and migrations
- Example: `/prisma/prisma`

### NextAuth.js
- Use for authentication workflows and session management
- Reference when implementing protected routes or user permissions
- Example: `/nextauthjs/next-auth`