$(document).ready(function() {
    var grid = new Grid();
    grid.initialise();

    var test = [
          ["_","_","O","_","A","A"],
          ["_","_","O","_","_","_"],
          ["X","X","O","_","_","_"],
          ["K","K","_","_","_","Q"],
          ["_","_","_","_","_","Q"],
          ["_","_","_","_","_","Q"]
        ]

    var puzzle = new Puzzle(test);
    puzzle.display();

    puzzle.solve();


});
