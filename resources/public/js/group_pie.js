var width = 600;
var height = 500;
var minEdge = Math.min( width, height );
var colourScheme = d3.scale.category20();

var arcGenerator = d3.svg.arc()
	.outerRadius( minEdge * 0.46 )
	.innerRadius( minEdge * 0.30 );

function arcTween(data, index, current) {
	var i = d3.interpolateObject( this._current, data );

	return function(t) {
		return arcGenerator(i(t));
	};
}

// The closure is probably overkill. :-)
var titles = {
	pledged: 'Funds Committed',
	funded: 'Funds Dispersed'
};

var next_key = (function () {
	var items = Object.keys(titles);

	return function() {
		var item = items.shift();
		items.push(item);
		return item;
	};
}());

function calculate_list_item_top(d,i) { return ( 40 * i ) + "px"; }
function indexed_delay(d, i) { return i * 100; }

$(document).ready(function() {
	var svg = d3.select('#data').append("svg:svg")
		.attr("width", width)
		.attr("height", height);

	var pieGroup = svg.append("svg:g")
		.attr("id", "pies")
		.attr("transform", "translate(" + ( width / 2 ) + "," + ( height / 2 ) + ")" );

	d3.csv("group_pie.csv", function(response) {
		var key = next_key();

		var pieLayout = d3.layout.pie()
			.value(lookup(key));

		var listItems = d3.select("#data").append("div")
			.attr("id", "list")
			.selectAll("div")
			.data(response, lookup('id'));

		listItems.enter().append("div")
				.attr("class", "listItem")
				.style("top", calculate_list_item_top);

		listItems.exit()
			.remove();

		listItems.append("div")
			.attr("class", "listItemBox")
			.style("background-color", function(d,i) { return colourScheme(i); });

		listItems.append("div")
			.text(lookup('donor'));

		var pie = pieGroup.selectAll("path")
			.data(pieLayout(response));

		var pieTitle = d3.select("h3#title")
			.text(titles[key]);

		var arcs = pie.enter().append("svg:path")
			.attr("fill", function(d,i) { return colourScheme(i); })
			.attr("d", arcGenerator)
			.each(function(d) { this._current = d; });

		d3.select(window).on("click", function() {
			var key = next_key();

			pieLayout.value(lookup(key));
			pie.data(pieLayout(response));

			arcs.transition()
				.delay(indexed_delay)
				.attrTween("d", arcTween)
				.each("end", function(d) { this._current = d; });

			listItems.data(response.sort_by_key(key), lookup('id'))
				.transition()
					.delay(indexed_delay)
					.style("top", calculate_list_item_top);

			pieTitle.text( titles[key] );
		});
	});
});
