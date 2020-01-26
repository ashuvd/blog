function getDate(date) {
  const newDate = new Date(date);
  const year = newDate.getFullYear();
  const day = parseInt(newDate.getDate()) < 10 ? `0${newDate.getDate()}` : newDate.getDate();
  const month = parseInt(newDate.getMonth()+1) < 10 ? `0${parseInt(newDate.getMonth())+1}` : parseInt(newDate.getMonth())+1;
  const hours = newDate.getHours();
  const minutes = parseInt(newDate.getMinutes()) < 10 ? `0${newDate.getMinutes()}` : newDate.getMinutes();
  const seconds = newDate.getSeconds();
  return  `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

module.exports = getDate;