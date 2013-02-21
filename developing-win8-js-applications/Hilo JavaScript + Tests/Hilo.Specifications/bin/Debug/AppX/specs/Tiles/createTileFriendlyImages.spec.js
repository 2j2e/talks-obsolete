// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

describe("Live Tiles", function () {

    describe("when updating the tile", function () {

        var filesNames;

        before(function (done) {
            // Note that this is a `before` block and not a `beforeEach`.
            // This is because we only need to copy the thumbnails once
            // for the entire set of assertions.
            // If we were to copy the files in a `beforeEach`, the tests
            // would run slower and we would risk creation collisions.
            Shared.getImages()
                .then(Hilo.Tiles.createTileFriendlyImages)
                .then(function (result) {
                    filesNames = result;
                })
                .then(done);
        });

        // For official specifications on tile image sizes, see:
        // http://msdn.microsoft.com/en-us/library/windows/apps/Hh781198.aspx
        it("should create thumbnails equal to or less than 1024 x 1024", function (done) {

            var all = filesNames.map(function (file) {
                return Shared.getThumbnailSize(file).then(function (size) {
                    expect(size.height).lessThan(1025, "height of " + file);
                    expect(size.width).lessThan(1025, "width of " + file);
                });
            });

            Shared.join(all).then(done);
        });

        it("should add .jpg extensions to all files", function () {
            // If our test data does not contain extensions other than .jpg,
            // then this test will not be meaningful.

            var pattern = /.*\.jpg$/;

            var all = filesNames.map(function (file) {
                expect(file.match(pattern), file + " did not end with .jpg").not.null;
            });

        });

    });

});
