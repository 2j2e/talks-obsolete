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

    // Hilo App Bar Control
    // --------------------

    // This control provides a re-usable implementation of the application's `AppBar`
    // for navigating to the "crop" and "rotate" screens. 
    //
    // There are two important components in this control: the `hiloAppBar.html` file
    // which can be included in any page that needs the standard image naviagation
    // app bar, and the `HiloAppBarPresenter.js` which is the presenter that is used
    // to facilitate the app bar's functionality. 
    // 
    // To use this control in a page, add a reference to it in the page's markup,
    // as an HTML control:
    //
    // ```html
    // <section id="some-id" 
    //          data-win-control="WinJS.UI.HtmlControl" 
    //          data-win-options="{uri: "/Hilo/controls/HiloAppBar/hiloAppBar.html"}">
    // </section> 
    // ```
    //
    // Then in the page's .js file, create an instance of the HiloAppBarPresenter.
    // The presenter requires a reference to the HTML element that was used to
    // place the control on the screen, and a reference to WinJS.Navigation:
    //
    // ```js
    // var hiloAppBarEl = document.querySelectory("#some-id");
    // var hiloAppBar = new Hilo.Controls.HiloAppBar.HiloAppBarPresenter(hiloAppBarEl, WinJS.Navigation);
    // ```
    //
    // See the `HiloAppBarPresenter.js` file for more information on the API for
    // using the HiloAppBar presenter.

    WinJS.UI.Pages.define("/Hilo/controls/HiloAppBar/hiloAppBar.html", {
    });
})();
