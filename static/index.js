var socket = io();
var myNickName = '';

$('form').submit(function() {
    var content = $('#m').val().trim();

    if(content.indexOf('@') === 0) {
        sendPrivateMessage(content);
    } else {
        appendContent( myNickName + ': ' + content);
        socket.emit('chat message', content);
    }

    $('#m').val('');
    return false;
});

$('#m').on('input', function(){
    socket.emit('user typing', socket.id);
});

$('#m').on('blur', function(){
    socket.emit('user stop typing', socket.id);
});

socket.on('chat message', function(result){
    appendContent(result);
});

socket.on('private message', function(result){
    appendContent(result, 'secret');
})

socket.on('user login', function(result) {
    refreshLoginQuitView(result);
});

socket.on('user disconnect', function(result) {
    refreshLoginQuitView(result);
});

socket.on('name result', function(result) {
    if (result.id == socket.id) {
        myNickName = result.name;
        $('#nickname').html(myNickName);
    }
});

socket.on('user typing', function(result) {
    $('.typing-list').text(result + ' is typing');
});

socket.on('user stop typing', function(result) {
    $('.typing-list').text('');
});

function sendPrivateMessage(content) {
    var regex = /\@(.+)\s(.*)/ig;
    var arr = regex.exec(content);
    var user = arr[1];
    var content = arr[2];

    appendContent( myNickName + ': ' + content, 'secret');

    socket.emit('private message', {
        user: user,
        content: content
    });
}

function refreshLoginQuitView(result) {
    appendContent(result.msg);
    refreshOnlineList(result.list);
}

 function refreshOnlineList(arr) {
    $('#online-list').html('');
    for (var i = 0; i < arr.length; i ++) {
        $('#online-list').append($('<li>').text(arr[i]));
    }
}

function appendContent(content, diyClass) {
    if (!diyClass) {
        diyClass = '';
    }

    $('#messages').append($('<li class="' + diyClass + '">').text(content));
}
