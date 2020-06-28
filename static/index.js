const channel_template = Handlebars.compile(document.querySelector('#channel-item').innerHTML);
document.addEventListener('DOMContentLoaded', load);
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

  });

  // When a new channel is announced, add to the unordered list
  socket.on('announce channel', data => {
    const new_channel = channel_template ({'contents': `New!   ${data.name_new_channel}` })
    document.querySelector('#channels').innerHTML += new_channel;
  });

  // When a channel already exists, alert the user
  socket.on('alert', data => {
    alert(`${data.message}`);
  });
});

// For a first time user to register a display name
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

function load() {
  const request = new XMLHttpRequest();
  request.open('GET', '/channels');
  request.onload = () => {
    const data = JSON.parse(request.responseText);
    data.forEach(add_channel);
  };
  request.send()
};


function add_channel(contents) {
  const channel = channel_template({'contents': contents});
  document.querySelector('#channels').innerHTML += channel;
}
