import truncPower from "./bases/truncPower.js";
import linear from "./bases/linear.js";

// methods
import "./methods/calcRegression.js";
import "./methods/samplers.js";
import "./methods/analyticString.js";
import "./methods/evalers.js";

import "./methods/means.js";
import "./methods/roots.js";
import "./methods/extrema.js";

// #### object definition ####
function Regression(options) {

  // ---- Constructor ----

  // init properties
  this.data = false;
  this.currentBasis = false;
  this.knots = false;
  this.regualizer = false;
  this.lambda = 0.01;
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
// #################


export default Regression;