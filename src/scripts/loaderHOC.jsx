import React from 'react';
export default function loaderHOC(WrappedComponent) {
  return class extends React.Component {
    render() {
      return this.props.loaded ? (
        !this.props.empty && <WrappedComponent {...this.props} />
      ) : (
        <div className="loading">Загрузка...</div>
      )
    }
  }
}