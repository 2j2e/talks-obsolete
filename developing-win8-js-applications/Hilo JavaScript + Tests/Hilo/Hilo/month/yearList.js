// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // `YearList` is a custom control. The majority of its functionality is 
    // essentially the same as the ListView. We decided to implement this 
    // control as a thin wrapper over the ListView and extend it in two ways:
    // * provide an `itemTemplate` responsible for rendering an item in calendat layout
    // * provide an implementation of `WinJS.UI.IZoomableView`
    //
    // Due to the necessary interaction between the item template and the zoomable
    // view we decided that this was the simplest approach.
    var YearList = WinJS.Class.define(

        function YearList_ctor(element, options) {
            var self = this;

            var listViewEl = document.createElement("div");

            element.appendChild(listViewEl);

            var listView = new WinJS.UI.ListView(listViewEl, {
                layout: { type: WinJS.UI.GridLayout },
                selectionMode: "none",
                tapBehavior: "none"
            });

            this.listView = listView;
            listView.layout.maxRows = 3;

            // The function for the itemTemplate is responsible for taking an
            // item with a `year` and `months` properties and rendering in the 
            // form of a "calendar".
            listView.itemTemplate = function (itemPromise, recycledElement) {

                var container = recycledElement || document.createElement("div");
                container.innerHTML = "";

                var header = document.createElement("div");
                header.className = "header";
                var body = document.createElement("div");
                body.className = "body";
                container.appendChild(header);
                container.appendChild(body);
                container.className = "year-group";

                // This handler will be used whenever an individual month 
                // is invoked.
                var handler = function (item, args) {
                    WinJS.UI.Animation.pointerDown(this);
                    self.zoomableView._selectedItem = {
                        groupKey: item.groupKey,
                        firstItemIndexHint: item.firstItemIndexHint
                    };
                    self.zoomableView._triggerZoom();
                };

                return itemPromise.then(function (item) {

                    // This is where we actually begin constructing
                    // the DOM elements to render the year.
                    header.innerText = item.data.year;

                    var monthsInYear = 12;
                    var month;
                    for (var i = 0; i < monthsInYear; i++) {
                        month = item.data.months[i];

                        var d = new Date(item.data.year, i);
                        var name = self._dateFormatter.getAbbreviatedMonthFrom(d);
                        var m$ = document.createElement("div");

                        var span = document.createElement("span");
                        span.className = "month-name";
                        span.innerText = name;
                        m$.appendChild(span);

                        m$.className = "month-item";
                        m$.setAttribute("disabled", true);

                        body.appendChild(m$);

                        if (month) {
                            m$.addEventListener("click", handler.bind(m$, month));
                            m$.removeAttribute("disabled");
                        };
                    }

                    return container;
                });
            };

            this.zoomableView.beginZoom = function () {
                self.listView.itemDataSource = self._dataSource;
            };

            this._initialized = false;
        },

        {
            _dateFormatter: Hilo.dateFormatter,

            setItemDataSource: function (dataSource) {
                this._dataSource = dataSource;
            },

            setLayout: function (layout) {
                this.listView.layout = layout;
            },

            // In order to function with the SemanticZoom control, our custom control 
            // must provide a `zoomableView` property that implements [`WinJS.UI.IZoomableView`][1].
            // Note that we choose not to fully implement the interface in order to limit the 
            // scope of the project. Ommisions are noted below.
            // [1]: http://msdn.microsoft.com/en-us/library/windows/apps/br229794.aspx
            zoomableView: {

                beginZoom: function () {
                },

                endZoom: function (isCurrentView) {
                },

                configureForZoom: function (isZoomedOut, isCurrentView, triggerZoom, prefetchedPages) {
                    this._triggerZoom = triggerZoom;
                },

                getCurrentItem: function () {
                    return WinJS.Promise.as({
                        item: this._selectedItem,
                        position: { left: 0, top: 0, width: 0, height: 0 }
                    });
                },

                getPanAxis: function () { return "Horizontal"; },

                positionItem: function (item, position) {
                    // This function is called when when navigating from the default view 
                    // to the zoomed-out view. It should position thezoomed-out view 
                    // such that the group associated with `item` is in view.
                },

                setCurrentItem: function (x, y) {
                    // This function is called when when navigating from the zoomed-out view 
                    // to the default view. Specifically, in the case when an item is not 
                    // explcitily invoke. The position data passed in `x` and `y` should be
                    // be to determine with group was under the mouse and thus which item
                    // should be in view when returning to the default view.
                }
            }
        });

    // Export Public API
    // -----------------

    WinJS.Namespace.define("Hilo.month", {
        YearList: YearList
    });

})();