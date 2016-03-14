import React from 'react';
import axios from 'axios';

const createMock = (name) => (
  class extends React.Component {
    static propTypes = {
      store: React.PropTypes.object.isRequired,
    }

    componentWillMount() {
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

const Header = createMock('header');
const Container = createMock('container');
const Footer = createMock('footer');
export default (props) => {
  return (
    <div>
      <Header {...props} />
      <Container {...props} />
      <Footer {...props} />
    </div>
  );
};
