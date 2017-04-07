class Vehicle {
	constructor(vehicle_id, length, colour) {
		this.length = length;
		this.id = "vehicle_"+vehicle_id;
		this.colour = colour;
		this.currentPosition = {};
	}

	//Display a vehicle on the grid at an x,y starting position in a direction
	display(startX, startY, orientation, direction) {
		var endX, endY;
		if (orientation === 'horizontal' && direction === 'right') { 
			endX = startX + (this.length);
			endY = startY;

		} else if (orientation === 'horizontal' && direction === 'left') {			
			startX = startX+1;
			endX = startX - (this.length);
			endY = startY;

		} else if (orientation === 'vertical' && direction === 'up') {
			endX = startX;
			startY = startY+1;
			endY = startY - (this.length);

		} else if (orientation === 'vertical' && direction === 'down') {
			endX = startX;
			endY = startY + (this.length);
		} else {
			return {err: 'Invalid orientation and direction combination'}
		}

		//Check move was valid, i.e. check endX and endY lie within the board
		if (endX <= (Grid.SIZE+1) && endX > 0 && endY <= (Grid.SIZE+1) && endY > 0) {

		} else {
			return {err: "Invalid move - cannot display vehicle at this position"}
		}

		this.currentPosition = {startX: startX, endX: endX, startY: startY, endY: endY, orientation: orientation}

		//Create a new vehicle element with colour and correct image
		//Set the css grid-column and grid-row properties to the correct positions
		var styles = "grid-column: "+startX+"/"+endX+";"+
					 "grid-row: "+startY+"/"+endY+";"+
					 "background-color: "+this.colour+";"

		$("#vehicles").append("<div id='"+this.id+"' class='vehicle' style='"+styles+"'></div>");
	}

	//Hide a vehicle
	hide() {
		var id = this.id
		$("#"+id).hide();
	}

	// Remove a vehicle
	remove() {
		var id = this.id;
		$("#"+id).remove();
	}

	//Move a vehicle to new starting position
	//BUG IN THIS FUNCTION
	move(direction, amount, callback) {
		//Check that this is a legal move, e.g. if vehicle has height 1 then it can only move sideways
		//If vehicle has a width of 1 it can only move up and down
		var currentPosition = this.currentPosition;

		if ((direction === 'left' || direction === 'right') && currentPosition.orientation !== 'horizontal') {
			return {err: 'Invalid move. Current position must be horizontal to move left or right'};
		}

		if ((direction === 'up' || direction === 'down') && currentPosition.orientation !== 'vertical') {
			return {err: 'Invalid move. Current position must be vertical to move up or down'};
		}
		this.animateMovement(direction, amount, callback)

	}

	animateMovement(direction, amount, callback) {

		//use jquery animations to change position
		var id = this.id;

		var widthAmount = amount * $(".square").width();
		var val;
		switch (direction) {
			case 'right':
				direction = "left";
				val = "+="+widthAmount+"px";
				break;
			case 'left':
				val = "-="+widthAmount+"px";
				break;
			case 'up':
				direction = "top";
				val = "-="+widthAmount+"px";
				break;
			case 'down':
				direction = "top";
				val = "+="+widthAmount+"px";
				break;
		}

		var property = {};
		property[direction] = val;
		$("#"+id).animate(property, 1000, function() {
			callback();
		});
	}

	
}