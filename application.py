import os

from flask import Flask, render_template, session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/", methods=["GET", "POST"])
def index():
    # First time to visit the page
    if session.get("name") is None:
        return render_template("index.html")

    return render_template("channels.html")







if __name__ == '__main__':
    app.run(debug=True)
