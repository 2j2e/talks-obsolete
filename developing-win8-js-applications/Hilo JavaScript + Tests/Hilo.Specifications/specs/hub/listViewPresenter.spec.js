// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

describe("listview presenter", function () {
    "use strict";

    describe("when snapped", function () {

        var el;

        beforeEach(function () {
            var appView = {};
            el = new Specs.WinControlStub();
            el.winControl.addEventListener = function () { };

            var listviewPresenter = new Hilo.Hub.ListViewPresenter(el, appView);
            listviewPresenter.setViewState(Windows.UI.ViewManagement.ApplicationViewState.snapped);
        });

        it("the ListView should use a ListLayout", function () {
            expect(el.winControl.layout instanceof WinJS.UI.ListLayout).equal(true);
        });

    });

    describe("when filled", function () {

        var el;

        beforeEach(function () {
            var appView = {};
            el = new Specs.WinControlStub();

            var listviewPresenter = new Hilo.Hub.ListViewPresenter(el, appView);
            listviewPresenter.setViewState(Windows.UI.ViewManagement.ApplicationViewState.filled);
        });

        it("the ListView should use a GridLayout", function () {
            expect(el.winControl.layout instanceof WinJS.UI.GridLayout).equal(true);
        });

        it("the ListView should limit to 3 rows", function () {
            expect(el.winControl.layout.maxRows).equal(3);
        });

        it("the ListView should enable cell spanning", function () {
            var groupInfo = el.winControl.layout.groupInfo();
            expect(groupInfo.enableCellSpanning).equal(true);
        });

        it("the ListView should size cells to 200 x 200", function () {
            var groupInfo = el.winControl.layout.groupInfo();
            expect(groupInfo.cellWidth).equal(200);
            expect(groupInfo.cellHeight).equal(200);
        });

    });

});
