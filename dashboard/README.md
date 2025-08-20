# Frontend Dashboard

This is a React-based dashboard for managing purchase invoices with backend integration.

## Prerequisites
- Node.js (v14 or higher)
- Backend server running on port 6768

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will run on `http://localhost:5173`

## Features

- **Purchase Invoice Management**: Create and manage purchase invoices
- **Vendor Management**: Search and select from existing vendors
- **Product Management**: Add multiple products with quantities and costs
- **Real-time Database Connection**: Live connection status indicator
- **Responsive Design**: Works on desktop and mobile devices

## API Integration

The frontend connects to the backend API using axios with the following configuration:

- **Base URL**: `http://localhost:6768/api`
- **Timeout**: 10 seconds
- **CORS**: Enabled for local development

### API Endpoints Used

- `GET /api/invoices` - Fetch all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/vendors/list` - Fetch vendor list
- `GET /` - Health check

## Connection Status

The application displays real-time connection status:
- ✅ **Connected**: Backend is reachable
- ❌ **Disconnected**: Backend is not responding
- ⟳ **Checking**: Verifying connection

## Development

- Built with React 19
- Styled with Tailwind CSS
- Uses Vite for fast development
- Includes ESLint for code quality
