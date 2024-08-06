const debounce = function (fn:any, d: number) {
  let timer:  NodeJS.Timeout;
  return function () {
    let context = this,
      args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, arguments);
    }, d);
  };
};

function formattedDate(passedDate: string | number | Date, format?: string) {
  const d = new Date(passedDate);
  let month = String(d.getMonth() + 1);
  let day = String(d.getDate());
  const year = String(d.getFullYear());

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  if ((format = "yearFirst")) {
    return `${year}-${month}-${day}`;
  }
  if ((format = "noSpace")) {
    return `${year}${month}${day}`;
  }

  return `${day}/${month}/${year}`;
}

export { debounce, formattedDate };
