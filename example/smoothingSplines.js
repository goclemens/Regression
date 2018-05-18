// #### INITILAZING ####

  // ---- globals and defaults ----
    var pointNum = 60;
    var lambda = 2.00;
    var basis = "trunc-power";
    var regualizer = "Sq2ndDer";

    var margin = {top: 20, right: 40, bottom: 20, left: 40};
    var width_outer = 960;
    var height_outer = 500;
    var plotColors = ["blue","red","purple","green"];

    var showPlot = true;
    var showPlotDer = true;
    var showPlot2ndDer = true;

    // dependent options
    var width = width_outer - margin.left - margin.right;
    var height = height_outer - margin.top - margin.bottom;

    var dataNeedUpdate = true;
    var regResults;
    var sampled;
    var sampledDer;
    var sample2ndDer;
    var dataFit = [];
    var dataDerFit = [];
    var data2ndDerFit = [];
  // ------------------------------

  // ---- UI Elements ----
    var ui_points = document.getElementById("points");
    var ui_lambda = document.getElementById("lambda");
    var ui_bases = document.getElementById("bases");
    var ui_regualizer = document.getElementById("regualizer");
    var ui_dof = document.getElementById("dof")

    var label_points = document.getElementById("labelPoints");
    var label_lambda = document.getElementById("labelLambda");

    // set defaults and init select elements
    ui_points.value = pointNum;
    label_points.innerHTML = "points: "+pointNum;
    ui_lambda.value = lambda;
    label_lambda.innerHTML = "lambda: "+lambda;
    for (basisId in Regression.prototype.bases) {
      let option = document.createElement("OPTION");
      option.value = basisId;
      option.innerHTML = basisId;
      ui_bases.appendChild(option);
    }
    ui_bases.value = basis;
    for (reg of ["Sq2ndDer","ridge","none"]) {
      let option = document.createElement("OPTION");
      option.value = reg;
      option.innerHTML = reg;
      ui_regualizer.appendChild(option);
    }
    ui_regualizer.value = regualizer;

    // UI Events
    ui_points.oninput = function() {
      pointNum = Number(ui_points.value);
      label_points.innerHTML = "points: "+pointNum;
    }
    ui_points.onchange = function() {
      dataNeedUpdate = true;      
      update();
    }
    ui_lambda.oninput = function() {
      lambda = Number(ui_lambda.value);
      label_lambda.innerHTML = "lambda: "+lambda;
    }
    ui_lambda.onchange = function() {
      update();
    }
    ui_bases.onchange = function() {
      basis = ui_bases.options[ui_bases.selectedIndex].value;
      update();
    }
    ui_regualizer.onchange = function() {
      regualizer = ui_regualizer.options[ui_regualizer.selectedIndex].value;
      update();
    }
  // ---------------------

  // ---- data ----
    var data = createData2D(pointNum);
    data = data[0].map(function(v,i) {return {x:v,y:data[1][i]}})
                  .sort(function(a,b){return a.x-b.x})

    var X = data.map(function(value) {return value.x});
    var Y = data.map(function(value) {return value.y});
  // --------------

  // ---- Regression and sampleData ----
    var regression = new Regression({
      data: {X:X,Y:Y},
      basis: basis,
      regualizer: regualizer,
      lambda: lambda,
    });
  // -----------------------------------

  // ---- D3 Visualization ----
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

    // line overlay
    var line = d3.line()
      .x(function(d) { return x(d.x); })
      .y(function(d) { return y(d.y); });

    var plot = svg.append("path")
      .datum(dataFit)
      .attr("id","dataFit")
      .attr("class", "line")
      .attr("d", line)
      .style("stroke",plotColors[0]);

    var plotDer = svg.append("path")
      .datum(dataDerFit)
      .attr("id","dataDerFit")
      .attr("class", "line")
      .attr("d", line)
      .style("stroke",plotColors[1]);

    var plot2ndDer = svg.append("path")
      .datum(data2ndDerFit)
      .attr("id","data2ndDerFit")
      .attr("class", "line")
      .attr("d", line)
      .style("stroke",plotColors[2]);
  // --------------------------

  // !START!
  update();
// #####################


// main update call
function update() {
  if (dataNeedUpdate) {updateData();}
  updateRegression();
  updateUI();
  updateRender();
  dataNeedUpdate = false;
}

// single update calls
function updateData() {
  data = createData2D(pointNum);
  data = data[0].map(function(v,i) {return {x:v,y:data[1][i]}})
                .sort(function(a,b){return a.x-b.x})

  X = data.map(function(value) {return value.x});
  Y = data.map(function(value) {return value.y});
}
function updateRegression() {
  // update Regression and the sampled data
  regResults = regression.calcRegression({
    data: {X:X,Y:Y},
    basis: basis,
    lambda: lambda,
    regualizer: regualizer
  });

  // sample data from analytic regression
  sampled = regression.sample([-0.1,6],100);
  sampledDer = regression.sampleDer([-0.1,6],100);
  sampled2ndDer = regression.sample2ndDer([-0.1,6],200);
  // convert to d3 format
  dataFit = sampled.X.map(function(value,index) {return {'x':value, 'y':sampled.Y[index]}});
  dataDerFit = sampledDer.X.map(function(value,index) {return {'x':value, 'y':sampledDer.Y[index]}});
  data2ndDerFit = sampled2ndDer.X.map(function(value,index) {return {'x':value, 'y':sampled2ndDer.Y[index]}});
}
function updateUI() {

  ui_dof.innerHTML = "Estimated Degrees of Freedom: " + Math.round(regResults.dof*100)/100;

}
// main render function
function updateRender() {
  if (dataNeedUpdate) {updatePoints();}
  if (showPlot) {updatePlot()};
  if (showPlotDer) {updateDer()};
  if (showPlot2ndDer) {update2ndDer()};
}

// render functions
function updatePoints() {
  svg.selectAll(".dot").remove();
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
}
function updatePlot() {
  plot.datum(dataFit)
  .transition()
  .attr("class", "line")
  .attr("d", line);
}
function updateDer() {
  plotDer.datum(dataDerFit)
  .transition()
  .attr("class", "line")
  .attr("d", line);
}
function update2ndDer() {
  plot2ndDer.datum(data2ndDerFit)
  .transition()
  .attr("class", "line")
  .attr("d", line);
}

