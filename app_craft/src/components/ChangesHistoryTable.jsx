import * as React from 'react';
import ChangesHistoryRow from './ChangesHistoryRow';

const ChangesHistoryTable = ({ changes }) => {
  return (
    <div>
      {changes.map((change, index) => (
        <ChangesHistoryRow key={index} name={change.name} date={change.date} />
      ))}
    </div>
  );
};

export default ChangesHistoryTable;