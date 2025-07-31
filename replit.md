# Overview

This is a full-stack web application for building and managing Work Breakdown Structures (WBS). It provides an interactive interface for creating, editing, and visualizing hierarchical project structures with features like drag-and-drop organization, context menus, and export capabilities.

The application is built as a modern web app with a React frontend and Express backend, featuring a clean UI built with shadcn/ui components and Tailwind CSS styling.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Form Handling**: React Hook Form for form state management

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with endpoints for WBS node CRUD operations
- **Data Layer**: In-memory storage with interface abstraction for future database integration
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot reload with Vite middleware integration

## Data Storage
- **Current**: In-memory storage with sample data initialization
- **ORM**: Drizzle ORM configured for PostgreSQL (ready for database integration)
- **Schema**: Hierarchical WBS node structure with parent-child relationships
- **Migration**: Drizzle Kit for database schema management

## Key Features
- **Hierarchical Tree View**: Nested WBS nodes with expand/collapse functionality
- **Interactive UI**: Context menus, drag-and-drop (prepared), and real-time updates
- **Export System**: Modal-based export with multiple format options
- **Responsive Design**: Mobile-friendly interface with responsive layouts
- **Form Management**: Sidebar-based editing with validation

## Development Setup
- **Build System**: Vite for fast development and optimized production builds
- **TypeScript**: Strict type checking across frontend, backend, and shared code
- **Path Aliases**: Clean imports with `@/` for client code and `@shared/` for shared types
- **Hot Reload**: Full-stack hot reload in development mode

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL database (configured but not yet integrated)
- **Connection**: Uses `@neondatabase/serverless` driver for database connectivity

## UI Components
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework for styling

## Development Tools
- **TanStack Query**: Server state management and data fetching
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL support

## Build and Development
- **Vite**: Build tool and development server
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Static type checking and compilation
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Potential Integrations
- **html2canvas**: For export functionality (dynamically imported)
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Replit Integration**: Development environment plugins and error handling