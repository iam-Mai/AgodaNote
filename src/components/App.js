// Developed by Sasithorn Hannarong
// Home Test for Graduate BE Engineer

import React, { Component } from 'react';
import firebase from '../firebase';

import _ from 'lodash';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import renderHtml from 'react-render-html';
import { Button } from 'reactstrap';

//Ref: https://css-tricks.com/intro-firebase-react/

const InputStyle = {
			marginTop: '10px',
			maxHeight:'75px',
			minHeight:'30px',
			maxWidth :'900px',
			minWidth :'650px',
			  resize:'none',
			  padding:'9px',
			  boxSizing:'border-box',
			  fontSize:'15px'
};

const headline = {
	textAlign: 'center',
	fontWeight: 'bold',
	marginTop: 20,
};

class App extends Component {
    constructor(props) {
	  super(props);
	  //state
	  this.state = {
		  title: '',
		  body: '',
		  isInEditMode: false,
		  isCancle: false,
		  key: '',
		  notes: {},
		  buttonName: 'Post'
	  };
	  this.noteId = props.noteId; 
		
	  //bind functions to constructor
	  this.handleChange = this.handleChange.bind(this)
	  this.handleSubmit = this.handleSubmit.bind(this)
	  this.renderNotes = this.renderNotes.bind(this)
	  this.cancleButton = this.cancleButton.bind(this)
	}
		
	//Use lifecycle to get notes
	componentDidMount() {
		console.log("componentDidMount");
		const itemsRef = firebase.database().ref('notes');
		itemsRef.on('value', snapshot => {
			let items = snapshot.val();
			let newState = [];
    		for (let item in items) {
      			newState.push({
				id: item,
				title: items[item].title,
				body:items[item].body,
        		notes: items[item].notes
				});
    		}
			//Save the state
			this.setState({notes: newState});
		});
	}
	
	removeItem(itemId) {
  		const itemRef = firebase.database().ref(`/notes/${itemId}`);
  		itemRef.remove();
	}
	
	handleChange(e) {
		this.setState({
			body : e
		});
	}

	handleSubmit(e) {
		//If isInEditMode = false then do the regular submit by creat a new note
		if (!this.state.isInEditMode)
		{	//Disable the reload default first
			e.preventDefault();

			//Create path to firebase
			const itemsRef = firebase.database().ref('notes');

			//Create Note object
			const note = {
				title: this.state.title,
				body: this.state.body
			}
			itemsRef.push(note);

			this.setState({
					title: '',
					body: ''
			});
		} else {
		//If isInEditMode = true then we won't create a new node, instead we just update the exist note

			var itemId = this.state.key
			const itemsRef = firebase.database().ref(`/notes/${itemId}`);
			
			//if !cancle mean the user didn't click on cancle bt so we update the note to the new edited one
			if (!this.state.isCancle) {
				e.preventDefault();
				console.log("Update!");
				//Create Note object and save to the database
				const note = {
					title: this.state.title,
					body: this.state.body
				}
				itemsRef.set(note);
			}
			
			this.setState({
				title: '',
				body: '',
				isInEditMode: false,
				buttonName: 'Post',
				isCancle: false
			});
			this.componentDidMount();
		}
	}
	
	renderNotesEditView(e) {
		const note = {
			title: this.state.title,
			body: this.state.body
		}
	}
	
	goToEdit (note) {
		this.setState({
			title : note.title,
			body : note.body,
			isInEditMode: !this.state.isInEditMode,
			notes: note.notes,
			key: note.id,
			buttonName: 'Edit'
		});
	}
		
	changeCancle() {
		this.state.isCancle = true
		this.handleSubmit()
	}
	//onClick={() => this.changeCancle()}
	cancleButton() {
		if(this.state.isInEditMode) {	
		return (
			 <div className = "container-fluid">
				<div className = "row">
					<div className = "from-group">
					<Button className = "btn btn-primary col-sm-12" color="danger" onClick={() => this.changeCancle()}>Cancle</Button>{' '}
				  	</div>
				</div>
			 </div>
			)	
		}	
	}
	
	
	renderNotesDefaultView() {
		return _.map(this.state.notes, (note, key) => {
			return (
			<div key={note.id} style={{marginTop: 150}}>
				<h2 style={{fontWeight: 'bold'}}>{note.title}</h2>
				<div>{renderHtml(note.body)}</div>
				<div className="text-right" style={{padding:'15px'}}>
					<Button color="info" onClick = {() => this.goToEdit(note)}>Edit</Button>{''}
					&nbsp;&nbsp;&nbsp;&nbsp;
					<Button color="danger"  onClick={() => this.removeItem(note.id)}>Delete</Button>{' '}
				</div>
			</div>
			)
		});		
	}
	
	renderNotes() {
		return this.state.isInEditMode ? this.renderNotesEditView() : this.renderNotesDefaultView()
	}
 
  render() {
	 //return this.state.isInEditMode ? this.renderEditView() : this.renderDefaultView()
	  return (
      <div className = "container-fluid">
		<div className = "row">
		  <div className = "col-sm-6 col-sm-offset-3">
				<form onSubmit = {this.handleSubmit}>
					<h1 style = {headline}>Agoda Takehometest Grad BE</h1>
					<div className = "from-group">
						<input 
							onChange = {(e) => {this.setState({title: e.target.value})}}
							style = {InputStyle}
							value = {this.state.title}
							type = "text" name = "title" 
							className = "from-control no-border" 
							placeholder = "Note Title..." required/>
					</div>
					<div className = "from-group">
						<ReactQuill 
							style={{height: 300, width: 650, marginTop: '10px'}}
							modules = {App.modules}
							formats={this.formats}
							onChange = {this.handleChange}
							value = {this.state.body}
							placeholder = "Edit your note here..." required/>
					</div>
					<div className = "from-group">
						<button className = "btn btn-primary col-sm-12" style={{marginTop: 80, marginBottom: 20 }}>{this.state.buttonName}</button>
						{this.cancleButton()}
					</div>
				</form>
				{this.renderNotes()}
			</div>
		</div>
      </div>
    );	
  }
}

App.modules = {
	toolbar: [
		[{'header' : '1'}, {'header' : '2'}, {'font' : []}],
		[{size:[]}],
		['bold', 'italic', 'underline', 'strike', 'blockquote'],
		[{'list': 'ordered'}, {'list' : 'bullet'}],
		['link', 'image', 'video'],
		['clean'],
		['code-block']
	]
}

export default App;
