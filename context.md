# Spirit11 Project Context

## Overview

Spirit11 is a fantasy cricket league platform where users build their dream teams from real university players. The platform consists of three main components:

- **Admin Panel:** Manage player data, statistics, and provide tournament summaries.
- **User Interface:** Allow users to sign up, log in, view players, select their teams, track budgets, and view leaderboards.
- **AI Chatbot (Spiriter):** Assist users with player queries and recommend the best possible team of 11 players.

## Technology Stack

- **Frontend & Backend:** Next.js
- **Database:** MongoDB

---

## Logic

### Player Stats Calculations

1. **Batting Strike Rate**  
   \[
   \text{Batting Strike Rate} = \left(\frac{\text{Total Runs}}{\text{Total Balls Faced}}\right) \times 100
   \]

2. **Batting Average**  
   \[
   \text{Batting Average} = \frac{\text{Total Runs}}{\text{Innings Played}}
   \]

3. **Bowling Strike Rate**  
   \[
   \text{Bowling Strike Rate} = \frac{\text{Total Balls Bowled}}{\text{Total Wickets Taken}}
   \]

4. **Economy Rate**  
   \[
   \text{Economy Rate} = \left(\frac{\text{Total Runs Conceded}}{\text{Total Balls Bowled}}\right) \times 6
   \]

### Player Points

\[
\text{Player Points} = \bigl(\text{Batting Strike Rate} \times 2\bigr)
\;+\; \bigl(\text{Batting Average} \times 0.8\bigr)
\;+\; \left(\frac{500}{\text{Bowling Strike Rate}}\right)
\;+\; \left(\frac{140}{\text{Economy Rate}}\right)
\]

### Player Value (Rounded to the nearest multiple of 50,000)

\[
\text{Value in Rupees} = \Bigl((9 \times \text{Player Points}) + 100\Bigr) \times 1000
\]

After computing the value, **round it** to the nearest multiple of **50,000**.

---

## Requirements

### Admin Panel

1. **Players View:** Displays all players in the game.
2. **Player Stats View:** Shows detailed statistics for each player (runs, wickets, strike rates, economy, etc.).
3. **Tournament Summary:** Provides overall tournament data:
   - Total runs scored by all players
   - Total wickets taken by all players
   - Highest run scorer
   - Highest wicket taker
4. **CRUD Operations:** Admin can create, update, and delete player entries (for newly added players only; the original dataset remains unchanged).
5. **Real-time Updates:** Changes to player data or stats should reflect instantly in the admin panel (e.g., via websockets).
6. **Authentication:** The admin panel must be protected so that only an authenticated admin can access it.

### User Interface

1. **User Authentication:**
   - Sign up and log in with a username and password.
   - Use JWT or a similar mechanism for session management.
   - Only authenticated users can access main features (team selection, viewing players, etc.).
2. **Players Tab:**
   - List available players from the dataset.
   - Allow users to click on a player to view detailed profiles and stats.
   - **Important:** Do **not** display a player's "points" directly to the user (only show relevant batting/bowling stats).
3. **Team Selection:**
   - "Select Your Team" view where users choose players by category (batsmen, bowlers, all-rounders, etc.).
   - Users can add players to their team, but cannot add the same player twice unless they remove them first.
4. **Team Overview:**
   - Display the current team (up to 11 players).
   - Internally calculate total team points once the team has 11 players (using the formulas above).
   - Only display the final **team points** (not the individual player points) to the user.
5. **Budget Tracking:**
   - Users start with a budget of Rs. 9,000,000.
   - Each player has a "value" (calculated via the above formula) that is deducted from the user's budget upon selection.
   - Removing a player adds back that player's value to the budget.
   - A user cannot exceed their available budget when selecting players.
6. **Leaderboard:**
   - Display all users with their total team points in descending order.
   - Highlight the currently logged-in user.
7. **Real-time Updates & Responsive Design:**
   - Use websockets or a similar technology to update UI changes instantly.
   - Ensure all pages are fully responsive on various devices.

### AI Chatbot (Spiriter)

1. **Player Queries:**
   - Answer user questions about a player's details (runs, wickets, strike rate, economy, etc.).
2. **Team Recommendation:**
   - Suggest the best possible team of 11 players (i.e., the team that maximizes total points), based on the same logic above.
   - **No hardcoding** of a fixed team; it must compute based on player stats.
3. **Fallback for Unknown Queries:**
   - If a user asks for details not in the dataset, respond with:
     > "I don't have enough knowledge to answer that question."
4. **Privacy Considerations:**
   - **Never** reveal a player's points directly through the chatbot.

---

## Special Notes

1. **Fully Integrated System:** This project must include a working frontend, backend, and database.
2. **Dataset Integration:** The provided dataset of players must be loaded into the system. CRUD applies only to newly created players (the original dataset remains unchanged).
3. **No Custom Points System:** The formulas above must be used for calculating player points and player value. No modifications.
4. **Predefined User Account:**

   - **Username:** `spiritx_2025`
   - **Password:** `SpiritX@2025`
   - **Team:**
     1. Danushka Kumara
     2. Jeewan Thirimanne
     3. Charith Shanaka
     4. Pathum Dhananjaya
     5. Suranga Bandara
     6. Sammu Sandakan
     7. Minod Rathnayake
     8. Lakshan Gunathilaka
     9. Sadeera Rajapaksa
     10. Danushka Jayawickrama
     11. Lakshan Vandersay

   Make sure these 11 players are added to this user's team upon signup or via admin data entry so that it's visible when the user logs in.

5. **Validation & Error Handling:**
   - Implement strict validation for all forms.
   - Handle errors gracefully in both frontend and backend.
6. **Documentation:**
   - Maintain clear documentation on how each component is structured and how data flows between them.
7. **Testing & Deployment:**
   - Test authentication, CRUD operations, real-time features, chatbot functionality, and UI responsiveness.
   - Deploy to a Next.js-friendly environment (e.g., Vercel) with a MongoDB instance (e.g., MongoDB Atlas).

---

## Development Approach

1. **Project Setup:**

   - Initialize a Next.js project.
   - Set up MongoDB (local or cloud-based) and configure the connection in Next.js API routes.

2. **Authentication Module:**

   - Implement sign-up and login (JWT-based or similar).
   - Ensure routes for user/admin actions are protected.

3. **Admin Panel Development:**

   - Build pages for Players View, Player Stats, and Tournament Summary.
   - Implement CRUD for newly added players.
   - Integrate real-time data updates.
   - Secure these pages with admin-only authentication.

4. **User Interface Development:**

   - Create the Players Tab (list + details) without exposing "points."
   - Build the "Select Your Team" interface, enforcing budget and no duplicates.
   - Display the user's team, budget tracking, and final team points once 11 players are selected.
   - Implement a Leaderboard sorted by total team points.

5. **AI Chatbot Integration:**

   - Add a "Spiriter" page or modal.
   - Handle queries about player stats or details.
   - Implement logic to compute the best 11-player team based on the points formula.
   - Respond with a fallback if data is not available.

6. **Testing & Deployment:**
   - Write tests for core features (auth, CRUD, real-time updates, chatbot).
   - Deploy on a suitable hosting service (e.g., Vercel + MongoDB Atlas).

