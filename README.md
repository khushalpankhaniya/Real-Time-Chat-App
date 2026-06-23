# Real-Time Chat App (Version 1 / V1)

A modern, responsive real-time chat application built with a React frontend and an Express/MongoDB backend, featuring live messaging, real-time online presence, and instant user updates over WebSockets.

---

## 🚀 Tech Stack

### Frontend (`/client`)
- **Core Library**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Authentication**: [Clerk Auth](https://clerk.com/) (`@clerk/clerk-react`) for secure user authentication and session management.
- **Real-Time Communication**: [Socket.io Client](https://socket.io/docs/v4/client-api/) for WebSocket connections.
- **API Client**: [Axios](https://axios-http.com/) for making REST requests to the backend server.
- **Styling**: Modern, premium UI built using CSS.

### Backend (`/server`)
- **Server Framework**: [Express.js](https://expressjs.com/) on Node.js
- **Database**: [MongoDB](https://www.mongodb.com/) (using [Mongoose](https://mongoosejs.com/) for ODM)
- **WebSockets**: [Socket.io](https://socket.io/) for managing active rooms and real-time events.
- **HTTP Logger**: [Morgan](https://github.com/expressjs/morgan) for developer logging.

---

## ✨ Features

1. **Secure User Authentication**: Seamless login and signup powered by Clerk.
2. **Profile Onboarding**: Guided profile creation (username, display name, bio, and avatar) on first sign-in.
3. **Direct Real-Time Messaging**: Chat messages are delivered instantly via WebSockets to active conversation rooms and the recipient's personal socket.
4. **Dynamic Sidebar Tabs**:
   - **Chats Tab**: Lists all current conversations, ordered by latest activity, complete with real-time last-message text previews and timestamps.
   - **Users Tab**: Lists all other registered users in the database, showing their real-time presence indicators.
5. **Real-Time Presence Tracking**: Real-time online/offline indicators (green status dots) that update dynamically as users join or leave the app.
6. **Live User List Synchronization**: When a new user registers or signs in, other online clients automatically refresh their sidebar "Users" list in real-time without requiring a page refresh.
7. **Typing Indicators**: Active "typing..." states displayed in the chat header when the other participant is typing in the message box.
8. **Spacious, Overlap-Free Layout**: Clean message bubble designs with built-in width guards to prevent message text from overlapping with timestamps or status indicators.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally at `mongodb://127.0.0.1:27017`

### 1. Setup the Backend Server
Navigate to the `/server` directory:
```bash
cd server
npm install
```
Configure environment variables:
Create a `.env` file in `/server` (see `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/realtime_chat
```
Start the server in development mode:
```bash
npm run dev
```

### 2. Setup the Frontend Client
Navigate to the `/client` directory:
```bash
cd ../client
npm install
```
Configure environment variables:
Create a `.env` file in `/client` (see `.env.example`):
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKETIO_SERVER_URL=http://localhost:5000
```
Start the client in development mode:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📂 Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/      # React UI components (sidebar, chat bubbles, inputs)
│   │   ├── hooks/           # Custom React hooks (useSocket)
│   │   ├── lib/             # Utility modules (API callers)
│   │   ├── pages/           # Pages (Login, Onboarding, ChatDashboard)
│   │   ├── App.jsx          # Main routing & Clerk profile sync
│   │   └── main.jsx         # App mounting
│   ├── index.html           # Main HTML document
│   └── package.json
│
└── server/
    ├── config/              # DB connections
    ├── controllers/         # Request handling logic
    ├── models/              # Mongoose schemas (users, messages, conversations)
    ├── routes/              # Express API endpoints
    ├── services/            # Database transactions
    ├── index.js             # Express startup and Socket.io handlers
    └── package.json
```
