import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

import * as utils from './utils.js';
import coordinates from './coordinates.json';

let glRenderer, glScene, cssRenderer, cssScene, controls, camera, manager;

/////////////////////////////
// Renderer Features       //
/////////////////////////////

function createWebGLRenderer() {
	glRenderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	glRenderer.shadowMap.enabled = true;
	glRenderer.setClearColor( 0xADD8E6 );
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

function createLoadingManager() {
	const htmlLoader = document.querySelector( '#loader' );
	htmlLoader.style.display = 'block';
	manager = new THREE.LoadingManager();

	manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
		const str = '<div>' + 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' + '</div>';
		const div = document.createElement( 'div' );
		div.innerHTML = str;

		htmlLoader.appendChild( div );
	};
	
	manager.onLoad = function ( ) {
		openDialog();
		showBackButton();

		htmlLoader.setAttribute( 'style', 'display: none;' );
	};
	
	manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
		const str = '<div>' + 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' + '</div>';
		const div = document.createElement( 'div' );
		div.innerHTML = str;

		htmlLoader.appendChild( div );
	};
	
	manager.onError = function ( url ) {
		const str = '<div>' + 'There was an error loading ' + url + '</div>';
		const div = document.createElement( 'div' );
		div.innerHTML = str;

		htmlLoader.appendChild( div );
	};
}

/////////////////////////////
// Scene Features          //
/////////////////////////////

function addLight() {
	const directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );

	directionalLight.position.set( 3, 3, 3 );
	directionalLight.shadow.bias = -0.00019;
	directionalLight.castShadow = true;

	glScene.add( directionalLight )
}

function addModel() {
	const loader = new GLTFLoader( manager );

	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath( 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/' );
	dracoLoader.setDecoderConfig( {type: 'js'} );
	loader.setDRACOLoader( dracoLoader );

	loader.load( 'static/low_poly_computer_desk/scene_optimized_blender.glb', function ( gltf ) {
		const model = gltf.scene;

		const screen = model.getObjectByName( 'screen' );
		screen.position.x -= 1;
		screen.material.transparent = true;
		screen.material.opacity = 0.4;

		model.traverse( ( child ) => {
			if ( child.isMesh ) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		} );

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

	objectInclusions = [ 'telephone', 'floppy_disk', 'cd', 'top_paper'];

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

		if ( object.name === 'monitor' || object.name === 'screen' ) {
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

	createLoadingManager();
	createCSS3DRenderer();
	createWebGLRenderer();

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
		'static/screens/desktop.html',
		1070,
		780,	
		new THREE.Vector3( -156, 3905, 1181 ),
		new THREE.Vector3( -0.1, 0, 0 ),
	);
	const blackPlane = utils.createBlackPlane( 
		1400, 
		1000, 
		new THREE.Vector3( -155, 3910, 1180 ),
		new THREE.Vector3( -0.1, 0, 0 ),
	);

	glScene.add( blackPlane );

	checkWebGL();
}

function correctOrientation() {
	if ( window.matchMedia( "(orientation: portrait)" ).matches ) {
		const div = document.createElement( 'div' );
		const button = document.createElement( 'button' );
		const warning = `
		<div style="width: 50vw;">
				This website is best experienced in a laptop or computer. 
				If you do still wish to continue, orient it to landscape. 
				Click the button after reorientating.
		</div>
		`;

		button.onclick = () => { window.location.reload( true ) };
		button.innerHTML = 'Reload page';

		div.setAttribute( 'style', `
			display: flex;
			height: 50vh;
			justify-content: center; 
			align-items: center; 
			flex-direction: column; 
			margin: 1rem;
		` );
		div.innerHTML = warning;
		div.appendChild( button );

		document.querySelector( '#warning' ).appendChild( div );
 	}
 
 	if ( window.matchMedia( "(orientation: landscape)" ).matches ) {
		initialize();
 	}
}

function openDialog() {
	document.querySelector( '#dialog-default' ).style.display = 'block';
	document.querySelector( '#dialog-default' ).showModal();
};

function showBackButton() {
	document.querySelector( '#back-btn' ).style.display = 'block';
}

correctOrientation();

/////////////////////////////
// Rendering               //
/////////////////////////////

function animate() {
  requestAnimationFrame( animate );

	controls.update();
	
  glRenderer.render( glScene, camera );
	cssRenderer.render( cssScene, camera );

	if ( utils.isInMonitor ) {
		glRenderer.domElement.style.pointerEvents = 'none';
	} else {
		glRenderer.domElement.style.pointerEvents = 'auto';
	}
}

function checkWebGL() {
	if ( WebGL.isWebGLAvailable() ) {
		animate();
	} else {
		const warning = WebGL.getWebGLErrorMessage();
		document.querySelector( '#warning' ).appendChild( warning );
	}
}

window.addEventListener( 'resize', () => {
	if ( window.innerHeight > window.innerWidth )	{
		window.location.reload( true );
	}

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	glRenderer.setSize( window.innerWidth, window.innerHeight );
	cssRenderer.setSize( window.innerWidth, window.innerHeight );
} )