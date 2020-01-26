const MessageModel = require('../models/message');
const getDate = require('../services/getDate');

const messageController = {
  addMessage: async (req, res) => {
    try {
      if (!req.body.text) {
        res.status(400).json({ message: 'Вы не передали текст комментария', code: 400 });
        return;
      }
      if (!req.params.id) {
        res.status(400).json({ message: 'Вы не передали необходимые параметры', code: 400 });
        return;
      }

      let message = await MessageModel.create({
        text: req.body.text,
        date: new Date(),
        post_id: +req.params.id,
        user_id: +req.user.id
      });

      

      message = {
        id: message.id,
        text: message.text,
        date: getDate(message.date),
        user: {
          name: req.user.name,
          surname: req.user.surname
        }
      }

      res.status(201).json({ message: "Комментарий добавлен", code: 201, data: message })
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
}

module.exports = messageController;