import React, { useState, useEffect } from 'react';
import TaskFilter from './TaskFilter';  // Adjust the import path
import TaskCardDetail from './TaskCardDetail';  // Adjust the import path

// Dummy tasks data
const dummyTasks = [
  { id: "1", taskName: "Task 1", tags: "Frontend", priority: "Low", storyPoints: 5 },
  { id: "2", taskName: "Task 2", tags: "Backend", priority: "Urgent", storyPoints: 3 },
  { id: "3", taskName: "Task 3", tags: "Testing", priority: "Medium", storyPoints: 8 },
  { id: "4", taskName: "Task 4", tags: "Frontend", priority: "Important", storyPoints: 13 },
  { id: "5", taskName: "Task 5", tags: "UI", priority: "Low", storyPoints: 2 }
];

export default function TaskFilterHandler() {
  const [filters, setFilters] = useState({
    tags: [],         // Filter for tags (empty array means no filter)
    priority: '',     // Filter for priority (empty string means no filter)
    storyPoints: null // Filter for story points (null means no filter)
  });

  const [filteredTasks, setFilteredTasks] = useState(dummyTasks);

  // Function to update filters based on TaskFilter component's changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Function to apply filters to the dummy tasks
  const applyFilters = () => {
    let filtered = dummyTasks;

    if (filters.tags.length > 0) {
      filtered = filtered.filter(task => filters.tags.some(tag => task.tags.includes(tag)));
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.storyPoints !== null) {
      filtered = filtered.filter(task => task.storyPoints === filters.storyPoints);
    }

    setFilteredTasks(filtered);
  };

  // Apply filters whenever the filters change
  useEffect(() => {
    applyFilters();
  }, [filters]);

  return (
    <div>
      {/* TaskFilter component, where the user sets their filters */}
      <TaskFilter onFilterChange={handleFilterChange} />
      
      {/* TaskCardDetail component with the applied filters */}
      {filteredTasks.map(task => (
        <TaskCardDetail key={task.id} row={task} />
      ))}
    </div>
  );
}