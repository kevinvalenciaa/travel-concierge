# Supabase Setup Guide

This guide explains how to set up Supabase for the Travel Concierge app.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js 18+ and npm
3. Supabase CLI

## Installing Supabase CLI

### macOS
```bash
brew install supabase/tap/supabase
```

### Windows (with scoop)
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Other platforms (using npm)
```bash
npm install -g supabase
```

## Setting up your local environment

1. Create a new Supabase project from the [Supabase Dashboard](https://app.supabase.com)

2. Get your project URL and anon key from the project settings and update your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

3. Link your local project to your Supabase project:

```bash
supabase login
supabase link --project-ref your-project-ref
```

You can find your project reference in the URL of your Supabase dashboard: `https://app.supabase.com/project/your-project-ref`

## Running migrations

To apply the database schema:

```bash
npm run db:migrate
```

This will create all the necessary tables and set up Row Level Security policies.

## Database Structure

The database includes the following tables:

- `profiles` - User profiles
- `trips` - User trips
- `trip_bookings` - Flight and hotel booking info
- `trip_days` - Days in a trip
- `trip_activities` - Activities for each day
- `user_preferences` - User preferences for travel

## Row Level Security

All tables have Row Level Security enabled, which ensures that users can only access their own data.

## Testing the setup

After running migrations, you should be able to:

1. Sign up/sign in to the app
2. Create trips that are tied to your user account
3. View only your own trips in the dashboard

If you encounter any issues, check the Supabase logs in the dashboard under "Database" > "Logs". 