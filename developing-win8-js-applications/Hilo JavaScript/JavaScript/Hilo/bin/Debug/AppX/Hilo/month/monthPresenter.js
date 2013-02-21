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
    var search = Windows.Storage.Search,
        fileProperties = Windows.Storage.FileProperties,
        commonFolderQuery = Windows.Storage.Search.CommonFolderQuery,
        viewStates = Windows.UI.ViewManagement.ApplicationViewState;

    var itemDateProperty = "System.ItemDate";
    var maxImagesPerGroup = 8;

    // Month Presenter Definition
    // ---------------------

    var MonthPresenter = WinJS.Class.define(

        function MonthPresenterConstructor(loadingIndicatorEl, semanticZoom, zoomedInListView, zoomedOutListView, hiloAppBar, queryBuilder) {

            this.loadingIndicatorEl = loadingIndicatorEl;
            this.semanticZoom = semanticZoom;
            this.hiloAppBar = hiloAppBar;

            this.isLoading = true;

            this.zoomedOutListView = zoomedOutListView;
            this.zoomedInListView = zoomedInListView;

            this.queryBuilder = queryBuilder;

            Hilo.bindFunctionsTo(this, [
                "selectLayout",
                "_buildYearGroups",
                "_queryImagesPerMonth",
                "_buildViewModelsForMonths",
                "_createDataSources",
                "_setupListViews",
                "_imageInvoked",
                "_selectionChanged",
                "_groupHeaderTemplate",
            ]);
        },

        {
            _navigation: WinJS.Navigation,

            start: function (targetFolder) {
                var self = this;

                this.targetFolder = targetFolder;
                this.semanticZoom.enableButton = false;
                this.groupsByKey = {};
                this.displayedImages = [];

                return this._getMonthFoldersFor(targetFolder)
                    .then(this._queryImagesPerMonth)
                    .then(this._buildViewModelsForMonths)
                    .then(this._createDataSources)
                    .then(function (dataSources) {
                        self._setupListViews(dataSources.images, dataSources.years);
                        self.loadingIndicatorEl.style.display = "none";
                        self.isLoading = false;
                        self.selectLayout();
                    });
            },

            _getMonthFoldersFor: function (folder) {
                var queryOptions = new search.QueryOptions(commonFolderQuery.groupByMonth);
                var query = folder.createFolderQueryWithOptions(queryOptions);
                return query.getFoldersAsync(0);
            },

            _getImageQueryOptions: function () {
                var queryOptions = new search.QueryOptions(search.CommonFileQuery.orderByDate, [".jpg", ".jpeg", ".tiff", ".png", ".bmp", ".gif"]);
                queryOptions.setPropertyPrefetch(fileProperties.PropertyPrefetchOptions.none, [itemDateProperty]);
                queryOptions.setThumbnailPrefetch(fileProperties.ThumbnailMode.picturesView, 190, fileProperties.ThumbnailOptions.useCurrentScale);
                queryOptions.indexerOption = search.IndexerOption.useIndexerWhenAvailable;
                return queryOptions;
            },

            _queryImagesPerMonth: function (monthFolders) {
                var self = this;

                var groupsByKey = {};
                self.groupsByKey = groupsByKey;

                var queryOptions = self._getImageQueryOptions();

                var getCountsPerFolder = monthFolders.map(function (monthGroup) {

                    var query = monthGroup.createFileQueryWithOptions(queryOptions);

                    return query
                        .getItemCountAsync()
                        .then(function (count) {
                            return {
                                groupKey: monthGroup.name,
                                query: query,
                                count: count
                            };
                        });
                });

                return WinJS.Promise.join(getCountsPerFolder);
            },

            _buildViewModelsForMonths: function (foldersWithCount) {
                var self = this;
                var firstItemIndexHint = 0;
                var filesInFolder;

                var promise = WinJS.Promise.as();
                var groups = [];

                var foldersWithImages = foldersWithCount.filter(function (data) { return data.count > 0; });

                var buildViewModels = foldersWithImages.map(function (folder) {
                    promise = promise.then(function () {
                        return folder.query
                        .getFilesAsync(0, maxImagesPerGroup)
                        .then(function (files) {
                            filesInFolder = files;
                            // Since we filtered for zero count, we 
                            // can assume that we have at least one file.

                            return files.getAt(0).properties.retrievePropertiesAsync([itemDateProperty]);
                        })
                        .then(function (retrieved) {
                            var date = retrieved[itemDateProperty];
                            var groupKey = (date.getFullYear() * 100) + (date.getMonth());
                            var firstImage;

                            filesInFolder.forEach(function (file, index) {
                                var image = new Hilo.Picture(file);
                                image.groupKey = groupKey;
                                self.displayedImages.push(image);

                                if (index === 0) {
                                    firstImage = image;
                                }
                            });

                            var monthGroupViewModel = {
                                itemDate: date,
                                name: firstImage.name,
                                backgroundUrl: firstImage.src.backgroundUrl,
                                title: folder.groupKey,
                                sortOrder: groupKey,
                                count: folder.count,
                                firstItemIndexHint: firstItemIndexHint,
                                groupKey: date.getFullYear().toString()
                            };

                            firstItemIndexHint += filesInFolder.size;
                            self.groupsByKey[groupKey] = monthGroupViewModel;
                            groups.push(monthGroupViewModel);
                        });
                    });
                });
                return promise.then(function () { return groups; });
            },

            _createDataSources: function (monthGroups) {
                var self = this;

                function groupKey(item) {
                    return item.groupKey;
                }

                function groupData(item) {
                    return self.groupsByKey[item.groupKey];
                }

                function groupSort(left, right) {
                    return right - left;
                }

                var imageList = new WinJS.Binding.List(this.displayedImages).createGrouped(groupKey, groupData, groupSort);

                var yearGroups = this._buildYearGroups(monthGroups);
                var yearList = new WinJS.Binding.List(yearGroups);

                return {
                    images: imageList,
                    years: yearList
                };
            },

            _buildYearGroups: function (monthGroups) {
                var years = [];
                var current = {};

                monthGroups.forEach(function (monthGroup) {
                    var year = monthGroup.itemDate.getFullYear();
                    var month = monthGroup.itemDate.getMonth();
                    if (current.year !== year) {

                        current = {
                            year: year,
                            months: []
                        };
                        years.push(current);
                    }

                    current.months[month] = monthGroup;
                });

                return years;
            },

            _buildQueryForPicture: function (item) {

                var picture = item.data;

                // Build a query to represent the month/year group that was selected.
                var query = this.queryBuilder
                    .bindable(true)                    // Ensure the images are bindable.
                    .forMonthAndYear(picture.itemDate) // Only load images for the selected month and year.
                    .build(this.targetFolder);

                var group = this.groupsByKey[item.groupKey];
                var indexInGroup = (group) ? item.index - group.firstItemIndexHint : 0;

                return {
                    query: query,
                    itemIndex: indexInGroup,
                    itemName: picture.name,
                    picture: picture
                };
            },

            _setupListViews: function (imageList, yearList) {

                this.imageList = imageList;

                this.zoomedInListView.addEventListener("iteminvoked", this._imageInvoked.bind(this));
                this.zoomedInListView.addEventListener("selectionchanged", this._selectionChanged.bind(this));

                this.zoomedOutListView.setItemDataSource(yearList.dataSource);
            },

            _imageInvoked: function (args) {
                var self = this;

                return args.detail.itemPromise.then(function (item) {

                    var options = self._buildQueryForPicture(item);
                    // Navigate to the detail page to show the results
                    // of this query with the selected item.
                    self._navigation.navigate("/Hilo/detail/detail.html", options);
                });
            },

            _selectionChanged: function (args) {
                var self = this;

                this.zoomedInListView.selection
                    .getItems()
                    .then(function (items) {
                        if (items[0]) {
                            var selected = items[0];
                            var options = self._buildQueryForPicture(selected);
                            self.hiloAppBar.setNavigationOptions(options, true);
                        } else {
                            self.hiloAppBar.clearNavigationOptions(true);
                        }
                    });
            },

            _groupHeaderTemplate: function (templateId) {
                var self = this;

                return function (itemPromise, recycledElement) {
                    var template = document.querySelector("#" + templateId);
                    var instance = document.createElement("div");
                    return itemPromise.then(function (item) {
                        instance.innerHTML = template.innerHTML;
                        WinJS.Binding.processAll(instance, item.data);
                        instance.querySelector("a").addEventListener("click", function () {
                            var options = self._buildQueryForPicture(item);
                            self._navigation.navigate("/Hilo/detail/detail.html", options);
                        });
                        return instance;
                    });
                };
            },

            selectLayout: function (viewState) {

                viewState = viewState || Windows.UI.ViewManagement.ApplicationView.value;

                if (this.isLoading) { return; }

                if (viewState === Windows.UI.ViewManagement.ApplicationViewState.snapped) {

                    this.zoomedInListView.layout = new WinJS.UI.ListLayout();
                    this.zoomedInListView.itemDataSource = this.imageList.groups.dataSource;
                    this.zoomedInListView.groupDataSource = null;

                    this.zoomedInListView.itemTemplate = document.querySelector("#monthSnappedTemplate");

                    if (this.semanticZoom.zoomedOut) {
                        this.semanticZoom.zoomedOut = false;
                    }
                    this.semanticZoom.enableButton = false;

                } else {
                    this.zoomedInListView.layout = new WinJS.UI.GridLayout();

                    this.zoomedInListView.itemDataSource = this.imageList.dataSource;
                    this.zoomedInListView.groupDataSource = this.imageList.groups.dataSource;
                    this.zoomedInListView.itemTemplate = document.querySelector("#monthItemTemplate");
                    this.zoomedInListView.groupHeaderTemplate = this._groupHeaderTemplate("monthGroupHeaderTemplate");

                    this.semanticZoom.enableButton = true;
                }
            }
        });

    // Public API
    // ---------------------

    WinJS.Namespace.define("Hilo.month", {
        MonthPresenter: MonthPresenter
    });
})();