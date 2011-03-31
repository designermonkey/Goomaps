
(function($){

	if($.fn.goomaps && $.fn.goomaps.methods){
		var circlemethods = {
			/**
			 * Add circles to an existing Google Map object.
			 *
			 * Circles are stored with the element containing the map, as an array of Google Maps Circle objects.
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
						add.circles[i].setMap(map);
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
						if(circle.events){
							$.fn.goomaps.setevents(add.circles[i], circle.events);
						}
					});
					$.extend($this.data('goomaps'), add);
				});
			},
			/**
			 * Filter all circles on supplied parameters to return matched results
			 *
			 * Passing a number to this method will return the specific circle stored at that index in the Array of circles.
			 * Passing an object will return an Array of circles that matched the properties of that object. The more properties, the harder the match.
			 * Passing a function will enable true|false matching on each circle in the Array of circles. The circle object, along with any extra arguments added to the method, are passed into this function for each iteration.
			 * Passing nothing into this method, will return all circles.
			 *
			 * Remember, the more circles you have stored, the longer the filtering process.
			 *
			 * @param   {Object|Function|Number} data   Object containing parameters to match or, Function returning true|false (boolean) per circle or, Number to match index of circles array
			 * @param	{Unknown} arguments   Extra arguments are all passed to the data paramm if it is a Function
			 *
			 * @returns {Array}   Array of matched circles, or empty Array
			 */
			getcircles: function(data){
				var args = arguments;
				var results = [];
				var circles = $(this).data('goomaps').circles;
				// Check for array number
				if(data === 0 || typeof data === 'number'){
					results.push(circles[data]);
				}else if($.isPlainObject(data) || $.isFunction(data)){
					var center;
					if(data.center && $.isArray(data.center)){
						center = $.fn.goomaps.latlng(data.center); // Get LatLng of position array
					}else if(!$.isArray(data.position)){
						if($.fn.goomaps.debug && window.console) console.log('getcircles: Matching on center requires an array of coordinates');
						center = false;
					}
					$.each(circles, function(i, circle){
						if(center){
							var cpos = circle.getCenter(); // Get circle center LatLng
							if(cpos.equals(center)) results.push(circle); // check it equals position, add to results
						}else if(isin(data, circle)){
							results.push(circle); // check supplied data object
						}else if($.isFunction(data) && data(circle, args)){
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

})(jQuery);
