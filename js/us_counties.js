
var county_store = undefined;

function CountyStore()
{
	this.county_data      = undefined;
	this.state_names      = undefined;
	this.state_names_list = undefined;
	this.state_counties   = undefined;

    this.data_scale = {
		"population"           : d3.scale.linear().domain([0,   10000000]).range([0, 200]),
		"labor"                : d3.scale.linear().domain([0,    5000000]).range([0, 200]),
		"labor-scaled"         : d3.scale.linear().domain([0,       2800]).range([0, 200]),
		"unemployment"         : d3.scale.linear().domain([0.0,     20.0]).range([0, 200]),
		"unemployment-percent" : d3.scale.linear().domain([0.0,      0.2]).range([0, 200]),
		"education-index"      : d3.scale.linear().domain([0.0,     10.0]).range([0, 200]),
		"income-index"         : d3.scale.linear().domain([0.0,     10.0]).range([0, 200]),
		"health-index"         : d3.scale.linear().domain([0.0,     10.0]).range([0, 200])
    };

	this.SetCountyStore = function(a_countyData)
	{
		this.county_data = a_countyData;
	}

	this.SetStateNames = function(a_stateNames)
	{
		this.state_names = a_stateNames;
	}

	this.SetStateCounties = function(a_stateCounties)
	{
		this.state_counties = a_stateCounties;
	}

	this.GetCountyNames = function(a_stateName)
	{
		if ( this.state_counties.hasOwnProperty(a_stateName) ) {
			return this.state_counties[a_stateName];
		}
		return undefined;
	}

	this.GetStateNamesList = function()
	{
		if ( this.state_names != undefined && this.state_names_list == undefined ) {
			this.state_names_list = [];
			for (var state_name in this.state_names ) {
				if ( this.state_names.hasOwnProperty(state_name) ) {
					this.state_names_list.push(state_name.toUpperCase());
				}
			}
			this.state_names_list.sort();
		}

		return this.state_names_list;
	}

	this.GetCountyStore = function(a_countyName)
	{
		if ( this.county_data != undefined && this.county_data.hasOwnProperty(a_countyName) ) {
			return this.county_data[a_countyName];
		}

		return undefined;
	}

	this.GetStateAbbreviation = function(a_stateName)
	{
		var state_name = a_stateName.toLowerCase();
		if ( this.state_names.hasOwnProperty(state_name) ) {
			return this.state_names[state_name];
		}
		return undefined;
	}

	this.Capitalize = function(a_countyName)
	{
		var state_name  = a_countyName.substr(0, a_countyName.indexOf(",")).toUpperCase();
		var county_name = a_countyName.substr(a_countyName.indexOf(",") + 1).trim();
		// a_countyName = a_countyName.replace(state_part, '');
		var name_parts  = county_name.split(' ');
		for (var ii = 0; ii < name_parts.length; ++ii) {
			name_parts[ii] = name_parts[ii].charAt(0).toUpperCase() + name_parts[ii].substr(1);
		}
		county_name = name_parts.join(' ');
		// a_countyName = a_countyName.charAt(0).toUpperCase() + a_countyName.substr(1);
		return county_name + ', ' + state_name;
	}

	this.MakeNumberLabel = function(a_number)
	{
		var number_str = a_number.toString(10);

		if ( a_number < 1000 ) {
			return number_str;
		}

		var number_part_array = [];
		
		while ( number_str.length > 0 ) {
			console.log("number_str: " + number_str);
			var mod_3 = (number_str.length % 3);
			number_part_array.push(number_str.substr(0, (mod_3 != 0 ? mod_3 : 3)));
			number_str = number_str.substr(mod_3 != 0 ? mod_3 : 3);
		}

		return number_part_array.join(',');
	}

	this.DrawBarChart = function(a_d3Svg, a_countyData, a_metaData)
	{
		var data_name  = a_metaData.data_name;
		var data_set   = a_countyData;
		var d3_scale   = county_store.data_scale[data_name];
		var data_title = a_metaData.graph_title;

		// var c_labels = [data_set[0].toString(10), data_set[1].toString(10)];
		var c_labels = [county_store.MakeNumberLabel(data_set[0]), county_store.MakeNumberLabel(data_set[1])];
		var rect_height = "30px";
		var fill_color  = ["#365697", "#ED416F"];
		// var fill_color = ["#FEE944", "#208267"];
		var x_base = 20, y_base = 55;

		a_d3Svg.append("line").attr("x1", x_base).attr("y1", y_base - 10).attr("x2", x_base).attr("y2", y_base + 125)
				.attr("stroke", "black").attr("stroke-width", "1").attr("stroke-opacity", 0.9);

		var rects = a_d3Svg.selectAll("rect").data(data_set).enter().append("rect");
		rects.attr("x", function(d, ii) { return x_base; })
			.attr("y", function(d, ii)  { return (y_base + 10 + 36 * ii); })
			.attr("width", function(d, ii) { return Math.round(d3_scale(d)); })
			.attr("height", rect_height)
			.attr("fill", function(d, ii) { return fill_color[ii]; });

		var texts = a_d3Svg.selectAll("text").data(data_set).enter().append("text");
		texts.attr("x", function(d, ii) {
					var x_pos = x_base + Math.round(d3_scale(d)) - c_labels[ii].length * 5;
					return (x_pos > x_base + 3 ? x_pos : x_base + 3);
				})
			.attr("y", function(d, ii) { return y_base + 91 * ii; })
			.attr("fill", function(d, ii) { return fill_color[ii]; })
			.text(function(d, ii) { console.log("Text " + c_labels[ii] + ", scaled d:" + d3_scale(d) + ", @ x: " + (x_base + Math.round(d3_scale(d)) * 1.8 - c_labels[ii].length * 8) + ", y: " + (y_base + 91 * ii)); return c_labels[ii]; });

		/*
		a_d3Svg.append("text").attr("x", x_base + 5).attr("y", y_base +  7).text(c_labels[0]);
		a_d3Svg.append("text").attr("x", x_base + 5).attr("y", y_base + 90).text(c_labels[1]);
		*/

		a_d3Svg.append("g").attr("class", "axis").attr("transform", "translate(" + x_base + "," + (y_base + 115) + ")").call(a_metaData.x_axis);

		a_d3Svg.append("text").attr("x", x_base).attr("y", y_base - 25).text(data_title);
	}

	this.ShowPopulation = function(a_d3Svg, a_countyDataPair, a_metaData)
	{
		var c_data0 = a_countyDataPair[0]['population'], c_data1 = a_countyDataPair[1]['population'];

		a_d3Svg.attr("height", "30%").attr("width", "34%");

		if ( !c_data0 || !c_data1 ) { return; }
		console.log("Population data found in data object for both counties.");

		// county_store.DrawBarChart(a_d3Svg, [c_data0, c_data1], county_store.data_scale['population'], "Population");
		county_store.DrawBarChart(a_d3Svg, [c_data0, c_data1], a_metaData);
	}

	this.ShowLaborForceSize = function(a_d3Svg, a_countyDataPair, a_metaData)
	{
		var c_data0 = a_countyDataPair[0]['labor'], c_data1 = a_countyDataPair[1]['labor'];

		a_d3Svg.attr("height", "30%").attr("width", "33%");

		if ( !c_data0 || !c_data1 ) { return; }

		console.log("Labor-size data found in data object for both counties.");

		// county_store.DrawBarChart(a_d3Svg, [c_data0[0], c_data1[0]], county_store.data_scale['labor'], "Labor Force Size");
		county_store.DrawBarChart(a_d3Svg, [c_data0[0], c_data1[0]], a_metaData);
		/*
		var data_set   = [c_data0[0], c_data1[0]];
		var d3_scale   = county_store.data_scale['labor-scaled'];
		var fill_color = ["#365697", "#ED416F"];

		var bubbles = a_d3Svg.selectAll("circle").data(data_set).enter().append("circle");
		bubbles.attr("cx", function(d, ii) { return 360 + 180 * ii; })
			.attr("cy", function(d, ii)  { return 120; })
			.attr("r", function(d, ii) { return d3_scale(Math.round(Math.sqrt(d))) / 2; })
			.attr("fill", function(d, ii) { return fill_color[ii]; });

		a_d3Svg.append("text").attr("x", 335).attr("y", d3_scale(Math.round(Math.sqrt(data_set[0]))) / 2 + 130).text(county_store.MakeNumberLabel(data_set[0]));
		a_d3Svg.append("text").attr("x", 515).attr("y", d3_scale(Math.round(Math.sqrt(data_set[1]))) / 2 + 130).text(county_store.MakeNumberLabel(data_set[1]));

		a_d3Svg.append("text").attr("x", 280).attr("y", 30).text("Labor Force Size");
		*/
	}

	this.ShowUnemploymentRate = function(a_d3Svg, a_countyDataPair, a_metaData)
	{
		var c_data0 = a_countyDataPair[0]['labor'], c_data1 = a_countyDataPair[1]['labor'];

		a_d3Svg.attr("height", "30%").attr("width", "33%");

		if ( !c_data0 || !c_data1 ) { return; }
		console.log("Labor data found in data object for both counties.");

		// county_store.DrawBarChart(a_d3Svg, [c_data0[3], c_data1[3]], county_store.data_scale['unemployment'], "Unemployment Rate");
		county_store.DrawBarChart(a_d3Svg, [c_data0[3], c_data1[3]], a_metaData);
	}

	this.ShowEducation = function(a_d3Svg, a_countyDataPair, a_metaData)
	{
		var c_data0 = a_countyDataPair[0]['education-index'], c_data1 = a_countyDataPair[1]['education-index'];

		a_d3Svg.attr("height", "30%").attr("width", "34%");

		if ( !c_data0 || !c_data1 ) { return; }
		console.log("Education-index data found in data object for both counties.");

		// county_store.DrawBarChart(a_d3Svg, [c_data0, c_data1], county_store.data_scale['education-index'], "Education Index");
		county_store.DrawBarChart(a_d3Svg, [c_data0, c_data1], a_metaData);
	}

	this.ShowIncomeIndex = function(a_d3Svg, a_countyDataPair, a_metaData)
	{
		var c_data0 = a_countyDataPair[0]['income-index'], c_data1 = a_countyDataPair[1]['income-index'];

		a_d3Svg.attr("height", "30%").attr("width", "33%");

		if ( !c_data0 || !c_data1 ) { return; }
		console.log("Income-index data found in data object for both counties.");

		// county_store.DrawBarChart(a_d3Svg, [c_data0, c_data1], county_store.data_scale['income-index'], "Median Income Index");
		county_store.DrawBarChart(a_d3Svg, [c_data0, c_data1], a_metaData);
	}

	this.ShowHealthIndex = function(a_d3Svg, a_countyDataPair, a_metaData)
	{
		var c_data0 = a_countyDataPair[0]['health-index'], c_data1 = a_countyDataPair[1]['health-index'];

		a_d3Svg.attr("height", "30%").attr("width", "33%");

		if ( !c_data0 || !c_data1 ) { return; }
		console.log("Health-Index data found in data object for both counties.");

		// county_store.DrawBarChart(a_d3Svg, [c_data0, c_data1], county_store.data_scale['health-index'], "Health Index");
		county_store.DrawBarChart(a_d3Svg, [c_data0, c_data1], a_metaData);
	}

	this.DrawParallelCoordinatesChart = function(a_countyDataPair, a_d3Svg)
	{
		var x_base = 50, y_base = 25;
		var fill_color = ["#365697", "#ED416F"];

		a_d3Svg.attr("viewBox", "0 0 900 280");

		var chart_scale = {
			"population"          : d3.scale.linear().domain([0,   10000000]).range([200, 0]),
			"labor"               : d3.scale.linear().domain([0,    5000000]).range([200, 0]),
			"labor-scaled"        : d3.scale.linear().domain([0,       2800]).range([200, 0]),
			"unemployment"        : d3.scale.linear().domain([0.0,      0.2]).range([200, 0]),
			"education-index"     : d3.scale.linear().domain([0.0,     10.0]).range([200, 0]),
			"income-index"        : d3.scale.linear().domain([0.0,     10.0]).range([200, 0]),
			"health-index"        : d3.scale.linear().domain([0.0,     10.0]).range([200, 0])
		};

		var y_axis = d3.svg.axis().scale(chart_scale['population']).orient('left').ticks(5).tickFormat(d3.format("s"));
		a_d3Svg.append("g").attr("class", "axis").attr("transform", "translate(" + 75 + ", 20)").call(y_axis);
		a_d3Svg.append("text").attr("x", 50).attr("y", 250).text("Population");

		var y_axis = d3.svg.axis().scale(chart_scale['labor']).orient('left').ticks(5).tickFormat(d3.format("s"));
		a_d3Svg.append("g").attr("class", "axis").attr("transform", "translate(" + 225 + ", 20)").call(y_axis);
		a_d3Svg.append("text").attr("x", 190).attr("y", 250).text("Labor Force Size");

		var y_axis = d3.svg.axis().scale(chart_scale['unemployment']).orient('left').ticks(5).tickFormat(d3.format('%'));
		a_d3Svg.append("g").attr("class", "axis").attr("transform", "translate(" + 375 + ", 20)").call(y_axis);
		a_d3Svg.append("text").attr("x", 340).attr("y", 250).text("Unemployment Rate");

		var y_axis = d3.svg.axis().scale(chart_scale['education-index']).orient('right').ticks(5);
		a_d3Svg.append("g").attr("class", "axis").attr("transform", "translate(" + 525 + ", 20)").call(y_axis);
		a_d3Svg.append("text").attr("x", 500).attr("y", 250).text("Education Index");

		var y_axis = d3.svg.axis().scale(chart_scale['income-index']).orient('right').ticks(5);
		a_d3Svg.append("g").attr("class", "axis").attr("transform", "translate(" + 675 + ", 20)").call(y_axis);
		a_d3Svg.append("text").attr("x", 630).attr("y", 250).text("Median Income Index");

		var y_axis = d3.svg.axis().scale(chart_scale['health-index']).orient('right').ticks(5);
		a_d3Svg.append("g").attr("class", "axis").attr("transform", "translate(" + 825 + ", 20)").call(y_axis);
		a_d3Svg.append("text").attr("x", 800).attr("y", 250).text("Health-Care Index");

		c_data0 = a_countyDataPair[0];

		/*
		c_path0 = "M 50, 100 L 80, 120 L 200, 120 L 500, 150 L 700, 150 L 850, 30";
		*/

		c_path0 = "M 75," + (20 + Math.round(chart_scale['population'](c_data0['population']), 2))
				+ " L 225," + (20 + Math.round(chart_scale['labor'](c_data0['labor'][0]), 2))
				+ " L 375," + (20 + chart_scale['unemployment'](c_data0['labor'][3] / 100.0))
				+ " L 525," + (20 + chart_scale['education-index'](c_data0['education-index']))
				+ " L 675," + (20 + chart_scale['income-index'](c_data0['income-index']))
				+ " L 825," + (20 + chart_scale['health-index'](c_data0['health-index']));
		a_d3Svg.append("path").attr("d", c_path0).attr("fill", "none").attr("stroke", fill_color[0]).attr("stroke-width", "1");

		c_data1 = a_countyDataPair[1];

		c_path1 = "M 75," + (20 + Math.round(chart_scale['population'](c_data1['population']), 2))
				+ " L 225," + (20 + Math.round(chart_scale['labor'](c_data1['labor'][0]), 2))
				+ " L 375," + (20 + chart_scale['unemployment'](c_data1['labor'][3]/100.0))
				+ " L 525," + (20 + chart_scale['education-index'](c_data1['education-index']))
				+ " L 675," + (20 + chart_scale['income-index'](c_data1['income-index']))
				+ " L 825," + (20 + chart_scale['health-index'](c_data1['health-index']));
		a_d3Svg.append("path").attr("d", c_path1).attr("fill", "none").attr("stroke", fill_color[1]).attr("stroke-width", "1");

	}

	this.data_fields = [
			{
				"data_name"    : "population",
			    "renderer"     : this.ShowPopulation,
				"graph_title"  : "Population",
				"x_axis"       : d3.svg.axis().scale(this.data_scale['population']).orient('bottom').ticks(5).tickFormat(d3.format("s"))
			},
			{
				"data_name"    : "labor",
			    "renderer"     : this.ShowLaborForceSize,
				"graph_title"  : "Labor Force Size",
				"x_axis"       : d3.svg.axis().scale(this.data_scale['labor']).orient('bottom').ticks(5).tickFormat(d3.format("s"))
			},
			{
				"data_name"    : "unemployment",
			    "renderer"     : this.ShowUnemploymentRate,
				"graph_title"  : "Unemployment Rate",
				"x_axis"       : d3.svg.axis().scale(this.data_scale['unemployment-percent']).orient('bottom').ticks(5).tickFormat(d3.format("%"))
			},
			{
				"data_name"    : "education-index",
			    "renderer"     : this.ShowEducation,
				"graph_title"  : "Education Index",
				"x_axis"       : d3.svg.axis().scale(this.data_scale['education-index']).orient('bottom').ticks(5)
			},
			{
				"data_name"    : "income-index",
			    "renderer"     : this.ShowIncomeIndex,
				"graph_title"  : "Income Index",
				"x_axis"       : d3.svg.axis().scale(this.data_scale['income-index']).orient('bottom').ticks(5)
			},
			{
				"data_name"    : "health-index",
			    "renderer"     : this.ShowHealthIndex,
				"graph_title"  : "Health-Index",
				"x_axis"       : d3.svg.axis().scale(this.data_scale['health-index']).orient('bottom').ticks(5)
			}
		];

	this.ShowCountyCounty = function()
	{
		$("#county-county .svg-panel").each(function() { // Clear contents of SVG
			// console.log("this: " + this);
			// console.log("this.children(): " + $(this).children());
			// console.log("List returned - length: " + $(this).children().length);
			$(this).empty();
		});

		var state1_name  = $("select[name='state1']" ).val().trim();
		var state2_name  = $("select[name='state2']" ).val().trim();
		var county1_name = $("select[name='county1']").val();

		if ( !county1_name ) {
			return;
		}
		county1_name = county1_name.trim();

		var county2_name = $("select[name='county2']").val()
		if ( !county2_name ) {
			return;
		}
		county2_name = county2_name.trim();

		var state_county1 = this.GetStateAbbreviation(state1_name) + ", " + county1_name.toLowerCase();
		var state_county2 = this.GetStateAbbreviation(state2_name) + ", " + county2_name.toLowerCase();

		console.log("State-county 1: " + state_county1 + " & " + "State-county 2: " + state_county2);

		c_name1 = this.Capitalize(state_county1);
		c_name2 = this.Capitalize(state_county2);
		console.log("County 1 = " + state_county1 + ", c_name1: " + c_name1);
		console.log("County 2 = " + state_county2 + ", c_name2: " + c_name2);

		var county_data1 = this.GetCountyStore(state_county1);
		var county_data2 = this.GetCountyStore(state_county2);

		console.log("County 1 data: " + county_data1);
		console.log("County 2 data: " + county_data2);

		var county_pair = [ county_data1, county_data2 ];
		var font_style  = "Lucida Console", font_size = "18px";
		var rect_height = "30px";
		var fill_color  = ["#365697", "#ED416F"];

		var d3_scale    = this.data_scale['labor-force'];

        // var svg_titles  = [ "Population", "Labor Force Details", "Education Index",
		// 					"Income Index", "Health-Care Index" ];

		$("#svg-panel").empty(); // Clear all SVG elements and redraw graphs!

		var d3_svg_panel = d3.select("#svg-panel");
		var d3_svg;

		for (var ii = 0; ii < county_store.data_fields.length; ++ii) {
			var meta_data = county_store.data_fields[ii];

			d3_svg = d3_svg_panel.append("svg");
			d3_svg.attr("viewBox", "0 0 250 216");
			d3_svg.attr("preserveAspectRatio", "none");

			console.log("DATA-INDEX: " + ii + ", obj: " + meta_data['graph-title']);

			// var data_name = this.data_fields[ii];
			meta_data.renderer(d3_svg, county_pair, meta_data);
		}

		d3_svg = d3_svg_panel.append("svg");
		d3_svg.attr("height", "40%").attr("width",  "100%");
		this.DrawParallelCoordinatesChart(county_pair, d3_svg);
	}

	this.UpdateSelect = function(a_stateSelect, a_countySelect)
	{
		var state_name  = $(a_stateSelect).val().trim();
		var name_parts  = state_name.toLowerCase().split(' ');
		for (var ii = 0; ii < name_parts.length; ++ii) {
			name_parts[ii] = name_parts[ii].charAt(0).toUpperCase() + name_parts[ii].substr(1);
		}
		state_name      = name_parts.join(' ');
		var county_list = this.GetCountyNames(state_name);

		console.log("UpdateSelect(): state_name: " + state_name + ", county_list: " + county_list);

		if ( county_list ) {
			$(a_countySelect).empty();
			for (var ii = 0; ii < county_list.length; ++ii) {
				a_countySelect.add(new Option(county_list[ii]));
			}
		}
	}

	this.DoPageSetup = function()
	{
		$("#county-county .state-select").each(function () {
			state_list = county_store.GetStateNamesList();
			for (var ii = 0; ii < state_list.length; ++ii) {
				this.add(new Option(state_list[ii]));
			}
			console.log("select options changed.");
		});

		$("select[name='state1']").bind('change', function() {
			console.log("State 1 select input changed, event.target: " + event.target.tagName);
			// county_store.UpdateSelect(event.target, $("select[name='county1']")[0]);
			county_store.UpdateSelect($("select[name='state1']")[0], $("select[name='county1']")[0]);
			county_store.ShowCountyCounty();
		});

		$("select[name='state2']").bind('change', function() {
			console.log("State 2 select input changed, event.target: " + event.target.tagName);
			// county_store.UpdateSelect(event.target, $("select[name='county2']")[0]);
			county_store.UpdateSelect($("select[name='state2']")[0], $("select[name='county2']")[0]);
			county_store.ShowCountyCounty();
		});

		$("select[name='county1']").bind('change', function() {
			console.log("County 1 select input changed.");
			county_store.ShowCountyCounty();
		});

		$("select[name='county2']").bind('change', function() {
			console.log("County 2 select input changed.");
			county_store.ShowCountyCounty();
		});

		$("button.show-hide").each(function () {
			var current_button = $(this);

			current_button.bind('click', function() {
				current_button.parent().children('button').each(function() {
					if ( current_button.text() == $(this).text() ) {
						current_button.hide();
					} else {
						$(this).show();
					}
				});

				current_button.parent().children('.data-pane').each(function() {
					if ( current_button.text() == '-' ) {
						$(this).hide();
					} else {
						$(this).show();
					}
				});
			});

			if ( current_button.text() == '+' ) {
				current_button.hide();
			}
		});

		$("select[name='state1']").triggerHandler('change', event = { target : $("select[name='state1']")[0] });
		$("select[name='state2']").triggerHandler('change', event = { target : $("select[name='state2']")[0] });
	}
}

$(document).ready(function() {
	console.log("Document ready - get JSON object.");

	county_store = new CountyStore();

	var downloaded_datasets = 0;

    $.ajax({
		url: "data/county_data.json",

		dataType: 'json',

		success: function(a_countyData) {
				console.log("JSON object received: " + a_countyData['ca, santa clara']['population']);
				county_store.SetCountyStore(a_countyData); // Save data list!
			},

		error: function(request, textStatus, errorThrown) {
				// console.log(textStatus + " " + errorThrown);
				console.log("GET County data error! " + textStatus);
				console.log("GET County data error! " + errorThrown);
			},
	
		complete: function(request, textStatus) { // for additional info
				// console.log(request.responseText);
				// console.log(textStatus);
				console.log("GET county-data JSON - done!");
				if ( ++downloaded_datasets == 3 ) {
					county_store.DoPageSetup();
				}
			}
	});

    $.ajax({
		url: "data/state_names.json",

		dataType: 'json',

		success: function(a_stateNames) {
				console.log("JSON object received: " + a_stateNames['california']);
				county_store.SetStateNames(a_stateNames); // Save data list!
			},

		error: function(request, textStatus, errorThrown) {
				// console.log(textStatus + " " + errorThrown);
				console.log("GET State Names JSON - error!");
			},
	
		complete: function(request, textStatus) { // for additional info
				// console.log(request.responseText);
				// console.log(textStatus);
				console.log("GET State Names JSON - done!");
				if ( ++downloaded_datasets == 3 ) {
					county_store.DoPageSetup();
				}
			}
	});

    $.ajax({
		url: "data/state_county.json",

		dataType: 'json',

		success: function(a_stateCounties) {
				console.log("JSON object received: " + a_stateCounties['California']);
				county_store.SetStateCounties(a_stateCounties); // Save data list!
			},

		error: function(request, textStatus, errorThrown) {
				console.log(textStatus + " " + errorThrown);
				console.log("GET State Counties JSON - error!");
			},
	
		complete: function(request, textStatus) { // for additional info
				// console.log(request.responseText);
				// console.log(textStatus);
				console.log("GET State Counties JSON - done!");
				if ( ++downloaded_datasets == 3 ) {
					county_store.DoPageSetup();
				}
			}
	});
});

