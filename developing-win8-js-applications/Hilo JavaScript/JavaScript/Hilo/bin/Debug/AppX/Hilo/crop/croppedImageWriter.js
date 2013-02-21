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
    var photoOrientation = Windows.Storage.FileProperties.PhotoOrientation;

    // Cropped Image Writer Definition
    // -------------------------------
    var CroppedImageWriter = WinJS.Class.define(

        function CroppedImageWriterConstructor(imageWriter) {
            var self = this;
            this.imageWriter = imageWriter;
            this.imageWriter.addEventListener("errorOpeningSource", function (error) {
                self.dispatchEvent("errorOpeningSource", error);
            });
        },

        {
            // Choose a destination file, then crop the image down to the
            // specified crop selection, saving it to the selected destination.
            crop: function (sourceFile, cropSelection) {
                var self = this;
                return this.imageWriter.pickFile(sourceFile, "Cropped")
                    .then(function (destFile) {
                        if (destFile) {
                            self.saveCroppedImage(sourceFile, destFile, cropSelection);
                            return true;
                        } else {
                            return false;
                        }
                    });

            },

            // Do the actual file cropping and save it to the destination file.
            saveCroppedImage: function (sourceFile, destFile, cropSelection) {

                var self = this,
                    exifOrientation,
                    imageSize;

                var decodeProcessor = function (decoder) {
                    // Get the image size.
                    imageSize = {
                        width: decoder.pixelWidth,
                        height: decoder.pixelHeight
                    };

                    var getOrientation = new WinJS.Promise(function (whenComplete, whenError) {
                        try {
                            var promise = decoder.bitmapProperties.getPropertiesAsync(["System.Photo.Orientation"]);
                            whenComplete(promise);
                        }
                        catch (error) {
                            whenError(error);
                        }
                    });

                    // Get the EXIF orientation (if it's supported).
                    var decoderPromise = getOrientation
                        .then(function (retrievedProps) {

                            // Even though the EXIF properties were returned, 
                            // they still might not include the `System.Photo.Orientation`.
                            // In that case, we will assume that the image is not rotated.
                            exifOrientation = (retrievedProps.size !== 0)
                                ? retrievedProps["System.Photo.Orientation"]
                                : photoOrientation.normal;

                        }, function (error) {
                            // The file format does not support EXIF properties, continue 
                            // without applying EXIF orientation.
                            switch (error.number) {
                                case Hilo.ImageWriter.WINCODEC_ERR_UNSUPPORTEDOPERATION:
                                case Hilo.ImageWriter.WINCODEC_ERR_PROPERTYNOTSUPPORTED:
                                    // The image does not support EXIF orientation, so
                                    // set it to normal. this allows the getRotatedBounds
                                    // to work propertly.
                                    exifOrientation = photoOrientation.normal;
                                    break;
                                default:
                                    throw error;
                            }
                        });

                    return decoderPromise;
                };

                var encodeProcessor = function (encoder) {
                    // Set the bounds (crop position / size) of the encoder, 
                    // so that we only get the crop selection in the final
                    // result.
                    var bounds = self.getRotatedBounds(exifOrientation, imageSize, cropSelection);
                    encoder.bitmapTransform.bounds = bounds;
                };

                this.imageWriter.transFormAndSaveToDestination(sourceFile, destFile, {
                    decodeProcessor: decodeProcessor,
                    encodeProcessor: encodeProcessor
                });
            },

            getRotatedBounds: function (exifOrientation, imageSize, cropSelection) {
                var exifOrientationValue = exifOrientation.value,
                    height, width, degreesRotation;

                if (exifOrientationValue === photoOrientation.rotate270 || exifOrientationValue === photoOrientation.rotate90) {
                    height = imageSize.width;
                    width = imageSize.height;
                    imageSize.width = width;
                    imageSize.height = height;
                }

                degreesRotation = Hilo.EXIFHelpers.convertExifOrientationToDegreesRotation(exifOrientationValue);

                return Hilo.EXIFHelpers.rotateRectClockwise(cropSelection, imageSize, degreesRotation);
            }
        });

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo.Crop", {
        CroppedImageWriter: WinJS.Class.mix(CroppedImageWriter, WinJS.Utilities.eventMixin)
    });

})();
