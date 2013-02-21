// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // Imports And Constants
    // ---------------------

    var rotateClockwiseInDegrees = 90,
        rotateCounterClockwiseInDegrees = -90,
        rotateDefaultInDegrees = 0;

    // Appbar Presenter Definition
    // ---------------------------

    var AppBarPresenter = WinJS.Class.define(

        function AppBarPresenterConstructor(el) {
            this.el = el;
            this.menu = el.winControl;

            this.rotateClockwise = this.rotateClockwise.bind(this);
            this.saveChanges = this.saveChanges.bind(this);
            this.cancelChanges = this.cancelChanges.bind(this);
            this.unSnap = this.unSnap.bind(this);

            this.setupButtons();
            this.menu.show();
        },

        {
            dispose: function () {
                this._removeButton("#clockwise", this.rotateClockwise);
                this._removeButton("#save", this.saveChanges);
                this._removeButton("#cancel", this.cancelChanges);
                this._removeButton("#unSnap", this.unSnap);

                this.el = null;
                this.menu = null;
            },

            // Set up all of the button click handlers and initially disable save / cancel.
            setupButtons: function () {
                this.clockwiseButton = this._addButton("#clockwise", this.rotateClockwise);
                this.saveButton = this._addButton("#save", this.saveChanges);
                this.cancelButton = this._addButton("#cancel", this.cancelChanges);
                this.unSnapButton = this._addButton("#unSnap", this.unSnap);
                this._disableButtons();
            },

            // Unsnap the view, back in to full screen mode.
            unSnap: function () {
                this.dispatchEvent("unsnap", {});
            },

            // Rotate clockwise was clicked.
            rotateClockwise: function (args) {
                this._enableButtons();

                this.dispatchEvent("rotate", {
                    rotateDegrees: rotateClockwiseInDegrees
                });
            },

            // Save was clicked.
            saveChanges: function () {
                this._disableButtons();
                this.dispatchEvent("save", {});
            },

            // Cancel was clicked.
            cancelChanges: function () {
                this._disableButtons();
                this.dispatchEvent("cancel", {});
            },

            // Internal method.
            // Builds a reference to a button using the specified query selector, and attaches
            // the clickHandler callback to the click event of the button.
            _addButton: function (selector, clickHandler) {
                var buttonEl = this.el.querySelector(selector).winControl;
                buttonEl.addEventListener("click", clickHandler);
                return buttonEl;
            },

            _removeButton: function (selector, clickHandler) {
                var buttonEl = this.el.querySelector(selector).winControl;
                buttonEl.removeEventListener("click", clickHandler);
            },

            // Internal method.
            // Enables the save and cancel buttons.
            _enableButtons: function () {
                this.saveButton.disabled = false;
            },

            // Internal method.
            // Disables the save and cancel buttons.
            _disableButtons: function () {
                this.saveButton.disabled = true;
            }
        });


    // Public API
    // ----------

    WinJS.Namespace.define("Hilo.Rotate", {
        AppBarPresenter: WinJS.Class.mix(AppBarPresenter, WinJS.Utilities.eventMixin)
    });

})();
