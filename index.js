const express = require('express');
const { getAvatarUrl } = require('./discordBot');

const app = express();
const port = 1145;

// CORS configuration
app.use((req, res, next) => {
  const allowedOrigins = ['mcloudtw.com', 'www.mcloudtw.com', 'localhost:3000'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(new URL(origin).hostname) || origin === 'http://localhost:3000') {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.get('/avatar/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const avatarUrl = await getAvatarUrl(userId);
    if (!avatarUrl) {
      return res.status(404).send('Avatar not found');
    }
    res.send({ avatarUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
