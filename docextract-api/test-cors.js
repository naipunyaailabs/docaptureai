// Test CORS configuration
export async function testCors() {
  try {
    const response = await fetch('http://localhost:5000/', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://docapture.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('CORS Test Results:');
    console.log('Status:', response.status);
    console.log('Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));
    console.log('Access-Control-Allow-Methods:', response.headers.get('Access-Control-Allow-Methods'));
    console.log('Access-Control-Allow-Headers:', response.headers.get('Access-Control-Allow-Headers'));
    
    return response.headers.get('Access-Control-Allow-Origin') === 'https://docapture.com';
  } catch (error) {
    console.error('CORS Test Failed:', error);
    return false;
  }
}