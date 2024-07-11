import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

import * as utils from './utils.js';
import coordinates from './coordinates.json';

let glRenderer, glScene, cssRenderer, cssScene, controls, camera;

/////////////////////////////
// Renderer Features       //
/////////////////////////////

function createWebGLRenderer() {
	glRenderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	glRenderer.setClearColor( 0x000000 );
	glRenderer.setSize( window.innerWidth, window.innerHeight );

	glRenderer.domElement.style.position = 'absolute';
	glRenderer.domElement.style.top = 0;

	cssRenderer.domElement.appendChild( glRenderer.domElement );
}

function createCSS3DRenderer() {
	cssRenderer = new CSS3DRenderer();
	cssRenderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( cssRenderer.domElement );
}

/////////////////////////////
// Scene Features          //
/////////////////////////////

function addLight() {
	const spotLight = new THREE.SpotLight( 0xf5eac6, 50 );
	spotLight.position.set( 2, 2, 2 );
	glScene.add( spotLight );

	const light = new THREE.AmbientLight( 0x404040 );
	glScene.add( light );
}

function addModel() {
	const loader = new GLTFLoader();

	loader.load( 'low_poly_computer_desk/scene.glb', function ( gltf ) {
		const model = gltf.scene;

		const screen = model.getObjectByName( 'monitor_2' );
		screen.material.transparent = true;

		model.scale.set( 1 / 50, 1 / 50, 1 / 50 );
		
		model.position.set( 0, 0, 0 );

		glScene.add( model );
	}, undefined, function ( error ) {
		console.error( error );
	} );
}

function addCSS( url, width, height, position, rotation ) {
	const plane = utils.createPlane( width, height, position, rotation );
	glScene.add( plane );

	const cssObject = utils.createCSSObject( url, width, height, position, rotation );
	cssScene.add( cssObject );

	console.log( plane.rotation, cssObject.rotation )
}

/////////////////////////////
// Camera Functionality    //
/////////////////////////////

function createOrbitControls() {
	controls = new OrbitControls( camera, glRenderer.domElement );
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
}

function createCameraTimeline() {
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
}

/////////////////////////////
// 3D Object Functionality //
/////////////////////////////

let raycaster, mouse, objectInclusions, isAnimating = [];

function setupObjectFunctionality() {
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	objectInclusions = ['monitor_1', 'monitor_2', 'telephone', 'floppy_disk', 'cd', 'top_paper'];

	glRenderer.domElement.addEventListener( 'click', onObjectClick, false );
	glRenderer.domElement.addEventListener( 'mousemove', onObjectHover, false );
}

function onObjectClick(event) {
	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObjects( glScene.children, true );

	if ( intersects.length > 0 ) {
		const object = intersects[0].object;

		if ( object.name === 'monitor_1' || object.name === 'monitor_2' ) {
			utils.animateCameraToMonitor( controls );
		}
	}
}

function onObjectHover( event ) {
	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObjects( glScene.children, true );

	if ( intersects.length > 0 ) {
		const object = intersects[0].object;

		if ( validateObject( object.name ) && utils.isInDesk ) {
			animateObject( object );
		}
	}
}

function validateObject( objectName ) {
	return objectInclusions.includes( objectName ) && !isAnimating.includes( objectName );
}

function animateObject( object ) {
	let tween;

	const rootNode = object.parent.parent;		

	if ( object.name === 'floppy_disk' ) {
		tween = utils.animateObject( object, 0, 0, -5, 0, 1.5 );
	} else if ( object.name === 'top_paper' ) {
		const pen = rootNode.getObjectByName( 'pen' );
		const bottomPaper = rootNode.getObjectByName( 'bottom_paper' );

		tween = utils.animateObject( object, 0, 45, 0, 0, 1 );
		utils.animateObject( pen, 0, 2000, 0, 0, 1 );
		utils.animateObject( bottomPaper, 0, 40, 0, .2, .5 );
	} else if ( object.name === 'monitor_1' || object.name === 'monitor_2' ) {
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

/////////////////////////////
// Helpers                 //
/////////////////////////////

function enableCameraHelper() {
	controls.addEventListener("change", event => {
		console.log("Position");
		console.log( controls.object.position );
		console.log("Target");
		console.log( controls.target );
		console.log( controls.object.rotation );
	});
}

function enableGridHelper() {
	const size = 10; 
	const divisions = 10;

	const gridHelper = new THREE.GridHelper( size, divisions );
	glScene.add( gridHelper );

	const axesHelper = new THREE.AxesHelper( 5 );
	glScene.add( axesHelper );
}

/////////////////////////////
// Initialization          //
/////////////////////////////

function initialize() {
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

	glScene = new THREE.Scene();
	cssScene = new THREE.Scene();
	cssScene.scale.set( 0.0005, 0.0005, 0.00065 );

	createCSS3DRenderer();
	createWebGLRenderer();

	// glRenderer.domElement.style.pointerEvents = 'none';

	createOrbitControls();
	createCameraTimeline();

	setupObjectFunctionality();

	// Helpers
	// enableCameraHelper();	
	// enableGridHelper();

	// Add features
	addLight();
	addModel();

	addCSS( 
		'screens/home.html',
		1070,
		780,	
		new THREE.Vector3( -150, 3913, 1190 ),
		new THREE.Vector3( -0.1, 0, 0 ),
	);
}

initialize();

/////////////////////////////
// Rendering               //
/////////////////////////////

function animate() {
  requestAnimationFrame( animate );

	controls.update();
	
  glRenderer.render( glScene, camera );
	cssRenderer.render( cssScene, camera );
}

if ( WebGL.isWebGLAvailable() ) {
	animate();
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );
}

window.addEventListener( 'resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	glRenderer.setSize( window.innerWidth, window.innerHeight );
	cssRenderer.setSize( window.innerWidth, window.innerHeight );
} )