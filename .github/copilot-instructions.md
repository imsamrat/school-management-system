# School Management System - Copilot Instructions

This is a Full Stack School Management System built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Project Structure

- **Frontend**: Next.js 14 with App Router, TypeScript
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with role-based access
- **UI**: TailwindCSS + shadcn/ui components
- **Roles**: Admin, Staff, Teacher, Student

## Architecture Guidelines

- Use clean architecture with separation of concerns
- Implement role-based access control for all routes
- Follow TypeScript best practices with proper type definitions
- Use Prisma for type-safe database operations
- Implement reusable UI components with shadcn/ui

## Development Guidelines

- All API routes should include proper authentication and role checks
- Use middleware for route protection based on user roles
- Implement proper error handling and validation
- Follow Next.js App Router conventions
- Use server components where possible for better performance

## Folder Structure

```
/app
  /admin       - Admin dashboard and management pages
  /staff       - Staff-specific functionality
  /teacher     - Teacher dashboard and tools
  /student     - Student portal and views
  /api         - API routes for backend functionality
  /auth        - Authentication pages
/prisma        - Database schema and migrations
/components    - Reusable UI components
  /ui          - shadcn/ui components
/lib           - Utility functions and configurations
/middleware.ts - Route protection middleware
```

## Current Stage: MVP Implementation

Focus on core functionality first:

1. Authentication with role-based access
2. Basic dashboards for each role
3. Student management (CRUD operations)
4. Class and subject management
5. Basic attendance system
