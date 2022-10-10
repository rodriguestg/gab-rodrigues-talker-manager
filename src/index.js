const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const HTTP_OK_STATUS = 200;
const HTTP_BAD_STATUS = 404;
const HTTP_BAD400_STATUS = 400;
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

const errs = {
  err1: 'O campo "email" é obrigatório',
  err2: 'O "email" deve ter o formato "email@email.com"',
  err3: 'O campo "password" é obrigatório',
  err4: 'O "password" deve ter pelo menos 6 caracteres',
};

const validationEmail = (req, res, next) => {
  const { email } = req.body;
  if (!email) { return res.status(HTTP_BAD400_STATUS).json({ message: errs.err1 }); }
  if (!email.includes('@') || !email.includes('.com')) {
    return res.status(HTTP_BAD400_STATUS).json({ message: errs.err2 });
  }
  next();
};

const validationPassword = (req, res, next) => {
  const { password } = req.body;
  if (!password) { return res.status(HTTP_BAD400_STATUS).json({ message: errs.err3 }); }
  if (password.length < 6) { return res.status(HTTP_BAD400_STATUS).json({ message: errs.err4 }); }
  next();
};

const MIN = 1000000000000000;
const MAX = 9999999999999999;
const randomToken = (min, max) => Math.floor(Math.random() * (max - min) + min);

app.post('/login', validationEmail, validationPassword, (_req, res) => {
  const numberToken = randomToken(MIN, MAX);
  const token = { token: `${numberToken}` };
  console.log(token);
  res.status(HTTP_OK_STATUS).json(token);
});
