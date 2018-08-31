const React = require('react');
const PropTypes = require('prop-types');
const EventManager = require('../container/EventManager.jsx');
const MenuItemManager = require('../container/MenuItemManager.jsx');

const serviceMap = {
  events: EventManager,
  items: MenuItemManager,
};

class EditorBody extends React.Component {
  render() {
    const { service, clientID } = this.props;
    if (!service) {
      return (
        <div className="service-msg">
          <p>Please select a service to manage...</p>
        </div>
      );
    }
    const ServiceComponent = serviceMap[service];
    return (
      <ServiceComponent clientID={clientID} />
    );
  }
}

EditorBody.propTypes = {
  service: PropTypes.string.isRequired,
  clientID: PropTypes.string.isRequired,
};

module.exports = EditorBody;
