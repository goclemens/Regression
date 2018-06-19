import math from 'mathjs';

import linearRegression from './../linearRegression.js';

var linear = new function() {

  //#### properties ####
  this.defaults = {
    regualizer: "none",
    knots: false
  }

  //#### methods ####
  this.calcKnots = function() {
    console.log("linear - no knots needed for this basis")
    return false;
  }

  this.calcRegression = function(input) {
    var data = input.data;
    var regId = input.regualizer;
    var lambda = input.lambda;

    var B = calcBaseMatrix(data.X);
    var reg = calcRegualizer(regId,lambda);

    return linearRegression(B,data.Y,reg); 

  }

  this.analyticString = function(input) {
    var estPara = input.estPara;

    var string = ""
    string += estPara[0];
    string += estPara[1] >= 0 ? "+"+estPara[1]+"x" : estPara[1]+"x";

    return string;
  }

  this.sample = function(input) {
    var interval = input.interval;
    var res = input.res;
    var estPara = input.estPara;

    var positions = [];
    positions.length = res;
    var delta = (interval[1]-interval[0])/(res-1)
    for (let i =0; i<res; i++) {
      positions[i] = i*delta+interval[0];
    }

    var B = calcBaseMatrix(positions);
    var Y = math.multiply(B,estPara);

    return {X:positions,Y:Y};

  }

  this.sampleDer = function(input) {
    var interval = input.interval;
    var res = input.res;
    var estPara = input.estPara;

    var positions = [];
    positions.length = res;
    var delta = (interval[1]-interval[0])/(res-1)
    for (let i =0; i<res; i++) {
      positions[i] = i*delta+interval[0];
    }

    var Y = [];
    Y.length = res;
    Y.fill(estPara[0]);

    return {X:positions,Y:Y};

  }

  this.sample2ndDer = function(input) {
    var interval = input.interval;
    var res = input.res;

    var positions = [];
    positions.length = res;
    var delta = (interval[1]-interval[0])/(res-1)
    for (let i =0; i<res; i++) {
      positions[i] = i*delta+interval[0];
    }

    var Y = [];
    Y.length = res;
    Y.fill(0);

    return {X:positions,Y:Y};

  }

  this.eval = function(input) {
    var position = input.pos;
    var estPara = input.estPara;

    var B = calcBaseMatrix([position]);
    var Y = math.multiply(B,estPara);

    return {X:[position],Y:Y};

  }

  this.evalIntegral = function(input) {
    var a = input.interval[0];
    var b = input.interval[1];
    var estPara = input.estPara;

    return estPara[0]*(b-a)+estPara[1]*0.5*(Math.pow(b,2)-Math.pow(a,2));
  }

  this.calcFittedValues = function(input) {
    var X = input.data.X;
    var estPara = input.estPara;

    var B = calcBaseMatrix(X);
    var Y = math.multiply(B,estPara);

    return {X:X,Y:Y};
  }

  //#### private functions #####
  function calcBaseMatrix(positions) {

    // init Base Matrix
    var B = [];
    B.length = positions.length;
    for (let i =0; i<B.length; i++) {
      B[i] = new Array(2);
    }

    // calculate Base values
    for (let i = 0; i < positions.length; i++){
      B[i][0] = 1;
      B[i][1] = positions[i];
    }

    return B;

  }

  function calcRegualizer(regId,lambda) {

    switch(regId) {

      // ridge regualizer is equal to the Sq2ndDer (except a konstant factor)
      case "ridge":

        var reg = [[0,0],[0,lambda]]
        return reg;

      case "none":

        var reg = false;
        return reg;

      default:
        console.log("truncPower: "+regId+" is not a supported regualizer")
        return false;
    }
  }

}

export default linear;