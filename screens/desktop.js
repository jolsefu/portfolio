function showDate() {
  const clientDate = new Date();
  const formattedDate = formatClientDateTime( clientDate );
  
  document.querySelector( '#time-display' ).innerHTML = formattedDate;
}

function enableIconHighlightOnClick() {
  
}

function formatClientDateTime(clientDateTime) {
  const date = new Date(clientDateTime);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayName = days[date.getUTCDay()];
  const dayNum = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');

  const formattedDateTime = `${dayName}. ${dayNum} ${month} ${hours}:${minutes}`;

  return formattedDateTime;
}

function initialize() {
  setInterval(showDate, 1000);
  
  enableIconHighlightOnClick();
}

document.addEventListener( 'DOMContentLoaded', initialize );