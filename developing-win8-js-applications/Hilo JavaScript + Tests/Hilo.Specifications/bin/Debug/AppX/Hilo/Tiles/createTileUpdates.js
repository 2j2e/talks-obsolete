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

    var populateTemplateFor = Hilo.Tiles.populateTemplate,
        maxNumberOfSets = 5,          // WinRT limits 5 tile notifications per app.
        numberOfImagesPerSet = 5;     // `TileWideImageCollection` supports 5 images per tile.

    // For more information about the `TileWideImageCollection` template, see:
    // http://msdn.microsoft.com/en-us/library/windows/apps/hh761491.aspx#TileWideImageCollection

    // Private Methods
    // ---------------

    function buildCompositeTile(wideTile, squareTile) {
        var squareBinding = squareTile.getElementsByTagName("binding").item(0);
        var node = wideTile.importNode(squareBinding, true);
        wideTile.getElementsByTagName("visual").item(0).appendChild(node);

        return wideTile;
    }

    function buildTileNotification(thumbnailPaths) {
        // The square tile will just display the first image used for wide tile.
        var squareTileFile = thumbnailPaths[0];

        var squareTile = populateTemplateFor.squareTile(squareTileFile);
        var wideTile = populateTemplateFor.wideTile(thumbnailPaths);

        var compositeTile = buildCompositeTile(wideTile, squareTile);
        var notification = new Windows.UI.Notifications.TileNotification(compositeTile);

        return notification;
    }

    function fisherYatesShuffle(set) {
        // http://en.wikipedia.org/wiki/Fisher-Yates_shuffle

        var randmon_spot,
            temp,
            current;

        for (var i = (set.length - 1) ; i > 0; i--) {
            // Choose an item randomly from the set.
            randmon_spot = Math.floor(Math.random() * i);
            temp = set[randmon_spot];

            // Choose an item based on the current index.
            // This ensure that each item is choosen at least once.
            current = set[i];

            // Swap the items.
            set[i] = temp;
            set[randmon_spot] = current;
        }

        return set;
    }

    function createTileUpdates(fileNames) {
        var notifications = [],
            filesForSet,
            notification;

        var numberOfPossibleSets = Math.floor(fileNames.length / numberOfImagesPerSet);
        var numberOfSets = Math.min(numberOfPossibleSets, maxNumberOfSets);
        var shuffled = fisherYatesShuffle(fileNames);

        for (var i = numberOfSets; i !== 0; i--) {
            filesForSet = shuffled.splice(0, numberOfImagesPerSet);
            notification = buildTileNotification(filesForSet);
            notifications.push(notification);
        };

        return WinJS.Promise.as(notifications);
    }

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo.Tiles", {
        createTileUpdates: createTileUpdates
    });

})();
