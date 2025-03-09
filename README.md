# Spirit11 - Fantasy Cricket Platform

This project is part of a task for SpiritX 2025 organized by the University of Moratuwa.

## Project Overview

Spirit11 is a fantasy cricket league platform where users build their dream teams from real university players. The application allows users to select players, manage their budget, view player statistics, and compete with others on the leaderboard. The platform includes an AI chatbot (Spiriter) that assists users with player queries and team recommendations.

## Features

- **User Authentication**: Secure signup and login system with JWT authentication
- **Player Management**: Browse and view detailed statistics of university cricket players
- **Team Selection**: Build your dream team of 11 players while managing your budget
- **Budget Tracking**: Monitor your spending as you select players for your team
- **Leaderboard**: Compete with other users and see your ranking
- **Admin Panel**: Manage players, view statistics, and get tournament summaries
- **AI Chatbot (Spiriter)**: Get player information and team recommendations

## Additional Features Implemented

- **Mobile Responsive Design**: Fully responsive UI that works seamlessly on all devices
- **Real-time Updates**: Instant UI updates when changes are made to player data or team selection
- **Tournament Statistics**: View comprehensive tournament data including top performers

## Technologies Used

- **Frontend & Backend**: Next.js 15.2.1 with React 19
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **UI Components**: Custom components with Radix UI primitives
- **Styling**: Tailwind CSS
- **AI Integration**: Google Generative AI for the Spiriter chatbot
- **Data Visualization**: Recharts for statistical charts and graphs

## Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn package manager
- MongoDB instance (local or cloud-based)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/0xneobyte/spiritx_compilex_02.git
   cd spiritx_compilex_02
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb+srv://spirit11_2025:Spirit2025pass@spirit11-cluster.lg2ol.mongodb.net/?retryWrites=true&w=majority&appName=spirit11-cluster
   JWT_SECRET=your_jwt_secret_key
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=Admin@2025
   GEMINI_API_KEY=your_gemini_api_key
   ```

## Database Setup and Configuration

1. Ensure MongoDB is installed and running (if using local MongoDB)

   ```bash
   # For local MongoDB
   mongod --dbpath /path/to/data/directory
   ```

2. Import the sample data:

   ```bash
   # The application will automatically seed the database with sample_data.csv
   # when you first run it, or you can manually trigger it with:
   curl http://localhost:3000/api/seed
   ```

3. The database will be populated with:
   - Player data with statistics
   - Predefined user account (spiritx_2025)
   - Admin account

## Running the Project

1. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

3. Login with the predefined account:

   - Username: `spiritx_2025`
   - Password: `SpiritX@2025`

4. Admin Panel Access:
   - Username: `admin`
   - Password: `Admin@2025`

## Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Assumptions Made During Development

- Users are familiar with fantasy cricket concepts
- All players in the dataset are active and available for selection
- The player statistics are up-to-date and accurate
- Users will primarily access the platform via web browsers
- The platform will handle a moderate number of concurrent users
- We assume that admin signup would not be secure, so we didn't implement this feature - instead, admin credentials are preset

## Project Structure

```
project-root/
├── app/                # Next.js app directory
│   ├── admin/          # Admin panel pages
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── components/     # Shared UI components
│   ├── lib/            # Utilities, models, and hooks
│   └── user/           # User-facing pages
├── components/         # Global components
├── lib/                # Global utilities
├── public/             # Static assets
└── sample_data.csv     # Initial player data
```

## License

This project is part of SpiritX 2025 by the University of Moratuwa and is subject to their terms and conditions.

---

This project was bootstrapped with [create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
