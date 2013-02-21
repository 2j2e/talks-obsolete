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
    var knownFolders = Windows.Storage.KnownFolders,
        fileProperties = Windows.Storage.FileProperties,
        search = Windows.Storage.Search,
        commonFileQuery = Windows.Storage.Search.CommonFileQuery;

    // A list of the folders that query builder supports.
    // This is used primarily for deserializing a query
    // after the app has resumed.
    // The current implementation only supports one folder,
    // so we could bypass this step. However, if additional
    // folders were supported you would need a way to 
    // identify them when the queries are deserialized.
    var supportedFolders = [knownFolders.picturesLibrary];

    // A simple algorithm for generating an unique id for
    // a given `StorageFolder`.
    function generateFolderId(folder) {
        return folder.displayName + ":" + folder.displayType + ":" + folder.path;
    }

    // We'll register the support folders by looping over
    // the array `supportedFolders` and generating a key
    // for each one. The key will be used in the `deserialize`
    // function to retrieved the corrseponding folder.
    supportedFolders.forEach(function (folder) {
        var key = generateFolderId(folder);
        supportedFolders[key] = folder;
    });

    // Image Query Builder Constructor
    // -------------------------------

    // The image query builder an implementation of [the builder pattern][1]
    // providing a flexible API for building queries that find image files on
    // the local system. It builds a [query object][2] which provides an
    // encapsulation of the query that was specified, in an object that can
    // be serialized, deserialized, and executed as needed.
    //
    // [1]: http://en.wikipedia.org/wiki/Builder_pattern
    // [2]: http://martinfowler.com/eaaCatalog/queryObject.html
    //
    // A query object is an alternative to the more tradditional "repository"
    // object, which encapsulates all query logic behind methods such as
    // `getImagesByType(".jpg")`, `getFirstNImages(10)`, etc. Instead of
    // providing a fixed set of methods that are restricted to one implementation,
    // the image query builder provides a set of default options that can be
    // changed as needed, by calling the methods on the builder. Once the builder
    // has been configured with the correct query criteria, a query object can
    // be built from it.
    //
    // ```js
    // var folderToQuery = Windows.Storage.KnownFolders.PicturesLibrary;
    // var queryBuilder = new Hilo.ImageQueryBuilder(folderToQuery);
    //
    // queryBuilder
    //   .count(10)                   // only get 10 images
    //   .forMonthAndYear("Aug 2012"); // only images taken in August 2012
    //
    // var query = queryBuilder.build(storageFolder);
    // query.execute();
    // ```
    // 
    // Once a query has been built, it cannot be modified. The options that were
    // used to build the query are [frozen][3], and any attempt to change them
    // will result in an exception. The `queryBuilder` instance can be re-used,
    // though. Changing the options for the query builder instance will not affect
    // andy existing query objects that were built.
    //
    // [3]: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/freeze


    var ImageQueryBuilder = WinJS.Class.define(

            function ImageQueryBuilderConstructor() {
                this.reset();
            },

            {
                reset: function () {
                    this._settings = {};
                    this._set("fileTypes", [".jpg", ".jpeg", ".tiff", ".png", ".bmp", ".gif"]);
                    this._set("prefetchOption", fileProperties.PropertyPrefetchOptions.imageProperties);

                    this._set("thumbnailOptions", fileProperties.ThumbnailOptions.useCurrentScale);
                    this._set("thumbnailMode", fileProperties.ThumbnailMode.picturesView);
                    this._set("thumbnailSize", 256);

                    this._set("sortOrder", commonFileQuery.orderByDate);
                    this._set("indexerOption", search.IndexerOption.useIndexerWhenAvailable);
                    this._set("startingIndex", 0);
                    this._set("bindable", false);

                    return this;
                },

                // Build the query object with all of the settings that have
                // been configured for this builder.  
                //
                // The StorageFolder to load the images from must be specified.
                build: function (storageFolder) {
                    this._set("folder", storageFolder);
                    this._set("folderKey", generateFolderId(storageFolder));
                    return new QueryObject(this._settings);
                },

                // Creates "bindable" objects using the `Hilo.Picture` object,
                // which is required when the resulting image objects must be
                // bound to a UI element, such as a `ListView`.
                //
                // Bindable takes one parameter: a boolean to determine wheter
                // or not bindable `Picture` objects are returned. If no
                // parameter is specified, it defaults to `false`.
                //
                bindable: function (bindable) {
                    // `!!` is a JavaScript coersion trick to convert any value
                    // in to a true boolean value. 
                    //
                    // When checking equality and boolean values, JavaScript 
                    // coerces `undefined`, `null`, `0`, `""`, and `false` into 
                    // a boolean value of `false`. All other values are coerced 
                    // into a boolean value of `true`.
                    //
                    // The first ! then, negates the coerced value. For example,
                    // a value of "" (empty string) will be coerced in to `false`.
                    // Therefore `!""` will return `true`. 
                    //
                    // The second ! then inverts the negated value to the
                    // correct boolean form, as a true boolean value. For example,
                    // `!!""` returns `false` and `!!"something"` returns true.
                    this._set("bindable", !!bindable);
                    return this;
                },

                // Set the number of images to retrieve. Setting this will
                // override the `imageAt` setting.
                count: function (count) {
                    this._set("startingIndex", 0);
                    this._set("count", count);
                    return this;
                },

                // Load a specific image by the image's index. The index
                // comes from the final set of images that are loaded, and
                // accounts for all other query options. Therefore, changing
                // any query option has the potential to change the index of
                // the image that should be loaded.
                //
                // Setting the `imageAt` option will override the `count` option.
                imageAt: function (index) {
                    this._set("startingIndex", index);
                    this._set("count", 1);
                    return this;
                },

                // Specify a list of attributes to pre-fetch for the images. The
                // default is to load all available `ImageAttributes` for each 
                // image. If fewer attributes should be pre-fetched, specify them
                // with this method, as an array, using the [attribute names][4].
                //
                // [4]: http://msdn.microsoft.com/en-us/library/windows/desktop/dd561977(v=vs.85).aspx
                prefetchOptions: function (attributeArray) {
                    this._set("prefetchOption", fileProperties.PropertyPrefetchOptions.none);
                    this._set("prefetchAttributes", attributeArray);
                    return this;
                },

                // Only pictures taken within the specified month and year will
                // be loaded. The `monthAndYear` parameter should be a string that
                // contains both the month's name and the year in 4-digit form:
                // `Jan 2012`, `August 2001`, etc.
                forMonthAndYear: function (monthAndYear) {
                    this._set("monthAndYear", monthAndYear);
                    return this;
                },

                // Internal method to set a key / value pair, used for
                // building the final query.
                _set: function (key, value) {
                    this._settings[key] = value;
                }
            },

            // Type members are often called "static" members, though in JavaScript
            // they are not actually static.
            {
                // Deserialize a set of queryBuilder options in to a Query object 
                // instance. Use this to restore a Query object that was 
                // serialized when the app was suspended.
                //
                // ```js
                // var deserializedQuery = Hilo.ImageQueryBuilder.deserialize(serializedQuery);
                // deserializedQuery.execute();
                // ```
                deserialize: function (serializedQuery) {
                    // Even though we pass in the entire query object, we really only care
                    // about the settings. They allow us to reconstruct the correct query.
                    var settings = serializedQuery.settings;

                    if (typeof settings.monthAndYear === "string") {
                        settings.monthAndYear = new Date(settings.monthAndYear);
                    }

                    return new QueryObject(settings);
                }
            }
        );

    WinJS.Namespace.define("Hilo", {
        ImageQueryBuilder: ImageQueryBuilder
    });


    // QueryObject Definition
    // ----------------------

    // `QueryObject` is private within the ImageQueryBuilder
    // module. It cannot be instantiated directly, but must be created through
    // the use of the ImageQueryBuilder.


    // Helper Methods
    // --------------

    // Translate a DateTime object into Advanced Query Syntax.
    // For more information, see:
    // http://msdn.microsoft.com/en-us/library/windows/desktop/bb266512(v=vs.85).aspx
    function translateToAQSFilter(value) {
        var month, year;

        if (value.getFullYear && value.getMonth) {
            year = value.getFullYear();
            month = value.getMonth();
        } else {
            throw new Error("Expected a date value.");
        }

        return Hilo.dateFormatter.createFilterRangeFromYearAndMonth(year, month);
    }

    var QueryObject = WinJS.Class.define(

        function QueryObjectConstructor(settings) {
            // Duplicate and the settings by copying them
            // from the original, to a new object. This is
            // a shallow copy only.
            //
            // This prevents the original queryBuilder object
            // from modifying the settings that have been
            // sent to this query object.
            var dupSettings = {};
            Object.keys(settings).forEach(function (key) {
                dupSettings[key] = settings[key];
            });

            this.settings = dupSettings;

            // Build the query options.
            var queryOptions = this._buildQueryOptions(this.settings);
            this._queryOptionsString = queryOptions.saveToString();

            if (!this.settings.folder.createFileQueryWithOptions) {
                var folder = supportedFolders[this.settings.folderKey];
                if (!folder) {
                    // This is primarily to help any developer who has to extend Hilo.
                    // If they add support for a new folder, but forget to register it
                    // at the head of this module then this error should help them
                    // identify the problem quickly.
                    throw new Error("Attempted to deserialize a query for an unknown folder: " + settings.folderKey);
                }
                this.settings.folder = folder;
            }

            this.fileQuery = this._buildFileQuery(queryOptions);
        },

        {
            // Execute the query object. Returns a promise that provides
            // access to an array of objects that was loaded by the 
            // query. This is either [StorageFile][5] objects or `Hilo.Picture`
            // objects.
            //
            // ```js
            // var whenImagesAreReady = query.execute();
            // whenImagesAreReady.then(function(images){
            //   // ... process the images array, here
            // });
            // ```
            //
            // [5]: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.storagefile.aspx
            execute: function () {
                var start, count;
                var queryPromise;

                switch (arguments.length) {
                    case (0):
                        start = this.settings.startingIndex;
                        count = this.settings.count;
                        break;
                    case (1):
                        start = arguments[0];
                        count = 1;
                        break;
                    case (2):
                        start = arguments[0];
                        count = arguments[1];
                        break;
                    default:
                        throw new Error("Unsupported number of arguments passed to `query.execute`.");
                }

                if (count) {
                    // Limit the query to a set number of files to be returned, which accounts
                    // for both the `count(n)` and `imageAt(n)` settings from the query builder.
                    queryPromise = this.fileQuery.getFilesAsync(start, count);
                } else {
                    queryPromise = this.fileQuery.getFilesAsync();
                }

                if (this.settings.bindable) {
                    // Create `Hilo.Picture` objects instead of returning `StorageFile` objects
                    queryPromise = queryPromise.then(this._createViewModels);
                }

                return queryPromise;
            },

            // This method is called by convention when this object is serialized.
            // This implementation does not add anything beyond the builtin logic,
            // however we include it in order to demonstrate were you could 
            // customize the serialization if you needed.
            toJSON: function () {
                return this;
            },

            // Internal method to take the options specified in the query builder
            // and turn them in to a [QueryOptions][6] object. 
            //
            // Note that not all settings from the query builder are applicable
            // to the resulting `QueryObject`. Some of them are applied in the
            // `execute` method, instead.
            //
            // [6]: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.search.queryoptions.aspx
            _buildQueryOptions: function (settings) {
                var queryOptions = new search.QueryOptions(settings.sortOrder, settings.fileTypes);
                queryOptions.indexerOption = settings.indexerOption;

                queryOptions.setPropertyPrefetch(settings.prefetchOption, settings.prefetchAttributes);

                if (this.settings.monthAndYear) {
                    queryOptions.applicationSearchFilter = translateToAQSFilter(settings.monthAndYear);
                }

                return queryOptions;
            },

            // Internal method. Converts a QueryOptions object in to a file query.
            _buildFileQuery: function (queryOptions) {
                return this.settings.folder.createFileQueryWithOptions(queryOptions);
            },

            // Internal method. Wraps the original `StorageFile` objects in 
            // `Hilo.Picture` objects, so that they can be bound to UI controls
            // such as the `WinJS.UI.ListView`.
            _createViewModels: function (files) {

                var count = files.length;
                var results = new Array(count);
                var index = count - 1;
                var proceed = true;

                function onCancellation() {
                    proceed = false;
                }

                return new WinJS.Promise(function (complete, error) {

                    function processNextFile() {
                        var file = files[index];
                        results[index] = new Hilo.Picture(file);
                        index--;

                        if (index < 0) {
                            complete(results);
                        } else if (!proceed) {
                            error("Cancel");
                        } else {
                            setImmediate(processNextFile);
                        }
                    }

                    processNextFile();

                }, onCancellation);
            }
        });

})();
