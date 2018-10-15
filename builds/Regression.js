(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('mathjs')) :
  typeof define === 'function' && define.amd ? define(['mathjs'], factory) :
  (global.Regression = factory(global.math));
}(this, (function (math) { 'use strict';

  math = math && math.hasOwnProperty('default') ? math['default'] : math;

  // #####################################################


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

    };

    linearRegression.fittedValues = function(X,Y,reg) {

      var T = math.transpose(X);
      if (reg == undefined) {
        var interim = math.multiply(math.inv(math.multiply(T,X)),T);
      } else {
        var interim = math.multiply(math.inv(math.add(math.multiply(T,X),reg)),T);
      }
      var fittedValues = math.multiply(X,math.multiply(interim,Y));

      return fittedValues;

    };

    linearRegression.projMatrix = function(X,Y,reg) {

      var T = math.transpose(X);
      if (reg == undefined) {
        var interim = math.multiply(math.inv(math.multiply(T,X)),T);
      } else {
        var interim = math.multiply(math.inv(math.add(math.multiply(T,X),reg)),T);
      }
      var projMatrix = math.multiply(X,interim);

      return projMatrix;

    };

    return linearRegression;

  }();

  var truncPower = new function() {

    // border ratio (>0) used for calculation of the default interval for the regualizer calculation
    var br = 1/20;

    //#### properties ####
    this.defaults = {
      regualizer: "Sq2ndDer",
      knots: true,
    };

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
    };

    this.calcRegression = function(input) {
      var data = input.data;
      var knots = input.knots;
      var regId = input.regualizer;
      var lambda = input.lambda;
      var interval = input.interval || [knots[0]-(knots[knots.length-1]-knots[0])*br,knots[knots.length-1]+(knots[knots.length-1]-knots[0])*br];

      var B = calcBaseMatrix(data.X,knots);
      var reg = calcRegualizer(regId,lambda,knots,interval);

      return linearRegression(B,data.Y,reg); 

    };

    this.sample = function(input) {
      var interval = input.interval;
      var res = input.res;
      var estPara = input.estPara;
      var knots = input.knots;

      var positions = [];
      positions.length = res;
      var delta = (interval[1]-interval[0])/(res-1);
      for (let i =0; i<res; i++) {
        positions[i] = i*delta+interval[0];
      }

      var B = calcBaseMatrix(positions,knots);
      var Y = math.multiply(B,estPara);

      return {X:positions,Y:Y};

    };

    this.sampleDer = function(input) {
      var interval = input.interval;
      var res = input.res;
      var estPara = input.estPara;
      var knots = input.knots;

      var positions = [];
      positions.length = res;
      var delta = (interval[1]-interval[0])/(res-1);
      for (let i =0; i<res; i++) {
        positions[i] = i*delta+interval[0];
      }

      var B = calcBaseDerMatrix(positions,knots);
      var Y = math.multiply(B,estPara);

      return {X:positions,Y:Y};

    };

    this.sample2ndDer = function(input) {
      var interval = input.interval;
      var res = input.res;
      var estPara = input.estPara;
      var knots = input.knots;

      var positions = [];
      positions.length = res;
      var delta = (interval[1]-interval[0])/(res-1);
      for (let i =0; i<res; i++) {
        positions[i] = i*delta+interval[0];
      }

      var B = calcBase2ndDerMatrix(positions,knots);
      var Y = math.multiply(B,estPara);

      return {X:positions,Y:Y};

    };

    this.eval = function(input) {
      var position = input.pos;
      var knots = input.knots;
      var estPara = input.estPara;

      var B = calcBaseMatrix([position],knots);
      var Y = math.multiply(B,estPara);

      return {X:[position],Y:Y};

    };

    this.evalDer = function(input) {
      var position = input.pos;
      var knots = input.knots;
      var estPara = input.estPara;

      var B = calcBaseDerMatrix([position],knots);
      var Y = math.multiply(B,estPara);

      return {X:[position],Y:Y};

    };

    this.eval2ndDer = function(input) {
      var position = input.pos;
      var knots = input.knots;
      var estPara = input.estPara;

      var B = calcBase2ndDerMatrix([position],knots);
      var Y = math.multiply(B,estPara);

      return {X:[position],Y:Y};

    };

    this.evalIntegral = function(input) {
      var interval = input.interval;
      var knots = input.knots;
      var estPara = input.estPara;

      var B = calcBaseIntValues(interval,knots);

      return math.multiply(B,estPara);

    };

    this.calcFittedValues = function(input) {
      var X = input.data.X;
      var knots = input.knots;
      var estPara = input.estPara;

      var B = calcBaseMatrix(X,knots);
      var Y = math.multiply(B,estPara);

      return {X:X,Y:Y};
    };

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
        string += knots[i] > 0 ? "(x"+(-knots[i])+")^3" : +"(x+"+(-knots[i])+")^3";
      }

      return string;
    };

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
          B[i+4] += 0.25*Math.pow(a-knots[i],4);
        }
        if (b > knots[i]) {
          B[i+4] += 0.25*Math.pow(b-knots[i],4);
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
          console.log("truncPower: "+regId+" is not a supported regualizer");
          return false;
      }
    }

  };

  var linear = new function() {

    //#### properties ####
    this.defaults = {
      regualizer: "none",
      knots: false
    };

    //#### methods ####
    this.calcKnots = function() {
      console.log("linear - no knots needed for this basis");
      return false;
    };

    this.calcRegression = function(input) {
      var data = input.data;
      var regId = input.regualizer;
      var lambda = input.lambda;

      var B = calcBaseMatrix(data.X);
      var reg = calcRegualizer(regId,lambda);

      return linearRegression(B,data.Y,reg); 

    };

    this.analyticString = function(input) {
      var estPara = input.estPara;

      var string = "";
      string += estPara[0];
      string += estPara[1] >= 0 ? "+"+estPara[1]+"x" : estPara[1]+"x";

      return string;
    };

    this.sample = function(input) {
      var interval = input.interval;
      var res = input.res;
      var estPara = input.estPara;

      var positions = [];
      positions.length = res;
      var delta = (interval[1]-interval[0])/(res-1);
      for (let i =0; i<res; i++) {
        positions[i] = i*delta+interval[0];
      }

      var B = calcBaseMatrix(positions);
      var Y = math.multiply(B,estPara);

      return {X:positions,Y:Y};

    };

    this.sampleDer = function(input) {
      var interval = input.interval;
      var res = input.res;
      var estPara = input.estPara;

      var positions = [];
      positions.length = res;
      var delta = (interval[1]-interval[0])/(res-1);
      for (let i =0; i<res; i++) {
        positions[i] = i*delta+interval[0];
      }

      var Y = [];
      Y.length = res;
      Y.fill(estPara[0]);

      return {X:positions,Y:Y};

    };

    this.sample2ndDer = function(input) {
      var interval = input.interval;
      var res = input.res;

      var positions = [];
      positions.length = res;
      var delta = (interval[1]-interval[0])/(res-1);
      for (let i =0; i<res; i++) {
        positions[i] = i*delta+interval[0];
      }

      var Y = [];
      Y.length = res;
      Y.fill(0);

      return {X:positions,Y:Y};

    };

    this.eval = function(input) {
      var position = input.pos;
      var estPara = input.estPara;

      var B = calcBaseMatrix([position]);
      var Y = math.multiply(B,estPara);

      return {X:[position],Y:Y};

    };

    this.evalDer = function(input) {
      var position = input.pos;
      var estPara = input.estPara;

      return {X:[position],Y:[estPara[0]]};

    };

    this.eval2ndDer = function(input) {
      var position = input.pos;
      var estPara = input.estPara;

      return {X:[position],Y:[0]};

    };

    this.evalIntegral = function(input) {
      var a = input.interval[0];
      var b = input.interval[1];
      var estPara = input.estPara;

      return estPara[0]*(b-a)+estPara[1]*0.5*(Math.pow(b,2)-Math.pow(a,2));
    };

    this.calcFittedValues = function(input) {
      var X = input.data.X;
      var estPara = input.estPara;

      var B = calcBaseMatrix(X);
      var Y = math.multiply(B,estPara);

      return {X:X,Y:Y};
    };

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

          var reg = [[0,0],[0,lambda]];
          return reg;

        case "none":

          var reg = false;
          return reg;

        default:
          console.log("truncPower: "+regId+" is not a supported regualizer");
          return false;
      }
    }

  };

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
  };

  // trigger the calculation of the regression and save  the estemation parameter and degree of freedom to the object
  Regression.prototype.calcRegression = function(options) {

    if (options) {
      Object.assign(this,options);
      if (options.basis) {
        this.setBasis(options.basis);
        delete this.basis;
      }
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
  };

  // get an string with the analytic function the regression produced
  Regression.prototype.analyticString = function() {

    if (!this.estPara) {
      this.calcRegression();
    }

    return this.currentBasis.analyticString({
      estPara : this.estPara,
      knots: this.knots
    });
  };

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
  };

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
  };

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
  };

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

  };

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

  };

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

  };

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

  };

  return Regression;

})));
