// dependencies
import React from 'react';
import axios from 'axios';

// utils
const createMock = (name) => (
  class extends React.Component {
    static propTypes = {
      store: React.PropTypes.object.isRequired,
    }

    componentWillMount() {
      if (this.props.store.getState().SESSION_COMPLETE) {
        return;
      }

      this.props.store.dispatch(
        axios(`${process.env.URL}/${name}`)
        .then((response) => ({
          type: name,
          payload: {
            [name]: `${response.data}`,
          },
        }))
      );
    }
    render() {
      const value = this.props.store.getState()[name];

      return <div>{value || 'empty'}</div>;
    }
  }
);

// private
const Header = createMock('header');
const Container = createMock('container');
const Footer = createMock('footer');

/**
* @module Container
*/
export default (props) => (
  <div>
    <Header {...props} />
    <Container {...props} />
    <Footer {...props} />
  </div>
);
