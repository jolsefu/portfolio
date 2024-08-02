const editButton = document.querySelector( '#edit-btn' );
const content = document.querySelector( '#content' );

editButton.addEventListener( 'click', handleEdit );

function handleEdit() {
  if ( editButton.className === 'active' ) {
    editButton.className = '';
    content.contentEditable = 'false';
  } else {
    editButton.className = 'active';
    content.contentEditable = 'true';
  }
}