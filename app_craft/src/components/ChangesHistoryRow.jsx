import * as React from 'react';
import PropTypes from 'prop-types';
import '../cssFiles/ChangesHistoryRow.css'; // Import the CSS file

const ChangesHistoryRow = ({ name, date }) => {
  return (
    <div className="changes-history-row">
      <span className="date">{date}</span>
      <span className="name">{name}</span>
    </div>
  );
};

ChangesHistoryRow.propTypes = {
  name: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
};

export default ChangesHistoryRow;