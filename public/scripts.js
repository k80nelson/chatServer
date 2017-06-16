$(document).ready(init);

function init(){
  var socket = io();
  var username = prompt('Enter a username: ') || 'user';
  socket.emit('intro', username);
  var users = [];

  $('#inputText').keypress(function(e){
    if(e.which == 13){
      var msg = $(this).val();
      $(this).val('');
      socket.emit('message', msg);
    }
  })

  socket.on('users', function(data){
    users = JSON.parse(data);
    console.log(users)
    updateUserList();
  });

  socket.on('message', function(data){
    $('#msgs').append('<li>'+data+'</li>');
    $('#msgs')[0].scrollTop=$('#chatLog')[0].scrollHeight;
  })

  function updateUserList(){
    $('#userList').empty();
    users.forEach(function(user){
      $('#userList').append('<li>'+user+'</li>');
    });
  }

  $("#pressed").click(btn);


  function btn(){
    socket.emit('blockUser', 'john')
  }
}
