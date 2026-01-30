# Troubleshooting: "Failed to Save Profile" Error

## Problem
When clicking "Save and Create Invitation" in `/admin/customer-setup`, you get an error: "Failed to Save profile"

## Root Causes

### 1. Backend Server Not Running
**Check:** Is the backend server running on port 3001?

**Solution:**
```bash
cd backend
npm run dev
```

You should see:
```
✓ Connected to SQL Server: flowCUSTODIAN
Server running on port 3001
```

### 2. Missing Database Configuration
**Check:** Does `backend/.env` file exist with database settings?

**Solution:**
1. Create `backend/.env` from the example:
```bash
cd backend
cp .env.example .env
```

2. Ensure these database settings are configured:
```env
DB_SERVER=MTCG-SQL-DEV
DB_NAME=flowCUSTODIAN
DB_USER=MTGAdmin
DB_PASSWORD=Mtg2022!
```

### 3. Database Connection Issues
**Check:** Can the backend connect to SQL Server?

**Test the connection:**
```bash
cd backend
node test-db-connection.js
```

Expected output:
```
✓ Connected to SQL Server: flowCUSTODIAN
✓ Test query successful
```

**Common issues:**
- SQL Server not running
- Firewall blocking connection
- Wrong credentials
- Database doesn't exist

### 4. Missing Stored Procedures
**Check:** Are the staging workflow stored procedures created?

**Test:**
```bash
cd backend
node test-staging-tables.js
```

Expected output:
```
✓ customer_profiles_staging table exists
✓ profile_audit_log table exists
✓ profile_reviewers table exists
✓ sp_SaveProfileToStaging exists
✓ sp_SubmitProfileForReview exists
...
```

**Solution if missing:**
Run the SQL script:
```sql
-- In SQL Server Management Studio or Azure Data Studio
-- Connect to MTCG-SQL-DEV database
-- Run: database/STAGING_APPROVAL_SCHEMA.sql
```

### 5. CORS Issues
**Check:** Browser console for CORS errors

**Solution:**
Ensure `backend/.env` has:
```env
CORS_ORIGIN=http://localhost:3000
```

## Quick Diagnostic Steps

1. **Check browser console** (F12 → Console tab)
   - Look for network errors
   - Check the actual error message
   - Red network requests indicate backend connection issues

2. **Check backend terminal**
   - Look for SQL connection errors
   - Check for stored procedure errors
   - Verify request is received

3. **Check browser network tab** (F12 → Network tab)
   - Find the POST request to `/api/admin/staging/profiles`
   - Check status code (500 = server error, 404 = endpoint not found, 0 = can't connect)
   - View response body for error details

## Step-by-Step Fix

1. **Stop all servers** (Ctrl+C in both terminals)

2. **Create/update backend/.env:**
```bash
cd backend
cp .env.example .env
```

Edit `.env` and ensure database settings are present.

3. **Test database connection:**
```bash
node test-db-connection.js
```

If this fails, check:
- SQL Server is running
- Credentials are correct
- Network/VPN is connected

4. **Verify stored procedures exist:**
```bash
node test-staging-tables.js
```

If procedures are missing, run `database/STAGING_APPROVAL_SCHEMA.sql` in SQL Server.

5. **Start backend server:**
```bash
npm run dev
```

Wait for "✓ Connected to SQL Server: flowCUSTODIAN"

6. **Start frontend server** (new terminal):
```bash
cd frontend
npm start
```

7. **Test the save function:**
   - Go to http://localhost:3000/admin/customer-setup
   - Fill in company name
   - Click "Save and Create Invitation"
   - Check browser console for detailed error if it fails

## Enhanced Error Messages

The frontend now shows more detailed error messages:
- **"Cannot connect to server..."** → Backend not running
- **"Failed to save profile: [specific error]"** → Check backend logs
- **Network errors** → Check CORS configuration

## Still Having Issues?

Check the backend logs for detailed error messages. The error will show:
- SQL connection issues
- Missing stored procedures
- Parameter validation errors
- Database constraint violations

Look in the terminal where `npm run dev` is running for backend errors.
