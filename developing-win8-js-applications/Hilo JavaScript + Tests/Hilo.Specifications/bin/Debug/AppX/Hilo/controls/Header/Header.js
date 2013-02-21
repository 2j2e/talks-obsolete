// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511

(function () {
    "use strict";

    // Page Header Control
    // -------------------

    // This control provides a common implementation for the header of a page,
    // including the page title, and back button. The back button is facilitated
    // by the `navigation.js` file, while the page title is set by passing a
    // `titleResource` option to the page:
    // 
    // ```html
    // <div data-win-control="WinJS.UI.HtmlControl" 
    //       data-win-options="{uri: "/Hilo/Controls/Header/Header.html, titleResource: "someResource"}"
    //  ></div>
    // ```
    //
    // The `titleResource` is used to look up the resource string in the application"s
    // localization resources. The name that is provided for this parameter is the key 
    // that is used to look up the resource. 

    WinJS.UI.Pages.define("/Hilo/controls/Header/Header.html", {

        ready: function (element, options) {
            var pageTitle, title;

            // If the `titleResource` was provided, set the page title.
            if (options.titleResource) {

                // Find the `#pageTitle` HTML element.
                pageTitle = element.querySelector("#pageTitle");

                // Load and set the localized resource for the page title.
                title = WinJS.Resources.getString(options.titleResource);
                pageTitle.textContent = title.value;
            }

        }

    });
})();
