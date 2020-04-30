//constructeur ship
function Ship(taille) {
  this.x = 0;
  this.y = 0;
  this.touche = 0;
  this.taille = taille;
  this.horizontal = false;
}

//si bateau coulé ( l'affichera ) 
Ship.prototype.isSunk = function() {
  return this.touche >= this.taille;
};

module.exports = Ship;


