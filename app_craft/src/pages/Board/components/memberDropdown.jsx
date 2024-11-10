import React, { useState, useEffect } from 'react';
import Select from 'react-select'; // do npm i --save react-select then restart npm run dev

const MemberDropdown = ({ inputValue, options, handleSelect, isMulti, placeholder }) => {
  return (
    <Select
      value={inputValue}
      onChange={handleSelect}
      options={options}
      isMulti={isMulti}  // Enable multi-select when needed
      placeholder={placeholder}
    />
  );
};

export default MemberDropdown;