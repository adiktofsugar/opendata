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
				var all = pix[i]+pix[i+1]+pix[i+2];
				data[j++] = all/30;
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
		xSquares: 60,
		ySquares: 60,
		init: function (cb) {
			var land = this,
				geometry = new THREE.PlaneGeometry(600, 600, land.xSquares, land.ySquares),
				material = new THREE.MeshLambertMaterial({
					color: 0xCC0000
				});
				
			
			getHeightData("../assets/sf_elevation.jpg", 600, 600, function (heightData) {
				for (var i=0; i < geometry.vertices.length; i++) {
					geometry.vertices[i].z = heightData[i];
				}
				
				var object = new THREE.Mesh(geometry, material);
			
				land.object = object;
				cb.call(land, object);
				
				// land.createPositionMatrix();
				// Now everything is ready.
			});
		},
		createPositionMatrix: function () {
			var land = this,
				geometry = land.object.geometry,
				vertices = geometry.vertices,
				positionMatrix = [],
				x = 0,
				y = 0;
			
			_.each(vertices, function (vertex, i) {
				if (i > ((x+1) * land.xSquares)) {
					x += 1;
					y = 0;
				}
				
				if (!positionMatrix[x]) {
					positionMatrix[x] = [];
				}
				positionMatrix[x][y] = vertex;
				
				y += 1;
			});
			
			land.positionMatrix = positionMatrix;
		},
		/**
		* set height usage examples
		   land.setHeight([30,30], 500);
		   land.setHeight([60,30], 500);
	   */
		setHeight: function (point, height) {
			var land = this;
			if (!land.positionMatrix) {
				land.createPositionMatrix();
			}
			// z is height because it's rotated 30 degrees around the x axis
			land.positionMatrix[ point[0] ][ point[1] ].z = height;
		}
	};
	
	var container = document.getElementById("3d"),
	
		WIDTH = 600,
		HEIGHT = 450,
		
		VIEW_ANGLE = 45,
		ASPECT = WIDTH/HEIGHT,
		NEAR = 0.1,
		FAR = 10000,
		
		renderer = new THREE.WebGLRenderer(),
		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR),
		
		scene = new THREE.Scene(),
		clock = new THREE.Clock();
	
	scene.add(camera);
	
	camera.position.z = 800;
	renderer.setSize(WIDTH, HEIGHT);
	
	container.appendChild(renderer.domElement);
	
	
	// and add some elements
	var plant = new Plant();
	scene.add(plant.object);
	
	var land = new Landscape(function (object) {
		object.position.y -= 50;
		object.rotation.x = -80 * Math.PI / 180;
		object.rotation.z = 20 * Math.PI / 180;
		scene.add(object);
	});
	
	
	// and add the lights
	var pointLight = new THREE.PointLight(0xFFFFFF);
	pointLight.position.x = 10;
	pointLight.position.y = 150;
	pointLight.position.z = 130;
	
	scene.add(pointLight);
	
	var render = function () {
		var delta = clock.getDelta();
		
		plant.decay( delta );
		plant.object.rotation.y += 0.1;
		plant.object.rotation.x += 0.02;
		renderer.render(scene, camera);
		
		requestAnimationFrame(render);
	};
	requestAnimationFrame(render);
}());