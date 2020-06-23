import os

from flask import Flask, render_template, request,  jsonify  #session
from flask_socketio import SocketIO, emit

app = Flask(__name__)

# Check for environment variable
if not os.getenv("SECRET_KEY"):
    raise RuntimeError("SECRET_KEY is not set")

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# stored_channels = [{'room':'channel 1', 'messages': [{'name': 'domo', 'text': 'message1'}, {'name': 'domo', 'text': 'message2'}]}, {'room': 'channel 2', 'messages': [{'name':'domo', 'text':'testing2'}, {'name':'kirby', 'text': 'poyo'}]}]

stored_channels = [{'room':'channel 1', 'messages': [{'name': 'domo', 'text': 'message1'}, {'name': 'domo', 'text': 'message2'}]}]
# stored_channels = []

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/messages")
def messages():
    return render_template("messages.html")

@socketio.on("create channel")
def channels(data):
    list_channels = [] # stored_channels to be appended
    channel = data["channel"].strip() # a new channel sent by a user
    # Create a list of existing channel.
    for c in stored_channels:
        list_channels.append(c["room"])
    # Add a new channel to stored_channels if it doesn't alredy exist.
    if channel not in list_channels:
        new_channel = {'room': channel, 'messages': []}
        stored_channels.append(new_channel)
        name_new_channel = new_channel['room']
        emit("announce channel", {"name_new_channel": name_new_channel}, broadcast=True)

    else:
        emit("alert", {"message": "This channel already exists. Please choose different name."}, broadcast=False)

@socketio.on("add message")
def messages(data):
    name = session["name"]
    # time =
    pass


if __name__ == '__main__':
    socketio.run(app)
