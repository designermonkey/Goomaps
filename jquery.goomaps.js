
(function($) {

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
		 * of Google Maps Marker objects. Markers may not save in the same order
		 * that they are passed in to the method. They can be identified by their
		 * latitude and longitue coordinates.
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
					if(marker.options.icon && typeof marker.options.icon != 'string'){
						marker.options.icon = $.fn.goomaps.markerimage(marker.options.icon);
					}
					if(marker.options.shadow && typeof marker.options.shadow != 'string'){
						marker.options.shadow = $.fn.goomaps.markerimage(marker.options.shadow);
					}
					if(marker.options.position && $.isArray(marker.options.position)){
						marker.options.position = $.fn.goomaps.latlng(marker.options.position);
						add.markers[i] = new google.maps.Marker(marker.options);
						if(marker.options.events){
							$.fn.goomaps.setevents(add.markers[i], marker.options.events);
						}
						if(marker.options.info) $.fn.goomaps.infowindow(add.markers[i], marker.options.info, map);
						$.extend($this.data('goomaps'), add);
					}else if(marker.options.position && typeof marker.options.position === 'string'){
						$.fn.goomaps.geocode(marker.options.position, function(result){
							marker.options.position = result;
							add.markers[i] = new google.maps.Marker(marker.options);
							if(marker.options.events){
								$.fn.goomaps.setevents(add.markers[i], marker.options.events);
							}
							if(marker.options.info) $.fn.goomaps.infowindow(add.markers[i], marker.options.info, map);
							//console.log(add);
							$.extend($this.data('goomaps'), add);
						});
					}else{
						if($.fn.goomaps.debug && window.console) console.log('Markers must be provided with a position.');
					}
				});
			});
		},
		/**
		 * Get all the markers attached to the Google Map object
		 *
		 * This method retrieves all the markers attached to an element (map).
		 * This can be used to iterate over all the markers for that element.
		 *
		 * This is a terminating method and will not allow chainability past it's
		 * call, i.e. it doesn't return 'this' jQuery object in favour of
		 * returning a jQuery array of markers.
		 *
		 * @returns {Array}   Array of Google Maps Marker objects
		 */
		getmarkers: function(){
			return $(this.data('goomaps').markers);
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
		 * @param {String} data   Address to geocode and find
		 *
		 * @returns {Marker}  Google Maps Marker object
		 */
		getmarker: function(data){
			if($.isArray(data)){
				var position = $.fn.goomaps.latlng(data);
				$.each(this.data('goomaps').markers, function(i, marker){
					if(position == marker.getPosition()){
						return $(marker);
					}
				});
			}else if(typeof data === 'string'){
				$this = $(this);
				$.fn.goomaps.geocode(data, function(result){
					$.each($this.data('goomaps').markers, function(i, marker){
						var position = marker.getPosition();
						// This doesn't work but it should technically! The coords are exactly the same!
						if(result == position){
							return marker;
						}
					});
				});
			}else if(typeof data === 'number'){
				return $(this.data('goomaps').markers[data]);
			}
		},

		events: function(options){

		}
	};

// -----------------------------------------------------------------------------

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
			$(i).hide();
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
