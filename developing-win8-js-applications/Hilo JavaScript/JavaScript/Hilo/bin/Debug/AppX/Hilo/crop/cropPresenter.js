// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  that code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

(function () {
    "use strict";

    // Crop Presenter Definition
    // --------------------------

    var CropPresenter = WinJS.Class.define(

        function CropPresenterConstructor(image, imageView, imageWriter, appBarPresenter) {
            this.image = image;
            this.imageView = imageView;
            this.imageWriter = imageWriter;
            this.appBarPresenter = appBarPresenter;
        },

        {
            // Register event listeners for all of the app bar buttons.
            start: function () {
                this.appBarPresenter.addEventListener("cancel", this.cancel.bind(this));
                this.appBarPresenter.addEventListener("save", this.saveImageAs.bind(this));
                this.appBarPresenter.addEventListener("unsnap", this.unSnapView.bind(this));

                this.imageView.addEventListener("preview", this.cropImage.bind(this));
            },

            cropImage: function () {
                var dataUrl = this.imageView.cropImage();
                this.dispatchEvent("imagePreview", {
                    dataUrl: dataUrl
                });
            },

            unSnapView: function () {
                Windows.UI.ViewManagement.ApplicationView.tryUnsnap();
            },

            saveImageAs: function () {
                var self = this;
                var storageFile = this.image.getStorageFile();
                var selectionRectScaledToImage = this.imageView.getScaledSelectionRectangle();

                this.imageWriter.addEventListener("errorOpeningSourceFile", function (error) {
                    WinJS.Navigation.back();
                });

                this.imageWriter
                    .crop(storageFile, selectionRectScaledToImage)
                    .then(function (success) {
                        if (success) {
                            self.dispatchEvent("imageSaved", {});
                        }
                    });
            },

            cancel: function () {
                WinJS.Navigation.back();
            }
        });

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo.Crop", {
        CropPresenter: WinJS.Class.mix(CropPresenter, WinJS.Utilities.eventMixin)
    });

})();
