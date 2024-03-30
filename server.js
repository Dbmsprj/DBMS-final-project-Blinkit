const http = require('http');

// Create a server object
const server = http.createServer((req, res) => {
  // Set the response header
  res.setHeader('Content-Type', 'text/plain');
  
  // Write a response to the client
  res.write('Hello, World!');
  
  // End the response
  res.end();
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});