import Regression from "../Regression.js";

Regression.prototype.mean = function(interval) {

  return this.evalIntegral(interval)/(interval[1]-interval[0]);

}

Regression.prototype.meanDer = function(interval) {

  return (this.eval(interval[1])-this.eval(interval[0]))/(interval[1]-interval[0]);

}

Regression.prototype.mean2ndDer = function(interval) {

  return (this.evalDer(interval[1])-this.evalDer(interval[0]))/(interval[1]-interval[0]);

}