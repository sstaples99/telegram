const React = require('react');
const PropTypes = require('prop-types');
const axios = require('axios');
const swal = require('sweetalert');
const _ = require('lodash');
const DateTime = require('react-datetime');

class EditCardForm extends React.Component {
  constructor(props) {
    super(props);
    this.updateCard = this.updateCard.bind(this);
  }

  updateCard() {
    const { noUpdate } = this.props;
    if (!noUpdate) {
      axios.put('/backendServices/card/', { schema: 'event', data: _.omit(this.props, ['img', '__v']) })
        .then((res) => {
          if (!res.data.success) {
            swal(res.data.err.name, res.data.err.message, 'error');
          }
        });
    }
  }

  render() {
    const {
      _id,
      title,
      description,
      url,
      img,
      start,
      end,
      onEventChange,
      onDateChange,
      onUpdateImage,
      visible,
    } = this.props;
    return (
      <div className="card-edits" style={{ height: visible ? 'auto' : '0' }}>
        <div className="edits-container">
          <div className="input-group">
            <span className="addon">Title</span>
            <input type="text" name="title" className="form-control addon" placeholder="e.g. Live Music" onChange={evt => onEventChange(evt, _id)} onBlur={this.updateCard} value={title} />
          </div>
          <div className="input-group">
            <span className="addon">Start</span>
            <DateTime
              className="addon"
              inputProps={{ className: 'form-control' }}
              onChange={m => onDateChange(m, 'start', _id)}
              onBlur={m => this.updateCard({ target: { name: 'start', value: new Date(m) } })}
              value={start}
            />
          </div>
          <div className="input-group">
            <span className="addon">End</span>
            <DateTime
              className="addon"
              inputProps={{ className: 'form-control' }}
              onChange={m => onDateChange(m, 'end', _id)}
              onBlur={m => this.updateCard({ target: { name: 'end', value: new Date(m) } })}
              value={end}
            />
          </div>
          <div className="input-group">
            <span className="addon">Description</span>
            <input type="text" name="description" className="form-control addon" placeholder="e.g. classNameic/alt rock music" onChange={evt => onEventChange(evt, _id)} onBlur={this.updateCard} value={description} />
          </div>
          <div className="input-group">
            <span className="addon">URL</span>
            <input type="text" name="url" className="form-control addon" placeholder="i.e. link to where event will direct" onChange={evt => onEventChange(evt, _id)} onBlur={this.updateCard} value={url} />
          </div>
          <form onSubmit={evt => onUpdateImage(evt, this.imageToUpload, _id)}>
            <div className="input-group">
              <span className="addon">Image</span>
              <div className="img-addon" style={{ backgroundImage: img ? `url(${img})` : 'none' }} />
              <input type="file" ref={(ref) => { this.imageToUpload = ref; }} name="img" accept="image/*" className="form-control addon" />
              <button type="submit">Submit</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

EditCardForm.propTypes = {
  _id: PropTypes.string.isRequired,
  start: PropTypes.instanceOf(Date).isRequired,
  end: PropTypes.instanceOf(Date).isRequired,
  title: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  onEventChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onUpdateImage: PropTypes.func.isRequired,
  visible: PropTypes.bool,
  noUpdate: PropTypes.bool,
};

EditCardForm.defaultProps = {
  visible: false,
  noUpdate: false,
};

module.exports = EditCardForm;
