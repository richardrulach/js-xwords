
/**
 *   Copyright 2014 Richard Rulach 
 *   Licensed under the Apache License, Version 2.0 (the "License"); 
 *   you may not use this file except in compliance with the License. 
 *
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0 
 *
 *   Unless required by applicable law or agreed to in writing, 
 *   software distributed under the License is distributed on 
 *   an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
 *   either express or implied. See the License for the specific 
 *   language governing permissions and limitations under the License
**/

// SET UP GLOBAL DISPLAY PARAMETERS
var GRID_SIZE = 25;
var HORIZONTAL_BOXES = 9;
var VERTICAL_BOXES = 9;
var RUN_PROFILER = false;

var GRID_WIDTH = GRID_SIZE * HORIZONTAL_BOXES;
var GRID_HEIGHT = GRID_SIZE * VERTICAL_BOXES;

// UPDATE FUNCTIONS FOR THE GLOBAL DISPLAY SETTINGS
function updateBoxSize(numPixels){
    GRID_SIZE = numPixels;
    GRID_WIDTH = GRID_SIZE * HORIZONTAL_BOXES;
    GRID_HEIGHT = GRID_SIZE * VERTICAL_BOXES;
}

function updateGridSize(horizontal,vertical){
    HORIZONTAL_BOXES = 9;
    VERTICAL_BOXES = 9;
    
    GRID_WIDTH = GRID_SIZE * HORIZONTAL_BOXES;
    GRID_HEIGHT = GRID_SIZE * VERTICAL_BOXES;
}

function btnAddWords_click(){
    $('.loading').show();
    //  MAKES SURE THE LOADING ANIMATION RUNS 
    //  FOR A SECOND TO SHOW ACTIVITY
    setTimeout(run,1000);
}

function btnPrint_click(){
    PrintCrossword();
}


function btnLoadSampleData_click(){
    $('#txtWords').val(
        'jumper,keeps you warm in winter\n' + 
        'jeans,usually faded blue\n' +
        'skirt,women wear these over their legs\n' + 
        'trousers,men wear these over their legs\n' +
        'socks,worn on the feet\n' +
        'shoes,usually have laces\n' +
        'shirt,worn on the body and usually has buttons\n' +
        'hat,keeps your head warm\n' +
        'gloves,normally only worn when it is very cold to protect your hands\n'
        );
}

function run(){

    xWords.Reset();

    canvas.width = GRID_WIDTH;
    canvas.height = GRID_HEIGHT;

    canvasQuestion.width = GRID_WIDTH;
    canvasQuestion.height = GRID_HEIGHT;

    contextQuestion.clearRect(0, 0, GRID_WIDTH, GRID_HEIGHT);
    context.clearRect(0, 0, GRID_WIDTH, GRID_HEIGHT);


    contextQuestion.beginPath();
    contextQuestion.lineWidth = 1;
    contextQuestion.strokeStyle = "black";

    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = "black";


    DrawGrid();

    // FONT SIZE IS 80% SIZE OF EACH SQUARE
    var fontSize = Math.floor(GRID_SIZE * 0.8);


    var smallFontSize = Math.floor(GRID_SIZE * 0.35);
    if (GRID_SIZE < 34) smallFontSize = 12;


    context.font = fontSize.toString() + "px _sans";
    context.textBaseline = "middle";

    contextQuestion.font = 
        smallFontSize.toString() + "px _sans";

    // GENERATE ARRAY OF WORDS TO PUT INTO THE CANVAS
    var rawData = $('#txtWords').val();
    var aValues = rawData.split('\n');

    // GET THE CROSSWORD 
    if (RUN_PROFILER) console.clear();
    if (RUN_PROFILER) console.profile('xWords.Create()');

    var crossword = xWords.Create(
        VERTICAL_BOXES,
        HORIZONTAL_BOXES,
        aValues);

    if (RUN_PROFILER) console.profileEnd();

    // GET THE GRID WITH NUMBERS
    var qGrid = xWords.GetQuestionGrid();

    for (var i = 0; i < crossword.length; i++){
        for (var j = 0; j < crossword[i].length; j++){
            if (crossword[i][j].length == 0){

                contextQuestion.rect(i*GRID_SIZE,j*GRID_SIZE, GRID_SIZE, GRID_SIZE);
                contextQuestion.fill();

                context.rect(i*GRID_SIZE,j*GRID_SIZE, GRID_SIZE, GRID_SIZE);
                context.fill();
            } else {

                if (qGrid[i][j].length > 0){

                    var qAdjustW = GRID_SIZE * 0.05;
                    var qAdjustH = GRID_SIZE * 0.3;

                    if (GRID_SIZE < 34) {
                        qAdjustW = 1.9;
                        qAdjustH = 10.6;
                    } 

                    contextQuestion.fillText(qGrid[i][j],
                      i*GRID_SIZE + qAdjustW, 
                      j*GRID_SIZE + qAdjustH);
                }

                var x = Math.round((GRID_SIZE - 
                context.measureText(crossword[i][j]).width) / 2);
                context.fillText(crossword[i][j],
                  i*GRID_SIZE + x - 0.5, 
                  j*GRID_SIZE + (GRID_SIZE/2));
            }
        }
    }

    contextQuestion.stroke();
    contextQuestion.closePath();

    context.stroke();
    context.closePath();


    // DISPLAY CLUES AND UNUSED WORDS
    DisplayClues();

    DisplayErrors();


    $('#mainContainer').show();
    $('.loading').hide();
}



function DisplayErrors(){
    $('#errors').html("<h2>ERRORS</h2>");
    $('#errors').append(xWords.sErrors);
    console.log(xWords.sErrors);
}

function DisplayClues(){

    $('#across').html("<h2>ACROSS</h2>");
    $('#down').html("<h2>DOWN</h2>");
    $('#unused').html("<h2>UNUSED</h2>");

    var unusedList = xWords.GetUnusedWords();
    for (var x = 0; x < unusedList.length; x++){
        $('#unused').append(
            '<div>' + 
            unusedList[x] + 
            '</div>');
    }

    var qList = xWords.GetQuestionList();

    for (var i = 0; i < qList.length; i++){

        switch (qList[i].d){

            case xWords.HORIZONTAL :
                $('#across').append(
                    '<div>' + 
                    qList[i].num + 
                    '. ' + 
                    qList[i].clue + 
                    '</div>');
                break;
                
            case xWords.VERTICAL :
                $('#down').append(
                    '<div>' + 
                    qList[i].num + 
                    '. ' + 
                    qList[i].clue + 
                    '</div>');
                break;
                
        }

    }
}

function DrawGrid(){
    for (var i = GRID_SIZE; i < GRID_WIDTH; i+=GRID_SIZE){
        contextQuestion.moveTo(i,0);
        contextQuestion.lineTo(i,GRID_HEIGHT);
        contextQuestion.stroke();

        context.moveTo(i,0);
        context.lineTo(i,GRID_HEIGHT);
        context.stroke();
    }

    for (var i = GRID_SIZE; i < GRID_HEIGHT; i+=GRID_SIZE){
        contextQuestion.moveTo(0,i);
        contextQuestion.lineTo(GRID_WIDTH,i);
        contextQuestion.stroke();

        context.moveTo(0,i);
        context.lineTo(GRID_WIDTH,i);
        context.stroke();
    }
}

function PrintCrossword()
{
    var html="<!DOCTYPE html><html>";
    html += '<head></head><body"><header style="text-align:center;"><h1>xWords Crossword</header></div>';
    html += '<div style="text-align:center;margin-top:20px;">';
    html += '<img border="2px" src="' +
        canvasQuestion.toDataURL('image/png') + '" />';
    html += '</div>';


    html += '<div style="width:100%; text-align:center">';
    html += '<div style="width:400px; margin:0px auto;">';

    html += '<div style="float:left;text-align:left; width:190px;">' +    $('#across').html() + 
            '</div>';

    html += '<div style="float:right;text-align:left; width:190px;">' +    $('#down').html() + 
            '</div>';

    html += '</div>';
    html += '</div>';

    html += '<br style="clear:both;" />';
    html += '<div style="text-align:center;margin-top:20px;">';
    html += '<img border="2px" src="' +
        canvas.toDataURL('image/png') + '" />';
    html += '</div>';
    html+="</body></html>";

    var printWin = window.open('','','toolbar=0,scrollbars=1,status=0');
    printWin.document.write(html);
    printWin.document.close();
    printWin.focus();
    printWin.print();
}
