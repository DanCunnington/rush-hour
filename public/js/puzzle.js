class Puzzle {
	constructor(setup) {
		this.setup = setup;
		this.currentGrid = setup;
		this.currentVehicles = [];
	}

	static get VEHICLES() {
		return [{type: "lorry", ids:["O","P","Q","R"], length: 3}, 
                {type: "car", ids:["A","B","C","D","E","F","G","H","I","J","K"], length: 2},
                {type: "target", ids: ["X"], length: 2}];
	}

	static get VEHICLE_COLOURS() {
		return [{id: 'A', colour: "#7ec145"}, 
				{id: 'B', colour: '#ff7a15'},
				{id: 'C', colour: '#00b7fd'},
				{id: 'D', colour: '#fd7e9c'},
				{id: 'E', colour: '#6252be'},
				{id: 'F', colour: '#008124'},
				{id: 'G', colour: '#ced8cc'},
				{id: 'H', colour: '#ffe9a9'},
				{id: 'I', colour: '#f7f05d'},
				{id: 'J', colour: '#8c503e'},
				{id: 'K', colour: '#c7b93e'},
				{id: 'O', colour: '#ffb827'},
				{id: 'P', colour: '#a777c8'},
				{id: 'Q', colour: '#076cd3'},
				{id: 'R', colour: '#007d82'},
				{id: 'X', colour: '#ff1d01'},
		]
	}

	//display the puzzle on the board
	display() {
		var vehiclesFound = this.findVehicles(this.setup);
		console.log(vehiclesFound)

		for (var i=0; i<vehiclesFound.length; i++) {

			//find vehicle length
			var length;
			for (var j=0; j<Puzzle.VEHICLES.length; j++) {
				var ids = Puzzle.VEHICLES[j].ids;
				if ( ids.indexOf(vehiclesFound[i].id) !== -1) {
					length = Puzzle.VEHICLES[j].length;
					break;
				}
			}

			//find vehicle colour
			var colour;
			for (var j=0; j<Puzzle.VEHICLE_COLOURS.length; j++ ){
				if (Puzzle.VEHICLE_COLOURS[j].id === vehiclesFound[i].id) {
					colour = Puzzle.VEHICLE_COLOURS[j].colour;
					break;
				}
			}

			var tempVehicle = new Vehicle(vehiclesFound[i].id, length, colour);
			this.currentVehicles.push(tempVehicle);

			//Calculate direction and start coordinates
			var coords = vehiclesFound[i].coords;
			if (vehiclesFound[i].direction === 'horizontal') {
				//look for lowest x coordinate [1]
				var lowestX = coords[0][1];
				var Y = coords[0][0];
				for (var j=1; j<coords.length; j++) {
					if (coords[j][1] < lowestX) {
						lowestX = coords[j][1];
						Y = coords[j][0];
					}
				}

				tempVehicle.display(lowestX+1, Y+1, 'horizontal', 'right');
			} else {
				//look for lowest y coordinate [0]
				var lowestY = coords[0][0];
				var X = coords[0][1];
				for (var j=1; j<coords.length; j++) {
					if (coords[j][0] < lowestY) {
						lowestY = coords[j][0];
						X = coords[j][1];
					}
				}
				tempVehicle.display(X+1, lowestY+1, 'vertical', 'down');
			}
		}

	}

	findVehicles(setup) {
		var vehicles = [];
		for (var i=0; i<setup.length; i++) {
			for (var j=0; j<setup[i].length; j++) {
				var vehicleId = setup[i][j];
				//If we have found a vehicle id
				if (vehicleId != "_") {

				  //Find the whole vehicle
				  var vehicleLength = this.getVehicleLength(vehicleId);

				  var vehicle = this.findVehicle(vehicleId,i,j,vehicleLength,setup);
				  if (vehicle) {
				    vehicles.push(vehicle);
				  }     
				}
			}
		}
		return vehicles;
	}

	getVehicleLength(vehicleId) {
	  for (var i=0; i<Puzzle.VEHICLES.length; i++) {
	    if (Puzzle.VEHICLES[i].ids.indexOf(vehicleId) != -1) {
	      return Puzzle.VEHICLES[i].length;
	    }
	  }
	}

	findVehicle(vehicleId,row,col,vehicleLength,currentState) {
	  
	  //Try left and down
	  var leftFound = false;
	  var downFound = false;
	  var leftCoordsFound = [[row,col]];
	  var downCoordsFound = [[row,col]];
	  
	  searchLeft(vehicleId,row,col,currentState);
	  searchDown(vehicleId,row,col,currentState);
	  
	  
	  if (leftCoordsFound.length == vehicleLength) {
	    leftFound = true;
	    return {id: vehicleId, direction: "horizontal", coords: leftCoordsFound};
	  }

	  if (downCoordsFound.length == vehicleLength) {
	    downFound = true;
	    return {id: vehicleId, direction: "vertical", coords: downCoordsFound};
	  }


	  

	  function searchDown(vehicleId,row,col,currentState) {
	    //If going down (row +1) is a valid position on the grid
	    if ((row+1 > -1) && (row+1 < Grid.SIZE)) {

	      //Check for vehicle
	      if (currentState[row+1][col] == vehicleId) {
	            
	        //vehicle exists, add coordinate to list and keep checking left
	        downCoordsFound.push([row+1,col]);
	        
	        searchDown(vehicleId,row+1,col,currentState);
	      } else {
	        //no vehicle found going left so return
	        return;
	      }
	    } else {

	      //Off the grid, return 
	      return;
	    }
	  }
	  function searchLeft(vehicleId,row,col,currentState) {

	    //If going left (col -1) is a valid position on the grid
	    if ((col-1 > -1) && (col-1 < Grid.SIZE)) {

	      //Check for vehicle
	      if (currentState[row][col-1] == vehicleId) {
	     
	        //vehicle exists, add coordinate to list and keep checking left
	        leftCoordsFound.push([row,col-1]);
	        
	        searchLeft(vehicleId,row,col-1,currentState);
	      } else {
	        //no vehicle found going left so return
	        return;
	      }
	    } else {

	      //Off the grid, return 
	      return;
	    }
	  }
	}

	//Make a request to the server to solve the puzzle 
	solve() {
		var that = this;
		$.post('/solve', {'puzzle': JSON.stringify(that.setup)}, function(response) {
		    var solution = response.solution;
		    var animations = [];
		    for (var i=0; i<solution.length; i++) {
		    	(function(iteration) {
		    		//For each solution step, work out which vehicle has moved, in which direction.
		    		var movement = that.calculateVehicleMovement(solution[iteration].grid);
		    		console.log(movement);
		    	
		    		if (movement) { animations.push(movement) };
		    		
		    	})(i);
		        
		    }
		    console.log('done');

		    var runAnimation = function(index, callback) {
		    	if (index === animations.length) {
		    		return callback();
		    	} else {
		    		var movement = animations[index];
		    		for (var i=0; i<that.currentVehicles.length; i++) {
		    			var vehicle = that.currentVehicles[i];
		    			if (vehicle.id === "vehicle_"+movement.id) {
		    				that.currentVehicles[i].move(movement.direction, 1, function() {
		    					runAnimation(index+1, callback);
		    				});
		    			}
		    		}
		    	}
		    }
		    runAnimation(0, function() {
		    	console.log('finished');
		    })
		});
	}

	//return a vehicle reference along with the direction of movement
	//each step moves one step
	calculateVehicleMovement(nextStep) {
		//compare current grid
		//find vehicle coordinates in current and next
		var vehiclesInCurrentStep = this.findVehicles(this.currentGrid);
		var vehiclesInNextStep = this.findVehicles(nextStep);

		// console.log(vehiclesInCurrentStep[0]);
		// console.log(vehiclesInNextStep[0]);

		//compare vehicle coordinates and identify which vehicle has moved
		var comparison = [];
		for (var i=0; i<vehiclesInCurrentStep.length; i++) {
			var id = vehiclesInCurrentStep[i].id;
			var currentCoords = vehiclesInCurrentStep[i].coords;
			comparison.push({id: id, currentCoords: currentCoords});			
		}

		for (var i=0; i<vehiclesInNextStep.length; i++) {
			for (var j=0; j<comparison.length; j++) {
				if (comparison[j].id === vehiclesInNextStep[i].id) {
					comparison[j].nextCoords = vehiclesInNextStep[i].coords;
					break;
				}
			}
		}

		for (var i=0; i<comparison.length; i++) {
			var currentCoords = comparison[i].currentCoords;
			var nextCoords = comparison[i].nextCoords;
			
			var vehicleMovements = [];
			for (var j=0; j<currentCoords.length; j++) {
				if (currentCoords[j][0] !== nextCoords[j][0] || currentCoords[j][1] !== nextCoords[j][1]) {
					vehicleMovements.push(nextCoords[j]);
				}
			}

			
			if (vehicleMovements.length > 0) {
				//compare first and last movements
				var first = vehicleMovements[0];
				var last = vehicleMovements[vehicleMovements.length -1];
				var xStart = first[1];
				var xEnd = last[1];
				var yStart = first[0];
				var yEnd = last[0];

				var direction;
				if (xEnd > xStart) { direction = "left"};
				if (xEnd < xStart) { direction = "right"};
				if (yEnd > yStart) { direction = "down"};
				if (yEnd < yStart) { direction = "up"};

				//update grid;
				this.currentGrid = nextStep;
				return ({id: comparison[i].id, direction: direction});
			}
			
			
		
		}
	}
}