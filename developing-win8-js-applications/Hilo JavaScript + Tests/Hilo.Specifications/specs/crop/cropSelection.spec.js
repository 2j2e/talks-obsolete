// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

describe("Crop Selection", function () {

    var cropSelection;

    beforeEach(function () {
        // Create the SUT
        cropSelection = new Hilo.Crop.CropSelection();
    });

    describe("when initializing", function () {
        var coords;

        beforeEach(function () {
            coords = cropSelection.getCoords();
        });

        it("should set the starting coordinate to 0,0", function () {
            expect(coords.startX).equals(0);
            expect(coords.startY).equals(0);
        });

        it("should set the ending coordinate to 0,0", function () {
            expect(coords.endX).equals(0);
            expect(coords.endY).equals(0);
        });
    });

    describe("when resetting the crop selection to a canvas size", function () {
        var coords;

        beforeEach(function () {
            cropSelection.reset({
                width: 100,
                height: 200
            });

            coords = cropSelection.getCoords();
        });

        it("should set the starting coordinate to 0,0", function () {
            expect(coords.startX).equals(0);
            expect(coords.startY).equals(0);
        });

        it("should set the ending coordinate to canvasSize.height, canvasSize.width", function () {
            expect(coords.endX).equals(100);
            expect(coords.endY).equals(200);
        });
    });

    describe("when setting any of the coordinate values", function () {
        var moveHandler;

        beforeEach(function () {
            cropSelection.reset({
                width: 100,
                height: 100
            });

            moveHandler = function (args) {
                if (!moveHandler.callCount) {
                    moveHandler.callCount = 0;
                }
                moveHandler.callCount += 1;
                moveHandler.args = args.detail;
            };

            cropSelection.addEventListener("move", moveHandler);

            cropSelection.startX = 1;
            cropSelection.startY = 2;
            cropSelection.endX = 50;
            cropSelection.endY = 60;
        });

        it("should dispatch a 'move' event for each coordinate value set", function () {
            expect(moveHandler.callCount).equals(4);
        });

        it("should include the coordinates in the 'move' event", function () {
            var coords = moveHandler.args.coords;

            expect(coords.startX).equals(1);
            expect(coords.startY).equals(2);
            expect(coords.endX).equals(50);
            expect(coords.endY).equals(60);
        });
    });

    describe("when the rubberband end coords are outside the canvas", function () {
        var moveHandler;

        beforeEach(function () {
            cropSelection.reset({
                width: 600,
                height: 800
            });

            moveHandler = function (args) {
                if (!moveHandler.callCount) {
                    moveHandler.callCount = 0;
                }
                moveHandler.callCount += 1;
                moveHandler.args = args.detail;
            };

            cropSelection.addEventListener("move", moveHandler);

            cropSelection.startX = -50;
            cropSelection.startY = -50;
            cropSelection.endX = 3000;
            cropSelection.endY = 4000;
        });

        it("should reset the crop selection startx to the left canvas edge", function () {
            expect(cropSelection.startX).equals(0);
        });

        it("should reset the crop selection starty to the top canvas edge", function () {
            expect(cropSelection.startY).equals(0);
        });
        it("should reset the crop selection width to the right canvas edge", function () {
            expect(cropSelection.endX).equals(600);
        });

        it("should reset the crop selection height to the bottom canvas edge", function () {
            expect(cropSelection.endY).equals(800);
        });
    });

    describe("when the rubberband end coords are less than 30x30, moving the end point", function () {
        var moveHandler;

        beforeEach(function () {
            cropSelection.reset({
                width: 600,
                height: 800
            });

            moveHandler = function (args) {
                if (!moveHandler.callCount) {
                    moveHandler.callCount = 0;
                }
                moveHandler.callCount += 1;
                moveHandler.args = args.detail;
            };

            cropSelection.addEventListener("move", moveHandler);

            cropSelection.startX = 10;
            cropSelection.startY = 10;
            cropSelection.endX = 20;
            cropSelection.endY = 20;
        });

        it("should leave the startx where it is", function () {
            expect(cropSelection.startX).equals(10);
        });

        it("should leave the starty where it is", function () {
            expect(cropSelection.startY).equals(10);
        });

        it("should reset the endx to startx + minwidth", function () {
            expect(cropSelection.endX).equals(50);
        });

        it("should reset the endy to starty + minheight", function () {
            expect(cropSelection.endY).equals(50);
        });
    });

    describe("when the rubberband end coords are less than 30x30, moving the start point", function () {
        var moveHandler;

        beforeEach(function () {
            cropSelection.reset({
                width: 600,
                height: 800
            });

            moveHandler = function (args) {
                if (!moveHandler.callCount) {
                    moveHandler.callCount = 0;
                }
                moveHandler.callCount += 1;
                moveHandler.args = args.detail;
            };

            cropSelection.addEventListener("move", moveHandler);

            cropSelection.endX = 50;
            cropSelection.endY = 50;
            cropSelection.startX = 40;
            cropSelection.startY = 40;
        });

        it("should leave the endx where it is", function () {
            expect(cropSelection.endX).equals(50);
        });

        it("should leave the endy where it is", function () {
            expect(cropSelection.endY).equals(50);
        });

        it("should reset the startx to endx - minwidth", function () {
            expect(cropSelection.startX).equals(10);
        });

        it("should reset the starty to endy - minheight", function () {
            expect(cropSelection.startY).equals(10);
        });
    });
});
