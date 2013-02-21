// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // General Explanation
    // -------------------
    // For an overview of how tiles work:
    // http://msdn.microsoft.com/en-us/library/windows/apps/Hh779724.aspx
    //
    // Specifically for this application, we want a tile on the start screen
    // that rotates through images from our picture library. We need to support
    // both square tiles and wide tiles. Each wide tile will show five images 
    // at once.
    //
    // To do this, we grab some images from the picture library. Then we need to 
    // ensure that the images meet the [constraints of being used in a tile][1].
    // We do this by having WinRT give us the thumbnail for the each image, and 
    // we save the thumbnails in the [local folder][2].
    // 
    // After the thumbnails are ready, we get the XML templates for defining the 
    // tiles and populate them with the paths to the thumbnails. We then use the 
    // resulting XML to to build [`TileNotification` objects][3] to add to the update
    // queue for the tile.
    //
    // [1]: http://msdn.microsoft.com/en-us/library/windows/apps/hh781198.aspx
    // [2]: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.applicationdata.localfolder.aspx
    // [3]: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.notifications.tilenotification.aspx

    // Imports And Constants
    // ---------------------

    var thumbnailFolderName = "tile-thumbnails",
        localThumbnailFolder = "ms-appdata:///local/" + thumbnailFolderName + "/",
        picturesLibrary = Windows.Storage.KnownFolders.picturesLibrary,
        tileUpdateManager = Windows.UI.Notifications.TileUpdateManager,
        numberOfImagesToRetrieve = 30;

    // TileUpdater Defintiion
    // ----------------------

    var TileUpdater = WinJS.Class.define(

        function TileUpdaterConstructor() {
            this.tileUpdater = tileUpdateManager.createTileUpdaterForApplication();
            this.tileUpdater.clear();
            this.tileUpdater.enableNotificationQueue(true);
        },

        {
            getLocalImagePaths: function (files) {
                return files.map(function (file) {
                    return localThumbnailFolder + file;
                });
            },

            queueTileUpdates: function (notifications) {
                var self = this;
                notifications.forEach(function (notification) {
                    self.tileUpdater.update(notification);
                });
            },

            update: function () {
                // Bind the function to a context, so that `this` will be resolved
                // when it is invoked in the promise.
                var queueTileUpdates = this.queueTileUpdates.bind(this);

                // Build a query to get the number of images needed for the tiles.
                var queryBuilder = new Hilo.ImageQueryBuilder();
                queryBuilder.count(numberOfImagesToRetrieve);

                // What follows is a chain of promises. These outline a number of 
                // asychronous operations that are executed in order. For more 
                // information on how promises work, see the readme.txt in the 
                // root of this project.
                var whenImagesForTileRetrieved = queryBuilder.build(picturesLibrary).execute();
                whenImagesForTileRetrieved
                    .then(Hilo.Tiles.createTileFriendlyImages)
                    .then(this.getLocalImagePaths)
                    .then(Hilo.Tiles.createTileUpdates)
                    .then(queueTileUpdates);
            }
        });

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo.Tiles", {
        TileUpdater: TileUpdater
    });

})();
