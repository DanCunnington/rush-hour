var deepcopy = require("deepcopy");
//A* search implementation



//Need f = g+h - cost function for A* search

// g = Number of moves to current point
// h = Estimated no moves to goal
//    -> Distance of red car to exit, number of vehicles in the way


//open and closed li
var TARGET_CAR_LENGTH = 2;
var GRID_LENGTH = 6;

//Each state is a configuration of the board. Passing in an example puzzle for now
//This will be user configurable.

//referring to the standard rush hour symbols for vehicles
var vehicles = [{type: "LORRY", ids:["O","P","Q","R"], length: 3}, 
                {type: "CAR", ids:["A","B","C","D","E","F","G","H","I","J","K"], length: 2},
                {type: "TARGET", ids: ["X"], length: 2}];


//Starting state
var startingStateExample = {
  grid:[
        ["_","_","O","_","A","A"],
        ["_","_","O","_","_","_"],
        ["X","X","O","_","_","_"],
        ["P","P","P","_","_","Q"],
        ["_","_","_","_","_","Q"],
        ["_","_","_","_","_","Q"]
      ],
  fScore: 0
};



//Goal state, * can match anything, X is at the exit position
var goalState = [
["*","*","*","*","*","*"],
["*","*","*","*","*","*"],
["*","*","*","*","X","X"],
["*","*","*","*","*","*"],
["*","*","*","*","*","*"],
["*","*","*","*","*","*"]
];

function search(startState, goalState) {

  var closedList = [];
  var openList = [startState];

  var cameFrom = [];

  // var gScore = 0;
  // var hScore = calculateH(startState.grid,goalState);
  // var fScore = gScore + hScore;



  // console.log("f score: "+ fScore);
  // startState.f = fScore;


  while (openList.length != 0) {
    //Find state with lowest f on open list and remove it from openlist
    var lowestFState = openList.splice(findLowestFState(openList).index,1)[0];
   
    console.log(lowestFState);
    //Generate successors to the current state 
    //For all vehicles in the current state, look for an empty space in both directions that the vehicle can move
    //generateSuccessors function returns an array of successor states
    var successors = generateSuccessors(lowestFState.grid);
    console.log(successors);
    break;

  }



}




function generateSuccessors(currentState) {

  var successorStates = [];

  //Find all vehicles on the grid
  var vehicles = [];
  //search each row then column of current state for a vehicle id
  for (var i=0; i<currentState.length; i++) {
    for (var j=0; j<currentState[i].length; j++) {
      
      var vehicleId = currentState[i][j];
      //If we have found a vehicle id
      if (vehicleId != "_") {

        //Find the whole vehicle
        var vehicleLength = getVehicleLength(vehicleId);

        var vehicle = findVehicle(vehicleId,i,j,vehicleLength,currentState);
        if (vehicle) {
          vehicles.push(vehicle);
        }     
      }
    }
  }

  //For each vehicle, look for empty space in both directions vehicle can move
  for (var k=0; k<vehicles.length; k++) {
    var vehicle = vehicles[k]

    if (vehicle.direction == "horizontal") {

      //Look left - left most coordinate will always be last in the coords array
      //Look right - right most coordinate will always be first in the coords array
      var leftMostColCoord = vehicle.coords[vehicle.coords.length-1][1];
      var leftMostRowCoord = vehicle.coords[vehicle.coords.length-1][0];
      var rightMostColCoord = vehicle.coords[0][1];
      var rightMostRowCoord = vehicle.coords[0][0];

      //If possible to go left from here
      //if space is on the grid and contains an empty ("_")
      if ((leftMostColCoord-1 > -1) && (leftMostColCoord-1 < GRID_LENGTH) && (currentState[leftMostRowCoord][leftMostColCoord-1] == "_")) {
        //Build state with this vehicle in this position 
        var newLeftState = deepcopy(currentState);

        //Set new left position to new id and set old right most position to blank
        newLeftState[leftMostRowCoord][leftMostColCoord-1] = vehicle.id;
        newLeftState[rightMostRowCoord][rightMostColCoord] = "_";

        //Add state to list of successor states
        successorStates.push(newLeftState);     
      }

      //If possible to go right from here
      if ((rightMostColCoord+1 > -1) && (rightMostColCoord+1 < GRID_LENGTH) && (currentState[rightMostRowCoord][rightMostColCoord+1] == "_")) {
        //Build state with this vehicle in this position 
        var newRightState = deepcopy(currentState);

        //Set new right position to new id and set old left most position to blank
        newRightState[rightMostRowCoord][rightMostColCoord+1] = vehicle.id;
        newRightState[leftMostRowCoord][leftMostColCoord] = "_";

        //Add state to list of successor states
        successorStates.push(newRightState);
      }
    } else {
      //Look above and below
      //Look above - top most coordinate will always be first in the coords array
      //Look below - bottom most coordinate will always be last in the coords array
      var topMostRowCoord = vehicle.coords[0][0];
      var topMostColCoord = vehicle.coords[0][1];
      var bottomMostRowCoord = vehicle.coords[vehicle.coords.length-1][0];
      var bottomMostColCoord = vehicle.coords[vehicle.coords.length-1][1];

      //If possible to go up from here
      //if space is on the grid and contains an empty ("_")
      if ((topMostRowCoord-1 > -1) && (topMostRowCoord-1 < GRID_LENGTH) && (currentState[topMostRowCoord-1][topMostColCoord] == "_")) {
        //Build state with this vehicle in this position 
        var newUpState = deepcopy(currentState);

        //Set new up position to new id and set old bottom most position to blank
        newUpState[topMostRowCoord-1][topMostColCoord] = vehicle.id;
        newUpState[bottomMostRowCoord][bottomMostColCoord] = "_";

        //Add state to list of successor states
        successorStates.push(newUpState);
      }

      //if possible to go down from here
      if ((bottomMostRowCoord+1 > -1) && (bottomMostRowCoord+1 < GRID_LENGTH) && (currentState[bottomMostRowCoord+1][bottomMostColCoord] == "_")) {
        //Build state with this vehicle in this position 
        var newDownState = deepcopy(currentState);

        //Set new down position to new id and set old top most position to blank
        newDownState[bottomMostRowCoord+1][bottomMostColCoord] = vehicle.id;
        newDownState[topMostRowCoord][topMostColCoord] = "_";

        //Add state to list of successor states
        successorStates.push(newDownState);
      }
    }
  }
  return successorStates; 
}


function findVehicle(vehicleId,row,col,vehicleLength,currentState) {
  
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
    if ((row+1 > -1) && (row+1 < GRID_LENGTH)) {

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
    if ((col-1 > -1) && (col-1 < GRID_LENGTH)) {

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

function findLowestFState(openList) {
  var lowestState = openList[0];
  var lowestIndex = 0;
  for (var i=1; i<openList.length; i++) {
    var currentLowestFScore = lowestState.fScore;

    if (openList[i].fScore < currentLowestFScore) {
      lowestState = openList[i];
      lowestIndex = i;
    }
  }
  return {state: lowestState, index: lowestIndex};
}

function calculateH(current, goal) {
  //Calculate distance between red car currently and goal state
  
  //Iterate over red car row to find position of X
  var redCarCoords = getRedCarPosition(current);
  var distanceToExit = (GRID_LENGTH-1) - redCarCoords.columns[1];

  var numberOfBblockingVehicles = calculateBlockingVehicles(redCarCoords,current).length;
 
  return distanceToExit + numberOfBblockingVehicles;
}

function getRedCarPosition(current) {
  //Red car must always be on third row down, so look at third row of current state
  var redCarRow = current[2];

  var occurances = [];
  for (var i=0; i<redCarRow.length; i++) {
    if (redCarRow[i] == "X") {
      occurances.push(i);
    }
  }
  return {row: 2, columns: occurances};
}

function calculateBlockingVehicles(vehicleCoords,currentState) {
  var lastCoord = vehicleCoords.columns[1];
  var blockingVehicles = [];
  //Look in all columns after for blocking vehicles
  for (var i=lastCoord+1; i<GRID_LENGTH-1; i++) {

    //If it's not blank ("_") and doesn't currently exist in blocking array, then add
    var vehicleID = currentState[vehicleCoords.row][i]
    if ((vehicleID != "_") && (blockingVehicles.indexOf(vehicleID) == -1)) {
      blockingVehicles.push(vehicleID);   
    }
  }
  return blockingVehicles;
}

function getVehicleLength(vehicleId) {
  for (var i=0; i<vehicles.length; i++) {
    if (vehicles[i].ids.indexOf(vehicleId) != -1) {
      return vehicles[i].length;
    }
  }
}

search(startingStateExample,goalState);