import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Header from './components/Header.jsx';
import LoginModal from './views/LoginModal.jsx';
import SignupModal from './views/SignupModal.jsx';
import HomePage from './views/HomePage.jsx';
import PostPage from './views/PostPage.jsx';
import PostsPage from './views/PostsPage.jsx';
import PageNotFound from './views/PageNotFound.jsx';
import './assets/styles/app.scss'
import PropTypes from 'prop-types';
import { Provider, Consumer } from './scripts/contextAuth.js';

Header.propTypes = {
  setPage: PropTypes.func
};

class ModalWindow extends React.Component {
  render() {
    return ReactDOM.createPortal(this.props.children, this.props.domNode)
  }
}

const MODALS = {
  login: (setModal) =>
    <Consumer>
      {({login, isLoggedIn}) => !isLoggedIn && 
        <ModalWindow domNode={document.querySelector('#modal')}>
          <LoginModal login={login} setModal={setModal} />
        </ModalWindow>
      }
    </Consumer>,
  signup: (setModal) =>
  <Consumer>
    {({login, isLoggedIn}) => !isLoggedIn && 
      <ModalWindow domNode={document.querySelector('#modal')}>
        <SignupModal login={login} setModal={setModal} />
      </ModalWindow>
    }
  </Consumer>
,
};

function App() {
  const [modal, setModal] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState();

  useEffect(() => {
    axios.get('info')
    .then(res => {
      const { id } = res.data;
      setUserId(id);
      if (id) {
        setIsLoading(false);
        setIsLoggedIn(true);
      }
    })
    .catch(() => {
      setIsLoading(false);
      setIsLoggedIn(false);
    })
  }, [])
 
  const login = (id) => {
    setUserId(id);
    setIsLoggedIn(true);
  }
  const logout = () => {
    axios.get('logout')
    .then(res => {
      const { bearer_token } = res.data;
      if (bearer_token) {
        localStorage.setItem('bearer_token', bearer_token);
        setIsLoggedIn(false);
      }
    })
    .catch(() => {
      setIsLoggedIn(false);
    })
  }
  return (
    <div className="wrapper">
      <Provider value={{isLoggedIn, login, logout, userId}}>
        <Consumer>{({logout, isLoggedIn}) => isLoggedIn && <Header logout={logout} />}</Consumer>
        <Switch>
          {isLoggedIn && <Route path="/" exact component={HomePage}></Route>}
          {isLoggedIn && <Route path="/posts" exact component={PostsPage}></Route>}
          {isLoggedIn && <Route path="/post" exact component={PostPage}></Route>}
          {isLoggedIn && <Route path="/post/:id" exact component={PostPage}></Route>}
          <Route path="*" component={PageNotFound}></Route>
        </Switch>
        {!isLoading && MODALS[modal](setModal)}
      </Provider>
    </div>
  );
}

export default App;
