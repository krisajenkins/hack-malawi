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

	var circleGroup = svg.append("svg:g")
		.attr("id", "circles");

	d3.json("json/malawi.geojson", function(collection) {
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

				$("#detail").fadeOut();
			});

			$("#detail").fadeOut();
		}

		generate_filters('amp_sector');

		var plot_projects = function(projects_to_plot) {
			// Add the circles.
			var circles = circleGroup.selectAll("circle")
				.data(projects_to_plot, lookup('id'))

			circles.enter().append("svg:circle")
				.attr("opacity",  0.0)
				.attr("r",        0.0)
				.attr("cx",       -1000)
				.attr("cy",       function(project) { return project.projected_latitude; })
				.attr("stroke-width", "0px")
				.transition()
					.duration( 250 )
					.attr("opacity",  function(project) { return 1.0 / project.precision; })
					.attr("cx",       function(project) { return project.projected_longitude; })
					.attr("r",        function(project) { return project.precision * 5.0; });

			circles.exit()
				.transition()
					.duration( 250 )
					.attr("opacity", 0.0 )
					.attr("cx", 1000.0 )
					.attr("r", 0.0 )
				.remove();

			circles.on("mouseover", function(project) {
				var detail = $("#detail");
				detail.fadeIn();
				detail.find("#amp_sector").text( project.amp_sector );
				detail.find("#type_of_assistance").text( project.type_of_assistance );
				detail.find("#status").text( project.status );
				detail.find("#funding").text( "$" + Number( project.funding ).toMoney(0) );
				detail.find("#donor").text( project.donor );

				$("circle").attr("stroke-width", "0px");
				$("circle").attr("opacity",  ( 1.0 / project.precision ));

				$(this).attr("stroke-width", "5px");
				$(this).attr("opacity",  1 );
			});

			circles.on("mouseout", function(project) {
			});
		};

		// For convenience, click one to kick us off.
		$(".filter")[0].click();
	});
});
