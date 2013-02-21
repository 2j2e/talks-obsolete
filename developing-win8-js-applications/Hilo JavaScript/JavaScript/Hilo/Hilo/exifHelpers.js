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

    // EXIF Helper Methods
    // -------------------
    // This code is largely a port of the [Hilo C++ project's "ExifHelpers" object][1].
    //
    // [1]: http://hilo.codeplex.com/SourceControl/changeset/view/afda50239a41#Hilo%2fExifExtensions.cpp

    var exifHelperMethods = {
        rotateRectClockwise: function (rect, bitmapSize, degrees) {
            var radians = (Math.PI / 180.0) * -degrees;

            var angleSin = Math.sin(radians);
            var angleCos = Math.cos(radians);

            var width = bitmapSize.width;
            var height = bitmapSize.height;

            // Calculate rotated translation point for image.
            var x1 = width * angleCos;
            var y1 = width * angleSin;
            var x2 = (width * angleCos) - (height * angleSin);
            var y2 = (width * angleSin) + (height * angleCos);
            var x3 = -(height * angleSin);
            var y3 = height * angleCos;

            var minX = Math.min(x1, x2, x3);
            var minY = Math.min(y1, y2, y3);

            // Adjust rotate and adjust original rect bounding box.
            var xOrigin = (rect.startX * angleCos) - (rect.startY * angleSin) - minX;
            var yOrigin = (rect.startX * angleSin) + (rect.startY * angleCos) - minY;

            var xOther = (rect.endX * angleCos) - (rect.endY * angleSin) - minX;
            var yOther = (rect.endX * angleSin) + (rect.endY * angleCos) - minY;

            var startX = Math.min(xOrigin, xOther);
            var startY = Math.min(yOrigin, yOther);
            var endX = Math.max(xOrigin, xOther);
            var endY = Math.max(yOrigin, yOther);

            return {
                x: Math.round(startX),
                y: Math.round(startY),
                height: Math.round(endY - startY),
                width: Math.round(endX - startX)
            };
        },

        // The [Windows.Storage.FileProperties.PhotoOrientation][1] enumeration uses 
        // counter-clockwise rotation, whereas the EXIF values are clockwise.
        // The following two methods code converts back and forth between the two.
        // The angle is calculated by simply subtracting from 360°. Hence, a 90° 
        // counter-clockwise rotation is the same as 270° clockwise rotation.
        // [1]: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.fileproperties.photoorientation.aspx

        // Convert an EXIF rotation in to degrees.
        convertExifOrientationToDegreesRotation: function (exifOrientationFlag) {
            switch (exifOrientationFlag) {
                case photoOrientation.rotate90:
                    return 270;
                case photoOrientation.rotate180:
                    return 180;
                case photoOrientation.rotate270:
                    return 90;
                default:
                    // Ignore flip/mirroring values, and "normal"
                    return 0;
            }
        },

        // Convert a clockwise rotation in degrees, to an EXIF rotation enumeration.
        convertDegreesRotationToExifOrientation: function (angle) {
            switch (angle) {
                case 90:
                    return photoOrientation.rotate270;
                case 180:
                    return photoOrientation.rotate180;
                case 270:
                    return photoOrientation.rotate90;
                default:
                    // Ignore flip/mirroring values, and 0degree rotation.
                    return photoOrientation.normal;
            }

        }
    };

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo", {
        EXIFHelpers: exifHelperMethods
    });

})();
