(function($){

	function isNumber(n)
	{
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	if($.fn.goomaps && $.fn.goomaps.methods)
	{
		var polygonmethods = {
			/**
			 * Add polygons to an existing Google Map object.
			 *
			 * polygons are stored with the element containing the map, as an array of Google Maps polygon objects.
			 *
			 * @param   {Array} polygons   Array of Polygon objects
			 *
			 * @returns {Object}   Returns the object passed in, for chainability
			 */
			setpolygons: function(polygons)
			{
				return this.each(function(){

					// Create a variable to pass along
					$this = $(this);

					// Wrap the markers in array if not an array already
					if(!$.isArray(polygons)) polygons = [polygons];

					// Add the output markers to the element data
					if($this.data('goomaps').polygons && $this.data('goomaps').polygons.length)
					{
						$.each(polygons, function(i, polygon){
							var current = $this.goomaps('getpolygons', polygon.options);
							if(!current.length)
							{
								var output = $.goomaps.generatepolygon(polygon, $this);
								$this.data('goomaps').polygons.push(output[0]);
							}
						});
					}
					else
					{
						var output = $.goomaps.generatepolygon(polygons, $this);
						$.extend($this.data('goomaps'), {
							"polygons": output
						});
					}
				});
			},
			/**
			 * Filter all polygons on supplied parameters to return matched results
			 *
			 * Passing a number to this method will return the specific polygon stored at that index in the Array of polygons.
			 * Passing an object will return an Array of polygons that matched the properties of that object. The more properties, the harder the match.
			 * Passing a function will enable true|false matching on each polygon in the Array of polygons. The polygon object, along with any extra arguments added to the method, are passed into this function for each iteration.
			 * Passing nothing into this method, will return all polygons.
			 *
			 * Remember, the more polygons you have stored, the longer the filtering process.
			 *
			 * @param   {Object|Function|Number} data   Object containing parameters to match or, Function returning true|false (boolean) per polygon or, Number to match index of polygons array
			 * @param	{Unknown} arguments   Extra arguments are all passed to the data paramm if it is a Function
			 *
			 * @returns {Array}   Array of matched polygons, or empty Array
			 */
			getpolygons: function(data)
			{
				var args = arguments;
				var results = [];
				var polygons = $(this).data('goomaps').polygons;
				// Check for array number
				if(data === 0 || typeof data === 'number'){
					results.push(polygons[data]);
				}else if($.isPlainObject(data) || $.isFunction(data)){
					var center;
					if(data.center && $.isArray(data.center)){
						center = $.goomaps.latlng(data.center); // Get LatLng of position array
					}else if(!$.isArray(data.position)){
						if($.goomaps.debug && window.console) console.log('getpolygons: Matching on center requires an array of coordinates');
						center = false;
					}
					$.each(polygons, function(i, polygon){
						if(center){
							var cpos = polygon.getCenter(); // Get polygon center LatLng
							if(cpos.equals(center)) results.push(polygon); // check it equals position, add to results
						}else if(isin(data, polygon)){
							results.push(polygon); // check supplied data object
						}else if($.isFunction(data) && data(polygon, args)){
							// use data as a filter-function (the filter function must be defined as 'function(polygon, ...)' and must return a boolean-value
							results.push(polygon);
						}
					});
				}
				// Check for no data, also check that a number of 0 isn't passed
				if(data !== 0 && !data) results.push(polygons);
				return $(results);
			}
		};

		$.extend($.fn.goomaps.methods, polygonmethods);
		/**
		 * Generate Google Maps polygon objects using provided options
		 *
		 * @param   {Array} input   Array of polygons options
		 * @param   {Map} map   Google Map object
		 *
		 * @returns {Array} Array of Google Maps polygon objects
		 */
		$.goomaps.generatepolygon = function(input, element)
		{
			// Create the output array
			var output = new Array();

			// Get the map
			var map = $(element).goomaps('getmap');
			
			$.each(input, function(i, polygon){
				input[i].options.map = map;

				if(polygon.options.strokeWeight && !isNumber(polygon.options.strokeWeight))
				{
					if(window.console) console.error("'Goomaps generatepolygon function': The strokeWeight provided is not a number.");
				}
				else if(!polygon.options.strokeWeight)
				{
					if(window.console) console.error("'Goomaps generatepolygon function': A strokeWeight must be provided as a number.");
				}

				if(!polygon.options.fillColor)
				{
					if(window.console) console.error("'Goomaps generatepolygon function': A fillColor must be provided.");
				}

				if(!polygon.options.strokeColor)
				{
					if(window.console) console.error("'Goomaps generatepolygon function': A strokeColor must be provided.");
				}

				if(!polygon.options.fillOpacity)
				{
					if(window.console) console.error("'Goomaps generatepolygon function': A fillOpacity must be provided.");
				}

				if(!polygon.options.strokeOpacity)
				{
					if(window.console) console.error("'Goomaps generatepolygon function': A strokeOpacity must be provided.");
				}

				if(polygon.options.paths && $.isArray(polygon.options.paths))
				{
					$.each(polygon.options.paths, function(j, point){
						if($.isArray(point))
						{
							polygon.options.paths[j] = $.goomaps.latlng(point);
						}
						else
						{
							if(window.console) console.error("'Goomaps generatepolygon function': Individual points must be provided as an array.");
						}
					});
					output[i] = new google.maps.Polygon(input[i].options);
				}
				else if(polygon.options.paths && !$.isArray(polygon.options.paths))
				{
					if(window.console) console.error("'Goomaps generatepolygon function': The paths provided are not an array.");
				}
				else if(!polygon.options.paths)
				{
					if(window.console) console.error("'Goomaps generatepolygon function': An array of paths must be provided.");
				}

				if(polygon.events)
				{
					$.goomaps.setevents(output[i], input[i].events);
				}
			});
			return output;
		}
	}
})(jQuery);
