'use strict';

describe("Feed", function () {

  var $httpBackend, appConfig, feedService, feedData;
  beforeEach(module('app'));

  beforeEach(inject(function ($injector) {

    $httpBackend = $injector.get('$httpBackend');
    appConfig = $injector.get('appConfig');
    feedService = $injector.get('feed');

    feedData = [
      {id: 1, text: 'Inspired Iron Man Digital Art Mashup Series by Bosslogic'},
      {id: 2, text: 'Gulp Fiction has been blowing up in our hosting traffic charts.'},
      {id: 3, text: 'A quick and easy way to setup a RESTful JSON API in Go...'},
      {id: 4, text: 'Gobot – Go framework for robotics, physical computing, internet of things..'}
    ];

    $httpBackend.when('GET', appConfig.apiUrl + 'user/111/feed').respond(feedData);

  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend.resetExpectations();
  });

  it('feed.list: should return list', function () {
    feedService.list().then(function (data) {
      expect(data[0].id).toBe(1);
    })
    $httpBackend.flush();
  });
});