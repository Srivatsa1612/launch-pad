// Email Service for flowCUSTODIAN
// Supports multiple email providers: SendGrid, Azure Communication Services, SMTP

class EmailService {
    constructor() {
        this.provider = process.env.EMAIL_PROVIDER || 'sendgrid'; // 'sendgrid', 'azure', 'smtp'
        this.client = null;
        this.initialized = false;
    }

    /**
     * Initialize email service based on configured provider
     */
    async initialize() {
        if (this.initialized) return;

        try {
            switch (this.provider) {
                case 'sendgrid':
                    await this.initializeSendGrid();
                    break;
                case 'azure':
                    await this.initializeAzureComms();
                    break;
                case 'smtp':
                    await this.initializeSMTP();
                    break;
                default:
                    throw new Error(`Unknown email provider: ${this.provider}`);
            }
            this.initialized = true;
            console.log(`✓ Email service initialized with ${this.provider}`);
        } catch (error) {
            console.error('Failed to initialize email service:', error.message);
            throw error;
        }
    }

    /**
     * Initialize SendGrid (recommended for Azure deployments)
     */
    async initializeSendGrid() {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.client = sgMail;
    }

    /**
     * Initialize Azure Communication Services
     */
    async initializeAzureComms() {
        const { EmailClient } = require('@azure/communication-email');
        this.client = new EmailClient(process.env.AZURE_COMM_CONNECTION_STRING);
    }

    /**
     * Initialize SMTP (for testing/local development)
     */
    async initializeSMTP() {
        const nodemailer = require('nodemailer');
        this.client = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    /**
     * Send email using configured provider
     * @param {Object} emailData - Email configuration
     * @param {string} emailData.to - Recipient email
     * @param {string} emailData.subject - Email subject
     * @param {string} emailData.html - HTML content
     * @param {string} emailData.text - Plain text content (optional)
     * @param {string} emailData.from - Sender email (optional, uses default)
     */
    async sendEmail({ to, subject, html, text, from }) {
        if (!this.initialized) {
            await this.initialize();
        }

        const fromAddress = from || process.env.EMAIL_FROM || 'noreply@m-theorygrp.com';

        try {
            switch (this.provider) {
                case 'sendgrid':
                    return await this.sendViaSendGrid({ to, from: fromAddress, subject, html, text });
                case 'azure':
                    return await this.sendViaAzureComms({ to, from: fromAddress, subject, html, text });
                case 'smtp':
                    return await this.sendViaSMTP({ to, from: fromAddress, subject, html, text });
                default:
                    throw new Error(`Unknown email provider: ${this.provider}`);
            }
        } catch (error) {
            console.error('Email sending failed:', error);
            throw error;
        }
    }

    /**
     * Send via SendGrid
     */
    async sendViaSendGrid({ to, from, subject, html, text }) {
        const msg = {
            to,
            from,
            subject,
            html,
            text: text || this.stripHtml(html)
        };
        const result = await this.client.send(msg);
        console.log(`✓ Email sent via SendGrid to ${to}`);
        return result;
    }

    /**
     * Send via Azure Communication Services
     */
    async sendViaAzureComms({ to, from, subject, html, text }) {
        const message = {
            senderAddress: from,
            content: {
                subject,
                html,
                plainText: text || this.stripHtml(html)
            },
            recipients: {
                to: [{ address: to }]
            }
        };
        const poller = await this.client.beginSend(message);
        const result = await poller.pollUntilDone();
        console.log(`✓ Email sent via Azure Communication Services to ${to}`);
        return result;
    }

    /**
     * Send via SMTP
     */
    async sendViaSMTP({ to, from, subject, html, text }) {
        const mailOptions = {
            from,
            to,
            subject,
            html,
            text: text || this.stripHtml(html)
        };
        const result = await this.client.sendMail(mailOptions);
        console.log(`✓ Email sent via SMTP to ${to}`);
        return result;
    }

    /**
     * Send invitation email with pre-filled wizard link
     */
    async sendInvitation({ to, companyName, contactName, invitationCode, concierge }) {
        const wizardUrl = `${process.env.APP_URL || 'http://localhost:3000'}/?invite=${invitationCode}`;
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to M-Theory Concierge</h1>
        </div>
        <div class="content">
            <p>Hello ${contactName || 'there'},</p>
            
            <p>We're excited to welcome <strong>${companyName}</strong> to M-Theory's Concierge Services! Your dedicated concierge, <strong>${concierge}</strong>, has prepared a personalized onboarding experience for you.</p>
            
            <p>Click the button below to begin your setup journey. We've pre-filled some information to make the process as smooth as possible:</p>
            
            <div style="text-align: center;">
                <a href="${wizardUrl}" class="button">Begin Your Concierge Setup</a>
            </div>
            
            <p>What to expect:</p>
            <ul>
                <li>Review and confirm your key contacts</li>
                <li>Select your service tier and preferences</li>
                <li>Configure HR system integration</li>
                <li>Choose hardware and welcome gifts</li>
                <li>Connect with your dedicated concierge</li>
            </ul>
            
            <p>The entire process takes about 10-15 minutes, and you can save your progress at any time.</p>
            
            <p>If you have any questions, your concierge ${concierge} is here to help!</p>
            
            <p>Best regards,<br>The M-Theory Concierge Team</p>
        </div>
        <div class="footer">
            <p>M-Theory Group | Concierge Services</p>
            <p>This invitation link is unique to ${companyName}</p>
        </div>
    </div>
</body>
</html>
        `;

        return await this.sendEmail({
            to,
            subject: `Welcome to M-Theory Concierge - ${companyName}`,
            html
        });
    }

    /**
     * Send session completion notification to concierge
     */
    async sendCompletionNotification({ sessionId, companyName, conciergeEmail }) {
        const adminUrl = `${process.env.APP_URL || 'http://localhost:3000'}/admin/sessions/${sessionId}`;
        
        const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #667eea;">New Customer Onboarding Completed</h2>
        
        <p><strong>${companyName}</strong> has completed their concierge setup wizard!</p>
        
        <p>Next steps:</p>
        <ul>
            <li>Review their selections and preferences</li>
            <li>Schedule initial concierge call</li>
            <li>Begin service tier provisioning</li>
        </ul>
        
        <p><a href="${adminUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">View Session Details</a></p>
        
        <p>This notification was sent from flowCUSTODIAN</p>
    </div>
</body>
</html>
        `;

        return await this.sendEmail({
            to: conciergeEmail,
            subject: `New Completion: ${companyName} - flowCUSTODIAN`,
            html
        });
    }

    /**
     * Strip HTML tags for plain text version
     */
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    /**
     * Close connections
     */
    async disconnect() {
        if (this.provider === 'smtp' && this.client) {
            this.client.close();
        }
        this.initialized = false;
    }
}

// Export singleton instance
module.exports = new EmailService();
