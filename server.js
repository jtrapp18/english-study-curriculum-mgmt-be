const jsonServer = require('json-server');
const cors = require('cors');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  'https://jtrapp18.github.io/english-study-curriculum-mgmt'
];

// server.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     credentials: true, // Allow cookies if necessary
//   })
// );

server.use(cors({ origin: '*' }));

// Apply middlewares
server.use(middlewares);
server.use(router);

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
