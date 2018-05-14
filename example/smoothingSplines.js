//#### DATA ####
// create random points for testing (SIN)
var data = createData2D(60);
data = data[0].map(function(v,i) {return {x:v,y:data[1][i]}})
              .sort(function(a,b){return a.x-b.x})

var X = data.map(function(value) {return value.x});
var Y = data.map(function(value) {return value.y});

var lambda = Number(document.getElementById("points").value)/10;

// make regression and sample graphdata
var regressionTest = new Regression({
                                      data: {X:X,Y:Y},
                                      basis: "trunc-power",
                                      // regualizer: "ridge",
                                      //knots: [0,1,3,3.5,5.4,5.8],
                                      lambda: lambda,
                                    });

console.log("here")

var dof = regressionTest.calcRegression().dof;

var sampled = regressionTest.sample([-0.1,6],100);
var sampledDer = regressionTest.sampleDer([-0.1,6],100);
var sampled2ndDer = regressionTest.sample2ndDer([-0.1,6],200);

var dataFit = sampled.X.map(function(value,index) {return {'x':value, 'y':sampled.Y[index]}});
var dataDerFit = sampledDer.X.map(function(value,index) {return {'x':value, 'y':sampledDer.Y[index]}});
var data2ndDerFit = sampled2ndDer.X.map(function(value,index) {return {'x':value, 'y':sampled2ndDer.Y[index]}});

regressionTest.calcRegression({regualizer: "ridge"});

var sampledRidge = regressionTest.sample([-0.1,6],100);
var dataRidge = sampledRidge.X.map(function(value,index) {return {'x':value, 'y':sampledRidge.Y[index]}});
//##############

// #### inputs/options ####
document.getElementById("points").style.width = "700px";
var lambda = Number(document.getElementById("points").value);
d3.select("label")
  .text("lambda: " + parseFloat(Math.round(lambda * 100) / 100).toFixed(2));



d3.select("#dof")
  .text("Estimated Degrees of Freedom: " + dof);

var margin = {top: 80, right: 180, bottom: 80, left: 180};
var width_outer = 960;
var height_outer = 500;

// dependent options
var width = width_outer - margin.left - margin.right;
var height = height_outer - margin.top - margin.bottom;

// #### calculation ####
var basis = smoothingSplines(data, data);
var output = RidgeRegression(basis, lambda);



var params = output[0];
var dof = output[1];

dof = Math.round(dof * 100)/100;

// Generate smooth line
var Xhat = [];
var i = 0;
var j = 0;

for (i = 1; i < 600; i++){
  var val = smoothingSplines([{'x': i/100, 'y':0}], data);

  var yhat = 0.0;

	for (j = 0; j < params.length; j++){
		yhat += params[j][0] * val.x[0][j];
  }

	Xhat.push({'x': i/100, 'y': yhat});
}

// #### visualization ####
d3.select("#dof")
	.text("Estimated Degrees of Freedom: " + dof);



var svg = d3.select("body").append("svg")
	.attr("width", width_outer)
  .attr("height", height_outer)
	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var y = d3.scaleLinear()
		.domain([-2, 3])
		.range([height, 0]);

var x = d3.scaleLinear()
		.domain([0, 6])
    .range([0, width])

// axis
var xAxis = d3.axisBottom()
	.scale(x)


var yAxis = d3.axisLeft()
	.scale(y)


svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis)

svg.append("g")
	.attr("class", "y axis")
	.call(yAxis);


// scatterplott of data
svg.selectAll(".dot")
	.data(data)
	.enter().append("circle")
	.attr("class", "dot")
	.attr("r", 3.5)
	.attr("cx", function(d){
		return x(d.x);
	})
	.attr("cy", function(d){
		return y(d.y)
	})
	.style("fill", "black");

  
// line overlay
var line = d3.line()
	.x(function(d) { return x(d.x); })
  .y(function(d) { return y(d.y); });

svg.append("path")
      .datum(dataFit)
      .attr("id","dataFit")
      .attr("class", "line")
      .attr("d", line);

svg.append("path")
      .datum(dataDerFit)
      .attr("id","dataDerFit")
      .attr("class", "line")
      .attr("d", line)
      .style("stroke","red")

svg.append("path")
      .datum(data2ndDerFit)
      .attr("id","data2ndDerFit")
      .attr("class", "line")
      .attr("d", line)
      .style("stroke","purple")

svg.append("path")
      .datum(dataRidge)
      .attr("id","dataRidge")
      .attr("class", "line")
      .attr("d", line)
      .style("stroke","green")


// update for input change

d3.select("#points")
	.on("input", function(d){
		
		var lambda = document.getElementById("points").value/10;
		d3.select("label")
      .text("lambda: " + parseFloat(Math.round(lambda * 100) / 100).toFixed(2));

    var dof = regressionTest.calcRegression({lambda: lambda, regualizer: "Sq2ndDer"}).dof;


		d3.select("#dof")
			.text("Estimated Degrees of Freedom: " + dof);



    var sampled = regressionTest.sample([-0.1,6],100);
    var sampledDer = regressionTest.sampleDer([-0.1,6],100);
    var sampled2ndDer = regressionTest.sample2ndDer([-0.1,6],200);

    var dataFit = sampled.X.map(function(value,index) {return {'x':value, 'y':sampled.Y[index]}});
    var dataDerFit = sampledDer.X.map(function(value,index) {return {'x':value, 'y':sampledDer.Y[index]}});
    var data2ndDerFit = sampled2ndDer.X.map(function(value,index) {return {'x':value, 'y':sampled2ndDer.Y[index]}});

    regressionTest.calcRegression({regualizer: "ridge"});

    var sampledRidge = regressionTest.sample([-0.1,6],100);
    var dataRidge = sampledRidge.X.map(function(value,index) {return {'x':value, 'y':sampledRidge.Y[index]}});

		svg.selectAll("#dataFit")
		      .datum(dataFit)
		      .transition()
		      .attr("class", "line")
		      .attr("d", line);

    svg.selectAll("#dataDerFit")
          .datum(dataDerFit)
          .transition()
          .attr("class", "line")
          .attr("d", line);

    svg.selectAll("#data2ndDerFit")
          .datum(data2ndDerFit)
          .transition()
          .attr("class", "line")
          .attr("d", line);

    svg.selectAll("#dataRidge")
          .datum(dataRidge)
          .transition()
          .attr("class", "line")
          .attr("d", line);

});

