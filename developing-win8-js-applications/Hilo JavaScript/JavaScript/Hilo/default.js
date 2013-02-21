// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // # Bootstrapper
    // This script is responsible for bootstrapping the app.

    var activation = Windows.ApplicationModel.Activation,
        app = WinJS.Application,
        nav = WinJS.Navigation;

    // According to the official documentation, 
    // http://msdn.microsoft.com/en-us/library/windows/apps/jj215606.aspx
    // the following should always be set to true.
    WinJS.Binding.optimizeBindingReferences = true;

    app.addEventListener("activated", function (args) {

        var currentState = args.detail;

        if (currentState.kind === activation.ActivationKind.launch) {

            if (currentState.previousExecutionState !== activation.ApplicationExecutionState.terminated) {

                // When the app is started, we want to update its tile
                // on the start screen. Since this API is not accessible 
                // inside of Blend, we only invoke it when we are not in
                // design mode.
                if (!Windows.ApplicationModel.DesignMode.designModeEnabled) {
                    var tileUpdater = new Hilo.Tiles.TileUpdater();
                    tileUpdater.update();
                }

                // Begin listening for changes in the `picturesLibrary`.
                // If files are added, deleted, or modified, update the 
                // current screen accordingly.
                Hilo.contentChangedListener
                    .listen(Windows.Storage.KnownFolders.picturesLibrary);

            } else {
                // This app has been reactivated from suspension.
                // Restore app state here.
            }

            // If any history is found in the `sessionState`, we need to
            // restore it.
            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }

            // After we process the UI (search the DOM for data-win-control),
            // we'll navigate to the current page. These are async operations
            // and they will return a promise.
            var processAndNavigate = WinJS.UI
                .processAll()
                .then(function () {

                    if (nav.location) {
                        nav.history.current.initialPlaceholder = true;
                        return nav.navigate(nav.location, nav.state);
                    } else {
                        return nav.navigate(Hilo.navigator.home);
                    }
                });

            args.setPromise(processAndNavigate);
        }
    }, false);

    app.addEventListener("checkpoint", function (args) {
        // The app is about to be suspended, so we save the current
        // navigation history.
        app.sessionState.history = nav.history;
    }, false);

    // The `resuming` event is not exposed through `WinJS.Application` like
    // the `activated` event. Instead, we need to use the underlying WinRT API.
    Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", function (args) {
        var tileUpdater = new Hilo.Tiles.TileUpdater();
        tileUpdater.update();
    }, false);
    app.start();
})();
