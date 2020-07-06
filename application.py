import os, datetime

from flask import Flask, render_template, request,  jsonify  #session
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)

# Check for environment variable
if not os.getenv("SECRET_KEY"):
    raise RuntimeError("SECRET_KEY is not set")

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

stored_channels = [{'room':'channel 1', 'messages': [{'name': 'domo', 'text': 'message1'}, {'name': 'domo', 'text': 'message2'}]}, {'room': 'channel 2', 'messages': [{'name':'domo', 'text':'testing2'}, {'name':'kirby', 'text': 'poyo'}]}]

# stored_channels = [{'id':0, 'room':'channel 1', 'messages': [{'name': 'domo', 'text': 'message1'}, {'name': 'domo', 'text': 'message2'}]}, {'id':1, 'room': 'channel 2', 'messages': [{'name':'domo', 'text':'testing2'}, {'name':'kirby', 'text': 'poyo'}]}]


# stored_channels = [{'id':0, 'room':'channel 1', 'messages': [{'name': 'domo', 'text': 'message1'}, {'name': 'domo', 'text': 'message2'}]}]

# stored_channels = [{'room':'channel 1', 'messages': [{'name': 'domo', 'text': 'message1'}, {'name': 'domo', 'text': 'message2'}]}]
# stored_channels = []

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/channels", methods=["GET"])
def channels():
    # Generate list of channels
    list_channels = []
    # for c in stored_channels:
    #     element = {'id': c['id'], 'room':c['room']}
    #     list_channels.append(element)

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
        # name_new_channel = new_channel['room']
        emit("announce channel", {"name_new_channel": channel}, broadcast=True)

        # channel_id = stored_channels[-1]['id']
        # new_channel_id = channel_id + 1
        # new_channel = {'id': new_channel_id, 'room': channel, 'messages': []}
        # stored_channels.append(new_channel)
        # name_new_channel = new_channel['room']
        # emit("announce channel", {"name_new_channel": name_new_channel, "id_new_channel": new_channel_id}, broadcast=True)

    else:
        emit("alert", {"message": "This channel already exists. Please choose different name."}, broadcast=False)

# !!!
@socketio.on("add message")
def messages(data):
    channel = data['channel']
    name = data['name']
    text = data['message']
    # timestamp
    time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    new_message = {'name': name, 'text': text, 'time': time}

    # list_channels = []
    # for c in stored_channels:
    #     list_channels.append(c['room'])
    # index = list_channels.index(channel)
    # !!! if the number of messages are more than 100, remove the oldest one before putting the new one

    # stored_channels[index]['messages'].append(new_message)
    emit ('announce message', {'text': text, 'name': name, 'time': time}, room=channel)
    # emit ('announce message', {'text': text, 'name': name, 'time': time}, room=channel)

@socketio.on('join channel')
def on_join(data):
    username = data['username']
    room = data['channel']
    join_room(room)
    # send(username + 'has joined the room.', room=room)
    emit('announce join',{'text': username + ' has joined the room.'}, room=room)

@socketio.on('leave channel')
def on_leave(data):
    username = data['username']
    room = data['channel']
    leave_room(room)
    # send(username + 'has left the room.', room=room)
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
    # if there is no message yet in the channel
    # if messages == []:
        # messages = [{'name': '', 'text': 'Threre is no messages in this channel yet.'}]
    return jsonify(messages)


#
# @socketio.on("request messages")
# def messages(data):
#     room = data["channel"]
#     join_room(room)
#     # Find the index of matching channel
#     list_channels = []
#     for c in stored_channels:
#         list_channels.append(c['room'])
#     index = list_channels.index(room)
#     # Extract messages for the channel
#     messages = stored_channels[index]['messages']
#     emit("messages", messages)




if __name__ == '__main__':
    socketio.run(app)
