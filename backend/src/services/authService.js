// services/authService.js
const axios = require('axios');
const config = require('../config');

class AuthService {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    this.refreshTimer = null;
    this.authType = config.fabric.authType || 'user'; // 'user' or 'service-principal'
  }

  /**
   * Initialize authentication based on configured type
   */
  async initialize() {
    if (this.authType === 'service-principal') {
      await this.authenticateServicePrincipal();
    } else {
      // For user authentication, validate and use the provided token
      this.token = config.fabric.token;
      if (!this.token || this.token === 'YOUR_NEW_TOKEN_HERE') {
        throw new Error('FABRIC_TOKEN not configured. Please update your .env file.');
      }
      
      // Decode JWT to get expiry (if it's a JWT)
      try {
        const payload = this.decodeJWT(this.token);
        if (payload.exp) {
          this.tokenExpiry = new Date(payload.exp * 1000);
          console.log(`Token expires at: ${this.tokenExpiry.toISOString()}`);
          
          // Set up auto-refresh warning
          const timeUntilExpiry = this.tokenExpiry - new Date();
          if (timeUntilExpiry > 0) {
            const warningTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 0); // 5 min before expiry
            setTimeout(() => {
              console.warn('⚠️  Fabric token will expire soon! Please refresh your token.');
            }, warningTime);
          } else {
            console.warn('⚠️  Fabric token appears to be expired!');
          }
        }
      } catch (err) {
        console.log('Using non-JWT token or unable to decode expiry');
      }
    }
    
    return this.token;
  }

  /**
   * Authenticate using Azure AD Service Principal
   */
  async authenticateServicePrincipal() {
    try {
      const { clientId, clientSecret, tenantId } = config.fabric.servicePrincipal;
      
      if (!clientId || !clientSecret || !tenantId) {
        throw new Error('Service Principal credentials not fully configured');
      }

      const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
      
      const params = new URLSearchParams();
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('scope', 'https://analysis.windows.net/powerbi/api/.default');
      params.append('grant_type', 'client_credentials');

      const response = await axios.post(tokenEndpoint, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.token = response.data.access_token;
      const expiresIn = response.data.expires_in; // seconds
      this.tokenExpiry = new Date(Date.now() + (expiresIn * 1000));

      console.log(`✓ Service Principal authenticated. Token expires at: ${this.tokenExpiry.toISOString()}`);

      // Schedule token refresh (refresh 5 minutes before expiry)
      this.scheduleTokenRefresh(expiresIn - 300);

      return this.token;
    } catch (error) {
      console.error('Service Principal authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Service Principal');
    }
  }

  /**
   * Schedule automatic token refresh
   */
  scheduleTokenRefresh(delaySeconds) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    this.refreshTimer = setTimeout(async () => {
      console.log('Refreshing Fabric token...');
      try {
        await this.authenticateServicePrincipal();
      } catch (error) {
        console.error('Token refresh failed:', error.message);
      }
    }, delaySeconds * 1000);
  }

  /**
   * Get current valid token
   */
  async getToken() {
    // Check if token is expired or about to expire
    if (this.tokenExpiry && new Date() >= this.tokenExpiry) {
      if (this.authType === 'service-principal') {
        console.log('Token expired, refreshing...');
        await this.authenticateServicePrincipal();
      } else {
        throw new Error('User token expired. Please refresh your FABRIC_TOKEN in .env file.');
      }
    }

    return this.token;
  }

  /**
   * Decode JWT token to extract payload
   */
  decodeJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = Buffer.from(parts[1], 'base64').toString('utf8');
    return JSON.parse(payload);
  }

  /**
   * Check if token is still valid
   */
  isTokenValid() {
    if (!this.token) return false;
    if (!this.tokenExpiry) return true; // Can't determine, assume valid
    
    // Consider token invalid if it expires in less than 1 minute
    return new Date() < new Date(this.tokenExpiry.getTime() - 60000);
  }

  /**
   * Clean up timers
   */
  cleanup() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
  }
}

// Singleton instance
const authService = new AuthService();

module.exports = authService;
