import React from 'react';
import axios from 'axios';
import PostMessage from './PostMessage.jsx'
import PropTypes from 'prop-types';

export default class PostCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { errorMessage: "", message: "" }
  }

  static propTypes = {
    post: PropTypes.object,
    pushMessage: PropTypes.func,
    deletePost: PropTypes.func,
    editPost: PropTypes.func,
    isCurrentUser: PropTypes.bool,
  }

  addComment = (e) => {
    e.preventDefault();
    axios.post(`posts/${this.props.post.id}/messages`,
        {
          text: this.state.message
        }
      )
      .then(res => {
        this.props.pushMessage(this.props.post.id, res.data.data);
        this.setState({message: ""});
      })
      .catch(error => {
        const { message } = error.response.data;
        this.setState({ errorMessage: message });
      })
  }

  handleMessageChange = (event) => {
    this.setState({message: event.target.value});
  }

  render() {
    return (
      <li className="card">
        <div className="card__post">
          <div className="card__left">
            <div className="card__preview">
              <img src={this.props.post.image_path} alt="post image" className="card__img"/>
            </div>
          </div>
          <div className="card__right">
            <div className="card__user user">
              <div className="user__name">{`${this.props.post.user.name} ${this.props.post.user.surname}`}</div>
              <div className="user__date">{this.props.post.date}</div>
            </div>
            <div className="card__title">{this.props.post.title}</div>
            <div className="card__message">{this.props.post.text}</div>
          </div>
        </div>
        <div className="card__messages messages">
          <div className="messages__title">Комментарии:</div>
          <ul className="messages__list">
            {this.props.post.messages.map(message => <PostMessage key={message.id} message={message} />)}
          </ul>
        </div>
        <div className="card__messageAdd">
          {this.state.errorMessage && <div className="error">{this.state.errorMessage}</div>}
          <form onSubmit={this.addComment} className="login__form form">
            <div className="form__row">
              <label htmlFor={`message_${this.props.post.id}`} className="form__label">Комментарий к посту</label>
              <textarea value={this.state.message} id={`message_${this.props.post.id}`} name="message" rows="2" className="form__textarea input" onChange={this.handleMessageChange} />
            </div>
            <div className="form__row">
              <button type="submit" className="form__button button button_small">Оставить комментарий</button>
            </div>
          </form>
        </div>
        {this.props.isCurrentUser && 
          <button type="button" className="icon icon_delete" onClick={ this.props.deletePost(this.props.post.id) } >
            <svg className="icon__img">
              <use xlinkHref="/sprite.svg#trash-alt" />
            </svg>
          </button>
        }
        {this.props.isCurrentUser && 
          <button type="button" className="icon icon_edit" onClick={ this.props.editPost(this.props.post.id) }>
            <svg className="icon__img">
              <use xlinkHref="/sprite.svg#edit" />
            </svg>
          </button>
        }
      </li>
    )
  }
}