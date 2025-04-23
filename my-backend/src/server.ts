import express from 'express';
import routes from './index'; // or whatever file defines your routes

const app = express();

app.use(express.json());
app.use('/', routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
