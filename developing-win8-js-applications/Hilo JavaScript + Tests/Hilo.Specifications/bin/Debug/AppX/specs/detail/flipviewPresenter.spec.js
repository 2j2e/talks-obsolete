// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

describe("Detail Page, Flipview Presenter", function () {

    var flipviewPresenter, el;

    beforeEach(function () {
        el = new Specs.WinControlStub();

        flipviewPresenter = new Hilo.Detail.FlipviewPresenter(el);
    });

    describe("when an image has been selected", function () {
        var imageIndex = 3;

        beforeEach(function () {
            flipviewPresenter.showImageAt(imageIndex);
        });

        it("should show the image by its index", function () {
            expect(el.winControl.currentPage).equals(imageIndex);
        });
    });

});
