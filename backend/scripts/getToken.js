#!/usr/bin/env node
// scripts/getToken.js
/**
 * Helper script to get a fresh Fabric access token
 * Run with: node scripts/getToken.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Fabric Token Helper\n');
console.log('Attempting to get a fresh Fabric access token...\n');

// Try Azure CLI first
exec('az account get-access-token --resource https://analysis.windows.net/powerbi/api --query accessToken -o tsv', 
  (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Azure CLI not available or not logged in');
      console.log('\nPlease get your token manually using one of these methods:\n');
      
      console.log('1. Azure CLI:');
      console.log('   az login');
      console.log('   az account get-access-token --resource https://analysis.windows.net/powerbi/api --query accessToken -o tsv\n');
      
      console.log('2. PowerShell:');
      console.log('   Connect-PowerBIServiceAccount');
      console.log('   (Get-PowerBIAccessToken).GetPlainText()\n');
      
      console.log('3. Browser DevTools:');
      console.log('   - Open https://app.fabric.microsoft.com');
      console.log('   - Press F12 for DevTools');
      console.log('   - Go to Network tab');
      console.log('   - Click any API request');
      console.log('   - Copy the Bearer token from Authorization header\n');
      
      console.log('Then update FABRIC_TOKEN in backend/.env file');
      return;
    }

    const token = stdout.trim();
    
    if (!token) {
      console.log('❌ No token received. Please ensure you are logged in to Azure CLI.');
      return;
    }

    console.log('✓ Token retrieved successfully!\n');
    
    // Decode token to show expiry
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const expiry = new Date(payload.exp * 1000);
      console.log(`Token expires: ${expiry.toLocaleString()}`);
      console.log(`Valid for: ${Math.round((expiry - new Date()) / 60000)} minutes\n`);
    } catch (err) {
      // Ignore decode errors
    }

    // Ask if user wants to update .env
    console.log('Token copied to clipboard (if available)');
    console.log('\nTo update your .env file:');
    console.log('1. Open backend/.env');
    console.log('2. Replace FABRIC_TOKEN value with the token above');
    console.log('\nOr run: npm run update-token\n');
    
    // Try to copy to clipboard (Windows)
    exec(`echo ${token} | clip`, (err) => {
      if (!err) {
        console.log('✓ Token copied to clipboard!');
      }
    });
});
