import React from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard.jsx';
import Pagination from '../components/Pagination.jsx';
import loaderHOC from '../scripts/loaderHOC.jsx';
import PropTypes from 'prop-types';
import { Consumer } from '../scripts/contextAuth.js';

class PostsContent extends React.Component {
  static propTypes = {
    posts: PropTypes.array,
    pushMessage: PropTypes.func,
    deletePost: PropTypes.func,
    editPost: PropTypes.func,
  }
  render() {
    return (
      <Consumer>
        {({userId}) => this.props.posts.map(post => <PostCard key={post.id} isCurrentUser={userId === post.user.id} pushMessage={this.props.pushMessage} deletePost={this.props.deletePost} editPost={this.props.editPost} post={post} />)}
      </Consumer>
    )
  }
}

PostsContent = loaderHOC(PostsContent);

export default class PostsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { posts: [], pageSize: 3, currentPage: 1, totalPosts: 0, isLoading: false }
  }

  static propTypes = {
    userId: PropTypes.number,
  }
  
  componentDidMount() {
    this.setState({isLoading: true});
    axios.get(`posts?page=${this.state.currentPage}&list_size=${this.state.pageSize}`)
      .then(res => {
        this.setState({ posts: res.data.data, totalPosts: res.data.totalCount, isLoading: false });
      })
  }

  changePage = (page) => (e) => {
    e.preventDefault();
    if (!isNaN(page) && this.state.currentPage === page) {
      return;
    }
    let pageNumber;
    switch (page) {
      case 'left':
        pageNumber = this.state.currentPage - 1;
        break;
      case 'right':
        pageNumber = this.state.currentPage + 1;
        break;

      default:
        pageNumber = page;
        break;
    }
    this.setState({ currentPage: pageNumber, isLoading: true });
    axios.get(`posts?page=${pageNumber}&list_size=${this.state.pageSize}`)
      .then(res => {
        this.setState({ posts: res.data.data, totalPosts: res.data.totalCount, isLoading: false });
      })
  }

  pushMessage = (postId, message) => {
    this.setState({
      posts: this.state.posts.map(post => {
        if (post.id === postId) {
          post.messages.push(message);
        }
        return post;
      })
    })
  }

  deletePost = (postId) => (e) => {
    e.preventDefault();
    this.setState({isLoading: true});
    axios.delete(`posts/${postId}`)
      .then(res => {
        axios.get(`posts?page=${this.state.currentPage}&list_size=${this.state.pageSize}`)
        .then(res => {
          this.setState({ posts: res.data.data, totalPosts: res.data.totalCount, isLoading: false });
        })
      })
  }

  editPost = (postId) => () => {
    this.props.history.push(`/post/${postId}`);
  }

  render() {
    return (
      <main className="main">
        <div className="container">
          <div className="posts">
            <div className="posts__title">Посты</div>
            <PostsContent empty={this.state.posts.length === 0} loaded={!this.state.isLoading} posts={this.state.posts} pushMessage={this.pushMessage} deletePost={this.deletePost} editPost={this.editPost} />
            {this.state.posts.length > 0 && <Pagination totalItems={this.state.totalPosts} pageSize={this.state.pageSize} currentPage={this.state.currentPage} changePage={this.changePage} />}
          </div>
        </div>
      </main>
    )
  }
}