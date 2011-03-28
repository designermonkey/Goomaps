
(function($){

	if($.fn.goomaps && $.fn.goomaps.methods){
		var circlemethods = {
			/**
			 * Add Google Map Circles to a Google Map object
			 *
			 * @param   {Array} circles   Array of Circle objects
			 *
			 * @returns {Object}   Returns the object passed in, for chainability
			 */
			setcircles: function(circles){
				return this.each(function(){
					$this = $(this);
					if(!$.isArray(circles)) circles = [circles];
					var map = $(this).data('goomaps').map;
					var add = {circles:[]};
					$.each(circles, function(i, circle){
						add.circles[i] = new google.maps.Circle();
						if(circle.center && $.isArray(circle.center)){
							add.circles[i].setCenter($.fn.goomaps.latlng(circle.center));
						}else{
							if($.fn.goomaps.debug && window.console) console.log('setcircle: must be provided with a center.');
						}
						if(circle.options){
							add.circles[i].setOptions(circle.options);
						}else{
							if($.fn.goomaps.debug && window.console) console.log('setcircle: must be provided with required options.');
						}
						add.circles[i].setMap(map);
						if(circle.events){
							$.fn.goomaps.setevents(add.circles[i], circle.events);
						}
					});
					$.extend($this.data('goomaps'), add);
				});
			},

			getcircles: function(data, any){
				var results = [];
				var circles = $(this).data('goomaps').circles;
				// Check for array number
				if(data === 0 || typeof data === 'number'){
					results.push(circles[data]);
				}else if($.isPlainObject(data) || $.isArray(data) || typeof data === 'string' || $.isFunction(data)){
					if($.isArray(data)) var center = $.fn.goomaps.latlng(data); // Get LatLng of array
					$.each(circles, function(i, circle){
						if($.isArray(data)){
							var cpos = circle.getCenter(); // Get circle center LatLng
							if(cpos.equals(center)) results.push(circle); // check it equals position, add to results
						}else if(typeof data === 'string'){
							if(circle.uid && circle.uid == data) results.push(circle); // check supplied uid
						}else if(isin(data, circle)){
							results.push(circle); // check supplied data object
						}else if($.isFunction(data) && data(circle, any)){
							// use data as a filter-function (the filter function must be defined as 'function(circle, ...)' and must return a boolean-value
							results.push(circle);
						}
					});
				}
				// Check for no data, also check that a number of 0 isn't passed
				if(data !== 0 && !data) results.push(circles);
				return $(results);
			}
		};

		$.extend($.fn.goomaps.methods, circlemethods);

	}

})(jQuery)