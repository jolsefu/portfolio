export function playSingleClick() {
  const click = new Audio( '../audio/single_click.mp3' );

  click.play();
}

document.addEventListener( 'mousedown', playSingleClick );
document.addEventListener( 'mouseup', playSingleClick );