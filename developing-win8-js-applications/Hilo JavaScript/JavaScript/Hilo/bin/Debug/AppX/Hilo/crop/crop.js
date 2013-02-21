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

    // Page Control
    // ------------

    Hilo.controls.pages.define("crop", {

        ready: function (element, pageOptions) {
            var self = this;
            WinJS.Application.addEventListener("Hilo:ContentsChanged", Hilo.navigator.reload);

            var imageQuery = pageOptions.query.execute(pageOptions.itemIndex),
                image = new Hilo.Crop.Image(imageQuery, pageOptions.dataUrl, pageOptions.itemName, pageOptions.offset);

            image.addEventListener("imageNotLoaded", function () { WinJS.Navigation.back(); });

            // Wait for the image to load so we can get the correct URL
            // and display it in the crop area.
            image.addEventListener("urlUpdated", function () {
                self.setupImageView(image, pageOptions.cropSelectionCoords);
                self.cropPresenter = self.setupCropPresenter(image);
                self.cropPresenter.start();
            });

        },

        setupImageView: function (image, cropSelectionCoords) {
            var self = this;

            // Get the needed elements from the DOM.
            var canvasEl = document.querySelector("#cropSurface"),
                cropSelectionEl = document.querySelector("#cropSelection"),
                imageEl = document.querySelector("#image");

            // Build the crop selection and related items.
            this.cropSelection = new Hilo.Crop.CropSelection(cropSelectionCoords);
            this.imageView = new Hilo.Crop.ImageView(image, this.cropSelection, canvasEl, imageEl);
            this.cropSelectionView = new Hilo.Crop.CropSelectionView(this.cropSelection, canvasEl, cropSelectionEl);
            this.cropSelectionController = new Hilo.Crop.CropSelectionController(this.cropSelection, this.imageView, cropSelectionEl);


            // When the crop selection has moved, update the image view and crop selection view.
            this.cropSelection.addEventListener("move", function (args) {
                self.imageView.drawImage();
                self.cropSelectionView.cropSelectionMove(args);
            });
        },

        // Build an instance of the crop presenter to manage the workflow of the crop page.
        setupCropPresenter: function (image) {
            // Set up the dependencies.
            var appBarEl = document.querySelector("#appbar"),
                imageWriter = new Hilo.ImageWriter(),
                cropImageWriter = new Hilo.Crop.CroppedImageWriter(imageWriter),
                appBarPresenter = new Hilo.Crop.AppBarPresenter(appBarEl);

            // Set up the crop presenter.
            var cropPresenter = new Hilo.Crop.CropPresenter(image, this.imageView, cropImageWriter, appBarPresenter);

            // After the cropped image has been saved, go back to the previous page.
            cropPresenter.addEventListener("imageSaved", function () {
                WinJS.Navigation.back();
            });

            // Store the cropped image data in the "Image" so that it can
            // be used as the "preview" when the page is snapped.
            cropPresenter.addEventListener("imagePreview", function (args) {
                var dataUrl = args.detail.dataUrl;
                image.setDataUrl(dataUrl);
            });

            return cropPresenter;
        },

        updateLayout: function (element, viewState, lastViewState) {
            if (viewState === Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                this.cropSelectionView.reset();
                this.imageView.drawImage();
                this.cropSelectionView.draw(this.cropSelection.getCoords());
                this.cropSelectionController.reset();
            } else {
                this.cropPresenter.cropImage();
            }

        },

        // Unbind the events we've attached to and clear any image URL
        // cache that we've built in order to free up memory use.
        unload: function () {
            WinJS.Application.removeEventListener("Hilo:ContentsChanged", Hilo.navigator.reload);
            Hilo.UrlCache.clearAll();
        },

        // Tell the page not to animate any of the elements. The animations
        // throw off the calculations for the crop selection points and cause
        // them to be incorrectly offset.
        getAnimationElements: function () {
            return [];
        }
    });

}());
