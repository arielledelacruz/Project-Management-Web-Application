

const dynamicSort = (key, sortOrder = 'asc') => {
    return function (a, b) {
        if (a[key] < b[key]) 
            return sortOrder === 'asc' ? -1 : 1;
        if (a[key] > b[key])
            return sortOrder === 'asc' ? 1 : -1;
        return 0;
    }
};


// sorts data that structured like the data in TaskCardDetail.jsx -> rows
export function sortData(data, key, sortOrder) {
    if (!key) return data;
    if (sortOrder === 'desc') 
        return data.sort(dynamicSort(key, sortOrder)).reverse();
    else
        return data.sort(dynamicSort(key, sortOrder));
}
