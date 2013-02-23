(function () {
	
	/**
	 * Base plant class
	 */
	var Plant = function () {
		this.init.apply(this, arguments);
	};
	Plant.prototype = {
		decayRate: (0.1 * 0.017), // size unit per frame (the 0.017 is for 1/60, since I'm doing 60 frames per second...)
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
		decay: function () {
			var plant = this,
				dims = ["x", "y", "z"];
			
			_.each(dims, function (dim) {
				var dimValue = plant.object.scale[dim];
				if (plant.size * dimValue > plant.minSize) {
					plant.object.scale[dim] = dimValue - plant.decayRate;
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
		init: function () {
			var land = this,
				geometry = new THREE.PlaneGeometry(600, 600, land.xSquares, land.ySquares),
				material = new THREE.MeshLambertMaterial({
					color: 0xCC0000
				}),
				object = new THREE.Mesh(geometry, material);
			
			object.rotation.x = 30;
			
			land.object = object;
			land.createPositionMatrix();
			
			// Now everything is ready.
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
		
		scene = new THREE.Scene();
	
	scene.add(camera);
	
	camera.position.z = 800;
	renderer.setSize(WIDTH, HEIGHT);
	
	container.appendChild(renderer.domElement);
	
	
	// and add some elements
	var plant = new Plant();
	scene.add(plant.object);
	
	var land = new Landscape();
	scene.add(land.object);
	
	
	// and add the lights
	var pointLight = new THREE.PointLight(0xFFFFFF);
	pointLight.position.x = 10;
	pointLight.position.y = 50;
	pointLight.position.z = 130;
	
	scene.add(pointLight);
	
	var render = function () {
		plant.decay();
		plant.object.rotation.y += 0.1;
		plant.object.rotation.x += 0.02;
		renderer.render(scene, camera);
		
		requestAnimationFrame(render);
	};
	requestAnimationFrame(render);
}());