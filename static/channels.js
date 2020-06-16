document.addEventListener('DOMContentLoaded', () => {
  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  // When connected, configure buttons
  socket.on('connect', () => {
    // Submit button is disabled by default.
    document.querySelector('#submit').disabled = true;
    // Enable button only if there is text in the input field.
    document.querySelector('#channel').onkeyup = () => {
      if (document.querySelector('#channel'). value.length > 0)
        document.querySelector('#submit').disabled = false;
      else
        document.querySelector('#submit').disabled = true;
      };
    // When a new channel is submited
    document.querySelector('#new-channel').onsubmit = () => {
      const channel = document.querySelector('#channel').value;
      socket.emit('submit channel', {'channel': channel});
      document.querySelector('#channel').value = ''
      return false;
    };
  });

  // When a new channel is announced, add to the unordered list
  socket.on('announce channel', data => {
    const li = document.createElement('li');
    li.innerHTML = `New channel created: ${data.channel}`;
    document.querySelector('#channels').append(li);
  });
});
