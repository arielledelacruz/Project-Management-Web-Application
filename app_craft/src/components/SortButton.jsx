import React, { useState } from 'react';
import '../cssFiles/SortButton.css';  // Import the CSS file
import { sortData } from './SortFunctions';

const SortButton = ({ tasks, setSortedTasks }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showPriorityOptions, setShowPriorityOptions] = useState(false);

  const toggleOptions = () => setShowOptions(!showOptions);
  const togglePriorityOptions = () => setShowPriorityOptions(!showPriorityOptions);

  const sortTasks = (field, order) => {
    console.log('Sorting by:', field, order, tasks);
    const sortedTasks = sortData(tasks, field, order);
    // const sortedTasks = [...tasks].sort((a, b) => {
    //   if (order === 'asc') {
    //     return a[field] > b[field] ? 1 : -1;
    //   } else {
    //     return a[field] < b[field] ? 1 : -1;
    //   }
    // });
    setSortedTasks(sortedTasks);
    setShowOptions(false);
    setShowPriorityOptions(false);
  };

  return (
    <div className="sort-container">
      <button className="sort-button" onClick={toggleOptions}>Sort</button>
      {showOptions && (
        <div className="sort-dropdown">
          <button onClick={togglePriorityOptions}>Priority</button>
          {showPriorityOptions && (
            <div className="nested-dropdown">
              <button onClick={() => sortTasks('priorityNum', 'asc')}>Low to Most Urgent</button>
              <button onClick={() => sortTasks('priorityNum', 'desc')}>Most Urgent to Low</button>
            </div>
          )}
          <button onClick={() => sortTasks('date', 'desc')}>Date (Recent)</button>
          <button onClick={() => sortTasks('date', 'asc')}>Date (Oldest)</button>
        </div>
      )}
    </div>
  );
};

export default SortButton;
