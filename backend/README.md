# Backend Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or cloud instance)

## Environment Variables
Create a `.env` file in the backend directory with the following variables:

```
PORT=6768
MONGO_URI=mongodb://localhost:27017/purchase_invoice_db
NODE_ENV=development
```

## Installation
1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on port 6768 by default.

## API Endpoints

### Purchase Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/:id` - Get invoice by ID
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/invoices/vendors/list` - Get all vendors

### Health Check
- `GET /` - Server health check

## Database Connection
The application connects to MongoDB using the connection string from the MONGO_URI environment variable.

