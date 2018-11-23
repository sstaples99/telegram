const React = require('react');
const PropTypes = require('prop-types');
const axios = require('axios');
const swal = require('sweetalert');
const _ = require('lodash');
const EditCardForm = require('./EditCardForm.jsx');

const formatDate = (date) => {
  const options = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };
  return new Date(date).toLocaleDateString('en-US', options);
};

const toggleCard = (evt) => {
  const header = evt.currentTarget.parentElement;
  const card = header.parentElement.parentElement;
  const editBox = card.getElementsByClassName('card-edits')[0];
  if (!editBox.style.height || editBox.style.height === '0px') {
    editBox.style.height = `${editBox.scrollHeight}px`;
  } else {
    editBox.style.height = '0px';
  }
};

class Card extends React.Component {
  constructor(props) {
    super(props);
    this.checkAndUpdate = this.checkAndUpdate.bind(this);
  }

  checkAndUpdate(evt) {
    const { _id, onEventChange } = this.props;
    onEventChange(evt, _id, true);
    const updatedData = _.cloneDeep(this.props);
    updatedData[evt.target.name] = evt.target.checked;
    axios.put('/backendServices/card/', { schema: 'event', data: _.omit(updatedData, ['img', '__v']) })
      .then((res) => {
        if (!res.data.success) {
          swal(res.data.err.name, res.data.err.message, 'error');
        }
      });
  }

  render() {
    const {
      _id,
      title,
      start,
      featured,
      onEventChange,
      duplicateCard,
      deleteCard,
    } = this.props;
    return (
      <div className="card-wrapper">
        <div className="card-min box">
          <div className="card-display">
            <h2>
              <button type="button" onClick={toggleCard}>
                {title}
                <span className="text-light pad-left">
                  { formatDate(start) }
                </span>
              </button>
            </h2>
            <div className="card-tools">
              <input
                id={`fav-${_id}`}
                className="fav"
                name="featured"
                type="checkbox"
                checked={featured}
                onChange={this.checkAndUpdate}
              />
              <label htmlFor={`fav-${_id}`} className="fav" />
              <button type="button" onClick={() => duplicateCard(_id)}>
                <img
                  className="duplicate"
                  alt=""
                  src="/img/icons/dup.svg"
                />
              </button>
              <button type="button" onClick={() => deleteCard(_id)}>
                <img className="delete" alt="" src="/img/icons/trash-1.svg" />
              </button>
            </div>
          </div>
          <EditCardForm {...this.props} />
        </div>
      </div>
    );
  }
}

Card.propTypes = {
  _id: PropTypes.string.isRequired,
  start: PropTypes.instanceOf(Date).isRequired,
  end: PropTypes.instanceOf(Date).isRequired,
  title: PropTypes.string.isRequired,
  url: PropTypes.string,
  description: PropTypes.string,
  img: PropTypes.string,
  featured: PropTypes.bool,
  onEventChange: PropTypes.func.isRequired,
  duplicateCard: PropTypes.func.isRequired,
  deleteCard: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onUpdateImage: PropTypes.func.isRequired,
};

Card.defaultProps = {
  description: '',
  img: '',
  url: '#',
  featured: false,
};

module.exports = Card;
