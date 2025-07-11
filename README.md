# Yatrika - AI-Powered Travel Planner

A modern travel planning application that uses Google's Gemini AI to create personalized, structured itineraries. Built with React, Node.js, and a beautiful UI that makes travel planning delightful.

## Features

### 🎯 Intelligent Travel Planning

- **Smart Form Interface**: Guided multi-step form for capturing travel preferences
- **Conversational AI**: Natural language interaction powered by Google Gemini
- **Structured Itineraries**: Beautiful, UI-optimized travel plans instead of plain text

### 🎨 Beautiful UI Components

- **Interactive Itinerary Display**: Tabbed interface with day-by-day activities
- **Rich Media Integration**: Placeholder support for images, videos, and social links
- **Mobile-First Design**: Responsive interface that works great on all devices
- **Modern Design System**: Built with Tailwind CSS and shadcn/ui components

### 🔧 Technical Features

- **Structured Output**: Enforced JSON schema for consistent AI responses
- **Comprehensive Logging**: Full request/response tracking for debugging
- **Rate Limiting**: Built-in quota management and monitoring
- **Type Safety**: Full TypeScript coverage across frontend and backend

## Project Structure

```
yatrika/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/      # Chat interface components
│   │   │   ├── itinerary/ # Structured itinerary display
│   │   │   ├── layout/    # Main layout components
│   │   │   └── ui/        # Reusable UI components (shadcn)
│   │   ├── types/         # TypeScript interfaces
│   │   └── api/           # API client functions
│   └── package.json
├── backend/               # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic (LangGraph integration)
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Security and validation
│   │   └── utils/         # Helper functions
│   └── package.json
└── README.md
```

## Structured Itinerary Format

The application generates rich, structured itineraries in JSON format that includes:

```typescript
interface StructuredItinerary {
  tripOverview: {
    title: string; // "Your 5-Day Adventure in Goa"
    description: string; // Trip summary
    totalBudget: string; // "₹25,000 - ₹35,000"
    highlights: string[]; // Key attractions/experiences
  };
  dailyItinerary: Array<{
    day: number;
    date: string;
    title: string; // "Cultural Immersion Day"
    activities: Array<{
      time: string; // "09:00 AM"
      title: string; // "Visit Red Fort"
      description: string; // Activity details
      location: string; // Specific address
      type:
        | "sightseeing"
        | "food"
        | "activity"
        | "transport"
        | "accommodation"
        | "shopping"
        | "cultural";
      cost?: string; // "₹500"
      difficulty?: "easy" | "moderate" | "challenging";
      tips?: string[]; // Practical advice
    }>;
  }>;
  accommodations: Array<{
    name: string;
    type: string;
    priceRange: string;
    highlights: string[];
  }>;
  restaurants: Array<{
    name: string;
    cuisine: string;
    mustTry: string[]; // Signature dishes
  }>;
  // ... more structured sections
}
```

## UI Components

### Activity Cards

Each activity is displayed as an interactive card featuring:

- **Activity type icons** (🏛️ sightseeing, 🍽️ food, etc.)
- **Timing and duration** information
- **Cost estimates** in local currency
- **Difficulty badges** with color coding
- **Quick action buttons** for maps and photos
- **Pro tips** in highlighted boxes

### Trip Overview Hero

Beautiful gradient hero section with:

- Catchy trip title
- Key highlights as badges
- Duration and budget summary
- Placeholder for destination imagery

### Tabbed Interface

Organized content across multiple tabs:

- **Itinerary**: Day-by-day schedule
- **Hotels**: Accommodation recommendations
- **Food**: Restaurant and cuisine suggestions
- **Transport**: Getting around information
- **Budget**: Cost breakdown

## Setup & Installation

### Prerequisites

- Node.js 18+
- Google Gemini API key

### Backend Setup

```bash
cd backend
npm install

# Create .env file
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
echo "PORT=3001" >> .env

npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:3001" > .env

npm run dev
```

## Development Workflow

1. **Start the backend** on port 3001
2. **Start the frontend** on port 5173
3. **Fill out the form** to provide travel preferences
4. **Submit to get** a beautiful structured itinerary

## API Endpoints

- `POST /api/clarify/enhanced` - Main form submission endpoint
- `GET /api/quota/status` - Check API usage quotas

## Key Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **AI**: Google Gemini 1.5 Flash with structured output
- **UI Components**: shadcn/ui, Radix UI, Lucide icons
- **Validation**: Zod schema validation
- **State Management**: React hooks with TypeScript

## Environment Variables

### Backend

```env
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

### Frontend

```env
VITE_API_BASE_URL=http://localhost:3001
```

## Contributing

This is a focused travel planning application. The current implementation prioritizes:

- Clean, maintainable code
- Beautiful user experience
- Structured AI responses
- Type safety throughout

## License

MIT License - feel free to use this project as inspiration for your own travel applications!
