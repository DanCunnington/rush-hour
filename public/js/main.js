$(document).ready(function() {
    var grid = new Grid();
    grid.initialise();

    var test = [
          ["A","A","O","O","O","B"],
          ["C","_","_","D","D","B"],
          ["C","_","_","X","X","P"],
          ["E","E","F","F","G","P"],
          ["H","H","I","_","G","P"],
          ["_","_","I","Q","Q","Q"]
        ]

    var puzzle = new Puzzle(test);
    puzzle.display();

    puzzle.solve();


});
