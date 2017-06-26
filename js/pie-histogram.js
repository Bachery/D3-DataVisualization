// import the global superstore data
d3.csv("data/Global Superstore.csv", function(data) {
    
    // read the profits of the seven markets and three categories
    var markets = ["Africa", "APAC", "Canada", "EMEA", "EU", "LATAM", "US"];
    var furniture = [0,0,0,0,0,0,0];
    var office = [0,0,0,0,0,0,0];
    var technology = [0,0,0,0,0,0,0];
    
    // read the data from every sales record
    for (var i=0; i<data.length; i++){
        var market = data[i].Market;
        var category = data[i].Category;
        for (var j=0; j<markets.length; j++){
            if (market == markets[j]){
                if (category == "Furniture")
                    furniture[j] += parseFloat(data[i].Profit);
                else if (category == "Office Supplies")
                    office[j] += parseFloat(data[i].Profit);
                else if (category == "Technology")
                    technology[j] += parseFloat(data[i].Profit);
            }
        }
    }
    for (var i=0; i<markets.length; i++){
        furniture[i] = parseInt(furniture[i]);
        office[i] = parseInt(office[i]);
        technology[i] = parseInt(technology[i]);
    }

    // create the dataset
    var dataset=[
        {Market:'Africa',prft:{Furniture:furniture[0], Office_Supplies:office[0], Technology:technology[0]}}
        ,{Market:'APAC',prft:{Furniture:furniture[1], Office_Supplies:office[1], Technology:technology[1]}}
        ,{Market:'Canada',prft:{Furniture:furniture[2], Office_Supplies:office[2], Technology:technology[2]}}
        ,{Market:'EMEA',prft:{Furniture:furniture[3], Office_Supplies:office[3], Technology:technology[3]}}
        ,{Market:'EU',prft:{Furniture:furniture[4], Office_Supplies:office[4], Technology:technology[4]}}
        ,{Market:'LATAM',prft:{Furniture:furniture[5], Office_Supplies:office[5], Technology:technology[5]}}
        ,{Market:'US',prft:{Furniture:furniture[6], Office_Supplies:office[6], Technology:technology[6]}}
    ];

    dashboard('#dashboard',dataset);
})

// show the graph
function dashboard(id, dataset){
    
    // define colors
    var barColor = 'steelblue';
    function segColor(c){ 
        return {Furniture:"#807dba",
                Office_Supplies:"#e08214",
                Technology:"#41ab5d"} [c]; 
    }
    
    // compute total profit for each market
    dataset.forEach(function(d){d.total = d.prft.Furniture
                                        + d.prft.Office_Supplies
                                        + d.prft.Technology;});

    // calculate total profit by segment for all market
    var categoryData = ['Furniture','Office_Supplies','Technology'].map(function(d){ 
        return {type:d, prft: d3.sum(dataset.map(function(t){ return t.prft[d];}))}; 
    });    
    
    // calculate total profit by market for all segment
    var profitData = dataset.map(function(d){return [d.Market,d.total];});
    
    // function to handle histogram
    function histoGram(profitData){
        var hG={};
        
        // set the size and create svg for histogram
        var hGDim = {t: 60, r: 0, b: 30, l: 0};
        hGDim.w = 500 - hGDim.l - hGDim.r, 
        hGDim.h = 300 - hGDim.t - hGDim.b;            
        var hGsvg = d3.select(id)
                    .append("svg")
                    .attr("width", hGDim.w + hGDim.l + hGDim.r)
                    .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
                    .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");

        // create a ordinal scale for x-axis
        var x = d3.scale.ordinal()
                        .rangeRoundBands([0, hGDim.w], 0.1)
                        .domain(profitData.map(function(d) { return d[0]; }));

        // add x-axis to the histogram svg.
        hGsvg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + hGDim.h + ")")
                .call(d3.svg.axis().scale(x).orient("bottom"));

        // create a linear scale for y-axis
        var y = d3.scale.linear()
                        .range([hGDim.h, 0])
                        .domain([0, d3.max(profitData, function(d) { return d[1]; })]);

        // create bars for histogram to contain rectangles and profit labels
        var bars = hGsvg.selectAll(".bar")
                        .data(profitData).enter()
                        .append("g").attr("class", "bar");

        // create the rectangles
        bars.append("rect")
            .attr("x", function(d) { return x(d[0]); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("width", x.rangeBand())
            .attr("height", function(d) { return hGDim.h - y(d[1]); })
            .attr('fill',barColor)
            .on("mouseover",mouseover) // mouseover is defined below
            .on("mouseout",mouseout); // mouseout is defined below

        // create the profit labels above the rectangles
        bars.append("text")
            .text(function(d){ return d3.format(",")(d[1])})
            .attr("x", function(d) { return x(d[0]); })
            .attr("y", function(d) { return y(d[1])-5; })
            .attr("text-anchor", "Office_Suppliesdle");
        
        // interact with mouse events
        function mouseover(d){
            // filter for selected market
            var mkt = dataset.filter(function(s){ return s.Market == d[0];})[0];
            var newCategoryData = d3.keys(mkt.prft).map(function(s){ return {type:s, prft:mkt.prft[s]};});
            // call update functions of pie chart and legend  
            pC.update(newCategoryData);
            leg.update(newCategoryData);
        }
        function mouseout(d){
            // recover the pie chart and legend
            pC.update(categoryData);
            leg.update(categoryData);
        }
        
        // create function to update the bars
        // will be used by pie chart
        hG.update = function(newData, color){
            // update the domain of the y-axis map to reflect change in profits
            y.domain([0, d3.max(newData, function(d) { return d[1]; })]);
            
            // attach the new data to the bars
            var bars = hGsvg.selectAll(".bar").data(newData);
            
            // transition the height and color of rectangles
            bars.select("rect")
                .transition()
                .duration(500)
                .attr("y", function(d) {return y(d[1]); })
                .attr("height", function(d) { return hGDim.h - y(d[1]); })
                .attr("fill", color);

            // transition the profit labels location and change value
            bars.select("text")
                .transition()
                .duration(500)
                .text(function(d){ return d3.format(",")(d[1])})
                .attr("y", function(d) {return y(d[1])-5; });            
        }

        return hG;
    }
    
    // function to handle pieChart
    function pieChart(categoryData){
        var pC ={};

        // set the size and create svg for pie chart
        var pCDim ={w:250, h: 250};
        pCDim.r = Math.min(pCDim.w, pCDim.h) / 2;
        var pCsvg = d3.select(id)
                        .append("svg")
                        .attr("width", pCDim.w)
                        .attr("height", pCDim.h)
                        .append("g")
                        .attr("transform", "translate("+pCDim.w/2+","+pCDim.h/2+")");
        
        // create function to draw the arcs of the pie slices
        var arc = d3.svg.arc()
                        .outerRadius(pCDim.r - 10)
                        .innerRadius(0);
        // create a function to compute the pie slice angles
        var pie = d3.layout.pie()
                            .sort(null)
                            .value(function(d) { return d.prft; });

        // draw the pie slices
        pCsvg.selectAll("path")
                .data(pie(categoryData))
                .enter()
                .append("path")
                .attr("d", arc)
                .each(function(d) { this._current = d; })
                .style("fill", function(d) { return segColor(d.data.type); })
                .on("mouseover",mouseover) // mouseover is defined below
                .on("mouseout",mouseout); // mouseout is defined below  
        
        // interact with mouse events
        function mouseover(d){
            // call the update function of histogram with new data.
            hG.update(dataset.map(function(v){ 
                return [v.Market,v.prft[d.data.type]];}),segColor(d.data.type));
        }
        function mouseout(d){
            // recover the histogram
            hG.update(dataset.map(function(v){
                return [v.Market,v.total];}), barColor);
        }

        // create function to update pie chart
        // will be used by histogram
        pC.update = function(newCategoryData){
            pCsvg.selectAll("path")
                    .data(pie(newCategoryData))
                    // smoothly transition
                    .transition()
                    .duration(500)
                    .attrTween("d", arcTween); // arcTween is defined below
        }
        // Animating the pie-slice requiring a custom function which
        // specifies how the intermediate paths should be drawn.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t));};
        }

        return pC;
    }
    
    // function to handle legend
    function legend(categoryData){
        var leg = {};
            
        // create table for legend
        var legend = d3.select(id)
                        .append("table")
                        .attr('class','legend');
        
        // create one row per segment
        var tr = legend.append("tbody")
                        .selectAll("tr")
                        .data(categoryData)
                        .enter()
                        .append("tr");
            
        // create the rectangle label for each segment
        tr.append("td").append("svg").attr("width", '16').attr("height", '16')
            .append("rect").attr("width", '16').attr("height", '16')
            .attr("fill",function(d){ return segColor(d.type); });
        // create the name for each segment
        tr.append("td").text(function(d){ return d.type;});
        // create the value for each segment
        tr.append("td").attr("class",'legendprft')
            .text(function(d){ return d3.format(",")(d.prft);});
        // create the proportion for each segment
        tr.append("td").attr("class",'legendPerc')
            .text(function(d){ return getPercentage(d,categoryData);});
        // compute percentage
        function getPercentage(d,cD){
            return d3.format("%")(d.prft/d3.sum(cD.map(function(v){ return v.prft; })));
        }

        // create function to update the legend
        leg.update = function(newCategoryData){
            // update the data attached to the row elements
            var l = legend.select("tbody").selectAll("tr").data(newCategoryData);
            // update the profits
            l.select(".legendprft").text(function(d){ return d3.format(",")(d.prft);});
            // update the percentage
            l.select(".legendPerc").text(function(d){ return getPercentage(d,newCategoryData);});        
        }
        
        

        return leg;
    }
    
    var hG = histoGram(profitData), // create the histogram
        pC = pieChart(categoryData), // create the pie-chart
        leg= legend(categoryData);  // create the legend
}