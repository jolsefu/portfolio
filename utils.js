import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

import { gsap } from 'gsap';

import coordinates from './coordinates.json';

export let isInDesk = false;
export let isInMonitor = false;

export function createPlane( width, height, position, rotation ) {
  const material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    opacity: 0,
    side: THREE.DoubleSide,
    blending: THREE.NoBlending
  });
  const geometry = new THREE.PlaneGeometry( width, height );
  const mesh = new THREE.Mesh( geometry, material );

	mesh.scale.set( 0.0005, 0.0005, 0.00065 );
	mesh.position.set( position.x * 0.0005, position.y * 0.0005, position.z * 0.00065 );
	mesh.rotation.set( -0.135, rotation.y, rotation.z );

  return mesh;
}

export function createCSSObject( url, width, height, position, rotation ) {
	const html = [
    '<div style="width:' + width + 'px; height:' + height + 'px;">',
    '<iframe src="' + url + '" width="' + width + '" height="' + height + '" frameborder="0">',
    '</iframe>',
    '</div>'
  ].join('\n');
	const div = document.createElement( 'div' );

  div.innerHTML = html;

  const cssObject = new CSS3DObject( div );

	// iframe.addEventListener( 'load', () => {

	// 	const iframeDocument = iframe.contentWindow.document;

	// 	iframeDocument.addEventListener( 'click', () => {
	// 		if ( isInDesk ) animateCameraToMonitor( controls );
	// 	} );

	// } );
	
	cssObject.position.set( position.x, position.y, position.z );
	cssObject.rotation.set( rotation.x, rotation.y, rotation.z );

	return cssObject;
}

export function createElement( id, x, y, z, controls ) {	
	return object;
}

export function animateObject( object, x, y, z, del, dur ) {
	const tween = gsap.to( object.position, {
		x: object.position.x + x, y: object.position.y + y, z: object.position.z + z,
		delay: del,
		duration: dur,
		ease: "power3.out"
	} );

	tween.eventCallback("onComplete", () => {
		tween.reverse();
	});

	tween.play();

	return tween;
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
	isInMonitor = false;
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
	isInMonitor = false;
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
	isInMonitor = true;
}