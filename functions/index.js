// Developed by Sasithorn Hannarong
// Home Test for Graduate BE Engineer
// https://firebase.google.com/docs/functions/write-firebase-functions
// Ref: https://firebase.google.com/docs/reference/node/

const functions = require("firebase-functions");
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
admin.initializeApp();
const database = admin.database().ref('/notes');

const getItemsFromDatabase = (response) => {
	//This will return the list of data after it has successfully saved
	let notes = [];
	return database.on('value', (snapshot) => {
	  snapshot.forEach((note) => {
		notes.push({
		  id: note.key,
		  title: note.val().title,
		  notes: note.val().body
		});
	  });
	  response.status(200).json(notes)
	}, (error) => {
	  response.status(error.code).json({
		message: 'Something went wrong. Please do not pass ant key/variable with the GET request ${error.message}'	  
	  })
	})	
};

const getItemsFromDatabaseByID = (itemId, response) => {
    const ref = admin.database().ref(`/notes/${itemId}`);
    ref.on('value', (snapshot) => {
	    let items = snapshot.val();
		if (items != null) {
			response.send(items);
		} else {
			response.send("This id is invalid. Please use the id that exist in the database");
		}
	}, (error) => {
    	response.status(error.code).json({
		message: 'Something went wrong. ${error.message}'	  
		})
	})	
};

const putItemsToDatabase = (itemId, request,response) => {
    const ref = admin.database().ref(`/notes/${itemId}`);
	//Create Note object
	
    const note = {
		title: request.param('title'),
		body:  request.param('body')
	}
	ref.set(note);
	response.status(200).json({ message:"PUT Process is complete! please call GET?id=" + itemId + " to see the new note"});
};

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from a Mai Database! This project is developed for Agoda interview take-home test");
});

exports.api = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
	//a. POST /api/notes in order to create a note
	if(request.method == 'POST') {
		
		//Create Note object
		const note = {
				title: request.body.title,
				body:  request.body.body
		}
		database.push(note);
		
		return database.on('value', (snapshot) => {
		  response.status(200).json({ message: "POST request is complete"});
		}, (error) => {
		  response.status(error.code).json({
			message: 'Something went wrong. ${error.message}'	  
		  })
		})
		
	} else if (request.method == 'GET') {
		if (request.param('id') != null) {
			var id = request.param('id');
			//c. GET /api/notes/{id} in order to get one note by {id}
			getItemsFromDatabaseByID (id, response);
		} else {
			//b. GET /api/notes in order to get all notes
			getItemsFromDatabase(response);
		}
	}  else if (request.method == 'PUT') {
		//d.PUT /api/notes/{id} in order to update one note by {id}
		if (request.param('id') != null) {
			var id = request.param('id');
			putItemsToDatabase(id, request, response);
		}
	} else {
		//Handle other request type
      	return response.status(401).json({
        	message: 'Other types of request are not allowed'
      	})
    }
  })
})
	
