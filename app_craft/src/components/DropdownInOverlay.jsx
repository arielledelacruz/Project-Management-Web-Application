import React from "react";


// we can change it to a dynamic value for reusability if we want
// in this link https://medium.com/@maazmedia1/how-to-create-a-dropdown-menu-in-reactjs-36f27987dbc4

const dropdownInOverlay = () => {
    const [selectedValue, setValue] = React.useState('option1');
    const handleChange = (event) => {
        setValue(event.target.value);
    };
    return (
        <select value={selectedValue} onChange={handleChange}>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
        </select>
    );
}

export default dropdownInOverlay;