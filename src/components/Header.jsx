import React from 'react';
import { NavLink } from 'react-router-dom';

export default function({logout}) {
  const pages = {
    posts: 'Все посты',
    post: 'Создать пост',
    exit: 'Выйти'
  }
  pages[Symbol.iterator] = function() {
    let i = 0;
    const that = this;
    return {
      next() {
        return {
          value: Object.keys(that)[i++],
          done: i > Object.keys(that).length
        }
      }
    }
  }
  const exit = (e) => {
    e.preventDefault();
    logout();
  }
  return (
    <header className="header">
      <div className="container container_header">
        <div className="header__left">
          <NavLink to="/" className="logo">
            <svg className="logo__img">
              <use xlinkHref="/sprite.svg#blog" />
            </svg>
          </NavLink>
        </div>
        <div className="header__right">
          <ul className="menu">
            {
              [...pages].map(page => {
                  if (page === 'exit') {
                    return (
                      <li key={page} className="menu__item">
                        <a href={'#' + page} onClick={exit} className="menu__link">{pages[page]}</a>
                      </li>
                    )
                  } else {
                    return (
                      <li key={page} className="menu__item">
                        <NavLink to={`/${page}`} className="menu__link" exact={true} activeClassName="menu__link_active">
                          {pages[page]}
                        </NavLink>
                      </li>
                    )
                  }
                }
              )
            }
          </ul>
        </div>
      </div>
    </header>
  )
}