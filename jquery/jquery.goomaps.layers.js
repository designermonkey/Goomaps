
(function($){

	if($.fn.goomaps && $.fn.goomaps.methods){
		var layermethods = {
			/**
			 * Add layers to an existing Google Map object.
			 *
			 * Layers are stored with the element containing the map, as an array of Google Maps Layer objects.
			 *
			 * @param   {Array} layers   Array of Layer objects
			 *
			 * @returns {Object}   Returns the object passed in, for chainability
			 */
			setlayers: function(layers){
				return this.each(function(){
					$this = $(this);
					if(!$.isArray(layers)) layers = [layers];
					var map = $(this).data('goomaps').map;
					var add = {layers:[]};
					$.each(layers, function(i, layer){
						if(layer.options.type == 'bicycling'){
							add.layers[i] = new google.maps.BicyclingLayer();
						}else if(layer.options.type == 'traffic'){
							add.layers[i] = new google.maps.TrafficLayer();
						}else if(layer.options.type == 'fusion'){
							add.layers[i] = new google.maps.FusionTableLayer(layer.id, layer.options);
						}else if(layer.options.type == 'kml'){
							add.layers[i] = new google.maps.KmlLayer(layer.options.url, layer.options);
						}
						add.layers[i].setMap(map);
						if(layer.events){
							$.goomaps.setevents(add.layers[i], layer.events);
						}
					});
					$.extend($this.data('goomaps'), add);
				});
			},
			/**
			 * Filter all layers on supplied parameters to return matched results
			 *
			 * Passing a number to this method will return the specific layer stored at that index in the Array of layers.
			 * Passing an object will return an Array of layers that matched the properties of that object. The more properties, the harder the match.
			 * Passing a function will enable true|false matching on each layer in the Array of layers. The layer object, along with any extra arguments added to the method, are passed into this function for each iteration.
			 * Passing nothing into this method, will return all layers.
			 *
			 * Remember, the more layers you have stored, the longer the filtering process.
			 *
			 * @param   {Object|Function|Number} data   Object containing parameters to match or, Function returning true|false (boolean) per layer or, Number to match index of layers array
			 * @param	{Unknown} arguments   Extra arguments are all passed to the data paramm if it is a Function
			 *
			 * @returns {Array}   Array of matched layers, or empty Array
			 */
			getlayers: function(data){
				var args = arguments;
				var results = [];
				var layers = $(this).data('goomaps').layers;
				// Check for array number
				if(data === 0 || typeof data === 'number'){
					results.push(layers[data]);
				}else if($.isPlainObject(data) || $.isFunction(data)){
					var bounds, center;
					if(data.bounds && $.isArray(data.bounds)){
						bounds = $.goomaps.latlngbounds(data.bounds); // Get LatLngBounds of bounds array
					}else if(!$.isArray(data.bounds)){
						if($.goomaps.debug && window.console) console.log('getlayers: Matching on bounds requires an array of arrays of coordinates');
						bounds = false;
					}
					if(data.center && $.isArray(data.center)){
						center = $.goomaps.latlng(data.center); // Get LatLng of center array
					}else if(!$.isArray(data.center)){
						if($.goomaps.debug && window.console) console.log('getlayers: Matching on center requires an array of coordinates');
						center = false;
					}
					$.each(layers, function(i, layer){
						if(bounds){
							var lbounds = layer.getDefaultViewport(); // Get layer viewport LatLngBounds
							if(lbounds.equals(bounds)) results.push(layer); // check it equals bounds, add to results
						}else if(center){
							var lbounds = layer.getDefaultViewport(); // Get layer viewport LatLngBounds
							var lcenter = lbounds.getCenter(); // Get layer center LatLng
							if(lcenter.equals(center)) results.push(layer); // check it equals center, add to results
						}else if(isin(data, layer)){
							results.push(layer); // check supplied data object
						}else if($.isFunction(data) && data(layer, args)){
							// use data as a filter-function (the filter function must be defined as 'function(layer, ...)' and must return a boolean-value
							results.push(layer);
						}
					});
				}
				// Check for no data, also check that a number of 0 isn't passed
				if(data !== 0 && !data) results.push(layers);
				return $(results);
			}
		};

		$.extend($.fn.goomaps.methods, layermethods);

	}

})(jQuery);
