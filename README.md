# 🤝 Sponserly

> A full-stack platform connecting **Sponsors** and **Creators** for seamless collaboration, campaign management, and AI-powered matchmaking.

[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/Frontend-React%2019-blue?logo=react)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?logo=mongodb)](https://mongodb.com)
[![Python](https://img.shields.io/badge/AI-FastAPI%20%2B%20OpenAI-yellow?logo=python)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-ISC-lightgrey)](LICENSE)

---

## 📖 Overview

**Sponserly** is a three-tier web application that bridges the gap between content creators and sponsors. Sponsors can post campaigns, discover creators, and manage collaboration requests — while creators can showcase their work, apply for sponsorships, and communicate directly with sponsors. An integrated **AI Agent** helps both sides find the best matches based on tags and interests.

---

## ✨ Features

### 👥 User Roles
- **Sponsors** — Post campaigns, discover creators, send/receive collaboration requests, leave reviews.
- **Creators** — Showcase portfolios, apply to sponsor campaigns, chat with collaborators, receive reviews.

### 🚀 Core Functionality
| Feature | Description |
|---|---|
| **Authentication** | JWT-based auth with secure HTTP-only cookies and bcrypt password hashing |
| **Campaigns** | Sponsors and creators can each create and manage their own campaign listings |
| **Collaboration Requests** | Bidirectional collab request system between sponsors and creators |
| **Real-time Chat** | Persistent messaging between matched sponsors and creators |
| **Reviews** | Post-collaboration rating and review system |
| **AI Agent** | Smart campaign matchmaking chatbot powered by OpenAI GPT |
| **Media Uploads** | Profile images and assets uploaded via Cloudinary |
| **Public Profiles** | Browsable sponsor and creator public profile pages |

---

## 🏗️ Project Architecture

```
Sponserly/
├── Frontend/        # React 19 + Vite SPA
├── Backend/         # Node.js + Express REST API
└── AI/              # Python FastAPI AI Agent Server
```

The three services communicate over HTTP:
- **Frontend** → **Backend** at `http://localhost:4000/api/v1`
- **Backend** → **AI Server** internally for agent requests

---

## 🛠️ Tech Stack

### Frontend
| Technology | Role |
|---|---|
| React 19 | UI Framework |
| Vite | Build Tool & Dev Server |
| React Router DOM v6 | Client-side Routing |
| Redux Toolkit | Global State Management |
| Axios | HTTP Client |
| Tailwind CSS v3 | Utility-first Styling |
| Lucide React | Icon Library |

### Backend
| Technology | Role |
|---|---|
| Node.js + Express 5 | REST API Server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password Hashing |
| Cloudinary + Multer | Media Upload & Storage |
| cookie-parser | Cookie Handling |
| dotenv | Environment Config |
| Nodemon | Dev Auto-reload |

### AI Service
| Technology | Role |
|---|---|
| Python + FastAPI | AI Microservice Server |
| OpenAI Agents SDK | LLM Agent Orchestration |
| OpenAI GPT-3.5 Turbo | Language Model |
| Pydantic | Request Validation |
| ChromaDB | Vector Database for campaign data |

---

## 📁 Directory Structure

### Backend (`/Backend/src/`)
```
src/
├── app.js                   # Express app setup (CORS, middleware)
├── index.js                 # Server entry point & route registration
├── constants.js             # Shared constants
├── config/                  # Configuration files
├── db/                      # MongoDB connection
├── models/                  # Mongoose schemas
│   ├── User.model.js
│   ├── Sponsor.model.js
│   ├── Creator.model.js
│   ├── SponsorCampaign.model.js
│   ├── CreatorCampaign.model.js
│   ├── SponsorRequestCollab.model.js
│   ├── CreatorRequestCollab.model.js
│   ├── Chat.model.js
│   ├── Review.model.js
│   ├── Transaction.model.js
│   └── Project.model.js
├── controllers/             # Route handler logic
├── routes/                  # API route definitions
│   ├── auth.routes.js
│   ├── sponsors.routes.js
│   ├── creators.routes.js
│   ├── sponsorCampaign.routes.js
│   ├── creatorCampaign.routes.js
│   ├── collabs.routes.js
│   ├── chat.routes.js
│   ├── reviews.routes.js
│   └── agent.routes.js
├── middlewares/             # Auth & upload middleware
└── utils/                   # Helper utilities
```

### Frontend (`/Frontend/src/`)
```
src/
├── App.jsx                  # Root component & route definitions
├── main.jsx                 # React DOM entry point
├── pages/
│   ├── HomePage.jsx
│   ├── DashboardPage.jsx
│   ├── CampaignsPage.jsx
│   ├── CreatorsPage.jsx
│   ├── CreatorPublicProfilePage.jsx
│   ├── SponsorsPage.jsx
│   ├── SponsorPublicProfilePage.jsx
│   ├── ChatPage.jsx
│   ├── ProfilePage.jsx
│   ├── CollabRequestsPage.jsx
│   └── auth/               # Login & Signup pages
├── components/             # Reusable UI components
│   └── Layout/             # App shell / sidebar layout
├── redux/                  # Redux store & slices
├── services/               # Axios API service calls
├── context/                # React Context (e.g., ToastContext)
├── theme/                  # Design tokens & theme config
└── utils/                  # Frontend utility functions
```

### AI Service (`/AI/`)
```
AI/
├── fast_api_server/
│   ├── main.py             # FastAPI app entry point
│   └── server.py           # Route handlers
├── agent/
│   ├── agent.py            # Agent definition & caller
│   └── agent_tools.py      # Tool functions (campaign finders)
├── db/                     # ChromaDB vector store integration
├── user_data/              # User context models
└── requirements.txt        # Python dependencies
```

---

## 🔌 API Endpoints

All backend routes are prefixed with `/api/v1`.

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login & receive JWT cookie |
| `POST` | `/api/v1/auth/logout` | Logout & clear cookie |
| `GET` | `/api/v1/sponsors` | List all sponsors |
| `GET` | `/api/v1/creators` | List all creators |
| `GET/POST` | `/api/v1/sponsor-campaigns` | Manage sponsor campaigns |
| `GET/POST` | `/api/v1/creator-campaigns` | Manage creator campaigns |
| `GET/POST` | `/api/v1/collabs` | Collaboration requests |
| `GET/POST` | `/api/v1/chats` | Chat messages |
| `GET/POST` | `/api/v1/reviews` | Reviews & ratings |
| `POST` | `/api/v1/agent` | AI agent chat interaction |

---

## 🤖 AI Agent

The AI microservice is a **FastAPI** server that hosts an **OpenAI Agents SDK** powered chatbot. The agent:

- Detects user role (`sponsor` or `creator`) from context.
- **Sponsors** → agent calls `creators_compaigns_finder` to surface relevant creator campaigns.
- **Creators** → agent calls `sponsors_compaigns_finder` to surface relevant sponsor campaigns.
- Uses **conversation history chaining** via `previous_response_id` for multi-turn dialogue.
- Queries a **ChromaDB** vector database populated with campaign data for semantic search.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js `>=18`
- Python `>=3.10`
- MongoDB instance (local or Atlas)
- Cloudinary account
- OpenAI API key

---

### 1. Clone the Repository

```bash
git clone https://github.com/MuhammadKhushamAli/Sponsorly.git
cd Sponsorly
```

---

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/`:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_jwt_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend dev server:

```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

---

### 3. Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file in `Frontend/`:

```env
VITE_API_URL=http://localhost:4000/api/v1
```

Start the frontend dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

### 4. AI Service Setup

```bash
cd AI
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

Create a `.env` file in `AI/`:

```env
OPENAI_API_KEY=your_openai_api_key
```

Start the FastAPI server:

```bash
uvicorn fast_api_server.main:app --reload --port 8000
```

The AI service will be available at `http://localhost:8000`.

---

## 👥 Authors

- **Muhammad Khusham Ali**
- **Muhammad Ubaidullah Naeem**
- **Shaiq Raza**
- **Muhammad Zahid**
- **Muhammad Ahmad Hassan**

---

## 🐛 Issues & Contributions

Found a bug or want to contribute? Open an issue or pull request at:
[https://github.com/MuhammadKhushamAli/Sponsorly/issues](https://github.com/MuhammadKhushamAli/Sponsorly/issues)

---

## 📄 License

This project is licensed under the **ISC License**.
