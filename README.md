<h1>
  <img src="./frontend/public/logo.svg" alt="Yātrika logo" width="40" height="40" style="vertical-align:middle; margin-right:2px;" />
  Yātrika
</h1>Yātrika

## Overview

Yātrika is an AI-powered travel planning web application designed to transform the overwhelming task of trip planning into a delightful, data-driven conversation. It guides users from a vague idea or inspirational photo to a concrete, personalized itinerary enriched with live, real-time data on weather, traffic, and crowd levels.

## Vision

To create the most intuitive, insightful, and visually stunning travel planning experience, synthesizing fragmented travel information into a cohesive, optimized plan.

## Core Features

- **Conversational AI Core:** Stateful, multi-step planning via LangGraph-powered backend.
- **Multimodal Input:** Users can start planning with text or an inspirational photo.
- **Live Data Integration:** Real-time weather, crowd, and traffic insights for smarter planning.
- **Magic Link Authentication:** Secure, passwordless login and itinerary saving.
- **Itinerary Persistence:** Plans are saved to user accounts for access across devices.

## User Experience

- Minimalist, beautiful UI with a single conversational prompt.
- Clarification loop to gather user preferences and requirements.
- Data-enriched itinerary suggestions with actionable insights.
- Accessible, responsive, and visually calm design.

## Tech Stack

**Frontend:**

- Vite, React (TypeScript), TailwindCSS
- shadcn/ui (UI components), Zustand (state), React Router, Framer Motion, React Icons

**Backend:**

- Node.js, Express
- LangChain.js, LangGraph.js (AI orchestration)
- Zod (validation), Helmet (security), express-rate-limit
- Supabase (database & auth)

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone git@github.com:raghusbhat/yatrika.git
   cd yatrika
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in required values (API keys, Supabase, etc.).
4. **Run the development servers:**
   - Frontend: `npm run dev` (from `frontend/`)
   - Backend: `npm run dev` (from `backend/`)

## Project Structure

- `frontend/` — React app (Vite, shadcn/ui, Zustand)
- `backend/` — Express server (LangChain, LangGraph, API integrations)
- `PROJECT.txt` — Product requirements and coding guidelines

## License

This project is for educational and demonstration purposes. See `LICENSE` for details.
