(function(){

    // TODO rename this
    var module = angular.module('ui-map-infobox', []);

    // For styling Google Maps stuff, see http://stackoverflow.com/questions/5634991/styling-google-maps-infowindow

    /* An InfoBox is like an info window, but it displays
     * under the marker, opens quicker, and has flexible styling.
     * @param {GLatLng} latlng Point to place bar at
     * @param {Map} map The map on which to display this InfoBox.
     * @param {Object} opts Passes configuration options - content,
     *   offsetVertical, offsetHorizontal, className, height, width
     */
    function InfoBox(opts) {
        google.maps.OverlayView.call(this);
        this.latlng_ = opts.latlng;
        this.map_ = opts.map;
        this.elFn = opts.elFn;
        this.offsetVertical_ = -180;
        this.offsetHorizontal_ = 15;
        this.height_ = 165;
        this.width_ = 266;

        var me = this;
        this.boundsChangedListener_ =
            google.maps.event.addListener(this.map_, "bounds_changed", function() {
                return me.panMap.apply(me);
            });

        // Once the properties of this OverlayView are initialized, set its map so
        // that we can display it.  This will trigger calls to panes_changed and
        // draw.
        this.setMap(this.map_);
    }

    /* InfoBox extends GOverlay class from the Google Maps API
     */
    InfoBox.prototype = new google.maps.OverlayView();

    /* Creates the DIV representing this InfoBox
     */
    InfoBox.prototype.remove = function() {
        if (this.div_) {
            this.div_.parentNode.removeChild(this.div_);
            this.div_ = null;
        }
    };

    /* Redraw the Bar based on the current projection and zoom level
     */
    InfoBox.prototype.draw = function() {
        // Creates the element if it doesn't exist already.
        this.createElement();
        if (!this.div_) return;

        // Calculate the DIV coordinates of two opposite corners of our bounds to
        // get the size and position of our Bar
        var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
        if (!pixPosition) return;

        // Now position our DIV based on the DIV coordinates of our bounds
        var offset = $(this.div_).width() / 2 + this.offsetHorizontal_;
//        this.div_.style.width = this.width_ + "px";
        this.div_.style.left = (pixPosition.x - offset) + "px";
        this.div_.style.height = this.height_ + "px";
        this.div_.style.top = (pixPosition.y + this.offsetVertical_) + "px";
        this.div_.style.display = 'block';
    };

    /* Creates the DIV representing this InfoBox in the floatPane.  If the panes
     * object, retrieved by calling getPanes, is null, remove the element from the
     * DOM.  If the div exists, but its parent is not the floatPane, move the div
     * to the new pane.
     * Called from within draw.  Alternatively, this can be called specifically on
     * a panes_changed event.
     */
    InfoBox.prototype.createElement = function() {
        var panes = this.getPanes();
        var div = this.div_;
        if (!div) {
            /*
            // This does not handle changing panes.  You can set the map to be null and
            // then reset the map to move the div.
            div = this.div_ = document.createElement("div");
            div.style.border = "0px none";
            div.style.position = "absolute";
            div.style.background = "url('http://gmaps-samples.googlecode.com/svn/trunk/images/blueinfowindow.gif')";
            div.style.width = this.width_ + "px";
            div.style.height = this.height_ + "px";
            var contentDiv = document.createElement("div");
            contentDiv.style.padding = "30px"
            contentDiv.innerHTML = "<b>Hello World!</b>";

            var topDiv = document.createElement("div");
            topDiv.style.textAlign = "right";
            var closeImg = document.createElement("img");
            closeImg.style.width = "32px";
            closeImg.style.height = "32px";
            closeImg.style.cursor = "pointer";
            closeImg.src = "http://gmaps-samples.googlecode.com/svn/trunk/images/closebigger.gif";
            topDiv.appendChild(closeImg);

            function removeInfoBox(ib) {
                return function(e) {
                    // cancel event propogation, so we don't trigger click events on the map
                    e.stopPropagation();
                    e.preventDefault();
                    ib.setMap(null);
                };
            }

            google.maps.event.addDomListener(closeImg, 'click', removeInfoBox(this));

            // prevent clicking on the div from triggering map events
            google.maps.event.addDomListener(div, 'click', function(e){
                e.stopPropagation();
                e.preventDefault();
            });

            div.appendChild(topDiv);
            div.appendChild(contentDiv);
            div.style.display = 'none';
            // */
            div = this.div_ = this.elFn();


            panes.floatPane.appendChild(div);
            this.panMap();
        } else if (div.parentNode != panes.floatPane) {
            // The panes have changed.  Move the div.
            div.parentNode.removeChild(div);
            panes.floatPane.appendChild(div);
        } else {
            // The panes have not changed, so no need to create or move the div.
        }
    }

    InfoBox.prototype.close = function(){
        this.setMap(null);
    }

    /* Pan the map to fit the InfoBox.
     */
    InfoBox.prototype.panMap = function() {
        // if we go beyond map, pan map
        var map = this.map_;
        var bounds = map.getBounds();
        if (!bounds) return;

        // The position of the infowindow
        var position = this.latlng_;

        // The dimension of the infowindow
        var iwWidth = this.width_;
        var iwHeight = this.height_;

        // The offset position of the infowindow
        var iwOffsetX = this.offsetHorizontal_;
        var iwOffsetY = this.offsetVertical_;

        // Padding on the infowindow
        var padX = 40;
        var padY = 40;

        // The degrees per pixel
        var mapDiv = map.getDiv();
        var mapWidth = mapDiv.offsetWidth;
        var mapHeight = mapDiv.offsetHeight;
        var boundsSpan = bounds.toSpan();
        var longSpan = boundsSpan.lng();
        var latSpan = boundsSpan.lat();
        var degPixelX = longSpan / mapWidth;
        var degPixelY = latSpan / mapHeight;

        // The bounds of the map
        var mapWestLng = bounds.getSouthWest().lng();
        var mapEastLng = bounds.getNorthEast().lng();
        var mapNorthLat = bounds.getNorthEast().lat();
        var mapSouthLat = bounds.getSouthWest().lat();

        // The bounds of the infowindow
        var iwWestLng = position.lng() + (iwOffsetX - padX) * degPixelX;
        var iwEastLng = position.lng() + (iwOffsetX + iwWidth + padX) * degPixelX;
        var iwNorthLat = position.lat() - (iwOffsetY - padY) * degPixelY;
        var iwSouthLat = position.lat() - (iwOffsetY + iwHeight + padY) * degPixelY;

        // calculate center shift
        var shiftLng =
            (iwWestLng < mapWestLng ? mapWestLng - iwWestLng : 0) +
                (iwEastLng > mapEastLng ? mapEastLng - iwEastLng : 0);
        var shiftLat =
            (iwNorthLat > mapNorthLat ? mapNorthLat - iwNorthLat : 0) +
                (iwSouthLat < mapSouthLat ? mapSouthLat - iwSouthLat : 0);

        // The center of the map
        var center = map.getCenter();

        // The new map center
        var centerX = center.lng() - shiftLng;
        var centerY = center.lat() - shiftLat;

        // center the map to the new shifted center
        map.setCenter(new google.maps.LatLng(centerY, centerX));

        // Remove the listener after panning is complete.
        google.maps.event.removeListener(this.boundsChangedListener_);
        this.boundsChangedListener_ = null;
    };


    module.factory('InfoBox', function(){
        return InfoBox;
    });








    module.service('PrettyPin', function($rootScope, $compile){

        var tpl = "<div class='ng-cloak' style='position: absolute'><div class='pin bounce' data-label='{{label}}' style='background: {{color}}'></div><div class='pulse'></div></div>";

        var PrettyPin = function(config){
            // this.el = config.el;
            google.maps.OverlayView.call(this);

            this.coords = config.coords;

            this.scope = $rootScope.$new(true);
            this.scope.label = config.label || '';
            this.scope.color = config.color || '#00cccc'

            this.el = $compile(tpl)(this.scope)[0];

            this.setMap(config.map);
        }

        PrettyPin.prototype = new google.maps.OverlayView();

        PrettyPin.prototype.setLabel = function(label){
            this.scope.label = label;
        }

        PrettyPin.prototype.setColor = function(color){
            this.scope.color = color;
        }

        PrettyPin.prototype.draw = function(){
            var location = this.getProjection().fromLatLngToDivPixel(this.coords);
            this.el.style.left = location.x + 'px';
            this.el.style.top = location.y + 'px';
        }

        PrettyPin.prototype.close = function() {
            if (this.el) {
                this.el.parentNode.removeChild(this.el);
                this.el = null;
            }
        };

        PrettyPin.prototype.onRemove = function() {
            this.remove();
        };

        PrettyPin.prototype.remove = function() {
            if (this.el) {
                this.el.parentNode.removeChild(this.el);
                this.el = null;
            }
        };

        PrettyPin.prototype.onAdd = function(){
            var panes = this.getPanes();
            panes.floatPane.appendChild( this.el );
        }

        PrettyPin.prototype.setActive = function(active){
            if( this.el ){
                $(this.el)[active ? 'addClass' : 'removeClass']('active-pin');
            }
        }

        PrettyPin.prototype.addClickHandler = function(handler){
            var that = this;
            var pin = $('.pin', this.el)[0];
            google.maps.event.addDomListener( pin, "click", function(e){
                e.stopPropagation();
                e.preventDefault();
                handler.apply(that, arguments);
            });
        }

        return PrettyPin;
    });



})();
