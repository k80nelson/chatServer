/*
   A socket.io based chatroom server

   Katie Nelson
*/

var express  = require('express');
var app      = express();
var http     = require('http').Server(app);
var io       = require('socket.io')(http);
var PORT     = 4000;

app.get('/', function(req, res){
  console.log('GET request for main page.');
  res.sendFile(__dirname+'/public/index.html');
});

app.use(express.static(__dirname+ '/public'));

http.listen(PORT, function(){
  console.log('server listening on port ' + PORT);
});

io.on('connection', function(socket){
  console.log('New connection.');
  socket.join('chat');
  socket.on('intro', function(data){
    socket.user = data;
    socket.blocked = [];
    socket.blockedBy = [];
    console.log(socket.user+ ' has connected.');
    sendUsers();
  //  var users = getUsers();
  //  users = JSON.stringify(users);
  //  socket.emit('users', users);
  //  socket.to('chat').emit('users', users);
    socket.emit('message', timeStamp()+' Welcome, '+socket.user+'!');
    socket.to('chat').emit('message', timeStamp()+' '+ socket.user+ ' has entered the chat.');
  });

  socket.on('message', function(data){
    console.log('Recieved new message from '+socket.user+': '+data);
    sendAll(socket, data);
  //  socket.emit('message', timeStamp()+' '+socket.user+': '+data);
  //  socket.to('chat').emit('message', timeStamp()+' '+socket.user+': '+data);
  });

  socket.on('disconnect', function(){
  //  var users = getUsers();
  //  users = JSON.stringify(users);
  //  socket.to('chat').emit('users', users);
    sendUsers();
    socket.to('chat').emit('message', timeStamp()+' '+ socket.user+ ' has left the chat.')
    console.log(socket.user+' has disconnected.');
  });

  socket.on('blockUser', function(data){
    blUser = findUser(data);
    blUser.blockedBy.push(socket.user);
    socket.blocked.push(blUser.user);
    console.log(blUser.user + ' was blocked by '+ socket.user)
  });

});

function sendUsers(){
  allClients = io.sockets.connected;
  for (var id in allClients){
    let currentUser = allClients[id];
    let data = [];
    for (var user in allClients){
      let otherUser = allClients[user].user
      if (currentUser.blocked.indexOf(otherUser) > -1){
        data.push('<strike>'+otherUser+'</strike>');
      }
      else data.push(otherUser);
    }
    data = JSON.stringify(data);
    currentUser.emit('users', data);
  }
}

function sendAll(socket, msg){
  allClients = io.sockets.connected;

  for (var id in allClients){
    if (socket.blockedBy.indexOf(allClients[id].user) > -1) continue;
    allClients[id].emit('message', timeStamp()+' '+socket.user+': '+msg);
  }
}

function timeStamp(){
  return new Date().toLocaleTimeString();
}

function findUser(data){
  allClients = io.sockets.connected;
  for (var id in allClients)
    if (allClients[id].user === data)
      return allClients[id];
}

function getUsers(){
  allClients = io.sockets.connected;
  data = [];
  for (var id in allClients){
    data.push(allClients[id].user);
  }
  return data;
}
