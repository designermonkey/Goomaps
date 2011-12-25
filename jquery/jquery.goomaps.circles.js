function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

(function($){

	if($.fn.goomaps && $.fn.goomaps.methods)
	{
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
			setcircles: function(circles)
			{
				return this.each(function(){

					// Create a variable to pass along
					$this = $(this);

					// Wrap the markers in array if not an array already
					if(!$.isArray(circles)) circles = [circles];

					// Add the output markers to the element data
					if($this.data('goomaps').circles && $this.data('goomaps').circles.length)
					{
						$.each(circles, function(i, circle){
							var current = $this.goomaps('getcircles', circle.options);
							if(!current.length)
							{
								var output = $.goomaps.generatecircle(circle, $this);
								$this.data('goomaps').circles.push(output[0]);
							}
						});
					}
					else
					{
						var output = $.goomaps.generatecircle(circles, $this);
						$.extend($this.data('goomaps'), {
							"circles": output
						});
					}
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
			getcircles: function(data)
			{
				var args = arguments;
				var results = [];
				var circles = $(this).data('goomaps').circles;
				// Check for array number
				if(data === 0 || typeof data === 'number'){
					results.push(circles[data]);
				}else if($.isPlainObject(data) || $.isFunction(data)){
					var center;
					if(data.center && $.isArray(data.center)){
						center = $.goomaps.latlng(data.center); // Get LatLng of position array
					}else if(!$.isArray(data.position)){
						if($.goomaps.debug && window.console) console.log('getcircles: Matching on center requires an array of coordinates');
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
		/**
		 * Generate Google Maps Circle objects using provided options
		 *
		 * @param   {Array} input   Array of circles options
		 * @param   {Map} map   Google Map object
		 *
		 * @returns {Array} Array of Google Maps Circle objects
		 */
		$.goomaps.generatecircle = function(input, element)
		{
			// Create the output array
			var output = new Array();

			// Get the map
			var map = $(element).goomaps('getmap');
			
			$.each(input, function(i, circle){
				input[i].options.map = map;

				if(circle.options.radius && !isNumber(circle.options.radius))
				{
					if(window.console) console.error("'Goomaps generatecircle function': The radius provided is not a number.");
				}
				else if(!circle.options.radius)
				{
					if(window.console) console.error("'Goomaps generatecircle function': A radius must be provided as a number.");
				}

				if(circle.options.strokeWeight && !isNumber(circle.options.strokeWeight))
				{
					if(window.console) console.error("'Goomaps generatecircle function': The strokeWeight provided is not a number.");
				}
				else if(!circle.options.strokeWeight)
				{
					if(window.console) console.error("'Goomaps generatecircle function': A strokeWeight must be provided as a number.");
				}

				if(!circle.options.fillColor)
				{
					if(window.console) console.error("'Goomaps generatecircle function': A fillColor must be provided.");
				}

				if(!circle.options.strokeColor)
				{
					if(window.console) console.error("'Goomaps generatecircle function': A strokeColor must be provided.");
				}

				if(!circle.options.fillOpacity)
				{
					if(window.console) console.error("'Goomaps generatecircle function': A fillOpacity must be provided.");
				}

				if(!circle.options.strokeOpacity)
				{
					if(window.console) console.error("'Goomaps generatecircle function': A strokeOpacity must be provided.");
				}

				if(circle.options.center && $.isArray(circle.options.center))
				{
					input[i].options.center = $.goomaps.latlng(circle.options.center);
					output[i] = new google.maps.Circle(input[i].options);
				}
				else if(circle.options.center && !$.isArray(circle.options.center))
				{
					if(window.console) console.error("'Goomaps generatecircle function': The center provided is not an array.");
				}
				else
				{
					if(window.console) console.error("'Goomaps generatecircle function': A center must be provided as an array. None provided.");
				}

				if(marker.events)
				{
					$.goomaps.setevents(output[i], input[i].events);
				}
			});
			return output;
		}
	}
})(jQuery);
