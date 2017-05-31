$( window ).on( "load", function() {
  
  // Initialize Firebase
  initFirebase();
  
  // Begin listening for data
  startListening();

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
}

/** Function to add a data listener **/
startListening = function() {
  firebase.database().ref('messages').on('child_added', function(snapshot) {
    var chatItem = snapshot.val();
    
    if ( chatItem.from == 'Designer' )
      renderDesignerMsg(chatItem.msg, chatItem.timestamp)
    else
      renderDeveloperMsg(chatItem.msg, chatItem.timestamp)
  });
}

initChatApp = function() {
  var usernameInput = $('#username');
  var othernameInput = $('#othername');
  var textInput = $('#chat_text');
  var postButton = $('#post_button');
  var switchUsersBtns = $('.dev-switch-button');

  currentRenderFunction = renderDeveloperMsg;
  otherRenderFunction = renderDesignerMsg;

  postButton.click( function() {
    var fromUser = usernameInput.text().trim();
    var toUser = othernameInput.text().trim();
    var msgText = textInput.val().trim();
    var timestamp = new Date().toString();
    var timestampFormatted = timestamp.substring(0, timestamp.lastIndexOf(":"))

    firebase.database().ref('messages').push({
      from: fromUser,
      to: toUser,
      msg: msgText,
      timestamp: timestampFormatted
    });

    textInput.val('');
    // $("#chat_items_list").append(currentRenderFunction(msgText));
  });

  switchUsersBtns.click(toggleUser);
}

function toggleUser() {
  // Switch usernames  
  var tmp = $('#username').text();
  $('#username').text($('#othername').text());
  $('#othername').text(tmp);

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

function renderDesignerMsg(text, timestamp){
  return renderMsg('', 'https://lh6.googleusercontent.com/-y-MY2satK-E/AAAAAAAAAAI/AAAAAAAAAJU/ER_hFddBheQ/photo.jpg', text, timestamp);
}

function renderDeveloperMsg(text, timestamp){
  return renderMsg('other-msg admin_chat', 'https://scontent-cai1-1.xx.fbcdn.net/v/t1.0-1/c22.0.48.48/p48x48/13615419_10153592621422793_8368169177989329233_n.jpg?oh=f5ef37717a144053fcdf7e6fbd42ff02&oe=59E439CE', text, timestamp);  
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
