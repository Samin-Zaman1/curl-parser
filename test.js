const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function makeRequest(method, url, headers, body) {
  try {
    const options = {
      method: method,
      url: url,
      headers: headers ? JSON.parse(headers) : {},
      data: body ? JSON.parse(body) : {},
      withCredentials: true
    };
    
    const response = await axios(options);
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Body:', JSON.stringify(response.data, null, 2));
    
    if (response.headers['set-cookie']) {
      console.log('Cookies:', response.headers['set-cookie']);
    }
  } catch (error) {
    if (error.response) {
      console.error('Error Response:', error.response.status, error.response.data);
      if (error.response.headers['set-cookie']) {
        console.log('Cookies from Error Response:', error.response.headers['set-cookie']);
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

rl.question('Enter HTTP method (GET, POST, PUT, DELETE): ', (method) => {
  rl.question('Enter URL: ', (url) => {
    rl.question('Enter headers as JSON (or leave empty): ', (headers) => {
      rl.question('Enter body as JSON (or leave empty): ', (body) => {
        makeRequest(method.toUpperCase(), url, headers, body).finally(() => rl.close());
      });
    });
  });
});
