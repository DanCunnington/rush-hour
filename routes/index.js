var express = require('express');
var router = express.Router();
var http = require('http');
var https = require('https');

var faye = require('faye');
var client = new faye.Client('http://localhost:8000/faye');

var rushhour = require('../utils/solver');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Rush Hour' });
});


router.post('/solve', function(req,res,next) {
    var puzzle = req.body.puzzle;
    var startingState = {
        grid: JSON.parse(puzzle),
        parent: 0
    };

    rushhour.search(startingState,function(solution) {
    	for (var i=0; i<solution.length; i++) {
    		
    		for (var j=0; j<solution[i].grid.length; j++) {
    			var line = "";
    			for (var k=0; k<solution[i].grid[j].length; k++) {
    				line += solution[i].grid[j][k] +" ";
    			}
    			console.log(line);
    			console.log()
    		}
    		
    		console.log('----')
    		
    	}


        res.json({solution: solution});
    });
});



module.exports = router;
