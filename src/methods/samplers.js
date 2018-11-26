import Regression from "../Regression.js";

// sample the regression function in a given interval with the given resolution,
//  -> if not done yet, trigger the regression calculation
Regression.prototype.sample = function(interval,res) {

  if (!this.estPara) {
    this.calcRegression();
  }

  return this.currentBasis.sample({
    interval: interval,
    res: res,
    estPara : this.estPara,
    knots: this.knots
  })
}

// sample the first derivative of the regression function
Regression.prototype.sampleDer = function(interval,res) {

  if (!this.estPara) {
    this.calcRegression();
  }

  return this.currentBasis.sampleDer({
    interval: interval,
    res: res,
    estPara : this.estPara,
    knots: this.knots
  })
}

// sample the second derivative of the regression function
Regression.prototype.sample2ndDer = function(interval,res) {

  if (!this.estPara) {
    this.calcRegression();
  }

  return this.currentBasis.sample2ndDer({
    interval: interval,
    res: res,
    estPara : this.estPara,
    knots: this.knots
  })
}