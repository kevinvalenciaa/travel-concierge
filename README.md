# Voyentra AI - Personalized Travel Concierge

![Next.js](https://img.shields.io/badge/Next.js-13.0+-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18.0+-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?style=flat-square&logo=supabase)
![Google AI](https://img.shields.io/badge/Google%20Gemini-AI%20Integration-blue?style=flat-square&logo=google)

## Overview

Voyentra AI is a next-generation travel planning platform designed to revolutionize how people plan their trips. By leveraging the power of AI, Voyentra transforms the often overwhelming process of trip planning into an effortless conversation, generating personalized day-by-day itineraries that match users' unique preferences, interests, and constraints.

## Live Demo

*Live Demo coming soon!*

## Key Features

- **Secure User Authentication**: Complete email/password authentication flow using Supabase, including account creation, sign-in, and password recovery
- **Conversational Trip Planning**: Intuitive chatbot interface for planning trips through natural conversation
- **Comprehensive Preference Capture**: Multi-step onboarding to collect detailed travel preferences including destinations, dates, budget, duration, and traveler interests (adventure, culture, relaxation)
- **AI-Powered Itinerary Generation**: Integration with Google Gemini API to create personalized, day-by-day itineraries based on user preferences
- **Real-Time Activity Suggestions**: Dynamic recommendations for destinations worldwide, providing authentic local activities, restaurants, and accommodations
- **Interactive Itinerary Management**: Ability to view, edit, and customize generated itineraries with drag-and-drop functionality
- **Detail-Rich Activity Information**: Comprehensive details for each suggested activity, including operating hours, pricing, location data, and contextual information
- **Responsive Design**: Fully responsive interface that works seamlessly across desktop, tablet, and mobile devices

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router), React 18
- **Language**: TypeScript
- **UI**: Tailwind CSS, Shadcn UI components
- **State Management**: React Context API
- **Animations**: Framer Motion

### Backend
- **Authentication & Database**: Supabase (PostgreSQL)
- **API Integration**: Google Gemini API for AI-driven content generation
- **External Data**: Google Places API for location details

### Deployment
- **Frontend & API Routes**: Vercel
- **Database**: Supabase Cloud

## Architecture

Voyentra AI is built using a modern JAMstack architecture with server-side rendering capabilities:

```
┌─────────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                     │     │                 │     │                 │
│  Next.js Frontend   │────▶│  Next.js API    │────▶│  Google Gemini  │
│  (React/TypeScript) │     │   Routes        │     │       API       │
│                     │◀────│                 │◀────│                 │
└─────────────────────┘     └─────────────────┘     └─────────────────┘
          │                          │
          │                          │
          ▼                          ▼
┌─────────────────────┐     ┌─────────────────┐
│                     │     │                 │
│  Supabase Auth      │     │ Supabase DB     │
│                     │     │ (PostgreSQL)    │
│                     │     │                 │
└─────────────────────┘     └─────────────────┘
```

The architecture leverages Next.js App Router for both frontend rendering and backend API functionality. The system uses:

- **Server Components** for improved performance and SEO
- **Client Components** for interactive UI elements
- **API Routes** to securely communicate with external services
- **Supabase Authentication** for secure user management
- **Supabase PostgreSQL Database** for structured data storage
- **Prompt Engineering** techniques to generate relevant and structured travel content

This architecture was chosen for its developer productivity, performance benefits, and seamless integration capabilities with AI services while maintaining a clean separation of concerns.

## Screenshots

![Dashboard View](screenshots/dashboard.png)
*The main dashboard interface where users can view and manage their trips*

![Itinerary Generation](screenshots/itinerary.png)
*AI-powered itinerary generation with day-by-day activities*

![Travel Preferences](screenshots/preferences.png)
*User interface for setting detailed travel preferences*

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Gemini API key
- Google Places API key (optional, for enhanced location data)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/voyentra-ai.git
   cd voyentra-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Google API
   GOOGLE_API_KEY=your_google_api_key
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the database schema setup script:
   ```bash
   npx supabase db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Create an account** or sign in if you already have one
2. **Fill in your travel preferences** including destination, dates, budget, and interests
3. **Generate an itinerary** using the AI-powered system
4. **Review and customize** your itinerary by rearranging activities or requesting alternatives
5. **Save your itinerary** for future reference or export it for your trip

## Future Improvements

- **Booking Integration**: Connect with hotel and flight booking APIs to enable direct reservations
- **Social Sharing**: Allow users to share and collaborate on trip planning with friends and family
- **Offline Access**: Enable downloading itineraries for offline access during travel
- **Map Integration**: Add interactive maps showing daily routes and activities
- **Natural Language Editing**: Enable users to modify itineraries through conversational commands

## Contact

[LinkedIn](https://www.linkedin.com/in/kevin-valenciaa/)
