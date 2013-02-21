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

    var knownFolders = Windows.Storage.KnownFolders;
    // The maximum number of images to display on the hub page .
    var maxImageCount = 6;

    // Hub Presenter Definition
    // -------------------------------

    // The Hub presenter is an implementation of [the mediator pattern][1],
    // designed to coordinate multiple components of an individual page to
    // facilitate all of the functionality of that page. 
    //
    // The HubViewPresenter requires 4 parameters for the constructor function:
    //
    // 1. `nav` - the `WinJS.Navigation` object, used to navigate to other pages
    // 2. `hiloAppBar` - an instance of `Hilo.Controls.HiloAppBar.HiloAppBarPresenter`
    // 3. `listView` - an instance of `Hilo.Hub.ListViewPresenter`
    // 4. `queryBuilder` - an instance of `Hilo.ImageQueryBuilder`
    // 
    // Each individual component of the page is focused on one specific set 
    // of behaviors - both visually and in code. This creates a very clean
    // separation of concerns for each functional area of the screen. The 
    // mediator, then, brings all of the functionality of each component 
    // together. It listens to events from one component and determines what 
    // to do with the other components in response. 
    //
    // [1]: http://en.wikipedia.org/wiki/Mediator_pattern
    //

    var HubViewPresenter = WinJS.Class.define(

        function HubPresenterConstructor(nav, hiloAppBar, listview, queryBuilder) {
            this.nav = nav;
            this.hiloAppBar = hiloAppBar;
            this.listview = listview;
            this.queryBuilder = queryBuilder;

            Hilo.bindFunctionsTo(this, [
                "loadImages",
                "bindImages",
                "selectionChanged",
                "itemClicked",
                "displayLibraryEmpty",
            ]);
        },

        {
            // Starts processing the events from individual components, to 
            // facilitate the functionality of the other components.
            start: function (folder) {

                this.folder = folder;

                this.listview.addEventListener("selectionChanged", this.selectionChanged);
                this.listview.addEventListener("itemInvoked", this.itemClicked);

                // Configure and then build the query for this page.
                this.queryBuilder
                    .bindable(true)
                    .prefetchOptions(["System.ItemDate"])
                    .count(maxImageCount);

                // Retrieve and display the images.
                return this.loadImages();
            },

            dispose: function () {
                if (this.dataSource) {
                    this.dataSource.forEach(function (img) {
                        img.dispose();
                    });
                }
            },

            loadImages: function () {
                var self = this;

                var query = this.queryBuilder.build(this.folder);

                return query.execute()
                    .then(function (items) {
                        if (items.length === 0) {
                            self.displayLibraryEmpty();
                        } else {
                            self.bindImages(items);
                        }
                    });
            },

            bindImages: function (items) {
                this.dataSource = items;

                if (items.length > 0) {
                    items[0].className = items[0].className + " first";
                }

                // We need to know the index of the image with respect to
                // to the group (month/year) so that we can select it
                // when we navigate to the detail page.
                var lastGroup = "";
                var indexInGroup = 0;
                items.forEach(function (item) {
                    var group = item.itemDate.getMonth() + " " + item.itemDate.getFullYear();
                    if (group !== lastGroup) {
                        lastGroup = group;
                        indexInGroup = 0;
                    }

                    item.groupIndex = indexInGroup;
                    indexInGroup++;
                });

                this.listview.setDataSource(items);
            },

            displayLibraryEmpty: function () {
                this.hiloAppBar.disableButtons();
                this.listview.hide();

                document.querySelector("#navigateToMonth").style.display = "none";
                document.querySelector(".empty-library").style.display = "block";
            },

            // The callback method for item selection in the listview changing.
            // This function coordinates the selection changes with the 
            // HiloAppBarPresenter to show and hide it appropriately.
            selectionChanged: function (args) {

                if (args.detail.hasItemSelected) {

                    var picture = args.detail.item;

                    // Build the query for the selected item.
                    var options = this.buildQueryForPicture(picture);

                    // If an image is selected, show the app bar 
                    // with the "crop" and "rotate" buttons.
                    this.hiloAppBar.setNavigationOptions(options, true);

                } else {
                    // If no images are selected, hide the app bar.
                    this.hiloAppBar.clearNavigationOptions(true);
                }
            },

            // When an item is "invoked" (clicked or tapped), navigate to
            // the detail screen to display this image in the month-group
            // that it belongs to, based on the "ItemDate" of the picture.
            itemClicked: function (args) {

                // Get the `Hilo.Picture` item that was bound to the invoked image,
                // and the item index from the list view control.
                var picture = args.detail.item.data;

                // Build the query that can find this picture within it's month group.
                var options = this.buildQueryForPicture(picture);

                // Navigate to the detail view, specifying the month query to
                // show, and the index of the individual item that was invoked.
                this.nav.navigate("/Hilo/detail/detail.html", options);
            },

            buildQueryForPicture: function (picture) {

                // Build the query for the month and year of the invoked image.
                var query = this.queryBuilder
                    .reset()
                    .bindable(true)
                    .forMonthAndYear(picture.itemDate)
                    .build(knownFolders.picturesLibrary);

                return {
                    query: query,
                    itemIndex: picture.groupIndex,
                    itemName: picture.name,
                    picture: picture
                };
            }
        });

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo.Hub", {
        HubViewPresenter: HubViewPresenter
    });

})();
