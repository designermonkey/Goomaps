
// Options to initialise a simple map
var goomap = {
	debug: true;
	center: [15.12345, 1.12345],
//	center: "14 Stevensons Road, Longstanton, Cambridge, CB24 3GY",
	zoom: 10,
	MapTypeId: "roadmap",
	MapTypeControlOptions: {
		MapTypeIds: '',
		position: '',
		style: ''
	},
	OverviewMapControlOptions: false,
	PanControlOptions: '',
	RotateControlOptions: '',
	ScaleControlOptions: '',
	StreetViewControlOptions: '',
	ZoomControlOptions: ''
	events: {

	}
}

// Global events for Map overlays
var globalevents = {
	map: {},
	markers: {},
	polylines: {},
	polygons: {},
	layers: {}
}

// Options to add Markers to a map.
// Single Marker
var marker = {
	options: {
		// Required
		position: [52.257347,0.054988],
		title: '',
		// Optional
		// Custom icon, either string or object of options
	//	icon: '',
		icon: {
			url: '',
			size: [0,0,'px'],
			origin: [0,0],
			anchor: [0,0]
		},
		// Custom shadow, either a string or object of options
	//	shadow: '',
		shadow: {
			url: '',
			size: [0,0,'px'],
			origin: [0,0],
			anchor: [0,0]
		},
		clickable: true,
		draggable: false,
		info: ''
		uid: '',	// string unique identifier, even numbers must be a string!!!
		// user supplied data for storage
		data: {
			key: 'value'
		}
	},
	events: {
		click: function(event){},	// Returns LatLng
		dblclick: function(event){},
		rightclick: function(event){},
		mousedown: function(event){},
		mouseup: function(event){},
		mouseover: function(event){},
		mouseout: function(event){},
		drag: function(event){},
		dragstart: function(event){},
		dragend: function(event){}
	}
}
// Array of markers
var markers = [
	{
		options: {

		},
		events: {

		}
	}
]
// Function returning either Array or Object
var markerfunc = function(){}


// Options to add Polylines to a map
// Single Polyline
var polyline = {
	points: [
		[15.12345, 1.12345],
		[16.12345, 2.12345],
		[17.12345, 3.12345]
	],
	options: {
		// Required
		strokeColor: '',
		strokeOpacity: 1,
		strokeWeight: 2,
		// Optional
		clickable: true,
		geodesic: false
	},
	events: {
		click: function(event){},
		dblclick: function(){},
		rightclick: function(event){},
		mousedown: function(){},
		mouseup: function(){},
		mouseover: function(){},
		mouseout: function(){}
	}
}
// Array of Polylines
var polylines = [
	{
		points: [

		],
		options: {

		},
		events: {

		}
	}
]
// Function returning either Array or Object
var polylinefunc = function(){}

// Options to add Polygons to a map
// Single Polygon
var polygon = {
	points: [
		[15.12345, 1.12345],
		[16.12345, 2.12345],
		[17.12345, 3.12345]
	],
	options: {
		// Required
		fillColor: '',
		fillOpacity: 1,
		strokeColor: '',
		strokeOpacity: 1,
		strokeWeight: 2,
		// Optional
		clickable: true,
		geodesic: false
	},
	events: {
		click: function(event){},
		dblclick: function(){},
		rightclick: function(event){},
		mousedown: function(){},
		mouseup: function(){},
		mouseover: function(){},
		mouseout: function(){},
		mousemove: function(){}
	}
}
// Array of Polygons
var polygons = [
	{
		points: [

		],
		options: {

		},
		events: {

		}
	}
]
// Function returning either Array or Object
var polygonfunc = function(){}

// Options to add layers to a map
// Single layer
var layer = {
	options: {
		type: '', // bicycling, traffic, fusion, kml
		// Fusion Options
		id: 0, // Fusion table ID
		query: '',
		heatmap: false,
		// KML Options
		url: '',
		preserveViewport: false,
		suppressInfoWindows: false,	// Setting this option, it is advisable to add a click event to display the featureData somewhere on the page
		// Fusion & KML Options
		clickable: true
	},
	// For KML and Fusion Table layers
	events: {
		click: function(event){}
	}
}
// Array of layers
var layers = [
	{}
];
// Function returning either Array or Object
var layersfunc = function(){}

// Options to add circles to a map
// Single circle
var circle = {
	// Required
	options: {
		// Required
		center: [52.257347,0.054988],
		radius: 5, // meters
		fillColor: '',
		fillOpacity: 1,
		strokeColor: '',
		strokeOpacity: 1,
		strokeWeight: 2,
		// Optional
		clickable: true,
		geodesic: false
	},
	// Optional
	events: {
		click: function(event){},
		dblclick: function(event){},
		rightclick: function(event){},
		mouseover: function(event){},
		mouseout: function(event){},
		mousedown: function(event){},
		mouseup: function(event){},
		mousemove: function(event){},
	}
}
