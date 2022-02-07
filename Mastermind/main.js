// Időmérő

let sec;

function setTime() {
    ++sec;
    document.getElementById('timer').innerHTML = pad(parseInt(sec / 60)) + ":" + pad(sec % 60);
}

function pad(value) {
    let valueString = value + "";
    if (valueString.length < 2) {
        return "0" + valueString;
    } else {
        return valueString;
    }
}

// Szöveges megjelenítés a játék alján

function myText(text){
    clearInterval(showText);
    document.getElementById('gameInfo').style.visibility = "visible";
    document.getElementById('gameInfo').innerHTML = text
    showText = setInterval(myDelayedText, 5000);
}

function myDelayedText() {
    document.getElementById('gameInfo').style.visibility = "hidden";
}

// Játék indítása

function gameStart() {

    document.getElementById('timer').innerHTML = "00:00";
    clearInterval(timer);
    sec = 0;
    timer = setInterval(setTime, 1000);

    myText("Game Started. Good luck! 🍀");

    winingColors = correctColorRandomizer();
    currentGameRow = 1;

    // Újrakezdés esetén, törlés.
    for (i = 0; i < spikeTable.length; i++) {
        if (spikeTable[i] !== 0) {
            let couldBeDeletedSpikeDiv = document.getElementById('couldBeDeletedSpikes' + i);
            let currentSpikeCell = document.getElementById("spike" + (i + 1));
            currentSpikeCell.removeChild(couldBeDeletedSpikeDiv);
            spikeTable.splice(i, 1, 0);
        }
    }

    for (i = 0; i < boardTable.length; i++) {
        if (boardTable[i] !== 0) {
            let couldBeDeletedDiv = document.getElementById('couldBeDeleted' + (i + 1));
            let currentCell = document.getElementById(i + 1);
            currentCell.removeChild(couldBeDeletedDiv);
            boardTable.splice(i, 1, 0);
        }
    }

    if (gameEnd) {
        for (i = 0; i < 4; i++) {
            let couldBeDeletedWinDiv = document.getElementById('couldBeDeletedWin' + i);
            let currentWinCell = document.getElementById("correct" + (i + 1));
            currentWinCell.removeChild(couldBeDeletedWinDiv);
        }
    }
    // ^^^ Törlés vége ^^^

    needApply = false;
    checkUndoValidity = 0;
    gameEnd = false;
}

// Ronda változók egyhelyen.

let boardTable = [0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0];

let spikeTable = [0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0];

let winingColors;

let currentGameRow;

let needApply;

let currentRowColors;

let checkUndoValidity;

let gameEnd;

let showText;

const oneRowLength = 4;

gameStart();

// 4 szín kiválasztása

function correctColorRandomizer() {
    let colors = ["red", "white", "blue", "pink", "orange", "purple", "yellow", "green"]
    let currentColors = []
    for (i = 4; i > currentColors.length;) {
        let randomNum = Math.floor(Math.random() * colors.length);
        currentColors.push(colors[randomNum]);
        colors.splice(randomNum, 1)
    }
    return currentColors;
}

// Színek kattintása

function chooseColorFunc(myColor) {
    const funcColor = myColor.classList.value
    if (!gameEnd) {
        putColor(funcColor)
    }
}

// Szín hozzáadó

function putColor(myColor) {
    currentRowColors = boardTable.filter(element => element !== 0);
    if (currentRowColors.length !== 0 && currentRowColors.length % (4 * currentGameRow) === 0) {
        myText("❌ Need to press apply (✔️) to continue.");
    } else {
        for (i = 0; i < boardTable.length;) {
            if (boardTable[i] === 0) {
                boardTable.splice(i, 1, myColor);
                addColorDiv(myColor, i + 1);
                return;
            } else {
                i++;
            }
        }
    }
}

function addColorDiv(myColor, cell) {
    let newDiv = document.createElement('div');
    newDiv.classList.add("fix")
    newDiv.classList.add(myColor)
    newDiv.setAttribute("id", "couldBeDeleted" + cell);
    let currentCell = document.getElementById(cell);
    currentCell.appendChild(newDiv);

    currentRowColors = boardTable.filter(element => element !== 0);
    if (currentRowColors.length !== 0 && currentRowColors.length % (4 * currentGameRow) === 0) {
        needApply = true;
    }
}

// Undo

function undo() {
    if (boardTable[checkUndoValidity] !== 0 && !gameEnd) {
        currentRowColors = boardTable.filter(element => element !== 0);
        let cutableColorIndex = currentRowColors.length;
        let currentCell = document.getElementById(cutableColorIndex);
        let couldBeDeletedDiv = document.getElementById('couldBeDeleted' + cutableColorIndex);
        currentCell.removeChild(couldBeDeletedDiv);
        boardTable.splice(cutableColorIndex - 1, 1, 0);
        needApply = false;
    } else if (!gameEnd) {
        myText("❌ Can not undo (↩️) more cell.");
    }
}

// Apply

function apply() {
    if (needApply === true) {
        isThisRowCorrect()
        checkUndoValidity += 4;
    } else if (!gameEnd) {
        myText("❌ Can not apply (✔️) finish the row.");
    }
}

// Jó helyen vannak e a színek. GC = GOOD COLOR, GP = GOOD POSITION

function isThisRowCorrect() {
    let rowSpikes = [0, 0, 0, 0]
    let cutableWiningColors = winingColors.slice(0);
    let cutableCurrentRowColors = [];

    for (i = 0; i < oneRowLength; i++) {
        cutableCurrentRowColors.push(currentRowColors[i + 4 * (currentGameRow - 1)])
    }

    for (i = 0; i < oneRowLength; i++) {
        if (cutableCurrentRowColors[i] === cutableWiningColors[i]) {
            if (rowSpikes[0] === 0) {
                rowSpikes.splice(0, 1, "GP");
                cutableWiningColors.splice(i, 1, 0);
            } else if (rowSpikes[1] === 0) {
                rowSpikes.splice(1, 1, "GP");
                cutableWiningColors.splice(i, 1, 0);
            } else if (rowSpikes[2] === 0) {
                rowSpikes.splice(2, 1, "GP");
                cutableWiningColors.splice(i, 1, 0);
            } else if (rowSpikes[3] === 0) {
                rowSpikes.splice(3, 1, "GP");
                cutableWiningColors.splice(i, 1, 0);
            }
        }
    }
    for (i = 0; i < oneRowLength; i++) {
        if (cutableCurrentRowColors.includes(cutableWiningColors[i])) {
            if (rowSpikes[0] === 0) {
                rowSpikes.splice(0, 1, "GC");
                cutableWiningColors.splice(i, 1, 0);
            } else if (rowSpikes[1] === 0) {
                rowSpikes.splice(1, 1, "GC");
                cutableWiningColors.splice(i, 1, 0);
            } else if (rowSpikes[2] === 0) {
                rowSpikes.splice(2, 1, "GC");
                cutableWiningColors.splice(i, 1, 0);
            } else if (rowSpikes[3] === 0) {
                rowSpikes.splice(3, 1, "GC");
                cutableWiningColors.splice(i, 1, 0);
            }
        }
    }
    for (i = 0; i < oneRowLength; i++) {
        let spikeTableIndex = i + 4 * (currentGameRow - 1)
        if (rowSpikes[i] !== 0 && rowSpikes[i] === "GP") {
            spikeTable.splice(spikeTableIndex, 1, "GP");
            let newDiv = document.createElement('div');
            newDiv.classList.add("GP");
            newDiv.setAttribute("id", "couldBeDeletedSpikes" + spikeTableIndex);
            let currentSpikeCell = document.getElementById("spike" + (spikeTableIndex + 1));
            currentSpikeCell.appendChild(newDiv);
        } else if (rowSpikes[i] !== 0 && rowSpikes[i] === "GC") {
            spikeTable.splice(spikeTableIndex, 1, "GC");
            let newDiv = document.createElement('div');
            newDiv.classList.add("GC");
            newDiv.setAttribute("id", "couldBeDeletedSpikes" + spikeTableIndex);
            let currentSpikeCell = document.getElementById("spike" + (spikeTableIndex + 1));
            currentSpikeCell.appendChild(newDiv);
        }
    }

    currentGameRow++;
    needApply = false;
    winLoseCondition(cutableCurrentRowColors);
}

// Nyerés / Vesztés

function winLoseCondition(choosenColors) {
    if (choosenColors.toString() === winingColors.toString() || currentGameRow === 12) {
        clearInterval(timer);
        for (i = 0; i < winingColors.length; i++) {
            let newDiv = document.createElement('div');
            newDiv.classList.add("fix")
            newDiv.classList.add(winingColors[i])
            newDiv.setAttribute("id", "couldBeDeletedWin" + i);
            let currentCell = document.getElementById("correct" + (i + 1));
            currentCell.appendChild(newDiv);
        }
        gameEnd = true;

        if (currentGameRow === 12) {
            myText("You lose. 😔");
            return;
        }
        myText("🏆 VI C T O R Y 🏆");
    }

}