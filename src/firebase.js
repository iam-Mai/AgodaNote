import * as firebase from 'firebase'
  // Initialize Firebase as my data base
  var config = {
    apiKey: "AIzaSyBCXb3cHEGAVTStjT5R4-j2xK_Kt7T_kk8",
    authDomain: "agodanote.firebaseapp.com",
    databaseURL: "https://agodanote.firebaseio.com",
    projectId: "agodanote",
    storageBucket: "",
    messagingSenderId: "266478308458"
  };

firebase.initializeApp(config);
export default firebase;