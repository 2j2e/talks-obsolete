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

    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;

    // These settings must correspond to the height and width values specified 
    // in the css for the items. They need to be the greatest common demoninator
    // of the various widths and heights.
    var listViewLayoutSettings = {
        enableCellSpanning: true,
        cellWidth: 200,
        cellHeight: 200
    };

    // List View Presenter Definition
    // --------------------------------

    // The list view presenter manages the contents and interactions of
    // the Hub page's list view. It listens to events from the 
    // [WinJS.UI.ListView][1] control and determines what to do based on
    // the specific event. 
    //
    // The ListViewPresenter takes 2 parameters:
    //
    // 1. `el` - the DOM element for the `WinJS.UI.ListView` to control
    // 2. `appView` - a reference to [Windows.UI.ViewManagement.ApplicationView][2]
    //
    //
    // [1]: http://msdn.microsoft.com/en-us/library/windows/apps/br211837.aspx
    // [2]: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.viewmanagement.applicationview
    //

    var ListViewPresenter = WinJS.Class.define(

        function ListViewPresenter(el, appView) {
            this.el = el;
            this.lv = el.winControl;
            this.appView = appView;
            this.setup();
        },

        {
            // Set up the default layout for the view, and set up the
            // event handlers from the ListView control.
            setup: function () {
                this.lv.layout = this.selectLayout(this.appView.value);

                // The [ECMASCript5 `bind`][3] function is used to ensure that the
                // context (the `this` variable) of the callback functions is set correctly.
                // Otherwise, the callback functions would not resolve `this` correctly 
                // when the events are raised and the callbacks are executed.
                // 
                // [3]: http://msdn.microsoft.com/en-us/library/windows/apps/ff841995
                //
                this.lv.addEventListener("iteminvoked", this.imageNavigated.bind(this));
                this.lv.addEventListener("selectionchanged", this.imageSelected.bind(this));
            },

            // Event handler for selecting an image.
            imageSelected: function (args) {
                var itemLoader, itemIndex, hasItemSelected;

                itemIndex = this.getIndices();
                hasItemSelected = itemIndex.length > 0;
                if (hasItemSelected) {
                    itemLoader = this.getItems();
                }

                var self = this;
                WinJS.Promise.as(itemLoader).then(function (items) {
                    var selectedItem = (items && items[0]) ? items[0] : {};
                    self.dispatchEvent("selectionChanged", {
                        hasItemSelected: hasItemSelected,
                        itemIndex: selectedItem.index,
                        item: selectedItem.data
                    });
                });
            },

            // Event handler for "invoking" (clicking or tapping) an image.
            imageNavigated: function (args) {
                var self = this;
                args.detail.itemPromise.then(function (item) {
                    self.dispatchEvent("itemInvoked", {
                        item: item,
                        itemIndex: args.detail.itemIndex
                    });
                });
            },

            // Bind an array of objects to the `ListView` by converting
            // it in to a bindable list, and data source.
            setDataSource: function (items) {
                this.lv.itemDataSource = new WinJS.Binding.List(items).dataSource;
            },

            // Change the layout of the list view based on the application's
            // [application view state][4]. 
            // 
            // [4]: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.viewmanagement.applicationviewstate
            setViewState: function (viewState) {
                this.lv.layout = this.selectLayout(viewState);
            },

            // Determines the correct layout for the screen based
            // on the current view state and last view state. If the
            // current view state is the same as the last view state,
            // no changes are made to the layout.
            selectLayout: function (viewState, lastViewState) {

                if (lastViewState === viewState) { return; }

                if (viewState === appViewState.snapped) {
                    return new WinJS.UI.ListLayout();
                }
                else {
                    var layout = new WinJS.UI.GridLayout();
                    layout.groupInfo = function () { return listViewLayoutSettings; };
                    layout.maxRows = 3;
                    return layout;
                }
            },

            // Get the indices of the selected items from the ListView.
            getIndices: function () {
                return this.lv.selection.getIndices();
            },

            // Get the selected items.
            getItems: function () {
                return this.lv.selection.getItems();
            },

            hide: function () {
                this.el.style.display = "none";
            }
        });

    // Public API
    // ----------   

    WinJS.Namespace.define("Hilo.Hub", {
        ListViewPresenter: WinJS.Class.mix(ListViewPresenter, WinJS.Utilities.eventMixin)
    });

})();
