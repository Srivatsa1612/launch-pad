# flowCUSTODIAN Wizard Setup Guide

## Quick Start (5 minutes)

### 1. Prerequisites Check
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
git --version   # Any recent version
```

### 2. Clone & Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd flowcustodian-wizard

# Setup backend
cd backend
cp .env.example .env
# Edit .env with your Fabric credentials
npm install

# Setup frontend (in new terminal)
cd ../frontend
cp .env.example .env
npm install
```

### 3. Configure Microsoft Fabric

Edit `backend/.env`:
```env
LIVY_ENDPOINT=https://api.fabric.microsoft.com/v1/workspaces/YOUR_WORKSPACE/lakehouses/YOUR_LAKEHOUSE/livyapi/versions/2023-12-01/sessions
FABRIC_TOKEN=your_token_here
WORKSPACE_ID=your_workspace_id
LAKEHOUSE_ID=your_lakehouse_id
```

**Getting your Fabric Token:**
1. Go to Microsoft Fabric Portal
2. Navigate to your workspace
3. Open Developer settings
4. Generate a new API token
5. Copy the token to your .env file

### 4. Initialize Database
```bash
cd backend
npm run dev
# The server will automatically create tables on first run
```

### 5. Start Development
```bash
# Terminal 1 - Backend (from backend/)
npm run dev

# Terminal 2 - Frontend (from frontend/)
npm start
```

Visit http://localhost:3000

## Project Structure Explained

```
flowcustodian-wizard/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   └── index.js       # Environment config
│   │   ├── services/          # Business logic
│   │   │   ├── livyService.js # Fabric/Livy integration
│   │   │   └── wizardService.js # Wizard workflow logic
│   │   ├── routes/            # API endpoints
│   │   │   └── index.js       # All routes defined here
│   │   └── server.js          # Express app entry point
│   └── package.json
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   └── ProgressBar.js
│   │   ├── pages/             # Wizard steps
│   │   │   ├── WelcomePage.js         # Step 1
│   │   │   ├── KeyContactsPage.js     # Step 2
│   │   │   ├── ServiceOrderPage.js    # Step 3
│   │   │   ├── HRSetupPage.js         # Step 4
│   │   │   ├── HardwarePage.js        # Step 5
│   │   │   ├── SupportPage.js         # Step 6
│   │   │   └── CompletionPage.js      # Step 7
│   │   ├── context/           # State management
│   │   │   └── WizardContext.js
│   │   ├── services/          # API client
│   │   │   └── api.js
│   │   ├── App.js             # Main app component
│   │   ├── index.js           # React entry point
│   │   └── index.css          # Global styles
│   └── package.json
│
└── database/
    └── schema.sql              # Database schema
```

## API Endpoints Reference

### Sessions
- `POST /api/sessions` - Create new wizard session
  - Body: `{ "companyName": "Acme Corp" }`
  - Returns: `{ "sessionId": "uuid", "companyName": "...", "currentStep": 1 }`

- `GET /api/sessions/:sessionId` - Get complete session data
  - Returns: All wizard data for the session

- `POST /api/sessions/:sessionId/complete` - Mark wizard as complete
  - Returns: `{ "message": "Session completed successfully" }`

### Contacts
- `POST /api/contacts` - Save key contacts
  - Body: `{ "sessionId": "uuid", "contacts": {...} }`

- `GET /api/contacts/:sessionId` - Retrieve contacts

### Service Order
- `POST /api/service-order` - Save service order details
- `GET /api/service-order/:sessionId` - Retrieve service order

### HR Setup
- `POST /api/hr-setup` - Save HR configuration
- `GET /api/hr-setup/:sessionId` - Retrieve HR setup
- `POST /api/hr-setup/:sessionId/upload` - Upload employee data file
  - Content-Type: multipart/form-data
  - Field name: employeeFile

### Hardware
- `POST /api/hardware` - Save hardware preferences
- `GET /api/hardware/:sessionId` - Retrieve hardware preferences

### Support
- `POST /api/support` - Save support connections
- `GET /api/support/:sessionId` - Retrieve support connections

## Database Schema Overview

### wizard_sessions
Main session tracking table
- session_id (PK)
- company_name
- created_at, updated_at, completed_at
- current_step
- status (in_progress, completed, abandoned)

### key_contacts
Contact information storage
- contact_id (PK)
- session_id (FK)
- billing_name, billing_email, billing_phone
- tech_name, tech_email, tech_phone
- emergency_name, emergency_email, emergency_phone

### service_orders
Service tier and contract details
- order_id (PK)
- session_id (FK)
- service_tier, start_date, contract_term
- monthly_commitment, included_features

### hr_setup
HR system integration
- hr_setup_id (PK)
- session_id (FK)
- hris_system, update_method
- employee_file_path, employee_count

### hardware_preferences
Device and welcome gift preferences
- hardware_id (PK)
- session_id (FK)
- device_procurement, device_requirements
- welcome_gift

### support_connections
Support team contacts
- support_id (PK)
- session_id (FK)
- concierge details, leadership details
- support_procedure_acknowledged

## Customization Guide

### Changing the Wizard Steps

1. **Add a new step:**
   - Create a new page component in `frontend/src/pages/`
   - Add the route in `App.js`
   - Update the total steps in `ProgressBar.js`

2. **Modify existing steps:**
   - Edit the page component
   - Update the corresponding API endpoint if data structure changes
   - Update the database schema if needed

### Styling

The project uses Tailwind CSS with custom theme extensions:

- Primary color: Purple (#8b5cf6)
- Dark theme colors defined in `tailwind.config.js`
- Custom components in `index.css` (card, input-field, btn-primary, etc.)

To customize:
1. Edit `frontend/tailwind.config.js` for theme colors
2. Modify `frontend/src/index.css` for custom components
3. Use Tailwind utility classes in components

### Branding

Replace the following:
- Company name: "flowCUSTODIAN" → Your brand
- Logo: Update SVG in ProgressBar.js and other components
- Colors: Modify Tailwind config
- Footer: Update copyright in CompletionPage.js

## Deployment

### Backend Deployment
1. Build production: `npm run build` (if using TypeScript)
2. Set environment variables on hosting platform
3. Deploy to Node.js hosting (Azure App Service, AWS Elastic Beanstalk, etc.)

### Frontend Deployment
1. Build: `npm run build`
2. Deploy `build/` folder to:
   - Azure Static Web Apps
   - AWS S3 + CloudFront
   - Netlify
   - Vercel

### Environment Variables for Production
```env
# Backend
NODE_ENV=production
PORT=443
LIVY_ENDPOINT=<production-endpoint>
FABRIC_TOKEN=<production-token>
CORS_ORIGIN=https://your-domain.com

# Frontend
REACT_APP_API_URL=https://api.your-domain.com/api
```

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check Node.js version (must be 18+)
- Verify .env file exists and has correct values
- Check if port 3001 is available

**Frontend build fails:**
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version

**Database connection fails:**
- Verify Fabric token is valid
- Check workspace and lakehouse IDs
- Ensure Livy endpoint is accessible

**CORS errors:**
- Verify CORS_ORIGIN in backend .env matches frontend URL
- Check that frontend is calling correct API URL

### Logs
- Backend logs: Console output when running `npm run dev`
- Frontend logs: Browser console (F12)
- Check Network tab for API call details

## Git Workflow

### Initial Setup
```bash
# Initialize git repo
git init
git add .
git commit -m "Initial commit: flowCUSTODIAN wizard"

# Add remote
git remote add origin <your-github-url>
git push -u origin main
```

### Development Workflow
```bash
# Create feature branch
git checkout -b feature/new-step

# Make changes
git add .
git commit -m "Add new wizard step"

# Push to GitHub
git push origin feature/new-step

# Create Pull Request on GitHub
```

## Support

For issues or questions:
- Check the README.md
- Review this setup guide
- Contact: info@m-theorygrp.com

## License

© 2026 M-Theory. All rights reserved.
