import React from 'react';
import axios from 'axios';

import noImage from '../assets/img/no-image.jpg'

export default class PostPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      post: {
        title: "",
        text: "",
        previewPath: noImage,
      },
      errorMessage: ""
    }
  }

  componentDidMount() {
    if (this.props.match.params.id) {
      axios.get(`posts/${this.props.match.params.id}`)
      .then((res) => {
        const post = {
          title: res.data.data.title,
          text: res.data.data.text,
          previewPath: res.data.data.image_path,
        }
        this.setState({post});
      })
      .catch(error => {
        const { message } = error.response.data;
        this.setState({ errorMessage: message });
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.match.params.id && prevState.post === this.state.post) {
      this.setState({
        post: {
          title: "",
          text: "",
          previewPath: noImage
        }
      })
    }
  }

  createUpdatePost = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', this.state.post.title);
    formData.append('text', this.state.post.text);
    const [file] = e.target.elements.file.files;
    if (file) {
      formData.append('file', file);
    } else {
      formData.append('image_path', this.state.post.previewPath);
    }
    if (this.props.match.params.id) {
      axios.put(`posts/${this.props.match.params.id}`, formData)
      .then(() => {
        this.props.history.push('/posts');
      })
      .catch(error => {
        const { message } = error.response.data;
        this.setState({ errorMessage: message });
      })
    } else {
      axios.post('posts', formData)
      .then(() => {
        this.props.history.push('/posts');
      })
      .catch(error => {
        const { message } = error.response.data;
        this.setState({ errorMessage: message });
      })
    }
  }

  previewEventImage = (event) => {
    let reader = new FileReader();
    reader.onload = e => this.setState({post: {
      ...this.state.post,
      previewPath: e.target.result
    }});
    reader.readAsDataURL(event.target.files[0]);
  }

  handlePostTitleChange = (event) => {
    this.setState({post: {
      ...this.state.post,
      title: event.target.value
    }})
  }

  handlePostTextChange = (event) => {
    this.setState({post: {
      ...this.state.post,
      text: event.target.value
    }})
  }

  render() {
    let titles = {};
    if (this.props.match.params.id) {
      titles = {main: "Редактирование поста", image: "Изменить изображение", button: "Сохранить"}
    } else {
      titles = {main: "Создание поста", image: "Загрузить изображение", button: "Создать пост"}
    }
    return (
      <main className="main">
        <div className="container container_main">
          <div className="post">
            <div className="post__title">{titles.main}</div>
            {this.state.errorMessage && <div className="error">{this.state.errorMessage}</div>}
            <form onSubmit={this.createUpdatePost} className="post__form form">
              <div className="form__row">
                <label htmlFor="name" className="form__label">Название поста</label>
                <input value={this.state.post.title} type="text" id="name" name="name" required className="form__input input" onChange={this.handlePostTitleChange} />
              </div>
              <div className="form__row">
                <label htmlFor="text" className="form__label">Текст поста</label>
                <textarea value={this.state.post.text} id="text" name="text" rows="5" required className="form__textarea input" onChange={this.handlePostTextChange} />
              </div>
              <div className="form__row file">
                <div className="file__title">Изображение поста</div>
                <div className="file__preview">
                  <img src={this.state.post.previewPath} alt="post preview" className="file__img"/>
                </div>
                <label className="form__label form__label_file">
                  <input type="file" name="file" className="file__input" onChange={this.previewEventImage} />
                  <span className="file__fake button button_small">{titles.image}</span>
                </label>
              </div>
              <div className="form__row">
                <button type="submit" className="form__button button">{titles.button}</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    )
  }
}