class Vehicle {
	constructor(type) {
		if (type === 'car' || type === 'redCar') { this.length = 2 };
		if (type === 'lorry') { this.length = 3 };
		this.size = 1;
		this.type = type;
		this.id = Date.now();
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
			console.log('valid move');
		} else {
			return {err: "Invalid move - cannot display vehicle at this position"}
		}

		this.currentPosition = {startX: startX, endX: endX, startY: startY, endY: endY, orientation: orientation}

		//Create a new vehicle element with colour and correct image
		//Set the css grid-column and grid-row properties to the correct positions
		var styles = "grid-column: "+startX+"/"+endX+";"+
					 "grid-row: "+startY+"/"+endY+";";

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
	move(direction, amount) {
		//Check that this is a legal move, e.g. if vehicle has height 1 then it can only move sideways
		//If vehicle has a width of 1 it can only move up and down
		var currentPosition = this.currentPosition;
		console.log(currentPosition);

		if ((direction === 'left' || direction === 'right') && currentPosition.orientation !== 'horizontal') {
			return {err: 'Invalid move. Current position must be horizontal to move left or right'};
		}

		if ((direction === 'up' || direction === 'down') && currentPosition.orientation !== 'vertical') {
			return {err: 'Invalid move. Current position must be vertical to move up or down'};
		}

		switch (direction) {
			case 'right':
				//Calculate right most coordinate between start and end
				var startX = currentPosition.startX;
				var endX = currentPosition.endX;
				var rightMost;
				var rightMostVal;
				(startX > endX) ? rightMost = 'start' : rightMost = 'end';
				(startX > endX) ? rightMostVal = startX : rightMostVal = endX;

				if ((rightMostVal + amount) > (Grid.SIZE+1)) {
					return {err: 'Invalid right move.'};
				} else {

					var newPosition = {
						startX: 0,
						endX: 0,
						startY: currentPosition.startY,
						endY: currentPosition.endY
					}
					if (rightMost === 'start') {
						newPosition.startX = rightMostVal + amount;
						newPosition.endX = endX + amount;
					} else {
						newPosition.endX = rightMostVal + amount;
						newPosition.startX = startX + amount;
					}
					

					//Animate change in class and complete move
					this.animateMovement(direction, amount, newPosition)
				}
				break;
			case 'left':
				//Calculate left most coordinate between start and end
				var startX = currentPosition.startX;
				var endX = currentPosition.endX;
				var leftMost;
				var leftMostVal;
				(startX < endX) ? leftMost = 'start' : leftMost = 'end';
				(startX < endX) ? leftMostVal = startX : leftMostVal = endX;

				if ((leftMostVal - amount) < 1) {
					return {err: 'Invalid left move.'};
				} else {



				var newPosition = {
					startX: 0,
					endX: 0,
					startY: currentPosition.startY,
					endY: currentPosition.endY
				}
				if (leftMost === 'start') {
					newPosition.startX = leftMostVal - amount;
					newPosition.endX = endX - amount;
				} else {
					newPosition.endX = leftMostVal - amount;
					newPosition.startX = startX - amount;
				}
					

				//Animate change in class and complete move
				this.animateMovement(direction, amount, newPosition)
				}
				break;

			case 'up':
				//Calculate up most coordinate between start and end
				var startY = currentPosition.startY;
				var endY = currentPosition.endY;
				var upMost;
				var upMostVal;
				(startY < endY) ? upMost = 'start' : upMost = 'end';
				(startY < endY) ? upMostVal = startY: upMostVal = endY;

				console.log(upMostVal)

				if ((upMostVal - amount) < 1) {
					return {err: 'Invalid up move.'};
				} else {

					var newPosition = {
						startX: currentPosition.startX,
						endX: currentPosition.endX,
						startY: 0,
						endY: 0
					}
					if (upMost === 'start') {
						newPosition.startY = upMostVal - amount;
						newPosition.endY = endY - amount;
					} else {
						newPosition.endY = upMostVal - amount;
						newPosition.startY = startY - amount;
					}
					

					//Animate change in class and complete move
					this.animateMovement(direction, amount, newPosition)
				}
				break;
			case 'down':
				//Calculate down most coordinate between start and end
				var startY = currentPosition.startY;
				var endY = currentPosition.endY;
				var downMost;
				var downMostVal;
				(startY > endY) ? downMost = 'start' : downMost = 'end';
				(startY > endY) ? downMostVal = startY : downMostVal = endY;

				if ((downMostVal + amount) > (Grid.SIZE+1)) {
					return {err: 'Invalid down move.'};
				} else {

					var newPosition = {
						startX: currentPosition.startX,
						endX: currentPosition.endX,
						startY: 0,
						endY: 0
					}
					if (downMost === 'start') {
						newPosition.startY = downMostVal + amount;
						newPosition.endY = endY + amount;
					} else {
						newPosition.endY = downMostVal + amount;
						newPosition.startY = startY + amount;
					}
					

					//Animate change in class and complete move
					this.animateMovement(direction, amount, newPosition)
				}
				break;
		}

	}

	animateMovement(direction, amount, newPosition) {
		console.log('oioi');
		console.log(newPosition);
		//use jquery animations to change position
		var id = this.id;

		this.currentPosition.startX = newPosition.startX;
		this.currentPosition.startY = newPosition.startY;
		this.currentPosition.endX = newPosition.endX;
		this.currentPosition.endY = newPosition.endY;

		var widthAmount = amount * $(".square").width();
		var val;
		switch (direction) {
			case 'right':
				val = "-="+widthAmount+"px";
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
		$("#"+id).animate(property, 1000);
	}

	
}