import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

export default class SignupPage extends React.Component {
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
      text: 'Адрес электронной почты',
      type: 'email'
    },
    {
      column: [
        {
          id: 'name',
          text: 'Имя',
          type: 'text'
        },
        {
          id: 'surname',
          text: 'Фамилия',
          type: 'text'
        },
      ],
    },
    {
      id: 'password',
      text: 'Пароль',
      type: 'password'
    }
  ]
  renderInputs(inputs) {
    return inputs.map(({column, id, text, type}, index) => {
      if (column) {
        return (
          <div key={index} className="form__column">
            {this.renderInputs(column)}
          </div>
        );
      }
      return (
        <div key={id} className="form__row">
          <label htmlFor={id} className="form__label">{text}</label>
          <input type={type} id={id} name={id} required className="form__input input" />
        </div>
      )
    })
  }
  regUser = (e) => {
    e.preventDefault();
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    const name = e.target.elements.name.value;
    const surname = e.target.elements.surname.value;
    axios.post('signup',
        {
          email, password, name, surname
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
  goToPageLogin = (e) => {
    e.preventDefault();
    this.props.setModal("login")
  }
  render() {
    return (
      <div className="login">
        <div className="login__title">Регистрация</div>
        <div className="login__desc">
          Уже зарегистрированы?
          <a href="#login" onClick={this.goToPageLogin} className="login__link">Войти</a>
        </div>
        {this.state.errorMessage && <div className="error">{this.state.errorMessage}</div>}
        <form onSubmit={this.regUser} className="login__form form">
          {this.renderInputs(this.inputs)}
          <div className="form__row">
            <button type="submit" className="form__button button">Зарегистрироваться</button>
          </div>
        </form>
      </div>
    )
  }
}