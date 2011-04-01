/*!
 *	@name					jQuery Goomaps (https://github.com/designermonkey/Goomaps)
 *								based on Google Maps APIv3
 *
 *	@author				John Porter 		https://github.com/designermonkey
 *	@author				Adrian Weimann	https://github.com/awde
 *	@description	Makes using the Google Maps API easier with jQuery
 *	@version			Alpha-0.0.1
 *
 *	@license			Dual licensed under MIT and GPLv2
 */
(function($) {
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
			if(options && options.debug) $.fn.goomaps.debug = options.debug;
			return this.each(function(){
				// Remove any map data for this element
				$(this).goomaps('destroy');
				// Initialise a map, attach it to the element itself
				var map = new google.maps.Map(this, $.fn.goomaps.defaults);
				if(options && options.center){
					if(typeof options.center === 'string'){
						$.fn.goomaps.geocode(options.center, function(result){
							map.setCenter(result);
						});
					}else if($.isArray(options.center)){
						map.setCenter($.fn.goomaps.latlng(options.center));
					}else{
						if($.fn.goomaps.debug && window.console){
							console.log('init: options.center must be either type Array or String');
						}
					}
				}
				if(options && options.zoom){
					map.setZoom(options.zoom);
				}
				if(options && options.MapTypeId){
					map.setMapTypeId(options.MapTypeId);
				}
				if(options && options.events){
					$.fn.goomaps.setevents(map, options.events);
				}
				var add = {
					map: map
				}
				$(this).data('goomaps', add);
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
			if(options && options.debug === true) $.fn.goomaps.debug = options.debug;
			return this.each(function(){
				var map = $(this).data('goomaps').map;
				if(options && options.center){
					if(typeof options.center === 'string'){
						$.fn.goomaps.geocode(options.center, function(result){
							map.setCenter(result);
						});
					}else if($.isArray(options.center)){
						map.setCenter($.fn.goomaps.latlng(options.center));
					}else{
						// Expand the error console logging
						if($.fn.goomaps.debug && window.console){
							console.log('options.center must be either type Array or String');
						}
					}
				}
				if(options && options.zoom){
					map.setZoom(options.zoom);
				}
				if(options && options.MapTypeId){
					map.setMapTypeId(options.MapTypeId);
				}
				if(options && options.events){
					$.fn.goomaps.setevents(map, options.events);
				}
			});
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
				$.each(markers, function(i, marker){
					marker.options.map = map;
					// Animation
					if(marker.options.animation){
						if(marker.options.animation == 'drop') marker.options.animation = google.maps.Animation.DROP;
						if(marker.options.animation == 'bounce') marker.options.animation = google.maps.Animation.BOUNCE;
					}
					// Custom Icon
					if(marker.options.icon && typeof marker.options.icon != 'string'){
						marker.options.icon = $.fn.goomaps.markerimage(marker.options.icon);
					}
					// Custom Shadow
					if(marker.options.shadow && typeof marker.options.shadow != 'string'){
						marker.options.shadow = $.fn.goomaps.markerimage(marker.options.shadow);
					}
					// Position
					if(marker.options.position && $.isArray(marker.options.position)){
						marker.options.position = $.fn.goomaps.latlng(marker.options.position);
						add.markers[i] = new google.maps.Marker(marker.options);
						ExtendMarker(map, add.markers[i]);
					}else{
						if($.fn.goomaps.debug && window.console) console.log('Markers must be provided with a position.');
					}
					// Events
					if(marker.events){
						$.fn.goomaps.setevents(add.markers[i], marker.events);
					}
					// Infowindow
					if(marker.options.info){
						$.fn.goomaps.infowindow(add.markers[i], marker.options.info, map);
						// Open the info window straight away
						if(marker.options.initialopen == true){
							google.maps.event.trigger(add.markers[i], 'click');
						}
					}
				});
				$.extend($this.data('goomaps'), add);
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
					position = $.fn.goomaps.latlng(data.position); // Get LatLng of position array
				}else if(!$.isArray(data.position)){
					if($.fn.goomaps.debug && window.console) console.log('getmarkers: Matching on position requires an array of coordinates');
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
		},
		/**
		 *	Returns the Google Map of the element
		 *	@returns The Google Map of the selected element
		 */
		getmap: function(){
			return $(this).data('goomaps').map;
		}
	};

// -----------------------------------------------------------------------------

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
	$.fn.goomaps.incircle = function(marker, circle){
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
			return $.fn.goomaps.distance(circle.center, [lat, lng]) <= r;
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
	$.fn.goomaps.distance = function(p1, p2){
		// for the mathematical background of this routine have a look at spherical trigonometry (law of cosines)
		var conv = function(p){
			var lat = undefined,
				lng = undefined;
			if(p[lat]) { lat = p.lat(); }
			if(p[lng]) { lng = p.lng(); }
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
				return	$.fn.goomaps.EARTH_RADIUS * e;
			}
		}
		return -1.0; // failure
	};

	/**
	 *	Extends a Marker with several functions:
	 *		- getInfoWindow(): gets the infowindow which is assigned to a marker; if there is no infowindow, an infowindow will be created first.
	 *
	 *	Note: This is an internal function and will be used in:
	 *		- $.fn.goomaps.methods.setmarkers
	 *
	 *	@param	{Map}			the Google Map Object
	 *	@param	{Marker}	the Marker which will be extended
	 */
	var ExtendMarker = function(map, marker){

		marker.getInfoWindow = function(){
			// Return the markers infowindow if it exists.
			// If there is no infowindow create one first, append it to the marker and return the newly created.
			// with this it's possible to reuse an infowindow
			if(this.infowindow){
				return this.infowindow;
			} else {
				this.infowindow = new google.maps.InfoWindow();

				$.fn.goomaps.setevents(this, {'click': function(){
					this.infowindow.open(map, this);
				}});

				return this.infowindow;
			}
		};
	}

	/**
	 * Create a Google Maps LatLng object from array of coordinates
	 *
	 * @param   {Array} coords   Array of coordinates as [lat,lng]
	 *
	 * @returns {LatLng}   Google Maps LatLng object
	 */
	$.fn.goomaps.latlng = function(coords){
		if($.isArray(coords)){
			return new google.maps.LatLng(coords[0], coords[1]);
		}else{
			if($.fn.goomaps.debug && window.console) console.log('latlng must be provided with an array of coordinates.');
			return false;
		}
	};
	/**
	 * Create a Google Maps LatLngBounds object from array of coordinates
	 */
	$.fn.goomaps.latlngbounds = function(coords){
		var a = $.fn.goomaps.latlng(coords[0]);
		var b = $.fn.goomaps.latlng(coords[1]);
		return new google.maps.LatLngBounds(a, b);
	};
	/**
	 * Google Maps Geocoder object
	 */
	$.fn.goomaps.geocoder = {};
	/**
	 * Geocode addresses using the Google Maps Geocoder service
	 *
	 * @param   {String} address   Address to geocode
	 * @param   {Function} callback   Callback function
	 *
	 * @returns {LatLng}   Google Maps LatLng object
	 */
	$.fn.goomaps.geocode = function(address, callback){
		if($.isEmptyObject($.fn.goomaps.geocoder)) $.fn.goomaps.geocoder = new google.maps.Geocoder();
		if(typeof address === 'string' && $.isFunction(callback)){
			$.fn.goomaps.geocoder.geocode({address: address}, function(results, status){
				if(status == google.maps.GeocoderStatus.OK){
					callback(results[0].geometry.location);
					return true;
				}else{
					if($.fn.goomaps.debug && window.console) console.log('Geocoder status returned: '+status);
					callback(results);
					return false;
				}
			});
			return true;
		}else{
			if(typeof address != 'string' && !$.isFunction(callback)){
				if($.fn.goomaps.debug && window.console) return console.log('Geocoder requires an address string, and a callback function');
			}else if(typeof address != 'string'){
				if($.fn.goomaps.debug && window.console) return console.log('Geocoder requires an address string');
			}else if(!$.isFunction(callback)){
				if($.fn.goomaps.debug && window.console) return console.log('Geocoder requires a callback function');
			}
			return false;
		}
	};

	/**
	 * Create a MarkerImage for use on a Google Maps Marker
	 *
	 * @param   {Object} options   Google Maps MarkerImage options
	 *
	 * @returns {MarkerImage}   Google Maps MarkerImage object
	 */
	$.fn.goomaps.markerimage = function(options){
		if(options.size){
			options.size = new google.maps.Size(options.size[0], options.size[1]);
		}
		if(options.anchor){
			o.anchor = new google.maps.Point(options.anchor[0], options.anchor[1]);
		}
		if(options.origin){
			o.origin = new google.maps.Point(options.origin[0], options.origin[1]);
		}
		return new google.maps.MarkerImage(options);
	};
	/**
	 * Create a Google Maps InfoWindow attached to the provided Marker
	 *
	 * @param   {Marker} marker   Google Maps Marker object
	 * @param   {String} info   Either a selector or string of data
	 *
	 * @returns {InfoWindow}   Google Maps InfoWindow object
	 */
	$.fn.goomaps.infowindow = function(marker, info, map){
		var infowindow;
		if(typeof info === 'string' && info.match('^#')){
			$(info).hide();
			marker.getInfoWindow().setContent($(info).html());
		}else{
			marker.getInfoWindow().setContent(info);
		}
		$.fn.goomaps.setevents(marker, {'click': function(){
			marker.getInfoWindow().open(map, marker);
		}});
	};
	/**
	 * Set events from an object containing event callbacks
	 *
	 * @param   {Object} target   The object to attach the event listener to
	 * @param   {Object} events   The event callbacks
	 *
	 */
	$.fn.goomaps.setevents = function(target, events){
		$.each(events, function(event, callback){
			google.maps.event.addListener(target, event, callback);
		});
	};
	/**
	 *	Functions to convert values into Google Maps Constants
	 *
	 *
	 */
	$.fn.goomaps.constants = {
		/**
		 *	Converts a given string into google.Maps.ControlPosition-Constants
		 *	@param		{string}	the value to convert into the constant
		 *	@returns	{google.maps.ControlPosition}	the ControlPosition-Constant for the given string-value; undefined if there is no match
		 */
		ControlPosition: function(val){
			switch(val.toUpperCase()){
				case 'BOTTOM':
					return google.maps.ControlPosition.BOTTOM;
				case 'BOTTOM_LEFT':
					return google.maps.ControlPosition.BOTTOM_LEFT;
				case 'BOTTOM_RIGHT':
					return google.maps.ControlPosition.BOTTOM_RIGHT;
				case 'LEFT':
					return google.maps.ControlPosition.LEFT;
				case 'RIGHT':
					return google.maps.ControlPosition.RIGHT;
				case 'TOP':
					return google.maps.ControlPosition.TOP;
				case 'TOP_LEFT':
					return google.maps.ControlPosition.TOP_LEFT;
				case 'TOP_RIGHT':
					return google.maps.ControlPosition.TOP_RIGHT;
			}
		}
	};
	/**
	 * Goomaps Default options for initialisation of the map
	 */
	$.fn.goomaps.defaults = {
		center: new google.maps.LatLng(0,0),
		zoom: 10,
		MapTypeId: google.maps.MapTypeId.ROADMAP
	};
	/**
	 * Goomaps Earth Radius
	 */
	$.fn.goomaps.EARTH_RADIUS = 6378137;
	/**
	 * Goomaps debugger switch
	 */
	$.fn.goomaps.DEBUG = false;
	/**
	 * Goomaps plugin version number
	 */
	$.fn.goomaps.PLUGIN_VERSION = "1.0";
	/**
	 * Google Maps API version number
	 */
	$.fn.goomaps.API_VERSION = "3.4";

})(jQuery);
