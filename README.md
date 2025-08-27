# University Application Tracker

A comprehensive university application management system built with Next.js + TypeScript. Students can manage applications and deadlines, while parents have read-only dashboards with notes and financial insights.


## Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd university-app-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.sample .env.local
   ```
   Edit `.env.local` and add your configuration values.

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Development Guidelines

### Adding New Pages
Create new folders and `page.tsx` files in the `app/` directory.

### Adding New Components
Create new component files in the `components/` directory.

### Styling Guidelines
Use Tailwind CSS classes for styling. Custom styles can be defined in `app/globals.css`.
