$(document).ready(function() {
	var width = 600;
	var height = 600;
	var minEdge = Math.min( width, height );
	var colourScheme = d3.scale.category20();

	var svg = d3.select('#data').append("svg:svg")
		.attr("width", width)
		.attr("height", height);

	var pieGroup = svg.append("svg:g")
		.attr("id", "pies")
		.attr("transform", "translate(" + ( width / 2 ) + "," + ( height / 2 ) + ")" );

	var arcGenerator = d3.svg.arc()
		.outerRadius( minEdge * 0.46 )
		.innerRadius( minEdge * 0.30 );

	function arcTween(data, index, current) {
		var i = d3.interpolateObject(
			{
				startAngle: this._current.startAngle,
				endAngle: this._current.endAngle
			},
			data
		);

		return function(t) {
			return arcGenerator(i(t));
		};
	}

	function id_function(object) { return object.id; }

	d3.csv("group_pie.csv", function(response) {
		var key = 'pledged';

		var pieLayout = d3.layout.pie()
			.value(function(data) { return data[key]; });
		
		var listItems = d3.select("#data").append("div")
			.attr("id", "list")
			.selectAll("div")
			.data(response, id_function);

		listItems.enter()
				.append("div")
				.attr("class", "listItem")
				.style("top", function(d,i) { return ( 40 * i ) + "px"; })
				;
		listItems.exit().remove();

		listItems.append("div")
			.attr("class", "listItemBox")
			.style("background-color", function(d,i) { return colourScheme(i); });

		listItems.append("div")
			.text(function(data) { return data.donor; });

		var pie = pieGroup.selectAll("path")
			.data(pieLayout(response));

		var pieTitle = d3.select("h3#title");

		pieTitle.text( ( key == 'pledged' ) ? "Funds Committed" : "Funds Dispersed" );

		var arcs = pie.enter().append("svg:path")
			.attr("fill", function(d,i) { return colourScheme(i); })
			.attr("d", arcGenerator)
			.each(function(d) { this._current = d; });

		d3.select(window).on("click", function() {
			key = key === 'pledged' ? 'funded' : 'pledged';

			pieLayout.value(function(data) { return data[key]; });
			pie.data(pieLayout(response));
			arcs.transition()
				.duration(1000)
				.delay(function(d, i) { return i * 100; })
				.attrTween("d", arcTween)
				.each("end", function(d) { this._current = d; });

			listItems.data(
				response.sort(
					function(a,b) {
						return b[key] - a[key];
					}
				),
				id_function
			)
			.transition()
				.delay(function(d, i) { return i * 100; })
				.style("top", function(d,i) { return ( 40 * i ) + "px"; })

			pieTitle.text( ( key == 'pledged' ) ? "Funds Committed" : "Funds Dispersed" );
		});
	});
});
