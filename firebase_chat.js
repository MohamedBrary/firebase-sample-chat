// Global variables TODO: use namespace
var developerImg = 'https://scontent-cai1-1.xx.fbcdn.net/v/t1.0-1/c22.0.48.48/p48x48/13615419_10153592621422793_8368169177989329233_n.jpg?oh=f5ef37717a144053fcdf7e6fbd42ff02&oe=59E439CE';
var designerImg = 'https://lh6.googleusercontent.com/-y-MY2satK-E/AAAAAAAAAAI/AAAAAAAAAJU/ER_hFddBheQ/photo.jpg';
var usernameLabel;
var othernameLabel;
var textInput;
var postButton;
var switchUsersBtns;
var uploadFileAnchor;
var uploadFileInput;
var currentRenderFunction;
var otherRenderFunction;
var messagesPerConversation;
var conversationTimestamp;
var newMessage;

// Firebase Global variables TODO: use namespace
var messagesDbRef;
var messagesAttachmentsDbRef;
var messagesAttachmentsRef;

$( window ).on( "load", function() {
  // Initialize Firebase
  initFirebase();

  // Initialize our chat app
  initChatApp();
});

/** Function to init Firebase **/
initFirebase = function() {
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

  // Get conversations data
  initConversationData();

  // Begin listening for data
  startListening();
}

/** Function to retrieve conversations data **/
initConversationData = function() {
  messagesDbRef.once("value").then(function(snapshot) {    
    messagesPerConversation = snapshot.numChildren();
    updateConversationMessageCount();
    conversationTimestamp = snapshot.val()[Object.keys(snapshot.val())[messagesPerConversation-1]].timestamp
    updateConversationTimestamp();
    
    renderConversation();
  });
}

/** Function to add a data listener **/
startListening = function() {
  messagesDbRef.on('child_added', function(snapshot) {
    var chatItem = snapshot.val();
    
    if ( chatItem.from == 'Designer' )
      renderDesignerMsg(chatItem.msg, chatItem.timestamp)
    else
      renderDeveloperMsg(chatItem.msg, chatItem.timestamp)

    if(newMessage){
      messagesPerConversation++;
      updateConversationMessageCount();
      conversationTimestamp = chatItem.timestamp;
      updateConversationTimestamp();
    }
  });

  messagesAttachmentsDbRef.on('child_added', function(snapshot) {
    var chatAttachmentItem = snapshot.val();
    
    if ( chatAttachmentItem.from == 'Designer' )
      renderDesignerAttachmentMsg(chatAttachmentItem.fileName, chatAttachmentItem.fileUrl, chatAttachmentItem.timestamp);
    else
      renderDeveloperAttachmentMsg(chatAttachmentItem.fileName, chatAttachmentItem.fileUrl, chatAttachmentItem.timestamp);

  });
}

pushMessage = function(msgText) {
  if ( !msgText || msgText == '' )
    return;
  var fromUser = usernameLabel.text().trim();
  var toUser = othernameLabel.text().trim();
  var timestamp = new Date().toString();
  var timestampFormatted = timestamp.substring(0, timestamp.lastIndexOf(":"))

  messagesDbRef.push({
    from: fromUser,
    to: toUser,
    msg: msgText,
    timestamp: timestampFormatted
  });

  textInput.val('');
}

pushAttachmentMessage = function(fileName, fileUrl) {
  
  var fromUser = usernameLabel.text().trim();
  var toUser = othernameLabel.text().trim();
  var timestamp = new Date().toString();
  var timestampFormatted = timestamp.substring(0, timestamp.lastIndexOf(":"))

  messagesAttachmentsDbRef.push({
    from: fromUser,
    to: toUser,
    fileName: fileName,
    fileUrl: fileUrl,
    timestamp: timestampFormatted
  });
}

uploadFile = function() {
  // File or Blob named mountains.jpg
  var file = uploadFileInput[0].files[0];
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

    // A full list of error codes is available at
    // https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
      case 'storage/unauthorized':
        // User doesn't have permission to access the object
        console.log("Uploading: User doesn't have permission to access the object");
        break;

      case 'storage/canceled':
        // User canceled the upload
        console.log("Uploading: User canceled the upload");
        break;

      case 'storage/unknown':
        // Unknown error occurred, inspect error.serverResponse
        console.log("Uploading: Unknown error occurred, inspect error.serverResponse");
        break;
    }
  }, function() {
    console.log("Uploading: completed successfully");
    
    var downloadURL = uploadTask.snapshot.downloadURL;
    var attachmentText = `
      I uploaded a file named <a href='${downloadURL}' target='_blank'>${fileName}</a>
    `;
    pushMessage(attachmentText);
    pushAttachmentMessage(fileName, downloadURL);
  });
}

initChatApp = function() {
  usernameLabel = $('#username');
  othernameLabel = $('#othername');
  textInput = $('#chat_text');
  postButton = $('#post_button');
  switchUsersBtns = $('.dev-switch-button');
  uploadFileAnchor = $('#file_anchor');
  uploadFileInput = $('#file_input');
  newMessage = false;

  currentRenderFunction = renderDeveloperMsg;
  otherRenderFunction = renderDesignerMsg;

  postButton.click(pushChatMessage);

  switchUsersBtns.click(toggleUser);

  uploadFileAnchor.click(openFileDialog);

  uploadFileInput.change(uploadFile);
}

pushChatMessage = function(e) {
  e.preventDefault();
  newMessage = true;

  pushMessage(textInput.val().trim());  
}

toggleUser = function() {
  // Switch usernames  
  var tmp = usernameLabel.text().trim();
  usernameLabel.text(othernameLabel.text().trim());
  othernameLabel.text(tmp);

  // Update conversation info
  $('#conversation_name').text(tmp);
  $("#conversation_img").attr('src', tmp == 'Designer' ? designerImg : developerImg);

  // Switch buttons status  
  $('.dev-switch-button').each(function( index ) {
    if ( $(this).hasClass('disabled') )
      $(this).removeClass('disabled');
    else
      $(this).addClass('disabled');
  });
  
  // Switch message template also
  var tmp = currentRenderFunction;
  currentRenderFunction = otherRenderFunction;
  otherRenderFunction = tmp;
}

updateConversationMessageCount = function(){
  $("#conversations_msgs_count").html(messagesPerConversation);
}

updateConversationTimestamp = function(){
  $("#conversation_timestamp").html(conversationTimestamp);
}

openFileDialog = function(e){
  e.preventDefault();
  uploadFileInput.click();
}

renderDesignerMsg = function(text, timestamp){
  renderMsg('', designerImg, text, timestamp);
}

renderDeveloperMsg = function(text, timestamp){
  renderMsg('other-msg admin_chat', developerImg, text, timestamp);  
}

function renderMsg(className, imgSrc, text, timestamp){
  imgClass = className != '' ? 'right' : 'left';
  timeClass = className == '' ? 'left' : 'right';
  chatItemHtml = `
    <li class="${className} left clearfix">
      <span class="chat-img1 pull-${imgClass}">
        <img alt="User Avatar" class="img-circle" src="${imgSrc}"/>
      </span>
      <div class="chat-body1 clearfix">
        <p>${text}</p>
        <div class="text-muted small chat_time pull-${timeClass}">
          ${timestamp}
        </div>
      </div>
    </li>
  `;

  $("#chat_items_list").append(chatItemHtml);
  $(".chat_area").animate({ scrollTop: $('.chat_area').prop("scrollHeight")}, 300);
}

renderDesignerAttachmentMsg = function(fileName, fileUrl, timestamp){
  renderAttachment(designerImg, fileName, fileUrl, timestamp);
}

renderDeveloperAttachmentMsg = function(fileName, fileUrl, timestamp){
  renderAttachment(developerImg, fileName, fileUrl, timestamp);
}

function renderAttachment(imgSrc, fileName, fileUrl, timestamp){
  attachmentItemHtml = `
    <li class="left clearfix" onclick="window.open('${fileUrl}','mywindow');">
      <span class="chat-img pull-left">
        <img alt="User Avatar" class="img-circle" src="${imgSrc}"/>
      </span>
      <div class="chat-body clearfix">
        <div class="header_sec">
          <strong class="primary-font">
            ${fileName}
          </strong>
        </div>
        <div class="contact_sec">
          ${timestamp}
        </div>
      </div>
    </li>    
  `;

  $("#attachment_items_list").append(attachmentItemHtml);
  $("#attachment_area").animate({ scrollTop: $('#attachment_area').prop("scrollHeight")}, 300);
}

function renderConversation(){
  conversationItemHtml = `
    <li class="left clearfix">
      <span class="chat-img pull-left">
        <img alt="User Avatar" id="conversation_img" class="img-circle" src="${designerImg}"/>
      </span>
      <div class="chat-body clearfix">
        <div class="header_sec">
          <strong id='conversation_name' class="primary-font">
            Designer
          </strong>          
        </div>
        <div class="contact_sec">
          <span id="conversation_timestamp"  class="small text-muted">
            ${conversationTimestamp}
          </span>
          <span id="conversations_msgs_count" class="badge pull-right">
            ${messagesPerConversation}
          </span>
        </div>
      </div>
    </li>
  `;

  $("#conversation_list").append(conversationItemHtml);
  $("#conversation_container").animate({ scrollTop: $('#conversation_container').prop("scrollHeight")}, 300);
}