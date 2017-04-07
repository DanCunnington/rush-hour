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
			console.log(response)
		    var solution = response.solution;
		    var animations = [];

		    var findMovement = function(index, callback) {
		    	if (index === solution.length) {
		    		return callback();
		    	} else {
		    		//For each solution step, work out which vehicle has moved, in which direction.
		    		var movement = that.calculateVehicleMovement(solution[index].grid);
		    		that.currentGrid = solution[index].grid;
		    		
		    		if (movement) { 
		    			// console.log(movement);
		    			animations.push(movement);
		    		}
		    		
		    		findMovement(index+1, callback)
		    	}
		    }
		    
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
		    findMovement(0, function() {
		    	runAnimation(0, function() {
		    		console.log('finished');
		    	})
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

		//compare vehicle coordinates and identify which vehicle has moved
		var comparison = [];

		for (var i=0; i<vehiclesInCurrentStep.length; i++) {
			var id = vehiclesInCurrentStep[i].id;
			var currentCoords = vehiclesInCurrentStep[i].coords;
			var direction = vehiclesInCurrentStep[i].direction;
			//take top left most coord as starting point
			if (direction === 'horizontal') {
				//take left most coord
				var leftMostX = currentCoords[0][1];
				var leftMost = currentCoords[0];

				for (var j=1; j<currentCoords.length; j++) {
					if (currentCoords[j][1] < leftMostX) {
						leftMostX = currentCoords[j][1];
						leftMost = currentCoords[j];
					}
				}
				var startsAt = [leftMost[1], leftMost[0]];
				comparison.push({id: id, startsAt: startsAt, direction: direction});	
			} else {
				//take top most coord
				var topMostY = currentCoords[0][0];
				var topMost = currentCoords[0];

				for (var j=1; j<currentCoords.length; j++) {
					if (currentCoords[j][0] < topMostY) {
						topMostY = currentCoords[j][0];
						topMost = currentCoords[j];
					}
				}

				var startsAt = [topMost[1], topMost[0]];
				comparison.push({id: id, startsAt: startsAt, direction: direction});
			}
					
		}
		
		var movements = [];

		for (var i=0; i<vehiclesInNextStep.length; i++) {
			for (var j=0; j<comparison.length; j++) {
				if (comparison[j].id === vehiclesInNextStep[i].id) {

					//check for movement in starting coord
					var id = vehiclesInNextStep[i].id;
					var nextCoords = vehiclesInNextStep[i].coords;
					var direction = vehiclesInNextStep[i].direction;

					//take top left most coord as starting point
					if (direction === 'horizontal') {
						//take left most coord
						var leftMostX = nextCoords[0][1];
						var leftMost = nextCoords[0];


						for (var k=1; k<nextCoords.length; k++) {
							if (nextCoords[k][1] < leftMostX) {
								leftMostX = nextCoords[k][1];
								leftMost = nextCoords[k];
							}
						}
			

						var startsAt = [leftMost[1], leftMost[0]];
						// console.log(id, startsAt);

						//check for movement
						if (startsAt[0] !== comparison[j].startsAt[0] || startsAt[1] !== comparison[j].startsAt[1]) {
							console.log('vehicle '+comparison[j].id+ ' has moved horizontally');
							movements.push({id: comparison[j].id, start: comparison[j].startsAt, end: startsAt, direction: direction});

						}
					} else {
						//take top most coord
						var topMostY = nextCoords[0][0];
						var topMost = nextCoords[0];


						for (var k=1; k<nextCoords.length; k++) {
							if (nextCoords[k][0] < topMostY) {
								topMostY = nextCoords[k][0];
								topMost = nextCoords[k];
							}
						}
						

						var startsAt = [topMost[1], topMost[0]];
						// console.log(id, startsAt);

						//check for movement
						if (startsAt[0] !== comparison[j].startsAt[0] || startsAt[1] !== comparison[j].startsAt[1]) {
							console.log('vehicle '+comparison[j].id+ ' has moved vertically');
							movements.push({id: comparison[j].id, start: comparison[j].startsAt, end: startsAt, direction: direction});
						}
					}
					break;
				}
			}
		}
		

	
		if (movements.length > 0) {
			// console.log(movements);
			//compare start and end
			var xStart = movements[0].start[0];
			var xEnd = movements[0].end[0];

			var yStart = movements[0].start[1];
			var yEnd = movements[0].end[1];

			// console.log(xStart, yStart);
			// console.log(xEnd, yEnd);

			var direction;
			if (xEnd > xStart) { direction = "right"};
			if (xEnd < xStart) { direction = "left"};
			if (yEnd > yStart) { direction = "down"};
			if (yEnd < yStart) { direction = "up"};
			console.log(direction);
			return ({id: movements[0].id, direction: direction});
		}
	}

}