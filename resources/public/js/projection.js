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

Number.prototype.toMoney = function(decimals, decimal_sep, thousands_sep) {
	var n = this,
		c = isNaN(decimals) ? 2 : Math.abs(decimals), //if decimal is zero we must take it, it means user does not want to show any decimal
		d = decimal_sep || '.', //if no decimal separator is passed we use the dot as default decimal separator (we MUST use a decimal separator)

		/*
		   according to [http://stackoverflow.com/questions/411352/how-best-to-determine-if-an-argument-is-not-sent-to-the-javascript-function]
		   the fastest way to check for not defined parameter is to use typeof value === 'undefined'
		   rather than doing value === undefined.
		   */
		t = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep, //if you don't want to use a thousands separator you can pass empty string as thousands_sep value

		sign = (n < 0) ? "-" : "",

		//extracting the absolute value of the integer part of the number and converting to string
		i = String( parseInt(n = Math.abs(n).toFixed(c), 10) );

	j = ((j = i.length) > 3) ? j % 3 : 0;
	return sign + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
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

	var circleGroup = svg.append("svg:g")
		.attr("id", "circles");

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

				$("#detail").fadeOut();
			});

			$("#detail").fadeOut();
		}

		generate_filters('amp_sector');

		var plot_projects = function(projects_to_plot) {
			// Add the circles.
			var circles = circleGroup.selectAll("circle")
				.data(projects_to_plot, function(project) { return project.id; });

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
