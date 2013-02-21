// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // Rubber Band Controller Definition
    // ----------------------------------

    var CropSelectionController = WinJS.Class.define(

        function CropSelectionControllerConstructor(cropSelection, imageView, cropSelectionEl) {
            this.imageView = imageView;
            this.cropSelectionEl = cropSelectionEl;
            this.cropSelection = cropSelection;

            this.reset();
            this.setupCorners();
            cropSelection.addEventListener("reset", this.reset.bind(this));
        },

        {
            reset: function () {
                if (this.imageView.tooSmallTooCrop) {
                    this.cropSelectionEl.style.display = "none";
                }
                this.boundingRect = this.imageView.getBoundingClientRect();
            },

            setupCorners: function () {
                var position = Hilo.Crop.CropSelectionCorner.position;

                this.addCorner("#topLeft", position.topLeft);
                this.addCorner("#topRight", position.topRight);
                this.addCorner("#bottomLeft", position.bottomLeft);
                this.addCorner("#bottomRight", position.bottomRight);
                this.addCorner("#topMiddle", position.topMiddle);
                this.addCorner("#rightMiddle", position.rightMiddle);
                this.addCorner("#bottomMiddle", position.bottomMiddle);
                this.addCorner("#leftMiddle", position.leftMiddle);
            },

            addCorner: function (selector, position) {
                if (!this.corners) { this.corners = {}; }

                var el = this.cropSelectionEl.querySelector(selector);
                var corner = new Hilo.Crop.CropSelectionCorner(window, el, position);
                this.corners[position] = corner;

                corner.addEventListener("start", this.startCornerMove.bind(this));
                corner.addEventListener("move", this.cornerMove.bind(this));
                corner.addEventListener("stop", this.stopCornerMove.bind(this));
            },

            startCornerMove: function (args) {
                this._currentCorner = args.detail.corner;
            },

            stopCornerMove: function () {
                this._currentCorner = null;
            },

            cornerMove: function (args) {
                var coords = args.detail.coords;
                var point = this.getCanvasPoint(coords);
                this.moveCropSelection(this._currentCorner, point);
            },

            moveCropSelection: function (cornerToMove, moveToPoint) {
                var coords = cornerToMove.getUpdatedCoords(moveToPoint);
                var cropSelection = this.cropSelection;

                Object.keys(coords).forEach(function (key) {
                    cropSelection[key] = coords[key];
                });
            },

            getCanvasPoint: function (coords) {
                var rect = this.boundingRect;

                var x = (coords.x - rect.left);
                var y = (coords.y - rect.top);

                return {
                    x: x,
                    y: y
                };
            }

        });

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo.Crop", {
        CropSelectionController: WinJS.Class.mix(CropSelectionController, WinJS.Utilities.eventMixin)
    });

})();
