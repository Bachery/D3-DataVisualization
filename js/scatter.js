// import the global superstore data
d3.csv("data/Global Superstore.csv", function(dataread){

	//////////////////////READ DATA//////////////////////////

	var months = new Array(48);
	var countryNumber = 0;
	var countries = new Array();
	var markets = new Array();
	var amounts = new Array();
	var profits = new Array();
	var costs = new Array();

	for (var i=0; i<months.length; i++){
		months[i] = i;
	}

	// read the data from every sales record
	for (var i=0; i<dataread.length; i++ ){
		
		var country = dataread[i].Country;
		var market = dataread[i].Market;
		var year = parseInt(dataread[i].OrderYear);
		var month = parseInt(dataread[i].OrderMonth);
		var profit = parseFloat(dataread[i].Profit);
		var cost = parseFloat(dataread[i].ShippingCost);
		
		var countMonth = (year-2011)*12 + month -1; // convert the sale time to 0 ~ 47 month
		var newCountry = true;
		
		// read and store the data
		for (var j=0; j<countryNumber; j++){
			if (country == countries[j]){
				// the record belongs to a country exists
				newCountry = false;
				amounts[j][countMonth] = amounts[j][countMonth] || 0;
				amounts[j][countMonth] ++;
				profits[j][countMonth] = profits[j][countMonth] || 0;
				profits[j][countMonth] += profit;
				costs[j][countMonth] = costs[j][countMonth] || 0;
				costs[j][countMonth] += cost;
			}
		}
		if (newCountry){
			// the record belongs to a new country
			countryNumber ++;
			countries.push(country);
			markets.push(market);
			amounts.push(new Array(months.length));
			profits.push(new Array(months.length));
			costs.push(new Array(months.length));
			amounts[countryNumber-1][countMonth] = 1;
			profits[countryNumber-1][countMonth] = profit;
			costs[countryNumber-1][countMonth] = cost;
		}
	}
	// set the positions without data as 0
	for (var i=0; i<countryNumber; i++){
		for (var j=0; j<months.length; j++){
			amounts[i][j] = amounts[i][j] || 0;
			profits[i][j] = profits[i][j] || 0;
			costs[i][j] = costs[i][j] || 0;
			profits[i][j] += 10000; // make all the data positive
		}
	}

	// create the dataset
	var dataset = new Array();
	for (var i=0; i<countryNumber; i++){
		dataset.push({
						"country":countries[i],	// country name
						"market":markets[i],	// market belongs
						"months":months,		// 48 months
						"profit":profits[i],	// profits per month
						"amount":amounts[i],	// amount per month
						"cost":costs[i]			// costs per month
					});
	}

	// get a dataset filtered by countries (same as the dataset at first)
	var filtered_countries = dataset.map(function(country){return country;});

	// read data from the slider in the page (the default month)
	var month_index = Number(document.getElementById("month_slider").value);


	//////////////////////CREATE AXES//////////////////////////

	// set the size and margins
	var margin = {top: 20, right: 20, bottom: 20, left: 40};
	var frame_width = 1050;
	var frame_height = 350;
	var canvas_width = frame_width - margin.left - margin.right;
	var canvas_height = frame_height - margin.top - margin.bottom;

	// create the svg frame inside chart_area
	var chart_area = d3.select("#chart_area");
	var frame = chart_area.append("svg")
						.attr("width", frame_width)
						.attr("height", frame_height);
	// create canvas inside frame
	var canvas = frame.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// construct an ordinal scale with 20 colors
	var color = d3.scaleOrdinal(d3.schemeCategory20);

	// set scales for x and y axis (profits and shipping costs)
	var xScale = d3.scaleLog()
					.domain([6e3, 2e4])
					.range([0, canvas_width]);
	var yScale = d3.scaleLog()
					.domain([1, 1e4])
					.range([canvas_height, 0]);  
	// set scale for the radius of dots (amounts)
  	var rScale = d3.scaleSqrt()
  					.domain([0, 20])
  					.range([0, 20]); 
	
	// create the axes
	var xAxis = d3.axisBottom(xScale);
  	var yAxis = d3.axisLeft(yScale);
	// draw the x-axis.
	canvas.append("g")
			.attr("class", "x axis")
    		.attr("transform", "translate(0," + canvas_height + ")")
    		.call(xAxis)
    		.append("text")
    		.attr("class", "x label")
    		.attr("text-anchor", "end")
    		.attr("x", canvas_width)
    		.attr("y", - 6)
    		.text("Profit ($)");
	// draw the y-axis.
	canvas.append("g")
    		.attr("class", "y axis")
    		.call(yAxis)
    		.append("text")
    		.attr("class", "y label")
    		.attr("text-anchor", "end")
    		.attr("y", 6)
    		.attr("dy", ".75em")
    		.attr("transform", "rotate(-90)")
    		.text("Shipping Cost ($)");


	//////////////////////FILL IN DATA//////////////////////////

	var data_canvas = canvas.append("g")
				.attr("class", "data_canvas");

	// show dafault page
	update();

	// read data from the slider when it slides
	d3.select("#month_slider")
		.on("input", function () {
			month_index = Number(this.value);
			update();
		});

	// check boxes
	d3.selectAll(".market_cb").on("change", function() {
		var type = this.value;
		if (this.checked) {
			// adding data points
			var new_countries = dataset.filter(function(country){ return country.market == type;});
			filtered_countries = filtered_countries.concat(new_countries);
		} 
		else {
			// remove data points from the data that match the filter
			filtered_countries = filtered_countries.filter(function(country){ return country.market != type;});
		}
		update();
	});

	// update the plot, includes enter, exit, and transition
	function update() {

		// add tooltip
		var tooltip = d3.select("body")
                        .append("div")
                        .attr("class","tooltip")
                        .style("opacity",0.0);

		var dot = data_canvas.selectAll(".dot")
			.data(filtered_countries, function(d) {return d.country});

		// display the dots
		dot.enter()
			.append("circle")
			.attr("class","dot")
			.attr("cx", function(d) { return xScale(d.profit[month_index]); })
			.attr("cy", function(d) { return yScale(d.cost[month_index]+1); })
			.attr("r", function(d) { return rScale(d.amount[month_index]); })
			.style("fill", function(d) { return color(d.market); })
			// interact with mouse events
			.on("mouseover", function(d){ 
				var show_profit = (d.profit[month_index] - 10000.0).toFixed(2); // show the real data
				var show_cost = d.cost[month_index].toFixed(2);
				var show_year = parseInt(month_index/12) + 2011;
				var show_month = month_index - 12*(show_year-2011) +1;
				// display data in the tooltip
				tooltip.html(d.country + "<br />Time: " + show_year + "/" + show_month
										+ "<br />Profit: $" + show_profit
										+ "<br />Cost: $" + show_cost
										+ "<br />Amount: " + d.amount[month_index])
						.style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY + 20) + "px")
                        .style("opacity",1.0); })
			.on("mousemove", function(){
				tooltip.style("left", (d3.event.pageX) + "px")
                       .style("top", (d3.event.pageY + 20) + "px")})
			.on("mouseout", function(){
				tooltip.style("opacity",0.0); });

		// remove the dots no longer needed
		dot.exit().remove();

		// specify transition easing function
		dot.transition().ease(d3.easeLinear).duration(200)
			.attr("cx", function(d) { return xScale(d.profit[month_index]); })
			.attr("cy", function(d) { return yScale(d.cost[month_index]+1); })
			.attr("r", function(d) { return rScale(d.amount[month_index]); });

		data_canvas.selectAll(".dot")
			.sort(function (a, b) { return b.amount[month_index] - a.amount[month_index]; });

	}

})