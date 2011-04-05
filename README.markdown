# Goomaps

This is 'the' Google Maps API v3 jQuery plugin. Richly featured (getting there!), concise and highly customisable and extendible.

The plugin is currently under development and should only be used **with caution!** Features will change, and do change. Features are removed too if they aren't required. **Do not rely on this plugin until it is officially released.**

Features and extensions will be mostly developed as they are required by the developers, but the aim is to create a full feature set of abilities linked to the Google Maps API. **No plain duplicating will happen**, so users are advised to know how the API works, specifically, what methods are available to the Google Maps object types. The aim of this plugin is to make it easy to create and modify Google's maps, overlays, and services the jQuery way.

Google Maps is awesomely powerful. We just want to help you not burn your fingers... Stick them in some Goo instead.

##Build your copy (on Linux/Mac):

Using `make` to build your copy will add all of the currently available methods, as methods are developed, this could get quite heavy.

0. Install yui-compress
0. `cd` to the Goomaps directory
0. type `make`. Now you'll find a minified and non-minified version in `/build`



## Development TODOs

###General

<del>We need to discuss which functions should be defined in `$.fn.goomaps.*` and `$.goomaps.*` before the first release. Currently all functions are in `$.fn.goomaps.*`</del> done

###jquery.goomaps.js

#####general

0.	<del>Remove geocoding from internal methods.</del> done. Still available on init and update for map center.
0.	Add error handling to replace the simple console logging.
0.	<del>Calculate the distance between two points</del> done.

#####markers

0.	<del>Streamline `getmarkers`, `getmarkers2` and `getmarker` into one method with results dependant on user input. Discuss first.</del> done.
0.	Searching for all markers within a drawn <del>polygon</del>(maybe next release), <del>circle</del>(done) or <del>rectangle</del>(maybe next release).

###jquery.goomaps.layers.js

0.	Add `getlayers` method, base on `getmarkers` method once completed.

###jquery.goomaps.circles.js

0.	Waiting on completion of Markers (core) and Layers.

####jquery.goomaps.customcontrols.js

0. <del>Adding Custom-Controls to a map</del> done.
