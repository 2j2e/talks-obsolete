// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    var scaleResolution = 0.60;

    // Rotate Presenter Definition
    // ---------------------------

    var RotatePresenter = WinJS.Class.define(

        function RotatePresenterConstructor(el, appBarPresenter, fileLoader, expectedFileName, touchProvider, navigation) {
            this.el = el;
            this.appBarPresenter = appBarPresenter;
            this.fileLoader = fileLoader;
            this.expectedFileName = expectedFileName;
            this.navigation = navigation || WinJS.Navigation;
            this.touchProvider = touchProvider;

            this.rotationDegrees = 0;

            Hilo.bindFunctionsTo(this, [
                "rotateImage",
                "_rotateImage",
                "_rotateImageWithoutTransition",
                "saveImage",
                "cancel",
                "unsnap"
            ]);

            touchProvider.setRotation = this._rotateImageWithoutTransition;
            touchProvider.animateRotation = this._rotateImage;
        },

        {
            start: function () {
                this._bindToEvents();
                return this.fileLoader.then(this._loadAndShowImage.bind(this));
            },

            dispose: function () {
                this._unbindEvents();

                if (this.hiloPicture) {
                    this.hiloPicture.dispose();
                }

                this.el = null;
                this.hiloPicture = null;
                this.appBarPresenter = null;
                this.fileLoader = null;
                this.expectedFileName = null;
                this.navigation = null;
            },

            // A rotation button was clicked on the app bar presenter.
            // Take the rotation degrees specified and add it to the current
            // image rotation. 
            rotateImage: function (args) {
                var rotateDegrees = args.detail.rotateDegrees;
                this._rotateImage(rotateDegrees);
            },

            // Save was clicked from the appbar presenter. 
            // Call out to the rotate image writer to pick a destination file and save it.
            saveImage: function () {
                var self = this;
                var imageWriter = new Hilo.ImageWriter();
                var rotateImageWriter = new Hilo.Rotate.RotatedImageWriter(imageWriter);
                rotateImageWriter.addEventListener("errorOpeningSourceFile", function (error) {
                    self.navigation.back();
                });

                rotateImageWriter
                    .rotate(this.hiloPicture.storageFile, this.rotationDegrees)
                    .then(function (success) {
                        if (success) {
                            self.navigation.back();
                        }
                    });
            },

            cancel: function () {
                this.navigation.back();
            },

            unsnap: function () {
                Windows.UI.ViewManagement.ApplicationView.tryUnsnap();
            },

            // Internal method.
            // Bind to the appbar presenter's events, to handle the button clicks.
            _bindToEvents: function () {
                this.appBarPresenter.addEventListener("rotate", this.rotateImage);
                this.appBarPresenter.addEventListener("save", this.saveImage);
                this.appBarPresenter.addEventListener("cancel", this.cancel);
                this.appBarPresenter.addEventListener("unsnap", this.unsnap);
            },

            _unbindEvents: function () {
                this.appBarPresenter.removeEventListener("rotate", this.rotateImage);
                this.appBarPresenter.removeEventListener("save", this.saveImage);
                this.appBarPresenter.removeEventListener("cancel", this.cancel);
                this.appBarPresenter.removeEventListener("unsnap", this.unsnap);
            },

            // Internal method.
            // Take the query result from the image query and display the image that it loaded.
            _loadAndShowImage: function (queryResult) {
                var self = this;

                if (queryResult.length === 0) {
                    this.navigation.back();

                } else {

                    var storageFile = queryResult[0].storageFile;

                    if (storageFile.name !== this.expectedFileName) {
                        this.navigation.back();

                    } else {

                        this.hiloPicture = new Hilo.Picture(storageFile);
                        this.el.src = this.hiloPicture.src.url;

                        return storageFile.properties
                            .getImagePropertiesAsync()
                            .then(function (props) {
                                self.imageProperties = props;
                                self.adjustImageSize();
                            });
                    }
                }
            },

            // Internal method
            // Sets the CSS rotation of the image element. A CSS transition has also
            // been defined in the CSS file so that the image will turn instead of just 
            // appearing in the new orientation suddenly.
            _rotateImage: function (rotateDegrees) {
                if (rotateDegrees) {
                    this.rotationDegrees += rotateDegrees;
                }

                // Build a [CSS transform][1] to rotate the image by the specified
                // number of degrees and apply it to the image.
                //
                // [1]: http://msdn.microsoft.com/en-us/library/windows/apps/ff974936.aspx

                var rotation = "rotate(" + this.rotationDegrees + "deg)";
                this.el.className = "rotatable";
                this.el.style.transform = rotation;

                this.appBarPresenter._enableButtons();

                this.adjustImageSize();
            },

            _rotateImageWithoutTransition: function (adjustment) {
                var degrees = this.rotationDegrees + adjustment;
                var rotation = "rotate(" + degrees + "deg)";
                this.el.className = "";
                this.el.style.transform = rotation;
            },

            adjustImageSize: function () {
                var maxHeight, maxWidth;

                var screenSize = Math.min(window.innerHeight, window.innerWidth),
                    imageSize = Math.max(this.imageProperties.height, this.imageProperties.width),
                    scale = screenSize / imageSize,
                    height = this.imageProperties.height * scale,
                    width = this.imageProperties.width * scale;

                maxHeight = height * scaleResolution;
                maxWidth = width * scaleResolution;

                var style = this.el.style;
                style.height = maxHeight + "px";
                style.width = maxWidth + "px";
            }
        });

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo.Rotate", {
        RotatePresenter: WinJS.Class.mix(RotatePresenter, WinJS.Utilities.eventMixin)
    });

})();