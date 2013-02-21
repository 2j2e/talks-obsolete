describe("Crop Page Appbar Presenter", function () {

    var appBar, el, crop, save, reset, unSnap;

    beforeEach(function () {
        crop = new Specs.WinControlStub();
        save = new Specs.WinControlStub();
        reset = new Specs.WinControlStub();
        unSnap = new Specs.WinControlStub();

        el = new Specs.WinControlStub();
        el.addQuerySelector("#crop", crop);
        el.addQuerySelector("#save", save);
        el.addQuerySelector("#reset", reset);
        el.addQuerySelector("#unSnap", unSnap);
        el.show = function () {
            el.show.wasCalled = true;
        };

        appBar = new Hilo.Crop.AppBarPresenter(el);
    });

    describe("when saving", function () {
        var handler;

        beforeEach(function () {
            handler = function () {
                handler.wasCalled = true;
            };

            appBar.addEventListener("save", handler);
            
            save.dispatchEvent("click");
        });

        it("should dispatch a save event", function () {
            expect(handler.wasCalled).equals(true);
        });
    });

    describe("when reseting", function () {
        var handler;

        beforeEach(function () {
            handler = function () {
                handler.wasCalled = true;
            };

            appBar.addEventListener("cancel", handler);
            
            reset.dispatchEvent("click");
        });

        it("should dispatch a reset event", function () {
            expect(handler.wasCalled).equals(true);
        });
    });

});
