# Overview

PyToApk is a web-based development platform that converts Python applications into Android APK files. The application provides a complete IDE experience with project management, code editing, file upload capabilities, and an automated build system. Users can create projects, manage Python files, configure app settings, and build Android applications directly from their browser.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI primitives with shadcn/ui components for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Server Framework**: Express.js with TypeScript for REST API endpoints
- **Development Server**: Vite integration for hot module replacement and development tooling
- **File Handling**: Multer middleware for file uploads with validation for Python files and ZIP archives
- **API Design**: RESTful endpoints for projects, files, and build management
- **Error Handling**: Centralized error middleware with structured error responses

## Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL for cloud-native scaling
- **Schema**: Structured tables for projects, project files, and build logs with UUID primary keys
- **Migrations**: Drizzle Kit for database schema management and version control
- **Storage Strategy**: In-memory fallback implementation for development with interface abstraction

## Authentication & Sessions
- **Session Management**: Connect-pg-simple for PostgreSQL-backed session storage
- **Session Security**: Secure session configuration with proper cookie settings
- **Development Support**: Replit-specific authentication patterns and development banner integration

## Build System
- **Process Tracking**: Multi-stage build process with progress monitoring (validation, dependency analysis, APK compilation, code signing)
- **Status Management**: Real-time build status updates with error logging and progress indicators
- **File Validation**: Python file type checking and size limits for security
- **Build Logs**: Persistent logging system for debugging build failures

## External Dependencies
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Replit Platform**: Development environment integration with cartographer for debugging
- **File Processing**: Support for Python (.py, .pyw) files and ZIP archive uploads
- **Build Tools**: Android SDK integration for APK generation and code signing
- **Development Tools**: Vite plugin ecosystem for enhanced development experience