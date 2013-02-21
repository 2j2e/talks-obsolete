// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    var HiloAppBarPresenter = WinJS.Class.define(

        function HiloAppBarPresenterConstructor(el, nav, query) {
            // 1. `el`: the HTML element of the control
            // 2. `nav`: the WinJS.Navigation object
            // 3. `query`: the `StorageFileQueryResult` used for navigation
            this.el = el;
            this.appbar = el.winControl;
            this.nav = nav;
            this.query = query;

            this.setupButtons();
        },

        {
            // Find the "crop" and "rotate" buttons and set up click handlers on them.
            setupButtons: function () {
                this.rotate = this.el.querySelector("#rotate");
                this.rotate.addEventListener("click", this._rotateClicked.bind(this));

                this.crop = this.el.querySelector("#crop");
                this.crop.addEventListener("click", this._cropClicked.bind(this));
            },

            // Internal method. Handles the `click` event of the "#rotate" HTML element
            // and calls the navigation to go to the rotate page.
            _rotateClicked: function () {
                this.nav.navigate("/Hilo/rotate/rotate.html", this.navigationOptions);
            },

            // Internal method. Handles the `click` event of the "#crop" HTML element
            // and calls the navigation to go to the crop page.
            _cropClicked: function () {
                this.nav.navigate("/Hilo/crop/crop.html", this.navigationOptions);
            },

            setNavigationOptions: function (options, shouldShow) {
                this.navigationOptions = options;

                if (options.picture.isCorrupt) {
                    this.disableButtons();
                } else {
                    this.enableButtons();
                }

                if (shouldShow) {
                    this.appbar.show();
                }
            },

            clearNavigationOptions: function (shouldHide) {
                this.navigationOptions = null;
                this.disableButtons();
                if (shouldHide) {
                    this.appbar.hide();
                }
            },

            // Enable the buttons on the app bar. This method can be called when the
            // app bar is intended to always be shown on the screen in order to always
            // enable the buttons. It would be preferable to use the `setImageIndex` 
            // method though.
            enableButtons: function () {
                this.rotate.winControl.disabled = false;
                this.crop.winControl.disabled = false;
            },

            // Disable the buttons on the app bar. This method can be called when the
            // buttons on the app bar need to be disabled regardless of the state of
            // the app bar.
            disableButtons: function () {
                this.rotate.winControl.disabled = true;
                this.crop.winControl.disabled = true;
            }
        });

    // Public API
    // ----------

    // Export `Hilo.Controls.HiloAppBar.HiloAppBarPresenter` as a type that can be
    // instantiated and used to control the `HiloAppBar` PageControl.
    //
    // The `HiloAppBarPresenter` includes the `WinJS.Utilities.eventMixin` to provide
    // standard event methods, including `addEventListener` and `dispatchEvent`. See
    // [the eventMixin documentation][1] and the article on [Adding functionality with 
    // WinJS mixins][2] for more information.
    //
    // [1]: http://msdn.microsoft.com/en-us/library/windows/apps/br211693.aspx
    // [2]: http://msdn.microsoft.com/en-us/library/windows/apps/hh967789.aspx

    WinJS.Namespace.define("Hilo.Controls.HiloAppBar", {
        HiloAppBarPresenter: WinJS.Class.mix(HiloAppBarPresenter, WinJS.Utilities.eventMixin)
    });

})();
