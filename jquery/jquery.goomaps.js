
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
			$.error('Method ' + method + ' does not exist on jQuery.goomaps');
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
						if($.fn.goomaps.debug && window.console) console.log('options.center must be either type Array or String');
					}
				}
				if(options && options.zoom){
					map.setZoom(options.zoom);
				}
				if(options && options.MapTypeId){
					map.setMapTypeId(options.MapTypeId);
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
						if($.fn.goomaps.debug && window.console) console.log('options.center must be either type Array or String');
					}
				}
				if(options && options.zoom){
					map.setZoom(options.zoom);
				}
				if(options && options.MapTypeId){
					map.setMapTypeId(options.MapTypeId);
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
		 * Markers are stored with the element containing the map, as an array
		 * of Google Maps Marker objects.
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
					// UID
					if(marker.options.uid){
						//i = marker.options.uid;	// Sets the iterator to the UID passed by the user.
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
						if(marker.options.initialopen){
							google.maps.event.trigger(add.markers[i], 'click');
						}
					}
				});
				$.extend($this.data('goomaps'), add);
			});
		},
		/**
		 *	Select all markers by a given selection-object.
		 *	If you want to find a marker that is defined as:
		 *	{
		 *		position: [0, 0],
		 *		userdefined: { identity: 'id_0815' },
		 *		hello: 'world'
		 *	}
		 *
		 * 	You can use one of following selection objects
		 *
		 * 	{
		 *		userdefined: { identity: 'id_0815' },
		 * 	}
		 *
		 * 	{
		 *		hello: 'world',
		 * 	}
		 *
		 *	TODO: currently you can't select by position.
		 *
		 *	This method will return all markers that define a subset of the given data-object.
		 *	If a marker doesn't contain all values of the given data-object it wont't be returned.
		 *	But be aware, if there are many markers this method can be very slow as it iterates over all markers.
		 *	If no data is given it returns all markers.
		 *	If data is a function it will be used to filter the markers.
		 *
		 *	@param		{Object|Function}	data	is a subset of all values for the returned markers (optional). If no data is given
		 *																		it returns all markers of a map.
		 *
		 *																		If data is a function this function will be used as a filter on the markerlist.
		 *																		The data-function should return a boolean-value and must be defined as 'function(marker, ...)'
		 *																		If the filter-function returns true for a given marker/any the marker will be pushed onto
		 *																		the results. A possible call can look like this:
		 *																			$('#map').goomaps('getmarkers', $.fn.goomaps.incircle, { center: [0, 0], radius: '10km' });
		 *																		With this you can define your own filter-functions or use the built-in-filter-functions like incircle.
		 *
		 *	@param		{Any}			The parameter 'any' will be used as the second parameter for a filter-function and is specific to the filter-function.
		 *											It's not required if:
		 *												- the filter-function don't need another parameter or
		 *												- there is no filter-function in the data-parameter
		 *
		 *	@returns	{Array}		Array of all markers that have defined all values of the given data-object. If there is no
		 *											matching marker it returns an empty array. If data is a filter-function this array will contain
		 *											all markers where the filter has returned true.
		 */
		getmarkers: function(data, any){
			var markers = $(this).data('goomaps').markers;
			if(!data) return $(markers);
			var results = [];
			// Check for object of data, array of coords or string uid
			if($.isPlainObject(data) || $.isArray(data) || typeof data === 'string'){
				if($.isArray(data)) var position = $.fn.goomaps.latlng(data); // Get LatLng of array
				$.each(markers, function(i, marker){
					if($.isArray(data)){
						var mpos = marker.getPosition(); // Get marker position LatLng
						if(mpos.equals(position)) results.push(marker); // check it equals position, add to results
					}else if(typeof data === 'string'){
						if(marker.uid && marker.uid == data) results.push(marker); // check supplied uid
					}else if(isin(data, marker)){
						results.push(marker); // check supplied data object
					}
				});
			}else if(typeof data === 'number'){
				results.push(markers[data]);
			}else if($.isFunction(data)){
				// use data as a filter-function (the filter function must be defined as 'function(marker, ...)' and must return a boolean-value
				$.each(markers, function(i, marker){
					if(data(marker, any)){
						results.push(marker);
					}
				});
			}
			return $(results);
		},

		/**
		 * Get a specific marker attached to the Google Map object
		 *
		 * Providing an integer, or array of latitude longitude coordinates will
		 * retreive the relevant marker from the markers attached to the Google
		 * Map object. Integer for array index, latitude longitude coordinates
		 * for the matched marker.
		 *
		 * This is a terminating method and will not allow chainability past it's
		 * call, i.e. it doesn't return 'this' jQuery object in favour of
		 * returning a jQuery array of markers.
		 *
		 * @param {Array} data   Array of latitude longitude coordinates
		 * @param {Integer} data   Number to match against array index
		 *
		 * @returns {Marker}  Google Maps Marker object
		 */
		getmarker: function(data){
			// TODO:	Test this function
			if($.isArray(data) || typeof data === 'string'){
				var position = $.fn.goomaps.latlng(data);
				$.each(this.data('goomaps').markers, function(i, marker){
					if($.isArray(data)){
						var mpos = marker.getPosition();
						if(mpos.equals(position)) return $(marker);
					}else{
						if(marker.uid == data) return $(marker);
					}
				});
			}else if(typeof data === 'number'){
				return $(this.data('goomaps').markers[data]);
			}
		},

		addevents: function(events){
			return this.each(function(){
				$.fn.goomaps.setevents($(this), events);

			});
		}
	};

// -----------------------------------------------------------------------------

	var R = 6371; // mean radius of the earth (km)

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
		// TODO: this function needs to be tested
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
			lat = marker.getPosition().lat();
			lng = marker.getPosition().lng();
			return $.fn.goomaps.distance(circle.center, [lat, lng]) <= r;
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

		conv = function(p){
			lat = undefined;
			lng = undefined;
			if(p[lat]) { lat = p.lat(); }
			if(p[lng]) { lng = p.lng(); }
			return 	[
								lat || p[0] || 0,
								lng || p[1] || 0
							];
		}

		to_rad = function(deg){ // convert degrees in radiant
			return (Math.PI/180) * deg;
		}

		if(p1 && p2){
			point1 = conv(p1);
			point2 = conv(p2);

			lat1	= to_rad(point1[0]);
			lng1	= to_rad(point1[1]);

			lat2	= to_rad(point2[0]);
			lng2	= to_rad(point2[1]);

			with(Math){
				cos_e =	sin(lat1) * sin(lat2) +
								cos(lat1) * cos(lat2) * cos(lng2 - lng1);
				e			= acos(cos_e);
				return	R * e;
			}
		}
		return -1.0; // failure
	};

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
				}else{
					if($.fn.goomaps.debug && window.console) console.log('Geocoder status returned: '+status);
				}
			});
		}else{
			if(typeof address != 'string' && !$.isFunction(callback)){
				if($.fn.goomaps.debug && window.console) return console.log('Geocoder requires an address string, and a callback function');
			}else if(typeof address != 'string'){
				if($.fn.goomaps.debug && window.console) return console.log('Geocoder requires an address string');
			}else if(!$.isFunction(callback)){
				if($.fn.goomaps.debug && window.console) return console.log('Geocoder requires a callback function');
			}
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
			infowindow = new google.maps.InfoWindow({content: $(info).html()});
		}else{
			infowindow = new google.maps.InfoWindow({content: info});
		}
		$.fn.goomaps.setevents(marker, { 'click': function(){
			infowindow.open(map, marker);
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
	 * Goomaps Default options for initialisation of the map
	 */
	$.fn.goomaps.defaults = {
		center: new google.maps.LatLng(0,0),
		zoom: 10,
		MapTypeId: google.maps.MapTypeId.ROADMAP
	};

	/**
	 * Goomaps debugger switch
	 */
	$.fn.goomaps.debug = false;

	/**
	 * Goomaps plugin version number
	 */
	$.fn.goomaps.pluginVersion = "1.0";

	/**
	 * Google Maps API version number
	 */
	$.fn.goomaps.apiVersion = "3.4";

})(jQuery);
