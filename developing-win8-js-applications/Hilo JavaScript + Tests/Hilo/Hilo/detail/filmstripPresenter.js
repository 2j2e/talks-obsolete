// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // Filmstrip Presenter Definition
    // ------------------------------
    var FilmstripPresenter = WinJS.Class.define(

        function FilmstripPresenterConstructor(el) {
            this.el = el;
            this.winControl = el.winControl;
            this.setupControlHandlers();
        },

        {
            bindImages: function (images) {
                this.winControl.itemDataSource = new WinJS.Binding.List(images).dataSource;
            },

            setupControlHandlers: function () {
                this.winControl.addEventListener("iteminvoked", this.itemClicked.bind(this));
            },

            getSelectedIndices: function () {
                return this.winControl.selection.getIndices();
            },

            selectImageAt: function (itemIndex) {
                this.winControl.selection.set(itemIndex);
            },

            itemClicked: function (args) {
                this.dispatchEvent("imageInvoked", {
                    itemIndex: args.detail.itemIndex,
                    itemPromise: args.detail.itemPromise
                });
            }
        });

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo.Detail", {
        FilmstripPresenter: WinJS.Class.mix(FilmstripPresenter, WinJS.Utilities.eventMixin)
    });

})();
