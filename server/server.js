import express from 'express';

const server = express();
const port = 3000;

server.use(express.json());

const test = [
  {
    "id": 1,
    "name": "test",
    "price": 123
  },
  {
    "id": 2,
    "name": "test2",
    "price": 1234
  }
];

server.get("/api/products", (request, response) => {
  setTimeout(() => {
    return response.json(test);
  }, 3000);
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});