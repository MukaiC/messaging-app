import os

from flask import Flask, render_template, request, session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# channels = {'test-channel': [{'name': 'domo'}, {'text': 'testing'}]}

@app.route("/", methods=["GET", "POST"])
def index():
    # First time to visit the page
    if session.get("name") is not None:
        return render_template("channels.html")

    if request.method == "POST":
        name = request.form.get("name")
        session["name"] = name
        return render_template("channels.html")

    return render_template("index.html")

@socketio.on("submit channel")
def channels(data):
    channel = data["channel"]
    # !!! add channel to channels

    emit("announce channel", {"channel": channel}, broadcast=True)




if __name__ == '__main__':
    socketio.run(app)
