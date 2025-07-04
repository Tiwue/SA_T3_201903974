// app.js
import express from 'express';
import router from './routes.js';

const app = express();
app.use(express.json());
app.use('/api', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`API corriendo en http://localhost:${PORT}/api`)
);
