// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // Throttle
    // --------
    //
    // This throttle function is used to throttle the file system changes.
    // That is, if changes come in too fast and frequent, they would
    // cause a continuous flicker in the UI. Throttling the changes
    // prevents this from happening by limiting the application event
    // trigger to once in the specified interval.

    function throttle(callback, delayInSeconds) {
        var lastRun = Date.now();

        // Return the throttled version of the callback function.
        return function () {
            var args = arguments,
                delay = delayInSeconds * 1000,
                timeSinceLastRun = Date.now() - lastRun;

            if (timeSinceLastRun >= delay) {
                callback.apply(null, args);
                lastRun = Date.now();
            }
        };
    }

    // Content Changed Listener
    // ------------------------
    //
    // Creates a query object to look at files form the Pictures library, then 
    // attaches to the file system event for content changing within that library.
    // When a file system change occurs, an application level event is queued up
    // so that other parts of the application can be notified and response
    // accordingly.

    var contentChangedListener = {

        // Create the file system query and listen for file system changes.
        listen: function (folder) {
            // Build the query and listen to the contentschanged event.
            var builder = new Hilo.ImageQueryBuilder();

            // Throttle the event handler so that it only runs once every 10 seconds.
            var handler = throttle(this.raiseEvent, 10);

            // We need to hold a reference to the query object so that our event
            // listener does not fall out of scope and get garbage collected. 
            this.query = builder.build(folder);
            this.query.fileQuery.addEventListener("contentschanged", handler);

            // Run the file load and grab the first image in the set. This sets
            // up the file system watchers behind the scenes, allowing the
            // event listener to work
            this.query.fileQuery.getFilesAsync(0, 1).done();
        },

        // Trigger the application specific event so that other parts
        // of the app can respond appropriately.
        raiseEvent: function () {
            WinJS.Application.queueEvent({ type: "Hilo:ContentsChanged" });
        }
    };

    // Public API
    // ----------
    //
    // Export the contentChangedListener object as an object
    // avialable on the `Hilo` namespace, directly, so that it
    // can be used in the application.

    WinJS.Namespace.define("Hilo", {
        contentChangedListener: contentChangedListener
    });

}());
