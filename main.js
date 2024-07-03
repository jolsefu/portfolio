import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

import { gsap } from 'gsap';

import * as utils from './utils.js';

// Setup

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
// Starting camera position
controls.object.position.set( -3.164403208941583, 2.312294606497067, 5.492750812337571 );
// Starting camera face
controls.target = new THREE.Vector3( 0.38907103355456535, 1.9556824230021994, 3.37513881081412 );
controls.update();

// Disable OrbitControls mouse
controls.enabled = true;

// const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
// directionalLight.position.set(0, 0, -5);
// directionalLight.castShadow = true;
// scene.add( directionalLight );

// const pointlight = new THREE.PointLight( 0xf5eac6, 100 );
// pointlight.position.set( 0.5844349384280548, 1.3483988826767448, -0.8302064764553763 );
// scene.add( pointlight );

const spotLight = new THREE.SpotLight( 0xf5eac6, 50 );
spotLight.position.set( 2, 2, 2 );
scene.add( spotLight );

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );


const info = new CSS2DRenderer();
info.setSize( window.innerWidth, window.innerHeight );
info.domElement.style.position = 'absolute';
info.domElement.style.top = '0px';
info.domElement.style.pointerEvents = 'none';

document.body.appendChild( info.domElement );

const button = document.createElement( 'div' );


// CSS2DObject Sample Element
// const p = utils.createElement('p', 'AAAAAAAAAAAAAAAA', {'color': 'blue'}, "className");
// p.textContent = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
// p.style.color = 'white';
// const pLabel = new CSS2DObject( p );
// const vec = new THREE.Vector3( 0, 0, -5 );
// vec.applyQuaternion( camera.quaternion );
// pLabel.position.copy( vec );
// scene.add( pLabel );

// // Ground
// const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
// groundGeometry.rotateX(-Math.PI / 2);
// const groundMaterial = new THREE.MeshStandardMaterial({
//   color: 0x555555,
//   side: THREE.DoubleSide
// });
// const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
// groundMesh.castShadow = false;
// groundMesh.receiveShadow = true;
// scene.add(groundMesh);

// // Light
// const spotlight = new THREE.SpotLight(0xffffff, 3, 100, 0.2, 0.5);
// spotlight.position.set(0, 25, 0);
// scene.add(spotlight);

const loader = new GLTFLoader();

loader.load( 'low_poly_computer_desk/scene.glb', function ( gltf ) {

	const model = gltf.scene;

	// Reduce model aspect ratio
	model.scale.set( 1 / 50, 1 / 50, 1 / 50 );
	
	model.position.set( 0, 0, 0 );

	scene.add( model );

}, undefined, function ( error ) {

	console.error( error );

} );


// Utility 3D Object functions

/**
 * Hovered Object Animation
 *
*/

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const objectInclusions = ['monitor', 'telephone', 'floppy_disk', 'cd', 'top_paper'];
let isAnimating = [];

renderer.domElement.addEventListener( 'mousemove', onObjectHover, false );

function objectIsIncluded( objectName ) {
	return objectInclusions.includes( objectName );
}

function onObjectHover( event ) {
	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObjects( scene.children, true );

	if ( intersects.length > 0 ) {
		const object = intersects[0].object;

		if ( objectIsIncluded( object.name ) && !isAnimating.includes( object.name ) && utils.isInDesk ) {
			let tween;

			if ( object.name === 'floppy_disk' ) {
				tween = gsap.to( object.position, {
					x: object.position.x, y: object.position.y, z: object.position.z - 5,
					duration: 1.5,
					ease: "power3.out"
				} );
			} else if ( object.name === 'top_paper' ) {
				tween = gsap.to( object.position, {
					x: object.position.x, y: object.position.y + 45, z: object.position.z,
					duration: 1,
					ease: "power3.out"
				} )

				const rootNode = object.parent.parent;
				const pen = rootNode.getObjectByName( 'pen' );
				const bottomPaper = rootNode.getObjectByName( 'bottom_paper' );

				const penTween = gsap.to( pen.position, {
					x: pen.position.x, y: pen.position.y + 2000, z: pen.position.z,
					duration: 1,
					ease: "power3.out"
				} );

				penTween.eventCallback( 'onComplete', () => {
					penTween.reverse();
				} );

				penTween.play();

				const bottomPaperTween = gsap.to( bottomPaper.position, {
					x: bottomPaper.position.x, y: bottomPaper.position.y + 40, z: bottomPaper.position.z,
					delay: .2,
					duration: .5,
					ease: "power3.out"
				} );

				bottomPaperTween.eventCallback( 'onComplete', () => {
					bottomPaperTween.reverse();
				} );

				bottomPaperTween.play();
			} else {
				tween = gsap.to( object.position, {
					x: object.position.x, y: object.position.y + 15, z: object.position.z,
					duration: 1.5,
					ease: "power3.out"
				} );
			}

			tween.eventCallback("onComplete", () => {
				tween.reverse();
			});

			tween.eventCallback("onReverseComplete", () => {
				isAnimating = isAnimating.filter( e => e !== object.name );
			});

			tween.play();
			isAnimating.push( object.name );
		}
	}
}

// Camera Movements Functions

document.querySelector( '#go-to-desk-button' ).addEventListener( 'click', () => {
	utils.animateCameraToDesk( controls );
} )

/**
 * Clicked Object Functionality
 * 
*/

renderer.domElement.addEventListener( 'click', onObjectClick, false );

function onObjectClick(event) {
	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObjects( scene.children, true );

	if ( intersects.length > 0 ) {
		const object = intersects[0].object;

		console.log( object.name );

		if ( object.name === 'monitor' ) {
			utils.animateCameraToMonitor( controls );
		}
	
	}
}


// const divisions = 10;

// const gridHelper = new THREE.GridHelper( size, divisions );
// scene.add( gridHelper );

// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

// Print current camera position
controls.addEventListener("change", event => {
	console.log("Position");
	console.log( controls.object.position );
	console.log("Target");
	console.log( controls.target );
	// console.log( controls.object.rotation );
	
	// let cameraWorld;
	// camera.getWorldDirection( cameraWorld );
	// console.log( cameraWorld );
})





function animate() {
  requestAnimationFrame( animate );

	controls.update();
	
	info.render( scene, camera );
  renderer.render( scene, camera );
}

if ( WebGL.isWebGLAvailable() ) {
	// Initiate function or other initializations here
	animate();
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );
}

// Resizing
window.addEventListener( 'resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
} )