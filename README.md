# Exam Prep Tests
## SimbaWorks

ISC2 CC (Certified in Cybersecurity) exam preparation application with both web and Electron desktop versions.

## Features

- **Practice Tests**: 100 questions covering all ISC2 CC domains
- **Performance Analytics**: Track progress and identify weak areas
- **Instructor Dashboard**: Monitor student performance and provide feedback
- **Dual Mode Support**: Student and Instructor interfaces
- **Secure Exam Environment**: Kiosk mode for controlled testing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- PostgreSQL database (configured in `.env`)

### Installation

```bash
# Install dependencies
npm install

# Set up your database connection in .env file
# DATABASE_URL=your_postgresql_connection_string
```

### Running the Application

#### Web Version (Browser)
```bash
# Development server
npm run dev

# Production build
npm run build
npm run start
```

#### Desktop Version (Electron)

**Student Mode (Default):**
```bash
npm run electron
```

**Instructor Mode:**
```bash
# Cross-platform (recommended)
npm run electron:instructor

# Windows specific (alternative)
npm run electron:instructor:win
```

## Application Modes

### Student Mode
- Secure kiosk environment for taking exams
- Performance tracking and analytics
- Access to assigned exams and feedback
- Route blocking for instructor-only areas

### Instructor Mode
- Full window access (not kiosk mode)
- Student performance monitoring
- Exam assignment and management
- Feedback and assessment tools
- Access to all application areas

## Important Notes

- **Environment Variables**: Make sure to set `APP_MODE=instructor` when running in instructor mode
- **Database Setup**: Ensure your PostgreSQL database is properly configured
- **Security**: Student mode blocks access to instructor routes for exam integrity
- **Cross-Platform**: Use `npm run electron:instructor` for cross-platform compatibility

## Troubleshooting

If you see "APP_MODE not set, using default: 'student'" in the console, make sure you're using the correct npm script:

- ✅ `npm run electron:instructor` (for instructor mode)
- ❌ `npm run electron` (this runs in student mode)

## Development

```bash
# Install cross-env if not already installed
npm install cross-env --save-dev

# Run in development mode
npm run dev

# Build for production
npm run build
