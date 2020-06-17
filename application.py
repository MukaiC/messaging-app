import os

from flask import Flask, render_template, request, session, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# stored_channels = [{'room':'channel 1', 'messages': [{'name': 'domo', 'text': 'message1'}, {'name': 'domo', 'text': 'message2'}]}, {'room': 'channel 2', 'messages': [{'name':'domo', 'text':'testing2'}, {'name':'kirby', 'text': 'poyo'}]}]

stored_channels = [{'room':'channel 1', 'messages': [{'name': 'domo', 'text': 'message1'}, {'name': 'domo', 'text': 'message2'}]}]
# stored_channels = []

@app.route("/", methods=["GET", "POST"])
def index():
    # First time to visit the page
    # stored_channels = jsonify(stored_channels)
    if session.get("name") is not None:
        return render_template("channels.html", channels=stored_channels)

    if request.method == "POST":
        name = request.form.get("name")
        session["name"] = name
        return render_template("channels.html", channels=stored_channels)

    return render_template("index.html")


@socketio.on("submit channel")
def channels(data):
    list_channels = []
    channel = data["channel"].strip()
    # Add a new channel to stored_channels if it doesn't alredy exist
    for c in stored_channels:
        list_channels.append(c["room"])
    if channel not in list_channels:
        new_channel = {'room': channel, 'messages': []}
        stored_channels.append(new_channel)
        emit("announce channel", {"channel": channel}, broadcast=True)

    else:
        emit("alert", {"message": "This channel already exists. Please choose different name."}, broadcast=False)

if __name__ == '__main__':
    socketio.run(app)
