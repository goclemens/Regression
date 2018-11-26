import Regression from "../Regression.js";


Regression.prototype.rootsAll = function() {

  var rootsFunc = this.currentBasis.roots({
    dataInterval: this.dataInterval,
    estPara: this.estPara,
    knots: this.knots
  });

  var rootsDer = this.currentBasis.rootsDer({
    dataInterval: this.dataInterval,
    estPara: this.estPara,
    knots: this.knots
  });

  var roots2ndDer = this.currentBasis.roots2ndDer({
    dataInterval: this.dataInterval,
    estPara: this.estPara,
    knots: this.knots
  });

  return {
    func: rootsFunc,
    der: rootsDer,
    secDer: roots2ndDer
  }

}

Regression.prototype.roots = function() {

  return this.currentBasis.roots({
    dataInterval: this.dataInterval,
    estPara: this.estPara,
    knots: this.knots
  })

}

Regression.prototype.rootsDer = function() {

  return this.currentBasis.rootsDer({
    dataInterval: this.dataInterval,
    estPara: this.estPara,
    knots: this.knots
  })

}

Regression.prototype.roots2ndDer = function() {

  return this.currentBasis.roots2ndDer({
    dataInterval: this.dataInterval,
    estPara: this.estPara,
    knots: this.knots
  })

}