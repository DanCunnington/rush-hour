//Faye client
var client = new Faye.Client("http://localhost:8000/faye");

$(document).ready(function() {
    
});

function solve() {
    var puzzle = '['+
        '["_","_","O","_","A","A"],'+
        '["_","_","O","_","_","_"],'+
        '["X","X","O","_","_","_"],'+
        '["P","P","P","_","_","Q"],'+
        '["_","_","_","_","_","Q"],'+
        '["_","_","_","_","_","Q"]'+
    ']';
    $.post('/solve', {'puzzle': puzzle}, function(response) {
        var solution = response.solution;
        for (var i=0; i<solution.length; i++) {
            console.log(solution[i]);
            console.log("----");
        }
    });;
}