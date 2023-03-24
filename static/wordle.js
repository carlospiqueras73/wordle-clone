// JAVASCRIPT FOR WORDLE GAME
// CARLOS PIQUERAS - MCSBT

// Declare the necessary variables
let height = 6; // number of guesses
let width = 5; // length of the word
let row = 0; // current guess (number of attempt)
let col = 0; // current letter of the row
let gameOver = false;
let word = "";

window.onload = function () {
  // Get the random word from API
  getWordAPI().then((wordAPI) => {
    // modify the "word" variable with the retrieved value
    word = wordAPI;
    // log the word in the console
    console.log(`Psst! ... The target word is: ${word}`);
    // Call the initialize function when loading the page
    initialize();
  });
};

async function getWordAPI() {
  // The function tries to retrieve a random word from the following API
  try {
    const response = await fetch(
      "https://random-word-api.herokuapp.com/word?length=5"
    );
    const data = await response.json();
    // Store the word in capital letters
    const wordAPI = data[0].toUpperCase();
    return wordAPI;
  } catch (error) {
    // If it is not able to get the word, show error in the console
    console.error(error);
  }
}

function initialize() {
  // First we generate the game board
  // Iterate through all of the rows (attempts)
  for (let row = 0; row < height; row++) {
    // Iterate through all of the columns (letters for each attempt)
    for (let col = 0; col < width; col++) {
      // generate variable tile to add a square to the board for each letter
      let tile = document.createElement("span");
      // The id of the tile will be: "row-column", to be able to access all tiles in the quadrant
      tile.id = row.toString() + "-" + col.toString();
      // We assign the class "tile", which defines the style at the beggining of the game
      tile.classList.add("tile");
      // We initialize the text of the tile as an empty string
      tile.innerText = "";
      // We add the child to the board element in wordle.html
      document.getElementById("board").appendChild(tile);
    }
  }

  // Now we generate the keyboard
  let keyboard = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
  ];
  // We iterate through the three rows
  for (let i = 0; i < keyboard.length; i++) {
    // Initialize the current row variable
    let currRow = keyboard[i];
    // Create a new element for each row
    let keyboardRow = document.createElement("div");
    // Assign the corresponding class to each of the rows
    // if the row is the one in the middle (because it is narrower)
    if (i == 1) {
      keyboardRow.classList.add("keyboard-row-middle");
    }
    // if the row is either of the other two
    else {
      keyboardRow.classList.add("keyboard-row-topbottom");
    }
    // Iterate through all the letters in the row
    for (let j = 0; j < currRow.length; j++) {
      // Initialize the current key
      let key = currRow[j];
      // Create a new element for each key
      let keyTile = document.createElement("div");
      // write the corresponding letter/word/symbol in each key
      keyTile.innerText = key;
      // Assign the corresponding id and class to each key
      // if it is the enter key
      if (key == "Enter") {
        keyTile.id = "Enter";
        keyTile.classList.add("enter-key-tile");
      }
      // else if it is the backspace key
      else if (key == "⌫") {
        keyTile.id = "Backspace";
        keyTile.classList.add("key-tile");
      }
      // else if it is any of the letters
      else if ("A" <= key && key <= "Z") {
        keyTile.id = "Key" + key;
        keyTile.classList.add("key-tile");
      }
      // Add event listener to call the function processKey whenever a key is pressed
      keyTile.addEventListener("click", processKey);
      // Add the key to the keyboard row
      keyboardRow.appendChild(keyTile);
    }
    // Add the row to the html document
    document.getElementById("keyboard").appendChild(keyboardRow);
  }

  // After initializing the gameboard and keyboard, we start to listen also for key presses on the physical keyboard
  document.addEventListener("keyup", (e) => {
    // call the process input function
    processInput(e);
  });
}

function processKey() {
  // This function is for processing key presses in the displayed keyboard
  // create an event
  let e = { code: this.id };
  // call the process input function with this event
  processInput(e);
}

function processInput(e) {
  // The process input function is for the program to be able to process the letters comming from both the physical and the displayed keyboards
  if (gameOver) return;
  // If the key is a letter of the alphabet (to avoid symbols, etc.)
  if ("KeyA" <= e.code && e.code <= "KeyZ") {
    // If the word is not yet full
    if (col < width) {
      // get current tile
      let currTile = document.getElementById(
        row.toString() + "-" + col.toString()
      );
      // If the current tile is empty
      if (currTile.innerText == "") {
        // Add the inputed letter to the tile
        currTile.innerText = e.code[3];
        // pass to the next column
        col += 1;
      }
    }
  }
  // Else if the player wants to erase
  else if (e.code == "Backspace") {
    // if the current position is not the first
    if (0 < col && col <= width) {
      // decrease one column (go to the previously inputed letter)
      col -= 1;
    }
    // get current tile
    let currTile = document.getElementById(
      row.toString() + "-" + col.toString()
    );
    // erase the letter from the tile
    currTile.innerText = "";
  }
  // Else if the player hits enter and the word is complete
  else if (e.code == "Enter" && col == width) {
    // Get the attempted word
    let wordAttempt = "";
    for (let col = 0; col < width; col++) {
      // Get the corresponding element by position
      let currTile = document.getElementById(
        row.toString() + "-" + col.toString()
      );
      // store letter inputed
      let letter = currTile.innerText;
      wordAttempt += letter;
    }
    if (wordAttempt == word) {
      // fix issue of correct word not found in dictionary API...
      checkWord();
    } else {
      // Check if the word exists through API
      checkIfWordExistsAPI(wordAttempt);
    }
    // If there are no attempts left
    if (!gameOver && row == height - 1) {
      // game is over
      gameOver = true;
      // redirect
      window.location.replace(`/you_lost/${word}`);
    }
  }
}

// Function for checking if the word exists through API
async function checkIfWordExistsAPI(wordAttempt) {
  // Get the response from the API with the attempted word
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${wordAttempt}`
  );
  const data = await response.json();
  // If the word does not exists, the API returns a JSON with the following title
  if (data.title == "No Definitions Found") {
    // display alert
    alert("Sorry, invalid word!");
  }
  // If the word does exist, the API returns a definition (no alert shown)
  else {
    // call check word function
    checkWord();
    // move to the next row
    row += 1;
    // restart column index
    col = 0;
  }
}

function checkWord() {
  // we initialize a correct counter to check if the word was found
  let correct = 0;
  // track the number of times the letter appears in the word (example: APPLE -> {A:1, P:2, L:1, E:1})
  let letterCount = {};
  // Iterate for every letter in the word to generate map
  for (let i = 0; i < word.length; i++) {
    // Define the letter
    letter = word[i];
    // If the letter is already in the map
    if (letterCount[letter]) {
      // Increase the count by 1
      letterCount[letter] += 1;
    }
    // If the letter is not yet in the map
    else {
      // Add letter to the map (count = 1;)
      letterCount[letter] = 1;
    }
  }
  // First iteration: We check all the correct ones
  // for each of the columns (letters in the word)
  for (let col = 0; col < width; col++) {
    // Get the corresponding element by position
    let currTile = document.getElementById(
      row.toString() + "-" + col.toString()
    );
    // store letter inputed
    let letter = currTile.innerText;

    // If the letter is in the correct position
    if (word[col] == letter) {
      // add the current tile to the correct class (green)
      currTile.classList.add("correct");
      // Get the corresponding key from the keyboard
      let keyTile = document.getElementById("Key" + letter);
      if (keyTile.classList.contains("present")) {
        // Remove in case it already has the present class
        keyTile.classList.remove("present");
        // add the corresponding key to the same class
        keyTile.classList.add("correct");
      } else if (!keyTile.classList.contains("correct")) {
        // add the corresponding key to the same class
        keyTile.classList.add("correct");
      }
      // increase correct letter count by one
      correct += 1;
      // Update map letter count
      letterCount[letter] -= 1;
    }

    // If all the letters are correct -> Game Over
    if (correct == width) {
      // game is over
      gameOver = true;
      // redirect
      window.location.replace("/you_won");
    }
  }
  // Second iteration: mark which are present but in the wrong position
  // for each of the columns (letters in the word)
  for (let col = 0; col < width; col++) {
    // Get the corresponding element by position
    let currTile = document.getElementById(
      row.toString() + "-" + col.toString()
    );
    // store letter inputed
    let letter = currTile.innerText;
    // For the letters that are not correct
    if (!currTile.classList.contains("correct")) {
      // if the letter is at least present in the word
      if (word.includes(letter) && letterCount[letter] > 0) {
        // add the current tile to the present class (yellow)
        currTile.classList.add("present");
        // Get the corresponding key from the keyboard
        let keyTile = document.getElementById("Key" + letter);
        // add the corresponding key to the same class
        if (!keyTile.classList.contains("correct")) {
          keyTile.classList.add("present");
        }
        // Update map letter count
        letterCount[letter] -= 1;
      }
      // If the letter is not in the word
      else {
        // add the current tile to the absent class (grey)
        currTile.classList.add("absent");
        // Get the corresponding key from the keyboard
        let keyTile = document.getElementById("Key" + letter);
        if (
          !keyTile.classList.contains("correct") &&
          !keyTile.classList.contains("present")
        ) {
          // add the corresponding key to the same class
          keyTile.classList.add("absent");
        }
      }
    }
  }
}
