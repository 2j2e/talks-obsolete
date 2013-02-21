// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // Much of this code and the comments found within it are borrowed from the 
    // [Simple imaging sample][1] for building a simple image processing 
    // application. See that sample for a more complete list of what can be done 
    // with imaging in Windows Store apps.
    //
    // [1]: http://code.msdn.microsoft.com/windowsapps/Simple-Imaging-Sample-a2dec2b0

    // Imports
    var fileAccessMode = Windows.Storage.FileAccessMode,
        imaging = Windows.Graphics.Imaging;

    // Helper Methods
    // --------------

    var Helpers = {
        convertHResultToNumber: function (hresult) {
            if ((hresult > 0xFFFFFFFF) || (hresult < 0x80000000)) {
                throw new Error("Value is not a failure HRESULT.");
            }

            return hresult - 0xFFFFFFFF - 1;
        }
    };

    // Image Writer Definition
    // -----------------------

    var ImageWriter = WinJS.Class.define(

        function ImageWriterConstructor() { },

        {
            // Open the filepicker, defaulting it to the currently
            // used source file, allowing another file name to be
            // selected if desired.
            pickFile: function (sourceFile, fileNameSuffix) {
                var savePicker = new Windows.Storage.Pickers.FileSavePicker();

                // Default to saving in the pictures library with the original filename.
                savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
                savePicker.suggestedFileName = sourceFile.displayName + "-" + fileNameSuffix + sourceFile.fileType;

                // Dropdown of file types available to the user for saving files.
                savePicker.fileTypeChoices.insert("BMP", [".bmp"]);
                savePicker.fileTypeChoices.insert("GIF", [".gif"]);
                savePicker.fileTypeChoices.insert("JPG", [".jpg", ".jpeg"]);
                savePicker.fileTypeChoices.insert("PNG", [".png"]);
                savePicker.fileTypeChoices.insert("TIFF", [".tiff"]);

                // Run the picker and get the filename that the user chose.
                return savePicker.pickSaveFileAsync();
            },

            // The core implementation of writing the source file to the destination file,
            // processing the decoder and encoder transformations provided by the caller.
            // 
            // The `sourceFile` and `destFile` are `StorageFile` objects
            //
            // The `options` parameter is an object literal that takes two named values:
            // * `decodeProcessor`: a function that recieves a `BitmapDecoder` object and performs any needed data extraction from the source image
            // * `encodeProcessor`: a function that recieves a `BitmapEncoder` object and performs any needed transforms to the destination image
            transFormAndSaveToDestination: function (sourceFile, destFile, options) {

                var self = this;

                // Save the source to the destination.

                // Keep data in-scope across multiple asynchronous methods.
                var originalWidth,
                    originalHeight,
                    encoder,
                    decoder,
                    sourceStream,
                    destStream;

                var memStream = new Windows.Storage.Streams.InMemoryRandomAccessStream();

                // Create a new encoder and initialize it with data from the original file.
                // The encoder writes to an in-memory stream, we then copy the contents to the file.
                // This allows the application to perform in-place editing of the file: any unedited data
                // is copied directly to the destination, and the original file is overwritten
                // with updated data.
                sourceFile.openAsync(fileAccessMode.readWrite).then(function (stream) {

                    sourceStream = stream;
                    return imaging.BitmapDecoder.createAsync(sourceStream)
                        .then(function (_decoder) {
                            decoder = _decoder;

                            if (options.decodeProcessor) {
                                // run any custom pre-processing from the decoder
                                return options.decodeProcessor(decoder);
                            }
                        }).then(function () {

                            // Set the encoder's destination to the temporary, in-memory stream.
                            return imaging.BitmapEncoder.createForTranscodingAsync(memStream, decoder);

                        }).then(function (_encoder) {
                            encoder = _encoder;

                            if (options.encodeProcessor) {
                                // run any custom transform that needs to happen
                                return options.encodeProcessor(encoder);
                            }
                        }).then(function () {

                            // Attempt to generate a new thumbnail to reflect any rotation operation.
                            encoder.isThumbnailGenerated = true;

                        }).then(function () {

                            return encoder.flushAsync();

                        }).then(null, function (error) {

                            switch (error.number) {
                                // If the encoder does not support writing a thumbnail, then try again
                                // but disable thumbnail generation.
                                case Hilo.ImageWriter.WINCODEC_ERR_UNSUPPORTEDOPERATION:
                                    encoder.isThumbnailGenerated = false;
                                    return encoder.flushAsync();
                                default:
                                    throw error;
                            }

                        }).then(function () {
                            // Open the destination stream.
                            return destFile.openAsync(fileAccessMode.readWrite);
                        }).then(function (_destStream) {
                            destStream = _destStream;

                            // Copy the contents of the memory stream to the destination.
                            memStream.seek(0);
                            destStream.seek(0);
                            destStream.size = 0;

                            return Windows.Storage.Streams.RandomAccessStream.copyAsync(memStream, destStream);
                        }).done(function () {

                            // Finally, close each stream to release any locks.
                            if (memStream) { memStream.close(); }
                            if (sourceStream) { sourceStream.close(); }
                            if (destStream) { destStream.close(); }
                        });

                }, function (error) {
                    self.dispatchEvent("errorOpeningSource", error);
                    destFile.deleteAsync();
                });
            }
        },

        {
            // Exception number constants. These constants are defined using values from winerror.h,
            // and are compared against error.number in the exception handlers in this scenario.

            // This file format does not support the requested operation; for example, metadata or thumbnails.
            WINCODEC_ERR_UNSUPPORTEDOPERATION: Helpers.convertHResultToNumber(0x88982F81),

            // This file format does not support the requested property/metadata query.
            WINCODEC_ERR_PROPERTYNOTSUPPORTED: Helpers.convertHResultToNumber(0x88982F41),

            // There is no codec or component that can handle the requested operation; for example, encoding.
            WINCODEC_ERR_COMPONENTNOTFOUND: Helpers.convertHResultToNumber(0x88982F50)

        });

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo", {
        ImageWriter: WinJS.Class.mix(ImageWriter, WinJS.Utilities.eventMixin)
    });
})();
