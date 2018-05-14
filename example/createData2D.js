function createData2D(num) {
  var data = [[],[]];
  data[0].length = data[1].length = num;

  for (var i = 0; i < num; i++){
    var a = Math.round(600 * Math.random())/100;
    data[0][i] = a;
    data[1][i] = 1+0.9 * Math.sin(a) + (0.55 * Math.random());
  }

  return data;

}