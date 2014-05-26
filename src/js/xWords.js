/**
  * Classes: xWords, Position, Word and Alternative Grid
  * File: xWords.js 
  *
  * Definition:
  *		Creates and manages a crossword.
  *
 **/
var xWords = {
   	/* CLASS CONSTANTS */
   	HORIZONTAL: 1,		// INTENDED DIRECTION 
   	VERTICAL: 2,		// INTENDED DIRECTION 

   	MAX_PASSES: 3,		// MAXIMUM NUMBER OF ATTEMPTS TO PLACE A WORD
   	MAX_RUNTIME: 5000, 	// THE MAXIMUM RUN TIME IN MILLISECONDS

   	CENTER_FIRST: false,	// PLACE THE FIRST IN CENTER
   	UNSET: -1,			// CONSTANT FOR UNASSIGNED INDEXES


    /* CLASS PROPERTIES */
    _self:this,
	Grid:new Array(),			// Answer Grid
	QuestionGrid:new Array(),	// Question Grid (HOLDS NUMBERING)

	Words:new Array(),			// Word Objects
	QuestionList:new Array(),	// Numbered clues
	bestFit:null,				// Records the grid with fewest orphans
								// over all iterations.

	/* PUBLIC METHODS */
	// resets the grid and word list
	Reset: function(){
		this.Grid = new Array();
		this.Words = new Array();
		this.QuestionGrid = new Array();
		this.QuestionList = new Array();
	},

	// INDICATES HOW MANY GROUPINGS OF WORDS ARE ON THE GRID
	GetNumberOfWordGroups: function(){
		var iReturn = 0;
		for (var x = 0; x < this.Words.length; x++){
			if (this.Words[x].orphaned){
				iReturn++;
			}
			// if ((this.Words[x].orphaned)&&
			// 	(this.Words[x].posIndex != this.UNSET)){
			// 	iReturn++;
			// } else if (this.Words[x].chosenPosition == null) {
			// 	iReturn++;
			// }
		}
		return iReturn;
	},

	GetUnusedWords: function(){
		var unusedArray = new Array();
		for (var x = 0; x < this.Words.length; x++){
			if (this.Words[x].posIndex == this.UNSET){
				unusedArray.push(this.Words[x].word);
			}	
		}
		return unusedArray;
	},

	GetQuestionGrid:function(){
		return this.QuestionGrid;
	},

	GetQuestionList:function(){
		return this.QuestionList;
	},


	Create: function(height, width, arrayOfWords){

		// RESET AND CREATE THE NEW GRID
		// AND THE QUESTION GRID

		var time1 = new Date().getTime();
		var lIteration = 1;

		this.Reset();
		this.bestFit = null;

		do {

			this.Reset();

	        this.Grid = new Array(width);
	        this.QuestionGrid = new Array(width);

	        for (var i = 0; i < this.Grid.length; i++){
	            this.Grid[i] = new Array(height);
	            this.QuestionGrid[i] = new Array(height);
	        }

	        for (var i = 0; i < this.Grid.length; i++){
	        	for (var j = 0; j < this.Grid[0].length; j++){
	            	this.Grid[i][j] = '';
	            	this.QuestionGrid[i][j] = '';
	            }
	        }

			// CREATE A NEW WORD AND ADD TO THE 
			// WORDS ARRAY
			for (var x=0; x < arrayOfWords.length; x++){

				// MUST BE AT LEAST 2 CHARS LONG
				if (arrayOfWords[x].length > 1){
				 	this.Words.push(new Word(arrayOfWords[x]));
				}
			}

			// ORDER ALL OF THE WORDS BY WHICH IS THE LONGEST
			this.SortByLength(this.Words);

			for (var y = 1; y <= this.MAX_PASSES; y++){
				for (var x=0; x < this.Words.length; x++){
					if (((this.Words[x].orphaned)
						&&(this.Words[x].posIndex == this.UNSET))
						||(y == 1)){
						this.Words[x].Reset();
					 	this.AddWord(this.Words[x],x,y);
					}
				}
			}

			this.GenerateQuestionGrid();

			if (this.bestFit != null){
				if (this.bestFit.WordGroupsCount 
					> this.GetNumberOfWordGroups()){
					this.bestFit = null;
					this.bestFit = new AlternativeGrid(
						this.Grid.slice(),
						this.Words.slice(),
						this.QuestionGrid.slice(),
						this.QuestionList.slice(),
						this.GetNumberOfWordGroups());
				}
			} else {
				var x = this.GetNumberOfWordGroups();
				this.bestFit = new AlternativeGrid(
					this.Grid.slice(),
					this.Words.slice(),
					this.QuestionGrid.slice(),
					this.QuestionList.slice(),
					this.GetNumberOfWordGroups());
			}


			lIteration++;
		    time2 = new Date().getTime();

		} while ((time2 - time1 < this.MAX_RUNTIME)
			&&(this.GetNumberOfWordGroups() > 1));




		if (this.bestFit.WordGroupsCount 
			< this.GetNumberOfWordGroups()){
			this.Reset();
			this.Grid = this.bestFit.Grid;
			this.Words = this.bestFit.Words;
			this.QuestionGrid = this.bestFit.QuestionGrid;
			this.QuestionList = this.bestFit.QuestionList;
		}



		return this.Grid;
	},

	/**********************************************************/
	/* PRIVATE METHODS                                        */
	/**********************************************************/
	GenerateQuestionGrid: function(){
		var counter = 1;

		for (var i = 0; i < this.Words.length; i++){
			if (this.Words[i].posIndex != this.UNSET){
				if (this.Words[i].crossingPositions.length > 0){

					var tmpObj = {
						x: this.Words[i].crossingPositions[this.Words[i].posIndex].x,
						y: this.Words[i].crossingPositions[this.Words[i].posIndex].y,
						d: this.Words[i].crossingPositions[this.Words[i].posIndex].direction,
						clue: this.Words[i].word
					};
					this.QuestionList.push(tmpObj);

				} else {

					var tmpObj = {
						x: this.Words[i].availablePositions[this.Words[i].posIndex].x,
						y: this.Words[i].availablePositions[this.Words[i].posIndex].y,
						d: this.Words[i].availablePositions[this.Words[i].posIndex].direction,
						num: 0,
						clue: this.Words[i].word
					};
					this.QuestionList.push(tmpObj);

				}
				counter++;
			}
		}

		this.QuestionList = this.SortXwordQuestions(this.QuestionList);

		var counter = 0
		for (var k = 0; k < this.QuestionList.length; k++){
			if (this.QuestionGrid[this.QuestionList[k].x][this.QuestionList[k].y].length == 0){
				counter++;
				this.QuestionGrid[this.QuestionList[k].x][this.QuestionList[k].y] = counter.toString();
				this.QuestionList[k].num = counter;
			} else {
				this.QuestionList[k].num = counter;
			}
		}
	},

	// SORT THE ARRAY LONGEST TO SHORTEST 
	SortXwordQuestions: function(lArray){
		lArray.sort(function(a,b){
			var bReturn = 1;			
		   	if (a.y < b.y) bReturn = -1;
		   	if ((a.y == b.y)&&(a.x < b.x)) bReturn = -1;
		   	return bReturn;
        });
        return lArray;
	},


	SortByLength: function(lArray){
		lArray.sort(function(a,b){
           return a.word.length < b.word.length;
        });
		return lArray;
	},


	// ADD A WORD TO THE GRID (IF POSSIBLE)
	AddWord: function(newWord, callNumber, passNumber){
		
		this.GetPositions(newWord, callNumber, passNumber);


		if (newWord.crossingPositions.length + 
			newWord.availablePositions.length > 0){

			var choice = this.UNSET;
			var newPos;

			// CHOOSE A CROSSING POINT POSITION IF
			// THERE IS ONE - OTHERWISE RANDOMLY 
			// CHOOSE FROM THE AVAILABLE POSITIONS
			if (newWord.crossingPositions.length > 0){
				choice = Math.floor(
					(Math.random() * 
					newWord.crossingPositions.length));
					newPos = newWord.crossingPositions[choice];
					newWord.orphaned = false;
			} else if (((callNumber == 0)&&(passNumber == 1))
				||(passNumber >= this.MAX_PASSES)){
				choice = Math.floor(
					(Math.random() * 
					newWord.availablePositions.length));
					newPos = newWord.availablePositions[choice];
			}

			if (choice != this.UNSET){
				newWord.posIndex = choice;

				if (newWord.crossingPositions.length > 0){
					newWord.chosenPosition = newWord.crossingPositions[newWord.posIndex];
				} else if (newWord.availablePositions.length > 0) {
					newWord.chosenPosition = newWord.availablePositions[newWord.posIndex];
				}

				// LOOP THROUGH THE WORD PLACING IT IN THE GRID
				for (var count = 0; count < newWord.word.length; count++){
					if (newPos.direction == this.HORIZONTAL){
						this.Grid[newPos.x + count][newPos.y] = 
							newWord.word.charAt(count);
					} else if (newPos.direction == this.VERTICAL){
						this.Grid[newPos.x][newPos.y + count] = 
							newWord.word.charAt(count);
					}
				}
			}

		}
	},

	// RETURNS ALL THE AVAILABLE VALID POSITIONS FOR PLACING THE WORD
	GetPositions: function(newWord, callNumber, passNumber){

		if ((this.CENTER_FIRST)&&
			(callNumber == 0)&&
			(passNumber == 1)){

			var newPos = undefined;
			var x = 0;
			var y = 0;
			var d = this.HORIZONTAL;
			
			if (this.Grid.length > this.Grid[0].length){
				x = Math.floor(this.Grid.length/2);
				y = Math.floor((this.Grid[0].length - newWord.word.length)/2);
				d = this.VERTICAL
			} else {
				x = Math.floor((this.Grid.length - newWord.word.length)/2);
				y = Math.floor(this.Grid[0].length/2);
				d = this.HORIZONTAL
			}
			
			newPos = this.TestPosition(newWord.word,x,y,d);
			if (newPos !== undefined) {
				newWord.availablePositions.push(newPos);
			}

		} else {
			for (var x = 0; x < this.Grid.length; x++){
				for (var y = 0; y < this.Grid[0].length; y++){
					
					var newPos = undefined;

					newPos = this.TestPosition(newWord.word,x,y,this.HORIZONTAL);
					if (newPos !== undefined) {
						if (newPos.crossingPoint > 0){
							newWord.crossingPositions.push(newPos);
						} else {
							newWord.availablePositions.push(newPos);
						}
					}
					newPos = this.TestPosition(newWord.word,x,y,this.VERTICAL);
					if (newPos !== undefined) {
						if (newPos.crossingPoint > 0){
							newWord.crossingPositions.push(newPos);
						} else {
							newWord.availablePositions.push(newPos);
						}
					}

				}
			}
		}


	},

	// TRIES A POSITION TO SEE IF IT IS ACCEPTABLE
	TestPosition: function(newWord,x,y,direction){

		var crossingPoint = 0;

		// UNNACCEPTABLE IF THERE IS A LETTER
		// IN THE SQUARE BEFORE THE PROPOSED START 
		if (this.CharBeforeFirstLetter(x,y,direction))
			return;

		// UNNACCEPTABLE IF THERE IS A LETTER
		// IN THE SQUARE AFTER THE END 
		if (this.CharAfterLastLetter(newWord.length,x,y,direction))
			return;


		// DEAL WITH HORIZONTAL AND VERTICAL WORD PLACEMENT
		// SEPARATELY
		if (direction == this.HORIZONTAL){

			// UNACCEPTABLE IF THERE IS NO SPACE IN THE GRID
			if (x + newWord.length > this.Grid.length)
				return;

			for (var count = 0; count < newWord.length; count++){

				// 4 CHECKS:
				// 1 - UNACCEPTABLE IF THERE IS A CHARACTER ON
				//		ON THE PROPOSED PATH OF THIS WORD
				// 2 - UNACCEPTABLE IF THERE IS ANOTHER WORD IN THE
				//		SAME DIRECTION AT THIS POINT
				// 3 - ACCEPTABLE IF THE CHARACTER MATCHES THE
				//		THE CHARACTER IN THIS WORD - ADD
				//		A CROSSING POINT
				// 4 - UNACCEPTABLE IF THERE ARE CHARACTERS
				//		EITHER SIDE OF THIE PROPOSED PATH
				if ((this.Grid[x + count][y].length > 0)&&
					(this.Grid[x + count][y] != 
						newWord.charAt(count))){
					return;
				} else if (this.AnotherWordOnThisLine(x + count,y,direction)){
					return;
				} else if (this.Grid[x + count][y] == 
						newWord.charAt(count).toString()){
					crossingPoint++;
				} else if (this.SidesHaveChars(x+count,y,direction)){
					return;
				} 
			}

		} else if (direction == this.VERTICAL){

			// UNACCEPTABLE IF THERE IS NO SPACE IN THE GRID
			if (y + newWord.length > this.Grid[0].length)
				return;

			for (var count = 0; count < newWord.length; count++){

				// 4 CHECKS:
				// 1 - UNACCEPTABLE IF THERE IS A CHARACTER ON
				//		ON THE PROPOSED PATH OF THIS WORD
				// 2 - UNACCEPTABLE IF THERE IS ANOTHER WORD IN THE
				//		SAME DIRECTION AT THIS POINT
				// 3 - ACCEPTABLE IF THE CHARACTER MATCHES THE
				//		THE CHARACTER IN THIS WORD - ADD
				//		A CROSSING POINT
				// 4 - UNACCEPTABLE IF THERE ARE CHARACTERS
				//		EITHER SIDE OF THIE PROPOSED PATH
				if ((this.Grid[x][y + count].length > 0)&&
					(this.Grid[x][y + count] != 
						newWord.charAt(count))){
					return;
				} else if (this.AnotherWordOnThisLine(x,y + count,direction)){
					return;
				} else if (this.Grid[x][y + count] == 
						newWord.charAt(count).toString()){
					crossingPoint++;
				} else if (this.SidesHaveChars(x,y+count,direction)){
					return;
				} 
			}

		}

		// IF NO PROBLEMS RETURN THE POSITION DETAILS
		return new Position(x,y,direction,crossingPoint);
	},


	// CHECKS THE SQUARE AFTER THE WORD TO SEE IF VALID
	CharAfterLastLetter: function(len,x,y,direction){
		var bCharAfterLastLetter = false;

		if (direction == this.HORIZONTAL){
			if (x + len < this.Grid.length){
				if (this.Grid[x + len][y].length > 0) return true;
			}
		} else if (direction == this.VERTICAL){
			if (y + len < this.Grid[0].length){
				if (this.Grid[x][y + len].length > 0) return true;
			}
		}

		return bCharAfterLastLetter;
	},

	// CHECKS THE SQUARE BEFORE THE WORD TO SEE IF VALID
	CharBeforeFirstLetter: function(x,y,direction){
		var bCharBeforeFirstLetter = false;

		if (direction == this.HORIZONTAL){
			if (x-1 >= 0){
				if (this.Grid[x-1][y].length > 0) return true;
			}
		} else if (direction == this.VERTICAL){
			if (y-1 >= 0){
				if (this.Grid[x][y-1].length > 0) return true;
			}
		}

		return bCharBeforeFirstLetter;
	},


	// CHECK THE POSITION TO SEE IF IT WILL OVERWRITE ANOTHER WORD
	// IN THE SAME DIRECTION
	AnotherWordOnThisLine: function(x,y,direction){
		for (var z = 0; z < this.Words.length; z++){
			if (this.Words[z].chosenPosition != null){
				if ((this.Words[z].chosenPosition.x == x)&&
					(this.Words[z].chosenPosition.y == y)&&
					(this.Words[z].chosenPosition.direction == direction)){
					return true;
				}
			}
		}
		return false;
	},


	// CHECKS THE POSITIONS TO THE SIDE OF THE PROPOSED
	// PATH TO SEE IF THERE ARE ANY CHARACTERS WHICH
	// COULD LEAD TO CONFLICT
	SidesHaveChars: function(x,y,direction){
		var bHasChars = false;

		if (direction == this.HORIZONTAL){
			if (y-1 >= 0){
				if (this.Grid[x][y-1].length > 0) return true;
			}
			if (y+1 < this.Grid[0].length){
				if (this.Grid[x][y+1].length > 0) return true;
			}
		} else if (direction == this.VERTICAL){
			if (x-1 >= 0){
				if (this.Grid[x-1][y].length > 0) return true;
			}
			if (x+1 < this.Grid.length){
				if (this.Grid[x+1][y].length > 0) return true;
			}
		}

		return bHasChars;
	},


};


/**
  * OBJECT: Position
  * 
  * Holds the details of a valid position on the grid
  *
  * X and Y - indicate horizonal and vertical positions
  * on the grid.
  *
  * Direction:
  * 	1 indicates horizontal
  * 	-1 indicates vertical
  * CrossingPoint:
  * 	Indicates the number of valid crossing points with 
  *		other words already on the grid.
 **/
function Position(x,y,direction,crossingPoint){
	this.x = x;
	this.y = y;
	this.direction = direction;
	this.crossingPoint = crossingPoint;
}

/**
  * OBJECT: Word
  * 
  *	Holds all the information related to an individual word
  *
 **/
function Word(txt){
	this.word = txt;
	this.clue = '';//clue;
	this.crossingPositions = new Array();
	this.availablePositions = new Array();
	this.orphaned = true;
	this.posIndex = -1;
	this.chosenPosition = null;
	this.Reset = function(){
		this.crossingPositions = new Array();
		this.availablePositions = new Array();
	};
}

/**
  * OBJECT: AlternativeGrid
  * 
  *	Saves the state of a grid that has been processed.
  * This is to allow for evaluation of several runs of 
  * the processor.
 **/
function AlternativeGrid(grid, words, qGrid, qList, groupCount){
	this.Grid = grid;
	this.Words = words;
	this.QuestionGrid = qGrid;
	this.QuestionList = qList;
	this.WordGroupsCount = groupCount;
}

