$(document).ready(function() {
    var grid = new Grid();
    grid.initialise();

    var test = [
          ["_","O","A","A","B","B"],
          ["_","O","_","_","_","C"],
          ["_","O","_","X","X","C"],
          ["_","D","_","E","F","F"],
          ["_","D","_","E","G","H"],
          ["_","P","P","P","G","H"]
        ]

    var puzzle = new Puzzle(test);
    puzzle.display();

    puzzle.solve();


});
