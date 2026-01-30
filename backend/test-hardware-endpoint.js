// test-hardware-endpoint.js
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testHardwareEndpoint() {
  try {
    console.log('🔌 Fetching /api/config...');
    const response = await axios.get(`${API_URL}/config`);
    
    console.log('\n✓ Response received');
    console.log('Hardware Options Count:', response.data.hardwareOptions?.length || 0);
    
    if (response.data.hardwareOptions && response.data.hardwareOptions.length > 0) {
      console.log('\n📦 Hardware Options:');
      response.data.hardwareOptions.forEach(opt => {
        console.log(`  - [${opt.option_type}] ${opt.name}: ${opt.description}`);
      });
    } else {
      console.log('\n⚠️  No hardware options returned!');
      console.log('Full response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testHardwareEndpoint();
