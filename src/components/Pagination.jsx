import React from 'react';
import PropTypes from 'prop-types';

export default class Pagination extends React.Component {
  static propTypes = {
    totalItems: PropTypes.number,
    pageSize: PropTypes.number,
    currentPage: PropTypes.number,
    changePage: PropTypes.func,
  }

  render() {
    let pagesCount = Math.ceil(this.props.totalItems / this.props.pageSize);
    let pages = [];
    for(let i = 1; i <= pagesCount; i++) {
      pages.push(i);
    }

    return (
      <li className="pagination">
        <button
          className="pagination__button"
          disabled={this.props.currentPage === 1}
          onClick={this.props.changePage('left')}
        >
          Предыдущая
        </button>
        <ul className="pagination__list">
          {pages.map(page => (
            <li key={page} className={ page === this.props.currentPage ? "pagination__item pagination__item_active" : "pagination__item"}>
              <button
                type="button"
                className="pagination__number"
                onClick={this.props.changePage(page)}
              >
              {page}
              </button>
            </li>
          ))}
        </ul>
        <button
          className="pagination__button"
          disabled={this.props.currentPage >= pagesCount}
          onClick={this.props.changePage('right')}
        >
          Следующая
        </button>
      </li>
    )
  }
}