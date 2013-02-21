// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

(function () {
    "use strict";

    // Stub WinControl Object
    // ----------------------

    function WinControlStub() { 
        this.winControl = this;
        this.selectors = {};
    }

    var winControlStubMethods = {
        addQuerySelector: function (selector, response) {
            if (!this.selectors[selector]) {
                this.selectors[selector] = [];
            }
            this.selectors[selector].push(response);
        },

        querySelector: function (selector) {
            return this.selectors[selector][0];
        },

        querySelectorAll: function (selector) {
            return this.selectors[selector];
        }
    };

    // API For Test Stub / Mock Objects
    // ---------------------------------

    WinJS.Namespace.define("Specs", {
        WinControlStub: WinJS.Class.mix(WinControlStub, winControlStubMethods, WinJS.Utilities.eventMixin),
        EventStub: WinJS.Class.mix(function(){}, WinJS.Utilities.eventMixin)
    });
})();
