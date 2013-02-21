---------------
Hilo JavaScript
---------------
November 21, 2012


Known Issues
------------

* When you save a file as a result cropping or rotating, the user is navigated back to the previous page in the history. However, saving the file also produces a `contentsChanged` event. This event is likely to be handled after the navigation completes. In those cases, the page reloads after then navigation. This gives the user the impression of the page loading twice.


Running Unit Tests
------------------

There are two external dependencies that you need to setup.

	*Mocha*
	This is the unit test runner. It is primarily for NodeJS but has a build available for the browser.
	It is generally available following the instructions on its site:
	http://visionmedia.github.com/mocha/

	A more convenient option for acquire Mocha may be to use the Nuget package:
	http://nuget.org/packages/mochajs-browseronly

	The test app expects to find mocha.js and mocha.css in the \Hilo.Specifications\lib folder.

	*Chai*
	This is the assertion library that allows us to define expectation in the unit tests.
	It is generally available from its site:
	http://chaijs.com/

	The test app expects to find chai.js in the \Hilo.Specifications\lib folder.

After the dependencies are set up, simply right-click on Hilo.Specifications in the Solution Explorer and select Debug | Start New Instance.


Note Regarding Asynchronous Programming in WinJS
--------------------------------

WinJS implements the [Common JS Promises/A][1] proposal. In brief, asynchronous 
operations are encompassed in an object called a _promise_. The promise object
is not the value returned from the async operation, instead is a "promise" to
return the value when the value becomes available. The most commonly used method
on a promise object is [`then`][2]. The first parameter of `then` is a function to 
be invoked once the promise is fulfilled.

A general discussion of [asynchronous programming in JavaScript][3] is available on 
Dev Center.

Promises are frequently chained together. This occurs when several async operations
need to occur in tandem. More information about [chaining promises][4] can be found on 
Dev Center.

[1]: http://wiki.commonjs.org/wiki/Promises
[2]: http://msdn.microsoft.com/en-us/library/windows/apps/br229728.aspx
[3]: http://msdn.microsoft.com/en-us/library/windows/apps/hh700330.aspx
[4]: http://msdn.microsoft.com/en-us/library/windows/apps/Hh700334.aspx