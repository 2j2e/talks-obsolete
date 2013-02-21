// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

describe("Crop Selection View", function () {

    var canvasEl, cropSelectionEl, cropSelection, cropSelectionView;

    function setupDOMElements() {
        var frag = document.createDocumentFragment();
        frag.appendChild(document.createElement("canvas"));

        canvasEl = frag.querySelector("canvas");

        cropSelectionEl = document.createElement("div");
        cropSelectionEl.id = "cropSelection";
        frag.appendChild(cropSelectionEl);

        var topLeft = document.createElement("div");
        topLeft.id = "topLeft";
        cropSelectionEl.appendChild(topLeft);

        var topRight = document.createElement("div");
        topRight.id = "topRight";
        cropSelectionEl.appendChild(topRight);

        var bottomLeft = document.createElement("div");
        bottomLeft.id = "bottomLeft";
        cropSelectionEl.appendChild(bottomLeft);

        var bottomRight = document.createElement("div");
        bottomRight.id = "bottomRight";
        cropSelectionEl.appendChild(bottomRight);
    }

    beforeEach(function () {
        setupDOMElements();
        var canvasSize = canvasEl.getBoundingClientRect();
        cropSelection = new Hilo.Crop.CropSelection({
            startX: 10,
            startY: 10,
            endX: 60,
            endY: 60
        });

        cropSelectionView = new Hilo.Crop.CropSelectionView(cropSelection, canvasEl, cropSelectionEl);
    });

    describe("when drawing the crop selection", function () {
        var cropSelectionCoords;

        beforeEach(function () {
            cropSelectionCoords = cropSelection.getCoords();

            cropSelectionView.draw(cropSelectionCoords);
        });

        it("should move the cropSelectionEl to the cropSelection's coordinates", function () {
            var style = cropSelectionEl.style;

            expect(style.top).equals(cropSelectionCoords.startX + "px");
            expect(style.left).equals(cropSelectionCoords.startY + "px");
            expect(style.width).equals((cropSelectionCoords.endX - cropSelectionCoords.startX) + "px");
            expect(style.height).equals((cropSelectionCoords.endY - cropSelectionCoords.startY) + "px");
        });
    });

});
