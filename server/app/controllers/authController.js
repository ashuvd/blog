const jwt = require('jsonwebtoken');
require('dotenv').config();

const config = require('../config');
const User = require('../models/user');
const uuid = require('uuid/v4');

// The authentication controller.
let authController = {
  // user login
  signin: async (req, res) => {
    try {
      if (!req.body.email || !req.body.password) {
        res.status(400).json({ message: 'Введите пожалуйста e-mail и пароль', code: 400 });
        return;
      }
      const email = req.body.email;
      const password = req.body.password;

      const user = await User.findOne({ where: { email } })

      if (!user) {
        res.status(404).json({ message: 'Вы ввели неправильно e-mail или пароль', code: 404 });
        return;
      }

      await user.comparePasswords(password, async function (error, isMatch) {
        try {
          if (isMatch && !error) {

            const refresh_token = uuid();
            const currentDate = new Date();
            const expires_in = currentDate.setSeconds(currentDate.getSeconds() + process.env.REFRESH_TOKEN_EXPIRES_IN);

            const session = await user.getSession();

            if (session) {
              await session.destroy();
            }

            await user.createSession({
              refresh_token: refresh_token,
              expires_in: expires_in
            })

            const bearer_token = jwt.sign(
              { email: user.email },
              config.keys.secret,
              { expiresIn: parseInt(process.env.BEARER_TOKEN_EXPIRES_IN) }
            );

            res.status(200).json({ message: 'Здравствуйте, вы успешно авторизовались', code: 200, bearer_token, refresh_token, id: user.id });
          } else {
            res.status(400).json({ message: 'Вы ввели неправильно e-mail или пароль', code: 400 });
          }
        } catch (error) {
          console.log(error);
        }
      })
    } catch (error) {
      console.log(error)
      if (error.code == 403) {
        res.status(403).json({ message: error.message, code: 403 });
        return;
      }
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  // user registration
  signup: async (req, res) => {
    try {
      if (!req.body.email) {
        res.status(400).json({ message: 'Введите пожалуйста e-mail', code: 400 });
        return;
      }
      if (!req.body.name) {
        res.status(400).json({ message: 'Введите пожалуйста имя', code: 400 });
        return;
      }
      if (!req.body.surname) {
        res.status(400).json({ message: 'Введите пожалуйста фамилию', code: 400 });
        return;
      }
      if (!req.body.password) {
        res.status(400).json({ message: 'Введите пожалуйста пароль', code: 400 });
        return;
      }

      const email = req.body.email;

      let user = await User.findOne({ where: { email } })

      if (user) {
        res.status(403).json({ message: 'Пользователь с таким е-майл уже существует', code: 403 });
        return;
      }

      user = await User.create({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        surname: req.body.surname
      })

      const bearer_token = jwt.sign(
        { email: req.body.email },
        config.keys.secret,
        { expiresIn: parseInt(process.env.BEARER_TOKEN_EXPIRES_IN) }
      );

      const refresh_token = uuid();
      const currentDate = new Date();
      const expires_in = currentDate.setSeconds(currentDate.getSeconds() + process.env.REFRESH_TOKEN_EXPIRES_IN);

      await user.createSession({
        refresh_token: refresh_token,
        expires_in: expires_in
      })

      res.status(201).json({ message: 'Новый пользователь успешно зарегистрирован', code: 201, bearer_token, refresh_token, id: user.id });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  // refresh tokens
  newToken: async (req, res) => {
    try {
      if (!req.body.refresh_token) {
        res.status(400).json({ message: 'Вы не передали необходимые параметры', code: 400 });
        return;
      }
      if (!req.body.bearer_token) {
        res.status(400).json({ message: 'Вы не передали необходимые параметры', code: 400 });
        return;
      }

      const decoded = jwt.decode(req.body.bearer_token, {complete: true});
      const email = decoded ? decoded.payload.email : ""

      const user = await User.findOne({ where: { email } })

      if (!user) {
        res.status(401).json({ message: 'Token expired', code: 401 });
        return;
      }

      const session = await user.getSession();
      if (!session) {
        res.status(401).json({ message: 'Token expired', code: 401 });
        return;
      }
      await session.destroy();
      
      if (session.refresh_token != req.body.refresh_token) {
        console.log('рефреш неверен')
        console.log('session.refresh_token', session.refresh_token)
        console.log('req.body.refresh_token', req.body.refresh_token)
        res.status(401).json({ message: 'Token expired', code: 401 });
        return;
      }

      const currentDate = new Date();
      if (currentDate.getSeconds() > session.expires_in) {
        console.log('рефреш протух')
        res.status(401).json({ message: 'Token expired', code: 401 });
        return;
      }

      const refresh_token = uuid();
      const expires_in = currentDate.setSeconds(currentDate.getSeconds() + process.env.REFRESH_TOKEN_EXPIRES_IN);

      await user.createSession({
        refresh_token: refresh_token,
        expires_in: expires_in
      })

      const bearer_token = jwt.sign(
        { email: user.email },
        config.keys.secret,
        { expiresIn: parseInt(process.env.BEARER_TOKEN_EXPIRES_IN) }
      );

      res.status(200).json({ bearer_token, refresh_token });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  // get user id
  info: async (req, res) => {
    try {
      res.status(200).json({ id: req.user.id });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  // user logout
  logout: async (req, res) => {
    try {
      const bearer_token = jwt.sign(
        { email: req.user.email },
        config.keys.secret,
        { expiresIn: 0 }
      );

      const session = await req.user.getSession();

      if (session) {
        await session.destroy();
      }

      res.status(200).json({ bearer_token });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
};

module.exports = authController;