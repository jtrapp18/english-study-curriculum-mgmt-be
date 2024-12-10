const jsonServer = require('json-server');
const cors = require('cors');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Use the environment variable PORT or default to 8080
const port = process.env.PORT || 3000;

const allowedOrigins = ['http://localhost:8080', 'http://localhost:3000', 'https://jtrapp18.github.io/english-study-curriculum-mgmt'];

server.use(cors({
  origin: allowedOrigins, // Only allow these origins
}));

server.use(middlewares);
server.use(router);

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});