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
	$.fn.goomaps = function(options){

		options = $.extend({}, $.fn.googlemaps.defaults, options);

		return this.each(function(){
			var goomap = new google.maps.Map(this);
			$(this).data('goomaps', {
				map: goomap
			});
		});
	}

	/**
	 *	@name defaults
	 */
	$.fn.goomaps.defaults = {
		center: new google.maps.LatLng(0,0),
		zoom: 1,
		MapTypeId: google.maps.MapTypeId.ROADMAP
	}

	/**
	 *	@name getMap
	 */
	$.fn.goomaps.getMap = function(){
		return $(this).data('goomap').map;
	}

})(jQuery);
