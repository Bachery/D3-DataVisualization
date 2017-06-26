// inport the global superstore data
d3.csv("data/Global Superstore.csv", function(dataread) {
    // inport the map data
    d3.json("data/world-countries.json", function(map) {
        
        // remove the Antarctica from the map
        var features = _.filter(map.features, function(value, key) {
            return value.properties.name != 'Antarctica';
        });

        // mixture the data to the map
        for (var i=0; i<dataread.length; i++) {
            // read the data from every sales record
            var readCountry = dataread[i].Country; // get the country name of this record
            var readValue = parseFloat(dataread[i].Profit); // get the profit of this record
            var readCategory = dataread[i].Category;

            for (var j=0; j<map.features.length; j++) {
                // find out the country in the map
                if (readCountry == map.features[j].properties.name){
                    // if the variable Profit is still undefined, set it as 0
                    map.features[j].properties.Profit = map.features[j].properties.Profit || 0;
                    // add the profit to the corresponding country in the map
                    map.features[j].properties.Profit += readValue;
                    // add the profit to the corresponding category of this country in the map
                    if (readCategory == "Furniture"){
                        map.features[j].properties.Furniture = map.features[j].properties.Furniture || 0;
                        map.features[j].properties.Furniture += readValue;
                    }else if (readCategory == "Office Supplies"){
                        map.features[j].properties.Office = map.features[j].properties.Office || 0;
                        map.features[j].properties.Office+= readValue;
                    }else if (readCategory == "Technology"){
                        map.features[j].properties.Technology = map.features[j].properties.Technology || 0;
                        map.features[j].properties.Technology += readValue;
                    }
                    break;
                }
            }
        }

        // set the size and create svg
        var width = 1050;
        var height = 700;
        var svg = d3.select("body")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)

        // get the original size and zoom to fit the svg size
        var projection = d3.geoMercator();
        var oldScala = projection.scale();
        var oldTranslate = projection.translate();
        projection = projection
                    // multiply 0.9 to leave some space
                    .scale(oldScala * (width/oldTranslate[0]/2) * 0.9) 
                    // divided by 1.6 rather than 2 since the Antarctica was removed
                    .translate([width/2, height/1.6]);
        // path generator
        var path = d3.geoPath().projection(projection);

        // add tooltip
        var tooltip = d3.select("body")
                                .append("div")
                                .attr("class","tooltip")
                                .style("opacity",0.0);

        // set color with a linear scale, and set its domain by profits
        var color = d3.scaleLinear()
                    .range(["rgb(255,0,0)","rgb(0,0,255)"])
                    .domain([
                        d3.min(dataread, function(d) {return parseFloat(d.Profit);}),
                        d3.max(dataread, function(d) {return parseFloat(d.Profit);})
                    ]);

        // create a path for every feature
        svg.selectAll("path")
            .data(features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class","map_path")
            .attr('stroke', 'rgba(255,255,255,1)') // set stroke
            .attr('stroke-width', 1)
            .style("fill", function(d) {
                // fill in the color got by Profit in the scale
                var value = d.properties.Profit;
                if (value) { return color(value);} 
                else { return "#ccc";} // light gray if no data
            })
            // interact with mouse events
            .on("mouseover",function(d){
                d3.select(this).style("fill","rgb(255,215,0)");
                var profit = d.properties.Profit;
                if (profit != undefined){
                    profit = profit.toFixed(2);
                    var funriture = d.properties.Furniture;
                    var office = d.properties.Office;
                    var technology = d.properties.Technology;
                    if (funriture != undefined)
                        funriture = funriture.toFixed(2);
                    else
                        funriture = 0;
                    if (office != undefined)
                        office = office.toFixed(2);
                    else
                        office = 0;
                    if (technology != undefined)
                        technology = technology.toFixed(2);
                    else
                        technology = 0;
                    // using tooltip to show information
                    tooltip.html(d.properties.name + "<br />" + "$" + profit + "<br />"
                                + "Furniture: $" + funriture + "<br />"
                                + "Office Supplies: $" + office + "<br />"
                                + "Technology: $" + technology)
                            // set position below the mouse
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY + 20) + "px")
                            // set as non-transparent
                            .style("opacity",1.0);
                }
                else{ // if there is no data for this country, show country name only
                    tooltip.html(d.properties.name )
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY + 20) + "px")
                        .style("opacity",1.0);
                }
            })
            .on("mousemove",function(d){
                // tooltip moves with the mouse
                tooltip.style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY + 20) + "px");
            })
            .on("mouseout",function(d){
                tooltip.style("opacity",0.0); // set as transparent
                d3.select(this).style("fill", function(d) {
                    // fill in the original color again
                    var value = d.properties.Profit;
                    if (value) { return color(value);} 
                    else { return "#ccc";}
                })
            });
    });
});

