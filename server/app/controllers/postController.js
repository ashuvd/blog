const fs = require('fs');
const path = require('path');
const PostModel = require('../models/post');
const MessageModel = require('../models/message');
const UserModel = require('../models/user');
const uuid = require('uuid/v4');
const getDate = require('../services/getDate');
const sharp = require('sharp');

const postController = {
  getPosts: async (req, res) => {
    try {
      const list_size = parseInt(req.query.list_size) || 10;
      const page = parseInt(req.query.page) || 1;

      let posts = await PostModel.findAll({
        attributes: ['id', 'title', 'text', 'image_path', 'date'],
        offset: (page-1) * list_size,
        limit: list_size,
        include: [
          {
            model: UserModel,
            attributes: ['id', 'name', 'surname'],
          },
          {
            model: MessageModel,
            attributes: ['id', 'text', 'date'],
            include: [
              {
                model: UserModel,
                attributes: ['name', 'surname'],
              }
            ]
          }
        ]
      });

      posts = posts.map(post => {
        return {
          id: post.id,
          title: post.title,
          text: post.text,
          image_path: post.image_path,
          date: getDate(post.date),
          user: post.user,
          messages: post.messages.map(message => {
            return {
              id: message.id,
              text: message.text,
              user: message.user,
              date: getDate(message.date)
            }
          })
        }
      })

      let totalPosts = await PostModel.findAll();

      res.status(200).json({ data: posts, totalCount: totalPosts.length });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  getPost: async (req, res) => {
    try {
      if (!req.params.id) {
        res.status(400).json({ message: 'Вы не передали необходимые параметры', code: 400 });
        return;
      }
      const [post] = await req.user.getPosts({
        where: { id: req.params.id },
        attributes: ['id', 'title', 'text', 'image_path', 'date']
      });

      if (!post) {
        res.status(404).json({ message: 'Такого поста не существует, либо вы не можете редактировать чужой пост', code: 404 });
        return;
      }

      res.status(200).json({ data: post });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  deletePost: async (req, res) => {
    try {
      if (!req.params.id) {
        res.status(400).json({ message: 'Вы не передали необходимые параметры', code: 400 });
        return;
      }
      const post = await PostModel.findByPk(req.params.id);
      if (!post) {
        res.status(404).json({ message: 'Такого поста не существует', code: 404 });
        return;
      }
      await post.destroy();

      fs.access(path.join('public', post.image_path), fs.constants.F_OK, function (err) {
        if (!err) {
          fs.unlinkSync(path.join('public', post.image_path));
        } else {
          console.log(err);
        }
      })

      res.status(200).json({ message: "Пост удален", code: 200, id: post.id })
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  addPost: async (req, res) => {
    try {
      if (!req.body.title) {
        res.status(400).json({ message: 'Вы не передали название поста', code: 400 });
        return;
      }
      if (!req.body.text) {
        res.status(400).json({ message: 'Вы не передали текст поста', code: 400 });
        return;
      }
      if (req.files.length === 0) {
        res.status(400).json({ message: 'Вы не передали изображение поста', code: 400 });
        return;
      }
      let [file] = req.files;

      const fileName = file.originalname;
      const fileMimeType = file.mimetype;
      const fileSizeInBytes = file.size;
      const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
      const [extension] = fileName.indexOf('.') !== -1 ? fileName.split('.').reverse() : [''];
      const filePath = path.join('public', 'upload', uuid() + '.' + extension);
      const filePathNew = path.join('public', 'upload', uuid() + '-sharp' + '.' + extension);
      let resultFilePath = filePath;

      if (extension === 'bmp' || extension === 'tif' || fileMimeType.indexOf('image') === -1) {
        fs.readdirSync(path.join('public', 'upload')).forEach(fileName => {
          const [extension] = fileName.indexOf('.') !== -1 ? fileName.split('.').reverse() : [''];
          if (!extension) {
            fs.unlinkSync(path.join('public', 'upload', fileName));
          }
        })
        res.status(400).json({ message: 'Поддерживаются только следующие расширения файлов: jpg | jpeg | png | gif', code: 400 });
        return;
      }

      await new Promise(function (resolve, reject) {
        fs.rename(file.path, filePath, function (err) {
          if (err) {
            console.log('err -->', err);
            return reject(err);
          }
          resolve();
        })
      })

      await new Promise(function(resolve, reject) {
        if (
          fileMimeType.indexOf('image') !== -1
          && fileSizeInMegabytes > 0.5
        ) {
          sharp(filePath)
          .resize(500)
          .toFile(filePathNew, function(err) {
            if (err) {
              reject(err);
            }
            resolve();
            fs.access(filePath, fs.constants.F_OK, function (err) {
              if (!err) {
                fs.unlinkSync(filePath);
              } else {
                console.log(err);
              }
            })
          });
          resultFilePath = filePathNew;
        } else {
          resolve();
        }
      })


      fs.readdirSync(path.join('public', 'upload')).forEach(fileName => {
        const [extension] = fileName.indexOf('.') !== -1 ? fileName.split('.').reverse() : [''];
        if (!extension) {
          fs.unlinkSync(path.join('public', 'upload', fileName));
        }
      })

      const dir = path.normalize('/' + resultFilePath.substr(resultFilePath.indexOf('upload')));

      const post = await PostModel.create({
        title: req.body.title,
        text: req.body.text,
        image_path: dir,
        date: new Date(),
        user_id: +req.user.id
      });

      res.status(201).json({ message: "Пост добавлен", code: 201, data: post })
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  updatePost: async (req, res) => {
    try {
      if (!req.body.title) {
        res.status(400).json({ message: 'Вы не передали название поста', code: 400 });
        return;
      }
      if (!req.body.text) {
        res.status(400).json({ message: 'Вы не передали текст поста', code: 400 });
        return;
      }
      console.log('req.body.image_path', req.files.length, req.body.image_path)
      if (req.files.length === 0 && !req.body.image_path) {
        res.status(400).json({ message: 'Вы не передали изображение поста', code: 400 });
        return;
      }
      if (!req.params.id) {
        res.status(400).json({ message: 'Вы не передали необходимые параметры', code: 400 });
        return;
      }
      let [post] = await req.user.getPosts({
        where: { id: req.params.id },
        attributes: ['id', 'title', 'text', 'image_path', 'date']
      });

      if (!post) {
        res.status(404).json({ message: 'Такого поста не существует, либо вы не можете редактировать чужой пост', code: 404 });
        return;
      }

      let [file] = req.files;
      let dir;

      if (file) {
        const fileName = file.originalname;
        const fileMimeType = file.mimetype;
        const fileSizeInBytes = file.size;
        const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
        const [extension] = fileName.indexOf('.') !== -1 ? fileName.split('.').reverse() : [''];
        const filePath = path.join('public', 'upload', uuid() + '.' + extension);
        const filePathNew = path.join('public', 'upload', uuid() + '-sharp' + '.' + extension);
        let resultFilePath = filePath;
  
        if (extension === 'bmp' || extension === 'tif' || fileMimeType.indexOf('image') === -1) {
          fs.readdirSync(path.join('public', 'upload')).forEach(fileName => {
            const [extension] = fileName.indexOf('.') !== -1 ? fileName.split('.').reverse() : [''];
            if (!extension) {
              fs.unlinkSync(path.join('public', 'upload', fileName));
            }
          })
          res.status(400).json({ message: 'Поддерживаются только следующие расширения файлов: jpg | jpeg | png | gif', code: 400 });
          return;
        }
  
        await new Promise(function (resolve, reject) {
          fs.rename(file.path, filePath, function (err) {
            if (err) {
              console.log('err -->', err);
              return reject(err);
            }
            resolve();
          })
        })
        
  
        await new Promise(function(resolve, reject) {
          if (
            fileMimeType.indexOf('image') !== -1
            && fileSizeInMegabytes > 0.5
          ) {
            sharp(filePath)
            .resize(500)
            .toFile(filePathNew, function(err) {
              if (err) {
                reject(err);
              }
              resolve();
              fs.access(filePath, fs.constants.F_OK, function (err) {
                if (!err) {
                  fs.unlinkSync(filePath);
                } else {
                  console.log(err);
                }
              })
            });
            resultFilePath = filePathNew;
          } else {
            resolve();
          }
        })
  
        fs.readdirSync(path.join('public', 'upload')).forEach(fileName => {
          const [extension] = fileName.indexOf('.') !== -1 ? fileName.split('.').reverse() : [''];
          if (!extension) {
            fs.unlinkSync(path.join('public', 'upload', fileName));
          }
        })

        await new Promise(function(resolve, reject) {
          fs.access(path.join('public', post.image_path), fs.constants.F_OK, function (err) {
            if (!err) {
              fs.unlinkSync(path.join('public', post.image_path));
              resolve();
            } else {
              reject(err);
            }
          })
        })
  
        dir = path.normalize('/' + resultFilePath.substr(resultFilePath.indexOf('upload')));
      } else {
        dir = req.body.image_path;
      }

      post = await post.update({
        title: req.body.title,
        text: req.body.text,
        image_path: dir,
        date: new Date()
      });

      res.status(200).json({ message: "Пост обновлен", code: 200, data: post })
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
}

module.exports = postController;