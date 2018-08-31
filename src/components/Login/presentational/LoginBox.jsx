const React = require('react');
const PropTypes = require('prop-types');
const LoginForm = require('./LoginForm.jsx');

class LoginBox extends React.Component {
  render() {
    const { login } = this.props;
    return (
      <div className="container login-container">
        <div className="col-md-4 col-md-offset-4">
          <div className="logo-container">
            <div className="logo" />
          </div>
          <div className="small block-center">
            <LoginForm login={login} />
          </div>
        </div>
      </div>
    );
  }
}

LoginBox.propTypes = {
  login: PropTypes.func.isRequired,
};

module.exports = LoginBox;
