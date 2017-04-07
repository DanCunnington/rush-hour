class Grid {
	constructor() {

	}

	static get SIZE() {
	    return 6;
	}

	initialise() {
		for (var i=0; i<Grid.SIZE; i++) {
		    for (var j=0; j<Grid.SIZE; j++) {
		        $("#grid-background").append('<div class="square"></div>');
		    }
		}
	}
}
