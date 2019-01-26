// Create and Deploy Your First Cloud Functions
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
	ref.on('value', snapshot => {
		let items = snapshot.val();
		response.send(items);
	});	
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
		  response.status(200).json({ message: "POST request is complete with status(200)"});
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
	} else {
      	return res.status(401).json({
        	message: 'Other types of request are not allowed'
      	})
    }
  })
})
	
