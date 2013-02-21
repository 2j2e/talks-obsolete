// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

describe("Detail Page, Filmstrip Presenter", function () {

    var filmstripPresenter, el;

    beforeEach(function () {
        el = new Specs.WinControlStub();
        filmstripPresenter = new Hilo.Detail.FilmstripPresenter(el);
    });

    describe("when invoking a thumbnail", function () {
        var handler = function (args) {
            handler.wasCalled = true;
            handler.args = args.detail;
        }

        beforeEach(function () {
            filmstripPresenter.addEventListener("imageInvoked", handler);

            el.winControl.dispatchEvent("iteminvoked", {
                itemIndex: 1
            });
        });

        it("should trigger an imageInvoked event", function () {
            expect(handler.wasCalled).true;
        });

        it("should tell me the index of the clicked item", function () {
            expect(handler.args.itemIndex).equals(1);
        });
    });

});
