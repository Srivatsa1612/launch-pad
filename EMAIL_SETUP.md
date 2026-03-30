# Email Configuration Guide for flowCUSTODIAN

## Overview
flowCUSTODIAN supports three email providers for sending customer invitations and notifications:
1. **SendGrid** (recommended for Azure deployments)
2. **Azure Communication Services** (native Azure integration)
3. **SMTP** (for testing/local development)

## Configuration Steps

### Option 1: SendGrid (Recommended)

**Why SendGrid?**
- Easy to set up and use
- Excellent deliverability rates
- Free tier: 100 emails/day
- Perfect for Azure App Service deployments
- Detailed analytics and tracking

**Setup:**
1. Create account at https://signup.sendgrid.com/
2. Verify your sender identity (email or domain)
3. Generate API key at https://app.sendgrid.com/settings/api_keys
4. Add to `.env`:
   ```
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=concierge@m-theorygrp.com
   ```

**Install package:**
```bash
npm install @sendgrid/mail
```

### Option 2: Azure Communication Services

**Why Azure Communication Services?**
- Native Azure integration
- Enterprise-grade security
- Part of Microsoft ecosystem
- Good for high-volume scenarios

**Setup:**
1. Create Communication Service in Azure Portal
2. Add email domain or use Azure-provided domain
3. Copy connection string
4. Add to `.env`:
   ```
   EMAIL_PROVIDER=azure
   AZURE_COMM_CONNECTION_STRING=endpoint=https://...
   EMAIL_FROM=DoNotReply@xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.azurecomm.net
   ```

**Install package:**
```bash
npm install @azure/communication-email
```

### Option 3: SMTP (Testing Only)

**Why SMTP?**
- Works with existing email accounts
- Good for local development
- No third-party accounts needed

**Setup for Microsoft 365/Outlook:**
1. Enable SMTP in your Microsoft 365 account
2. Consider using app-specific password
3. Add to `.env`:
   ```
   EMAIL_PROVIDER=smtp
   SMTP_HOST=smtp.office365.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@m-theorygrp.com
   SMTP_PASSWORD=your-password
   EMAIL_FROM=your-email@m-theorygrp.com
   ```

**Install package:**
```bash
npm install nodemailer
```

## Azure Deployment Configuration

### App Service Environment Variables

When deploying to Azure App Service, add these environment variables in the Azure Portal:

**Configuration → Application settings:**
```
EMAIL_PROVIDER = sendgrid
SENDGRID_API_KEY = [your-key]
EMAIL_FROM = concierge@m-theorygrp.com
APP_URL = https://your-app.azurewebsites.net
```

### SendGrid Azure Integration

SendGrid offers a free Azure Marketplace add-on:
1. In Azure Portal, search for "SendGrid"
2. Create new SendGrid account (free tier available)
3. Get API key from SendGrid dashboard
4. Add to App Service configuration

## Email Templates

The email service includes two pre-built templates:

### 1. Customer Invitation Email
Sent when creating a new invitation from admin panel:
- Personalized with company name and contact
- Includes unique wizard link with pre-filled data
- Professional gradient design
- Mobile-responsive

### 2. Completion Notification
Sent to concierge when customer completes wizard:
- Session summary
- Link to review customer data
- Next steps reminder

## Usage Examples

### Send Invitation (called from API route)
```javascript
const emailService = require('./services/emailService');

await emailService.sendInvitation({
    to: 'customer@company.com',
    companyName: 'Acme Corporation',
    contactName: 'John Doe',
    invitationCode: 'INV-12345',
    concierge: 'Julian Sterling'
});
```

### Send Completion Notification
```javascript
await emailService.sendCompletionNotification({
    sessionId: 'uuid-here',
    companyName: 'Acme Corporation',
    conciergeEmail: 'julian.sterling@m-theorygrp.com'
});
```

## Testing Email Service

Test script included at `backend/test-email.js`:
```bash
cd backend
node test-email.js your-email@example.com
```

## Cost Comparison

| Provider | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| SendGrid | 100/day forever | $19.95/mo (50K/mo) | Most scenarios |
| Azure Comm | None | Pay per email (~$0.00025) | High volume |
| SMTP | Free (your email) | N/A | Testing only |

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use Azure Key Vault** for production secrets
3. **Rotate API keys** regularly
4. **Monitor email quotas** to prevent service disruption
5. **Verify sender domains** for better deliverability

## Troubleshooting

### Emails not sending
- Check API key is valid and has permissions
- Verify sender email is verified in provider
- Check provider dashboard for bounce/error logs
- Ensure environment variables are set correctly

### Emails going to spam
- Verify sender domain (SPF, DKIM records)
- Use consistent "from" address
- Avoid spam trigger words in subject/content
- Start with low volume and increase gradually

### Azure deployment issues
- Verify environment variables in App Service
- Check Application Insights logs for errors
- Ensure network connectivity from App Service
- Verify firewall rules allow outbound email traffic

## Next Steps

1. Choose your email provider
2. Set up account and get credentials
3. Install required npm package
4. Update `.env` with credentials
5. Test locally with `test-email.js`
6. Deploy to Azure with proper config
7. Monitor email delivery in provider dashboard
