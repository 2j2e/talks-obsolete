// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    function define(pageId, members) {

        var url = "/Hilo/" + pageId + "/" + pageId + ".html";

        members.ready = wrapWithCommonReady(members.ready);
        members.bindPageTitle = bindPageTitle;

        return WinJS.UI.Pages.define(url, members);
    }

    function bindPageTitle(title) {
        // Bind the title based on the query's month/year.
        var pageTitleEl = document.querySelector("#pageTitle");
        WinJS.Binding.processAll(pageTitleEl, { title: title });
    }

    // Examines the page for `a` tags, extracting the URL and wiring
    // a handler that invokes the built-in navigation logic.
    function processLinks() {

        var links = document.querySelectorAll("a[data-navigate]");
        Array.prototype.forEach.call(links, function (a) {
            var root = "ms-appx://" + a.host,
                url = a.href.replace(root, "");

            a.href = "#";
            a.addEventListener("click", function (args) {
                args.preventDefault();
                WinJS.Navigation.navigate(url);
            });
        });
    }

    // Takes the `ready` function that the developer provided for a page 
    // control and wraps it with additional functionality that we want to
    // occur on every page.
    function wrapWithCommonReady(pageSpecificReadyFunction) {

        pageSpecificReadyFunction = pageSpecificReadyFunction || function () { };

        return function (element, options) {

            processLinks();

            // Handle localized string resources for the page.
            WinJS.Resources.processAll();

            // Ensure that the `options` argument is consistent with expectations,
            // for example, that it is properly deserialized when resuming.
            Hilo.controls.checkOptions(options);

            // We need to bind the `pageSpecificReadyFunction` function explicitly, 
            // otherwise it will lose the context that the developer expects (that is, 
            // it will not resolve `this` correctly at execution time.
            var ready = pageSpecificReadyFunction.bind(this);

            // Invoke the custom `ready`.
            return ready(element, options);
        };
    }

    // Public API
    // ----------
    WinJS.Namespace.define("Hilo.controls.pages", {
        define: define
    });

}());
