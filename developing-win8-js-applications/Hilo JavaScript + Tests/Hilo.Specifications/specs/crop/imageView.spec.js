// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

describe("Crop Page Image View", function () {

    var view, image, cropSelection, canvasEl, imageEl;

    function setupDOMElements() {
        var frag = document.createDocumentFragment();
        frag.appendChild(document.createElement("canvas"));

        var img = document.createElement("img");
        frag.appendChild(img);

        canvasEl = frag.querySelector("canvas");
        imageEl = img;
    }

    beforeEach(function () {
        setupDOMElements();

        image = new Specs.EventStub();
        cropSelection = new Specs.EventStub();
    });

    describe("when initializing", function () {
        var drawImageStub;

        beforeEach(function (done) {

            drawImageStub = function () {
                drawImageStub.wasCalled = true;
                done();
            };

            this.original_drawImage = Hilo.Crop.ImageView.prototype.drawImage;
            Hilo.Crop.ImageView.prototype.drawImage = drawImageStub;

            view = new Hilo.Crop.ImageView(image, cropSelection, canvasEl, imageEl);

            image.dispatchEvent("urlUpdated");
        });

        afterEach(function () {
            Hilo.Crop.ImageView.prototype.drawImage = this.original_drawImage;
        });

        it("should show the picture", function () {
            expect(drawImageStub.wasCalled).equals(true);
        });
    });

});
