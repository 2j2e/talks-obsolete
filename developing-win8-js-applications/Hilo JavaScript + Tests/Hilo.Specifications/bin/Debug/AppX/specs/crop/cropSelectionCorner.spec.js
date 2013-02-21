// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

describe("Crop Selection Corner Model", function () {

    var corner;

    describe("when mouse down", function () {
        var handler;

        beforeEach(function () {
            var frag = document.createDocumentFragment();
            var el = document.createElement("div");
            frag.appendChild(el);
            el = frag.querySelector("div");

            var position = Hilo.Crop.CropSelectionCorner.position.topLeft;

            handler = function () {
                handler.wasCalled = true;
            }

            corner = new Hilo.Crop.CropSelectionCorner(window, el, position);
            corner.addEventListener("start", handler);

            corner.mouseDown({
                preventDefault: function () { }
            });
        });

        it("should dispatch a 'start' event", function () {
            expect(handler.wasCalled).equals(true);
        });
    });

    describe("when mouse is down and then released", function () {
        var handler;

        beforeEach(function () {
            var el = document.createElement("div");
            var position = Hilo.Crop.CropSelectionCorner.position.topLeft;

            handler = function () {
                handler.wasCalled = true;
            }

            corner = new Hilo.Crop.CropSelectionCorner(window, el, position);
            corner.addEventListener("stop", handler);

            corner.mouseUp({
                preventDefault: function () { }
            });
        });

        it("should dispatch a 'stop' event", function () {
            expect(handler.wasCalled).equals(true);
        });
    });

    describe("when mouse is down and then moved", function () {
        var handler;

        beforeEach(function () {
            var el = document.createElement("div");
            var position = Hilo.Crop.CropSelectionCorner.position.topLeft;

            handler = function (args) {
                handler.wasCalled = true;
                handler.coords = args.detail.coords;
            }

            corner = new Hilo.Crop.CropSelectionCorner(window, el, position);
            corner.addEventListener("move", handler);

            corner.mouseDown({ preventDefault: function () { } });
            corner.mouseMove({ preventDefault: function () { }, clientX: 1, clientY: 2 });
        });

        it("should dispatch a 'move' event", function () {
            expect(handler.wasCalled).equals(true);
        });

        it("should include the new mouse coords with the 'move' event", function () {
            expect(handler.coords.x).equals(1);
            expect(handler.coords.y).equals(2);
        });
    });

    describe("when a corner is top left and asked to for a coordinate", function () {
        var coords;

        beforeEach(function () {
            var el = document.createElement("div");

            var position = Hilo.Crop.CropSelectionCorner.position.topLeft;
            corner = new Hilo.Crop.CropSelectionCorner(window, el, position);

            coords = corner.getUpdatedCoords({ x: 1, y: 1 });
        });

        it("should return startx value", function () {
            expect(coords.hasOwnProperty("startX")).equals(true);
        });

        it("should return starty value", function () {
            expect(coords.hasOwnProperty("startY")).equals(true);
        });
    });

    describe("when a corner is top right and asked to for a coordinate", function () {
        var coords;

        beforeEach(function () {
            var el = document.createElement("div");

            var position = Hilo.Crop.CropSelectionCorner.position.topRight;
            corner = new Hilo.Crop.CropSelectionCorner(window, el, position);

            coords = corner.getUpdatedCoords({ x: 1, y: 1 });
        });

        it("should return endx value", function () {
            expect(coords.hasOwnProperty("endX")).equals(true);
        });

        it("should return starty value", function () {
            expect(coords.hasOwnProperty("startY")).equals(true);
        });
    });

    describe("when a corner is bottom right and asked to for a coordinate", function () {
        var coords;

        beforeEach(function () {
            var el = document.createElement("div");

            var position = Hilo.Crop.CropSelectionCorner.position.bottomRight;
            corner = new Hilo.Crop.CropSelectionCorner(window, el, position);

            coords = corner.getUpdatedCoords({ x: 1, y: 1 });
        });

        it("should return endx value", function () {
            expect(coords.hasOwnProperty("endX")).equals(true);
        });

        it("should return endy value", function () {
            expect(coords.hasOwnProperty("endY")).equals(true);
        });
    });

    describe("when a corner is bottom left and asked to for a coordinate", function () {
        var coords;

        beforeEach(function () {
            var el = document.createElement("div");

            var position = Hilo.Crop.CropSelectionCorner.position.bottomLeft;
            corner = new Hilo.Crop.CropSelectionCorner(window, el, position);

            coords = corner.getUpdatedCoords({ x: 1, y: 1 });
        });

        it("should return startx value", function () {
            expect(coords.hasOwnProperty("startX")).equals(true);
        });

        it("should return endy value", function () {
            expect(coords.hasOwnProperty("endY")).equals(true);
        });
    });

});
