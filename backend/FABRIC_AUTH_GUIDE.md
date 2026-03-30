# Fabric Capacity Authentication Guide

This project supports two authentication methods for connecting to Microsoft Fabric:

## 🔐 Authentication Methods

### 1. User Token Authentication (Default)
**Best for:** Development, personal use, quick testing

**Pros:**
- Simple setup
- No Azure AD configuration needed
- Works immediately with your user credentials

**Cons:**
- Tokens expire after ~1 hour
- Requires manual token refresh
- Not suitable for production/automation

**Setup:**
1. Get a fresh token using one of these methods:

   **Azure CLI (Recommended):**
   ```bash
   az login
   az account get-access-token --resource https://analysis.windows.net/powerbi/api --query accessToken -o tsv
   ```

   **PowerShell:**
   ```powershell
   Connect-PowerBIServiceAccount
   (Get-PowerBIAccessToken).GetPlainText()
   ```

   **Browser DevTools:**
   - Open https://app.fabric.microsoft.com
   - Press F12 → Network tab
   - Click any API request
   - Copy Bearer token from Authorization header

2. Update `backend/.env`:
   ```env
   FABRIC_AUTH_TYPE=user
   FABRIC_TOKEN=<your-token-here>
   ```

3. Helper script:
   ```bash
   cd backend
   node scripts/getToken.js
   ```

---

### 2. Service Principal Authentication (Recommended for Production)
**Best for:** Production, CI/CD, automation, long-running services

**Pros:**
- Automatic token refresh
- No manual intervention
- Secure and production-ready
- Tokens valid for longer periods

**Cons:**
- Requires Azure AD app registration
- More complex initial setup

**Setup:**

#### Step 1: Create Azure AD App Registration
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
   - Name: `FlowCustodian-Fabric-Access`
   - Supported account types: Single tenant
   - Click **Register**

#### Step 2: Create Client Secret
1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
   - Description: `Fabric API Access`
   - Expires: Choose duration (24 months recommended)
3. **Copy the secret value immediately** (you won't see it again!)

#### Step 3: Note Your Credentials
Copy these values from the app Overview page:
- **Application (client) ID**
- **Directory (tenant) ID**
- **Client secret** (from Step 2)

#### Step 4: Grant Fabric Permissions
1. Go to [Power BI Admin Portal](https://app.powerbi.com/admin-portal/tenantSettings)
2. Navigate to **Developer settings**
3. Enable **Service principals can use Power BI APIs**
4. Add your app to **Specific security groups** or **Entire organization**

#### Step 5: Add Service Principal to Workspace
1. Open your Fabric workspace
2. Click **Manage access**
3. Add the service principal:
   - Enter the app name
   - Assign **Contributor** or **Admin** role
4. Click **Add**

#### Step 6: Configure Environment
Update `backend/.env`:
```env
FABRIC_AUTH_TYPE=service-principal

# Service Principal Credentials
AZURE_CLIENT_ID=<your-application-client-id>
AZURE_CLIENT_SECRET=<your-client-secret>
AZURE_TENANT_ID=<your-tenant-id>

# Workspace Configuration (same as before)
LIVY_ENDPOINT=https://api.fabric.microsoft.com/v1/workspaces/<workspace-id>/lakehouses/<lakehouse-id>/livyapi/versions/2023-12-01/sessions
WORKSPACE_ID=<your-workspace-id>
LAKEHOUSE_ID=<your-lakehouse-id>
```

---

## 🚀 Testing Your Connection

After configuring either method:

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Check the console output:
   - ✓ Should see "Fabric authentication initialized"
   - ❌ If error, check your credentials

3. Test API endpoint:
   ```bash
   curl http://localhost:3001/api/health
   ```

---

## 🔄 Token Management

### User Token
- Tokens expire after ~1 hour
- The app will warn you 5 minutes before expiry
- Get a new token and update `.env`, then restart the server

### Service Principal
- Tokens automatically refresh before expiry
- No manual intervention needed
- Runs indefinitely

---

## 🛠️ Troubleshooting

### "Token expired" error
**User Auth:** Get a fresh token and update `.env`  
**Service Principal:** Check if client secret has expired

### "401 Unauthorized"
- Verify workspace and lakehouse IDs
- Ensure service principal has workspace access
- Check if service principals are enabled in tenant settings

### "403 Forbidden"
- Service principal needs Contributor or Admin role in workspace
- Verify API permissions in Azure AD

### "Service Principal authentication failed"
- Double-check client ID, secret, and tenant ID
- Ensure no extra spaces in `.env` file
- Verify secret hasn't expired

---

## 📚 Additional Resources

- [Fabric REST API Documentation](https://learn.microsoft.com/en-us/rest/api/fabric/articles/)
- [Service Principal Setup Guide](https://learn.microsoft.com/en-us/power-bi/enterprise/service-premium-service-principal)
- [Azure AD App Registration](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

---

## 🔒 Security Best Practices

1. **Never commit tokens or secrets to Git**
   - `.env` is in `.gitignore`
   - Use `.env.example` for templates

2. **Use Service Principal in production**
   - More secure than user tokens
   - Better audit trail
   - Proper access control

3. **Rotate secrets regularly**
   - Update client secrets before expiry
   - Keep backup secrets during rotation

4. **Limit permissions**
   - Grant minimum required workspace role
   - Use specific security groups
   - Review access periodically
