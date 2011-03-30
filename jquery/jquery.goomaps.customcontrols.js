
(function($){

	/**
	 *	Converts a given position-string into a Google Maps Constant
	 *	@param	{String}	The string to convert into a Google Maps Constant
	 *	@returns	The corresponding Google Maps Constant; undefined if there is no match
	 */
	var convpos = function(pos){
		switch(pos.toUpperCase()){
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

	if($.fn.goomaps && $.fn.goomaps.methods){
		var customcontrolmethods = {
			/**
			 *	Add Google Map Controls to a Google Map object
			 *
			 *	[
			 *		{
			 *			position: 'top', // bottom, bottom_left, bottom_right, left, right, top, top_left, top_right
			 *			control: '#control'
			 *		}
			 *	]
			 *
			 *	@param   {Array|Object}	controls   Array of control objects
			 *	@returns {Object}				Returns the object passed in, for chainability
			 */
			setcustomcontrols: function(controls){
				return this.each(function(){
					$this = $(this);
					if(!$.isArray(controls)) controls = [controls];
					var map = $(this).data('goomaps').map;

					$.each(controls, function(i, control){
						if(control.position){
							position = convpos(control.position); // convert position-string to Google Maps constant
							if(position){
								c = $(control.control).get(0);
								if(c){
									map.controls[position].push(c);
								} else {
									if($.fn.goomaps.debug && window.console) console.log('setcustomcontrols: unknown control.');
								}
							} else {
								if($.fn.goomaps.debug && window.console) console.log('setcustomcontrols: unknown position.');
							}
						} else {
							if($.fn.goomaps.debug && window.console) console.log('setcustomcontrols: must be provided with a position.');
						}
					});
				});
			}
		};

		$.extend($.fn.goomaps.methods, customcontrolmethods);

	}

})(jQuery)
