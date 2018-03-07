## CF Gram

This application models a user login in to a system. 

### POST Request

The user is able to sign up, which is handled by a POST request to the server. When the user signs up, a new user object is created. The user MUST supply a username, password, and email in order to be entered into the database, otherwise a __401__ error is received. 

Once the user has input all the required information, the app uses bcrypt to encrypt the password and then attach it to the user object so the actual password input is never stored in the database. 

Once the user has been created, saved to the database, and assigned a token, the POST route will respond with a __200__ status and the token that was created.

### GET Request

The user is able to sign in, which is handled by a GET request to the server. When the user signs in, the app searches the database for the username provided. If the username is not found in the database, the server will respond with a __401__ status code. 

Once the username is found, bcrypt is used to compare the password hash and the hash assigned to the user object and validate if the password is correct. If the password is not correct, the server will respond with a __401__ status code.