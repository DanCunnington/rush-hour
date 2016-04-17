var exports = module.exports = {};
var deepcopy = require("deepcopy");
//A* search implementation

//open and closed li
var TARGET_CAR_LENGTH = 2;
var GRID_LENGTH = 6;

//Each state is a configuration of the board. Passing in an example puzzle for now
//This will be user configurable.

//referring to the standard rush hour symbols for vehicles
var vehicles = [{type: "LORRY", ids:["O","P","Q","R"], length: 3}, 
                {type: "CAR", ids:["A","B","C","D","E","F","G","H","I","J","K"], length: 2},
                {type: "TARGET", ids: ["X"], length: 2}];


exports.search = function(startState,callback) {
  var closedSet = [];
  var openSet = [startState];
  var gScore = [{node: startState, score: 0}];
  var fScore = [{node: startState, score: heuristicCostEstimateToGoalFrom(startState.grid)}];
  startState.fScoreIndex = 0;
  startState.gScoreIndex = 0;
  
  while (openSet.length != 0) {

    var current = findLowestFScoreState(openSet,fScore);
    var currentState = current.state;
    var currentIndex = current.index;

    if (goalReached(currentState)) {
      //console.log("goal");
      return reconstructPath(current,callback);
    }

    //Remove from Openset
    openSet.splice(currentIndex,1);

    //Add to closedset
    closedSet.push(currentState);

    //Generate successor states
    var successors = generateSuccessors(currentState);

    //For all successors
    for (var i=0; i<successors.length; i++) {

        //If successor exists in closed set, ignore
        if (successorExistsInSet(successors[i],closedSet) > -1) {
          continue;
        }

        var tentativeGScore = gScore[current.state.gScoreIndex] + 1;
        var indexInOpenSet = successorExistsInSet(successors[i],openSet);
        
        var newStateObj = {grid: successors[i].grid, parent: currentState};

        if (indexInOpenSet === -1) {
          openSet.push(newStateObj);
        } else {
          //Find currently stored g score for successor that's in open set
          //Get gScoreIndex
          var gScoreIndex = openSet[indexInOpenSet].gScoreIndex;
          if (tentativeGScore >= gScore[gScoreIndex].score) {
            //This is not a better path
            continue;
          }
        }

        //This is the best path we have found so far save scores
        var gIndex = gScore.push({node: newStateObj, score: tentativeGScore}) -1;
        var fIndex = fScore.push({node: newStateObj, score: heuristicCostEstimateToGoalFrom(successors[i].grid)}) -1;
        newStateObj.gScoreIndex = gIndex;
        newStateObj.fScoreIndex = fIndex;
    }
  }
  return failure(callback);
}

function successorExistsInSet(state,set) {
  if (!state || set.length == 0) {
    return -1;
  }

  //Loop until we find a match
  for (var i=0; i<set.length; i++) {
    if(checkForMatch(state,set[i])) {
      return i;
    }
  }
  return -1;

  function checkForMatch(state,setState) {
    var currentStateGrid = state.grid;
    var setGrid = setState.grid;

    for (var j=0; j<currentStateGrid.length; j++) {
      for (var k=0; k<currentStateGrid[j].length; k++) {
        if (currentStateGrid[j][k] != setGrid[j][k]) {
          return false;
        }
      }
    }
    return true;
  }
}

function generateSuccessors(currentState) {
  var currentStateGrid = currentState.grid;

  var successorStates = [];

  //Find all vehicles on the grid
  var vehicles = [];
  //search each row then column of current state for a vehicle id
  for (var i=0; i<currentStateGrid.length; i++) {
    for (var j=0; j<currentStateGrid[i].length; j++) {
      
      var vehicleId = currentStateGrid[i][j];
      //If we have found a vehicle id
      if (vehicleId != "_") {

        //Find the whole vehicle
        var vehicleLength = getVehicleLength(vehicleId);

        var vehicle = findVehicle(vehicleId,i,j,vehicleLength,currentStateGrid);
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
      if ((leftMostColCoord-1 > -1) && (leftMostColCoord-1 < GRID_LENGTH) && (currentStateGrid[leftMostRowCoord][leftMostColCoord-1] == "_")) {
        //Build state with this vehicle in this position 
        var newLeftState = deepcopy(currentStateGrid);

        //Set new left position to new id and set old right most position to blank
        newLeftState[leftMostRowCoord][leftMostColCoord-1] = vehicle.id;
        newLeftState[rightMostRowCoord][rightMostColCoord] = "_";

        //Add state to list of successor states
        successorStates.push({grid: newLeftState, parent: currentState});     
      }

      //If possible to go right from here
      if ((rightMostColCoord+1 > -1) && (rightMostColCoord+1 < GRID_LENGTH) && (currentStateGrid[rightMostRowCoord][rightMostColCoord+1] == "_")) {
        //Build state with this vehicle in this position 
        var newRightState = deepcopy(currentStateGrid);

        //Set new right position to new id and set old left most position to blank
        newRightState[rightMostRowCoord][rightMostColCoord+1] = vehicle.id;
        newRightState[leftMostRowCoord][leftMostColCoord] = "_";

        //Add state to list of successor states
        successorStates.push({grid: newRightState, parent: currentState});
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
      if ((topMostRowCoord-1 > -1) && (topMostRowCoord-1 < GRID_LENGTH) && (currentStateGrid[topMostRowCoord-1][topMostColCoord] == "_")) {
        //Build state with this vehicle in this position 
        var newUpState = deepcopy(currentStateGrid);

        //Set new up position to new id and set old bottom most position to blank
        newUpState[topMostRowCoord-1][topMostColCoord] = vehicle.id;
        newUpState[bottomMostRowCoord][bottomMostColCoord] = "_";

        //Add state to list of successor states
        successorStates.push({grid: newUpState, parent: currentState});
      }

      //if possible to go down from here
      if ((bottomMostRowCoord+1 > -1) && (bottomMostRowCoord+1 < GRID_LENGTH) && (currentStateGrid[bottomMostRowCoord+1][bottomMostColCoord] == "_")) {
        //Build state with this vehicle in this position 
        var newDownState = deepcopy(currentStateGrid);

        //Set new down position to new id and set old top most position to blank
        newDownState[bottomMostRowCoord+1][bottomMostColCoord] = vehicle.id;
        newDownState[topMostRowCoord][topMostColCoord] = "_";

        //Add state to list of successor states
        successorStates.push({grid: newDownState, parent: currentState});
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

function reconstructPath(current,callback) {
 
  var totalPath = [current.state];;
  //Follow parent links
  navigateUpParentTree(current.state,callback);

  function navigateUpParentTree(current,callback) {
    if ("parent" in current && current.parent != 0) {
      totalPath.push(current.parent);
      navigateUpParentTree(current.parent,callback);
    } else {
      //Finished
      //console.log("Finished, path to goal is: ");
      return callback(totalPath.reverse());
    }
  }
}

function goalReached(current) {
  current = current.grid;
  //Check if this state is the goal state
  //If finished, X should be in positions [2,4] and [2,5]
  if ((current[2][4] == "X") && (current[2][5] == "X")) {
    return true;
  } else {
    return false;
  }
}

function findLowestFScoreState(openSet,fScore) {
  //For each node in openSet, perform loopup to fScore list to see which is lowest
  var lowest = openSet[0];
  var lowestFScore = fScore[lowest.fScoreIndex].score;
  lowestOpenSetIndex = 0;

  for (var i=1; i<openSet.length; i++) {
    var fIndex = openSet[i].fScoreIndex;
    var thisFScore = fScore[fIndex].score;
    if (thisFScore < lowestFScore) {
      lowest = openSet[i];
      lowestFScore = thisFScore;
      lowestOpenSetIndex = i;
    }
  }
  return {state: lowest, index: lowestOpenSetIndex};
}

function heuristicCostEstimateToGoalFrom(state) {
  var redCarCoords = getRedCarPosition(state);
  var distanceToExit = (GRID_LENGTH-1) - redCarCoords.columns[1];

  var numberOfBlockingVehicles = calculateBlockingVehicles(redCarCoords,state).length;
 
  return distanceToExit + numberOfBlockingVehicles + 1;
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

function failure(callback) {
  callback({err: "No solution found"});
}


//Testing functions

//GENERATE SUCCESSORS TEST
function generateSuccessorsTest() {
  var state = {
    grid:[
          ["_","_","O","_","A","A"],
          ["_","_","O","_","_","_"],
          ["X","X","O","_","_","_"],
          ["K","K","_","_","_","Q"],
          ["_","_","_","_","_","Q"],
          ["_","_","_","_","_","Q"]
        ],
    fScore: 3,
    parent: 0
  }

  var successors = generateSuccessors(state);
  for (var i=0; i<successors.length; i++) {
    console.log(successors[i]);
  }
}

//TEST NUMBER OF BLOCKING VEHICLES
function testBlocking() {
  var state = {
    grid:[
          ["_","_","O","_","A","A"],
          ["_","_","O","_","_","_"],
          ["X","X","O","_","_","_"],
          ["P","P","P","_","_","Q"],
          ["_","_","_","_","_","Q"],
          ["_","_","_","_","_","Q"]
        ],
    fScore: 3,
    parent: 0
  }
  var pos = getRedCarPosition(state.grid);
  console.log(calculateBlockingVehicles(pos,state.grid));
}
