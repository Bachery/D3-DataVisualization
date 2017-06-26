// import the global superstore data
d3.csv("data/Global Superstore.csv",function(dataread){    

  // profits of 17 sub-categories
  var phones=0, copiers=0, machines=0, accessories=0,
      chairs=0, bookcases=0, tables=0, furnishings=0,
      art=0, supplies=0, paper=0, envelopes=0, fastenners=0,
      labels=0, storage=0, appliances=0, binders=0;
  // read the data from every sales record
  for (var i=0; i<dataread.length; i++){
    var subcategory = dataread[i].SubCategory;
    var profit = parseFloat(dataread[i].Profit);
    if (subcategory == "Phones")            phones += profit;
    else if (subcategory == "Copiers")      copiers += profit;
    else if (subcategory == "Machines")     machines += profit;
    else if (subcategory == "Accessories")  accessories += profit;
    else if (subcategory == "Chairs")       chairs += profit;
    else if (subcategory == "Bookcases")    bookcases += profit;
    else if (subcategory == "Tables")       tables += profit;
    else if (subcategory == "Furnishings")  furnishings += profit;
    else if (subcategory == "Art")          art += profit;
    else if (subcategory == "Supplies")     supplies += profit;
    else if (subcategory == "Paper")        paper += profit;
    else if (subcategory == "Envelopes")    envelopes += profit;
    else if (subcategory == "Fasteners")    fastenners += profit;
    else if (subcategory == "Labels")       labels += profit;
    else if (subcategory == "Storage")      storage += profit;
    else if (subcategory == "Appliances")   appliances += profit;
    else if (subcategory == "Binders")      binders += profit;
  }
  // create the dataset to store the relation of 
  // all cetegories and sub-categories and their profits
  var dataset = {
    "name": "Commodity Categories and Profit",
    "children":
        [
          {
            "name": "Technology",
             "children":
                 [
                   {"name":"Phones", "profit":parseInt(phones)},
                  {"name":"Copiers", "profit":parseInt(copiers)},
                  {"name":"Machines", "profit":parseInt(machines)},
                  {"name":"Accessories", "profit":parseInt(accessories)}
                ]
          },
          {
            "name": "Furniture",
            "children":
                [
                  {"name":"Chairs", "profit":parseInt(chairs)},
                  {"name":"Bookcases", "profit":parseInt(bookcases)},
                  {"name":"Tables", "profit":parseInt(tables)},
                  {"name":"Furnishings", "profit":parseInt(furnishings)}
                ]
          },
          {
            "name": "OfficeSupplies",
            "children":
                [
                  {
                    "name":"Others",
                    "children":
                    [
                      {"name":"Art", "profit":parseInt(art)},
                      {"name":"Supplies", "profit":parseInt(supplies)},
                      {"name":"Paper", "profit":parseInt(paper)},
                      {"name":"Envelopes", "profit":parseInt(envelopes)},
                      {"name":"Fasteners", "profit":parseInt(fastenners)},
                      {"name":"Labels", "profit":parseInt(labels)}
                    ]
                  },
                  {"name":"Storage", "profit":parseInt(storage)},
                  {"name":"Appliances", "profit":parseInt(appliances)},
                  {"name":"Binders", "profit":parseInt(binders)}
                ]
          }
        ]
  }

  // set the size and radius, and create the svg
  var width = 1050;
  var height = 700;
  var radius =  Math.min(width, height) / 2;
  var svg = d3.select('body').append('svg')
              .attr('class','axis')
              .attr('width',width)
              .attr('height',height)
              .append('g')
              .attr("transform", "translate(" + width/2 + "," + radius*0.9 + ")");
  
  // create the partition
  var partition = d3.layout.partition()
                .sort(null) // don't sort
                .size([2 * Math.PI, radius * radius])
                // set profit as the value deciding the size of each arc
                .value(function(d) { return d.profit; });
  // convert data to partition
  var nodes = partition.nodes(dataset);
  var links = partition.links(nodes);

  // define arc
  var arc = d3.svg.arc()
                  .startAngle(function(d) { return d.x; })
                  .endAngle(function(d) { return d.x + d.dx; })
                  .innerRadius(function(d) { return Math.sqrt(d.y); })
                  .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });
  // convert data to arcs
  var arcs = svg.selectAll("g")
                .data(nodes)
                .enter()
                .append("g");

  // construct an ordinal scale with 20 colors
  var color = d3.scale.category20();

  // add tooltip
  var tooltip = d3.select("body")
                  .append("div")
                  .attr("class","tooltip")
                  .style("opacity",0.0);

  arcs.append("path")
      .attr("display", function(d) { return d.depth ? null : "none"; }) // hide the central circle
      .attr("d", arc)
      .style("stroke", "#fff") // set stroke to white
      // fill in a same color only when they belong to a same category
      .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
      // interact with mouse events
      .on("mouseover",function(d){
        d3.select(this)
          .style("fill","yellow");
        // using tooltip to show information
        tooltip.html(d.name + "<br />" + "$" + d.value)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 20) + "px")
                .style("opacity",1.0);
      })
      .on("mousemove",function(d){
        // tooltip moves with the mouse
        tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 20) + "px");
      })
      .on("mouseout",function(d){
        tooltip.style("opacity",0.0); // set as transparent
        d3.select(this)
          .transition() // set gradual change
          .duration(200) // set changing duration
          .style("fill", function(d) { 
            return color((d.children ? d : d.parent).name); 
          });
      });

  // add category names to the arcs
  arcs.append("text")
      .style("font-size", "12px")
      .attr("text-anchor","middle")
      .attr("transform",function(d,i){
        // the first label, of the central circle, won't move
        if( i == 0 ) {
          // make the central label bigger
          d3.select(this).style("font-size", "20px")
          return ;
        }
        // move and rotate the other labels
        var r = 0;
        // between 0 - 180°
        if( (d.x+d.dx/2)/Math.PI*180 < 180 )  
          r = 180 * ((d.x + d.dx / 2 - Math.PI / 2) / Math.PI);
        // between 180° - 360°
        else  
          r = 180 * ((d.x + d.dx / 2 + Math.PI / 2) / Math.PI);
        return  "translate(" + arc.centroid(d) + ")"
                + "rotate(" + r + ")";
      })
      .text(function(d) { return d.name; });
})