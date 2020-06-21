const template = Handlebars.compile(document.querySelector('#new-channel-item').innerHTML);
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
    document.querySelector('#new-channel').onsubmit = () => {
      const channel = document.querySelector('#channel').value;
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
      const message = document.querySelector('#message').value;
      const time = Date.now()
      socket.emit('add message', {'message': message, 'time':time});
      document.querySelectr('#message').value = '';
      return false;
    };

  });

  // When a new channel is announced, add to the unordered list
  socket.on('announce channel', data => {
    const content = template ({'new_channel': data.name_new_channel })
    document.querySelector('#channels').innerHTML += content;
  });

  // When a channel already exists, alert the user
  socket.on('alert', data => {
    alert(`${data.message}`);
  });
});
