// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

describe("Crop Selection Controller", function () {

    function setupDOMElements() {
        var frag = document.createDocumentFragment();
        frag.appendChild(document.createElement("canvas"));

        canvasEl = frag.querySelector("canvas");

        cropSelectionEl = document.createElement("div");
        cropSelectionEl.id = "cropSelection";
        frag.appendChild(cropSelectionEl);

        addHandle("topLeft", cropSelectionEl);
        addHandle("topRight", cropSelectionEl);
        addHandle("bottomLeft", cropSelectionEl);
        addHandle("bottomRight", cropSelectionEl);
        addHandle("topMiddle", cropSelectionEl);
        addHandle("bottomMiddle", cropSelectionEl);
        addHandle("rightMiddle", cropSelectionEl);
        addHandle("leftMiddle", cropSelectionEl);
    }

    function addHandle(id, cropSelectionEl) {
        var handle = document.createElement("div");
        handle.id = id;
        cropSelectionEl.appendChild(handle);
    }

    var controller, canvasEl, cropSelectionEl, cropSelection;

    beforeEach(function () {
        setupDOMElements();
        cropSelection = new Specs.EventStub();

        controller = new Hilo.Crop.CropSelectionController(cropSelection, canvasEl, cropSelectionEl);
    });

    describe("when a corner is moved", function () {

        beforeEach(function () {
            var position = Hilo.Crop.CropSelectionCorner.position.topLeft;
            var corner = controller.corners[position];
            controller.startCornerMove({ detail: { corner: corner } });

            controller.cornerMove({ detail: { coords: { x: 1, y: 2 } } });
        });

        it("should update the crop selection coordinates", function () {
            expect(cropSelection.startX).equals(1);
            expect(cropSelection.startY).equals(2);
        });

    });

});
