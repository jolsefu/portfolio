let elements = [];

function showDate() {
  const clientDate = new Date();
  const formattedDate = formatClientDateTime( clientDate );
  
  document.querySelector( '#time-display' ).innerHTML = formattedDate;
}

function showWindowOnDoubleClick( icon ) {
  icon.addEventListener( 'dblclick', () => {
    const window = document.querySelector( '.window' );
    const body = document.querySelector( 'body' );

    console.log( icon );

    window.querySelector( '.window-header' ).innerHTML = icon.querySelector( '.icon-text' );
    window.setAttribute( 'style', 'display: block;' );

    body.appendChild( window );
  } );
}

// https://medium.com/the-z/making-a-resizable-div-in-js-is-not-easy-as-you-think-bda19a1bc53d 
// By Hung Nguyen
function makeResizableWindow( windowDiv ) {
  const element = document.querySelector( windowDiv );
  const resizers = document.querySelectorAll( windowDiv + ' .resizer' );
  const minimum_size = 200;

  let original_width = 0;
  let original_height = 0;
  let original_x = 0;
  let original_y = 0;
  let original_mouse_x = 0;
  let original_mouse_y = 0;

  for ( let i = 0; i < resizers.length; i++ ) {
    const currentResizer = resizers[ i ];

    currentResizer.addEventListener( 'mousedown', ( e ) => {
      e.preventDefault();
      original_width = 
        parseFloat( getComputedStyle( element, null ).getPropertyValue( 'width' ).replace( 'px', '' ) );
      original_height = 
        parseFloat( getComputedStyle( element, null ).getPropertyValue( 'height' ).replace( 'px', '' ) );
      original_x = element.getBoundingClientRect().left;
      original_y = element.getBoundingClientRect().top;
      original_mouse_x = e.pageX;
      original_mouse_y = e.pageY;
      window.addEventListener( 'mousemove', resize );
      window.addEventListener( 'mouseup', stopResize );
    } );
    
    function resize( e ) {
      if (currentResizer.classList.contains('bottom-right')) {
        const width = original_width + (e.pageX - original_mouse_x);
        const height = original_height + (e.pageY - original_mouse_y);

        if ( width > minimum_size ) {
          element.style.width = width + 'px';
        }
        if ( height > minimum_size ) {
          element.style.height = height + 'px';
        }
      }
      else if ( currentResizer.classList.contains( 'bottom-left' ) ) {
        const height = original_height + ( e.pageY - original_mouse_y );
        const width = original_width - ( e.pageX - original_mouse_x );

        if ( height > minimum_size ) {
          element.style.height = height + 'px';
        }
        if ( width > minimum_size ) {
          element.style.width = width + 'px';
          element.style.left = original_x + (e.pageX - original_mouse_x) + 'px';
        }
      }
      else if ( currentResizer.classList.contains( 'top-right' ) ) {
        const width = original_width + (e.pageX - original_mouse_x);
        const height = original_height - (e.pageY - original_mouse_y);

        if ( width > minimum_size ) {
          element.style.width = width + 'px';
        }
        if ( height > minimum_size ) {
          element.style.height = height + 'px';
          element.style.top = original_y + (e.pageY - original_mouse_y) + 'px';
        }
      }
      else {
        const width = original_width - ( e.pageX - original_mouse_x );
        const height = original_height - ( e.pageY - original_mouse_y );

        if ( width > minimum_size ) {
          element.style.width = width + 'px';
          element.style.left = original_x + (e.pageX - original_mouse_x) + 'px';
        }
        if ( height > minimum_size ) {
          element.style.height = height + 'px';
          element.style.top = original_y + (e.pageY - original_mouse_y) + 'px';
        }
      }
    }
    
    function stopResize() {
      window.removeEventListener('mousemove', resize)
    }
  }
}

// https://www.w3schools.com/howto/howto_js_draggable.asp
// By W3Schools
function draggableWindow( windowDiv ) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  document.querySelector( '.' + windowDiv.className + '-' + 'header' ).onmousedown = dragMouseDown;

  function dragMouseDown( e ) {
    e.preventDefault();

    pos3 = e.clientX;
    pos4 = e.clientY;

    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();

    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;

    pos3 = e.clientX;
    pos4 = e.clientY;

    windowDiv.style.top = ( windowDiv.offsetTop - pos2 ) + "px";
    windowDiv.style.left = ( windowDiv.offsetLeft - pos1 ) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function enableIconHighlightOnClick() {
  function isClickedOutside( event ) {
    if ( !elements.includes( event.target ) ) removeAllIconHighlight();  
  }

  function removeAllIconHighlight() {
    const icons = document.querySelectorAll( '.icon' );
    icons.forEach( iconDiv => iconDiv.children[0].setAttribute( 'style', '' ) );
  }

  const icons = document.querySelectorAll( '.icon' );

  icons.forEach( iconDiv => {
    elements.push( iconDiv );
    elements.push( iconDiv.children[0] );
    elements.push( iconDiv.children[1] );

    removeAllIconHighlight();  

    iconDiv.addEventListener( 
      'click', 
      () => iconDiv.querySelector( '.icon-image' )
      .setAttribute( 'style', 'background-color: rgba(0, 0, 255, 0.5);' ) 
    );
  } );

  document.addEventListener( 'click', isClickedOutside );
}

function formatClientDateTime(clientDateTime) {
  const date = new Date( clientDateTime );

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];

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

  document.querySelectorAll( '.window' ).forEach( window => draggableWindow( window ) );
  document.querySelectorAll( '.icon-image' ).forEach( icon => showWindowOnDoubleClick( icon ) );

  makeResizableWindow( '.window' )
}

document.addEventListener( 'DOMContentLoaded', initialize );