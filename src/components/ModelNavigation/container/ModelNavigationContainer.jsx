const React = require('react');
const PropTypes = require('prop-types');

class ModelNavigationContainer extends React.Component {
  render() {
    const { client, onServiceChange } = this.props;
    return (
      <div className="col-2 side-nav light-grey tall-col">
        <div className="org-info">
          <p id="activeOrgTitle">{client.name}</p>
          <p>User McPersonFace</p>
        </div>
        {
          client.services.map(service => (
            <div key={service} className="service-tab">
              <button type="button" onClick={() => onServiceChange(service)}>
                <p className="box fill-width pad-med point cap">
                  {service}
                </p>
              </button>
            </div>
          ))
        }
      </div>
    );
  }
}

ModelNavigationContainer.propTypes = {
  client: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    services: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onServiceChange: PropTypes.func.isRequired,
};

module.exports = ModelNavigationContainer;
