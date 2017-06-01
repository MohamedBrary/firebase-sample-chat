var firebaseWrapper = (function() {
  var publicScope = {};

  // Firebase Global variables
  var messagesDbRef;
  var messagesAttachmentsDbRef;
  var messagesAttachmentsRef;

  /** Function to init Firebase **/
  publicScope.initFirebase = function() {
    var config = {
      apiKey: "AIzaSyCLeU7v5DxQiOBqXDKM28D3UZZsXCVqYJY",
      authDomain: "fir-sample-chat-94755.firebaseapp.com",
      databaseURL: "https://fir-sample-chat-94755.firebaseio.com",
      projectId: "fir-sample-chat-94755",
      storageBucket: "fir-sample-chat-94755.appspot.com",
      messagingSenderId: "938343873148"
    };

    firebase.initializeApp(config);

    // Setting the global database and storage references  
    messagesDbRef = firebase.database().ref('messages');
    messagesAttachmentsDbRef = firebase.database().ref('attachments');
    messagesAttachmentsRef = firebase.storage().ref('attachments/');    
  }

  /** Function to retrieve conversations data **/
  publicScope.initConversationData = function(callback) {
    messagesDbRef.once("value").then(function(snapshot) {    
      messagesPerConversation = snapshot.numChildren();
      conversationTimestamp = snapshot.val()[Object.keys(snapshot.val())[messagesPerConversation-1]].timestamp      
      
      callback(messagesPerConversation, conversationTimestamp);
    });
  }

  /** Function to add a data listener **/
  publicScope.startListeningToChatMessages = function(callback) {
    messagesDbRef.on('child_added', function(snapshot) {
      var chatItem = snapshot.val();
      callback(chatItem);      
    });
  }

  publicScope.startListeningToAttachments = function(callback) {
    messagesAttachmentsDbRef.on('child_added', function(snapshot) {
      var chatAttachmentItem = snapshot.val();
      callback(chatAttachmentItem);
    });
  }

  /** Function to push chat message **/  
  publicScope.pushChatItem = function(chatItem) {
    messagesDbRef.push(chatItem);
  }

  /** Function to push attachment message **/
  publicScope.pushAttachmentItem = function(attachmentItem) {
    messagesAttachmentsDbRef.push(attachmentItem);
  }
  
  /** Function to upload file to firebase storage **/
  publicScope.uploadFileToStorage = function(file, callback) {
    var fileName = file.name
    // TODO add id, so files with same name doesn't get overriden
    var filePath = usernameLabel.text().trim() + '/' + file.name;
    
    // Upload file and metadata to the object 
    var uploadTask = messagesAttachmentsRef.child(filePath).put(file);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      function(snapshot) {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Uploading: Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Uploading: Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Uploading: Upload is running');
            break;
        }
      }, function(error) {
      switch (error.code) {
        case 'storage/unauthorized':
          console.log("Uploading: User doesn't have permission to access the object");
          break;

        case 'storage/canceled':
          console.log("Uploading: User canceled the upload");
          break;

        case 'storage/unknown':
          console.log("Uploading: Unknown error occurred, inspect error.serverResponse");
          break;
      }
    }, function() {
      console.log("Uploading: completed successfully");

      var downloadURL = uploadTask.snapshot.downloadURL;      
      callback(fileName, downloadURL);
    });
  }
  
  //Return only the public parts
  return publicScope;
}());
