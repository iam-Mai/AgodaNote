// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
// Ref: https://itnext.io/working-with-firebase-functions-http-request-22fd1ab644d3
// Ref: https://blog.usejournal.com/build-a-serverless-full-stack-app-using-firebase-cloud-functions-81afe34a64fc

const functions = require("firebase-functions");
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');

admin.initializeApp();

const database = admin.database().ref('/notes');

const getItemsFromDatabase = (res) => {
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
	  res.status(200).json(notes)
	}, (error) => {
	  res.status(error.code).json({
		message: 'Something went wrong. Please do not pass ant key/variable with the GET request ${error.message}'	  
	  })
	})	
};

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from a Mai Database! Now implement get request");
});

exports.api = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
	//a. POST /api/notes in order to create a note
	if(req.method == 'POST') {
		//Create Note object
		const note = {
			title: req.body.title,
			body:  req.body.body
		}
		database.push(note);
		
		return database.on('value', (snapshot) => {
		  res.status(200).json({ message: "POST request is complete with status(200)"});
		}, (error) => {
		  res.status(error.code).json({
			message: 'Something went wrong. ${error.message}'	  
		  })
		})
		
	//b. GET /api/notes in order to get all notes
	} else if (req.method == 'GET') {
		getItemsFromDatabase(res);
	} else {
      	return res.status(401).json({
        	message: 'Other types of request are not allowed'
      	})
    }
  })
})
	
