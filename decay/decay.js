(function () {
	
	function getHeightData(imgSrc, imgWidth, imgHeight, cb) {
		var img = new Image(),
			canvas = document.createElement( 'canvas' ),
			i, j, n;
		
		img.src = imgSrc;
		document.body.appendChild(img);
		img.onload = function () {
			
			canvas.width = imgWidth;
			canvas.height = imgHeight;
			
			document.body.appendChild(canvas);
			
			var context = canvas.getContext( '2d' ),
				size = imgWidth * imgHeight,
				data = new Float32Array( size );
		
			context.drawImage(img,0,0);
			
			for ( i = 0; i < size; i ++ ) {
				data[i] = 0;
			}
		
			var imgd = context.getImageData(0, 0, imgWidth, imgHeight),
				pix = imgd.data;
		
			for (j=0, i=0, n = pix.length; i < n; i += (4)) {
				// combine the rgb channels, so 120,50,0 becomes 370. The maximum value would be
				// 255*3, which is 765 which is maximum height.
				var all = pix[i]+pix[i+1]+pix[i+2];
				data[j++] = all/15;
			}
			cb(data);
		};
	}
	
	
	/**
	 * Base plant class
	 */
	var Plant = function () {
		this.init.apply(this, arguments);
	};
	Plant.prototype = {
		decayRate: 0.1, // size unit per second
		minSize: 10,
		size: 50,
		init: function () {
			var plant = this,
				geometry = new THREE.CubeGeometry(plant.size, plant.size, plant.size, 3, 3, 3),
				material = new THREE.MeshLambertMaterial({
					color: 0xCC0000
				}),
				object = new THREE.Mesh(geometry, material);
			
			plant.object = object;
		},
		decay: function ( delta ) {
			var plant = this,
				dims = ["x", "y", "z"],
				rate = plant.decayRate * delta;
			
			_.each(dims, function (dim) {
				var dimValue = plant.object.scale[dim];
				if (plant.size * dimValue > plant.minSize) {
					plant.object.scale[dim] = dimValue - rate;
				}
			});
		}
	};
	
	var Landscape = function () {
		this.init.apply(this, arguments);
	};
	Landscape.prototype = {
		width: 200,
		depth: 200,
		unitToFoot: (52800/7500), // unit * <this_number> = 1 foot
		
		init: function (cb) {
			var land = this;
			
			getHeightData("../assets/sf_elevation.jpg", 600, 600, function (heightData) {
				var geometry = new THREE.PlaneGeometry( 7500, 7500, land.width - 1, land.depth - 1 );
				
				// This seems to be the best way to rotate something...as opposed to changing the position.rotation...
				// This way recalculates the x and y positions.
				geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
				

				// The height data is per pixel, but i don't actually have that many vertices, so I need to translate
				var interval = Math.floor(heightData.length / geometry.vertices.length);
				
				for (var i=0; i < geometry.vertices.length; i++) {
					geometry.vertices[i].y = heightData[i*interval] * land.unitToFoot;
				}
				

				var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
						color: 0xCC0000
					}));
				
				land.object = object;
				cb.call(land, object);
				
				// Now everything is ready.
			});
		}
	};
	
	var container = document.getElementById("3d"),
	
		WIDTH = 600,
		HEIGHT = 450,
		
		VIEW_ANGLE = 110,
		ASPECT = WIDTH/HEIGHT,
		NEAR = 0.1,
		FAR = 10000,
		
		renderer = new THREE.WebGLRenderer(),
		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR),
		
		scene;
		clock = new THREE.Clock();
	
	
	camera.lookAt( new THREE.Vector3(0, 0, 0) );
	
	var controls = new THREE.FirstPersonControls( camera );

	controls.movementSpeed = 1000;
	controls.lookSpeed = 0.125;
	controls.lookVertical = true;
	
	
	scene = new THREE.Scene();
	scene.add(camera);
	
	camera.position.y = 500;
	camera.position.z = 1500;
	renderer.setSize(WIDTH, HEIGHT);
	
	container.appendChild(renderer.domElement);
	
	
	// and add some elements
	var plant = new Plant();
	scene.add(plant.object);
	
	var land = new Landscape(function (object) {
		object.position.y -= 50;
		scene.add(object);
	});
	
	
	// and add the lights
	var pointLightMiddle = new THREE.PointLight(0x1a1a1a),
		pointLightOutsideLeft = new THREE.PointLight(0xFFFFFF),
		pointLightOutsideRight = new THREE.PointLight(0x1a1a1a),
		ambientLight = new THREE.AmbientLight(0x202020);
	
	
	pointLightMiddle.position.x = 0;
	pointLightMiddle.position.z = 0;
	
	pointLightOutsideLeft.x = WIDTH/2;
	pointLightOutsideLeft.z = 0;
	
	pointLightOutsideRight.x = -WIDTH/2;
	pointLightOutsideRight.z = 0;
	
	$.each([pointLightMiddle, pointLightOutsideLeft, pointLightOutsideRight], function (i, light) {
		light.position.y = 1050;
		scene.add(light);
	});
	scene.add(ambientLight);
	
	var render = function () {
		var delta = clock.getDelta();
		
		//controls.update(delta);
		
		plant.decay( delta );
		plant.object.rotation.y += 0.1;
		plant.object.rotation.x += 0.02;
		renderer.render(scene, camera);
		
		requestAnimationFrame(render);
	};
	requestAnimationFrame(render);

}());