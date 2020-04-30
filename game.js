var GameStatus = {
  inProgress: 1,
  gameOver: 2
}

var Game = (function() {
  var canvas = [], context = [], grid = [],
      gridHeight = 361, gridWidth = 361, gridBorder = 1,
      gridRows = 10, gridCols = 10, markPadding = 10, shipPadding = 3,
      squareHeight = (gridHeight - gridBorder * gridRows - gridBorder) / gridRows,
      squareWidth = (gridWidth - gridBorder * gridCols - gridBorder) / gridCols,
      turn = false, gameStatus, squareHover = { x: -1, y: -1 };

  canvas[0] = document.getElementById('canvas-grid1');
  canvas[1] = document.getElementById('canvas-grid2');
  context[0] = canvas[0].getContext('2d');
  context[1] = canvas[1].getContext('2d');

	//colore carré au passage de la souris
  canvas[1].addEventListener('mousemove', function(e) {
    var pos = getCanvasCoordinates(e, canvas[1]);
    squareHover = getSquare(pos.x, pos.y);
    drawGrid(1);
  });

	//retire la coloration si souris quitte le tableau
  canvas[1].addEventListener('mouseout', function(e) {
    squareHover = { x: -1, y: -1 };
    drawGrid(1);
  });

	//tire quand clic && si tour du joueur
  canvas[1].addEventListener('click', function(e) {
    if(turn) {
      var pos = getCanvasCoordinates(e, canvas[1]);
      var square = getSquare(pos.x, pos.y);
      sendShot(square);
    }
  });

	//récupère la case sous la souris ( en divisant coordonnées écran par le nombre de lignecolonne et leur taille
  function getSquare(x, y) {
    return {
      x: Math.floor(x / (gridWidth / gridCols)),
      y: Math.floor(y / (gridHeight / gridRows))
    };
  };

	//récupère la position souris par rapport au canvas ( haut gauche = 0;0 )
  function getCanvasCoordinates(event, canvas) {
    rect = canvas.getBoundingClientRect();
    return {
      x: Math.round((event.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
      y: Math.round((event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
    };
  };


	//nouvelle partie
  function initGame() {
    var i;

	//indique partie en cours
    gameStatus = GameStatus.inProgress;
    
    //grille des joueurs 1 et 2
    grid[0] = { shots: Array(gridRows * gridCols), ships: [] };
    grid[1] = { shots: Array(gridRows * gridCols), ships: [] };

	//init la grille avec aucun  tir au début
    for(i = 0; i < gridRows * gridCols; i++) {
      grid[0].shots[i] = 0;
      grid[1].shots[i] = 0;
    }

    //Reset le status du client
    $('#turn-status').removeClass('alert-your-turn').removeClass('alert-opponent-turn')
            .removeClass('alert-winner').removeClass('alert-loser');

	//dessine grille
    drawGrid(0);
    drawGrid(1);
  };


	//met la grille à jour
  function updateGrid(player, gridState) {
    grid[player] = gridState;
    drawGrid(player);
  };

  
  //si partie non terminée, indique l'état actuel du tour
  function setTurn(turnState) {
    if(gameStatus !== GameStatus.gameOver) {
      turn = turnState;

      if(turn) {
        $('#turn-status').removeClass('alert-opponent-turn').addClass('alert-your-turn').html('It\'s your turn!');
      } else {
        $('#turn-status').removeClass('alert-your-turn').addClass('alert-opponent-turn').html('Waiting for opponent.');
      }
    }
  };

 
	//indique si vainqueur ou perdant et propose de rejouer
  function setGameOver(isWinner) {
    gameStatus = GameStatus.gameOver;
    turn = false;
    
    if(isWinner) {
      $('#turn-status').removeClass('alert-opponent-turn').removeClass('alert-your-turn')
              .addClass('alert-winner').html('You won! <a href="#" class="btn-leave-game">Play again</a>.');
    } else {
      $('#turn-status').removeClass('alert-opponent-turn').removeClass('alert-your-turn')
              .addClass('alert-loser').html('You lost. <a href="#" class="btn-leave-game">Play again</a>.');
    }
    $('.btn-leave-game').click(sendLeaveRequest);
  }


	//dessine grille, vaisseaux, croix/point de tir
  function drawGrid(gridIndex) {
    drawSquares(gridIndex);
    drawShips(gridIndex);
    drawMarks(gridIndex);
  };

 
	//dessine le background
  function drawSquares(gridIndex) {
    var i, j, squareX, squareY;

    context[gridIndex].fillStyle = '#393c42'
    context[gridIndex].fillRect(0, 0, gridWidth, gridHeight);

    for(i = 0; i < gridRows; i++) {
      for(j = 0; j < gridCols; j++) {
        squareX = j * (squareWidth + gridBorder) + gridBorder;
        squareY = i * (squareHeight + gridBorder) + gridBorder;

        context[gridIndex].fillStyle = '#72a98f'

        // met le carré sur lequel la souris passe bien en valeur, si on peut tirer dessus
        if(j === squareHover.x && i === squareHover.y &&
                gridIndex === 1 && grid[gridIndex].shots[i * gridCols + j] === 0 && turn) {
          context[gridIndex].fillStyle = '#3d5a6c';
        }

        context[gridIndex].fillRect(squareX, squareY, squareWidth, squareHeight);
      }
    }
  };


	//dessine les bateaux
  function drawShips(gridIndex) {
    var ship, i, x, y,
        shipWidth, shipLength;

    context[gridIndex].fillStyle = '#433a3f';
    
    for(i = 0; i < grid[gridIndex].ships.length; i++) {
      ship = grid[gridIndex].ships[i];

      x = ship.x * (squareWidth + gridBorder) + gridBorder + shipPadding;
      y = ship.y * (squareHeight + gridBorder) + gridBorder + shipPadding;
      shipWidth = squareWidth - shipPadding * 2;
      shipLength = squareWidth * ship.taille + (gridBorder * (ship.taille - 1)) - shipPadding * 2;

      if(ship.horizontal) {
        context[gridIndex].fillRect(x, y, shipLength, shipWidth);
      } else {
        context[gridIndex].fillRect(x, y, shipWidth, shipLength);
      }
    }
  };
  

	//dessine tirs touchés et ratés
  function drawMarks(gridIndex) {
    var i, j, squareX, squareY;

    for(i = 0; i < gridRows; i++) {
      for(j = 0; j < gridCols; j++) {
        squareX = j * (squareWidth + gridBorder) + gridBorder;
        squareY = i * (squareHeight + gridBorder) + gridBorder;

        if(grid[gridIndex].shots[i * gridCols + j] === 1) {
          context[gridIndex].beginPath();
          context[gridIndex].moveTo(squareX + markPadding, squareY + markPadding);
          context[gridIndex].lineTo(squareX + squareWidth - markPadding, squareY + squareHeight - markPadding);
          context[gridIndex].moveTo(squareX + squareWidth - markPadding, squareY + markPadding);
          context[gridIndex].lineTo(squareX + markPadding, squareY + squareHeight - markPadding);
          context[gridIndex].strokeStyle = '#000000';
          context[gridIndex].stroke();
        }
        else if(grid[gridIndex].shots[i * gridCols + j] === 2) {
          context[gridIndex].beginPath();
          context[gridIndex].arc(squareX + squareWidth / 2, squareY + squareWidth / 2,
                                 squareWidth / 2 - markPadding, 0, 2 * Math.PI, false);
          context[gridIndex].fillStyle = '#E62E2E';
          context[gridIndex].fill();
        }
      }
    }
  };

  return {
    'initGame': initGame,
    'updateGrid': updateGrid,
    'setTurn': setTurn,
    'setGameOver': setGameOver
  };
})();
