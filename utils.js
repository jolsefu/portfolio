import { gsap } from 'gsap';
import coordinates from './coordinates.json';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

export let isInDesk = false;

export function createElement( id, x, y, z ) {	
	// const div = document.createElement( 'div' );
	// div.style.width = '480px';
	// div.style.height = '360px';
	// div.style.backgroundColor = '#000';

	const iframe = document.createElement( 'iframe' );
	iframe.style.width = '600px';
	iframe.style.height = '500px';
	iframe.style.border = '0';
	iframe.src = 'screens/home.html';
	// div.appendChild( iframe );

	const object = new CSS3DObject( iframe );
	object.position.set( x, y, z );

	return object;
}

export function animateCameraToStart( controls ) {
	gsap.to(controls.object.position, {
		x: coordinates.start.position.x, y: coordinates.start.position.y, z: coordinates.start.position.z,
		duration: 2,
		ease: "power3.out",
	});

	gsap.to(controls.target, {
		x: coordinates.start.target.x, y: coordinates.start.target.y, z: coordinates.start.target.z,
		duration: 2,
		ease: "power3.out",
	});

  isInDesk = false;
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