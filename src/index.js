const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const HTTP_OK_STATUS = 200;
const HTTP_CREATED_STATUS = 201;
const HTTP_BAD_STATUS = 404;
const HTTP_BAD400_STATUS = 400;
const HTTP_BAD401_STATUS = 401;
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
  res.status(HTTP_OK_STATUS).json(token);
});

const postErrsTalker = {
  err1: 'Token não encontrado',
  err2: 'Token inválido',
  err3: 'O campo "name" é obrigatório',
  err4: 'O "name" deve ter pelo menos 3 caracteres',
  err5: 'O campo "age" é obrigatório',
  err6: 'A pessoa palestrante deve ser maior de idade',
  err7: 'O campo "talk" é obrigatório',
  err8: 'O campo "watchedAt" é obrigatório',
  err9: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
  err10: 'O campo "rate" é obrigatório',
  err11: 'O campo "rate" deve ser um inteiro de 1 à 5',
};

const validationToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) { 
    return res.status(HTTP_BAD401_STATUS).json({ message: postErrsTalker.err1 });
  }
  if (authorization.length < 16 || authorization.length > 16) {
    return res.status(HTTP_BAD401_STATUS).json({ message: postErrsTalker.err2 });
  }
  next();
};

const validationName = (req, res, next) => {
  const { name } = req.body;
  if (!name) { 
    return res.status(HTTP_BAD400_STATUS).json({ message: postErrsTalker.err3 });
  }
  if (name.length < 3) {
    return res.status(HTTP_BAD400_STATUS).json({ message: postErrsTalker.err4 });
  }
  next();
};

const validationAge = (req, res, next) => {
  const { age } = req.body;
  if (!age) { 
    return res.status(HTTP_BAD400_STATUS).json({ message: postErrsTalker.err5 });
  }
  if (Number(age) < 18) {
    return res.status(HTTP_BAD400_STATUS).json({ message: postErrsTalker.err6 });
  }
  next();
};

const validationTalk = (req, res, next) => {
  const { talk } = req.body;
  if (!talk) { 
    return res.status(HTTP_BAD400_STATUS).json({ message: postErrsTalker.err7 });
  }
  next();
};

const validationDay = (date) => {
  const day = date.split('/')[0];
  if (day === 0 || day > 31) { return true; }
};

const validationMes = (date) => {
  const mes = date.split('/')[1];
  if (Number.isNaN(Number(mes)) || mes === 0 || mes > 12) { return true; }
};

const validationYear = (date) => {
  const year = date.split('/')[2];
  if (!year || year > 2022 || year.length < 4) { return true; }
};

const validationDate = (date) => {
  const day = validationDay(date);
  const mes = validationMes(date);
  const year = validationYear(date);
  if (!date.includes('/') || day || mes || year) { return false; }
    return true;
};

const validationWatchedAt = (req, res, next) => {
  const { watchedAt } = req.body.talk;
  // console.log(watchedAt);
  if (!watchedAt) { 
    return res.status(HTTP_BAD400_STATUS).json({ message: postErrsTalker.err8 });
  }
  const validDate = validationDate(watchedAt);
  // console.log(validDate);
  if (!validDate) {
    return res.status(HTTP_BAD400_STATUS).json({ message: postErrsTalker.err9 });
  }
  next();
};

const validationRate = (req, res, next) => {
  const { rate } = req.body.talk;
  if (!rate) { 
    return res.status(HTTP_BAD400_STATUS).json({ message: postErrsTalker.err10 });
  }
  if (Number(rate) < 1 || Number(rate) > 5) {
    return res.status(HTTP_BAD400_STATUS).json({ message: postErrsTalker.err11 });
  }
  next();
};

app.post('/talker', validationToken, validationName, validationAge,
  validationTalk, validationRate, validationWatchedAt, async (req, res) => {
    // const pathData = path.resolve(__dirname, 'talker.json');
    const newTalker = { id: 1, ...req.body };
    console.log(await newTalker);
    console.log(req.body);
    // pathData.push(await newTalker);
    res.status(HTTP_CREATED_STATUS).json(await newTalker);
});
