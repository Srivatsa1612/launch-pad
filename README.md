# flowCUSTODIAN Welcome Wizard

A comprehensive onboarding wizard for flowCUSTODIAN - M-Theory's Concierge-Powered Workflow Co-Pilot service.

## Overview

This wizard guides new customers through the flowCUSTODIAN setup process, collecting essential information for service initialization including contacts, service details, HR integration, hardware requirements, and support connections.

## Features

- 7-step wizard interface with progress tracking
- Dynamic form validation
- Integration with Microsoft Fabric (Livy API) for data persistence
- Responsive design with dark theme
- Save and resume functionality
- Real-time data synchronization

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Backend**: Node.js/Express
- **Data Storage**: Microsoft Fabric Lakehouse (via Livy API)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios

## Project Structure

```
flowcustodian-wizard/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Wizard step pages
│   │   ├── context/         # React context for state management
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/
│   └── package.json
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── config/          # Configuration
│   │   └── routes/          # API routes
│   └── package.json
├── database/                 # Database schema and scripts
│   └── schema.sql           # Table definitions
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- Access to Microsoft Fabric workspace
- Livy API endpoint credentials

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/TheOtherJamesHerring/flowCustodian
cd flowcustodian-wizard
```

### 2. Configure Environment Variables

Create `.env` files in both frontend and backend directories:

**backend/.env:**
```env
PORT=3001
LIVY_ENDPOINT=https://api.fabric.microsoft.com/v1/workspaces/5f7eb81b-75d3-4371-936c-33906f6ccdb0/lakehouses/e133ff32-cbea-46ec-9d21-474106428d65/livyapi/versions/2023-12-01/sessions
FABRIC_TOKEN=<your-fabric-token>
LAKEHOUSE_ID=e133ff32-cbea-46ec-9d21-474106428d65
WORKSPACE_ID=5f7eb81b-75d3-4371-936c-33906f6ccdb0
```

**frontend/.env:**
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Initialize Database

The backend will automatically create necessary tables in your Fabric Lakehouse on first run.

### 5. Run the Application

```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Database Schema

The wizard uses the following tables in Microsoft Fabric:

- `wizard_sessions` - Main wizard session data
- `key_contacts` - Billing, tech, and emergency contacts
- `service_orders` - Service tier and contract details
- `hr_setup` - HRIS integration configuration
- `hardware_preferences` - Device procurement and welcome gifts
- `support_connections` - Dedicated concierge and leadership contacts

## API Endpoints

### Sessions
- `POST /api/sessions` - Create new wizard session
- `GET /api/sessions/:sessionId` - Retrieve session data
- `PUT /api/sessions/:sessionId` - Update session data
- `POST /api/sessions/:sessionId/complete` - Mark session as complete

### Contacts
- `POST /api/contacts` - Save key contacts
- `GET /api/contacts/:sessionId` - Get contacts for session

### Service Order
- `POST /api/service-order` - Save service order details
- `GET /api/service-order/:sessionId` - Get service order

### HR Setup
- `POST /api/hr-setup` - Save HR configuration
- `GET /api/hr-setup/:sessionId` - Get HR setup
- `POST /api/hr-setup/:sessionId/upload` - Upload employee data file

### Hardware
- `POST /api/hardware` - Save hardware preferences
- `GET /api/hardware/:sessionId` - Get hardware preferences

### Support
- `POST /api/support` - Save support connections
- `GET /api/support/:sessionId` - Get support connections

## Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# The build output will be in frontend/build/
```

## Deployment

1. Build the frontend application
2. Deploy backend to your Node.js hosting service
3. Update environment variables for production
4. Configure CORS settings for production domain
5. Set up SSL certificates

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

© 2026 M-Theory. All rights reserved.

## Support

For issues or questions, contact:
- Email: info@m-theorygrp.com
- Website: mtheorygroup.com
