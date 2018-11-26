import Regression from "../Regression.js";


Regression.prototype.extrema = function() {

  var max = [];
  var min = [];
  var saddle = [];


  var rootsDer = this.rootsDer();

  var num = rootsDer.length;

  // check for min or max or else
  for (let i=0 ; i<rootsDer.length ; i++) {

    if ( Array.isArray(rootsDer[i]) ) {
      saddle.push(rootsDer[i]);
      continue;
    }

    let secDer = this.eval2ndDer(rootsDer[i]).Y

    if (secDer < 0) {
      max.push(rootsDer[i]);
    }

    else if (secDer > 0) {
      min.push(rootsDer[i]);
    }

    else {
      let off = (this.dataInterval[1]-this.dataInterval[0])/10000;
      let left = this.evalDer(rootsDer[i]-off).Y;
      let right = this.evalDer(rootsDer[i]+off).Y;

      if ( left < rootsDer[i] && right < rootsDer[i] ) {
        max.push(rootsDer[i]);
      }
      else if ( left > rootsDer[i] && right > rootsDer[i] ) {
        min.push(rootsDer[i]);
      } else {
        saddle.push(rootsDer[i]);
      }
    }

  }



  return {
    max: max,
    min: min,
    saddle: saddle,
    num: num
  }

}