// #####################################################
// LINEAR REGRESSION:
// ------------------
//
// Given a discrete n-dim scalar dataset X(n-dim) => Y(scalar)
// dataset: [[1. vector],[2. vector],...] => [1. value, 2. value,...]
//
// returns object:  {
//                    estPara,
//                    fittedValues,
//                    projMatrix,
//                    dof
//                  }
//
// single objects can be calculated by method
//  esitmated parameter (beta)  - linearRegression.estPara(X,Y)
//  fitted values (y hat)       - linearRegression.fittedValues(X,Y)
//  projection matrix (L)       - linearRegression.projectionMatrix(X,Y)
//
// 
// -----------------------------
// inputs:
//  X - matrix of floats (basis values)
//  Y - array of floats (response values)
//  reg - regulizer matrix 
// #####################################################
import math from 'mathjs';


var linearRegression = function() {

  function linearRegression(X,Y,reg) {
    
    var T = math.transpose(X);

    if (reg == undefined || reg == false) {
      var interim = math.multiply(math.inv(math.multiply(T,X)),T);
    } else {
      var interim = math.multiply(math.inv(math.add(math.multiply(T,X),reg)),T);
    }

    // estimated parameter "beta"
    var estPara = math.multiply(interim,Y);
    // fitted values "Y^" (hat)
    var fittedValues = math.multiply(X,estPara);
    // projection matrix "P" (hat matrix)
    var projMatrix = math.multiply(X,interim);
    // effective degrees of freedom "dof"
    var dof = math.trace(projMatrix);

    return  {
              estPara: estPara,
              fittedValues: fittedValues,
              projMatrix: projMatrix,
              dof: dof
            };

  }

  // single methods
  linearRegression.estPara = function(X,Y,reg) {

    var T = math.transpose(X);

    if (reg == undefined) {
      var interim = math.multiply(math.inv(math.multiply(T,X)),T);
    } else {
      var interim = math.multiply(math.inv(math.add(math.multiply(T,X),reg)),T);
    }

    var estPara = math.multiply(interim,Y);

    return estPara;

  }

  linearRegression.fittedValues = function(X,Y,reg) {

    var T = math.transpose(X);
    if (reg == undefined) {
      var interim = math.multiply(math.inv(math.multiply(T,X)),T);
    } else {
      var interim = math.multiply(math.inv(math.add(math.multiply(T,X),reg)),T);
    }
    var fittedValues = math.multiply(X,math.multiply(interim,Y));

    return fittedValues;

  }

  linearRegression.projMatrix = function(X,Y,reg) {

    var T = math.transpose(X);
    if (reg == undefined) {
      var interim = math.multiply(math.inv(math.multiply(T,X)),T);
    } else {
      var interim = math.multiply(math.inv(math.add(math.multiply(T,X),reg)),T);
    }
    var projMatrix = math.multiply(X,interim);

    return projMatrix;

  }

  return linearRegression;

}();


export default linearRegression;