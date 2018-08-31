const React = require('react');
const PropTypes = require('prop-types');
const EditorBody = require('../presentational/EditorBody.jsx');

class EditorContainer extends React.Component {
  render() {
    const { clientID, service } = this.props;
    return (
      <div className="col-10 pane-body white tall-col pad-med box">
        <button className="hamburger hamburger--collapse mobile-item" data-target-left=".side-nav" data-target-right=".pane-body" type="button">
          <span className="hamburger-box">
            <span className="hamburger-inner" />
          </span>
        </button>
        <section>
          <EditorBody clientID={clientID} service={service} />
        </section>
      </div>
    );
  }
}

EditorContainer.propTypes = {
  clientID: PropTypes.string.isRequired,
  service: PropTypes.string.isRequired,
};

module.exports = EditorContainer;
