# Complete Setup Guide - Purchase Invoice System

This guide will help you set up the complete purchase invoice system with backend and frontend integration.

## Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (running locally or cloud instance)
- **Git** (for version control)

## Project Structure

```
project1/
├── backend/                 # Express.js backend server
│   ├── config/
│   │   └── mongodb.js      # MongoDB connection
│   ├── controllers/
│   │   └── purchaseController.js
│   ├── models/
│   │   └── purchaseModel.js
│   ├── routes/
│   │   └── purchaseRoutes.js
│   ├── server.js           # Main server file
│   └── package.json
└── dashboard/              # React frontend
    ├── src/
    │   ├── ApiService.js   # Axios API service
    │   ├── pages/
    │   │   └── PurchaseInvoice.jsx
    │   └── ...
    └── package.json
```

## Step 1: Backend Setup

### 1.1 Navigate to backend directory
```bash
cd backend
```

### 1.2 Install dependencies
```bash
npm install
```

### 1.3 Create environment file
Create a `.env` file in the backend directory:
```env
PORT=6768
MONGO_URI=mongodb://localhost:27017/purchase_invoice_db
NODE_ENV=development
```

**Note**: If you're using MongoDB Atlas, replace the MONGO_URI with your connection string.

### 1.4 Start the backend server
```bash
npm start
```

You should see:
```
Server is running on port 6768
Connected to MongoDB successfully.
```

## Step 2: Frontend Setup

### 2.1 Navigate to dashboard directory
```bash
cd dashboard
```

### 2.2 Install dependencies
```bash
npm install
```

### 2.3 Start the frontend development server
```bash
npm run dev
```

You should see:
```
Local:   http://localhost:5173/
```

## Step 3: Verify Connection

### 3.1 Test backend connection
In the backend directory, run:
```bash
node test-connection.js
```

This will test all API endpoints and show connection status.

### 3.2 Check frontend connection
Open your browser and navigate to `http://localhost:5173`

You should see:
- ✅ **Connected to Database** status indicator
- Purchase Invoice form ready to use

## Step 4: Using the Application

### 4.1 Create a Purchase Invoice
1. Fill in the purchase date
2. Type vendor name (will show dropdown of existing vendors)
3. Enter phone number (10 digits)
4. Add products with quantities and costs
5. Click "Save Invoice"

### 4.2 Features Available
- **Real-time vendor search**: Type to find existing vendors
- **Auto-calculation**: Total costs are calculated automatically
- **Database persistence**: All data is saved to MongoDB
- **Connection monitoring**: Live status of backend connection

## API Endpoints

### Backend API (http://localhost:6768/api)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/invoices` | Get all invoices |
| POST | `/invoices` | Create new invoice |
| GET | `/invoices/:id` | Get invoice by ID |
| PUT | `/invoices/:id` | Update invoice |
| DELETE | `/invoices/:id` | Delete invoice |
| GET | `/invoices/vendors/list` | Get all vendors |

## Troubleshooting

### Backend Issues
1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check MONGO_URI in .env file
   - Verify network connectivity

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing process on port 6768

### Frontend Issues
1. **Cannot Connect to Backend**
   - Ensure backend server is running
   - Check if backend is on port 6768
   - Verify CORS settings

2. **API Calls Failing**
   - Check browser console for errors
   - Verify API_BASE_URL in ApiService.js
   - Ensure backend endpoints are working

## Development

### Backend Development
- Server auto-restarts with nodemon
- Check console for API request logs
- MongoDB connection status in console

### Frontend Development
- Hot reload enabled with Vite
- API requests logged in browser console
- Real-time connection status display

## Production Deployment

### Backend
1. Set NODE_ENV=production
2. Use environment-specific MongoDB URI
3. Configure proper CORS origins
4. Set up proper error logging

### Frontend
1. Build the application: `npm run build`
2. Serve static files from a web server
3. Update API_BASE_URL for production backend

## Support

If you encounter any issues:
1. Check the console logs in both backend and frontend
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check network connectivity between frontend and backend

