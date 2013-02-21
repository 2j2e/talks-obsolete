// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

describe("Crop Page Image Model", function () {

    var image,
        imageQuery,
        dataUrl,
        offset,
        picture,
        navigation;

    beforeEach(function () {

        picture = {
            name: "some.jpg",
            storageFile: new Blob(),
            getUrl: function () { return "/some/url"; },
            properties: { height: 0, width: 0 }
        };

        imageQuery = new WinJS.Promise(function (done) {
            done([picture]);
        });

        navigation = {
            back: function () {
                navigation.back.wasCalled = true;
            }
        };

        offset = { x: 0, y: 0 };
        dataUrl = "";

    });

    describe("when the file name matches the expectation", function () {

        beforeEach(function () {
            image = new Hilo.Crop.Image(imageQuery, dataUrl, "some.jpg", offset, navigation);
        });

        it("should not navigate back", function () {
            expect(navigation.back.wasCalled).not.equal(true);
        });
    });

    describe("when the file name does not match the expectation", function () {

        beforeEach(function () {
            image = new Hilo.Crop.Image(imageQuery, dataUrl, "different.jpg", offset, navigation);
        });

        it("should navigate back", function () {
            expect(navigation.back.wasCalled).equal(true);
        });
    });

    describe("when creating the model", function () {

        beforeEach(function () {
            image = new Hilo.Crop.Image(imageQuery, dataUrl, "some.jpg", offset, navigation);
        });

        it("should set the url", function () {
            expect(image.url).equal("/some/url");
        });

        it("should set the data url", function () {
            expect(image.dataUrl).equal("/some/url");
        });

    });

    describe("when getting the underlying storage file", function () {

        beforeEach(function () {
            image = new Hilo.Crop.Image(imageQuery, dataUrl, "some.jpg", offset, navigation);
        });

        it("should return the expected object", function () {
            var storageFile = image.getStorageFile();
            expect(storageFile).equal(picture.storageFile);
        });
    });

    describe("when setting the image size", function () {

        var imageSize = {};

        beforeEach(function () {
            image = new Hilo.Crop.Image(imageQuery, dataUrl, "some.jpg", offset, navigation);
            image.addEventListener("sizeUpdated", function (args) {
                imageSize = args.detail.imageSize;
            });
            image.setImageSize(10, 20);
        });

        it("should dispatch an event with the new size", function () {
            expect(imageSize.height).equal(10);
            expect(imageSize.width).equal(20);
        });
    });

    describe("when setting the url", function () {

        var new_url = "";

        beforeEach(function () {
            image = new Hilo.Crop.Image(imageQuery, dataUrl, "some.jpg", offset, navigation);
            image.addEventListener("urlUpdated", function (args) {
                new_url = args.detail.url;
            });
            image.setUrl("/new/url");
        });

        it("should dispatch an event with the new url", function () {
            expect(new_url).equal("/new/url");
        });
    });

    describe("when setting the data url", function () {

        var new_dataUrl = "";

        beforeEach(function () {
            image = new Hilo.Crop.Image(imageQuery, dataUrl, "some.jpg", offset, navigation);
            image.addEventListener("dataUrlUpdated", function (args) {
                new_dataUrl = args.detail.url;
            });
            image.setDataUrl("/new/url");
        });

        it("should dispatch an event with the new url", function () {
            expect(new_dataUrl).equal("/new/url");
        });
    });
});
