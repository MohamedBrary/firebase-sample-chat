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

$( window ).on( "load", function() {
  $("#chat_column").LoadingOverlay("show");

  // Initialize Firebase
  firebaseWrapper.initFirebase();

  // Get conversations data
  firebaseWrapper.initConversationData(renderConversation);

  // Begin listening for data
  firebaseWrapper.startListeningToChatMessages(renderChatItem);
  firebaseWrapper.startListeningToAttachments(renderAttachmentItem);

  // Initialize our chat app
  initChatApp();

  $("#chat_column").LoadingOverlay("hide");  
});

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

  switchUsersBtns.click(toggleUser);

  postButton.click(postButtonHandler);

  uploadFileAnchor.click(openFileDialog);

  uploadFileInput.change(uploadFile);
}

// -- Event handlers

toggleUser = function() {
  $("#chat_column").LoadingOverlay("show");

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

  $("#chat_column").LoadingOverlay("hide");  
}

postButtonHandler = function(e) {
  e.preventDefault();
  
  var msgText = textInput.val().trim();
  if ( !msgText || msgText == '' )
    return;

  newMessage = true;
  pushChatMessage(msgText);
  textInput.val('');
}

openFileDialog = function(e){
  e.preventDefault();
  uploadFileInput.click();
}

// -- Methods Calling firebaseWrapper

uploadFile = function(){
  $("#chat_column").LoadingOverlay("show");  
  var file = uploadFileInput[0].files[0];
  firebaseWrapper.uploadFileToStorage(file, function(fileName, downloadURL){
    var attachmentText = `
      I uploaded a file named <a href='${downloadURL}' target='_blank'>${fileName}</a>
    `;
    pushChatMessage(attachmentText);
    pushAttachmentMessage(fileName, downloadURL);
    $("#chat_column").LoadingOverlay("hide");
  });
}

pushChatMessage = function(msgText) {
  var fromUser = usernameLabel.text().trim();
  var toUser = othernameLabel.text().trim();
  var timestamp = new Date().toString();
  var timestampFormatted = timestamp.substring(0, timestamp.lastIndexOf(":"))

  firebaseWrapper.pushChatItem({
    from: fromUser,
    to: toUser,
    msg: msgText,
    timestamp: timestampFormatted
  });
}

pushAttachmentMessage = function(fileName, fileUrl) {
  var fromUser = usernameLabel.text().trim();
  var toUser = othernameLabel.text().trim();
  var timestamp = new Date().toString();
  var timestampFormatted = timestamp.substring(0, timestamp.lastIndexOf(":"))

  firebaseWrapper.pushAttachmentItem({
    from: fromUser,
    to: toUser,
    fileName: fileName,
    fileUrl: fileUrl,
    timestamp: timestampFormatted
  });
}

// -- Rendering methods

renderChatItem = function(chatItem){
  if ( chatItem.from == 'Designer' )
    renderDesignerMsg(chatItem.msg, chatItem.timestamp)
  else
    renderDeveloperMsg(chatItem.msg, chatItem.timestamp)

  if(newMessage){
    messagesPerConversation++;
    conversationTimestamp = chatItem.timestamp;
    renderConversationData();
  }
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
  $(".chat_area").animate({ scrollTop: $('.chat_area').prop("scrollHeight")}, 50);
}

renderAttachmentItem = function(chatAttachmentItem){
  if ( chatAttachmentItem.from == 'Designer' )
    renderDesignerAttachmentMsg(chatAttachmentItem.fileName, chatAttachmentItem.fileUrl, chatAttachmentItem.timestamp);
  else
    renderDeveloperAttachmentMsg(chatAttachmentItem.fileName, chatAttachmentItem.fileUrl, chatAttachmentItem.timestamp);
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

renderConversation = function(messagesCount, lastMessageTimestamp){
  messagesPerConversation = messagesCount;
  conversationTimestamp = lastMessageTimestamp;

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

renderConversationData = function(){
  renderConversationMessageCount();
  renderConversationTimestamp();
}

renderConversationMessageCount = function(){
  $("#conversations_msgs_count").html(messagesPerConversation);
}

renderConversationTimestamp = function(){
  $("#conversation_timestamp").html(conversationTimestamp);
}