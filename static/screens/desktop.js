let window_count = 0, iconHighlightElements = [];

const isMobileDevice = window.navigator.userAgent.toLowerCase().includes( "mobi" );

function showDate() {
  const clientDate = new Date();
  const formattedDate = formatClientDateTime( clientDate );
  
  document.querySelector( '#time-display' ).innerHTML = formattedDate;
}

function hideIconGroup() {
  document.querySelector( '#icon-group' ).style.display = 'none';
}

function showIconGroup() {
  document.querySelector( '#icon-group' ).style.display = 'block';
}

function removeLastWindow() {
  document.querySelector( '#icon-group' ).lastChild.remove();
  document.querySelector( `#window-3` ).remove();
  window_count--;

  console.log( document.querySelector( '#icon-group' ).lastChild );
}

function createWindow( icon ) {
  showIconGroup();

  window_count++;

  if ( window_count > 3 ) removeLastWindow();

  const window = document.querySelector( '.window' ).cloneNode( true );
  const body = document.querySelector( 'body' );
  const iframe = window.querySelector( 'iframe' );

  window.id = 'window' + '-' + window_count;
  window.querySelector( '.window-header > .title' ).innerHTML = 
    icon.parentNode.querySelector( '.icon-text' ).innerHTML;
  window.querySelector( '#minimize' ).addEventListener( 'click', () => minimizeWindow( window ) );
  window.querySelector( '#maximize' ).addEventListener( 'click', () => maximizeWindow( window ) );
  window.querySelector( '#exit' ).addEventListener( 'click', () => exitWindow( window ) );
  draggableWindow( window );
  makeResizableWindow( window );

  const source = icon.getAttribute( 'data-source' );
  iframe.src = source;

  const width = icon.getAttribute( 'data-width' );
  const height = icon.getAttribute( 'data-height' );
  window.setAttribute( 'data-width', width );
  window.setAttribute( 'data-height', height );

  const calcPos = () => {
    return `${100 + ( window.id.slice( 7 ) * 10 ) }`;
  };

  const showWindow = () => {
    window.setAttribute( 'style',
      `display: block; 
      width: ${width}; 
      height: ${height}; 
      top: ${ calcPos() }px; 
      left: ${ calcPos() }px;` 
    );
  };
  showWindow();

  const iconClone = icon.cloneNode( true );
  iconClone.id = 'icon' + '-' + window_count;
  iconClone.setAttribute( 'style', '' );
  iconClone.addEventListener( 'click', showWindow );
  document.querySelector( '#icon-group' ).appendChild( iconClone );

  body.appendChild( window );
}

function showWindowOnDoubleClick( icon ) {
  if ( !isMobileDevice ) icon.addEventListener( 'dblclick', () => createWindow( icon ) );
  else icon.addEventListener( 'click', () => createWindow( icon ) );
}

function exitWindow( window ) {
  window.remove();
  document.querySelector( `#icon-${window.id.slice( 7 )}` ).remove();
  window_count--;

  if ( !document.querySelector('#icon-group').lastChild ) hideIconGroup();
}

function minimizeWindow( window ) {
  window.style.display = 'none';
}

function maximizeWindow( window ) {
  const maximized = window.getAttribute( 'data-maximized' ) === 'true';
  const topbarHeight = document.querySelector( '#topbar' ).offsetHeight + 'px';

  if ( maximized ) {
    const width = window.getAttribute( 'data-width' );
    const height = window.getAttribute( 'data-height' );

    window.setAttribute( 'style', `display: block; width: ${ width }; height: ${ height }; top: ${ topbarHeight }; left: 0;` );
    window.setAttribute( 'data-maximized', 'false' );
  } else if ( !maximized ) {
    window.setAttribute( 'style', `display: block; width: 100vw; height: 92.5vh; top: ${ topbarHeight }; left: 0;` );
    window.setAttribute( 'data-maximized', 'true' );
  }

}

function makeResizableWindow( windowDiv ) {
  const element = windowDiv;
  const resizers = windowDiv.querySelectorAll( '.resizer' );
  const minimum_size = 200;
  const iframe = windowDiv.querySelector( 'iframe' );

  let original_width = 0;
  let original_height = 0;
  let original_x = 0;
  let original_y = 0;
  let original_mouse_x = 0;
  let original_mouse_y = 0;

  for ( let i = 0; i < resizers.length; i++ ) {
    const currentResizer = resizers[ i ];

    ['mousedown', 'touchstart'].forEach( evt => {
      currentResizer.addEventListener( evt, ( e ) => {
        e.preventDefault();
        iframe.setAttribute( 'style', 'pointer-events: none;' );

        original_width = 
          parseFloat( getComputedStyle( element, null ).getPropertyValue( 'width' ).replace( 'px', '' ) );
        original_height = 
          parseFloat( getComputedStyle( element, null ).getPropertyValue( 'height' ).replace( 'px', '' ) );
        original_x = element.getBoundingClientRect().left;
        original_y = element.getBoundingClientRect().top;
        original_mouse_x = e.pageX;
        original_mouse_y = e.pageY;

        [ 'mousemove', 'touchmove' ].forEach( evt => {
          document.addEventListener( evt, resize );
        } );
        [ 'mouseup', 'touchend' ].forEach( evt => {
          document.addEventListener( evt, stopResize );
        } );
      } );
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
      iframe.setAttribute( 'style', 'pointer-events: auto;' );

      [ 'mousemove', 'touchmove' ].forEach( evt => {
        document.removeEventListener( evt, resize );
      } );
    }
  }
}

function draggableWindow( windowDiv ) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const iframe = windowDiv.querySelector( 'iframe' );

  const selectedWindowDiv = windowDiv.querySelector( '.' + windowDiv.className + '-' + 'header' );
  [ 'mousedown', 'touchstart' ].forEach( evt => {
    selectedWindowDiv.addEventListener( evt, dragMouseDown );
  } );

  function dragMouseDown( e ) {
    e.preventDefault();

    pos3 = e.clientX;
    pos4 = e.clientY;

    iframe.setAttribute( 'style', 'pointer-events: none;' );

    [ 'mouseup', 'touchend' ].forEach( evt => {
      document.addEventListener( evt, closeDragElement );
    } );
    [ 'mousemove', 'touchmove' ].forEach( evt => {
      document.addEventListener( evt, elementDrag );
    } );
  }

  function elementDrag( e ) {
    e.preventDefault();

    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;

    pos3 = e.clientX;
    pos4 = e.clientY;

    windowDiv.style.top = ( windowDiv.offsetTop - pos2 ) + "px";
    windowDiv.style.left = ( windowDiv.offsetLeft - pos1 ) + "px";
  }

  function closeDragElement() {
    iframe.setAttribute( 'style', 'pointer-events: auto;' );

    [ 'mouseup', 'touchend' ].forEach( evt => {
      document.removeEventListener( evt, closeDragElement );
    } );
    [ 'mousemove', 'touchmove' ].forEach( evt => {
      document.removeEventListener( evt, elementDrag );
    } );
  }
}

function enableIconHighlightOnClick() {
  function isClickedOutside( event ) {
    if ( !iconHighlightElements.includes( event.target ) ) removeAllIconHighlight();  
  }

  function removeAllIconHighlight() {
    const icons = document.querySelectorAll( '.icon' );
    icons.forEach( iconDiv => iconDiv.children[0].setAttribute( 'style', '' ) );
  }

  const icons = document.querySelectorAll( '.icon' );

  icons.forEach( iconDiv => {
    iconHighlightElements.push( iconDiv );
    iconHighlightElements.push( iconDiv.children[0] );
    iconHighlightElements.push( iconDiv.children[1] );

    removeAllIconHighlight();  

    iconDiv.addEventListener( 
      'click', 
      () => { 
        removeAllIconHighlight();
        iconDiv.querySelector( '.icon-image' ).setAttribute( 'style', 'background-color: rgba(0, 0, 255, 0.5);' )
      }
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

  document.querySelectorAll( '.icon-image' ).forEach( icon => showWindowOnDoubleClick( icon ) );

  const maximizeButton = document.querySelector( '#maximize' );
  maximizeButton.addEventListener( 'click', maximizeWindow );

  const minimizeButton = document.querySelector( '#minimize' );
  minimizeButton.addEventListener( 'click', minimizeWindow );

  const exitButton = document.querySelector( '#exit' );
  exitButton.addEventListener( 'click', exitWindow );

  hideIconGroup();
}

document.addEventListener( 'DOMContentLoaded', initialize );