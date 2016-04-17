//Faye client
var client = new Faye.Client("http://localhost:8000/faye");

$(document).ready(function() {
    
    solve();
    function solve() {
        var puzzleExx = '['+
            '["_","_","O","_","A","A"],'+
            '["_","_","O","_","_","_"],'+
            '["X","X","O","_","_","_"],'+
            '["P","P","P","_","_","Q"],'+
            '["_","_","_","_","_","Q"],'+
            '["_","_","_","_","_","Q"]'+
        ']';

        $.post('/solve', {'puzzle': puzzleExx}, function(response) {
            var solution = response.solution;
            for (var i=0; i<solution.length; i++) {
                console.log(solution[i]);
                console.log("----");
            }
        });;
    }
});

