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
controls.object.position.set( -2.3526288774578337, 1.7044013644293665, 4.176237365643187 );
// Starting camera face
controls.target = new THREE.Vector3( 0.8189440398780271, 0.7194347615533029, 2.033148879219393 );
controls.update();


// const light = new THREE.DirectionalLight(0xffffff, 5);
// light.position.set(0, 0, -5);
// light.castShadow = true;
// scene.add( light );

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



const p = utils.createElement('p', 'AAAAAAAAAAAAAAAA', {'color': 'blue'}, "className");
// p.textContent = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
// p.style.color = 'white';
const pLabel = new CSS2DObject( p );
const vec = new THREE.Vector3( 0, 0, -5 );
vec.applyQuaternion( camera.quaternion );
pLabel.position.copy( vec );
scene.add( pLabel );

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

document.querySelector( '#go-to-desk-button' ).addEventListener( 'click', () => {
	gsap.to(controls.object.position, {
		x: -0.565064986615273, y: 1.2051511341925925, z: 1.5898158224634866,
		duration: 2,
		ease: "power3.out",
	});

	gsap.to(controls.target, {
		x: -0.3446645948412711, y: 1.0331916691065197, z: 1.0493875923082525,
		duration: 2,
		ease: "power3.out",
	});
} )

const loader = new GLTFLoader();

loader.load( 'low_poly_computer_desk/scene.glb', function ( gltf ) {

	const model = gltf.scene;

	// Reduce model aspect ratio
	model.scale.set( 1 / 100, 1 / 100, 1 / 100 );
	
	model.position.set( 0, 0, 0 );

	scene.add( model );

}, undefined, function ( error ) {

	console.error( error );

} );


// Utility functions

/**
 * Hovered Object Animation
*/

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
// Excepted from the animation
const objectInclusions = [
	'monitor', 'telephone', 'floppy_disk', 'cd', 'pen'
];
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

		if ( objectIsIncluded( object.name ) && !isAnimating.includes( object.name ) ) {
			// Move position
			let tween;

			if ( object.name === 'floppy_disk' ) {
				tween = gsap.to( object.position, {
					x: object.position.x, y: object.position.y, z: object.position.z - 10,
					duration: 1.5,
					ease: "power3.out"
				} );
			} else if ( object.name === 'pen' ) {
				tween = gsap.to( object.position, {
					x: object.position.x, y: object.position.y + 1000, z: object.position.z,
					duration: 1.5,
					ease: "power3.out"
				} );
			} else {
				tween = gsap.to( object.position, {
					x: object.position.x, y: object.position.y + 15, z: object.position.z,
					duration: 1.5,
					ease: "power3.out"
				} );
			}

			tween.eventCallback("onComplete", () => {
				tween.reverse();
			})

			tween.eventCallback("onReverseComplete", () => {
				isAnimating = isAnimating.filter( e => e !== object.name );
			})

			tween.play();
			isAnimating.push( object.name );

			// Enlarge
			// gsap.to( object.scale, {
			// 	x: 1.05, y: 1.05, z: 1.05,
			// 	duration: 2,
			// 	ease: "power3.out"
			// } );

			// gsap.to( object.position, {
			// 	x: object.position.x, y: object.position.y - 5, z: object.position.z,
			// 	delay: 2,
			// 	duration: 2,
			// 	ease: "power3.out"
			// } );

			// gsap.to( object.scale, {
			// 	x: 1, y: 1, z: 1,
			// 	delay: 2,
			// 	duration: 2,
			// 	ease: "power3.out"
			// } );
		}
	}
}

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
	}
}




// HELPERS
// const directionalLightHelper = new THREE.DirectionalLightHelper( light );
// scene.add( directionalLightHelper );

// const spotLightHelper = new THREE.SpotLightHelper( spotLight );
// scene.add( spotLightHelper );

// const size = 10;
// const divisions = 10;

// const gridHelper = new THREE.GridHelper( size, divisions );
// scene.add( gridHelper );

// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

// Print current camera position
controls.addEventListener("change", event => {
	// console.log("Position");
	// console.log( controls.object.position );
	// console.log("Target");
	// console.log( controls.target );
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