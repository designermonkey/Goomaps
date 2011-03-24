# Goomaps

This is 'the' Google Maps API v3 jQuery plugin. Richly featured, concise and highly customisable and extendible.

The plugin is currently under development and should only be used **with caution!** Features will change, and do change. Features are removed too if they aren't required. **Do not rely on this plugin until it is officially released.**

## Development list

**Core:**

0.	Remove geocoding from internal methods.
0.	Streamline `getmarkers`, `getmarkers2` and `getmarker` into one method with results dependant on user input. Discuss first.
	-	Set a `uid` for each marker (what should we use as the uid?). Users can search on this uid to return a specific marker, or return all if not set.
	-	Continue current dev of `getmarkers2` style to add user defined data sets to markers.

**Layers:**

0.	Add `getlayers` method, base on `getmarkers` method once completed