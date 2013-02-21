// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // Crop Selection Corner
    // -----------------------------
    // Represents a "corner" of the rubber band for
    // selecting the area of an image to crop to. Each
    // of the corners is click-and-draggable, to set the
    // position of the corner. 

    // Imports And Constants
    // ---------------------

    // A list of possible positions. These values are
    // arbitrary in nature, but represent the identity
    // of the corner, to facilitate the behavior of
    // a `CropSelectionCorner` instance.
    var topLeft = 0,
        topRight = 1,
        bottomLeft = 2,
        bottomRight = 3,
        topMiddle = 4,
        rightMiddle = 5,
        bottomMiddle = 6,
        leftMiddle = 7;

    // Positional Coordinate Functions
    // -------------------------------

    // These functions are associated with a specific corner position,
    // and provide the means to translate a given point in to the correct
    // coordinate parameters based on that position. 
    //
    // These functions are injected in to the `CropSelectionCorner` object
    // when it's initialized, based on the position passed in to the
    // corner's constructor function. This allows the corner to cache
    // the function that it needs, preventing additional looking each 
    // time a point needs to be converted to the correct coordinate values.
    // 
    // This technique is referred to as [init-time branching][1] and is 
    // an optimization technique for making a decision once and only
    // once, for the lifetime of a given object.
    // 
    // [1]: http://www.jspatterns.com/coding-patterns/init-time-branching/

    var positionalCoordFunctions = {};

    // The "top left" corner.
    positionalCoordFunctions[topLeft] = function (point) {
        return { startX: point.x, startY: point.y };
    };

    // The "top right" corner.
    positionalCoordFunctions[topRight] = function (point) {
        return { endX: point.x, startY: point.y };
    };

    // The "bottom left" corner.
    positionalCoordFunctions[bottomLeft] = function (point) {
        return { startX: point.x, endY: point.y };
    };

    // The "bottom right" corner.
    positionalCoordFunctions[bottomRight] = function (point) {
        return { endX: point.x, endY: point.y };
    };

    // The "top middle" corner.
    positionalCoordFunctions[topMiddle] = function (point) {
        return { startY: point.y };
    };

    // The "right middle" corner.
    positionalCoordFunctions[rightMiddle] = function (point) {
        return { endX: point.x };
    };

    // The "bottom middle" corner.
    positionalCoordFunctions[bottomMiddle] = function (point) {
        return { endY: point.y };
    };

    // The "left middle" corner.
    positionalCoordFunctions[leftMiddle] = function (point) {
        return { startX: point.x };
    };

    // CropSelection Corner Type Definition
    // ---------------------------------
    var CropSelectionCorner = WinJS.Class.define(

        function CropSelectionCornerConstructor(windowEl, el, position) {
            // * windowEl - the DOM window element for top level mouse events
            // * el - the DOM element that this corner controls
            // * position - the `CropSelectionCorner.position` that this corner represents
            this.window = windowEl;
            this.el = el;
            this.position = position;
            this._positionalCoordFunction = positionalCoordFunctions[position];

            // Pre-bind these methods to ensure they are
            // always running in the context of this object.
            // This will allow these methods to be used as
            // callbacks for event handlers, and allow them
            // to be removed from the event listeners as needed.
            this.mouseDown = this.mouseDown.bind(this);
            this.mouseMove = this.mouseMove.bind(this);
            this.mouseUp = this.mouseUp.bind(this);

            this.listenToMouseDown();
        },

        {
            // Initializes the "mousedown" event for the corner's DOM element.
            listenToMouseDown: function () {
                this.el.addEventListener("mousedown", this.mouseDown);
            },

            // Removes the "mousedown" event for the corner's DOM element.
            ignoreMouseDown: function () {
                this.el.removeEventListener("mousedown", this.mouseDown);
            },

            // Initializes the "mousedown" event for the DOM as a whole. 
            // This is done to allow the mouseup to occur anywhere in the
            // application, ensuring we will always let go of the corner
            // at the appropriate time.
            listenToMouseUp: function () {
                this.window.addEventListener("mouseup", this.mouseUp);
            },

            // Removes the "mouseup" event for the DOM.
            ignoreMouseUp: function () {
                this.window.removeEventListener("mouseup", this.mouseUp);
            },

            // Initializes the "mousemove" event for the DOM as a whole. 
            // This is done to allow the mousemove to occur anywhere in the
            // application, ensuring we will always let go of the corner
            // at the appropriate time.
            listenToMouseMove: function () {
                this.window.addEventListener("mousemove", this.mouseMove);
            },

            // Removes the "mousemove" event for the DOM.
            ignoreMouseMove: function () {
                this.window.removeEventListener("mousemove", this.mouseMove);
            },

            // The "mousedown" event handler. Dispatches a "start"
            // event that signifies this corner is about to be moved.
            mouseDown: function (e) {
                e.preventDefault();

                this.ignoreMouseDown();
                this.listenToMouseUp();
                this.listenToMouseMove();

                this.dispatchEvent("start", {
                    corner: this
                });
            },

            // The "mousemove" event handler. Dispatches a "move"
            // event that signifies this corner is being moved.
            mouseMove: function (e) {
                e.preventDefault();

                this.dispatchEvent("move", {
                    coords: {
                        x: e.clientX,
                        y: e.clientY
                    }
                });
            },

            // The "mouseup" event handler. Dispatches a "stop"
            // event that signifies this corner is no longer being moved.
            mouseUp: function (e) {
                e.preventDefault();

                this.ignoreMouseUp();
                this.ignoreMouseMove();
                this.listenToMouseDown();

                this.dispatchEvent("stop");
            },

            // Executes the proper positional coordinate function to
            // translate the given point in to the correct coordinates
            // for the rubber band as a whole. The current "position" of
            // the corner object instance is used to determine which
            // positional coordinate function should be called, when
            // the corner object is instantiated.
            getUpdatedCoords: function (point) {
                return this._positionalCoordFunction(point);
            }
        },
        // Provides a "static" list of the corner positions
        // so that they can be referenced elsewhere in the application.
        {
            position: {
                topLeft: topLeft,
                topRight: topRight,
                bottomLeft: bottomLeft,
                bottomRight: bottomRight,
                topMiddle: topMiddle,
                rightMiddle: rightMiddle,
                bottomMiddle: bottomMiddle,
                leftMiddle: leftMiddle
            }
        });

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo.Crop", {
        CropSelectionCorner: WinJS.Class.mix(CropSelectionCorner, WinJS.Utilities.eventMixin)
    });

})();
