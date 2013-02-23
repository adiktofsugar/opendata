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
		init: function () {
			var land = this,
				geometry = new THREE.PlaneGeometry(600, 600, 100, 100);
			
			land.object = object;
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
	
	camera.position.z = 300;
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