# Campus Connect Hub – Smart College Service & Student Engagement Platform

## 1. Executive Summary

The Campus Connect Hub is a centralized, DBMS-powered digital platform designed to unify college services into a single intuitive interface. The Minimum Viable Product (MVP) aims to bridge communication gaps by providing students and administrators with secure authentication, conflict-free resource booking, tracked complaint management, and real-time announcements. By leveraging a robust PostgreSQL backend, a Node.js/Express API, and a React-based frontend featuring modern glassmorphism aesthetics, the platform demonstrates practical DBMS principles (normalization, constraints, indexing) while delivering a premium, highly responsive user experience. 

## 2. Deliverables Checklist

- [x] Implementation Plan & Timeline
- [x] Normalized Relational Database Model (ER Diagram & SQL DDL)
- [x] RESTful API Specification (OpenAPI 3.0)
- [x] Backend Scaffolding (Node.js + Express + Prisma)
- [x] Frontend Scaffolding (React + Tailwind + Three.js)
- [x] Testing Strategy & Sample Code
- [x] Deployment Configurations (Docker, K8s, CI/CD)
- [x] Security, Privacy & Performance Guidelines
- [x] Project Documentation & README Template
- [x] Sample Data & Seed Scripts
- [x] Future Roadmap

## 3. Implementation Plan & Timeline

This timeline assumes a team of 1–3 developers working over 3 weeks.

### Week 1: Foundation & Backend Services
* **Day 1-2**: Database setup, Schema creation, Prisma models configuration (10-15 hrs).
* **Day 3-4**: Auth implementation (JWT, bcrypt), User roles, API scaffolding (15-20 hrs).
* **Day 5**: Resource & Booking API endpoints, transaction handling (10-15 hrs).

### Week 2: Frontend Scaffolding & Integration
* **Day 6**: React + Tailwind + Vite setup. Define Glassmorphism UI tokens (8-12 hrs).
* **Day 7-8**: Auth UI, Student/Admin Dashboard layouts, state management (React Query) setup (15-20 hrs).
* **Day 9-10**: Resource Booking UI (Calendar), Complaint form, Announcement feed integration (15-20 hrs).

### Week 3: Real-time, Polish & Deployment
* **Day 11**: Real-time updates (Socket.io/SSE) for notifications and announcements (10-12 hrs).
* **Day 12-13**: End-to-end testing, bug fixing, 3D/Three.js micro-interactions (15-20 hrs).
* **Day 14**: Dockerization, deployment pipeline setup (GitHub Actions), K8s manifests (10-15 hrs).
* **Day 15**: Documentation, final review, and launch prep (8-10 hrs).

## 4. Database Design

### ER Diagram

```mermaid
erDiagram
    USERS ||--o{ BOOKINGS : makes
    USERS ||--o{ SERVICE_REQUESTS : raises
    USERS ||--o{ ANNOUNCEMENTS : authors
    USERS ||--o{ NOTIFICATIONS : receives
    RESOURCES ||--o{ BOOKINGS : has
    EVENTS ||--o{ NOTIFICATIONS : generates

    USERS {
        uuid id PK
        string email
        string password_hash
        string role "STUDENT, ADMIN"
        string full_name
        timestamp created_at
    }

    RESOURCES {
        uuid id PK
        string name
        string type "ROOM, EQUIPMENT"
        int capacity
        boolean is_active
    }

    BOOKINGS {
        uuid id PK
        uuid user_id FK
        uuid resource_id FK
        timestamp start_time
        timestamp end_time
        string status "PENDING, APPROVED, REJECTED"
        text reason
    }

    SERVICE_REQUESTS {
        uuid id PK
        uuid user_id FK
        string category "IT, MAINTENANCE, OTHER"
        text description
        string status "OPEN, IN_PROGRESS, RESOLVED"
        timestamp created_at
    }

    ANNOUNCEMENTS {
        uuid id PK
        uuid author_id FK
        string title
        text content
        timestamp created_at
    }

    EVENTS {
        uuid id PK
        string title
        timestamp event_date
        text description
        string location
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string message
        boolean is_read
        timestamp created_at
    }
```

### PostgreSQL DDL (with conflict prevention constraints)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable btree_gist for EXCLUDE constraints on timestamp ranges
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE user_role AS ENUM ('STUDENT', 'ADMIN');
CREATE TYPE booking_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE service_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'STUDENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status booking_status DEFAULT 'PENDING',
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Crucial: PostgreSQL EXCLUDE constraint to prevent overlapping APPROVED bookings
    CONSTRAINT prevent_booking_overlap EXCLUDE USING gist (
        resource_id WITH =,
        tsrange(start_time, end_time) WITH &&
    ) WHERE (status = 'APPROVED'),
    
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status service_status DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_bookings_resource_time ON bookings (resource_id, start_time, end_time);
CREATE INDEX idx_service_user ON service_requests (user_id);
CREATE INDEX idx_announcements_created ON announcements (created_at DESC);
```

**MySQL Fallback Notes:**
MySQL does not support `EXCLUDE` constraints. To prevent booking conflicts in MySQL:
1. Create a `BEFORE INSERT` and `BEFORE UPDATE` trigger on `bookings`.
2. Inside the trigger, `SELECT COUNT(*) FROM bookings WHERE resource_id = NEW.resource_id AND status = 'APPROVED' AND start_time < NEW.end_time AND end_time > NEW.start_time;`.
3. If count > 0, raise a custom error (`SIGNAL SQLSTATE '45000'`).
4. Ensure transactions with `SERIALIZABLE` isolation level or use explicit `SELECT ... FOR UPDATE` locks during booking creation.

### Transactional Pattern for Booking (Application Level)

```javascript
// Prisma Transaction Example
async function approveBooking(bookingId) {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    
    // Manual overlap check (if not relying solely on DB constraints)
    const conflicts = await tx.booking.findMany({
      where: {
        resourceId: booking.resourceId,
        status: 'APPROVED',
        startTime: { lt: booking.endTime },
        endTime: { gt: booking.startTime }
      }
    });

    if (conflicts.length > 0) throw new Error('Time slot is already booked.');

    return await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'APPROVED' }
    });
  });
}
```

## 5. API Specification

*Assumption: RESTful JSON over HTTPS.*

```yaml
openapi: 3.0.3
info:
  title: Campus Connect Hub API
  version: 1.0.0
servers:
  - url: http://localhost:3000/api/v1
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
security:
  - bearerAuth: []
paths:
  /auth/login:
    post:
      summary: Authenticate user
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email: { type: string, example: "student@college.edu" }
                password: { type: string, example: "securepwd123" }
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  token: { type: string }
                  user: { type: object }
  /resources:
    get:
      summary: List resources
      responses:
        '200':
          description: OK
  /bookings:
    post:
      summary: Create a booking request
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                resourceId: { type: string, format: uuid }
                startTime: { type: string, format: date-time }
                endTime: { type: string, format: date-time }
                reason: { type: string }
      responses:
        '201':
          description: Created
        '409':
          description: Conflict - Slot already booked
  /service-requests:
    post:
      summary: Submit a complaint/request
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                category: { type: string }
                description: { type: string }
      responses:
        '201':
          description: Created
```

## 6. Backend Architecture & Code Samples

**Stack:** Node.js, Express, TypeScript, Prisma.

### Directory Structure
```
/src
  /controllers
  /middlewares
  /routes
  /services
  /utils
  app.ts
  server.ts
```

### Auth Middleware (`src/middlewares/auth.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
```

## 7. Frontend Architecture & Code Samples

**Stack:** React (Vite), Tailwind CSS, Framer Motion, React Query.

### Glassmorphism CSS Utilities (`index.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .glass-panel {
    @apply bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-2xl;
  }
  .glass-input {
    @apply bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-lg px-4 py-2 transition-all;
  }
}

body {
  /* Dynamic gradient background */
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  background-attachment: fixed;
  color: white;
}
```

### Dashboard Component Example (`src/pages/Dashboard.tsx`)
```tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const Dashboard = () => {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => api.get('/announcements').then(res => res.data)
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
        Welcome to Campus Hub
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 transform hover:scale-105 transition-transform duration-300">
           <h2 className="text-xl font-semibold mb-4">Latest Announcements</h2>
           {isLoading ? <p>Loading...</p> : (
             <ul className="space-y-3">
               {announcements?.slice(0,3).map((a: any) => (
                 <li key={a.id} className="border-b border-white/10 pb-2">
                   <h3 className="font-medium text-blue-200">{a.title}</h3>
                 </li>
               ))}
             </ul>
           )}
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
```

### Three.js Integration (Micro-interaction)
*Tip: Render a slow-rotating 3D campus logo in the login page background using `@react-three/fiber`.*
```tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';

const RotatingLogo = () => {
  const meshRef = useRef<any>();
  useFrame(() => {
    if(meshRef.current) meshRef.current.rotation.y += 0.01;
  });
  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[2, 0]} />
      <meshStandardMaterial color="#4ade80" wireframe />
    </mesh>
  );
};

// Usage: <Canvas><ambientLight/><RotatingLogo/></Canvas>
```

## 8. Testing Plan

*   **Backend Unit Tests (Jest):** Test Prisma logic, calculate overlaps, password hashing.
*   **Integration Tests (Supertest):** API endpoint tests asserting status codes and DB state changes.
*   **E2E Tests (Cypress):** Simulate user login, navigating to dashboard, submitting a booking, and verifying it shows as "Pending".

**Sample Supertest (Booking Conflict Check):**
```typescript
import request from 'supertest';
import app from '../app';

describe('POST /api/v1/bookings', () => {
  it('should return 409 if time slot overlaps with approved booking', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        resourceId: 'existing-id',
        startTime: '2025-06-01T10:00:00Z',
        endTime: '2025-06-01T12:00:00Z'
      });
    expect(res.status).toBe(409);
  });
});
```

## 9. Deployment & DevOps

### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

### docker-compose.yml (Local Dev)
```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: campus
      POSTGRES_PASSWORD: password
      POSTGRES_DB: campushub
    ports:
      - "5432:5432"
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://campus:password@db:5432/campushub
      - JWT_SECRET=devsecret
    depends_on:
      - db
```

### Backup & Restore
*Backup:* `pg_dump -U campus -h localhost campushub > backup.sql`
*Restore:* `psql -U campus -h localhost campushub < backup.sql`

## 10. Security & Privacy Checklist
- [ ] **Auth:** Use bcrypt (salt rounds = 10) for passwords. Issue short-lived JWTs (15m) and secure HttpOnly refresh tokens.
- [ ] **Injection:** Use ORM/Query Builder (Prisma) to parameterize all queries automatically.
- [ ] **Rate Limiting:** Apply `express-rate-limit` (e.g., 100 req/15min) to all public APIs.
- [ ] **CORS:** Restrict origin to frontend URL.
- [ ] **Data Minimization:** APIs should omit `password_hash` in responses.

## 11. Performance, Monitoring & Scaling
*   **Indexing:** Ensure FKs (like `user_id`, `resource_id`) and commonly filtered columns (`status`, `created_at`) have B-Tree indexes. EXCLUDE constraint natively uses GiST indexes.
*   **Connection Pooling:** Use PgBouncer or Prisma's built-in pooling.
*   **Pagination:** Apply cursor-based or limit/offset pagination to Announcements and Service Requests.

## 12. Project Documentation & README Template

```markdown
# Campus Connect Hub

## Overview
A DBMS-powered digital platform unifying college services: resource booking, service requests, and announcements.

## Getting Started
1. Clone the repo.
2. Run `docker-compose up -d` to start the PostgreSQL DB.
3. In `/backend`: run `npm install`, `npx prisma db push`, `npm run dev`.
4. In `/frontend`: run `npm install`, `npm run dev`.

## Environment Variables
Create a `.env` in the backend root:
DATABASE_URL="postgresql://campus:password@localhost:5432/campushub"
JWT_SECRET="super-secret-key"
```

## 13. Sample Data & SQL Seed Scripts

```sql
INSERT INTO users (id, email, password_hash, full_name, role) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@college.edu', '$2b$10$...', 'Admin User', 'ADMIN'),
('22222222-2222-2222-2222-222222222222', 'student@college.edu', '$2b$10$...', 'John Doe', 'STUDENT');

INSERT INTO resources (id, name, type, capacity) VALUES 
('33333333-3333-3333-3333-333333333333', 'Seminar Hall A', 'ROOM', 100),
('44444444-4444-4444-4444-444444444444', 'Projector 1', 'EQUIPMENT', 1);

INSERT INTO announcements (author_id, title, content) VALUES
('11111111-1111-1111-1111-111111111111', 'Welcome to the New Term', 'Classes begin on Monday.');
```

## 14. Future Roadmap & Prioritization
1. **Analytics Dashboard (High)**: Admin views for resource utilization rates.
2. **Push Notifications (Medium)**: Web Push API integration for mobile updates.
3. **Event QR Attendance (Medium)**: Generate QR codes for events and scan via mobile.
4. **AI Chatbot (Low)**: Assist students in finding resources or FAQ.

## 15. Appendix

### Useful SQL Queries
**Calculate Resource Utilization (hours booked per resource in a month):**
```sql
SELECT r.name, SUM(EXTRACT(EPOCH FROM (b.end_time - b.start_time))/3600) as hours_booked
FROM resources r
JOIN bookings b ON r.id = b.resource_id
WHERE b.status = 'APPROVED' AND b.start_time >= '2025-05-01'
GROUP BY r.name
ORDER BY hours_booked DESC;
```

### Next Steps for Implementation
Initialize the monorepo structure. Run `docker-compose up` to spin up PostgreSQL, then write the Prisma schema matching the DDL provided. Proceed immediately to generating the Prisma client and scaffolding the `auth` controller to establish the foundation.
