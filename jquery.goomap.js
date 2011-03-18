/**
 *	List of functions:
 *		_init
 *		getMap
 *		extendMap
 *		getMarkers
 *		setMarkers
 *		extendMarker
 *
 */
(function($){
	/**
	 *	Google Maps API v3 for jQuery
	 */
	$.fn.googlemaps = function(options){

		options = $.extend({}, $.fn.googlemaps.defaults, options);
	}

	/**
	 *	@name defaults
	 */
	$.fn.googlemaps.defaults = {
		center: new google.maps.LatLng(0,0),
		zoom: 1,
		MapTypeId: google.maps.MapTypeId.ROADMAP
	}

	/**
	 *	@name getMap
	 */
	$.fn.googlemaps.getMap = function(){

	}

})(jQuery);
