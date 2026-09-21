const urlEncoder = (value) => {
    return value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

export default urlEncoder;