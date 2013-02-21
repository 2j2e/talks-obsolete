// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // The [ECMASCript5 `bind`][2] function is used to ensure that the
    // context (the `this` variable) of each of the specified
    // callback functions is set correctly, when the event triggers
    // and the callback is executed.
    // 
    // [2]: http://msdn.microsoft.com/en-us/library/windows/apps/ff841995
    //

    // Private Members
    // ---------------

    function bindFunctionsTo(context, functions) {
        // Cycle through the specified members on the given object.
        functions.forEach(function (key) {
            var fn = context[key];
            if (typeof fn === "function") {
                // If the member really is a function, bind it to the context.
                context[key] = fn.bind(context);
            } else {
                throw new Error(key + " is not of type function");
            }
        });
    }

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo", {
        bindFunctionsTo: bindFunctionsTo
    });

})();
