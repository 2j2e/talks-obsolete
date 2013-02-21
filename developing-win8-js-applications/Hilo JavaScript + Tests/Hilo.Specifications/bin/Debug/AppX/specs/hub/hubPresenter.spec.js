// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

describe("Hub Page Presenter", function () {
    "use strict";

    var hubView, nav, hiloAppBar, listView;

    beforeEach(function () {
        listView = new Specs.WinControlStub();
        listView.winControl.setDataSource = function () { };

        nav = {
            navigate: function () {
                nav.navigate.args = arguments;
                nav.navigate.wasCalled = true;
            }
        };

        hiloAppBar = {
            setNavigationOptions: function (options, hide) {
                hiloAppBar.setNavigationOptions.wasCalled = true;
                hiloAppBar.setNavigationOptions.options = options;
                hiloAppBar.setNavigationOptions.hidden = !!hide;
            },

            clearNavigationOptions: function () {
                hiloAppBar.clearNavigationOptions.wasCalled = true;
            }
        };
    });

    describe("when first starting", function () {

        var boundViewModels,
            imageViewModels;

        beforeEach(function (done) {
            boundViewModels = [];
            imageViewModels = [];

            listView.winControl.setDataSource = function (itemsToBind) {
                boundViewModels = itemsToBind;
            };

            var imageItemDate = new Date("Jan 1, 1975");

            imageViewModels.push({
                className: "thumbnail",
                itemDate: imageItemDate
            });

            imageViewModels.push({
                className: "thumbnail",
                itemDate: imageItemDate
            });

            imageViewModels.push({
                className: "thumbnail",
                itemDate: new Date("Feb 1, 1975")
            });

            var queryBuilder = new Hilo.ImageQueryBuilder()
            queryBuilder.build = function () {
                return {
                    execute: function () {
                        return WinJS.Promise.as(imageViewModels);
                    }
                };
            };

            hubView = new Hilo.Hub.HubViewPresenter(nav, hiloAppBar, listView, queryBuilder);
            hubView.start({}).then(function () { done(); });
        });

        it("should bind the images return from the query", function () {
            expect(boundViewModels.length).equal(imageViewModels.length);
        });

        it("should count images with the same date (month/year) as being in the same group", function () {
            expect(boundViewModels[0].groupIndex).equal(0);
            expect(boundViewModels[1].groupIndex).equal(1);
        });

        it("should count images with the different dates (month/year) as being in a different group", function () {
            expect(boundViewModels[2].groupIndex).equal(0);
        });
    });

    describe("after the presenter is start", function () {

        beforeEach(function (done) {

            var whenFolderIsReady = Windows.Storage.ApplicationData.current.localFolder.getFolderAsync("Indexed");

            whenFolderIsReady.then(function (folder) {
                var queryBuilder = new Hilo.ImageQueryBuilder()

                hubView = new Hilo.Hub.HubViewPresenter(nav, hiloAppBar, listView, queryBuilder);
                hubView.start(folder).then(function () { done(); });

            });
        });

        describe("given nothing is selected, when selecting a picture", function () {

            beforeEach(function () {
                var picture = { groupIndex: 1, itemDate: new Date() };
                listView.dispatchEvent("selectionChanged", { hasItemSelected: true, item: picture });
            });

            it("should set the image index and show the app bar", function () {
                expect(hiloAppBar.setNavigationOptions.wasCalled).true;
                expect(hiloAppBar.setNavigationOptions.options.itemIndex).equals(1);
            });

        });

        describe("when a picture is selected and deselecting it", function () {

            beforeEach(function () {
                var picture = { groupIndex: 0, itemDate: new Date() };
                listView.dispatchEvent("selectionChanged", { hasItemSelected: true, item: picture });
                listView.dispatchEvent("selectionChanged", { hasItemSelected: false });
            });

            it("should hide the appbar", function () {
                expect(hiloAppBar.clearNavigationOptions.wasCalled).true;
            });

        });

        describe("when a picture is selected and selecting another", function () {

            beforeEach(function () {
                var picture = { groupIndex: 1, itemDate: new Date() };
                listView.dispatchEvent("selectionChanged", { hasItemSelected: true, item: picture });
                listView.dispatchEvent("selectionChanged", { hasItemSelected: true, item: picture });
            });

            it("should reveal the appbar", function () {
                expect(hiloAppBar.setNavigationOptions.wasCalled).true;
                expect(hiloAppBar.setNavigationOptions.hidden).ok;
                expect(hiloAppBar.setNavigationOptions.options.itemIndex).equals(1);
            });

        });

        describe("when a picture is invoked (touched or clicked)", function () {

            beforeEach(function () {
                var item = {
                    data: {
                        itemDate: new Date("Jan 5 1973"),
                        groupIndex: 99
                    }
                };
                listView.dispatchEvent("itemInvoked", { item: item });
            });


            it("should navigate to the detail page", function () {
                expect(nav.navigate.args[0]).equals("/Hilo/detail/detail.html");
            });

            it("should pass along the index of the selected picture", function () {
                expect(nav.navigate.args[1].itemIndex).equal(99);
            });

            it("should pass along the month/year query for the invoked picture", function () {
                expect(nav.navigate.args[1].query).exist;
            });
        });

    });
});
