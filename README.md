[![NPM Status](https://badge.fury.io/js/dc.svg)](http://badge.fury.io/js/dc)

M3.js
=====

Dimensional charting built to work with Ava DataChat app.

Version v1.0.0
--------------------
Original built in for violin and box plot

Version v1.0.1
--------------------
Implemented bubble chart built in
Added Legend
Added Caption

Version v1.0.2
--------------------
Implementing error handling
Added back dashed line tooltip for Bubble Chart

Version v1.1.0
--------------------
Implemented graph nodes

Build M3 locally
--------------------
Fork the library, then run
```
npm install
```

Deploying M3 as development mode
---------------------------
Run the following command then open http://localhost:3000 at your local browser
```
grunt dev
```
* Find chart examples at http://localhost:3000/test_examples
* Dev is deployed automatically under watch mode, it detect and update the syntax error immediately any changes happen to the source file, check for any errors everytime you update it
* Dev excludes keeping track of Gruntfile.js (The package manager), if changes made to Gruntfile.js, exit and delpoy development mode again.
* It does not keep track of errors from logic, html or css. Use your browser debugger tool instead (F12)

Deploying M3 as final version
---------------------------
After running test with no errors or warnings
```
grunt push
```

License
--------------------

M3.js is an open source javascript library and licensed under
[MIT License](https://opensource.org/licenses/MIT).
