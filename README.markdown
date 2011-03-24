# Goomaps

This is 'the' Google Maps API v3 jQuery plugin. Richly featured, concise and highly customisable and extendible.

The plugin is currently under development and should only be used **with caution!** Features will change, and do change. Features are removed too if they aren't required. **Do not rely on this plugin until it is officially released.**

Features and extensions will be developed as they are required by the developers, but the aim is to create a full feature set of abilities linked to the Google Maps API. **No plain duplicating will happen**, so users are advised to know how the API works. The aim of this plugin is to make it easy to create and modify Google's  maps, overlays, and services the jQuery way.

Google Maps is awesomely powerful. We just want to help you not burn your fingers...

## Development list

####Core:

0.	Remove geocoding from internal methods.
0.	Streamline `getmarkers`, `getmarkers2` and `getmarker` into one method with results dependant on user input. Discuss first.
	-	Set a `uid` for each marker, user provided. Users can search on this uid to return a specific marker, or return all if not set.
	-	Continue current dev of `getmarkers2` style to add user defined data sets to markers.

####Layers:

0.	Add `getlayers` method, base on `getmarkers` method once completed.

####Circles:

0.	Waiting on completion of Markers (core) and Layers.