// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";
    var pointerDeviceType = Windows.Devices.Input.PointerDeviceType;

    // TouchProvider Definition
    // ------------------------

    var TouchProvider = WinJS.Class.define(

        function TouchProviderConstructor(inputElement) {

            var recognizer = new Windows.UI.Input.GestureRecognizer();
            recognizer.gestureSettings = Windows.UI.Input.GestureSettings.manipulationRotate;

            this._manipulationUpdated = this._manipulationUpdated.bind(this);
            this._manipulationCompleted = this._manipulationCompleted.bind(this);

            inputElement.addEventListener("MSPointerDown", function (evt) {
                var pp = evt.currentPoint;
                if (pp.pointerDevice.pointerDeviceType === pointerDeviceType.touch) {
                    recognizer.processDownEvent(pp);
                }
            }, false);

            inputElement.addEventListener("MSPointerMove", function (evt) {
                var pps = evt.intermediatePoints;
                if (pps[0] && pps[0].pointerDevice.pointerDeviceType === pointerDeviceType.touch) {
                    recognizer.processMoveEvents(pps);
                }
            }, false);

            inputElement.addEventListener("MSPointerUp", function (evt) {
                var pp = evt.currentPoint;
                if (pp.pointerDevice.pointerDeviceType === pointerDeviceType.touch) {
                    recognizer.processUpEvent(pp);
                }
            }, false);

            recognizer.addEventListener("manipulationupdated", this._manipulationUpdated);
            recognizer.addEventListener("manipulationcompleted", this._manipulationCompleted);

            this.displayRotation = 0;
        },

        {
            setRotation: function () {
                // We expect this function to be replaced by the consumer of this object.
            },

            animateRotation: function () {
                // We expect this function to be replaced by the consumer of this object.
            },

            _manipulationUpdated: function (args) {
                this.setRotation(args.cumulative.rotation);
            },

            _manipulationCompleted: function (args) {
                var degrees = args.cumulative.rotation;
                var adjustment = Math.round(degrees / 90) * 90;
                this.animateRotation(adjustment);
            }
        });

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo.Rotate", {
        TouchProvider: TouchProvider
    });

})();
