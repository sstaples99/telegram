const React = require('react');
const PropTypes = require('prop-types');

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { email, password } = this.state;
    const { login } = this.props;
    login(email, password);
  }

  render() {
    const { email, password } = this.state;
    return (
      <form name="loginForm" onSubmit={this.handleSubmit}>
        <div className="form-group">
          <input type="email" name="email" value={email} placeholder="email" onChange={this.handleChange} required className="form-control form-modern" />
          <input type="password" name="password" value={password} placeholder="password" onChange={this.handleChange} required className="form-control form-modern" />
        </div>
        <button type="submit" className="btn btn-primary block-center">Login</button>
      </form>
    );
  }
}

LoginForm.propTypes = {
  login: PropTypes.func.isRequired,
};

module.exports = LoginForm;
