# Kinjo - Airbnb-Inspired Accommodation Platform

![Kinjo Demo](link-to-screenshot-or-gif)

Kinjo is a demo web application inspired by Airbnb, built to showcase full-stack development skills. It allows users to browse listings, search with filters (location, price, rooms, guests, dates), book accommodations, and manage bookings as guests, while hosts can create and edit listings. The app features a modern UI with drag-and-drop photo reordering, Google Drive photo uploads, and a responsive design.

## Features

- **User Authentication**: Login/logout with JWT-based auth.
- **Search Listings**: Filter by place, price range, room count, guest capacity, and dates.
- **Host Dashboard**: Create, update, and delete listings with photo uploads to Google Drive.
- **Booking System**: Guests can book listings with date selection and availability checks.
- **Profile Page**: View booking history with listing details.
- **Responsive UI**: Built with Next.js and Shadcn/UI components for a polished, mobile-friendly experience.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Auth**: JWT (JSON Web Tokens)
- **Storage**: Google Drive API for photo uploads
- **Deployment**: Vercel

## Prerequisites

- Node.js (v18+)
- PostgreSQL database
- Google Cloud Console account (for Drive API credentials)

## Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/kinjo.git
   cd kinjo
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables Create a .env file in the root directory and add:**

   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/kinjo_db"
   JWT_SECRET="your-secret-key"
   GOOGLE_DRIVE_CLIENT_ID="your-google-client-id"
   GOOGLE_DRIVE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_DRIVE_REDIRECT_URI="http://localhost:3000/api/auth/google-drive-callback"
   GOOGLE_DRIVE_TOKEN='{"access_token":"...","refresh_token":"..."}'
   ```

4. **Initialize Database**

   ```base
   npx prisma db push
   ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

## Deployment

> Deployed on Vercel

### Steps to Deploy on Vercel

1. **Install the Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Deploy:**

   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard (same as .env).**

## Portfolio Notes

**This prject demonstrates:**

- Full-stack development with Next.js and Prisma
- Integration with third-party APIs (Google Drive, OAuth2.0)
- Modern UI/UX with drag-and-drop functionality (@dnd-kit)
- Relational database design and querying

## License

MIT License - feel free to use this code for your own projects!
