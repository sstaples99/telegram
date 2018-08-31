const React = require('react');
const PropTypes = require('prop-types');
const _ = require('lodash');
const Card = require('../../Card/container/Card.jsx');

const cardSortMap = (cardSortMethod) => {
  const keyMap = {
    title: 'title',
    featured: 'featured',
    dateO: 'start',
    dateN: 'start',
  };
  const sortKey = keyMap[cardSortMethod];
  let sortDirection = 'desc';
  if (cardSortMethod === 'dateO' || cardSortMethod === 'title') {
    sortDirection = 'asc';
  }
  return [sortKey, sortDirection];
};

class EventsBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = { numCards: 10 };
    this.loadMore = this.loadMore.bind(this);
  }

  loadMore() {
    this.setState((prevState, props) => ({
      numCards: Math.min(prevState.numCards + 10, props.events.length),
    }));
  }

  render() {
    const {
      cardSortMethod,
      duplicateCard,
      deleteCard,
      onDateChange,
      onEventChange,
      onUpdateImage,
    } = this.props;
    const { numCards } = this.state;
    const { events, searchQuery } = this.props;
    const [sortKey, sortDirection] = cardSortMap(cardSortMethod);
    let sortedEvents = _.orderBy(events, [sortKey], [sortDirection]);
    if (searchQuery) sortedEvents = _.reject(sortedEvents, e => !_.includes(e.title, searchQuery));
    const eventCards = sortedEvents.slice(0, numCards).map(event =>
      (
        <Card
          onEventChange={onEventChange}
          duplicateCard={duplicateCard}
          deleteCard={deleteCard}
          onDateChange={onDateChange}
          onUpdateImage={onUpdateImage}
          key={event._id}
          {...event}
        />
      ));
    return (
      <div>
        { eventCards }
        <button type="button" onClick={this.loadMore}>Load more</button>
      </div>
    );
  }
}

EventsBody.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  onEventChange: PropTypes.func.isRequired,
  duplicateCard: PropTypes.func.isRequired,
  deleteCard: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onUpdateImage: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  cardSortMethod: PropTypes.string.isRequired,
};

module.exports = EventsBody;
