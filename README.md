# SBS Gemini WAP - AI Ingestion System

A specialized React dashboard designed to streamline the ingestion of real estate data from WhatsApp messages. This system utilizes AI to parse unstructured text messages into structured **Inventory** or **Client Request** records, featuring intelligent fuzzy location matching and dynamic forms.

## 🚀 Features

- **Message Dashboard**: View, filter, and manage incoming WhatsApp messages in real-time.
- **AI Extraction Engine**: Automatically parses unstructured message text to extract key details (Price, Area, Location, Bedrooms, etc.).
- **Smart Forms**:
  - **Inventory Form**: Single-select locations, specific property attributes.
  - **Request Form**: Multi-select locations/types, budget ranges, and specifications.
- **Fuzzy Location Matching**: Advanced search to map extracted text to database location IDs with confidence scores.
- **Secure Authentication**: Robust login system with Access/Refresh token rotation.
- **Responsive UI**: Built with a clean, modern interface using Shadcn UI.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) (v18) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (based on Radix UI)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Networking**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Project Structure

```bash
src/
├── api/            # API endpoints and axios configuration
├── components/     # Reusable UI components
│   ├── ai/         # AI Extraction Panel logic
│   ├── forms/      # Inventory and Request forms
│   └── ui/         # Shadcn base components
├── contexts/       # Global state (AuthContext)
├── hooks/          # Custom hooks (use-toast, etc.)
├── pages/          # Main application pages (Dashboard, Extraction, Login)
└── types/          # TypeScript definitions and interfaces
```

## 🔐 Authentication Flow
- The application handles authentication using JWT (JSON Web Tokens):
- **Login**: User logs in via phone number and password.
- **Storage**: Tokens are securely managed in memory/local storage.
- **Interceptor**: Axios interceptors automatically handle 401 errors by attempting to refresh the access token transparently using the refresh token.
- **Session Persistence**: The app verifies the user session on load via the /auth/me endpoint.
