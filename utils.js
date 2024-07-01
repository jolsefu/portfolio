export function createElement(name, textContent, styles, classname) {
  const element = document.createElement( name );
  element.textContent = textContent;
  element.className = classname;

  for (const [key, value] of Object.entries(styles)) {
    element.style.setProperty(key, value);
  }

  return element;
}