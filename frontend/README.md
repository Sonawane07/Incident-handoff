# Incident Handoff - Frontend

A modern incident management platform built with React, TypeScript, and Tailwind CSS.

## Features

- **Incident Management**: Create, track, and resolve incidents with a clear status workflow
- **Timeline Tracking**: Chronological event logging with manual, webhook, and AI-generated events
- **File Attachments**: Upload screenshots, logs, and relevant files
- **Comments**: Team collaboration through threaded discussions
- **AI-Powered Summaries**: Generate incident summaries with actionable next steps
- **Real-time Updates**: Live updates via Server-Sent Events (SSE)
- **Webhook Integration**: Receive alerts from PagerDuty, Sentry, and custom sources
- **Beautiful UI**: Warm, calming design system based on "The Serene Sentinel" theme

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling with custom design tokens
- **TanStack Query** for server state management
- **React Router** for navigation
- **Supabase** for authentication
- **Axios** for API requests
- **date-fns** for date formatting

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend README)
- Supabase project configured

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000/api
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, etc.)
│   ├── layout/         # Layout components (Sidebar, Header)
│   └── incident/       # Incident-specific components (tabs)
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── contexts/           # React contexts (Auth)
├── lib/                # Third-party library configurations
├── config/             # App configuration
├── types/              # TypeScript type definitions
└── App.tsx             # Main app component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Design System

The app uses a custom design system called "The Serene Sentinel" with:

- **Colors**: Warm amber, terracotta, and sand tones
- **Typography**: Manrope (headlines) + Inter (body/labels)
- **Spacing**: Generous whitespace for clarity
- **Elevation**: Tonal layering instead of harsh shadows
- **Roundness**: 8px border radius for softness

## Key Features

### Authentication
- Email/password authentication via Supabase
- Protected routes with automatic redirects
- Session persistence

### Incident Workspace
- Tabbed interface: Timeline, Attachments, Comments, AI Summary
- Status transitions with validation
- Real-time updates via SSE
- Role-based access control

### AI Summary
- Generate summaries from incident evidence
- Edit and approve AI-generated content
- Version history tracking
- Structured output with next steps

### Notifications
- In-app notification center
- Unread badge in header
- Mark as read functionality
- Links to related incidents

## Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Keep components small and focused
4. Write meaningful commit messages
5. Test your changes thoroughly

## License

MIT
