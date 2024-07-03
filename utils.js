import { gsap } from 'gsap';

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
		x: -0.9433118261406928, y: 2.329910512529755, z: 3.2483758383880925,
		duration: 2,
		ease: "power3.out",
	});

	gsap.to(controls.target, {
		x: -0.02832889536066171, y: 1.7402298093022248, z: 0.9562696578987557,
		duration: 2,
		ease: "power3.out",
	});

  isInDesk = true;
}

export function animateCameraToMonitor( controls ) {
	gsap.to(controls.object.position, {
    x: -0.06827423996345765, y: 2.0804747388187046, z: 1.401259616428236,
		duration: 2,
		ease: "power3.out",
	});

	gsap.to(controls.target, {
    x: -0.06451238166526962, y: 1.994970252050544, z: 0.9566169215751376,
		duration: 2,
		ease: "power3.out",
	});

  isInDesk = false;
}