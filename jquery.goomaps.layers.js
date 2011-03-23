
(function($){

	if($.fn.goomaps & $.fn.goomaps.methods){

		var layermethods = {
			/**
			 * Add Google Map Layers to a Google Map object
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
							add.layers[i] = new gogle.maps.BicyclingLayer();
						}else if(layer.options.type == 'traffic'){
							add.layers[i] = new google.maps.TrafficLayer();
						}else if(layer.options.type == 'fusion'){
							add.layers[i] = new google.maps.FusionTableLayer(layer.id, layer.options);
						}else if(layer.options.type == 'kml'){
							add.layers[i] = new google.maps.KmlLayer(layer.options.url, layer.options);
						}
						add.layers[i].setMap(map);
					});
				});
			},

			getlayers: function(){

			},

			getlayer: function(){

			}
		};

		$.extend($.fn.goomaps.methods, layermethods);

	}

})(jQuery)