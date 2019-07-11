const React = require('react');
const PropTypes = require('prop-types');
const _ = require('lodash');
const axios = require('axios');
const swal = require('sweetalert');
const EventsBody = require('../presentational/EventsBody.jsx');
const ManagerNav = require('./ManagerNav.jsx');

class EventManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      searchQuery: '',
      cardSortMethod: 'dateN',
    };
    this.createNewCard = this.createNewCard.bind(this);
    this.onEventChange = this.onEventChange.bind(this);
    this.duplicateEvent = this.duplicateEvent.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onUpdateImage = this.onUpdateImage.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSortChange = this.onSortChange.bind(this);
  }

  componentDidMount() {
    const { clientID } = this.props;
    axios.post('/backendServices/event/', { clientID })
      .then((res) => {
        if (!res.data.success) return swal('Error loading events.', 'error');
        const formattedEvents = _.map(res.data.data, (event) => {
          const eventRef = event;
          eventRef.start = new Date(event.start);
          eventRef.end = new Date(event.end);
          const { featured } = eventRef;
          eventRef.featured = featured === 'true' || featured === true;
          return event;
        });
        this.setState({
          events: formattedEvents,
        });
      });
  }

  onEventChange(event, _id, checked) {
    const { events } = this.state;
    const updatedEvents = _.cloneDeep(events);
    const eventToUpdate = _.find(updatedEvents, e => e._id === _id);
    eventToUpdate[event.target.name] = checked ? event.target.checked : event.target.value;
    this.setState({
      events: updatedEvents,
    });
  }

  onSearchChange(evt) {
    this.setState({
      searchQuery: evt.target.value,
    });
  }

  onSortChange(evt) {
    this.setState({
      cardSortMethod: evt.target.value,
    });
  }

  onDateChange(m, name, _id) {
    const { events } = this.state;
    const updatedEvents = _.cloneDeep(events);
    const eventToUpdate = _.find(updatedEvents, e => e._id === _id);
    eventToUpdate[name] = new Date(m);
    this.setState({
      events: updatedEvents,
    });
  }

  onUpdateImage(evt, imageToUpload, _id) {
    evt.preventDefault();

    const formData = new FormData();
    formData.append('file', imageToUpload.files[0]);
    formData.append('filename', imageToUpload.files[0].name);

    axios.post('backendServices/upload/img/', formData)
      .then((res) => {
        if (res.data.success) {
          const { events } = this.state;
          const updatedEvents = _.cloneDeep(events);
          const eventToUpdate = _.find(updatedEvents, e => e._id === _id);
          eventToUpdate.img = res.data.data.url.replace('www.dropbox', 'dl.dropboxusercontent');
          axios.put('backendServices/card/', { schema: 'event', data: eventToUpdate })
            .then((response) => {
              if (!response.data.success) {
                swal(response.data.err.name || 'Error', response.data.err.message || 'unknown', 'error');
              } else {
                this.setState({
                  events: updatedEvents,
                });
              }
            });
        } else {
          if (res.data.err) {
            swal(res.data.err.name, res.data.err.message, 'error');
          } else {
            console.log(res.data);
            swal('Error', 'Something went wrong', 'error');
          }
        }
      });
  }

  createNewCard(data) {
    const { clientID } = this.props;
    const updatedData = _.merge(data, { clientID });
    axios.post('/backendServices/card/', { schema: 'event', data: updatedData })
      .then((res) => {
        if (res.data.success) {
          const newEvent = res.data.data;
          newEvent.start = new Date(newEvent.start);
          newEvent.end = new Date(newEvent.end);
          this.setState((prevState) => {
            const updatedEvents = _.cloneDeep(prevState.events);
            updatedEvents.push(newEvent);
            return {
              events: updatedEvents,
            };
          });
        } else {
          swal(res.data.err.name, res.data.err.message, 'error');
        }
      });
  }

  duplicateEvent(_id) {
    const { events } = this.state;
    const eventToDuplicate = _.find(events, e => e._id === _id);
    axios.post('/backendServices/card/duplicate', { schema: 'event', data: eventToDuplicate })
      .then((res) => {
        if (!res.data.success) {
          swal(res.data.err.name, res.data.err.message, 'error');
        } else {
          const newEvents = _.cloneDeep(events);
          const newEvent = res.data.data;
          newEvent.start = new Date(newEvent.start);
          newEvent.end = new Date(newEvent.end);
          newEvents.push(newEvent);
          this.setState({
            events: newEvents,
          });
        }
      });
  }

  deleteEvent(_id) {
    const { events } = this.state;
    swal({
      title: 'Are you sure?',
      text: 'You will not be able to recover this document!',
      icon: 'warning',
    }).then(() => {
      const postData = { schema: 'event', _id };
      return axios.post('/backendServices/card/delete', postData);
    }).then((res) => {
      if (!res.data.success) {
        swal(res.data.err.name, res.data.err.message, 'error');
      } else {
        const newEvents = _.cloneDeep(events);
        _.remove(newEvents, e => e._id === _id);
        this.setState({
          events: newEvents,
        });
      }
    });
  }

  render() {
    const { events, searchQuery, cardSortMethod } = this.state;
    // <CreateCardForm />
    return (
      <div>
        <ManagerNav
          searchQuery={searchQuery}
          cardSortMethod={cardSortMethod}
          onSearchChange={this.onSearchChange}
          onSortChange={this.onSortChange}
          createNewCard={this.createNewCard}
        />
        <EventsBody
          events={events}
          searchQuery={searchQuery}
          cardSortMethod={cardSortMethod}
          onEventChange={this.onEventChange}
          duplicateCard={this.duplicateEvent}
          deleteCard={this.deleteEvent}
          onDateChange={this.onDateChange}
          onUpdateImage={this.onUpdateImage}
        />
      </div>
    );
  }
}

EventManager.propTypes = {
  clientID: PropTypes.string.isRequired,
};

module.exports = EventManager;
