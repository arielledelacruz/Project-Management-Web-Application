import React, { useState, useEffect } from 'react';
import Select from 'react-select'; // do npm i --save react-select then restart npm run dev

const SingleSelectDropdown = ({ inputValue, options, handleSelect }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (Array.isArray(options)) {
      const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filteredOptions);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, options]);

  return (
    <Select
      value={inputValue}
      onChange={handleSelect}
      options={suggestions}
      placeholder="Select a member..."
    />
  );
};

export default SingleSelectDropdown;