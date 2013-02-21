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
    var search = Windows.Storage.Search,
        commonFolderQuery = Windows.Storage.Search.CommonFolderQuery,
        viewStates = Windows.UI.ViewManagement.ApplicationViewState;

    // Page Control
    // ------------

    Hilo.controls.pages.define("month", {

        ready: function (element, options) {
            var self = this;

            this.queryBuilder = new Hilo.ImageQueryBuilder();

            WinJS.Application.addEventListener("Hilo:ContentsChanged", Hilo.navigator.reload);

            var appBarEl = document.querySelector("#appbar");
            var hiloAppBar = new Hilo.Controls.HiloAppBar.HiloAppBarPresenter(appBarEl, WinJS.Navigation);

            var loadingIndicator = document.querySelector("#loadingProgress");
            this.semanticZoom = document.querySelector(".semanticZoomContainer").winControl;

            this.zoomInListView = document.querySelector("#monthgroup").winControl;
            var zoomOutListView = document.querySelector("#yeargroup").winControl;

            this.presenter = new Hilo.month.MonthPresenter(loadingIndicator, this.semanticZoom, this.zoomInListView, zoomOutListView, hiloAppBar, this.queryBuilder);
            this.promise = this.presenter.start(Windows.Storage.KnownFolders.picturesLibrary);
        },

        updateLayout: function (element, viewState, lastViewState) {
            if (viewState !== lastViewState) {
                this.presenter.selectLayout(viewState);
            }
        },

        unload: function () {
            this.promise.cancel();
            WinJS.Application.removeEventListener("Hilo:ContentsChanged", Hilo.navigator.reload);
            Hilo.UrlCache.clearAll();
        }

    });

})();