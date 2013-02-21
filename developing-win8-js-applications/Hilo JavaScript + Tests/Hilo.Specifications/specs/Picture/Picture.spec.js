// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

describe("Picture View Model", function () {
    "use strict";

    var viewmodel,
        file,
        imageFiles;

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

        //var retrieveProperties = WinJS.Promise.as({ lookup: function () { } });
        //var imageBlob = new Blob();

        //file = {
        //    name: "my-image",
        //    addEventListener: function () { },
        //    getThumbnailAsync: function () { return WinJS.Promise.as(imageBlob); },
        //    properties: {
        //        retrievePropertiesAsync: function () { return retrieveProperties; }
        //    }
        //};

        file = imageFiles[0];

        viewmodel = new Hilo.Picture(file);
    });

    describe("when the underlying thumbnail is present", function () {

        it("should have the same name as the underlying file", function () {
            expect(viewmodel.name).equal(file.name);
        });

        it("should have a url pointing to a blob url", function () {
            expect(viewmodel.url.backgroundUrl).match(/url\(blob:[\dA-F]{8}-[\dA-F]{4}-[\dA-F]{4}-[\dA-F]{4}-[\dA-F]{12}\)/);
        });

    });

    describe("when using the convenience method for contructing a view model", function () {
        beforeEach(function () {
            viewmodel = Hilo.Picture.from(file);
        });

        it("should have the same name as the underlying file", function () {
            expect(viewmodel.name).equal(file.name);
        });

        it("should have a url pointing to a blob url", function () {
            expect(viewmodel.url.backgroundUrl).match(/url\(blob:[\dA-F]{8}-[\dA-F]{4}-[\dA-F]{4}-[\dA-F]{4}-[\dA-F]{12}\)/);
        });
    });

});
