const React = require('react');
const { Redirect } = require('react-router-dom');
const PropTypes = require('prop-types');
const LoginBox = require('../presentational/LoginBox.jsx');

class LoginContainer extends React.Component {
  render() {
    const { authed, login } = this.props;
    if (authed) {
      return <Redirect to="/" />;
    }
    return <LoginBox login={login} />;
  }
}

LoginContainer.propTypes = {
  authed: PropTypes.bool.isRequired,
  login: PropTypes.func.isRequired,
};

module.exports = LoginContainer;
