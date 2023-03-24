"""
FLASK Server for Wordle Clone Application
Carlos Piqueras - MCSBT
"""

# Import the required libraries
from flask import Flask, render_template, request, session, redirect, url_for, abort
from sqlalchemy import create_engine
from werkzeug.security import generate_password_hash, check_password_hash

# Create FLASK application
wordle = Flask(__name__)
wordle.config["SECRET_KEY"] = "wordle4life"

# Database info (not displayed for security purposes...)
user = ""
passw = ""
host = ""
database = ""

# Create engine for connecting to google cloud database
engine = create_engine(f"mysql+pymysql://{user}:{passw}@{host}/{database}")

# Index route - Introduction to the page
@wordle.route("/")
def index():
    # Render template
    return render_template("index.html")

# Registration route - For creating a new account
@wordle.route("/register")
def register():
    # Render template
    return render_template("register.html")

# Registration Handling route - For processing the inputted data on registration
@wordle.route("/register", methods=["POST"])
def handle_register():
    # Retrieve data from html form
    username = request.form["username"]
    password = request.form["password"]
    repeat_password = request.form["repeat_password"]

    # Query for checking if username already exists
    query = f"""
    SELECT username
    FROM users
    WHERE username='{username}';
    """

    # Connect to database
    with engine.connect() as connection:
        # Execute query - store result
        user_exists = connection.execute(query).fetchone()
        # If the query returned a username (user exists)
        if user_exists:
            # Render template that displays error in username
            return render_template("register_username_exists.html")

    # Check if both passwords match
    if password != repeat_password:
        # If not, render template that displays error in password
        return render_template("register_password_dont_match.html")

    # Hash password to store securely
    hashed_password = generate_password_hash(password)

    # Query for adding a new user
    insert_query = f"""
    INSERT INTO users(username, password)
    VALUES ("{username}", "{hashed_password}");
    """

    # Query for retrieving new user_id
    select_query = f"""
    SELECT user_id
    FROM users
    WHERE username='{username}';
    """

    # Connect to database
    with engine.connect() as connection:
        # Execute insert query
        connection.execute(insert_query)
        # Execute user info select query
        user = connection.execute(select_query).fetchone()
        # Store username and user id in session (Logged in)
        session["username"] = username
        session["user_id"] = user[0]
        # Redirect to the index route
        return redirect(url_for("index"))

# Login route - For logging in if you already have an account
@wordle.route("/login")
def login():
    # Render template
    return render_template("login.html")

# Login Handling route - For processing the inputted data on login
@wordle.route("/login", methods=["POST"])
def handle_login():
    # Retrieve data from html form
    username = request.form["username"]
    password = request.form["password"]

    # Query for retrieving user_id and password from username
    query = f"""
    SELECT user_id, password
    FROM users
    WHERE username='{username}';
    """

    # Connect to database
    with engine.connect() as connection:
        # Execute query
        user = connection.execute(query).fetchone()
        # If the user exists in the database (previously registered)
        if user:

            # Check if password is correct
            password_matches = check_password_hash(user[1], password)
            # If the password is correct

            if password_matches:
                # Store username and user id in session (Logged in)
                session["username"] = username
                session["user_id"] = user[0]
                # Redirect to the index route
                return redirect(url_for("index"))
            
        # Render template that displays login error
        return render_template("login_failed.html")

# Logout route - For logging out and closing the session
@wordle.route("/logout")
def logout():
    # Remove username and user_id data from the session
    session.pop("username")
    session.pop("user_id")
    # Redirect to the index route
    return redirect(url_for("index"))

# Rules route - For displaying the rules of Wordle
@wordle.route("/rules")
def rules():
    # Render template
    return render_template("rules.html")

# Profile route - For displaying profile information when logged in
@wordle.route("/profile")
def profile():
    # Check if the user is logged in
    if "username" not in session:
        abort(404, description="PROFILE NOT FOUND")
    # Query for retrieving the historical data of the user (wins & losses)
    record_query = f"""
    SELECT wins, losses
    FROM users
    WHERE user_id = '{session["user_id"]}';
    """

    # Connect to database
    with engine.connect() as connection:
        # Execute query
        record = connection.execute(record_query).fetchone()
        # Render template
        return render_template(
            "profile.html",
            record=record)

# Game route - For playing the Wordle game
@wordle.route("/wordle")
def play_wordle():
    # Render template (includes JavaScript for the game)
    return render_template("wordle.html")

# Win route - For displaying winning message and updating record if logged in
@wordle.route("/you_won")
def game_won():
    # If the user is logged in
    if "username" in session:
        # Query for increasing (+1) the number of wins
        query = f"""
        UPDATE users
        SET wins = wins+1
        WHERE user_id = '{session["user_id"]}';
        """
        # Connect to database
        with engine.connect() as connection:
            # Execute query
            connection.execute(query)

    # Render template
    return render_template("you_won.html")

# Lose route - For displaying correct word and updating record if logged in
@wordle.route("/you_lost/<word>")
def game_lost(word):
    # If the username is logged in
    if "username" in session:
        # Query for increasing (+1) the number of losses
        query = f"""
        UPDATE users
        SET losses = losses+1
        WHERE user_id = '{session["user_id"]}';
        """
        # Connect to database
        with engine.connect() as connection:
            # Execute query
            connection.execute(query)

    # Render template
    return render_template("you_lost.html", word=word)

# 404 error handler - For error 404 NOT FOUND
@wordle.errorhandler(404)
def page_not_found(e):
    # Render template
    return render_template('404.html'), 404

# For running the application
if __name__ == '__main__':
    wordle.run(host = '0.0.0.0', port=8080, debug=True)