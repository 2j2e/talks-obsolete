// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

describe("Rotate Page Presenter", function () {

    var rotatePresenter,
        el,
        appBarPresenter,
        picture,
        navigation,
        imageFiles,
        fileLoader,
        expectedFilename,
        touchProvider;

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
        el = new Specs.WinControlStub();
        el.style = {};

        picture = {
            storageFile: imageFiles[0],
            getUrl: function () { return "/some/url"; }
        };

        fileLoader = new WinJS.Promise(function (done) {
            done([picture]);
        });

        appBarPresenter = new Specs.EventStub();
        appBarPresenter._enableButtons = function () { };

        navigation = {
            back: function () {
                navigation.back.wasCalled = true;
            }
        };

        expectedFilename = "";
        touchProvider = {};
    });

    describe("when the file name matches the expectation", function () {

        beforeEach(function (done) {
            rotatePresenter = new Hilo.Rotate.RotatePresenter(el, appBarPresenter, fileLoader, "001.jpg", touchProvider, navigation);
            rotatePresenter.start().then(function () { done(); });
        });

        describe("when rotating an image", function () {

            beforeEach(function () {
                appBarPresenter.dispatchEvent("rotate", {
                    rotateDegrees: 90
                });
            });

            it("should add the specified degrees to the image rotation", function () {
                expect(el.style.transform).equals("rotate(90deg)");
            });
        });
    });

    describe("when the file name does not match the expectation", function () {

        beforeEach(function (done) {
            rotatePresenter = new Hilo.Rotate.RotatePresenter(el, appBarPresenter, fileLoader, "different.jpg", touchProvider, navigation);
            rotatePresenter.start().then(function () { done(); });
        });

        it("should navigate back a page", function () {
            expect(navigation.back.wasCalled).equal(true);

        });
    });


});
