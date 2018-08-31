const React = require('react');
const { Route, Switch } = require('react-router-dom');
const PropTypes = require('prop-types');
const Dashboard = require('./Dashboard/Dashboard.jsx');
const LoginContainer = require('./Login/container/LoginContainer.jsx');

class Router extends React.Component {
  render() {
    const { authed, onLogin } = this.props;
    return (
      <Switch>
        <Route exact path="/" render={props => <Dashboard {...props} authed={authed} />} />
        <Route exact path="/login" render={props => <LoginContainer {...props} authed={authed} login={onLogin} />} />
      </Switch>
    );
  }
}

Router.propTypes = {
  authed: PropTypes.bool.isRequired,
  onLogin: PropTypes.func.isRequired,
};

module.exports = Router;
