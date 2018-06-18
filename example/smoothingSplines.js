// #### INITILAZING ####

  // ---- globals and defaults ----
    var pointNum = 60;
    var lambda = 2.00;
    var basis = "trunc-power";
    var regualizer = "Sq2ndDer";
    var knotmode = "auto";
    var knotnumber = 10;

    var margin = {top: 20, right: 40, bottom: 20, left: 40};
    var width_outer = 960;
    var height_outer = 500;
    var plotColors = ["blue","red","purple","green"];
    var knotsel_width = 6;
    var knotsel_height = 20;
    var knotsel_strokeWidth = 2;

    var showPlot = true;
    var showPlotDer = true;
    var showPlot2ndDer = true;

    // dependent options
    var width = width_outer - margin.left - margin.right;
    var height = height_outer - margin.top - margin.bottom;

    var dataNeedUpdate = true;
    var knotsNeedUpdate = true;
    var knotsRenderNeedUpdate = true;
    var dragOffset = 0;

    var regResults;
    var sampled;
    var sampledDer;
    var sample2ndDer;
    var dataFit = [];
    var dataDerFit = [];
    var data2ndDerFit = [];

    // initalize default knots for auto or manual knotmode (data interval [0,6])
    var knots;
    switch (knotmode) {
      case "manual":
        knots = new Array(knotnumber);
        knots = knots.fill(0).map((value,index) => 6*(index/knotnumber+1/(2*knotnumber)) );
        break;
    
      default:
        knots = false;
        break;
    }

  // ------------------------------

  // ---- UI Elements ----
    var ui_points = document.getElementById("points");
    var ui_lambda = document.getElementById("lambda");
    var ui_bases = document.getElementById("bases");
    var ui_regualizer = document.getElementById("regualizer");
    var ui_knotmodeAuto = document.getElementById("knotmodeAuto");
    var ui_knotmodeManual = document.getElementById("knotmodeManual");
    var ui_knotnumber = document.getElementById("knotnumber");
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
    switch (knotmode) {
      case "manual":
        ui_knotmodeManual.checked = true;
        ui_knotnumber.disabled = false;
        break;
    
      default:
        ui_knotmodeAuto.checked = true;
        ui_knotnumber.disabled = true;
        break;
    }
    ui_knotnumber.value = knotnumber;

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
    ui_knotmodeAuto.onchange = function() {
      knotmode = "auto";
      knots = false;
      ui_knotnumber.disabled = true;
      knotsNeedUpdate = true;
      update();
    }
    ui_knotmodeManual.onchange = function() {
      knotmode = "manual";
      knots = new Array(knotnumber);
      knots = knots.fill(0).map((value,index) => 6*(index/knotnumber+1/(2*knotnumber)) );
      ui_knotnumber.disabled = false;
      knotsNeedUpdate = true;
      update();
    }
    ui_knotnumber.onchange = function() {
      knotnumber = Number(ui_knotnumber.value);
      if (knotnumber < knots.length) {
        knots.length = knotnumber;
      } else {
        let lastKnot = knots[knots.length-1];
        let end = knotnumber-knots.length
        for (let i=0; i<end;i++) {
          knots.push(lastKnot+(i+1)*0.08);
        }
      }
      knotsNeedUpdate = true;
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

  // ---- Regression ----
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

    // knot selection
    var knotselectors = svg.append("g")
      .attr("id","knotselectors");

    // drag event functions for knotselectors
    function onDragStart_knot() {
      dragOffset =  d3.select(this).attr("x")-d3.event.x;
    }
    function onDrag_knot() {
      d3.select(this).attr("x", (d3.event.x + dragOffset) );
    }
    function onDragEnd_knot(d,i) {
      knots[i] = x.invert(Number(d3.select(this).attr("x"))+knotsel_width/2+knotsel_strokeWidth);
      knotsNeedUpdate = true
      update();
    }
  // --------------------------

  // !START!
  update();
// #####################


// main update call
function update() {
  if (dataNeedUpdate) {updateData();}
  if (knotsNeedUpdate) {updateKnots();}
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
function updateKnots() {
  if (knots) {knots.sort((a,b) => a-b);}
}
function updateRegression() {
  // update Regression and the sampled data
  regResults = regression.calcRegression({
    data: {X:X,Y:Y},
    basis: basis,
    lambda: lambda,
    regualizer: regualizer,
    knots: knots
  });

  knots = regression.knots;

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
  if (knotsNeedUpdate) {updateKnotsRender();}
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
    .style("fill", "black")
}
function updateKnotsRender() {
  knotselectors.selectAll(".knotselector").remove();
  
  if (knotmode == "manual") {
    knotselectors.selectAll(".knotselector")
      .data(knots)
      .enter().append("rect")
        .attr("class", "knotselector")
        .attr("width",knotsel_width)
        .attr("height",knotsel_height)
        .attr("x", function(d) {return  x(d)-knotsel_width/2-knotsel_strokeWidth})
        .attr("y", height-knotsel_height*2/3)
        .attr("fill", "rgba(0,0,0,0)")
        .attr("stroke", "rgba(150,150,150,0.75)")
        .attr("stroke-width", knotsel_strokeWidth)
        .call(d3.drag()
          .on("start",onDragStart_knot)
          .on("drag",onDrag_knot)
          .on("end",onDragEnd_knot)
        );
  }

  knotsNeedUpdate = false;
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

