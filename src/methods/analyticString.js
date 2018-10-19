import Regression from "../Regression.js";

// get an string with the analytic function the regression produced
Regression.prototype.analyticString = function() {

  if (!this.estPara) {
    this.calcRegression();
  }

  return this.currentBasis.analyticString({
    estPara : this.estPara,
    knots: this.knots
  });
}