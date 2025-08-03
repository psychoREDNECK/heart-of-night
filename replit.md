# Overview

**Heart of Night** is a hacker-themed Python-to-APK weaponization platform that converts Python applications into Android APK files. This cybersecurity-focused development environment provides a complete IDE experience with project management, code editing, multi-format file upload capabilities, and an automated build system. Users can create projects, manage Python files along with assets, configuration files, documentation, and other project resources, configure app settings, and build Android applications directly from their browser. The interface features a Matrix-inspired dark theme with terminal aesthetics, neon green accents, and hacker-style terminology throughout the application.

## Recent Changes (August 2025)
- Enhanced file upload system to support multiple file types beyond Python (.py, .pyw)
- Added support for archives (.zip, .tar, .gz), documentation (.txt, .md, .rst), config files (.json, .xml, .yml, .yaml), web assets (.js, .html, .css), images, audio, video, documents, and data files
- Improved file type detection with color-coded icons in file manager
- Increased file upload limit to 50MB to accommodate media files
- Enhanced binary file handling with appropriate content storage for non-text files
- Updated UI to reflect multi-format file support capabilities
- **Android App Creation**: Converted web application to native Android app using Capacitor
- **Mobile-Optimized UI**: Responsive design that adapts to mobile devices with touch-friendly interactions
- **Native Mobile Features**: File system access, native sharing, device storage integration, and splash screen
- **Cross-Platform Support**: Single codebase runs on web browsers and Android devices
- **Hacker Theme Transformation**: Complete UI overhaul to "Heart of Night" with cyberpunk aesthetics
- **Terminal Interface**: Matrix-inspired design with neon green colors, monospace fonts, and hacker terminology
- **Advanced Visual Effects**: Glitch text animations, scanline effects, matrix grid backgrounds, and neon glows
- **AI Assistant Integration**: Added comprehensive AI assistant with multiple provider support
- **Multi-AI Support**: Integrated Mistral (uncensored), LLaMA Maverick 4, Ollama (local), Together AI, OpenAI, Anthropic, and custom endpoints
- **Image Generation**: Added DALL-E 3 image generation capability with cyberpunk-themed interface
- **Code Analysis**: Real-time code analysis and vulnerability assessment for Python and APK development
- **Chat Interface**: Secure chat functionality with hacker-themed responses and cybersecurity focus
- **AI Code Editor**: Revolutionary AI-powered code modification system that can read, edit, and create files directly in the project
- **Autonomous Development**: AI can analyze entire project structure, understand context, and make targeted code changes based on natural language instructions
- **Real-time File Modification**: AI can edit existing files, create new components, and maintain code quality automatically

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
- **File Handling**: Multer middleware for file uploads with validation for multiple file types including Python files, archives, config files, media assets, and documents
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
- **File Validation**: Multi-format file type checking (Python, archives, config, media, documents) with size limits for security
- **Build Logs**: Persistent logging system for debugging build failures
- **Asset Management**: Support for binary files, images, audio, video, and other project assets in APK generation

## External Dependencies
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Replit Platform**: Development environment integration with cartographer for debugging
- **File Processing**: Support for Python (.py, .pyw) files, archives (.zip, .tar, .gz), documentation (.txt, .md, .rst), config files (.json, .xml, .yml, .yaml), web assets (.js, .html, .css), images, audio, video, documents, and data files
- **Build Tools**: Android SDK integration for APK generation and code signing
- **Development Tools**: Vite plugin ecosystem for enhanced development experience
- **Mobile Framework**: Capacitor for web-to-native bridge with Android platform support
- **Native Plugins**: Filesystem, Camera, Device info, Network, Share, Status Bar, and Splash Screen capabilities