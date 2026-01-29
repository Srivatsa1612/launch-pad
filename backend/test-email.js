// Test email service
require('dotenv').config();
const emailService = require('./src/services/emailService');

const testEmail = process.argv[2];

if (!testEmail) {
    console.error('Usage: node test-email.js <recipient-email>');
    console.error('Example: node test-email.js jherring@m-theorygrp.com');
    process.exit(1);
}

async function testEmailService() {
    console.log('Testing email service...\n');
    console.log(`Provider: ${process.env.EMAIL_PROVIDER || 'sendgrid'}`);
    console.log(`Recipient: ${testEmail}\n`);

    try {
        // Test 1: Simple email
        console.log('Test 1: Sending simple test email...');
        await emailService.sendEmail({
            to: testEmail,
            subject: 'flowCUSTODIAN Email Test',
            html: '<h1>Email Service Working!</h1><p>This is a test email from flowCUSTODIAN.</p>'
        });
        console.log('✓ Simple email sent\n');

        // Test 2: Invitation email
        console.log('Test 2: Sending invitation email...');
        await emailService.sendInvitation({
            to: testEmail,
            companyName: 'Test Company Inc.',
            contactName: 'Test User',
            invitationCode: 'TEST-12345',
            concierge: 'Julian Sterling'
        });
        console.log('✓ Invitation email sent\n');

        // Test 3: Completion notification
        console.log('Test 3: Sending completion notification...');
        await emailService.sendCompletionNotification({
            sessionId: 'test-session-123',
            companyName: 'Test Company Inc.',
            conciergeEmail: testEmail
        });
        console.log('✓ Completion notification sent\n');

        console.log('✅ All email tests passed!');
        console.log(`\nCheck ${testEmail} for 3 test emails.`);

    } catch (error) {
        console.error('\n❌ Email test failed:');
        console.error(error.message);
        
        if (error.message.includes('API key')) {
            console.error('\nMake sure SENDGRID_API_KEY is set in your .env file');
        } else if (error.message.includes('connection')) {
            console.error('\nCheck your email provider configuration in .env');
        }
    } finally {
        await emailService.disconnect();
    }
}

testEmailService();
