// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

(function () {
    "use strict";

    // Imports And Constants
    // ---------------------

    var appImagesPath = Windows.ApplicationModel.Package.current.installedLocation.path + "\\sampleImages",
        localFolder = Windows.Storage.ApplicationData.current.localFolder,
        replaceExisting = Windows.Storage.CreationCollisionOption.replaceExisting,
        replaceExistingFile = Windows.Storage.NameCollisionOption.replaceExisting,
        indexedFolderName = "Indexed",
        thumbnailFolderName = "tile-thumbnails";

    // Private Methods
    // ---------------

    function copyImagesFromAppPath(indexedFolder) {

        // This copies sample images used for the test. Once these images are present in the app's local
        // data, they should not need to be copied again.
        return Windows.Storage.StorageFolder.getFolderFromPathAsync(appImagesPath).then(function (appImagesFolder) {
           return appImagesFolder.getFilesAsync().then(function (files) {
                var promises = [];

                files.forEach(function (file) {
                    var fileCopy = file.copyAsync(indexedFolder, file.name, replaceExistingFile);
                    promises.push(fileCopy);
                });

               // In addition to copying the files, we also need to provide time for the folder to be indexed.
                promises.push(WinJS.Promise.timeout(3000));

                return WinJS.Promise.join(promises);
            });
        });

    }

    function doesIndexedFolderExist() {
        var folderOpen = Windows.Storage.ApplicationData.current.localFolder.getFolderAsync(indexedFolderName);

        var promise = new WinJS.Promise(function (complete) {
            folderOpen.done(function () {
                complete(true);
            }, function () {
                complete(false);
            });;
        });

        return promise;
    }

    var copyImagesToIndexedFolder = function () {
        var whenIndexedFolderCreated = localFolder.createFolderAsync(indexedFolderName, replaceExisting);

        return whenIndexedFolderCreated
            .then(copyImagesFromAppPath);
    }

    var getImages = function () {
        var whenFolder = localFolder.getFolderAsync(indexedFolderName);

        return whenFolder.then(function (folder) {
            return folder.getFilesAsync();
        });
    };

    var getFileNames = function (paths) {
        return paths.map(function (path) { return path.name });
    };

    var thumbnailFileExists = function (fileName) {
        var fullPath = indexedFolderName + "\\" + fileName;
        var fileOpen = Windows.Storage.ApplicationData.current.localFolder.getFileAsync(fullPath);

        var promise = new WinJS.Promise(function (complete) {
            fileOpen.done(function () {
                complete(true);
            }, function () {
                complete(false);
            });;
        });

        return promise;
    }

    var getThumbnailSize = function (fileName) {
        var fullPath = thumbnailFolderName + "\\" + fileName;
        var fileOpen = Windows.Storage.ApplicationData.current.localFolder.getFileAsync(fullPath);

        var promise = new WinJS.Promise(function (complete) {
            fileOpen.done(function (fileInfo) {
                fileInfo.properties.getImagePropertiesAsync().then(function (props) {
                    complete(props);
                });
            }, function () {
                complete(false);
            });
        });

        return promise;
    }

    var join = function (items) {
        // Some of our tests require us to join together a number of promises,
        // each invoking an expectation. We want to wait until all are complete,
        // and then invoke the `done` function provided by Mocha. However, if we
        // simply chain the `done` function like this:
        //
        //    WinJS.Promise.join(promies).then(done);
        //
        // Mocha will throw an error because the `done` should only be invoked with
        // an error object or with no parameters. When joining the promises as 
        // demonstrated above, we end up passing in an array and thus Mocha throws
        // an error.
        //
        // To avoid this, we insert an additional promise that wraps the joining
        // and ignores the return value of the joined result.
        return new WinJS.Promise(function (complete) {
            WinJS.Promise.join(items).then(function () {
                complete();
            });
        });
    };

    // Public API
    // ----------

    WinJS.Namespace.define("Shared", {
        copyImagesToIndexedFolder: copyImagesToIndexedFolder,
        getImages: getImages,
        getFileNames: getFileNames,
        thumbnailFileExists: thumbnailFileExists,
        getThumbnailSize: getThumbnailSize,
        doesIndexedFolderExist: doesIndexedFolderExist,
        join: join
    });
})();
