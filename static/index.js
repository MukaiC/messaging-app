const channel_template = Handlebars.compile(document.querySelector('#channel-item').innerHTML);

document.addEventListener('DOMContentLoaded', () => {
  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  // When connected, configure buttons
  socket.on('connect', () => {
    // Submit-channel button is disabled by default.
    document.querySelector('#submit-channel').disabled = true;
    // Enable the button only if there is text in the input field.
    document.querySelector('#channel').onkeyup = () => {
      let channeltitle = document.querySelector('#channel').value.trim();
      if (channeltitle.length > 0)
        document.querySelector('#submit-channel').disabled = false;
      else
        document.querySelector('#submit-channel').disabled = true;
    };
    // When a new channel is submited
    document.querySelector('#create-new-channel').onsubmit = () => {
      const channel = document.querySelector('#channel').value.trim();
      socket.emit('create channel', {'channel': channel});
      document.querySelector('#channel').value = '';
      return false;
    };
    // Submit-message button enabled only when there is text in the input field
    document.querySelector('#submit-message').disabled = true;
    document.querySelector('#message').onkeyup = () => {
      let message = document.querySelector('#message').value.trim();
      if (message.length > 0)
        document.querySelector('#submit-message').disabled = false;
      else
        document.querySelector('#submit-message').disabled = true;
    };
    // When a new message is submitted
    document.querySelector('#new-message').onsubmit = () => {
      const message = document.querySelector('#message').value.trim();
      const time = Date.now()
      socket.emit('add message', {'message': message, 'time':time});
      document.querySelector('#message').value = '';
      return false;
    };
    // Make the form invisible if no channel is selected
    if (!localStorage.getItem('channel')) {
      document.querySelector("#new-message").style.visibility = 'hidden';
    };
  });

  // When a new channel is announced, add to the unordered list
  socket.on('announce channel', data => {
    // const new_channel = channel_template ({'contents': data.name_new_channel, 'channel_id': `channel-${data.id_new_channel}`})
    // const new_channel = channel_template ({'heading': 'NEW! ', 'contents': data.name_new_channel, 'channel_id': `channel-${data.id_new_channel}`})
    // const new_channel = channel_template ({'contents': `New!   ${data.name_new_channel} `, 'channel_id': `channel-${data.id_new_channel}`})
    const new_channel = channel_template({'contents': data.name_new_channel});
    document.querySelector('#channels').innerHTML += new_channel;
  });

  // When a channel by the same name already exists, alert the user
  socket.on('alert', data => {
    alert(`${data.message}`);
  });
});

// Load messages when a channel is selected
document.addEventListener('click', event => {
  const element = event.target;
  if (element.className === 'channel-link') {
    const currentChannel = element.innerHTML.trim();
    localStorage.setItem('channel', currentChannel);
    // // Display the channel name
    // document.querySelector('#room-name').innerHTML = currentChannel;
    // // Clear the messages from the previous channel
    // document.querySelector('#messages').innerHTML = '';
    // // Prevent the page from reloading
    event.preventDefault();
    alert(`channel ${currentChannel} is selected!`);
    load_messages(currentChannel);
  };
});

// Load channels
document.addEventListener('DOMContentLoaded', load_channels);

// Load messages if there is a channel stored
document.addEventListener('DOMContentLoaded', () => {
  if ('channel' in localStorage) {
    let currentChannel = localStorage.getItem('channel');
    load_messages(currentChannel);
    document.querySelector("#new-message").style.visibility = 'visible';
  };
});


// A user visits the page for the first time and registers a display name
document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('name')) {
      document.querySelector('#user').style.display = 'none';
  } else {
      document.querySelector('#register').style.display = 'none';
  };
  document.querySelector('#submit-name').disabled = true;
  document.querySelector('#new-name').onkeyup = () => {
    let newname = document.querySelector('#new-name').value.trim();
    if (newname.length > 0)
      document.querySelector('#submit-name').disabled = false;
    else
      document.querySelector('#submit-name').disabled = true;
    };
  document.querySelector('#register').onsubmit = () => {
    let new_user = document.querySelector('#new-name').value.trim();
    localStorage.setItem('name', new_user);
    alert(`Welcome ${new_user}!`);
  };
});

function load_channels() {
  const request = new XMLHttpRequest();
  request.open('GET', '/channels');
  request.onload = () => {
    const data = JSON.parse(request.responseText);
    data.forEach(add_channel);
  };
  request.send();
};


function add_channel(contents) {
  // const channel = channel_template({'contents': contents.room, 'channel_id': `channel-${contents.id}`});
  // const channel = channel_template({'contents': `${contents.room}`, 'channel_id': `channel-${contents.id}`});
  // const channel = channel_template({'contents': contents});
  const channel = channel_template({'contents': contents.room});
  document.querySelector('#channels').innerHTML += channel;
};


function load_messages(currentChannel) {
  // Display the channel name
  document.querySelector('#room-name').innerHTML = currentChannel;
  // Display the message form
  document.querySelector("#new-message").style.visibility = 'visible';
  // Clear the messages from the previous channel
  document.querySelector('#messages').innerHTML = '';
  const request = new XMLHttpRequest();
  request.open('POST', '/messages');
  request.onload = () => {
    const data = JSON.parse(request.responseText);
    data.forEach(add_message);
  };
  // Add channel name to request data
  const data = new FormData();
  data.append('channel', currentChannel);
  // Send request
  request.send(data);
};

const message_template = Handlebars.compile(document.querySelector('#message-item').innerHTML);
function add_message(contents) {
  const message = message_template({'text': contents.text, 'info': `by ${contents.name}`});
  document.querySelector('#messages').innerHTML += message;
};
