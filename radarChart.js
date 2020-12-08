/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
/////////////////////////////////////////////////////////
d3.csv("export_trees_bar.csv", function(error, data2) {

  ///////////////////////
  // Chart Size Setup
  var margin = { top: 25, right: 10, bottom: 50, left: 30 };

  var width = 760 - margin.left - margin.right;
  var height = 300 - margin.top - margin.bottom;

  var chart = d3.select(".barChart")
      .attr("width", 760)
      .attr("height", 340)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  ///////////////////////
  // Scales
  var x = d3.scale.ordinal()
      .domain(data2.map(function(d) { return d['NeighborName']; }))
      .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
      .domain([0, d3.max(data2, function(d) { return d['pCanopyLCLU']*100; }) * 1.3])
      .range([height, 0]);

  ///////////////////////
  // Axis
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(function(d) {return d + "%";});

  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
          .style("text-anchor", "end")
          //.style("font-family", "'Open Sans', sans-serif")
          //.style("fill","#222222")
          .attr("dx", "-1em")
          .attr("dy", ".15em")
          .attr("transform", function(d){
            return "rotate(-65)"
          });

  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  ///////////////////////
  // Title
  chart.append("text")
    .text('Percent Tree Canopy Cover in Boston Neighborhoods (2016)')
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .style("font-family", "'Open Sans', sans-serif")
    .style("fill","#222222")
    .attr("y", 20)
    .attr("x", width / 2.0);

  ///////////////////////
  // Bars
  var bar = chart.selectAll(".bar")
      .data(data2)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d['NeighborName']); })
      .attr("y", height)
      .attr("width", x.rangeBand())
      .attr("height", 0);

  bar.transition()
      .duration(1500)
      .ease("elastic")
      .attr("y", function(d) { return y(d['pCanopy2016']*100); })
      .attr("height", function(d) { return height - y(d['pCanopy2016']*100); })

  ///////////////////////
  // Tooltips
  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip");

  var rnd = d3.format(".1f");

  bar.on("mouseover", function(d) {
        tooltip.html("Perc. Tree Cover: " + rnd((d['pCanopy2016'])*100) + "%")
            .style("visibility", "visible")
            d3.selectAll(".radarArea")
              .transition().duration(200)
              .style("fill-opacity", 0.8)
              .style("stroke", "white")
              .style("stroke-width", 1);
      })
      .on("mousemove", function(d) {
        tooltip.style("top", event.pageY - (tooltip[0][0].clientHeight + 5) + "px")
            .style("left", event.pageX - (tooltip[0][0].clientWidth / 2.0) + "px");
						//Dim all blobs
						d3.selectAll(".radarArea")
							.transition().duration(200)
							.style("fill-opacity", 0);
						//Bring back the hovered over blob
						d3.select("." + d['NeighborName'].replace(/\s+/g, ''))
							.transition().duration(200)
							.style("fill-opacity", 1);
      })
      .on("mouseout", function(d) {
        tooltip.style("visibility", "hidden")
        d3.selectAll(".radarArea")
        .style("fill-opacity", 0.05)
        .style("stroke-width", 0);
      });
});

function RadarChart(id, data, options) {
	var cfg = {
	 w: 340,				//Width of the circle
	 h: 340,				//Height of the circle
	 margin: {top: 20, right: 20, bottom: 20, left: 0}, //The margins around the circle
	 legendPosition: {x: 20, y: 20}, // the position of the legend, from the top-left corner of the svg
	 levels: 3,				//How many levels or inner circles should there be drawn
	 maxValue: 0, 				//What is the value that the biggest circle will represent
	 labelFactor: 1.25, 			//How much farther than the radius of the outer circle should the labels be placed
	 wrapWidth: 60, 			//The number of pixels after which a label needs to be given a new line
	 opacityArea: 0.1, 			//The opacity of the area of the blob
	 dotRadius: 4, 				//The size of the colored circles of each blog
	 opacityCircles: 0.1, 			//The opacity of the circles of each blob
	 strokeWidth: 2,         //The width of the stroke around each blob
	 opacityStroke:0.8, 			//The opacity of the stroke around each blob
	 roundStrokes: false,			//If true the area and stroke will follow a round path (cardinal-closed)
	 color: d3.scale.category10(),		//Color function
	 axisName: "axis",
	 areaName:"areaName",
	 value: "value",
	 sortAreas: true,
	};

	//Put all of the options into a variable called cfg
	if('undefined' !== typeof options){
	  for(var i in options){
		if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
	  }//for i
	}//if

	//Map the fields specified in the configuration
	// to the axis and value variables
	var axisName = cfg["axisName"],
			areaName = cfg["areaName"],
			value = cfg["value"];

	//Calculate the average value for each area
	data.forEach(function(d){
		d[value + "Average"] = d3.mean(d.values, function(e){ return e[value] });
	})

	//Sort the data for the areas from largest to smallest
	//by average value as an approximation of actual blob area
	//so that that the smallest area is drawn last
	//and therefore appears on top
	data = data.sort(function(a, b){
		var a = a[value + "Average"],
				b = b[value + "Average"];
		return b - a;
	})

	//Convert the nested data passed in
	// into an array of values arrays
	data = data.map(function(d) { return d.values })

	//If the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){
		return d3.max(i.map(
			function(o){ return o[value]; }
		))
	}));

	var allAxis = (data[0].map(function(d, i){ return d[axisName] })),	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 			//Radius of the outermost circle
		Format = d3.format('%'),			 	//Percentage formatting
		angleSlice = Math.PI * 2 / total;			//The width in radians of each "slice"

	//Scale for the radius
	var rScale = d3.scale.linear()
		.range([0, radius])
		.domain([0, maxValue]);

	/////////////////////////////////////////////////////////
	//////////// Create the container SVG and g /////////////
	/////////////////////////////////////////////////////////

	//Remove whatever chart with the same id/class was present before
	d3.select(id).select("svg").remove();

	//Initiate the radar chart SVG
	var svg = d3.select(id).append("svg")
			.attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
			.attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
			.attr("class", "radar"+id);
	//Append a g element
	var g = svg.append("g")
			.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");

	/////////////////////////////////////////////////////////
	////////// Glow filter for some extra pizzazz ///////////
	/////////////////////////////////////////////////////////

	//Filter for the outside glow
	var filter = g.append('defs').append('filter').attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

	/////////////////////////////////////////////////////////
	/////////////// Draw the Circular grid //////////////////
	/////////////////////////////////////////////////////////

	//Wrapper for the grid & axes
	var axisGrid = g.append("g").attr("class", "axisWrapper");

	//Draw the background circles
	axisGrid.selectAll(".levels")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function(d, i){return radius/cfg.levels*d;})
		.style("fill", "#CDCDCD")
		.style("stroke", "#CDCDCD")
		.style("fill-opacity", cfg.opacityCircles)
		.style("filter" , "url(#glow)");

	//Text indicating at what % each level is
	axisGrid.selectAll(".axisLabel")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter().append("text")
	   .attr("class", "axisLabel")
	   .attr("x", 4)
	   .attr("y", function(d){return -d*radius/cfg.levels;})
	   .attr("dy", "0.4em")
	   .style("font-size", "13px")
		 .style("font-weight", "bold")
	   .attr("fill", "#737373")
	   .text(function(d,i) { return Format(maxValue * d/cfg.levels); });

	/////////////////////////////////////////////////////////
	//////////////////// Draw the axes //////////////////////
	/////////////////////////////////////////////////////////

	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
	//Append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "2px");

	//Append the labels at each axis
	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "10px")
		.attr("text-anchor", "middle")
		.attr("dy", "0.25em")
		.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
		.text(function(d){return d})
		.call(wrap, cfg.wrapWidth);

	/////////////////////////////////////////////////////////
	///////////// Draw the radar chart blobs ////////////////
	/////////////////////////////////////////////////////////

	//The radial line function
	var radarLine = d3.svg.line.radial()
		.interpolate("linear-closed")
		.radius(function(d) { return rScale(d[value]); })
		.angle(function(d,i) {	return i*angleSlice; });

	if(cfg.roundStrokes) {
		radarLine.interpolate("cardinal-closed");
	}

	//Create a wrapper for the blobs
	var blobWrapper = g.selectAll(".radarWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarWrapper");

	//Append the backgrounds
	blobWrapper
		.append("path")
		.attr("class", function(d) {
			return "radarArea" + " " + d[0][areaName].replace(/\s+/g, '') //Remove spaces from the areaName string to make one valid class name
		})
		.attr("d", function(d,i) { return radarLine(d); })
		.style("fill", function(d,i) { return cfg.color(i); })
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', function (d,i){
			console.log("d", d);
			console.log("this", this);
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0);
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 1);
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityArea);
		});


	/////////////////////////////////////////////////////////
	//////// Append invisible circles for tooltip ///////////
	/////////////////////////////////////////////////////////

	//Wrapper for the invisible circles on top
	var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");

	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", cfg.dotRadius*1.5)
		.attr("cx", function(d,i){ return rScale(d[value]) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d[value]) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", function(d,i) {
			newX =  parseFloat(d3.select(this).attr('cx')) - 10;
			newY =  parseFloat(d3.select(this).attr('cy')) - 10;

			tooltip
				.attr('x', newX)
				.attr('y', newY)
				.text(Format(d[value]))
				.transition().duration(200)
				.style('opacity', 1);
		})
		.on("mouseout", function(){
			tooltip.transition().duration(200)
				.style("opacity", 0);
		});

	//Set up the small tooltip for when you hover over a circle
	var tooltip = g.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0);

		// Radar Title
svg.append('foreignObject')
		    .attr({
		        height: 180,
		        width: 250, // dimensions determined based on need
		        transform: 'translate(0,100)' // put it where you want it...
		     })
		    .html('<div><p> Social and Environmental Vulnerbility Factors in Boston Neighborhoods (Percentiles)</p></div>');

svg.append('foreignObject')
        .attr({
        		 height: 100,
        		 width: 150, // dimensions determined based on need
        		 transform: 'translate(0,200)' // put it where you want it...
        })
        .html('<div><sub-p> Hover over the bars above to see the shape for each neighborhood. </sub-p></div>');


	/////////////////////////////////////////////////////////
	/////////////////// Helper Functions ////////////////////
	/////////////////////////////////////////////////////////

	//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text
	function wrap(text, width) {
	  text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.4, // ems
			y = text.attr("y"),
			x = text.attr("x"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		  }
		}
	  });
	}//wrap

}//RadarChart
