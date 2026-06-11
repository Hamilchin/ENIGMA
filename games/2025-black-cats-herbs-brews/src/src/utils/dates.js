export let daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

export let getMonth = (date) => {
    return date.toLocaleString('default', { month: 'long' });
};

export let incrementDate = (date) => {
    date.setDate(date.getDate() + 1);
};
