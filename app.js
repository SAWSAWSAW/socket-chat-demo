var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var guestNumber = 1,
    nickNames = {},
    socketList = {};
    nameUsed = [];

http.listen(12345, function() {
    console.log('Listening on *: 12345');
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use("/static", express.static(__dirname + '/static'));

io.on('connection', function(socket) {
    var loginName = assignName(socket);

    socketList[loginName] = socket;
    io.emit('user login', {
        msg: '系统消息:' + loginName + '上线了',
        list: nameUsed
    });

    socket.on('disconnect', function(){
        var nickName = nickNames[socket.id];
        releaseUsedName(nickName);

        socketList[loginName] = null;
        io.emit('user disconnect', {
            msg:  '系统信息：' + nickName + '下线了',
            list: nameUsed
        });
    });

    socket.on('chat message', function(msg) {
        socket.broadcast.emit('chat message', nickNames[socket.id] + ': ' + msg)
    });

    socket.on('private message', function(data) {
        try {
            socketList[data.user].emit('private message', nickNames[socket.id] + ': ' + data.content);
        } catch(e) {
            socketList[nickNames[socket.id]].emit('private message', '系统信息：消息发送失败，找不到对象');
        }
    });

    socket.on('user typing', function(socketId) {
        io.emit('user typing', nickNames[socketId]);
    });

    socket.on('user stop typing', function(socketId) {
        io.emit('user stop typing', nickNames[socketId]);
    });
});

function assignName(socket) {
    var name = 'Guest_' + Math.random().toString(36).substr(2);
    nickNames[socket.id] = name;

    socket.emit('name result', {
        success: true,
        name: name,
        id: socket.id
    });

    nameUsed.push(name);
    return name;
}

function releaseUsedName(name) {
    var index = -1;

    for (var i = 0; i < nameUsed.length;i++) {
        if (name == nameUsed[i]) {
            index = 1;
            break;
        }
    }

    index >= 0 && nameUsed.splice(index,1);
}


