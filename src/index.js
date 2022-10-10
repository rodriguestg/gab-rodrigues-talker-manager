const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const HTTP_OK_STATUS = 200;
const HTTP_BAD_STATUS = 404;
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

app.get('/talker', async (_req, res) => {
  const talkers = await personTalkers();
  res.status(HTTP_OK_STATUS).json(talkers);
});

app.get('/talker/:id', async (req, res) => {
  const talkers = await personTalkers();
  const { id } = req.params;
  const err = { message: 'Pessoa palestrante não encontrada' };
  const talker = talkers.find((person) => person.id === Number(id));
  if (!talker) { return res.status(HTTP_BAD_STATUS).json(err); }
  res.status(HTTP_OK_STATUS).json(talker);
});

// const { email, password } = req.body;

const MIN = 1000000000000000;
const MAX = 9999999999999999;
const randomToken = (min, max) => Math.floor(Math.random() * (max - min) + min);

app.post('/login', (_req, res) => {
  const numberToken = randomToken(MIN, MAX);
  const token = { token: `${numberToken}` };
  console.log(token);
  res.status(HTTP_OK_STATUS).json(token);
});
