// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

describe("Hilo AppBar Control Presenter", function () {

    var presenter, el, crop, rotate, nav;

    beforeEach(function () {
        nav = {
            navigate: function () {
                nav.navigate.args = arguments;
                nav.navigate.wasCalled = true;
            }
        };

        crop = new Specs.WinControlStub();
        rotate = new Specs.WinControlStub();

        el = {
            winControl: {
                show: function () { },
                hide: function () { }
            },
            querySelector: function (selector) {
                if (selector === "#rotate") {
                    return rotate;
                } else {
                    return crop;
                }
            }
        };

        presenter = new Hilo.Controls.HiloAppBar.HiloAppBarPresenter(el, nav);
    });

    describe("given an image is selected, when clicking crop", function () {
        var cropTriggered;

        beforeEach(function () {
            presenter.setNavigationOptions({ itemIndex: 1, query: {}, itemName: "some.jpg", picture: {} });
            crop.dispatchEvent("click");
        });

        it("should navigate to the crop page", function () {
            expect(nav.navigate.args[0]).equals("/Hilo/crop/crop.html");
        });

        it("should include the selected image index in the navigation args", function () {
            expect(nav.navigate.args[1].itemIndex).equals(1);
        });

        it("should include the query to pull the image from", function () {
            var args = nav.navigate.args[1];
            expect(args.hasOwnProperty("query")).true;
        });

        it("should include the file name it expects the item index to match in the query", function () {
            var args = nav.navigate.args[1];
            expect(args.hasOwnProperty("itemName")).true;
        });
    });

    describe("given an image is selected, when clicking rotate", function () {
        var cropTriggered;

        beforeEach(function () {
            presenter.setNavigationOptions({ itemIndex: 2, query: {}, itemName: "some.jpg", picture: {} });
            rotate.dispatchEvent("click");
        });

        it("should navigate to the crop page", function () {
            expect(nav.navigate.args[0]).equals("/Hilo/rotate/rotate.html");
        });

        it("should include the selected image index in the navigation args", function () {
            expect(nav.navigate.args[1].itemIndex).equals(2);
        });

        it("should include the query to pull the image from", function () {
            var args = nav.navigate.args[1];
            expect(args.hasOwnProperty("query")).true;
        });
    });

    describe("when an image is selected", function () {
        var isShown;

        beforeEach(function () {
            isShown = false;
        });

        describe("and the option to show the appbar is provided", function () {

            beforeEach(function () {
                el.winControl.show = function () { isShown = true; };
                presenter.setNavigationOptions({ itemIndex: 1, query: {}, itemName: "some.jpg", picture: {} }, true);
            });

            it("should show the appbar", function () {
                expect(isShown).equal(true);
            });

        });

        describe("and the option to show the appbar is not provided", function () {

            beforeEach(function () {
                el.winControl.show = function () { isShown = true; };
                presenter.setNavigationOptions({ itemIndex: 1, query: {}, itemName: "some.jpg", picture: {} });
            });

            it("should show not attempt to show the appbar", function () {
                expect(isShown).equal(false);
            });

        });
    });

    describe("when an image selection is cleared", function () {

        var isHidden;

        beforeEach(function () {
            isHidden = false;
        });

        describe("and the option to hide the appbar is provided", function () {

            beforeEach(function () {
                el.winControl.hide = function () { isHidden = true; };
                presenter.clearNavigationOptions(true);
            });

            it("should show the appbar", function () {
                expect(isHidden).equal(true);
            });

        });

        describe("and the option to hide the appbar is not provided", function () {

            beforeEach(function () {
                el.winControl.hide = function () { isHidden = true; };
                presenter.clearNavigationOptions();
            });

            it("should show not attempt to hide the appbar", function () {
                expect(isHidden).equal(false);
            });

        });
    });
});
