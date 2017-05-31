$( window ).on( "load", function() {
	
	// Initialize Firebase
  var config = {
    apiKey: "AIzaSyCLeU7v5DxQiOBqXDKM28D3UZZsXCVqYJY",
    authDomain: "fir-sample-chat-94755.firebaseapp.com",
    databaseURL: "https://fir-sample-chat-94755.firebaseio.com",
    projectId: "fir-sample-chat-94755",
    storageBucket: "fir-sample-chat-94755.appspot.com",
    messagingSenderId: "938343873148"
  };
  firebase.initializeApp(config);

	// var myFirebase = new Firebase('https://fir-sample-chat-94755.firebaseio.com/');
	var usernameInput = $('#username');
	var othernameInput = $('#othername');
  var textInput = $('#chat_text');
  var postButton = $('#post_button');

  postButton.click( function() {
    var fromUser = usernameInput.text().trim();
    var toUser = othernameInput.text().trim();
    var msgText = textInput.val().trim();
    firebase.database().ref().set(fromUser + " tells " + toUser + ": " + msgText);
    textInput.value = "";
  });

})
