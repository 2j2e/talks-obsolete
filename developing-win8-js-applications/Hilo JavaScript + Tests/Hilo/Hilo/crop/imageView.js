// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // Imports And Constants
    // ---------------------

    var scaleResolution = 0.7;

    // Image View Definition
    // -----------------------
    var ImageView = WinJS.Class.define(

        function ImageViewConstructor(image, cropSelection, canvasEl, imageEl) {
            var self = this;

            this.cropSelection = cropSelection;
            this.canvasEl = canvasEl;
            this.imageEl = imageEl;
            this.canvasSize = canvasEl.getBoundingClientRect();
            this.context = canvasEl.getContext("2d");
            this.image = image;

            image.addEventListener("sizeUpdated", this.run.bind(this));
            image.addEventListener("urlUpdated", this.drawImage.bind(this));
            image.addEventListener("dataUrlUpdated", function (args) {
                self.loadImage(args.detail.url);
            });

            canvasEl.addEventListener("click", this.click.bind(this));

            //this.loadImage(image.dataUrl);
        },

        {
            click: function () {
                this.dispatchEvent("preview", {});
            },

            run: function () {
                this.imageToScreenScale = this.calculateScaleToScreen(this.image.imageSize);
                var imageRect = this.sizeToRect(this.image.imageSize);
                this.tooSmallTooCrop = (imageRect.height < 10 || imageRect.width < 10);
                this.drawImageSelectionToScale(imageRect, this.imageToScreenScale);
                this.drawImage();
            },

            drawImage: function () {
                if (!this.image) { return; }

                var imageHeight = Math.max(this.imageSubset.endY - this.imageSubset.startY, 1);
                var imageWidth = Math.max(this.imageSubset.endX - this.imageSubset.startX, 1);

                this.context.drawImage(
                    this.imageToPaint,

                    // Cropped area of the image to draw.
                    this.imageSubset.startX, this.imageSubset.startY, imageWidth, imageHeight,

                    // Scale the cropped area in to the entire canvas.
                    0, 0, this.canvasSize.width, this.canvasSize.height
                );
            },

            reset: function (scaledImageCoordinates) {
                this.canvasSize = this.canvasEl.getBoundingClientRect();
                this.setImageSubset(scaledImageCoordinates);

                // Build a DOM image object that the canvas can paint.
                this.imageToPaint = new Image();
                this.imageToPaint.onload = this.drawImage.bind(this);
                this.imageToPaint.src = this.image.url;
            },

            // Calculate the selected area of the original image by scaling
            // the canvas based selection out to the original image.
            getScaledSelectionRectangle: function () {
                var coords = this.cropSelection.getCoords();
                return this.scaleCanvasRectToImage(this.imageToScreenScale, coords, this.image.offset);
            },

            cropImage: function () {
                var selectionRectScaledToImage = this.getScaledSelectionRectangle();
                // Reset image scale so that it reflects the difference between
                // the current canvas size (the crop selection) and the original 
                // image size, then re-draw everything at that new scale.
                this.imageToScreenScale = this.calculateScaleToScreen(selectionRectScaledToImage);
                this.drawImageSelectionToScale(selectionRectScaledToImage, this.imageToScreenScale);

                // Remember the starting location of the crop on the original image
                // and not relative to the canvas size, so that cropping multiple times
                // will correctly crop to what has been visually selected.
                this.image.updateOffset({ x: selectionRectScaledToImage.startX, y: selectionRectScaledToImage.startY });

                return this.canvasEl.toDataURL();
            },

            // Take a rectangle that was based on a scaled canvas size
            // and scale the rect up to the real image size, accounting
            // for the offset of the rectangle location.
            scaleCanvasRectToImage: function (imageToScreenScale, canvasCoords, offset) {
                var startX = Math.round(canvasCoords.startX / imageToScreenScale),
                    startY = Math.round(canvasCoords.startY / imageToScreenScale),
                    endX = Math.round(canvasCoords.endX / imageToScreenScale),
                    endY = Math.round(canvasCoords.endY / imageToScreenScale),
                    height = Math.max(endY - startY, 1),
                    width = Math.max(endX - startX, 1);

                return {
                    startX: startX + offset.x,
                    startY: startY + offset.y,
                    endX: endX + offset.x,
                    endY: endY + offset.y,
                    height: height,
                    width: width
                };
            },

            // Convert a size (height/width) in to a rect.
            sizeToRect: function (size) {
                return {
                    height: size.height,
                    width: size.width,
                    startX: 0,
                    startY: 0,
                    endX: size.width,
                    endY: size.height
                };
            },

            // Take a given size (height and width) and
            // calculate the scale that will correctly
            // re-size it to fit the available display
            // area of the screen.
            calculateScaleToScreen: function (size) {
                var heightScale = (window.innerHeight / size.height) * scaleResolution,
                    widthScale = (window.innerWidth / size.width) * scaleResolution;

                return Math.min(heightScale, widthScale);
            },

            // Calculate the canvas size, according to the scale, using
            // the crop selection rectangle
            drawImageSelectionToScale: function (cropRect, imageToScreenScale) {
                var canvasSize = this.calculateSizeFromScale(cropRect, imageToScreenScale);
                this.resizeCanvas(canvasSize);

                // Reset and re-draw all of the controllers and presenters.
                this.reset(cropRect);
                this.cropSelection.reset(canvasSize);

                // Draw the background image once everything is set up.
                this.drawImage();
            },

            // Calculate the final size by multiplying the original
            // size by a specified scale
            calculateSizeFromScale: function (originalSize, scale) {
                var height = originalSize.height * scale;
                var width = originalSize.width * scale;

                return {
                    height: height,
                    width: width
                };
            },

            loadImage: function (imageUrl) {
                this.imageEl.src = imageUrl;
            },

            setImageSubset: function (imageCoords) {
                this.imageSubset = imageCoords;
                this.tooSmallTooCrop = (this.imageSubset.height < 10 || this.imageSubset.width < 10);
            },

            // Change the size of the specified canvas element to the calculated
            // size and return the new size.
            resizeCanvas: function (canvasSize) {
                this.canvasEl.height = canvasSize.height;
                this.canvasEl.width = canvasSize.width;
            },

            getBoundingClientRect: function () {
                return this.canvasEl.getBoundingClientRect();
            }
        });

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo.Crop", {
        ImageView: WinJS.Class.mix(ImageView, WinJS.Utilities.eventMixin)
    });

})();
