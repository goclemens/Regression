import truncPower from "./bases/truncPower.js";
import linear from "./bases/linear.js";


// #### object definition ####
function Regression(options) {

  // ---- Constructor ----

  // init properties
  this.data = false;
  this.currentBasis = false;
  this.knots = false;
  this.regualizer = false;
  this.lambda = 0;
  this.estPara = false;
  this.dof = 0;

  Object.assign(this,options);

  if (options.basis) {
    this.setBasis(options.basis);
    delete this.basis;
  }
  // ---------------------

}
// ###########################



// #### properties ####
Regression.prototype.bases = {
  "trunc-power": truncPower,
  "linear": linear
};
// ####################



// #### methods ####
// set basis to the given basis id
Regression.prototype.setBasis = function(basisId) {
  var basis = this.bases[basisId];
  this.currentBasis = basis;

  if (!this.knots) {
    if (basis.defaults.knots) {
      this.knots = basis.calcKnots(this.data);
    }
  }
  if (!this.regualizer) {
    this.regualizer = basis.defaults.regualizer;
  }
}

// trigger the calculation of the regression and save  the estemation parameter and degree of freedom to the object
Regression.prototype.calcRegression = function(options) {

  if (options) {
    Object.assign(this,options);
  }

  if (options.basis) {
    this.setBasis(options.basis);
    delete this.basis;
  }

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
// #################


export default Regression;