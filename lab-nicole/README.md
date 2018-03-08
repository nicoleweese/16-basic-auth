## CF Gram

This application models a user login in to a system. 

### POST /api/signup

The user is able to sign up, which is handled by a POST request to the server. When the user signs up, a new user object is created. The user MUST supply a username, password, and email in order to be entered into the database, otherwise a __401__ error is received. 

Once the user has input all the required information, the app uses bcrypt to encrypt the password and then attach it to the user object so the actual password input is never stored in the database. 

Once the user has been created, saved to the database, and assigned a token, the POST route will respond with a __200__ status and the token that was created.

### GET /api/signin

The user is able to sign in, which is handled by a GET request to the server. When the user signs in, the app searches the database for the username provided. If the username is not found in the database, the server will respond with a __401__ status code. 

Once the username is found, bcrypt is used to compare the password hash and the hash assigned to the user object and validate if the password is correct. If the password is not correct, the server will respond with a __401__ status code.

### POST /api/playlist

The user is able to create a playlist, which is handled by a POST request to the server. The request must contain a title, genre, and description. A userID will be assigned to it based on the userID of the logged in user. If no token is provided, the server will respond with a __401__. If no body is provided or the body of the request is invalid, a the server will send a __400__ status code. Once the playlist is successfully created, the server will send a __200__ status code.

### GET /api/playlist/:playlistId

The user is able to retreive a playlist, which is handled by a GET request to the server. The request must contain a valid playlist id, otherwise the server will respond with a __404__, or not found. If no token is provided, the server will respond with a __401__ status code. Once the playlist is retreived, the server will respond with a __200__ status code.

### PUT /api/playlist/:playlistId

The user is able to update a playlist, which is handled by a PUT request to the server. The request must contain a title, genre, and description. If the request is incomplete, the server will respond with a __400__. If no token is provided, the server will respond with a __401__. If the playlist ID does not correspond to an existing playlist, the server will respond with a __404__. Once the playlist has been updated, the server will respond with a __200__ and the updated playlist object.
 
### DELETE /api/playlist/:playlistId

The user is able to delete a playlist, which is handled by a DELETE request to the server. Once the server has successfully deletd the file, it will respond with a __204__.

### PUT /api/playlist/:playlistId/mp3

The user is able to use this route to upload a song to Amazon's s3 service. When sending the request, the user must provide a song title and artist, and the app will assign the UserID of the current user and the playlistID that was provided in the route. The app will then add a time stamp, and then upload the mp3 file to the Amazon bucket, and return data such as the song URI which is then added to the mp3 object on the songURI property. If the upload is successful, the server will send the object back to the user as a response and a __204__ status code.