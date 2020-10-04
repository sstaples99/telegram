const React = require('react');
const axios = require('axios');
const swal = require('sweetalert');
const PropTypes = require('prop-types');
const EditCardForm = require('../../Card/container/EditCardForm.jsx');

const closeOverlay = () => {
  document.getElementById('ev-overlay').classList.remove('show-block');
  document.getElementById('init-card').classList.remove('show-block');
};

const initialState = {
  title: '',
  start: new Date(),
  end: new Date(),
  description: '',
  url: '',
  img: '',
};

class NewEventCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.onFieldChange = this.onFieldChange.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onUpdateImage = this.onUpdateImage.bind(this);
  }

  onFieldChange(evt) {
    this.setState({
      [evt.target.name]: evt.target.value,
    });
  }

  onDateChange(m, field) {
    this.setState({
      [field]: new Date(m),
    });
  }

  onUpdateImage(evt, imageToUpload) {
    evt.preventDefault();

    const formData = new FormData();
    formData.append('file', imageToUpload.files[0]);
    formData.append('filename', imageToUpload.files[0].name);

    axios.post('backendServices/upload/img/', formData)
      .then((res) => {
        if (res.data.success) {
          this.setState({
            img: res.data.data,
          });
        } else {
          swal(res.data.err.name, res.data.err.message, 'error');
        }
      });
  }

  render() {
    const {
      title,
      start,
      end,
      description,
      url,
      img,
    } = this.state;
    const { createNewCard } = this.props;
    return (
      <div>
        <button type="button" id="ev-overlay" onClick={closeOverlay} />
        <div id="init-card">
          <EditCardForm
            visible
            noUpdate
            title={title}
            start={start}
            end={end}
            description={description}
            url={url}
            img={img}
            _id=""
            onEventChange={this.onFieldChange}
            onDateChange={this.onDateChange}
            onUpdateImage={this.onUpdateImage}
          />
          <button type="button" onClick={() => { createNewCard(this.state); closeOverlay(); this.setState(initialState); }}>Submit</button>
        </div>
      </div>
    );
  }
}

NewEventCard.propTypes = {
  createNewCard: PropTypes.func.isRequired,
};

module.exports = NewEventCard;
