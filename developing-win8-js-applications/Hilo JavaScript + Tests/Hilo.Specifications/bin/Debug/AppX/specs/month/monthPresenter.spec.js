// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

//TODO: fix these specs. the `month.js` file is looking for DOM elements that don't exist at test time.

describe("Month Presenter", function () {
    "use strict";

    var presenter,
        navigation,
        imageFiles,
        targetFolder,
        loadingIndicatorEl,
        semanticZoom,
        zoomedInListView,
        zoomedOutListView,
        hiloAppBar,
        queryBuilder;

    before(function (done) {
        // Note that this is a `before` block and not a `beforeEach`.
        // This is because we only need to copy the thumbnails once
        // for the entire set of assertions.
        // If we were to copy the files in a `beforeEach`, the tests
        // would run slower and we would risk creation collisions.
        Shared.getImages()
            .then(function (images) {
                imageFiles = images;
            })
            .then(done);
    });

    beforeEach(function () {

        loadingIndicatorEl = { style: { display: "" } };
        semanticZoom = { enableButton: function () { } };
        zoomedInListView = new Specs.WinControlStub();

        zoomedOutListView = new Specs.WinControlStub();
        zoomedOutListView.setItemDataSource = function () {
        };

        queryBuilder = new Hilo.ImageQueryBuilder();
        queryBuilder.build = function () {
            return {
                settings: this._settings
            };
        };

        var monthGroupFolder = {
            name: "month year",
            createFileQueryWithOptions: function () {
                return {
                    getItemCountAsync: function () {
                        return WinJS.Promise.as(imageFiles.size);
                    },
                    getFilesAsync: function () {
                        return WinJS.Promise.as(imageFiles);
                    }
                };
            }
        };

        targetFolder = {
            createFolderQueryWithOptions: function () {
                return {
                    getFoldersAsync: function () {
                        return WinJS.Promise.as([monthGroupFolder]);
                    }
                };
            }
        };

        navigation = {
            navigate: function (url, options) {
                navigation.navigate.wasCalled = true;
                navigation.navigate.url = url;
                navigation.navigate.options = options;
            }
        };

        presenter = new Hilo.month.MonthPresenter(loadingIndicatorEl, semanticZoom, zoomedInListView, zoomedOutListView, hiloAppBar, queryBuilder);
        presenter._navigation = navigation;

    });

    describe("when the layout changes before initialization", function () {

        beforeEach(function () {
            // We won't invoke `presenter.start` in order to prevent
            // the initialization from completing. This is not ideal,
            // but the current design makes it difficult to change 
            // layout _during_ intialization.
            presenter.selectLayout(Windows.UI.ViewManagement.ApplicationViewState.snapped);
        });

        it("should set a new layout", function () {
            expect(zoomedInListView.layout).equal(undefined);
        });
    });

    describe("when the presenter is finished initializing", function () {

        beforeEach(function (done) {
            presenter
            .start(targetFolder)
            .then(function () { done(); });
        });

        it("should hide the loading element", function () {
            expect(loadingIndicatorEl.style.display).equal("none");
        });

        describe("when the layout changes to snap", function () {
            beforeEach(function () {
                presenter.selectLayout(Windows.UI.ViewManagement.ApplicationViewState.snapped);
            });

            it("should layout the ListView as a list", function () {
                expect(zoomedInListView.layout instanceof WinJS.UI.ListLayout).true;
            });
        });

        describe("when the layout changes to full", function () {
            beforeEach(function () {
                presenter.selectLayout(Windows.UI.ViewManagement.ApplicationViewState.fullScreenLandscape);
            });

            it("should layout the ListView as a grid", function () {
                expect(zoomedInListView.layout instanceof WinJS.UI.GridLayout).true;
            });
        });
    });

    describe("when an image is invoked", function () {

        var itemDate = new Date(1975, 0, 1);

        beforeEach(function (done) {
            presenter
            .start(targetFolder)
            .then(function () {
                zoomedInListView.dispatchEvent("iteminvoked", {
                    itemPromise: WinJS.Promise.as({ data: { itemDate: itemDate } })
                });
                done();
            });
        });

        it("should pass a query based on the item date", function () {
            expect(navigation.navigate.options.query.settings.monthAndYear).equal(itemDate);
        });

        it("should navigate to the detail page", function () {
            expect(navigation.navigate.wasCalled).equal(true);
            expect(navigation.navigate.url).equal("/Hilo/detail/detail.html");
        });

        it("should include the image's index relative to it's group", function () {
            expect(navigation.navigate.options.itemIndex).equal(0);
        });
    });

});
