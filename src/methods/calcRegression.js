import Regression from "../Regression.js";

// trigger the calculation of the regression and save  the estemation parameter and degree of freedom to the object
Regression.prototype.calcRegression = function(options) {

  if (options) {
    Object.assign(this,options);
    if (options.basis) {
      this.setBasis(options.basis);
      delete this.basis;
    }
  }

  if (!this.data) {
    console.log("Regression - data is not defined");
    return false;
  }

  this.dataInterval = [this.data.X[0],this.data.X[this.data.X.length-1]];

  var output = this.currentBasis.calcRegression({
    data: this.data,
    regualizer: this.regualizer,
    knots: this.knots,
    lambda: this.lambda
  });

  this.estPara = output.estPara;
  this.dof = output.dof;

  return output;
} 