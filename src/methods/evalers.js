import Regression from "../Regression.js";

// evaluate the regression function at the given position
Regression.prototype.eval = function(pos) {

  if (!this.estPara) {
    this.calcRegression();
  }

  return this.currentBasis.eval({
    pos: pos,
    estPara : this.estPara,
    knots: this.knots
  })

}

// evaluate the 1st derivative of regression function at the given position
Regression.prototype.evalDer = function(pos) {

  if (!this.estPara) {
    this.calcRegression();
  }

  return this.currentBasis.evalDer({
    pos: pos,
    estPara : this.estPara,
    knots: this.knots
  })

}

// evaluate the 2nd derivative of regression function at the given position
Regression.prototype.eval2ndDer = function(pos) {

  if (!this.estPara) {
    this.calcRegression();
  }

  return this.currentBasis.eval2ndDer({
    pos: pos,
    estPara : this.estPara,
    knots: this.knots
  })

}

// calculate the definite integral for the given limets (interval)
Regression.prototype.evalIntegral = function(interval) {

  if (!this.estPara) {
    this.calcRegression();
  }

  return this.currentBasis.evalIntegral({
    inteval: interval,
    estPara : this.estPara,
    knots: this.knots
  })

}