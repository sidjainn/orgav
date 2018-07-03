document.addEventListener("DOMContentLoaded", function(event) {

  var margin={top:20, right:20, bottom:20, left:0};
  var width = 800-margin.left-margin.right, height = 500-margin.top-margin.bottom;
  var padding = 2, // separation between same-color circles
      clusterPadding = 35, // separation between different-color circles
      maxRadius = 12;

  var svg = d3.select("body").select(".trusts").append("svg")
  .attr("width", '100%')
         .attr("height", '100%')
         .attr("viewBox", "0 0 " + (width+margin.left+margin.right) + " " + (height+margin.top+margin.bottom) )
         .attr("preserveAspectRatio", "xMidYMid meet")
         .append("g")
           .attr("transform","translate("+margin.left+","+margin.top+")");

  var pack = d3.pack()
  	.size([width, height - margin.top])
  	.padding(function(d){
      return d.height==1? padding:clusterPadding;
    });

  d3.csv("trusts.csv", function(data) {

    data.forEach(function(d){
      d.revenue=+d.revenue;
    })

     var hierarchyData = d3.stratify()
     .id(function(d) { return d.name; })
     .parentId(function(d) { return d.trust; })
     (data)
     .sum(function(d) { return d.revenue; })
     //.sort(function(a, b) { return b.type - a.type; });;

     var nodes = d3.hierarchy(hierarchyData, function(d) {
         return d.children;
         });

console.log(nodes)
    var radiusScale=d3.scaleLinear()
                      .domain([0,d3.max(nodes, function(d,i) { return d.data.revenue; })])
                      .range([0,maxRadius]);

    var div = d3.select("body").select(".trusts").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var colorScale=d3.scaleOrdinal(d3.schemeCategory20).domain(nodes);
    var typeColor=d3.scaleOrdinal().range(["#2196F3","#008000","#FF5722"]).domain(nodes);

    var node = svg.selectAll(".node")
    	  .data(pack(nodes).descendants())
        .enter()
    	  .append("g")
    	  .attr("class", "node")
    	  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("circle")
        .transition()
        .duration(100)
        .delay(function(d,i){return i*10;})
    	  .attr("r",function(d) { return d.r; })
        .attr("class", function (d) {
          return d.children? "parent": "child";
        })
    	  .attr("fill", function(d) { return d.children ? "#fff" : typeColor(d.data.data.type); })
    	  .attr("stroke", function(d) { return d.height==1 ? colorScale(d.data.id) : "#fff"; })
    	  .attr("opacity", function(d) { if (d.height==0)return 1; if (d.height==1)return 0.2; else return 0;  })
        .attr("stroke-width", function(d) { return d.children ? 12 : 0.5; });

    node.on("mouseover", function(d){
          div.transition()
             .duration(function(){return d.children?0:200;})
             .style("opacity", function(){return d.children?0.9:0.9;});
          div.html(function (nodes) {
            if (d.height==0)
              return ("Name: "+d.data.id + "<br/>" + "Trust: "+d.data.data.trust + "<br/>" +"Email: "+d.data.data.email + "<br/>" +"Phone: "+d.data.data.phone + "<br/>" +"Executives: "+d.data.data.executive);
            else return d.data.id;
          })
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY ) + "px");
       })
       .on("mousemove", function() {
         return div.style("top", (d3.event.pageY)+"px").style("left",(d3.event.pageX)+"px");
       })
       .on("mouseout", function(d){
          div.transition()
             .duration(500)
             .style("opacity", 0);
       });

    //node.append("text")
        //.text(function(d) {return d.children? "":d.data.name; });

   svg.append("g")
     .attr("class", "typeLegend legend")
     .attr("transform", "translate("+(30)+","+(height/2)+")");

   var typeLegend = d3.legendColor()
       .title("Type of activity")
       .titleWidth(180)
       .shape("circle")
       .shapeRadius(8)
       .shapePadding(5)
       .orient("vertical")
       .scale(typeColor);

   svg.select(".typeLegend")
     .call(typeLegend);

  });

;})
