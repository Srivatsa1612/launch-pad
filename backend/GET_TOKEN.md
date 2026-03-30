# Quick Start: Get Your Fabric Token

Run this command from the backend directory:

```bash
npm run get-token
```

This will attempt to retrieve a fresh Fabric access token using Azure CLI.

## If the command fails:

### Option 1: Azure CLI
```bash
az login
az account get-access-token --resource https://analysis.windows.net/powerbi/api --query accessToken -o tsv
```

### Option 2: PowerShell
```powershell
Connect-PowerBIServiceAccount
(Get-PowerBIAccessToken).GetPlainText()
```

### Option 3: Browser DevTools
1. Open https://app.fabric.microsoft.com
2. Press F12 → Network tab
3. Click any API request
4. Copy the Bearer token from Authorization header

## Update your .env file

Once you have the token, update `backend/.env`:

```env
FABRIC_TOKEN=<paste-your-token-here>
```

## Need Production Setup?

See [FABRIC_AUTH_GUIDE.md](FABRIC_AUTH_GUIDE.md) for Service Principal setup with automatic token refresh.
