// import the global superstore data
d3.csv("data/Global Superstore.csv", function(dataread) {

	// create two-dimensional arrays to store data
	var profits = new Array();
	var furniture = new Array();
	var office = new Array();
	var technology = new Array();
	for (var i=0; i<4; i++){
		profits[i] = [0,0,0,0];
		furniture[i] = [0,0,0,0];
		office[i] = [0,0,0,0];
		technology[i] = [0,0,0,0];
	}

	// read the data from every sales record
	for (var i=0; i<dataread.length; i++){
		var orderyear = parseInt(dataread[i].OrderYear) - 2011;
		var orderseason = parseInt((parseInt(dataread[i].OrderMonth)-1)/3);
		var prft = parseFloat(dataread[i].Profit);
		var category = dataread[i].Category;
        profits[orderyear][orderseason] += prft;
        if (category == "Furniture")
        	furniture[orderyear][orderseason] += prft;
        else if (category == "Office Supplies")
        	office[orderyear][orderseason] += prft;
        else if (category == "Technology")
        	technology[orderyear][orderseason] += prft;
    }

    // create the dataset
	var dataset = [
        { name: "Season 1" , 
		  sales: [	{ year:2011, profit: parseInt(profits[0][0]), season:1 },
					{ year:2012, profit: parseInt(profits[0][1]), season:1 },
					{ year:2013, profit: parseInt(profits[0][2]), season:1 },
					{ year:2014, profit: parseInt(profits[0][3]), season:1 }] },
		{ name: "Season 2" , 
		  sales: [	{ year:2011, profit: parseInt(profits[1][0]), season:2 },
					{ year:2012, profit: parseInt(profits[1][1]), season:2 },
					{ year:2013, profit: parseInt(profits[1][2]), season:2 },
					{ year:2014, profit: parseInt(profits[1][3]), season:2 }] },
		{ name: "Season 3" , 
		  sales: [	{ year:2011, profit: parseInt(profits[2][0]), season:3 },
					{ year:2012, profit: parseInt(profits[2][1]), season:3 },
					{ year:2013, profit: parseInt(profits[2][2]), season:3 },
					{ year:2014, profit: parseInt(profits[2][3]), season:3 }] },
		{ name: "Season 4" ,
			sales:[ { year:2011, profit: parseInt(profits[3][0]), season:4 },
					{ year:2012, profit: parseInt(profits[3][1]), season:4 },
					{ year:2013, profit: parseInt(profits[3][2]), season:4 },
					{ year:2014, profit: parseInt(profits[3][3]), season:4 }] },
    ];
	

	// convert data to stack
	var stack = d3.layout.stack()
						.values(function(d){ return d.sales; })
						.x(function(d){ return d.year; })
						.y(function(d){ return d.profit; });
	var data = stack(dataset);

	// set the size and create svg
	var width  = 1050;
	var height = 500;
	var padding = { left:250, right:250, top:30, bottom:30 }; // the margin
	var svg = d3.select("body")
				.append("svg")
				.attr("width", width)
				.attr("height", height);
	
	// set scales for x and y axis
	var xRangeWidth = width - padding.left - padding.right; // length of x axis
	var xScale = d3.scale.ordinal() // construct an ordinal scale
					.domain(data[0].sales.map(function(d){ return d.year; }))
					.rangeBands([0, xRangeWidth],0.4);// range and width for bars

	var maxProfit = d3.max(data[data.length-1].sales, function(d){ 
							return d.y0 + d.y; 
					});// maximum value for y axis
	var yRangeWidth = height - padding.top - padding.bottom;// maximun height of y axis
	var yScale = d3.scale.linear() // construct a linear quantitative scale
					.domain([0, maxProfit]) // domain of definition
					.range([0, yRangeWidth]); // codomain
	
	// construct an ordinal scale with 20 colors
	var color = d3.scale.category10();
	
	// set the same seasons in groups
	var groups = svg.selectAll("g")
					.data(data)
					.enter()
					.append("g")
					.style("fill",function(d,i){ return color(i); });
	
	// add tooltip
	var tooltip = d3.select("body")
                	.append("div")
                    .attr("class","tooltip")
                    .style("opacity",0.0); // set as transparent

	// create rects for each season
	var rects = groups.selectAll("rect")
					.data(function(d){ return d.sales; })
					.enter()
					.append("rect")
					// set size and position
					.attr("x",function(d){ return xScale(d.year); })
					.attr("y",function(d){ return yRangeWidth - yScale( d.y0 + d.y ); })
					.attr("width",function(d){ return xScale.rangeBand(); })
					.attr("height",function(d){ return yScale(d.y); })
					.attr("transform","translate(" + padding.left + "," + padding.top + ")")
					// interact with mouse events
					.on("mouseover", function(d){
						var i = d.year-2011;
						var j = d.season-1;
						// using tooltip to show information
						tooltip.html("Season "+ d.season + "<br />" + "$" + d.profit + "<br />"
                                	+ "Furniture: $" + furniture[i][j].toFixed(2) + "<br />"
                                	+ "Office Supplies: $" + office[i][j].toFixed(2) + "<br />"
                                	+ "Technology: $" + technology[i][j].toFixed(2) )
                        		// set position below the mouse
                        		.style("left", (d3.event.pageX) + "px")
                        		.style("top", (d3.event.pageY + 20) + "px")
                        		// set as non-transparent
                        		.style("opacity",1.0);
					})
					.on("mousemove",function(d){
						// tooltip moves with the mouse
                		tooltip.style("left", (d3.event.pageX) + "px")
                        		.style("top", (d3.event.pageY + 20) + "px");
            		})
            		.on("mouseout",function(d){
		                tooltip.style("opacity",0.0); // set as transparent
		            });
	
	// create the axis
	var xAxis = d3.svg.axis()
						.scale(xScale)
						.orient("bottom");
	svg.append("g")
		.attr("class","axis")
		.attr("transform","translate(" + padding.left + "," + (height - padding.bottom) +  ")")
		.call(xAxis);

	yScale.range([yRangeWidth, 0]); // codomain shown in axis
	var yAxis = d3.svg.axis()
						.scale(yScale)
						.orient("left");	
	svg.append("g")
		.attr("class","axis")
		.attr("transform","translate(" + padding.left + "," + (height - padding.bottom - yRangeWidth) +  ")")
		.call(yAxis); 
			
	// create labels
	var labHeight = 50;
	var labRadius = 10;

	var labelCircle = groups.append("circle")
							.attr("cx",function(d){ return width - padding.right*0.9; })
							.attr("cy",function(d,i){ return padding.top * 2 + labHeight * i; })
							.attr("r",labRadius);
					
	var labelText = groups.append("text")
							.attr("x",function(d){ return width - padding.right*0.8; })
							.attr("y",function(d,i){ return padding.top * 2 + labHeight * i; })
							.attr("dy",labRadius/2)
							.text(function(d){ return d.name; });
})
			