const React = require('react');
const PropTypes = require('prop-types');
const NewEventCard = require('./NewEventCard.jsx');

const initializeNewCardModal = () => {
  document.getElementById('ev-overlay').classList.add('show-block');
  document.getElementById('init-card').classList.add('show-block');
};

class ManagerNav extends React.Component {
  render() {
    const {
      searchQuery,
      cardSortMethod,
      onSearchChange,
      onSortChange,
      createNewCard,
    } = this.props;
    return (
      <div style={{ overflow: 'auto' }}>
        <NewEventCard createNewCard={createNewCard} />
        <div className="input-group search-group">
          <input type="text" className="search-bar" placeholder="Search" onChange={onSearchChange} value={searchQuery} />
        </div>
        <button type="button" className="icon-small abs-tr" onClick={initializeNewCardModal}>
          <img className="icon-small abs-tr" alt="" src="/img/icons/new.svg" />
        </button>
        <div className="sort-box">
          <p>Sort: </p>
          <select onChange={onSortChange} value={cardSortMethod}>
            <option value="dateN">Date (newest first)</option>
            <option value="dateO">Date (oldest first)</option>
            <option value="title">Title</option>
            <option value="featured">Featured First</option>
          </select>
        </div>
      </div>
    );
  }
}

ManagerNav.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  cardSortMethod: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
  createNewCard: PropTypes.func.isRequired,
};

module.exports = ManagerNav;
