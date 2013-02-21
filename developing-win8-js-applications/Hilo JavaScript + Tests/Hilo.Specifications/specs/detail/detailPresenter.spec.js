// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

describe("Detail Presenter", function () {

    var detailPresenter,
        filmstripPresenter,
        flipviewPresenter,
        hiloAppBar,
        picture,
        navigation;

    beforeEach(function (done) {
        filmstripPresenter = new Specs.WinControlStub();
        filmstripPresenter.bindImages = function () { };
        filmstripPresenter.selectImageAt = function () { };

        flipviewPresenter = new Specs.WinControlStub();
        flipviewPresenter.bindImages = function () { };
        flipviewPresenter.showImageAt = function (index) {
            flipviewPresenter.showImageAt.wasCalled = true;
            flipviewPresenter.showImageAt.itemIndex = index;
        };

        hiloAppBar = {
            setNavigationOptions: function (options) {
                hiloAppBar.setNavigationOptions.wasCalled = true;
                hiloAppBar.setNavigationOptions.options = options;
            },
            enableButtons: function () { }
        };

        navigation = {
            back: function () {
                navigation.back.wasCalled = true;
            },
            history: {
                current: {
                    state: {}
                }
            }
        };

        detailPresenter = new Hilo.Detail.DetailPresenter(filmstripPresenter, flipviewPresenter, hiloAppBar, navigation);

        picture = { name: "some.jpg" };

        var query = {
            execute: function () {
                return WinJS.Promise.as([picture]);
            }
        };

        detailPresenter
            .start({ query: query, itemIndex: 0, itemName: "some.jpg", picture: picture })
            .then(function () { done(); });
    });

    describe("when an image has been activated", function () {
        beforeEach(function () {
            filmstripPresenter.dispatchEvent("imageInvoked", {
                itemIndex: 1,
                itemPromise: WinJS.Promise.as({ data: picture })
            });
        });

        it("should show the image", function () {
            expect(flipviewPresenter.showImageAt.wasCalled).true;
            expect(flipviewPresenter.showImageAt.itemIndex).equals(1);
        });

        it("should set the selected image for the image navigation presenter", function () {
            var options = hiloAppBar.setNavigationOptions.options;

            expect(hiloAppBar.setNavigationOptions.wasCalled).true;
            expect(options.itemIndex).equals(1);
            expect(options.itemName).equals(picture.name);
        });
    });

    describe("when the loads the initial image", function () {
        it("should have the corresponding values in the current history", function () {
            expect(navigation.history.current.state.itemIndex).equals(0);
            expect(navigation.history.current.state.itemName).equals(picture.name);
        });
    });

    describe("when selecting an image (and displaying it)", function () {
        var pictureName = "pictureAtIndex99.jpg";

        beforeEach(function () {
            detailPresenter.gotoImage(99, { name: pictureName });
        });

        it("should override the current history state", function () {
            expect(navigation.history.current.state.itemIndex).equals(99);
            expect(navigation.history.current.state.itemName).equals(pictureName);
        });
    });

});
