Array.prototype.sort_unique = function() {
	var sorted = this.sort();
	var unique;
	var i;

	unique = [sorted[0]];
	for (i = 1; i < sorted.length; i++) { // start loop at 1 as element 0 can never be a duplicate
		if (sorted[i-1] !== sorted[i]) {
			unique.push(sorted[i]);
		}
	}

	return unique;
};

function identity(arg) {
	return arg;
}

var projection = d3.geo.azimuthal()
	.mode("equidistant")
	.origin([38.2, -12.5])
	.scale(4000);

function project_object(object) {
	var projected_point = projection( [object.longitude, object.latitude] );

	object.projected_longitude = projected_point[0];
	object.projected_latitude  = projected_point[1];

	return object;
}

var data_to_path = d3.geo.path()
	.projection(projection);

$(document).ready(function() {
	var svg = d3.select("#data")
		.insert("svg:svg","#filters")
		.attr("width", 400)
		.attr("height", 600);

	var mapGroup = svg.append("svg:g")
		.attr("id", "map");

	var dotGroup = svg.append("svg:g")
		.attr("id", "dots");

	d3.json("/json/malawi.geojson", function(collection) {
		var mapPaths = mapGroup.selectAll("path")
			.data([collection]);

		mapPaths.enter()
			.append("svg:path")
			.attr("d", function(data) { return data_to_path( data ); });

		mapPaths.exit().remove();
	});

	d3.csv("Malawi_Digested.csv", function(response) {
		// Project the points for each project.
		var projects = response.map(project_object);

		function generate_filters(filter_key) {
			var group_names = projects.map(function(object) { return object[filter_key]; }).sort_unique();

			// Add the filter list of groups.
			var filterDivs = d3.select("#filters").selectAll("div")
				.data(group_names, identity);

			filterDivs.enter().append("div")
				.attr("class", "filter")
				.text(identity);

			filterDivs.exit().remove();

			filterDivs.on("click", function(group_name) {
				// Mark me as selected.
				$(".filter").removeClass("selected");
				$(this).addClass("selected");

				// Replot the relevant projects.
				var filtered_projects = projects.filter(function(object) { return object[filter_key] === group_name; } );
				plot_projects(filtered_projects);
			});
		}

		generate_filters('amp_sector');

		var plot_projects = function(projects_to_plot) {
			// Add the dots.
			var dots = dotGroup.selectAll("circle")
				.data(projects_to_plot, function(project) { return project.id; });

			dots.enter().append("svg:circle")
				.attr("opacity",  0.0)
				.attr("r",        0.0)
				.attr("cx",       -1000)
				.attr("cy",       function(project) { return project.projected_latitude; })
				.transition()
					.duration( 250 )
					.attr("opacity",  function(project) { return 1.0 / project.precision; })
					.attr("cx",       function(project) { return project.projected_longitude; })
					.attr("r",        function(project) { return project.precision * 5.0; });

			dots.exit()
				.transition()
					.duration( 250 )
					.attr("opacity", 0.0 )
					.attr("cx", 1000.0 )
					.attr("r", 0.0 )
				.remove();
		};

		// For convenience, click one to kick us off.
		$(".filter")[0].click();
	});
});
