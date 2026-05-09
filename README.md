# Campus Connect Hub 🎓

Campus Connect Hub is a modern, full-stack web application designed to streamline campus operations. It provides a unified portal for both Students and Administrators, facilitating resource bookings, service requests, announcements, and event management.

Built with a focus on premium aesthetics, it features a responsive, glassmorphism-inspired UI with smooth animations.

## 🚀 Features

### 👨‍🎓 Student Portal
*   **Resource Booking:** Browse active campus resources (labs, seminar halls) and request bookings for specific times. Track the status (Pending, Approved, Rejected) of all past bookings.
*   **Complaints & Service Requests:** Raise IT, Maintenance, or Cleaning requests and track their resolution status.
*   **Events & Announcements:** Stay up to date with real-time campus events and administrative announcements.

### 🛡️ Administrator Portal
*   **Dashboard Overview:** Get a high-level view of pending bookings, active resources, and total students. Post global announcements.
*   **Student Management:** View a directory of all registered students.
*   **Resource Management:** Add, edit, deactivate, or delete campus resources like rooms and equipment.
*   **Booking Management:** Review student booking requests with one-click Approve or Reject functionality.
*   **Complaint Resolution:** Track and mark student service requests as "Resolved."
*   **Event Scheduling:** Create and manage upcoming campus events, specifying location, time, and organizer details.

## 🛠️ Technology Stack

*   **Frontend Framework:** React 18, Vite
*   **Styling:** Tailwind CSS (Vanilla + Glassmorphism UI)
*   **Icons & Animations:** Lucide React, Framer Motion
*   **Backend & Database:** Supabase (PostgreSQL)
*   **Authentication:** Supabase Auth (Email/Password with Auto-Healing Profile syncing)
*   **Routing:** React Router v6

## ⚙️ Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rakeshn7/campus-hub.git
   cd campus-hub/frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file in the `frontend` directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Run the provided `supabase_schema.sql` script in your Supabase SQL editor to create the necessary tables.
   *(Note: For MVP testing, run the `fix_rls.sql` script to bypass Row Level Security constraints).*

5. **Start the Development Server**
   ```bash
   npm run dev
   ```

## 🔐 Authentication & Roles
The application uses role-based access control (RBAC). 
*   New sign-ups default to the `STUDENT` role.
*   To create an `ADMIN` account, manually update a user's role to `'ADMIN'` in your Supabase `profiles` table. The application will automatically route them to the Administrator portal upon login.

---
*Built as a showcase for modern web development and database management.*
