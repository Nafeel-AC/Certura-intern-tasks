const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const postsRouter = require('./routes/posts');

const app = express();

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blog_app';
const MONGODB_DB = process.env.MONGODB_DB || 'blog_app';
const PORT = process.env.PORT || 4000;

mongoose
  .connect(MONGODB_URI, { dbName: MONGODB_DB })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/posts', postsRouter);

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});


