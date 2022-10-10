const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

const personTalkers = async () => {
  const pathData = path.resolve(__dirname, 'talker.json');
  const data = await fs.readFile(pathData, 'utf-8');
  const talker = JSON.parse(data);
  return talker;
};

app.get('/talker', async (_request, response) => {
  const talkers = await personTalkers();
  response.status(HTTP_OK_STATUS).json(talkers);
});
