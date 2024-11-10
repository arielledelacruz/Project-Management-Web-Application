import React, { useState } from 'react';
import '../cssFiles/TaskFilter.css';

const TaskFilter = ({ onFilterChange }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [isTagBoxVisible, setIsTagBoxVisible] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStoryPoint, setSelectedStoryPoint] = useState(null);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isStoryPointDropdownOpen, setIsStoryPointDropdownOpen] = useState(false);

  const tags = [
    { label: 'Frontend', className: 'frontend' },
    { label: 'Backend', className: 'backend' },
    { label: 'API', className: 'api' },
    { label: 'Database', className: 'database' },
    { label: 'Framework', className: 'framework' },
    { label: 'Testing', className: 'testing' },
    { label: 'UI', className: 'ui' },
    { label: 'UX', className: 'ux' },
  ];

  const priorities = ['Low', 'Medium', 'Important', 'Urgent'];
  // const storyPoints = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Function to toggle the visibility of the tag box
  const handleToggleTagBox = () => {
    setIsTagBoxVisible(!isTagBoxVisible);
    setIsPriorityDropdownOpen(false);
    setIsStoryPointDropdownOpen(false);
  };

  // Function to handle tag selection
  const handleTagChange = (tag) => {
    const updatedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updatedTags);
    onFilterChange({ tags: updatedTags, priority: selectedPriority, storyPoints: selectedStoryPoint });
  };

  // Function to handle priority selection
  const handlePriorityChange = (priority) => {
    setSelectedPriority(priority);
    onFilterChange({ tags: selectedTags, priority, storyPoints: selectedStoryPoint });
    setIsPriorityDropdownOpen(false);
  };

  // // Function to handle story point selection
  // const handleStoryPointChange = (storyPoint) => {
  //   setSelectedStoryPoint(storyPoint);
  //   onFilterChange({ tags: selectedTags, priority: selectedPriority, storyPoints: storyPoint });
  //   setIsStoryPointDropdownOpen(false);
  // };

  // Function to clear all filters
  const handleClearFilters = () => {
    setSelectedTags([]);
    setSelectedPriority('');
    // setSelectedStoryPoint(null);
    onFilterChange({ tags: [], priority: '', storyPoints: null });
  };

  return (
    <div className="filter-container">
      <div className="dropdown-container">
        <button onClick={handleToggleTagBox} className="filter-button">
          Select Tags
        </button>
        {isTagBoxVisible && (
          <div className="tag-box">
            {tags.map((tag, i) => (
              <button
                key={i}
                className={`filter-button ${tag.className} ${selectedTags.includes(tag.label) ? 'active' : ''}`}
                onClick={() => handleTagChange(tag.label)}
              >
                {tag.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="dropdown-container">
        <button
          className={`dropdown-button ${selectedPriority ? selectedPriority.toLowerCase() : ''}`}
          onClick={() => {
            setIsPriorityDropdownOpen(!isPriorityDropdownOpen);
            setIsTagBoxVisible(false);
            setIsStoryPointDropdownOpen(false);
          }}
        >
          {selectedPriority || 'Select Priority'}
        </button>
        {isPriorityDropdownOpen && (
          <div className="priority-dropdown-menu">
            {priorities.map((priority, i) => (
              <button
                key={i}
                className={`priority-dropdown-item ${priority.toLowerCase()}`}
                onClick={() => handlePriorityChange(priority)}
              >
                {priority}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filter Button */}
      <div className="dropdown-container">
        <button className="clear-button" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default TaskFilter;