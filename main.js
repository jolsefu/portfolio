import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

import { gsap } from 'gsap';

import * as utils from './utils.js';
import coordinates from './coordinates.json';

/**
 * SETUP
 * 
*/

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
renderer.setClearColor( 0x000000 );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;

// Starting camera position
controls.object.position.set(
	coordinates.start.position.x, 
	coordinates.start.position.y, 
	coordinates.start.position.z
);
// Starting camera target
controls.target = new THREE.Vector3( 
	coordinates.start.target.x,
	coordinates.start.target.y, 
	coordinates.start.target.z
);
controls.update();

// Disable or Enable OrbitControls mouse
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

// CSS 3D Renderer
const cssScene = new THREE.Scene();
cssScene.scale.set( 0.0005, 0.0005, 0.00065 );

const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize( window.innerWidth, window.innerHeight );
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0';
cssRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild( cssRenderer.domElement );

// CSS3DObject Sample Element
const home = utils.createElement( 'home', -145, 3913, 1200 );
cssScene.add( home );

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


/**
 * UTILITY 3D OBJECTS FUNCTIONALITY
 * 
*/

// Hovered 3D Object animation 

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const objectInclusions = ['monitor_1', 'monitor_2', 'telephone', 'floppy_disk', 'cd', 'top_paper'];
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
				tween = utils.animateObject( object, 0, 0, -5, 0, 1.5 );
			} else if ( object.name === 'top_paper' ) {
				const rootNode = object.parent.parent;
				const pen = rootNode.getObjectByName( 'pen' );
				const bottomPaper = rootNode.getObjectByName( 'bottom_paper' );

				tween = utils.animateObject( object, 0, 45, 0, 0, 1 );
				utils.animateObject( pen, 0, 2000, 0, 0, 1 );
				utils.animateObject( bottomPaper, 0, 40, 0, .2, .5 );
			} else if ( object.name === 'monitor_1' || object.name === 'monitor_2' ) {
				const rootNode = object.parent.parent;
				const monitor = rootNode.getObjectByName( 'monitor_1' );
				const screen = rootNode.getObjectByName( 'monitor_2' );

				tween = utils.animateObject( monitor, 0, 15, 0, 0, 1.5 ); 
				utils.animateObject( screen, 0, 15, 0, 0, 1.5 );
			} else {
				tween = utils.animateObject( object, 0, 15, 0, 0, 1.5 );
			}

			tween.eventCallback("onReverseComplete", () => {
				isAnimating = isAnimating.filter( e => e !== object.name );
			});

			isAnimating.push( object.name );
		}
	}
}

// Go To Desk camera animation

document.querySelector( '#go-to-desk-button' ).addEventListener( 'click', () => {
	utils.animateCameraToDesk( controls );
} );

document.querySelector( '#back-btn' ).addEventListener( 'click', () => {
	// Go back to start
	if ( utils.isInDesk ) {
		utils.animateCameraToStart( controls );

		document.querySelector( '#dialog-default' ).showModal();
	// Go back to desk
	} else {
		utils.animateCameraToDesk( controls );
	}
} );

// Clicked 3D Object functionality

renderer.domElement.addEventListener( 'click', onObjectClick, false );

function onObjectClick(event) {
	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObjects( scene.children, true );

	if ( intersects.length > 0 ) {
		const object = intersects[0].object;

		let box3 = new THREE.Box3().setFromObject( object );
		let size = new THREE.Vector3();
		box3.getSize( size );

		console.log( box3.getSize( size ) );

		if ( object.name === 'monitor_1' || object.name === 'monitor_2' ) {
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
	// console.log("Position");
	// console.log( controls.object.position );
	// console.log("Target");
	// console.log( controls.target );
	// console.log( controls.object.rotation );
	
	// let cameraWorld;
	// camera.getWorldDirection( cameraWorld );
	// console.log( cameraWorld );
})

/**
 * MAIN ANIMATION RENDERING
 * 
*/

function animate() {
  requestAnimationFrame( animate );

	controls.update();
	
	cssRenderer.render( cssScene, camera );
  renderer.render( scene, camera );
}

if ( WebGL.isWebGLAvailable() ) {
	animate();
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );
}

// Window resizing
window.addEventListener( 'resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
} )