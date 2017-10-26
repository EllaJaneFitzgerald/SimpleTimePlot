// Data contains pairs (timeMs,value)
var Data = [];

$(document).ready(function() {	

	// restore data after reloading the page
	for (i=0; i<localStorage.length; i++) {
		var key = +localStorage.key(i);
		Data.push({'timeMs': +key, 'value': +localStorage.getItem(key)});
	};	
	Data.sort(compareNodes);

	// add restored data to "input_panel"
	for (i=0; i<Data.length; i++) {
		var timeMs = +Data[i].timeMs;
		var time = {minutes: Math.floor(timeMs/60000), seconds: ((timeMs-timeMs%1000)/1000)%60, milliseconds: (timeMs%1000)};
		addForm(time,Data[i].value);
	}
	drawPlot();

	// remove pair (timeMs,n) from Data, localStorage and "input_panel"
	// redraw plot
	$("#list").on("click","input:button",
		function() {
			var text = $(this).parent().find("input:text").val();
			var time = getTimeMs(text);
			Data = Data.filter(function(d) {
 		 		return d.timeMs != time;
			});
			localStorage.removeItem(time);
			$(this).parent().remove();
			drawPlot();
		}
	);

	// open left panel, redraw plot
	$("#left_panel_right_triangle").click(
		function() {
			$("div.left_panel").animate({left:'15vw'},500);
			$("div.main_content").animate({'margin-left':'16vw'},500,drawPlot);
			$("#left_panel_right_triangle").css("display","none");
			$("#left_panel_left_triangle").css("display","block");
		}
	)

	// close left panel, redraw plot
	$("#left_panel_left_triangle").click(
		function() {
			$("div.left_panel").animate({left:0},500);
			$("div.main_content").animate({'margin-left':'1vw'},500,drawPlot);
			$("#left_panel_left_triangle").css("display","none");
			$("#left_panel_right_triangle").css("display","block");
		}
	)

	// open right panel, redraw plot
	$("#right_panel_left_triangle").click(
		function() {
			$("div.right_panel").animate({right:'15vw'},500);
			$("div.main_content").animate({'margin-right':'32vw'},500,drawPlot);
			$("div.input_panel").animate({'margin-right':'16vw'},500);
			$("#right_panel_left_triangle").css("display","none");
			$("#right_panel_right_triangle").css("display","block");
		}
	)

	// close right panel, redraw plot
	$("#right_panel_right_triangle").click(
		function() {
			$("div.right_panel").animate({right:0},500);
			$("div.main_content").animate({'margin-right':'17vw'},500,drawPlot);
			$("div.input_panel").animate({'margin-right':'1vw'},500);
			$("#right_panel_right_triangle").css("display","none");
			$("#right_panel_left_triangle").css("display","block");
		}
	)	
});	

// return time in milliseconds
function getTimeMs(time) {
	var pos=0;
	var pos1 = 0;
	var pos2 = 0;
	var pos3 = 0;
	pos1 = time.indexOf(':',pos);
	pos = pos1+1;
	pos2 = time.indexOf(':',pos);
	pos = pos2+1;
	pos3 = time.indexOf(' ',pos);
	return (0+time.substring(0,pos1)*60*1000 + time.substring(pos1+1,pos2)*1000+ time.substring(pos2+1,pos3)*1);
}

function compareNodes(node1, node2) {
	return node1.timeMs - node2.timeMs;
}

// draw plot
function drawPlot() {
	var lineData = Data;

	d3.select("#plot").selectAll("*").remove();
    var vis = d3.select("#plot"),
      	WIDTH = $("#plot").width(),
    	HEIGHT = $("#plot").height(),
    	MARGINS = {
      		top: 30,
      		bottom: 30
    	},
    	// associate a given point with svg
    	xRange = d3.scale.linear().range([0, +WIDTH])
    			.domain([d3.min(lineData, function(d) {return +d.timeMs}), 
    					 d3.max(lineData, function(d) {return +d.timeMs})]),

    	yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom])
    			.domain([d3.min(lineData, function(d) {return +d.value}), 
    					 d3.max(lineData, function(d) {return +d.value})]);
    // connect points by lines
	var lineFunc = d3.svg.line()
		.x(function (d) {
	    	return xRange(+d.timeMs);
	  	})
	  	.y(function (d) {
	    	return yRange(+d.value);
	  	})
	  	.interpolate('linear');
	// draw graph
	vis.append("svg:path")
	  	.attr("d", lineFunc(lineData))
	  	.style("stroke", "steelblue")
	  	.attr("stroke-width", 2)
	  	.attr("fill", "none");

	var node = vis.selectAll(".dot")
        .data(Data)
        .enter();
    // draw dots
	node.append("circle")
	    .attr("class", "dot")
	    .attr("r", 3.5)
	    .attr("cx", function(d) { return xRange(+d.timeMs)})
	    .attr("cy", function(d) { return yRange(+d.value)});
	// draw labels
	node.append("text")
		.attr("x", function(d) { return xRange(+d.timeMs)})
		.attr("y", function(d) { return yRange(+d.value)})
		.text(function(d) {return +d.value});
}

// add pair (time,n) to Data, localStorage and to "input_panel"
// redraw plot
function addValueAndForm() {
	var n = $('#inputNumber').val();
	if (n != '') {
		var d = new Date();
		var time = {minutes: d.getMinutes(), seconds: d.getSeconds(), milliseconds: d.getMilliseconds()};
		addForm(time,n);
		var timeMs = time.minutes*60*1000 + time.seconds*1000 + time.milliseconds*1;
		Data.push({'timeMs': +timeMs, 'value': +n});
		localStorage.setItem(+timeMs,+n);
		drawPlot();
	}
};

// add pair (time,n) to "input_panel",
// where time = {minutes: ..., seconds: ..., milliseconds: ...}
function addForm(time,n) {
	var st = "<input type='text' value='" + time.minutes + ":" + time.seconds + ":" + time.milliseconds + " " + n + "'><input type='button' value='Remove'>";
	var new_block = document.createElement("div");
	new_block.className = "list_block";
	new_block.innerHTML = st;
	$("#list").append(new_block);
}