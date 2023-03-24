# wordle-clone

## Contents

- Repo Intro
- Application Structure
- Technical Details
  - Python Flask Application
  - Javascript Game
- Possible Improvements for a 2.0 version
- Deployment Link

## Repo Intro

Wordle is a popular online word guessing game where players attempt to guess a five-letter word by submitting guesses and receiving feedback on whether each letter is correct, incorrect, or in the correct position. This addictive game has gained a massive following due to its simple yet engaging gameplay and its ability to test and improve players' vocabulary and problem-solving skills.

Ths Wordle Clone application is a clone of the original game created for academic purposes. Besides from the gaming features coded in JavaScript, the Python server provides authentication, with the capacity of creating an account and storing your history of gaming. The full aplication is deployed in Google Cloud App Engine, and the data is stored in an SQL database in GCP too. The styling of the application was mainly done with bootstrap, in addition to an extra CSS document for the gaming components.

## Application Structure

The application is structured in the following way:

- server.py: Flask server application; includes all the routing of the application and the main logic.
- templates: Includes all the html template files for the different paths of the application.
- static: All static components of the application
  - images: the images for the interface of the application
  - wordle.js: JavaScript code that includes the logic of the game
  - wordle.css: includes the styling for the correct display of the wordle game

## Technical Details - Python server

### Requirements
The following requirements must be installed on the user's machine in order to run the Flask application:

- Python
- Flask
- SQLAlchemy
- Pymysql
- Werkzeug

### Database connection
The database for storing the user information is an SQL server created in Google Cloud Platform.
In order to connect and run queries, the following steps must be followed:
1. Know the required credentials (user, password, host IP and database name)
2. Create the engine with sqlalchemy.create_engine("url_for_connecting")
3. Establish the connection executing engine.connect() as connection
4. Execute the query using connection.execute(query)

### Functionalities
#### 1. Registration
The application renders a template that displays a form for the user to create a new account by introducing a username and password. There are two checkpoints before succesfully creating the user: The username must not exist already in the database (this is checked through a SELECT query), and the password must be correctly introduced twice. If both requirements are met, an INSERT query is executed for adding the username and the hashed password to the database. After the registration process is completed, the user is redirected to the index page.

#### 2. Login
If the user already created an account, he/she can access through the login page by introducing the correct credentials. In this process of logging in, the username and password are collected from the html form, and compared with the content of the database in order to confirm the account. If the username or password are not correct, a login error is displayed; otherwise the user is added to the session and the login process is completed.

#### 3. Logout
If there is an active session, the user will have access to a logout button on the top right corner that allows to log out by closing the session.

#### 4. Rules
There is a page that renders the rules of the Wordle Game for new users that do not know how the game is played. It includes a simple description of the game and examples to illustrate cases.

#### 5. Profile
If a session is active (user is logged in), the user will have access to its personal profile. It includes, by querying the database, the history of wins and losses of the user in this Wordle game.

#### 6. Win/Loose Message
Once the game is over, the user is redirected to the corresponding win/loose message page. In the case there is an active session, this redirection triggers an UPDATE query to the database, that increases the historical wins/losses data of the user, to later be correctly displayed on its profile.

## Technical Details - Wordle Game JavaScript

### Game process description
1. The game initializes the board and digital keyboard first, and after starts to listen to inputs of both the physical and digital keyboards.
2. The target word is retrieved through a random five-letter word API in English.
3. When the user introduces a word and presses "Enter", the word is first checked through a dicctionary API, that confirms if the introduced word exists. If it does not exist, it prompts a message to change the word.
4. It compares the word with the target letter by letter, and changes the CSS class of each of the letters accordingly; Depending on if the letter is correct, present, or not present, the color is changes to give feedback to the user. This color change is also performed on the digital keyboard keys for better experience.
5. If the word is correct, it redirects the user to the corresponding page.
6. If the user ran out of attempts and the word has not been found, the game redirects the user to the corresponding page.

### Functions review

#### getWordAPI()
This is an async function that uses the fetch() method to retrieve a random word of 5 characters in length from a public API. If successful, the function returns the uppercase version of the word, and if there's an error, it logs the error message to the console.

#### initialize()
This is a function that generates the UI elements for the game. It creates the game board and a virtual keyboard:
- The game board is a 5x5 grid, and each cell is represented by an HTML element with a unique id, a class name, and an empty text value (at first).
- The virtual keyboard is a 3-row grid of keys, with each key represented by an HTML element with a specific id and class name. The function also adds an event listener to each key to call the processKey() function when clicked.
Lastly, the function adds an event listener to the document to listen for key presses on the physical keyboard, and calls the processInput() function whenever a key is pressed.

#### processKey()
This is a function that is triggered when a key on the virtual keyboard is clicked. It creates a new event object with the code property set to the ID of the clicked key. Then it calls another function called processInput() with this event object as a parameter, which is responsible for processing the user's input.

#### processInput()
This function is responsible for processing user input from both the physical and displayed keyboards. The function takes an event object, e, as its parameter. It follows the following process:
1. First, the function checks if the game is over. If so, it returns and does nothing.
2. Then, the function checks if the key pressed is a letter of the alphabet. If it is, and the word is not yet full (i.e., the player has not filled in all the letters in the current row), the function gets the current tile and checks if it is empty. If it is, the function adds the inputted letter to the tile and moves to the next column.
3. If the player presses the backspace key, the function checks if the current position is not the first (i.e., the player has inputted at least one letter). If it is not, the function moves one column back. Then, the function gets the current tile and erases the letter from it.
4. If the player presses the enter key and the word is complete (i.e., the player has filled in all the letters in the current row), the function gets the attempted word by concatenating the letters in each tile from left to right. If the word attempt matches the correct word, the function checks the word again (to fix issue of target word not existing in the dictionary API). If the word does not match, the function checks if the word exists in the dictionary API.
5. If there are no attempts left (i.e., the player has filled in all the rows), and the game is not over, the function sets the game over flag to true and redirects the user to a page that displays a message indicating that they have lost the game, along with the correct word.

#### checkIfWordExistsAPI()
This is a function for checking if a word exists using an external API. It uses the async and await keywords to handle the asynchronous call to the API. It first calls the fetch() function with the API endpoint URL and the wordAttempt parameter to get the response from the API. The function then checks if the returned data has a title of "No Definitions Found". If this is the case, it displays an alert indicating that the word is invalid. Otherwise, it calls the checkWord() function (to check if the word is correct within the game context), moves to the next row, and restarts the column index.

#### checkWord()
This function takes care of checking the inputted letters against the hidden word, and adding appropriate CSS classes to the corresponding HTML elements to indicate whether the letter is present, absent, or correct.
1. The function first initializes a correct variable to keep track of how many letters were correctly guessed, and a letterCount object to keep track of the number of times each letter appears in the hidden word. It then iterates over the hidden word to generate the letterCount object.
2. The function then has two main iterations, both of which iterate over each column in the current row of the game board. In the first iteration, it checks if the letter in the current column matches the corresponding letter in the hidden word. If it does, it adds the correct class to the HTML element, and updates the correct variable and letterCount object accordingly. It also updates the CSS classes for the corresponding letter key on the on-screen keyboard.
3. If all the letters are correctly guessed, the game is over, and the function redirects the player to a "you won" page.
4. In the second iteration, the function marks any letters that are present in the hidden word but in the wrong position with the present class, and any letters that are not present in the hidden word with the absent class. It updates the letterCount object and CSS classes for the letter keys accordingly.

## Possible Improvements for a 2.0 version
In a hypothetical 2.0 version of this application, many features could be implemented in order to improve the user experience and functionalities of the game as a whole.
- It would be interesting to add additional data of the playing history of users, like for example the words that have been guessed, the streak that the user has, statistics overtime, etc. All this information could be stored in another table on the database and be displayed in the user's profile, making it much more complete and interesting.
- The APIs could be chosen better, in terms that a bug had to be fixed because sometimes the random word API is way to complex, that it does not appear in dictionary API, making it impossible for the user to win. This does not happen anymore, but I still believe that the random word should be simpler and the dictionary API more complete.
- The previous point leads to the possibility of including different levels of difficulty from the random word API, or even retrieving words based on a specific theme, so the user already has a hint of what the word is about.
- An additional feature could be added to implement different language possibilities, offering the user to choose first in which language he/she wants to play the game.

## Deployment Link
http://wordle-381514.oa.r.appspot.com/
