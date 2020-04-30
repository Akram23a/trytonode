var Player = require('./player.js');
var Settings = require('./settings.js');
var GameStatus = require('./game_status.js');

//construit une partie à partir des joueurs et d'une room, construit les joueurs
function BattleshipGame(id, idPlayer1, idPlayer2) {
  this.id = id;
  this.currentPlayer = Math.floor(Math.random() * 2);
  this.winningPlayer = null;
  this.gameStatus = GameStatus.inProgress;

  this.players = [new Player(idPlayer1), new Player(idPlayer2)];
}

//récupère l'id d'un joueur
BattleshipGame.prototype.getPlayerId = function(player) {
  return this.players[player].id;
};

//récupère ID vainqueur
BattleshipGame.prototype.getWinnerId = function() {
  if(this.winningPlayer === null) {
    return null;
  }
  return this.players[this.winningPlayer].id;
};

//récupère ID perdant
BattleshipGame.prototype.getLoserId = function() {
  if(this.winningPlayer === null) {
    return null;
  }
  var loser = this.winningPlayer === 0 ? 1 : 0;
  return this.players[loser].id;
};

//passe au tour suivant
BattleshipGame.prototype.switchPlayer = function() {
  this.currentPlayer = this.currentPlayer === 0 ? 1 : 0;
};

//annule partie
BattleshipGame.prototype.abortGame = function(player) {
  // give win to opponent
  this.gameStatus = GameStatus.gameOver;
  this.winningPlayer = player === 0 ? 1 : 0;
}

//tir du joueur dont c'est le tour
BattleshipGame.prototype.shoot = function(position) {
  var opponent = this.currentPlayer === 0 ? 1 : 0,
      gridIndex = position.y * Settings.gridCols + position.x;

  if(this.players[opponent].shots[gridIndex] === 0 && this.gameStatus === GameStatus.inProgress) {
		//si zone ciblable
    if(!this.players[opponent].shoot(gridIndex)) {
		//si échec
      this.switchPlayer();
    }

    //si aucun vaisseau restant de l'adversaire, fin du jeu
    if(this.players[opponent].getShipsLeft() <= 0) {
      this.gameStatus = GameStatus.gameOver;
      this.winningPlayer = opponent === 0 ? 1 : 0;
    }
    
    return true;
  }

  return false;
};

//mise à jour pour un joueur et une grille
BattleshipGame.prototype.getGameState = function(player, gridOwner) {
  return {
    turn: this.currentPlayer === player,                 
    gridIndex: player === gridOwner ? 0 : 1,             
    grid: this.getGrid(gridOwner, player !== gridOwner)  // cache les bateaux non coulés, pas les bateaux coulés
  };
};

//récupère une grille et ses bateaux
BattleshipGame.prototype.getGrid = function(player, hideShips) {
  return {
    shots: this.players[player].shots,
    ships: hideShips ? this.players[player].getSunkShips() : this.players[player].ships
  };
};

module.exports = BattleshipGame;
