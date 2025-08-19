// Simple test using built-in fetch (Node 18+)
async function testAPI() {
  try {
    console.log('Testing API...');
    const response = await fetch('http://localhost:3001/api');
    const data = await response.json();
    console.log('✅ Success:', data);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testAPI();
