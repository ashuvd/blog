import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

export default class LoginModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { errorMessage: "" }
  }

  static propTypes = {
    setModal: PropTypes.func,
    login: PropTypes.func,
  }

  inputs = [
    {
      id: 'email',
      text: 'Адрес электронной почты*',
      type: 'email'
    },
    {
      id: 'password',
      text: 'Пароль*',
      type: 'password'
    }
  ];
  renderInputs(inputs) {
    return inputs.map(({id, text, type}) => {
      return (
        <div key={id} className="form__row">
          <label htmlFor={id} className="form__label">{text}</label>
          <input type={type} id={id} name={id} className="form__input input" />
        </div>
      )
    })
  }
  loginUser = (e) => {
    e.preventDefault();
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    axios.post('signin',
        {
          email, password
        }
      )
      .then(res => {
        const { bearer_token, refresh_token, id } = res.data;
        localStorage.setItem('bearer_token', bearer_token);
        localStorage.setItem('refresh_token', refresh_token);
        this.props.login(id);
      })
      .catch(error => {
        const { message } = error.response.data;
        this.setState({ errorMessage: message });
      })
  }
  goToPageSignup = (e) => {
    e.preventDefault();
    this.props.setModal("signup");
  }
  render() {
    return (
      <div className="login">
        <div className="login__title">Войти</div>
        <div className="login__desc">
          Новый пользователь?
          <a href="#signup" onClick={this.goToPageSignup} className="login__link">Зарегистрируйтесь</a>
        </div>
        {this.state.errorMessage && <div className="error">{this.state.errorMessage}</div>}
        <form onSubmit={this.loginUser} className="login__form form">
          {this.renderInputs(this.inputs)}
          <div className="form__row">
            <button type="submit" className="form__button button">Войти</button>
          </div>
        </form>
      </div>
    )
  }
}