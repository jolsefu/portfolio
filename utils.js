import { gsap } from 'gsap';
import coordinates from './coordinates.json';

export let isInDesk = false;

export function createElement( name, textContent, styles, classname ) {
  const element = document.createElement( name );
  element.textContent = textContent;
  element.className = classname;

  for (const [key, value] of Object.entries(styles)) {
    element.style.setProperty(key, value);
  }

  return element;
}

export function animateCameraToDesk( controls ) {
	gsap.to(controls.object.position, {
		x: coordinates.desk.position.x, y: coordinates.desk.position.y, z: coordinates.desk.position.z,
		duration: 2,
		ease: "power3.out",
	});

	gsap.to(controls.target, {
		x: coordinates.desk.target.x, y: coordinates.desk.target.y, z: coordinates.desk.target.z,
		duration: 2,
		ease: "power3.out",
	});

  isInDesk = true;
}

export function animateCameraToMonitor( controls ) {
	gsap.to(controls.object.position, {
    x: coordinates.monitor.position.x, y: coordinates.monitor.position.y, z: coordinates.monitor.position.z,
		duration: 2,
		ease: "power3.out",
	});

	gsap.to(controls.target, {
    x: coordinates.monitor.target.x, y: coordinates.monitor.target.y, z: coordinates.monitor.target.z,
		duration: 2,
		ease: "power3.out",
	});

  isInDesk = false;
}