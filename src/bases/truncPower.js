import math from 'mathjs';

import linearRegression from './../linearRegression.js';

var truncPower = new function() {

  // border ratio (>0) used for calculation of the default interval for the regualizer calculation
  var br = 1/20;

  //#### properties ####
  this.defaults = {
    regualizer: "Sq2ndDer",
    knots: true,
  }

  //#### methods ####
  this.calcKnots = function(data) {
    // copy of the array
    var knots = data.X.map(value => value);
    knots.sort();
    for (let i = 0; i<knots.length-1; i++) {
      if (knots[i] == knots[i+1]) {
        knots.splice(i,1);
        i--;
      }
    }
    return knots;
  }

  this.calcRegression = function(input) {
    var data = input.data;
    var knots = input.knots;
    var regId = input.regualizer;
    var lambda = input.lambda;
    var interval = input.interval || [knots[0]-(knots[knots.length-1]-knots[0])*br,knots[knots.length-1]+(knots[knots.length-1]-knots[0])*br];

    var B = calcBaseMatrix(data.X,knots);
    var reg = calcRegualizer(regId,lambda,knots,interval);

    return linearRegression(B,data.Y,reg); 

  }

  this.sample = function(input) {
    var interval = input.interval;
    var res = input.res;
    var estPara = input.estPara;
    var knots = input.knots;

    var positions = [];
    positions.length = res;
    var delta = (interval[1]-interval[0])/(res-1)
    for (let i =0; i<res; i++) {
      positions[i] = i*delta+interval[0];
    }

    var B = calcBaseMatrix(positions,knots);
    var Y = math.multiply(B,estPara);

    return {X:positions,Y:Y};

  }

  this.sampleDer = function(input) {
    var interval = input.interval;
    var res = input.res;
    var estPara = input.estPara;
    var knots = input.knots;

    var positions = [];
    positions.length = res;
    var delta = (interval[1]-interval[0])/(res-1)
    for (let i =0; i<res; i++) {
      positions[i] = i*delta+interval[0];
    }

    var B = calcBaseDerMatrix(positions,knots);
    var Y = math.multiply(B,estPara);

    return {X:positions,Y:Y};

  }

  this.sample2ndDer = function(input) {
    var interval = input.interval;
    var res = input.res;
    var estPara = input.estPara;
    var knots = input.knots;

    var positions = [];
    positions.length = res;
    var delta = (interval[1]-interval[0])/(res-1)
    for (let i =0; i<res; i++) {
      positions[i] = i*delta+interval[0];
    }

    var B = calcBase2ndDerMatrix(positions,knots);
    var Y = math.multiply(B,estPara);

    return {X:positions,Y:Y};

  }

  this.eval = function(input) {
    var position = input.pos;
    var knots = input.knots;
    var estPara = input.estPara;

    var B = calcBaseMatrix([position],knots);
    var Y = math.multiply(B,estPara);

    return {X:[position],Y:Y};

  }

  this.evalIntegral = function(input) {
    var interval = input.interval;
    var knots = input.knots;
    var estPara = input.estPara;

    var B = calcBaseIntValues(interval,knots);

    return math.multiply(B,estPara);

  }

  this.calcFittedValues = function(input) {
    var X = input.data.X;
    var knots = input.knots;
    var estPara = input.estPara;

    var B = calcBaseMatrix(X,knots);
    var Y = math.multiply(B,estPara);

    return {X:X,Y:Y};
  }

  this.analyticString = function(input) {
    var knots = input.knots;
    var estPara = input.estPara;

    var string = "";
    string += estPara[0];
    string += estPara[1] >= 0 ? "+"+estPara[1]+"x" : estPara[1]+"x";
    string += estPara[2] >= 0 ? "+"+estPara[2]+"x^2" : estPara[2]+"x^2";
    string += estPara[3] >= 0 ? "+"+estPara[3]+"x^3" : estPara[3]+"x^3";
    for (let i = 0; i < knots.length; i++) {
      string += estPara[i+4] >= 0 ? "+"+estPara[i+4] : estPara[i+4];
      string += knots[i] >= 0 ? "(x+"+knots[i]+")^3" : +"(x"+knots[i]+")^3";
    }

    return string;
  }

  //#### private functions #####
  function calcBaseMatrix(positions,knots) {

    var N = knots.length;
    var B = [];
    B.length = positions.length;
    for (let i =0; i<B.length; i++) {
      B[i] = new Array(N+4);
    }

    for (let i = 0; i < positions.length; i++){
      B[i][0] = 1;
      B[i][1] = positions[i];
      B[i][2] = Math.pow(positions[i], 2);
      B[i][3] = Math.pow(positions[i], 3);
      for (let j = 0; j < N; j++){
        B[i][j + 4] = Math.max(Math.pow(positions[i] - knots[j], 3), 0);
      }
    }

    return B;

  }

  function calcBaseDerMatrix(positions,knots) {

    var N = knots.length;
    var B = [];
    B.length = positions.length;
    for (let i =0; i<B.length; i++) {
      B[i] = new Array(N+4);
    }

    for (let i = 0; i < positions.length; i++){
      B[i][0] = 0;
      B[i][1] = 1;
      B[i][2] = 2*positions[i];
      B[i][3] = 3*Math.pow(positions[i], 2);
      for (let j = 0; j < N; j++){
        B[i][j + 4] = positions[i] > knots[j] ? 3*Math.pow(positions[i] - knots[j], 2) : 0;
      }
    }

    return B;

  }

  function calcBase2ndDerMatrix(positions,knots) {

    var N = knots.length;
    var B = [];
    B.length = positions.length;
    for (let i =0; i<B.length; i++) {
      B[i] = new Array(N+4);
    }

    for (let i = 0; i < positions.length; i++){
      B[i][0] = 0;
      B[i][1] = 0;
      B[i][2] = 2;
      B[i][3] = 6*positions[i];
      for (let j = 0; j < N; j++){
        B[i][j + 4] = positions[i] > knots[j] ? 6*(positions[i] - knots[j]) : 0;
      }
    }

    return B;

  }

  function calcBaseIntValues(interval,knots) {

    var N = knots.length;
    var a = interval[0];
    var b = interval[1];

    var B = [];
    B.length = n+4;

    B[0] = b-a;
    B[1] = 0.5*(Math.pow(b,2)-Math.pow(a,2));
    B[2] = (1/3)*(Math.pow(b,3)-Math.pow(a,3));
    B[3] = 0.25*(Math.pow(b,4)-Math.pow(a,4));
    for (let i = 0; i<N; i++) {
      B[i+4] = 0;
      if (a > knots[i]) {
        B[i+4] += 0.25*Math.pow(a-knots[i],4)
      }
      if (b > knots[i]) {
        B[i+4] += 0.25*Math.pow(b-knots[i],4)
      }
      // knot is negativ
      if (knot[i] < 0) {
        B[i+4] -= 0.25*Math.pow(knot[i],4);
      }
    }

    return B;

  }

  function calcRegualizer(regId,lambda,knots,interval) {

    switch(regId) {
      case "Sq2ndDer":
        var a = interval[0];
        var b = interval[1];
        var reg = [];
        reg.length = knots.length+4;
        for (let i = 0; i<reg.length; i++) {
          reg[i] = new Array(reg.length);
          reg[i].fill(0);
        }

        reg[2][2] = 4*(b-a);
        reg[2][3] = 6*(b*b-a*a);
        reg[3][3] = 12*(Math.pow(b,3)-Math.pow(a,3));

        for (let i=4; i<reg.length; i++) {
          reg[i][2] = reg[2][i] = 6*b*(b-2*knots[i-4])+6*Math.pow(knots[i-4],2);
          reg[i][3] = reg[3][i] = 6*Math.pow(b,2)*(2*b-3*knots[i-4])+6*Math.pow(knots[i-4],3);
          for (let j=i; j<reg.length; j++) {
            reg[i][j] = reg[j][i] = 6*b*(b*(2*b-3*(knots[i-4]+knots[j-4]))+6*knots[i-4]*knots[j-4])+6*Math.pow(knots[j-4],3)-18*Math.pow(knots[j-4],2)*knots[i-4];
          }
        }
        reg = math.multiply(reg,lambda);
        return reg;

      case "ridge":

        var reg = math.multiply(math.eye(knots.length+4).toArray(),lambda);
        reg[0][0] = 0;
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

export default truncPower;