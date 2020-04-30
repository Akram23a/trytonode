var Ship = require('./ship.js');
var Settings = require('./settings.js');

//constructeur des joueurs et leur associe des bateaux
function Player(id) 
{
  var i;
  this.id = id;
  this.shots = Array(Settings.gridRows * Settings.gridCols);
  this.shipGrid = Array(Settings.gridRows * Settings.gridCols);
  this.ships = [];

  for(i = 0; i < Settings.gridRows * Settings.gridCols; i++) {
    this.shots[i] = 0;
    this.shipGrid[i] = -1;
  }
  if(!this.createRandomShips()) {
	  //si placement init échoue on reprend un placement par défaut
    this.ships = [];
    this.createShips();
  }
};

//un tir sur grille ,retourne vrai si touche, faux sinon
Player.prototype.shoot = function(gridIndex) 
{
  if(this.shipGrid[gridIndex] >= 0) 
  {
    // touché
    this.ships[this.shipGrid[gridIndex]].touche++;
    this.shots[gridIndex] = 2;
    return true;
  } 
  else 
  {
    // à l'eau
    this.shots[gridIndex] = 1;
    return false;
  }
};

//récupère les vaisseaux coulés
Player.prototype.getSunkShips = function() 
{
  var i, coule = [];
  for(i = 0; i < this.ships.length; i++) 
  {
    if(this.ships[i].isSunk()) 
    {
      coule.push(this.ships[i]);
    }
  }
  return coule;
};

//récupère le nombre de vaisseaux restants
Player.prototype.getShipsLeft = function() 
{
  var i, shipCount = 0;

  for(i = 0; i < this.ships.length; i++) 
  {
    if(!this.ships[i].isSunk()) 
    {
      shipCount++;
    }
  }
  return shipCount;
}

//créé et place les bateaux suivant les indications de "settings"
Player.prototype.createRandomShips = function() 
{
  var shipIndex;

  for(shipIndex = 0; shipIndex < Settings.ships.length; shipIndex++) 
  {
    ship = new Ship(Settings.ships[shipIndex]);
  
    if(!this.placeShipRandom(ship, shipIndex)) 
    {
      return false;
    }

    this.ships.push(ship);
  }
  return true;
};

//teste une position pour placer un bateau sans superposition
//Fonction reprise sur internet
Player.prototype.placeShipRandom = function(ship, shipIndex) 
{
  var i, j, gridIndex, xMax, yMax, tryMax = 25;

  for(i = 0; i < tryMax; i++) 
  {
    ship.horizontal = Math.random() < 0.5;

    xMax = ship.horizontal ? Settings.gridCols - ship.taille + 1 : Settings.gridCols;
    yMax = ship.horizontal ? Settings.gridRows : Settings.gridRows - ship.taille + 1;

    ship.x = Math.floor(Math.random() * xMax);
    ship.y = Math.floor(Math.random() * yMax);

    if(!this.checkShipOverlap(ship) && !this.checkShipAdjacent(ship)) 
    {
      //pas d'adjacence et pas de superposition :
      gridIndex = ship.y * Settings.gridCols + ship.x;
      for(j = 0; j < ship.taille; j++) {
        this.shipGrid[gridIndex] = shipIndex;
        gridIndex += ship.horizontal ? 1 : Settings.gridCols;
      }
      return true;
    }
  }
  return false;
}

//vérifie si superposition
//Fonction reprise sur internet
Player.prototype.checkShipOverlap = function(ship) 
{
  var i, gridIndex = ship.y * Settings.gridCols + ship.x;

  for(i = 0; i < ship.taille; i++) 
  {
    if(this.shipGrid[gridIndex] >= 0) 
    {
      return true;
    }
    gridIndex += ship.horizontal ? 1 : Settings.gridCols;
  }
  return false;
}

//vérifie qu'aucun bateau n'est collé à la position testée
//Fonction reprise sur internet
Player.prototype.checkShipAdjacent = function(ship) 
{
  var i, j, 
      x1 = ship.x - 1,
      y1 = ship.y - 1,
      x2 = ship.horizontal ? ship.x + ship.taille : ship.x + 1,
      y2 = ship.horizontal ? ship.y + 1 : ship.y + ship.taille;

  for(i = x1; i <= x2; i++) {
    if(i < 0 || i > Settings.gridCols - 1) continue;
    for(j = y1; j <= y2; j++) {
      if(j < 0 || j > Settings.gridRows - 1) continue;
      if(this.shipGrid[j * Settings.gridCols + i] >= 0) {
        return true;
      }
    }
  }

  return false;
}

//placement correct lancé par défaut SI le placement aléatoire échoue trop. METTRE A JOUR SI ON CHANGE SETTINGS !
//Fonction reprise sur internet
Player.prototype.createShips = function() 
{
  var shipIndex, i, gridIndex, ship,
      x = [1, 3, 5, 8, 8], y = [1, 2, 5, 2, 8],
      horizontal = [false, true, false, false, true];

  for(shipIndex = 0; shipIndex < Settings.ships.length; shipIndex++) {
    ship = new Ship(Settings.ships[shipIndex]);
    ship.horizontal = horizontal[shipIndex];
    ship.x = x[shipIndex];
    ship.y = y[shipIndex];

    // place ship array-index in shipGrid
    gridIndex = ship.y * Settings.gridCols + ship.x;
    for(i = 0; i < ship.taille; i++) {
      this.shipGrid[gridIndex] = shipIndex;
      gridIndex += ship.horizontal ? 1 : Settings.gridCols;
    }

    this.ships.push(ship);
  }
};

module.exports = Player;
