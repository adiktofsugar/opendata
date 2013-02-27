(function () {
	
	
	//http://bostandjiev.com/Content/Graphics%20class%20final/index.html
	
	var TreeLeaf = function(){
		this.init.apply(this, arguments);
	};
	
	TreeLeaf.leafTexture = THREE.ImageUtils.loadTexture( "/decay/leaf.jpg" );
	
	TreeLeaf.prototype = {
		init: function(){
			var material = new THREE.MeshBasicMaterial({
				//color: 0x00CC00
				map: TreeLeaf.leafTexture
			});
			
			var geometry = new THREE.CircleGeometry( 4 );
			this.mesh = new THREE.Mesh( geometry, material );
		}
	}
	
	var LSystemTree= function(){
		this.init.apply(this, arguments);
	}
	
	LSystemTree.prototype = {
		init: function( config ){
			this.startTime = new Date();
			this.currentAddedIndex = -1;
			
			config.x = config.x || 0;
			config.y = config.y || 0;
			config.z = config.z || 0;
			// var material = new THREE.MeshLambertMaterial({
			// 	color: 0xCC0000
			// });
			
			var texture = THREE.ImageUtils.loadTexture( "/decay/bark.jpg" );
			var material = new THREE.MeshBasicMaterial({ map: texture } );

			var meshes = [];
			this.meshes = meshes;
			
			
			var frac = new lSystem.LSystem ( 'X', {'X' : 'F-[[X]+X]+F[+FX]-X', 'F' : 'FF'} );
			console.log( frac.generate(3) );
			
			hfrac = new lSystem.LRunHandler({
				a:90,	// starting angle
				x:config.x,	// starting x
				y:config.y, 	// starting y
				z:config.z, 	// starting z
				r:5,	// radius
				raMap:{},	// radius-angle map/cache 
				stack:[]  	// stack for tree
			});

			/**
			 * Specify conditions. State functions
			 */
			hfrac.on( 'F', function() {
				

				var startPoint = new THREE.Vector3( this.x, this.y, this.z );
				// cache angle values
				// If the angles are repeated(highly likely),
				// it will reuse existing calculations
				// to preserve the decimal approximation.
				hash = this.r + '#' + this.a;
				if( typeof this.raMap[hash] == 'undefined' ) {
					this.raMap[hash] = {
						x : Math.round( 2 * this.r * Math.cos( this.a * Math.PI/180 ) ),
						y : Math.round( 2 * this.r * Math.sin( this.a * Math.PI/180 ) )
					};
				}
				this.x += this.raMap[hash].x;
				this.y += this.raMap[hash].y;
				
				var endPoint = new THREE.Vector3( this.x, this.y, this.z );
				
				var lineLength = endPoint.sub( startPoint ).length();
				
				//var matrix = new THREE.Matrix4().translate( startPoint ).rotateZ( this.a * Math.PI/180 );
				
				var matrix = new THREE.Matrix4().translate( startPoint ).rotateZ( Math.PI/2 + this.a * Math.PI/180 );
				
				var startR = this.r;
				this.r = 0.95 * startR;
				var geometry = new THREE.CylinderGeometry(startR,this.r, lineLength, 16,1, false );
				geometry.applyMatrix( matrix );
				var mesh = new THREE.Mesh( geometry, material );
				
				meshes.push( mesh );
			});
			hfrac.on( '+', function() { this.a += ( 25 + Math.random()*25 ) ; });
			hfrac.on( '-', function() { this.a -= ( 25 + Math.random()*25 ); });
			hfrac.on( '[', function() { this.stack.push({ x:this.x, y:this.y, a:this.a, r: this.r }); });
			hfrac.on( ']', function() {
				var ls = this.stack.pop();
				this.x = ls.x;
				this.y = ls.y;
				this.a = ls.a;
				this.r = ls.r;
				
				var leaf = new TreeLeaf();
				leaf.mesh.geometry.applyMatrix( new THREE.Matrix4( ).rotateX( Math.PI/4 ).rotateZ( Math.PI/4 )) ;
				leaf.mesh.position.set( this.x, this.y, this.z + this.r );

				meshes.push( leaf.mesh );
			});
			
			frac.run( hfrac);
			
		},
		render: function(){
			// 
			// var time = Math.floor( (this.startTime - Date.now()) / 6000 );
			// 
			// var index = Math.floor( time );
			// 
			// if ( index > this.currentAddedIndex ){
			// 	this.currentAddedIndex = index;
			// 	
			// 	if ( index < this.internalMeshes.length ){
			// 	
			// 		meshes.push( this.internalMeshes[ index ] );
			// 	}
			// }
			// 

		}
	}
	
	var GrassyPlain = function(){
		this.init.apply(this, arguments);		
	};
	GrassyPlain.prototype = {
		levels: [],
		stalks: 1000,
		globalAlpha: 0.075,
		interLevelDistance: 0.25,
		numLevels: 15,
		moviness: 0.1,
		healthiness: 1,
		healthDecayPerFrame: (0.1 * 0.017),
		init: function(){
			
			function generateTextureBase() {
				var canvas = document.createElement( 'canvas' );
				canvas.width = 512;
				canvas.height = 512;

				var context = canvas.getContext( '2d' );

				for ( var i = 0; i < this.stalks; i ++ ) {

					//context.fillStyle = 'rgba(0,' + Math.floor( Math.random() * 64 + 32 ) + ',16,1)';
					
					var grayness = Math.floor( Math.random()*10 +100 ) ;
					context.fillStyle = 'rgba(' + grayness + "," + grayness + ","  + grayness + ',1)';
					
					context.beginPath();
					context.arc( Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 1 + 0.5, 0, Math.PI * 2, true );
					context.closePath();
					context.fill();

				}

				context.globalAlpha = this.globalAlpha;
				context.globalCompositeOperation = 'lighter';

				return canvas;
			}

			function generateTextureLevel( texture ) {
				texture.getContext( '2d' ).drawImage( texture, 0, 0 );
				var canvas = document.createElement( 'canvas' );
				canvas.width = texture.width;
				canvas.height = texture.height;

				canvas.getContext( '2d' ).drawImage( texture, 0, 0 );

				return canvas;
			}
		
			var geometry = new THREE.CircleGeometry( 50, 25 );

			var bitmap = generateTextureBase.call( this );

			for ( var i = 0; i < this.numLevels ; i ++ ) {

				mesh = this.levels[ i ] = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: new THREE.Texture( generateTextureLevel( bitmap ) ), transparent: true, depthWrite: false, depthTest: false } ) );
				mesh.material.map.needsUpdate = true;

				mesh.position.y = i * this.interLevelDistance;
				mesh.rotation.x = - Math.PI / 2;
			}
			
			//this.meshes.push( mesh );
		},
		
		render: function(){
				var time = Date.now() / 6000;

				this.healthiness = this.healthiness - this.healthDecayPerFrame;
				this.healthiness = Math.max( 0, Math.min( 1,  this.healthiness  ) );
				
				if ( this.healthiness > 0.5 ){
					this.moviness = 20
				} else if ( this.healthiness > 0.2 ){
					this.moviness = 5
				} else if ( this.healthiness > 0.1 ){
					this.moviness = 1
				} else {
					this.moviness = 0.5;
				}
				
				this.moviness = 2;
				
				for ( var i = 0, l = this.levels.length; i < l; i ++ ) {

					mesh = this.levels[ i ];
					mesh.position.x = Math.sin( time * 2 * this.moviness ) * i * i * 0.005;
					mesh.position.z = Math.cos( time * 3 * this.moviness ) * i * i * 0.005;

					mesh.material.color.g = 1;
					
					
					mesh.material.color.b = 1 - this.healthiness;
					mesh.material.color.r = 1 - this.healthiness;

				}
//				renderer.render( scene, camera );			
		}
	};
	
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
	
	
	renderer.sortObjects = false;
	
	scene.add(camera);
	
	
	camera.position.set( 0, 100,400 );
	camera.lookAt(new THREE.Vector3(0,100,0));
	
	
//correct for red plane:
//	camera.position.set(  0, 75,  800 );
	
//correct for grass:	
//	camera.position.set( 0, 70, 100 );
//	camera.lookAt(new THREE.Vector3(0,0,0));
	
	renderer.setSize(WIDTH, HEIGHT);
	
	container.appendChild(renderer.domElement);
	

	document.onmousedown =  function(){
		console.log( 'restoring healthiness') ;
		grassyPlain.healthiness = 1;
	};
	
	// and add some elements
	var plant = new Plant();
	//scene.add(plant.object);
	
	//var land = new Landscape();
	//scene.add(land.object);
	
	grassyPlain = new GrassyPlain();
	// grassyPlain.levels.map( function(level) {
	// 	scene.add(level);
	// });

	var lSystemTree = new LSystemTree({ x:0, y:0, z:50 });
	lSystemTree.meshes.map( function(mesh) {
		scene.add(mesh);
	});
	
	var lSystemTree2 = new LSystemTree({ x:20, y:0, z:0 });
	lSystemTree2.meshes.map( function(mesh) {
		scene.add(mesh);
	});
	
	var lSystemTree3 = new LSystemTree({ x:-40, y:0, z:-10 });
	lSystemTree3.meshes.map( function(mesh) {
		scene.add(mesh);
	});
	
	
	//var leaf = new TreeLeaf();
	//scene.add( leaf.mesh );

	
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
		
		grassyPlain.render();

		lSystemTree.render();
		
		requestAnimationFrame(render);
		

	};
	requestAnimationFrame(render);
}());