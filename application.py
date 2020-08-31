import os, datetime

from flask import Flask, render_template, request,  jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)

# Check for environment variable
if not os.getenv("SECRET_KEY"):
    raise RuntimeError("SECRET_KEY is not set")

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# stored_channels = []
stored_channels = [{'room':'Welcome!', 'messages': [{'name': 'user1', 'text': 'Hello world!', 'time': '06-07-20 12:12:12'}]}]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/channels", methods=["GET"])
def channels():
    # Generate list of channels
    list_channels = []
    for c in stored_channels:
        list_channels.append(c["room"])
    return jsonify(list_channels)

@socketio.on("create channel")
def channels(data):
    list_channels = [] # stored_channels to be appended
    # channel_id = 0
    channel = data["channel"].strip() # a new channel sent by a user
    # Create a list of existing channel.
    for c in stored_channels:
        list_channels.append(c["room"])
    # Add a new channel to stored_channels if it doesn't alredy exist.
    if channel not in list_channels:
        # Add one to the id of the last element in stored_channels
        new_channel = {'room': channel, 'messages': []}
        stored_channels.append(new_channel)
        emit("announce channel", {"name_new_channel": channel}, broadcast=True)

    else:
        emit("alert", {"message": "This channel already exists. Please choose different name."}, broadcast=False)


@socketio.on("add message")
def messages(data):
    max_messages = 100
    channel = data['channel']
    name = data['name']
    text = data['message']
    # timestamp
    time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    new_message = {'name': name, 'text': text, 'time': time}

    list_channels = []
    for c in stored_channels:
        list_channels.append(c['room'])
    index = list_channels.index(channel)
    # If the number of messages are more than max_messages, remove the oldest one before putting the new one
    list_messages = stored_channels[index]['messages']
    if len(list_messages) >= max_messages:
        list_messages.pop(0)
    list_messages.append(new_message)
    emit ('announce message', {'text': text, 'name': name, 'time': time}, room=channel)


@socketio.on('remove message')
def remove(data):
    channel = data['channel']
    name = data['name']
    time = data['timestamp']

    # find the message in the stored_channels and remove it
    list_channels = []
    for c in stored_channels:
        list_channels.append(c['room'])
    index = list_channels.index(channel)
    list_messages = stored_channels[index]['messages']

    for message in list_messages:
        if message['name'] == name and message['time'] == time:
            index_m = list_messages.index(message)

    # Replace the text
    list_messages[index_m]['text'] = "**This message has been removed**"
    # this removes the message
    # list_messages.pop(index_m)

    emit('announce removed message',{'text': 'a message is removed'}, room=channel)


@socketio.on('join channel')
def on_join(data):
    username = data['username']
    room = data['channel']
    join_room(room)
    emit('announce join',{'text': username + ' has joined the room.'}, room=room)

@socketio.on('leave channel')
def on_leave(data):
    username = data['username']
    room = data['channel']
    leave_room(room)
    emit('announce leave',{'text': username + ' has left the room.'}, room=room)



@app.route("/messages", methods=["POST"])
def messages():
    channel = request.form.get('channel')
    # Find the index of the matching channel
    list_channels = []
    for c in stored_channels:
        list_channels.append(c['room'])
    index = list_channels.index(channel)
    # Extract messages for this channel
    messages = stored_channels[index]['messages']

    return jsonify(messages)


if __name__ == '__main__':
    socketio.run(app)
