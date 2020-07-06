const channel_template = Handlebars.compile(document.querySelector('#channel-item').innerHTML);
const message_template = Handlebars.compile(document.querySelector('#message-item').innerHTML);
const alert_template = Handlebars.compile(document.querySelector('#alert-message').innerHTML);

document.addEventListener('DOMContentLoaded', () => {
  load_channels();
  // Make the message submission form invisible if no channel is selected
  if (!localStorage.getItem('channel')) {
    document.querySelector("#new-message").style.visibility = 'hidden';
  };

  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  // When connected, configure buttons
  socket.on('connect', () => {
    // Submit-channel button is disabled by default.
    document.querySelector('#submit-channel').disabled = true;
    // Enable the button only if there is text in the input field.
    document.querySelector('#channel').onkeyup = () => {
      let channeltitle = document.querySelector('#channel').value.trim();
      if (channeltitle.length > 0) {
        document.querySelector('#submit-channel').disabled = false;
      } else {
        document.querySelector('#submit-channel').disabled = true;
      }
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
      if (message.length > 0) {
        document.querySelector('#submit-message').disabled = false;
      } else {
        document.querySelector('#submit-message').disabled = true;
      }
    };

    // When a new message is submitted
    document.querySelector('#new-message').onsubmit = () => {
      let name = localStorage.getItem('name');
      let message = document.querySelector('#message').value.trim();
      // let time = Date.now();
      let channel = localStorage.getItem('channel');
      socket.emit('add message', {'name': name, 'message': message, 'channel': channel});
      document.querySelector('#message').value = '';
      return false;
    };

  });

  // When a new channel is announced, add to the unordered list
  socket.on('announce channel', data => {
    const new_channel = channel_template({'contents': data.name_new_channel});
    document.querySelector('#channels').innerHTML += new_channel;
  });

  // When a new message is announced
  socket.on('announce message', data => {
    let username = data.name;
    // if the message is written by the user, show hide button with the message
    if (localStorage.getItem('name') === username) {
      var isAuthor = true;
    }
    const new_message = message_template({'author': isAuthor,'text': data.text, 'info': `written by ${data.name} at ${data.time}`});
    document.querySelector('#messages').innerHTML+= new_message;
  });

  // When a user enter a channel
  socket.on('announce join', data => {
    const join_alert = alert_template({'text': data.text});
    document.querySelector('#messages').innerHTML+= join_alert;
  });

  // When a user leaves a channel
  socket.on('announce leave', data => {
    const leave_alert = alert_template({'text': data.text});
    document.querySelector('#messages').innerHTML+= leave_alert;
  });

  // When a channel by the same name already exists, alert the user
  socket.on('alert', data => {
    alert(`${data.message}`);
  });

  // When a channel is selected, load the mssages in the room
  document.addEventListener('click', event => {
    const element = event.target;
    if (element.className === 'channel-link') {
      const username = localStorage.getItem('name');
      // if the user is already in a room, leave it before joining the new one
      if ('channel' in localStorage) {
        let channel = localStorage.getItem('channel')
        socket.emit('leave channel', {'channel': channel, 'username': username});
      };

      const currentChannel = element.innerHTML.trim();
      localStorage.setItem('channel', currentChannel);
      // Prevent the page from reloading
      event.preventDefault();
      // alert(`channel ${currentChannel} is selected!`);
      socket.emit('join channel', {'channel':currentChannel, 'username':username});
      load_messages(currentChannel);
    };
  });

  // !!!1 Load messages and join the channel, if there is a channel stored
  if ('channel' in localStorage) {
    let currentChannel = localStorage.getItem('channel');
    let username = localStorage.getItem('name');
    socket.emit('join channel', {'channel':currentChannel, 'username':username});
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
  const channel = channel_template({'contents': contents});
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


function add_message(contents) {
  // if the message is written by the user, show hide button with the message
  let username = contents.name;
  if (localStorage.getItem('name') === username) {
    var isAuthor = true;
  }
  const message = message_template({'author': isAuthor, 'text': contents.text, 'info': `written by ${contents.name} at ${contents.time}`});
  document.querySelector('#messages').innerHTML += message;
};
