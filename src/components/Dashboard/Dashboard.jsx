const React = require('react');
const PropTypes = require('prop-types');
const { Redirect } = require('react-router-dom');
const EditorContainer = require('../Editor/container/EditorContainer.jsx');
const ModelNavigation = require('../ModelNavigation/container/ModelNavigationContainer.jsx');

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { service: 'events' };
    this.onServiceChange = this.onServiceChange.bind(this);
  }

  onServiceChange(newService) {
    this.setState({
      service: newService,
    });
  }

  render() {
    const { service } = this.state;
    const { authed, client } = this.props;
    if (!authed) {
      return <Redirect to="/login" />;
    }
    return (
      <div className="container">
        <ModelNavigation client={client} onServiceChange={this.onServiceChange} />
        <EditorContainer clientID={client._id} service={service} />
      </div>
    );
  }
}

Dashboard.propTypes = {
  authed: PropTypes.bool.isRequired,
  client: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    services: PropTypes.arrayOf(PropTypes.string),
  }),
};

Dashboard.defaultProps = {
  client: {
    _id: '598a62acf36d286bd490bccd',
    name: 'The Harp and Fiddle',
    services: ['events', 'items'],
  },
};

module.exports = Dashboard;
