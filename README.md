# ❄️ TAAKRA - Competitions & Community Platform

**Live Website:** [https://zalnex.me/](https://zalnex.me/)

Transform competition discovery into a snowstorm of opportunities. Each competition is a unique snowflake waiting for you.

## 🌟 Overview

TAAKRA is a modern, full-stack platform that combines competition discovery, community engagement, and premium experiences. Built with Next.js, TypeScript, and a beautiful snow-themed UI, TAAKRA makes finding and participating in competitions a delightful experience.

### Key Features

- ❄️ **Snowflake Discovery** - Each competition is a unique snowflake. Discover opportunities tailored to your interests
- 🤖 **AI Recommendations** - Get personalized competition suggestions based on your profile and history
- 💬 **Real-Time Chat** - Connect with support staff and get instant answers to your questions
- 🏆 **Gamification** - Earn Snow Points for registrations and achievements. Unlock badges as you progress
- 📅 **Calendar View** - Plan your competitions with our intuitive calendar interface
- ⚡ **Trending Blizzards** - See which competitions are creating a storm with high participation rates
- 🎥 **Video Meetings** - Integrated video conferencing for competition-related meetings
- 💳 **Payment Integration** - Secure payment processing with Stripe
- 🔔 **Real-Time Notifications** - Get instant updates on competition status and deadlines

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- PostgreSQL database
- Environment variables configured (see `.env.example`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd template
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Seed admin user (optional)
pnpm seed:admin
```

5. Start the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📜 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm seed:admin` - Seed admin user
- `pnpm db:reset` - Reset database and seed admin
- `pnpm test:calendar` - Test calendar integration
- `pnpm deploy` - Deploy using deployment script

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **React 18** - UI library
- **next-themes** - Theme management (dark/light mode)

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe ORM for PostgreSQL
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens

### Real-Time & Communication
- **Pusher** - Real-time notifications
- **Socket.io** - WebSocket communication
- **Supabase Realtime** - Real-time chat functionality
- **100ms Live** - Video conferencing

### AI & Services
- **Google Generative AI** - AI-powered features
- **Groq SDK** - Fast AI inference
- **Resend** - Email service

### Payment & Integrations
- **Stripe** - Payment processing
- **Google Calendar API** - Calendar integration
- **Firebase** - Additional services

### UI Components
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **React Markdown** - Markdown rendering
- **Leaflet** - Maps integration
- **Sonner** - Toast notifications

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── competitions/      # Competition pages
│   ├── profile/           # User profile
│   └── ...
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── ai/               # AI-related components
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components
│   └── ...
├── lib/                  # Utility libraries
│   ├── prisma.ts        # Prisma client
│   ├── auth.ts          # Authentication utilities
│   └── ...
├── hooks/                # Custom React hooks
└── generated/           # Generated Prisma types
```

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

- Database connection string
- JWT secret keys
- Stripe API keys
- Google OAuth credentials
- Pusher credentials
- Supabase credentials
- AI API keys (Google AI, Groq)
- Email service credentials

## 🚢 Deployment

### Production Build

```bash
pnpm build
pnpm start
```

**Note:** For standalone builds, use:
```bash
node .next/standalone/server.js
```

### Docker Deployment

The project includes Docker configuration:
- `Dockerfile` - Production build
- `Dockerfile.dev` - Development build
- `docker-compose.yml` - Local development setup

See `DOCKER.md` for detailed deployment instructions.

## 📊 Platform Statistics

- **500+** Active Competitions
- **10K+** Registered Users
- **9+** Categories
- **98%** Success Rate
- **$2.5M+** Total Prize Pool

## 🎨 Design Philosophy

TAAKRA uses a unique snow-themed design language:
- Each competition is a "snowflake" - unique and beautiful
- Trending competitions behave like "blizzards"
- Deadlines "melt away" as time passes
- Users earn "Snow Points" for engagement

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🔗 Links

- **Live Website:** [https://zalnex.me/](https://zalnex.me/)
- **Documentation:** See project docs in `/docs` directory
- **Docker Guide:** See `DOCKER.md`
- **Calendar Testing:** See `CALENDAR_TESTING_GUIDE.md`

## 📧 Support

For support, email support@zalnex.me or visit the support page on the website.

---

**Built with ❄️ for discovering competitions in a snowstorm of opportunities.**

© 2026 Taakra. All rights reserved.
