function sort_unique(arr) {
	var sorted, uniq;

	sorted = arr.sort();

	uniq = [sorted[0]];
	for (var i = 1; i < sorted.length; i++) { // start loop at 1 as element 0 can never be a duplicate
		if (sorted[i-1] !== sorted[i]) {
			uniq.push(sorted[i]);
		}
	}

	return uniq;
}

function make_lookup_key( key ) {
	return function( data ) {
		return data[key];
	}
}

function identity(arg) {
	return arg;
}

$(document).ready(function() {
	var projection = d3.geo.azimuthal()
		.mode("equidistant")
		.origin([37, -12.5])
		.scale(4000);

	var svg = d3.select("#data")
		.insert("svg:svg","#filters")
		.attr("width", 600)
		.attr("height", 600);

	var mapGroup = svg.append("svg:g")
		.attr("id", "map");

	d3.json("/json/malawi.geojson", function(collection) {
		var path = d3.geo.path()
			.projection(projection);

		var mapPaths = mapGroup.selectAll("path")
			.data([collection]);

		mapPaths.enter()
			.append("svg:path")
			.attr("d", function(data) {
				return path( data );
			});

		mapPaths.exit().remove();
	});

	var dotGroup = svg.append("svg:g")
		.attr("id", "dots");

	d3.csv("Malawi_Digested.csv", function(projects) {
		// Project the points for each project.
		var projects = projects.map(function(project) {
			var projected_point = projection( [project.longitude, project.latitude] );

			project.projected_longitude = projected_point[0];
			project.projected_latitude  = projected_point[1];

			return project;
		});

		var show_category = function( category ) {
			var filtered_projects = projects.filter(function(project) { return project.category == category; } );

			// Add the dots.
			var dots = dotGroup.selectAll("circle")
				.data(filtered_projects, function(data) { return data.id; });

			dots.enter().append("svg:circle")
				.attr("category", function(data) { return data.category; })
				.attr("opacity",  0.0 )
				.attr("r",        0.0 )
				.attr("cx",       -1000 )
				.attr("cy",       function(data) { return data.projected_latitude; })
				.transition()
					.duration( 750 )
					.attr("opacity",  function(data) { return 1.0 / data.precision; })
					.attr("cx",       function(data) { return data.projected_longitude; })
					.attr("r",        function(data) { return data.precision * 5.; })
				;

			dots.exit()
				.transition()
					.duration( 750 )
					.attr("opacity", 0.0 )
					.attr("cx", 1000.0 )
					.attr("r", 0.0 )
					.remove();

			dots.on("mouseover", function(data) {
				var details = d3.select("#details").selectAll("div")
					.data([data], function(data) { return data.id });
				details.enter().append("div")
					.text(function(data) { return data.funding; });
				details.exit().remove();
			});
		};

		var lookup_category = make_lookup_key( 'category' );

		var categories = sort_unique( projects.map( lookup_category ) );

		// Add the checkbox list of categories.
		var filterDivs = d3.select("#filters").selectAll("div")
			.data( categories )
			.enter()
				.append("div")
					.attr("class", "filter")
					.text(identity)
					.on("click", function(data) {
						show_category( data );
						$(".filter").removeClass("selected");
						$(this).addClass("selected");
					});
	});
});
