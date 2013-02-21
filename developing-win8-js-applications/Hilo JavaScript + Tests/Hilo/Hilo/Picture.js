// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // We define a "class" that is used to wrap an instance of
    // `Windows.Storage.StorageFile` for use with data binding.
    // Since some properties are calculated or otherwise loaded
    // asychronously, we `WinJS.Binding.dynamicObservableMixin`
    // to provide change notification for the binding system.

    // Imports And Constants
    // ---------------------

    var thumbnailMode = Windows.Storage.FileProperties.ThumbnailMode;
    var corruptImageFile = "/images/HiloLogo.scale-100.png";

    // Picture Definition
    // ------------------

    var Picture = WinJS.Class.define(

        function PictureConstructor(file) {
            var self = this;

            this.addUrl = this.addUrl.bind(this);

            this.storageFile = file;
            this.urlList = {};
            this.isDisposed = false;

            this._initObservable();
            this.addProperty("name", file.name);
            this.addProperty("isCorrupt", false);
            this.addProperty("url", "");
            this.addProperty("src", "");
            this.addProperty("itemDate", "");
            this.addProperty("className", "thumbnail");

            this.loadFileProperties();
            this.loadUrls();
        },

        {
            // Ensures that all of the picture's resources have been released.
            dispose: function () {
                if (this.isDisposed) { return; }
                this.isDisposed = true;

                Hilo.UrlCache.clear(this.storageFile.name);
                this.storageFile = null;
                this.urlList = null;
            },

            // There are some properties that the app needs which are immediately available,
            // even though they may have been prefetched.
            // We explicitly retrieve these properties and raise the corresponding change
            // notifications.
            loadFileProperties: function () {
                var file = this.storageFile,
                    self = this;

                if (file && file.properties) {
                    file.properties.retrievePropertiesAsync(["System.ItemDate"]).then(function (retrieved) {
                        if (self.isDisposed) { return; }
                        self.updateProperty("itemDate", retrieved.lookup("System.ItemDate"));
                    });
                    file.properties.getImagePropertiesAsync().then(function (props) {
                        if (props.height === 0 && props.width === 0) {
                            self.setCorruptImage();
                        }
                        self.properties = props;
                    });
                }
            },

            // If we have detected that the underlying `StorageFile` is not 
            // actually an image (or perhaps it is a corrupt image), we
            // want to ensure that something meaningful is displayed for
            // the user.
            setCorruptImage: function () {
                this.updateProperty("isCorrupt", true);
                var urlConfig = {
                    attrName: "url",
                    url: corruptImageFile,
                    backgroundUrl: 'url("' + corruptImageFile + ' ")',
                };

                this.addUrl(urlConfig);
                urlConfig.attrName = "src";
                this.addUrl(urlConfig);
            },

            // Ensures that the `UrlCache` has the associated URLs for
            // the `StorageFile` and its thumbnail. The primary URL uses 
            // the key `src` and the thumbnail uses the key `url`.
            loadUrls: function () {
                var file = this.storageFile;
                var self = this;

                // Ensure the thumbnail URL is present in the cache.
                if (file && file.getThumbnailAsync) {
                    Hilo.UrlCache.getUrl(file.path, "url", function () {
                        return file.getThumbnailAsync(thumbnailMode.picturesView);
                    }).then(function (urlConfig) {
                        if (!self.isCorrupt) {
                            self.addUrl(urlConfig);
                        }
                    });
                }

                // Ensure the primary image URL is present in the cache.
                Hilo.UrlCache
                    .getUrl(file.path, "src", file)
                    .then(function (urlConfig) {
                        if (!self.isCorrupt) {
                            self.addUrl(urlConfig);
                        }
                    });
            },

            addUrl: function (urlConfig) {
                this.urlList[urlConfig.attrName] = urlConfig;
                this.updateProperty(urlConfig.attrName, urlConfig);
                this.dispatchEvent("url:set:" + urlConfig.attrName, urlConfig);
            },

            getUrl: function (name) {
                var config = this.urlList[name];
                var url;

                if (config) {
                    url = config.url;
                }

                return url;
            }
        },

        {
            // This is a convenience method, typically used in combination with `array.map`:
            //
            // ```js
            // var viewmodels = someArrayOfStorageFiles.map(Hilo.Picture.from);
            // ```

            from: function (file) {
                return new Hilo.Picture(file);
            },

            // This function is to be used in declarative binding in the markup:
            //
            // ```html
            // <div data-win-bind="backgroundImage: src Hilo.Picture.bindToImageSrc"></div>
            // ```
            bindToImageSrc: WinJS.Binding.initializer(function (source, sourceProperties, target, targetProperties) {
                // We're ignoring the properties provided in the binding.
                // We are assuming that we'll always extract the `src` property from the `source`
                // and bind it to the `style.backgroundImage` of the `target` (which we expect to be a div tag).
                // We are not using img tags because a bad file results in a broken image
                target.style.backgroundImage = source.src.backgroundUrl;
            }),
        }
    );

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo", {
        Picture: WinJS.Class.mix(Picture, WinJS.Binding.dynamicObservableMixin, WinJS.Utilities.eventMixin)
    });

}());
