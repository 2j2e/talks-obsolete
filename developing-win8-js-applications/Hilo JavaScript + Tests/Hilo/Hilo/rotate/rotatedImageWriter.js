// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // Rotated Image Writer Definition
    // -------------------------------

    var RotatedImageWriter = WinJS.Class.define(

            function RotatedImageWriterConstructor(imageWriter) {
                var self = this;
                this.imageWriter = imageWriter;
                this.imageWriter.addEventListener("errorOpeningSource", function (error) {
                    self.dispatchEvent("errorOpeningSource", error);
                });
            },

            {
                // Pick a file to save the rotated version to, then save it.
                rotate: function (sourceFile, degrees) {
                    var self = this;
                    return this.imageWriter.pickFile(sourceFile, "Rotated")
                        .then(function (destFile) {
                            if (destFile) {
                                self.saveRotatedImage(sourceFile, destFile, degrees);
                                return true;
                            } else {
                                return false;
                            }
                        });
                },

                // Rotate an image to the specified degrees.
                saveRotatedImage: function (sourceFile, destFile, degrees) {

                    // Keep data in-scope across multiple asynchronous methods.
                    var self = this,
                        originalRotation,
                        useEXIFOrientation;

                    var decodeProcessor = function (decoder) {

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

                                // Since an exception was not thrown when we invoked 
                                // `getPropertiesAsync`, we know that EXIF was found.
                                useEXIFOrientation = true;

                                if (retrievedProps.size !== 0) {
                                    // Even though the EXIF properties were returned, 
                                    // they still might not include the `System.Photo.Orientation`.
                                    // In that case, we will assume that the image is not rotated.
                                    var exifRotation = retrievedProps.lookup("System.Photo.Orientation");
                                    originalRotation = Hilo.EXIFHelpers.convertExifOrientationToDegreesRotation(exifRotation.value);
                                } else {
                                    originalRotation = 0;
                                }

                            }, function (error) {
                                // The file format does not support EXIF properties, continue 
                                // without applying EXIF orientation.
                                switch (error.number) {
                                    case Hilo.ImageWriter.WINCODEC_ERR_UNSUPPORTEDOPERATION:
                                    case Hilo.ImageWriter.WINCODEC_ERR_PROPERTYNOTSUPPORTED:
                                        useEXIFOrientation = false;
                                        originalRotation = 0;
                                        break;
                                    default:
                                        throw error;
                                }
                            });

                        return decoderPromise;
                    };

                    var encodeProcessor = function (encoder) {
                        var adjustedDegrees = self.normalizeDegrees(degrees + originalRotation);

                        if (useEXIFOrientation) {
                            // EXIF is supported, so update the orientation flag to reflect 
                            // the user-specified rotation.
                            var netExifOrientation = Hilo.EXIFHelpers.convertDegreesRotationToExifOrientation(adjustedDegrees);

                            // BitmapProperties requires the application to explicitly declare the type
                            // of the property to be written - this is different from FileProperties which
                            // automatically coerces the value to the correct type. System.Photo.Orientation
                            // is defined as a UInt16.
                            var orientationTypedValue = new Windows.Graphics.Imaging.BitmapTypedValue(
                                netExifOrientation,
                                Windows.Foundation.PropertyType.uint16
                            );

                            var properties = new Windows.Graphics.Imaging.BitmapPropertySet();
                            properties.insert("System.Photo.Orientation", orientationTypedValue);

                            return encoder.bitmapProperties.setPropertiesAsync(properties);
                        } else {

                            // EXIF is not supported, so rever to bitmap rotation.
                            var rotation = self.getBitmapRotation(adjustedDegrees);
                            return encoder.bitmapTransform.rotation = rotation;

                        }
                    };

                    this.imageWriter.transFormAndSaveToDestination(sourceFile, destFile, {
                        decodeProcessor: decodeProcessor,
                        encodeProcessor: encodeProcessor
                    });
                },

                // Converts a number of degrees in to a [BitmapRotation][3] for
                // files that do not support EXIF properties.
                //
                // [3]: http://msdn.microsoft.com/en-us/library/windows/apps/windows.graphics.imaging.bitmaprotation.aspx
                //
                getBitmapRotation: function (degrees) {
                    var rotation;

                    if (degrees === 0) {
                        rotation = Windows.Graphics.Imaging.BitmapRotation.none;
                    } else {
                        rotation = Windows.Graphics.Imaging.BitmapRotation["clockwise" + degrees + "Degrees"];
                    }

                    return rotation;
                },

                // Normalizes any number to a value that fall within
                // 0 to 359 degrees.
                //
                // Examples: 
                //   45 -> 90
                //   90 -> 90
                //   100 -> 90
                //   180 -> 180
                //   250 -> 270
                //   359 -> 0
                //   360 -> 0
                //   720 -> 0
                normalizeDegrees: function (degrees) {
                    var result;

                    // Convert negative rotation (counter-clockwise) to positive (clockwise).
                    if (degrees < 0) {
                        degrees = 360 - Math.abs(degrees);
                    }

                    // Round to the nearest 90 degrees.
                    var remainder = degrees % 90;
                    if (remainder < 45) {
                        result = degrees - remainder;
                    } else {
                        result = degrees + (90 - remainder);
                    }

                    // Normalize to values between 0 and 359.
                    return result % 360;
                }
            });


    // Public API
    // ----------

    WinJS.Namespace.define("Hilo.Rotate", {
        RotatedImageWriter: WinJS.Class.mix(RotatedImageWriter, WinJS.Utilities.eventMixin)
    });

})();
