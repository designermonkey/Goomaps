/*!
 *	@name			jQuery Goomaps (https://github.com/designermonkey/Goomaps) based on Google Maps APIv3
 *
 *	@author			John Porter		https://github.com/designermonkey
 *	@author			Adrian Weimann	https://github.com/awde
 *	@description	Makes using the Google Maps API easier with jQuery
 *	@version		Alpha-0.0.1
 *
 *	@license		Dual licensed under MIT and GPLv2
 */
(function($) {
	if(window.console) $.error = console.error;
	/**
	 * Goomaps function. Checks for method and applies the correct method. Falls
	 * back to init method.
	 *
	 * @param   {method} method   Method to initiate on the jQuery object
	 *
	 * @returns {Object}   Returns the passed in jQuery object for chainability
	 */
	$.fn.goomaps = function(method){
		if($.fn.goomaps.methods[method]){
			return $.fn.goomaps.methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}else if(typeof method === 'object' || !method){
			return $.fn.goomaps.methods.init.apply(this, arguments);
		}else{
			return $.error('Method ' + method + ' does not exist on jQuery.goomaps');
		}
	};
	$.fn.goomaps.methods = {
		/**
		 * Initialise the Google Map and store it in the element. If there are options
		 * provided, process them onto the map.
		 *
		 * If there is a map already stored in the element, it will be removed first.
		 *
		 * @param   {Object} options   Google Maps Map options
		 *
		 * @returns {Object} Returns the object passed in, for chainability.
		 */
		init: function(options){
			if(options && options.debug) $.goomaps.DEBUG = options.debug;
			return this.each(function(){
				// Remove any map data for this element
				$(this).goomaps('destroy');
				// Initialise a new data store
				$(this).data('goomaps', {map:{},markers:[],infowindows:[]});
				// Initialise a map, attach it to the element itself
				var map = new google.maps.Map(this, $.goomaps.defaults);
				$.goomaps.mapconstants(options);
				if(options && options.center){
					if(typeof options.center === 'string'){
						$.goomaps.geocode(options.center, function(result){
							options.center = result;
							map.setOptions(options);
						});
					}else if($.isArray(options.center)){
						options.center = $.goomaps.latlng(options.center);
						map.setOptions(options);
					}else{
						$.error('Goomaps init: options.center must be either type Array or String');
					}
				}
				if(options && options.events){
					$.goomaps.setevents(map, options.events);
				}
				var add = {
					map: map
				}
				$.extend($(this).data('goomaps'), add);
			});
		},
		/**
		 * Update an existing Google Map with new basic options
		 *
		 * @param   {Object} options   Google Maps Map options
		 *
		 * @returns {Object}   Returns the object passed in, for chainability
		 */
		update: function(options){
			if(options && options.debug === true) $.goomaps.DEBUG = options.debug;
			return this.each(function(){
				var map = $(this).data('goomaps').map;
				$.goomaps.mapconstants(options);
				if(options && options.center){
					if(typeof options.center === 'string'){
						$.goomaps.geocode(options.center, function(result){
							options.center = result;
							map.setOptions(options);
						});
					}else if($.isArray(options.center)){
						options.center = $.goomaps.latlng(options.center);
						map.setOptions(options);
					}else{
						$.error('Goomaps init: options.center must be either type Array or String');
					}
				}
				if(options && options.events){
					$.goomaps.setevents(map, options.events);
				}
				var add = {
					map: map
				}
				$.extend($(this).data('goomaps'), add);
			});
		},
		/**
		 *	Returns the Google Map of the element
		 *	@returns The Google Map of the selected element
		 */
		getmap: function(){
			return $(this).data('goomaps').map;
		},
		/**
		 * Remove data from the elment.
		 * This method will remove the goomaps data stored with the element.
		 * All data applied to the map will still be visible, but cannot be updated or reused.
		 *
		 * @param {String} key   If passed will remove the passed key only
		 *
		 * @returns {Object}   Returns the object passed in, for chainablity
		 */
		destroy: function(key){
			return this.each(function(){
				if($(this).data(key)){
					$(this).removeData(key);
				}else{
					$(this).empty();
				}
			});
		},
		/**
		 * Add Markers to an existing Google Map object.
		 *
		 * Markers are stored with the element containing the map, as an array of Google Maps Marker objects.
		 *
		 * @param   {Array} markers   Array of Marker objects
		 *
		 * @returns {Object}   Returns the object passed in, for chainability
		 */
		setmarkers: function(markers){
			return this.each(function(){
				$this = $(this);
				if(!$.isArray(markers)) markers = [markers];
				var map = $(this).data('goomaps').map;
				var add = {markers:[]};
				add.markers = $.goomaps.generatemarker(markers, map, $this);
				$this.data('goomaps').markers = add.markers;
			});
		},
		/**
		 * Add Markers to an existing Google Map object.
		 *
		 * Markers are stored with the element containing the map, as an array of Google Maps Marker objects.
		 *
		 * @param   {Array} marker   Array containing a Marker object
		 *
		 * @returns {Object}   Returns the object passed in, for chainability
		 */
		addmarker: function(marker){
			return this.each(function(){
				$this = $(this);
				if(!$.isArray(marker)) marker = [marker];
				var map = $(this).data('goomaps').map;
				var extender = $.goomaps.generatemarker(marker, map, $this);
				$.extend($this.data('goomaps').markers, extender);
			});
		},
		/**
		 * Filter all markers on supplied parameters to return matched results
		 *
		 * Passing a number to this method will return the specific marker stored at that index in the Array of markers.
		 * Passing an object will return an Array of markers that matched the properties of that object. The more properties, the harder the match.
		 * Passing a function will enable true|false matching on each marker in the Array of markers. The marker object, along with any extra arguments added to the method, are passed into this function for each iteration.
		 * Passing nothing into this method, will return all markers.
		 *
		 * Remember, the more markers you have stored, the longer the filtering process.
		 *
		 * @param   {Object|Function|Number} data   Object containing parameters to match or, Function returning true|false (boolean) per marker or, Number to match index of markers array
		 * @param	{Unknown} arguments   Extra arguments are all passed to the data paramm if it is a Function
		 *
		 * @returns {Array}   Array of matched markers, or empty Array
		 */
		getmarkers: function(data){
			var args = arguments;
			var results = [];
			var markers = $(this).data('goomaps').markers;
			// Check for array number
			if(data === 0 || typeof data === 'number'){
				results.push(markers[data]);
			}else if($.isPlainObject(data) || $.isFunction(data)){
				var position;
				if(data.position && $.isArray(data.position)){
					position = $.goomaps.latlng(data.position); // Get LatLng of position array
				}else if(data.position && !$.isArray(data.position)){
					if(window.console) console.warn('Goomaps getmarkers: Matching on position requires an array of coordinates');
					position = false;
				}
				$.each(markers, function(i, marker){
					if(position){
						var mpos = marker.getPosition(); // Get marker position LatLng
						if(mpos.equals(position)) results.push(marker); // check it equals position, add to results
					}else if(isin(data, marker)){
						results.push(marker); // check supplied data object
					}else if($.isFunction(data) && data(marker, args)){
						// use data as a filter-function (the filter function must be defined as 'function(marker, args)' and must return a boolean-value
						results.push(marker);
					}
				});
			}
			// Check for no data, also check that a number of 0 isn't passed
			if(data !== 0 && !data) results.push(markers);
			return $(results);
		}
	};

// -----------------------------------------------------------------------------

	/**
	 *	The Goomaps-Namespace
	 */
	$.goomaps = {};
	/**
	 * Checks if all properties in needle exists in haystack and are of the same value
	 * @param 	{Object} 	needle
	 * @param 	{Object} 	haystack
	 * @returns {Boolean}	true if haystack contains all values of needle
	 */
	var isin = function(needle, haystack){
		for(prop in needle){
			if (typeof(haystack[prop]) == 'undefined'){
				return false;
			}
			if(typeof(needle[prop]) == 'object'){
				if(!isin(needle[prop], haystack[prop])) {
					return false;
				}
			}
			if(needle[prop] != haystack[prop]) { return false; }
		}
		return true;
	};
	/**
	 *	Is a given marker within a circle?
	 *	Note: This is a filter-function for the getmarkers-method.
	 *	circle must be defined as:
	 *	{
	 *		center: [0, 0],
	 *		radius: '5.0km' // length-units: m, km
	 *	}
	 *
	 *	@param	{google.maps.Marker}	marker
	 *	@param	{Object}							circle
	 */
	$.goomaps.incircle = function(marker, circle){
		if(marker && circle){
			r = 0;
			with(circle.radius){
				if(indexOf('km') > 0) {
					r = parseFloat(circle.radius);
				} else if(indexOf('m') > 0) {
					r = parseFloat(circle.radius) / 1000;
				} else {
					r = parseFloat(circle.radius);
				}
			}
			var lat = marker.getPosition().lat(),
				lng = marker.getPosition().lng();
			return $.goomaps.distance(circle.center, [lat, lng]) <= r;
		}else{
			// Add console message here
			return false;
		}
	};
	/**
	 *	Calculates the distance between two points
	 *
	 *	@param		{LatLng|Array}	p1	first point; [lat, lng]
	 *	@param		{LatLng|Array}	p2	second point; [lat, lng]
	 *	@returns	{float}					the distance in km between the given points
	 */
	$.goomaps.distance = function(p1, p2){
		// for the mathematical background of this routine have a look at spherical trigonometry (law of cosines)
		var conv = function(p){
			var lat = undefined,
				lng = undefined;
			if(p.lat) { lat = p.lat(); }
			if(p.lng) { lng = p.lng(); }
			return 	[
				lat || p[0] || 0,
				lng || p[1] || 0
			];
		}
		var to_rad = function(deg){ // convert degrees in radiant
			return (Math.PI/180) * deg;
		}
		if(p1 && p2){
			var point1 = conv(p1),
				point2 = conv(p2);

			var lat1 = to_rad(point1[0]),
				lng1 = to_rad(point1[1]),
				lat2 = to_rad(point2[0]),
				lng2 = to_rad(point2[1]);

			with(Math){
				var cos_e = sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lng2 - lng1),
					e = acos(cos_e);
				return	$.goomaps.EARTH_RADIUS * e;
			}
		}
		return -1.0; // failure
	};

	/**
	 * Generate Google Maps Markers objects using provided options
	 *
	 * @param   {Array} input   Array of markers options
	 * @param   {Map} map   Google Map object
	 *
	 * @returns {Array} Array of Google Maps Marker objects
	 */
	$.goomaps.generatemarker = function(input, map, datastore){
		var output = new Array();
		$.each(input, function(i, marker)
		{
			input[i].options.map = map;
			// Custom Icon
			if(marker.options.icon){
				input[i].options.icon = $.goomaps.markerimage(marker.options.icon);
			}
			// Custom Shadow
			if(marker.options.shadow){
				input[i].options.shadow = $.goomaps.markerimage(marker.options.shadow);
			}
			// Animation
			if(marker.options.animation){
				if(marker.options.animation == 'drop'){
					animation = google.maps.Animation.DROP;
				}else if(marker.options.animation == 'bounce'){
					animation = google.maps.Animation.BOUNCE;
				}else{
					if(window.console) console.warn("'Goomaps generatemarker function': Supplied animation type not supported.");
				}
			}
			// Position (required, or fail)
			if(marker.options.position && $.isArray(marker.options.position)){
				input[i].options.position = $.goomaps.latlng(marker.options.position);
				if($.goomaps.DEBUG && window.console) console.log('marker'+i+' position:', input[i].options.position);
				output[i] = new google.maps.Marker(input[i].options);
			}else if(marker.options.position && !$.isArray(marker.options.position)){
				if(window.console) console.error("'Goomaps generatemarker function': The position provided is not an array.");
			}else{
				if(window.console) console.error("'Goomaps generatemarker function': A position must be provided as an array. None provided.");
			}
			// Events, requires the marker to be set
			if(marker.events){
				$.goomaps.setevents(output[i], input[i].events);
			}
			// Infowindow, requires the marker to be set
			if(marker.options.info){
				if(datastore){
					var extender = $.goomaps.infowindow(output[i], input[i].options.info, map);
					//console.log(datastore.data('goomaps').infowindows)
					datastore.data('goomaps').infowindows.push(extender);
				}else{
					$.goomaps.infowindow(output[i], input[i].options.info, map);
				}
				// Open the info window straight away
				if(marker.options.initialopen == true){
					google.maps.event.trigger(output[i], 'click');
				}
			}
		});
		return output;
	}
	/**
	 * Create a Google Maps LatLng object from array of coordinates
	 *
	 * @param   {Array} coords   Array of coordinates as [lat,lng]
	 *
	 * @returns {LatLng}   Google Maps LatLng object
	 */
	$.goomaps.latlng = function(coords){
		if($.isArray(coords)){
			return new google.maps.LatLng(coords[0], coords[1]);
		}else{
			if(window.console) console.error("'Goomaps latlng function': Must be provided with an array of coordinates.");
			return false;
		}
	};
	/**
	 * Create a Google Maps LatLngBounds object from array of coordinates
	 */
	$.goomaps.latlngbounds = function(coords){
		var a = $.goomaps.latlng(coords[0]);
		var b = $.goomaps.latlng(coords[1]);
		return new google.maps.LatLngBounds(a, b);
	};
	/**
	 * Google Maps Geocoder object
	 */
	$.goomaps.geocoder = {};
	/**
	 * Geocode addresses using the Google Maps Geocoder service
	 *
	 * @param   {String} address   Address to geocode
	 * @param   {Function} callback   Callback function
	 *
	 * @returns {LatLng}   Google Maps LatLng object
	 */
	$.goomaps.geocode = function(address, callback){
		if($.isEmptyObject($.goomaps.geocoder)) $.goomaps.geocoder = new google.maps.Geocoder();
		if(typeof address === 'string' && $.isFunction(callback)){
			$.goomaps.geocoder.geocode({address: address}, function(results, status){
				if(status == google.maps.GeocoderStatus.OK){
					callback(results[0].geometry.location);
					return true;
				}else{
					if($.goomaps.DEBUG && window.console) console.log('Geocoder status returned: '+status);
					callback(results);
					return false;
				}
			});
			return true;
		}else{
			if(typeof address != 'string' && !$.isFunction(callback)){
				if($.goomaps.DEBUG && window.console) return console.log('Geocoder requires an address string, and a callback function');
			}else if(typeof address != 'string'){
				if($.goomaps.DEBUG && window.console) return console.log('Geocoder requires an address string');
			}else if(!$.isFunction(callback)){
				if($.goomaps.DEBUG && window.console) return console.log('Geocoder requires a callback function');
			}
			return false;
		}
	};

	/**
	 * Create a MarkerImage for use on a Google Maps Marker
	 *
	 * @param   {Object|String} options   Google Maps MarkerImage options, or string of path to image
	 *
	 * @returns {MarkerImage}   Google Maps MarkerImage object
	 */
	$.goomaps.markerimage = function(options){
		if(typeof options !== 'string'){
			var size, scaledSize, anchor, origin;
			if(options.size){
				size = new google.maps.Size(options.size[0], options.size[1]);
			}
			if(options.scaledSize){
				scaledSize = new google.maps.Size(options.scaledSize[0], options.scaledSize[1]);
			}
			if(options.anchor){
				anchor = new google.maps.Point(options.anchor[0], options.anchor[1]);
			}
			if(options.origin){
				origin = new google.maps.Point(options.origin[0], options.origin[1]);
			}
			return new google.maps.MarkerImage(options.url, size, origin, anchor, scaledSize);
		}else{
			return new google.maps.MarkerImage(options);
		}
	};
	/**
	 * Create a Google Maps InfoWindow attached to the provided Marker
	 *
	 * @param   {Marker} marker   Google Maps Marker object
	 * @param   {String} info   Either a selector or string of data
	 *
	 * @returns {InfoWindow}   Google Maps InfoWindow object
	 */
	$.goomaps.infowindow = function(marker, info, map){
		var infowindow;
		if(typeof info === 'string' && info.match('^#')){
			$(info).hide();
			infowindow = new google.maps.InfoWindow({content: $(info).html()});
		}else{
			infowindow = new google.maps.InfoWindow({content: info});
		}
		$.goomaps.setevents(marker, {'click': function(){
			infowindow.open(map, marker);
		}});
		return infowindow;
	};
	/**
	 * Set events from an object containing event callbacks
	 *
	 * @param   {Object} target   The object to attach the event listener to
	 * @param   {Object} events   The event callbacks
	 *
	 */
	$.goomaps.setevents = function(target, events){
		$.each(events, function(event, callback){
			google.maps.event.addListener(target, event, callback);
		});
	};
	/**
	 * Converts given constant strings into Google Maps Constants
	 *
	 * @param   {object} options   Object of map options to search for strings within
	 *
	 * @returns {Constant} Google Maps Constant
	 */
	$.goomaps.mapconstants = function(options){
		if(options){
			// MapTypeId
			if(options.MapTypeId) options.MapTypeId = $.goomaps.constants.MapTypeId(options.MapTypeId);

			// MapTypeControlOptions:
			if(options.mapTypeControlOptions){
				if(options.mapTypeControlOptions.position)	options.mapTypeControlOptions.position	= $.goomaps.constants.ControlPosition(options.mapTypeControlOptions.position);
				if(options.mapTypeControlOptions.style)		options.mapTypeControlOptions.style		= $.goomaps.constants.MapTypeControlStyle(options.mapTypeControlOptions.style);
			}

			// ScaleControlOptions:
			if(options.scaleControlOptions){
				if(options.scaleControlOptions.position)	options.scaleControlOptions.position	= $.goomaps.constants.ControlPosition(options.scaleControlOptions.position);
				if(options.scaleControlOptions.style)		options.scaleControlOptions.style		= $.goomaps.constants.ScaleControlStyle(options.scaleControlOptions.style);
			}

			// ZoomControlOptions:
			if(options.zoomControlOptions){
				if(options.zoomControlOptions.position)		options.zoomControlOptions.position		= $.goomaps.constants.ControlPosition(options.zoomControlOptions.position);
				if(options.zoomControlOptions.style)		options.zoomControlOptions.style		= $.goomaps.constants.ZoomControlStyle(options.zoomControlOptions.style);
			}

			// PanControlOptions:
			if(options.panControlOptions){
				if(options.panControlOptions.position)		options.panControlOptions.position	= $.goomaps.constants.ControlPosition(options.panControlOptions.position);
			}

			// RotateControlOptions:
			if(options.rotateControlOptions){
				if(options.rotateControlOptions.position)		options.rotateControlOptions.position		= $.goomaps.constants.ControlPosition(options.rotateControlOptions.position);
			}
		}
	};
	/**
	 * Extendable object containing Constant conversion functions
	 */
	$.goomaps.constants = {
		/**
		 * Converts the given string into a Google Maps MapTypeId Constant
		 *
		 * @param   {String} val   The string to convert
		 *
		 * @returns {Constant} Google Maps Constant
		 */
		MapTypeId: function(val){
			switch(val.toUpperCase()){
				case 'HYBRID':			return google.maps.MapTypeId.HYBRID;
				case 'SATELLITE':		return google.maps.MapTypeId.SATELLITE;
				case 'TERRAIN':			return google.maps.MapTypeId.TERRAIN;
				case 'ROADMAP':
				default:				return google.maps.MapTypeId.ROADMAP;
			}
		},
		/**
		 * Converts the given string into a Google Maps ControlPosition Constant
		 *
		 * @param   {String} val   The string to convert
		 *
		 * @returns {Constant} Google Maps Constant
		 */
		ControlPosition: function(val){
			switch(val.toUpperCase()){
				case 'BOTTOM_CENTER':	return google.maps.ControlPosition.BOTTOM_CENTER;
				case 'BOTTOM_LEFT':		return google.maps.ControlPosition.BOTTOM_LEFT;
				case 'BOTTOM_RIGHT':	return google.maps.ControlPosition.BOTTOM_RIGHT;
				case 'LEFT_BOTTOM':		return google.maps.ControlPosition.LEFT_BOTTOM;
				case 'LEFT_CENTER':		return google.maps.ControlPosition.LEFT_CENTER;
				case 'LEFT_TOP':		return google.maps.ControlPosition.LEFT_TOP;
				case 'RIGHT_BOTTOM':	return google.maps.ControlPosition.RIGHT_BOTTOM;
				case 'RIGHT_CENTER':	return google.maps.ControlPosition.RIGHT_CENTER;
				case 'RIGHT_TOP':		return google.maps.ControlPosition.RIGHT_TOP;
				case 'TOP_CENTER':		return google.maps.ControlPosition.TOP_CENTER;
				case 'TOP_LEFT':		return google.maps.ControlPosition.TOP_LEFT;
				case 'TOP_RIGHT':		return google.maps.ControlPosition.TOP_RIGHT;
			}
		},
		/**
		 * Converts the given string into a Google Maps MapTypeControlStyle Constant
		 *
		 * @param   {String} val   The string to convert
		 *
		 * @returns {Constant} Google Maps Constant
		 */
		MapTypeControlStyle: function(val){
			switch(val.toUpperCase()){
				case 'DROPDOWN_MENU':	return google.maps.MapTypeControlStyle.DROPDOWN_MENU;
				case 'HORIZONTAL_BAR':	return google.maps.MapTypeControlStyle.HORIZONTAL_BAR;
				case 'DEFAULT':
				default:				return google.maps.MapTypeControlStyle.DEFAULT;
			}
		},
		/**
		 * Converts the given string into a Google Maps ScaleControlStyle Constant
		 *
		 * @param   {String} val   The string to convert
		 *
		 * @returns {Constant} Google Maps Constant
		 */
		ScaleControlStyle: function(val){
			switch(val.toUpperCase()){
				case 'DEFAULT':
				default:				return google.maps.ScaleControlStyle.DEFAULT;
			}
		},
		/**
		 * Converts the given string into a Google Maps ZoomControlStyle Constant
		 *
		 * @param   {String} val   The string to convert
		 *
		 * @returns {Constant} Google Maps Constant
		 */
		ZoomControlStyle: function(val){
			switch(val.toUpperCase()){
				case 'LARGE':			return google.maps.ZoomControlStyle.LARGE;
				case 'SMALL':			return google.maps.ZoomControlStyle.SMALL;
				case 'DEFAULT':
				default:				return google.maps.ZoomControlStyle.DEFAULT;
			}
		},
		/**
		 * Converts the given string into a Google Maps DirectionsTravelMode Constant
		 *
		 * @param   {String} val   The string to convert
		 *
		 * @returns {Constant} Google Maps Constant
		 */
		DirectionsTravelMode: function(val){
			switch(val.toUpperCase()){
				case 'BICYCLING':		return google.maps.DirectionsTravelMode.BICYCLING;
				case 'WALKING':			return google.maps.DirectionsTravelMode.WALKING;
				case 'DRIVING':
				default:				return google.maps.DirectionsTravelMode.DRIVING;
			}
		},
		/**
		 * Converts the given string into a Google Maps DirectionsUnitSystem Constant
		 *
		 * @param   {String} val   The string to convert
		 *
		 * @returns {Constant} Google Maps Constant
		 */
		DirectionsUnitSystem: function(val){
			switch(val.toUpperCase()){
				case 'IMPERIAL':		return google.maps.DirectionsUnitSystem.IMPERIAL;
				case 'METRIC':
				default:				return google.maps.DirectionsUnitSystem.METRIC;
			}
		},
	};
	/**
	 * Goomaps Default options for initialisation of the map
	 */
	$.goomaps.defaults = {
		center: new google.maps.LatLng(0,0),
		zoom: 10,
		MapTypeId: 'roadmap'
	};
	/**
	 * Goomaps Earth Radius
	 */
	$.goomaps.EARTH_RADIUS = 6371;
	/**
	 * Goomaps debugger switch
	 */
	$.goomaps.DEBUG = false;
	/**
	 * Goomaps plugin version number
	 */
	$.goomaps.PLUGIN_VERSION = "1.0";
	/**
	 * Google Maps API version number
	 */
	$.goomaps.API_VERSION = "3.4";

})(jQuery);
