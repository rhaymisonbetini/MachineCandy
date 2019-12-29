var Match3 = Match3 || {};

Match3.Board = function (state, rows, cols, blockVariations) {

  this.state = state;
  this.rows = rows;
  this.cols = cols;
  this.blockVariations = blockVariations;

  this.grid = [];

  //criando a matriz e a matriz reserva
  var i, j;
  for (i = 0; i < rows; i++) {
    this.grid.push([]);

    for (j = 0; j < cols; j++) {
      this.grid[i].push(0);
    }
  }

  this.reserveGrid = [];

  this.RESERVE_ROW = rows;

  for (i = 0; i < this.RESERVE_ROW; i++) {
    this.reserveGrid.push([]);

    for (j = 0; j < cols; j++) {
      this.reserveGrid[i].push(0);
    }
  }

  this.populateGrid();
  this.populateReserveGrid();

};

//populando a matriz e a matriz reserva
Match3.Board.prototype.populateGrid = function () {
  var i, j;
  for (i = 0; i < this.rows; i++) {
    for (j = 0; j < this.cols; j++) {
      this.grid[i][j] = Math.floor(Math.random() * this.blockVariations) + 1;
    }
  }

  var chains = this.findAllChains();
  if (chains.length > 0) {
    this.populateGrid();
  }

};

Match3.Board.prototype.populateReserveGrid = function () {
  var i, j;
  for (i = 0; i < this.RESERVE_ROW; i++) {
    for (j = 0; j < this.cols; j++) {
      this.reserveGrid[i][j] = Math.floor(Math.random() * this.blockVariations) + 1;
    }
  }
};

//trocando blocos de lugar

Match3.Board.prototype.swap = function (source, target) {
  let temp = this.grid[target.row][target.col];
  this.grid[target.row][target.col] = this.grid[source.row][source.col]; //trocando de lugar
  this.grid[source.row][source.col] = temp; //passando o valor apos a troca de lugar;
};

//verificando se blocos sao adjacentes

Match3.Board.prototype.checkAdjacent = function (source, target) {
  var difInRow = Math.abs(source.row - target.row);
  var difInCol = Math.abs(source.col - target.col);

  var isAdjacent = (difInRow == 1 && difInCol === 0) || (difInRow === 0 && difInCol == 1);
  return isAdjacent;
};


//verificando o match de blocos ou nao

Match3.Board.prototype.isChained = function (block) {
  let isChained = false;
  let variation = this.grid[block.row][block.col];
  let row = block.row;
  let col = block.col;

  //verificando esquerda
  if (variation == this.grid[row][col - 1] && variation == this.grid[row][col - 2]) {
    isChained = true;
  }

  //verificando a direita
  if (variation == this.grid[row][col + 1] && variation == this.grid[row][col + 2]) {
    isChained = true;
  }

  //verificando cima
  if (this.grid[row - 2]) {
    if (variation == this.grid[row - 1][col] && variation == this.grid[row - 2][col]) {
      isChained = true;
    };
  };


  //verificando baixo
  if (this.grid[row + 2]) {
    if (variation == this.grid[row + 1][col] && variation == this.grid[row + 2][col]) {
      isChained = true;
    };
  };

  //verificando o centro e horizontalmente
  if (variation == this.grid[row][col - 1] && variation == this.grid[row][col + 1]) {
    isChained = true;
  }

  //verificando o centro e verticalmente
  if (this.grid[row + 1] && this.grid[row - 1]) {
    if (variation == this.grid[row + 1][col] && variation == this.grid[row - 1][col]) {
      isChained = true;
    };
  };

  return isChained;
};

//encontrando todo os metodos

Match3.Board.prototype.findAllChains = function () {
  var chained = [];
  var i, j;

  for (i = 0; i < this.rows; i++) {
    for (j = 0; j < this.cols; j++) {
      if (this.isChained({ row: i, col: j })) {
        chained.push({ row: i, col: j });
      }
    }
  }

  return chained;
};

//limpando todos os matchs
Match3.Board.prototype.clearChains = function () {
  var chainedBlocks = this.findAllChains();
  chainedBlocks.forEach(function (block) {
    this.grid[block.row][block.col] = 0;
    this.state.getBlockFromColRow(block).kill();
  }, this);
};

//dropando os blocos da matriz reserva
Match3.Board.prototype.dropBlock = function (sourceRow, targetRow, col) {
  this.grid[targetRow][col] = this.grid[sourceRow][col];
  this.grid[sourceRow][col] = 0;
  this.state.dropBlock(sourceRow, targetRow, col);
};

Match3.Board.prototype.dropReserveBlock = function (sourceRow, targetRow, col) {
  this.grid[targetRow][col] = this.reserveGrid[sourceRow][col];
  this.reserveGrid[sourceRow][col] = 0;
  this.state.dropReserveBlock(sourceRow, targetRow, col);

};

//movimentando os bloco para os slot vazios

Match3.Board.prototype.updateGrid = function () {
  var i, j, k, foundBlock;

  for (i = this.row - 1; i > 0; i--) {
    for (j = 0; j < this.cols; j++) {
      if (this.grid[i][j] === 0) {
        foundBlock = false;
        for (k = i - 1; k >= 0; k--) {
          if (this.grid[k][j] > 0) {
            this.dropBlock(k, i, j);
            foundBlock = true;
            break;
          }
        }
        if (!foundBlock) {
          for (k = this.RESERVE_ROW - 1; k >= 0; k--) {
            if (this.reserveGrid[k][j] > 0) {
              this.dropReserveBlock(k, i, j);
              break;
            }
          }
        }
      }
    }
  }

  //repopulando a reserva
  this.populateReserveGrid();
};
