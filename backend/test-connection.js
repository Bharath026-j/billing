import axios from 'axios';

const API_BASE_URL = 'http://localhost:6768/api';

async function testConnection() {
  console.log('Testing backend connection...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get('http://localhost:6768/');
    console.log('✅ Health check passed:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  try {
    // Test invoices endpoint
    console.log('\n2. Testing invoices endpoint...');
    const invoicesResponse = await axios.get(`${API_BASE_URL}/invoices`);
    console.log('✅ Invoices endpoint working:', invoicesResponse.data.length, 'invoices found');
  } catch (error) {
    console.log('❌ Invoices endpoint failed:', error.message);
  }

  try {
    // Test vendors endpoint
    console.log('\n3. Testing vendors endpoint...');
    const vendorsResponse = await axios.get(`${API_BASE_URL}/invoices/vendors/list`);
    console.log('✅ Vendors endpoint working:', vendorsResponse.data.length, 'vendors found');
  } catch (error) {
    console.log('❌ Vendors endpoint failed:', error.message);
  }

  console.log('\n🎉 Backend connection test completed!');
}

testConnection().catch(console.error);

