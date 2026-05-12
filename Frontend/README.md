# Sponsorly Frontend

Frontend client for Sponsorly, built with React + Vite. It supports authentication, campaign discovery/management, collaboration requests, chat, profiles, and dashboards for creator/sponsor workflows.

## Tech Stack

- React 19
- Vite
- React Router v6
- Redux Toolkit + React Redux
- Tailwind CSS
- Axios
- Lucide React

## Prerequisites

- Node.js 18+
- npm 9+
- Running Sponsorly backend API

## Environment

Create a `.env` file in this folder:

```env
VITE_API_URL=http://localhost:4000/
```

Note: `src/services/api.js` builds the base URL as `${VITE_API_URL}api/v1`, so keep the trailing slash in `VITE_API_URL`.

## Run Locally

```bash
npm install
npm run dev
```

Default dev URL:

```text
http://localhost:5173
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Application Routes

Public routes:

- `/`
- `/login`
- `/signup`
- `/creators`
- `/creators/:creatorId`

Protected routes:

- `/dashboard`
- `/campaigns`
- `/campaigns/:campaignId/requests`
- `/chat`
- `/profile`
- `/sponsors`
- `/sponsors/:sponsorId`

## Core Features

- Auth with token-based session handling
- Campaign create/edit/delete and discovery
- Collaboration request flow:
- Creator requests sponsor campaigns
- Sponsor requests creator campaigns
- Campaign owners review, accept, or reject requests
- Chat (direct and project-scoped)
- Public and private profile pages
- Dashboard and activity views

## API Integration

All API calls are centralized in `src/services/api.js`.

Main endpoint groups:

- `authAPI`
- `creatorCampaignAPI`
- `sponsorCampaignAPI`
- `collabAPI`
- `chatAPI`
- `reviewAPI`
- `creatorAPI`
- `sponsorAPI`
- `agentAPI`

Request authorization is handled by an Axios interceptor that attaches `Authorization: Bearer <accessToken>` when present.

## Project Structure

```text
src/
	components/
		Layout/
		common/
	context/
	pages/
		auth/
	redux/
		slices/
	services/
	theme/
	utils/
	App.jsx
	main.jsx
```
