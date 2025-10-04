const debouncing = (func, delay) => {
  let timerId = null;
  return function (...args) {
    console.log("before clear timerId", timerId);

    clearTimeout(timerId);
    timerId = setTimeout(() => {
      console.log("executed");
      func.apply(this, args);
    }, delay);
    console.log("set time out:", timerId);
  };
};

export default debouncing;
