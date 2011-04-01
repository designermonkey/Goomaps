
(function($){

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
							c = $(control.control).get(0);
							p = $.fn.goomaps.constants.ControlPosition(control.position);
							if(c){
								if(p){
									map.controls[p].push(c);
								} else {
									if($.fn.goomaps.debug && window.console) console.log('setcustomcontrols: unknown position.');
								}
							} else {
								if($.fn.goomaps.debug && window.console) console.log('setcustomcontrols: unknown control.');
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

})(jQuery);
