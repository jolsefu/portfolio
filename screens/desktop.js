let elements = [];

function showDate() {
  const clientDate = new Date();
  const formattedDate = formatClientDateTime( clientDate );
  
  document.querySelector( '#time-display' ).innerHTML = formattedDate;
}

function isClickedOutside( event ) {
  if ( !elements.includes( event.target ) ) {
    removeAllIconHighlight();  
  }
}

function enableIconHighlightOnClick() {
  const icons = document.querySelectorAll( '.icon' );

  icons.forEach( iconDiv => {
    elements.push( iconDiv );
    elements.push( iconDiv.children[0] );
    elements.push( iconDiv.children[1] );

    removeAllIconHighlight();  

    iconDiv.addEventListener( 'click', () => {
      iconDiv.children[0].setAttribute( 'style', 'background-color: rgba(0, 0, 255, 0.5);' );
    } )

  } );

  document.addEventListener( 'click', isClickedOutside );
}

function removeAllIconHighlight() {
  const icons = document.querySelectorAll( '.icon' );

  icons.forEach( iconDiv => {

    iconDiv.children[0].setAttribute( 'style', '' );

  } );
}

function formatClientDateTime(clientDateTime) {
  const date = new Date( clientDateTime );

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayName = days[ date.getUTCDay() ];
  const dayNum = date.getUTCDate();
  const month = months[ date.getUTCMonth() ];
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart( 2, '0' );
  const seconds = date.getUTCSeconds().toString().padStart( 2, '0' );

  const formattedDateTime = `${dayName}. ${dayNum} ${month} ${hours}:${minutes}:${seconds}`;

  return formattedDateTime;
}

function initialize() {
  setInterval( showDate, 1000 );
  
  enableIconHighlightOnClick();
}

document.addEventListener( 'DOMContentLoaded', initialize );