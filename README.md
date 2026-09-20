# PULSE – Real-Time Polling Application

A modern React-based frontend for **PulsePoll**, a real-time polling application that allows hosts to create and manage polls while participants can vote without signing up.

The application provides separate experiences for **Host/Creator** and **Voter**, with real-time vote updates powered by WebSockets.

---

## 📌 Project Information

- **Candidate:** Hari Dharshini G
- **Project:** PULSE – Full Stack Polling Application
- **Frontend Repository:** https://github.com/hari632/Pulse-Poll--Frontend
- **Backend Repository:** https://github.com/hari632/Pulse-Poll
- **Live Application:** https://pulse-poll-frontend.vercel.app/

---

## ✨ Features

### 👩‍💻 Host / Creator

- Create polls
- Add multiple poll options
- Share polls using a generated link
- Generate and display QR codes
- View poll details
- Monitor live votes
- View live results
- View poll activity
- Close polls
- View previously created polls

### 👥 Voter / Participant

- Join polls using a direct link
- Join using a short poll URL
- Join through a QR code
- Vote without creating an account
- Receive vote confirmation
- View live results
- Vote again when permitted

### ⚡ Real-Time Updates

PulsePoll uses WebSockets to update connected clients whenever a new vote is received.

```text
Voter
  │
  ▼
Vote API
  │
  ▼
Go + Gin Backend
  │
  ▼
Redis
  │
  ▼
Redis Pub/Sub
  │
  ▼
WebSocket Hub
  │
  ▼
Connected Frontend Clients
  │
  ▼
Live Results Update
```

---

# 🏗️ Frontend Architecture

The frontend is intentionally divided into two main user journeys:

```text
                         PULSE POLL
                             │
              ┌──────────────┴──────────────┐
              │                             │
        HOST / CREATOR                    VOTER
              │                             │
        Create Poll                    Join Poll
              │                             │
              ▼                             ▼
        Share Poll                       Vote
              │                             │
        ┌─────┴─────┐                       ▼
        ▼           ▼                 Vote Success
      QR Code   Poll Details               │
                    │                       ▼
                    ▼                  Live Results
              Live Monitoring
                    │
                    ▼
                Close Poll
```

The Host and Voter experiences are separated at the frontend level while communicating with the same backend services.

---

# 🧑‍💻 Host / Creator Flow

```text
Landing
   ↓
Create Poll
   ↓
Poll Sharing
   ├──→ QR Code
   │
   └──→ Poll Details
            ↓
        Live Results
            ↓
        Close Poll
            ↓
        Poll Closed
```

### Host Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/create` | Create a new poll |
| `/share/:pollId` | Share poll |
| `/qr/:pollId` | QR code presenter |
| `/poll-details/:pollId` | Poll dashboard |
| `/mypolls` | View created polls |
| `/results/:pollId` | Live results |
| `/poll-closed/:pollId` | Closed poll results |

---

# 👥 Voter Flow

```text
QR Code / Direct Link / Short Link
              ↓
           Join Poll
              ↓
           Vote Page
              ↓
         Submit Vote
              ↓
         Vote Success
              ↓
         Live Results
```

### Voter Routes

| Route | Description |
|---|---|
| `/join` | Join a poll |
| `/poll/:pollId` | Voting page |
| `/p/:pollId` | Short voting URL |
| `/vote-success/:pollId` | Vote confirmation |
| `/results/:pollId` | Live results |
| `/poll-closed/:pollId` | Final results |
| `/poll-not-found` | Invalid or unavailable poll |

---

# ⚡ Real-Time WebSocket Integration

The frontend connects to the backend WebSocket endpoint:

```text
/api/v1/polls/:pollId/live
```

When a participant submits a vote:

1. The frontend sends the vote to the backend.
2. The backend processes the vote.
3. Redis maintains the live vote counters.
4. Redis Pub/Sub distributes the vote event.
5. The WebSocket Hub receives the event.
6. Connected clients receive the updated vote information.
7. The frontend updates the results immediately.

### Example WebSocket Event

```json
{
  "pollId": "65fc3b18...",
  "pollCode": "SPATV7",
  "optionId": "d3b07384...",
  "optionIndex": 0,
  "votes": [12, 8, 4, 2],
  "optionVotes": 12,
  "totalVotes": 26,
  "percentages": [46, 31, 15, 8],
  "peakActivity": "2026-09-19T11:10:00Z",
  "activity": "+4 votes in the last hour"
}
```

---

# 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend UI |
| Vite | Development and build tooling |
| JavaScript | Application logic |
| React Router | Client-side routing |
| CSS | Styling and responsive UI |
| REST API | Backend communication |
| WebSocket API | Real-time updates |
| Vercel | Frontend deployment |

---

# 📁 Project Structure

```text
Pulse-Poll--Frontend/
│
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── auth/
│   │   ├── layout/
│   │   ├── poll/
│   │   └── ui/
│   ├── hooks/
│   ├── pages/
│   │   ├── CreatePoll/
│   │   ├── JoinPoll/
│   │   ├── Landing/
│   │   ├── Login/
│   │   ├── MyPolls/
│   │   ├── PollClosed/
│   │   ├── PollDetails/
│   │   ├── PollNotFound/
│   │   ├── PollSharing/
│   │   ├── QrCode/
│   │   ├── Results/
│   │   ├── Settings/
│   │   ├── SignUp/
│   │   ├── Vote/
│   │   └── VoteSuccess/
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── services/
│   │   ├── api/
│   │   │   ├── authApi.js
│   │   │   ├── client.js
│   │   │   ├── index.js
│   │   │   └── pollApi.js
│   │   └── mock/
│   │       ├── mockDatabase.js
│   │       └── pollApi.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── package.json
├── vite.config.js
└── vercel.json
```

---

# 🔌 Backend API Integration

### Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Poll Management

```text
POST  /api/v1/polls
GET   /api/v1/polls
GET   /api/v1/polls/:id
POST  /api/v1/polls/:id/vote
GET   /api/v1/polls/:id/results
PATCH /api/v1/polls/:id/close
```

### Real-Time Connection

```text
WebSocket:
/api/v1/polls/:id/live
```

---

# 🔐 Environment Variables

Create a `.env` file in the frontend project root.

### Local Development

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### Production

```env
VITE_API_BASE_URL=https://pulse-poll-ahjw.onrender.com/api/v1
```

If a separate WebSocket URL is required:

```env
VITE_WS_URL=wss://pulse-poll-ahjw.onrender.com/api/v1
```

> **Important:** Never commit `.env` files or credentials to GitHub.

---

# 🚀 Getting Started

## Prerequisites

- Node.js
- npm
- Git

## 1. Clone the Repository

```bash
git clone https://github.com/hari632/Pulse-Poll--Frontend.git
cd Pulse-Poll--Frontend
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## 4. Start the Development Server

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

# 🏭 Production Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

# ☁️ Deployment

The frontend is deployed using **Vercel**.

### Live Application

https://pulse-poll-frontend.vercel.app/

---

# 🧪 Testing the Real-Time Flow

1. Create a poll from the Host flow.
2. Copy the generated poll link or open the QR code.
3. Open the poll in another browser or tab.
4. Submit a vote.
5. Keep the Results page open.
6. Submit another vote from the voter window.

### Expected Behavior

The Results page should update automatically:

- Vote counts
- Total votes
- Percentages
- Activity information

No manual page refresh should be required.

---

# 🎯 Design Goals

- Simple poll creation
- Low-friction voting
- Separate Host and Voter experiences
- Real-time result updates
- Responsive user experience
- Clear navigation
- Reusable components
- Separation of UI and API services

---

# 🔒 Security

- Protected creator operations use authentication.
- Public voters do not need to create an account.
- Environment files are excluded from Git.
- Database and Redis credentials are never exposed to the frontend.

---

# 📌 Project Links

- **Frontend:** https://github.com/hari632/Pulse-Poll--Frontend
- **Backend:** https://github.com/hari632/Pulse-Poll
- **Live Application:** https://pulse-poll-frontend.vercel.app/

---

# 👩‍💻 Candidate

**Hari Dharshini G**

### PULSE – Full Stack Polling Application

Built with **React, Go, Gin, MongoDB, Redis, and WebSockets**.
