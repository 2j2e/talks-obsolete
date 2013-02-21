// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

(function (globals) {
    "use strict";

    var activation = Windows.ApplicationModel.Activation,
        app = WinJS.Application;

    function setupImages(exists) {
        var promise;

        if (exists) {
            promise = WinJS.Promise.as(exists); /* this is an empty promise */
        } else {
            promise = Shared.copyImagesToIndexedFolder();
        }

        return promise;
    }

    function runSpecs() {
        // configure the spec runner
        var specRunner = new Hilo.SpecRunner({
            src: "Hilo",
            specs: "specs",
            helpers: "specs/Helpers"
        });

        // Handle any errors in the execution that
        // were not part of a failing test
        specRunner.addEventListener("error", function (args) {
            document.querySelector("body").innerText = args.detail;
        });

        // run the specs
        specRunner.run();
    }

    WinJS.Application.onerror = function (e) {
        var errorsList = document.querySelector("#errors ul");
        var errorEl = document.createElement("li");
        errorEl.innerText = JSON.stringify(e.detail.exception);
        errorsList.appendChild(errorEl);

        document.querySelector("#errors").style.display = "block";
        // By returning true, we signal that the exception was handled,
        // preventing the application from being terminated
        return true;
    };

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            args.setPromise(WinJS.UI.processAll().then(function () {

                Shared.doesIndexedFolderExist()
                    .then(setupImages)
                    .then(runSpecs);

            }));
        }
    }, false);

    app.start();
})(this);
