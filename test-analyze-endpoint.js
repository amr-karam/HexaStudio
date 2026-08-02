const fetch = require('node-fetch');

async function testAnalyzeEndpoint() {
  const requestBody = {
    fileContent: `function add(a, b) {
      return a + b;
    }

    function multiply(a, b) {
      return a * b;
    }`,
    language: 'javascript',
    tasks: ['explain', 'fixBugs', 'generateTests'],
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAnalyzeEndpoint();