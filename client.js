 var socket = io();

$(function() {
  // var socket = io.connect("http://localhost:8900");

	//connexion success
  socket.on('connect', function() {
    console.log('Connected to server.');
    $('#disconnected').hide();
    $('#waiting-room').show();   
  });

	//deconnexion et mise à jour du site
  socket.on('disconnect', function() {
    console.log('Disconnected from server.');
    $('#waiting-room').hide();
    $('#game').hide();
    $('#disconnected').show();
  });

	//joueur rejoint partie
  socket.on('join', function(gameId) {
    Game.initGame();
    $('#messages').empty();
    $('#disconnected').hide();
    $('#waiting-room').hide();
    $('#game').show();
    $('#game-number').html(gameId);
  })


	//Maj statut joueur
  socket.on('update', function(gameState) {
    Game.setTurn(gameState.turn);
    Game.updateGrid(gameState.gridIndex, gameState.grid);
  });


	//quand game over
  socket.on('gameover', function(isWinner) {
    Game.setGameOver(isWinner);
  });
  
	//quitte la partie ( à ajouter eventuellement ) 
  socket.on('leave', function() {
    $('#game').hide();
    $('#waiting-room').show();
  });


});


//quitter la partie ( à ajouter eventuellement ) 
function sendLeaveRequest(e) {
  e.preventDefault();
  socket.emit('leave');
}

//indique coordonnées tir au serveur
function sendShot(square) {
  socket.emit('shot', square);
}
