import React from 'react';
import PropTypes from 'prop-types';

export default class PostMessage extends React.Component {
  static propTypes = {
    message: PropTypes.object,
  }

  render() {
    return (
      <li className="message">
        <div className="message__user user">
          <div className="user__name">{`${this.props.message.user.name} ${this.props.message.user.surname}`}</div>
          <div className="user__date">{this.props.message.date}</div>
        </div>
        <div className="message__text">{this.props.message.text}</div>
      </li>
    )
  }
}