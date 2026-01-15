# eGarage Kenya 🔧

Find trusted mechanics and breakdown services across Kenya.

## Features

- **For Drivers**: Search verified mechanics by location, specialty, read reviews
- **For Mechanics**: Get verified, manage profile, receive client inquiries
- **Admin Dashboard**: Manage verifications, view analytics, monitor platform

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Prisma with SQLite (dev) / PostgreSQL (production)
- **Auth**: Supabase Authentication
- **Payments**: M-Pesa Daraja API (STK Push)
- **UI**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/mechanic.git
cd mechanic

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
# See .env.example for required variables

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed

# Start development server
npm run dev
```

### Environment Variables

See `.env.example` for all required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Database connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `MPESA_CONSUMER_KEY` | Daraja API consumer key |
| `MPESA_CONSUMER_SECRET` | Daraja API consumer secret |
| `MPESA_PASSKEY` | Lipa Na M-Pesa passkey |
| `MPESA_SHORTCODE` | Your Till Number |
| `MPESA_CALLBACK_URL` | Public URL for M-Pesa callbacks |
| `MPESA_ENV` | `sandbox` or `production` |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

For M-Pesa callbacks, use your Vercel domain:
```
MPESA_CALLBACK_URL=https://your-app.vercel.app/api/mpesa/callback
```

### Database for Production

Switch from SQLite to PostgreSQL:

1. Update `DATABASE_URL` in `.env`
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run `npx prisma migrate deploy`

## Admin Setup

After deployment, create an admin user:

```bash
npx ts-node scripts/create-admin.ts
```

Then create the matching user in Supabase Auth with the same email.

## License

MIT
