const React = require('react');
const axios = require('axios');
const Router = require('./Router');

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: { authed: false },
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  login(email, password) {
    axios.post('/backendServices/user/login', { email, password })
      .then((res) => {
        if (res.data.success) {
          this.setState({
            user: { authed: true },
          });
        } else {
          console.log(res.data);
        }
      });
  }

  logout() {
    this.setState({
      user: { authed: false },
    });
  }

  render() {
    const { user } = this.state;
    return (
      <Router
        authed={user.authed}
        onLogin={this.login}
        onLogout={this.logout}
      />
    );
  }
}

module.exports = App;
