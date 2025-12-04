# ChatBot Gemini

An AI-powered chatbot application built with Next.js and Google Gemini AI. Features bilingual support, real-time streaming responses, and conversation management.

Live Demo: https://chatbot-gemini-alpha.vercel.app/

## Description

This is a full-stack web application that integrates Google Gemini's Large Language Model to provide intelligent conversational AI capabilities. The application supports both English and French languages and includes user authentication, conversation history, and real-time response streaming.

## Technologies Used

- Next.js 14 with App Router
- TypeScript
- Google Gemini AI API
- Supabase for authentication and database
- Tailwind CSS for styling
- Framer Motion for animations

## Key Features

- Bilingual interface supporting English and French
- Real-time streaming responses from Google Gemini LLM
- User authentication and authorization
- Conversation history management
- Create, view, and delete conversations
- Token usage metrics and performance tracking
- Responsive design for all devices
- Modern UI with smooth animations

## Installation

Clone the repository:

```bash
git clone https://github.com/Taha-Yassine-Hadded/chatbot-gemini.git
cd chatbot-gemini
```

Install dependencies:

```bash
npm install
```

Create a .env.local file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Database Setup

You need to create two tables in your Supabase project:

conversations table:
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- title (text)
- created_at (timestamp)

messages table:
- id (uuid, primary key)
- conversation_id (uuid, foreign key to conversations)
- role (text)
- content (text)
- created_at (timestamp)

Enable Row Level Security on both tables to ensure users can only access their own data.

## Deployment

This application is deployed on Vercel. To deploy your own instance:

1. Push your code to GitHub
2. Import the project on Vercel
3. Add the environment variables in Vercel project settings
4. Deploy

## Note

This application uses Google Gemini's free tier API. The chatbot may become temporarily unavailable after reaching the daily API request limit.

## License

MIT

## Author

Taha Yassine Hadded
