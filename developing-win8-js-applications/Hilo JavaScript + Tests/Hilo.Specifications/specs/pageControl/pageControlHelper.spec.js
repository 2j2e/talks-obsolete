// ===============================================================================
//  Microsoft patterns & practices
//  Hilo JS Guidance
// ===============================================================================
//  Copyright © Microsoft Corporation.  All rights reserved.
//  This code released under the terms of the 
//  Microsoft patterns & practices license (http://hilojs.codeplex.com/license)
// ===============================================================================

describe("Helper for page controls", function () {

    describe("when checking the incoming options", function () {
        var attemptedToDeserialize;

        function deserialize() {
            attemptedToDeserialize = true;
            return {};
        }

        beforeEach(function () {
            attemptedToDeserialize = false
        });

        describe("when no query is present", function () {

            beforeEach(function () {
                var options = {
                    // no `query` object
                };
                Hilo.controls.checkOptions(options, deserialize);
            });

            it("should not attempt to deserialize the query", function () {
                expect(attemptedToDeserialize).equal(false);
            });
        });

        describe("with a query is present", function () {

            beforeEach(function () {
                var options = {
                    query: {
                        // no `execute` method
                    }
                };
                Hilo.controls.checkOptions(options, deserialize);
            });

            it("should attempt to deserialize the query", function () {
                expect(attemptedToDeserialize).equal(true);
            });
        });
    });
});
