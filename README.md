# js-xwords #

Client side crossword generator

## Requirements - version 1.0.1: ##

1. The application should produce a printable question grid (with little numbers like in the newspaper) and also the answers. Also, it needs to print the clues with the question grid.

2. It should run completely on the client side so that the miminum possible load is placed on the server.

3. The display and computational elements should be separated so that the computational part could be added in to an existing or a new design with minimal effort (ideally none!).

4. The interface should have some mechanism for making the crossword easier - for example randomly adding letters within the question grid - this would make the crossword easier for weaker students/groups.

5. It must be quick and easy to use - with the absolute minimum of clicking and typing.


## Live Online ##

[http://demos.waystoskinacat.com/xWords/](http://demos.waystoskinacat.com/xWords/) 

## Overview of the code ##

The bulk of the code is separated into two files.  The display code is in [xWordsDisplay.js](src/js/xWordsDisplay.js) and the crossword generation part which is in [xWords.js](src/js/xWords.js)

The functions in xWordsDisplay are called from the interface in the HTML file ([index.htm](src/index.htm)) and xWordsDisplay calls xWords using the create function which returns the crossword question and answer grids.

xWords.js can be reused elsewhere independent of the rest of the code on the site for crossword puzzle generation.

## Known issues ##
[Chrome Print Bug](https://github.com/waystoskinacat/js-xwords/issues/6)