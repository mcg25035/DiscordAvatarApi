const express = require('express');
const { getAvatarUrl } = require('./discordBot');

const app = express();
const port = 3000;

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
