/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _pouchdb = __webpack_require__(1);
	
	var _pouchdb2 = _interopRequireDefault(_pouchdb);
	
	var _vue = __webpack_require__(19);
	
	var _vue2 = _interopRequireDefault(_vue);
	
	var _CharacterCreate = __webpack_require__(20);
	
	var _CharacterCreate2 = _interopRequireDefault(_CharacterCreate);
	
	var _CharacterList = __webpack_require__(50);
	
	var _CharacterList2 = _interopRequireDefault(_CharacterList);
	
	var _EncounterCreate = __webpack_require__(53);
	
	var _EncounterCreate2 = _interopRequireDefault(_EncounterCreate);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// Setup Pouch DB and query plugin
	_pouchdb2.default.plugin(__webpack_require__(23));
	var db = new _pouchdb2.default('advpack');
	
	// Pull in page components
	
	
	// Pull in global components and register
	_vue2.default.component('field-text-input', __webpack_require__(56));
	_vue2.default.component('field-select', __webpack_require__(59));
	_vue2.default.component('field-checkbox-toggle', __webpack_require__(62));
	_vue2.default.component('field-checkbox-slider', __webpack_require__(65));
	_vue2.default.component('field-checkbox', __webpack_require__(68));
	
	new _vue2.default({
	  el: '#app',
	  data: {
	    currentView: 'CharacterList'
	  },
	  components: {
	    CharacterCreate: _CharacterCreate2.default,
	    CharacterList: _CharacterList2.default,
	    EncounterCreate: _EncounterCreate2.default
	  },
	  methods: {
	    changeView: function changeView(target) {
	      this.currentView = target;
	    }
	  }
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, global) {'use strict';
	
	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }
	
	var jsExtend = __webpack_require__(3);
	var debug = _interopDefault(__webpack_require__(4));
	var inherits = _interopDefault(__webpack_require__(7));
	var lie = _interopDefault(__webpack_require__(8));
	var pouchdbCollections = __webpack_require__(10);
	var getArguments = _interopDefault(__webpack_require__(11));
	var events = __webpack_require__(12);
	var scopedEval = _interopDefault(__webpack_require__(13));
	var Md5 = _interopDefault(__webpack_require__(14));
	var vuvuzela = _interopDefault(__webpack_require__(15));
	var PromisePool = _interopDefault(__webpack_require__(16));
	var pouchdbCollate = __webpack_require__(17);
	
	/* istanbul ignore next */
	var PouchPromise = typeof Promise === 'function' ? Promise : lie;
	
	function isBinaryObject(object) {
	  return object instanceof ArrayBuffer ||
	    (typeof Blob !== 'undefined' && object instanceof Blob);
	}
	
	function cloneArrayBuffer(buff) {
	  if (typeof buff.slice === 'function') {
	    return buff.slice(0);
	  }
	  // IE10-11 slice() polyfill
	  var target = new ArrayBuffer(buff.byteLength);
	  var targetArray = new Uint8Array(target);
	  var sourceArray = new Uint8Array(buff);
	  targetArray.set(sourceArray);
	  return target;
	}
	
	function cloneBinaryObject(object) {
	  if (object instanceof ArrayBuffer) {
	    return cloneArrayBuffer(object);
	  }
	  var size = object.size;
	  var type = object.type;
	  // Blob
	  if (typeof object.slice === 'function') {
	    return object.slice(0, size, type);
	  }
	  // PhantomJS slice() replacement
	  return object.webkitSlice(0, size, type);
	}
	
	// most of this is borrowed from lodash.isPlainObject:
	// https://github.com/fis-components/lodash.isplainobject/
	// blob/29c358140a74f252aeb08c9eb28bef86f2217d4a/index.js
	
	var funcToString = Function.prototype.toString;
	var objectCtorString = funcToString.call(Object);
	
	function isPlainObject(value) {
	  var proto = Object.getPrototypeOf(value);
	  /* istanbul ignore if */
	  if (proto === null) { // not sure when this happens, but I guess it can
	    return true;
	  }
	  var Ctor = proto.constructor;
	  return (typeof Ctor == 'function' &&
	    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
	}
	
	function clone(object) {
	  var newObject;
	  var i;
	  var len;
	
	  if (!object || typeof object !== 'object') {
	    return object;
	  }
	
	  if (Array.isArray(object)) {
	    newObject = [];
	    for (i = 0, len = object.length; i < len; i++) {
	      newObject[i] = clone(object[i]);
	    }
	    return newObject;
	  }
	
	  // special case: to avoid inconsistencies between IndexedDB
	  // and other backends, we automatically stringify Dates
	  if (object instanceof Date) {
	    return object.toISOString();
	  }
	
	  if (isBinaryObject(object)) {
	    return cloneBinaryObject(object);
	  }
	
	  if (!isPlainObject(object)) {
	    return object; // don't clone objects like Workers
	  }
	
	  newObject = {};
	  for (i in object) {
	    if (Object.prototype.hasOwnProperty.call(object, i)) {
	      var value = clone(object[i]);
	      if (typeof value !== 'undefined') {
	        newObject[i] = value;
	      }
	    }
	  }
	  return newObject;
	}
	
	function once(fun) {
	  var called = false;
	  return getArguments(function (args) {
	    /* istanbul ignore if */
	    if (called) {
	      // this is a smoke test and should never actually happen
	      throw new Error('once called more than once');
	    } else {
	      called = true;
	      fun.apply(this, args);
	    }
	  });
	}
	
	function toPromise(func) {
	  //create the function we will be returning
	  return getArguments(function (args) {
	    // Clone arguments
	    args = clone(args);
	    var self = this;
	    var tempCB =
	      (typeof args[args.length - 1] === 'function') ? args.pop() : false;
	    // if the last argument is a function, assume its a callback
	    var usedCB;
	    if (tempCB) {
	      // if it was a callback, create a new callback which calls it,
	      // but do so async so we don't trap any errors
	      usedCB = function (err, resp) {
	        process.nextTick(function () {
	          tempCB(err, resp);
	        });
	      };
	    }
	    var promise = new PouchPromise(function (fulfill, reject) {
	      var resp;
	      try {
	        var callback = once(function (err, mesg) {
	          if (err) {
	            reject(err);
	          } else {
	            fulfill(mesg);
	          }
	        });
	        // create a callback for this invocation
	        // apply the function in the orig context
	        args.push(callback);
	        resp = func.apply(self, args);
	        if (resp && typeof resp.then === 'function') {
	          fulfill(resp);
	        }
	      } catch (e) {
	        reject(e);
	      }
	    });
	    // if there is a callback, call it back
	    if (usedCB) {
	      promise.then(function (result) {
	        usedCB(null, result);
	      }, usedCB);
	    }
	    return promise;
	  });
	}
	
	var log = debug('pouchdb:api');
	
	function adapterFun(name, callback) {
	  function logApiCall(self, name, args) {
	    /* istanbul ignore if */
	    if (log.enabled) {
	      var logArgs = [self._db_name, name];
	      for (var i = 0; i < args.length - 1; i++) {
	        logArgs.push(args[i]);
	      }
	      log.apply(null, logArgs);
	
	      // override the callback itself to log the response
	      var origCallback = args[args.length - 1];
	      args[args.length - 1] = function (err, res) {
	        var responseArgs = [self._db_name, name];
	        responseArgs = responseArgs.concat(
	          err ? ['error', err] : ['success', res]
	        );
	        log.apply(null, responseArgs);
	        origCallback(err, res);
	      };
	    }
	  }
	
	  return toPromise(getArguments(function (args) {
	    if (this._closed) {
	      return PouchPromise.reject(new Error('database is closed'));
	    }
	    if (this._destroyed) {
	      return PouchPromise.reject(new Error('database is destroyed'));
	    }
	    var self = this;
	    logApiCall(self, name, args);
	    if (!this.taskqueue.isReady) {
	      return new PouchPromise(function (fulfill, reject) {
	        self.taskqueue.addTask(function (failed) {
	          if (failed) {
	            reject(failed);
	          } else {
	            fulfill(self[name].apply(self, args));
	          }
	        });
	      });
	    }
	    return callback.apply(this, args);
	  }));
	}
	
	// like underscore/lodash _.pick()
	function pick(obj, arr) {
	  var res = {};
	  for (var i = 0, len = arr.length; i < len; i++) {
	    var prop = arr[i];
	    if (prop in obj) {
	      res[prop] = obj[prop];
	    }
	  }
	  return res;
	}
	
	// Most browsers throttle concurrent requests at 6, so it's silly
	// to shim _bulk_get by trying to launch potentially hundreds of requests
	// and then letting the majority time out. We can handle this ourselves.
	var MAX_NUM_CONCURRENT_REQUESTS = 6;
	
	function identityFunction(x) {
	  return x;
	}
	
	function formatResultForOpenRevsGet(result) {
	  return [{
	    ok: result
	  }];
	}
	
	// shim for P/CouchDB adapters that don't directly implement _bulk_get
	function bulkGet(db, opts, callback) {
	  var requests = opts.docs;
	
	  // consolidate into one request per doc if possible
	  var requestsById = {};
	  requests.forEach(function (request) {
	    if (request.id in requestsById) {
	      requestsById[request.id].push(request);
	    } else {
	      requestsById[request.id] = [request];
	    }
	  });
	
	  var numDocs = Object.keys(requestsById).length;
	  var numDone = 0;
	  var perDocResults = new Array(numDocs);
	
	  function collapseResultsAndFinish() {
	    var results = [];
	    perDocResults.forEach(function (res) {
	      res.docs.forEach(function (info) {
	        results.push({
	          id: res.id,
	          docs: [info]
	        });
	      });
	    });
	    callback(null, {results: results});
	  }
	
	  function checkDone() {
	    if (++numDone === numDocs) {
	      collapseResultsAndFinish();
	    }
	  }
	
	  function gotResult(docIndex, id, docs) {
	    perDocResults[docIndex] = {id: id, docs: docs};
	    checkDone();
	  }
	
	  var allRequests = Object.keys(requestsById);
	
	  var i = 0;
	
	  function nextBatch() {
	
	    if (i >= allRequests.length) {
	      return;
	    }
	
	    var upTo = Math.min(i + MAX_NUM_CONCURRENT_REQUESTS, allRequests.length);
	    var batch = allRequests.slice(i, upTo);
	    processBatch(batch, i);
	    i += batch.length;
	  }
	
	  function processBatch(batch, offset) {
	    batch.forEach(function (docId, j) {
	      var docIdx = offset + j;
	      var docRequests = requestsById[docId];
	
	      // just use the first request as the "template"
	      // TODO: The _bulk_get API allows for more subtle use cases than this,
	      // but for now it is unlikely that there will be a mix of different
	      // "atts_since" or "attachments" in the same request, since it's just
	      // replicate.js that is using this for the moment.
	      // Also, atts_since is aspirational, since we don't support it yet.
	      var docOpts = pick(docRequests[0], ['atts_since', 'attachments']);
	      docOpts.open_revs = docRequests.map(function (request) {
	        // rev is optional, open_revs disallowed
	        return request.rev;
	      });
	
	      // remove falsey / undefined revisions
	      docOpts.open_revs = docOpts.open_revs.filter(identityFunction);
	
	      var formatResult = identityFunction;
	
	      if (docOpts.open_revs.length === 0) {
	        delete docOpts.open_revs;
	
	        // when fetching only the "winning" leaf,
	        // transform the result so it looks like an open_revs
	        // request
	        formatResult = formatResultForOpenRevsGet;
	      }
	
	      // globally-supplied options
	      ['revs', 'attachments', 'binary', 'ajax'].forEach(function (param) {
	        if (param in opts) {
	          docOpts[param] = opts[param];
	        }
	      });
	      db.get(docId, docOpts, function (err, res) {
	        var result;
	        /* istanbul ignore if */
	        if (err) {
	          result = [{error: err}];
	        } else {
	          result = formatResult(res);
	        }
	        gotResult(docIdx, docId, result);
	        nextBatch();
	      });
	    });
	  }
	
	  nextBatch();
	
	}
	
	function isChromeApp() {
	  return (typeof chrome !== "undefined" &&
	    typeof chrome.storage !== "undefined" &&
	    typeof chrome.storage.local !== "undefined");
	}
	
	var hasLocal;
	
	if (isChromeApp()) {
	  hasLocal = false;
	} else {
	  try {
	    localStorage.setItem('_pouch_check_localstorage', 1);
	    hasLocal = !!localStorage.getItem('_pouch_check_localstorage');
	  } catch (e) {
	    hasLocal = false;
	  }
	}
	
	function hasLocalStorage() {
	  return hasLocal;
	}
	
	inherits(Changes$1, events.EventEmitter);
	
	/* istanbul ignore next */
	function attachBrowserEvents(self) {
	  if (isChromeApp()) {
	    chrome.storage.onChanged.addListener(function (e) {
	      // make sure it's event addressed to us
	      if (e.db_name != null) {
	        //object only has oldValue, newValue members
	        self.emit(e.dbName.newValue);
	      }
	    });
	  } else if (hasLocalStorage()) {
	    if (typeof addEventListener !== 'undefined') {
	      addEventListener("storage", function (e) {
	        self.emit(e.key);
	      });
	    } else { // old IE
	      window.attachEvent("storage", function (e) {
	        self.emit(e.key);
	      });
	    }
	  }
	}
	
	function Changes$1() {
	  events.EventEmitter.call(this);
	  this._listeners = {};
	
	  attachBrowserEvents(this);
	}
	Changes$1.prototype.addListener = function (dbName, id, db, opts) {
	  /* istanbul ignore if */
	  if (this._listeners[id]) {
	    return;
	  }
	  var self = this;
	  var inprogress = false;
	  function eventFunction() {
	    /* istanbul ignore if */
	    if (!self._listeners[id]) {
	      return;
	    }
	    if (inprogress) {
	      inprogress = 'waiting';
	      return;
	    }
	    inprogress = true;
	    var changesOpts = pick(opts, [
	      'style', 'include_docs', 'attachments', 'conflicts', 'filter',
	      'doc_ids', 'view', 'since', 'query_params', 'binary'
	    ]);
	
	    /* istanbul ignore next */
	    function onError() {
	      inprogress = false;
	    }
	
	    db.changes(changesOpts).on('change', function (c) {
	      if (c.seq > opts.since && !opts.cancelled) {
	        opts.since = c.seq;
	        opts.onChange(c);
	      }
	    }).on('complete', function () {
	      if (inprogress === 'waiting') {
	        setTimeout(function (){
	          eventFunction();
	        },0);
	      }
	      inprogress = false;
	    }).on('error', onError);
	  }
	  this._listeners[id] = eventFunction;
	  this.on(dbName, eventFunction);
	};
	
	Changes$1.prototype.removeListener = function (dbName, id) {
	  /* istanbul ignore if */
	  if (!(id in this._listeners)) {
	    return;
	  }
	  events.EventEmitter.prototype.removeListener.call(this, dbName,
	    this._listeners[id]);
	};
	
	
	/* istanbul ignore next */
	Changes$1.prototype.notifyLocalWindows = function (dbName) {
	  //do a useless change on a storage thing
	  //in order to get other windows's listeners to activate
	  if (isChromeApp()) {
	    chrome.storage.local.set({dbName: dbName});
	  } else if (hasLocalStorage()) {
	    localStorage[dbName] = (localStorage[dbName] === "a") ? "b" : "a";
	  }
	};
	
	Changes$1.prototype.notify = function (dbName) {
	  this.emit(dbName);
	  this.notifyLocalWindows(dbName);
	};
	
	function guardedConsole(method) {
	  if (console !== 'undefined' && method in console) {
	    var args = Array.prototype.slice.call(arguments, 1);
	    console[method].apply(console, args);
	  }
	}
	
	function randomNumber(min, max) {
	  var maxTimeout = 600000; // Hard-coded default of 10 minutes
	  min = parseInt(min, 10) || 0;
	  max = parseInt(max, 10);
	  if (max !== max || max <= min) {
	    max = (min || 1) << 1; //doubling
	  } else {
	    max = max + 1;
	  }
	  // In order to not exceed maxTimeout, pick a random value between half of maxTimeout and maxTimeout
	  if(max > maxTimeout) {
	    min = maxTimeout >> 1; // divide by two
	    max = maxTimeout;
	  }
	  var ratio = Math.random();
	  var range = max - min;
	
	  return ~~(range * ratio + min); // ~~ coerces to an int, but fast.
	}
	
	function defaultBackOff(min) {
	  var max = 0;
	  if (!min) {
	    max = 2000;
	  }
	  return randomNumber(min, max);
	}
	
	// designed to give info to browser users, who are disturbed
	// when they see http errors in the console
	function explainError(status, str) {
	  guardedConsole('info', 'The above ' + status + ' is totally normal. ' + str);
	}
	
	inherits(PouchError, Error);
	
	function PouchError(opts) {
	  Error.call(this, opts.reason);
	  this.status = opts.status;
	  this.name = opts.error;
	  this.message = opts.reason;
	  this.error = true;
	}
	
	PouchError.prototype.toString = function () {
	  return JSON.stringify({
	    status: this.status,
	    name: this.name,
	    message: this.message,
	    reason: this.reason
	  });
	};
	
	var UNAUTHORIZED = new PouchError({
	  status: 401,
	  error: 'unauthorized',
	  reason: "Name or password is incorrect."
	});
	
	var MISSING_BULK_DOCS = new PouchError({
	  status: 400,
	  error: 'bad_request',
	  reason: "Missing JSON list of 'docs'"
	});
	
	var MISSING_DOC = new PouchError({
	  status: 404,
	  error: 'not_found',
	  reason: 'missing'
	});
	
	var REV_CONFLICT = new PouchError({
	  status: 409,
	  error: 'conflict',
	  reason: 'Document update conflict'
	});
	
	var INVALID_ID = new PouchError({
	  status: 400,
	  error: 'bad_request',
	  reason: '_id field must contain a string'
	});
	
	var MISSING_ID = new PouchError({
	  status: 412,
	  error: 'missing_id',
	  reason: '_id is required for puts'
	});
	
	var RESERVED_ID = new PouchError({
	  status: 400,
	  error: 'bad_request',
	  reason: 'Only reserved document ids may start with underscore.'
	});
	
	var NOT_OPEN = new PouchError({
	  status: 412,
	  error: 'precondition_failed',
	  reason: 'Database not open'
	});
	
	var UNKNOWN_ERROR = new PouchError({
	  status: 500,
	  error: 'unknown_error',
	  reason: 'Database encountered an unknown error'
	});
	
	var BAD_ARG = new PouchError({
	  status: 500,
	  error: 'badarg',
	  reason: 'Some query argument is invalid'
	});
	
	var INVALID_REQUEST = new PouchError({
	  status: 400,
	  error: 'invalid_request',
	  reason: 'Request was invalid'
	});
	
	var QUERY_PARSE_ERROR = new PouchError({
	  status: 400,
	  error: 'query_parse_error',
	  reason: 'Some query parameter is invalid'
	});
	
	var DOC_VALIDATION = new PouchError({
	  status: 500,
	  error: 'doc_validation',
	  reason: 'Bad special document member'
	});
	
	var BAD_REQUEST = new PouchError({
	  status: 400,
	  error: 'bad_request',
	  reason: 'Something wrong with the request'
	});
	
	var NOT_AN_OBJECT = new PouchError({
	  status: 400,
	  error: 'bad_request',
	  reason: 'Document must be a JSON object'
	});
	
	var DB_MISSING = new PouchError({
	  status: 404,
	  error: 'not_found',
	  reason: 'Database not found'
	});
	
	var IDB_ERROR = new PouchError({
	  status: 500,
	  error: 'indexed_db_went_bad',
	  reason: 'unknown'
	});
	
	var WSQ_ERROR = new PouchError({
	  status: 500,
	  error: 'web_sql_went_bad',
	  reason: 'unknown'
	});
	
	var LDB_ERROR = new PouchError({
	  status: 500,
	  error: 'levelDB_went_went_bad',
	  reason: 'unknown'
	});
	
	var FORBIDDEN = new PouchError({
	  status: 403,
	  error: 'forbidden',
	  reason: 'Forbidden by design doc validate_doc_update function'
	});
	
	var INVALID_REV = new PouchError({
	  status: 400,
	  error: 'bad_request',
	  reason: 'Invalid rev format'
	});
	
	var FILE_EXISTS = new PouchError({
	  status: 412,
	  error: 'file_exists',
	  reason: 'The database could not be created, the file already exists.'
	});
	
	var MISSING_STUB = new PouchError({
	  status: 412,
	  error: 'missing_stub'
	});
	
	var INVALID_URL = new PouchError({
	  status: 413,
	  error: 'invalid_url',
	  reason: 'Provided URL is invalid'
	});
	
	function createError(error, reason) {
	  function CustomPouchError(reason) {
	    // inherit error properties from our parent error manually
	    // so as to allow proper JSON parsing.
	    /* jshint ignore:start */
	    for (var p in error) {
	      if (typeof error[p] !== 'function') {
	        this[p] = error[p];
	      }
	    }
	    /* jshint ignore:end */
	    if (reason !== undefined) {
	      this.reason = reason;
	    }
	  }
	  CustomPouchError.prototype = PouchError.prototype;
	  return new CustomPouchError(reason);
	}
	
	function generateErrorFromResponse(err) {
	
	  if (typeof err !== 'object') {
	    var data = err;
	    err = UNKNOWN_ERROR;
	    err.data = data;
	  }
	
	  if ('error' in err && err.error === 'conflict') {
	    err.name = 'conflict';
	    err.status = 409;
	  }
	
	  if (!('name' in err)) {
	    err.name = err.error || 'unknown';
	  }
	
	  if (!('status' in err)) {
	    err.status = 500;
	  }
	
	  if (!('message' in err)) {
	    err.message = err.message || err.reason;
	  }
	
	  return err;
	}
	
	function tryFilter(filter, doc, req) {
	  try {
	    return !filter(doc, req);
	  } catch (err) {
	    var msg = 'Filter function threw: ' + err.toString();
	    return createError(BAD_REQUEST, msg);
	  }
	}
	
	function filterChange(opts) {
	  var req = {};
	  var hasFilter = opts.filter && typeof opts.filter === 'function';
	  req.query = opts.query_params;
	
	  return function filter(change) {
	    if (!change.doc) {
	      // CSG sends events on the changes feed that don't have documents,
	      // this hack makes a whole lot of existing code robust.
	      change.doc = {};
	    }
	
	    var filterReturn = hasFilter && tryFilter(opts.filter, change.doc, req);
	
	    if (typeof filterReturn === 'object') {
	      return filterReturn;
	    }
	
	    if (filterReturn) {
	      return false;
	    }
	
	    if (!opts.include_docs) {
	      delete change.doc;
	    } else if (!opts.attachments) {
	      for (var att in change.doc._attachments) {
	        /* istanbul ignore else */
	        if (change.doc._attachments.hasOwnProperty(att)) {
	          change.doc._attachments[att].stub = true;
	        }
	      }
	    }
	    return true;
	  };
	}
	
	function flatten(arrs) {
	  var res = [];
	  for (var i = 0, len = arrs.length; i < len; i++) {
	    res = res.concat(arrs[i]);
	  }
	  return res;
	}
	
	// Determine id an ID is valid
	//   - invalid IDs begin with an underescore that does not begin '_design' or
	//     '_local'
	//   - any other string value is a valid id
	// Returns the specific error object for each case
	function invalidIdError(id) {
	  var err;
	  if (!id) {
	    err = createError(MISSING_ID);
	  } else if (typeof id !== 'string') {
	    err = createError(INVALID_ID);
	  } else if (/^_/.test(id) && !(/^_(design|local)/).test(id)) {
	    err = createError(RESERVED_ID);
	  }
	  if (err) {
	    throw err;
	  }
	}
	
	function listenerCount(ee, type) {
	  return 'listenerCount' in ee ? ee.listenerCount(type) :
	                                 events.EventEmitter.listenerCount(ee, type);
	}
	
	function parseDesignDocFunctionName(s) {
	  if (!s) {
	    return null;
	  }
	  var parts = s.split('/');
	  if (parts.length === 2) {
	    return parts;
	  }
	  if (parts.length === 1) {
	    return [s, s];
	  }
	  return null;
	}
	
	function normalizeDesignDocFunctionName(s) {
	  var normalized = parseDesignDocFunctionName(s);
	  return normalized ? normalized.join('/') : null;
	}
	
	// originally parseUri 1.2.2, now patched by us
	// (c) Steven Levithan <stevenlevithan.com>
	// MIT License
	var keys = ["source", "protocol", "authority", "userInfo", "user", "password",
	    "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
	var qName ="queryKey";
	var qParser = /(?:^|&)([^&=]*)=?([^&]*)/g;
	
	// use the "loose" parser
	/* jshint maxlen: false */
	var parser = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
	
	function parseUri(str) {
	  var m = parser.exec(str);
	  var uri = {};
	  var i = 14;
	
	  while (i--) {
	    var key = keys[i];
	    var value = m[i] || "";
	    var encoded = ['user', 'password'].indexOf(key) !== -1;
	    uri[key] = encoded ? decodeURIComponent(value) : value;
	  }
	
	  uri[qName] = {};
	  uri[keys[12]].replace(qParser, function ($0, $1, $2) {
	    if ($1) {
	      uri[qName][$1] = $2;
	    }
	  });
	
	  return uri;
	}
	
	// this is essentially the "update sugar" function from daleharvey/pouchdb#1388
	// the diffFun tells us what delta to apply to the doc.  it either returns
	// the doc, or false if it doesn't need to do an update after all
	function upsert(db, docId, diffFun) {
	  return new PouchPromise(function (fulfill, reject) {
	    db.get(docId, function (err, doc) {
	      if (err) {
	        /* istanbul ignore next */
	        if (err.status !== 404) {
	          return reject(err);
	        }
	        doc = {};
	      }
	
	      // the user might change the _rev, so save it for posterity
	      var docRev = doc._rev;
	      var newDoc = diffFun(doc);
	
	      if (!newDoc) {
	        // if the diffFun returns falsy, we short-circuit as
	        // an optimization
	        return fulfill({updated: false, rev: docRev});
	      }
	
	      // users aren't allowed to modify these values,
	      // so reset them here
	      newDoc._id = docId;
	      newDoc._rev = docRev;
	      fulfill(tryAndPut(db, newDoc, diffFun));
	    });
	  });
	}
	
	function tryAndPut(db, doc, diffFun) {
	  return db.put(doc).then(function (res) {
	    return {
	      updated: true,
	      rev: res.rev
	    };
	  }, function (err) {
	    /* istanbul ignore next */
	    if (err.status !== 409) {
	      throw err;
	    }
	    return upsert(db, doc._id, diffFun);
	  });
	}
	
	// BEGIN Math.uuid.js
	
	/*!
	Math.uuid.js (v1.4)
	http://www.broofa.com
	mailto:robert@broofa.com
	
	Copyright (c) 2010 Robert Kieffer
	Dual licensed under the MIT and GPL licenses.
	*/
	
	/*
	 * Generate a random uuid.
	 *
	 * USAGE: Math.uuid(length, radix)
	 *   length - the desired number of characters
	 *   radix  - the number of allowable values for each character.
	 *
	 * EXAMPLES:
	 *   // No arguments  - returns RFC4122, version 4 ID
	 *   >>> Math.uuid()
	 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
	 *
	 *   // One argument - returns ID of the specified length
	 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
	 *   "VcydxgltxrVZSTV"
	 *
	 *   // Two arguments - returns ID of the specified length, and radix. 
	 *   // (Radix must be <= 62)
	 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
	 *   "01001010"
	 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
	 *   "47473046"
	 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
	 *   "098F4D35"
	 */
	var chars = (
	  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
	  'abcdefghijklmnopqrstuvwxyz'
	).split('');
	function getValue(radix) {
	  return 0 | Math.random() * radix;
	}
	function uuid(len, radix) {
	  radix = radix || chars.length;
	  var out = '';
	  var i = -1;
	
	  if (len) {
	    // Compact form
	    while (++i < len) {
	      out += chars[getValue(radix)];
	    }
	    return out;
	  }
	    // rfc4122, version 4 form
	    // Fill in random data.  At i==19 set the high bits of clock sequence as
	    // per rfc4122, sec. 4.1.5
	  while (++i < 36) {
	    switch (i) {
	      case 8:
	      case 13:
	      case 18:
	      case 23:
	        out += '-';
	        break;
	      case 19:
	        out += chars[(getValue(16) & 0x3) | 0x8];
	        break;
	      default:
	        out += chars[getValue(16)];
	    }
	  }
	
	  return out;
	}
	
	// We fetch all leafs of the revision tree, and sort them based on tree length
	// and whether they were deleted, undeleted documents with the longest revision
	// tree (most edits) win
	// The final sort algorithm is slightly documented in a sidebar here:
	// http://guide.couchdb.org/draft/conflicts.html
	function winningRev(metadata) {
	  var winningId;
	  var winningPos;
	  var winningDeleted;
	  var toVisit = metadata.rev_tree.slice();
	  var node;
	  while ((node = toVisit.pop())) {
	    var tree = node.ids;
	    var branches = tree[2];
	    var pos = node.pos;
	    if (branches.length) { // non-leaf
	      for (var i = 0, len = branches.length; i < len; i++) {
	        toVisit.push({pos: pos + 1, ids: branches[i]});
	      }
	      continue;
	    }
	    var deleted = !!tree[1].deleted;
	    var id = tree[0];
	    // sort by deleted, then pos, then id
	    if (!winningId || (winningDeleted !== deleted ? winningDeleted :
	        winningPos !== pos ? winningPos < pos : winningId < id)) {
	      winningId = id;
	      winningPos = pos;
	      winningDeleted = deleted;
	    }
	  }
	
	  return winningPos + '-' + winningId;
	}
	
	// Pretty much all below can be combined into a higher order function to
	// traverse revisions
	// The return value from the callback will be passed as context to all
	// children of that node
	function traverseRevTree(revs, callback) {
	  var toVisit = revs.slice();
	
	  var node;
	  while ((node = toVisit.pop())) {
	    var pos = node.pos;
	    var tree = node.ids;
	    var branches = tree[2];
	    var newCtx =
	      callback(branches.length === 0, pos, tree[0], node.ctx, tree[1]);
	    for (var i = 0, len = branches.length; i < len; i++) {
	      toVisit.push({pos: pos + 1, ids: branches[i], ctx: newCtx});
	    }
	  }
	}
	
	function sortByPos(a, b) {
	  return a.pos - b.pos;
	}
	
	function collectLeaves(revs) {
	  var leaves = [];
	  traverseRevTree(revs, function (isLeaf, pos, id, acc, opts) {
	    if (isLeaf) {
	      leaves.push({rev: pos + "-" + id, pos: pos, opts: opts});
	    }
	  });
	  leaves.sort(sortByPos).reverse();
	  for (var i = 0, len = leaves.length; i < len; i++) {
	    delete leaves[i].pos;
	  }
	  return leaves;
	}
	
	// returns revs of all conflicts that is leaves such that
	// 1. are not deleted and
	// 2. are different than winning revision
	function collectConflicts(metadata) {
	  var win = winningRev(metadata);
	  var leaves = collectLeaves(metadata.rev_tree);
	  var conflicts = [];
	  for (var i = 0, len = leaves.length; i < len; i++) {
	    var leaf = leaves[i];
	    if (leaf.rev !== win && !leaf.opts.deleted) {
	      conflicts.push(leaf.rev);
	    }
	  }
	  return conflicts;
	}
	
	// compact a tree by marking its non-leafs as missing,
	// and return a list of revs to delete
	function compactTree(metadata) {
	  var revs = [];
	  traverseRevTree(metadata.rev_tree, function (isLeaf, pos,
	                                               revHash, ctx, opts) {
	    if (opts.status === 'available' && !isLeaf) {
	      revs.push(pos + '-' + revHash);
	      opts.status = 'missing';
	    }
	  });
	  return revs;
	}
	
	// build up a list of all the paths to the leafs in this revision tree
	function rootToLeaf(revs) {
	  var paths = [];
	  var toVisit = revs.slice();
	  var node;
	  while ((node = toVisit.pop())) {
	    var pos = node.pos;
	    var tree = node.ids;
	    var id = tree[0];
	    var opts = tree[1];
	    var branches = tree[2];
	    var isLeaf = branches.length === 0;
	
	    var history = node.history ? node.history.slice() : [];
	    history.push({id: id, opts: opts});
	    if (isLeaf) {
	      paths.push({pos: (pos + 1 - history.length), ids: history});
	    }
	    for (var i = 0, len = branches.length; i < len; i++) {
	      toVisit.push({pos: pos + 1, ids: branches[i], history: history});
	    }
	  }
	  return paths.reverse();
	}
	
	function sortByPos$1(a, b) {
	  return a.pos - b.pos;
	}
	
	// classic binary search
	function binarySearch(arr, item, comparator) {
	  var low = 0;
	  var high = arr.length;
	  var mid;
	  while (low < high) {
	    mid = (low + high) >>> 1;
	    if (comparator(arr[mid], item) < 0) {
	      low = mid + 1;
	    } else {
	      high = mid;
	    }
	  }
	  return low;
	}
	
	// assuming the arr is sorted, insert the item in the proper place
	function insertSorted(arr, item, comparator) {
	  var idx = binarySearch(arr, item, comparator);
	  arr.splice(idx, 0, item);
	}
	
	// Turn a path as a flat array into a tree with a single branch.
	// If any should be stemmed from the beginning of the array, that's passed
	// in as the second argument
	function pathToTree(path, numStemmed) {
	  var root;
	  var leaf;
	  for (var i = numStemmed, len = path.length; i < len; i++) {
	    var node = path[i];
	    var currentLeaf = [node.id, node.opts, []];
	    if (leaf) {
	      leaf[2].push(currentLeaf);
	      leaf = currentLeaf;
	    } else {
	      root = leaf = currentLeaf;
	    }
	  }
	  return root;
	}
	
	// compare the IDs of two trees
	function compareTree(a, b) {
	  return a[0] < b[0] ? -1 : 1;
	}
	
	// Merge two trees together
	// The roots of tree1 and tree2 must be the same revision
	function mergeTree(in_tree1, in_tree2) {
	  var queue = [{tree1: in_tree1, tree2: in_tree2}];
	  var conflicts = false;
	  while (queue.length > 0) {
	    var item = queue.pop();
	    var tree1 = item.tree1;
	    var tree2 = item.tree2;
	
	    if (tree1[1].status || tree2[1].status) {
	      tree1[1].status =
	        (tree1[1].status ===  'available' ||
	        tree2[1].status === 'available') ? 'available' : 'missing';
	    }
	
	    for (var i = 0; i < tree2[2].length; i++) {
	      if (!tree1[2][0]) {
	        conflicts = 'new_leaf';
	        tree1[2][0] = tree2[2][i];
	        continue;
	      }
	
	      var merged = false;
	      for (var j = 0; j < tree1[2].length; j++) {
	        if (tree1[2][j][0] === tree2[2][i][0]) {
	          queue.push({tree1: tree1[2][j], tree2: tree2[2][i]});
	          merged = true;
	        }
	      }
	      if (!merged) {
	        conflicts = 'new_branch';
	        insertSorted(tree1[2], tree2[2][i], compareTree);
	      }
	    }
	  }
	  return {conflicts: conflicts, tree: in_tree1};
	}
	
	function doMerge(tree, path, dontExpand) {
	  var restree = [];
	  var conflicts = false;
	  var merged = false;
	  var res;
	
	  if (!tree.length) {
	    return {tree: [path], conflicts: 'new_leaf'};
	  }
	
	  for (var i = 0, len = tree.length; i < len; i++) {
	    var branch = tree[i];
	    if (branch.pos === path.pos && branch.ids[0] === path.ids[0]) {
	      // Paths start at the same position and have the same root, so they need
	      // merged
	      res = mergeTree(branch.ids, path.ids);
	      restree.push({pos: branch.pos, ids: res.tree});
	      conflicts = conflicts || res.conflicts;
	      merged = true;
	    } else if (dontExpand !== true) {
	      // The paths start at a different position, take the earliest path and
	      // traverse up until it as at the same point from root as the path we
	      // want to merge.  If the keys match we return the longer path with the
	      // other merged After stemming we dont want to expand the trees
	
	      var t1 = branch.pos < path.pos ? branch : path;
	      var t2 = branch.pos < path.pos ? path : branch;
	      var diff = t2.pos - t1.pos;
	
	      var candidateParents = [];
	
	      var trees = [];
	      trees.push({ids: t1.ids, diff: diff, parent: null, parentIdx: null});
	      while (trees.length > 0) {
	        var item = trees.pop();
	        if (item.diff === 0) {
	          if (item.ids[0] === t2.ids[0]) {
	            candidateParents.push(item);
	          }
	          continue;
	        }
	        var elements = item.ids[2];
	        for (var j = 0, elementsLen = elements.length; j < elementsLen; j++) {
	          trees.push({
	            ids: elements[j],
	            diff: item.diff - 1,
	            parent: item.ids,
	            parentIdx: j
	          });
	        }
	      }
	
	      var el = candidateParents[0];
	
	      if (!el) {
	        restree.push(branch);
	      } else {
	        res = mergeTree(el.ids, t2.ids);
	        el.parent[2][el.parentIdx] = res.tree;
	        restree.push({pos: t1.pos, ids: t1.ids});
	        conflicts = conflicts || res.conflicts;
	        merged = true;
	      }
	    } else {
	      restree.push(branch);
	    }
	  }
	
	  // We didnt find
	  if (!merged) {
	    restree.push(path);
	  }
	
	  restree.sort(sortByPos$1);
	
	  return {
	    tree: restree,
	    conflicts: conflicts || 'internal_node'
	  };
	}
	
	// To ensure we dont grow the revision tree infinitely, we stem old revisions
	function stem(tree, depth) {
	  // First we break out the tree into a complete list of root to leaf paths
	  var paths = rootToLeaf(tree);
	  var maybeStem = {};
	
	  var result;
	  for (var i = 0, len = paths.length; i < len; i++) {
	    // Then for each path, we cut off the start of the path based on the
	    // `depth` to stem to, and generate a new set of flat trees
	    var path = paths[i];
	    var stemmed = path.ids;
	    var numStemmed = Math.max(0, stemmed.length - depth);
	    var stemmedNode = {
	      pos: path.pos + numStemmed,
	      ids: pathToTree(stemmed, numStemmed)
	    };
	
	    for (var s = 0; s < numStemmed; s++) {
	      var rev = (path.pos + s) + '-' + stemmed[s].id;
	      maybeStem[rev] = true;
	    }
	
	    // Then we remerge all those flat trees together, ensuring that we dont
	    // connect trees that would go beyond the depth limit
	    if (result) {
	      result = doMerge(result, stemmedNode, true).tree;
	    } else {
	      result = [stemmedNode];
	    }
	  }
	
	  traverseRevTree(result, function (isLeaf, pos, revHash) {
	    // some revisions may have been removed in a branch but not in another
	    delete maybeStem[pos + '-' + revHash];
	  });
	
	  return {
	    tree: result,
	    revs: Object.keys(maybeStem)
	  };
	}
	
	function merge(tree, path, depth) {
	  var newTree = doMerge(tree, path);
	  var stemmed = stem(newTree.tree, depth);
	  return {
	    tree: stemmed.tree,
	    stemmedRevs: stemmed.revs,
	    conflicts: newTree.conflicts
	  };
	}
	
	// return true if a rev exists in the rev tree, false otherwise
	function revExists(revs, rev) {
	  var toVisit = revs.slice();
	  var splitRev = rev.split('-');
	  var targetPos = parseInt(splitRev[0], 10);
	  var targetId = splitRev[1];
	
	  var node;
	  while ((node = toVisit.pop())) {
	    if (node.pos === targetPos && node.ids[0] === targetId) {
	      return true;
	    }
	    var branches = node.ids[2];
	    for (var i = 0, len = branches.length; i < len; i++) {
	      toVisit.push({pos: node.pos + 1, ids: branches[i]});
	    }
	  }
	  return false;
	}
	
	function getTrees(node) {
	  return node.ids;
	}
	
	// check if a specific revision of a doc has been deleted
	//  - metadata: the metadata object from the doc store
	//  - rev: (optional) the revision to check. defaults to winning revision
	function isDeleted(metadata, rev) {
	  if (!rev) {
	    rev = winningRev(metadata);
	  }
	  var id = rev.substring(rev.indexOf('-') + 1);
	  var toVisit = metadata.rev_tree.map(getTrees);
	
	  var tree;
	  while ((tree = toVisit.pop())) {
	    if (tree[0] === id) {
	      return !!tree[1].deleted;
	    }
	    toVisit = toVisit.concat(tree[2]);
	  }
	}
	
	function isLocalId(id) {
	  return (/^_local/).test(id);
	}
	
	function evalFilter(input) {
	  return scopedEval('return ' + input + ';', {});
	}
	
	function evalView(input) {
	  /* jshint evil:true */
	  return new Function('doc', [
	    'var emitted = false;',
	    'var emit = function (a, b) {',
	    '  emitted = true;',
	    '};',
	    'var view = ' + input + ';',
	    'view(doc);',
	    'if (emitted) {',
	    '  return true;',
	    '}'
	  ].join('\n'));
	}
	
	inherits(Changes, events.EventEmitter);
	
	function tryCatchInChangeListener(self, change) {
	  // isolate try/catches to avoid V8 deoptimizations
	  try {
	    self.emit('change', change);
	  } catch (e) {
	    guardedConsole('error', 'Error in .on("change", function):', e);
	  }
	}
	
	function Changes(db, opts, callback) {
	  events.EventEmitter.call(this);
	  var self = this;
	  this.db = db;
	  opts = opts ? clone(opts) : {};
	  var complete = opts.complete = once(function (err, resp) {
	    if (err) {
	      if (listenerCount(self, 'error') > 0) {
	        self.emit('error', err);
	      }
	    } else {
	      self.emit('complete', resp);
	    }
	    self.removeAllListeners();
	    db.removeListener('destroyed', onDestroy);
	  });
	  if (callback) {
	    self.on('complete', function (resp) {
	      callback(null, resp);
	    });
	    self.on('error', callback);
	  }
	  function onDestroy() {
	    self.cancel();
	  }
	  db.once('destroyed', onDestroy);
	
	  opts.onChange = function (change) {
	    /* istanbul ignore if */
	    if (opts.isCancelled) {
	      return;
	    }
	    tryCatchInChangeListener(self, change);
	    if (self.startSeq && self.startSeq <= change.seq) {
	      self.startSeq = false;
	    }
	  };
	
	  var promise = new PouchPromise(function (fulfill, reject) {
	    opts.complete = function (err, res) {
	      if (err) {
	        reject(err);
	      } else {
	        fulfill(res);
	      }
	    };
	  });
	  self.once('cancel', function () {
	    db.removeListener('destroyed', onDestroy);
	    opts.complete(null, {status: 'cancelled'});
	  });
	  this.then = promise.then.bind(promise);
	  this['catch'] = promise['catch'].bind(promise);
	  this.then(function (result) {
	    complete(null, result);
	  }, complete);
	
	
	
	  if (!db.taskqueue.isReady) {
	    db.taskqueue.addTask(function () {
	      if (self.isCancelled) {
	        self.emit('cancel');
	      } else {
	        self.doChanges(opts);
	      }
	    });
	  } else {
	    self.doChanges(opts);
	  }
	}
	Changes.prototype.cancel = function () {
	  this.isCancelled = true;
	  if (this.db.taskqueue.isReady) {
	    this.emit('cancel');
	  }
	};
	function processChange(doc, metadata, opts) {
	  var changeList = [{rev: doc._rev}];
	  if (opts.style === 'all_docs') {
	    changeList = collectLeaves(metadata.rev_tree)
	    .map(function (x) { return {rev: x.rev}; });
	  }
	  var change = {
	    id: metadata.id,
	    changes: changeList,
	    doc: doc
	  };
	
	  if (isDeleted(metadata, doc._rev)) {
	    change.deleted = true;
	  }
	  if (opts.conflicts) {
	    change.doc._conflicts = collectConflicts(metadata);
	    if (!change.doc._conflicts.length) {
	      delete change.doc._conflicts;
	    }
	  }
	  return change;
	}
	
	Changes.prototype.doChanges = function (opts) {
	  var self = this;
	  var callback = opts.complete;
	
	  opts = clone(opts);
	  if ('live' in opts && !('continuous' in opts)) {
	    opts.continuous = opts.live;
	  }
	  opts.processChange = processChange;
	
	  if (opts.since === 'latest') {
	    opts.since = 'now';
	  }
	  if (!opts.since) {
	    opts.since = 0;
	  }
	  if (opts.since === 'now') {
	    this.db.info().then(function (info) {
	      /* istanbul ignore if */
	      if (self.isCancelled) {
	        callback(null, {status: 'cancelled'});
	        return;
	      }
	      opts.since = info.update_seq;
	      self.doChanges(opts);
	    }, callback);
	    return;
	  }
	
	  if (opts.continuous && opts.since !== 'now') {
	    this.db.info().then(function (info) {
	      self.startSeq = info.update_seq;
	    /* istanbul ignore next */
	    }, function (err) {
	      if (err.id === 'idbNull') {
	        // db closed before this returned thats ok
	        return;
	      }
	      throw err;
	    });
	  }
	
	  if (opts.view && !opts.filter) {
	    opts.filter = '_view';
	  }
	
	  if (opts.filter && typeof opts.filter === 'string') {
	    if (opts.filter === '_view') {
	      opts.view = normalizeDesignDocFunctionName(opts.view);
	    } else {
	      opts.filter = normalizeDesignDocFunctionName(opts.filter);
	    }
	
	    if (this.db.type() !== 'http' && !opts.doc_ids) {
	      return this.filterChanges(opts);
	    }
	  }
	
	  if (!('descending' in opts)) {
	    opts.descending = false;
	  }
	
	  // 0 and 1 should return 1 document
	  opts.limit = opts.limit === 0 ? 1 : opts.limit;
	  opts.complete = callback;
	  var newPromise = this.db._changes(opts);
	  if (newPromise && typeof newPromise.cancel === 'function') {
	    var cancel = self.cancel;
	    self.cancel = getArguments(function (args) {
	      newPromise.cancel();
	      cancel.apply(this, args);
	    });
	  }
	};
	
	Changes.prototype.filterChanges = function (opts) {
	  var self = this;
	  var callback = opts.complete;
	  if (opts.filter === '_view') {
	    if (!opts.view || typeof opts.view !== 'string') {
	      var err = createError(BAD_REQUEST,
	        '`view` filter parameter not found or invalid.');
	      return callback(err);
	    }
	    // fetch a view from a design doc, make it behave like a filter
	    var viewName = parseDesignDocFunctionName(opts.view);
	    this.db.get('_design/' + viewName[0], function (err, ddoc) {
	      /* istanbul ignore if */
	      if (self.isCancelled) {
	        return callback(null, {status: 'cancelled'});
	      }
	      /* istanbul ignore next */
	      if (err) {
	        return callback(generateErrorFromResponse(err));
	      }
	      var mapFun = ddoc && ddoc.views && ddoc.views[viewName[1]] &&
	        ddoc.views[viewName[1]].map;
	      if (!mapFun) {
	        return callback(createError(MISSING_DOC,
	          (ddoc.views ? 'missing json key: ' + viewName[1] :
	            'missing json key: views')));
	      }
	      opts.filter = evalView(mapFun);
	      self.doChanges(opts);
	    });
	  } else {
	    // fetch a filter from a design doc
	    var filterName = parseDesignDocFunctionName(opts.filter);
	    if (!filterName) {
	      return self.doChanges(opts);
	    }
	    this.db.get('_design/' + filterName[0], function (err, ddoc) {
	      /* istanbul ignore if */
	      if (self.isCancelled) {
	        return callback(null, {status: 'cancelled'});
	      }
	      /* istanbul ignore next */
	      if (err) {
	        return callback(generateErrorFromResponse(err));
	      }
	      var filterFun = ddoc && ddoc.filters && ddoc.filters[filterName[1]];
	      if (!filterFun) {
	        return callback(createError(MISSING_DOC,
	          ((ddoc && ddoc.filters) ? 'missing json key: ' + filterName[1]
	            : 'missing json key: filters')));
	      }
	      opts.filter = evalFilter(filterFun);
	      self.doChanges(opts);
	    });
	  }
	};
	
	/*
	 * A generic pouch adapter
	 */
	
	function compare(left, right) {
	  return left < right ? -1 : left > right ? 1 : 0;
	}
	
	// returns first element of arr satisfying callback predicate
	function arrayFirst(arr, callback) {
	  for (var i = 0; i < arr.length; i++) {
	    if (callback(arr[i], i) === true) {
	      return arr[i];
	    }
	  }
	}
	
	// Wrapper for functions that call the bulkdocs api with a single doc,
	// if the first result is an error, return an error
	function yankError(callback) {
	  return function (err, results) {
	    if (err || (results[0] && results[0].error)) {
	      callback(err || results[0]);
	    } else {
	      callback(null, results.length ? results[0]  : results);
	    }
	  };
	}
	
	// clean docs given to us by the user
	function cleanDocs(docs) {
	  for (var i = 0; i < docs.length; i++) {
	    var doc = docs[i];
	    if (doc._deleted) {
	      delete doc._attachments; // ignore atts for deleted docs
	    } else if (doc._attachments) {
	      // filter out extraneous keys from _attachments
	      var atts = Object.keys(doc._attachments);
	      for (var j = 0; j < atts.length; j++) {
	        var att = atts[j];
	        doc._attachments[att] = pick(doc._attachments[att],
	          ['data', 'digest', 'content_type', 'length', 'revpos', 'stub']);
	      }
	    }
	  }
	}
	
	// compare two docs, first by _id then by _rev
	function compareByIdThenRev(a, b) {
	  var idCompare = compare(a._id, b._id);
	  if (idCompare !== 0) {
	    return idCompare;
	  }
	  var aStart = a._revisions ? a._revisions.start : 0;
	  var bStart = b._revisions ? b._revisions.start : 0;
	  return compare(aStart, bStart);
	}
	
	// for every node in a revision tree computes its distance from the closest
	// leaf
	function computeHeight(revs) {
	  var height = {};
	  var edges = [];
	  traverseRevTree(revs, function (isLeaf, pos, id, prnt) {
	    var rev = pos + "-" + id;
	    if (isLeaf) {
	      height[rev] = 0;
	    }
	    if (prnt !== undefined) {
	      edges.push({from: prnt, to: rev});
	    }
	    return rev;
	  });
	
	  edges.reverse();
	  edges.forEach(function (edge) {
	    if (height[edge.from] === undefined) {
	      height[edge.from] = 1 + height[edge.to];
	    } else {
	      height[edge.from] = Math.min(height[edge.from], 1 + height[edge.to]);
	    }
	  });
	  return height;
	}
	
	function allDocsKeysQuery(api, opts, callback) {
	  var keys =  ('limit' in opts) ?
	      opts.keys.slice(opts.skip, opts.limit + opts.skip) :
	      (opts.skip > 0) ? opts.keys.slice(opts.skip) : opts.keys;
	  if (opts.descending) {
	    keys.reverse();
	  }
	  if (!keys.length) {
	    return api._allDocs({limit: 0}, callback);
	  }
	  var finalResults = {
	    offset: opts.skip
	  };
	  return PouchPromise.all(keys.map(function (key) {
	    var subOpts = jsExtend.extend({key: key, deleted: 'ok'}, opts);
	    ['limit', 'skip', 'keys'].forEach(function (optKey) {
	      delete subOpts[optKey];
	    });
	    return new PouchPromise(function (resolve, reject) {
	      api._allDocs(subOpts, function (err, res) {
	        /* istanbul ignore if */
	        if (err) {
	          return reject(err);
	        }
	        finalResults.total_rows = res.total_rows;
	        resolve(res.rows[0] || {key: key, error: 'not_found'});
	      });
	    });
	  })).then(function (results) {
	    finalResults.rows = results;
	    return finalResults;
	  });
	}
	
	// all compaction is done in a queue, to avoid attaching
	// too many listeners at once
	function doNextCompaction(self) {
	  var task = self._compactionQueue[0];
	  var opts = task.opts;
	  var callback = task.callback;
	  self.get('_local/compaction').catch(function () {
	    return false;
	  }).then(function (doc) {
	    if (doc && doc.last_seq) {
	      opts.last_seq = doc.last_seq;
	    }
	    self._compact(opts, function (err, res) {
	      /* istanbul ignore if */
	      if (err) {
	        callback(err);
	      } else {
	        callback(null, res);
	      }
	      process.nextTick(function () {
	        self._compactionQueue.shift();
	        if (self._compactionQueue.length) {
	          doNextCompaction(self);
	        }
	      });
	    });
	  });
	}
	
	function attachmentNameError(name) {
	  if (name.charAt(0) === '_') {
	    return name + 'is not a valid attachment name, attachment ' +
	      'names cannot start with \'_\'';
	  }
	  return false;
	}
	
	inherits(AbstractPouchDB, events.EventEmitter);
	
	function AbstractPouchDB() {
	  events.EventEmitter.call(this);
	}
	
	AbstractPouchDB.prototype.post =
	  adapterFun('post', function (doc, opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	  if (typeof doc !== 'object' || Array.isArray(doc)) {
	    return callback(createError(NOT_AN_OBJECT));
	  }
	  this.bulkDocs({docs: [doc]}, opts, yankError(callback));
	});
	
	AbstractPouchDB.prototype.put =
	  adapterFun('put', getArguments(function (args) {
	  var temp, temptype, opts, callback;
	  var warned = false;
	  var doc = args.shift();
	  var id = '_id' in doc;
	  if (typeof doc !== 'object' || Array.isArray(doc)) {
	    callback = args.pop();
	    return callback(createError(NOT_AN_OBJECT));
	  }
	
	  function warn() {
	    if (warned) {
	      return;
	    }
	    guardedConsole('warn', 'db.put(doc, id, rev) has been deprecated and will be ' +
	                 'removed in a future release, please use ' +
	                 'db.put({_id: id, _rev: rev}) instead');
	    warned = true;
	  }
	
	  /* eslint no-constant-condition: 0 */
	  while (true) {
	    temp = args.shift();
	    temptype = typeof temp;
	    if (temptype === "string" && !id) {
	      warn();
	      doc._id = temp;
	      id = true;
	    } else if (temptype === "string" && id && !('_rev' in doc)) {
	      warn();
	      doc._rev = temp;
	    } else if (temptype === "object") {
	      opts = temp;
	    } else if (temptype === "function") {
	      callback = temp;
	    }
	    if (!args.length) {
	      break;
	    }
	  }
	  opts = opts || {};
	  invalidIdError(doc._id);
	  if (isLocalId(doc._id) && typeof this._putLocal === 'function') {
	    if (doc._deleted) {
	      return this._removeLocal(doc, callback);
	    } else {
	      return this._putLocal(doc, callback);
	    }
	  }
	  this.bulkDocs({docs: [doc]}, opts, yankError(callback));
	}));
	
	AbstractPouchDB.prototype.putAttachment =
	  adapterFun('putAttachment', function (docId, attachmentId, rev,
	                                              blob, type) {
	  var api = this;
	  if (typeof type === 'function') {
	    type = blob;
	    blob = rev;
	    rev = null;
	  }
	  // Lets fix in https://github.com/pouchdb/pouchdb/issues/3267
	  /* istanbul ignore if */
	  if (typeof type === 'undefined') {
	    type = blob;
	    blob = rev;
	    rev = null;
	  }
	
	  function createAttachment(doc) {
	    var prevrevpos = '_rev' in doc ? parseInt(doc._rev, 10) : 0;
	    doc._attachments = doc._attachments || {};
	    doc._attachments[attachmentId] = {
	      content_type: type,
	      data: blob,
	      revpos: ++prevrevpos
	    };
	    return api.put(doc);
	  }
	
	  return api.get(docId).then(function (doc) {
	    if (doc._rev !== rev) {
	      throw createError(REV_CONFLICT);
	    }
	
	    return createAttachment(doc);
	  }, function (err) {
	     // create new doc
	    /* istanbul ignore else */
	    if (err.reason === MISSING_DOC.message) {
	      return createAttachment({_id: docId});
	    } else {
	      throw err;
	    }
	  });
	});
	
	AbstractPouchDB.prototype.removeAttachment =
	  adapterFun('removeAttachment', function (docId, attachmentId, rev,
	                                                 callback) {
	  var self = this;
	  self.get(docId, function (err, obj) {
	    /* istanbul ignore if */
	    if (err) {
	      callback(err);
	      return;
	    }
	    if (obj._rev !== rev) {
	      callback(createError(REV_CONFLICT));
	      return;
	    }
	    /* istanbul ignore if */
	    if (!obj._attachments) {
	      return callback();
	    }
	    delete obj._attachments[attachmentId];
	    if (Object.keys(obj._attachments).length === 0) {
	      delete obj._attachments;
	    }
	    self.put(obj, callback);
	  });
	});
	
	AbstractPouchDB.prototype.remove =
	  adapterFun('remove', function (docOrId, optsOrRev, opts, callback) {
	  var doc;
	  if (typeof optsOrRev === 'string') {
	    // id, rev, opts, callback style
	    doc = {
	      _id: docOrId,
	      _rev: optsOrRev
	    };
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	  } else {
	    // doc, opts, callback style
	    doc = docOrId;
	    if (typeof optsOrRev === 'function') {
	      callback = optsOrRev;
	      opts = {};
	    } else {
	      callback = opts;
	      opts = optsOrRev;
	    }
	  }
	  opts = opts || {};
	  opts.was_delete = true;
	  var newDoc = {_id: doc._id, _rev: (doc._rev || opts.rev)};
	  newDoc._deleted = true;
	  if (isLocalId(newDoc._id) && typeof this._removeLocal === 'function') {
	    return this._removeLocal(doc, callback);
	  }
	  this.bulkDocs({docs: [newDoc]}, opts, yankError(callback));
	});
	
	AbstractPouchDB.prototype.revsDiff =
	  adapterFun('revsDiff', function (req, opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	  var ids = Object.keys(req);
	
	  if (!ids.length) {
	    return callback(null, {});
	  }
	
	  var count = 0;
	  var missing = new pouchdbCollections.Map();
	
	  function addToMissing(id, revId) {
	    if (!missing.has(id)) {
	      missing.set(id, {missing: []});
	    }
	    missing.get(id).missing.push(revId);
	  }
	
	  function processDoc(id, rev_tree) {
	    // Is this fast enough? Maybe we should switch to a set simulated by a map
	    var missingForId = req[id].slice(0);
	    traverseRevTree(rev_tree, function (isLeaf, pos, revHash, ctx,
	      opts) {
	        var rev = pos + '-' + revHash;
	        var idx = missingForId.indexOf(rev);
	        if (idx === -1) {
	          return;
	        }
	
	        missingForId.splice(idx, 1);
	        /* istanbul ignore if */
	        if (opts.status !== 'available') {
	          addToMissing(id, rev);
	        }
	      });
	
	    // Traversing the tree is synchronous, so now `missingForId` contains
	    // revisions that were not found in the tree
	    missingForId.forEach(function (rev) {
	      addToMissing(id, rev);
	    });
	  }
	
	  ids.map(function (id) {
	    this._getRevisionTree(id, function (err, rev_tree) {
	      if (err && err.status === 404 && err.message === 'missing') {
	        missing.set(id, {missing: req[id]});
	      } else if (err) {
	        /* istanbul ignore next */
	        return callback(err);
	      } else {
	        processDoc(id, rev_tree);
	      }
	
	      if (++count === ids.length) {
	        // convert LazyMap to object
	        var missingObj = {};
	        missing.forEach(function (value, key) {
	          missingObj[key] = value;
	        });
	        return callback(null, missingObj);
	      }
	    });
	  }, this);
	});
	
	// _bulk_get API for faster replication, as described in
	// https://github.com/apache/couchdb-chttpd/pull/33
	// At the "abstract" level, it will just run multiple get()s in
	// parallel, because this isn't much of a performance cost
	// for local databases (except the cost of multiple transactions, which is
	// small). The http adapter overrides this in order
	// to do a more efficient single HTTP request.
	AbstractPouchDB.prototype.bulkGet =
	  adapterFun('bulkGet', function (opts, callback) {
	  bulkGet(this, opts, callback);
	});
	
	// compact one document and fire callback
	// by compacting we mean removing all revisions which
	// are further from the leaf in revision tree than max_height
	AbstractPouchDB.prototype.compactDocument =
	  adapterFun('compactDocument', function (docId, maxHeight, callback) {
	  var self = this;
	  this._getRevisionTree(docId, function (err, revTree) {
	    /* istanbul ignore if */
	    if (err) {
	      return callback(err);
	    }
	    var height = computeHeight(revTree);
	    var candidates = [];
	    var revs = [];
	    Object.keys(height).forEach(function (rev) {
	      if (height[rev] > maxHeight) {
	        candidates.push(rev);
	      }
	    });
	
	    traverseRevTree(revTree, function (isLeaf, pos, revHash, ctx, opts) {
	      var rev = pos + '-' + revHash;
	      if (opts.status === 'available' && candidates.indexOf(rev) !== -1) {
	        revs.push(rev);
	      }
	    });
	    self._doCompaction(docId, revs, callback);
	  });
	});
	
	// compact the whole database using single document
	// compaction
	AbstractPouchDB.prototype.compact =
	  adapterFun('compact', function (opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	
	  var self = this;
	  opts = opts || {};
	
	  self._compactionQueue = self._compactionQueue || [];
	  self._compactionQueue.push({opts: opts, callback: callback});
	  if (self._compactionQueue.length === 1) {
	    doNextCompaction(self);
	  }
	});
	AbstractPouchDB.prototype._compact = function (opts, callback) {
	  var self = this;
	  var changesOpts = {
	    return_docs: false,
	    last_seq: opts.last_seq || 0
	  };
	  var promises = [];
	
	  function onChange(row) {
	    promises.push(self.compactDocument(row.id, 0));
	  }
	  function onComplete(resp) {
	    var lastSeq = resp.last_seq;
	    PouchPromise.all(promises).then(function () {
	      return upsert(self, '_local/compaction', function deltaFunc(doc) {
	        if (!doc.last_seq || doc.last_seq < lastSeq) {
	          doc.last_seq = lastSeq;
	          return doc;
	        }
	        return false; // somebody else got here first, don't update
	      });
	    }).then(function () {
	      callback(null, {ok: true});
	    }).catch(callback);
	  }
	  self.changes(changesOpts)
	    .on('change', onChange)
	    .on('complete', onComplete)
	    .on('error', callback);
	};
	/* Begin api wrappers. Specific functionality to storage belongs in the
	   _[method] */
	AbstractPouchDB.prototype.get =
	  adapterFun('get', function (id, opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	  if (typeof id !== 'string') {
	    return callback(createError(INVALID_ID));
	  }
	  if (isLocalId(id) && typeof this._getLocal === 'function') {
	    return this._getLocal(id, callback);
	  }
	  var leaves = [], self = this;
	
	  function finishOpenRevs() {
	    var result = [];
	    var count = leaves.length;
	    /* istanbul ignore if */
	    if (!count) {
	      return callback(null, result);
	    }
	    // order with open_revs is unspecified
	    leaves.forEach(function (leaf) {
	      self.get(id, {
	        rev: leaf,
	        revs: opts.revs,
	        attachments: opts.attachments
	      }, function (err, doc) {
	        if (!err) {
	          result.push({ok: doc});
	        } else {
	          result.push({missing: leaf});
	        }
	        count--;
	        if (!count) {
	          callback(null, result);
	        }
	      });
	    });
	  }
	
	  if (opts.open_revs) {
	    if (opts.open_revs === "all") {
	      this._getRevisionTree(id, function (err, rev_tree) {
	        if (err) {
	          return callback(err);
	        }
	        leaves = collectLeaves(rev_tree).map(function (leaf) {
	          return leaf.rev;
	        });
	        finishOpenRevs();
	      });
	    } else {
	      if (Array.isArray(opts.open_revs)) {
	        leaves = opts.open_revs;
	        for (var i = 0; i < leaves.length; i++) {
	          var l = leaves[i];
	          // looks like it's the only thing couchdb checks
	          if (!(typeof (l) === "string" && /^\d+-/.test(l))) {
	            return callback(createError(INVALID_REV));
	          }
	        }
	        finishOpenRevs();
	      } else {
	        return callback(createError(UNKNOWN_ERROR,
	          'function_clause'));
	      }
	    }
	    return; // open_revs does not like other options
	  }
	
	  return this._get(id, opts, function (err, result) {
	    if (err) {
	      return callback(err);
	    }
	
	    var doc = result.doc;
	    var metadata = result.metadata;
	    var ctx = result.ctx;
	
	    if (opts.conflicts) {
	      var conflicts = collectConflicts(metadata);
	      if (conflicts.length) {
	        doc._conflicts = conflicts;
	      }
	    }
	
	    if (isDeleted(metadata, doc._rev)) {
	      doc._deleted = true;
	    }
	
	    if (opts.revs || opts.revs_info) {
	      var paths = rootToLeaf(metadata.rev_tree);
	      var path = arrayFirst(paths, function (arr) {
	        return arr.ids.map(function (x) { return x.id; })
	          .indexOf(doc._rev.split('-')[1]) !== -1;
	      });
	
	      var indexOfRev = path.ids.map(function (x) {return x.id; })
	        .indexOf(doc._rev.split('-')[1]) + 1;
	      var howMany = path.ids.length - indexOfRev;
	      path.ids.splice(indexOfRev, howMany);
	      path.ids.reverse();
	
	      if (opts.revs) {
	        doc._revisions = {
	          start: (path.pos + path.ids.length) - 1,
	          ids: path.ids.map(function (rev) {
	            return rev.id;
	          })
	        };
	      }
	      if (opts.revs_info) {
	        var pos =  path.pos + path.ids.length;
	        doc._revs_info = path.ids.map(function (rev) {
	          pos--;
	          return {
	            rev: pos + '-' + rev.id,
	            status: rev.opts.status
	          };
	        });
	      }
	    }
	
	    if (opts.attachments && doc._attachments) {
	      var attachments = doc._attachments;
	      var count = Object.keys(attachments).length;
	      if (count === 0) {
	        return callback(null, doc);
	      }
	      Object.keys(attachments).forEach(function (key) {
	        this._getAttachment(doc._id, key, attachments[key], {
	          // Previously the revision handling was done in adapter.js
	          // getAttachment, however since idb-next doesnt we need to
	          // pass the rev through
	          rev: doc._rev,
	          binary: opts.binary,
	          ctx: ctx
	        }, function (err, data) {
	          var att = doc._attachments[key];
	          att.data = data;
	          delete att.stub;
	          delete att.length;
	          if (!--count) {
	            callback(null, doc);
	          }
	        });
	      }, self);
	    } else {
	      if (doc._attachments) {
	        for (var key in doc._attachments) {
	          /* istanbul ignore else */
	          if (doc._attachments.hasOwnProperty(key)) {
	            doc._attachments[key].stub = true;
	          }
	        }
	      }
	      callback(null, doc);
	    }
	  });
	});
	
	// TODO: I dont like this, it forces an extra read for every
	// attachment read and enforces a confusing api between
	// adapter.js and the adapter implementation
	AbstractPouchDB.prototype.getAttachment =
	  adapterFun('getAttachment', function (docId, attachmentId, opts,
	                                              callback) {
	  var self = this;
	  if (opts instanceof Function) {
	    callback = opts;
	    opts = {};
	  }
	  this._get(docId, opts, function (err, res) {
	    if (err) {
	      return callback(err);
	    }
	    if (res.doc._attachments && res.doc._attachments[attachmentId]) {
	      opts.ctx = res.ctx;
	      opts.binary = true;
	      self._getAttachment(docId, attachmentId,
	                          res.doc._attachments[attachmentId], opts, callback);
	    } else {
	      return callback(createError(MISSING_DOC));
	    }
	  });
	});
	
	AbstractPouchDB.prototype.allDocs =
	  adapterFun('allDocs', function (opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	  opts.skip = typeof opts.skip !== 'undefined' ? opts.skip : 0;
	  if (opts.start_key) {
	    opts.startkey = opts.start_key;
	  }
	  if (opts.end_key) {
	    opts.endkey = opts.end_key;
	  }
	  if ('keys' in opts) {
	    if (!Array.isArray(opts.keys)) {
	      return callback(new TypeError('options.keys must be an array'));
	    }
	    var incompatibleOpt =
	      ['startkey', 'endkey', 'key'].filter(function (incompatibleOpt) {
	      return incompatibleOpt in opts;
	    })[0];
	    if (incompatibleOpt) {
	      callback(createError(QUERY_PARSE_ERROR,
	        'Query parameter `' + incompatibleOpt +
	        '` is not compatible with multi-get'
	      ));
	      return;
	    }
	    if (this.type() !== 'http') {
	      return allDocsKeysQuery(this, opts, callback);
	    }
	  }
	
	  return this._allDocs(opts, callback);
	});
	
	AbstractPouchDB.prototype.changes = function (opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	  return new Changes(this, opts, callback);
	};
	
	AbstractPouchDB.prototype.close =
	  adapterFun('close', function (callback) {
	  this._closed = true;
	  return this._close(callback);
	});
	
	AbstractPouchDB.prototype.info = adapterFun('info', function (callback) {
	  var self = this;
	  this._info(function (err, info) {
	    if (err) {
	      return callback(err);
	    }
	    // assume we know better than the adapter, unless it informs us
	    info.db_name = info.db_name || self._db_name;
	    info.auto_compaction = !!(self.auto_compaction && self.type() !== 'http');
	    info.adapter = self.type();
	    callback(null, info);
	  });
	});
	
	AbstractPouchDB.prototype.id = adapterFun('id', function (callback) {
	  return this._id(callback);
	});
	
	AbstractPouchDB.prototype.type = function () {
	  /* istanbul ignore next */
	  return (typeof this._type === 'function') ? this._type() : this.adapter;
	};
	
	AbstractPouchDB.prototype.bulkDocs =
	  adapterFun('bulkDocs', function (req, opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	
	  opts = opts || {};
	
	  if (Array.isArray(req)) {
	    req = {
	      docs: req
	    };
	  }
	
	  if (!req || !req.docs || !Array.isArray(req.docs)) {
	    return callback(createError(MISSING_BULK_DOCS));
	  }
	
	  for (var i = 0; i < req.docs.length; ++i) {
	    if (typeof req.docs[i] !== 'object' || Array.isArray(req.docs[i])) {
	      return callback(createError(NOT_AN_OBJECT));
	    }
	  }
	
	  var attachmentError;
	  req.docs.forEach(function (doc) {
	    if (doc._attachments) {
	      Object.keys(doc._attachments).forEach(function (name) {
	        attachmentError = attachmentError || attachmentNameError(name);
	      });
	    }
	  });
	
	  if (attachmentError) {
	    return callback(createError(BAD_REQUEST, attachmentError));
	  }
	
	  if (!('new_edits' in opts)) {
	    if ('new_edits' in req) {
	      opts.new_edits = req.new_edits;
	    } else {
	      opts.new_edits = true;
	    }
	  }
	
	  if (!opts.new_edits && this.type() !== 'http') {
	    // ensure revisions of the same doc are sorted, so that
	    // the local adapter processes them correctly (#2935)
	    req.docs.sort(compareByIdThenRev);
	  }
	
	  cleanDocs(req.docs);
	
	  return this._bulkDocs(req, opts, function (err, res) {
	    if (err) {
	      return callback(err);
	    }
	    if (!opts.new_edits) {
	      // this is what couch does when new_edits is false
	      res = res.filter(function (x) {
	        return x.error;
	      });
	    }
	    callback(null, res);
	  });
	});
	
	AbstractPouchDB.prototype.registerDependentDatabase =
	  adapterFun('registerDependentDatabase', function (dependentDb,
	                                                          callback) {
	  var depDB = new this.constructor(dependentDb, this.__opts);
	
	  function diffFun(doc) {
	    doc.dependentDbs = doc.dependentDbs || {};
	    if (doc.dependentDbs[dependentDb]) {
	      return false; // no update required
	    }
	    doc.dependentDbs[dependentDb] = true;
	    return doc;
	  }
	  upsert(this, '_local/_pouch_dependentDbs', diffFun)
	    .then(function () {
	      callback(null, {db: depDB});
	    }).catch(callback);
	});
	
	AbstractPouchDB.prototype.destroy =
	  adapterFun('destroy', function (opts, callback) {
	
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	
	  var self = this;
	  var usePrefix = 'use_prefix' in self ? self.use_prefix : true;
	
	  function destroyDb() {
	    // call destroy method of the particular adaptor
	    self._destroy(opts, function (err, resp) {
	      if (err) {
	        return callback(err);
	      }
	      self._destroyed = true;
	      self.emit('destroyed');
	      callback(null, resp || { 'ok': true });
	    });
	  }
	
	  if (self.type() === 'http') {
	    // no need to check for dependent DBs if it's a remote DB
	    return destroyDb();
	  }
	
	  self.get('_local/_pouch_dependentDbs', function (err, localDoc) {
	    if (err) {
	      /* istanbul ignore if */
	      if (err.status !== 404) {
	        return callback(err);
	      } else { // no dependencies
	        return destroyDb();
	      }
	    }
	    var dependentDbs = localDoc.dependentDbs;
	    var PouchDB = self.constructor;
	    var deletedMap = Object.keys(dependentDbs).map(function (name) {
	      // use_prefix is only false in the browser
	      /* istanbul ignore next */
	      var trueName = usePrefix ?
	        name.replace(new RegExp('^' + PouchDB.prefix), '') : name;
	      return new PouchDB(trueName, self.__opts).destroy();
	    });
	    PouchPromise.all(deletedMap).then(destroyDb, callback);
	  });
	});
	
	function TaskQueue() {
	  this.isReady = false;
	  this.failed = false;
	  this.queue = [];
	}
	
	TaskQueue.prototype.execute = function () {
	  var fun;
	  if (this.failed) {
	    while ((fun = this.queue.shift())) {
	      fun(this.failed);
	    }
	  } else {
	    while ((fun = this.queue.shift())) {
	      fun();
	    }
	  }
	};
	
	TaskQueue.prototype.fail = function (err) {
	  this.failed = err;
	  this.execute();
	};
	
	TaskQueue.prototype.ready = function (db) {
	  this.isReady = true;
	  this.db = db;
	  this.execute();
	};
	
	TaskQueue.prototype.addTask = function (fun) {
	  this.queue.push(fun);
	  if (this.failed) {
	    this.execute();
	  }
	};
	
	function defaultCallback(err) {
	  /* istanbul ignore next */
	  if (err && global.debug) {
	    guardedConsole('error', err);
	  }
	}
	
	// OK, so here's the deal. Consider this code:
	//     var db1 = new PouchDB('foo');
	//     var db2 = new PouchDB('foo');
	//     db1.destroy();
	// ^ these two both need to emit 'destroyed' events,
	// as well as the PouchDB constructor itself.
	// So we have one db object (whichever one got destroy() called on it)
	// responsible for emitting the initial event, which then gets emitted
	// by the constructor, which then broadcasts it to any other dbs
	// that may have been created with the same name.
	function prepareForDestruction(self, opts) {
	  var name = opts.originalName;
	  var ctor = self.constructor;
	  var destructionListeners = ctor._destructionListeners;
	
	  function onDestroyed() {
	    ctor.emit('destroyed', name);
	  }
	
	  function onConstructorDestroyed() {
	    self.removeListener('destroyed', onDestroyed);
	    self.emit('destroyed', self);
	  }
	
	  self.once('destroyed', onDestroyed);
	
	  // in setup.js, the constructor is primed to listen for destroy events
	  if (!destructionListeners.has(name)) {
	    destructionListeners.set(name, []);
	  }
	  destructionListeners.get(name).push(onConstructorDestroyed);
	}
	
	inherits(PouchDB, AbstractPouchDB);
	function PouchDB(name, opts, callback) {
	
	  /* istanbul ignore if */
	  if (!(this instanceof PouchDB)) {
	    return new PouchDB(name, opts, callback);
	  }
	
	  var self = this;
	  if (typeof opts === 'function' || typeof opts === 'undefined') {
	    callback = opts;
	    opts = {};
	  }
	
	  if (name && typeof name === 'object') {
	    opts = name;
	    name = undefined;
	  }
	
	  if (typeof callback === 'undefined') {
	    callback = defaultCallback;
	  } else {
	    var oldCallback = callback;
	    callback = function () {
	      guardedConsole('warn', 'Using a callback for new PouchDB()' +
	                     'is deprecated.');
	      return oldCallback.apply(null, arguments);
	    };
	  }
	
	  name = name || opts.name;
	  opts = clone(opts);
	  // if name was specified via opts, ignore for the sake of dependentDbs
	  delete opts.name;
	  this.__opts = opts;
	  var oldCB = callback;
	  self.auto_compaction = opts.auto_compaction;
	  self.prefix = PouchDB.prefix;
	  AbstractPouchDB.call(self);
	  self.taskqueue = new TaskQueue();
	  var promise = new PouchPromise(function (fulfill, reject) {
	    callback = function (err, resp) {
	      /* istanbul ignore if */
	      if (err) {
	        return reject(err);
	      }
	      delete resp.then;
	      fulfill(resp);
	    };
	
	    opts = clone(opts);
	    var backend, error;
	    (function () {
	      try {
	
	        if (typeof name !== 'string') {
	          error = new Error('Missing/invalid DB name');
	          error.code = 400;
	          throw error;
	        }
	
	        var prefixedName = (opts.prefix || '') + name;
	        backend = PouchDB.parseAdapter(prefixedName, opts);
	
	        opts.originalName = name;
	        opts.name = backend.name;
	        opts.adapter = opts.adapter || backend.adapter;
	        self._adapter = opts.adapter;
	        debug('pouchdb:adapter')('Picked adapter: ' + opts.adapter);
	
	        self._db_name = name;
	        if (!PouchDB.adapters[opts.adapter]) {
	          error = new Error('Adapter is missing');
	          error.code = 404;
	          throw error;
	        }
	
	        /* istanbul ignore if */
	        if (!PouchDB.adapters[opts.adapter].valid()) {
	          error = new Error('Invalid Adapter');
	          error.code = 404;
	          throw error;
	        }
	      } catch (err) {
	        self.taskqueue.fail(err);
	      }
	    }());
	    if (error) {
	      return reject(error); // constructor error, see above
	    }
	    self.adapter = opts.adapter;
	
	    // needs access to PouchDB;
	    self.replicate = {};
	
	    self.replicate.from = function (url, opts, callback) {
	      return self.constructor.replicate(url, self, opts, callback);
	    };
	
	    self.replicate.to = function (url, opts, callback) {
	      return self.constructor.replicate(self, url, opts, callback);
	    };
	
	    self.sync = function (dbName, opts, callback) {
	      return self.constructor.sync(self, dbName, opts, callback);
	    };
	
	    self.replicate.sync = self.sync;
	
	    PouchDB.adapters[opts.adapter].call(self, opts, function (err) {
	      /* istanbul ignore if */
	      if (err) {
	        self.taskqueue.fail(err);
	        callback(err);
	        return;
	      }
	      prepareForDestruction(self, opts);
	
	      self.emit('created', self);
	      PouchDB.emit('created', opts.originalName);
	      self.taskqueue.ready(self);
	      callback(null, self);
	    });
	
	  });
	  promise.then(function (resp) {
	    oldCB(null, resp);
	  }, oldCB);
	  self.then = promise.then.bind(promise);
	  self.catch = promise.catch.bind(promise);
	}
	
	PouchDB.debug = debug;
	
	PouchDB.adapters = {};
	PouchDB.preferredAdapters = [];
	
	PouchDB.prefix = '_pouch_';
	
	var eventEmitter = new events.EventEmitter();
	
	function setUpEventEmitter(Pouch) {
	  Object.keys(events.EventEmitter.prototype).forEach(function (key) {
	    if (typeof events.EventEmitter.prototype[key] === 'function') {
	      Pouch[key] = eventEmitter[key].bind(eventEmitter);
	    }
	  });
	
	  // these are created in constructor.js, and allow us to notify each DB with
	  // the same name that it was destroyed, via the constructor object
	  var destructListeners = Pouch._destructionListeners = new pouchdbCollections.Map();
	  Pouch.on('destroyed', function onConstructorDestroyed(name) {
	    destructListeners.get(name).forEach(function (callback) {
	      callback();
	    });
	    destructListeners.delete(name);
	  });
	}
	
	setUpEventEmitter(PouchDB);
	
	PouchDB.parseAdapter = function (name, opts) {
	  var match = name.match(/([a-z\-]*):\/\/(.*)/);
	  var adapter, adapterName;
	  if (match) {
	    // the http adapter expects the fully qualified name
	    name = /http(s?)/.test(match[1]) ? match[1] + '://' + match[2] : match[2];
	    adapter = match[1];
	    /* istanbul ignore if */
	    if (!PouchDB.adapters[adapter].valid()) {
	      throw 'Invalid adapter';
	    }
	    return {name: name, adapter: match[1]};
	  }
	
	  // check for browsers that have been upgraded from websql-only to websql+idb
	  var skipIdb = 'idb' in PouchDB.adapters && 'websql' in PouchDB.adapters &&
	    hasLocalStorage() &&
	    localStorage['_pouch__websqldb_' + PouchDB.prefix + name];
	
	
	  if (opts.adapter) {
	    adapterName = opts.adapter;
	  } else if (typeof opts !== 'undefined' && opts.db) {
	    adapterName = 'leveldb';
	  } else { // automatically determine adapter
	    for (var i = 0; i < PouchDB.preferredAdapters.length; ++i) {
	      adapterName = PouchDB.preferredAdapters[i];
	      if (adapterName in PouchDB.adapters) {
	        /* istanbul ignore if */
	        if (skipIdb && adapterName === 'idb') {
	          // log it, because this can be confusing during development
	          guardedConsole('log', 'PouchDB is downgrading "' + name + '" to WebSQL to' +
	            ' avoid data loss, because it was already opened with WebSQL.');
	          continue; // keep using websql to avoid user data loss
	        }
	        break;
	      }
	    }
	  }
	
	  adapter = PouchDB.adapters[adapterName];
	
	  // if adapter is invalid, then an error will be thrown later
	  var usePrefix = (adapter && 'use_prefix' in adapter) ?
	      adapter.use_prefix : true;
	
	  return {
	    name: usePrefix ? (PouchDB.prefix + name) : name,
	    adapter: adapterName
	  };
	};
	
	PouchDB.adapter = function (id, obj, addToPreferredAdapters) {
	  if (obj.valid()) {
	    PouchDB.adapters[id] = obj;
	    if (addToPreferredAdapters) {
	      PouchDB.preferredAdapters.push(id);
	    }
	  }
	};
	
	PouchDB.plugin = function (obj) {
	  if (typeof obj === 'function') { // function style for plugins
	    obj(PouchDB);
	  } else {
	    Object.keys(obj).forEach(function (id) { // object style for plugins
	      PouchDB.prototype[id] = obj[id];
	    });
	  }
	  return PouchDB;
	};
	
	PouchDB.defaults = function (defaultOpts) {
	  function PouchAlt(name, opts, callback) {
	    if (!(this instanceof PouchAlt)) {
	      return new PouchAlt(name, opts, callback);
	    }
	
	    if (typeof opts === 'function' || typeof opts === 'undefined') {
	      callback = opts;
	      opts = {};
	    }
	    if (name && typeof name === 'object') {
	      opts = name;
	      name = undefined;
	    }
	
	    opts = jsExtend.extend({}, defaultOpts, opts);
	    PouchDB.call(this, name, opts, callback);
	  }
	
	  inherits(PouchAlt, PouchDB);
	
	  PouchAlt.preferredAdapters = PouchDB.preferredAdapters.slice();
	  Object.keys(PouchDB).forEach(function (key) {
	    if (!(key in PouchAlt)) {
	      PouchAlt[key] = PouchDB[key];
	    }
	  });
	
	  return PouchAlt;
	};
	
	// managed automatically by set-version.js
	var version = "5.4.5";
	
	PouchDB.version = version;
	
	function toObject(array) {
	  return array.reduce(function (obj, item) {
	    obj[item] = true;
	    return obj;
	  }, {});
	}
	// List of top level reserved words for doc
	var reservedWords = toObject([
	  '_id',
	  '_rev',
	  '_attachments',
	  '_deleted',
	  '_revisions',
	  '_revs_info',
	  '_conflicts',
	  '_deleted_conflicts',
	  '_local_seq',
	  '_rev_tree',
	  //replication documents
	  '_replication_id',
	  '_replication_state',
	  '_replication_state_time',
	  '_replication_state_reason',
	  '_replication_stats',
	  // Specific to Couchbase Sync Gateway
	  '_removed'
	]);
	
	// List of reserved words that should end up the document
	var dataWords = toObject([
	  '_attachments',
	  //replication documents
	  '_replication_id',
	  '_replication_state',
	  '_replication_state_time',
	  '_replication_state_reason',
	  '_replication_stats'
	]);
	
	function parseRevisionInfo(rev) {
	  if (!/^\d+\-./.test(rev)) {
	    return createError(INVALID_REV);
	  }
	  var idx = rev.indexOf('-');
	  var left = rev.substring(0, idx);
	  var right = rev.substring(idx + 1);
	  return {
	    prefix: parseInt(left, 10),
	    id: right
	  };
	}
	
	function makeRevTreeFromRevisions(revisions, opts) {
	  var pos = revisions.start - revisions.ids.length + 1;
	
	  var revisionIds = revisions.ids;
	  var ids = [revisionIds[0], opts, []];
	
	  for (var i = 1, len = revisionIds.length; i < len; i++) {
	    ids = [revisionIds[i], {status: 'missing'}, [ids]];
	  }
	
	  return [{
	    pos: pos,
	    ids: ids
	  }];
	}
	
	// Preprocess documents, parse their revisions, assign an id and a
	// revision for new writes that are missing them, etc
	function parseDoc(doc, newEdits) {
	
	  var nRevNum;
	  var newRevId;
	  var revInfo;
	  var opts = {status: 'available'};
	  if (doc._deleted) {
	    opts.deleted = true;
	  }
	
	  if (newEdits) {
	    if (!doc._id) {
	      doc._id = uuid();
	    }
	    newRevId = uuid(32, 16).toLowerCase();
	    if (doc._rev) {
	      revInfo = parseRevisionInfo(doc._rev);
	      if (revInfo.error) {
	        return revInfo;
	      }
	      doc._rev_tree = [{
	        pos: revInfo.prefix,
	        ids: [revInfo.id, {status: 'missing'}, [[newRevId, opts, []]]]
	      }];
	      nRevNum = revInfo.prefix + 1;
	    } else {
	      doc._rev_tree = [{
	        pos: 1,
	        ids : [newRevId, opts, []]
	      }];
	      nRevNum = 1;
	    }
	  } else {
	    if (doc._revisions) {
	      doc._rev_tree = makeRevTreeFromRevisions(doc._revisions, opts);
	      nRevNum = doc._revisions.start;
	      newRevId = doc._revisions.ids[0];
	    }
	    if (!doc._rev_tree) {
	      revInfo = parseRevisionInfo(doc._rev);
	      if (revInfo.error) {
	        return revInfo;
	      }
	      nRevNum = revInfo.prefix;
	      newRevId = revInfo.id;
	      doc._rev_tree = [{
	        pos: nRevNum,
	        ids: [newRevId, opts, []]
	      }];
	    }
	  }
	
	  invalidIdError(doc._id);
	
	  doc._rev = nRevNum + '-' + newRevId;
	
	  var result = {metadata : {}, data : {}};
	  for (var key in doc) {
	    /* istanbul ignore else */
	    if (Object.prototype.hasOwnProperty.call(doc, key)) {
	      var specialKey = key[0] === '_';
	      if (specialKey && !reservedWords[key]) {
	        var error = createError(DOC_VALIDATION, key);
	        error.message = DOC_VALIDATION.message + ': ' + key;
	        throw error;
	      } else if (specialKey && !dataWords[key]) {
	        result.metadata[key.slice(1)] = doc[key];
	      } else {
	        result.data[key] = doc[key];
	      }
	    }
	  }
	  return result;
	}
	
	var atob$1 = function (str) {
	  return atob(str);
	};
	
	var btoa$1 = function (str) {
	  return btoa(str);
	};
	
	// Abstracts constructing a Blob object, so it also works in older
	// browsers that don't support the native Blob constructor (e.g.
	// old QtWebKit versions, Android < 4.4).
	function createBlob(parts, properties) {
	  /* global BlobBuilder,MSBlobBuilder,MozBlobBuilder,WebKitBlobBuilder */
	  parts = parts || [];
	  properties = properties || {};
	  try {
	    return new Blob(parts, properties);
	  } catch (e) {
	    if (e.name !== "TypeError") {
	      throw e;
	    }
	    var Builder = typeof BlobBuilder !== 'undefined' ? BlobBuilder :
	                  typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder :
	                  typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder :
	                  WebKitBlobBuilder;
	    var builder = new Builder();
	    for (var i = 0; i < parts.length; i += 1) {
	      builder.append(parts[i]);
	    }
	    return builder.getBlob(properties.type);
	  }
	}
	
	// From http://stackoverflow.com/questions/14967647/ (continues on next line)
	// encode-decode-image-with-base64-breaks-image (2013-04-21)
	function binaryStringToArrayBuffer(bin) {
	  var length = bin.length;
	  var buf = new ArrayBuffer(length);
	  var arr = new Uint8Array(buf);
	  for (var i = 0; i < length; i++) {
	    arr[i] = bin.charCodeAt(i);
	  }
	  return buf;
	}
	
	function binStringToBluffer(binString, type) {
	  return createBlob([binaryStringToArrayBuffer(binString)], {type: type});
	}
	
	function b64ToBluffer(b64, type) {
	  return binStringToBluffer(atob$1(b64), type);
	}
	
	//Can't find original post, but this is close
	//http://stackoverflow.com/questions/6965107/ (continues on next line)
	//converting-between-strings-and-arraybuffers
	function arrayBufferToBinaryString(buffer) {
	  var binary = '';
	  var bytes = new Uint8Array(buffer);
	  var length = bytes.byteLength;
	  for (var i = 0; i < length; i++) {
	    binary += String.fromCharCode(bytes[i]);
	  }
	  return binary;
	}
	
	// shim for browsers that don't support it
	function readAsBinaryString(blob, callback) {
	  if (typeof FileReader === 'undefined') {
	    // fix for Firefox in a web worker
	    // https://bugzilla.mozilla.org/show_bug.cgi?id=901097
	    return callback(arrayBufferToBinaryString(
	      new FileReaderSync().readAsArrayBuffer(blob)));
	  }
	
	  var reader = new FileReader();
	  var hasBinaryString = typeof reader.readAsBinaryString === 'function';
	  reader.onloadend = function (e) {
	    var result = e.target.result || '';
	    if (hasBinaryString) {
	      return callback(result);
	    }
	    callback(arrayBufferToBinaryString(result));
	  };
	  if (hasBinaryString) {
	    reader.readAsBinaryString(blob);
	  } else {
	    reader.readAsArrayBuffer(blob);
	  }
	}
	
	function blobToBinaryString(blobOrBuffer, callback) {
	  readAsBinaryString(blobOrBuffer, function (bin) {
	    callback(bin);
	  });
	}
	
	function blobToBase64(blobOrBuffer, callback) {
	  blobToBinaryString(blobOrBuffer, function (base64) {
	    callback(btoa$1(base64));
	  });
	}
	
	// simplified API. universal browser support is assumed
	function readAsArrayBuffer(blob, callback) {
	  if (typeof FileReader === 'undefined') {
	    // fix for Firefox in a web worker:
	    // https://bugzilla.mozilla.org/show_bug.cgi?id=901097
	    return callback(new FileReaderSync().readAsArrayBuffer(blob));
	  }
	
	  var reader = new FileReader();
	  reader.onloadend = function (e) {
	    var result = e.target.result || new ArrayBuffer(0);
	    callback(result);
	  };
	  reader.readAsArrayBuffer(blob);
	}
	
	var setImmediateShim = global.setImmediate || global.setTimeout;
	var MD5_CHUNK_SIZE = 32768;
	
	function rawToBase64(raw) {
	  return btoa$1(raw);
	}
	
	function sliceBlob(blob, start, end) {
	  if (blob.webkitSlice) {
	    return blob.webkitSlice(start, end);
	  }
	  return blob.slice(start, end);
	}
	
	function appendBlob(buffer, blob, start, end, callback) {
	  if (start > 0 || end < blob.size) {
	    // only slice blob if we really need to
	    blob = sliceBlob(blob, start, end);
	  }
	  readAsArrayBuffer(blob, function (arrayBuffer) {
	    buffer.append(arrayBuffer);
	    callback();
	  });
	}
	
	function appendString(buffer, string, start, end, callback) {
	  if (start > 0 || end < string.length) {
	    // only create a substring if we really need to
	    string = string.substring(start, end);
	  }
	  buffer.appendBinary(string);
	  callback();
	}
	
	function binaryMd5(data, callback) {
	  var inputIsString = typeof data === 'string';
	  var len = inputIsString ? data.length : data.size;
	  var chunkSize = Math.min(MD5_CHUNK_SIZE, len);
	  var chunks = Math.ceil(len / chunkSize);
	  var currentChunk = 0;
	  var buffer = inputIsString ? new Md5() : new Md5.ArrayBuffer();
	
	  var append = inputIsString ? appendString : appendBlob;
	
	  function next() {
	    setImmediateShim(loadNextChunk);
	  }
	
	  function done() {
	    var raw = buffer.end(true);
	    var base64 = rawToBase64(raw);
	    callback(base64);
	    buffer.destroy();
	  }
	
	  function loadNextChunk() {
	    var start = currentChunk * chunkSize;
	    var end = start + chunkSize;
	    currentChunk++;
	    if (currentChunk < chunks) {
	      append(buffer, data, start, end, next);
	    } else {
	      append(buffer, data, start, end, done);
	    }
	  }
	  loadNextChunk();
	}
	
	function stringMd5(string) {
	  return Md5.hash(string);
	}
	
	function parseBase64(data) {
	  try {
	    return atob$1(data);
	  } catch (e) {
	    var err = createError(BAD_ARG,
	      'Attachment is not a valid base64 string');
	    return {error: err};
	  }
	}
	
	function preprocessString(att, blobType, callback) {
	  var asBinary = parseBase64(att.data);
	  if (asBinary.error) {
	    return callback(asBinary.error);
	  }
	
	  att.length = asBinary.length;
	  if (blobType === 'blob') {
	    att.data = binStringToBluffer(asBinary, att.content_type);
	  } else if (blobType === 'base64') {
	    att.data = btoa$1(asBinary);
	  } else { // binary
	    att.data = asBinary;
	  }
	  binaryMd5(asBinary, function (result) {
	    att.digest = 'md5-' + result;
	    callback();
	  });
	}
	
	function preprocessBlob(att, blobType, callback) {
	  binaryMd5(att.data, function (md5) {
	    att.digest = 'md5-' + md5;
	    // size is for blobs (browser), length is for buffers (node)
	    att.length = att.data.size || att.data.length || 0;
	    if (blobType === 'binary') {
	      blobToBinaryString(att.data, function (binString) {
	        att.data = binString;
	        callback();
	      });
	    } else if (blobType === 'base64') {
	      blobToBase64(att.data, function (b64) {
	        att.data = b64;
	        callback();
	      });
	    } else {
	      callback();
	    }
	  });
	}
	
	function preprocessAttachment(att, blobType, callback) {
	  if (att.stub) {
	    return callback();
	  }
	  if (typeof att.data === 'string') { // input is a base64 string
	    preprocessString(att, blobType, callback);
	  } else { // input is a blob
	    preprocessBlob(att, blobType, callback);
	  }
	}
	
	function preprocessAttachments(docInfos, blobType, callback) {
	
	  if (!docInfos.length) {
	    return callback();
	  }
	
	  var docv = 0;
	  var overallErr;
	
	  docInfos.forEach(function (docInfo) {
	    var attachments = docInfo.data && docInfo.data._attachments ?
	      Object.keys(docInfo.data._attachments) : [];
	    var recv = 0;
	
	    if (!attachments.length) {
	      return done();
	    }
	
	    function processedAttachment(err) {
	      overallErr = err;
	      recv++;
	      if (recv === attachments.length) {
	        done();
	      }
	    }
	
	    for (var key in docInfo.data._attachments) {
	      if (docInfo.data._attachments.hasOwnProperty(key)) {
	        preprocessAttachment(docInfo.data._attachments[key],
	          blobType, processedAttachment);
	      }
	    }
	  });
	
	  function done() {
	    docv++;
	    if (docInfos.length === docv) {
	      if (overallErr) {
	        callback(overallErr);
	      } else {
	        callback();
	      }
	    }
	  }
	}
	
	function updateDoc(revLimit, prev, docInfo, results,
	                   i, cb, writeDoc, newEdits) {
	
	  if (revExists(prev.rev_tree, docInfo.metadata.rev)) {
	    results[i] = docInfo;
	    return cb();
	  }
	
	  // sometimes this is pre-calculated. historically not always
	  var previousWinningRev = prev.winningRev || winningRev(prev);
	  var previouslyDeleted = 'deleted' in prev ? prev.deleted :
	    isDeleted(prev, previousWinningRev);
	  var deleted = 'deleted' in docInfo.metadata ? docInfo.metadata.deleted :
	    isDeleted(docInfo.metadata);
	  var isRoot = /^1-/.test(docInfo.metadata.rev);
	
	  if (previouslyDeleted && !deleted && newEdits && isRoot) {
	    var newDoc = docInfo.data;
	    newDoc._rev = previousWinningRev;
	    newDoc._id = docInfo.metadata.id;
	    docInfo = parseDoc(newDoc, newEdits);
	  }
	
	  var merged = merge(prev.rev_tree, docInfo.metadata.rev_tree[0], revLimit);
	
	  var inConflict = newEdits && (((previouslyDeleted && deleted) ||
	    (!previouslyDeleted && merged.conflicts !== 'new_leaf') ||
	    (previouslyDeleted && !deleted && merged.conflicts === 'new_branch')));
	
	  if (inConflict) {
	    var err = createError(REV_CONFLICT);
	    results[i] = err;
	    return cb();
	  }
	
	  var newRev = docInfo.metadata.rev;
	  docInfo.metadata.rev_tree = merged.tree;
	  docInfo.stemmedRevs = merged.stemmedRevs || [];
	  /* istanbul ignore else */
	  if (prev.rev_map) {
	    docInfo.metadata.rev_map = prev.rev_map; // used only by leveldb
	  }
	
	  // recalculate
	  var winningRev$$ = winningRev(docInfo.metadata);
	  var winningRevIsDeleted = isDeleted(docInfo.metadata, winningRev$$);
	
	  // calculate the total number of documents that were added/removed,
	  // from the perspective of total_rows/doc_count
	  var delta = (previouslyDeleted === winningRevIsDeleted) ? 0 :
	    previouslyDeleted < winningRevIsDeleted ? -1 : 1;
	
	  var newRevIsDeleted;
	  if (newRev === winningRev$$) {
	    // if the new rev is the same as the winning rev, we can reuse that value
	    newRevIsDeleted = winningRevIsDeleted;
	  } else {
	    // if they're not the same, then we need to recalculate
	    newRevIsDeleted = isDeleted(docInfo.metadata, newRev);
	  }
	
	  writeDoc(docInfo, winningRev$$, winningRevIsDeleted, newRevIsDeleted,
	    true, delta, i, cb);
	}
	
	function rootIsMissing(docInfo) {
	  return docInfo.metadata.rev_tree[0].ids[1].status === 'missing';
	}
	
	function processDocs(revLimit, docInfos, api, fetchedDocs, tx, results,
	                     writeDoc, opts, overallCallback) {
	
	  // Default to 1000 locally
	  revLimit = revLimit || 1000;
	
	  function insertDoc(docInfo, resultsIdx, callback) {
	    // Cant insert new deleted documents
	    var winningRev$$ = winningRev(docInfo.metadata);
	    var deleted = isDeleted(docInfo.metadata, winningRev$$);
	    if ('was_delete' in opts && deleted) {
	      results[resultsIdx] = createError(MISSING_DOC, 'deleted');
	      return callback();
	    }
	
	    // 4712 - detect whether a new document was inserted with a _rev
	    var inConflict = newEdits && rootIsMissing(docInfo);
	
	    if (inConflict) {
	      var err = createError(REV_CONFLICT);
	      results[resultsIdx] = err;
	      return callback();
	    }
	
	    var delta = deleted ? 0 : 1;
	
	    writeDoc(docInfo, winningRev$$, deleted, deleted, false,
	      delta, resultsIdx, callback);
	  }
	
	  var newEdits = opts.new_edits;
	  var idsToDocs = new pouchdbCollections.Map();
	
	  var docsDone = 0;
	  var docsToDo = docInfos.length;
	
	  function checkAllDocsDone() {
	    if (++docsDone === docsToDo && overallCallback) {
	      overallCallback();
	    }
	  }
	
	  docInfos.forEach(function (currentDoc, resultsIdx) {
	
	    if (currentDoc._id && isLocalId(currentDoc._id)) {
	      var fun = currentDoc._deleted ? '_removeLocal' : '_putLocal';
	      api[fun](currentDoc, {ctx: tx}, function (err, res) {
	        results[resultsIdx] = err || res;
	        checkAllDocsDone();
	      });
	      return;
	    }
	
	    var id = currentDoc.metadata.id;
	    if (idsToDocs.has(id)) {
	      docsToDo--; // duplicate
	      idsToDocs.get(id).push([currentDoc, resultsIdx]);
	    } else {
	      idsToDocs.set(id, [[currentDoc, resultsIdx]]);
	    }
	  });
	
	  // in the case of new_edits, the user can provide multiple docs
	  // with the same id. these need to be processed sequentially
	  idsToDocs.forEach(function (docs, id) {
	    var numDone = 0;
	
	    function docWritten() {
	      if (++numDone < docs.length) {
	        nextDoc();
	      } else {
	        checkAllDocsDone();
	      }
	    }
	    function nextDoc() {
	      var value = docs[numDone];
	      var currentDoc = value[0];
	      var resultsIdx = value[1];
	
	      if (fetchedDocs.has(id)) {
	        updateDoc(revLimit, fetchedDocs.get(id), currentDoc, results,
	          resultsIdx, docWritten, writeDoc, newEdits);
	      } else {
	        // Ensure stemming applies to new writes as well
	        var merged = merge([], currentDoc.metadata.rev_tree[0], revLimit);
	        currentDoc.metadata.rev_tree = merged.tree;
	        currentDoc.stemmedRevs = merged.stemmedRevs || [];
	        insertDoc(currentDoc, resultsIdx, docWritten);
	      }
	    }
	    nextDoc();
	  });
	}
	
	// IndexedDB requires a versioned database structure, so we use the
	// version here to manage migrations.
	var ADAPTER_VERSION = 5;
	
	// The object stores created for each database
	// DOC_STORE stores the document meta data, its revision history and state
	// Keyed by document id
	var DOC_STORE = 'document-store';
	// BY_SEQ_STORE stores a particular version of a document, keyed by its
	// sequence id
	var BY_SEQ_STORE = 'by-sequence';
	// Where we store attachments
	var ATTACH_STORE = 'attach-store';
	// Where we store many-to-many relations
	// between attachment digests and seqs
	var ATTACH_AND_SEQ_STORE = 'attach-seq-store';
	
	// Where we store database-wide meta data in a single record
	// keyed by id: META_STORE
	var META_STORE = 'meta-store';
	// Where we store local documents
	var LOCAL_STORE = 'local-store';
	// Where we detect blob support
	var DETECT_BLOB_SUPPORT_STORE = 'detect-blob-support';
	
	function slowJsonParse(str) {
	  try {
	    return JSON.parse(str);
	  } catch (e) {
	    /* istanbul ignore next */
	    return vuvuzela.parse(str);
	  }
	}
	
	function safeJsonParse(str) {
	  // try/catch is deoptimized in V8, leading to slower
	  // times than we'd like to have. Most documents are _not_
	  // huge, and do not require a slower code path just to parse them.
	  // We can be pretty sure that a document under 50000 characters
	  // will not be so deeply nested as to throw a stack overflow error
	  // (depends on the engine and available memory, though, so this is
	  // just a hunch). 50000 was chosen based on the average length
	  // of this string in our test suite, to try to find a number that covers
	  // most of our test cases (26 over this size, 26378 under it).
	  if (str.length < 50000) {
	    return JSON.parse(str);
	  }
	  return slowJsonParse(str);
	}
	
	function safeJsonStringify(json) {
	  try {
	    return JSON.stringify(json);
	  } catch (e) {
	    /* istanbul ignore next */
	    return vuvuzela.stringify(json);
	  }
	}
	
	function tryCode(fun, that, args, PouchDB) {
	  try {
	    fun.apply(that, args);
	  } catch (err) {
	    // Shouldn't happen, but in some odd cases
	    // IndexedDB implementations might throw a sync
	    // error, in which case this will at least log it.
	    PouchDB.emit('error', err);
	  }
	}
	
	var taskQueue = {
	  running: false,
	  queue: []
	};
	
	function applyNext(PouchDB) {
	  if (taskQueue.running || !taskQueue.queue.length) {
	    return;
	  }
	  taskQueue.running = true;
	  var item = taskQueue.queue.shift();
	  item.action(function (err, res) {
	    tryCode(item.callback, this, [err, res], PouchDB);
	    taskQueue.running = false;
	    process.nextTick(function () {
	      applyNext(PouchDB);
	    });
	  });
	}
	
	function idbError(callback) {
	  return function (evt) {
	    var message = 'unknown_error';
	    if (evt.target && evt.target.error) {
	      message = evt.target.error.name || evt.target.error.message;
	    }
	    callback(createError(IDB_ERROR, message, evt.type));
	  };
	}
	
	// Unfortunately, the metadata has to be stringified
	// when it is put into the database, because otherwise
	// IndexedDB can throw errors for deeply-nested objects.
	// Originally we just used JSON.parse/JSON.stringify; now
	// we use this custom vuvuzela library that avoids recursion.
	// If we could do it all over again, we'd probably use a
	// format for the revision trees other than JSON.
	function encodeMetadata(metadata, winningRev, deleted) {
	  return {
	    data: safeJsonStringify(metadata),
	    winningRev: winningRev,
	    deletedOrLocal: deleted ? '1' : '0',
	    seq: metadata.seq, // highest seq for this doc
	    id: metadata.id
	  };
	}
	
	function decodeMetadata(storedObject) {
	  if (!storedObject) {
	    return null;
	  }
	  var metadata = safeJsonParse(storedObject.data);
	  metadata.winningRev = storedObject.winningRev;
	  metadata.deleted = storedObject.deletedOrLocal === '1';
	  metadata.seq = storedObject.seq;
	  return metadata;
	}
	
	// read the doc back out from the database. we don't store the
	// _id or _rev because we already have _doc_id_rev.
	function decodeDoc(doc) {
	  if (!doc) {
	    return doc;
	  }
	  var idx = doc._doc_id_rev.lastIndexOf(':');
	  doc._id = doc._doc_id_rev.substring(0, idx - 1);
	  doc._rev = doc._doc_id_rev.substring(idx + 1);
	  delete doc._doc_id_rev;
	  return doc;
	}
	
	// Read a blob from the database, encoding as necessary
	// and translating from base64 if the IDB doesn't support
	// native Blobs
	function readBlobData(body, type, asBlob, callback) {
	  if (asBlob) {
	    if (!body) {
	      callback(createBlob([''], {type: type}));
	    } else if (typeof body !== 'string') { // we have blob support
	      callback(body);
	    } else { // no blob support
	      callback(b64ToBluffer(body, type));
	    }
	  } else { // as base64 string
	    if (!body) {
	      callback('');
	    } else if (typeof body !== 'string') { // we have blob support
	      readAsBinaryString(body, function (binary) {
	        callback(btoa$1(binary));
	      });
	    } else { // no blob support
	      callback(body);
	    }
	  }
	}
	
	function fetchAttachmentsIfNecessary(doc, opts, txn, cb) {
	  var attachments = Object.keys(doc._attachments || {});
	  if (!attachments.length) {
	    return cb && cb();
	  }
	  var numDone = 0;
	
	  function checkDone() {
	    if (++numDone === attachments.length && cb) {
	      cb();
	    }
	  }
	
	  function fetchAttachment(doc, att) {
	    var attObj = doc._attachments[att];
	    var digest = attObj.digest;
	    var req = txn.objectStore(ATTACH_STORE).get(digest);
	    req.onsuccess = function (e) {
	      attObj.body = e.target.result.body;
	      checkDone();
	    };
	  }
	
	  attachments.forEach(function (att) {
	    if (opts.attachments && opts.include_docs) {
	      fetchAttachment(doc, att);
	    } else {
	      doc._attachments[att].stub = true;
	      checkDone();
	    }
	  });
	}
	
	// IDB-specific postprocessing necessary because
	// we don't know whether we stored a true Blob or
	// a base64-encoded string, and if it's a Blob it
	// needs to be read outside of the transaction context
	function postProcessAttachments(results, asBlob) {
	  return PouchPromise.all(results.map(function (row) {
	    if (row.doc && row.doc._attachments) {
	      var attNames = Object.keys(row.doc._attachments);
	      return PouchPromise.all(attNames.map(function (att) {
	        var attObj = row.doc._attachments[att];
	        if (!('body' in attObj)) { // already processed
	          return;
	        }
	        var body = attObj.body;
	        var type = attObj.content_type;
	        return new PouchPromise(function (resolve) {
	          readBlobData(body, type, asBlob, function (data) {
	            row.doc._attachments[att] = jsExtend.extend(
	              pick(attObj, ['digest', 'content_type']),
	              {data: data}
	            );
	            resolve();
	          });
	        });
	      }));
	    }
	  }));
	}
	
	function compactRevs(revs, docId, txn) {
	
	  var possiblyOrphanedDigests = [];
	  var seqStore = txn.objectStore(BY_SEQ_STORE);
	  var attStore = txn.objectStore(ATTACH_STORE);
	  var attAndSeqStore = txn.objectStore(ATTACH_AND_SEQ_STORE);
	  var count = revs.length;
	
	  function checkDone() {
	    count--;
	    if (!count) { // done processing all revs
	      deleteOrphanedAttachments();
	    }
	  }
	
	  function deleteOrphanedAttachments() {
	    if (!possiblyOrphanedDigests.length) {
	      return;
	    }
	    possiblyOrphanedDigests.forEach(function (digest) {
	      var countReq = attAndSeqStore.index('digestSeq').count(
	        IDBKeyRange.bound(
	          digest + '::', digest + '::\uffff', false, false));
	      countReq.onsuccess = function (e) {
	        var count = e.target.result;
	        if (!count) {
	          // orphaned
	          attStore.delete(digest);
	        }
	      };
	    });
	  }
	
	  revs.forEach(function (rev) {
	    var index = seqStore.index('_doc_id_rev');
	    var key = docId + "::" + rev;
	    index.getKey(key).onsuccess = function (e) {
	      var seq = e.target.result;
	      if (typeof seq !== 'number') {
	        return checkDone();
	      }
	      seqStore.delete(seq);
	
	      var cursor = attAndSeqStore.index('seq')
	        .openCursor(IDBKeyRange.only(seq));
	
	      cursor.onsuccess = function (event) {
	        var cursor = event.target.result;
	        if (cursor) {
	          var digest = cursor.value.digestSeq.split('::')[0];
	          possiblyOrphanedDigests.push(digest);
	          attAndSeqStore.delete(cursor.primaryKey);
	          cursor.continue();
	        } else { // done
	          checkDone();
	        }
	      };
	    };
	  });
	}
	
	function openTransactionSafely(idb, stores, mode) {
	  try {
	    return {
	      txn: idb.transaction(stores, mode)
	    };
	  } catch (err) {
	    return {
	      error: err
	    };
	  }
	}
	
	function idbBulkDocs(dbOpts, req, opts, api, idb, idbChanges, callback) {
	  var docInfos = req.docs;
	  var txn;
	  var docStore;
	  var bySeqStore;
	  var attachStore;
	  var attachAndSeqStore;
	  var docInfoError;
	  var docCountDelta = 0;
	
	  for (var i = 0, len = docInfos.length; i < len; i++) {
	    var doc = docInfos[i];
	    if (doc._id && isLocalId(doc._id)) {
	      continue;
	    }
	    doc = docInfos[i] = parseDoc(doc, opts.new_edits);
	    if (doc.error && !docInfoError) {
	      docInfoError = doc;
	    }
	  }
	
	  if (docInfoError) {
	    return callback(docInfoError);
	  }
	
	  var results = new Array(docInfos.length);
	  var fetchedDocs = new pouchdbCollections.Map();
	  var preconditionErrored = false;
	  var blobType = api._meta.blobSupport ? 'blob' : 'base64';
	
	  preprocessAttachments(docInfos, blobType, function (err) {
	    if (err) {
	      return callback(err);
	    }
	    startTransaction();
	  });
	
	  function startTransaction() {
	
	    var stores = [
	      DOC_STORE, BY_SEQ_STORE,
	      ATTACH_STORE,
	      LOCAL_STORE, ATTACH_AND_SEQ_STORE
	    ];
	    var txnResult = openTransactionSafely(idb, stores, 'readwrite');
	    if (txnResult.error) {
	      return callback(txnResult.error);
	    }
	    txn = txnResult.txn;
	    txn.onabort = idbError(callback);
	    txn.ontimeout = idbError(callback);
	    txn.oncomplete = complete;
	    docStore = txn.objectStore(DOC_STORE);
	    bySeqStore = txn.objectStore(BY_SEQ_STORE);
	    attachStore = txn.objectStore(ATTACH_STORE);
	    attachAndSeqStore = txn.objectStore(ATTACH_AND_SEQ_STORE);
	
	    verifyAttachments(function (err) {
	      if (err) {
	        preconditionErrored = true;
	        return callback(err);
	      }
	      fetchExistingDocs();
	    });
	  }
	
	  function idbProcessDocs() {
	    processDocs(dbOpts.revs_limit, docInfos, api, fetchedDocs,
	                txn, results, writeDoc, opts);
	  }
	
	  function fetchExistingDocs() {
	
	    if (!docInfos.length) {
	      return;
	    }
	
	    var numFetched = 0;
	
	    function checkDone() {
	      if (++numFetched === docInfos.length) {
	        idbProcessDocs();
	      }
	    }
	
	    function readMetadata(event) {
	      var metadata = decodeMetadata(event.target.result);
	
	      if (metadata) {
	        fetchedDocs.set(metadata.id, metadata);
	      }
	      checkDone();
	    }
	
	    for (var i = 0, len = docInfos.length; i < len; i++) {
	      var docInfo = docInfos[i];
	      if (docInfo._id && isLocalId(docInfo._id)) {
	        checkDone(); // skip local docs
	        continue;
	      }
	      var req = docStore.get(docInfo.metadata.id);
	      req.onsuccess = readMetadata;
	    }
	  }
	
	  function complete() {
	    if (preconditionErrored) {
	      return;
	    }
	
	    idbChanges.notify(api._meta.name);
	    api._meta.docCount += docCountDelta;
	    callback(null, results);
	  }
	
	  function verifyAttachment(digest, callback) {
	
	    var req = attachStore.get(digest);
	    req.onsuccess = function (e) {
	      if (!e.target.result) {
	        var err = createError(MISSING_STUB,
	          'unknown stub attachment with digest ' +
	          digest);
	        err.status = 412;
	        callback(err);
	      } else {
	        callback();
	      }
	    };
	  }
	
	  function verifyAttachments(finish) {
	
	
	    var digests = [];
	    docInfos.forEach(function (docInfo) {
	      if (docInfo.data && docInfo.data._attachments) {
	        Object.keys(docInfo.data._attachments).forEach(function (filename) {
	          var att = docInfo.data._attachments[filename];
	          if (att.stub) {
	            digests.push(att.digest);
	          }
	        });
	      }
	    });
	    if (!digests.length) {
	      return finish();
	    }
	    var numDone = 0;
	    var err;
	
	    function checkDone() {
	      if (++numDone === digests.length) {
	        finish(err);
	      }
	    }
	    digests.forEach(function (digest) {
	      verifyAttachment(digest, function (attErr) {
	        if (attErr && !err) {
	          err = attErr;
	        }
	        checkDone();
	      });
	    });
	  }
	
	  function writeDoc(docInfo, winningRev, winningRevIsDeleted, newRevIsDeleted,
	                    isUpdate, delta, resultsIdx, callback) {
	
	    docCountDelta += delta;
	
	    docInfo.metadata.winningRev = winningRev;
	    docInfo.metadata.deleted = winningRevIsDeleted;
	
	    var doc = docInfo.data;
	    doc._id = docInfo.metadata.id;
	    doc._rev = docInfo.metadata.rev;
	
	    if (newRevIsDeleted) {
	      doc._deleted = true;
	    }
	
	    var hasAttachments = doc._attachments &&
	      Object.keys(doc._attachments).length;
	    if (hasAttachments) {
	      return writeAttachments(docInfo, winningRev, winningRevIsDeleted,
	        isUpdate, resultsIdx, callback);
	    }
	
	    finishDoc(docInfo, winningRev, winningRevIsDeleted,
	      isUpdate, resultsIdx, callback);
	  }
	
	  function finishDoc(docInfo, winningRev, winningRevIsDeleted,
	                     isUpdate, resultsIdx, callback) {
	
	    var doc = docInfo.data;
	    var metadata = docInfo.metadata;
	
	    doc._doc_id_rev = metadata.id + '::' + metadata.rev;
	    delete doc._id;
	    delete doc._rev;
	
	    function afterPutDoc(e) {
	      var revsToDelete = docInfo.stemmedRevs || [];
	
	      if (isUpdate && api.auto_compaction) {
	        revsToDelete = revsToDelete.concat(compactTree(docInfo.metadata));
	      }
	
	      if (revsToDelete && revsToDelete.length) {
	        compactRevs(revsToDelete, docInfo.metadata.id, txn);
	      }
	
	      metadata.seq = e.target.result;
	      // Current _rev is calculated from _rev_tree on read
	      delete metadata.rev;
	      var metadataToStore = encodeMetadata(metadata, winningRev,
	        winningRevIsDeleted);
	      var metaDataReq = docStore.put(metadataToStore);
	      metaDataReq.onsuccess = afterPutMetadata;
	    }
	
	    function afterPutDocError(e) {
	      // ConstraintError, need to update, not put (see #1638 for details)
	      e.preventDefault(); // avoid transaction abort
	      e.stopPropagation(); // avoid transaction onerror
	      var index = bySeqStore.index('_doc_id_rev');
	      var getKeyReq = index.getKey(doc._doc_id_rev);
	      getKeyReq.onsuccess = function (e) {
	        var putReq = bySeqStore.put(doc, e.target.result);
	        putReq.onsuccess = afterPutDoc;
	      };
	    }
	
	    function afterPutMetadata() {
	      results[resultsIdx] = {
	        ok: true,
	        id: metadata.id,
	        rev: winningRev
	      };
	      fetchedDocs.set(docInfo.metadata.id, docInfo.metadata);
	      insertAttachmentMappings(docInfo, metadata.seq, callback);
	    }
	
	    var putReq = bySeqStore.put(doc);
	
	    putReq.onsuccess = afterPutDoc;
	    putReq.onerror = afterPutDocError;
	  }
	
	  function writeAttachments(docInfo, winningRev, winningRevIsDeleted,
	                            isUpdate, resultsIdx, callback) {
	
	
	    var doc = docInfo.data;
	
	    var numDone = 0;
	    var attachments = Object.keys(doc._attachments);
	
	    function collectResults() {
	      if (numDone === attachments.length) {
	        finishDoc(docInfo, winningRev, winningRevIsDeleted,
	          isUpdate, resultsIdx, callback);
	      }
	    }
	
	    function attachmentSaved() {
	      numDone++;
	      collectResults();
	    }
	
	    attachments.forEach(function (key) {
	      var att = docInfo.data._attachments[key];
	      if (!att.stub) {
	        var data = att.data;
	        delete att.data;
	        att.revpos = parseInt(winningRev, 10);
	        var digest = att.digest;
	        saveAttachment(digest, data, attachmentSaved);
	      } else {
	        numDone++;
	        collectResults();
	      }
	    });
	  }
	
	  // map seqs to attachment digests, which
	  // we will need later during compaction
	  function insertAttachmentMappings(docInfo, seq, callback) {
	
	    var attsAdded = 0;
	    var attsToAdd = Object.keys(docInfo.data._attachments || {});
	
	    if (!attsToAdd.length) {
	      return callback();
	    }
	
	    function checkDone() {
	      if (++attsAdded === attsToAdd.length) {
	        callback();
	      }
	    }
	
	    function add(att) {
	      var digest = docInfo.data._attachments[att].digest;
	      var req = attachAndSeqStore.put({
	        seq: seq,
	        digestSeq: digest + '::' + seq
	      });
	
	      req.onsuccess = checkDone;
	      req.onerror = function (e) {
	        // this callback is for a constaint error, which we ignore
	        // because this docid/rev has already been associated with
	        // the digest (e.g. when new_edits == false)
	        e.preventDefault(); // avoid transaction abort
	        e.stopPropagation(); // avoid transaction onerror
	        checkDone();
	      };
	    }
	    for (var i = 0; i < attsToAdd.length; i++) {
	      add(attsToAdd[i]); // do in parallel
	    }
	  }
	
	  function saveAttachment(digest, data, callback) {
	
	
	    var getKeyReq = attachStore.count(digest);
	    getKeyReq.onsuccess = function (e) {
	      var count = e.target.result;
	      if (count) {
	        return callback(); // already exists
	      }
	      var newAtt = {
	        digest: digest,
	        body: data
	      };
	      var putReq = attachStore.put(newAtt);
	      putReq.onsuccess = callback;
	    };
	  }
	}
	
	function createKeyRange(start, end, inclusiveEnd, key, descending) {
	  try {
	    if (start && end) {
	      if (descending) {
	        return IDBKeyRange.bound(end, start, !inclusiveEnd, false);
	      } else {
	        return IDBKeyRange.bound(start, end, false, !inclusiveEnd);
	      }
	    } else if (start) {
	      if (descending) {
	        return IDBKeyRange.upperBound(start);
	      } else {
	        return IDBKeyRange.lowerBound(start);
	      }
	    } else if (end) {
	      if (descending) {
	        return IDBKeyRange.lowerBound(end, !inclusiveEnd);
	      } else {
	        return IDBKeyRange.upperBound(end, !inclusiveEnd);
	      }
	    } else if (key) {
	      return IDBKeyRange.only(key);
	    }
	  } catch (e) {
	    return {error: e};
	  }
	  return null;
	}
	
	function handleKeyRangeError(api, opts, err, callback) {
	  if (err.name === "DataError" && err.code === 0) {
	    // data error, start is less than end
	    return callback(null, {
	      total_rows: api._meta.docCount,
	      offset: opts.skip,
	      rows: []
	    });
	  }
	  callback(createError(IDB_ERROR, err.name, err.message));
	}
	
	function idbAllDocs(opts, api, idb, callback) {
	
	  function allDocsQuery(opts, callback) {
	    var start = 'startkey' in opts ? opts.startkey : false;
	    var end = 'endkey' in opts ? opts.endkey : false;
	    var key = 'key' in opts ? opts.key : false;
	    var skip = opts.skip || 0;
	    var limit = typeof opts.limit === 'number' ? opts.limit : -1;
	    var inclusiveEnd = opts.inclusive_end !== false;
	    var descending = 'descending' in opts && opts.descending ? 'prev' : null;
	
	    var keyRange = createKeyRange(start, end, inclusiveEnd, key, descending);
	    if (keyRange && keyRange.error) {
	      return handleKeyRangeError(api, opts, keyRange.error, callback);
	    }
	
	    var stores = [DOC_STORE, BY_SEQ_STORE];
	
	    if (opts.attachments) {
	      stores.push(ATTACH_STORE);
	    }
	    var txnResult = openTransactionSafely(idb, stores, 'readonly');
	    if (txnResult.error) {
	      return callback(txnResult.error);
	    }
	    var txn = txnResult.txn;
	    var docStore = txn.objectStore(DOC_STORE);
	    var seqStore = txn.objectStore(BY_SEQ_STORE);
	    var cursor = descending ?
	      docStore.openCursor(keyRange, descending) :
	      docStore.openCursor(keyRange);
	    var docIdRevIndex = seqStore.index('_doc_id_rev');
	    var results = [];
	    var docCount = 0;
	
	    // if the user specifies include_docs=true, then we don't
	    // want to block the main cursor while we're fetching the doc
	    function fetchDocAsynchronously(metadata, row, winningRev) {
	      var key = metadata.id + "::" + winningRev;
	      docIdRevIndex.get(key).onsuccess =  function onGetDoc(e) {
	        row.doc = decodeDoc(e.target.result);
	        if (opts.conflicts) {
	          row.doc._conflicts = collectConflicts(metadata);
	        }
	        fetchAttachmentsIfNecessary(row.doc, opts, txn);
	      };
	    }
	
	    function allDocsInner(cursor, winningRev, metadata) {
	      var row = {
	        id: metadata.id,
	        key: metadata.id,
	        value: {
	          rev: winningRev
	        }
	      };
	      var deleted = metadata.deleted;
	      if (opts.deleted === 'ok') {
	        results.push(row);
	        // deleted docs are okay with "keys" requests
	        if (deleted) {
	          row.value.deleted = true;
	          row.doc = null;
	        } else if (opts.include_docs) {
	          fetchDocAsynchronously(metadata, row, winningRev);
	        }
	      } else if (!deleted && skip-- <= 0) {
	        results.push(row);
	        if (opts.include_docs) {
	          fetchDocAsynchronously(metadata, row, winningRev);
	        }
	        if (--limit === 0) {
	          return;
	        }
	      }
	      cursor.continue();
	    }
	
	    function onGetCursor(e) {
	      docCount = api._meta.docCount; // do this within the txn for consistency
	      var cursor = e.target.result;
	      if (!cursor) {
	        return;
	      }
	      var metadata = decodeMetadata(cursor.value);
	      var winningRev = metadata.winningRev;
	
	      allDocsInner(cursor, winningRev, metadata);
	    }
	
	    function onResultsReady() {
	      callback(null, {
	        total_rows: docCount,
	        offset: opts.skip,
	        rows: results
	      });
	    }
	
	    function onTxnComplete() {
	      if (opts.attachments) {
	        postProcessAttachments(results, opts.binary).then(onResultsReady);
	      } else {
	        onResultsReady();
	      }
	    }
	
	    txn.oncomplete = onTxnComplete;
	    cursor.onsuccess = onGetCursor;
	  }
	
	  function allDocs(opts, callback) {
	
	    if (opts.limit === 0) {
	      return callback(null, {
	        total_rows: api._meta.docCount,
	        offset: opts.skip,
	        rows: []
	      });
	    }
	    allDocsQuery(opts, callback);
	  }
	
	  allDocs(opts, callback);
	}
	
	//
	// Blobs are not supported in all versions of IndexedDB, notably
	// Chrome <37 and Android <5. In those versions, storing a blob will throw.
	//
	// Various other blob bugs exist in Chrome v37-42 (inclusive).
	// Detecting them is expensive and confusing to users, and Chrome 37-42
	// is at very low usage worldwide, so we do a hacky userAgent check instead.
	//
	// content-type bug: https://code.google.com/p/chromium/issues/detail?id=408120
	// 404 bug: https://code.google.com/p/chromium/issues/detail?id=447916
	// FileReader bug: https://code.google.com/p/chromium/issues/detail?id=447836
	//
	function checkBlobSupport(txn) {
	  return new PouchPromise(function (resolve) {
	    var blob = createBlob(['']);
	    txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, 'key');
	
	    txn.onabort = function (e) {
	      // If the transaction aborts now its due to not being able to
	      // write to the database, likely due to the disk being full
	      e.preventDefault();
	      e.stopPropagation();
	      resolve(false);
	    };
	
	    txn.oncomplete = function () {
	      var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
	      var matchedEdge = navigator.userAgent.match(/Edge\//);
	      // MS Edge pretends to be Chrome 42:
	      // https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
	      resolve(matchedEdge || !matchedChrome ||
	        parseInt(matchedChrome[1], 10) >= 43);
	    };
	  }).catch(function () {
	    return false; // error, so assume unsupported
	  });
	}
	
	var cachedDBs = new pouchdbCollections.Map();
	var blobSupportPromise;
	var idbChanges = new Changes$1();
	var openReqList = new pouchdbCollections.Map();
	
	function IdbPouch(opts, callback) {
	  var api = this;
	
	  taskQueue.queue.push({
	    action: function (thisCallback) {
	      init(api, opts, thisCallback);
	    },
	    callback: callback
	  });
	  applyNext(api.constructor);
	}
	
	function init(api, opts, callback) {
	
	  var dbName = opts.name;
	
	  var idb = null;
	  api._meta = null;
	
	  // called when creating a fresh new database
	  function createSchema(db) {
	    var docStore = db.createObjectStore(DOC_STORE, {keyPath : 'id'});
	    db.createObjectStore(BY_SEQ_STORE, {autoIncrement: true})
	      .createIndex('_doc_id_rev', '_doc_id_rev', {unique: true});
	    db.createObjectStore(ATTACH_STORE, {keyPath: 'digest'});
	    db.createObjectStore(META_STORE, {keyPath: 'id', autoIncrement: false});
	    db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
	
	    // added in v2
	    docStore.createIndex('deletedOrLocal', 'deletedOrLocal', {unique : false});
	
	    // added in v3
	    db.createObjectStore(LOCAL_STORE, {keyPath: '_id'});
	
	    // added in v4
	    var attAndSeqStore = db.createObjectStore(ATTACH_AND_SEQ_STORE,
	      {autoIncrement: true});
	    attAndSeqStore.createIndex('seq', 'seq');
	    attAndSeqStore.createIndex('digestSeq', 'digestSeq', {unique: true});
	  }
	
	  // migration to version 2
	  // unfortunately "deletedOrLocal" is a misnomer now that we no longer
	  // store local docs in the main doc-store, but whaddyagonnado
	  function addDeletedOrLocalIndex(txn, callback) {
	    var docStore = txn.objectStore(DOC_STORE);
	    docStore.createIndex('deletedOrLocal', 'deletedOrLocal', {unique : false});
	
	    docStore.openCursor().onsuccess = function (event) {
	      var cursor = event.target.result;
	      if (cursor) {
	        var metadata = cursor.value;
	        var deleted = isDeleted(metadata);
	        metadata.deletedOrLocal = deleted ? "1" : "0";
	        docStore.put(metadata);
	        cursor.continue();
	      } else {
	        callback();
	      }
	    };
	  }
	
	  // migration to version 3 (part 1)
	  function createLocalStoreSchema(db) {
	    db.createObjectStore(LOCAL_STORE, {keyPath: '_id'})
	      .createIndex('_doc_id_rev', '_doc_id_rev', {unique: true});
	  }
	
	  // migration to version 3 (part 2)
	  function migrateLocalStore(txn, cb) {
	    var localStore = txn.objectStore(LOCAL_STORE);
	    var docStore = txn.objectStore(DOC_STORE);
	    var seqStore = txn.objectStore(BY_SEQ_STORE);
	
	    var cursor = docStore.openCursor();
	    cursor.onsuccess = function (event) {
	      var cursor = event.target.result;
	      if (cursor) {
	        var metadata = cursor.value;
	        var docId = metadata.id;
	        var local = isLocalId(docId);
	        var rev = winningRev(metadata);
	        if (local) {
	          var docIdRev = docId + "::" + rev;
	          // remove all seq entries
	          // associated with this docId
	          var start = docId + "::";
	          var end = docId + "::~";
	          var index = seqStore.index('_doc_id_rev');
	          var range = IDBKeyRange.bound(start, end, false, false);
	          var seqCursor = index.openCursor(range);
	          seqCursor.onsuccess = function (e) {
	            seqCursor = e.target.result;
	            if (!seqCursor) {
	              // done
	              docStore.delete(cursor.primaryKey);
	              cursor.continue();
	            } else {
	              var data = seqCursor.value;
	              if (data._doc_id_rev === docIdRev) {
	                localStore.put(data);
	              }
	              seqStore.delete(seqCursor.primaryKey);
	              seqCursor.continue();
	            }
	          };
	        } else {
	          cursor.continue();
	        }
	      } else if (cb) {
	        cb();
	      }
	    };
	  }
	
	  // migration to version 4 (part 1)
	  function addAttachAndSeqStore(db) {
	    var attAndSeqStore = db.createObjectStore(ATTACH_AND_SEQ_STORE,
	      {autoIncrement: true});
	    attAndSeqStore.createIndex('seq', 'seq');
	    attAndSeqStore.createIndex('digestSeq', 'digestSeq', {unique: true});
	  }
	
	  // migration to version 4 (part 2)
	  function migrateAttsAndSeqs(txn, callback) {
	    var seqStore = txn.objectStore(BY_SEQ_STORE);
	    var attStore = txn.objectStore(ATTACH_STORE);
	    var attAndSeqStore = txn.objectStore(ATTACH_AND_SEQ_STORE);
	
	    // need to actually populate the table. this is the expensive part,
	    // so as an optimization, check first that this database even
	    // contains attachments
	    var req = attStore.count();
	    req.onsuccess = function (e) {
	      var count = e.target.result;
	      if (!count) {
	        return callback(); // done
	      }
	
	      seqStore.openCursor().onsuccess = function (e) {
	        var cursor = e.target.result;
	        if (!cursor) {
	          return callback(); // done
	        }
	        var doc = cursor.value;
	        var seq = cursor.primaryKey;
	        var atts = Object.keys(doc._attachments || {});
	        var digestMap = {};
	        for (var j = 0; j < atts.length; j++) {
	          var att = doc._attachments[atts[j]];
	          digestMap[att.digest] = true; // uniq digests, just in case
	        }
	        var digests = Object.keys(digestMap);
	        for (j = 0; j < digests.length; j++) {
	          var digest = digests[j];
	          attAndSeqStore.put({
	            seq: seq,
	            digestSeq: digest + '::' + seq
	          });
	        }
	        cursor.continue();
	      };
	    };
	  }
	
	  // migration to version 5
	  // Instead of relying on on-the-fly migration of metadata,
	  // this brings the doc-store to its modern form:
	  // - metadata.winningrev
	  // - metadata.seq
	  // - stringify the metadata when storing it
	  function migrateMetadata(txn) {
	
	    function decodeMetadataCompat(storedObject) {
	      if (!storedObject.data) {
	        // old format, when we didn't store it stringified
	        storedObject.deleted = storedObject.deletedOrLocal === '1';
	        return storedObject;
	      }
	      return decodeMetadata(storedObject);
	    }
	
	    // ensure that every metadata has a winningRev and seq,
	    // which was previously created on-the-fly but better to migrate
	    var bySeqStore = txn.objectStore(BY_SEQ_STORE);
	    var docStore = txn.objectStore(DOC_STORE);
	    var cursor = docStore.openCursor();
	    cursor.onsuccess = function (e) {
	      var cursor = e.target.result;
	      if (!cursor) {
	        return; // done
	      }
	      var metadata = decodeMetadataCompat(cursor.value);
	
	      metadata.winningRev = metadata.winningRev ||
	        winningRev(metadata);
	
	      function fetchMetadataSeq() {
	        // metadata.seq was added post-3.2.0, so if it's missing,
	        // we need to fetch it manually
	        var start = metadata.id + '::';
	        var end = metadata.id + '::\uffff';
	        var req = bySeqStore.index('_doc_id_rev').openCursor(
	          IDBKeyRange.bound(start, end));
	
	        var metadataSeq = 0;
	        req.onsuccess = function (e) {
	          var cursor = e.target.result;
	          if (!cursor) {
	            metadata.seq = metadataSeq;
	            return onGetMetadataSeq();
	          }
	          var seq = cursor.primaryKey;
	          if (seq > metadataSeq) {
	            metadataSeq = seq;
	          }
	          cursor.continue();
	        };
	      }
	
	      function onGetMetadataSeq() {
	        var metadataToStore = encodeMetadata(metadata,
	          metadata.winningRev, metadata.deleted);
	
	        var req = docStore.put(metadataToStore);
	        req.onsuccess = function () {
	          cursor.continue();
	        };
	      }
	
	      if (metadata.seq) {
	        return onGetMetadataSeq();
	      }
	
	      fetchMetadataSeq();
	    };
	
	  }
	
	  api.type = function () {
	    return 'idb';
	  };
	
	  api._id = toPromise(function (callback) {
	    callback(null, api._meta.instanceId);
	  });
	
	  api._bulkDocs = function idb_bulkDocs(req, reqOpts, callback) {
	    idbBulkDocs(opts, req, reqOpts, api, idb, idbChanges, callback);
	  };
	
	  // First we look up the metadata in the ids database, then we fetch the
	  // current revision(s) from the by sequence store
	  api._get = function idb_get(id, opts, callback) {
	    var doc;
	    var metadata;
	    var err;
	    var txn = opts.ctx;
	    if (!txn) {
	      var txnResult = openTransactionSafely(idb,
	        [DOC_STORE, BY_SEQ_STORE, ATTACH_STORE], 'readonly');
	      if (txnResult.error) {
	        return callback(txnResult.error);
	      }
	      txn = txnResult.txn;
	    }
	
	    function finish() {
	      callback(err, {doc: doc, metadata: metadata, ctx: txn});
	    }
	
	    txn.objectStore(DOC_STORE).get(id).onsuccess = function (e) {
	      metadata = decodeMetadata(e.target.result);
	      // we can determine the result here if:
	      // 1. there is no such document
	      // 2. the document is deleted and we don't ask about specific rev
	      // When we ask with opts.rev we expect the answer to be either
	      // doc (possibly with _deleted=true) or missing error
	      if (!metadata) {
	        err = createError(MISSING_DOC, 'missing');
	        return finish();
	      }
	      if (isDeleted(metadata) && !opts.rev) {
	        err = createError(MISSING_DOC, "deleted");
	        return finish();
	      }
	      var objectStore = txn.objectStore(BY_SEQ_STORE);
	
	      var rev = opts.rev || metadata.winningRev;
	      var key = metadata.id + '::' + rev;
	
	      objectStore.index('_doc_id_rev').get(key).onsuccess = function (e) {
	        doc = e.target.result;
	        if (doc) {
	          doc = decodeDoc(doc);
	        }
	        if (!doc) {
	          err = createError(MISSING_DOC, 'missing');
	          return finish();
	        }
	        finish();
	      };
	    };
	  };
	
	  api._getAttachment = function (docId, attachId, attachment, opts, callback) {
	    var txn;
	    if (opts.ctx) {
	      txn = opts.ctx;
	    } else {
	      var txnResult = openTransactionSafely(idb,
	        [DOC_STORE, BY_SEQ_STORE, ATTACH_STORE], 'readonly');
	      if (txnResult.error) {
	        return callback(txnResult.error);
	      }
	      txn = txnResult.txn;
	    }
	    var digest = attachment.digest;
	    var type = attachment.content_type;
	
	    txn.objectStore(ATTACH_STORE).get(digest).onsuccess = function (e) {
	      var body = e.target.result.body;
	      readBlobData(body, type, opts.binary, function (blobData) {
	        callback(null, blobData);
	      });
	    };
	  };
	
	  api._info = function idb_info(callback) {
	
	    if (idb === null || !cachedDBs.has(dbName)) {
	      var error = new Error('db isn\'t open');
	      error.id = 'idbNull';
	      return callback(error);
	    }
	    var updateSeq;
	    var docCount;
	
	    var txnResult = openTransactionSafely(idb, [BY_SEQ_STORE], 'readonly');
	    if (txnResult.error) {
	      return callback(txnResult.error);
	    }
	    var txn = txnResult.txn;
	    var cursor = txn.objectStore(BY_SEQ_STORE).openCursor(null, 'prev');
	    cursor.onsuccess = function (event) {
	      var cursor = event.target.result;
	      updateSeq = cursor ? cursor.key : 0;
	      // count within the same txn for consistency
	      docCount = api._meta.docCount;
	    };
	
	    txn.oncomplete = function () {
	      callback(null, {
	        doc_count: docCount,
	        update_seq: updateSeq,
	        // for debugging
	        idb_attachment_format: (api._meta.blobSupport ? 'binary' : 'base64')
	      });
	    };
	  };
	
	  api._allDocs = function idb_allDocs(opts, callback) {
	    idbAllDocs(opts, api, idb, callback);
	  };
	
	  api._changes = function (opts) {
	    opts = clone(opts);
	
	    if (opts.continuous) {
	      var id = dbName + ':' + uuid();
	      idbChanges.addListener(dbName, id, api, opts);
	      idbChanges.notify(dbName);
	      return {
	        cancel: function () {
	          idbChanges.removeListener(dbName, id);
	        }
	      };
	    }
	
	    var docIds = opts.doc_ids && new pouchdbCollections.Set(opts.doc_ids);
	
	    opts.since = opts.since || 0;
	    var lastSeq = opts.since;
	
	    var limit = 'limit' in opts ? opts.limit : -1;
	    if (limit === 0) {
	      limit = 1; // per CouchDB _changes spec
	    }
	    var returnDocs;
	    if ('return_docs' in opts) {
	      returnDocs = opts.return_docs;
	    } else if ('returnDocs' in opts) {
	      // TODO: Remove 'returnDocs' in favor of 'return_docs' in a future release
	      returnDocs = opts.returnDocs;
	    } else {
	      returnDocs = true;
	    }
	
	    var results = [];
	    var numResults = 0;
	    var filter = filterChange(opts);
	    var docIdsToMetadata = new pouchdbCollections.Map();
	
	    var txn;
	    var bySeqStore;
	    var docStore;
	    var docIdRevIndex;
	
	    function onGetCursor(cursor) {
	
	      var doc = decodeDoc(cursor.value);
	      var seq = cursor.key;
	
	      if (docIds && !docIds.has(doc._id)) {
	        return cursor.continue();
	      }
	
	      var metadata;
	
	      function onGetMetadata() {
	        if (metadata.seq !== seq) {
	          // some other seq is later
	          return cursor.continue();
	        }
	
	        lastSeq = seq;
	
	        if (metadata.winningRev === doc._rev) {
	          return onGetWinningDoc(doc);
	        }
	
	        fetchWinningDoc();
	      }
	
	      function fetchWinningDoc() {
	        var docIdRev = doc._id + '::' + metadata.winningRev;
	        var req = docIdRevIndex.get(docIdRev);
	        req.onsuccess = function (e) {
	          onGetWinningDoc(decodeDoc(e.target.result));
	        };
	      }
	
	      function onGetWinningDoc(winningDoc) {
	
	        var change = opts.processChange(winningDoc, metadata, opts);
	        change.seq = metadata.seq;
	
	        var filtered = filter(change);
	        if (typeof filtered === 'object') {
	          return opts.complete(filtered);
	        }
	
	        if (filtered) {
	          numResults++;
	          if (returnDocs) {
	            results.push(change);
	          }
	          // process the attachment immediately
	          // for the benefit of live listeners
	          if (opts.attachments && opts.include_docs) {
	            fetchAttachmentsIfNecessary(winningDoc, opts, txn, function () {
	              postProcessAttachments([change], opts.binary).then(function () {
	                opts.onChange(change);
	              });
	            });
	          } else {
	            opts.onChange(change);
	          }
	        }
	        if (numResults !== limit) {
	          cursor.continue();
	        }
	      }
	
	      metadata = docIdsToMetadata.get(doc._id);
	      if (metadata) { // cached
	        return onGetMetadata();
	      }
	      // metadata not cached, have to go fetch it
	      docStore.get(doc._id).onsuccess = function (event) {
	        metadata = decodeMetadata(event.target.result);
	        docIdsToMetadata.set(doc._id, metadata);
	        onGetMetadata();
	      };
	    }
	
	    function onsuccess(event) {
	      var cursor = event.target.result;
	
	      if (!cursor) {
	        return;
	      }
	      onGetCursor(cursor);
	    }
	
	    function fetchChanges() {
	      var objectStores = [DOC_STORE, BY_SEQ_STORE];
	      if (opts.attachments) {
	        objectStores.push(ATTACH_STORE);
	      }
	      var txnResult = openTransactionSafely(idb, objectStores, 'readonly');
	      if (txnResult.error) {
	        return opts.complete(txnResult.error);
	      }
	      txn = txnResult.txn;
	      txn.onabort = idbError(opts.complete);
	      txn.oncomplete = onTxnComplete;
	
	      bySeqStore = txn.objectStore(BY_SEQ_STORE);
	      docStore = txn.objectStore(DOC_STORE);
	      docIdRevIndex = bySeqStore.index('_doc_id_rev');
	
	      var req;
	
	      if (opts.descending) {
	        req = bySeqStore.openCursor(null, 'prev');
	      } else {
	        req = bySeqStore.openCursor(IDBKeyRange.lowerBound(opts.since, true));
	      }
	
	      req.onsuccess = onsuccess;
	    }
	
	    fetchChanges();
	
	    function onTxnComplete() {
	
	      function finish() {
	        opts.complete(null, {
	          results: results,
	          last_seq: lastSeq
	        });
	      }
	
	      if (!opts.continuous && opts.attachments) {
	        // cannot guarantee that postProcessing was already done,
	        // so do it again
	        postProcessAttachments(results).then(finish);
	      } else {
	        finish();
	      }
	    }
	  };
	
	  api._close = function (callback) {
	    if (idb === null) {
	      return callback(createError(NOT_OPEN));
	    }
	
	    // https://developer.mozilla.org/en-US/docs/IndexedDB/IDBDatabase#close
	    // "Returns immediately and closes the connection in a separate thread..."
	    idb.close();
	    cachedDBs.delete(dbName);
	    idb = null;
	    callback();
	  };
	
	  api._getRevisionTree = function (docId, callback) {
	    var txnResult = openTransactionSafely(idb, [DOC_STORE], 'readonly');
	    if (txnResult.error) {
	      return callback(txnResult.error);
	    }
	    var txn = txnResult.txn;
	    var req = txn.objectStore(DOC_STORE).get(docId);
	    req.onsuccess = function (event) {
	      var doc = decodeMetadata(event.target.result);
	      if (!doc) {
	        callback(createError(MISSING_DOC));
	      } else {
	        callback(null, doc.rev_tree);
	      }
	    };
	  };
	
	  // This function removes revisions of document docId
	  // which are listed in revs and sets this document
	  // revision to to rev_tree
	  api._doCompaction = function (docId, revs, callback) {
	    var stores = [
	      DOC_STORE,
	      BY_SEQ_STORE,
	      ATTACH_STORE,
	      ATTACH_AND_SEQ_STORE
	    ];
	    var txnResult = openTransactionSafely(idb, stores, 'readwrite');
	    if (txnResult.error) {
	      return callback(txnResult.error);
	    }
	    var txn = txnResult.txn;
	
	    var docStore = txn.objectStore(DOC_STORE);
	
	    docStore.get(docId).onsuccess = function (event) {
	      var metadata = decodeMetadata(event.target.result);
	      traverseRevTree(metadata.rev_tree, function (isLeaf, pos,
	                                                         revHash, ctx, opts) {
	        var rev = pos + '-' + revHash;
	        if (revs.indexOf(rev) !== -1) {
	          opts.status = 'missing';
	        }
	      });
	      compactRevs(revs, docId, txn);
	      var winningRev = metadata.winningRev;
	      var deleted = metadata.deleted;
	      txn.objectStore(DOC_STORE).put(
	        encodeMetadata(metadata, winningRev, deleted));
	    };
	    txn.onabort = idbError(callback);
	    txn.oncomplete = function () {
	      callback();
	    };
	  };
	
	
	  api._getLocal = function (id, callback) {
	    var txnResult = openTransactionSafely(idb, [LOCAL_STORE], 'readonly');
	    if (txnResult.error) {
	      return callback(txnResult.error);
	    }
	    var tx = txnResult.txn;
	    var req = tx.objectStore(LOCAL_STORE).get(id);
	
	    req.onerror = idbError(callback);
	    req.onsuccess = function (e) {
	      var doc = e.target.result;
	      if (!doc) {
	        callback(createError(MISSING_DOC));
	      } else {
	        delete doc['_doc_id_rev']; // for backwards compat
	        callback(null, doc);
	      }
	    };
	  };
	
	  api._putLocal = function (doc, opts, callback) {
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    delete doc._revisions; // ignore this, trust the rev
	    var oldRev = doc._rev;
	    var id = doc._id;
	    if (!oldRev) {
	      doc._rev = '0-1';
	    } else {
	      doc._rev = '0-' + (parseInt(oldRev.split('-')[1], 10) + 1);
	    }
	
	    var tx = opts.ctx;
	    var ret;
	    if (!tx) {
	      var txnResult = openTransactionSafely(idb, [LOCAL_STORE], 'readwrite');
	      if (txnResult.error) {
	        return callback(txnResult.error);
	      }
	      tx = txnResult.txn;
	      tx.onerror = idbError(callback);
	      tx.oncomplete = function () {
	        if (ret) {
	          callback(null, ret);
	        }
	      };
	    }
	
	    var oStore = tx.objectStore(LOCAL_STORE);
	    var req;
	    if (oldRev) {
	      req = oStore.get(id);
	      req.onsuccess = function (e) {
	        var oldDoc = e.target.result;
	        if (!oldDoc || oldDoc._rev !== oldRev) {
	          callback(createError(REV_CONFLICT));
	        } else { // update
	          var req = oStore.put(doc);
	          req.onsuccess = function () {
	            ret = {ok: true, id: doc._id, rev: doc._rev};
	            if (opts.ctx) { // return immediately
	              callback(null, ret);
	            }
	          };
	        }
	      };
	    } else { // new doc
	      req = oStore.add(doc);
	      req.onerror = function (e) {
	        // constraint error, already exists
	        callback(createError(REV_CONFLICT));
	        e.preventDefault(); // avoid transaction abort
	        e.stopPropagation(); // avoid transaction onerror
	      };
	      req.onsuccess = function () {
	        ret = {ok: true, id: doc._id, rev: doc._rev};
	        if (opts.ctx) { // return immediately
	          callback(null, ret);
	        }
	      };
	    }
	  };
	
	  api._removeLocal = function (doc, opts, callback) {
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    var tx = opts.ctx;
	    if (!tx) {
	      var txnResult = openTransactionSafely(idb, [LOCAL_STORE], 'readwrite');
	      if (txnResult.error) {
	        return callback(txnResult.error);
	      }
	      tx = txnResult.txn;
	      tx.oncomplete = function () {
	        if (ret) {
	          callback(null, ret);
	        }
	      };
	    }
	    var ret;
	    var id = doc._id;
	    var oStore = tx.objectStore(LOCAL_STORE);
	    var req = oStore.get(id);
	
	    req.onerror = idbError(callback);
	    req.onsuccess = function (e) {
	      var oldDoc = e.target.result;
	      if (!oldDoc || oldDoc._rev !== doc._rev) {
	        callback(createError(MISSING_DOC));
	      } else {
	        oStore.delete(id);
	        ret = {ok: true, id: id, rev: '0-0'};
	        if (opts.ctx) { // return immediately
	          callback(null, ret);
	        }
	      }
	    };
	  };
	
	  api._destroy = function (opts, callback) {
	    idbChanges.removeAllListeners(dbName);
	
	    //Close open request for "dbName" database to fix ie delay.
	    var openReq = openReqList.get(dbName);
	    if (openReq && openReq.result) {
	      openReq.result.close();
	      cachedDBs.delete(dbName);
	    }
	    var req = indexedDB.deleteDatabase(dbName);
	
	    req.onsuccess = function () {
	      //Remove open request from the list.
	      openReqList.delete(dbName);
	      if (hasLocalStorage() && (dbName in localStorage)) {
	        delete localStorage[dbName];
	      }
	      callback(null, { 'ok': true });
	    };
	
	    req.onerror = idbError(callback);
	  };
	
	  var cached = cachedDBs.get(dbName);
	
	  if (cached) {
	    idb = cached.idb;
	    api._meta = cached.global;
	    process.nextTick(function () {
	      callback(null, api);
	    });
	    return;
	  }
	
	  var req;
	  if (opts.storage) {
	    req = tryStorageOption(dbName, opts.storage);
	  } else {
	    req = indexedDB.open(dbName, ADAPTER_VERSION);
	  }
	
	  openReqList.set(dbName, req);
	
	  req.onupgradeneeded = function (e) {
	    var db = e.target.result;
	    if (e.oldVersion < 1) {
	      return createSchema(db); // new db, initial schema
	    }
	    // do migrations
	
	    var txn = e.currentTarget.transaction;
	    // these migrations have to be done in this function, before
	    // control is returned to the event loop, because IndexedDB
	
	    if (e.oldVersion < 3) {
	      createLocalStoreSchema(db); // v2 -> v3
	    }
	    if (e.oldVersion < 4) {
	      addAttachAndSeqStore(db); // v3 -> v4
	    }
	
	    var migrations = [
	      addDeletedOrLocalIndex, // v1 -> v2
	      migrateLocalStore,      // v2 -> v3
	      migrateAttsAndSeqs,     // v3 -> v4
	      migrateMetadata         // v4 -> v5
	    ];
	
	    var i = e.oldVersion;
	
	    function next() {
	      var migration = migrations[i - 1];
	      i++;
	      if (migration) {
	        migration(txn, next);
	      }
	    }
	
	    next();
	  };
	
	  req.onsuccess = function (e) {
	
	    idb = e.target.result;
	
	    idb.onversionchange = function () {
	      idb.close();
	      cachedDBs.delete(dbName);
	    };
	
	    idb.onabort = function (e) {
	      guardedConsole('error', 'Database has a global failure', e.target.error);
	      idb.close();
	      cachedDBs.delete(dbName);
	    };
	
	    var txn = idb.transaction([
	      META_STORE,
	      DETECT_BLOB_SUPPORT_STORE,
	      DOC_STORE
	    ], 'readwrite');
	
	    var req = txn.objectStore(META_STORE).get(META_STORE);
	
	    var blobSupport = null;
	    var docCount = null;
	    var instanceId = null;
	
	    req.onsuccess = function (e) {
	
	      var checkSetupComplete = function () {
	        if (blobSupport === null || docCount === null ||
	            instanceId === null) {
	          return;
	        } else {
	          api._meta = {
	            name: dbName,
	            instanceId: instanceId,
	            blobSupport: blobSupport,
	            docCount: docCount
	          };
	
	          cachedDBs.set(dbName, {
	            idb: idb,
	            global: api._meta
	          });
	          callback(null, api);
	        }
	      };
	
	      //
	      // fetch/store the id
	      //
	
	      var meta = e.target.result || {id: META_STORE};
	      if (dbName  + '_id' in meta) {
	        instanceId = meta[dbName + '_id'];
	        checkSetupComplete();
	      } else {
	        instanceId = uuid();
	        meta[dbName + '_id'] = instanceId;
	        txn.objectStore(META_STORE).put(meta).onsuccess = function () {
	          checkSetupComplete();
	        };
	      }
	
	      //
	      // check blob support
	      //
	
	      if (!blobSupportPromise) {
	        // make sure blob support is only checked once
	        blobSupportPromise = checkBlobSupport(txn);
	      }
	
	      blobSupportPromise.then(function (val) {
	        blobSupport = val;
	        checkSetupComplete();
	      });
	
	      //
	      // count docs
	      //
	
	      var index = txn.objectStore(DOC_STORE).index('deletedOrLocal');
	      index.count(IDBKeyRange.only('0')).onsuccess = function (e) {
	        docCount = e.target.result;
	        checkSetupComplete();
	      };
	
	    };
	  };
	
	  req.onerror = function () {
	    var msg = 'Failed to open indexedDB, are you in private browsing mode?';
	    guardedConsole('error', msg);
	    callback(createError(IDB_ERROR, msg));
	  };
	}
	
	IdbPouch.valid = function () {
	  // Issue #2533, we finally gave up on doing bug
	  // detection instead of browser sniffing. Safari brought us
	  // to our knees.
	  var isSafari = typeof openDatabase !== 'undefined' &&
	    /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) &&
	    !/Chrome/.test(navigator.userAgent) &&
	    !/BlackBerry/.test(navigator.platform);
	
	  // some outdated implementations of IDB that appear on Samsung
	  // and HTC Android devices <4.4 are missing IDBKeyRange
	  return !isSafari && typeof indexedDB !== 'undefined' &&
	    typeof IDBKeyRange !== 'undefined';
	};
	
	function tryStorageOption(dbName, storage) {
	  try { // option only available in Firefox 26+
	    return indexedDB.open(dbName, {
	      version: ADAPTER_VERSION,
	      storage: storage
	    });
	  } catch(err) {
	      return indexedDB.open(dbName, ADAPTER_VERSION);
	  }
	}
	
	function IDBPouch (PouchDB) {
	  PouchDB.adapter('idb', IdbPouch, true);
	}
	
	//
	// Parsing hex strings. Yeah.
	//
	// So basically we need this because of a bug in WebSQL:
	// https://code.google.com/p/chromium/issues/detail?id=422690
	// https://bugs.webkit.org/show_bug.cgi?id=137637
	//
	// UTF-8 and UTF-16 are provided as separate functions
	// for meager performance improvements
	//
	
	function decodeUtf8(str) {
	  return decodeURIComponent(escape(str));
	}
	
	function hexToInt(charCode) {
	  // '0'-'9' is 48-57
	  // 'A'-'F' is 65-70
	  // SQLite will only give us uppercase hex
	  return charCode < 65 ? (charCode - 48) : (charCode - 55);
	}
	
	
	// Example:
	// pragma encoding=utf8;
	// select hex('A');
	// returns '41'
	function parseHexUtf8(str, start, end) {
	  var result = '';
	  while (start < end) {
	    result += String.fromCharCode(
	      (hexToInt(str.charCodeAt(start++)) << 4) |
	        hexToInt(str.charCodeAt(start++)));
	  }
	  return result;
	}
	
	// Example:
	// pragma encoding=utf16;
	// select hex('A');
	// returns '4100'
	// notice that the 00 comes after the 41 (i.e. it's swizzled)
	function parseHexUtf16(str, start, end) {
	  var result = '';
	  while (start < end) {
	    // UTF-16, so swizzle the bytes
	    result += String.fromCharCode(
	      (hexToInt(str.charCodeAt(start + 2)) << 12) |
	        (hexToInt(str.charCodeAt(start + 3)) << 8) |
	        (hexToInt(str.charCodeAt(start)) << 4) |
	        hexToInt(str.charCodeAt(start + 1)));
	    start += 4;
	  }
	  return result;
	}
	
	function parseHexString(str, encoding) {
	  if (encoding === 'UTF-8') {
	    return decodeUtf8(parseHexUtf8(str, 0, str.length));
	  } else {
	    return parseHexUtf16(str, 0, str.length);
	  }
	}
	
	function quote(str) {
	  return "'" + str + "'";
	}
	
	var ADAPTER_VERSION$1 = 7; // used to manage migrations
	
	// The object stores created for each database
	// DOC_STORE stores the document meta data, its revision history and state
	var DOC_STORE$1 = quote('document-store');
	// BY_SEQ_STORE stores a particular version of a document, keyed by its
	// sequence id
	var BY_SEQ_STORE$1 = quote('by-sequence');
	// Where we store attachments
	var ATTACH_STORE$1 = quote('attach-store');
	var LOCAL_STORE$1 = quote('local-store');
	var META_STORE$1 = quote('metadata-store');
	// where we store many-to-many relations between attachment
	// digests and seqs
	var ATTACH_AND_SEQ_STORE$1 = quote('attach-seq-store');
	
	// escapeBlob and unescapeBlob are workarounds for a websql bug:
	// https://code.google.com/p/chromium/issues/detail?id=422690
	// https://bugs.webkit.org/show_bug.cgi?id=137637
	// The goal is to never actually insert the \u0000 character
	// in the database.
	function escapeBlob(str) {
	  return str
	    .replace(/\u0002/g, '\u0002\u0002')
	    .replace(/\u0001/g, '\u0001\u0002')
	    .replace(/\u0000/g, '\u0001\u0001');
	}
	
	function unescapeBlob(str) {
	  return str
	    .replace(/\u0001\u0001/g, '\u0000')
	    .replace(/\u0001\u0002/g, '\u0001')
	    .replace(/\u0002\u0002/g, '\u0002');
	}
	
	function stringifyDoc(doc) {
	  // don't bother storing the id/rev. it uses lots of space,
	  // in persistent map/reduce especially
	  delete doc._id;
	  delete doc._rev;
	  return JSON.stringify(doc);
	}
	
	function unstringifyDoc(doc, id, rev) {
	  doc = JSON.parse(doc);
	  doc._id = id;
	  doc._rev = rev;
	  return doc;
	}
	
	// question mark groups IN queries, e.g. 3 -> '(?,?,?)'
	function qMarks(num) {
	  var s = '(';
	  while (num--) {
	    s += '?';
	    if (num) {
	      s += ',';
	    }
	  }
	  return s + ')';
	}
	
	function select(selector, table, joiner, where, orderBy) {
	  return 'SELECT ' + selector + ' FROM ' +
	    (typeof table === 'string' ? table : table.join(' JOIN ')) +
	    (joiner ? (' ON ' + joiner) : '') +
	    (where ? (' WHERE ' +
	    (typeof where === 'string' ? where : where.join(' AND '))) : '') +
	    (orderBy ? (' ORDER BY ' + orderBy) : '');
	}
	
	function compactRevs$1(revs, docId, tx) {
	
	  if (!revs.length) {
	    return;
	  }
	
	  var numDone = 0;
	  var seqs = [];
	
	  function checkDone() {
	    if (++numDone === revs.length) { // done
	      deleteOrphans();
	    }
	  }
	
	  function deleteOrphans() {
	    // find orphaned attachment digests
	
	    if (!seqs.length) {
	      return;
	    }
	
	    var sql = 'SELECT DISTINCT digest AS digest FROM ' +
	      ATTACH_AND_SEQ_STORE$1 + ' WHERE seq IN ' + qMarks(seqs.length);
	
	    tx.executeSql(sql, seqs, function (tx, res) {
	
	      var digestsToCheck = [];
	      for (var i = 0; i < res.rows.length; i++) {
	        digestsToCheck.push(res.rows.item(i).digest);
	      }
	      if (!digestsToCheck.length) {
	        return;
	      }
	
	      var sql = 'DELETE FROM ' + ATTACH_AND_SEQ_STORE$1 +
	        ' WHERE seq IN (' +
	        seqs.map(function () { return '?'; }).join(',') +
	        ')';
	      tx.executeSql(sql, seqs, function (tx) {
	
	        var sql = 'SELECT digest FROM ' + ATTACH_AND_SEQ_STORE$1 +
	          ' WHERE digest IN (' +
	          digestsToCheck.map(function () { return '?'; }).join(',') +
	          ')';
	        tx.executeSql(sql, digestsToCheck, function (tx, res) {
	          var nonOrphanedDigests = new pouchdbCollections.Set();
	          for (var i = 0; i < res.rows.length; i++) {
	            nonOrphanedDigests.add(res.rows.item(i).digest);
	          }
	          digestsToCheck.forEach(function (digest) {
	            if (nonOrphanedDigests.has(digest)) {
	              return;
	            }
	            tx.executeSql(
	              'DELETE FROM ' + ATTACH_AND_SEQ_STORE$1 + ' WHERE digest=?',
	              [digest]);
	            tx.executeSql(
	              'DELETE FROM ' + ATTACH_STORE$1 + ' WHERE digest=?', [digest]);
	          });
	        });
	      });
	    });
	  }
	
	  // update by-seq and attach stores in parallel
	  revs.forEach(function (rev) {
	    var sql = 'SELECT seq FROM ' + BY_SEQ_STORE$1 +
	      ' WHERE doc_id=? AND rev=?';
	
	    tx.executeSql(sql, [docId, rev], function (tx, res) {
	      if (!res.rows.length) { // already deleted
	        return checkDone();
	      }
	      var seq = res.rows.item(0).seq;
	      seqs.push(seq);
	
	      tx.executeSql(
	        'DELETE FROM ' + BY_SEQ_STORE$1 + ' WHERE seq=?', [seq], checkDone);
	    });
	  });
	}
	
	function websqlError(callback) {
	  return function (event) {
	    guardedConsole('error', 'WebSQL threw an error', event);
	    // event may actually be a SQLError object, so report is as such
	    var errorNameMatch = event && event.constructor.toString()
	        .match(/function ([^\(]+)/);
	    var errorName = (errorNameMatch && errorNameMatch[1]) || event.type;
	    var errorReason = event.target || event.message;
	    callback(createError(WSQ_ERROR, errorReason, errorName));
	  };
	}
	
	function getSize(opts) {
	  if ('size' in opts) {
	    // triggers immediate popup in iOS, fixes #2347
	    // e.g. 5000001 asks for 5 MB, 10000001 asks for 10 MB,
	    return opts.size * 1000000;
	  }
	  // In iOS, doesn't matter as long as it's <= 5000000.
	  // Except that if you request too much, our tests fail
	  // because of the native "do you accept?" popup.
	  // In Android <=4.3, this value is actually used as an
	  // honest-to-god ceiling for data, so we need to
	  // set it to a decently high number.
	  var isAndroid = typeof navigator !== 'undefined' &&
	    /Android/.test(navigator.userAgent);
	  return isAndroid ? 5000000 : 1; // in PhantomJS, if you use 0 it will crash
	}
	
	function websqlBulkDocs(dbOpts, req, opts, api, db, websqlChanges, callback) {
	  var newEdits = opts.new_edits;
	  var userDocs = req.docs;
	
	  // Parse the docs, give them a sequence number for the result
	  var docInfos = userDocs.map(function (doc) {
	    if (doc._id && isLocalId(doc._id)) {
	      return doc;
	    }
	    var newDoc = parseDoc(doc, newEdits);
	    return newDoc;
	  });
	
	  var docInfoErrors = docInfos.filter(function (docInfo) {
	    return docInfo.error;
	  });
	  if (docInfoErrors.length) {
	    return callback(docInfoErrors[0]);
	  }
	
	  var tx;
	  var results = new Array(docInfos.length);
	  var fetchedDocs = new pouchdbCollections.Map();
	
	  var preconditionErrored;
	  function complete() {
	    if (preconditionErrored) {
	      return callback(preconditionErrored);
	    }
	    websqlChanges.notify(api._name);
	    api._docCount = -1; // invalidate
	    callback(null, results);
	  }
	
	  function verifyAttachment(digest, callback) {
	    var sql = 'SELECT count(*) as cnt FROM ' + ATTACH_STORE$1 +
	      ' WHERE digest=?';
	    tx.executeSql(sql, [digest], function (tx, result) {
	      if (result.rows.item(0).cnt === 0) {
	        var err = createError(MISSING_STUB,
	          'unknown stub attachment with digest ' +
	          digest);
	        callback(err);
	      } else {
	        callback();
	      }
	    });
	  }
	
	  function verifyAttachments(finish) {
	    var digests = [];
	    docInfos.forEach(function (docInfo) {
	      if (docInfo.data && docInfo.data._attachments) {
	        Object.keys(docInfo.data._attachments).forEach(function (filename) {
	          var att = docInfo.data._attachments[filename];
	          if (att.stub) {
	            digests.push(att.digest);
	          }
	        });
	      }
	    });
	    if (!digests.length) {
	      return finish();
	    }
	    var numDone = 0;
	    var err;
	
	    function checkDone() {
	      if (++numDone === digests.length) {
	        finish(err);
	      }
	    }
	    digests.forEach(function (digest) {
	      verifyAttachment(digest, function (attErr) {
	        if (attErr && !err) {
	          err = attErr;
	        }
	        checkDone();
	      });
	    });
	  }
	
	  function writeDoc(docInfo, winningRev, winningRevIsDeleted, newRevIsDeleted,
	                    isUpdate, delta, resultsIdx, callback) {
	
	    function finish() {
	      var data = docInfo.data;
	      var deletedInt = newRevIsDeleted ? 1 : 0;
	
	      var id = data._id;
	      var rev = data._rev;
	      var json = stringifyDoc(data);
	      var sql = 'INSERT INTO ' + BY_SEQ_STORE$1 +
	        ' (doc_id, rev, json, deleted) VALUES (?, ?, ?, ?);';
	      var sqlArgs = [id, rev, json, deletedInt];
	
	      // map seqs to attachment digests, which
	      // we will need later during compaction
	      function insertAttachmentMappings(seq, callback) {
	        var attsAdded = 0;
	        var attsToAdd = Object.keys(data._attachments || {});
	
	        if (!attsToAdd.length) {
	          return callback();
	        }
	        function checkDone() {
	          if (++attsAdded === attsToAdd.length) {
	            callback();
	          }
	          return false; // ack handling a constraint error
	        }
	        function add(att) {
	          var sql = 'INSERT INTO ' + ATTACH_AND_SEQ_STORE$1 +
	            ' (digest, seq) VALUES (?,?)';
	          var sqlArgs = [data._attachments[att].digest, seq];
	          tx.executeSql(sql, sqlArgs, checkDone, checkDone);
	          // second callback is for a constaint error, which we ignore
	          // because this docid/rev has already been associated with
	          // the digest (e.g. when new_edits == false)
	        }
	        for (var i = 0; i < attsToAdd.length; i++) {
	          add(attsToAdd[i]); // do in parallel
	        }
	      }
	
	      tx.executeSql(sql, sqlArgs, function (tx, result) {
	        var seq = result.insertId;
	        insertAttachmentMappings(seq, function () {
	          dataWritten(tx, seq);
	        });
	      }, function () {
	        // constraint error, recover by updating instead (see #1638)
	        var fetchSql = select('seq', BY_SEQ_STORE$1, null,
	          'doc_id=? AND rev=?');
	        tx.executeSql(fetchSql, [id, rev], function (tx, res) {
	          var seq = res.rows.item(0).seq;
	          var sql = 'UPDATE ' + BY_SEQ_STORE$1 +
	            ' SET json=?, deleted=? WHERE doc_id=? AND rev=?;';
	          var sqlArgs = [json, deletedInt, id, rev];
	          tx.executeSql(sql, sqlArgs, function (tx) {
	            insertAttachmentMappings(seq, function () {
	              dataWritten(tx, seq);
	            });
	          });
	        });
	        return false; // ack that we've handled the error
	      });
	    }
	
	    function collectResults(attachmentErr) {
	      if (!err) {
	        if (attachmentErr) {
	          err = attachmentErr;
	          callback(err);
	        } else if (recv === attachments.length) {
	          finish();
	        }
	      }
	    }
	
	    var err = null;
	    var recv = 0;
	
	    docInfo.data._id = docInfo.metadata.id;
	    docInfo.data._rev = docInfo.metadata.rev;
	    var attachments = Object.keys(docInfo.data._attachments || {});
	
	
	    if (newRevIsDeleted) {
	      docInfo.data._deleted = true;
	    }
	
	    function attachmentSaved(err) {
	      recv++;
	      collectResults(err);
	    }
	
	    attachments.forEach(function (key) {
	      var att = docInfo.data._attachments[key];
	      if (!att.stub) {
	        var data = att.data;
	        delete att.data;
	        att.revpos = parseInt(winningRev, 10);
	        var digest = att.digest;
	        saveAttachment(digest, data, attachmentSaved);
	      } else {
	        recv++;
	        collectResults();
	      }
	    });
	
	    if (!attachments.length) {
	      finish();
	    }
	
	    function dataWritten(tx, seq) {
	      var id = docInfo.metadata.id;
	
	      var revsToCompact = docInfo.stemmedRevs || [];
	      if (isUpdate && api.auto_compaction) {
	        revsToCompact = compactTree(docInfo.metadata).concat(revsToCompact);
	      }
	      if (revsToCompact.length) {
	        compactRevs$1(revsToCompact, id, tx);
	      }
	
	      docInfo.metadata.seq = seq;
	      delete docInfo.metadata.rev;
	
	      var sql = isUpdate ?
	      'UPDATE ' + DOC_STORE$1 +
	      ' SET json=?, max_seq=?, winningseq=' +
	      '(SELECT seq FROM ' + BY_SEQ_STORE$1 +
	      ' WHERE doc_id=' + DOC_STORE$1 + '.id AND rev=?) WHERE id=?'
	        : 'INSERT INTO ' + DOC_STORE$1 +
	      ' (id, winningseq, max_seq, json) VALUES (?,?,?,?);';
	      var metadataStr = safeJsonStringify(docInfo.metadata);
	      var params = isUpdate ?
	        [metadataStr, seq, winningRev, id] :
	        [id, seq, seq, metadataStr];
	      tx.executeSql(sql, params, function () {
	        results[resultsIdx] = {
	          ok: true,
	          id: docInfo.metadata.id,
	          rev: winningRev
	        };
	        fetchedDocs.set(id, docInfo.metadata);
	        callback();
	      });
	    }
	  }
	
	  function websqlProcessDocs() {
	    processDocs(dbOpts.revs_limit, docInfos, api, fetchedDocs, tx,
	                results, writeDoc, opts);
	  }
	
	  function fetchExistingDocs(callback) {
	    if (!docInfos.length) {
	      return callback();
	    }
	
	    var numFetched = 0;
	
	    function checkDone() {
	      if (++numFetched === docInfos.length) {
	        callback();
	      }
	    }
	
	    docInfos.forEach(function (docInfo) {
	      if (docInfo._id && isLocalId(docInfo._id)) {
	        return checkDone(); // skip local docs
	      }
	      var id = docInfo.metadata.id;
	      tx.executeSql('SELECT json FROM ' + DOC_STORE$1 +
	      ' WHERE id = ?', [id], function (tx, result) {
	        if (result.rows.length) {
	          var metadata = safeJsonParse(result.rows.item(0).json);
	          fetchedDocs.set(id, metadata);
	        }
	        checkDone();
	      });
	    });
	  }
	
	  function saveAttachment(digest, data, callback) {
	    var sql = 'SELECT digest FROM ' + ATTACH_STORE$1 + ' WHERE digest=?';
	    tx.executeSql(sql, [digest], function (tx, result) {
	      if (result.rows.length) { // attachment already exists
	        return callback();
	      }
	      // we could just insert before selecting and catch the error,
	      // but my hunch is that it's cheaper not to serialize the blob
	      // from JS to C if we don't have to (TODO: confirm this)
	      sql = 'INSERT INTO ' + ATTACH_STORE$1 +
	      ' (digest, body, escaped) VALUES (?,?,1)';
	      tx.executeSql(sql, [digest, escapeBlob(data)], function () {
	        callback();
	      }, function () {
	        // ignore constaint errors, means it already exists
	        callback();
	        return false; // ack we handled the error
	      });
	    });
	  }
	
	  preprocessAttachments(docInfos, 'binary', function (err) {
	    if (err) {
	      return callback(err);
	    }
	    db.transaction(function (txn) {
	      tx = txn;
	      verifyAttachments(function (err) {
	        if (err) {
	          preconditionErrored = err;
	        } else {
	          fetchExistingDocs(websqlProcessDocs);
	        }
	      });
	    }, websqlError(callback), complete);
	  });
	}
	
	var cachedDatabases = new pouchdbCollections.Map();
	
	// openDatabase passed in through opts (e.g. for node-websql)
	function openDatabaseWithOpts(opts) {
	  return opts.websql(opts.name, opts.version, opts.description, opts.size);
	}
	
	function openDBSafely(opts) {
	  try {
	    return {
	      db: openDatabaseWithOpts(opts)
	    };
	  } catch (err) {
	    return {
	      error: err
	    };
	  }
	}
	
	function openDB(opts) {
	  var cachedResult = cachedDatabases.get(opts.name);
	  if (!cachedResult) {
	    cachedResult = openDBSafely(opts);
	    cachedDatabases.set(opts.name, cachedResult);
	    if (cachedResult.db) {
	      cachedResult.db._sqlitePlugin = typeof sqlitePlugin !== 'undefined';
	    }
	  }
	  return cachedResult;
	}
	
	var websqlChanges = new Changes$1();
	
	function fetchAttachmentsIfNecessary$1(doc, opts, api, txn, cb) {
	  var attachments = Object.keys(doc._attachments || {});
	  if (!attachments.length) {
	    return cb && cb();
	  }
	  var numDone = 0;
	
	  function checkDone() {
	    if (++numDone === attachments.length && cb) {
	      cb();
	    }
	  }
	
	  function fetchAttachment(doc, att) {
	    var attObj = doc._attachments[att];
	    var attOpts = {binary: opts.binary, ctx: txn};
	    api._getAttachment(doc._id, att, attObj, attOpts, function (_, data) {
	      doc._attachments[att] = jsExtend.extend(
	        pick(attObj, ['digest', 'content_type']),
	        { data: data }
	      );
	      checkDone();
	    });
	  }
	
	  attachments.forEach(function (att) {
	    if (opts.attachments && opts.include_docs) {
	      fetchAttachment(doc, att);
	    } else {
	      doc._attachments[att].stub = true;
	      checkDone();
	    }
	  });
	}
	
	var POUCH_VERSION = 1;
	
	// these indexes cover the ground for most allDocs queries
	var BY_SEQ_STORE_DELETED_INDEX_SQL =
	  'CREATE INDEX IF NOT EXISTS \'by-seq-deleted-idx\' ON ' +
	  BY_SEQ_STORE$1 + ' (seq, deleted)';
	var BY_SEQ_STORE_DOC_ID_REV_INDEX_SQL =
	  'CREATE UNIQUE INDEX IF NOT EXISTS \'by-seq-doc-id-rev\' ON ' +
	    BY_SEQ_STORE$1 + ' (doc_id, rev)';
	var DOC_STORE_WINNINGSEQ_INDEX_SQL =
	  'CREATE INDEX IF NOT EXISTS \'doc-winningseq-idx\' ON ' +
	  DOC_STORE$1 + ' (winningseq)';
	var ATTACH_AND_SEQ_STORE_SEQ_INDEX_SQL =
	  'CREATE INDEX IF NOT EXISTS \'attach-seq-seq-idx\' ON ' +
	    ATTACH_AND_SEQ_STORE$1 + ' (seq)';
	var ATTACH_AND_SEQ_STORE_ATTACH_INDEX_SQL =
	  'CREATE UNIQUE INDEX IF NOT EXISTS \'attach-seq-digest-idx\' ON ' +
	    ATTACH_AND_SEQ_STORE$1 + ' (digest, seq)';
	
	var DOC_STORE_AND_BY_SEQ_JOINER = BY_SEQ_STORE$1 +
	  '.seq = ' + DOC_STORE$1 + '.winningseq';
	
	var SELECT_DOCS = BY_SEQ_STORE$1 + '.seq AS seq, ' +
	  BY_SEQ_STORE$1 + '.deleted AS deleted, ' +
	  BY_SEQ_STORE$1 + '.json AS data, ' +
	  BY_SEQ_STORE$1 + '.rev AS rev, ' +
	  DOC_STORE$1 + '.json AS metadata';
	
	function WebSqlPouch$1(opts, callback) {
	  var api = this;
	  var instanceId = null;
	  var size = getSize(opts);
	  var idRequests = [];
	  var encoding;
	
	  api._docCount = -1; // cache sqlite count(*) for performance
	  api._name = opts.name;
	
	  // extend the options here, because sqlite plugin has a ton of options
	  // and they are constantly changing, so it's more prudent to allow anything
	  var websqlOpts = jsExtend.extend({}, opts, {
	    version: POUCH_VERSION,
	    description: opts.name,
	    size: size
	  });
	  var openDBResult = openDB(websqlOpts);
	  if (openDBResult.error) {
	    return websqlError(callback)(openDBResult.error);
	  }
	  var db = openDBResult.db;
	  if (typeof db.readTransaction !== 'function') {
	    // doesn't exist in sqlite plugin
	    db.readTransaction = db.transaction;
	  }
	
	  function dbCreated() {
	    // note the db name in case the browser upgrades to idb
	    if (hasLocalStorage()) {
	      window.localStorage['_pouch__websqldb_' + api._name] = true;
	    }
	    callback(null, api);
	  }
	
	  // In this migration, we added the 'deleted' and 'local' columns to the
	  // by-seq and doc store tables.
	  // To preserve existing user data, we re-process all the existing JSON
	  // and add these values.
	  // Called migration2 because it corresponds to adapter version (db_version) #2
	  function runMigration2(tx, callback) {
	    // index used for the join in the allDocs query
	    tx.executeSql(DOC_STORE_WINNINGSEQ_INDEX_SQL);
	
	    tx.executeSql('ALTER TABLE ' + BY_SEQ_STORE$1 +
	      ' ADD COLUMN deleted TINYINT(1) DEFAULT 0', [], function () {
	      tx.executeSql(BY_SEQ_STORE_DELETED_INDEX_SQL);
	      tx.executeSql('ALTER TABLE ' + DOC_STORE$1 +
	        ' ADD COLUMN local TINYINT(1) DEFAULT 0', [], function () {
	        tx.executeSql('CREATE INDEX IF NOT EXISTS \'doc-store-local-idx\' ON ' +
	          DOC_STORE$1 + ' (local, id)');
	
	        var sql = 'SELECT ' + DOC_STORE$1 + '.winningseq AS seq, ' + DOC_STORE$1 +
	          '.json AS metadata FROM ' + BY_SEQ_STORE$1 + ' JOIN ' + DOC_STORE$1 +
	          ' ON ' + BY_SEQ_STORE$1 + '.seq = ' + DOC_STORE$1 + '.winningseq';
	
	        tx.executeSql(sql, [], function (tx, result) {
	
	          var deleted = [];
	          var local = [];
	
	          for (var i = 0; i < result.rows.length; i++) {
	            var item = result.rows.item(i);
	            var seq = item.seq;
	            var metadata = JSON.parse(item.metadata);
	            if (isDeleted(metadata)) {
	              deleted.push(seq);
	            }
	            if (isLocalId(metadata.id)) {
	              local.push(metadata.id);
	            }
	          }
	          tx.executeSql('UPDATE ' + DOC_STORE$1 + 'SET local = 1 WHERE id IN ' +
	            qMarks(local.length), local, function () {
	            tx.executeSql('UPDATE ' + BY_SEQ_STORE$1 +
	              ' SET deleted = 1 WHERE seq IN ' +
	              qMarks(deleted.length), deleted, callback);
	          });
	        });
	      });
	    });
	  }
	
	  // in this migration, we make all the local docs unversioned
	  function runMigration3(tx, callback) {
	    var local = 'CREATE TABLE IF NOT EXISTS ' + LOCAL_STORE$1 +
	      ' (id UNIQUE, rev, json)';
	    tx.executeSql(local, [], function () {
	      var sql = 'SELECT ' + DOC_STORE$1 + '.id AS id, ' +
	        BY_SEQ_STORE$1 + '.json AS data ' +
	        'FROM ' + BY_SEQ_STORE$1 + ' JOIN ' +
	        DOC_STORE$1 + ' ON ' + BY_SEQ_STORE$1 + '.seq = ' +
	        DOC_STORE$1 + '.winningseq WHERE local = 1';
	      tx.executeSql(sql, [], function (tx, res) {
	        var rows = [];
	        for (var i = 0; i < res.rows.length; i++) {
	          rows.push(res.rows.item(i));
	        }
	        function doNext() {
	          if (!rows.length) {
	            return callback(tx);
	          }
	          var row = rows.shift();
	          var rev = JSON.parse(row.data)._rev;
	          tx.executeSql('INSERT INTO ' + LOCAL_STORE$1 +
	              ' (id, rev, json) VALUES (?,?,?)',
	              [row.id, rev, row.data], function (tx) {
	            tx.executeSql('DELETE FROM ' + DOC_STORE$1 + ' WHERE id=?',
	                [row.id], function (tx) {
	              tx.executeSql('DELETE FROM ' + BY_SEQ_STORE$1 + ' WHERE seq=?',
	                  [row.seq], function () {
	                doNext();
	              });
	            });
	          });
	        }
	        doNext();
	      });
	    });
	  }
	
	  // in this migration, we remove doc_id_rev and just use rev
	  function runMigration4(tx, callback) {
	
	    function updateRows(rows) {
	      function doNext() {
	        if (!rows.length) {
	          return callback(tx);
	        }
	        var row = rows.shift();
	        var doc_id_rev = parseHexString(row.hex, encoding);
	        var idx = doc_id_rev.lastIndexOf('::');
	        var doc_id = doc_id_rev.substring(0, idx);
	        var rev = doc_id_rev.substring(idx + 2);
	        var sql = 'UPDATE ' + BY_SEQ_STORE$1 +
	          ' SET doc_id=?, rev=? WHERE doc_id_rev=?';
	        tx.executeSql(sql, [doc_id, rev, doc_id_rev], function () {
	          doNext();
	        });
	      }
	      doNext();
	    }
	
	    var sql = 'ALTER TABLE ' + BY_SEQ_STORE$1 + ' ADD COLUMN doc_id';
	    tx.executeSql(sql, [], function (tx) {
	      var sql = 'ALTER TABLE ' + BY_SEQ_STORE$1 + ' ADD COLUMN rev';
	      tx.executeSql(sql, [], function (tx) {
	        tx.executeSql(BY_SEQ_STORE_DOC_ID_REV_INDEX_SQL, [], function (tx) {
	          var sql = 'SELECT hex(doc_id_rev) as hex FROM ' + BY_SEQ_STORE$1;
	          tx.executeSql(sql, [], function (tx, res) {
	            var rows = [];
	            for (var i = 0; i < res.rows.length; i++) {
	              rows.push(res.rows.item(i));
	            }
	            updateRows(rows);
	          });
	        });
	      });
	    });
	  }
	
	  // in this migration, we add the attach_and_seq table
	  // for issue #2818
	  function runMigration5(tx, callback) {
	
	    function migrateAttsAndSeqs(tx) {
	      // need to actually populate the table. this is the expensive part,
	      // so as an optimization, check first that this database even
	      // contains attachments
	      var sql = 'SELECT COUNT(*) AS cnt FROM ' + ATTACH_STORE$1;
	      tx.executeSql(sql, [], function (tx, res) {
	        var count = res.rows.item(0).cnt;
	        if (!count) {
	          return callback(tx);
	        }
	
	        var offset = 0;
	        var pageSize = 10;
	        function nextPage() {
	          var sql = select(
	            SELECT_DOCS + ', ' + DOC_STORE$1 + '.id AS id',
	            [DOC_STORE$1, BY_SEQ_STORE$1],
	            DOC_STORE_AND_BY_SEQ_JOINER,
	            null,
	            DOC_STORE$1 + '.id '
	          );
	          sql += ' LIMIT ' + pageSize + ' OFFSET ' + offset;
	          offset += pageSize;
	          tx.executeSql(sql, [], function (tx, res) {
	            if (!res.rows.length) {
	              return callback(tx);
	            }
	            var digestSeqs = {};
	            function addDigestSeq(digest, seq) {
	              // uniq digest/seq pairs, just in case there are dups
	              var seqs = digestSeqs[digest] = (digestSeqs[digest] || []);
	              if (seqs.indexOf(seq) === -1) {
	                seqs.push(seq);
	              }
	            }
	            for (var i = 0; i < res.rows.length; i++) {
	              var row = res.rows.item(i);
	              var doc = unstringifyDoc(row.data, row.id, row.rev);
	              var atts = Object.keys(doc._attachments || {});
	              for (var j = 0; j < atts.length; j++) {
	                var att = doc._attachments[atts[j]];
	                addDigestSeq(att.digest, row.seq);
	              }
	            }
	            var digestSeqPairs = [];
	            Object.keys(digestSeqs).forEach(function (digest) {
	              var seqs = digestSeqs[digest];
	              seqs.forEach(function (seq) {
	                digestSeqPairs.push([digest, seq]);
	              });
	            });
	            if (!digestSeqPairs.length) {
	              return nextPage();
	            }
	            var numDone = 0;
	            digestSeqPairs.forEach(function (pair) {
	              var sql = 'INSERT INTO ' + ATTACH_AND_SEQ_STORE$1 +
	                ' (digest, seq) VALUES (?,?)';
	              tx.executeSql(sql, pair, function () {
	                if (++numDone === digestSeqPairs.length) {
	                  nextPage();
	                }
	              });
	            });
	          });
	        }
	        nextPage();
	      });
	    }
	
	    var attachAndRev = 'CREATE TABLE IF NOT EXISTS ' +
	      ATTACH_AND_SEQ_STORE$1 + ' (digest, seq INTEGER)';
	    tx.executeSql(attachAndRev, [], function (tx) {
	      tx.executeSql(
	        ATTACH_AND_SEQ_STORE_ATTACH_INDEX_SQL, [], function (tx) {
	          tx.executeSql(
	            ATTACH_AND_SEQ_STORE_SEQ_INDEX_SQL, [],
	            migrateAttsAndSeqs);
	        });
	    });
	  }
	
	  // in this migration, we use escapeBlob() and unescapeBlob()
	  // instead of reading out the binary as HEX, which is slow
	  function runMigration6(tx, callback) {
	    var sql = 'ALTER TABLE ' + ATTACH_STORE$1 +
	      ' ADD COLUMN escaped TINYINT(1) DEFAULT 0';
	    tx.executeSql(sql, [], callback);
	  }
	
	  // issue #3136, in this migration we need a "latest seq" as well
	  // as the "winning seq" in the doc store
	  function runMigration7(tx, callback) {
	    var sql = 'ALTER TABLE ' + DOC_STORE$1 +
	      ' ADD COLUMN max_seq INTEGER';
	    tx.executeSql(sql, [], function (tx) {
	      var sql = 'UPDATE ' + DOC_STORE$1 + ' SET max_seq=(SELECT MAX(seq) FROM ' +
	        BY_SEQ_STORE$1 + ' WHERE doc_id=id)';
	      tx.executeSql(sql, [], function (tx) {
	        // add unique index after filling, else we'll get a constraint
	        // error when we do the ALTER TABLE
	        var sql =
	          'CREATE UNIQUE INDEX IF NOT EXISTS \'doc-max-seq-idx\' ON ' +
	          DOC_STORE$1 + ' (max_seq)';
	        tx.executeSql(sql, [], callback);
	      });
	    });
	  }
	
	  function checkEncoding(tx, cb) {
	    // UTF-8 on chrome/android, UTF-16 on safari < 7.1
	    tx.executeSql('SELECT HEX("a") AS hex', [], function (tx, res) {
	        var hex = res.rows.item(0).hex;
	        encoding = hex.length === 2 ? 'UTF-8' : 'UTF-16';
	        cb();
	      }
	    );
	  }
	
	  function onGetInstanceId() {
	    while (idRequests.length > 0) {
	      var idCallback = idRequests.pop();
	      idCallback(null, instanceId);
	    }
	  }
	
	  function onGetVersion(tx, dbVersion) {
	    if (dbVersion === 0) {
	      // initial schema
	
	      var meta = 'CREATE TABLE IF NOT EXISTS ' + META_STORE$1 +
	        ' (dbid, db_version INTEGER)';
	      var attach = 'CREATE TABLE IF NOT EXISTS ' + ATTACH_STORE$1 +
	        ' (digest UNIQUE, escaped TINYINT(1), body BLOB)';
	      var attachAndRev = 'CREATE TABLE IF NOT EXISTS ' +
	        ATTACH_AND_SEQ_STORE$1 + ' (digest, seq INTEGER)';
	      // TODO: migrate winningseq to INTEGER
	      var doc = 'CREATE TABLE IF NOT EXISTS ' + DOC_STORE$1 +
	        ' (id unique, json, winningseq, max_seq INTEGER UNIQUE)';
	      var seq = 'CREATE TABLE IF NOT EXISTS ' + BY_SEQ_STORE$1 +
	        ' (seq INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
	        'json, deleted TINYINT(1), doc_id, rev)';
	      var local = 'CREATE TABLE IF NOT EXISTS ' + LOCAL_STORE$1 +
	        ' (id UNIQUE, rev, json)';
	
	      // creates
	      tx.executeSql(attach);
	      tx.executeSql(local);
	      tx.executeSql(attachAndRev, [], function () {
	        tx.executeSql(ATTACH_AND_SEQ_STORE_SEQ_INDEX_SQL);
	        tx.executeSql(ATTACH_AND_SEQ_STORE_ATTACH_INDEX_SQL);
	      });
	      tx.executeSql(doc, [], function () {
	        tx.executeSql(DOC_STORE_WINNINGSEQ_INDEX_SQL);
	        tx.executeSql(seq, [], function () {
	          tx.executeSql(BY_SEQ_STORE_DELETED_INDEX_SQL);
	          tx.executeSql(BY_SEQ_STORE_DOC_ID_REV_INDEX_SQL);
	          tx.executeSql(meta, [], function () {
	            // mark the db version, and new dbid
	            var initSeq = 'INSERT INTO ' + META_STORE$1 +
	              ' (db_version, dbid) VALUES (?,?)';
	            instanceId = uuid();
	            var initSeqArgs = [ADAPTER_VERSION$1, instanceId];
	            tx.executeSql(initSeq, initSeqArgs, function () {
	              onGetInstanceId();
	            });
	          });
	        });
	      });
	    } else { // version > 0
	
	      var setupDone = function () {
	        var migrated = dbVersion < ADAPTER_VERSION$1;
	        if (migrated) {
	          // update the db version within this transaction
	          tx.executeSql('UPDATE ' + META_STORE$1 + ' SET db_version = ' +
	            ADAPTER_VERSION$1);
	        }
	        // notify db.id() callers
	        var sql = 'SELECT dbid FROM ' + META_STORE$1;
	        tx.executeSql(sql, [], function (tx, result) {
	          instanceId = result.rows.item(0).dbid;
	          onGetInstanceId();
	        });
	      };
	
	      // would love to use promises here, but then websql
	      // ends the transaction early
	      var tasks = [
	        runMigration2,
	        runMigration3,
	        runMigration4,
	        runMigration5,
	        runMigration6,
	        runMigration7,
	        setupDone
	      ];
	
	      // run each migration sequentially
	      var i = dbVersion;
	      var nextMigration = function (tx) {
	        tasks[i - 1](tx, nextMigration);
	        i++;
	      };
	      nextMigration(tx);
	    }
	  }
	
	  function setup() {
	    db.transaction(function (tx) {
	      // first check the encoding
	      checkEncoding(tx, function () {
	        // then get the version
	        fetchVersion(tx);
	      });
	    }, websqlError(callback), dbCreated);
	  }
	
	  function fetchVersion(tx) {
	    var sql = 'SELECT sql FROM sqlite_master WHERE tbl_name = ' + META_STORE$1;
	    tx.executeSql(sql, [], function (tx, result) {
	      if (!result.rows.length) {
	        // database hasn't even been created yet (version 0)
	        onGetVersion(tx, 0);
	      } else if (!/db_version/.test(result.rows.item(0).sql)) {
	        // table was created, but without the new db_version column,
	        // so add it.
	        tx.executeSql('ALTER TABLE ' + META_STORE$1 +
	          ' ADD COLUMN db_version INTEGER', [], function () {
	          // before version 2, this column didn't even exist
	          onGetVersion(tx, 1);
	        });
	      } else { // column exists, we can safely get it
	        tx.executeSql('SELECT db_version FROM ' + META_STORE$1,
	          [], function (tx, result) {
	          var dbVersion = result.rows.item(0).db_version;
	          onGetVersion(tx, dbVersion);
	        });
	      }
	    });
	  }
	
	  setup();
	
	  api.type = function () {
	    return 'websql';
	  };
	
	  api._id = toPromise(function (callback) {
	    callback(null, instanceId);
	  });
	
	  api._info = function (callback) {
	    db.readTransaction(function (tx) {
	      countDocs(tx, function (docCount) {
	        var sql = 'SELECT MAX(seq) AS seq FROM ' + BY_SEQ_STORE$1;
	        tx.executeSql(sql, [], function (tx, res) {
	          var updateSeq = res.rows.item(0).seq || 0;
	          callback(null, {
	            doc_count: docCount,
	            update_seq: updateSeq,
	            // for debugging
	            sqlite_plugin: db._sqlitePlugin,
	            websql_encoding: encoding
	          });
	        });
	      });
	    }, websqlError(callback));
	  };
	
	  api._bulkDocs = function (req, reqOpts, callback) {
	    websqlBulkDocs(opts, req, reqOpts, api, db, websqlChanges, callback);
	  };
	
	  api._get = function (id, opts, callback) {
	    var doc;
	    var metadata;
	    var err;
	    var tx = opts.ctx;
	    if (!tx) {
	      return db.readTransaction(function (txn) {
	        api._get(id, jsExtend.extend({ctx: txn}, opts), callback);
	      });
	    }
	
	    function finish() {
	      callback(err, {doc: doc, metadata: metadata, ctx: tx});
	    }
	
	    var sql;
	    var sqlArgs;
	    if (opts.rev) {
	      sql = select(
	        SELECT_DOCS,
	        [DOC_STORE$1, BY_SEQ_STORE$1],
	        DOC_STORE$1 + '.id=' + BY_SEQ_STORE$1 + '.doc_id',
	        [BY_SEQ_STORE$1 + '.doc_id=?', BY_SEQ_STORE$1 + '.rev=?']);
	      sqlArgs = [id, opts.rev];
	    } else {
	      sql = select(
	        SELECT_DOCS,
	        [DOC_STORE$1, BY_SEQ_STORE$1],
	        DOC_STORE_AND_BY_SEQ_JOINER,
	        DOC_STORE$1 + '.id=?');
	      sqlArgs = [id];
	    }
	    tx.executeSql(sql, sqlArgs, function (a, results) {
	      if (!results.rows.length) {
	        err = createError(MISSING_DOC, 'missing');
	        return finish();
	      }
	      var item = results.rows.item(0);
	      metadata = safeJsonParse(item.metadata);
	      if (item.deleted && !opts.rev) {
	        err = createError(MISSING_DOC, 'deleted');
	        return finish();
	      }
	      doc = unstringifyDoc(item.data, metadata.id, item.rev);
	      finish();
	    });
	  };
	
	  function countDocs(tx, callback) {
	
	    if (api._docCount !== -1) {
	      return callback(api._docCount);
	    }
	
	    // count the total rows
	    var sql = select(
	      'COUNT(' + DOC_STORE$1 + '.id) AS \'num\'',
	      [DOC_STORE$1, BY_SEQ_STORE$1],
	      DOC_STORE_AND_BY_SEQ_JOINER,
	      BY_SEQ_STORE$1 + '.deleted=0');
	
	    tx.executeSql(sql, [], function (tx, result) {
	      api._docCount = result.rows.item(0).num;
	      callback(api._docCount);
	    });
	  }
	
	  api._allDocs = function (opts, callback) {
	    var results = [];
	    var totalRows;
	
	    var start = 'startkey' in opts ? opts.startkey : false;
	    var end = 'endkey' in opts ? opts.endkey : false;
	    var key = 'key' in opts ? opts.key : false;
	    var descending = 'descending' in opts ? opts.descending : false;
	    var limit = 'limit' in opts ? opts.limit : -1;
	    var offset = 'skip' in opts ? opts.skip : 0;
	    var inclusiveEnd = opts.inclusive_end !== false;
	
	    var sqlArgs = [];
	    var criteria = [];
	
	    if (key !== false) {
	      criteria.push(DOC_STORE$1 + '.id = ?');
	      sqlArgs.push(key);
	    } else if (start !== false || end !== false) {
	      if (start !== false) {
	        criteria.push(DOC_STORE$1 + '.id ' + (descending ? '<=' : '>=') + ' ?');
	        sqlArgs.push(start);
	      }
	      if (end !== false) {
	        var comparator = descending ? '>' : '<';
	        if (inclusiveEnd) {
	          comparator += '=';
	        }
	        criteria.push(DOC_STORE$1 + '.id ' + comparator + ' ?');
	        sqlArgs.push(end);
	      }
	      if (key !== false) {
	        criteria.push(DOC_STORE$1 + '.id = ?');
	        sqlArgs.push(key);
	      }
	    }
	
	    if (opts.deleted !== 'ok') {
	      // report deleted if keys are specified
	      criteria.push(BY_SEQ_STORE$1 + '.deleted = 0');
	    }
	
	    db.readTransaction(function (tx) {
	
	      // first count up the total rows
	      countDocs(tx, function (count) {
	        totalRows = count;
	
	        if (limit === 0) {
	          return;
	        }
	
	        // then actually fetch the documents
	        var sql = select(
	          SELECT_DOCS,
	          [DOC_STORE$1, BY_SEQ_STORE$1],
	          DOC_STORE_AND_BY_SEQ_JOINER,
	          criteria,
	          DOC_STORE$1 + '.id ' + (descending ? 'DESC' : 'ASC')
	          );
	        sql += ' LIMIT ' + limit + ' OFFSET ' + offset;
	
	        tx.executeSql(sql, sqlArgs, function (tx, result) {
	          for (var i = 0, l = result.rows.length; i < l; i++) {
	            var item = result.rows.item(i);
	            var metadata = safeJsonParse(item.metadata);
	            var id = metadata.id;
	            var data = unstringifyDoc(item.data, id, item.rev);
	            var winningRev = data._rev;
	            var doc = {
	              id: id,
	              key: id,
	              value: {rev: winningRev}
	            };
	            if (opts.include_docs) {
	              doc.doc = data;
	              doc.doc._rev = winningRev;
	              if (opts.conflicts) {
	                doc.doc._conflicts = collectConflicts(metadata);
	              }
	              fetchAttachmentsIfNecessary$1(doc.doc, opts, api, tx);
	            }
	            if (item.deleted) {
	              if (opts.deleted === 'ok') {
	                doc.value.deleted = true;
	                doc.doc = null;
	              } else {
	                continue;
	              }
	            }
	            results.push(doc);
	          }
	        });
	      });
	    }, websqlError(callback), function () {
	      callback(null, {
	        total_rows: totalRows,
	        offset: opts.skip,
	        rows: results
	      });
	    });
	  };
	
	  api._changes = function (opts) {
	    opts = clone(opts);
	
	    if (opts.continuous) {
	      var id = api._name + ':' + uuid();
	      websqlChanges.addListener(api._name, id, api, opts);
	      websqlChanges.notify(api._name);
	      return {
	        cancel: function () {
	          websqlChanges.removeListener(api._name, id);
	        }
	      };
	    }
	
	    var descending = opts.descending;
	
	    // Ignore the `since` parameter when `descending` is true
	    opts.since = opts.since && !descending ? opts.since : 0;
	
	    var limit = 'limit' in opts ? opts.limit : -1;
	    if (limit === 0) {
	      limit = 1; // per CouchDB _changes spec
	    }
	
	    var returnDocs;
	    if ('return_docs' in opts) {
	      returnDocs = opts.return_docs;
	    } else if ('returnDocs' in opts) {
	      // TODO: Remove 'returnDocs' in favor of 'return_docs' in a future release
	      returnDocs = opts.returnDocs;
	    } else {
	      returnDocs = true;
	    }
	    var results = [];
	    var numResults = 0;
	
	    function fetchChanges() {
	
	      var selectStmt =
	        DOC_STORE$1 + '.json AS metadata, ' +
	        DOC_STORE$1 + '.max_seq AS maxSeq, ' +
	        BY_SEQ_STORE$1 + '.json AS winningDoc, ' +
	        BY_SEQ_STORE$1 + '.rev AS winningRev ';
	
	      var from = DOC_STORE$1 + ' JOIN ' + BY_SEQ_STORE$1;
	
	      var joiner = DOC_STORE$1 + '.id=' + BY_SEQ_STORE$1 + '.doc_id' +
	        ' AND ' + DOC_STORE$1 + '.winningseq=' + BY_SEQ_STORE$1 + '.seq';
	
	      var criteria = ['maxSeq > ?'];
	      var sqlArgs = [opts.since];
	
	      if (opts.doc_ids) {
	        criteria.push(DOC_STORE$1 + '.id IN ' + qMarks(opts.doc_ids.length));
	        sqlArgs = sqlArgs.concat(opts.doc_ids);
	      }
	
	      var orderBy = 'maxSeq ' + (descending ? 'DESC' : 'ASC');
	
	      var sql = select(selectStmt, from, joiner, criteria, orderBy);
	
	      var filter = filterChange(opts);
	      if (!opts.view && !opts.filter) {
	        // we can just limit in the query
	        sql += ' LIMIT ' + limit;
	      }
	
	      var lastSeq = opts.since || 0;
	      db.readTransaction(function (tx) {
	        tx.executeSql(sql, sqlArgs, function (tx, result) {
	          function reportChange(change) {
	            return function () {
	              opts.onChange(change);
	            };
	          }
	          for (var i = 0, l = result.rows.length; i < l; i++) {
	            var item = result.rows.item(i);
	            var metadata = safeJsonParse(item.metadata);
	            lastSeq = item.maxSeq;
	
	            var doc = unstringifyDoc(item.winningDoc, metadata.id,
	              item.winningRev);
	            var change = opts.processChange(doc, metadata, opts);
	            change.seq = item.maxSeq;
	
	            var filtered = filter(change);
	            if (typeof filtered === 'object') {
	              return opts.complete(filtered);
	            }
	
	            if (filtered) {
	              numResults++;
	              if (returnDocs) {
	                results.push(change);
	              }
	              // process the attachment immediately
	              // for the benefit of live listeners
	              if (opts.attachments && opts.include_docs) {
	                fetchAttachmentsIfNecessary$1(doc, opts, api, tx,
	                  reportChange(change));
	              } else {
	                reportChange(change)();
	              }
	            }
	            if (numResults === limit) {
	              break;
	            }
	          }
	        });
	      }, websqlError(opts.complete), function () {
	        if (!opts.continuous) {
	          opts.complete(null, {
	            results: results,
	            last_seq: lastSeq
	          });
	        }
	      });
	    }
	
	    fetchChanges();
	  };
	
	  api._close = function (callback) {
	    //WebSQL databases do not need to be closed
	    callback();
	  };
	
	  api._getAttachment = function (docId, attachId, attachment, opts, callback) {
	    var res;
	    var tx = opts.ctx;
	    var digest = attachment.digest;
	    var type = attachment.content_type;
	    var sql = 'SELECT escaped, ' +
	      'CASE WHEN escaped = 1 THEN body ELSE HEX(body) END AS body FROM ' +
	      ATTACH_STORE$1 + ' WHERE digest=?';
	    tx.executeSql(sql, [digest], function (tx, result) {
	      // websql has a bug where \u0000 causes early truncation in strings
	      // and blobs. to work around this, we used to use the hex() function,
	      // but that's not performant. after migration 6, we remove \u0000
	      // and add it back in afterwards
	      var item = result.rows.item(0);
	      var data = item.escaped ? unescapeBlob(item.body) :
	        parseHexString(item.body, encoding);
	      if (opts.binary) {
	        res = binStringToBluffer(data, type);
	      } else {
	        res = btoa$1(data);
	      }
	      callback(null, res);
	    });
	  };
	
	  api._getRevisionTree = function (docId, callback) {
	    db.readTransaction(function (tx) {
	      var sql = 'SELECT json AS metadata FROM ' + DOC_STORE$1 + ' WHERE id = ?';
	      tx.executeSql(sql, [docId], function (tx, result) {
	        if (!result.rows.length) {
	          callback(createError(MISSING_DOC));
	        } else {
	          var data = safeJsonParse(result.rows.item(0).metadata);
	          callback(null, data.rev_tree);
	        }
	      });
	    });
	  };
	
	  api._doCompaction = function (docId, revs, callback) {
	    if (!revs.length) {
	      return callback();
	    }
	    db.transaction(function (tx) {
	
	      // update doc store
	      var sql = 'SELECT json AS metadata FROM ' + DOC_STORE$1 + ' WHERE id = ?';
	      tx.executeSql(sql, [docId], function (tx, result) {
	        var metadata = safeJsonParse(result.rows.item(0).metadata);
	        traverseRevTree(metadata.rev_tree, function (isLeaf, pos,
	                                                           revHash, ctx, opts) {
	          var rev = pos + '-' + revHash;
	          if (revs.indexOf(rev) !== -1) {
	            opts.status = 'missing';
	          }
	        });
	
	        var sql = 'UPDATE ' + DOC_STORE$1 + ' SET json = ? WHERE id = ?';
	        tx.executeSql(sql, [safeJsonStringify(metadata), docId]);
	      });
	
	      compactRevs$1(revs, docId, tx);
	    }, websqlError(callback), function () {
	      callback();
	    });
	  };
	
	  api._getLocal = function (id, callback) {
	    db.readTransaction(function (tx) {
	      var sql = 'SELECT json, rev FROM ' + LOCAL_STORE$1 + ' WHERE id=?';
	      tx.executeSql(sql, [id], function (tx, res) {
	        if (res.rows.length) {
	          var item = res.rows.item(0);
	          var doc = unstringifyDoc(item.json, id, item.rev);
	          callback(null, doc);
	        } else {
	          callback(createError(MISSING_DOC));
	        }
	      });
	    });
	  };
	
	  api._putLocal = function (doc, opts, callback) {
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    delete doc._revisions; // ignore this, trust the rev
	    var oldRev = doc._rev;
	    var id = doc._id;
	    var newRev;
	    if (!oldRev) {
	      newRev = doc._rev = '0-1';
	    } else {
	      newRev = doc._rev = '0-' + (parseInt(oldRev.split('-')[1], 10) + 1);
	    }
	    var json = stringifyDoc(doc);
	
	    var ret;
	    function putLocal(tx) {
	      var sql;
	      var values;
	      if (oldRev) {
	        sql = 'UPDATE ' + LOCAL_STORE$1 + ' SET rev=?, json=? ' +
	          'WHERE id=? AND rev=?';
	        values = [newRev, json, id, oldRev];
	      } else {
	        sql = 'INSERT INTO ' + LOCAL_STORE$1 + ' (id, rev, json) VALUES (?,?,?)';
	        values = [id, newRev, json];
	      }
	      tx.executeSql(sql, values, function (tx, res) {
	        if (res.rowsAffected) {
	          ret = {ok: true, id: id, rev: newRev};
	          if (opts.ctx) { // return immediately
	            callback(null, ret);
	          }
	        } else {
	          callback(createError(REV_CONFLICT));
	        }
	      }, function () {
	        callback(createError(REV_CONFLICT));
	        return false; // ack that we handled the error
	      });
	    }
	
	    if (opts.ctx) {
	      putLocal(opts.ctx);
	    } else {
	      db.transaction(putLocal, websqlError(callback), function () {
	        if (ret) {
	          callback(null, ret);
	        }
	      });
	    }
	  };
	
	  api._removeLocal = function (doc, opts, callback) {
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    var ret;
	
	    function removeLocal(tx) {
	      var sql = 'DELETE FROM ' + LOCAL_STORE$1 + ' WHERE id=? AND rev=?';
	      var params = [doc._id, doc._rev];
	      tx.executeSql(sql, params, function (tx, res) {
	        if (!res.rowsAffected) {
	          return callback(createError(MISSING_DOC));
	        }
	        ret = {ok: true, id: doc._id, rev: '0-0'};
	        if (opts.ctx) { // return immediately
	          callback(null, ret);
	        }
	      });
	    }
	
	    if (opts.ctx) {
	      removeLocal(opts.ctx);
	    } else {
	      db.transaction(removeLocal, websqlError(callback), function () {
	        if (ret) {
	          callback(null, ret);
	        }
	      });
	    }
	  };
	
	  api._destroy = function (opts, callback) {
	    websqlChanges.removeAllListeners(api._name);
	    db.transaction(function (tx) {
	      var stores = [DOC_STORE$1, BY_SEQ_STORE$1, ATTACH_STORE$1, META_STORE$1,
	        LOCAL_STORE$1, ATTACH_AND_SEQ_STORE$1];
	      stores.forEach(function (store) {
	        tx.executeSql('DROP TABLE IF EXISTS ' + store, []);
	      });
	    }, websqlError(callback), function () {
	      if (hasLocalStorage()) {
	        delete window.localStorage['_pouch__websqldb_' + api._name];
	        delete window.localStorage[api._name];
	      }
	      callback(null, {'ok': true});
	    });
	  };
	}
	
	function canOpenTestDB() {
	  try {
	    openDatabase('_pouch_validate_websql', 1, '', 1);
	    return true;
	  } catch (err) {
	    return false;
	  }
	}
	
	// WKWebView had a bug where WebSQL would throw a DOM Exception 18
	// (see https://bugs.webkit.org/show_bug.cgi?id=137760 and
	// https://github.com/pouchdb/pouchdb/issues/5079)
	// This has been fixed in latest WebKit, so we try to detect it here.
	function isValidWebSQL() {
	  // WKWebView UA:
	  //   Mozilla/5.0 (iPhone; CPU iPhone OS 9_2 like Mac OS X)
	  //   AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13C75
	  // Chrome for iOS UA:
	  //   Mozilla/5.0 (iPhone; U; CPU iPhone OS 5_1_1 like Mac OS X; en)
	  //   AppleWebKit/534.46.0 (KHTML, like Gecko) CriOS/19.0.1084.60
	  //   Mobile/9B206 Safari/7534.48.3
	  // Firefox for iOS UA:
	  //   Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4
	  //   (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4
	
	  // indexedDB is null on some UIWebViews and undefined in others
	  // see: https://bugs.webkit.org/show_bug.cgi?id=137034
	  if (typeof indexedDB === 'undefined' || indexedDB === null ||
	      !/iP(hone|od|ad)/.test(navigator.userAgent)) {
	    // definitely not WKWebView, avoid creating an unnecessary database
	    return true;
	  }
	  // Cache the result in LocalStorage. Reason we do this is because if we
	  // call openDatabase() too many times, Safari craps out in SauceLabs and
	  // starts throwing DOM Exception 14s.
	  var hasLS = hasLocalStorage();
	  // Include user agent in the hash, so that if Safari is upgraded, we don't
	  // continually think it's broken.
	  var localStorageKey = '_pouch__websqldb_valid_' + navigator.userAgent;
	  if (hasLS && localStorage[localStorageKey]) {
	    return localStorage[localStorageKey] === '1';
	  }
	  var openedTestDB = canOpenTestDB();
	  if (hasLS) {
	    localStorage[localStorageKey] = openedTestDB ? '1' : '0';
	  }
	  return openedTestDB;
	}
	
	function validWithoutCheckingCordova() {
	  if (typeof openDatabase === 'undefined') {
	    return false;
	  }
	  if (typeof sqlitePlugin !== 'undefined') {
	    // Both sqlite-storage and SQLite Plugin 2 create this global object,
	    // which we can check for to determine validity. It should be defined
	    // after the 'deviceready' event.
	    return true;
	  }
	  return isValidWebSQL();
	}
	
	function valid() {
	  // The Cordova SQLite Plugin and SQLite Plugin 2 can be used in cordova apps,
	  // and we can't know whether or not the plugin was loaded until after the
	  // 'deviceready' event. Since it's impractical for us to wait for that event
	  // before returning true/false for valid(), we just return true here
	  // and notify the user that they may need a plugin.
	  if (typeof cordova !== 'undefined') {
	    return true;
	  }
	  return validWithoutCheckingCordova();
	}
	
	function createOpenDBFunction(opts) {
	  return function (name, version, description, size) {
	    if (typeof sqlitePlugin !== 'undefined') {
	      // The SQLite Plugin started deviating pretty heavily from the
	      // standard openDatabase() function, as they started adding more features.
	      // It's better to just use their "new" format and pass in a big ol'
	      // options object. Also there are many options here that may come from
	      // the PouchDB constructor, so we have to grab those.
	      var sqlitePluginOpts = jsExtend.extend({}, opts, {
	        name: name,
	        version: version,
	        description: description,
	        size: size
	      });
	      return sqlitePlugin.openDatabase(sqlitePluginOpts);
	    }
	
	    // Traditional WebSQL API
	    return openDatabase(name, version, description, size);
	  };
	}
	
	function WebSQLPouch(opts, callback) {
	  var websql = createOpenDBFunction(opts);
	  var _opts = jsExtend.extend({
	    websql: websql
	  }, opts);
	
	  if (typeof cordova !== 'undefined' && !validWithoutCheckingCordova()) {
	    guardedConsole('error',
	      'PouchDB error: you must install a SQLite plugin ' +
	      'in order for PouchDB to work on this platform. Options:' +
	      '\n - https://github.com/nolanlawson/cordova-plugin-sqlite-2' +
	      '\n - https://github.com/litehelpers/Cordova-sqlite-storage' +
	      '\n - https://github.com/Microsoft/cordova-plugin-websql');
	  }
	
	  WebSqlPouch$1.call(this, _opts, callback);
	}
	
	WebSQLPouch.valid = valid;
	
	WebSQLPouch.use_prefix = true;
	
	function WebSqlPouch (PouchDB) {
	  PouchDB.adapter('websql', WebSQLPouch, true);
	}
	
	function wrappedFetch() {
	  var wrappedPromise = {};
	
	  var promise = new PouchPromise(function (resolve, reject) {
	    wrappedPromise.resolve = resolve;
	    wrappedPromise.reject = reject;
	  });
	
	  var args = new Array(arguments.length);
	
	  for (var i = 0; i < args.length; i++) {
	    args[i] = arguments[i];
	  }
	
	  wrappedPromise.promise = promise;
	
	  PouchPromise.resolve().then(function () {
	    return fetch.apply(null, args);
	  }).then(function (response) {
	    wrappedPromise.resolve(response);
	  }).catch(function (error) {
	    wrappedPromise.reject(error);
	  });
	
	  return wrappedPromise;
	}
	
	function fetchRequest(options, callback) {
	  var wrappedPromise, timer, response;
	
	  var headers = new Headers();
	
	  var fetchOptions = {
	    method: options.method,
	    credentials: 'include',
	    headers: headers
	  };
	
	  if (options.json) {
	    headers.set('Accept', 'application/json');
	    headers.set('Content-Type', options.headers['Content-Type'] ||
	      'application/json');
	  }
	
	  if (options.body && (options.body instanceof Blob)) {
	    readAsArrayBuffer(options.body, function (arrayBuffer) {
	      fetchOptions.body = arrayBuffer;
	    });
	  } else if (options.body &&
	             options.processData &&
	             typeof options.body !== 'string') {
	    fetchOptions.body = JSON.stringify(options.body);
	  } else if ('body' in options) {
	    fetchOptions.body = options.body;
	  } else {
	    fetchOptions.body = null;
	  }
	
	  Object.keys(options.headers).forEach(function (key) {
	    if (options.headers.hasOwnProperty(key)) {
	      headers.set(key, options.headers[key]);
	    }
	  });
	
	  wrappedPromise = wrappedFetch(options.url, fetchOptions);
	
	  if (options.timeout > 0) {
	    timer = setTimeout(function () {
	      wrappedPromise.reject(new Error('Load timeout for resource: ' +
	        options.url));
	    }, options.timeout);
	  }
	
	  wrappedPromise.promise.then(function (fetchResponse) {
	    response = {
	      statusCode: fetchResponse.status
	    };
	
	    if (options.timeout > 0) {
	      clearTimeout(timer);
	    }
	
	    if (response.statusCode >= 200 && response.statusCode < 300) {
	      return options.binary ? fetchResponse.blob() : fetchResponse.text();
	    }
	
	    return fetchResponse.json();
	  }).then(function (result) {
	    if (response.statusCode >= 200 && response.statusCode < 300) {
	      callback(null, response, result);
	    } else {
	      callback(result, response);
	    }
	  }).catch(function (error) {
	    callback(error, response);
	  });
	
	  return {abort: wrappedPromise.reject};
	}
	
	function xhRequest(options, callback) {
	
	  var xhr, timer;
	  var timedout = false;
	
	  var abortReq = function () {
	    xhr.abort();
	  };
	
	  var timeoutReq = function () {
	    timedout = true;
	    xhr.abort();
	  };
	
	  if (options.xhr) {
	    xhr = new options.xhr();
	  } else {
	    xhr = new XMLHttpRequest();
	  }
	
	  try {
	    xhr.open(options.method, options.url);
	  } catch (exception) {
	    return callback(new Error(exception.name || 'Url is invalid'));
	  }
	
	  xhr.withCredentials = ('withCredentials' in options) ?
	    options.withCredentials : true;
	
	  if (options.method === 'GET') {
	    delete options.headers['Content-Type'];
	  } else if (options.json) {
	    options.headers.Accept = 'application/json';
	    options.headers['Content-Type'] = options.headers['Content-Type'] ||
	      'application/json';
	    if (options.body &&
	        options.processData &&
	        typeof options.body !== "string") {
	      options.body = JSON.stringify(options.body);
	    }
	  }
	
	  if (options.binary) {
	    xhr.responseType = 'arraybuffer';
	  }
	
	  if (!('body' in options)) {
	    options.body = null;
	  }
	
	  for (var key in options.headers) {
	    if (options.headers.hasOwnProperty(key)) {
	      xhr.setRequestHeader(key, options.headers[key]);
	    }
	  }
	
	  if (options.timeout > 0) {
	    timer = setTimeout(timeoutReq, options.timeout);
	    xhr.onprogress = function () {
	      clearTimeout(timer);
	      if(xhr.readyState !== 4) {
	        timer = setTimeout(timeoutReq, options.timeout);
	      }
	    };
	    if (typeof xhr.upload !== 'undefined') { // does not exist in ie9
	      xhr.upload.onprogress = xhr.onprogress;
	    }
	  }
	
	  xhr.onreadystatechange = function () {
	    if (xhr.readyState !== 4) {
	      return;
	    }
	
	    var response = {
	      statusCode: xhr.status
	    };
	
	    if (xhr.status >= 200 && xhr.status < 300) {
	      var data;
	      if (options.binary) {
	        data = createBlob([xhr.response || ''], {
	          type: xhr.getResponseHeader('Content-Type')
	        });
	      } else {
	        data = xhr.responseText;
	      }
	      callback(null, response, data);
	    } else {
	      var err = {};
	      if (timedout) {
	        err = new Error('ETIMEDOUT');
	        err.code = 'ETIMEDOUT';
	      } else {
	        try {
	          err = JSON.parse(xhr.response);
	        } catch(e) {}
	      }
	      err.status = xhr.status;
	      callback(err);
	    }
	  };
	
	  if (options.body && (options.body instanceof Blob)) {
	    readAsArrayBuffer(options.body, function (arrayBuffer) {
	      xhr.send(arrayBuffer);
	    });
	  } else {
	    xhr.send(options.body);
	  }
	
	  return {abort: abortReq};
	}
	
	function testXhr() {
	  try {
	    new XMLHttpRequest();
	    return true;
	  } catch (err) {
	    return false;
	  }
	}
	
	var hasXhr = testXhr();
	
	function ajax$1(options, callback) {
	  if (hasXhr || options.xhr) {
	    return xhRequest(options, callback);
	  } else {
	    return fetchRequest(options, callback);
	  }
	}
	
	// the blob already has a type; do nothing
	var res$2 = function () {};
	
	function defaultBody() {
	  return '';
	}
	
	function ajaxCore(options, callback) {
	
	  options = clone(options);
	
	  var defaultOptions = {
	    method : "GET",
	    headers: {},
	    json: true,
	    processData: true,
	    timeout: 10000,
	    cache: false
	  };
	
	  options = jsExtend.extend(defaultOptions, options);
	
	  function onSuccess(obj, resp, cb) {
	    if (!options.binary && options.json && typeof obj === 'string') {
	      /* istanbul ignore next */
	      try {
	        obj = JSON.parse(obj);
	      } catch (e) {
	        // Probably a malformed JSON from server
	        return cb(e);
	      }
	    }
	    if (Array.isArray(obj)) {
	      obj = obj.map(function (v) {
	        if (v.error || v.missing) {
	          return generateErrorFromResponse(v);
	        } else {
	          return v;
	        }
	      });
	    }
	    if (options.binary) {
	      res$2(obj, resp);
	    }
	    cb(null, obj, resp);
	  }
	
	  if (options.json) {
	    if (!options.binary) {
	      options.headers.Accept = 'application/json';
	    }
	    options.headers['Content-Type'] = options.headers['Content-Type'] ||
	      'application/json';
	  }
	
	  if (options.binary) {
	    options.encoding = null;
	    options.json = false;
	  }
	
	  if (!options.processData) {
	    options.json = false;
	  }
	
	  return ajax$1(options, function (err, response, body) {
	
	    if (err) {
	      return callback(generateErrorFromResponse(err));
	    }
	
	    var error;
	    var content_type = response.headers && response.headers['content-type'];
	    var data = body || defaultBody();
	
	    // CouchDB doesn't always return the right content-type for JSON data, so
	    // we check for ^{ and }$ (ignoring leading/trailing whitespace)
	    if (!options.binary && (options.json || !options.processData) &&
	        typeof data !== 'object' &&
	        (/json/.test(content_type) ||
	         (/^[\s]*\{/.test(data) && /\}[\s]*$/.test(data)))) {
	      try {
	        data = JSON.parse(data.toString());
	      } catch (e) {}
	    }
	
	    if (response.statusCode >= 200 && response.statusCode < 300) {
	      onSuccess(data, response, callback);
	    } else {
	      error = generateErrorFromResponse(data);
	      error.status = response.statusCode;
	      callback(error);
	    }
	  });
	}
	
	function ajax(opts, callback) {
	
	  // cache-buster, specifically designed to work around IE's aggressive caching
	  // see http://www.dashbay.com/2011/05/internet-explorer-caches-ajax/
	  // Also Safari caches POSTs, so we need to cache-bust those too.
	  var ua = (navigator && navigator.userAgent) ?
	    navigator.userAgent.toLowerCase() : '';
	
	  var isSafari = ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
	  var isIE = ua.indexOf('msie') !== -1;
	  var isEdge = ua.indexOf('edge') !== -1;
	
	  // it appears the new version of safari also caches GETs,
	  // see https://github.com/pouchdb/pouchdb/issues/5010
	  var shouldCacheBust = (isSafari ||
	    ((isIE || isEdge) && opts.method === 'GET'));
	
	  var cache = 'cache' in opts ? opts.cache : true;
	
	  var isBlobUrl = /^blob:/.test(opts.url); // don't append nonces for blob URLs
	
	  if (!isBlobUrl && (shouldCacheBust || !cache)) {
	    var hasArgs = opts.url.indexOf('?') !== -1;
	    opts.url += (hasArgs ? '&' : '?') + '_nonce=' + Date.now();
	  }
	
	  return ajaxCore(opts, callback);
	}
	
	var CHANGES_BATCH_SIZE = 25;
	var MAX_SIMULTANEOUS_REVS = 50;
	
	var supportsBulkGetMap = {};
	
	// according to http://stackoverflow.com/a/417184/680742,
	// the de facto URL length limit is 2000 characters.
	// but since most of our measurements don't take the full
	// URL into account, we fudge it a bit.
	// TODO: we could measure the full URL to enforce exactly 2000 chars
	var MAX_URL_LENGTH = 1800;
	
	var log$1 = debug('pouchdb:http');
	
	function readAttachmentsAsBlobOrBuffer(row) {
	  var atts = row.doc && row.doc._attachments;
	  if (!atts) {
	    return;
	  }
	  Object.keys(atts).forEach(function (filename) {
	    var att = atts[filename];
	    att.data = b64ToBluffer(att.data, att.content_type);
	  });
	}
	
	function encodeDocId(id) {
	  if (/^_design/.test(id)) {
	    return '_design/' + encodeURIComponent(id.slice(8));
	  }
	  if (/^_local/.test(id)) {
	    return '_local/' + encodeURIComponent(id.slice(7));
	  }
	  return encodeURIComponent(id);
	}
	
	function preprocessAttachments$1(doc) {
	  if (!doc._attachments || !Object.keys(doc._attachments)) {
	    return PouchPromise.resolve();
	  }
	
	  return PouchPromise.all(Object.keys(doc._attachments).map(function (key) {
	    var attachment = doc._attachments[key];
	    if (attachment.data && typeof attachment.data !== 'string') {
	      return new PouchPromise(function (resolve) {
	        blobToBase64(attachment.data, resolve);
	      }).then(function (b64) {
	        attachment.data = b64;
	      });
	    }
	  }));
	}
	
	// Get all the information you possibly can about the URI given by name and
	// return it as a suitable object.
	function getHost(name) {
	  // Prase the URI into all its little bits
	  var uri = parseUri(name);
	
	  // Store the user and password as a separate auth object
	  if (uri.user || uri.password) {
	    uri.auth = {username: uri.user, password: uri.password};
	  }
	
	  // Split the path part of the URI into parts using '/' as the delimiter
	  // after removing any leading '/' and any trailing '/'
	  var parts = uri.path.replace(/(^\/|\/$)/g, '').split('/');
	
	  // Store the first part as the database name and remove it from the parts
	  // array
	  uri.db = parts.pop();
	  // Prevent double encoding of URI component
	  if (uri.db.indexOf('%') === -1) {
	    uri.db = encodeURIComponent(uri.db);
	  }
	
	  // Restore the path by joining all the remaining parts (all the parts
	  // except for the database name) with '/'s
	  uri.path = parts.join('/');
	
	  return uri;
	}
	
	// Generate a URL with the host data given by opts and the given path
	function genDBUrl(opts, path) {
	  return genUrl(opts, opts.db + '/' + path);
	}
	
	// Generate a URL with the host data given by opts and the given path
	function genUrl(opts, path) {
	  // If the host already has a path, then we need to have a path delimiter
	  // Otherwise, the path delimiter is the empty string
	  var pathDel = !opts.path ? '' : '/';
	
	  // If the host already has a path, then we need to have a path delimiter
	  // Otherwise, the path delimiter is the empty string
	  return opts.protocol + '://' + opts.host +
	         (opts.port ? (':' + opts.port) : '') +
	         '/' + opts.path + pathDel + path;
	}
	
	function paramsToStr(params) {
	  return '?' + Object.keys(params).map(function (k) {
	    return k + '=' + encodeURIComponent(params[k]);
	  }).join('&');
	}
	
	// Implements the PouchDB API for dealing with CouchDB instances over HTTP
	function HttpPouch(opts, callback) {
	  // The functions that will be publicly available for HttpPouch
	  var api = this;
	
	  // Parse the URI given by opts.name into an easy-to-use object
	  var getHostFun = getHost;
	
	  // TODO: this seems to only be used by yarong for the Thali project.
	  // Verify whether or not it's still needed.
	  /* istanbul ignore if */
	  if (opts.getHost) {
	    getHostFun = opts.getHost;
	  }
	
	  var host = getHostFun(opts.name, opts);
	  var dbUrl = genDBUrl(host, '');
	
	  opts = clone(opts);
	  var ajaxOpts = opts.ajax || {};
	
	  api.getUrl = function () { return dbUrl; };
	  api.getHeaders = function () { return ajaxOpts.headers || {}; };
	
	  if (opts.auth || host.auth) {
	    var nAuth = opts.auth || host.auth;
	    var str = nAuth.username + ':' + nAuth.password;
	    var token = btoa$1(unescape(encodeURIComponent(str)));
	    ajaxOpts.headers = ajaxOpts.headers || {};
	    ajaxOpts.headers.Authorization = 'Basic ' + token;
	  }
	
	  // Not strictly necessary, but we do this because numerous tests
	  // rely on swapping ajax in and out.
	  api._ajax = ajax;
	
	  function ajax$$(userOpts, options, callback) {
	    var reqAjax = userOpts.ajax || {};
	    var reqOpts = jsExtend.extend(clone(ajaxOpts), reqAjax, options);
	    log$1(reqOpts.method + ' ' + reqOpts.url);
	    return api._ajax(reqOpts, callback);
	  }
	
	  function ajaxPromise(userOpts, opts) {
	    return new PouchPromise(function (resolve, reject) {
	      ajax$$(userOpts, opts, function (err, res) {
	        if (err) {
	          return reject(err);
	        }
	        resolve(res);
	      });
	    });
	  }
	
	  function adapterFun$$(name, fun) {
	    return adapterFun(name, getArguments(function (args) {
	      setup().then(function () {
	        return fun.apply(this, args);
	      }).catch(function (e) {
	        var callback = args.pop();
	        callback(e);
	      });
	    }));
	  }
	
	  var setupPromise;
	
	  function setup() {
	    // TODO: Remove `skipSetup` in favor of `skip_setup` in a future release
	    if (opts.skipSetup || opts.skip_setup) {
	      return PouchPromise.resolve();
	    }
	
	    // If there is a setup in process or previous successful setup
	    // done then we will use that
	    // If previous setups have been rejected we will try again
	    if (setupPromise) {
	      return setupPromise;
	    }
	
	    var checkExists = {method: 'GET', url: dbUrl};
	    setupPromise = ajaxPromise({}, checkExists).catch(function (err) {
	      if (err && err.status && err.status === 404) {
	        // Doesnt exist, create it
	        explainError(404, 'PouchDB is just detecting if the remote exists.');
	        return ajaxPromise({}, {method: 'PUT', url: dbUrl});
	      } else {
	        return PouchPromise.reject(err);
	      }
	    }).catch(function (err) {
	      // If we try to create a database that already exists, skipped in
	      // istanbul since its catching a race condition.
	      /* istanbul ignore if */
	      if (err && err.status && err.status === 412) {
	        return true;
	      }
	      return PouchPromise.reject(err);
	    });
	
	    setupPromise.catch(function () {
	      setupPromise = null;
	    });
	
	    return setupPromise;
	  }
	
	  setTimeout(function () {
	    callback(null, api);
	  });
	
	  api.type = function () {
	    return 'http';
	  };
	
	  api.id = adapterFun$$('id', function (callback) {
	    ajax$$({}, {method: 'GET', url: genUrl(host, '')}, function (err, result) {
	      var uuid = (result && result.uuid) ?
	        (result.uuid + host.db) : genDBUrl(host, '');
	      callback(null, uuid);
	    });
	  });
	
	  api.request = adapterFun$$('request', function (options, callback) {
	    options.url = genDBUrl(host, options.url);
	    ajax$$({}, options, callback);
	  });
	
	  // Sends a POST request to the host calling the couchdb _compact function
	  //    version: The version of CouchDB it is running
	  api.compact = adapterFun$$('compact', function (opts, callback) {
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    opts = clone(opts);
	    ajax$$(opts, {
	      url: genDBUrl(host, '_compact'),
	      method: 'POST'
	    }, function () {
	      function ping() {
	        api.info(function (err, res) {
	          if (res && !res.compact_running) {
	            callback(null, {ok: true});
	          } else {
	            setTimeout(ping, opts.interval || 200);
	          }
	        });
	      }
	      // Ping the http if it's finished compaction
	      ping();
	    });
	  });
	
	  api.bulkGet = adapterFun('bulkGet', function (opts, callback) {
	    var self = this;
	
	    function doBulkGet(cb) {
	      var params = {};
	      if (opts.revs) {
	        params.revs = true;
	      }
	      if (opts.attachments) {
	        /* istanbul ignore next */
	        params.attachments = true;
	      }
	      ajax$$({}, {
	        url: genDBUrl(host, '_bulk_get' + paramsToStr(params)),
	        method: 'POST',
	        body: { docs: opts.docs}
	      }, cb);
	    }
	
	    function doBulkGetShim() {
	      // avoid "url too long error" by splitting up into multiple requests
	      var batchSize = MAX_SIMULTANEOUS_REVS;
	      var numBatches = Math.ceil(opts.docs.length / batchSize);
	      var numDone = 0;
	      var results = new Array(numBatches);
	
	      function onResult(batchNum) {
	        return function (err, res) {
	          // err is impossible because shim returns a list of errs in that case
	          results[batchNum] = res.results;
	          if (++numDone === numBatches) {
	            callback(null, {results: flatten(results)});
	          }
	        };
	      }
	
	      for (var i = 0; i < numBatches; i++) {
	        var subOpts = pick(opts, ['revs', 'attachments']);
	        subOpts.ajax = ajaxOpts;
	        subOpts.docs = opts.docs.slice(i * batchSize,
	          Math.min(opts.docs.length, (i + 1) * batchSize));
	        bulkGet(self, subOpts, onResult(i));
	      }
	    }
	
	    // mark the whole database as either supporting or not supporting _bulk_get
	    var dbUrl = genUrl(host, '');
	    var supportsBulkGet = supportsBulkGetMap[dbUrl];
	
	    if (typeof supportsBulkGet !== 'boolean') {
	      // check if this database supports _bulk_get
	      doBulkGet(function (err, res) {
	        /* istanbul ignore else */
	        if (err) {
	          var status = Math.floor(err.status / 100);
	          /* istanbul ignore else */
	          if (status === 4 || status === 5) { // 40x or 50x
	            supportsBulkGetMap[dbUrl] = false;
	            explainError(
	              err.status,
	              'PouchDB is just detecting if the remote ' +
	              'supports the _bulk_get API.'
	            );
	            doBulkGetShim();
	          } else {
	            callback(err);
	          }
	        } else {
	          supportsBulkGetMap[dbUrl] = true;
	          callback(null, res);
	        }
	      });
	    } else if (supportsBulkGet) {
	      /* istanbul ignore next */
	      doBulkGet(callback);
	    } else {
	      doBulkGetShim();
	    }
	  });
	
	  // Calls GET on the host, which gets back a JSON string containing
	  //    couchdb: A welcome string
	  //    version: The version of CouchDB it is running
	  api._info = function (callback) {
	    setup().then(function () {
	      ajax$$({}, {
	        method: 'GET',
	        url: genDBUrl(host, '')
	      }, function (err, res) {
	        /* istanbul ignore next */
	        if (err) {
	        return callback(err);
	        }
	        res.host = genDBUrl(host, '');
	        callback(null, res);
	      });
	    }).catch(callback);
	  };
	
	  // Get the document with the given id from the database given by host.
	  // The id could be solely the _id in the database, or it may be a
	  // _design/ID or _local/ID path
	  api.get = adapterFun$$('get', function (id, opts, callback) {
	    // If no options were given, set the callback to the second parameter
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    opts = clone(opts);
	
	    // List of parameters to add to the GET request
	    var params = {};
	
	    if (opts.revs) {
	      params.revs = true;
	    }
	
	    if (opts.revs_info) {
	      params.revs_info = true;
	    }
	
	    if (opts.open_revs) {
	      if (opts.open_revs !== "all") {
	        opts.open_revs = JSON.stringify(opts.open_revs);
	      }
	      params.open_revs = opts.open_revs;
	    }
	
	    if (opts.rev) {
	      params.rev = opts.rev;
	    }
	
	    if (opts.conflicts) {
	      params.conflicts = opts.conflicts;
	    }
	
	    id = encodeDocId(id);
	
	    // Set the options for the ajax call
	    var options = {
	      method: 'GET',
	      url: genDBUrl(host, id + paramsToStr(params))
	    };
	
	    function fetchAttachments(doc) {
	      var atts = doc._attachments;
	      var filenames = atts && Object.keys(atts);
	      if (!atts || !filenames.length) {
	        return;
	      }
	      // we fetch these manually in separate XHRs, because
	      // Sync Gateway would normally send it back as multipart/mixed,
	      // which we cannot parse. Also, this is more efficient than
	      // receiving attachments as base64-encoded strings.
	      function fetch() {
	
	        if (!filenames.length) {
	          return null;
	        }
	
	        var filename = filenames.pop();
	        var att = atts[filename];
	        var path = encodeDocId(doc._id) + '/' + encodeAttachmentId(filename) +
	          '?rev=' + doc._rev;
	        return ajaxPromise(opts, {
	          method: 'GET',
	          url: genDBUrl(host, path),
	          binary: true
	        }).then(function (blob) {
	          if (opts.binary) {
	            return blob;
	          }
	          return new PouchPromise(function (resolve) {
	            blobToBase64(blob, resolve);
	          });
	        }).then(function (data) {
	          delete att.stub;
	          delete att.length;
	          att.data = data;
	        });
	      }
	
	      // This limits the number of parallel xhr requests to 5 any time
	      // to avoid issues with maximum browser request limits
	      return new PromisePool(fetch, 5, {promise: PouchPromise}).start();
	    }
	
	    function fetchAllAttachments(docOrDocs) {
	      if (Array.isArray(docOrDocs)) {
	        return PouchPromise.all(docOrDocs.map(function (doc) {
	          if (doc.ok) {
	            return fetchAttachments(doc.ok);
	          }
	        }));
	      }
	      return fetchAttachments(docOrDocs);
	    }
	
	    ajaxPromise(opts, options).then(function (res) {
	      return PouchPromise.resolve().then(function () {
	        if (opts.attachments) {
	          return fetchAllAttachments(res);
	        }
	      }).then(function () {
	        callback(null, res);
	      });
	    }).catch(callback);
	  });
	
	  // Delete the document given by doc from the database given by host.
	  api.remove = adapterFun$$('remove',
	      function (docOrId, optsOrRev, opts, callback) {
	    var doc;
	    if (typeof optsOrRev === 'string') {
	      // id, rev, opts, callback style
	      doc = {
	        _id: docOrId,
	        _rev: optsOrRev
	      };
	      if (typeof opts === 'function') {
	        callback = opts;
	        opts = {};
	      }
	    } else {
	      // doc, opts, callback style
	      doc = docOrId;
	      if (typeof optsOrRev === 'function') {
	        callback = optsOrRev;
	        opts = {};
	      } else {
	        callback = opts;
	        opts = optsOrRev;
	      }
	    }
	
	    var rev = (doc._rev || opts.rev);
	
	    // Delete the document
	    ajax$$(opts, {
	      method: 'DELETE',
	      url: genDBUrl(host, encodeDocId(doc._id)) + '?rev=' + rev
	    }, callback);
	  });
	
	  function encodeAttachmentId(attachmentId) {
	    return attachmentId.split("/").map(encodeURIComponent).join("/");
	  }
	
	  // Get the attachment
	  api.getAttachment =
	    adapterFun$$('getAttachment', function (docId, attachmentId, opts,
	                                                callback) {
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    var params = opts.rev ? ('?rev=' + opts.rev) : '';
	    var url = genDBUrl(host, encodeDocId(docId)) + '/' +
	      encodeAttachmentId(attachmentId) + params;
	    ajax$$(opts, {
	      method: 'GET',
	      url: url,
	      binary: true
	    }, callback);
	  });
	
	  // Remove the attachment given by the id and rev
	  api.removeAttachment =
	    adapterFun$$('removeAttachment', function (docId, attachmentId, rev,
	                                                   callback) {
	
	    var url = genDBUrl(host, encodeDocId(docId) + '/' +
	      encodeAttachmentId(attachmentId)) + '?rev=' + rev;
	
	    ajax$$({}, {
	      method: 'DELETE',
	      url: url
	    }, callback);
	  });
	
	  // Add the attachment given by blob and its contentType property
	  // to the document with the given id, the revision given by rev, and
	  // add it to the database given by host.
	  api.putAttachment =
	    adapterFun$$('putAttachment', function (docId, attachmentId, rev, blob,
	                                                type, callback) {
	    if (typeof type === 'function') {
	      callback = type;
	      type = blob;
	      blob = rev;
	      rev = null;
	    }
	    var id = encodeDocId(docId) + '/' + encodeAttachmentId(attachmentId);
	    var url = genDBUrl(host, id);
	    if (rev) {
	      url += '?rev=' + rev;
	    }
	
	    if (typeof blob === 'string') {
	      // input is assumed to be a base64 string
	      var binary;
	      try {
	        binary = atob$1(blob);
	      } catch (err) {
	        return callback(createError(BAD_ARG,
	                        'Attachment is not a valid base64 string'));
	      }
	      blob = binary ? binStringToBluffer(binary, type) : '';
	    }
	
	    var opts = {
	      headers: {'Content-Type': type},
	      method: 'PUT',
	      url: url,
	      processData: false,
	      body: blob,
	      timeout: ajaxOpts.timeout || 60000
	    };
	    // Add the attachment
	    ajax$$({}, opts, callback);
	  });
	
	  // Update/create multiple documents given by req in the database
	  // given by host.
	  api._bulkDocs = function (req, opts, callback) {
	    // If new_edits=false then it prevents the database from creating
	    // new revision numbers for the documents. Instead it just uses
	    // the old ones. This is used in database replication.
	    req.new_edits = opts.new_edits;
	
	    setup().then(function () {
	      return PouchPromise.all(req.docs.map(preprocessAttachments$1));
	    }).then(function () {
	      // Update/create the documents
	      ajax$$(opts, {
	        method: 'POST',
	        url: genDBUrl(host, '_bulk_docs'),
	        body: req
	      }, function (err, results) {
	        if (err) {
	          return callback(err);
	        }
	        results.forEach(function (result) {
	          result.ok = true; // smooths out cloudant not adding this
	        });
	        callback(null, results);
	      });
	    }).catch(callback);
	  };
	
	  // Get a listing of the documents in the database given
	  // by host and ordered by increasing id.
	  api.allDocs = adapterFun$$('allDocs', function (opts, callback) {
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    opts = clone(opts);
	
	    // List of parameters to add to the GET request
	    var params = {};
	    var body;
	    var method = 'GET';
	
	    if (opts.conflicts) {
	      params.conflicts = true;
	    }
	
	    if (opts.descending) {
	      params.descending = true;
	    }
	
	    if (opts.include_docs) {
	      params.include_docs = true;
	    }
	
	    // added in CouchDB 1.6.0
	    if (opts.attachments) {
	      params.attachments = true;
	    }
	
	    if (opts.key) {
	      params.key = JSON.stringify(opts.key);
	    }
	
	    if (opts.start_key) {
	      opts.startkey = opts.start_key;
	    }
	
	    if (opts.startkey) {
	      params.startkey = JSON.stringify(opts.startkey);
	    }
	
	    if (opts.end_key) {
	      opts.endkey = opts.end_key;
	    }
	
	    if (opts.endkey) {
	      params.endkey = JSON.stringify(opts.endkey);
	    }
	
	    if (typeof opts.inclusive_end !== 'undefined') {
	      params.inclusive_end = !!opts.inclusive_end;
	    }
	
	    if (typeof opts.limit !== 'undefined') {
	      params.limit = opts.limit;
	    }
	
	    if (typeof opts.skip !== 'undefined') {
	      params.skip = opts.skip;
	    }
	
	    var paramStr = paramsToStr(params);
	
	    if (typeof opts.keys !== 'undefined') {
	
	      var keysAsString =
	        'keys=' + encodeURIComponent(JSON.stringify(opts.keys));
	      if (keysAsString.length + paramStr.length + 1 <= MAX_URL_LENGTH) {
	        // If the keys are short enough, do a GET. we do this to work around
	        // Safari not understanding 304s on POSTs (see issue #1239)
	        paramStr += '&' + keysAsString;
	      } else {
	        // If keys are too long, issue a POST request to circumvent GET
	        // query string limits
	        // see http://wiki.apache.org/couchdb/HTTP_view_API#Querying_Options
	        method = 'POST';
	        body = {keys: opts.keys};
	      }
	    }
	
	    // Get the document listing
	    ajaxPromise(opts, {
	      method: method,
	      url: genDBUrl(host, '_all_docs' + paramStr),
	      body: body
	    }).then(function (res) {
	      if (opts.include_docs && opts.attachments && opts.binary) {
	        res.rows.forEach(readAttachmentsAsBlobOrBuffer);
	      }
	      callback(null, res);
	    }).catch(callback);
	  });
	
	  // Get a list of changes made to documents in the database given by host.
	  // TODO According to the README, there should be two other methods here,
	  // api.changes.addListener and api.changes.removeListener.
	  api._changes = function (opts) {
	
	    // We internally page the results of a changes request, this means
	    // if there is a large set of changes to be returned we can start
	    // processing them quicker instead of waiting on the entire
	    // set of changes to return and attempting to process them at once
	    var batchSize = 'batch_size' in opts ? opts.batch_size : CHANGES_BATCH_SIZE;
	
	    opts = clone(opts);
	    opts.timeout = ('timeout' in opts) ? opts.timeout :
	      ('timeout' in ajaxOpts) ? ajaxOpts.timeout :
	      30 * 1000;
	
	    // We give a 5 second buffer for CouchDB changes to respond with
	    // an ok timeout (if a timeout it set)
	    var params = opts.timeout ? {timeout: opts.timeout - (5 * 1000)} : {};
	    var limit = (typeof opts.limit !== 'undefined') ? opts.limit : false;
	    var returnDocs;
	    if ('return_docs' in opts) {
	      returnDocs = opts.return_docs;
	    } else if ('returnDocs' in opts) {
	      // TODO: Remove 'returnDocs' in favor of 'return_docs' in a future release
	      returnDocs = opts.returnDocs;
	    } else {
	      returnDocs = true;
	    }
	    //
	    var leftToFetch = limit;
	
	    if (opts.style) {
	      params.style = opts.style;
	    }
	
	    if (opts.include_docs || opts.filter && typeof opts.filter === 'function') {
	      params.include_docs = true;
	    }
	
	    if (opts.attachments) {
	      params.attachments = true;
	    }
	
	    if (opts.continuous) {
	      params.feed = 'longpoll';
	    }
	
	    if (opts.conflicts) {
	      params.conflicts = true;
	    }
	
	    if (opts.descending) {
	      params.descending = true;
	    }
	
	    if ('heartbeat' in opts) {
	      // If the heartbeat value is false, it disables the default heartbeat
	      if (opts.heartbeat) {
	        params.heartbeat = opts.heartbeat;
	      }
	    } else {
	      // Default heartbeat to 10 seconds
	      params.heartbeat = 10000;
	    }
	
	    if (opts.filter && typeof opts.filter === 'string') {
	      params.filter = opts.filter;
	    }
	
	    if (opts.view && typeof opts.view === 'string') {
	      params.filter = '_view';
	      params.view = opts.view;
	    }
	
	    // If opts.query_params exists, pass it through to the changes request.
	    // These parameters may be used by the filter on the source database.
	    if (opts.query_params && typeof opts.query_params === 'object') {
	      for (var param_name in opts.query_params) {
	        /* istanbul ignore else */
	        if (opts.query_params.hasOwnProperty(param_name)) {
	          params[param_name] = opts.query_params[param_name];
	        }
	      }
	    }
	
	    var method = 'GET';
	    var body;
	
	    if (opts.doc_ids) {
	      // set this automagically for the user; it's annoying that couchdb
	      // requires both a "filter" and a "doc_ids" param.
	      params.filter = '_doc_ids';
	
	      var docIdsJson = JSON.stringify(opts.doc_ids);
	
	      if (docIdsJson.length < MAX_URL_LENGTH) {
	        params.doc_ids = docIdsJson;
	      } else {
	        // anything greater than ~2000 is unsafe for gets, so
	        // use POST instead
	        method = 'POST';
	        body = {doc_ids: opts.doc_ids };
	      }
	    }
	
	    var xhr;
	    var lastFetchedSeq;
	
	    // Get all the changes starting wtih the one immediately after the
	    // sequence number given by since.
	    var fetch = function (since, callback) {
	      if (opts.aborted) {
	        return;
	      }
	      params.since = since;
	      // "since" can be any kind of json object in Coudant/CouchDB 2.x
	      /* istanbul ignore next */
	      if (typeof params.since === "object") {
	        params.since = JSON.stringify(params.since);
	      }
	
	      if (opts.descending) {
	        if (limit) {
	          params.limit = leftToFetch;
	        }
	      } else {
	        params.limit = (!limit || leftToFetch > batchSize) ?
	          batchSize : leftToFetch;
	      }
	
	      // Set the options for the ajax call
	      var xhrOpts = {
	        method: method,
	        url: genDBUrl(host, '_changes' + paramsToStr(params)),
	        timeout: opts.timeout,
	        body: body
	      };
	      lastFetchedSeq = since;
	
	      /* istanbul ignore if */
	      if (opts.aborted) {
	        return;
	      }
	
	      // Get the changes
	      setup().then(function () {
	        xhr = ajax$$(opts, xhrOpts, callback);
	      }).catch(callback);
	    };
	
	    // If opts.since exists, get all the changes from the sequence
	    // number given by opts.since. Otherwise, get all the changes
	    // from the sequence number 0.
	    var results = {results: []};
	
	    var fetched = function (err, res) {
	      if (opts.aborted) {
	        return;
	      }
	      var raw_results_length = 0;
	      // If the result of the ajax call (res) contains changes (res.results)
	      if (res && res.results) {
	        raw_results_length = res.results.length;
	        results.last_seq = res.last_seq;
	        // For each change
	        var req = {};
	        req.query = opts.query_params;
	        res.results = res.results.filter(function (c) {
	          leftToFetch--;
	          var ret = filterChange(opts)(c);
	          if (ret) {
	            if (opts.include_docs && opts.attachments && opts.binary) {
	              readAttachmentsAsBlobOrBuffer(c);
	            }
	            if (returnDocs) {
	              results.results.push(c);
	            }
	            opts.onChange(c);
	          }
	          return ret;
	        });
	      } else if (err) {
	        // In case of an error, stop listening for changes and call
	        // opts.complete
	        opts.aborted = true;
	        opts.complete(err);
	        return;
	      }
	
	      // The changes feed may have timed out with no results
	      // if so reuse last update sequence
	      if (res && res.last_seq) {
	        lastFetchedSeq = res.last_seq;
	      }
	
	      var finished = (limit && leftToFetch <= 0) ||
	        (res && raw_results_length < batchSize) ||
	        (opts.descending);
	
	      if ((opts.continuous && !(limit && leftToFetch <= 0)) || !finished) {
	        // Queue a call to fetch again with the newest sequence number
	        setTimeout(function () { fetch(lastFetchedSeq, fetched); }, 0);
	      } else {
	        // We're done, call the callback
	        opts.complete(null, results);
	      }
	    };
	
	    fetch(opts.since || 0, fetched);
	
	    // Return a method to cancel this method from processing any more
	    return {
	      cancel: function () {
	        opts.aborted = true;
	        if (xhr) {
	          xhr.abort();
	        }
	      }
	    };
	  };
	
	  // Given a set of document/revision IDs (given by req), tets the subset of
	  // those that do NOT correspond to revisions stored in the database.
	  // See http://wiki.apache.org/couchdb/HttpPostRevsDiff
	  api.revsDiff = adapterFun$$('revsDiff', function (req, opts, callback) {
	    // If no options were given, set the callback to be the second parameter
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	
	    // Get the missing document/revision IDs
	    ajax$$(opts, {
	      method: 'POST',
	      url: genDBUrl(host, '_revs_diff'),
	      body: req
	    }, callback);
	  });
	
	  api._close = function (callback) {
	    callback();
	  };
	
	  api._destroy = function (options, callback) {
	    ajax$$(options, {
	      url: genDBUrl(host, ''),
	      method: 'DELETE'
	    }, function (err, resp) {
	      if (err && err.status && err.status !== 404) {
	        return callback(err);
	      }
	      callback(null, resp);
	    });
	  };
	}
	
	// HttpPouch is a valid adapter.
	HttpPouch.valid = function () {
	  return true;
	};
	
	function HttpPouch$1 (PouchDB) {
	  PouchDB.adapter('http', HttpPouch, false);
	  PouchDB.adapter('https', HttpPouch, false);
	}
	
	function TaskQueue$1() {
	  this.promise = new PouchPromise(function (fulfill) {fulfill(); });
	}
	TaskQueue$1.prototype.add = function (promiseFactory) {
	  this.promise = this.promise.catch(function () {
	    // just recover
	  }).then(function () {
	    return promiseFactory();
	  });
	  return this.promise;
	};
	TaskQueue$1.prototype.finish = function () {
	  return this.promise;
	};
	
	function createView(opts) {
	  var sourceDB = opts.db;
	  var viewName = opts.viewName;
	  var mapFun = opts.map;
	  var reduceFun = opts.reduce;
	  var temporary = opts.temporary;
	
	  // the "undefined" part is for backwards compatibility
	  var viewSignature = mapFun.toString() + (reduceFun && reduceFun.toString()) +
	    'undefined';
	
	  var cachedViews;
	  if (!temporary) {
	    // cache this to ensure we don't try to update the same view twice
	    cachedViews = sourceDB._cachedViews = sourceDB._cachedViews || {};
	    if (cachedViews[viewSignature]) {
	      return cachedViews[viewSignature];
	    }
	  }
	
	  var promiseForView = sourceDB.info().then(function (info) {
	
	    var depDbName = info.db_name + '-mrview-' +
	      (temporary ? 'temp' : stringMd5(viewSignature));
	
	    // save the view name in the source db so it can be cleaned up if necessary
	    // (e.g. when the _design doc is deleted, remove all associated view data)
	    function diffFunction(doc) {
	      doc.views = doc.views || {};
	      var fullViewName = viewName;
	      if (fullViewName.indexOf('/') === -1) {
	        fullViewName = viewName + '/' + viewName;
	      }
	      var depDbs = doc.views[fullViewName] = doc.views[fullViewName] || {};
	      /* istanbul ignore if */
	      if (depDbs[depDbName]) {
	        return; // no update necessary
	      }
	      depDbs[depDbName] = true;
	      return doc;
	    }
	    return upsert(sourceDB, '_local/mrviews', diffFunction).then(function () {
	      return sourceDB.registerDependentDatabase(depDbName).then(function (res) {
	        var db = res.db;
	        db.auto_compaction = true;
	        var view = {
	          name: depDbName,
	          db: db,
	          sourceDB: sourceDB,
	          adapter: sourceDB.adapter,
	          mapFun: mapFun,
	          reduceFun: reduceFun
	        };
	        return view.db.get('_local/lastSeq').catch(function (err) {
	          /* istanbul ignore if */
	          if (err.status !== 404) {
	            throw err;
	          }
	        }).then(function (lastSeqDoc) {
	          view.seq = lastSeqDoc ? lastSeqDoc.seq : 0;
	          if (cachedViews) {
	            view.db.once('destroyed', function () {
	              delete cachedViews[viewSignature];
	            });
	          }
	          return view;
	        });
	      });
	    });
	  });
	
	  if (cachedViews) {
	    cachedViews[viewSignature] = promiseForView;
	  }
	  return promiseForView;
	}
	
	function evalfunc(func, emit, sum, log, isArray, toJSON) {
	  return scopedEval(
	    "return (" + func.replace(/;\s*$/, "") + ");",
	    {
	      emit: emit,
	      sum: sum,
	      log: log,
	      isArray: isArray,
	      toJSON: toJSON
	    }
	  );
	}
	
	var promisedCallback = function (promise, callback) {
	  if (callback) {
	    promise.then(function (res) {
	      process.nextTick(function () {
	        callback(null, res);
	      });
	    }, function (reason) {
	      process.nextTick(function () {
	        callback(reason);
	      });
	    });
	  }
	  return promise;
	};
	
	var callbackify = function (fun) {
	  return getArguments(function (args) {
	    var cb = args.pop();
	    var promise = fun.apply(this, args);
	    if (typeof cb === 'function') {
	      promisedCallback(promise, cb);
	    }
	    return promise;
	  });
	};
	
	// Promise finally util similar to Q.finally
	var fin = function (promise, finalPromiseFactory) {
	  return promise.then(function (res) {
	    return finalPromiseFactory().then(function () {
	      return res;
	    });
	  }, function (reason) {
	    return finalPromiseFactory().then(function () {
	      throw reason;
	    });
	  });
	};
	
	var sequentialize = function (queue, promiseFactory) {
	  return function () {
	    var args = arguments;
	    var that = this;
	    return queue.add(function () {
	      return promiseFactory.apply(that, args);
	    });
	  };
	};
	
	// uniq an array of strings, order not guaranteed
	// similar to underscore/lodash _.uniq
	var uniq = function (arr) {
	  var map = {};
	
	  for (var i = 0, len = arr.length; i < len; i++) {
	    map['$' + arr[i]] = true;
	  }
	
	  var keys = Object.keys(map);
	  var output = new Array(keys.length);
	
	  for (i = 0, len = keys.length; i < len; i++) {
	    output[i] = keys[i].substring(1);
	  }
	  return output;
	};
	
	var persistentQueues = {};
	var tempViewQueue = new TaskQueue$1();
	var CHANGES_BATCH_SIZE$1 = 50;
	
	var log$2 = guardedConsole.bind(null, 'log');
	
	function parseViewName(name) {
	  // can be either 'ddocname/viewname' or just 'viewname'
	  // (where the ddoc name is the same)
	  return name.indexOf('/') === -1 ? [name, name] : name.split('/');
	}
	
	function isGenOne(changes) {
	  // only return true if the current change is 1-
	  // and there are no other leafs
	  return changes.length === 1 && /^1-/.test(changes[0].rev);
	}
	
	function emitError(db, e) {
	  try {
	    db.emit('error', e);
	  } catch (err) {
	    guardedConsole('error',
	      'The user\'s map/reduce function threw an uncaught error.\n' +
	      'You can debug this error by doing:\n' +
	      'myDatabase.on(\'error\', function (err) { debugger; });\n' +
	      'Please double-check your map/reduce function.');
	    guardedConsole('error', e);
	  }
	}
	
	function tryCode$1(db, fun, args) {
	  // emit an event if there was an error thrown by a map/reduce function.
	  // putting try/catches in a single function also avoids deoptimizations.
	  try {
	    return {
	      output : fun.apply(null, args)
	    };
	  } catch (e) {
	    emitError(db, e);
	    return {error: e};
	  }
	}
	
	function sortByKeyThenValue(x, y) {
	  var keyCompare = pouchdbCollate.collate(x.key, y.key);
	  return keyCompare !== 0 ? keyCompare : pouchdbCollate.collate(x.value, y.value);
	}
	
	function sliceResults(results, limit, skip) {
	  skip = skip || 0;
	  if (typeof limit === 'number') {
	    return results.slice(skip, limit + skip);
	  } else if (skip > 0) {
	    return results.slice(skip);
	  }
	  return results;
	}
	
	function rowToDocId(row) {
	  var val = row.value;
	  // Users can explicitly specify a joined doc _id, or it
	  // defaults to the doc _id that emitted the key/value.
	  var docId = (val && typeof val === 'object' && val._id) || row.id;
	  return docId;
	}
	
	function readAttachmentsAsBlobOrBuffer$1(res) {
	  res.rows.forEach(function (row) {
	    var atts = row.doc && row.doc._attachments;
	    if (!atts) {
	      return;
	    }
	    Object.keys(atts).forEach(function (filename) {
	      var att = atts[filename];
	      atts[filename].data = b64ToBluffer(att.data, att.content_type);
	    });
	  });
	}
	
	function postprocessAttachments(opts) {
	  return function (res) {
	    if (opts.include_docs && opts.attachments && opts.binary) {
	      readAttachmentsAsBlobOrBuffer$1(res);
	    }
	    return res;
	  };
	}
	
	function createBuiltInError(name) {
	  var message = 'builtin ' + name +
	    ' function requires map values to be numbers' +
	    ' or number arrays';
	  return new BuiltInError(message);
	}
	
	function sum(values) {
	  var result = 0;
	  for (var i = 0, len = values.length; i < len; i++) {
	    var num = values[i];
	    if (typeof num !== 'number') {
	      if (Array.isArray(num)) {
	        // lists of numbers are also allowed, sum them separately
	        result = typeof result === 'number' ? [result] : result;
	        for (var j = 0, jLen = num.length; j < jLen; j++) {
	          var jNum = num[j];
	          if (typeof jNum !== 'number') {
	            throw createBuiltInError('_sum');
	          } else if (typeof result[j] === 'undefined') {
	            result.push(jNum);
	          } else {
	            result[j] += jNum;
	          }
	        }
	      } else { // not array/number
	        throw createBuiltInError('_sum');
	      }
	    } else if (typeof result === 'number') {
	      result += num;
	    } else { // add number to array
	      result[0] += num;
	    }
	  }
	  return result;
	}
	
	var builtInReduce = {
	  _sum: function (keys, values) {
	    return sum(values);
	  },
	
	  _count: function (keys, values) {
	    return values.length;
	  },
	
	  _stats: function (keys, values) {
	    // no need to implement rereduce=true, because Pouch
	    // will never call it
	    function sumsqr(values) {
	      var _sumsqr = 0;
	      for (var i = 0, len = values.length; i < len; i++) {
	        var num = values[i];
	        _sumsqr += (num * num);
	      }
	      return _sumsqr;
	    }
	    return {
	      sum     : sum(values),
	      min     : Math.min.apply(null, values),
	      max     : Math.max.apply(null, values),
	      count   : values.length,
	      sumsqr : sumsqr(values)
	    };
	  }
	};
	
	function addHttpParam(paramName, opts, params, asJson) {
	  // add an http param from opts to params, optionally json-encoded
	  var val = opts[paramName];
	  if (typeof val !== 'undefined') {
	    if (asJson) {
	      val = encodeURIComponent(JSON.stringify(val));
	    }
	    params.push(paramName + '=' + val);
	  }
	}
	
	function coerceInteger(integerCandidate) {
	  if (typeof integerCandidate !== 'undefined') {
	    var asNumber = Number(integerCandidate);
	    // prevents e.g. '1foo' or '1.1' being coerced to 1
	    if (!isNaN(asNumber) && asNumber === parseInt(integerCandidate, 10)) {
	      return asNumber;
	    } else {
	      return integerCandidate;
	    }
	  }
	}
	
	function coerceOptions(opts) {
	  opts.group_level = coerceInteger(opts.group_level);
	  opts.limit = coerceInteger(opts.limit);
	  opts.skip = coerceInteger(opts.skip);
	  return opts;
	}
	
	function checkPositiveInteger(number) {
	  if (number) {
	    if (typeof number !== 'number') {
	      return  new QueryParseError('Invalid value for integer: "' +
	      number + '"');
	    }
	    if (number < 0) {
	      return new QueryParseError('Invalid value for positive integer: ' +
	        '"' + number + '"');
	    }
	  }
	}
	
	function checkQueryParseError(options, fun) {
	  var startkeyName = options.descending ? 'endkey' : 'startkey';
	  var endkeyName = options.descending ? 'startkey' : 'endkey';
	
	  if (typeof options[startkeyName] !== 'undefined' &&
	    typeof options[endkeyName] !== 'undefined' &&
	    pouchdbCollate.collate(options[startkeyName], options[endkeyName]) > 0) {
	    throw new QueryParseError('No rows can match your key range, ' +
	    'reverse your start_key and end_key or set {descending : true}');
	  } else if (fun.reduce && options.reduce !== false) {
	    if (options.include_docs) {
	      throw new QueryParseError('{include_docs:true} is invalid for reduce');
	    } else if (options.keys && options.keys.length > 1 &&
	        !options.group && !options.group_level) {
	      throw new QueryParseError('Multi-key fetches for reduce views must use ' +
	      '{group: true}');
	    }
	  }
	  ['group_level', 'limit', 'skip'].forEach(function (optionName) {
	    var error = checkPositiveInteger(options[optionName]);
	    if (error) {
	      throw error;
	    }
	  });
	}
	
	function httpQuery(db, fun, opts) {
	  // List of parameters to add to the PUT request
	  var params = [];
	  var body;
	  var method = 'GET';
	
	  // If opts.reduce exists and is defined, then add it to the list
	  // of parameters.
	  // If reduce=false then the results are that of only the map function
	  // not the final result of map and reduce.
	  addHttpParam('reduce', opts, params);
	  addHttpParam('include_docs', opts, params);
	  addHttpParam('attachments', opts, params);
	  addHttpParam('limit', opts, params);
	  addHttpParam('descending', opts, params);
	  addHttpParam('group', opts, params);
	  addHttpParam('group_level', opts, params);
	  addHttpParam('skip', opts, params);
	  addHttpParam('stale', opts, params);
	  addHttpParam('conflicts', opts, params);
	  addHttpParam('startkey', opts, params, true);
	  addHttpParam('start_key', opts, params, true);
	  addHttpParam('endkey', opts, params, true);
	  addHttpParam('end_key', opts, params, true);
	  addHttpParam('inclusive_end', opts, params);
	  addHttpParam('key', opts, params, true);
	
	  // Format the list of parameters into a valid URI query string
	  params = params.join('&');
	  params = params === '' ? '' : '?' + params;
	
	  // If keys are supplied, issue a POST to circumvent GET query string limits
	  // see http://wiki.apache.org/couchdb/HTTP_view_API#Querying_Options
	  if (typeof opts.keys !== 'undefined') {
	    var MAX_URL_LENGTH = 2000;
	    // according to http://stackoverflow.com/a/417184/680742,
	    // the de facto URL length limit is 2000 characters
	
	    var keysAsString =
	      'keys=' + encodeURIComponent(JSON.stringify(opts.keys));
	    if (keysAsString.length + params.length + 1 <= MAX_URL_LENGTH) {
	      // If the keys are short enough, do a GET. we do this to work around
	      // Safari not understanding 304s on POSTs (see pouchdb/pouchdb#1239)
	      params += (params[0] === '?' ? '&' : '?') + keysAsString;
	    } else {
	      method = 'POST';
	      if (typeof fun === 'string') {
	        body = {keys: opts.keys};
	      } else { // fun is {map : mapfun}, so append to this
	        fun.keys = opts.keys;
	      }
	    }
	  }
	
	  // We are referencing a query defined in the design doc
	  if (typeof fun === 'string') {
	    var parts = parseViewName(fun);
	    return db.request({
	      method: method,
	      url: '_design/' + parts[0] + '/_view/' + parts[1] + params,
	      body: body
	    }).then(postprocessAttachments(opts));
	  }
	
	  // We are using a temporary view, terrible for performance, good for testing
	  body = body || {};
	  Object.keys(fun).forEach(function (key) {
	    if (Array.isArray(fun[key])) {
	      body[key] = fun[key];
	    } else {
	      body[key] = fun[key].toString();
	    }
	  });
	  return db.request({
	    method: 'POST',
	    url: '_temp_view' + params,
	    body: body
	  }).then(postprocessAttachments(opts));
	}
	
	// custom adapters can define their own api._query
	// and override the default behavior
	/* istanbul ignore next */
	function customQuery(db, fun, opts) {
	  return new PouchPromise(function (resolve, reject) {
	    db._query(fun, opts, function (err, res) {
	      if (err) {
	        return reject(err);
	      }
	      resolve(res);
	    });
	  });
	}
	
	// custom adapters can define their own api._viewCleanup
	// and override the default behavior
	/* istanbul ignore next */
	function customViewCleanup(db) {
	  return new PouchPromise(function (resolve, reject) {
	    db._viewCleanup(function (err, res) {
	      if (err) {
	        return reject(err);
	      }
	      resolve(res);
	    });
	  });
	}
	
	function defaultsTo(value) {
	  return function (reason) {
	    /* istanbul ignore else */
	    if (reason.status === 404) {
	      return value;
	    } else {
	      throw reason;
	    }
	  };
	}
	
	// returns a promise for a list of docs to update, based on the input docId.
	// the order doesn't matter, because post-3.2.0, bulkDocs
	// is an atomic operation in all three adapters.
	function getDocsToPersist(docId, view, docIdsToChangesAndEmits) {
	  var metaDocId = '_local/doc_' + docId;
	  var defaultMetaDoc = {_id: metaDocId, keys: []};
	  var docData = docIdsToChangesAndEmits[docId];
	  var indexableKeysToKeyValues = docData.indexableKeysToKeyValues;
	  var changes = docData.changes;
	
	  function getMetaDoc() {
	    if (isGenOne(changes)) {
	      // generation 1, so we can safely assume initial state
	      // for performance reasons (avoids unnecessary GETs)
	      return PouchPromise.resolve(defaultMetaDoc);
	    }
	    return view.db.get(metaDocId).catch(defaultsTo(defaultMetaDoc));
	  }
	
	  function getKeyValueDocs(metaDoc) {
	    if (!metaDoc.keys.length) {
	      // no keys, no need for a lookup
	      return PouchPromise.resolve({rows: []});
	    }
	    return view.db.allDocs({
	      keys: metaDoc.keys,
	      include_docs: true
	    });
	  }
	
	  function processKvDocs(metaDoc, kvDocsRes) {
	    var kvDocs = [];
	    var oldKeysMap = {};
	
	    for (var i = 0, len = kvDocsRes.rows.length; i < len; i++) {
	      var row = kvDocsRes.rows[i];
	      var doc = row.doc;
	      if (!doc) { // deleted
	        continue;
	      }
	      kvDocs.push(doc);
	      oldKeysMap[doc._id] = true;
	      doc._deleted = !indexableKeysToKeyValues[doc._id];
	      if (!doc._deleted) {
	        var keyValue = indexableKeysToKeyValues[doc._id];
	        if ('value' in keyValue) {
	          doc.value = keyValue.value;
	        }
	      }
	    }
	
	    var newKeys = Object.keys(indexableKeysToKeyValues);
	    newKeys.forEach(function (key) {
	      if (!oldKeysMap[key]) {
	        // new doc
	        var kvDoc = {
	          _id: key
	        };
	        var keyValue = indexableKeysToKeyValues[key];
	        if ('value' in keyValue) {
	          kvDoc.value = keyValue.value;
	        }
	        kvDocs.push(kvDoc);
	      }
	    });
	    metaDoc.keys = uniq(newKeys.concat(metaDoc.keys));
	    kvDocs.push(metaDoc);
	
	    return kvDocs;
	  }
	
	  return getMetaDoc().then(function (metaDoc) {
	    return getKeyValueDocs(metaDoc).then(function (kvDocsRes) {
	      return processKvDocs(metaDoc, kvDocsRes);
	    });
	  });
	}
	
	// updates all emitted key/value docs and metaDocs in the mrview database
	// for the given batch of documents from the source database
	function saveKeyValues(view, docIdsToChangesAndEmits, seq) {
	  var seqDocId = '_local/lastSeq';
	  return view.db.get(seqDocId)
	  .catch(defaultsTo({_id: seqDocId, seq: 0}))
	  .then(function (lastSeqDoc) {
	    var docIds = Object.keys(docIdsToChangesAndEmits);
	    return PouchPromise.all(docIds.map(function (docId) {
	      return getDocsToPersist(docId, view, docIdsToChangesAndEmits);
	    })).then(function (listOfDocsToPersist) {
	      var docsToPersist = flatten(listOfDocsToPersist);
	      lastSeqDoc.seq = seq;
	      docsToPersist.push(lastSeqDoc);
	      // write all docs in a single operation, update the seq once
	      return view.db.bulkDocs({docs : docsToPersist});
	    });
	  });
	}
	
	function getQueue(view) {
	  var viewName = typeof view === 'string' ? view : view.name;
	  var queue = persistentQueues[viewName];
	  if (!queue) {
	    queue = persistentQueues[viewName] = new TaskQueue$1();
	  }
	  return queue;
	}
	
	function updateView(view) {
	  return sequentialize(getQueue(view), function () {
	    return updateViewInQueue(view);
	  })();
	}
	
	function updateViewInQueue(view) {
	  // bind the emit function once
	  var mapResults;
	  var doc;
	
	  function emit(key, value) {
	    var output = {id: doc._id, key: pouchdbCollate.normalizeKey(key)};
	    // Don't explicitly store the value unless it's defined and non-null.
	    // This saves on storage space, because often people don't use it.
	    if (typeof value !== 'undefined' && value !== null) {
	      output.value = pouchdbCollate.normalizeKey(value);
	    }
	    mapResults.push(output);
	  }
	
	  var mapFun;
	  // for temp_views one can use emit(doc, emit), see #38
	  if (typeof view.mapFun === "function" && view.mapFun.length === 2) {
	    var origMap = view.mapFun;
	    mapFun = function (doc) {
	      return origMap(doc, emit);
	    };
	  } else {
	    mapFun = evalfunc(view.mapFun.toString(), emit, sum, log$2, Array.isArray,
	      JSON.parse);
	  }
	
	  var currentSeq = view.seq || 0;
	
	  function processChange(docIdsToChangesAndEmits, seq) {
	    return function () {
	      return saveKeyValues(view, docIdsToChangesAndEmits, seq);
	    };
	  }
	
	  var queue = new TaskQueue$1();
	  // TODO(neojski): https://github.com/daleharvey/pouchdb/issues/1521
	
	  return new PouchPromise(function (resolve, reject) {
	
	    function complete() {
	      queue.finish().then(function () {
	        view.seq = currentSeq;
	        resolve();
	      });
	    }
	
	    function processNextBatch() {
	      view.sourceDB.changes({
	        conflicts: true,
	        include_docs: true,
	        style: 'all_docs',
	        since: currentSeq,
	        limit: CHANGES_BATCH_SIZE$1
	      }).on('complete', function (response) {
	        var results = response.results;
	        if (!results.length) {
	          return complete();
	        }
	        var docIdsToChangesAndEmits = {};
	        for (var i = 0, l = results.length; i < l; i++) {
	          var change = results[i];
	          if (change.doc._id[0] !== '_') {
	            mapResults = [];
	            doc = change.doc;
	
	            if (!doc._deleted) {
	              tryCode$1(view.sourceDB, mapFun, [doc]);
	            }
	            mapResults.sort(sortByKeyThenValue);
	
	            var indexableKeysToKeyValues = {};
	            var lastKey;
	            for (var j = 0, jl = mapResults.length; j < jl; j++) {
	              var obj = mapResults[j];
	              var complexKey = [obj.key, obj.id];
	              if (pouchdbCollate.collate(obj.key, lastKey) === 0) {
	                complexKey.push(j); // dup key+id, so make it unique
	              }
	              var indexableKey = pouchdbCollate.toIndexableString(complexKey);
	              indexableKeysToKeyValues[indexableKey] = obj;
	              lastKey = obj.key;
	            }
	            docIdsToChangesAndEmits[change.doc._id] = {
	              indexableKeysToKeyValues: indexableKeysToKeyValues,
	              changes: change.changes
	            };
	          }
	          currentSeq = change.seq;
	        }
	        queue.add(processChange(docIdsToChangesAndEmits, currentSeq));
	        if (results.length < CHANGES_BATCH_SIZE$1) {
	          return complete();
	        }
	        return processNextBatch();
	      }).on('error', onError);
	      /* istanbul ignore next */
	      function onError(err) {
	        reject(err);
	      }
	    }
	
	    processNextBatch();
	  });
	}
	
	function reduceView(view, results, options) {
	  if (options.group_level === 0) {
	    delete options.group_level;
	  }
	
	  var shouldGroup = options.group || options.group_level;
	
	  var reduceFun;
	  if (builtInReduce[view.reduceFun]) {
	    reduceFun = builtInReduce[view.reduceFun];
	  } else {
	    reduceFun = evalfunc(
	      view.reduceFun.toString(), null, sum, log$2, Array.isArray, JSON.parse);
	  }
	
	  var groups = [];
	  var lvl = isNaN(options.group_level) ? Number.POSITIVE_INFINITY :
	    options.group_level;
	  results.forEach(function (e) {
	    var last = groups[groups.length - 1];
	    var groupKey = shouldGroup ? e.key : null;
	
	    // only set group_level for array keys
	    if (shouldGroup && Array.isArray(groupKey)) {
	      groupKey = groupKey.slice(0, lvl);
	    }
	
	    if (last && pouchdbCollate.collate(last.groupKey, groupKey) === 0) {
	      last.keys.push([e.key, e.id]);
	      last.values.push(e.value);
	      return;
	    }
	    groups.push({
	      keys: [[e.key, e.id]],
	      values: [e.value],
	      groupKey: groupKey
	    });
	  });
	  results = [];
	  for (var i = 0, len = groups.length; i < len; i++) {
	    var e = groups[i];
	    var reduceTry = tryCode$1(view.sourceDB, reduceFun,
	      [e.keys, e.values, false]);
	    if (reduceTry.error && reduceTry.error instanceof BuiltInError) {
	      // CouchDB returns an error if a built-in errors out
	      throw reduceTry.error;
	    }
	    results.push({
	      // CouchDB just sets the value to null if a non-built-in errors out
	      value: reduceTry.error ? null : reduceTry.output,
	      key: e.groupKey
	    });
	  }
	  // no total_rows/offset when reducing
	  return {rows: sliceResults(results, options.limit, options.skip)};
	}
	
	function queryView(view, opts) {
	  return sequentialize(getQueue(view), function () {
	    return queryViewInQueue(view, opts);
	  })();
	}
	
	function queryViewInQueue(view, opts) {
	  var totalRows;
	  var shouldReduce = view.reduceFun && opts.reduce !== false;
	  var skip = opts.skip || 0;
	  if (typeof opts.keys !== 'undefined' && !opts.keys.length) {
	    // equivalent query
	    opts.limit = 0;
	    delete opts.keys;
	  }
	
	  function fetchFromView(viewOpts) {
	    viewOpts.include_docs = true;
	    return view.db.allDocs(viewOpts).then(function (res) {
	      totalRows = res.total_rows;
	      return res.rows.map(function (result) {
	
	        // implicit migration - in older versions of PouchDB,
	        // we explicitly stored the doc as {id: ..., key: ..., value: ...}
	        // this is tested in a migration test
	        /* istanbul ignore next */
	        if ('value' in result.doc && typeof result.doc.value === 'object' &&
	            result.doc.value !== null) {
	          var keys = Object.keys(result.doc.value).sort();
	          // this detection method is not perfect, but it's unlikely the user
	          // emitted a value which was an object with these 3 exact keys
	          var expectedKeys = ['id', 'key', 'value'];
	          if (!(keys < expectedKeys || keys > expectedKeys)) {
	            return result.doc.value;
	          }
	        }
	
	        var parsedKeyAndDocId = pouchdbCollate.parseIndexableString(result.doc._id);
	        return {
	          key: parsedKeyAndDocId[0],
	          id: parsedKeyAndDocId[1],
	          value: ('value' in result.doc ? result.doc.value : null)
	        };
	      });
	    });
	  }
	
	  function onMapResultsReady(rows) {
	    var finalResults;
	    if (shouldReduce) {
	      finalResults = reduceView(view, rows, opts);
	    } else {
	      finalResults = {
	        total_rows: totalRows,
	        offset: skip,
	        rows: rows
	      };
	    }
	    if (opts.include_docs) {
	      var docIds = uniq(rows.map(rowToDocId));
	
	      return view.sourceDB.allDocs({
	        keys: docIds,
	        include_docs: true,
	        conflicts: opts.conflicts,
	        attachments: opts.attachments,
	        binary: opts.binary
	      }).then(function (allDocsRes) {
	        var docIdsToDocs = {};
	        allDocsRes.rows.forEach(function (row) {
	          if (row.doc) {
	            docIdsToDocs['$' + row.id] = row.doc;
	          }
	        });
	        rows.forEach(function (row) {
	          var docId = rowToDocId(row);
	          var doc = docIdsToDocs['$' + docId];
	          if (doc) {
	            row.doc = doc;
	          }
	        });
	        return finalResults;
	      });
	    } else {
	      return finalResults;
	    }
	  }
	
	  if (typeof opts.keys !== 'undefined') {
	    var keys = opts.keys;
	    var fetchPromises = keys.map(function (key) {
	      var viewOpts = {
	        startkey : pouchdbCollate.toIndexableString([key]),
	        endkey   : pouchdbCollate.toIndexableString([key, {}])
	      };
	      return fetchFromView(viewOpts);
	    });
	    return PouchPromise.all(fetchPromises).then(flatten).then(onMapResultsReady);
	  } else { // normal query, no 'keys'
	    var viewOpts = {
	      descending : opts.descending
	    };
	    if (opts.start_key) {
	        opts.startkey = opts.start_key;
	    }
	    if (opts.end_key) {
	        opts.endkey = opts.end_key;
	    }
	    if (typeof opts.startkey !== 'undefined') {
	      viewOpts.startkey = opts.descending ?
	        pouchdbCollate.toIndexableString([opts.startkey, {}]) :
	        pouchdbCollate.toIndexableString([opts.startkey]);
	    }
	    if (typeof opts.endkey !== 'undefined') {
	      var inclusiveEnd = opts.inclusive_end !== false;
	      if (opts.descending) {
	        inclusiveEnd = !inclusiveEnd;
	      }
	
	      viewOpts.endkey = pouchdbCollate.toIndexableString(
	        inclusiveEnd ? [opts.endkey, {}] : [opts.endkey]);
	    }
	    if (typeof opts.key !== 'undefined') {
	      var keyStart = pouchdbCollate.toIndexableString([opts.key]);
	      var keyEnd = pouchdbCollate.toIndexableString([opts.key, {}]);
	      if (viewOpts.descending) {
	        viewOpts.endkey = keyStart;
	        viewOpts.startkey = keyEnd;
	      } else {
	        viewOpts.startkey = keyStart;
	        viewOpts.endkey = keyEnd;
	      }
	    }
	    if (!shouldReduce) {
	      if (typeof opts.limit === 'number') {
	        viewOpts.limit = opts.limit;
	      }
	      viewOpts.skip = skip;
	    }
	    return fetchFromView(viewOpts).then(onMapResultsReady);
	  }
	}
	
	function httpViewCleanup(db) {
	  return db.request({
	    method: 'POST',
	    url: '_view_cleanup'
	  });
	}
	
	function localViewCleanup(db) {
	  return db.get('_local/mrviews').then(function (metaDoc) {
	    var docsToViews = {};
	    Object.keys(metaDoc.views).forEach(function (fullViewName) {
	      var parts = parseViewName(fullViewName);
	      var designDocName = '_design/' + parts[0];
	      var viewName = parts[1];
	      docsToViews[designDocName] = docsToViews[designDocName] || {};
	      docsToViews[designDocName][viewName] = true;
	    });
	    var opts = {
	      keys : Object.keys(docsToViews),
	      include_docs : true
	    };
	    return db.allDocs(opts).then(function (res) {
	      var viewsToStatus = {};
	      res.rows.forEach(function (row) {
	        var ddocName = row.key.substring(8);
	        Object.keys(docsToViews[row.key]).forEach(function (viewName) {
	          var fullViewName = ddocName + '/' + viewName;
	          /* istanbul ignore if */
	          if (!metaDoc.views[fullViewName]) {
	            // new format, without slashes, to support PouchDB 2.2.0
	            // migration test in pouchdb's browser.migration.js verifies this
	            fullViewName = viewName;
	          }
	          var viewDBNames = Object.keys(metaDoc.views[fullViewName]);
	          // design doc deleted, or view function nonexistent
	          var statusIsGood = row.doc && row.doc.views &&
	            row.doc.views[viewName];
	          viewDBNames.forEach(function (viewDBName) {
	            viewsToStatus[viewDBName] =
	              viewsToStatus[viewDBName] || statusIsGood;
	          });
	        });
	      });
	      var dbsToDelete = Object.keys(viewsToStatus).filter(
	        function (viewDBName) { return !viewsToStatus[viewDBName]; });
	      var destroyPromises = dbsToDelete.map(function (viewDBName) {
	        return sequentialize(getQueue(viewDBName), function () {
	          return new db.constructor(viewDBName, db.__opts).destroy();
	        })();
	      });
	      return PouchPromise.all(destroyPromises).then(function () {
	        return {ok: true};
	      });
	    });
	  }, defaultsTo({ok: true}));
	}
	
	var viewCleanup = callbackify(function () {
	  var db = this;
	  if (db.type() === 'http') {
	    return httpViewCleanup(db);
	  }
	  /* istanbul ignore next */
	  if (typeof db._viewCleanup === 'function') {
	    return customViewCleanup(db);
	  }
	  return localViewCleanup(db);
	});
	
	function queryPromised(db, fun, opts) {
	  if (db.type() === 'http') {
	    return httpQuery(db, fun, opts);
	  }
	
	  /* istanbul ignore next */
	  if (typeof db._query === 'function') {
	    return customQuery(db, fun, opts);
	  }
	
	  if (typeof fun !== 'string') {
	    // temp_view
	    checkQueryParseError(opts, fun);
	
	    var createViewOpts = {
	      db : db,
	      viewName : 'temp_view/temp_view',
	      map : fun.map,
	      reduce : fun.reduce,
	      temporary : true
	    };
	    tempViewQueue.add(function () {
	      return createView(createViewOpts).then(function (view) {
	        function cleanup() {
	          return view.db.destroy();
	        }
	        return fin(updateView(view).then(function () {
	          return queryView(view, opts);
	        }), cleanup);
	      });
	    });
	    return tempViewQueue.finish();
	  } else {
	    // persistent view
	    var fullViewName = fun;
	    var parts = parseViewName(fullViewName);
	    var designDocName = parts[0];
	    var viewName = parts[1];
	    return db.get('_design/' + designDocName).then(function (doc) {
	      var fun = doc.views && doc.views[viewName];
	
	      if (!fun || typeof fun.map !== 'string') {
	        throw new NotFoundError('ddoc ' + designDocName +
	        ' has no view named ' + viewName);
	      }
	      checkQueryParseError(opts, fun);
	
	      var createViewOpts = {
	        db : db,
	        viewName : fullViewName,
	        map : fun.map,
	        reduce : fun.reduce
	      };
	      return createView(createViewOpts).then(function (view) {
	        if (opts.stale === 'ok' || opts.stale === 'update_after') {
	          if (opts.stale === 'update_after') {
	            process.nextTick(function () {
	              updateView(view);
	            });
	          }
	          return queryView(view, opts);
	        } else { // stale not ok
	          return updateView(view).then(function () {
	            return queryView(view, opts);
	          });
	        }
	      });
	    });
	  }
	}
	
	var query = function (fun, opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	  opts = opts ? coerceOptions(opts) : {};
	
	  if (typeof fun === 'function') {
	    fun = {map : fun};
	  }
	
	  var db = this;
	  var promise = PouchPromise.resolve().then(function () {
	    return queryPromised(db, fun, opts);
	  });
	  promisedCallback(promise, callback);
	  return promise;
	};
	
	function QueryParseError(message) {
	  this.status = 400;
	  this.name = 'query_parse_error';
	  this.message = message;
	  this.error = true;
	  try {
	    Error.captureStackTrace(this, QueryParseError);
	  } catch (e) {}
	}
	
	inherits(QueryParseError, Error);
	
	function NotFoundError(message) {
	  this.status = 404;
	  this.name = 'not_found';
	  this.message = message;
	  this.error = true;
	  try {
	    Error.captureStackTrace(this, NotFoundError);
	  } catch (e) {}
	}
	
	inherits(NotFoundError, Error);
	
	function BuiltInError(message) {
	  this.status = 500;
	  this.name = 'invalid_value';
	  this.message = message;
	  this.error = true;
	  try {
	    Error.captureStackTrace(this, BuiltInError);
	  } catch (e) {}
	}
	
	inherits(BuiltInError, Error);
	
	var mapreduce = {
	  query: query,
	  viewCleanup: viewCleanup
	};
	
	function isGenOne$1(rev) {
	  return /^1-/.test(rev);
	}
	
	function fileHasChanged(localDoc, remoteDoc, filename) {
	  return !localDoc._attachments ||
	         !localDoc._attachments[filename] ||
	         localDoc._attachments[filename].digest !== remoteDoc._attachments[filename].digest;
	}
	
	function getDocAttachments(db, doc) {
	  var filenames = Object.keys(doc._attachments);
	  return PouchPromise.all(filenames.map(function (filename) {
	    return db.getAttachment(doc._id, filename, {rev: doc._rev});
	  }));
	}
	
	function getDocAttachmentsFromTargetOrSource(target, src, doc) {
	  var doCheckForLocalAttachments = src.type() === 'http' && target.type() !== 'http';
	  var filenames = Object.keys(doc._attachments);
	
	  if (!doCheckForLocalAttachments) {
	    return getDocAttachments(src, doc);
	  }
	
	  return target.get(doc._id).then(function (localDoc) {
	    return PouchPromise.all(filenames.map(function (filename) {
	      if (fileHasChanged(localDoc, doc, filename)) {
	        return src.getAttachment(doc._id, filename);
	      }
	
	      return target.getAttachment(localDoc._id, filename);
	    }));
	  }).catch(function (error) {
	    /* istanbul ignore if */
	    if (error.status !== 404) {
	      throw error;
	    }
	
	    return getDocAttachments(src, doc);
	  });
	}
	
	function createBulkGetOpts(diffs) {
	  var requests = [];
	  Object.keys(diffs).forEach(function (id) {
	    var missingRevs = diffs[id].missing;
	    missingRevs.forEach(function (missingRev) {
	      requests.push({
	        id: id,
	        rev: missingRev
	      });
	    });
	  });
	
	  return {
	    docs: requests,
	    revs: true
	  };
	}
	
	//
	// Fetch all the documents from the src as described in the "diffs",
	// which is a mapping of docs IDs to revisions. If the state ever
	// changes to "cancelled", then the returned promise will be rejected.
	// Else it will be resolved with a list of fetched documents.
	//
	function getDocs(src, target, diffs, state) {
	  diffs = clone(diffs); // we do not need to modify this
	
	  var resultDocs = [],
	      ok = true;
	
	  function getAllDocs() {
	
	    var bulkGetOpts = createBulkGetOpts(diffs);
	
	    if (!bulkGetOpts.docs.length) { // optimization: skip empty requests
	      return;
	    }
	
	    return src.bulkGet(bulkGetOpts).then(function (bulkGetResponse) {
	      /* istanbul ignore if */
	      if (state.cancelled) {
	        throw new Error('cancelled');
	      }
	      return PouchPromise.all(bulkGetResponse.results.map(function (bulkGetInfo) {
	        return PouchPromise.all(bulkGetInfo.docs.map(function (doc) {
	          var remoteDoc = doc.ok;
	
	          if (doc.error) {
	            // when AUTO_COMPACTION is set, docs can be returned which look
	            // like this: {"missing":"1-7c3ac256b693c462af8442f992b83696"}
	            ok = false;
	          }
	
	          if (!remoteDoc || !remoteDoc._attachments) {
	            return remoteDoc;
	          }
	
	          return getDocAttachmentsFromTargetOrSource(target, src, remoteDoc).then(function (attachments) {
	            var filenames = Object.keys(remoteDoc._attachments);
	            attachments.forEach(function (attachment, i) {
	              var att = remoteDoc._attachments[filenames[i]];
	              delete att.stub;
	              delete att.length;
	              att.data = attachment;
	            });
	
	            return remoteDoc;
	          });
	        }));
	      }))
	
	      .then(function (results) {
	        resultDocs = resultDocs.concat(flatten(results).filter(Boolean));
	      });
	    });
	  }
	
	  function hasAttachments(doc) {
	    return doc._attachments && Object.keys(doc._attachments).length > 0;
	  }
	
	  function fetchRevisionOneDocs(ids) {
	    // Optimization: fetch gen-1 docs and attachments in
	    // a single request using _all_docs
	    return src.allDocs({
	      keys: ids,
	      include_docs: true
	    }).then(function (res) {
	      if (state.cancelled) {
	        throw new Error('cancelled');
	      }
	      res.rows.forEach(function (row) {
	        if (row.deleted || !row.doc || !isGenOne$1(row.value.rev) ||
	            hasAttachments(row.doc)) {
	          // if any of these conditions apply, we need to fetch using get()
	          return;
	        }
	
	        // the doc we got back from allDocs() is sufficient
	        resultDocs.push(row.doc);
	        delete diffs[row.id];
	      });
	    });
	  }
	
	  function getRevisionOneDocs() {
	    // filter out the generation 1 docs and get them
	    // leaving the non-generation one docs to be got otherwise
	    var ids = Object.keys(diffs).filter(function (id) {
	      var missing = diffs[id].missing;
	      return missing.length === 1 && isGenOne$1(missing[0]);
	    });
	    if (ids.length > 0) {
	      return fetchRevisionOneDocs(ids);
	    }
	  }
	
	  function returnResult() {
	    return { ok:ok, docs:resultDocs };
	  }
	
	  return PouchPromise.resolve()
	    .then(getRevisionOneDocs)
	    .then(getAllDocs)
	    .then(returnResult);
	}
	
	var CHECKPOINT_VERSION = 1;
	var REPLICATOR = "pouchdb";
	// This is an arbitrary number to limit the
	// amount of replication history we save in the checkpoint.
	// If we save too much, the checkpoing docs will become very big,
	// if we save fewer, we'll run a greater risk of having to
	// read all the changes from 0 when checkpoint PUTs fail
	// CouchDB 2.0 has a more involved history pruning,
	// but let's go for the simple version for now.
	var CHECKPOINT_HISTORY_SIZE = 5;
	var LOWEST_SEQ = 0;
	
	function updateCheckpoint(db, id, checkpoint, session, returnValue) {
	  return db.get(id).catch(function (err) {
	    if (err.status === 404) {
	      if (db.type() === 'http') {
	        explainError(
	          404, 'PouchDB is just checking if a remote checkpoint exists.'
	        );
	      }
	      return {
	        session_id: session,
	        _id: id,
	        history: [],
	        replicator: REPLICATOR,
	        version: CHECKPOINT_VERSION
	      };
	    }
	    throw err;
	  }).then(function (doc) {
	    if (returnValue.cancelled) {
	      return;
	    }
	    // Filter out current entry for this replication
	    doc.history = (doc.history || []).filter(function (item) {
	      return item.session_id !== session;
	    });
	
	    // Add the latest checkpoint to history
	    doc.history.unshift({
	      last_seq: checkpoint,
	      session_id: session
	    });
	
	    // Just take the last pieces in history, to
	    // avoid really big checkpoint docs.
	    // see comment on history size above
	    doc.history = doc.history.slice(0, CHECKPOINT_HISTORY_SIZE);
	
	    doc.version = CHECKPOINT_VERSION;
	    doc.replicator = REPLICATOR;
	
	    doc.session_id = session;
	    doc.last_seq = checkpoint;
	
	    return db.put(doc).catch(function (err) {
	      if (err.status === 409) {
	        // retry; someone is trying to write a checkpoint simultaneously
	        return updateCheckpoint(db, id, checkpoint, session, returnValue);
	      }
	      throw err;
	    });
	  });
	}
	
	function Checkpointer(src, target, id, returnValue) {
	  this.src = src;
	  this.target = target;
	  this.id = id;
	  this.returnValue = returnValue;
	}
	
	Checkpointer.prototype.writeCheckpoint = function (checkpoint, session) {
	  var self = this;
	  return this.updateTarget(checkpoint, session).then(function () {
	    return self.updateSource(checkpoint, session);
	  });
	};
	
	Checkpointer.prototype.updateTarget = function (checkpoint, session) {
	  return updateCheckpoint(this.target, this.id, checkpoint,
	    session, this.returnValue);
	};
	
	Checkpointer.prototype.updateSource = function (checkpoint, session) {
	  var self = this;
	  if (this.readOnlySource) {
	    return PouchPromise.resolve(true);
	  }
	  return updateCheckpoint(this.src, this.id, checkpoint,
	    session, this.returnValue)
	    .catch(function (err) {
	      if (isForbiddenError(err)) {
	        self.readOnlySource = true;
	        return true;
	      }
	      throw err;
	    });
	};
	
	var comparisons = {
	  "undefined": function (targetDoc, sourceDoc) {
	    // This is the previous comparison function
	    if (pouchdbCollate.collate(targetDoc.last_seq, sourceDoc.last_seq) === 0) {
	      return sourceDoc.last_seq;
	    }
	    /* istanbul ignore next */
	    return 0;
	  },
	  "1": function (targetDoc, sourceDoc) {
	    // This is the comparison function ported from CouchDB
	    return compareReplicationLogs(sourceDoc, targetDoc).last_seq;
	  }
	};
	
	Checkpointer.prototype.getCheckpoint = function () {
	  var self = this;
	  return self.target.get(self.id).then(function (targetDoc) {
	    if (self.readOnlySource) {
	      return PouchPromise.resolve(targetDoc.last_seq);
	    }
	
	    return self.src.get(self.id).then(function (sourceDoc) {
	      // Since we can't migrate an old version doc to a new one
	      // (no session id), we just go with the lowest seq in this case
	      /* istanbul ignore if */
	      if (targetDoc.version !== sourceDoc.version) {
	        return LOWEST_SEQ;
	      }
	
	      var version;
	      if (targetDoc.version) {
	        version = targetDoc.version.toString();
	      } else {
	        version = "undefined";
	      }
	
	      if (version in comparisons) {
	        return comparisons[version](targetDoc, sourceDoc);
	      }
	      /* istanbul ignore next */
	      return LOWEST_SEQ;
	    }, function (err) {
	      if (err.status === 404 && targetDoc.last_seq) {
	        return self.src.put({
	          _id: self.id,
	          last_seq: LOWEST_SEQ
	        }).then(function () {
	          return LOWEST_SEQ;
	        }, function (err) {
	          if (isForbiddenError(err)) {
	            self.readOnlySource = true;
	            return targetDoc.last_seq;
	          }
	          /* istanbul ignore next */
	          return LOWEST_SEQ;
	        });
	      }
	      throw err;
	    });
	  }).catch(function (err) {
	    if (err.status !== 404) {
	      throw err;
	    }
	    return LOWEST_SEQ;
	  });
	};
	// This checkpoint comparison is ported from CouchDBs source
	// they come from here:
	// https://github.com/apache/couchdb-couch-replicator/blob/master/src/couch_replicator.erl#L863-L906
	
	function compareReplicationLogs(srcDoc, tgtDoc) {
	  if (srcDoc.session_id === tgtDoc.session_id) {
	    return {
	      last_seq: srcDoc.last_seq,
	      history: srcDoc.history
	    };
	  }
	
	  return compareReplicationHistory(srcDoc.history, tgtDoc.history);
	}
	
	function compareReplicationHistory(sourceHistory, targetHistory) {
	  // the erlang loop via function arguments is not so easy to repeat in JS
	  // therefore, doing this as recursion
	  var S = sourceHistory[0];
	  var sourceRest = sourceHistory.slice(1);
	  var T = targetHistory[0];
	  var targetRest = targetHistory.slice(1);
	
	  if (!S || targetHistory.length === 0) {
	    return {
	      last_seq: LOWEST_SEQ,
	      history: []
	    };
	  }
	
	  var sourceId = S.session_id;
	  /* istanbul ignore if */
	  if (hasSessionId(sourceId, targetHistory)) {
	    return {
	      last_seq: S.last_seq,
	      history: sourceHistory
	    };
	  }
	
	  var targetId = T.session_id;
	  if (hasSessionId(targetId, sourceRest)) {
	    return {
	      last_seq: T.last_seq,
	      history: targetRest
	    };
	  }
	
	  return compareReplicationHistory(sourceRest, targetRest);
	}
	
	function hasSessionId(sessionId, history) {
	  var props = history[0];
	  var rest = history.slice(1);
	
	  if (!sessionId || history.length === 0) {
	    return false;
	  }
	
	  if (sessionId === props.session_id) {
	    return true;
	  }
	
	  return hasSessionId(sessionId, rest);
	}
	
	function isForbiddenError(err) {
	  return typeof err.status === 'number' && Math.floor(err.status / 100) === 4;
	}
	
	var STARTING_BACK_OFF = 0;
	
	function backOff(opts, returnValue, error, callback) {
	  if (opts.retry === false) {
	    returnValue.emit('error', error);
	    returnValue.removeAllListeners();
	    return;
	  }
	  if (typeof opts.back_off_function !== 'function') {
	    opts.back_off_function = defaultBackOff;
	  }
	  returnValue.emit('requestError', error);
	  if (returnValue.state === 'active' || returnValue.state === 'pending') {
	    returnValue.emit('paused', error);
	    returnValue.state = 'stopped';
	    var backOffSet = function backoffTimeSet() {
	      opts.current_back_off = STARTING_BACK_OFF;
	    };
	    var removeBackOffSetter = function removeBackOffTimeSet() {
	      returnValue.removeListener('active', backOffSet);
	    };
	    returnValue.once('paused', removeBackOffSetter);
	    returnValue.once('active', backOffSet);
	  }
	
	  opts.current_back_off = opts.current_back_off || STARTING_BACK_OFF;
	  opts.current_back_off = opts.back_off_function(opts.current_back_off);
	  setTimeout(callback, opts.current_back_off);
	}
	
	function sortObjectPropertiesByKey(queryParams) {
	  return Object.keys(queryParams).sort(pouchdbCollate.collate).reduce(function (result, key) {
	    result[key] = queryParams[key];
	    return result;
	  }, {});
	}
	
	// Generate a unique id particular to this replication.
	// Not guaranteed to align perfectly with CouchDB's rep ids.
	function generateReplicationId(src, target, opts) {
	  var docIds = opts.doc_ids ? opts.doc_ids.sort(pouchdbCollate.collate) : '';
	  var filterFun = opts.filter ? opts.filter.toString() : '';
	  var queryParams = '';
	  var filterViewName =  '';
	
	  if (opts.filter && opts.query_params) {
	    queryParams = JSON.stringify(sortObjectPropertiesByKey(opts.query_params));
	  }
	
	  if (opts.filter && opts.filter === '_view') {
	    filterViewName = opts.view.toString();
	  }
	
	  return PouchPromise.all([src.id(), target.id()]).then(function (res) {
	    var queryData = res[0] + res[1] + filterFun + filterViewName +
	      queryParams + docIds;
	    return new PouchPromise(function (resolve) {
	      binaryMd5(queryData, resolve);
	    });
	  }).then(function (md5sum) {
	    // can't use straight-up md5 alphabet, because
	    // the char '/' is interpreted as being for attachments,
	    // and + is also not url-safe
	    md5sum = md5sum.replace(/\//g, '.').replace(/\+/g, '_');
	    return '_local/' + md5sum;
	  });
	}
	
	function replicate$1(src, target, opts, returnValue, result) {
	  var batches = [];               // list of batches to be processed
	  var currentBatch;               // the batch currently being processed
	  var pendingBatch = {
	    seq: 0,
	    changes: [],
	    docs: []
	  }; // next batch, not yet ready to be processed
	  var writingCheckpoint = false;  // true while checkpoint is being written
	  var changesCompleted = false;   // true when all changes received
	  var replicationCompleted = false; // true when replication has completed
	  var last_seq = 0;
	  var continuous = opts.continuous || opts.live || false;
	  var batch_size = opts.batch_size || 100;
	  var batches_limit = opts.batches_limit || 10;
	  var changesPending = false;     // true while src.changes is running
	  var doc_ids = opts.doc_ids;
	  var repId;
	  var checkpointer;
	  var allErrors = [];
	  var changedDocs = [];
	  // Like couchdb, every replication gets a unique session id
	  var session = uuid();
	
	  result = result || {
	    ok: true,
	    start_time: new Date(),
	    docs_read: 0,
	    docs_written: 0,
	    doc_write_failures: 0,
	    errors: []
	  };
	
	  var changesOpts = {};
	  returnValue.ready(src, target);
	
	  function initCheckpointer() {
	    if (checkpointer) {
	      return PouchPromise.resolve();
	    }
	    return generateReplicationId(src, target, opts).then(function (res) {
	      repId = res;
	      checkpointer = new Checkpointer(src, target, repId, returnValue);
	    });
	  }
	
	  function writeDocs() {
	    changedDocs = [];
	
	    if (currentBatch.docs.length === 0) {
	      return;
	    }
	    var docs = currentBatch.docs;
	    return target.bulkDocs({docs: docs, new_edits: false}).then(function (res) {
	      /* istanbul ignore if */
	      if (returnValue.cancelled) {
	        completeReplication();
	        throw new Error('cancelled');
	      }
	      var errors = [];
	      var errorsById = {};
	      res.forEach(function (res) {
	        if (res.error) {
	          result.doc_write_failures++;
	          errors.push(res);
	          errorsById[res.id] = res;
	        }
	      });
	      allErrors = allErrors.concat(errors);
	      result.docs_written += currentBatch.docs.length - errors.length;
	      var non403s = errors.filter(function (error) {
	        return error.name !== 'unauthorized' && error.name !== 'forbidden';
	      });
	
	      docs.forEach(function (doc) {
	        var error = errorsById[doc._id];
	        if (error) {
	          returnValue.emit('denied', clone(error));
	        } else {
	          changedDocs.push(doc);
	        }
	      });
	
	      if (non403s.length > 0) {
	        var error = new Error('bulkDocs error');
	        error.other_errors = errors;
	        abortReplication('target.bulkDocs failed to write docs', error);
	        throw new Error('bulkWrite partial failure');
	      }
	    }, function (err) {
	      result.doc_write_failures += docs.length;
	      throw err;
	    });
	  }
	
	  function finishBatch() {
	    if (currentBatch.error) {
	      throw new Error('There was a problem getting docs.');
	    }
	    result.last_seq = last_seq = currentBatch.seq;
	    var outResult = clone(result);
	    if (changedDocs.length) {
	      outResult.docs = changedDocs;
	      returnValue.emit('change', outResult);
	    }
	    writingCheckpoint = true;
	    return checkpointer.writeCheckpoint(currentBatch.seq,
	        session).then(function () {
	      writingCheckpoint = false;
	      /* istanbul ignore if */
	      if (returnValue.cancelled) {
	        completeReplication();
	        throw new Error('cancelled');
	      }
	      currentBatch = undefined;
	      getChanges();
	    }).catch(onCheckpointError);
	  }
	
	  function getDiffs() {
	    var diff = {};
	    currentBatch.changes.forEach(function (change) {
	      // Couchbase Sync Gateway emits these, but we can ignore them
	      /* istanbul ignore if */
	      if (change.id === "_user/") {
	        return;
	      }
	      diff[change.id] = change.changes.map(function (x) {
	        return x.rev;
	      });
	    });
	    return target.revsDiff(diff).then(function (diffs) {
	      /* istanbul ignore if */
	      if (returnValue.cancelled) {
	        completeReplication();
	        throw new Error('cancelled');
	      }
	      // currentBatch.diffs elements are deleted as the documents are written
	      currentBatch.diffs = diffs;
	    });
	  }
	
	  function getBatchDocs() {
	    return getDocs(src, target, currentBatch.diffs, returnValue).then(function (got) {
	      currentBatch.error = !got.ok;
	      got.docs.forEach(function (doc) {
	        delete currentBatch.diffs[doc._id];
	        result.docs_read++;
	        currentBatch.docs.push(doc);
	      });
	    });
	  }
	
	  function startNextBatch() {
	    if (returnValue.cancelled || currentBatch) {
	      return;
	    }
	    if (batches.length === 0) {
	      processPendingBatch(true);
	      return;
	    }
	    currentBatch = batches.shift();
	    getDiffs()
	      .then(getBatchDocs)
	      .then(writeDocs)
	      .then(finishBatch)
	      .then(startNextBatch)
	      .catch(function (err) {
	        abortReplication('batch processing terminated with error', err);
	      });
	  }
	
	
	  function processPendingBatch(immediate) {
	    if (pendingBatch.changes.length === 0) {
	      if (batches.length === 0 && !currentBatch) {
	        if ((continuous && changesOpts.live) || changesCompleted) {
	          returnValue.state = 'pending';
	          returnValue.emit('paused');
	        }
	        if (changesCompleted) {
	          completeReplication();
	        }
	      }
	      return;
	    }
	    if (
	      immediate ||
	      changesCompleted ||
	      pendingBatch.changes.length >= batch_size
	    ) {
	      batches.push(pendingBatch);
	      pendingBatch = {
	        seq: 0,
	        changes: [],
	        docs: []
	      };
	      if (returnValue.state === 'pending' || returnValue.state === 'stopped') {
	        returnValue.state = 'active';
	        returnValue.emit('active');
	      }
	      startNextBatch();
	    }
	  }
	
	
	  function abortReplication(reason, err) {
	    if (replicationCompleted) {
	      return;
	    }
	    if (!err.message) {
	      err.message = reason;
	    }
	    result.ok = false;
	    result.status = 'aborting';
	    result.errors.push(err);
	    allErrors = allErrors.concat(err);
	    batches = [];
	    pendingBatch = {
	      seq: 0,
	      changes: [],
	      docs: []
	    };
	    completeReplication();
	  }
	
	
	  function completeReplication() {
	    if (replicationCompleted) {
	      return;
	    }
	    /* istanbul ignore if */
	    if (returnValue.cancelled) {
	      result.status = 'cancelled';
	      if (writingCheckpoint) {
	        return;
	      }
	    }
	    result.status = result.status || 'complete';
	    result.end_time = new Date();
	    result.last_seq = last_seq;
	    replicationCompleted = true;
	    var non403s = allErrors.filter(function (error) {
	      return error.name !== 'unauthorized' && error.name !== 'forbidden';
	    });
	    if (non403s.length > 0) {
	      var error = allErrors.pop();
	      if (allErrors.length > 0) {
	        error.other_errors = allErrors;
	      }
	      error.result = result;
	      backOff(opts, returnValue, error, function () {
	        replicate$1(src, target, opts, returnValue);
	      });
	    } else {
	      result.errors = allErrors;
	      returnValue.emit('complete', result);
	      returnValue.removeAllListeners();
	    }
	  }
	
	
	  function onChange(change) {
	    /* istanbul ignore if */
	    if (returnValue.cancelled) {
	      return completeReplication();
	    }
	    var filter = filterChange(opts)(change);
	    if (!filter) {
	      return;
	    }
	    pendingBatch.seq = change.seq;
	    pendingBatch.changes.push(change);
	    processPendingBatch(batches.length === 0 && changesOpts.live);
	  }
	
	
	  function onChangesComplete(changes) {
	    changesPending = false;
	    /* istanbul ignore if */
	    if (returnValue.cancelled) {
	      return completeReplication();
	    }
	
	    // if no results were returned then we're done,
	    // else fetch more
	    if (changes.results.length > 0) {
	      changesOpts.since = changes.last_seq;
	      getChanges();
	      processPendingBatch(true);
	    } else {
	
	      var complete = function () {
	        if (continuous) {
	          changesOpts.live = true;
	          getChanges();
	        } else {
	          changesCompleted = true;
	        }
	        processPendingBatch(true);
	      };
	
	      // update the checkpoint so we start from the right seq next time
	      if (!currentBatch && changes.results.length === 0) {
	        writingCheckpoint = true;
	        checkpointer.writeCheckpoint(changes.last_seq,
	            session).then(function () {
	          writingCheckpoint = false;
	          result.last_seq = last_seq = changes.last_seq;
	          complete();
	        })
	        .catch(onCheckpointError);
	      } else {
	        complete();
	      }
	    }
	  }
	
	
	  function onChangesError(err) {
	    changesPending = false;
	    /* istanbul ignore if */
	    if (returnValue.cancelled) {
	      return completeReplication();
	    }
	    abortReplication('changes rejected', err);
	  }
	
	
	  function getChanges() {
	    if (!(
	      !changesPending &&
	      !changesCompleted &&
	      batches.length < batches_limit
	      )) {
	      return;
	    }
	    changesPending = true;
	    function abortChanges() {
	      changes.cancel();
	    }
	    function removeListener() {
	      returnValue.removeListener('cancel', abortChanges);
	    }
	
	    if (returnValue._changes) { // remove old changes() and listeners
	      returnValue.removeListener('cancel', returnValue._abortChanges);
	      returnValue._changes.cancel();
	    }
	    returnValue.once('cancel', abortChanges);
	
	    var changes = src.changes(changesOpts)
	      .on('change', onChange);
	    changes.then(removeListener, removeListener);
	    changes.then(onChangesComplete)
	      .catch(onChangesError);
	
	    if (opts.retry) {
	      // save for later so we can cancel if necessary
	      returnValue._changes = changes;
	      returnValue._abortChanges = abortChanges;
	    }
	  }
	
	
	  function startChanges() {
	    initCheckpointer().then(function () {
	      /* istanbul ignore if */
	      if (returnValue.cancelled) {
	        completeReplication();
	        return;
	      }
	      return checkpointer.getCheckpoint().then(function (checkpoint) {
	        last_seq = checkpoint;
	        changesOpts = {
	          since: last_seq,
	          limit: batch_size,
	          batch_size: batch_size,
	          style: 'all_docs',
	          doc_ids: doc_ids,
	          return_docs: true // required so we know when we're done
	        };
	        if (opts.filter) {
	          if (typeof opts.filter !== 'string') {
	            // required for the client-side filter in onChange
	            changesOpts.include_docs = true;
	          } else { // ddoc filter
	            changesOpts.filter = opts.filter;
	          }
	        }
	        if ('heartbeat' in opts) {
	          changesOpts.heartbeat = opts.heartbeat;
	        }
	        if ('timeout' in opts) {
	          changesOpts.timeout = opts.timeout;
	        }
	        if (opts.query_params) {
	          changesOpts.query_params = opts.query_params;
	        }
	        if (opts.view) {
	          changesOpts.view = opts.view;
	        }
	        getChanges();
	      });
	    }).catch(function (err) {
	      abortReplication('getCheckpoint rejected with ', err);
	    });
	  }
	
	  /* istanbul ignore next */
	  function onCheckpointError(err) {
	    writingCheckpoint = false;
	    abortReplication('writeCheckpoint completed with error', err);
	    throw err;
	  }
	
	  /* istanbul ignore if */
	  if (returnValue.cancelled) { // cancelled immediately
	    completeReplication();
	    return;
	  }
	
	  if (!returnValue._addedListeners) {
	    returnValue.once('cancel', completeReplication);
	
	    if (typeof opts.complete === 'function') {
	      returnValue.once('error', opts.complete);
	      returnValue.once('complete', function (result) {
	        opts.complete(null, result);
	      });
	    }
	    returnValue._addedListeners = true;
	  }
	
	  if (typeof opts.since === 'undefined') {
	    startChanges();
	  } else {
	    initCheckpointer().then(function () {
	      writingCheckpoint = true;
	      return checkpointer.writeCheckpoint(opts.since, session);
	    }).then(function () {
	      writingCheckpoint = false;
	      /* istanbul ignore if */
	      if (returnValue.cancelled) {
	        completeReplication();
	        return;
	      }
	      last_seq = opts.since;
	      startChanges();
	    }).catch(onCheckpointError);
	  }
	}
	
	// We create a basic promise so the caller can cancel the replication possibly
	// before we have actually started listening to changes etc
	inherits(Replication, events.EventEmitter);
	function Replication() {
	  events.EventEmitter.call(this);
	  this.cancelled = false;
	  this.state = 'pending';
	  var self = this;
	  var promise = new PouchPromise(function (fulfill, reject) {
	    self.once('complete', fulfill);
	    self.once('error', reject);
	  });
	  self.then = function (resolve, reject) {
	    return promise.then(resolve, reject);
	  };
	  self.catch = function (reject) {
	    return promise.catch(reject);
	  };
	  // As we allow error handling via "error" event as well,
	  // put a stub in here so that rejecting never throws UnhandledError.
	  self.catch(function () {});
	}
	
	Replication.prototype.cancel = function () {
	  this.cancelled = true;
	  this.state = 'cancelled';
	  this.emit('cancel');
	};
	
	Replication.prototype.ready = function (src, target) {
	  var self = this;
	  if (self._readyCalled) {
	    return;
	  }
	  self._readyCalled = true;
	
	  function onDestroy() {
	    self.cancel();
	  }
	  src.once('destroyed', onDestroy);
	  target.once('destroyed', onDestroy);
	  function cleanup() {
	    src.removeListener('destroyed', onDestroy);
	    target.removeListener('destroyed', onDestroy);
	  }
	  self.once('complete', cleanup);
	};
	
	function toPouch(db, opts) {
	  var PouchConstructor = opts.PouchConstructor;
	  if (typeof db === 'string') {
	    return new PouchConstructor(db, opts);
	  } else {
	    return db;
	  }
	}
	
	function replicate(src, target, opts, callback) {
	
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	  if (typeof opts === 'undefined') {
	    opts = {};
	  }
	
	  if (opts.doc_ids && !Array.isArray(opts.doc_ids)) {
	    throw createError(BAD_REQUEST,
	                       "`doc_ids` filter parameter is not a list.");
	  }
	
	  opts.complete = callback;
	  opts = clone(opts);
	  opts.continuous = opts.continuous || opts.live;
	  opts.retry = ('retry' in opts) ? opts.retry : false;
	  /*jshint validthis:true */
	  opts.PouchConstructor = opts.PouchConstructor || this;
	  var replicateRet = new Replication(opts);
	  var srcPouch = toPouch(src, opts);
	  var targetPouch = toPouch(target, opts);
	  replicate$1(srcPouch, targetPouch, opts, replicateRet);
	  return replicateRet;
	}
	
	inherits(Sync, events.EventEmitter);
	function sync(src, target, opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	  if (typeof opts === 'undefined') {
	    opts = {};
	  }
	  opts = clone(opts);
	  /*jshint validthis:true */
	  opts.PouchConstructor = opts.PouchConstructor || this;
	  src = toPouch(src, opts);
	  target = toPouch(target, opts);
	  return new Sync(src, target, opts, callback);
	}
	
	function Sync(src, target, opts, callback) {
	  var self = this;
	  this.canceled = false;
	
	  var optsPush = opts.push ? jsExtend.extend({}, opts, opts.push) : opts;
	  var optsPull = opts.pull ? jsExtend.extend({}, opts, opts.pull) : opts;
	
	  this.push = replicate(src, target, optsPush);
	  this.pull = replicate(target, src, optsPull);
	
	  this.pushPaused = true;
	  this.pullPaused = true;
	
	  function pullChange(change) {
	    self.emit('change', {
	      direction: 'pull',
	      change: change
	    });
	  }
	  function pushChange(change) {
	    self.emit('change', {
	      direction: 'push',
	      change: change
	    });
	  }
	  function pushDenied(doc) {
	    self.emit('denied', {
	      direction: 'push',
	      doc: doc
	    });
	  }
	  function pullDenied(doc) {
	    self.emit('denied', {
	      direction: 'pull',
	      doc: doc
	    });
	  }
	  function pushPaused() {
	    self.pushPaused = true;
	    /* istanbul ignore if */
	    if (self.pullPaused) {
	      self.emit('paused');
	    }
	  }
	  function pullPaused() {
	    self.pullPaused = true;
	    /* istanbul ignore if */
	    if (self.pushPaused) {
	      self.emit('paused');
	    }
	  }
	  function pushActive() {
	    self.pushPaused = false;
	    /* istanbul ignore if */
	    if (self.pullPaused) {
	      self.emit('active', {
	        direction: 'push'
	      });
	    }
	  }
	  function pullActive() {
	    self.pullPaused = false;
	    /* istanbul ignore if */
	    if (self.pushPaused) {
	      self.emit('active', {
	        direction: 'pull'
	      });
	    }
	  }
	
	  var removed = {};
	
	  function removeAll(type) { // type is 'push' or 'pull'
	    return function (event, func) {
	      var isChange = event === 'change' &&
	        (func === pullChange || func === pushChange);
	      var isDenied = event === 'denied' &&
	        (func === pullDenied || func === pushDenied);
	      var isPaused = event === 'paused' &&
	        (func === pullPaused || func === pushPaused);
	      var isActive = event === 'active' &&
	        (func === pullActive || func === pushActive);
	
	      if (isChange || isDenied || isPaused || isActive) {
	        if (!(event in removed)) {
	          removed[event] = {};
	        }
	        removed[event][type] = true;
	        if (Object.keys(removed[event]).length === 2) {
	          // both push and pull have asked to be removed
	          self.removeAllListeners(event);
	        }
	      }
	    };
	  }
	
	  if (opts.live) {
	    this.push.on('complete', self.pull.cancel.bind(self.pull));
	    this.pull.on('complete', self.push.cancel.bind(self.push));
	  }
	
	  this.on('newListener', function (event) {
	    if (event === 'change') {
	      self.pull.on('change', pullChange);
	      self.push.on('change', pushChange);
	    } else if (event === 'denied') {
	      self.pull.on('denied', pullDenied);
	      self.push.on('denied', pushDenied);
	    } else if (event === 'active') {
	      self.pull.on('active', pullActive);
	      self.push.on('active', pushActive);
	    } else if (event === 'paused') {
	      self.pull.on('paused', pullPaused);
	      self.push.on('paused', pushPaused);
	    }
	  });
	
	  this.on('removeListener', function (event) {
	    if (event === 'change') {
	      self.pull.removeListener('change', pullChange);
	      self.push.removeListener('change', pushChange);
	    } else if (event === 'denied') {
	      self.pull.removeListener('denied', pullDenied);
	      self.push.removeListener('denied', pushDenied);
	    } else if (event === 'active') {
	      self.pull.removeListener('active', pullActive);
	      self.push.removeListener('active', pushActive);
	    } else if (event === 'paused') {
	      self.pull.removeListener('paused', pullPaused);
	      self.push.removeListener('paused', pushPaused);
	    }
	  });
	
	  this.pull.on('removeListener', removeAll('pull'));
	  this.push.on('removeListener', removeAll('push'));
	
	  var promise = PouchPromise.all([
	    this.push,
	    this.pull
	  ]).then(function (resp) {
	    var out = {
	      push: resp[0],
	      pull: resp[1]
	    };
	    self.emit('complete', out);
	    if (callback) {
	      callback(null, out);
	    }
	    self.removeAllListeners();
	    return out;
	  }, function (err) {
	    self.cancel();
	    if (callback) {
	      // if there's a callback, then the callback can receive
	      // the error event
	      callback(err);
	    } else {
	      // if there's no callback, then we're safe to emit an error
	      // event, which would otherwise throw an unhandled error
	      // due to 'error' being a special event in EventEmitters
	      self.emit('error', err);
	    }
	    self.removeAllListeners();
	    if (callback) {
	      // no sense throwing if we're already emitting an 'error' event
	      throw err;
	    }
	  });
	
	  this.then = function (success, err) {
	    return promise.then(success, err);
	  };
	
	  this.catch = function (err) {
	    return promise.catch(err);
	  };
	}
	
	Sync.prototype.cancel = function () {
	  if (!this.canceled) {
	    this.canceled = true;
	    this.push.cancel();
	    this.pull.cancel();
	  }
	};
	
	function replication(PouchDB) {
	  PouchDB.replicate = replicate;
	  PouchDB.sync = sync;
	}
	
	PouchDB.plugin(IDBPouch)
	  .plugin(WebSqlPouch)
	  .plugin(HttpPouch$1)
	  .plugin(mapreduce)
	  .plugin(replication);
	
	module.exports = PouchDB;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2), (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	(function () {
	    try {
	        cachedSetTimeout = setTimeout;
	    } catch (e) {
	        cachedSetTimeout = function () {
	            throw new Error('setTimeout is not defined');
	        }
	    }
	    try {
	        cachedClearTimeout = clearTimeout;
	    } catch (e) {
	        cachedClearTimeout = function () {
	            throw new Error('clearTimeout is not defined');
	        }
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        return setTimeout(fun, 0);
	    } else {
	        return cachedSetTimeout.call(null, fun, 0);
	    }
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        clearTimeout(marker);
	    } else {
	        cachedClearTimeout.call(null, marker);
	    }
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 3 */
/***/ function(module, exports) {

	(function() { 
	
	  var slice   = Array.prototype.slice,
	      each    = Array.prototype.forEach;
	
	  var extend = function(obj) {
	    if(typeof obj !== 'object') throw obj + ' is not an object' ;
	
	    var sources = slice.call(arguments, 1); 
	
	    each.call(sources, function(source) {
	      if(source) {
	        for(var prop in source) {
	          if(typeof source[prop] === 'object' && obj[prop]) {
	            extend.call(obj, obj[prop], source[prop]);
	          } else {
	            obj[prop] = source[prop];
	          }
	        } 
	      }
	    });
	
	    return obj;
	  }
	
	  this.extend = extend;
	
	}).call(this);

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */
	
	exports = module.exports = __webpack_require__(5);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = 'undefined' != typeof chrome
	               && 'undefined' != typeof chrome.storage
	                  ? chrome.storage.local
	                  : localstorage();
	
	/**
	 * Colors.
	 */
	
	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];
	
	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */
	
	function useColors() {
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  return ('WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
	}
	
	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */
	
	exports.formatters.j = function(v) {
	  return JSON.stringify(v);
	};
	
	
	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */
	
	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;
	
	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);
	
	  if (!useColors) return args;
	
	  var c = 'color: ' + this.color;
	  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));
	
	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });
	
	  args.splice(lastC, 0, c);
	  return args;
	}
	
	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */
	
	function log() {
	  // this hackery is required for IE8/9, where
	  // the `console.log` function doesn't have 'apply'
	  return 'object' === typeof console
	    && console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}
	
	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */
	
	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      exports.storage.removeItem('debug');
	    } else {
	      exports.storage.debug = namespaces;
	    }
	  } catch(e) {}
	}
	
	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */
	
	function load() {
	  var r;
	  try {
	    r = exports.storage.debug;
	  } catch(e) {}
	  return r;
	}
	
	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */
	
	exports.enable(load());
	
	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */
	
	function localstorage(){
	  try {
	    return window.localStorage;
	  } catch (e) {}
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */
	
	exports = module.exports = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(6);
	
	/**
	 * The currently active debug mode names, and names to skip.
	 */
	
	exports.names = [];
	exports.skips = [];
	
	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */
	
	exports.formatters = {};
	
	/**
	 * Previously assigned color.
	 */
	
	var prevColor = 0;
	
	/**
	 * Previous log timestamp.
	 */
	
	var prevTime;
	
	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */
	
	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}
	
	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */
	
	function debug(namespace) {
	
	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;
	
	  // define the `enabled` version
	  function enabled() {
	
	    var self = enabled;
	
	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;
	
	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();
	
	    var args = Array.prototype.slice.call(arguments);
	
	    args[0] = exports.coerce(args[0]);
	
	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }
	
	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);
	
	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });
	
	    if ('function' === typeof exports.formatArgs) {
	      args = exports.formatArgs.apply(self, args);
	    }
	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;
	
	  var fn = exports.enabled(namespace) ? enabled : disabled;
	
	  fn.namespace = namespace;
	
	  return fn;
	}
	
	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */
	
	function enable(namespaces) {
	  exports.save(namespaces);
	
	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;
	
	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}
	
	/**
	 * Disable debug output.
	 *
	 * @api public
	 */
	
	function disable() {
	  exports.enable('');
	}
	
	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */
	
	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}
	
	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */
	
	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */
	
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;
	
	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @return {String|Number}
	 * @api public
	 */
	
	module.exports = function(val, options){
	  options = options || {};
	  if ('string' == typeof val) return parse(val);
	  return options.long
	    ? long(val)
	    : short(val);
	};
	
	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */
	
	function parse(str) {
	  str = '' + str;
	  if (str.length > 10000) return;
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
	  if (!match) return;
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	  }
	}
	
	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function short(ms) {
	  if (ms >= d) return Math.round(ms / d) + 'd';
	  if (ms >= h) return Math.round(ms / h) + 'h';
	  if (ms >= m) return Math.round(ms / m) + 'm';
	  if (ms >= s) return Math.round(ms / s) + 's';
	  return ms + 'ms';
	}
	
	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function long(ms) {
	  return plural(ms, d, 'day')
	    || plural(ms, h, 'hour')
	    || plural(ms, m, 'minute')
	    || plural(ms, s, 'second')
	    || ms + ' ms';
	}
	
	/**
	 * Pluralization helper.
	 */
	
	function plural(ms, n, name) {
	  if (ms < n) return;
	  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}


/***/ },
/* 7 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	var immediate = __webpack_require__(9);
	
	/* istanbul ignore next */
	function INTERNAL() {}
	
	var handlers = {};
	
	var REJECTED = ['REJECTED'];
	var FULFILLED = ['FULFILLED'];
	var PENDING = ['PENDING'];
	/* istanbul ignore else */
	if (!process.browser) {
	  // in which we actually take advantage of JS scoping
	  var UNHANDLED = ['UNHANDLED'];
	}
	
	module.exports = Promise;
	
	function Promise(resolver) {
	  if (typeof resolver !== 'function') {
	    throw new TypeError('resolver must be a function');
	  }
	  this.state = PENDING;
	  this.queue = [];
	  this.outcome = void 0;
	  /* istanbul ignore else */
	  if (!process.browser) {
	    this.handled = UNHANDLED;
	  }
	  if (resolver !== INTERNAL) {
	    safelyResolveThenable(this, resolver);
	  }
	}
	
	Promise.prototype.catch = function (onRejected) {
	  return this.then(null, onRejected);
	};
	Promise.prototype.then = function (onFulfilled, onRejected) {
	  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
	    typeof onRejected !== 'function' && this.state === REJECTED) {
	    return this;
	  }
	  var promise = new this.constructor(INTERNAL);
	  /* istanbul ignore else */
	  if (!process.browser) {
	    if (this.handled === UNHANDLED) {
	      this.handled = null;
	    }
	  }
	  if (this.state !== PENDING) {
	    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
	    unwrap(promise, resolver, this.outcome);
	  } else {
	    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
	  }
	
	  return promise;
	};
	function QueueItem(promise, onFulfilled, onRejected) {
	  this.promise = promise;
	  if (typeof onFulfilled === 'function') {
	    this.onFulfilled = onFulfilled;
	    this.callFulfilled = this.otherCallFulfilled;
	  }
	  if (typeof onRejected === 'function') {
	    this.onRejected = onRejected;
	    this.callRejected = this.otherCallRejected;
	  }
	}
	QueueItem.prototype.callFulfilled = function (value) {
	  handlers.resolve(this.promise, value);
	};
	QueueItem.prototype.otherCallFulfilled = function (value) {
	  unwrap(this.promise, this.onFulfilled, value);
	};
	QueueItem.prototype.callRejected = function (value) {
	  handlers.reject(this.promise, value);
	};
	QueueItem.prototype.otherCallRejected = function (value) {
	  unwrap(this.promise, this.onRejected, value);
	};
	
	function unwrap(promise, func, value) {
	  immediate(function () {
	    var returnValue;
	    try {
	      returnValue = func(value);
	    } catch (e) {
	      return handlers.reject(promise, e);
	    }
	    if (returnValue === promise) {
	      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
	    } else {
	      handlers.resolve(promise, returnValue);
	    }
	  });
	}
	
	handlers.resolve = function (self, value) {
	  var result = tryCatch(getThen, value);
	  if (result.status === 'error') {
	    return handlers.reject(self, result.value);
	  }
	  var thenable = result.value;
	
	  if (thenable) {
	    safelyResolveThenable(self, thenable);
	  } else {
	    self.state = FULFILLED;
	    self.outcome = value;
	    var i = -1;
	    var len = self.queue.length;
	    while (++i < len) {
	      self.queue[i].callFulfilled(value);
	    }
	  }
	  return self;
	};
	handlers.reject = function (self, error) {
	  self.state = REJECTED;
	  self.outcome = error;
	  /* istanbul ignore else */
	  if (!process.browser) {
	    if (self.handled === UNHANDLED) {
	      immediate(function () {
	        if (self.handled === UNHANDLED) {
	          process.emit('unhandledRejection', error, self);
	        }
	      });
	    }
	  }
	  var i = -1;
	  var len = self.queue.length;
	  while (++i < len) {
	    self.queue[i].callRejected(error);
	  }
	  return self;
	};
	
	function getThen(obj) {
	  // Make sure we only access the accessor once as required by the spec
	  var then = obj && obj.then;
	  if (obj && typeof obj === 'object' && typeof then === 'function') {
	    return function appyThen() {
	      then.apply(obj, arguments);
	    };
	  }
	}
	
	function safelyResolveThenable(self, thenable) {
	  // Either fulfill, reject or reject with error
	  var called = false;
	  function onError(value) {
	    if (called) {
	      return;
	    }
	    called = true;
	    handlers.reject(self, value);
	  }
	
	  function onSuccess(value) {
	    if (called) {
	      return;
	    }
	    called = true;
	    handlers.resolve(self, value);
	  }
	
	  function tryToUnwrap() {
	    thenable(onSuccess, onError);
	  }
	
	  var result = tryCatch(tryToUnwrap);
	  if (result.status === 'error') {
	    onError(result.value);
	  }
	}
	
	function tryCatch(func, value) {
	  var out = {};
	  try {
	    out.value = func(value);
	    out.status = 'success';
	  } catch (e) {
	    out.status = 'error';
	    out.value = e;
	  }
	  return out;
	}
	
	Promise.resolve = resolve;
	function resolve(value) {
	  if (value instanceof this) {
	    return value;
	  }
	  return handlers.resolve(new this(INTERNAL), value);
	}
	
	Promise.reject = reject;
	function reject(reason) {
	  var promise = new this(INTERNAL);
	  return handlers.reject(promise, reason);
	}
	
	Promise.all = all;
	function all(iterable) {
	  var self = this;
	  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
	    return this.reject(new TypeError('must be an array'));
	  }
	
	  var len = iterable.length;
	  var called = false;
	  if (!len) {
	    return this.resolve([]);
	  }
	
	  var values = new Array(len);
	  var resolved = 0;
	  var i = -1;
	  var promise = new this(INTERNAL);
	
	  while (++i < len) {
	    allResolver(iterable[i], i);
	  }
	  return promise;
	  function allResolver(value, i) {
	    self.resolve(value).then(resolveFromAll, function (error) {
	      if (!called) {
	        called = true;
	        handlers.reject(promise, error);
	      }
	    });
	    function resolveFromAll(outValue) {
	      values[i] = outValue;
	      if (++resolved === len && !called) {
	        called = true;
	        handlers.resolve(promise, values);
	      }
	    }
	  }
	}
	
	Promise.race = race;
	function race(iterable) {
	  var self = this;
	  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
	    return this.reject(new TypeError('must be an array'));
	  }
	
	  var len = iterable.length;
	  var called = false;
	  if (!len) {
	    return this.resolve([]);
	  }
	
	  var i = -1;
	  var promise = new this(INTERNAL);
	
	  while (++i < len) {
	    resolver(iterable[i]);
	  }
	  return promise;
	  function resolver(value) {
	    self.resolve(value).then(function (response) {
	      if (!called) {
	        called = true;
	        handlers.resolve(promise, response);
	      }
	    }, function (error) {
	      if (!called) {
	        called = true;
	        handlers.reject(promise, error);
	      }
	    });
	  }
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 9 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	var Mutation = global.MutationObserver || global.WebKitMutationObserver;
	
	var scheduleDrain;
	
	{
	  if (Mutation) {
	    var called = 0;
	    var observer = new Mutation(nextTick);
	    var element = global.document.createTextNode('');
	    observer.observe(element, {
	      characterData: true
	    });
	    scheduleDrain = function () {
	      element.data = (called = ++called % 2);
	    };
	  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
	    var channel = new global.MessageChannel();
	    channel.port1.onmessage = nextTick;
	    scheduleDrain = function () {
	      channel.port2.postMessage(0);
	    };
	  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
	    scheduleDrain = function () {
	
	      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	      var scriptEl = global.document.createElement('script');
	      scriptEl.onreadystatechange = function () {
	        nextTick();
	
	        scriptEl.onreadystatechange = null;
	        scriptEl.parentNode.removeChild(scriptEl);
	        scriptEl = null;
	      };
	      global.document.documentElement.appendChild(scriptEl);
	    };
	  } else {
	    scheduleDrain = function () {
	      setTimeout(nextTick, 0);
	    };
	  }
	}
	
	var draining;
	var queue = [];
	//named nextTick for less confusing stack traces
	function nextTick() {
	  draining = true;
	  var i, oldQueue;
	  var len = queue.length;
	  while (len) {
	    oldQueue = queue;
	    queue = [];
	    i = -1;
	    while (++i < len) {
	      oldQueue[i]();
	    }
	    len = queue.length;
	  }
	  draining = false;
	}
	
	module.exports = immediate;
	function immediate(task) {
	  if (queue.push(task) === 1 && !draining) {
	    scheduleDrain();
	  }
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';
	exports.Map = LazyMap; // TODO: use ES6 map
	exports.Set = LazySet; // TODO: use ES6 set
	// based on https://github.com/montagejs/collections
	function LazyMap() {
	  this.store = {};
	}
	LazyMap.prototype.mangle = function (key) {
	  if (typeof key !== "string") {
	    throw new TypeError("key must be a string but Got " + key);
	  }
	  return '$' + key;
	};
	LazyMap.prototype.unmangle = function (key) {
	  return key.substring(1);
	};
	LazyMap.prototype.get = function (key) {
	  var mangled = this.mangle(key);
	  if (mangled in this.store) {
	    return this.store[mangled];
	  }
	  return void 0;
	};
	LazyMap.prototype.set = function (key, value) {
	  var mangled = this.mangle(key);
	  this.store[mangled] = value;
	  return true;
	};
	LazyMap.prototype.has = function (key) {
	  var mangled = this.mangle(key);
	  return mangled in this.store;
	};
	LazyMap.prototype.delete = function (key) {
	  var mangled = this.mangle(key);
	  if (mangled in this.store) {
	    delete this.store[mangled];
	    return true;
	  }
	  return false;
	};
	LazyMap.prototype.forEach = function (cb) {
	  var keys = Object.keys(this.store);
	  for (var i = 0, len = keys.length; i < len; i++) {
	    var key = keys[i];
	    var value = this.store[key];
	    key = this.unmangle(key);
	    cb(value, key);
	  }
	};
	
	function LazySet(array) {
	  this.store = new LazyMap();
	
	  // init with an array
	  if (array && Array.isArray(array)) {
	    for (var i = 0, len = array.length; i < len; i++) {
	      this.add(array[i]);
	    }
	  }
	}
	LazySet.prototype.add = function (key) {
	  return this.store.set(key, true);
	};
	LazySet.prototype.has = function (key) {
	  return this.store.has(key);
	};
	LazySet.prototype.delete = function (key) {
	  return this.store.delete(key);
	};


/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = argsArray;
	
	function argsArray(fun) {
	  return function () {
	    var len = arguments.length;
	    if (len) {
	      var args = [];
	      var i = -1;
	      while (++i < len) {
	        args[i] = arguments[i];
	      }
	      return fun.call(this, args);
	    } else {
	      return fun.call(this, []);
	    }
	  };
	}

/***/ },
/* 12 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;
	
	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;
	
	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;
	
	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;
	
	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};
	
	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;
	
	  if (!this._events)
	    this._events = {};
	
	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }
	
	  handler = this._events[type];
	
	  if (isUndefined(handler))
	    return false;
	
	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }
	
	  return true;
	};
	
	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;
	
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  if (!this._events)
	    this._events = {};
	
	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);
	
	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];
	
	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }
	
	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }
	
	  return this;
	};
	
	EventEmitter.prototype.on = EventEmitter.prototype.addListener;
	
	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  var fired = false;
	
	  function g() {
	    this.removeListener(type, g);
	
	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }
	
	  g.listener = listener;
	  this.on(type, g);
	
	  return this;
	};
	
	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;
	
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  if (!this._events || !this._events[type])
	    return this;
	
	  list = this._events[type];
	  length = list.length;
	  position = -1;
	
	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	
	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }
	
	    if (position < 0)
	      return this;
	
	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }
	
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }
	
	  return this;
	};
	
	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;
	
	  if (!this._events)
	    return this;
	
	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }
	
	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }
	
	  listeners = this._events[type];
	
	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];
	
	  return this;
	};
	
	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};
	
	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];
	
	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};
	
	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};
	
	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	
	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	
	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	
	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 13 */
/***/ function(module, exports) {

	// Generated by CoffeeScript 1.9.2
	(function() {
	  var hasProp = {}.hasOwnProperty,
	    slice = [].slice;
	
	  module.exports = function(source, scope) {
	    var key, keys, value, values;
	    keys = [];
	    values = [];
	    for (key in scope) {
	      if (!hasProp.call(scope, key)) continue;
	      value = scope[key];
	      if (key === 'this') {
	        continue;
	      }
	      keys.push(key);
	      values.push(value);
	    }
	    return Function.apply(null, slice.call(keys).concat([source])).apply(scope["this"], values);
	  };
	
	}).call(this);


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	(function (factory) {
	    if (true) {
	        // Node/CommonJS
	        module.exports = factory();
	    } else if (typeof define === 'function' && define.amd) {
	        // AMD
	        define(factory);
	    } else {
	        // Browser globals (with support for web workers)
	        var glob;
	
	        try {
	            glob = window;
	        } catch (e) {
	            glob = self;
	        }
	
	        glob.SparkMD5 = factory();
	    }
	}(function (undefined) {
	
	    'use strict';
	
	    /*
	     * Fastest md5 implementation around (JKM md5).
	     * Credits: Joseph Myers
	     *
	     * @see http://www.myersdaily.org/joseph/javascript/md5-text.html
	     * @see http://jsperf.com/md5-shootout/7
	     */
	
	    /* this function is much faster,
	      so if possible we use it. Some IEs
	      are the only ones I know of that
	      need the idiotic second function,
	      generated by an if clause.  */
	    var add32 = function (a, b) {
	        return (a + b) & 0xFFFFFFFF;
	    },
	        hex_chr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
	
	
	    function cmn(q, a, b, x, s, t) {
	        a = add32(add32(a, q), add32(x, t));
	        return add32((a << s) | (a >>> (32 - s)), b);
	    }
	
	    function ff(a, b, c, d, x, s, t) {
	        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
	    }
	
	    function gg(a, b, c, d, x, s, t) {
	        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
	    }
	
	    function hh(a, b, c, d, x, s, t) {
	        return cmn(b ^ c ^ d, a, b, x, s, t);
	    }
	
	    function ii(a, b, c, d, x, s, t) {
	        return cmn(c ^ (b | (~d)), a, b, x, s, t);
	    }
	
	    function md5cycle(x, k) {
	        var a = x[0],
	            b = x[1],
	            c = x[2],
	            d = x[3];
	
	        a = ff(a, b, c, d, k[0], 7, -680876936);
	        d = ff(d, a, b, c, k[1], 12, -389564586);
	        c = ff(c, d, a, b, k[2], 17, 606105819);
	        b = ff(b, c, d, a, k[3], 22, -1044525330);
	        a = ff(a, b, c, d, k[4], 7, -176418897);
	        d = ff(d, a, b, c, k[5], 12, 1200080426);
	        c = ff(c, d, a, b, k[6], 17, -1473231341);
	        b = ff(b, c, d, a, k[7], 22, -45705983);
	        a = ff(a, b, c, d, k[8], 7, 1770035416);
	        d = ff(d, a, b, c, k[9], 12, -1958414417);
	        c = ff(c, d, a, b, k[10], 17, -42063);
	        b = ff(b, c, d, a, k[11], 22, -1990404162);
	        a = ff(a, b, c, d, k[12], 7, 1804603682);
	        d = ff(d, a, b, c, k[13], 12, -40341101);
	        c = ff(c, d, a, b, k[14], 17, -1502002290);
	        b = ff(b, c, d, a, k[15], 22, 1236535329);
	
	        a = gg(a, b, c, d, k[1], 5, -165796510);
	        d = gg(d, a, b, c, k[6], 9, -1069501632);
	        c = gg(c, d, a, b, k[11], 14, 643717713);
	        b = gg(b, c, d, a, k[0], 20, -373897302);
	        a = gg(a, b, c, d, k[5], 5, -701558691);
	        d = gg(d, a, b, c, k[10], 9, 38016083);
	        c = gg(c, d, a, b, k[15], 14, -660478335);
	        b = gg(b, c, d, a, k[4], 20, -405537848);
	        a = gg(a, b, c, d, k[9], 5, 568446438);
	        d = gg(d, a, b, c, k[14], 9, -1019803690);
	        c = gg(c, d, a, b, k[3], 14, -187363961);
	        b = gg(b, c, d, a, k[8], 20, 1163531501);
	        a = gg(a, b, c, d, k[13], 5, -1444681467);
	        d = gg(d, a, b, c, k[2], 9, -51403784);
	        c = gg(c, d, a, b, k[7], 14, 1735328473);
	        b = gg(b, c, d, a, k[12], 20, -1926607734);
	
	        a = hh(a, b, c, d, k[5], 4, -378558);
	        d = hh(d, a, b, c, k[8], 11, -2022574463);
	        c = hh(c, d, a, b, k[11], 16, 1839030562);
	        b = hh(b, c, d, a, k[14], 23, -35309556);
	        a = hh(a, b, c, d, k[1], 4, -1530992060);
	        d = hh(d, a, b, c, k[4], 11, 1272893353);
	        c = hh(c, d, a, b, k[7], 16, -155497632);
	        b = hh(b, c, d, a, k[10], 23, -1094730640);
	        a = hh(a, b, c, d, k[13], 4, 681279174);
	        d = hh(d, a, b, c, k[0], 11, -358537222);
	        c = hh(c, d, a, b, k[3], 16, -722521979);
	        b = hh(b, c, d, a, k[6], 23, 76029189);
	        a = hh(a, b, c, d, k[9], 4, -640364487);
	        d = hh(d, a, b, c, k[12], 11, -421815835);
	        c = hh(c, d, a, b, k[15], 16, 530742520);
	        b = hh(b, c, d, a, k[2], 23, -995338651);
	
	        a = ii(a, b, c, d, k[0], 6, -198630844);
	        d = ii(d, a, b, c, k[7], 10, 1126891415);
	        c = ii(c, d, a, b, k[14], 15, -1416354905);
	        b = ii(b, c, d, a, k[5], 21, -57434055);
	        a = ii(a, b, c, d, k[12], 6, 1700485571);
	        d = ii(d, a, b, c, k[3], 10, -1894986606);
	        c = ii(c, d, a, b, k[10], 15, -1051523);
	        b = ii(b, c, d, a, k[1], 21, -2054922799);
	        a = ii(a, b, c, d, k[8], 6, 1873313359);
	        d = ii(d, a, b, c, k[15], 10, -30611744);
	        c = ii(c, d, a, b, k[6], 15, -1560198380);
	        b = ii(b, c, d, a, k[13], 21, 1309151649);
	        a = ii(a, b, c, d, k[4], 6, -145523070);
	        d = ii(d, a, b, c, k[11], 10, -1120210379);
	        c = ii(c, d, a, b, k[2], 15, 718787259);
	        b = ii(b, c, d, a, k[9], 21, -343485551);
	
	        x[0] = add32(a, x[0]);
	        x[1] = add32(b, x[1]);
	        x[2] = add32(c, x[2]);
	        x[3] = add32(d, x[3]);
	    }
	
	    function md5blk(s) {
	        var md5blks = [],
	            i; /* Andy King said do it this way. */
	
	        for (i = 0; i < 64; i += 4) {
	            md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
	        }
	        return md5blks;
	    }
	
	    function md5blk_array(a) {
	        var md5blks = [],
	            i; /* Andy King said do it this way. */
	
	        for (i = 0; i < 64; i += 4) {
	            md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
	        }
	        return md5blks;
	    }
	
	    function md51(s) {
	        var n = s.length,
	            state = [1732584193, -271733879, -1732584194, 271733878],
	            i,
	            length,
	            tail,
	            tmp,
	            lo,
	            hi;
	
	        for (i = 64; i <= n; i += 64) {
	            md5cycle(state, md5blk(s.substring(i - 64, i)));
	        }
	        s = s.substring(i - 64);
	        length = s.length;
	        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	        for (i = 0; i < length; i += 1) {
	            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
	        }
	        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
	        if (i > 55) {
	            md5cycle(state, tail);
	            for (i = 0; i < 16; i += 1) {
	                tail[i] = 0;
	            }
	        }
	
	        // Beware that the final length might not fit in 32 bits so we take care of that
	        tmp = n * 8;
	        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
	        lo = parseInt(tmp[2], 16);
	        hi = parseInt(tmp[1], 16) || 0;
	
	        tail[14] = lo;
	        tail[15] = hi;
	
	        md5cycle(state, tail);
	        return state;
	    }
	
	    function md51_array(a) {
	        var n = a.length,
	            state = [1732584193, -271733879, -1732584194, 271733878],
	            i,
	            length,
	            tail,
	            tmp,
	            lo,
	            hi;
	
	        for (i = 64; i <= n; i += 64) {
	            md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
	        }
	
	        // Not sure if it is a bug, however IE10 will always produce a sub array of length 1
	        // containing the last element of the parent array if the sub array specified starts
	        // beyond the length of the parent array - weird.
	        // https://connect.microsoft.com/IE/feedback/details/771452/typed-array-subarray-issue
	        a = (i - 64) < n ? a.subarray(i - 64) : new Uint8Array(0);
	
	        length = a.length;
	        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	        for (i = 0; i < length; i += 1) {
	            tail[i >> 2] |= a[i] << ((i % 4) << 3);
	        }
	
	        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
	        if (i > 55) {
	            md5cycle(state, tail);
	            for (i = 0; i < 16; i += 1) {
	                tail[i] = 0;
	            }
	        }
	
	        // Beware that the final length might not fit in 32 bits so we take care of that
	        tmp = n * 8;
	        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
	        lo = parseInt(tmp[2], 16);
	        hi = parseInt(tmp[1], 16) || 0;
	
	        tail[14] = lo;
	        tail[15] = hi;
	
	        md5cycle(state, tail);
	
	        return state;
	    }
	
	    function rhex(n) {
	        var s = '',
	            j;
	        for (j = 0; j < 4; j += 1) {
	            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
	        }
	        return s;
	    }
	
	    function hex(x) {
	        var i;
	        for (i = 0; i < x.length; i += 1) {
	            x[i] = rhex(x[i]);
	        }
	        return x.join('');
	    }
	
	    // In some cases the fast add32 function cannot be used..
	    if (hex(md51('hello')) !== '5d41402abc4b2a76b9719d911017c592') {
	        add32 = function (x, y) {
	            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
	                msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	            return (msw << 16) | (lsw & 0xFFFF);
	        };
	    }
	
	    // ---------------------------------------------------
	
	    /**
	     * ArrayBuffer slice polyfill.
	     *
	     * @see https://github.com/ttaubert/node-arraybuffer-slice
	     */
	
	    if (typeof ArrayBuffer !== 'undefined' && !ArrayBuffer.prototype.slice) {
	        (function () {
	            function clamp(val, length) {
	                val = (val | 0) || 0;
	
	                if (val < 0) {
	                    return Math.max(val + length, 0);
	                }
	
	                return Math.min(val, length);
	            }
	
	            ArrayBuffer.prototype.slice = function (from, to) {
	                var length = this.byteLength,
	                    begin = clamp(from, length),
	                    end = length,
	                    num,
	                    target,
	                    targetArray,
	                    sourceArray;
	
	                if (to !== undefined) {
	                    end = clamp(to, length);
	                }
	
	                if (begin > end) {
	                    return new ArrayBuffer(0);
	                }
	
	                num = end - begin;
	                target = new ArrayBuffer(num);
	                targetArray = new Uint8Array(target);
	
	                sourceArray = new Uint8Array(this, begin, num);
	                targetArray.set(sourceArray);
	
	                return target;
	            };
	        })();
	    }
	
	    // ---------------------------------------------------
	
	    /**
	     * Helpers.
	     */
	
	    function toUtf8(str) {
	        if (/[\u0080-\uFFFF]/.test(str)) {
	            str = unescape(encodeURIComponent(str));
	        }
	
	        return str;
	    }
	
	    function utf8Str2ArrayBuffer(str, returnUInt8Array) {
	        var length = str.length,
	           buff = new ArrayBuffer(length),
	           arr = new Uint8Array(buff),
	           i;
	
	        for (i = 0; i < length; i += 1) {
	            arr[i] = str.charCodeAt(i);
	        }
	
	        return returnUInt8Array ? arr : buff;
	    }
	
	    function arrayBuffer2Utf8Str(buff) {
	        return String.fromCharCode.apply(null, new Uint8Array(buff));
	    }
	
	    function concatenateArrayBuffers(first, second, returnUInt8Array) {
	        var result = new Uint8Array(first.byteLength + second.byteLength);
	
	        result.set(new Uint8Array(first));
	        result.set(new Uint8Array(second), first.byteLength);
	
	        return returnUInt8Array ? result : result.buffer;
	    }
	
	    function hexToBinaryString(hex) {
	        var bytes = [],
	            length = hex.length,
	            x;
	
	        for (x = 0; x < length - 1; x += 2) {
	            bytes.push(parseInt(hex.substr(x, 2), 16));
	        }
	
	        return String.fromCharCode.apply(String, bytes);
	    }
	
	    // ---------------------------------------------------
	
	    /**
	     * SparkMD5 OOP implementation.
	     *
	     * Use this class to perform an incremental md5, otherwise use the
	     * static methods instead.
	     */
	
	    function SparkMD5() {
	        // call reset to init the instance
	        this.reset();
	    }
	
	    /**
	     * Appends a string.
	     * A conversion will be applied if an utf8 string is detected.
	     *
	     * @param {String} str The string to be appended
	     *
	     * @return {SparkMD5} The instance itself
	     */
	    SparkMD5.prototype.append = function (str) {
	        // Converts the string to utf8 bytes if necessary
	        // Then append as binary
	        this.appendBinary(toUtf8(str));
	
	        return this;
	    };
	
	    /**
	     * Appends a binary string.
	     *
	     * @param {String} contents The binary string to be appended
	     *
	     * @return {SparkMD5} The instance itself
	     */
	    SparkMD5.prototype.appendBinary = function (contents) {
	        this._buff += contents;
	        this._length += contents.length;
	
	        var length = this._buff.length,
	            i;
	
	        for (i = 64; i <= length; i += 64) {
	            md5cycle(this._hash, md5blk(this._buff.substring(i - 64, i)));
	        }
	
	        this._buff = this._buff.substring(i - 64);
	
	        return this;
	    };
	
	    /**
	     * Finishes the incremental computation, reseting the internal state and
	     * returning the result.
	     *
	     * @param {Boolean} raw True to get the raw string, false to get the hex string
	     *
	     * @return {String} The result
	     */
	    SparkMD5.prototype.end = function (raw) {
	        var buff = this._buff,
	            length = buff.length,
	            i,
	            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	            ret;
	
	        for (i = 0; i < length; i += 1) {
	            tail[i >> 2] |= buff.charCodeAt(i) << ((i % 4) << 3);
	        }
	
	        this._finish(tail, length);
	        ret = hex(this._hash);
	
	        if (raw) {
	            ret = hexToBinaryString(ret);
	        }
	
	        this.reset();
	
	        return ret;
	    };
	
	    /**
	     * Resets the internal state of the computation.
	     *
	     * @return {SparkMD5} The instance itself
	     */
	    SparkMD5.prototype.reset = function () {
	        this._buff = '';
	        this._length = 0;
	        this._hash = [1732584193, -271733879, -1732584194, 271733878];
	
	        return this;
	    };
	
	    /**
	     * Gets the internal state of the computation.
	     *
	     * @return {Object} The state
	     */
	    SparkMD5.prototype.getState = function () {
	        return {
	            buff: this._buff,
	            length: this._length,
	            hash: this._hash
	        };
	    };
	
	    /**
	     * Gets the internal state of the computation.
	     *
	     * @param {Object} state The state
	     *
	     * @return {SparkMD5} The instance itself
	     */
	    SparkMD5.prototype.setState = function (state) {
	        this._buff = state.buff;
	        this._length = state.length;
	        this._hash = state.hash;
	
	        return this;
	    };
	
	    /**
	     * Releases memory used by the incremental buffer and other additional
	     * resources. If you plan to use the instance again, use reset instead.
	     */
	    SparkMD5.prototype.destroy = function () {
	        delete this._hash;
	        delete this._buff;
	        delete this._length;
	    };
	
	    /**
	     * Finish the final calculation based on the tail.
	     *
	     * @param {Array}  tail   The tail (will be modified)
	     * @param {Number} length The length of the remaining buffer
	     */
	    SparkMD5.prototype._finish = function (tail, length) {
	        var i = length,
	            tmp,
	            lo,
	            hi;
	
	        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
	        if (i > 55) {
	            md5cycle(this._hash, tail);
	            for (i = 0; i < 16; i += 1) {
	                tail[i] = 0;
	            }
	        }
	
	        // Do the final computation based on the tail and length
	        // Beware that the final length may not fit in 32 bits so we take care of that
	        tmp = this._length * 8;
	        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
	        lo = parseInt(tmp[2], 16);
	        hi = parseInt(tmp[1], 16) || 0;
	
	        tail[14] = lo;
	        tail[15] = hi;
	        md5cycle(this._hash, tail);
	    };
	
	    /**
	     * Performs the md5 hash on a string.
	     * A conversion will be applied if utf8 string is detected.
	     *
	     * @param {String}  str The string
	     * @param {Boolean} raw True to get the raw string, false to get the hex string
	     *
	     * @return {String} The result
	     */
	    SparkMD5.hash = function (str, raw) {
	        // Converts the string to utf8 bytes if necessary
	        // Then compute it using the binary function
	        return SparkMD5.hashBinary(toUtf8(str), raw);
	    };
	
	    /**
	     * Performs the md5 hash on a binary string.
	     *
	     * @param {String}  content The binary string
	     * @param {Boolean} raw     True to get the raw string, false to get the hex string
	     *
	     * @return {String} The result
	     */
	    SparkMD5.hashBinary = function (content, raw) {
	        var hash = md51(content),
	            ret = hex(hash);
	
	        return raw ? hexToBinaryString(ret) : ret;
	    };
	
	    // ---------------------------------------------------
	
	    /**
	     * SparkMD5 OOP implementation for array buffers.
	     *
	     * Use this class to perform an incremental md5 ONLY for array buffers.
	     */
	    SparkMD5.ArrayBuffer = function () {
	        // call reset to init the instance
	        this.reset();
	    };
	
	    /**
	     * Appends an array buffer.
	     *
	     * @param {ArrayBuffer} arr The array to be appended
	     *
	     * @return {SparkMD5.ArrayBuffer} The instance itself
	     */
	    SparkMD5.ArrayBuffer.prototype.append = function (arr) {
	        var buff = concatenateArrayBuffers(this._buff.buffer, arr, true),
	            length = buff.length,
	            i;
	
	        this._length += arr.byteLength;
	
	        for (i = 64; i <= length; i += 64) {
	            md5cycle(this._hash, md5blk_array(buff.subarray(i - 64, i)));
	        }
	
	        this._buff = (i - 64) < length ? new Uint8Array(buff.buffer.slice(i - 64)) : new Uint8Array(0);
	
	        return this;
	    };
	
	    /**
	     * Finishes the incremental computation, reseting the internal state and
	     * returning the result.
	     *
	     * @param {Boolean} raw True to get the raw string, false to get the hex string
	     *
	     * @return {String} The result
	     */
	    SparkMD5.ArrayBuffer.prototype.end = function (raw) {
	        var buff = this._buff,
	            length = buff.length,
	            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	            i,
	            ret;
	
	        for (i = 0; i < length; i += 1) {
	            tail[i >> 2] |= buff[i] << ((i % 4) << 3);
	        }
	
	        this._finish(tail, length);
	        ret = hex(this._hash);
	
	        if (raw) {
	            ret = hexToBinaryString(ret);
	        }
	
	        this.reset();
	
	        return ret;
	    };
	
	    /**
	     * Resets the internal state of the computation.
	     *
	     * @return {SparkMD5.ArrayBuffer} The instance itself
	     */
	    SparkMD5.ArrayBuffer.prototype.reset = function () {
	        this._buff = new Uint8Array(0);
	        this._length = 0;
	        this._hash = [1732584193, -271733879, -1732584194, 271733878];
	
	        return this;
	    };
	
	    /**
	     * Gets the internal state of the computation.
	     *
	     * @return {Object} The state
	     */
	    SparkMD5.ArrayBuffer.prototype.getState = function () {
	        var state = SparkMD5.prototype.getState.call(this);
	
	        // Convert buffer to a string
	        state.buff = arrayBuffer2Utf8Str(state.buff);
	
	        return state;
	    };
	
	    /**
	     * Gets the internal state of the computation.
	     *
	     * @param {Object} state The state
	     *
	     * @return {SparkMD5.ArrayBuffer} The instance itself
	     */
	    SparkMD5.ArrayBuffer.prototype.setState = function (state) {
	        // Convert string to buffer
	        state.buff = utf8Str2ArrayBuffer(state.buff, true);
	
	        return SparkMD5.prototype.setState.call(this, state);
	    };
	
	    SparkMD5.ArrayBuffer.prototype.destroy = SparkMD5.prototype.destroy;
	
	    SparkMD5.ArrayBuffer.prototype._finish = SparkMD5.prototype._finish;
	
	    /**
	     * Performs the md5 hash on an array buffer.
	     *
	     * @param {ArrayBuffer} arr The array buffer
	     * @param {Boolean}     raw True to get the raw string, false to get the hex one
	     *
	     * @return {String} The result
	     */
	    SparkMD5.ArrayBuffer.hash = function (arr, raw) {
	        var hash = md51_array(new Uint8Array(arr)),
	            ret = hex(hash);
	
	        return raw ? hexToBinaryString(ret) : ret;
	    };
	
	    return SparkMD5;
	}));


/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Stringify/parse functions that don't operate
	 * recursively, so they avoid call stack exceeded
	 * errors.
	 */
	exports.stringify = function stringify(input) {
	  var queue = [];
	  queue.push({obj: input});
	
	  var res = '';
	  var next, obj, prefix, val, i, arrayPrefix, keys, k, key, value, objPrefix;
	  while ((next = queue.pop())) {
	    obj = next.obj;
	    prefix = next.prefix || '';
	    val = next.val || '';
	    res += prefix;
	    if (val) {
	      res += val;
	    } else if (typeof obj !== 'object') {
	      res += typeof obj === 'undefined' ? null : JSON.stringify(obj);
	    } else if (obj === null) {
	      res += 'null';
	    } else if (Array.isArray(obj)) {
	      queue.push({val: ']'});
	      for (i = obj.length - 1; i >= 0; i--) {
	        arrayPrefix = i === 0 ? '' : ',';
	        queue.push({obj: obj[i], prefix: arrayPrefix});
	      }
	      queue.push({val: '['});
	    } else { // object
	      keys = [];
	      for (k in obj) {
	        if (obj.hasOwnProperty(k)) {
	          keys.push(k);
	        }
	      }
	      queue.push({val: '}'});
	      for (i = keys.length - 1; i >= 0; i--) {
	        key = keys[i];
	        value = obj[key];
	        objPrefix = (i > 0 ? ',' : '');
	        objPrefix += JSON.stringify(key) + ':';
	        queue.push({obj: value, prefix: objPrefix});
	      }
	      queue.push({val: '{'});
	    }
	  }
	  return res;
	};
	
	// Convenience function for the parse function.
	// This pop function is basically copied from
	// pouchCollate.parseIndexableString
	function pop(obj, stack, metaStack) {
	  var lastMetaElement = metaStack[metaStack.length - 1];
	  if (obj === lastMetaElement.element) {
	    // popping a meta-element, e.g. an object whose value is another object
	    metaStack.pop();
	    lastMetaElement = metaStack[metaStack.length - 1];
	  }
	  var element = lastMetaElement.element;
	  var lastElementIndex = lastMetaElement.index;
	  if (Array.isArray(element)) {
	    element.push(obj);
	  } else if (lastElementIndex === stack.length - 2) { // obj with key+value
	    var key = stack.pop();
	    element[key] = obj;
	  } else {
	    stack.push(obj); // obj with key only
	  }
	}
	
	exports.parse = function (str) {
	  var stack = [];
	  var metaStack = []; // stack for arrays and objects
	  var i = 0;
	  var collationIndex,parsedNum,numChar;
	  var parsedString,lastCh,numConsecutiveSlashes,ch;
	  var arrayElement, objElement;
	  while (true) {
	    collationIndex = str[i++];
	    if (collationIndex === '}' ||
	        collationIndex === ']' ||
	        typeof collationIndex === 'undefined') {
	      if (stack.length === 1) {
	        return stack.pop();
	      } else {
	        pop(stack.pop(), stack, metaStack);
	        continue;
	      }
	    }
	    switch (collationIndex) {
	      case ' ':
	      case '\t':
	      case '\n':
	      case ':':
	      case ',':
	        break;
	      case 'n':
	        i += 3; // 'ull'
	        pop(null, stack, metaStack);
	        break;
	      case 't':
	        i += 3; // 'rue'
	        pop(true, stack, metaStack);
	        break;
	      case 'f':
	        i += 4; // 'alse'
	        pop(false, stack, metaStack);
	        break;
	      case '0':
	      case '1':
	      case '2':
	      case '3':
	      case '4':
	      case '5':
	      case '6':
	      case '7':
	      case '8':
	      case '9':
	      case '-':
	        parsedNum = '';
	        i--;
	        while (true) {
	          numChar = str[i++];
	          if (/[\d\.\-e\+]/.test(numChar)) {
	            parsedNum += numChar;
	          } else {
	            i--;
	            break;
	          }
	        }
	        pop(parseFloat(parsedNum), stack, metaStack);
	        break;
	      case '"':
	        parsedString = '';
	        lastCh = void 0;
	        numConsecutiveSlashes = 0;
	        while (true) {
	          ch = str[i++];
	          if (ch !== '"' || (lastCh === '\\' &&
	              numConsecutiveSlashes % 2 === 1)) {
	            parsedString += ch;
	            lastCh = ch;
	            if (lastCh === '\\') {
	              numConsecutiveSlashes++;
	            } else {
	              numConsecutiveSlashes = 0;
	            }
	          } else {
	            break;
	          }
	        }
	        pop(JSON.parse('"' + parsedString + '"'), stack, metaStack);
	        break;
	      case '[':
	        arrayElement = { element: [], index: stack.length };
	        stack.push(arrayElement.element);
	        metaStack.push(arrayElement);
	        break;
	      case '{':
	        objElement = { element: {}, index: stack.length };
	        stack.push(objElement.element);
	        metaStack.push(objElement);
	        break;
	      default:
	        throw new Error(
	          'unexpectedly reached end of input: ' + collationIndex);
	    }
	  }
	};


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
	  /* istanbul ignore next */
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
	  } else if (typeof exports === 'object') {
	    module.exports = factory()
	  } else {
	    root.PromisePool = factory()
	    // Legacy API
	    root.promisePool = root.PromisePool
	  }
	})(this, function () {
	  'use strict'
	
	  var EventTarget = function () {
	    this._listeners = {}
	  }
	
	  EventTarget.prototype.addEventListener = function (type, listener) {
	    this._listeners[type] = this._listeners[type] || []
	    if (this._listeners[type].indexOf(listener) < 0) {
	      this._listeners[type].push(listener)
	    }
	  }
	
	  EventTarget.prototype.removeEventListener = function (type, listener) {
	    if (this._listeners[type]) {
	      var p = this._listeners[type].indexOf(listener)
	      if (p >= 0) {
	        this._listeners[type].splice(p, 1)
	      }
	    }
	  }
	
	  EventTarget.prototype.dispatchEvent = function (evt) {
	    if (this._listeners[evt.type] && this._listeners[evt.type].length) {
	      var listeners = this._listeners[evt.type].slice()
	      for (var i = 0, l = listeners.length; i < l; ++i) {
	        listeners[i].call(this, evt)
	      }
	    }
	  }
	
	  var isGenerator = function (func) {
	    return (typeof func.constructor === 'function' &&
	      func.constructor.name === 'GeneratorFunction')
	  }
	
	  var functionToIterator = function (func) {
	    return {
	      next: function () {
	        var promise = func()
	        return promise ? {value: promise} : {done: true}
	      }
	    }
	  }
	
	  var promiseToIterator = function (promise) {
	    var called = false
	    return {
	      next: function () {
	        if (called) {
	          return {done: true}
	        }
	        called = true
	        return {value: promise}
	      }
	    }
	  }
	
	  var toIterator = function (obj, Promise) {
	    var type = typeof obj
	    if (type === 'object') {
	      if (typeof obj.next === 'function') {
	        return obj
	      }
	      /* istanbul ignore else */
	      if (typeof obj.then === 'function') {
	        return promiseToIterator(obj)
	      }
	    }
	    if (type === 'function') {
	      return isGenerator(obj) ? obj() : functionToIterator(obj)
	    }
	    return promiseToIterator(Promise.resolve(obj))
	  }
	
	  var PromisePoolEvent = function (target, type, data) {
	    this.target = target
	    this.type = type
	    this.data = data
	  }
	
	  var PromisePool = function (source, concurrency, options) {
	    EventTarget.call(this)
	    if (typeof concurrency !== 'number' ||
	        Math.floor(concurrency) !== concurrency ||
	        concurrency < 1) {
	      throw new Error('Invalid concurrency')
	    }
	    this._concurrency = concurrency
	    this._options = options || {}
	    this._options.promise = this._options.promise || Promise
	    this._iterator = toIterator(source, this._options.promise)
	    this._done = false
	    this._size = 0
	    this._promise = null
	    this._callbacks = null
	  }
	  PromisePool.prototype = new EventTarget()
	  PromisePool.prototype.constructor = PromisePool
	
	  PromisePool.prototype.concurrency = function (value) {
	    if (typeof value !== 'undefined') {
	      this._concurrency = value
	      if (this.active()) {
	        this._proceed()
	      }
	    }
	    return this._concurrency
	  }
	
	  PromisePool.prototype.size = function () {
	    return this._size
	  }
	
	  PromisePool.prototype.active = function () {
	    return !!this._promise
	  }
	
	  PromisePool.prototype.promise = function () {
	    return this._promise
	  }
	
	  PromisePool.prototype.start = function () {
	    var that = this
	    var Promise = this._options.promise
	    this._promise = new Promise(function (resolve, reject) {
	      that._callbacks = {
	        reject: reject,
	        resolve: resolve
	      }
	      that._proceed()
	    })
	    return this._promise
	  }
	
	  PromisePool.prototype._fireEvent = function (type, data) {
	    this.dispatchEvent(new PromisePoolEvent(this, type, data))
	  }
	
	  PromisePool.prototype._settle = function (error) {
	    if (error) {
	      this._callbacks.reject(error)
	    } else {
	      this._callbacks.resolve()
	    }
	    this._promise = null
	    this._callbacks = null
	  }
	
	  PromisePool.prototype._onPooledPromiseFulfilled = function (promise, result) {
	    this._size--
	    if (this.active()) {
	      this._fireEvent('fulfilled', {
	        promise: promise,
	        result: result
	      })
	      this._proceed()
	    }
	  }
	
	  PromisePool.prototype._onPooledPromiseRejected = function (promise, error) {
	    this._size--
	    if (this.active()) {
	      this._fireEvent('rejected', {
	        promise: promise,
	        error: error
	      })
	      this._settle(error || new Error('Unknown error'))
	    }
	  }
	
	  PromisePool.prototype._trackPromise = function (promise) {
	    var that = this
	    promise
	      .then(function (result) {
	        that._onPooledPromiseFulfilled(promise, result)
	      }, function (error) {
	        that._onPooledPromiseRejected(promise, error)
	      })['catch'](function (err) {
	        that._settle(new Error('Promise processing failed: ' + err))
	      })
	  }
	
	  PromisePool.prototype._proceed = function () {
	    if (!this._done) {
	      var result = null
	      while (this._size < this._concurrency &&
	          !(result = this._iterator.next()).done) {
	        this._size++
	        this._trackPromise(result.value)
	      }
	      this._done = (result === null || !!result.done)
	    }
	    if (this._done && this._size === 0) {
	      this._settle()
	    }
	  }
	
	  PromisePool.PromisePoolEvent = PromisePoolEvent
	  // Legacy API
	  PromisePool.PromisePool = PromisePool
	
	  return PromisePool
	})


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var MIN_MAGNITUDE = -324; // verified by -Number.MIN_VALUE
	var MAGNITUDE_DIGITS = 3; // ditto
	var SEP = ''; // set to '_' for easier debugging 
	
	var utils = __webpack_require__(18);
	
	exports.collate = function (a, b) {
	
	  if (a === b) {
	    return 0;
	  }
	
	  a = exports.normalizeKey(a);
	  b = exports.normalizeKey(b);
	
	  var ai = collationIndex(a);
	  var bi = collationIndex(b);
	  if ((ai - bi) !== 0) {
	    return ai - bi;
	  }
	  if (a === null) {
	    return 0;
	  }
	  switch (typeof a) {
	    case 'number':
	      return a - b;
	    case 'boolean':
	      return a === b ? 0 : (a < b ? -1 : 1);
	    case 'string':
	      return stringCollate(a, b);
	  }
	  return Array.isArray(a) ? arrayCollate(a, b) : objectCollate(a, b);
	};
	
	// couch considers null/NaN/Infinity/-Infinity === undefined,
	// for the purposes of mapreduce indexes. also, dates get stringified.
	exports.normalizeKey = function (key) {
	  switch (typeof key) {
	    case 'undefined':
	      return null;
	    case 'number':
	      if (key === Infinity || key === -Infinity || isNaN(key)) {
	        return null;
	      }
	      return key;
	    case 'object':
	      var origKey = key;
	      if (Array.isArray(key)) {
	        var len = key.length;
	        key = new Array(len);
	        for (var i = 0; i < len; i++) {
	          key[i] = exports.normalizeKey(origKey[i]);
	        }
	      } else if (key instanceof Date) {
	        return key.toJSON();
	      } else if (key !== null) { // generic object
	        key = {};
	        for (var k in origKey) {
	          if (origKey.hasOwnProperty(k)) {
	            var val = origKey[k];
	            if (typeof val !== 'undefined') {
	              key[k] = exports.normalizeKey(val);
	            }
	          }
	        }
	      }
	  }
	  return key;
	};
	
	function indexify(key) {
	  if (key !== null) {
	    switch (typeof key) {
	      case 'boolean':
	        return key ? 1 : 0;
	      case 'number':
	        return numToIndexableString(key);
	      case 'string':
	        // We've to be sure that key does not contain \u0000
	        // Do order-preserving replacements:
	        // 0 -> 1, 1
	        // 1 -> 1, 2
	        // 2 -> 2, 2
	        return key
	          .replace(/\u0002/g, '\u0002\u0002')
	          .replace(/\u0001/g, '\u0001\u0002')
	          .replace(/\u0000/g, '\u0001\u0001');
	      case 'object':
	        var isArray = Array.isArray(key);
	        var arr = isArray ? key : Object.keys(key);
	        var i = -1;
	        var len = arr.length;
	        var result = '';
	        if (isArray) {
	          while (++i < len) {
	            result += exports.toIndexableString(arr[i]);
	          }
	        } else {
	          while (++i < len) {
	            var objKey = arr[i];
	            result += exports.toIndexableString(objKey) +
	                exports.toIndexableString(key[objKey]);
	          }
	        }
	        return result;
	    }
	  }
	  return '';
	}
	
	// convert the given key to a string that would be appropriate
	// for lexical sorting, e.g. within a database, where the
	// sorting is the same given by the collate() function.
	exports.toIndexableString = function (key) {
	  var zero = '\u0000';
	  key = exports.normalizeKey(key);
	  return collationIndex(key) + SEP + indexify(key) + zero;
	};
	
	function parseNumber(str, i) {
	  var originalIdx = i;
	  var num;
	  var zero = str[i] === '1';
	  if (zero) {
	    num = 0;
	    i++;
	  } else {
	    var neg = str[i] === '0';
	    i++;
	    var numAsString = '';
	    var magAsString = str.substring(i, i + MAGNITUDE_DIGITS);
	    var magnitude = parseInt(magAsString, 10) + MIN_MAGNITUDE;
	    if (neg) {
	      magnitude = -magnitude;
	    }
	    i += MAGNITUDE_DIGITS;
	    while (true) {
	      var ch = str[i];
	      if (ch === '\u0000') {
	        break;
	      } else {
	        numAsString += ch;
	      }
	      i++;
	    }
	    numAsString = numAsString.split('.');
	    if (numAsString.length === 1) {
	      num = parseInt(numAsString, 10);
	    } else {
	      num = parseFloat(numAsString[0] + '.' + numAsString[1]);
	    }
	    if (neg) {
	      num = num - 10;
	    }
	    if (magnitude !== 0) {
	      // parseFloat is more reliable than pow due to rounding errors
	      // e.g. Number.MAX_VALUE would return Infinity if we did
	      // num * Math.pow(10, magnitude);
	      num = parseFloat(num + 'e' + magnitude);
	    }
	  }
	  return {num: num, length : i - originalIdx};
	}
	
	// move up the stack while parsing
	// this function moved outside of parseIndexableString for performance
	function pop(stack, metaStack) {
	  var obj = stack.pop();
	
	  if (metaStack.length) {
	    var lastMetaElement = metaStack[metaStack.length - 1];
	    if (obj === lastMetaElement.element) {
	      // popping a meta-element, e.g. an object whose value is another object
	      metaStack.pop();
	      lastMetaElement = metaStack[metaStack.length - 1];
	    }
	    var element = lastMetaElement.element;
	    var lastElementIndex = lastMetaElement.index;
	    if (Array.isArray(element)) {
	      element.push(obj);
	    } else if (lastElementIndex === stack.length - 2) { // obj with key+value
	      var key = stack.pop();
	      element[key] = obj;
	    } else {
	      stack.push(obj); // obj with key only
	    }
	  }
	}
	
	exports.parseIndexableString = function (str) {
	  var stack = [];
	  var metaStack = []; // stack for arrays and objects
	  var i = 0;
	
	  while (true) {
	    var collationIndex = str[i++];
	    if (collationIndex === '\u0000') {
	      if (stack.length === 1) {
	        return stack.pop();
	      } else {
	        pop(stack, metaStack);
	        continue;
	      }
	    }
	    switch (collationIndex) {
	      case '1':
	        stack.push(null);
	        break;
	      case '2':
	        stack.push(str[i] === '1');
	        i++;
	        break;
	      case '3':
	        var parsedNum = parseNumber(str, i);
	        stack.push(parsedNum.num);
	        i += parsedNum.length;
	        break;
	      case '4':
	        var parsedStr = '';
	        while (true) {
	          var ch = str[i];
	          if (ch === '\u0000') {
	            break;
	          }
	          parsedStr += ch;
	          i++;
	        }
	        // perform the reverse of the order-preserving replacement
	        // algorithm (see above)
	        parsedStr = parsedStr.replace(/\u0001\u0001/g, '\u0000')
	          .replace(/\u0001\u0002/g, '\u0001')
	          .replace(/\u0002\u0002/g, '\u0002');
	        stack.push(parsedStr);
	        break;
	      case '5':
	        var arrayElement = { element: [], index: stack.length };
	        stack.push(arrayElement.element);
	        metaStack.push(arrayElement);
	        break;
	      case '6':
	        var objElement = { element: {}, index: stack.length };
	        stack.push(objElement.element);
	        metaStack.push(objElement);
	        break;
	      default:
	        throw new Error(
	          'bad collationIndex or unexpectedly reached end of input: ' + collationIndex);
	    }
	  }
	};
	
	function arrayCollate(a, b) {
	  var len = Math.min(a.length, b.length);
	  for (var i = 0; i < len; i++) {
	    var sort = exports.collate(a[i], b[i]);
	    if (sort !== 0) {
	      return sort;
	    }
	  }
	  return (a.length === b.length) ? 0 :
	    (a.length > b.length) ? 1 : -1;
	}
	function stringCollate(a, b) {
	  // See: https://github.com/daleharvey/pouchdb/issues/40
	  // This is incompatible with the CouchDB implementation, but its the
	  // best we can do for now
	  return (a === b) ? 0 : ((a > b) ? 1 : -1);
	}
	function objectCollate(a, b) {
	  var ak = Object.keys(a), bk = Object.keys(b);
	  var len = Math.min(ak.length, bk.length);
	  for (var i = 0; i < len; i++) {
	    // First sort the keys
	    var sort = exports.collate(ak[i], bk[i]);
	    if (sort !== 0) {
	      return sort;
	    }
	    // if the keys are equal sort the values
	    sort = exports.collate(a[ak[i]], b[bk[i]]);
	    if (sort !== 0) {
	      return sort;
	    }
	
	  }
	  return (ak.length === bk.length) ? 0 :
	    (ak.length > bk.length) ? 1 : -1;
	}
	// The collation is defined by erlangs ordered terms
	// the atoms null, true, false come first, then numbers, strings,
	// arrays, then objects
	// null/undefined/NaN/Infinity/-Infinity are all considered null
	function collationIndex(x) {
	  var id = ['boolean', 'number', 'string', 'object'];
	  var idx = id.indexOf(typeof x);
	  //false if -1 otherwise true, but fast!!!!1
	  if (~idx) {
	    if (x === null) {
	      return 1;
	    }
	    if (Array.isArray(x)) {
	      return 5;
	    }
	    return idx < 3 ? (idx + 2) : (idx + 3);
	  }
	  if (Array.isArray(x)) {
	    return 5;
	  }
	}
	
	// conversion:
	// x yyy zz...zz
	// x = 0 for negative, 1 for 0, 2 for positive
	// y = exponent (for negative numbers negated) moved so that it's >= 0
	// z = mantisse
	function numToIndexableString(num) {
	
	  if (num === 0) {
	    return '1';
	  }
	
	  // convert number to exponential format for easier and
	  // more succinct string sorting
	  var expFormat = num.toExponential().split(/e\+?/);
	  var magnitude = parseInt(expFormat[1], 10);
	
	  var neg = num < 0;
	
	  var result = neg ? '0' : '2';
	
	  // first sort by magnitude
	  // it's easier if all magnitudes are positive
	  var magForComparison = ((neg ? -magnitude : magnitude) - MIN_MAGNITUDE);
	  var magString = utils.padLeft((magForComparison).toString(), '0', MAGNITUDE_DIGITS);
	
	  result += SEP + magString;
	
	  // then sort by the factor
	  var factor = Math.abs(parseFloat(expFormat[0])); // [1..10)
	  if (neg) { // for negative reverse ordering
	    factor = 10 - factor;
	  }
	
	  var factorStr = factor.toFixed(20);
	
	  // strip zeros from the end
	  factorStr = factorStr.replace(/\.?0+$/, '');
	
	  result += SEP + factorStr;
	
	  return result;
	}


/***/ },
/* 18 */
/***/ function(module, exports) {

	'use strict';
	
	function pad(str, padWith, upToLength) {
	  var padding = '';
	  var targetLength = upToLength - str.length;
	  while (padding.length < targetLength) {
	    padding += padWith;
	  }
	  return padding;
	}
	
	exports.padLeft = function (str, padWith, upToLength) {
	  var padding = pad(str, padWith, upToLength);
	  return padding + str;
	};
	
	exports.padRight = function (str, padWith, upToLength) {
	  var padding = pad(str, padWith, upToLength);
	  return str + padding;
	};
	
	exports.stringLexCompare = function (a, b) {
	
	  var aLen = a.length;
	  var bLen = b.length;
	
	  var i;
	  for (i = 0; i < aLen; i++) {
	    if (i === bLen) {
	      // b is shorter substring of a
	      return 1;
	    }
	    var aChar = a.charAt(i);
	    var bChar = b.charAt(i);
	    if (aChar !== bChar) {
	      return aChar < bChar ? -1 : 1;
	    }
	  }
	
	  if (aLen < bLen) {
	    // a is shorter substring of b
	    return -1;
	  }
	
	  return 0;
	};
	
	/*
	 * returns the decimal form for the given integer, i.e. writes
	 * out all the digits (in base-10) instead of using scientific notation
	 */
	exports.intToDecimalForm = function (int) {
	
	  var isNeg = int < 0;
	  var result = '';
	
	  do {
	    var remainder = isNeg ? -Math.ceil(int % 10) : Math.floor(int % 10);
	
	    result = remainder + result;
	    int = isNeg ? Math.ceil(int / 10) : Math.floor(int / 10);
	  } while (int);
	
	
	  if (isNeg && result !== '0') {
	    result = '-' + result;
	  }
	
	  return result;
	};

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/*!
	 * Vue.js v2.0.0-beta.6
	 * (c) 2014-2016 Evan You
	 * Released under the MIT License.
	 */
	(function (global, factory) {
	   true ? module.exports = factory() :
	  typeof define === 'function' && define.amd ? define(factory) :
	  (global.Vue = factory());
	}(this, function () { 'use strict';
	
	  /**
	   * Convert a value to a string that is actually rendered.
	   */
	  function _toString(val) {
	    return val == null ? '' : typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
	  }
	
	  /**
	   * Convert a input value to a number for persistence.
	   * If the conversion fails, return original string.
	   */
	  function toNumber(val) {
	    var n = parseFloat(val, 10);
	    return n || n === 0 ? n : val;
	  }
	
	  /**
	   * Make a map and return a function for checking if a key
	   * is in that map.
	   */
	  function makeMap(str, expectsLowerCase) {
	    var map = Object.create(null);
	    var list = str.split(',');
	    for (var i = 0; i < list.length; i++) {
	      map[list[i]] = true;
	    }
	    return expectsLowerCase ? function (val) {
	      return map[val.toLowerCase()];
	    } : function (val) {
	      return map[val];
	    };
	  }
	
	  /**
	   * Check if a tag is a built-in tag.
	   */
	  var isBuiltInTag = makeMap('slot,component', true);
	
	  /**
	   * Remove an item from an array
	   */
	  function remove(arr, item) {
	    if (arr.length) {
	      var index = arr.indexOf(item);
	      if (index > -1) {
	        return arr.splice(index, 1);
	      }
	    }
	  }
	
	  /**
	   * Check whether the object has the property.
	   */
	  var hasOwnProperty = Object.prototype.hasOwnProperty;
	  function hasOwn(obj, key) {
	    return hasOwnProperty.call(obj, key);
	  }
	
	  /**
	   * Check if value is primitive
	   */
	  function isPrimitive(value) {
	    return typeof value === 'string' || typeof value === 'number';
	  }
	
	  /**
	   * Create a cached version of a pure function.
	   */
	  function cached(fn) {
	    var cache = Object.create(null);
	    return function cachedFn(str) {
	      var hit = cache[str];
	      return hit || (cache[str] = fn(str));
	    };
	  }
	
	  /**
	   * Camelize a hyphen-delmited string.
	   */
	  var camelizeRE = /-(\w)/g;
	  var camelize = cached(function (str) {
	    return str.replace(camelizeRE, function (_, c) {
	      return c ? c.toUpperCase() : '';
	    });
	  });
	
	  /**
	   * Capitalize a string.
	   */
	  var capitalize = cached(function (str) {
	    return str.charAt(0).toUpperCase() + str.slice(1);
	  });
	
	  /**
	   * Hyphenate a camelCase string.
	   */
	  var hyphenateRE = /([^-])([A-Z])/g;
	  var hyphenate = cached(function (str) {
	    return str.replace(hyphenateRE, '$1-$2').replace(hyphenateRE, '$1-$2').toLowerCase();
	  });
	
	  /**
	   * Simple bind, faster than native
	   */
	  function bind(fn, ctx) {
	    function boundFn(a) {
	      var l = arguments.length;
	      return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
	    }
	    // record original fn length
	    boundFn._length = fn.length;
	    return boundFn;
	  }
	
	  /**
	   * Convert an Array-like object to a real Array.
	   */
	  function toArray(list, start) {
	    start = start || 0;
	    var i = list.length - start;
	    var ret = new Array(i);
	    while (i--) {
	      ret[i] = list[i + start];
	    }
	    return ret;
	  }
	
	  /**
	   * Mix properties into target object.
	   */
	  function extend(to, _from) {
	    for (var _key in _from) {
	      to[_key] = _from[_key];
	    }
	    return to;
	  }
	
	  /**
	   * Quick object check - this is primarily used to tell
	   * Objects from primitive values when we know the value
	   * is a JSON-compliant type.
	   */
	  function isObject(obj) {
	    return obj !== null && typeof obj === 'object';
	  }
	
	  /**
	   * Strict object type check. Only returns true
	   * for plain JavaScript objects.
	   */
	  var toString = Object.prototype.toString;
	  var OBJECT_STRING = '[object Object]';
	  function isPlainObject(obj) {
	    return toString.call(obj) === OBJECT_STRING;
	  }
	
	  /**
	   * Merge an Array of Objects into a single Object.
	   */
	  function toObject(arr) {
	    var res = arr[0] || {};
	    for (var i = 1; i < arr.length; i++) {
	      if (arr[i]) {
	        extend(res, arr[i]);
	      }
	    }
	    return res;
	  }
	
	  /**
	   * Perform no operation.
	   */
	  function noop() {}
	
	  /**
	   * Always return false.
	   */
	  var no = function no() {
	    return false;
	  };
	
	  /**
	   * Generate a static keys string from compiler modules.
	   */
	  function genStaticKeys(modules) {
	    return modules.reduce(function (keys, m) {
	      return keys.concat(m.staticKeys || []);
	    }, []).join(',');
	  }
	
	  var config = {
	    /**
	     * Option merge strategies (used in core/util/options)
	     */
	    optionMergeStrategies: Object.create(null),
	
	    /**
	     * Whether to suppress warnings.
	     */
	    silent: false,
	
	    /**
	     * Whether to enable devtools
	     */
	    devtools: "development" !== 'production',
	
	    /**
	     * Error handler for watcher errors
	     */
	    errorHandler: null,
	
	    /**
	     * Ignore certain custom elements
	     */
	    ignoredElements: null,
	
	    /**
	     * Custom user key aliases for v-on
	     */
	    keyCodes: Object.create(null),
	
	    /**
	     * Check if a tag is reserved so that it cannot be registered as a
	     * component. This is platform-dependent and may be overwritten.
	     */
	    isReservedTag: no,
	
	    /**
	     * Check if a tag is an unknown element.
	     * Platform-dependent.
	     */
	    isUnknownElement: no,
	
	    /**
	     * Get the namespace of an element
	     */
	    getTagNamespace: noop,
	
	    /**
	     * Check if an attribute must be bound using property, e.g. value
	     * Platform-dependent.
	     */
	    mustUseProp: no,
	
	    /**
	     * List of asset types that a component can own.
	     */
	    _assetTypes: ['component', 'directive', 'filter'],
	
	    /**
	     * List of lifecycle hooks.
	     */
	    _lifecycleHooks: ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed', 'activated', 'deactivated'],
	
	    /**
	     * Max circular updates allowed in a scheduler flush cycle.
	     */
	    _maxUpdateCount: 100,
	
	    /**
	     * Server rendering?
	     */
	    _isServer: "client" === 'server'
	  };
	
	  /**
	   * Check if a string starts with $ or _
	   */
	  function isReserved(str) {
	    var c = (str + '').charCodeAt(0);
	    return c === 0x24 || c === 0x5F;
	  }
	
	  /**
	   * Define a property.
	   */
	  function def(obj, key, val, enumerable) {
	    Object.defineProperty(obj, key, {
	      value: val,
	      enumerable: !!enumerable,
	      writable: true,
	      configurable: true
	    });
	  }
	
	  /**
	   * Parse simple path.
	   */
	  var bailRE = /[^\w\.\$]/;
	  function parsePath(path) {
	    if (bailRE.test(path)) {
	      return;
	    } else {
	      var _ret = function () {
	        var segments = path.split('.');
	        return {
	          v: function v(obj) {
	            for (var i = 0; i < segments.length; i++) {
	              if (!obj) return;
	              obj = obj[segments[i]];
	            }
	            return obj;
	          }
	        };
	      }();
	
	      if (typeof _ret === "object") return _ret.v;
	    }
	  }
	
	  /* global MutationObserver */
	  // can we use __proto__?
	  var hasProto = '__proto__' in {};
	
	  // Browser environment sniffing
	  var inBrowser = typeof window !== 'undefined' && Object.prototype.toString.call(window) !== '[object Object]';
	
	  // detect devtools
	  var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
	
	  // UA sniffing for working around browser-specific quirks
	  var UA = inBrowser && window.navigator.userAgent.toLowerCase();
	  var isIos = UA && /(iphone|ipad|ipod|ios)/i.test(UA);
	  var iosVersionMatch = UA && isIos && UA.match(/os ([\d_]+)/);
	  var iosVersion = iosVersionMatch && iosVersionMatch[1].split('_');
	
	  // MutationObserver is unreliable in iOS 9.3 UIWebView
	  // detecting it by checking presence of IndexedDB
	  // ref #3027
	  var hasMutationObserverBug = iosVersion && Number(iosVersion[0]) >= 9 && Number(iosVersion[1]) >= 3 && !window.indexedDB;
	
	  /**
	   * Defer a task to execute it asynchronously. Ideally this
	   * should be executed as a microtask, so we leverage
	   * MutationObserver if it's available, and fallback to
	   * setTimeout(0).
	   *
	   * @param {Function} cb
	   * @param {Object} ctx
	   */
	  var nextTick = function () {
	    var callbacks = [];
	    var pending = false;
	    var timerFunc = void 0;
	    function nextTickHandler() {
	      pending = false;
	      var copies = callbacks.slice(0);
	      callbacks = [];
	      for (var i = 0; i < copies.length; i++) {
	        copies[i]();
	      }
	    }
	
	    /* istanbul ignore else */
	    if (typeof MutationObserver !== 'undefined' && !hasMutationObserverBug) {
	      (function () {
	        var counter = 1;
	        var observer = new MutationObserver(nextTickHandler);
	        var textNode = document.createTextNode(String(counter));
	        observer.observe(textNode, {
	          characterData: true
	        });
	        timerFunc = function timerFunc() {
	          counter = (counter + 1) % 2;
	          textNode.data = String(counter);
	        };
	      })();
	    } else {
	      // webpack attempts to inject a shim for setImmediate
	      // if it is used as a global, so we have to work around that to
	      // avoid bundling unnecessary code.
	      var context = inBrowser ? window : typeof global !== 'undefined' ? global : {};
	      timerFunc = context.setImmediate || setTimeout;
	    }
	    return function (cb, ctx) {
	      var func = ctx ? function () {
	        cb.call(ctx);
	      } : cb;
	      callbacks.push(func);
	      if (pending) return;
	      pending = true;
	      timerFunc(nextTickHandler, 0);
	    };
	  }();
	
	  var _Set = void 0;
	  /* istanbul ignore if */
	  if (typeof Set !== 'undefined' && /native code/.test(Set.toString())) {
	    // use native Set when available.
	    _Set = Set;
	  } else {
	    // a non-standard Set polyfill that only works with primitive keys.
	    _Set = function () {
	      function Set() {
	        this.set = Object.create(null);
	      }
	
	      Set.prototype.has = function has(key) {
	        return this.set[key] !== undefined;
	      };
	
	      Set.prototype.add = function add(key) {
	        this.set[key] = 1;
	      };
	
	      Set.prototype.clear = function clear() {
	        this.set = Object.create(null);
	      };
	
	      return Set;
	    }();
	  }
	
	  var hasProxy = void 0;
	  var proxyHandlers = void 0;
	  var initProxy = void 0;
	  if (true) {
	    (function () {
	      var allowedGlobals = makeMap('Infinity,undefined,NaN,isFinite,isNaN,' + 'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' + 'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' + 'require,__webpack_require__' // for Webpack/Browserify
	      );
	
	      hasProxy = typeof Proxy !== 'undefined' && Proxy.toString().match(/native code/);
	
	      proxyHandlers = {
	        has: function has(target, key) {
	          var has = key in target;
	          var isAllowedGlobal = allowedGlobals(key);
	          if (!has && !isAllowedGlobal) {
	            warn('Trying to access non-existent property "' + key + '" while rendering. ' + 'Make sure to declare reactive data properties in the data option.', target);
	          }
	          return !isAllowedGlobal;
	        }
	      };
	
	      initProxy = function initProxy(vm) {
	        if (hasProxy) {
	          vm._renderProxy = new Proxy(vm, proxyHandlers);
	        } else {
	          vm._renderProxy = vm;
	        }
	      };
	    })();
	  }
	
	  var uid$2 = 0;
	
	  /**
	   * A dep is an observable that can have multiple
	   * directives subscribing to it.
	   */
	
	  var Dep = function () {
	    function Dep() {
	      this.id = uid$2++;
	      this.subs = [];
	    }
	
	    Dep.prototype.addSub = function addSub(sub) {
	      this.subs.push(sub);
	    };
	
	    Dep.prototype.removeSub = function removeSub(sub) {
	      remove(this.subs, sub);
	    };
	
	    Dep.prototype.depend = function depend() {
	      if (Dep.target) {
	        Dep.target.addDep(this);
	      }
	    };
	
	    Dep.prototype.notify = function notify() {
	      // stablize the subscriber list first
	      var subs = this.subs.slice();
	      for (var i = 0, l = subs.length; i < l; i++) {
	        subs[i].update();
	      }
	    };
	
	    return Dep;
	  }();
	
	  Dep.target = null;
	  var targetStack = [];
	
	  function pushTarget(_target) {
	    if (Dep.target) targetStack.push(Dep.target);
	    Dep.target = _target;
	  }
	
	  function popTarget() {
	    Dep.target = targetStack.pop();
	  }
	
	  var queue = [];
	  var has = {};
	  var circular = {};
	  var waiting = false;
	  var flushing = false;
	  var index = 0;
	
	  /**
	   * Reset the scheduler's state.
	   */
	  function resetSchedulerState() {
	    queue.length = 0;
	    has = {};
	    if (true) {
	      circular = {};
	    }
	    waiting = flushing = false;
	  }
	
	  /**
	   * Flush both queues and run the watchers.
	   */
	  function flushSchedulerQueue() {
	    flushing = true;
	
	    // Sort queue before flush.
	    // This ensures that:
	    // 1. Components are updated from parent to child. (because parent is always
	    //    created before the child)
	    // 2. A component's user watchers are run before its render watcher (because
	    //    user watchers are created before the render watcher)
	    // 3. If a component is destroyed during a parent component's watcher run,
	    //    its watchers can be skipped.
	    queue.sort(function (a, b) {
	      return a.id - b.id;
	    });
	
	    // do not cache length because more watchers might be pushed
	    // as we run existing watchers
	    for (index = 0; index < queue.length; index++) {
	      var watcher = queue[index];
	      var id = watcher.id;
	      has[id] = null;
	      watcher.run();
	      // in dev build, check and stop circular updates.
	      if ("development" !== 'production' && has[id] != null) {
	        circular[id] = (circular[id] || 0) + 1;
	        if (circular[id] > config._maxUpdateCount) {
	          warn('You may have an infinite update loop ' + (watcher.user ? 'in watcher with expression "' + watcher.expression + '"' : 'in a component render function.'), watcher.vm);
	          break;
	        }
	      }
	    }
	
	    // devtool hook
	    /* istanbul ignore if */
	    if (devtools && config.devtools) {
	      devtools.emit('flush');
	    }
	
	    resetSchedulerState();
	  }
	
	  /**
	   * Push a watcher into the watcher queue.
	   * Jobs with duplicate IDs will be skipped unless it's
	   * pushed when the queue is being flushed.
	   */
	  function queueWatcher(watcher) {
	    var id = watcher.id;
	    if (has[id] == null) {
	      has[id] = true;
	      if (!flushing) {
	        queue.push(watcher);
	      } else {
	        // if already flushing, splice the watcher based on its id
	        // if already past its id, it will be run next immediately.
	        var i = queue.length - 1;
	        while (i >= 0 && queue[i].id > watcher.id) {
	          i--;
	        }
	        queue.splice(Math.max(i, index) + 1, 0, watcher);
	      }
	      // queue the flush
	      if (!waiting) {
	        waiting = true;
	        nextTick(flushSchedulerQueue);
	      }
	    }
	  }
	
	  var uid$1 = 0;
	
	  /**
	   * A watcher parses an expression, collects dependencies,
	   * and fires callback when the expression value changes.
	   * This is used for both the $watch() api and directives.
	   */
	
	  var Watcher = function () {
	    function Watcher(vm, expOrFn, cb) {
	      var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
	
	      this.vm = vm;
	      vm._watchers.push(this);
	      // options
	      this.deep = !!options.deep;
	      this.user = !!options.user;
	      this.lazy = !!options.lazy;
	      this.sync = !!options.sync;
	      this.expression = expOrFn.toString();
	      this.cb = cb;
	      this.id = ++uid$1; // uid for batching
	      this.active = true;
	      this.dirty = this.lazy; // for lazy watchers
	      this.deps = [];
	      this.newDeps = [];
	      this.depIds = new _Set();
	      this.newDepIds = new _Set();
	      // parse expression for getter
	      if (typeof expOrFn === 'function') {
	        this.getter = expOrFn;
	      } else {
	        this.getter = parsePath(expOrFn);
	        if (!this.getter) {
	          this.getter = function () {};
	          "development" !== 'production' && warn('Failed watching path: "' + expOrFn + '" ' + 'Watcher only accepts simple dot-delimited paths. ' + 'For full control, use a function instead.', vm);
	        }
	      }
	      this.value = this.lazy ? undefined : this.get();
	    }
	
	    /**
	     * Evaluate the getter, and re-collect dependencies.
	     */
	
	
	    Watcher.prototype.get = function get() {
	      pushTarget(this);
	      var value = this.getter.call(this.vm, this.vm);
	      // "touch" every property so they are all tracked as
	      // dependencies for deep watching
	      if (this.deep) {
	        traverse(value);
	      }
	      popTarget();
	      this.cleanupDeps();
	      return value;
	    };
	
	    /**
	     * Add a dependency to this directive.
	     */
	
	
	    Watcher.prototype.addDep = function addDep(dep) {
	      var id = dep.id;
	      if (!this.newDepIds.has(id)) {
	        this.newDepIds.add(id);
	        this.newDeps.push(dep);
	        if (!this.depIds.has(id)) {
	          dep.addSub(this);
	        }
	      }
	    };
	
	    /**
	     * Clean up for dependency collection.
	     */
	
	
	    Watcher.prototype.cleanupDeps = function cleanupDeps() {
	      var i = this.deps.length;
	      while (i--) {
	        var dep = this.deps[i];
	        if (!this.newDepIds.has(dep.id)) {
	          dep.removeSub(this);
	        }
	      }
	      var tmp = this.depIds;
	      this.depIds = this.newDepIds;
	      this.newDepIds = tmp;
	      this.newDepIds.clear();
	      tmp = this.deps;
	      this.deps = this.newDeps;
	      this.newDeps = tmp;
	      this.newDeps.length = 0;
	    };
	
	    /**
	     * Subscriber interface.
	     * Will be called when a dependency changes.
	     */
	
	
	    Watcher.prototype.update = function update() {
	      /* istanbul ignore else */
	      if (this.lazy) {
	        this.dirty = true;
	      } else if (this.sync) {
	        this.run();
	      } else {
	        queueWatcher(this);
	      }
	    };
	
	    /**
	     * Scheduler job interface.
	     * Will be called by the scheduler.
	     */
	
	
	    Watcher.prototype.run = function run() {
	      if (this.active) {
	        var value = this.get();
	        if (value !== this.value ||
	        // Deep watchers and watchers on Object/Arrays should fire even
	        // when the value is the same, because the value may
	        // have mutated.
	        isObject(value) || this.deep) {
	          // set new value
	          var oldValue = this.value;
	          this.value = value;
	          if (this.user) {
	            try {
	              this.cb.call(this.vm, value, oldValue);
	            } catch (e) {
	              "development" !== 'production' && warn('Error in watcher "' + this.expression + '"', this.vm);
	              /* istanbul ignore else */
	              if (config.errorHandler) {
	                config.errorHandler.call(null, e, this.vm);
	              } else {
	                throw e;
	              }
	            }
	          } else {
	            this.cb.call(this.vm, value, oldValue);
	          }
	        }
	      }
	    };
	
	    /**
	     * Evaluate the value of the watcher.
	     * This only gets called for lazy watchers.
	     */
	
	
	    Watcher.prototype.evaluate = function evaluate() {
	      this.value = this.get();
	      this.dirty = false;
	    };
	
	    /**
	     * Depend on all deps collected by this watcher.
	     */
	
	
	    Watcher.prototype.depend = function depend() {
	      var i = this.deps.length;
	      while (i--) {
	        this.deps[i].depend();
	      }
	    };
	
	    /**
	     * Remove self from all dependencies' subcriber list.
	     */
	
	
	    Watcher.prototype.teardown = function teardown() {
	      if (this.active) {
	        // remove self from vm's watcher list
	        // this is a somewhat expensive operation so we skip it
	        // if the vm is being destroyed or is performing a v-for
	        // re-render (the watcher list is then filtered by v-for).
	        if (!this.vm._isBeingDestroyed && !this.vm._vForRemoving) {
	          remove(this.vm._watchers, this);
	        }
	        var i = this.deps.length;
	        while (i--) {
	          this.deps[i].removeSub(this);
	        }
	        this.active = false;
	      }
	    };
	
	    return Watcher;
	  }();
	
	  var seenObjects = new _Set();
	  function traverse(val, seen) {
	    var i = void 0,
	        keys = void 0;
	    if (!seen) {
	      seen = seenObjects;
	      seen.clear();
	    }
	    var isA = Array.isArray(val);
	    var isO = isObject(val);
	    if ((isA || isO) && Object.isExtensible(val)) {
	      if (val.__ob__) {
	        var depId = val.__ob__.dep.id;
	        if (seen.has(depId)) {
	          return;
	        } else {
	          seen.add(depId);
	        }
	      }
	      if (isA) {
	        i = val.length;
	        while (i--) {
	          traverse(val[i], seen);
	        }
	      } else if (isO) {
	        keys = Object.keys(val);
	        i = keys.length;
	        while (i--) {
	          traverse(val[keys[i]], seen);
	        }
	      }
	    }
	  }
	
	  var arrayProto = Array.prototype;
	  var arrayMethods = Object.create(arrayProto)
	
	  /**
	   * Intercept mutating methods and emit events
	   */
	  ;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
	    // cache original method
	    var original = arrayProto[method];
	    def(arrayMethods, method, function mutator() {
	      // avoid leaking arguments:
	      // http://jsperf.com/closure-with-arguments
	      var i = arguments.length;
	      var args = new Array(i);
	      while (i--) {
	        args[i] = arguments[i];
	      }
	      var result = original.apply(this, args);
	      var ob = this.__ob__;
	      var inserted = void 0;
	      switch (method) {
	        case 'push':
	          inserted = args;
	          break;
	        case 'unshift':
	          inserted = args;
	          break;
	        case 'splice':
	          inserted = args.slice(2);
	          break;
	      }
	      if (inserted) ob.observeArray(inserted);
	      // notify change
	      ob.dep.notify();
	      return result;
	    });
	  });
	
	  var arrayKeys = Object.getOwnPropertyNames(arrayMethods);
	
	  /**
	   * By default, when a reactive property is set, the new value is
	   * also converted to become reactive. However when passing down props,
	   * we don't want to force conversion because the value may be a nested value
	   * under a frozen data structure. Converting it would defeat the optimization.
	   */
	  var observerState = {
	    shouldConvert: true,
	    isSettingProps: false
	  };
	
	  /**
	   * Observer class that are attached to each observed
	   * object. Once attached, the observer converts target
	   * object's property keys into getter/setters that
	   * collect dependencies and dispatches updates.
	   */
	  var Observer = function () {
	    // number of vms that has this object as root $data
	
	    function Observer(value) {
	      this.value = value;
	      this.dep = new Dep();
	      this.vmCount = 0;
	      def(value, '__ob__', this);
	      if (Array.isArray(value)) {
	        var augment = hasProto ? protoAugment : copyAugment;
	        augment(value, arrayMethods, arrayKeys);
	        this.observeArray(value);
	      } else {
	        this.walk(value);
	      }
	    }
	
	    /**
	     * Walk through each property and convert them into
	     * getter/setters. This method should only be called when
	     * value type is Object.
	     */
	
	
	    Observer.prototype.walk = function walk(obj) {
	      var val = this.value;
	      for (var key in obj) {
	        defineReactive(val, key, obj[key]);
	      }
	    };
	
	    /**
	     * Observe a list of Array items.
	     */
	
	
	    Observer.prototype.observeArray = function observeArray(items) {
	      for (var i = 0, l = items.length; i < l; i++) {
	        observe(items[i]);
	      }
	    };
	
	    return Observer;
	  }();
	
	  // helpers
	
	  /**
	   * Augment an target Object or Array by intercepting
	   * the prototype chain using __proto__
	   */
	  function protoAugment(target, src) {
	    /* eslint-disable no-proto */
	    target.__proto__ = src;
	    /* eslint-enable no-proto */
	  }
	
	  /**
	   * Augment an target Object or Array by defining
	   * hidden properties.
	   *
	   * istanbul ignore next
	   */
	  function copyAugment(target, src, keys) {
	    for (var i = 0, l = keys.length; i < l; i++) {
	      var key = keys[i];
	      def(target, key, src[key]);
	    }
	  }
	
	  /**
	   * Attempt to create an observer instance for a value,
	   * returns the new observer if successfully observed,
	   * or the existing observer if the value already has one.
	   */
	  function observe(value) {
	    if (!isObject(value)) {
	      return;
	    }
	    var ob = void 0;
	    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
	      ob = value.__ob__;
	    } else if (observerState.shouldConvert && !config._isServer && (Array.isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue) {
	      ob = new Observer(value);
	    }
	    return ob;
	  }
	
	  /**
	   * Define a reactive property on an Object.
	   */
	  function defineReactive(obj, key, val, customSetter) {
	    var dep = new Dep();
	
	    var property = Object.getOwnPropertyDescriptor(obj, key);
	    if (property && property.configurable === false) {
	      return;
	    }
	
	    // cater for pre-defined getter/setters
	    var getter = property && property.get;
	    var setter = property && property.set;
	
	    var childOb = observe(val);
	    Object.defineProperty(obj, key, {
	      enumerable: true,
	      configurable: true,
	      get: function reactiveGetter() {
	        var value = getter ? getter.call(obj) : val;
	        if (Dep.target) {
	          dep.depend();
	          if (childOb) {
	            childOb.dep.depend();
	          }
	          if (Array.isArray(value)) {
	            for (var e, i = 0, l = value.length; i < l; i++) {
	              e = value[i];
	              e && e.__ob__ && e.__ob__.dep.depend();
	            }
	          }
	        }
	        return value;
	      },
	      set: function reactiveSetter(newVal) {
	        var value = getter ? getter.call(obj) : val;
	        if (newVal === value) {
	          return;
	        }
	        if ("development" !== 'production' && customSetter) {
	          customSetter();
	        }
	        if (setter) {
	          setter.call(obj, newVal);
	        } else {
	          val = newVal;
	        }
	        childOb = observe(newVal);
	        dep.notify();
	      }
	    });
	  }
	
	  /**
	   * Set a property on an object. Adds the new property and
	   * triggers change notification if the property doesn't
	   * already exist.
	   */
	  function set(obj, key, val) {
	    if (Array.isArray(obj)) {
	      obj.splice(key, 1, val);
	      return val;
	    }
	    if (hasOwn(obj, key)) {
	      obj[key] = val;
	      return;
	    }
	    var ob = obj.__ob__;
	    if (obj._isVue || ob && ob.vmCount) {
	      "development" !== 'production' && warn('Avoid adding reactive properties to a Vue instance or its root $data ' + 'at runtime - delcare it upfront in the data option.');
	      return;
	    }
	    if (!ob) {
	      obj[key] = val;
	      return;
	    }
	    defineReactive(ob.value, key, val);
	    ob.dep.notify();
	    return val;
	  }
	
	  /**
	   * Delete a property and trigger change if necessary.
	   */
	  function del(obj, key) {
	    var ob = obj.__ob__;
	    if (obj._isVue || ob && ob.vmCount) {
	      "development" !== 'production' && warn('Avoid deleting properties on a Vue instance or its root $data ' + '- just set it to null.');
	      return;
	    }
	    if (!hasOwn(obj, key)) {
	      return;
	    }
	    delete obj[key];
	    if (!ob) {
	      return;
	    }
	    ob.dep.notify();
	  }
	
	  function initState(vm) {
	    vm._watchers = [];
	    initProps(vm);
	    initData(vm);
	    initComputed(vm);
	    initMethods(vm);
	    initWatch(vm);
	  }
	
	  function initProps(vm) {
	    var props = vm.$options.props;
	    var propsData = vm.$options.propsData;
	    if (props) {
	      var keys = vm.$options._propKeys = Object.keys(props);
	      var isRoot = !vm.$parent;
	      // root instance props should be converted
	      observerState.shouldConvert = isRoot;
	
	      var _loop = function _loop(i) {
	        var key = keys[i];
	        /* istanbul ignore else */
	        if (true) {
	          defineReactive(vm, key, validateProp(key, props, propsData, vm), function () {
	            if (vm.$parent && !observerState.isSettingProps) {
	              warn('Avoid mutating a prop directly since the value will be ' + 'overwritten whenever the parent component re-renders. ' + 'Instead, use a data or computed property based on the prop\'s ' + ('value. Prop being mutated: "' + key + '"'), vm);
	            }
	          });
	        } else {}
	      };
	
	      for (var i = 0; i < keys.length; i++) {
	        _loop(i);
	      }
	      observerState.shouldConvert = true;
	    }
	  }
	
	  function initData(vm) {
	    var data = vm.$options.data;
	    data = vm._data = typeof data === 'function' ? data.call(vm) : data || {};
	    if (!isPlainObject(data)) {
	      data = {};
	      "development" !== 'production' && warn('data functions should return an object.', vm);
	    }
	    // proxy data on instance
	    var keys = Object.keys(data);
	    var props = vm.$options.props;
	    var i = keys.length;
	    while (i--) {
	      if (props && hasOwn(props, keys[i])) {
	        "development" !== 'production' && warn('The data property "' + keys[i] + '" is already declared as a prop. ' + 'Use prop default value instead.', vm);
	      } else {
	        proxy(vm, keys[i]);
	      }
	    }
	    // observe data
	    observe(data);
	    data.__ob__ && data.__ob__.vmCount++;
	  }
	
	  var computedSharedDefinition = {
	    enumerable: true,
	    configurable: true,
	    get: noop,
	    set: noop
	  };
	
	  function initComputed(vm) {
	    var computed = vm.$options.computed;
	    if (computed) {
	      for (var _key in computed) {
	        var userDef = computed[_key];
	        if (typeof userDef === 'function') {
	          computedSharedDefinition.get = makeComputedGetter(userDef, vm);
	          computedSharedDefinition.set = noop;
	        } else {
	          computedSharedDefinition.get = userDef.get ? userDef.cache !== false ? makeComputedGetter(userDef.get, vm) : bind(userDef.get, vm) : noop;
	          computedSharedDefinition.set = userDef.set ? bind(userDef.set, vm) : noop;
	        }
	        Object.defineProperty(vm, _key, computedSharedDefinition);
	      }
	    }
	  }
	
	  function makeComputedGetter(getter, owner) {
	    var watcher = new Watcher(owner, getter, noop, {
	      lazy: true
	    });
	    return function computedGetter() {
	      if (watcher.dirty) {
	        watcher.evaluate();
	      }
	      if (Dep.target) {
	        watcher.depend();
	      }
	      return watcher.value;
	    };
	  }
	
	  function initMethods(vm) {
	    var methods = vm.$options.methods;
	    if (methods) {
	      for (var _key2 in methods) {
	        vm[_key2] = bind(methods[_key2], vm);
	      }
	    }
	  }
	
	  function initWatch(vm) {
	    var watch = vm.$options.watch;
	    if (watch) {
	      for (var _key3 in watch) {
	        var handler = watch[_key3];
	        if (Array.isArray(handler)) {
	          for (var i = 0; i < handler.length; i++) {
	            createWatcher(vm, _key3, handler[i]);
	          }
	        } else {
	          createWatcher(vm, _key3, handler);
	        }
	      }
	    }
	  }
	
	  function createWatcher(vm, key, handler) {
	    var options = void 0;
	    if (isPlainObject(handler)) {
	      options = handler;
	      handler = handler.handler;
	    }
	    if (typeof handler === 'string') {
	      handler = vm[handler];
	    }
	    vm.$watch(key, handler, options);
	  }
	
	  function stateMixin(Vue) {
	    // flow somehow has problems with directly declared definition object
	    // when using Object.defineProperty, so we have to procedurally build up
	    // the object here.
	    var dataDef = {};
	    dataDef.get = function () {
	      return this._data;
	    };
	    if (true) {
	      dataDef.set = function (newData) {
	        warn('Avoid replacing instance root $data. ' + 'Use nested data properties instead.', this);
	      };
	    }
	    Object.defineProperty(Vue.prototype, '$data', dataDef);
	
	    Vue.prototype.$watch = function (expOrFn, cb, options) {
	      var vm = this;
	      options = options || {};
	      options.user = true;
	      var watcher = new Watcher(vm, expOrFn, cb, options);
	      if (options.immediate) {
	        cb.call(vm, watcher.value);
	      }
	      return function unwatchFn() {
	        watcher.teardown();
	      };
	    };
	  }
	
	  function proxy(vm, key) {
	    if (!isReserved(key)) {
	      Object.defineProperty(vm, key, {
	        configurable: true,
	        enumerable: true,
	        get: function proxyGetter() {
	          return vm._data[key];
	        },
	        set: function proxySetter(val) {
	          vm._data[key] = val;
	        }
	      });
	    }
	  }
	
	  var VNode = function VNode(tag, data, children, text, elm, ns, context, host, componentOptions) {
	    this.tag = tag;
	    this.data = data;
	    this.children = children;
	    this.text = text;
	    this.elm = elm;
	    this.ns = ns;
	    this.context = context;
	    this.host = host;
	    this.key = data && data.key;
	    this.componentOptions = componentOptions;
	    this.child = undefined;
	    this.parent = undefined;
	    this.raw = false;
	    this.isStatic = false;
	    // apply construct hook.
	    // this is applied during render, before patch happens.
	    // unlike other hooks, this is applied on both client and server.
	    var constructHook = data && data.hook && data.hook.construct;
	    if (constructHook) {
	      constructHook(this);
	    }
	  };
	
	  var emptyVNode = function emptyVNode() {
	    return new VNode(undefined, undefined, undefined, '');
	  };
	
	  function normalizeChildren(children, ns) {
	    // Invoke children thunks. Components always receive their children
	    // as thunks so that they can perform the actual render inside their
	    // own dependency collection cycle. Also, since JSX automatically
	    // wraps component children in a thunk, we handle nested thunks to
	    // prevent situations such as <MyComponent>{ children }</MyComponent>
	    // from failing when it produces a double thunk.
	    while (typeof children === 'function') {
	      children = children();
	    }
	
	    if (isPrimitive(children)) {
	      return [createTextVNode(children)];
	    }
	    if (Array.isArray(children)) {
	      var res = [];
	      for (var i = 0, l = children.length; i < l; i++) {
	        var c = children[i];
	        var last = res[res.length - 1];
	        //  nested
	        if (Array.isArray(c)) {
	          res.push.apply(res, normalizeChildren(c, ns));
	        } else if (isPrimitive(c)) {
	          if (last && last.text) {
	            last.text += String(c);
	          } else {
	            // convert primitive to vnode
	            res.push(createTextVNode(c));
	          }
	        } else if (c instanceof VNode) {
	          if (c.text && last && last.text) {
	            last.text += c.text;
	          } else {
	            // inherit parent namespace
	            if (ns) {
	              applyNS(c, ns);
	            }
	            res.push(c);
	          }
	        }
	      }
	      return res;
	    }
	  }
	
	  function createTextVNode(val) {
	    return new VNode(undefined, undefined, undefined, String(val));
	  }
	
	  function applyNS(vnode, ns) {
	    if (vnode.tag && !vnode.ns) {
	      vnode.ns = ns;
	      if (vnode.children) {
	        for (var i = 0, l = vnode.children.length; i < l; i++) {
	          applyNS(vnode.children[i], ns);
	        }
	      }
	    }
	  }
	
	  // in case the child is also an abstract component, e.g. <transition-control>
	  // we want to recrusively retrieve the real component to be rendered
	  function getRealChild(vnode) {
	    var compOptions = vnode && vnode.componentOptions;
	    if (compOptions && compOptions.Ctor.options.abstract) {
	      return getRealChild(compOptions.propsData && compOptions.propsData.child);
	    } else {
	      return vnode;
	    }
	  }
	
	  function mergeVNodeHook(def, key, hook) {
	    var oldHook = def[key];
	    if (oldHook) {
	      def[key] = function () {
	        oldHook.apply(this, arguments);
	        hook.apply(this, arguments);
	      };
	    } else {
	      def[key] = hook;
	    }
	  }
	
	  function updateListeners(on, oldOn, add, remove) {
	    var name = void 0,
	        cur = void 0,
	        old = void 0,
	        fn = void 0,
	        event = void 0,
	        capture = void 0;
	    for (name in on) {
	      cur = on[name];
	      old = oldOn[name];
	      if (!old) {
	        capture = name.charAt(0) === '!';
	        event = capture ? name.slice(1) : name;
	        if (Array.isArray(cur)) {
	          add(event, cur.invoker = arrInvoker(cur), capture);
	        } else {
	          fn = cur;
	          cur = on[name] = {};
	          cur.fn = fn;
	          add(event, cur.invoker = fnInvoker(cur), capture);
	        }
	      } else if (Array.isArray(old)) {
	        old.length = cur.length;
	        for (var i = 0; i < old.length; i++) {
	          old[i] = cur[i];
	        }on[name] = old;
	      } else {
	        old.fn = cur;
	        on[name] = old;
	      }
	    }
	    for (name in oldOn) {
	      if (!on[name]) {
	        event = name.charAt(0) === '!' ? name.slice(1) : name;
	        remove(event, oldOn[name].invoker);
	      }
	    }
	  }
	
	  function arrInvoker(arr) {
	    return function (ev) {
	      var single = arguments.length === 1;
	      for (var i = 0; i < arr.length; i++) {
	        single ? arr[i](ev) : arr[i].apply(null, arguments);
	      }
	    };
	  }
	
	  function fnInvoker(o) {
	    return function (ev) {
	      var single = arguments.length === 1;
	      single ? o.fn(ev) : o.fn.apply(null, arguments);
	    };
	  }
	
	  function initLifecycle(vm) {
	    var options = vm.$options;
	
	    // locate first non-abstract parent
	    var parent = options.parent;
	    if (parent && !options.abstract) {
	      while (parent.$options.abstract && parent.$parent) {
	        parent = parent.$parent;
	      }
	      parent.$children.push(vm);
	    }
	
	    vm.$parent = parent;
	    vm.$root = parent ? parent.$root : vm;
	
	    vm.$children = [];
	    vm.$refs = {};
	
	    vm._watcher = null;
	    vm._inactive = false;
	    vm._isMounted = false;
	    vm._isDestroyed = false;
	    vm._isBeingDestroyed = false;
	  }
	
	  function lifecycleMixin(Vue) {
	    Vue.prototype._mount = function (el, hydrating) {
	      var vm = this;
	      vm.$el = el;
	      if (!vm.$options.render) {
	        vm.$options.render = emptyVNode;
	        if (true) {
	          /* istanbul ignore if */
	          if (vm.$options.template) {
	            warn('You are using the runtime-only build of Vue where the template ' + 'option is not available. Either pre-compile the templates into ' + 'render functions, or use the compiler-included build.', vm);
	          } else {
	            warn('Failed to mount component: template or render function not defined.', vm);
	          }
	        }
	      }
	      callHook(vm, 'beforeMount');
	      vm._watcher = new Watcher(vm, function () {
	        vm._update(vm._render(), hydrating);
	      }, noop);
	      hydrating = false;
	      // root instance, call mounted on self
	      // mounted is called for child components in its inserted hook
	      if (vm.$root === vm) {
	        vm._isMounted = true;
	        callHook(vm, 'mounted');
	      }
	      return vm;
	    };
	
	    Vue.prototype._update = function (vnode, hydrating) {
	      var vm = this;
	      if (vm._isMounted) {
	        callHook(vm, 'beforeUpdate');
	      }
	      var prevEl = vm.$el;
	      if (!vm._vnode) {
	        // Vue.prototype.__patch__ is injected in entry points
	        // based on the rendering backend used.
	        vm.$el = vm.__patch__(vm.$el, vnode, hydrating);
	      } else {
	        vm.$el = vm.__patch__(vm._vnode, vnode);
	      }
	      vm._vnode = vnode;
	      // update __vue__ reference
	      if (prevEl) {
	        prevEl.__vue__ = null;
	      }
	      if (vm.$el) {
	        vm.$el.__vue__ = vm;
	      }
	      // if parent is an HOC, update its $el as well
	      if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
	        vm.$parent.$el = vm.$el;
	      }
	      if (vm._isMounted) {
	        callHook(vm, 'updated');
	      }
	    };
	
	    Vue.prototype._updateFromParent = function (propsData, listeners, parentVnode, renderChildren) {
	      var vm = this;
	      vm.$options._parentVnode = parentVnode;
	      vm.$options._renderChildren = renderChildren;
	      // update props
	      if (propsData && vm.$options.props) {
	        observerState.shouldConvert = false;
	        if (true) {
	          observerState.isSettingProps = true;
	        }
	        var propKeys = vm.$options._propKeys || [];
	        for (var i = 0; i < propKeys.length; i++) {
	          var key = propKeys[i];
	          vm[key] = validateProp(key, vm.$options.props, propsData, vm);
	        }
	        observerState.shouldConvert = true;
	        if (true) {
	          observerState.isSettingProps = false;
	        }
	      }
	      // update listeners
	      if (listeners) {
	        var oldListeners = vm.$options._parentListeners;
	        vm.$options._parentListeners = listeners;
	        vm._updateListeners(listeners, oldListeners);
	      }
	    };
	
	    Vue.prototype.$forceUpdate = function () {
	      var vm = this;
	      if (vm._watcher) {
	        vm._watcher.update();
	      }
	      if (vm._watchers.length) {
	        for (var i = 0; i < vm._watchers.length; i++) {
	          vm._watchers[i].update(true /* shallow */);
	        }
	      }
	    };
	
	    Vue.prototype.$destroy = function () {
	      var vm = this;
	      if (vm._isBeingDestroyed) {
	        return;
	      }
	      callHook(vm, 'beforeDestroy');
	      vm._isBeingDestroyed = true;
	      // remove self from parent
	      var parent = vm.$parent;
	      if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
	        remove(parent.$children, vm);
	      }
	      // teardown watchers
	      if (vm._watcher) {
	        vm._watcher.teardown();
	      }
	      var i = vm._watchers.length;
	      while (i--) {
	        vm._watchers[i].teardown();
	      }
	      // remove reference from data ob
	      // frozen object may not have observer.
	      if (vm._data.__ob__) {
	        vm._data.__ob__.vmCount--;
	      }
	      // call the last hook...
	      vm._isDestroyed = true;
	      callHook(vm, 'destroyed');
	      // turn off all instance listeners.
	      vm.$off();
	      // remove __vue__ reference
	      if (vm.$el) {
	        vm.$el.__vue__ = null;
	      }
	    };
	  }
	
	  function callHook(vm, hook) {
	    var handlers = vm.$options[hook];
	    if (handlers) {
	      for (var i = 0, j = handlers.length; i < j; i++) {
	        handlers[i].call(vm);
	      }
	    }
	    vm.$emit('hook:' + hook);
	  }
	
	  var hooks = { init: init, prepatch: prepatch, insert: insert, destroy: destroy };
	  var hooksToMerge = Object.keys(hooks);
	
	  function createComponent(Ctor, data, parent, context, host, _children, tag) {
	    // ensure children is a thunk
	    if ("development" !== 'production' && _children && typeof _children !== 'function') {
	      warn('A component\'s children should be a function that returns the ' + 'children array. This allows the component to track the children ' + 'dependencies and optimizes re-rendering.');
	    }
	
	    if (!Ctor) {
	      return;
	    }
	
	    if (isObject(Ctor)) {
	      Ctor = Vue.extend(Ctor);
	    }
	
	    if (typeof Ctor !== 'function') {
	      if (true) {
	        warn('Invalid Component definition: ' + Ctor, parent);
	      }
	      return;
	    }
	
	    // async component
	    if (!Ctor.cid) {
	      if (Ctor.resolved) {
	        Ctor = Ctor.resolved;
	      } else {
	        Ctor = resolveAsyncComponent(Ctor, function () {
	          // it's ok to queue this on every render because
	          // $forceUpdate is buffered. this is only called
	          // if the
	          parent.$forceUpdate();
	        });
	        if (!Ctor) {
	          // return nothing if this is indeed an async component
	          // wait for the callback to trigger parent update.
	          return;
	        }
	      }
	    }
	
	    data = data || {};
	
	    // extract props
	    var propsData = extractProps(data, Ctor);
	
	    // functional component
	    if (Ctor.options.functional) {
	      var _ret = function () {
	        var props = {};
	        var propOptions = Ctor.options.props;
	        if (propOptions) {
	          Object.keys(propOptions).forEach(function (key) {
	            props[key] = validateProp(key, propOptions, propsData);
	          });
	        }
	        return {
	          v: Ctor.options.render.call(null, parent.$createElement, {
	            props: props,
	            parent: parent,
	            data: data,
	            children: function children() {
	              return normalizeChildren(_children);
	            },
	            slots: function slots() {
	              return resolveSlots(_children);
	            }
	          })
	        };
	      }();
	
	      if (typeof _ret === "object") return _ret.v;
	    }
	
	    // extract listeners, since these needs to be treated as
	    // child component listeners instead of DOM listeners
	    var listeners = data.on;
	    // replace with listeners with .native modifier
	    data.on = data.nativeOn;
	
	    if (Ctor.options.abstract) {
	      // abstract components do not keep anything
	      // other than props & listeners
	      data = {};
	    }
	
	    // merge component management hooks onto the placeholder node
	    mergeHooks(data);
	
	    // return a placeholder vnode
	    var name = Ctor.options.name || tag;
	    var vnode = new VNode('vue-component-' + Ctor.cid + (name ? '-' + name : ''), data, undefined, undefined, undefined, undefined, context, host, { Ctor: Ctor, propsData: propsData, listeners: listeners, parent: parent, tag: tag, children: _children });
	    return vnode;
	  }
	
	  function createComponentInstanceForVnode(vnode // we know it's MountedComponentVNode but flow doesn't
	  ) {
	    var vnodeComponentOptions = vnode.componentOptions;
	    var options = {
	      _isComponent: true,
	      parent: vnodeComponentOptions.parent,
	      propsData: vnodeComponentOptions.propsData,
	      _componentTag: vnodeComponentOptions.tag,
	      _parentVnode: vnode,
	      _parentListeners: vnodeComponentOptions.listeners,
	      _renderChildren: vnodeComponentOptions.children
	    };
	    // check inline-template render functions
	    var inlineTemplate = vnode.data.inlineTemplate;
	    if (inlineTemplate) {
	      options.render = inlineTemplate.render;
	      options.staticRenderFns = inlineTemplate.staticRenderFns;
	    }
	    return new vnodeComponentOptions.Ctor(options);
	  }
	
	  function init(vnode, hydrating) {
	    if (!vnode.child) {
	      var child = vnode.child = createComponentInstanceForVnode(vnode);
	      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
	    }
	  }
	
	  function prepatch(oldVnode, vnode) {
	    var options = vnode.componentOptions;
	    var child = vnode.child = oldVnode.child;
	    child._updateFromParent(options.propsData, // updated props
	    options.listeners, // updated listeners
	    vnode, // new parent vnode
	    options.children // new children
	    );
	    // always update abstract components.
	    if (child.$options.abstract) {
	      child.$forceUpdate();
	    }
	  }
	
	  function insert(vnode) {
	    if (!vnode.child._isMounted) {
	      vnode.child._isMounted = true;
	      callHook(vnode.child, 'mounted');
	    }
	    if (vnode.data.keepAlive) {
	      vnode.child._inactive = false;
	      callHook(vnode.child, 'activated');
	    }
	  }
	
	  function destroy(vnode) {
	    if (!vnode.child._isDestroyed) {
	      if (!vnode.data.keepAlive) {
	        vnode.child.$destroy();
	      } else {
	        vnode.child._inactive = true;
	        callHook(vnode.child, 'deactivated');
	      }
	    }
	  }
	
	  function resolveAsyncComponent(factory, cb) {
	    if (factory.requested) {
	      // pool callbacks
	      factory.pendingCallbacks.push(cb);
	    } else {
	      var _ret2 = function () {
	        factory.requested = true;
	        var cbs = factory.pendingCallbacks = [cb];
	        var sync = true;
	        factory(
	        // resolve
	        function (res) {
	          if (isObject(res)) {
	            res = Vue.extend(res);
	          }
	          // cache resolved
	          factory.resolved = res;
	          // invoke callbacks only if this is not a synchronous resolve
	          // (async resolves are shimmed as synchronous during SSR)
	          if (!sync) {
	            for (var i = 0, l = cbs.length; i < l; i++) {
	              cbs[i](res);
	            }
	          }
	        },
	        // reject
	        function (reason) {
	          "development" !== 'production' && warn('Failed to resolve async component: ' + factory + (reason ? '\nReason: ' + reason : ''));
	        });
	        sync = false;
	        // return in case resolved synchronously
	        return {
	          v: factory.resolved
	        };
	      }();
	
	      if (typeof _ret2 === "object") return _ret2.v;
	    }
	  }
	
	  function extractProps(data, Ctor) {
	    // we are only extrating raw values here.
	    // validation and default values are handled in the child
	    // component itself.
	    var propOptions = Ctor.options.props;
	    if (!propOptions) {
	      return;
	    }
	    var res = {};
	    var attrs = data.attrs;
	    var props = data.props;
	    var domProps = data.domProps;
	
	    if (attrs || props || domProps) {
	      for (var key in propOptions) {
	        var altKey = hyphenate(key);
	        checkProp(res, props, key, altKey, true) || checkProp(res, attrs, key, altKey) || checkProp(res, domProps, key, altKey);
	      }
	    }
	    return res;
	  }
	
	  function checkProp(res, hash, key, altKey, preserve) {
	    if (hash) {
	      if (hasOwn(hash, key)) {
	        res[key] = hash[key];
	        if (!preserve) {
	          delete hash[key];
	        }
	        return true;
	      } else if (hasOwn(hash, altKey)) {
	        res[key] = hash[altKey];
	        if (!preserve) {
	          delete hash[altKey];
	        }
	        return true;
	      }
	    }
	    return false;
	  }
	
	  function mergeHooks(data) {
	    if (!data.hook) {
	      data.hook = {};
	    }
	    for (var i = 0; i < hooksToMerge.length; i++) {
	      var key = hooksToMerge[i];
	      var fromParent = data.hook[key];
	      var ours = hooks[key];
	      data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours;
	    }
	  }
	
	  function mergeHook$1(a, b) {
	    // since all hooks have at most two args, use fixed args
	    // to avoid having to use fn.apply().
	    return function (_, __) {
	      a(_, __);
	      b(_, __);
	    };
	  }
	
	  // wrapper function for providing a more flexible interface
	  // without getting yelled at by flow
	  function createElement(tag, data, children) {
	    if (data && (Array.isArray(data) || typeof data !== 'object')) {
	      children = data;
	      data = undefined;
	    }
	    // make sure to use real instance instead of proxy as context
	    return _createElement(this._self, tag, data, children);
	  }
	
	  function _createElement(context, tag, data, children) {
	    var parent = renderState.activeInstance;
	    var host = context !== parent ? parent : undefined;
	    if (!parent) {
	      "development" !== 'production' && warn('createElement cannot be called outside of component ' + 'render functions.');
	      return;
	    }
	    if (data && data.__ob__) {
	      "development" !== 'production' && warn('Avoid using observed data object as vnode data: ' + JSON.stringify(data) + '\n' + 'Always create fresh vnode data objects in each render!', context);
	      return;
	    }
	    if (!tag) {
	      // in case of component :is set to falsy value
	      return emptyVNode();
	    }
	    if (typeof tag === 'string') {
	      var Ctor = void 0;
	      var ns = config.getTagNamespace(tag);
	      if (config.isReservedTag(tag)) {
	        // platform built-in elements
	        return new VNode(tag, data, normalizeChildren(children, ns), undefined, undefined, ns, context, host);
	      } else if (Ctor = resolveAsset(context.$options, 'components', tag)) {
	        // component
	        return createComponent(Ctor, data, parent, context, host, children, tag);
	      } else {
	        // unknown or unlisted namespaced elements
	        // check at runtime because it may get assigned a namespace when its
	        // parent normalizes children
	        return new VNode(tag, data, normalizeChildren(children, ns), undefined, undefined, ns, context, host);
	      }
	    } else {
	      // direct component options / constructor
	      return createComponent(tag, data, parent, context, host, children);
	    }
	  }
	
	  var renderState = {
	    activeInstance: null
	  };
	
	  function initRender(vm) {
	    vm.$vnode = null; // the placeholder node in parent tree
	    vm._vnode = null; // the root of the child tree
	    vm._staticTrees = null;
	    vm.$slots = {};
	    // bind the public createElement fn to this instance
	    // so that we get proper render context inside it.
	    vm.$createElement = bind(createElement, vm);
	    if (vm.$options.el) {
	      vm.$mount(vm.$options.el);
	    }
	  }
	
	  function renderMixin(Vue) {
	    Vue.prototype.$nextTick = function (fn) {
	      nextTick(fn, this);
	    };
	
	    Vue.prototype._render = function () {
	      var vm = this;
	
	      // set current active instance
	      var prev = renderState.activeInstance;
	      renderState.activeInstance = vm;
	
	      var _vm$$options = vm.$options;
	      var render = _vm$$options.render;
	      var staticRenderFns = _vm$$options.staticRenderFns;
	      var _renderChildren = _vm$$options._renderChildren;
	      var _parentVnode = _vm$$options._parentVnode;
	
	
	      if (staticRenderFns && !vm._staticTrees) {
	        vm._staticTrees = [];
	      }
	      // set parent vnode. this allows render functions to have access
	      // to the data on the placeholder node.
	      vm.$vnode = _parentVnode;
	      // resolve slots. becaues slots are rendered in parent scope,
	      // we set the activeInstance to parent.
	      vm.$slots = resolveSlots(_renderChildren);
	      // render self
	      var vnode = void 0;
	      try {
	        vnode = render.call(vm._renderProxy, vm.$createElement);
	      } catch (e) {
	        if (true) {
	          warn('Error when rendering ' + formatComponentName(vm) + ':');
	        }
	        /* istanbul ignore else */
	        if (config.errorHandler) {
	          config.errorHandler.call(null, e, vm);
	        } else {
	          if (config._isServer) {
	            throw e;
	          } else {
	            setTimeout(function () {
	              throw e;
	            }, 0);
	          }
	        }
	        // return previous vnode to prevent render error causing blank component
	        vnode = vm._vnode;
	      }
	      // return empty vnode in case the render function errored out
	      if (!(vnode instanceof VNode)) {
	        if ("development" !== 'production' && Array.isArray(vnode)) {
	          warn('Multiple root nodes returned from render function. Render function ' + 'should return a single root node.', vm);
	        }
	        vnode = emptyVNode();
	      }
	      // set parent
	      vnode.parent = _parentVnode;
	      // restore render state
	      renderState.activeInstance = prev;
	      return vnode;
	    };
	
	    // shorthands used in render functions
	    Vue.prototype._h = createElement;
	    // toString for mustaches
	    Vue.prototype._s = _toString;
	    // number conversion
	    Vue.prototype._n = toNumber;
	
	    // render static tree by index
	    Vue.prototype._m = function renderStatic(index) {
	      var tree = this._staticTrees[index];
	      if (!tree) {
	        tree = this._staticTrees[index] = this.$options.staticRenderFns[index].call(this._renderProxy);
	        tree.isStatic = true;
	      }
	      return tree;
	    };
	
	    // filter resolution helper
	    var identity = function identity(_) {
	      return _;
	    };
	    Vue.prototype._f = function resolveFilter(id) {
	      return resolveAsset(this.$options, 'filters', id, true) || identity;
	    };
	
	    // render v-for
	    Vue.prototype._l = function renderList(val, render) {
	      var ret = void 0,
	          i = void 0,
	          l = void 0,
	          keys = void 0,
	          key = void 0;
	      if (Array.isArray(val)) {
	        ret = new Array(val.length);
	        for (i = 0, l = val.length; i < l; i++) {
	          ret[i] = render(val[i], i);
	        }
	      } else if (typeof val === 'number') {
	        ret = new Array(val);
	        for (i = 0; i < val; i++) {
	          ret[i] = render(i + 1, i);
	        }
	      } else if (isObject(val)) {
	        keys = Object.keys(val);
	        ret = new Array(keys.length);
	        for (i = 0, l = keys.length; i < l; i++) {
	          key = keys[i];
	          ret[i] = render(val[key], key, i);
	        }
	      }
	      return ret;
	    };
	
	    // apply v-bind object
	    Vue.prototype._b = function bindProps(vnode, value, asProp) {
	      if (value) {
	        if (!isObject(value)) {
	          "development" !== 'production' && warn('v-bind without argument expects an Object or Array value', this);
	        } else {
	          if (Array.isArray(value)) {
	            value = toObject(value);
	          }
	          var data = vnode.data;
	          for (var key in value) {
	            var hash = asProp || config.mustUseProp(key) ? data.domProps || (data.domProps = {}) : data.attrs || (data.attrs = {});
	            hash[key] = value[key];
	          }
	        }
	      }
	    };
	
	    // expose v-on keyCodes
	    Vue.prototype._k = function getKeyCodes(key) {
	      return config.keyCodes[key];
	    };
	  }
	
	  function resolveSlots(renderChildren) {
	    var slots = {};
	    if (!renderChildren) {
	      return slots;
	    }
	    var children = normalizeChildren(renderChildren) || [];
	    var defaultSlot = [];
	    var name = void 0,
	        child = void 0;
	    for (var i = 0, l = children.length; i < l; i++) {
	      child = children[i];
	      if (child.data && (name = child.data.slot)) {
	        delete child.data.slot;
	        var slot = slots[name] || (slots[name] = []);
	        if (child.tag === 'template') {
	          slot.push.apply(slot, child.children);
	        } else {
	          slot.push(child);
	        }
	      } else {
	        defaultSlot.push(child);
	      }
	    }
	    // ignore single whitespace
	    if (defaultSlot.length && !(defaultSlot.length === 1 && defaultSlot[0].text === ' ')) {
	      slots.default = defaultSlot;
	    }
	    return slots;
	  }
	
	  function initEvents(vm) {
	    vm._events = Object.create(null);
	    // init parent attached events
	    var listeners = vm.$options._parentListeners;
	    var on = bind(vm.$on, vm);
	    var off = bind(vm.$off, vm);
	    vm._updateListeners = function (listeners, oldListeners) {
	      updateListeners(listeners, oldListeners || {}, on, off);
	    };
	    if (listeners) {
	      vm._updateListeners(listeners);
	    }
	  }
	
	  function eventsMixin(Vue) {
	    Vue.prototype.$on = function (event, fn) {
	      var vm = this;(vm._events[event] || (vm._events[event] = [])).push(fn);
	      return vm;
	    };
	
	    Vue.prototype.$once = function (event, fn) {
	      var vm = this;
	      function on() {
	        vm.$off(event, on);
	        fn.apply(vm, arguments);
	      }
	      on.fn = fn;
	      vm.$on(event, on);
	      return vm;
	    };
	
	    Vue.prototype.$off = function (event, fn) {
	      var vm = this;
	      // all
	      if (!arguments.length) {
	        vm._events = Object.create(null);
	        return vm;
	      }
	      // specific event
	      var cbs = vm._events[event];
	      if (!cbs) {
	        return vm;
	      }
	      if (arguments.length === 1) {
	        vm._events[event] = null;
	        return vm;
	      }
	      // specific handler
	      var cb = void 0;
	      var i = cbs.length;
	      while (i--) {
	        cb = cbs[i];
	        if (cb === fn || cb.fn === fn) {
	          cbs.splice(i, 1);
	          break;
	        }
	      }
	      return vm;
	    };
	
	    Vue.prototype.$emit = function (event) {
	      var vm = this;
	      var cbs = vm._events[event];
	      if (cbs) {
	        cbs = cbs.length > 1 ? toArray(cbs) : cbs;
	        var args = toArray(arguments, 1);
	        for (var i = 0, l = cbs.length; i < l; i++) {
	          cbs[i].apply(vm, args);
	        }
	      }
	      return vm;
	    };
	  }
	
	  var uid = 0;
	
	  function initMixin(Vue) {
	    Vue.prototype._init = function (options) {
	      var vm = this;
	      // a uid
	      vm._uid = uid++;
	      // a flag to avoid this being observed
	      vm._isVue = true;
	      // merge options
	      if (options && options._isComponent) {
	        // optimize internal component instantiation
	        // since dynamic options merging is pretty slow, and none of the
	        // internal component options needs special treatment.
	        initInternalComponent(vm, options);
	      } else {
	        vm.$options = mergeOptions(resolveConstructorOptions(vm), options || {}, vm);
	      }
	      /* istanbul ignore else */
	      if (true) {
	        initProxy(vm);
	      } else {}
	      // expose real self
	      vm._self = vm;
	      initLifecycle(vm);
	      initEvents(vm);
	      callHook(vm, 'beforeCreate');
	      initState(vm);
	      callHook(vm, 'created');
	      initRender(vm);
	    };
	
	    function initInternalComponent(vm, options) {
	      var opts = vm.$options = Object.create(resolveConstructorOptions(vm));
	      // doing this because it's faster than dynamic enumeration.
	      opts.parent = options.parent;
	      opts.propsData = options.propsData;
	      opts._parentVnode = options._parentVnode;
	      opts._parentListeners = options._parentListeners;
	      opts._renderChildren = options._renderChildren;
	      opts._componentTag = options._componentTag;
	      if (options.render) {
	        opts.render = options.render;
	        opts.staticRenderFns = options.staticRenderFns;
	      }
	    }
	
	    function resolveConstructorOptions(vm) {
	      var Ctor = vm.constructor;
	      var options = Ctor.options;
	      if (Ctor.super) {
	        var superOptions = Ctor.super.options;
	        var cachedSuperOptions = Ctor.superOptions;
	        if (superOptions !== cachedSuperOptions) {
	          // super option changed
	          Ctor.superOptions = superOptions;
	          options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
	          if (options.name) {
	            options.components[options.name] = Ctor;
	          }
	        }
	      }
	      return options;
	    }
	  }
	
	  function Vue(options) {
	    this._init(options);
	  }
	
	  initMixin(Vue);
	  stateMixin(Vue);
	  eventsMixin(Vue);
	  lifecycleMixin(Vue);
	  renderMixin(Vue);
	
	  var warn = void 0;
	  var formatComponentName = void 0;
	
	  if (true) {
	    (function () {
	      var hasConsole = typeof console !== 'undefined';
	
	      warn = function warn(msg, vm) {
	        if (hasConsole && !config.silent) {
	          console.error('[Vue warn]: ' + msg + ' ' + (vm ? formatLocation(formatComponentName(vm)) : ''));
	        }
	      };
	
	      formatComponentName = function formatComponentName(vm) {
	        if (vm.$root === vm) {
	          return 'root instance';
	        }
	        var name = vm._isVue ? vm.$options.name || vm.$options._componentTag : vm.name;
	        return name ? 'component <' + name + '>' : 'anonymous component';
	      };
	
	      var formatLocation = function formatLocation(str) {
	        if (str === 'anonymous component') {
	          str += ' - use the "name" option for better debugging messages.)';
	        }
	        return '(found in ' + str + ')';
	      };
	    })();
	  }
	
	  /**
	   * Option overwriting strategies are functions that handle
	   * how to merge a parent option value and a child option
	   * value into the final value.
	   */
	  var strats = config.optionMergeStrategies;
	
	  /**
	   * Options with restrictions
	   */
	  if (true) {
	    strats.el = strats.propsData = function (parent, child, vm, key) {
	      if (!vm) {
	        warn('option "' + key + '" can only be used during instance ' + 'creation with the `new` keyword.');
	      }
	      return defaultStrat(parent, child);
	    };
	
	    strats.name = function (parent, child, vm) {
	      if (vm) {
	        warn('options "name" can only be used as a component definition option, ' + 'not during instance creation.');
	      }
	      return defaultStrat(parent, child);
	    };
	  }
	
	  /**
	   * Helper that recursively merges two data objects together.
	   */
	  function mergeData(to, from) {
	    var key = void 0,
	        toVal = void 0,
	        fromVal = void 0;
	    for (key in from) {
	      toVal = to[key];
	      fromVal = from[key];
	      if (!hasOwn(to, key)) {
	        set(to, key, fromVal);
	      } else if (isObject(toVal) && isObject(fromVal)) {
	        mergeData(toVal, fromVal);
	      }
	    }
	    return to;
	  }
	
	  /**
	   * Data
	   */
	  strats.data = function (parentVal, childVal, vm) {
	    if (!vm) {
	      // in a Vue.extend merge, both should be functions
	      if (!childVal) {
	        return parentVal;
	      }
	      if (typeof childVal !== 'function') {
	        "development" !== 'production' && warn('The "data" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
	        return parentVal;
	      }
	      if (!parentVal) {
	        return childVal;
	      }
	      // when parentVal & childVal are both present,
	      // we need to return a function that returns the
	      // merged result of both functions... no need to
	      // check if parentVal is a function here because
	      // it has to be a function to pass previous merges.
	      return function mergedDataFn() {
	        return mergeData(childVal.call(this), parentVal.call(this));
	      };
	    } else if (parentVal || childVal) {
	      return function mergedInstanceDataFn() {
	        // instance merge
	        var instanceData = typeof childVal === 'function' ? childVal.call(vm) : childVal;
	        var defaultData = typeof parentVal === 'function' ? parentVal.call(vm) : undefined;
	        if (instanceData) {
	          return mergeData(instanceData, defaultData);
	        } else {
	          return defaultData;
	        }
	      };
	    }
	  };
	
	  /**
	   * Hooks and param attributes are merged as arrays.
	   */
	  function mergeHook(parentVal, childVal) {
	    return childVal ? parentVal ? parentVal.concat(childVal) : Array.isArray(childVal) ? childVal : [childVal] : parentVal;
	  }
	
	  config._lifecycleHooks.forEach(function (hook) {
	    strats[hook] = mergeHook;
	  });
	
	  /**
	   * Assets
	   *
	   * When a vm is present (instance creation), we need to do
	   * a three-way merge between constructor options, instance
	   * options and parent options.
	   */
	  function mergeAssets(parentVal, childVal) {
	    var res = Object.create(parentVal || null);
	    return childVal ? extend(res, childVal) : res;
	  }
	
	  config._assetTypes.forEach(function (type) {
	    strats[type + 's'] = mergeAssets;
	  });
	
	  /**
	   * Watchers.
	   *
	   * Watchers hashes should not overwrite one
	   * another, so we merge them as arrays.
	   */
	  strats.watch = function (parentVal, childVal) {
	    /* istanbul ignore if */
	    if (!childVal) return parentVal;
	    if (!parentVal) return childVal;
	    var ret = {};
	    extend(ret, parentVal);
	    for (var key in childVal) {
	      var parent = ret[key];
	      var child = childVal[key];
	      if (parent && !Array.isArray(parent)) {
	        parent = [parent];
	      }
	      ret[key] = parent ? parent.concat(child) : [child];
	    }
	    return ret;
	  };
	
	  /**
	   * Other object hashes.
	   */
	  strats.props = strats.methods = strats.computed = function (parentVal, childVal) {
	    if (!childVal) return parentVal;
	    if (!parentVal) return childVal;
	    var ret = Object.create(null);
	    extend(ret, parentVal);
	    extend(ret, childVal);
	    return ret;
	  };
	
	  /**
	   * Default strategy.
	   */
	  var defaultStrat = function defaultStrat(parentVal, childVal) {
	    return childVal === undefined ? parentVal : childVal;
	  };
	
	  /**
	   * Make sure component options get converted to actual
	   * constructors.
	   */
	  function normalizeComponents(options) {
	    if (options.components) {
	      var components = options.components;
	      var def = void 0;
	      for (var key in components) {
	        var lower = key.toLowerCase();
	        if (isBuiltInTag(lower) || config.isReservedTag(lower)) {
	          "development" !== 'production' && warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + key);
	          continue;
	        }
	        def = components[key];
	        if (isPlainObject(def)) {
	          components[key] = Vue.extend(def);
	        }
	      }
	    }
	  }
	
	  /**
	   * Ensure all props option syntax are normalized into the
	   * Object-based format.
	   */
	  function normalizeProps(options) {
	    var props = options.props;
	    if (!props) return;
	    var res = {};
	    var i = void 0,
	        val = void 0,
	        name = void 0;
	    if (Array.isArray(props)) {
	      i = props.length;
	      while (i--) {
	        val = props[i];
	        if (typeof val === 'string') {
	          name = camelize(val);
	          res[name] = { type: null };
	        } else if (true) {
	          warn('props must be strings when using array syntax.');
	        }
	      }
	    } else if (isPlainObject(props)) {
	      for (var key in props) {
	        val = props[key];
	        name = camelize(key);
	        res[name] = isPlainObject(val) ? val : { type: val };
	      }
	    }
	    options.props = res;
	  }
	
	  /**
	   * Normalize raw function directives into object format.
	   */
	  function normalizeDirectives(options) {
	    var dirs = options.directives;
	    if (dirs) {
	      for (var key in dirs) {
	        var def = dirs[key];
	        if (typeof def === 'function') {
	          dirs[key] = { bind: def, update: def };
	        }
	      }
	    }
	  }
	
	  /**
	   * Merge two option objects into a new one.
	   * Core utility used in both instantiation and inheritance.
	   */
	  function mergeOptions(parent, child, vm) {
	    normalizeComponents(child);
	    normalizeProps(child);
	    normalizeDirectives(child);
	    var extendsFrom = child.extends;
	    if (extendsFrom) {
	      parent = typeof extendsFrom === 'function' ? mergeOptions(parent, extendsFrom.options, vm) : mergeOptions(parent, extendsFrom, vm);
	    }
	    if (child.mixins) {
	      for (var i = 0, l = child.mixins.length; i < l; i++) {
	        var mixin = child.mixins[i];
	        if (mixin.prototype instanceof Vue) {
	          mixin = mixin.options;
	        }
	        parent = mergeOptions(parent, mixin, vm);
	      }
	    }
	    var options = {};
	    var key = void 0;
	    for (key in parent) {
	      mergeField(key);
	    }
	    for (key in child) {
	      if (!hasOwn(parent, key)) {
	        mergeField(key);
	      }
	    }
	    function mergeField(key) {
	      var strat = strats[key] || defaultStrat;
	      options[key] = strat(parent[key], child[key], vm, key);
	    }
	    return options;
	  }
	
	  /**
	   * Resolve an asset.
	   * This function is used because child instances need access
	   * to assets defined in its ancestor chain.
	   */
	  function resolveAsset(options, type, id, warnMissing) {
	    /* istanbul ignore if */
	    if (typeof id !== 'string') {
	      return;
	    }
	    var assets = options[type];
	    var res = assets[id] ||
	    // camelCase ID
	    assets[camelize(id)] ||
	    // Pascal Case ID
	    assets[capitalize(camelize(id))];
	    if ("development" !== 'production' && warnMissing && !res) {
	      warn('Failed to resolve ' + type.slice(0, -1) + ': ' + id, options);
	    }
	    return res;
	  }
	
	  function validateProp(key, propOptions, propsData, vm) {
	    /* istanbul ignore if */
	    if (!propsData) return;
	    var prop = propOptions[key];
	    var absent = !hasOwn(propsData, key);
	    var value = propsData[key];
	    // handle boolean props
	    if (prop.type === Boolean) {
	      if (absent && !hasOwn(prop, 'default')) {
	        value = false;
	      } else if (value === '' || value === hyphenate(key)) {
	        value = true;
	      }
	    }
	    // check default value
	    if (value === undefined) {
	      value = getPropDefaultValue(vm, prop, key);
	      // since the default value is a fresh copy,
	      // make sure to observe it.
	      var prevShouldConvert = observerState.shouldConvert;
	      observerState.shouldConvert = true;
	      observe(value);
	      observerState.shouldConvert = prevShouldConvert;
	    }
	    if (true) {
	      assertProp(prop, key, value, vm, absent);
	    }
	    return value;
	  }
	
	  /**
	   * Get the default value of a prop.
	   */
	  function getPropDefaultValue(vm, prop, name) {
	    // no default, return undefined
	    if (!hasOwn(prop, 'default')) {
	      return undefined;
	    }
	    var def = prop.default;
	    // warn against non-factory defaults for Object & Array
	    if (isObject(def)) {
	      "development" !== 'production' && warn('Invalid default value for prop "' + name + '": ' + 'Props with type Object/Array must use a factory function ' + 'to return the default value.', vm);
	    }
	    // call factory function for non-Function types
	    return typeof def === 'function' && prop.type !== Function ? def.call(vm) : def;
	  }
	
	  /**
	   * Assert whether a prop is valid.
	   */
	  function assertProp(prop, name, value, vm, absent) {
	    if (prop.required && absent) {
	      warn('Missing required prop: "' + name + '"', vm);
	      return;
	    }
	    if (value == null && !prop.required) {
	      return;
	    }
	    var type = prop.type;
	    var valid = !type;
	    var expectedTypes = [];
	    if (type) {
	      if (!Array.isArray(type)) {
	        type = [type];
	      }
	      for (var i = 0; i < type.length && !valid; i++) {
	        var assertedType = assertType(value, type[i]);
	        expectedTypes.push(assertedType.expectedType);
	        valid = assertedType.valid;
	      }
	    }
	    if (!valid) {
	      warn('Invalid prop: type check failed for prop "' + name + '".' + ' Expected ' + expectedTypes.map(capitalize).join(', ') + ', got ' + Object.prototype.toString.call(value).slice(8, -1) + '.', vm);
	      return;
	    }
	    var validator = prop.validator;
	    if (validator) {
	      if (!validator(value)) {
	        warn('Invalid prop: custom validator check failed for prop "' + name + '".', vm);
	      }
	    }
	  }
	
	  /**
	   * Assert the type of a value
	   */
	  function assertType(value, type) {
	    var valid = void 0;
	    var expectedType = void 0;
	    if (type === String) {
	      expectedType = 'string';
	      valid = typeof value === expectedType;
	    } else if (type === Number) {
	      expectedType = 'number';
	      valid = typeof value === expectedType;
	    } else if (type === Boolean) {
	      expectedType = 'boolean';
	      valid = typeof value === expectedType;
	    } else if (type === Function) {
	      expectedType = 'function';
	      valid = typeof value === expectedType;
	    } else if (type === Object) {
	      expectedType = 'Object';
	      valid = isPlainObject(value);
	    } else if (type === Array) {
	      expectedType = 'Array';
	      valid = Array.isArray(value);
	    } else {
	      expectedType = type.name || type.toString();
	      valid = value instanceof type;
	    }
	    return {
	      valid: valid,
	      expectedType: expectedType
	    };
	  }
	
	
	
	  var util = Object.freeze({
	  	defineReactive: defineReactive,
	  	_toString: _toString,
	  	toNumber: toNumber,
	  	makeMap: makeMap,
	  	isBuiltInTag: isBuiltInTag,
	  	remove: remove,
	  	hasOwn: hasOwn,
	  	isPrimitive: isPrimitive,
	  	cached: cached,
	  	camelize: camelize,
	  	capitalize: capitalize,
	  	hyphenate: hyphenate,
	  	bind: bind,
	  	toArray: toArray,
	  	extend: extend,
	  	isObject: isObject,
	  	isPlainObject: isPlainObject,
	  	toObject: toObject,
	  	noop: noop,
	  	no: no,
	  	genStaticKeys: genStaticKeys,
	  	isReserved: isReserved,
	  	def: def,
	  	parsePath: parsePath,
	  	hasProto: hasProto,
	  	inBrowser: inBrowser,
	  	devtools: devtools,
	  	UA: UA,
	  	nextTick: nextTick,
	  	get _Set () { return _Set; },
	  	mergeOptions: mergeOptions,
	  	resolveAsset: resolveAsset,
	  	get warn () { return warn; },
	  	get formatComponentName () { return formatComponentName; },
	  	validateProp: validateProp
	  });
	
	  function initUse(Vue) {
	    Vue.use = function (plugin) {
	      /* istanbul ignore if */
	      if (plugin.installed) {
	        return;
	      }
	      // additional parameters
	      var args = toArray(arguments, 1);
	      args.unshift(this);
	      if (typeof plugin.install === 'function') {
	        plugin.install.apply(plugin, args);
	      } else {
	        plugin.apply(null, args);
	      }
	      plugin.installed = true;
	      return this;
	    };
	  }
	
	  function initMixin$1(Vue) {
	    Vue.mixin = function (mixin) {
	      Vue.options = mergeOptions(Vue.options, mixin);
	    };
	  }
	
	  function initExtend(Vue) {
	    /**
	     * Each instance constructor, including Vue, has a unique
	     * cid. This enables us to create wrapped "child
	     * constructors" for prototypal inheritance and cache them.
	     */
	    Vue.cid = 0;
	    var cid = 1;
	
	    /**
	     * Class inheritance
	     */
	    Vue.extend = function (extendOptions) {
	      extendOptions = extendOptions || {};
	      var Super = this;
	      var isFirstExtend = Super.cid === 0;
	      if (isFirstExtend && extendOptions._Ctor) {
	        return extendOptions._Ctor;
	      }
	      var name = extendOptions.name || Super.options.name;
	      if (true) {
	        if (!/^[a-zA-Z][\w-]*$/.test(name)) {
	          warn('Invalid component name: "' + name + '". Component names ' + 'can only contain alphanumeric characaters and the hyphen.');
	          name = null;
	        }
	      }
	      var Sub = function VueComponent(options) {
	        this._init(options);
	      };
	      Sub.prototype = Object.create(Super.prototype);
	      Sub.prototype.constructor = Sub;
	      Sub.cid = cid++;
	      Sub.options = mergeOptions(Super.options, extendOptions);
	      Sub['super'] = Super;
	      // allow further extension
	      Sub.extend = Super.extend;
	      // create asset registers, so extended classes
	      // can have their private assets too.
	      config._assetTypes.forEach(function (type) {
	        Sub[type] = Super[type];
	      });
	      // enable recursive self-lookup
	      if (name) {
	        Sub.options.components[name] = Sub;
	      }
	      // keep a reference to the super options at extension time.
	      // later at instantiation we can check if Super's options have
	      // been updated.
	      Sub.superOptions = Super.options;
	      Sub.extendOptions = extendOptions;
	      // cache constructor
	      if (isFirstExtend) {
	        extendOptions._Ctor = Sub;
	      }
	      return Sub;
	    };
	  }
	
	  function initAssetRegisters(Vue) {
	    /**
	     * Create asset registration methods.
	     */
	    config._assetTypes.forEach(function (type) {
	      Vue[type] = function (id, definition) {
	        if (!definition) {
	          return this.options[type + 's'][id];
	        } else {
	          /* istanbul ignore if */
	          if (true) {
	            if (type === 'component' && config.isReservedTag(id)) {
	              warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + id);
	            }
	          }
	          if (type === 'component' && isPlainObject(definition)) {
	            definition.name = definition.name || id;
	            definition = Vue.extend(definition);
	          }
	          if (type === 'directive' && typeof definition === 'function') {
	            definition = { bind: definition, update: definition };
	          }
	          this.options[type + 's'][id] = definition;
	          return definition;
	        }
	      };
	    });
	  }
	
	  var KeepAlive = {
	    name: 'keep-alive',
	    abstract: true,
	    props: {
	      child: Object
	    },
	    created: function created() {
	      this.cache = Object.create(null);
	    },
	    render: function render() {
	      var rawChild = this.child;
	      var realChild = getRealChild(this.child);
	      if (realChild && realChild.componentOptions) {
	        var opts = realChild.componentOptions;
	        // same constructor may get registered as different local components
	        // so cid alone is not enough (#3269)
	        var key = opts.Ctor.cid + '::' + opts.tag;
	        if (this.cache[key]) {
	          var child = realChild.child = this.cache[key].child;
	          realChild.elm = this.$el = child.$el;
	        } else {
	          this.cache[key] = realChild;
	        }
	        realChild.data.keepAlive = true;
	      }
	      return rawChild;
	    },
	    destroyed: function destroyed() {
	      for (var key in this.cache) {
	        var vnode = this.cache[key];
	        callHook(vnode.child, 'deactivated');
	        vnode.child.$destroy();
	      }
	    }
	  };
	
	  var builtInComponents = {
	    KeepAlive: KeepAlive
	  };
	
	  function initGlobalAPI(Vue) {
	    // config
	    var configDef = {};
	    configDef.get = function () {
	      return config;
	    };
	    if (true) {
	      configDef.set = function () {
	        warn('Do not replace the Vue.config object, set individual fields instead.');
	      };
	    }
	    Object.defineProperty(Vue, 'config', configDef);
	    Vue.util = util;
	    Vue.set = set;
	    Vue.delete = del;
	    Vue.nextTick = nextTick;
	
	    Vue.options = Object.create(null);
	    config._assetTypes.forEach(function (type) {
	      Vue.options[type + 's'] = Object.create(null);
	    });
	
	    extend(Vue.options.components, builtInComponents);
	
	    initUse(Vue);
	    initMixin$1(Vue);
	    initExtend(Vue);
	    initAssetRegisters(Vue);
	  }
	
	  initGlobalAPI(Vue);
	
	  Object.defineProperty(Vue.prototype, '$isServer', {
	    get: function get() {
	      return config._isServer;
	    }
	  });
	
	  Vue.version = '2.0.0-beta.6';
	
	  // attributes that should be using props for binding
	  var mustUseProp = makeMap('value,selected,checked,muted');
	
	  var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');
	
	  var isBooleanAttr = makeMap('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' + 'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' + 'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' + 'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' + 'required,reversed,scoped,seamless,selected,sortable,translate,' + 'truespeed,typemustmatch,visible');
	
	  var isAttr = makeMap('accept,accept-charset,accesskey,action,align,alt,async,autocomplete,' + 'autofocus,autoplay,autosave,bgcolor,border,buffered,challenge,charset,' + 'checked,cite,class,code,codebase,color,cols,colspan,content,http-equiv,' + 'name,contenteditable,contextmenu,controls,coords,data,datetime,default,' + 'defer,dir,dirname,disabled,download,draggable,dropzone,enctype,method,for,' + 'form,formaction,headers,<th>,height,hidden,high,href,hreflang,http-equiv,' + 'icon,id,ismap,itemprop,keytype,kind,label,lang,language,list,loop,low,' + 'manifest,max,maxlength,media,method,GET,POST,min,multiple,email,file,' + 'muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,' + 'preload,radiogroup,readonly,rel,required,reversed,rows,rowspan,sandbox,' + 'scope,scoped,seamless,selected,shape,size,type,text,password,sizes,span,' + 'spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,' + 'target,title,type,usemap,value,width,wrap');
	
	  var xlinkNS = 'http://www.w3.org/1999/xlink';
	
	  var isXlink = function isXlink(name) {
	    return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink';
	  };
	
	  var getXlinkProp = function getXlinkProp(name) {
	    return isXlink(name) ? name.slice(6, name.length) : '';
	  };
	
	  var isFalsyAttrValue = function isFalsyAttrValue(val) {
	    return val == null || val === false;
	  };
	
	  function genClassForVnode(vnode) {
	    var data = vnode.data;
	    var parentNode = vnode;
	    var childNode = vnode;
	    while (childNode.child) {
	      childNode = childNode.child._vnode;
	      if (childNode.data) {
	        data = mergeClassData(childNode.data, data);
	      }
	    }
	    while (parentNode = parentNode.parent) {
	      if (parentNode.data) {
	        data = mergeClassData(data, parentNode.data);
	      }
	    }
	    return genClassFromData(data);
	  }
	
	  function mergeClassData(child, parent) {
	    return {
	      staticClass: concat(child.staticClass, parent.staticClass),
	      class: child.class ? [child.class, parent.class] : parent.class
	    };
	  }
	
	  function genClassFromData(data) {
	    var dynamicClass = data.class;
	    var staticClass = data.staticClass;
	    if (staticClass || dynamicClass) {
	      return concat(staticClass, stringifyClass(dynamicClass));
	    }
	    /* istanbul ignore next */
	    return '';
	  }
	
	  function concat(a, b) {
	    return a ? b ? a + ' ' + b : a : b || '';
	  }
	
	  function stringifyClass(value) {
	    var res = '';
	    if (!value) {
	      return res;
	    }
	    if (typeof value === 'string') {
	      return value;
	    }
	    if (Array.isArray(value)) {
	      var stringified = void 0;
	      for (var i = 0, l = value.length; i < l; i++) {
	        if (value[i]) {
	          if (stringified = stringifyClass(value[i])) {
	            res += stringified + ' ';
	          }
	        }
	      }
	      return res.slice(0, -1);
	    }
	    if (isObject(value)) {
	      for (var key in value) {
	        if (value[key]) res += key + ' ';
	      }
	      return res.slice(0, -1);
	    }
	    /* istanbul ignore next */
	    return res;
	  }
	
	  var namespaceMap = {
	    svg: 'http://www.w3.org/2000/svg',
	    math: 'http://www.w3.org/1998/Math/MathML'
	  };
	
	  var isHTMLTag = makeMap('html,body,base,head,link,meta,style,title,' + 'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' + 'div,dd,dl,dt,figcaption,figure,hr,img,li,main,ol,p,pre,ul,' + 'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' + 's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' + 'embed,object,param,source,canvas,script,noscript,del,ins,' + 'caption,col,colgroup,table,thead,tbody,td,th,tr,' + 'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' + 'output,progress,select,textarea,' + 'details,dialog,menu,menuitem,summary,' + 'content,element,shadow,template');
	
	  var isUnaryTag = makeMap('area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' + 'link,meta,param,source,track,wbr', true);
	
	  // Elements that you can, intentionally, leave open
	  // (and which close themselves)
	  var canBeLeftOpenTag = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source', true);
	
	  // HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
	  // Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
	  var isNonPhrasingTag = makeMap('address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' + 'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' + 'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' + 'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' + 'title,tr,track', true);
	
	  // this map is intentionally selective, only covering SVG elements that may
	  // contain child elements.
	  var isSVG = makeMap('svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font,' + 'font-face,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' + 'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view', true);
	
	  var isPreTag = function isPreTag(tag) {
	    return tag === 'pre';
	  };
	
	  var isReservedTag = function isReservedTag(tag) {
	    return isHTMLTag(tag) || isSVG(tag);
	  };
	
	  function getTagNamespace(tag) {
	    if (isSVG(tag)) {
	      return 'svg';
	    }
	    // basic support for MathML
	    // note it doesn't support other MathML elements being component roots
	    if (tag === 'math') {
	      return 'math';
	    }
	  }
	
	  var unknownElementCache = Object.create(null);
	  function isUnknownElement(tag) {
	    /* istanbul ignore if */
	    if (!inBrowser) {
	      return true;
	    }
	    if (isReservedTag(tag)) {
	      return false;
	    }
	    tag = tag.toLowerCase();
	    /* istanbul ignore if */
	    if (unknownElementCache[tag] != null) {
	      return unknownElementCache[tag];
	    }
	    var el = document.createElement(tag);
	    if (tag.indexOf('-') > -1) {
	      // http://stackoverflow.com/a/28210364/1070244
	      return unknownElementCache[tag] = el.constructor === window.HTMLUnknownElement || el.constructor === window.HTMLElement;
	    } else {
	      return unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString());
	    }
	  }
	
	  var UA$1 = inBrowser && window.navigator.userAgent.toLowerCase();
	  var isIE = UA$1 && /msie|trident/.test(UA$1);
	  var isIE9 = UA$1 && UA$1.indexOf('msie 9.0') > 0;
	  var isAndroid = UA$1 && UA$1.indexOf('android') > 0;
	
	  // some browsers, e.g. PhantomJS, encodes angular brackets
	  // inside attribute values when retrieving innerHTML.
	  // this causes problems with the in-browser parser.
	  var shouldDecodeTags = inBrowser ? function () {
	    var div = document.createElement('div');
	    div.innerHTML = '<div a=">">';
	    return div.innerHTML.indexOf('&gt;') > 0;
	  }() : false;
	
	  /**
	   * Query an element selector if it's not an element already.
	   */
	  function query(el) {
	    if (typeof el === 'string') {
	      var selector = el;
	      el = document.querySelector(el);
	      if (!el) {
	        "development" !== 'production' && warn('Cannot find element: ' + selector);
	        return document.createElement('div');
	      }
	    }
	    return el;
	  }
	
	  function createElement$1(tagName) {
	    return document.createElement(tagName);
	  }
	
	  function createElementNS(namespace, tagName) {
	    return document.createElementNS(namespaceMap[namespace], tagName);
	  }
	
	  function createTextNode(text) {
	    return document.createTextNode(text);
	  }
	
	  function insertBefore(parentNode, newNode, referenceNode) {
	    parentNode.insertBefore(newNode, referenceNode);
	  }
	
	  function removeChild(node, child) {
	    node.removeChild(child);
	  }
	
	  function appendChild(node, child) {
	    node.appendChild(child);
	  }
	
	  function parentNode(node) {
	    return node.parentNode;
	  }
	
	  function nextSibling(node) {
	    return node.nextSibling;
	  }
	
	  function tagName(node) {
	    return node.tagName;
	  }
	
	  function setTextContent(node, text) {
	    node.textContent = text;
	  }
	
	  function childNodes(node) {
	    return node.childNodes;
	  }
	
	  function setAttribute(node, key, val) {
	    node.setAttribute(key, val);
	  }
	
	var nodeOps = Object.freeze({
	    createElement: createElement$1,
	    createElementNS: createElementNS,
	    createTextNode: createTextNode,
	    insertBefore: insertBefore,
	    removeChild: removeChild,
	    appendChild: appendChild,
	    parentNode: parentNode,
	    nextSibling: nextSibling,
	    tagName: tagName,
	    setTextContent: setTextContent,
	    childNodes: childNodes,
	    setAttribute: setAttribute
	  });
	
	  var emptyData = {};
	  var emptyNode = new VNode('', emptyData, []);
	  var hooks$1 = ['create', 'update', 'postpatch', 'remove', 'destroy'];
	
	  function isUndef(s) {
	    return s == null;
	  }
	
	  function isDef(s) {
	    return s != null;
	  }
	
	  function sameVnode(vnode1, vnode2) {
	    if (vnode1.isStatic || vnode2.isStatic) {
	      return vnode1 === vnode2;
	    }
	    return vnode1.key === vnode2.key && vnode1.tag === vnode2.tag && !vnode1.data === !vnode2.data;
	  }
	
	  function createKeyToOldIdx(children, beginIdx, endIdx) {
	    var i = void 0,
	        key = void 0;
	    var map = {};
	    for (i = beginIdx; i <= endIdx; ++i) {
	      key = children[i].key;
	      if (isDef(key)) map[key] = i;
	    }
	    return map;
	  }
	
	  function createPatchFunction(backend) {
	    var i = void 0,
	        j = void 0;
	    var cbs = {};
	
	    var modules = backend.modules;
	    var nodeOps = backend.nodeOps;
	
	
	    for (i = 0; i < hooks$1.length; ++i) {
	      cbs[hooks$1[i]] = [];
	      for (j = 0; j < modules.length; ++j) {
	        if (modules[j][hooks$1[i]] !== undefined) cbs[hooks$1[i]].push(modules[j][hooks$1[i]]);
	      }
	    }
	
	    function emptyNodeAt(elm) {
	      return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm);
	    }
	
	    function createRmCb(childElm, listeners) {
	      function remove() {
	        if (--remove.listeners === 0) {
	          removeElement(childElm);
	        }
	      }
	      remove.listeners = listeners;
	      return remove;
	    }
	
	    function removeElement(el) {
	      var parent = nodeOps.parentNode(el);
	      nodeOps.removeChild(parent, el);
	    }
	
	    function createElm(vnode, insertedVnodeQueue) {
	      var i = void 0,
	          elm = void 0;
	      var data = vnode.data;
	      if (isDef(data)) {
	        if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode);
	        // after calling the init hook, if the vnode is a child component
	        // it should've created a child instance and mounted it. the child
	        // component also has set the placeholder vnode's elm.
	        // in that case we can just return the element and be done.
	        if (isDef(i = vnode.child)) {
	          if (vnode.data.pendingInsert) {
	            insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
	          }
	          vnode.elm = vnode.child.$el;
	          invokeCreateHooks(vnode, insertedVnodeQueue);
	          setScope(vnode);
	          return vnode.elm;
	        }
	      }
	      var children = vnode.children;
	      var tag = vnode.tag;
	      if (isDef(tag)) {
	        if (true) {
	          if (!vnode.ns && !(config.ignoredElements && config.ignoredElements.indexOf(tag) > -1) && config.isUnknownElement(tag)) {
	            warn('Unknown custom element: <' + tag + '> - did you ' + 'register the component correctly? For recursive components, ' + 'make sure to provide the "name" option.', vnode.context);
	          }
	        }
	        elm = vnode.elm = vnode.ns ? nodeOps.createElementNS(vnode.ns, tag) : nodeOps.createElement(tag);
	        setScope(vnode);
	        if (Array.isArray(children)) {
	          for (i = 0; i < children.length; ++i) {
	            nodeOps.appendChild(elm, createElm(children[i], insertedVnodeQueue));
	          }
	        } else if (isPrimitive(vnode.text)) {
	          nodeOps.appendChild(elm, nodeOps.createTextNode(vnode.text));
	        }
	        if (isDef(data)) {
	          invokeCreateHooks(vnode, insertedVnodeQueue);
	        }
	      } else {
	        elm = vnode.elm = nodeOps.createTextNode(vnode.text);
	      }
	      return vnode.elm;
	    }
	
	    function invokeCreateHooks(vnode, insertedVnodeQueue) {
	      for (var _i = 0; _i < cbs.create.length; ++_i) {
	        cbs.create[_i](emptyNode, vnode);
	      }
	      i = vnode.data.hook; // Reuse variable
	      if (isDef(i)) {
	        if (i.create) i.create(emptyNode, vnode);
	        if (i.insert) insertedVnodeQueue.push(vnode);
	      }
	    }
	
	    // set scope id attribute for scoped CSS.
	    // this is implemented as a special case to avoid the overhead
	    // of going through the normal attribute patching process.
	    function setScope(vnode) {
	      var i = void 0;
	      if (isDef(i = vnode.host) && isDef(i = i.$options._scopeId)) {
	        nodeOps.setAttribute(vnode.elm, i, '');
	      }
	      if (isDef(i = vnode.context) && isDef(i = i.$options._scopeId)) {
	        nodeOps.setAttribute(vnode.elm, i, '');
	      }
	    }
	
	    function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
	      for (; startIdx <= endIdx; ++startIdx) {
	        nodeOps.insertBefore(parentElm, createElm(vnodes[startIdx], insertedVnodeQueue), before);
	      }
	    }
	
	    function invokeDestroyHook(vnode) {
	      var i = void 0,
	          j = void 0;
	      var data = vnode.data;
	      if (isDef(data)) {
	        if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);
	        for (i = 0; i < cbs.destroy.length; ++i) {
	          cbs.destroy[i](vnode);
	        }
	      }
	      if (isDef(i = vnode.child) && !data.keepAlive) {
	        invokeDestroyHook(i._vnode);
	      }
	      if (isDef(i = vnode.children)) {
	        for (j = 0; j < vnode.children.length; ++j) {
	          invokeDestroyHook(vnode.children[j]);
	        }
	      }
	    }
	
	    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
	      for (; startIdx <= endIdx; ++startIdx) {
	        var ch = vnodes[startIdx];
	        if (isDef(ch)) {
	          if (isDef(ch.tag)) {
	            invokeDestroyHook(ch);
	            removeAndInvokeRemoveHook(ch);
	          } else {
	            // Text node
	            nodeOps.removeChild(parentElm, ch.elm);
	          }
	        }
	      }
	    }
	
	    function removeAndInvokeRemoveHook(vnode, rm) {
	      if (rm || isDef(vnode.data)) {
	        var listeners = cbs.remove.length + 1;
	        if (!rm) {
	          // directly removing
	          rm = createRmCb(vnode.elm, listeners);
	        } else {
	          // we have a recursively passed down rm callback
	          // increase the listeners count
	          rm.listeners += listeners;
	        }
	        // recursively invoke hooks on child component root node
	        if (isDef(i = vnode.child) && isDef(i = i._vnode) && isDef(i.data)) {
	          removeAndInvokeRemoveHook(i, rm);
	        }
	        for (i = 0; i < cbs.remove.length; ++i) {
	          cbs.remove[i](vnode, rm);
	        }
	        if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
	          i(vnode, rm);
	        } else {
	          rm();
	        }
	      } else {
	        removeElement(vnode.elm);
	      }
	    }
	
	    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
	      var oldStartIdx = 0;
	      var newStartIdx = 0;
	      var oldEndIdx = oldCh.length - 1;
	      var oldStartVnode = oldCh[0];
	      var oldEndVnode = oldCh[oldEndIdx];
	      var newEndIdx = newCh.length - 1;
	      var newStartVnode = newCh[0];
	      var newEndVnode = newCh[newEndIdx];
	      var oldKeyToIdx = void 0,
	          idxInOld = void 0,
	          elmToMove = void 0,
	          before = void 0;
	
	      // removeOnly is a special flag used only by <transition-group>
	      // to ensure removed elements stay in correct relative positions
	      // during leaving transitions
	      var canMove = !removeOnly;
	
	      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
	        if (isUndef(oldStartVnode)) {
	          oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
	        } else if (isUndef(oldEndVnode)) {
	          oldEndVnode = oldCh[--oldEndIdx];
	        } else if (sameVnode(oldStartVnode, newStartVnode)) {
	          patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
	          oldStartVnode = oldCh[++oldStartIdx];
	          newStartVnode = newCh[++newStartIdx];
	        } else if (sameVnode(oldEndVnode, newEndVnode)) {
	          patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
	          oldEndVnode = oldCh[--oldEndIdx];
	          newEndVnode = newCh[--newEndIdx];
	        } else if (sameVnode(oldStartVnode, newEndVnode)) {
	          // Vnode moved right
	          patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
	          canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
	          oldStartVnode = oldCh[++oldStartIdx];
	          newEndVnode = newCh[--newEndIdx];
	        } else if (sameVnode(oldEndVnode, newStartVnode)) {
	          // Vnode moved left
	          patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
	          canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
	          oldEndVnode = oldCh[--oldEndIdx];
	          newStartVnode = newCh[++newStartIdx];
	        } else {
	          if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
	          idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : newStartVnode.isStatic ? oldCh.indexOf(newStartVnode) : null;
	          if (isUndef(idxInOld) || idxInOld === -1) {
	            // New element
	            nodeOps.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
	            newStartVnode = newCh[++newStartIdx];
	          } else {
	            elmToMove = oldCh[idxInOld];
	            /* istanbul ignore if */
	            if ("development" !== 'production' && !elmToMove) {
	              warn('It seems there are duplicate keys that is causing an update error. ' + 'Make sure each v-for item has a unique key.');
	            }
	            if (elmToMove.tag !== newStartVnode.tag) {
	              // same key but different element. treat as new element
	              nodeOps.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
	              newStartVnode = newCh[++newStartIdx];
	            } else {
	              patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
	              oldCh[idxInOld] = undefined;
	              canMove && nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm);
	              newStartVnode = newCh[++newStartIdx];
	            }
	          }
	        }
	      }
	      if (oldStartIdx > oldEndIdx) {
	        before = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
	        addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
	      } else if (newStartIdx > newEndIdx) {
	        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
	      }
	    }
	
	    function patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly) {
	      if (oldVnode === vnode) return;
	      var i = void 0,
	          hook = void 0;
	      var hasData = isDef(i = vnode.data);
	      if (hasData && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
	        i(oldVnode, vnode);
	      }
	      var elm = vnode.elm = oldVnode.elm;
	      var oldCh = oldVnode.children;
	      var ch = vnode.children;
	      if (hasData) {
	        for (i = 0; i < cbs.update.length; ++i) {
	          cbs.update[i](oldVnode, vnode);
	        }if (isDef(hook) && isDef(i = hook.update)) i(oldVnode, vnode);
	      }
	      if (isUndef(vnode.text)) {
	        if (isDef(oldCh) && isDef(ch)) {
	          if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
	        } else if (isDef(ch)) {
	          if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '');
	          addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
	        } else if (isDef(oldCh)) {
	          removeVnodes(elm, oldCh, 0, oldCh.length - 1);
	        } else if (isDef(oldVnode.text)) {
	          nodeOps.setTextContent(elm, '');
	        }
	      } else if (oldVnode.text !== vnode.text) {
	        nodeOps.setTextContent(elm, vnode.text);
	      }
	      if (hasData) {
	        for (i = 0; i < cbs.postpatch.length; ++i) {
	          cbs.postpatch[i](oldVnode, vnode);
	        }if (isDef(hook) && isDef(i = hook.postpatch)) i(oldVnode, vnode);
	      }
	    }
	
	    function invokeInsertHook(vnode, queue, initial) {
	      // delay insert hooks for component root nodes, invoke them after the
	      // element is really inserted
	      if (initial && vnode.parent) {
	        vnode.parent.data.pendingInsert = queue;
	      } else {
	        for (var _i2 = 0; _i2 < queue.length; ++_i2) {
	          queue[_i2].data.hook.insert(queue[_i2]);
	        }
	      }
	    }
	
	    function hydrate(elm, vnode, insertedVnodeQueue) {
	      if (true) {
	        if (!assertNodeMatch(elm, vnode)) {
	          return false;
	        }
	      }
	      vnode.elm = elm;
	      var tag = vnode.tag;
	      var data = vnode.data;
	      var children = vnode.children;
	
	      if (isDef(data)) {
	        if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode, true /* hydrating */);
	        if (isDef(i = vnode.child)) {
	          // child component. it should have hydrated its own tree.
	          invokeCreateHooks(vnode, insertedVnodeQueue);
	          return true;
	        }
	      }
	      if (isDef(tag)) {
	        if (isDef(children)) {
	          var childNodes = nodeOps.childNodes(elm);
	          for (var _i3 = 0; _i3 < children.length; _i3++) {
	            var success = hydrate(childNodes[_i3], children[_i3], insertedVnodeQueue);
	            if (!success) {
	              return false;
	            }
	          }
	        }
	        if (isDef(data)) {
	          invokeCreateHooks(vnode, insertedVnodeQueue);
	        }
	      }
	      return true;
	    }
	
	    function assertNodeMatch(node, vnode) {
	      var match = true;
	      if (!node) {
	        match = false;
	      } else if (vnode.tag) {
	        match = vnode.tag.indexOf('vue-component') === 0 || vnode.tag === nodeOps.tagName(node).toLowerCase();
	      } else {
	        match = _toString(vnode.text) === node.data;
	      }
	      if ("development" !== 'production' && !match) {
	        warn('The client-side rendered virtual DOM tree is not matching ' + 'server-rendered content. Bailing hydration and performing ' + 'full client-side render.');
	      }
	      return match;
	    }
	
	    return function patch(oldVnode, vnode, hydrating, removeOnly) {
	      var elm = void 0,
	          parent = void 0;
	      var isInitialPatch = false;
	      var insertedVnodeQueue = [];
	
	      if (!oldVnode) {
	        // empty mount, create new root element
	        isInitialPatch = true;
	        createElm(vnode, insertedVnodeQueue);
	      } else {
	        var isRealElement = isDef(oldVnode.nodeType);
	        if (!isRealElement && sameVnode(oldVnode, vnode)) {
	          patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
	        } else {
	          if (isRealElement) {
	            // mounting to a real element
	            // check if this is server-rendered content and if we can perform
	            // a successful hydration.
	            if (oldVnode.hasAttribute('server-rendered')) {
	              oldVnode.removeAttribute('server-rendered');
	              hydrating = true;
	            }
	            if (hydrating) {
	              if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
	                invokeInsertHook(vnode, insertedVnodeQueue, true);
	                return oldVnode;
	              }
	            }
	            // either not server-rendered, or hydration failed.
	            // create an empty node and replace it
	            oldVnode = emptyNodeAt(oldVnode);
	          }
	          elm = oldVnode.elm;
	          parent = nodeOps.parentNode(elm);
	
	          createElm(vnode, insertedVnodeQueue);
	
	          // component root element replaced.
	          // update parent placeholder node element.
	          if (vnode.parent) {
	            vnode.parent.elm = vnode.elm;
	            for (var _i4 = 0; _i4 < cbs.create.length; ++_i4) {
	              cbs.create[_i4](emptyNode, vnode.parent);
	            }
	          }
	
	          if (parent !== null) {
	            nodeOps.insertBefore(parent, vnode.elm, nodeOps.nextSibling(elm));
	            removeVnodes(parent, [oldVnode], 0, 0);
	          } else if (isDef(oldVnode.tag)) {
	            invokeDestroyHook(oldVnode);
	          }
	        }
	      }
	
	      invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
	      return vnode.elm;
	    };
	  }
	
	  var directives = {
	    create: function bindDirectives(oldVnode, vnode) {
	      applyDirectives(oldVnode, vnode, 'bind');
	    },
	    update: function updateDirectives(oldVnode, vnode) {
	      applyDirectives(oldVnode, vnode, 'update');
	    },
	    postpatch: function postupdateDirectives(oldVnode, vnode) {
	      applyDirectives(oldVnode, vnode, 'componentUpdated');
	    },
	    destroy: function unbindDirectives(vnode) {
	      applyDirectives(vnode, vnode, 'unbind');
	    }
	  };
	
	  var emptyModifiers = Object.create(null);
	
	  function applyDirectives(oldVnode, vnode, hook) {
	    var dirs = vnode.data.directives;
	    if (dirs) {
	      var oldDirs = oldVnode.data.directives;
	      var isUpdate = hook === 'update';
	      for (var i = 0; i < dirs.length; i++) {
	        var dir = dirs[i];
	        var def = resolveAsset(vnode.context.$options, 'directives', dir.name, true);
	        var fn = def && def[hook];
	        if (fn) {
	          if (isUpdate && oldDirs) {
	            dir.oldValue = oldDirs[i].value;
	          }
	          if (!dir.modifiers) {
	            dir.modifiers = emptyModifiers;
	          }
	          fn(vnode.elm, dir, vnode, oldVnode);
	        }
	      }
	    }
	  }
	
	  var ref = {
	    create: function create(_, vnode) {
	      registerRef(vnode);
	    },
	    update: function update(oldVnode, vnode) {
	      if (oldVnode.data.ref !== vnode.data.ref) {
	        registerRef(oldVnode, true);
	        registerRef(vnode);
	      }
	    },
	    destroy: function destroy(vnode) {
	      registerRef(vnode, true);
	    }
	  };
	
	  function registerRef(vnode, isRemoval) {
	    var key = vnode.data.ref;
	    if (!key) return;
	
	    var vm = vnode.context;
	    var ref = vnode.child || vnode.elm;
	    var refs = vm.$refs;
	    if (isRemoval) {
	      if (Array.isArray(refs[key])) {
	        remove(refs[key], ref);
	      } else if (refs[key] === ref) {
	        refs[key] = undefined;
	      }
	    } else {
	      if (vnode.data.refInFor) {
	        if (Array.isArray(refs[key])) {
	          refs[key].push(ref);
	        } else {
	          refs[key] = [ref];
	        }
	      } else {
	        refs[key] = ref;
	      }
	    }
	  }
	
	  var baseModules = [ref, directives];
	
	  function updateAttrs(oldVnode, vnode) {
	    if (!oldVnode.data.attrs && !vnode.data.attrs) {
	      return;
	    }
	    var key = void 0,
	        cur = void 0,
	        old = void 0;
	    var elm = vnode.elm;
	    var oldAttrs = oldVnode.data.attrs || {};
	    var attrs = vnode.data.attrs || {};
	    // clone observed objects, as the user probably wants to mutate it
	    if (attrs.__ob__) {
	      attrs = vnode.data.attrs = extend({}, attrs);
	    }
	
	    for (key in attrs) {
	      cur = attrs[key];
	      old = oldAttrs[key];
	      if (old !== cur) {
	        setAttr(elm, key, cur);
	      }
	    }
	    for (key in oldAttrs) {
	      if (attrs[key] == null) {
	        if (isXlink(key)) {
	          elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
	        } else if (!isEnumeratedAttr(key)) {
	          elm.removeAttribute(key);
	        }
	      }
	    }
	  }
	
	  function setAttr(el, key, value) {
	    if (isBooleanAttr(key)) {
	      // set attribute for blank value
	      // e.g. <option disabled>Select one</option>
	      if (isFalsyAttrValue(value)) {
	        el.removeAttribute(key);
	      } else {
	        el.setAttribute(key, key);
	      }
	    } else if (isEnumeratedAttr(key)) {
	      el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
	    } else if (isXlink(key)) {
	      if (isFalsyAttrValue(value)) {
	        el.removeAttributeNS(xlinkNS, getXlinkProp(key));
	      } else {
	        el.setAttributeNS(xlinkNS, key, value);
	      }
	    } else {
	      if (isFalsyAttrValue(value)) {
	        el.removeAttribute(key);
	      } else {
	        el.setAttribute(key, value);
	      }
	    }
	  }
	
	  var attrs = {
	    create: updateAttrs,
	    update: updateAttrs
	  };
	
	  function updateClass(oldVnode, vnode) {
	    var el = vnode.elm;
	    var data = vnode.data;
	    var oldData = oldVnode.data;
	    if (!data.staticClass && !data.class && (!oldData || !oldData.staticClass && !oldData.class)) {
	      return;
	    }
	
	    var cls = genClassForVnode(vnode);
	
	    // handle transition classes
	    var transitionClass = el._transitionClasses;
	    if (transitionClass) {
	      cls = concat(cls, stringifyClass(transitionClass));
	    }
	
	    // set the class
	    if (cls !== el._prevClass) {
	      el.setAttribute('class', cls);
	      el._prevClass = cls;
	    }
	  }
	
	  var klass = {
	    create: updateClass,
	    update: updateClass
	  };
	
	  function updateDOMListeners(oldVnode, vnode) {
	    if (!oldVnode.data.on && !vnode.data.on) {
	      return;
	    }
	    var on = vnode.data.on || {};
	    var oldOn = oldVnode.data.on || {};
	    var add = vnode.elm._v_add || (vnode.elm._v_add = function (event, handler, capture) {
	      vnode.elm.addEventListener(event, handler, capture);
	    });
	    var remove = vnode.elm._v_remove || (vnode.elm._v_remove = function (event, handler) {
	      vnode.elm.removeEventListener(event, handler);
	    });
	    updateListeners(on, oldOn, add, remove);
	  }
	
	  var events = {
	    create: updateDOMListeners,
	    update: updateDOMListeners
	  };
	
	  function updateDOMProps(oldVnode, vnode) {
	    if (!oldVnode.data.domProps && !vnode.data.domProps) {
	      return;
	    }
	    var key = void 0,
	        cur = void 0;
	    var elm = vnode.elm;
	    var oldProps = oldVnode.data.domProps || {};
	    var props = vnode.data.domProps || {};
	    // clone observed objects, as the user probably wants to mutate it
	    if (props.__ob__) {
	      props = vnode.data.domProps = extend({}, props);
	    }
	
	    for (key in oldProps) {
	      if (props[key] == null) {
	        elm[key] = undefined;
	      }
	    }
	    for (key in props) {
	      // ignore children if the node has textContent or innerHTML,
	      // as these will throw away existing DOM nodes and cause removal errors
	      // on subsequent patches (#3360)
	      if ((key === 'textContent' || key === 'innerHTML') && vnode.children) {
	        vnode.children.length = 0;
	      }
	      cur = props[key];
	      if (key === 'value') {
	        // store value as _value as well since
	        // non-string values will be stringified
	        elm._value = cur;
	        // avoid resetting cursor position when value is the same
	        var strCur = cur == null ? '' : String(cur);
	        if (elm.value !== strCur) {
	          elm.value = strCur;
	        }
	      } else {
	        elm[key] = cur;
	      }
	    }
	  }
	
	  var domProps = {
	    create: updateDOMProps,
	    update: updateDOMProps
	  };
	
	  var prefixes = ['Webkit', 'Moz', 'ms'];
	
	  var testEl = void 0;
	  var normalize = cached(function (prop) {
	    testEl = testEl || document.createElement('div');
	    prop = camelize(prop);
	    if (prop !== 'filter' && prop in testEl.style) {
	      return prop;
	    }
	    var upper = prop.charAt(0).toUpperCase() + prop.slice(1);
	    for (var i = 0; i < prefixes.length; i++) {
	      var prefixed = prefixes[i] + upper;
	      if (prefixed in testEl.style) {
	        return prefixed;
	      }
	    }
	  });
	
	  function updateStyle(oldVnode, vnode) {
	    if (!oldVnode.data.style && !vnode.data.style) {
	      return;
	    }
	    var cur = void 0,
	        name = void 0;
	    var elm = vnode.elm;
	    var oldStyle = oldVnode.data.style || {};
	    var style = vnode.data.style || {};
	    var needClone = style.__ob__;
	
	    // handle array syntax
	    if (Array.isArray(style)) {
	      style = vnode.data.style = toObject(style);
	    }
	
	    // clone the style for future updates,
	    // in case the user mutates the style object in-place.
	    if (needClone) {
	      style = vnode.data.style = extend({}, style);
	    }
	
	    for (name in oldStyle) {
	      if (!style[name]) {
	        elm.style[normalize(name)] = '';
	      }
	    }
	    for (name in style) {
	      cur = style[name];
	      if (cur !== oldStyle[name]) {
	        // ie9 setting to null has no effect, must use empty string
	        elm.style[normalize(name)] = cur || '';
	      }
	    }
	  }
	
	  var style = {
	    create: updateStyle,
	    update: updateStyle
	  };
	
	  /**
	   * Add class with compatibility for SVG since classList is not supported on
	   * SVG elements in IE
	   */
	  function addClass(el, cls) {
	    /* istanbul ignore else */
	    if (el.classList) {
	      if (cls.indexOf(' ') > -1) {
	        cls.split(/\s+/).forEach(function (c) {
	          return el.classList.add(c);
	        });
	      } else {
	        el.classList.add(cls);
	      }
	    } else {
	      var cur = ' ' + el.getAttribute('class') + ' ';
	      if (cur.indexOf(' ' + cls + ' ') < 0) {
	        el.setAttribute('class', (cur + cls).trim());
	      }
	    }
	  }
	
	  /**
	   * Remove class with compatibility for SVG since classList is not supported on
	   * SVG elements in IE
	   */
	  function removeClass(el, cls) {
	    /* istanbul ignore else */
	    if (el.classList) {
	      if (cls.indexOf(' ') > -1) {
	        cls.split(/\s+/).forEach(function (c) {
	          return el.classList.remove(c);
	        });
	      } else {
	        el.classList.remove(cls);
	      }
	    } else {
	      var cur = ' ' + el.getAttribute('class') + ' ';
	      var tar = ' ' + cls + ' ';
	      while (cur.indexOf(tar) >= 0) {
	        cur = cur.replace(tar, ' ');
	      }
	      el.setAttribute('class', cur.trim());
	    }
	  }
	
	  var hasTransition = inBrowser && !isIE9;
	  var TRANSITION = 'transition';
	  var ANIMATION = 'animation';
	
	  // Transition property/event sniffing
	  var transitionProp = 'transition';
	  var transitionEndEvent = 'transitionend';
	  var animationProp = 'animation';
	  var animationEndEvent = 'animationend';
	  if (hasTransition) {
	    /* istanbul ignore if */
	    if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
	      transitionProp = 'WebkitTransition';
	      transitionEndEvent = 'webkitTransitionEnd';
	    }
	    if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
	      animationProp = 'WebkitAnimation';
	      animationEndEvent = 'webkitAnimationEnd';
	    }
	  }
	
	  var raf = inBrowser && window.requestAnimationFrame || setTimeout;
	  function nextFrame(fn) {
	    raf(function () {
	      raf(fn);
	    });
	  }
	
	  function addTransitionClass(el, cls) {
	    (el._transitionClasses || (el._transitionClasses = [])).push(cls);
	    addClass(el, cls);
	  }
	
	  function removeTransitionClass(el, cls) {
	    if (el._transitionClasses) {
	      remove(el._transitionClasses, cls);
	    }
	    removeClass(el, cls);
	  }
	
	  function whenTransitionEnds(el, expectedType, cb) {
	    var _getTransitionInfo = getTransitionInfo(el, expectedType);
	
	    var type = _getTransitionInfo.type;
	    var timeout = _getTransitionInfo.timeout;
	    var propCount = _getTransitionInfo.propCount;
	
	    if (!type) return cb();
	    var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
	    var ended = 0;
	    var end = function end() {
	      el.removeEventListener(event, onEnd);
	      cb();
	    };
	    var onEnd = function onEnd() {
	      if (++ended >= propCount) {
	        end();
	      }
	    };
	    setTimeout(function () {
	      if (ended < propCount) {
	        end();
	      }
	    }, timeout + 1);
	    el.addEventListener(event, onEnd);
	  }
	
	  var transformRE = /\b(transform|all)(,|$)/;
	
	  function getTransitionInfo(el, expectedType) {
	    var styles = window.getComputedStyle(el);
	    var transitioneDelays = styles[transitionProp + 'Delay'].split(', ');
	    var transitionDurations = styles[transitionProp + 'Duration'].split(', ');
	    var transitionTimeout = getTimeout(transitioneDelays, transitionDurations);
	    var animationDelays = styles[animationProp + 'Delay'].split(', ');
	    var animationDurations = styles[animationProp + 'Duration'].split(', ');
	    var animationTimeout = getTimeout(animationDelays, animationDurations);
	
	    var type = void 0;
	    var timeout = 0;
	    var propCount = 0;
	    /* istanbul ignore if */
	    if (expectedType === TRANSITION) {
	      if (transitionTimeout > 0) {
	        type = TRANSITION;
	        timeout = transitionTimeout;
	        propCount = transitionDurations.length;
	      }
	    } else if (expectedType === ANIMATION) {
	      if (animationTimeout > 0) {
	        type = ANIMATION;
	        timeout = animationTimeout;
	        propCount = animationDurations.length;
	      }
	    } else {
	      timeout = Math.max(transitionTimeout, animationTimeout);
	      type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
	      propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
	    }
	    var hasTransform = type === TRANSITION && transformRE.test(styles[transitionProp + 'Property']);
	    return {
	      type: type,
	      timeout: timeout,
	      propCount: propCount,
	      hasTransform: hasTransform
	    };
	  }
	
	  function getTimeout(delays, durations) {
	    return Math.max.apply(null, durations.map(function (d, i) {
	      return toMs(d) + toMs(delays[i]);
	    }));
	  }
	
	  function toMs(s) {
	    return Number(s.slice(0, -1)) * 1000;
	  }
	
	  function enter(vnode) {
	    var el = vnode.elm;
	
	    // call leave callback now
	    if (el._leaveCb) {
	      el._leaveCb.cancelled = true;
	      el._leaveCb();
	    }
	
	    var data = resolveTransition(vnode.data.transition);
	    if (!data) {
	      return;
	    }
	
	    /* istanbul ignore if */
	    if (el._enterCb) {
	      return;
	    }
	
	    var css = data.css;
	    var type = data.type;
	    var enterClass = data.enterClass;
	    var enterActiveClass = data.enterActiveClass;
	    var appearClass = data.appearClass;
	    var appearActiveClass = data.appearActiveClass;
	    var beforeEnter = data.beforeEnter;
	    var enter = data.enter;
	    var afterEnter = data.afterEnter;
	    var enterCancelled = data.enterCancelled;
	    var beforeAppear = data.beforeAppear;
	    var appear = data.appear;
	    var afterAppear = data.afterAppear;
	    var appearCancelled = data.appearCancelled;
	
	
	    var context = vnode.context.$parent || vnode.context;
	    var isAppear = !context._isMounted;
	    if (isAppear && !appear && appear !== '') {
	      return;
	    }
	
	    var startClass = isAppear ? appearClass : enterClass;
	    var activeClass = isAppear ? appearActiveClass : enterActiveClass;
	    var beforeEnterHook = isAppear ? beforeAppear || beforeEnter : beforeEnter;
	    var enterHook = isAppear ? typeof appear === 'function' ? appear : enter : enter;
	    var afterEnterHook = isAppear ? afterAppear || afterEnter : afterEnter;
	    var enterCancelledHook = isAppear ? appearCancelled || enterCancelled : enterCancelled;
	
	    var expectsCSS = css !== false && !isIE9;
	    var userWantsControl = enterHook &&
	    // enterHook may be a bound method which exposes
	    // the length of original fn as _length
	    (enterHook._length || enterHook.length) > 1;
	
	    var cb = el._enterCb = once(function () {
	      if (expectsCSS) {
	        removeTransitionClass(el, activeClass);
	      }
	      if (cb.cancelled) {
	        if (expectsCSS) {
	          removeTransitionClass(el, startClass);
	        }
	        enterCancelledHook && enterCancelledHook(el);
	      } else {
	        afterEnterHook && afterEnterHook(el);
	      }
	      el._enterCb = null;
	    });
	
	    // remove pending leave element on enter by injecting an insert hook
	    mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', function () {
	      var parent = el.parentNode;
	      var pendingNode = parent._pending && parent._pending[vnode.key];
	      if (pendingNode && pendingNode.tag === vnode.tag && pendingNode.elm._leaveCb) {
	        pendingNode.elm._leaveCb();
	      }
	      enterHook && enterHook(el, cb);
	    });
	
	    // start enter transition
	    beforeEnterHook && beforeEnterHook(el);
	    if (expectsCSS) {
	      addTransitionClass(el, startClass);
	      addTransitionClass(el, activeClass);
	      nextFrame(function () {
	        removeTransitionClass(el, startClass);
	        if (!cb.cancelled && !userWantsControl) {
	          whenTransitionEnds(el, type, cb);
	        }
	      });
	    }
	
	    if (!expectsCSS && !userWantsControl) {
	      cb();
	    }
	  }
	
	  function leave(vnode, rm) {
	    var el = vnode.elm;
	
	    // call enter callback now
	    if (el._enterCb) {
	      el._enterCb.cancelled = true;
	      el._enterCb();
	    }
	
	    var data = resolveTransition(vnode.data.transition);
	    if (!data) {
	      return rm();
	    }
	
	    /* istanbul ignore if */
	    if (el._leaveCb) {
	      return;
	    }
	
	    var css = data.css;
	    var type = data.type;
	    var leaveClass = data.leaveClass;
	    var leaveActiveClass = data.leaveActiveClass;
	    var beforeLeave = data.beforeLeave;
	    var leave = data.leave;
	    var afterLeave = data.afterLeave;
	    var leaveCancelled = data.leaveCancelled;
	    var delayLeave = data.delayLeave;
	
	
	    var expectsCSS = css !== false && !isIE9;
	    var userWantsControl = leave &&
	    // leave hook may be a bound method which exposes
	    // the length of original fn as _length
	    (leave._length || leave.length) > 1;
	
	    var cb = el._leaveCb = once(function () {
	      if (el.parentNode && el.parentNode._pending) {
	        el.parentNode._pending[vnode.key] = null;
	      }
	      if (expectsCSS) {
	        removeTransitionClass(el, leaveActiveClass);
	      }
	      if (cb.cancelled) {
	        if (expectsCSS) {
	          removeTransitionClass(el, leaveClass);
	        }
	        leaveCancelled && leaveCancelled(el);
	      } else {
	        rm();
	        afterLeave && afterLeave(el);
	      }
	      el._leaveCb = null;
	    });
	
	    if (delayLeave) {
	      delayLeave(performLeave);
	    } else {
	      performLeave();
	    }
	
	    function performLeave() {
	      // the delayed leave may have already been cancelled
	      if (cb.cancelled) {
	        return;
	      }
	      // record leaving element
	      if (!vnode.data.show) {
	        (el.parentNode._pending || (el.parentNode._pending = {}))[vnode.key] = vnode;
	      }
	      beforeLeave && beforeLeave(el);
	      if (expectsCSS) {
	        addTransitionClass(el, leaveClass);
	        addTransitionClass(el, leaveActiveClass);
	        nextFrame(function () {
	          removeTransitionClass(el, leaveClass);
	          if (!cb.cancelled && !userWantsControl) {
	            whenTransitionEnds(el, type, cb);
	          }
	        });
	      }
	      leave && leave(el, cb);
	      if (!expectsCSS && !userWantsControl) {
	        cb();
	      }
	    }
	  }
	
	  function resolveTransition(def) {
	    if (!def) {
	      return;
	    }
	    /* istanbul ignore else */
	    if (typeof def === 'object') {
	      var res = {};
	      if (def.css !== false) {
	        extend(res, autoCssTransition(def.name || 'v'));
	      }
	      extend(res, def);
	      return res;
	    } else if (typeof def === 'string') {
	      return autoCssTransition(def);
	    }
	  }
	
	  var autoCssTransition = cached(function (name) {
	    return {
	      enterClass: name + '-enter',
	      leaveClass: name + '-leave',
	      appearClass: name + '-enter',
	      enterActiveClass: name + '-enter-active',
	      leaveActiveClass: name + '-leave-active',
	      appearActiveClass: name + '-enter-active'
	    };
	  });
	
	  function once(fn) {
	    var called = false;
	    return function () {
	      if (!called) {
	        called = true;
	        fn();
	      }
	    };
	  }
	
	  var transition = inBrowser ? {
	    create: function create(_, vnode) {
	      if (!vnode.data.show) {
	        enter(vnode);
	      }
	    },
	    remove: function remove(vnode, rm) {
	      /* istanbul ignore else */
	      if (!vnode.data.show) {
	        leave(vnode, rm);
	      } else {
	        rm();
	      }
	    }
	  } : {};
	
	  var platformModules = [attrs, klass, events, domProps, style, transition];
	
	  // the directive module should be applied last, after all
	  // built-in modules have been applied.
	  var modules = platformModules.concat(baseModules);
	
	  var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });
	
	  var modelableTagRE = /^input|select|textarea|vue-component-[0-9]+(-[0-9a-zA-Z_\-]*)?$/;
	
	  /* istanbul ignore if */
	  if (isIE9) {
	    // http://www.matts411.com/post/internet-explorer-9-oninput/
	    document.addEventListener('selectionchange', function () {
	      var el = document.activeElement;
	      if (el && el.vmodel) {
	        trigger(el, 'input');
	      }
	    });
	  }
	
	  var model = {
	    bind: function bind(el, binding, vnode) {
	      if (true) {
	        if (!modelableTagRE.test(vnode.tag)) {
	          warn('v-model is not supported on element type: <' + vnode.tag + '>. ' + 'If you are working with contenteditable, it\'s recommended to ' + 'wrap a library dedicated for that purpose inside a custom component.', vnode.context);
	        }
	      }
	      if (vnode.tag === 'select') {
	        setSelected(el, binding, vnode.context);
	      } else {
	        if (!isAndroid) {
	          el.addEventListener('compositionstart', onCompositionStart);
	          el.addEventListener('compositionend', onCompositionEnd);
	        }
	        /* istanbul ignore if */
	        if (isIE9) {
	          el.vmodel = true;
	        }
	      }
	    },
	    componentUpdated: function componentUpdated(el, binding, vnode) {
	      if (vnode.tag === 'select') {
	        setSelected(el, binding, vnode.context);
	        // in case the options rendered by v-for have changed,
	        // it's possible that the value is out-of-sync with the rendered options.
	        // detect such cases and filter out values that no longer has a matchig
	        // option in the DOM.
	        var needReset = el.multiple ? binding.value.some(function (v) {
	          return hasNoMatchingOption(v, el.options);
	        }) : hasNoMatchingOption(binding.value, el.options);
	        if (needReset) {
	          trigger(el, 'change');
	        }
	      }
	    }
	  };
	
	  function setSelected(el, binding, vm) {
	    var value = binding.value;
	    var isMultiple = el.multiple;
	    if (!isMultiple) {
	      el.selectedIndex = -1;
	    } else if (!Array.isArray(value)) {
	      "development" !== 'production' && warn('<select multiple v-model="' + binding.expression + '"> ' + ('expects an Array value for its binding, but got ' + Object.prototype.toString.call(value).slice(8, -1)), vm);
	      return;
	    }
	    for (var i = 0, l = el.options.length; i < l; i++) {
	      var option = el.options[i];
	      if (isMultiple) {
	        option.selected = value.indexOf(getValue(option)) > -1;
	      } else {
	        if (getValue(option) === value) {
	          el.selectedIndex = i;
	          break;
	        }
	      }
	    }
	  }
	
	  function hasNoMatchingOption(value, options) {
	    for (var i = 0, l = options.length; i < l; i++) {
	      if (getValue(options[i]) === value) {
	        return false;
	      }
	    }
	    return true;
	  }
	
	  function getValue(option) {
	    return '_value' in option ? option._value : option.value || option.text;
	  }
	
	  function onCompositionStart(e) {
	    e.target.composing = true;
	  }
	
	  function onCompositionEnd(e) {
	    e.target.composing = false;
	    trigger(e.target, 'input');
	  }
	
	  function trigger(el, type) {
	    var e = document.createEvent('HTMLEvents');
	    e.initEvent(type, true, true);
	    el.dispatchEvent(e);
	  }
	
	  // recursively search for possible transition defined inside the component root
	  function locateNode(vnode) {
	    return vnode.child && (!vnode.data || !vnode.data.transition) ? locateNode(vnode.child._vnode) : vnode;
	  }
	
	  var show = {
	    bind: function bind(el, _ref, vnode) {
	      var value = _ref.value;
	
	      vnode = locateNode(vnode);
	      var transition = vnode.data && vnode.data.transition;
	      if (value && transition && transition.appear && !isIE9) {
	        enter(vnode);
	      }
	      el.style.display = value ? '' : 'none';
	    },
	    update: function update(el, _ref2, vnode) {
	      var value = _ref2.value;
	
	      vnode = locateNode(vnode);
	      var transition = vnode.data && vnode.data.transition;
	      if (transition && !isIE9) {
	        if (value) {
	          enter(vnode);
	          el.style.display = '';
	        } else {
	          leave(vnode, function () {
	            el.style.display = 'none';
	          });
	        }
	      } else {
	        el.style.display = value ? '' : 'none';
	      }
	    }
	  };
	
	  var platformDirectives = {
	    model: model,
	    show: show
	  };
	
	  var transitionProps = {
	    name: String,
	    appear: Boolean,
	    css: Boolean,
	    mode: String,
	    type: String,
	    enterClass: String,
	    leaveClass: String,
	    enterActiveClass: String,
	    leaveActiveClass: String,
	    appearClass: String,
	    appearActiveClass: String
	  };
	
	  function extractTransitionData(comp) {
	    var data = {};
	    var options = comp.$options;
	    // props
	    for (var key in options.propsData) {
	      data[key] = comp[key];
	    }
	    // events.
	    // extract listeners and pass them directly to the transition methods
	    var listeners = options._parentListeners;
	    for (var _key in listeners) {
	      data[camelize(_key)] = listeners[_key].fn;
	    }
	    return data;
	  }
	
	  var Transition = {
	    name: 'transition',
	    props: transitionProps,
	    abstract: true,
	    render: function render(h) {
	      var _this = this;
	
	      var children = this.$slots.default;
	      if (!children) {
	        return;
	      }
	
	      // filter out text nodes (possible whitespaces)
	      children = children.filter(function (c) {
	        return c.tag;
	      });
	      /* istanbul ignore if */
	      if (!children.length) {
	        return;
	      }
	
	      // warn multiple elements
	      if ("development" !== 'production' && children.length > 1) {
	        warn('<transition> can only be used on a single element. Use ' + '<transition-group> for lists.', this.$parent);
	      }
	
	      var mode = this.mode;
	
	      // warn invalid mode
	      if ("development" !== 'production' && mode && mode !== 'in-out' && mode !== 'out-in') {
	        warn('invalid <transition> mode: ' + mode, this.$parent);
	      }
	
	      var rawChild = children[0];
	
	      // if this is a component root node and the component's
	      // parent container node also has transition, skip.
	      if (this.$vnode.parent && this.$vnode.parent.data.transition) {
	        return rawChild;
	      }
	
	      // apply transition data to child
	      // use getRealChild() to ignore abstract components e.g. keep-alive
	      var child = getRealChild(rawChild);
	      /* istanbul ignore if */
	      if (!child) return;
	      child.key = child.key || '__v' + (child.tag + this._uid) + '__';
	      var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
	      var oldRawChild = this._vnode;
	      var oldChild = getRealChild(oldRawChild);
	
	      if (oldChild && oldChild.data && oldChild.key !== child.key) {
	        // replace old child transition data with fresh one
	        // important for dynamic transitions!
	        var oldData = oldChild.data.transition = extend({}, data);
	
	        // handle transition mode
	        if (mode === 'out-in') {
	          // return empty node and queue update when leave finishes
	          mergeVNodeHook(oldData, 'afterLeave', function () {
	            _this.$forceUpdate();
	          });
	          return (/\d-keep-alive$/.test(rawChild.tag) ? h('keep-alive') : null
	          );
	        } else if (mode === 'in-out') {
	          (function () {
	            var delayedLeave = void 0;
	            var performLeave = function performLeave() {
	              delayedLeave();
	            };
	            mergeVNodeHook(data, 'afterEnter', performLeave);
	            mergeVNodeHook(data, 'enterCancelled', performLeave);
	            mergeVNodeHook(oldData, 'delayLeave', function (leave) {
	              delayedLeave = leave;
	            });
	          })();
	        }
	      }
	
	      return rawChild;
	    }
	  };
	
	  var props = extend({
	    tag: String,
	    moveClass: String
	  }, transitionProps);
	
	  delete props.mode;
	
	  var TransitionGroup = {
	    props: props,
	
	    render: function render(h) {
	      var tag = this.tag || this.$vnode.data.tag || 'span';
	      var map = Object.create(null);
	      var prevChildren = this.prevChildren = this.children;
	      var rawChildren = this.$slots.default || [];
	      var children = this.children = [];
	      var transitionData = extractTransitionData(this);
	
	      for (var i = 0; i < rawChildren.length; i++) {
	        var c = rawChildren[i];
	        if (c.tag) {
	          if (c.key != null) {
	            children.push(c);
	            map[c.key] = c;(c.data || (c.data = {})).transition = transitionData;
	          } else if (true) {
	            var opts = c.componentOptions;
	            var name = opts ? opts.Ctor.options.name || opts.tag : c.tag;
	            warn('<transition-group> children must be keyed: <' + name + '>');
	          }
	        }
	      }
	
	      if (prevChildren) {
	        var kept = [];
	        var removed = [];
	        for (var _i = 0; _i < prevChildren.length; _i++) {
	          var _c = prevChildren[_i];
	          _c.data.transition = transitionData;
	          _c.data.pos = _c.elm.getBoundingClientRect();
	          if (map[_c.key]) {
	            kept.push(_c);
	          } else {
	            removed.push(_c);
	          }
	        }
	        this.kept = h(tag, null, kept);
	        this.removed = removed;
	      }
	
	      return h(tag, null, children);
	    },
	    beforeUpdate: function beforeUpdate() {
	      // force removing pass
	      this.__patch__(this._vnode, this.kept, false, // hydrating
	      true // removeOnly (!important, avoids unnecessary moves)
	      );
	      this._vnode = this.kept;
	    },
	    updated: function updated() {
	      var children = this.prevChildren;
	      var moveClass = this.moveClass || this.name + '-move';
	      if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
	        return;
	      }
	
	      children.forEach(function (c) {
	        /* istanbul ignore if */
	        if (c.elm._moveCb) {
	          c.elm._moveCb();
	        }
	        /* istanbul ignore if */
	        if (c.elm._enterCb) {
	          c.elm._enterCb();
	        }
	        var oldPos = c.data.pos;
	        var newPos = c.data.pos = c.elm.getBoundingClientRect();
	        var dx = oldPos.left - newPos.left;
	        var dy = oldPos.top - newPos.top;
	        if (dx || dy) {
	          c.data.moved = true;
	          var s = c.elm.style;
	          s.transform = s.WebkitTransform = 'translate(' + dx + 'px,' + dy + 'px)';
	          s.transitionDuration = '0s';
	        }
	      });
	
	      // force reflow to put everything in position
	      var f = document.body.offsetHeight; // eslint-disable-line
	
	      children.forEach(function (c) {
	        if (c.data.moved) {
	          (function () {
	            var el = c.elm;
	            var s = el.style;
	            addTransitionClass(el, moveClass);
	            s.transform = s.WebkitTransform = s.transitionDuration = '';
	            el._moveDest = c.data.pos;
	            el.addEventListener(transitionEndEvent, el._moveCb = function cb(e) {
	              if (!e || /transform$/.test(e.propertyName)) {
	                el.removeEventListener(transitionEndEvent, cb);
	                el._moveCb = null;
	                removeTransitionClass(el, moveClass);
	              }
	            });
	          })();
	        }
	      });
	    },
	
	
	    methods: {
	      hasMove: function hasMove(el, moveClass) {
	        /* istanbul ignore if */
	        if (!hasTransition) {
	          return false;
	        }
	        if (this._hasMove != null) {
	          return this._hasMove;
	        }
	        addTransitionClass(el, moveClass);
	        var info = getTransitionInfo(el);
	        removeTransitionClass(el, moveClass);
	        return this._hasMove = info.hasTransform;
	      }
	    }
	  };
	
	  var platformComponents = {
	    Transition: Transition,
	    TransitionGroup: TransitionGroup
	  };
	
	  // install platform specific utils
	  Vue.config.isUnknownElement = isUnknownElement;
	  Vue.config.isReservedTag = isReservedTag;
	  Vue.config.getTagNamespace = getTagNamespace;
	  Vue.config.mustUseProp = mustUseProp;
	
	  // install platform runtime directives & components
	  extend(Vue.options.directives, platformDirectives);
	  extend(Vue.options.components, platformComponents);
	
	  // install platform patch function
	  Vue.prototype.__patch__ = config._isServer ? noop : patch;
	
	  // wrap mount
	  Vue.prototype.$mount = function (el, hydrating) {
	    el = el && !config._isServer ? query(el) : undefined;
	    return this._mount(el, hydrating);
	  };
	
	  // devtools global hook
	  /* istanbul ignore next */
	  setTimeout(function () {
	    if (config.devtools) {
	      if (devtools) {
	        devtools.emit('init', Vue);
	      } else if ("development" !== 'production' && inBrowser && /Chrome\/\d+/.test(window.navigator.userAgent)) {
	        console.log('Download the Vue Devtools for a better development experience:\n' + 'https://github.com/vuejs/vue-devtools');
	      }
	    }
	  }, 0);
	
	  var decoder = document.createElement('div');
	
	  function decodeHTML(html) {
	    decoder.innerHTML = html;
	    return decoder.textContent;
	  }
	
	  // Regular Expressions for parsing tags and attributes
	  var singleAttrIdentifier = /([^\s"'<>\/=]+)/;
	  var singleAttrAssign = /(?:=)/;
	  var singleAttrValues = [
	  // attr value double quotes
	  /"([^"]*)"+/.source,
	  // attr value, single quotes
	  /'([^']*)'+/.source,
	  // attr value, no quotes
	  /([^\s"'=<>`]+)/.source];
	  var attribute = new RegExp('^\\s*' + singleAttrIdentifier.source + '(?:\\s*(' + singleAttrAssign.source + ')' + '\\s*(?:' + singleAttrValues.join('|') + '))?');
	
	  // could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
	  // but for Vue templates we can enforce a simple charset
	  var ncname = '[a-zA-Z_][\\w\\-\\.]*';
	  var qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')';
	  var startTagOpen = new RegExp('^<' + qnameCapture);
	  var startTagClose = /^\s*(\/?)>/;
	  var endTag = new RegExp('^<\\/' + qnameCapture + '[^>]*>');
	  var doctype = /^<!DOCTYPE [^>]+>/i;
	
	  var IS_REGEX_CAPTURING_BROKEN = false;
	  'x'.replace(/x(.)?/g, function (m, g) {
	    IS_REGEX_CAPTURING_BROKEN = g === '';
	  });
	
	  // Special Elements (can contain anything)
	  var isSpecialTag = makeMap('script,style', true);
	
	  var reCache = {};
	
	  var ampRE = /&amp;/g;
	  var ltRE = /&lt;/g;
	  var gtRE = /&gt;/g;
	
	  function decodeAttr(value, shouldDecodeTags) {
	    if (shouldDecodeTags) {
	      value = value.replace(ltRE, '<').replace(gtRE, '>');
	    }
	    return value.replace(ampRE, '&');
	  }
	
	  function parseHTML(html, options) {
	    var stack = [];
	    var expectHTML = options.expectHTML;
	    var isUnaryTag = options.isUnaryTag || no;
	    var isFromDOM = options.isFromDOM;
	    var shouldDecodeTags = options.shouldDecodeTags;
	    var index = 0;
	    var last = void 0,
	        lastTag = void 0;
	    while (html) {
	      last = html;
	      // Make sure we're not in a script or style element
	      if (!lastTag || !isSpecialTag(lastTag)) {
	        var textEnd = html.indexOf('<');
	        if (textEnd === 0) {
	          // Comment:
	          if (/^<!--/.test(html)) {
	            var commentEnd = html.indexOf('-->');
	
	            if (commentEnd >= 0) {
	              advance(commentEnd + 3);
	              continue;
	            }
	          }
	
	          // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
	          if (/^<!\[/.test(html)) {
	            var conditionalEnd = html.indexOf(']>');
	
	            if (conditionalEnd >= 0) {
	              advance(conditionalEnd + 2);
	              continue;
	            }
	          }
	
	          // Doctype:
	          var doctypeMatch = html.match(doctype);
	          if (doctypeMatch) {
	            advance(doctypeMatch[0].length);
	            continue;
	          }
	
	          // End tag:
	          var endTagMatch = html.match(endTag);
	          if (endTagMatch) {
	            var curIndex = index;
	            advance(endTagMatch[0].length);
	            parseEndTag(endTagMatch[0], endTagMatch[1], curIndex, index);
	            continue;
	          }
	
	          // Start tag:
	          var startTagMatch = parseStartTag();
	          if (startTagMatch) {
	            handleStartTag(startTagMatch);
	            continue;
	          }
	        }
	
	        var text = void 0;
	        if (textEnd >= 0) {
	          text = html.substring(0, textEnd);
	          advance(textEnd);
	        } else {
	          text = html;
	          html = '';
	        }
	
	        if (options.chars) {
	          options.chars(text);
	        }
	      } else {
	        (function () {
	          var stackedTag = lastTag.toLowerCase();
	          var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
	          var endTagLength = 0;
	          var rest = html.replace(reStackedTag, function (all, text, endTag) {
	            endTagLength = endTag.length;
	            if (stackedTag !== 'script' && stackedTag !== 'style' && stackedTag !== 'noscript') {
	              text = text.replace(/<!--([\s\S]*?)-->/g, '$1').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
	            }
	            if (options.chars) {
	              options.chars(text);
	            }
	            return '';
	          });
	          index += html.length - rest.length;
	          html = rest;
	          parseEndTag('</' + stackedTag + '>', stackedTag, index - endTagLength, index);
	        })();
	      }
	
	      if (html === last) {
	        throw new Error('Error parsing template:\n\n' + html);
	      }
	    }
	
	    // Clean up any remaining tags
	    parseEndTag();
	
	    function advance(n) {
	      index += n;
	      html = html.substring(n);
	    }
	
	    function parseStartTag() {
	      var start = html.match(startTagOpen);
	      if (start) {
	        var match = {
	          tagName: start[1],
	          attrs: [],
	          start: index
	        };
	        advance(start[0].length);
	        var end = void 0,
	            attr = void 0;
	        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
	          advance(attr[0].length);
	          match.attrs.push(attr);
	        }
	        if (end) {
	          match.unarySlash = end[1];
	          advance(end[0].length);
	          match.end = index;
	          return match;
	        }
	      }
	    }
	
	    function handleStartTag(match) {
	      var tagName = match.tagName;
	      var unarySlash = match.unarySlash;
	
	      if (expectHTML) {
	        if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
	          parseEndTag('', lastTag);
	        }
	        if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
	          parseEndTag('', tagName);
	        }
	      }
	
	      var unary = isUnaryTag(tagName) || tagName === 'html' && lastTag === 'head' || !!unarySlash;
	
	      var l = match.attrs.length;
	      var attrs = new Array(l);
	      for (var i = 0; i < l; i++) {
	        var args = match.attrs[i];
	        // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
	        if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
	          if (args[3] === '') {
	            delete args[3];
	          }
	          if (args[4] === '') {
	            delete args[4];
	          }
	          if (args[5] === '') {
	            delete args[5];
	          }
	        }
	        var value = args[3] || args[4] || args[5] || '';
	        attrs[i] = {
	          name: args[1],
	          value: isFromDOM ? decodeAttr(value, shouldDecodeTags) : value
	        };
	      }
	
	      if (!unary) {
	        stack.push({ tag: tagName, attrs: attrs });
	        lastTag = tagName;
	        unarySlash = '';
	      }
	
	      if (options.start) {
	        options.start(tagName, attrs, unary, match.start, match.end);
	      }
	    }
	
	    function parseEndTag(tag, tagName, start, end) {
	      var pos = void 0;
	      if (start == null) start = index;
	      if (end == null) end = index;
	
	      // Find the closest opened tag of the same type
	      if (tagName) {
	        var needle = tagName.toLowerCase();
	        for (pos = stack.length - 1; pos >= 0; pos--) {
	          if (stack[pos].tag.toLowerCase() === needle) {
	            break;
	          }
	        }
	      } else {
	        // If no tag name is provided, clean shop
	        pos = 0;
	      }
	
	      if (pos >= 0) {
	        // Close all the open elements, up the stack
	        for (var i = stack.length - 1; i >= pos; i--) {
	          if (options.end) {
	            options.end(stack[i].tag, start, end);
	          }
	        }
	
	        // Remove the open elements from the stack
	        stack.length = pos;
	        lastTag = pos && stack[pos - 1].tag;
	      } else if (tagName.toLowerCase() === 'br') {
	        if (options.start) {
	          options.start(tagName, [], true, start, end);
	        }
	      } else if (tagName.toLowerCase() === 'p') {
	        if (options.start) {
	          options.start(tagName, [], false, start, end);
	        }
	        if (options.end) {
	          options.end(tagName, start, end);
	        }
	      }
	    }
	  }
	
	  function parseFilters(exp) {
	    var inSingle = false;
	    var inDouble = false;
	    var curly = 0;
	    var square = 0;
	    var paren = 0;
	    var lastFilterIndex = 0;
	    var c = void 0,
	        prev = void 0,
	        i = void 0,
	        expression = void 0,
	        filters = void 0;
	
	    for (i = 0; i < exp.length; i++) {
	      prev = c;
	      c = exp.charCodeAt(i);
	      if (inSingle) {
	        // check single quote
	        if (c === 0x27 && prev !== 0x5C) inSingle = !inSingle;
	      } else if (inDouble) {
	        // check double quote
	        if (c === 0x22 && prev !== 0x5C) inDouble = !inDouble;
	      } else if (c === 0x7C && // pipe
	      exp.charCodeAt(i + 1) !== 0x7C && exp.charCodeAt(i - 1) !== 0x7C && !curly && !square && !paren) {
	        if (expression === undefined) {
	          // first filter, end of expression
	          lastFilterIndex = i + 1;
	          expression = exp.slice(0, i).trim();
	        } else {
	          pushFilter();
	        }
	      } else {
	        switch (c) {
	          case 0x22:
	            inDouble = true;break; // "
	          case 0x27:
	            inSingle = true;break; // '
	          case 0x28:
	            paren++;break; // (
	          case 0x29:
	            paren--;break; // )
	          case 0x5B:
	            square++;break; // [
	          case 0x5D:
	            square--;break; // ]
	          case 0x7B:
	            curly++;break; // {
	          case 0x7D:
	            curly--;break; // }
	        }
	      }
	    }
	
	    if (expression === undefined) {
	      expression = exp.slice(0, i).trim();
	    } else if (lastFilterIndex !== 0) {
	      pushFilter();
	    }
	
	    function pushFilter() {
	      (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
	      lastFilterIndex = i + 1;
	    }
	
	    if (filters) {
	      for (i = 0; i < filters.length; i++) {
	        expression = wrapFilter(expression, filters[i]);
	      }
	    }
	
	    return expression;
	  }
	
	  function wrapFilter(exp, filter) {
	    var i = filter.indexOf('(');
	    if (i < 0) {
	      // _f: resolveFilter
	      return '_f("' + filter + '")(' + exp + ')';
	    } else {
	      var name = filter.slice(0, i);
	      var args = filter.slice(i + 1);
	      return '_f("' + name + '")(' + exp + ',' + args;
	    }
	  }
	
	  var defaultTagRE = /\{\{((?:.|\\n)+?)\}\}/g;
	  var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
	
	  var buildRegex = cached(function (delimiters) {
	    var open = delimiters[0].replace(regexEscapeRE, '\\$&');
	    var close = delimiters[1].replace(regexEscapeRE, '\\$&');
	    return new RegExp(open + '((?:.|\\n)+?)' + close, 'g');
	  });
	
	  function parseText(text, delimiters) {
	    var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
	    if (!tagRE.test(text)) {
	      return;
	    }
	    var tokens = [];
	    var lastIndex = tagRE.lastIndex = 0;
	    var match = void 0,
	        index = void 0;
	    while (match = tagRE.exec(text)) {
	      index = match.index;
	      // push text token
	      if (index > lastIndex) {
	        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
	      }
	      // tag token
	      var exp = parseFilters(match[1].trim());
	      tokens.push('_s(' + exp + ')');
	      lastIndex = index + match[0].length;
	    }
	    if (lastIndex < text.length) {
	      tokens.push(JSON.stringify(text.slice(lastIndex)));
	    }
	    return tokens.join('+');
	  }
	
	  function baseWarn(msg) {
	    console.error('[Vue parser]: ' + msg);
	  }
	
	  function pluckModuleFunction(modules, key) {
	    return modules ? modules.map(function (m) {
	      return m[key];
	    }).filter(function (_) {
	      return _;
	    }) : [];
	  }
	
	  function addProp(el, name, value) {
	    (el.props || (el.props = [])).push({ name: name, value: value });
	  }
	
	  function addAttr(el, name, value) {
	    (el.attrs || (el.attrs = [])).push({ name: name, value: value });
	  }
	
	  function addDirective(el, name, value, arg, modifiers) {
	    (el.directives || (el.directives = [])).push({ name: name, value: value, arg: arg, modifiers: modifiers });
	  }
	
	  function addHook(el, name, code) {
	    var hooks = el.hooks || (el.hooks = {});
	    var hook = hooks[name];
	    /* istanbul ignore if */
	    if (hook) {
	      hook.push(code);
	    } else {
	      hooks[name] = [code];
	    }
	  }
	
	  function addHandler(el, name, value, modifiers) {
	    // check capture modifier
	    if (modifiers && modifiers.capture) {
	      delete modifiers.capture;
	      name = '!' + name; // mark the event as captured
	    }
	    var events = void 0;
	    if (modifiers && modifiers.native) {
	      delete modifiers.native;
	      events = el.nativeEvents || (el.nativeEvents = {});
	    } else {
	      events = el.events || (el.events = {});
	    }
	    var newHandler = { value: value, modifiers: modifiers };
	    var handlers = events[name];
	    /* istanbul ignore if */
	    if (Array.isArray(handlers)) {
	      handlers.push(newHandler);
	    } else if (handlers) {
	      events[name] = [handlers, newHandler];
	    } else {
	      events[name] = newHandler;
	    }
	  }
	
	  function getBindingAttr(el, name, getStatic) {
	    var dynamicValue = getAndRemoveAttr(el, ':' + name) || getAndRemoveAttr(el, 'v-bind:' + name);
	    if (dynamicValue != null) {
	      return dynamicValue;
	    } else if (getStatic !== false) {
	      var staticValue = getAndRemoveAttr(el, name);
	      if (staticValue != null) {
	        return JSON.stringify(staticValue);
	      }
	    }
	  }
	
	  function getAndRemoveAttr(el, name) {
	    var val = void 0;
	    if ((val = el.attrsMap[name]) != null) {
	      var list = el.attrsList;
	      for (var i = 0, l = list.length; i < l; i++) {
	        if (list[i].name === name) {
	          list.splice(i, 1);
	          break;
	        }
	      }
	    }
	    return val;
	  }
	
	  var dirRE = /^v-|^@|^:/;
	  var forAliasRE = /(.*)\s+(?:in|of)\s+(.*)/;
	  var forIteratorRE = /\(([^,]*),([^,]*)(?:,([^,]*))?\)/;
	  var bindRE = /^:|^v-bind:/;
	  var onRE = /^@|^v-on:/;
	  var argRE = /:(.*)$/;
	  var modifierRE = /\.[^\.]+/g;
	
	  var decodeHTMLCached = cached(decodeHTML);
	
	  // configurable state
	  var warn$1 = void 0;
	  var platformGetTagNamespace = void 0;
	  var platformMustUseProp = void 0;
	  var platformIsPreTag = void 0;
	  var preTransforms = void 0;
	  var transforms = void 0;
	  var postTransforms = void 0;
	  var delimiters = void 0;
	
	  /**
	   * Convert HTML string to AST.
	   */
	  function parse(template, options) {
	    warn$1 = options.warn || baseWarn;
	    platformGetTagNamespace = options.getTagNamespace || no;
	    platformMustUseProp = options.mustUseProp || no;
	    platformIsPreTag = options.isPreTag || no;
	    preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
	    transforms = pluckModuleFunction(options.modules, 'transformNode');
	    postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');
	    delimiters = options.delimiters;
	    var stack = [];
	    var preserveWhitespace = options.preserveWhitespace !== false;
	    var root = void 0;
	    var currentParent = void 0;
	    var inVPre = false;
	    var inPre = false;
	    var warned = false;
	    parseHTML(template, {
	      expectHTML: options.expectHTML,
	      isUnaryTag: options.isUnaryTag,
	      isFromDOM: options.isFromDOM,
	      shouldDecodeTags: options.shouldDecodeTags,
	      start: function start(tag, attrs, unary) {
	        // check namespace.
	        // inherit parent ns if there is one
	        var ns = currentParent && currentParent.ns || platformGetTagNamespace(tag);
	
	        // handle IE svg bug
	        /* istanbul ignore if */
	        if (options.isIE && ns === 'svg') {
	          attrs = guardIESVGBug(attrs);
	        }
	
	        var element = {
	          type: 1,
	          tag: tag,
	          attrsList: attrs,
	          attrsMap: makeAttrsMap(attrs),
	          parent: currentParent,
	          children: []
	        };
	        if (ns) {
	          element.ns = ns;
	        }
	
	        if (isForbiddenTag(element)) {
	          element.forbidden = true;
	          "development" !== 'production' && warn$1('Templates should only be responsbile for mapping the state to the ' + 'UI. Avoid placing tags with side-effects in your templates, such as ' + ('<' + tag + '>.'));
	        }
	
	        // apply pre-transforms
	        for (var i = 0; i < preTransforms.length; i++) {
	          preTransforms[i](element, options);
	        }
	
	        if (!inVPre) {
	          processPre(element);
	          if (element.pre) {
	            inVPre = true;
	          }
	        }
	        if (platformIsPreTag(element.tag)) {
	          inPre = true;
	        }
	        if (inVPre) {
	          processRawAttrs(element);
	        } else {
	          processFor(element);
	          processIf(element);
	          processOnce(element);
	
	          // determine whether this is a plain element after
	          // removing structural attributes
	          element.plain = !element.key && !attrs.length;
	
	          processKey(element);
	          processRef(element);
	          processSlot(element);
	          processComponent(element);
	          for (var _i = 0; _i < transforms.length; _i++) {
	            transforms[_i](element, options);
	          }
	          processAttrs(element);
	        }
	
	        function checkRootConstraints(el) {
	          if (true) {
	            if (el.tag === 'slot' || el.tag === 'template') {
	              warn$1('Cannot use <' + el.tag + '> as component root element because it may ' + 'contain multiple nodes:\n' + template);
	            }
	            if (el.attrsMap.hasOwnProperty('v-for')) {
	              warn$1('Cannot use v-for on stateful component root element because ' + 'it renders multiple elements:\n' + template);
	            }
	          }
	        }
	
	        // tree management
	        if (!root) {
	          root = element;
	          checkRootConstraints(root);
	        } else if ("development" !== 'production' && !stack.length && !warned) {
	          // allow 2 root elements with v-if and v-else
	          if (root.attrsMap.hasOwnProperty('v-if') && element.attrsMap.hasOwnProperty('v-else')) {
	            checkRootConstraints(element);
	          } else {
	            warned = true;
	            warn$1('Component template should contain exactly one root element:\n\n' + template);
	          }
	        }
	        if (currentParent && !element.forbidden) {
	          if (element.else) {
	            processElse(element, currentParent);
	          } else {
	            currentParent.children.push(element);
	            element.parent = currentParent;
	          }
	        }
	        if (!unary) {
	          currentParent = element;
	          stack.push(element);
	        }
	        // apply post-transforms
	        for (var _i2 = 0; _i2 < postTransforms.length; _i2++) {
	          postTransforms[_i2](element, options);
	        }
	      },
	      end: function end() {
	        // remove trailing whitespace
	        var element = stack[stack.length - 1];
	        var lastNode = element.children[element.children.length - 1];
	        if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
	          element.children.pop();
	        }
	        // pop stack
	        stack.length -= 1;
	        currentParent = stack[stack.length - 1];
	        // check pre state
	        if (element.pre) {
	          inVPre = false;
	        }
	        if (platformIsPreTag(element.tag)) {
	          inPre = false;
	        }
	      },
	      chars: function chars(text) {
	        if (!currentParent) {
	          if ("development" !== 'production' && !warned) {
	            warned = true;
	            warn$1('Component template should contain exactly one root element:\n\n' + template);
	          }
	          return;
	        }
	        text = inPre || text.trim() ? decodeHTMLCached(text)
	        // only preserve whitespace if its not right after a starting tag
	        : preserveWhitespace && currentParent.children.length ? ' ' : '';
	        if (text) {
	          var expression = void 0;
	          if (!inVPre && text !== ' ' && (expression = parseText(text, delimiters))) {
	            currentParent.children.push({
	              type: 2,
	              expression: expression,
	              text: text
	            });
	          } else {
	            currentParent.children.push({
	              type: 3,
	              text: text
	            });
	          }
	        }
	      }
	    });
	    return root;
	  }
	
	  function processPre(el) {
	    if (getAndRemoveAttr(el, 'v-pre') != null) {
	      el.pre = true;
	    }
	  }
	
	  function processRawAttrs(el) {
	    var l = el.attrsList.length;
	    if (l) {
	      var attrs = el.attrs = new Array(l);
	      for (var i = 0; i < l; i++) {
	        attrs[i] = {
	          name: el.attrsList[i].name,
	          value: JSON.stringify(el.attrsList[i].value)
	        };
	      }
	    } else if (!el.pre) {
	      // non root node in pre blocks with no attributes
	      el.plain = true;
	    }
	  }
	
	  function processKey(el) {
	    var exp = getBindingAttr(el, 'key');
	    if (exp) {
	      el.key = exp;
	    }
	  }
	
	  function processRef(el) {
	    var ref = getBindingAttr(el, 'ref');
	    if (ref) {
	      el.ref = ref;
	      var parent = el;
	      while (parent) {
	        if (parent.for !== undefined) {
	          el.refInFor = true;
	          break;
	        }
	        parent = parent.parent;
	      }
	    }
	  }
	
	  function processFor(el) {
	    var exp = void 0;
	    if (exp = getAndRemoveAttr(el, 'v-for')) {
	      var inMatch = exp.match(forAliasRE);
	      if (!inMatch) {
	        "development" !== 'production' && warn$1('Invalid v-for expression: ' + exp);
	        return;
	      }
	      el.for = inMatch[2].trim();
	      var alias = inMatch[1].trim();
	      var iteratorMatch = alias.match(forIteratorRE);
	      if (iteratorMatch) {
	        el.alias = iteratorMatch[1].trim();
	        el.iterator1 = iteratorMatch[2].trim();
	        if (iteratorMatch[3]) {
	          el.iterator2 = iteratorMatch[3].trim();
	        }
	      } else {
	        el.alias = alias;
	      }
	    }
	  }
	
	  function processIf(el) {
	    var exp = getAndRemoveAttr(el, 'v-if');
	    if (exp) {
	      el.if = exp;
	    }
	    if (getAndRemoveAttr(el, 'v-else') != null) {
	      el.else = true;
	    }
	  }
	
	  function processElse(el, parent) {
	    var prev = findPrevElement(parent.children);
	    if (prev && prev.if) {
	      prev.elseBlock = el;
	    } else if (true) {
	      warn$1('v-else used on element <' + el.tag + '> without corresponding v-if.');
	    }
	  }
	
	  function processOnce(el) {
	    var once = getAndRemoveAttr(el, 'v-once');
	    if (once != null) {
	      el.once = true;
	    }
	  }
	
	  function processSlot(el) {
	    if (el.tag === 'slot') {
	      el.slotName = getBindingAttr(el, 'name');
	    } else {
	      var slotTarget = getBindingAttr(el, 'slot');
	      if (slotTarget) {
	        el.slotTarget = slotTarget;
	      }
	    }
	  }
	
	  function processComponent(el) {
	    var binding = void 0;
	    if (binding = getBindingAttr(el, 'is')) {
	      el.component = binding;
	    }
	    if (getAndRemoveAttr(el, 'keep-alive') != null) {
	      el.keepAlive = true;
	    }
	    if (getAndRemoveAttr(el, 'inline-template') != null) {
	      el.inlineTemplate = true;
	    }
	  }
	
	  function processAttrs(el) {
	    var list = el.attrsList;
	    var i = void 0,
	        l = void 0,
	        name = void 0,
	        value = void 0,
	        arg = void 0,
	        modifiers = void 0,
	        isProp = void 0;
	    for (i = 0, l = list.length; i < l; i++) {
	      name = list[i].name;
	      value = list[i].value;
	      if (dirRE.test(name)) {
	        // mark element as dynamic
	        el.hasBindings = true;
	        // modifiers
	        modifiers = parseModifiers(name);
	        if (modifiers) {
	          name = name.replace(modifierRE, '');
	        }
	        if (bindRE.test(name)) {
	          // v-bind
	          name = name.replace(bindRE, '');
	          if (modifiers && modifiers.prop) {
	            isProp = true;
	            name = camelize(name);
	            if (name === 'innerHtml') name = 'innerHTML';
	          }
	          if (isProp || platformMustUseProp(name)) {
	            addProp(el, name, value);
	          } else {
	            addAttr(el, name, value);
	          }
	        } else if (onRE.test(name)) {
	          // v-on
	          name = name.replace(onRE, '');
	          addHandler(el, name, value, modifiers);
	        } else {
	          // normal directives
	          name = name.replace(dirRE, '');
	          // parse arg
	          var argMatch = name.match(argRE);
	          if (argMatch && (arg = argMatch[1])) {
	            name = name.slice(0, -(arg.length + 1));
	          }
	          addDirective(el, name, value, arg, modifiers);
	        }
	      } else {
	        // literal attribute
	        if (true) {
	          var expression = parseText(value, delimiters);
	          if (expression) {
	            warn$1(name + '="' + value + '": ' + 'Interpolation inside attributes has been deprecated. ' + 'Use v-bind or the colon shorthand instead.');
	          }
	        }
	        addAttr(el, name, JSON.stringify(value));
	      }
	    }
	  }
	
	  function parseModifiers(name) {
	    var match = name.match(modifierRE);
	    if (match) {
	      var _ret = function () {
	        var ret = {};
	        match.forEach(function (m) {
	          ret[m.slice(1)] = true;
	        });
	        return {
	          v: ret
	        };
	      }();
	
	      if (typeof _ret === "object") return _ret.v;
	    }
	  }
	
	  function makeAttrsMap(attrs) {
	    var map = {};
	    for (var i = 0, l = attrs.length; i < l; i++) {
	      if ("development" !== 'production' && map[attrs[i].name]) {
	        warn$1('duplicate attribute: ' + attrs[i].name);
	      }
	      map[attrs[i].name] = attrs[i].value;
	    }
	    return map;
	  }
	
	  function findPrevElement(children) {
	    var i = children.length;
	    while (i--) {
	      if (children[i].tag) return children[i];
	    }
	  }
	
	  function isForbiddenTag(el) {
	    return el.tag === 'style' || el.tag === 'script' && (!el.attrsMap.type || el.attrsMap.type === 'text/javascript');
	  }
	
	  var ieNSBug = /^xmlns:NS\d+/;
	  var ieNSPrefix = /^NS\d+:/;
	
	  /* istanbul ignore next */
	  function guardIESVGBug(attrs) {
	    var res = [];
	    for (var i = 0; i < attrs.length; i++) {
	      var attr = attrs[i];
	      if (!ieNSBug.test(attr.name)) {
	        attr.name = attr.name.replace(ieNSPrefix, '');
	        res.push(attr);
	      }
	    }
	    return res;
	  }
	
	  var isStaticKey = void 0;
	  var isPlatformReservedTag = void 0;
	
	  var genStaticKeysCached = cached(genStaticKeys$1);
	
	  /**
	   * Goal of the optimizier: walk the generated template AST tree
	   * and detect sub-trees that are purely static, i.e. parts of
	   * the DOM that never needs to change.
	   *
	   * Once we detect these sub-trees, we can:
	   *
	   * 1. Hoist them into constants, so that we no longer need to
	   *    create fresh nodes for them on each re-render;
	   * 2. Completely skip them in the patching process.
	   */
	  function optimize(root, options) {
	    if (!root) return;
	    isStaticKey = genStaticKeysCached(options.staticKeys || '');
	    isPlatformReservedTag = options.isReservedTag || function () {
	      return false;
	    };
	    // first pass: mark all non-static nodes.
	    markStatic(root);
	    // second pass: mark static roots.
	    markStaticRoots(root);
	  }
	
	  function genStaticKeys$1(keys) {
	    return makeMap('type,tag,attrsList,attrsMap,plain,parent,children,attrs' + (keys ? ',' + keys : ''));
	  }
	
	  function markStatic(node) {
	    node.static = isStatic(node);
	    if (node.type === 1) {
	      for (var i = 0, l = node.children.length; i < l; i++) {
	        var child = node.children[i];
	        markStatic(child);
	        if (!child.static) {
	          node.static = false;
	        }
	      }
	    }
	  }
	
	  function markStaticRoots(node) {
	    if (node.type === 1 && (node.once || node.static)) {
	      node.staticRoot = true;
	      return;
	    }
	    if (node.children) {
	      for (var i = 0, l = node.children.length; i < l; i++) {
	        markStaticRoots(node.children[i]);
	      }
	    }
	  }
	
	  function isStatic(node) {
	    if (node.type === 2) {
	      // expression
	      return false;
	    }
	    if (node.type === 3) {
	      // text
	      return true;
	    }
	    return !!(node.pre || !node.hasBindings && // no dynamic bindings
	    !node.if && !node.for && // not v-if or v-for or v-else
	    !isBuiltInTag(node.tag) && // not a built-in
	    isPlatformReservedTag(node.tag) && // not a component
	    Object.keys(node).every(isStaticKey));
	  }
	
	  var simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/;
	
	  // keyCode aliases
	  var keyCodes = {
	    esc: 27,
	    tab: 9,
	    enter: 13,
	    space: 32,
	    up: 38,
	    left: 37,
	    right: 39,
	    down: 40,
	    'delete': [8, 46]
	  };
	
	  var modifierCode = {
	    stop: '$event.stopPropagation();',
	    prevent: '$event.preventDefault();',
	    self: 'if($event.target !== $event.currentTarget)return;'
	  };
	
	  function genHandlers(events, native) {
	    var res = native ? 'nativeOn:{' : 'on:{';
	    for (var name in events) {
	      res += '"' + name + '":' + genHandler(events[name]) + ',';
	    }
	    return res.slice(0, -1) + '}';
	  }
	
	  function genHandler(handler) {
	    if (!handler) {
	      return 'function(){}';
	    } else if (Array.isArray(handler)) {
	      return '[' + handler.map(genHandler).join(',') + ']';
	    } else if (!handler.modifiers) {
	      return simplePathRE.test(handler.value) ? handler.value : 'function($event){' + handler.value + '}';
	    } else {
	      var code = 'function($event){';
	      for (var key in handler.modifiers) {
	        code += modifierCode[key] || genKeyFilter(key);
	      }
	      var handlerCode = simplePathRE.test(handler.value) ? handler.value + '($event)' : handler.value;
	      return code + handlerCode + '}';
	    }
	  }
	
	  function genKeyFilter(key) {
	    var code = parseInt(key, 10) || // number keyCode
	    keyCodes[key] || // built-in alias
	    '_k(' + JSON.stringify(key) + ')'; // custom alias
	    if (Array.isArray(code)) {
	      return 'if(' + code.map(function (c) {
	        return '$event.keyCode!==' + c;
	      }).join('&&') + ')return;';
	    } else {
	      return 'if($event.keyCode!==' + code + ')return;';
	    }
	  }
	
	  function bind$1(el, dir) {
	    addHook(el, 'construct', '_b(n1,' + dir.value + (dir.modifiers && dir.modifiers.prop ? ',true' : '') + ')');
	  }
	
	  var baseDirectives = {
	    bind: bind$1,
	    cloak: noop
	  };
	
	  // configurable state
	  var warn$2 = void 0;
	  var transforms$1 = void 0;
	  var dataGenFns = void 0;
	  var platformDirectives$1 = void 0;
	  var isPlatformReservedTag$1 = void 0;
	  var staticRenderFns = void 0;
	  var currentOptions = void 0;
	
	  function generate(ast, options) {
	    // save previous staticRenderFns so generate calls can be nested
	    var prevStaticRenderFns = staticRenderFns;
	    var currentStaticRenderFns = staticRenderFns = [];
	    currentOptions = options;
	    warn$2 = options.warn || baseWarn;
	    transforms$1 = pluckModuleFunction(options.modules, 'transformCode');
	    dataGenFns = pluckModuleFunction(options.modules, 'genData');
	    platformDirectives$1 = options.directives || {};
	    isPlatformReservedTag$1 = options.isReservedTag || no;
	    var code = ast ? genElement(ast) : '_h("div")';
	    // console.log(code)
	    staticRenderFns = prevStaticRenderFns;
	    return {
	      render: 'with(this){return ' + code + '}',
	      staticRenderFns: currentStaticRenderFns
	    };
	  }
	
	  function genElement(el) {
	    if (el.staticRoot && !el.staticProcessed) {
	      // hoist static sub-trees out
	      el.staticProcessed = true;
	      staticRenderFns.push('with(this){return ' + genElement(el) + '}');
	      return '_m(' + (staticRenderFns.length - 1) + ')';
	    } else if (el.for && !el.forProcessed) {
	      return genFor(el);
	    } else if (el.if && !el.ifProcessed) {
	      return genIf(el);
	    } else if (el.tag === 'template' && !el.slotTarget) {
	      return genChildren(el) || 'void 0';
	    } else if (el.tag === 'slot') {
	      return genSlot(el);
	    } else {
	      // component or element
	      var code = void 0;
	      if (el.component) {
	        code = genComponent(el);
	      } else {
	        var data = genData(el);
	        // if the element is potentially a component,
	        // wrap its children as a thunk.
	        var children = !el.inlineTemplate ? genChildren(el, !isPlatformReservedTag$1(el.tag) /* asThunk */) : null;
	        code = '_h(\'' + el.tag + '\'' + (data ? ',' + data : '' // data
	        ) + (children ? ',' + children : '' // children
	        ) + ')';
	      }
	      // module transforms
	      for (var i = 0; i < transforms$1.length; i++) {
	        code = transforms$1[i](el, code);
	      }
	      // check keep-alive
	      if (el.keepAlive) {
	        code = '_h("KeepAlive",{props:{child:' + code + '}})';
	      }
	      return code;
	    }
	  }
	
	  function genIf(el) {
	    var exp = el.if;
	    el.ifProcessed = true; // avoid recursion
	    return '(' + exp + ')?' + genElement(el) + ':' + genElse(el);
	  }
	
	  function genElse(el) {
	    return el.elseBlock ? genElement(el.elseBlock) : 'void 0';
	  }
	
	  function genFor(el) {
	    var exp = el.for;
	    var alias = el.alias;
	    var iterator1 = el.iterator1 ? ',' + el.iterator1 : '';
	    var iterator2 = el.iterator2 ? ',' + el.iterator2 : '';
	    el.forProcessed = true; // avoid recursion
	    return '(' + exp + ')&&_l((' + exp + '),' + ('function(' + alias + iterator1 + iterator2 + '){') + ('return ' + genElement(el)) + '})';
	  }
	
	  function genData(el) {
	    if (el.plain) {
	      return;
	    }
	
	    var data = '{';
	
	    // directives first.
	    // directives may mutate the el's other properties before they are generated.
	    var dirs = genDirectives(el);
	    if (dirs) data += dirs + ',';
	
	    // key
	    if (el.key) {
	      data += 'key:' + el.key + ',';
	    }
	    // ref
	    if (el.ref) {
	      data += 'ref:' + el.ref + ',';
	    }
	    if (el.refInFor) {
	      data += 'refInFor:true,';
	    }
	    // record original tag name for components using "is" attribute
	    if (el.component) {
	      data += 'tag:"' + el.tag + '",';
	    }
	    // slot target
	    if (el.slotTarget) {
	      data += 'slot:' + el.slotTarget + ',';
	    }
	    // module data generation functions
	    for (var i = 0; i < dataGenFns.length; i++) {
	      data += dataGenFns[i](el);
	    }
	    // v-show, used to avoid transition being applied
	    // since v-show takes it over
	    if (el.attrsMap['v-show']) {
	      data += 'show:true,';
	    }
	    // attributes
	    if (el.attrs) {
	      data += 'attrs:{' + genProps(el.attrs) + '},';
	    }
	    // DOM props
	    if (el.props) {
	      data += 'domProps:{' + genProps(el.props) + '},';
	    }
	    // hooks
	    if (el.hooks) {
	      data += 'hook:{' + genHooks(el.hooks) + '},';
	    }
	    // event handlers
	    if (el.events) {
	      data += genHandlers(el.events) + ',';
	    }
	    if (el.nativeEvents) {
	      data += '' + genHandlers(el.nativeEvents, true);
	    }
	    // inline-template
	    if (el.inlineTemplate) {
	      var ast = el.children[0];
	      if ("development" !== 'production' && (el.children.length > 1 || ast.type !== 1)) {
	        warn$2('Inline-template components must have exactly one child element.');
	      }
	      if (ast.type === 1) {
	        var inlineRenderFns = generate(ast, currentOptions);
	        data += 'inlineTemplate:{render:function(){' + inlineRenderFns.render + '},staticRenderFns:[' + inlineRenderFns.staticRenderFns.map(function (code) {
	          return 'function(){' + code + '}';
	        }).join(',') + ']}';
	      }
	    }
	    return data.replace(/,$/, '') + '}';
	  }
	
	  function genDirectives(el) {
	    var dirs = el.directives;
	    if (!dirs) return;
	    var res = 'directives:[';
	    var hasRuntime = false;
	    var i = void 0,
	        l = void 0,
	        dir = void 0,
	        needRuntime = void 0;
	    for (i = 0, l = dirs.length; i < l; i++) {
	      dir = dirs[i];
	      needRuntime = true;
	      var gen = platformDirectives$1[dir.name] || baseDirectives[dir.name];
	      if (gen) {
	        // compile-time directive that manipulates AST.
	        // returns true if it also needs a runtime counterpart.
	        needRuntime = !!gen(el, dir, warn$2);
	      }
	      if (needRuntime) {
	        hasRuntime = true;
	        res += '{name:"' + dir.name + '"' + (dir.value ? ',value:(' + dir.value + '),expression:' + JSON.stringify(dir.value) : '') + (dir.arg ? ',arg:"' + dir.arg + '"' : '') + (dir.modifiers ? ',modifiers:' + JSON.stringify(dir.modifiers) : '') + '},';
	      }
	    }
	    if (hasRuntime) {
	      return res.slice(0, -1) + ']';
	    }
	  }
	
	  function genChildren(el, asThunk) {
	    if (!el.children.length) {
	      return;
	    }
	    var code = '[' + el.children.map(genNode).join(',') + ']';
	    return asThunk ? 'function(){return ' + code + '}' : code;
	  }
	
	  function genNode(node) {
	    if (node.type === 1) {
	      return genElement(node);
	    } else {
	      return genText(node);
	    }
	  }
	
	  function genText(text) {
	    return text.type === 2 ? text.expression // no need for () because already wrapped in _s()
	    : JSON.stringify(text.text);
	  }
	
	  function genSlot(el) {
	    var slot = '$slots[' + (el.slotName || '"default"') + ']';
	    var children = genChildren(el);
	    return children ? '(' + slot + '||' + children + ')' : slot;
	  }
	
	  function genComponent(el) {
	    var children = genChildren(el, true);
	    return '_h(' + el.component + ',' + genData(el) + (children ? ',' + children : '') + ')';
	  }
	
	  function genProps(props) {
	    var res = '';
	    for (var i = 0; i < props.length; i++) {
	      var prop = props[i];
	      res += '"' + prop.name + '":' + prop.value + ',';
	    }
	    return res.slice(0, -1);
	  }
	
	  function genHooks(hooks) {
	    var res = '';
	    for (var _key in hooks) {
	      res += '"' + _key + '":function(n1,n2){' + hooks[_key].join(';') + '},';
	    }
	    return res.slice(0, -1);
	  }
	
	  /**
	   * Compile a template.
	   */
	  function compile$1(template, options) {
	    var ast = parse(template.trim(), options);
	    optimize(ast, options);
	    var code = generate(ast, options);
	    return {
	      ast: ast,
	      render: code.render,
	      staticRenderFns: code.staticRenderFns
	    };
	  }
	
	  // operators like typeof, instanceof and in are allowed
	  var prohibitedKeywordRE = new RegExp('\\b' + ('do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' + 'super,throw,while,yield,delete,export,import,return,switch,default,' + 'extends,finally,continue,debugger,function,arguments').split(',').join('\\b|\\b') + '\\b');
	  // check valid identifier for v-for
	  var identRE = /[A-Za-z_$][\w$]*/;
	  // strip strings in expressions
	  var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;
	
	  // detect problematic expressions in a template
	  function detectErrors(ast) {
	    var errors = [];
	    if (ast) {
	      checkNode(ast, errors);
	    }
	    return errors;
	  }
	
	  function checkNode(node, errors) {
	    if (node.type === 1) {
	      for (var name in node.attrsMap) {
	        if (dirRE.test(name)) {
	          var value = node.attrsMap[name];
	          if (value) {
	            if (name === 'v-for') {
	              checkFor(node, 'v-for="' + value + '"', errors);
	            } else {
	              checkExpression(value, name + '="' + value + '"', errors);
	            }
	          }
	        }
	      }
	      if (node.children) {
	        for (var i = 0; i < node.children.length; i++) {
	          checkNode(node.children[i], errors);
	        }
	      }
	    } else if (node.type === 2) {
	      checkExpression(node.expression, node.text, errors);
	    }
	  }
	
	  function checkFor(node, text, errors) {
	    checkExpression(node.for || '', text, errors);
	    checkIdentifier(node.alias, 'v-for alias', text, errors);
	    checkIdentifier(node.iterator1, 'v-for iterator', text, errors);
	    checkIdentifier(node.iterator2, 'v-for iterator', text, errors);
	  }
	
	  function checkIdentifier(ident, type, text, errors) {
	    if (typeof ident === 'string' && !identRE.test(ident)) {
	      errors.push('- invalid ' + type + ' "' + ident + '" in expression: ' + text);
	    }
	  }
	
	  function checkExpression(exp, text, errors) {
	    try {
	      new Function('return ' + exp);
	    } catch (e) {
	      var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
	      if (keywordMatch) {
	        errors.push('- avoid using JavaScript keyword as property name: ' + ('"' + keywordMatch[0] + '" in expression ' + text));
	      } else {
	        errors.push('- invalid expression: ' + text);
	      }
	    }
	  }
	
	  function transformNode(el, options) {
	    var warn = options.warn || baseWarn;
	    var staticClass = getAndRemoveAttr(el, 'class');
	    if ("development" !== 'production' && staticClass) {
	      var expression = parseText(staticClass, options.delimiters);
	      if (expression) {
	        warn('class="' + staticClass + '": ' + 'Interpolation inside attributes has been deprecated. ' + 'Use v-bind or the colon shorthand instead.');
	      }
	    }
	    el.staticClass = JSON.stringify(staticClass);
	    var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
	    if (classBinding) {
	      el.classBinding = classBinding;
	    }
	  }
	
	  function genData$1(el) {
	    var data = '';
	    if (el.staticClass) {
	      data += 'staticClass:' + el.staticClass + ',';
	    }
	    if (el.classBinding) {
	      data += 'class:' + el.classBinding + ',';
	    }
	    return data;
	  }
	
	  var klass$1 = {
	    staticKeys: ['staticClass'],
	    transformNode: transformNode,
	    genData: genData$1
	  };
	
	  function transformNode$1(el) {
	    var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
	    if (styleBinding) {
	      el.styleBinding = styleBinding;
	    }
	  }
	
	  function genData$2(el) {
	    return el.styleBinding ? 'style:(' + el.styleBinding + '),' : '';
	  }
	
	  var style$1 = {
	    transformNode: transformNode$1,
	    genData: genData$2
	  };
	
	  var modules$1 = [klass$1, style$1];
	
	  var warn$3 = void 0;
	
	  function model$1(el, dir, _warn) {
	    warn$3 = _warn;
	    var value = dir.value;
	    var modifiers = dir.modifiers;
	    if (el.tag === 'select') {
	      return genSelect(el, value);
	    } else {
	      switch (el.attrsMap.type) {
	        case 'checkbox':
	          genCheckboxModel(el, value);
	          break;
	        case 'radio':
	          genRadioModel(el, value);
	          break;
	        default:
	          return genDefaultModel(el, value, modifiers);
	      }
	    }
	  }
	
	  function genCheckboxModel(el, value) {
	    if ("development" !== 'production' && el.attrsMap.checked != null) {
	      warn$3('<' + el.tag + ' v-model="' + value + '" checked>:\n' + 'inline checked attributes will be ignored when using v-model. ' + 'Declare initial values in the component\'s data option instead.');
	    }
	    var valueBinding = getBindingAttr(el, 'value');
	    var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
	    var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
	    addProp(el, 'checked', 'Array.isArray(' + value + ')' + ('?(' + value + ').indexOf(' + valueBinding + ')>-1') + (':(' + value + ')===(' + trueValueBinding + ')'));
	    addHandler(el, 'change', 'var $$a=' + value + ',' + '$$el=$event.target,' + ('$$c=$$el.checked?(' + trueValueBinding + '):(' + falseValueBinding + ');') + 'if(Array.isArray($$a)){' + ('var $$v=' + valueBinding + ',') + '$$i=$$a.indexOf($$v);' + ('if($$c){$$i<0&&(' + value + '=$$a.concat($$v))}') + ('else{$$i>-1&&(' + value + '=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}') + ('}else{' + value + '=$$c}'));
	  }
	
	  function genRadioModel(el, value) {
	    if ("development" !== 'production' && el.attrsMap.checked != null) {
	      warn$3('<' + el.tag + ' v-model="' + value + '" checked>:\n' + 'inline checked attributes will be ignored when using v-model. ' + 'Declare initial values in the component\'s data option instead.');
	    }
	    var valueBinding = getBindingAttr(el, 'value');
	    addProp(el, 'checked', '(' + value + ')===(' + valueBinding + ')');
	    addHandler(el, 'change', value + '=' + valueBinding);
	  }
	
	  function genDefaultModel(el, value, modifiers) {
	    if (true) {
	      if (el.tag === 'input' && el.attrsMap.value) {
	        warn$3('<' + el.tag + ' v-model="' + value + '" value="' + el.attrsMap.value + '">:\n' + 'inline value attributes will be ignored when using v-model. ' + 'Declare initial values in the component\'s data option instead.');
	      }
	      if (el.tag === 'textarea' && el.children.length) {
	        warn$3('<textarea v-model="' + value + '">:\n' + 'inline content inside <textarea> will be ignored when using v-model. ' + 'Declare initial values in the component\'s data option instead.');
	      }
	    }
	
	    var type = el.attrsMap.type;
	
	    var _ref = modifiers || {};
	
	    var lazy = _ref.lazy;
	    var number = _ref.number;
	    var trim = _ref.trim;
	
	    var event = lazy ? 'change' : 'input';
	    var needCompositionGuard = !lazy && type !== 'range';
	    var isNative = el.tag === 'input' || el.tag === 'textarea';
	
	    var valueExpression = isNative ? '$event.target.value' + (trim ? '.trim()' : '') : '$event';
	    var code = number || type === 'number' ? value + '=_n(' + valueExpression + ')' : value + '=' + valueExpression;
	    if (isNative && needCompositionGuard) {
	      code = 'if($event.target.composing)return;' + code;
	    }
	    addProp(el, 'value', isNative ? '_s(' + value + ')' : '(' + value + ')');
	    addHandler(el, event, code);
	    if (needCompositionGuard) {
	      // need runtime directive code to help with composition events
	      return true;
	    }
	  }
	
	  function genSelect(el, value) {
	    if (true) {
	      el.children.some(checkOptionWarning);
	    }
	    var code = value + '=Array.prototype.filter' + '.call($event.target.options,function(o){return o.selected})' + '.map(function(o){return "_value" in o ? o._value : o.value})' + (el.attrsMap.multiple == null ? '[0]' : '');
	    addHandler(el, 'change', code);
	    // need runtime to help with possible dynamically generated options
	    return true;
	  }
	
	  function checkOptionWarning(option) {
	    if (option.type === 1 && option.tag === 'option' && option.attrsMap.selected != null) {
	      var parentModel = option.parent && option.parent.type === 1 && option.parent.attrsMap['v-model'];
	      warn$3('<select v-model="' + parentModel + '">:\n' + 'inline selected attributes on <option> will be ignored when using v-model. ' + 'Declare initial values in the component\'s data option instead.');
	      return true;
	    }
	  }
	
	  function text(el, dir) {
	    if (dir.value) {
	      addProp(el, 'textContent', '_s(' + dir.value + ')');
	    }
	  }
	
	  function html(el, dir) {
	    if (dir.value) {
	      addProp(el, 'innerHTML', '_s(' + dir.value + ')');
	    }
	  }
	
	  var directives$1 = {
	    model: model$1,
	    text: text,
	    html: html
	  };
	
	  var cache = Object.create(null);
	
	  var baseOptions = {
	    isIE: isIE,
	    expectHTML: true,
	    modules: modules$1,
	    staticKeys: genStaticKeys(modules$1),
	    directives: directives$1,
	    isReservedTag: isReservedTag,
	    isUnaryTag: isUnaryTag,
	    mustUseProp: mustUseProp,
	    getTagNamespace: getTagNamespace,
	    isPreTag: isPreTag
	  };
	
	  function compile(template, options) {
	    options = options ? extend(extend({}, baseOptions), options) : baseOptions;
	    return compile$1(template, options);
	  }
	
	  function compileToFunctions(template, options, vm) {
	    var _warn = options && options.warn || warn;
	    // detect possible CSP restriction
	    /* istanbul ignore if */
	    if (true) {
	      try {
	        new Function('return 1');
	      } catch (e) {
	        if (e.toString().match(/unsafe-eval|CSP/)) {
	          _warn('It seems you are using the standalone build of Vue.js in an ' + 'environment with Content Security Policy that prohibits unsafe-eval. ' + 'The template compiler cannot work in this environment. Consider ' + 'relaxing the policy to allow unsafe-eval or pre-compiling your ' + 'templates into render functions.');
	        }
	      }
	    }
	    var key = options && options.delimiters ? String(options.delimiters) + template : template;
	    if (cache[key]) {
	      return cache[key];
	    }
	    var res = {};
	    var compiled = compile(template, options);
	    res.render = makeFunction(compiled.render);
	    var l = compiled.staticRenderFns.length;
	    res.staticRenderFns = new Array(l);
	    for (var i = 0; i < l; i++) {
	      res.staticRenderFns[i] = makeFunction(compiled.staticRenderFns[i]);
	    }
	    if (true) {
	      if (res.render === noop || res.staticRenderFns.some(function (fn) {
	        return fn === noop;
	      })) {
	        _warn('failed to compile template:\n\n' + template + '\n\n' + detectErrors(compiled.ast).join('\n') + '\n\n', vm);
	      }
	    }
	    return cache[key] = res;
	  }
	
	  function makeFunction(code) {
	    try {
	      return new Function(code);
	    } catch (e) {
	      return noop;
	    }
	  }
	
	  var idToTemplate = cached(function (id) {
	    var el = query(id);
	    return el && el.innerHTML;
	  });
	
	  var mount = Vue.prototype.$mount;
	  Vue.prototype.$mount = function (el, hydrating) {
	    el = el && query(el);
	    var options = this.$options;
	    // resolve template/el and convert to render function
	    if (!options.render) {
	      var template = options.template;
	      var isFromDOM = false;
	      if (template) {
	        if (typeof template === 'string') {
	          if (template.charAt(0) === '#') {
	            isFromDOM = true;
	            template = idToTemplate(template);
	          }
	        } else if (template.nodeType) {
	          isFromDOM = true;
	          template = template.innerHTML;
	        } else {
	          if (true) {
	            warn('invalid template option:' + template, this);
	          }
	          return this;
	        }
	      } else if (el) {
	        isFromDOM = true;
	        template = getOuterHTML(el);
	      }
	      if (template) {
	        var _compileToFunctions = compileToFunctions(template, {
	          warn: warn,
	          isFromDOM: isFromDOM,
	          shouldDecodeTags: shouldDecodeTags,
	          delimiters: options.delimiters
	        }, this);
	
	        var render = _compileToFunctions.render;
	        var staticRenderFns = _compileToFunctions.staticRenderFns;
	
	        options.render = render;
	        options.staticRenderFns = staticRenderFns;
	      }
	    }
	    return mount.call(this, el, hydrating);
	  };
	
	  /**
	   * Get outerHTML of elements, taking care
	   * of SVG elements in IE as well.
	   */
	  function getOuterHTML(el) {
	    if (el.outerHTML) {
	      return el.outerHTML;
	    } else {
	      var container = document.createElement('div');
	      container.appendChild(el.cloneNode(true));
	      return container.innerHTML;
	    }
	  }
	
	  Vue.compile = compileToFunctions;
	
	  return Vue;
	
	}));
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_exports__, __vue_options__
	
	/* script */
	__vue_exports__ = __webpack_require__(21)
	
	/* template */
	var __vue_template__ = __webpack_require__(49)
	__vue_options__ = __vue_exports__ = __vue_exports__ || {}
	if (typeof __vue_exports__.default === "object") {
	if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
	__vue_options__ = __vue_exports__ = __vue_exports__.default
	}
	if (typeof __vue_options__ === "function") {
	  __vue_options__ = __vue_options__.options
	}
	__vue_options__.render = __vue_template__.render
	__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
	
	/* hot reload */
	if (false) {(function () {
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  module.hot.accept()
	  if (!module.hot.data) {
	    hotAPI.createRecord("data-v-4", __vue_options__)
	  } else {
	    hotAPI.reload("data-v-4", __vue_options__)
	  }
	})()}
	if (__vue_options__.functional) {console.error("[vue-loader] CharacterCreate.vue: functional components are not supported and should be defined in plain js files using render functions.")}
	
	module.exports = __vue_exports__


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _pouchdb = __webpack_require__(1);
	
	var _pouchdb2 = _interopRequireDefault(_pouchdb);
	
	var _CharacterService = __webpack_require__(22);
	
	var _CharacterService2 = _interopRequireDefault(_CharacterService);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		data: function data() {
			return {
				character: {
					proficiencies: {}
				},
				classOptions: ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Wizard", "Warlock"],
				raceOptions: ["Dragonborn", "Dwarf", "Elf", "Gnome", "Half-elf", "Half-Orc", "Halfling", "Human", "Tiefling", "Genasi", "Goliath"],
				alignmentOptions: ["Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil"]
			};
		},
	
		methods: {
			onSubmit: function onSubmit() {
				console.log('Submit fired');
				_CharacterService2.default.saveCharacter(this.character);
			}
		}
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _pouchdb = __webpack_require__(1);
	
	var _pouchdb2 = _interopRequireDefault(_pouchdb);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// Setup query plugin
	_pouchdb2.default.plugin(__webpack_require__(23));
	_pouchdb2.default.debug.enable('pouchdb:find');
	var db = new _pouchdb2.default('advpack');
	
	exports.default = {
	
		saveCharacter: function saveCharacter(character) {
			// this should produce character_First-Second-Last
			character._id = 'character_' + character.name.replace(/\s+/g, '-');
			character.documentType = "Character";
			db.post(character);
		},
	
		getCharacters: function getCharacters() {
			return db.createIndex({
				index: { fields: ['documentType'] }
			}).then(function () {
				return db.find({
					selector: { documentType: 'Character' }
				}).then(function (results) {
					return results.docs;
				});
			});
		}
	
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(24);
	
	var httpIndexes = __webpack_require__(29);
	var localIndexes = __webpack_require__(31);
	
	var plugin = {};
	plugin.createIndex = utils.toPromise(function (requestDef, callback) {
	
	  if (typeof requestDef !== 'object') {
	    return callback(new Error('you must provide an index to create'));
	  }
	
	  var adapter = this.type() === 'http' ? httpIndexes : localIndexes;
	
	  adapter.createIndex(this, requestDef, callback);
	});
	
	plugin.find = utils.toPromise(function (requestDef, callback) {
	
	  if (typeof callback === 'undefined') {
	    callback = requestDef;
	    requestDef = undefined;
	  }
	
	  if (typeof requestDef !== 'object') {
	    return callback(new Error('you must provide search parameters to find()'));
	  }
	
	  var adapter = this.type() === 'http' ? httpIndexes : localIndexes;
	
	  adapter.find(this, requestDef, callback);
	});
	
	plugin.getIndexes = utils.toPromise(function (callback) {
	
	  var adapter = this.type() === 'http' ? httpIndexes : localIndexes;
	
	  adapter.getIndexes(this, callback);
	});
	
	plugin.deleteIndex = utils.toPromise(function (indexDef, callback) {
	
	  if (typeof indexDef !== 'object') {
	    return callback(new Error('you must provide an index to delete'));
	  }
	
	  var adapter = this.type() === 'http' ? httpIndexes : localIndexes;
	
	  adapter.deleteIndex(this, indexDef, callback);
	});
	
	module.exports = plugin;
	
	/* istanbul ignore next */
	if (typeof window !== 'undefined' && window.PouchDB) {
	  window.PouchDB.plugin(plugin);
	}


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var Promise = __webpack_require__(25);
	
	/* istanbul ignore next */
	exports.once = function (fun) {
	  var called = false;
	  return exports.getArguments(function (args) {
	    if (called) {
	      console.trace();
	      throw new Error('once called  more than once');
	    } else {
	      called = true;
	      fun.apply(this, args);
	    }
	  });
	};
	/* istanbul ignore next */
	exports.getArguments = function (fun) {
	  return function () {
	    var len = arguments.length;
	    var args = new Array(len);
	    var i = -1;
	    while (++i < len) {
	      args[i] = arguments[i];
	    }
	    return fun.call(this, args);
	  };
	};
	/* istanbul ignore next */
	exports.toPromise = function (func) {
	  //create the function we will be returning
	  return exports.getArguments(function (args) {
	    var self = this;
	    var tempCB = (typeof args[args.length - 1] === 'function') ? args.pop() : false;
	    // if the last argument is a function, assume its a callback
	    var usedCB;
	    if (tempCB) {
	      // if it was a callback, create a new callback which calls it,
	      // but do so async so we don't trap any errors
	      usedCB = function (err, resp) {
	        process.nextTick(function () {
	          tempCB(err, resp);
	        });
	      };
	    }
	    var promise = new Promise(function (fulfill, reject) {
	      try {
	        var callback = exports.once(function (err, mesg) {
	          if (err) {
	            reject(err);
	          } else {
	            fulfill(mesg);
	          }
	        });
	        // create a callback for this invocation
	        // apply the function in the orig context
	        args.push(callback);
	        func.apply(self, args);
	      } catch (e) {
	        reject(e);
	      }
	    });
	    // if there is a callback, call it back
	    if (usedCB) {
	      promise.then(function (result) {
	        usedCB(null, result);
	      }, usedCB);
	    }
	    promise.cancel = function () {
	      return this;
	    };
	    return promise;
	  });
	};
	
	exports.inherits = __webpack_require__(7);
	exports.Promise = Promise;
	
	exports.clone = function (obj) {
	  return exports.extend(true, {}, obj);
	};
	
	exports.extend = __webpack_require__(26);
	
	exports.callbackify = function (fun) {
	  return exports.getArguments(function (args) {
	    var cb = args.pop();
	    var promise = fun.apply(this, args);
	    exports.promisedCallback(promise, cb);
	    return promise;
	  });
	};
	
	exports.promisedCallback = function (promise, callback) {
	  promise.then(function (res) {
	    process.nextTick(function () {
	      callback(null, res);
	    });
	  }, function (reason) {
	    process.nextTick(function () {
	      callback(reason);
	    });
	  });
	  return promise;
	};
	
	var crypto = __webpack_require__(27);
	var Md5 = __webpack_require__(28);
	
	exports.MD5 = function (string) {
	  /* istanbul ignore else */
	  if (!process.browser) {
	    return crypto.createHash('md5').update(string).digest('hex');
	  } else {
	    return Md5.hash(string);
	  }
	};
	
	exports.flatten = exports.getArguments(function (args) {
	  var res = [];
	  for (var i = 0, len = args.length; i < len; i++) {
	    var subArr = args[i];
	    if (Array.isArray(subArr)) {
	      res = res.concat(exports.flatten.apply(null, subArr));
	    } else {
	      res.push(subArr);
	    }
	  }
	  return res;
	});
	
	exports.mergeObjects = function (arr) {
	  var res = {};
	  for (var i = 0, len = arr.length; i < len; i++) {
	    res = exports.extend(true, res, arr[i]);
	  }
	  return res;
	};
	
	// this would just be "return doc[field]", but fields
	// can be "deep" due to dot notation
	exports.getFieldFromDoc = function (doc, parsedField) {
	  var value = doc;
	  for (var i = 0, len = parsedField.length; i < len; i++) {
	    var key = parsedField[i];
	    value = value[key];
	    if (!value) {
	      break;
	    }
	  }
	  return value;
	};
	
	exports.setFieldInDoc = function (doc, parsedField, value) {
	  for (var i = 0, len = parsedField.length; i < len-1; i++) {
	    var elem = parsedField[i];
	    doc = doc[elem] = {};
	  }
	  doc[parsedField[len-1]] = value;
	};
	
	// Converts a string in dot notation to an array of its components, with backslash escaping
	exports.parseField = function (fieldName) {
	  // fields may be deep (e.g. "foo.bar.baz"), so parse
	  var fields = [];
	  var current = '';
	  for (var i = 0, len = fieldName.length; i < len; i++) {
	    var ch = fieldName[i];
	    if (ch === '.') {
	      if (i > 0 && fieldName[i - 1] === '\\') { // escaped delimiter
	        current = current.substring(0, current.length - 1) + '.';
	      } else { // not escaped, so delimiter
	        fields.push(current);
	        current = '';
	      }
	    } else { // normal character
	      current += ch;
	    }
	  }
	  fields.push(current);
	  return fields;
	};
	
	// Selects a list of fields defined in dot notation from one doc
	// and copies them to a new doc. Like underscore _.pick but supports nesting.
	exports.pick = function (obj, arr) {
	  var res = {};
	  for (var i = 0, len = arr.length; i < len; i++) {
	    var parsedField = exports.parseField(arr[i]);
	    var value = exports.getFieldFromDoc(obj, parsedField);
	    if(typeof value !== 'undefined') {
	      exports.setFieldInDoc(res, parsedField, value);
	    }
	  }
	  return res;
	};
	
	// e.g. ['a'], ['a', 'b'] is true, but ['b'], ['a', 'b'] is false
	exports.oneArrayIsSubArrayOfOther = function (left, right) {
	
	  for (var i = 0, len = Math.min(left.length, right.length); i < len; i++) {
	    if (left[i] !== right[i]) {
	      return false;
	    }
	  }
	  return true;
	};
	
	// e.g.['a', 'b', 'c'], ['a', 'b'] is false
	exports.oneArrayIsStrictSubArrayOfOther = function (left, right) {
	
	  if (left.length > right.length) {
	    return false;
	  }
	
	  return exports.oneArrayIsSubArrayOfOther(left, right);
	};
	
	// same as above, but treat the left array as an unordered set
	// e.g. ['b', 'a'], ['a', 'b', 'c'] is true, but ['c'], ['a', 'b', 'c'] is false
	exports.oneSetIsSubArrayOfOther = function (left, right) {
	  left = left.slice();
	  for (var i = 0, len = right.length; i < len; i++) {
	    var field = right[i];
	    if (!left.length) {
	      break;
	    }
	    var leftIdx = left.indexOf(field);
	    if (leftIdx === -1) {
	      return false;
	    } else {
	      left.splice(leftIdx, 1);
	    }
	  }
	  return true;
	};
	
	exports.compare = function (left, right) {
	  return left < right ? -1 : left > right ? 1 : 0;
	};
	
	exports.arrayToObject = function (arr) {
	  var res = {};
	  for (var i = 0, len = arr.length; i < len; i++) {
	    res[arr[i]] = true;
	  }
	  return res;
	};
	
	exports.max = function (arr, fun) {
	  var max = null;
	  var maxScore = -1;
	  for (var i = 0, len = arr.length; i < len; i++) {
	    var element = arr[i];
	    var score = fun(element);
	    if (score > maxScore) {
	      maxScore = score;
	      max = element;
	    }
	  }
	  return max;
	};
	
	exports.arrayEquals = function (arr1, arr2) {
	  if (arr1.length !== arr2.length) {
	    return false;
	  }
	  for (var i = 0, len = arr1.length; i < len; i++) {
	    if (arr1[i] !== arr2[i]) {
	      return false;
	    }
	  }
	  return true;
	};
	
	exports.uniq = function(arr) {
	  var obj = {};
	  for (var i = 0; i < arr.length; i++) {
	    obj['$' + arr[i]] = true;
	  }
	  return Object.keys(obj).map(function (key) {
	    return key.substring(1);
	  });
	};
	
	exports.log = __webpack_require__(4)('pouchdb:find');
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }
	
	var lie = _interopDefault(__webpack_require__(8));
	
	/* istanbul ignore next */
	var PouchPromise = typeof Promise === 'function' ? Promise : lie;
	
	module.exports = PouchPromise;

/***/ },
/* 26 */
/***/ function(module, exports) {

	"use strict";
	
	// Extends method
	// (taken from http://code.jquery.com/jquery-1.9.0.js)
	// Populate the class2type map
	var class2type = {};
	
	var types = [
	  "Boolean", "Number", "String", "Function", "Array",
	  "Date", "RegExp", "Object", "Error"
	];
	for (var i = 0; i < types.length; i++) {
	  var typename = types[i];
	  class2type["[object " + typename + "]"] = typename.toLowerCase();
	}
	
	var core_toString = class2type.toString;
	var core_hasOwn = class2type.hasOwnProperty;
	
	function type(obj) {
	  if (obj === null) {
	    return String(obj);
	  }
	  return typeof obj === "object" || typeof obj === "function" ?
	    class2type[core_toString.call(obj)] || "object" :
	    typeof obj;
	}
	
	function isWindow(obj) {
	  return obj !== null && obj === obj.window;
	}
	
	function isPlainObject(obj) {
	  // Must be an Object.
	  // Because of IE, we also have to check the presence of
	  // the constructor property.
	  // Make sure that DOM nodes and window objects don't pass through, as well
	  if (!obj || type(obj) !== "object" || obj.nodeType || isWindow(obj)) {
	    return false;
	  }
	
	  try {
	    // Not own constructor property must be Object
	    if (obj.constructor &&
	      !core_hasOwn.call(obj, "constructor") &&
	      !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
	      return false;
	    }
	  } catch ( e ) {
	    // IE8,9 Will throw exceptions on certain host objects #9897
	    return false;
	  }
	
	  // Own properties are enumerated firstly, so to speed up,
	  // if last one is own, then all properties are own.
	  var key;
	  for (key in obj) {}
	
	  return key === undefined || core_hasOwn.call(obj, key);
	}
	
	
	function isFunction(obj) {
	  return type(obj) === "function";
	}
	
	var isArray = Array.isArray || function (obj) {
	  return type(obj) === "array";
	};
	
	function extend() {
	  // originally extend() was recursive, but this ended up giving us
	  // "call stack exceeded", so it's been unrolled to use a literal stack
	  // (see https://github.com/pouchdb/pouchdb/issues/2543)
	  var stack = [];
	  var i = -1;
	  var len = arguments.length;
	  var args = new Array(len);
	  while (++i < len) {
	    args[i] = arguments[i];
	  }
	  var container = {};
	  stack.push({args: args, result: {container: container, key: 'key'}});
	  var next;
	  while ((next = stack.pop())) {
	    extendInner(stack, next.args, next.result);
	  }
	  return container.key;
	}
	
	function extendInner(stack, args, result) {
	  var options, name, src, copy, copyIsArray, clone,
	    target = args[0] || {},
	    i = 1,
	    length = args.length,
	    deep = false,
	    numericStringRegex = /\d+/,
	    optionsIsArray;
	
	  // Handle a deep copy situation
	  if (typeof target === "boolean") {
	    deep = target;
	    target = args[1] || {};
	    // skip the boolean and the target
	    i = 2;
	  }
	
	  // Handle case when target is a string or something (possible in deep copy)
	  if (typeof target !== "object" && !isFunction(target)) {
	    target = {};
	  }
	
	  // extend jQuery itself if only one argument is passed
	  if (length === i) {
	    /* jshint validthis: true */
	    target = this;
	    --i;
	  }
	
	  for (; i < length; i++) {
	    // Only deal with non-null/undefined values
	    if ((options = args[i]) != null) {
	      optionsIsArray = isArray(options);
	      // Extend the base object
	      for (name in options) {
	        //if (options.hasOwnProperty(name)) {
	        if (!(name in Object.prototype)) {
	          if (optionsIsArray && !numericStringRegex.test(name)) {
	            continue;
	          }
	
	          src = target[name];
	          copy = options[name];
	
	          // Prevent never-ending loop
	          if (target === copy) {
	            continue;
	          }
	
	          // Recurse if we're merging plain objects or arrays
	          if (deep && copy && (isPlainObject(copy) ||
	              (copyIsArray = isArray(copy)))) {
	            if (copyIsArray) {
	              copyIsArray = false;
	              clone = src && isArray(src) ? src : [];
	
	            } else {
	              clone = src && isPlainObject(src) ? src : {};
	            }
	
	            // Never move original objects, clone them
	            stack.push({
	              args: [deep, clone, copy],
	              result: {
	                container: target,
	                key: name
	              }
	            });
	
	          // Don't bring in undefined values
	          } else if (copy !== undefined) {
	            if (!(isArray(options) && isFunction(copy))) {
	              target[name] = copy;
	            }
	          }
	        }
	      }
	    }
	  }
	
	  // "Return" the modified object by setting the key
	  // on the given container
	  result.container[result.key] = target;
	}
	
	
	module.exports = extend;
	
	


/***/ },
/* 27 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/*jshint bitwise:false*/
	/*global unescape*/
	
	(function (factory) {
	    if (true) {
	        // Node/CommonJS
	        module.exports = factory();
	    } else if (typeof define === 'function' && define.amd) {
	        // AMD
	        define(factory);
	    } else {
	        // Browser globals (with support for web workers)
	        var glob;
	        try {
	            glob = window;
	        } catch (e) {
	            glob = self;
	        }
	
	        glob.SparkMD5 = factory();
	    }
	}(function (undefined) {
	
	    'use strict';
	
	    ////////////////////////////////////////////////////////////////////////////
	
	    /*
	     * Fastest md5 implementation around (JKM md5)
	     * Credits: Joseph Myers
	     *
	     * @see http://www.myersdaily.org/joseph/javascript/md5-text.html
	     * @see http://jsperf.com/md5-shootout/7
	     */
	
	    /* this function is much faster,
	      so if possible we use it. Some IEs
	      are the only ones I know of that
	      need the idiotic second function,
	      generated by an if clause.  */
	    var add32 = function (a, b) {
	        return (a + b) & 0xFFFFFFFF;
	    },
	
	    cmn = function (q, a, b, x, s, t) {
	        a = add32(add32(a, q), add32(x, t));
	        return add32((a << s) | (a >>> (32 - s)), b);
	    },
	
	    ff = function (a, b, c, d, x, s, t) {
	        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
	    },
	
	    gg = function (a, b, c, d, x, s, t) {
	        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
	    },
	
	    hh = function (a, b, c, d, x, s, t) {
	        return cmn(b ^ c ^ d, a, b, x, s, t);
	    },
	
	    ii = function (a, b, c, d, x, s, t) {
	        return cmn(c ^ (b | (~d)), a, b, x, s, t);
	    },
	
	    md5cycle = function (x, k) {
	        var a = x[0],
	            b = x[1],
	            c = x[2],
	            d = x[3];
	
	        a = ff(a, b, c, d, k[0], 7, -680876936);
	        d = ff(d, a, b, c, k[1], 12, -389564586);
	        c = ff(c, d, a, b, k[2], 17, 606105819);
	        b = ff(b, c, d, a, k[3], 22, -1044525330);
	        a = ff(a, b, c, d, k[4], 7, -176418897);
	        d = ff(d, a, b, c, k[5], 12, 1200080426);
	        c = ff(c, d, a, b, k[6], 17, -1473231341);
	        b = ff(b, c, d, a, k[7], 22, -45705983);
	        a = ff(a, b, c, d, k[8], 7, 1770035416);
	        d = ff(d, a, b, c, k[9], 12, -1958414417);
	        c = ff(c, d, a, b, k[10], 17, -42063);
	        b = ff(b, c, d, a, k[11], 22, -1990404162);
	        a = ff(a, b, c, d, k[12], 7, 1804603682);
	        d = ff(d, a, b, c, k[13], 12, -40341101);
	        c = ff(c, d, a, b, k[14], 17, -1502002290);
	        b = ff(b, c, d, a, k[15], 22, 1236535329);
	
	        a = gg(a, b, c, d, k[1], 5, -165796510);
	        d = gg(d, a, b, c, k[6], 9, -1069501632);
	        c = gg(c, d, a, b, k[11], 14, 643717713);
	        b = gg(b, c, d, a, k[0], 20, -373897302);
	        a = gg(a, b, c, d, k[5], 5, -701558691);
	        d = gg(d, a, b, c, k[10], 9, 38016083);
	        c = gg(c, d, a, b, k[15], 14, -660478335);
	        b = gg(b, c, d, a, k[4], 20, -405537848);
	        a = gg(a, b, c, d, k[9], 5, 568446438);
	        d = gg(d, a, b, c, k[14], 9, -1019803690);
	        c = gg(c, d, a, b, k[3], 14, -187363961);
	        b = gg(b, c, d, a, k[8], 20, 1163531501);
	        a = gg(a, b, c, d, k[13], 5, -1444681467);
	        d = gg(d, a, b, c, k[2], 9, -51403784);
	        c = gg(c, d, a, b, k[7], 14, 1735328473);
	        b = gg(b, c, d, a, k[12], 20, -1926607734);
	
	        a = hh(a, b, c, d, k[5], 4, -378558);
	        d = hh(d, a, b, c, k[8], 11, -2022574463);
	        c = hh(c, d, a, b, k[11], 16, 1839030562);
	        b = hh(b, c, d, a, k[14], 23, -35309556);
	        a = hh(a, b, c, d, k[1], 4, -1530992060);
	        d = hh(d, a, b, c, k[4], 11, 1272893353);
	        c = hh(c, d, a, b, k[7], 16, -155497632);
	        b = hh(b, c, d, a, k[10], 23, -1094730640);
	        a = hh(a, b, c, d, k[13], 4, 681279174);
	        d = hh(d, a, b, c, k[0], 11, -358537222);
	        c = hh(c, d, a, b, k[3], 16, -722521979);
	        b = hh(b, c, d, a, k[6], 23, 76029189);
	        a = hh(a, b, c, d, k[9], 4, -640364487);
	        d = hh(d, a, b, c, k[12], 11, -421815835);
	        c = hh(c, d, a, b, k[15], 16, 530742520);
	        b = hh(b, c, d, a, k[2], 23, -995338651);
	
	        a = ii(a, b, c, d, k[0], 6, -198630844);
	        d = ii(d, a, b, c, k[7], 10, 1126891415);
	        c = ii(c, d, a, b, k[14], 15, -1416354905);
	        b = ii(b, c, d, a, k[5], 21, -57434055);
	        a = ii(a, b, c, d, k[12], 6, 1700485571);
	        d = ii(d, a, b, c, k[3], 10, -1894986606);
	        c = ii(c, d, a, b, k[10], 15, -1051523);
	        b = ii(b, c, d, a, k[1], 21, -2054922799);
	        a = ii(a, b, c, d, k[8], 6, 1873313359);
	        d = ii(d, a, b, c, k[15], 10, -30611744);
	        c = ii(c, d, a, b, k[6], 15, -1560198380);
	        b = ii(b, c, d, a, k[13], 21, 1309151649);
	        a = ii(a, b, c, d, k[4], 6, -145523070);
	        d = ii(d, a, b, c, k[11], 10, -1120210379);
	        c = ii(c, d, a, b, k[2], 15, 718787259);
	        b = ii(b, c, d, a, k[9], 21, -343485551);
	
	        x[0] = add32(a, x[0]);
	        x[1] = add32(b, x[1]);
	        x[2] = add32(c, x[2]);
	        x[3] = add32(d, x[3]);
	    },
	
	    /* there needs to be support for Unicode here,
	       * unless we pretend that we can redefine the MD-5
	       * algorithm for multi-byte characters (perhaps
	       * by adding every four 16-bit characters and
	       * shortening the sum to 32 bits). Otherwise
	       * I suggest performing MD-5 as if every character
	       * was two bytes--e.g., 0040 0025 = @%--but then
	       * how will an ordinary MD-5 sum be matched?
	       * There is no way to standardize text to something
	       * like UTF-8 before transformation; speed cost is
	       * utterly prohibitive. The JavaScript standard
	       * itself needs to look at this: it should start
	       * providing access to strings as preformed UTF-8
	       * 8-bit unsigned value arrays.
	       */
	    md5blk = function (s) {
	        var md5blks = [],
	            i; /* Andy King said do it this way. */
	
	        for (i = 0; i < 64; i += 4) {
	            md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
	        }
	        return md5blks;
	    },
	
	    md5blk_array = function (a) {
	        var md5blks = [],
	            i; /* Andy King said do it this way. */
	
	        for (i = 0; i < 64; i += 4) {
	            md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
	        }
	        return md5blks;
	    },
	
	    md51 = function (s) {
	        var n = s.length,
	            state = [1732584193, -271733879, -1732584194, 271733878],
	            i,
	            length,
	            tail,
	            tmp,
	            lo,
	            hi;
	
	        for (i = 64; i <= n; i += 64) {
	            md5cycle(state, md5blk(s.substring(i - 64, i)));
	        }
	        s = s.substring(i - 64);
	        length = s.length;
	        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	        for (i = 0; i < length; i += 1) {
	            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
	        }
	        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
	        if (i > 55) {
	            md5cycle(state, tail);
	            for (i = 0; i < 16; i += 1) {
	                tail[i] = 0;
	            }
	        }
	
	        // Beware that the final length might not fit in 32 bits so we take care of that
	        tmp = n * 8;
	        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
	        lo = parseInt(tmp[2], 16);
	        hi = parseInt(tmp[1], 16) || 0;
	
	        tail[14] = lo;
	        tail[15] = hi;
	
	        md5cycle(state, tail);
	        return state;
	    },
	
	    md51_array = function (a) {
	        var n = a.length,
	            state = [1732584193, -271733879, -1732584194, 271733878],
	            i,
	            length,
	            tail,
	            tmp,
	            lo,
	            hi;
	
	        for (i = 64; i <= n; i += 64) {
	            md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
	        }
	
	        // Not sure if it is a bug, however IE10 will always produce a sub array of length 1
	        // containing the last element of the parent array if the sub array specified starts
	        // beyond the length of the parent array - weird.
	        // https://connect.microsoft.com/IE/feedback/details/771452/typed-array-subarray-issue
	        a = (i - 64) < n ? a.subarray(i - 64) : new Uint8Array(0);
	
	        length = a.length;
	        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	        for (i = 0; i < length; i += 1) {
	            tail[i >> 2] |= a[i] << ((i % 4) << 3);
	        }
	
	        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
	        if (i > 55) {
	            md5cycle(state, tail);
	            for (i = 0; i < 16; i += 1) {
	                tail[i] = 0;
	            }
	        }
	
	        // Beware that the final length might not fit in 32 bits so we take care of that
	        tmp = n * 8;
	        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
	        lo = parseInt(tmp[2], 16);
	        hi = parseInt(tmp[1], 16) || 0;
	
	        tail[14] = lo;
	        tail[15] = hi;
	
	        md5cycle(state, tail);
	
	        return state;
	    },
	
	    hex_chr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'],
	
	    rhex = function (n) {
	        var s = '',
	            j;
	        for (j = 0; j < 4; j += 1) {
	            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
	        }
	        return s;
	    },
	
	    hex = function (x) {
	        var i;
	        for (i = 0; i < x.length; i += 1) {
	            x[i] = rhex(x[i]);
	        }
	        return x.join('');
	    },
	
	    md5 = function (s) {
	        return hex(md51(s));
	    },
	
	
	
	    ////////////////////////////////////////////////////////////////////////////
	
	    /**
	     * SparkMD5 OOP implementation.
	     *
	     * Use this class to perform an incremental md5, otherwise use the
	     * static methods instead.
	     */
	    SparkMD5 = function () {
	        // call reset to init the instance
	        this.reset();
	    };
	
	
	    // In some cases the fast add32 function cannot be used..
	    if (md5('hello') !== '5d41402abc4b2a76b9719d911017c592') {
	        add32 = function (x, y) {
	            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
	                msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	            return (msw << 16) | (lsw & 0xFFFF);
	        };
	    }
	
	
	    /**
	     * Appends a string.
	     * A conversion will be applied if an utf8 string is detected.
	     *
	     * @param {String} str The string to be appended
	     *
	     * @return {SparkMD5} The instance itself
	     */
	    SparkMD5.prototype.append = function (str) {
	        // converts the string to utf8 bytes if necessary
	        if (/[\u0080-\uFFFF]/.test(str)) {
	            str = unescape(encodeURIComponent(str));
	        }
	
	        // then append as binary
	        this.appendBinary(str);
	
	        return this;
	    };
	
	    /**
	     * Appends a binary string.
	     *
	     * @param {String} contents The binary string to be appended
	     *
	     * @return {SparkMD5} The instance itself
	     */
	    SparkMD5.prototype.appendBinary = function (contents) {
	        this._buff += contents;
	        this._length += contents.length;
	
	        var length = this._buff.length,
	            i;
	
	        for (i = 64; i <= length; i += 64) {
	            md5cycle(this._state, md5blk(this._buff.substring(i - 64, i)));
	        }
	
	        this._buff = this._buff.substr(i - 64);
	
	        return this;
	    };
	
	    /**
	     * Finishes the incremental computation, reseting the internal state and
	     * returning the result.
	     * Use the raw parameter to obtain the raw result instead of the hex one.
	     *
	     * @param {Boolean} raw True to get the raw result, false to get the hex result
	     *
	     * @return {String|Array} The result
	     */
	    SparkMD5.prototype.end = function (raw) {
	        var buff = this._buff,
	            length = buff.length,
	            i,
	            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	            ret;
	
	        for (i = 0; i < length; i += 1) {
	            tail[i >> 2] |= buff.charCodeAt(i) << ((i % 4) << 3);
	        }
	
	        this._finish(tail, length);
	        ret = !!raw ? this._state : hex(this._state);
	
	        this.reset();
	
	        return ret;
	    };
	
	    /**
	     * Finish the final calculation based on the tail.
	     *
	     * @param {Array}  tail   The tail (will be modified)
	     * @param {Number} length The length of the remaining buffer
	     */
	    SparkMD5.prototype._finish = function (tail, length) {
	        var i = length,
	            tmp,
	            lo,
	            hi;
	
	        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
	        if (i > 55) {
	            md5cycle(this._state, tail);
	            for (i = 0; i < 16; i += 1) {
	                tail[i] = 0;
	            }
	        }
	
	        // Do the final computation based on the tail and length
	        // Beware that the final length may not fit in 32 bits so we take care of that
	        tmp = this._length * 8;
	        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
	        lo = parseInt(tmp[2], 16);
	        hi = parseInt(tmp[1], 16) || 0;
	
	        tail[14] = lo;
	        tail[15] = hi;
	        md5cycle(this._state, tail);
	    };
	
	    /**
	     * Resets the internal state of the computation.
	     *
	     * @return {SparkMD5} The instance itself
	     */
	    SparkMD5.prototype.reset = function () {
	        this._buff = "";
	        this._length = 0;
	        this._state = [1732584193, -271733879, -1732584194, 271733878];
	
	        return this;
	    };
	
	    /**
	     * Releases memory used by the incremental buffer and other aditional
	     * resources. If you plan to use the instance again, use reset instead.
	     */
	    SparkMD5.prototype.destroy = function () {
	        delete this._state;
	        delete this._buff;
	        delete this._length;
	    };
	
	
	    /**
	     * Performs the md5 hash on a string.
	     * A conversion will be applied if utf8 string is detected.
	     *
	     * @param {String}  str The string
	     * @param {Boolean} raw True to get the raw result, false to get the hex result
	     *
	     * @return {String|Array} The result
	     */
	    SparkMD5.hash = function (str, raw) {
	        // converts the string to utf8 bytes if necessary
	        if (/[\u0080-\uFFFF]/.test(str)) {
	            str = unescape(encodeURIComponent(str));
	        }
	
	        var hash = md51(str);
	
	        return !!raw ? hash : hex(hash);
	    };
	
	    /**
	     * Performs the md5 hash on a binary string.
	     *
	     * @param {String}  content The binary string
	     * @param {Boolean} raw     True to get the raw result, false to get the hex result
	     *
	     * @return {String|Array} The result
	     */
	    SparkMD5.hashBinary = function (content, raw) {
	        var hash = md51(content);
	
	        return !!raw ? hash : hex(hash);
	    };
	
	    /**
	     * SparkMD5 OOP implementation for array buffers.
	     *
	     * Use this class to perform an incremental md5 ONLY for array buffers.
	     */
	    SparkMD5.ArrayBuffer = function () {
	        // call reset to init the instance
	        this.reset();
	    };
	
	    ////////////////////////////////////////////////////////////////////////////
	
	    /**
	     * Appends an array buffer.
	     *
	     * @param {ArrayBuffer} arr The array to be appended
	     *
	     * @return {SparkMD5.ArrayBuffer} The instance itself
	     */
	    SparkMD5.ArrayBuffer.prototype.append = function (arr) {
	        // TODO: we could avoid the concatenation here but the algorithm would be more complex
	        //       if you find yourself needing extra performance, please make a PR.
	        var buff = this._concatArrayBuffer(this._buff, arr),
	            length = buff.length,
	            i;
	
	        this._length += arr.byteLength;
	
	        for (i = 64; i <= length; i += 64) {
	            md5cycle(this._state, md5blk_array(buff.subarray(i - 64, i)));
	        }
	
	        // Avoids IE10 weirdness (documented above)
	        this._buff = (i - 64) < length ? buff.subarray(i - 64) : new Uint8Array(0);
	
	        return this;
	    };
	
	    /**
	     * Finishes the incremental computation, reseting the internal state and
	     * returning the result.
	     * Use the raw parameter to obtain the raw result instead of the hex one.
	     *
	     * @param {Boolean} raw True to get the raw result, false to get the hex result
	     *
	     * @return {String|Array} The result
	     */
	    SparkMD5.ArrayBuffer.prototype.end = function (raw) {
	        var buff = this._buff,
	            length = buff.length,
	            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	            i,
	            ret;
	
	        for (i = 0; i < length; i += 1) {
	            tail[i >> 2] |= buff[i] << ((i % 4) << 3);
	        }
	
	        this._finish(tail, length);
	        ret = !!raw ? this._state : hex(this._state);
	
	        this.reset();
	
	        return ret;
	    };
	
	    SparkMD5.ArrayBuffer.prototype._finish = SparkMD5.prototype._finish;
	
	    /**
	     * Resets the internal state of the computation.
	     *
	     * @return {SparkMD5.ArrayBuffer} The instance itself
	     */
	    SparkMD5.ArrayBuffer.prototype.reset = function () {
	        this._buff = new Uint8Array(0);
	        this._length = 0;
	        this._state = [1732584193, -271733879, -1732584194, 271733878];
	
	        return this;
	    };
	
	    /**
	     * Releases memory used by the incremental buffer and other aditional
	     * resources. If you plan to use the instance again, use reset instead.
	     */
	    SparkMD5.ArrayBuffer.prototype.destroy = SparkMD5.prototype.destroy;
	
	    /**
	     * Concats two array buffers, returning a new one.
	     *
	     * @param  {ArrayBuffer} first  The first array buffer
	     * @param  {ArrayBuffer} second The second array buffer
	     *
	     * @return {ArrayBuffer} The new array buffer
	     */
	    SparkMD5.ArrayBuffer.prototype._concatArrayBuffer = function (first, second) {
	        var firstLength = first.length,
	            result = new Uint8Array(firstLength + second.byteLength);
	
	        result.set(first);
	        result.set(new Uint8Array(second), firstLength);
	
	        return result;
	    };
	
	    /**
	     * Performs the md5 hash on an array buffer.
	     *
	     * @param {ArrayBuffer} arr The array buffer
	     * @param {Boolean}     raw True to get the raw result, false to get the hex result
	     *
	     * @return {String|Array} The result
	     */
	    SparkMD5.ArrayBuffer.hash = function (arr, raw) {
	        var hash = md51_array(new Uint8Array(arr));
	
	        return !!raw ? hash : hex(hash);
	    };
	
	    return SparkMD5;
	}));


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var massageCreateIndexRequest = __webpack_require__(30);
	
	function createIndex(db, requestDef, callback) {
	  requestDef = massageCreateIndexRequest(requestDef);
	
	  db.request({
	    method: 'POST',
	    url: '_index',
	    body: requestDef
	  }, callback);
	}
	
	function find(db, requestDef, callback) {
	  db.request({
	    method: 'POST',
	    url: '_find',
	    body: requestDef
	  }, callback);
	}
	
	function getIndexes(db, callback) {
	  db.request({
	    method: 'GET',
	    url: '_index'
	  }, callback);
	}
	
	function deleteIndex(db, indexDef, callback) {
	
	
	  var ddoc = indexDef.ddoc;
	  var type = indexDef.type || 'json';
	  var name = indexDef.name;
	
	  if (!ddoc) {
	    return callback(new Error('you must provide an index\'s ddoc'));
	  }
	
	  if (!name) {
	    return callback(new Error('you must provide an index\'s name'));
	  }
	
	  var url = '_index/' + [ddoc, type, name].map(encodeURIComponent).join('/');
	
	  db.request({
	    method: 'DELETE',
	    url: url
	  }, callback);
	}
	
	exports.createIndex = createIndex;
	exports.find = find;
	exports.getIndexes = getIndexes;
	exports.deleteIndex = deleteIndex;

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(24);
	var clone = utils.clone;
	
	// we restucture the supplied JSON considerably, because the official
	// Mango API is very particular about a lot of this stuff, but we like
	// to be liberal with what we accept in order to prevent mental
	// breakdowns in our users
	module.exports = function (requestDef) {
	  requestDef = clone(requestDef);
	
	  if (!requestDef.index) {
	    requestDef.index = {};
	  }
	
	  ['type', 'name', 'ddoc'].forEach(function (key) {
	    if (requestDef.index[key]) {
	      requestDef[key] = requestDef.index[key];
	      delete requestDef.index[key];
	    }
	  });
	
	  if (requestDef.fields) {
	    requestDef.index.fields = requestDef.fields;
	    delete requestDef.fields;
	  }
	
	  if (!requestDef.type) {
	    requestDef.type = 'json';
	  }
	  return requestDef;
	};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(24);
	var callbackify = utils.callbackify;
	
	exports.createIndex = callbackify(__webpack_require__(32));
	exports.find = callbackify(__webpack_require__(43));
	exports.getIndexes = callbackify(__webpack_require__(44));
	exports.deleteIndex = callbackify(__webpack_require__(48));

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(24);
	var log = utils.log;
	
	var pouchUpsert = __webpack_require__(33);
	var abstractMapper = __webpack_require__(35);
	var localUtils = __webpack_require__(36);
	var validateIndex = localUtils.validateIndex;
	var massageIndexDef = localUtils.massageIndexDef;
	var massageCreateIndexRequest = __webpack_require__(30);
	
	function upsert(db, docId, diffFun) {
	  return pouchUpsert.upsert.call(db, docId, diffFun);
	}
	
	function createIndex(db, requestDef) {
	  requestDef = massageCreateIndexRequest(requestDef);
	  var originalIndexDef = utils.clone(requestDef.index);
	  requestDef.index = massageIndexDef(requestDef.index);
	
	  validateIndex(requestDef.index);
	
	  var md5 = utils.MD5(JSON.stringify(requestDef));
	
	  var viewName = requestDef.name || ('idx-' + md5);
	
	  var ddocName = requestDef.ddoc || ('idx-' + md5);
	  var ddocId = '_design/' + ddocName;
	
	  var hasInvalidLanguage = false;
	  var viewExists = false;
	
	  function updateDdoc(doc) {
	    if (doc._rev && doc.language !== 'query') {
	      hasInvalidLanguage = true;
	    }
	    doc.language = 'query';
	    doc.views = doc.views || {};
	
	    viewExists = !!doc.views[viewName];
	
	    doc.views[viewName] = {
	      map: {
	        fields: utils.mergeObjects(requestDef.index.fields)
	      },
	      reduce: '_count',
	      options: {
	        def: originalIndexDef
	      }
	    };
	
	    return doc;
	  }
	
	  log('creating index', ddocId);
	
	  return upsert(db, ddocId, updateDdoc).then(function () {
	    if (hasInvalidLanguage) {
	      throw new Error('invalid language for ddoc with id "' +
	      ddocId +
	      '" (should be "query")');
	    }
	  }).then(function () {
	    // kick off a build
	    // TODO: abstract-pouchdb-mapreduce should support auto-updating
	    // TODO: should also use update_after, but pouchdb/pouchdb#3415 blocks me
	    var signature = ddocName + '/' + viewName;
	    return abstractMapper.query.call(db, signature, {
	      limit: 0,
	      reduce: false
	    }).then(function () {
	      return {
	        id: ddocId,
	        name: viewName,
	        result: viewExists ? 'exists' : 'created'
	      };
	    });
	  });
	}
	
	module.exports = createIndex;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var PouchPromise = __webpack_require__(34);
	
	// this is essentially the "update sugar" function from daleharvey/pouchdb#1388
	// the diffFun tells us what delta to apply to the doc.  it either returns
	// the doc, or false if it doesn't need to do an update after all
	function upsertInner(db, docId, diffFun) {
	  if (typeof docId !== 'string') {
	    return PouchPromise.reject(new Error('doc id is required'));
	  }
	
	  return db.get(docId).catch(function (err) {
	    /* istanbul ignore next */
	    if (err.status !== 404) {
	      throw err;
	    }
	    return {};
	  }).then(function (doc) {
	    // the user might change the _rev, so save it for posterity
	    var docRev = doc._rev;
	    var newDoc = diffFun(doc);
	
	    if (!newDoc) {
	      // if the diffFun returns falsy, we short-circuit as
	      // an optimization
	      return { updated: false, rev: docRev };
	    }
	
	    // users aren't allowed to modify these values,
	    // so reset them here
	    newDoc._id = docId;
	    newDoc._rev = docRev;
	    return tryAndPut(db, newDoc, diffFun);
	  });
	}
	
	function tryAndPut(db, doc, diffFun) {
	  return db.put(doc).then(function (res) {
	    return {
	      updated: true,
	      rev: res.rev
	    };
	  }, function (err) {
	    /* istanbul ignore next */
	    if (err.status !== 409) {
	      throw err;
	    }
	    return upsertInner(db, doc._id, diffFun);
	  });
	}
	
	exports.upsert = function upsert(docId, diffFun, cb) {
	  var db = this;
	  var promise = upsertInner(db, docId, diffFun);
	  if (typeof cb !== 'function') {
	    return promise;
	  }
	  promise.then(function (resp) {
	    cb(null, resp);
	  }, cb);
	};
	
	exports.putIfNotExists = function putIfNotExists(docId, doc, cb) {
	  var db = this;
	
	  if (typeof docId !== 'string') {
	    cb = doc;
	    doc = docId;
	    docId = doc._id;
	  }
	
	  var diffFun = function (existingDoc) {
	    if (existingDoc._rev) {
	      return false; // do nothing
	    }
	    return doc;
	  };
	
	  var promise = upsertInner(db, docId, diffFun);
	  if (typeof cb !== 'function') {
	    return promise;
	  }
	  promise.then(function (resp) {
	    cb(null, resp);
	  }, cb);
	};
	
	
	/* istanbul ignore next */
	if (typeof window !== 'undefined' && window.PouchDB) {
	  window.PouchDB.plugin(exports);
	}


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }
	
	var lie = _interopDefault(__webpack_require__(8));
	
	/* istanbul ignore next */
	var PouchPromise = typeof Promise === 'function' ? Promise : lie;
	
	module.exports = PouchPromise;

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var localUtils = __webpack_require__(36);
	var abstractMapReduce = __webpack_require__(37);
	var parseField = localUtils.parseField;
	
	//
	// One thing about these mappers:
	//
	// Per the advice of John-David Dalton (http://youtu.be/NthmeLEhDDM),
	// what you want to do in this case is optimize for the smallest possible
	// function, since that's the thing that gets run over and over again.
	//
	// This code would be a lot simpler if all the if/elses were inside
	// the function, but it would also be a lot less performant.
	//
	
	
	function createDeepMultiMapper(fields, emit) {
	  return function (doc) {
	    var toEmit = [];
	    for (var i = 0, iLen = fields.length; i < iLen; i++) {
	      var parsedField = parseField(fields[i]);
	      var value = doc;
	      for (var j = 0, jLen = parsedField.length; j < jLen; j++) {
	        var key = parsedField[j];
	        value = value[key];
	        if (!value) {
	          break;
	        }
	      }
	      toEmit.push(value);
	    }
	    emit(toEmit);
	  };
	}
	
	function createDeepSingleMapper(field, emit) {
	  var parsedField = parseField(field);
	  return function (doc) {
	    var value = doc;
	    for (var i = 0, len = parsedField.length; i < len; i++) {
	      var key = parsedField[i];
	      value = value[key];
	      if (!value) {
	        return; // do nothing
	      }
	    }
	    emit(value);
	  };
	}
	
	function createShallowSingleMapper(field, emit) {
	  return function (doc) {
	    emit(doc[field]);
	  };
	}
	
	function createShallowMultiMapper(fields, emit) {
	  return function (doc) {
	    var toEmit = [];
	    for (var i = 0, len = fields.length; i < len; i++) {
	      toEmit.push(doc[fields[i]]);
	    }
	    emit(toEmit);
	  };
	}
	
	function checkShallow(fields) {
	  for (var i = 0, len = fields.length; i < len; i++) {
	    var field = fields[i];
	    if (field.indexOf('.') !== -1) {
	      return false;
	    }
	  }
	  return true;
	}
	
	function createMapper(fields, emit) {
	  var isShallow = checkShallow(fields);
	  var isSingle = fields.length === 1;
	
	  // notice we try to optimize for the most common case,
	  // i.e. single shallow indexes
	  if (isShallow) {
	    if (isSingle) {
	      return createShallowSingleMapper(fields[0], emit);
	    } else { // multi
	      return createShallowMultiMapper(fields, emit);
	    }
	  } else { // deep
	    if (isSingle) {
	      return createDeepSingleMapper(fields[0], emit);
	    } else { // multi
	      return createDeepMultiMapper(fields, emit);
	    }
	  }
	}
	
	function mapper(mapFunDef, emit) {
	  // mapFunDef is a list of fields
	
	  var fields = Object.keys(mapFunDef.fields);
	
	  return createMapper(fields, emit);
	}
	
	/* istanbul ignore next */
	function reducer(/*reduceFunDef*/) {
	  throw new Error('reduce not supported');
	}
	
	function ddocValidator(ddoc, viewName) {
	  var view = ddoc.views[viewName];
	  // This doesn't actually need to be here apparently, but
	  // I feel safer keeping it.
	  /* istanbul ignore if */
	  if (!view.map || !view.map.fields) {
	    throw new Error('ddoc ' + ddoc._id +' with view ' + viewName +
	      ' doesn\'t have map.fields defined. ' +
	      'maybe it wasn\'t created by this plugin?');
	  }
	}
	
	var abstractMapper = abstractMapReduce({
	  name: 'indexes',
	  mapper: mapper,
	  reducer: reducer,
	  ddocValidator: ddocValidator
	});
	
	module.exports = abstractMapper;

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(24);
	var collate = __webpack_require__(17);
	
	function getKey(obj) {
	  return Object.keys(obj)[0];
	}
	
	function getValue(obj) {
	  return obj[getKey(obj)];
	}
	
	// normalize the "sort" value
	function massageSort(sort) {
	  if (!Array.isArray(sort)) {
	    throw new Error('invalid sort json - should be an array');
	  }
	  return sort.map(function (sorting) {
	    if (typeof sorting === 'string') {
	      var obj = {};
	      obj[sorting] = 'asc';
	      return obj;
	    } else {
	      return sorting;
	    }
	  });
	}
	
	var combinationFields = ['$or', '$nor', '$not'];
	function isCombinationalField (field) {
	  return combinationFields.indexOf(field) > -1;
	}
	
	// collapse logically equivalent gt/gte values
	function mergeGtGte(operator, value, fieldMatchers) {
	  if (typeof fieldMatchers.$eq !== 'undefined') {
	    return; // do nothing
	  }
	  if (typeof fieldMatchers.$gte !== 'undefined') {
	    if (operator === '$gte') {
	      if (value > fieldMatchers.$gte) { // more specificity
	        fieldMatchers.$gte = value;
	      }
	    } else { // operator === '$gt'
	      if (value >= fieldMatchers.$gte) { // more specificity
	        delete fieldMatchers.$gte;
	        fieldMatchers.$gt = value;
	      }
	    }
	  } else if (typeof fieldMatchers.$gt !== 'undefined') {
	    if (operator === '$gte') {
	      if (value > fieldMatchers.$gt) { // more specificity
	        delete fieldMatchers.$gt;
	        fieldMatchers.$gte = value;
	      }
	    } else { // operator === '$gt'
	      if (value > fieldMatchers.$gt) { // more specificity
	        fieldMatchers.$gt = value;
	      }
	    }
	  } else {
	    fieldMatchers[operator] = value;
	  }
	}
	
	// collapse logically equivalent lt/lte values
	function mergeLtLte(operator, value, fieldMatchers) {
	  if (typeof fieldMatchers.$eq !== 'undefined') {
	    return; // do nothing
	  }
	  if (typeof fieldMatchers.$lte !== 'undefined') {
	    if (operator === '$lte') {
	      if (value < fieldMatchers.$lte) { // more specificity
	        fieldMatchers.$lte = value;
	      }
	    } else { // operator === '$gt'
	      if (value <= fieldMatchers.$lte) { // more specificity
	        delete fieldMatchers.$lte;
	        fieldMatchers.$lt = value;
	      }
	    }
	  } else if (typeof fieldMatchers.$lt !== 'undefined') {
	    if (operator === '$lte') {
	      if (value < fieldMatchers.$lt) { // more specificity
	        delete fieldMatchers.$lt;
	        fieldMatchers.$lte = value;
	      }
	    } else { // operator === '$gt'
	      if (value < fieldMatchers.$lt) { // more specificity
	        fieldMatchers.$lt = value;
	      }
	    }
	  } else {
	    fieldMatchers[operator] = value;
	  }
	}
	
	// combine $ne values into one array
	function mergeNe(value, fieldMatchers) {
	  if ('$ne' in fieldMatchers) {
	    // there are many things this could "not" be
	    fieldMatchers.$ne.push(value);
	  } else { // doesn't exist yet
	    fieldMatchers.$ne = [value];
	  }
	}
	
	// add $eq into the mix
	function mergeEq(value, fieldMatchers) {
	  // these all have less specificity than the $eq
	  // TODO: check for user errors here
	  delete fieldMatchers.$gt;
	  delete fieldMatchers.$gte;
	  delete fieldMatchers.$lt;
	  delete fieldMatchers.$lte;
	  delete fieldMatchers.$ne;
	  fieldMatchers.$eq = value;
	}
	
	// flatten an array of selectors joined by an $and operator
	function mergeAndedSelectors(selectors) {
	
	  // sort to ensure that e.g. if the user specified
	  // $and: [{$gt: 'a'}, {$gt: 'b'}], then it's collapsed into
	  // just {$gt: 'b'}
	  var res = {};
	
	  selectors.forEach(function (selector) {
	    Object.keys(selector).forEach(function (field) {
	      var matcher = selector[field];
	      if (typeof matcher !== 'object') {
	        matcher = {$eq: matcher};
	      }
	
	      if (isCombinationalField(field)) {
	        if (matcher instanceof Array) {
	          res[field] = matcher.map(function (m) {
	            return mergeAndedSelectors([m]);
	          });
	        } else {
	          res[field] = mergeAndedSelectors([matcher]);
	        }
	      } else {
	        var fieldMatchers = res[field] = res[field] || {};
	        Object.keys(matcher).forEach(function (operator) {
	          var value = matcher[operator];
	
	          if (operator === '$gt' || operator === '$gte') {
	            return mergeGtGte(operator, value, fieldMatchers);
	          } else if (operator === '$lt' || operator === '$lte') {
	            return mergeLtLte(operator, value, fieldMatchers);
	          } else if (operator === '$ne') {
	            return mergeNe(value, fieldMatchers);
	          } else if (operator === '$eq') {
	            return mergeEq(value, fieldMatchers);
	          }
	          fieldMatchers[operator] = value;
	        });
	      }
	    });
	  });
	
	  return res;
	}
	
	//
	// normalize the selector
	//
	function massageSelector(input) {
	  var result = utils.clone(input);
	  var wasAnded = false;
	  if ('$and' in result) {
	    result = mergeAndedSelectors(result['$and']);
	    wasAnded = true;
	  }
	
	  if ('$not' in result) {
	    //This feels a little like forcing, but it will work for now,
	    //I would like to come back to this and make the merging of selectors a little more generic
	    result['$not'] = mergeAndedSelectors([result['$not']]);
	  }
	
	  var fields = Object.keys(result);
	
	  for (var i = 0; i < fields.length; i++) {
	    var field = fields[i];
	    var matcher = result[field];
	
	    if (typeof matcher !== 'object' || matcher === null) {
	      matcher = {$eq: matcher};
	    } else if ('$ne' in matcher && !wasAnded) {
	      // I put these in an array, since there may be more than one
	      // but in the "mergeAnded" operation, I already take care of that
	      matcher.$ne = [matcher.$ne];
	    }
	    result[field] = matcher;
	  }
	
	  return result;
	}
	
	
	function massageIndexDef(indexDef) {
	  indexDef.fields = indexDef.fields.map(function (field) {
	    if (typeof field === 'string') {
	      var obj = {};
	      obj[field] = 'asc';
	      return obj;
	    }
	    return field;
	  });
	  return indexDef;
	}
	
	function getKeyFromDoc(doc, index) {
	  var res = [];
	  for (var i = 0; i < index.def.fields.length; i++) {
	    var field = getKey(index.def.fields[i]);
	    res.push(doc[field]);
	  }
	  return res;
	}
	
	// have to do this manually because REASONS. I don't know why
	// CouchDB didn't implement inclusive_start
	function filterInclusiveStart(rows, targetValue, index) {
	  var indexFields = index.def.fields;
	  for (var i = 0, len = rows.length; i < len; i++) {
	    var row = rows[i];
	
	    // shave off any docs at the beginning that are <= the
	    // target value
	
	    var docKey = getKeyFromDoc(row.doc, index);
	    if (indexFields.length === 1) {
	      docKey = docKey[0]; // only one field, not multi-field
	    } else { // more than one field in index
	      // in the case where e.g. the user is searching {$gt: {a: 1}}
	      // but the index is [a, b], then we need to shorten the doc key
	      while (docKey.length > targetValue.length) {
	        docKey.pop();
	      }
	    }
	    //ABS as we just looking for values that don't match
	    if (Math.abs(collate.collate(docKey, targetValue)) > 0) {
	      // no need to filter any further; we're past the key
	      break;
	    }
	  }
	  return i > 0 ? rows.slice(i) : rows;
	}
	
	function reverseOptions(opts) {
	  var newOpts = utils.clone(opts);
	  delete newOpts.startkey;
	  delete newOpts.endkey;
	  delete newOpts.inclusive_start;
	  delete newOpts.inclusive_end;
	
	  if ('endkey' in opts) {
	    newOpts.startkey = opts.endkey;
	  }
	  if ('startkey' in opts) {
	    newOpts.endkey = opts.startkey;
	  }
	  if ('inclusive_start' in opts) {
	    newOpts.inclusive_end = opts.inclusive_start;
	  }
	  if ('inclusive_end' in opts) {
	    newOpts.inclusive_start = opts.inclusive_end;
	  }
	  return newOpts;
	}
	
	function validateIndex(index) {
	  var ascFields = index.fields.filter(function (field) {
	    return getValue(field) === 'asc';
	  });
	  if (ascFields.length !== 0 && ascFields.length !== index.fields.length) {
	    throw new Error('unsupported mixed sorting');
	  }
	}
	
	function validateSort (requestDef, index) {
	  if (index.defaultUsed && requestDef.sort) {
	    var noneIdSorts = requestDef.sort.filter(function (sortItem) {
	      return Object.keys(sortItem)[0] !== '_id';
	    }).map(function (sortItem) {
	      return Object.keys(sortItem)[0];
	    });
	
	    if (noneIdSorts.length > 0) {
	      throw new Error('Cannot sort on field(s) "' + noneIdSorts.join(',') +
	      '" when using the default index');
	    }
	  }
	
	  if (index.defaultUsed) {
	    return;
	  }
	}
	
	function validateFindRequest(requestDef) {
	  if (typeof requestDef.selector !== 'object') {
	    throw new Error('you must provide a selector when you find()');
	  }
	
	  /*var selectors = requestDef.selector['$and'] || [requestDef.selector];
	  for (var i = 0; i < selectors.length; i++) {
	    var selector = selectors[i];
	    var keys = Object.keys(selector);
	    if (keys.length === 0) {
	      throw new Error('invalid empty selector');
	    }
	    //var selection = selector[keys[0]];
	    /*if (Object.keys(selection).length !== 1) {
	      throw new Error('invalid selector: ' + JSON.stringify(selection) +
	        ' - it must have exactly one key/value');
	    }
	  }*/
	}
	
	// determine the maximum number of fields
	// we're going to need to query, e.g. if the user
	// has selection ['a'] and sorting ['a', 'b'], then we
	// need to use the longer of the two: ['a', 'b']
	function getUserFields(selector, sort) {
	  var selectorFields = Object.keys(selector);
	  var sortFields = sort? sort.map(getKey) : [];
	  var userFields;
	  if (selectorFields.length >= sortFields.length) {
	    userFields = selectorFields;
	  } else {
	    userFields = sortFields;
	  }
	
	  if (sortFields.length === 0) {
	    return {
	      fields: userFields
	    };
	  }
	
	  // sort according to the user's preferred sorting
	  userFields = userFields.sort(function (left, right) {
	    var leftIdx = sortFields.indexOf(left);
	    if (leftIdx === -1) {
	      leftIdx = Number.MAX_VALUE;
	    }
	    var rightIdx = sortFields.indexOf(right);
	    if (rightIdx === -1) {
	      rightIdx = Number.MAX_VALUE;
	    }
	    return leftIdx < rightIdx ? -1 : leftIdx > rightIdx ? 1 : 0;
	  });
	
	  return {
	    fields: userFields,
	    sortOrder: sort.map(getKey)
	  };
	}
	
	module.exports = {
	  getKey: getKey,
	  getValue: getValue,
	  massageSort: massageSort,
	  massageSelector: massageSelector,
	  validateIndex: validateIndex,
	  validateFindRequest: validateFindRequest,
	  validateSort: validateSort,
	  reverseOptions: reverseOptions,
	  filterInclusiveStart: filterInclusiveStart,
	  massageIndexDef: massageIndexDef,
	  parseField: utils.parseField,
	  getUserFields: getUserFields,
	  isCombinationalField: isCombinationalField
	};


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var pouchCollate = __webpack_require__(17);
	var TaskQueue = __webpack_require__(38);
	var collate = pouchCollate.collate;
	var toIndexableString = pouchCollate.toIndexableString;
	var normalizeKey = pouchCollate.normalizeKey;
	var createView = __webpack_require__(41);
	var log;
	/* istanbul ignore else */
	if ((typeof console !== 'undefined') && (typeof console.log === 'function')) {
	  log = Function.prototype.bind.call(console.log, console);
	} else {
	  log = function () {};
	}
	var utils = __webpack_require__(39);
	var Promise = utils.Promise;
	var persistentQueues = {};
	var tempViewQueue = new TaskQueue();
	var CHANGES_BATCH_SIZE = 50;
	
	function QueryParseError(message) {
	  this.status = 400;
	  this.name = 'query_parse_error';
	  this.message = message;
	  this.error = true;
	  try {
	    Error.captureStackTrace(this, QueryParseError);
	  } catch (e) {}
	}
	
	utils.inherits(QueryParseError, Error);
	
	function NotFoundError(message) {
	  this.status = 404;
	  this.name = 'not_found';
	  this.message = message;
	  this.error = true;
	  try {
	    Error.captureStackTrace(this, NotFoundError);
	  } catch (e) {}
	}
	
	utils.inherits(NotFoundError, Error);
	
	function parseViewName(name) {
	  // can be either 'ddocname/viewname' or just 'viewname'
	  // (where the ddoc name is the same)
	  return name.indexOf('/') === -1 ? [name, name] : name.split('/');
	}
	
	function isGenOne(changes) {
	  // only return true if the current change is 1-
	  // and there are no other leafs
	  return changes.length === 1 && /^1-/.test(changes[0].rev);
	}
	
	function sortByKeyThenValue(x, y) {
	  var keyCompare = collate(x.key, y.key);
	  return keyCompare !== 0 ? keyCompare : collate(x.value, y.value);
	}
	
	function sliceResults(results, limit, skip) {
	  skip = skip || 0;
	  if (typeof limit === 'number') {
	    return results.slice(skip, limit + skip);
	  } else if (skip > 0) {
	    return results.slice(skip);
	  }
	  return results;
	}
	
	function rowToDocId(row) {
	  var val = row.value;
	  // Users can explicitly specify a joined doc _id, or it
	  // defaults to the doc _id that emitted the key/value.
	  var docId = (val && typeof val === 'object' && val._id) || row.id;
	  return docId;
	}
	
	function emitError(db, e) {
	  try {
	    db.emit('error', e);
	  } catch (err) {
	    console.error(
	      'The user\'s map/reduce function threw an uncaught error.\n' +
	      'You can debug this error by doing:\n' +
	      'myDatabase.on(\'error\', function (err) { debugger; });\n' +
	      'Please double-check your map/reduce function.');
	    console.error(e);
	  }
	}
	
	function tryCode(db, fun, args) {
	  // emit an event if there was an error thrown by a map/reduce function.
	  // putting try/catches in a single function also avoids deoptimizations.
	  try {
	    return {
	      output : fun.apply(null, args)
	    };
	  } catch (e) {
	    emitError(db, e);
	    return {error: e};
	  }
	}
	
	function checkQueryParseError(options, fun) {
	  var startkeyName = options.descending ? 'endkey' : 'startkey';
	  var endkeyName = options.descending ? 'startkey' : 'endkey';
	
	  if (typeof options[startkeyName] !== 'undefined' &&
	    typeof options[endkeyName] !== 'undefined' &&
	    collate(options[startkeyName], options[endkeyName]) > 0) {
	    throw new QueryParseError('No rows can match your key range, reverse your ' +
	    'start_key and end_key or set {descending : true}');
	  } else if (fun.reduce && options.reduce !== false) {
	    if (options.include_docs) {
	      throw new QueryParseError('{include_docs:true} is invalid for reduce');
	    } else if (options.keys && options.keys.length > 1 &&
	      !options.group && !options.group_level) {
	      throw new QueryParseError('Multi-key fetches for reduce views must use {group: true}');
	    }
	  }
	  if (options.group_level) {
	    if (typeof options.group_level !== 'number') {
	      throw new QueryParseError('Invalid value for integer: "' + options.group_level + '"');
	    }
	    if (options.group_level < 0) {
	      throw new QueryParseError('Invalid value for positive integer: ' +
	      '"' + options.group_level + '"');
	    }
	  }
	}
	
	function defaultsTo(value) {
	  return function (reason) {
	    /* istanbul ignore else */
	    if (reason.status === 404) {
	      return value;
	    } else {
	      throw reason;
	    }
	  };
	}
	
	function createIndexer(def) {
	
	  var pluginName = def.name;
	  var mapper = def.mapper;
	  var reducer = def.reducer;
	  var ddocValidator = def.ddocValidator;
	
	
	  // returns a promise for a list of docs to update, based on the input docId.
	  // the order doesn't matter, because post-3.2.0, bulkDocs
	  // is an atomic operation in all three adapters.
	  function getDocsToPersist(docId, view, docIdsToChangesAndEmits) {
	    var metaDocId = '_local/doc_' + docId;
	    var defaultMetaDoc = {_id: metaDocId, keys: []};
	    var docData = docIdsToChangesAndEmits[docId];
	    var indexableKeysToKeyValues = docData.indexableKeysToKeyValues;
	    var changes = docData.changes;
	
	    function getMetaDoc() {
	      if (isGenOne(changes)) {
	        // generation 1, so we can safely assume initial state
	        // for performance reasons (avoids unnecessary GETs)
	        return Promise.resolve(defaultMetaDoc);
	      }
	      return view.db.get(metaDocId).catch(defaultsTo(defaultMetaDoc));
	    }
	
	    function getKeyValueDocs(metaDoc) {
	      if (!metaDoc.keys.length) {
	        // no keys, no need for a lookup
	        return Promise.resolve({rows: []});
	      }
	      return view.db.allDocs({
	        keys: metaDoc.keys,
	        include_docs: true
	      });
	    }
	
	    function processKvDocs(metaDoc, kvDocsRes) {
	      var kvDocs = [];
	      var oldKeysMap = {};
	
	      for (var i = 0, len = kvDocsRes.rows.length; i < len; i++) {
	        var row = kvDocsRes.rows[i];
	        var doc = row.doc;
	        if (!doc) { // deleted
	          continue;
	        }
	        kvDocs.push(doc);
	        oldKeysMap[doc._id] = true;
	        doc._deleted = !indexableKeysToKeyValues[doc._id];
	        if (!doc._deleted) {
	          var keyValue = indexableKeysToKeyValues[doc._id];
	          if ('value' in keyValue) {
	            doc.value = keyValue.value;
	          }
	        }
	      }
	
	      var newKeys = Object.keys(indexableKeysToKeyValues);
	      newKeys.forEach(function (key) {
	        if (!oldKeysMap[key]) {
	          // new doc
	          var kvDoc = {
	            _id: key
	          };
	          var keyValue = indexableKeysToKeyValues[key];
	          if ('value' in keyValue) {
	            kvDoc.value = keyValue.value;
	          }
	          kvDocs.push(kvDoc);
	        }
	      });
	      metaDoc.keys = utils.uniq(newKeys.concat(metaDoc.keys));
	      kvDocs.push(metaDoc);
	
	      return kvDocs;
	    }
	
	    return getMetaDoc().then(function (metaDoc) {
	      return getKeyValueDocs(metaDoc).then(function (kvDocsRes) {
	        return processKvDocs(metaDoc, kvDocsRes);
	      });
	    });
	  }
	
	  // updates all emitted key/value docs and metaDocs in the mrview database
	  // for the given batch of documents from the source database
	  function saveKeyValues(view, docIdsToChangesAndEmits, seq) {
	    var seqDocId = '_local/lastSeq';
	    return view.db.get(seqDocId)
	    .catch(defaultsTo({_id: seqDocId, seq: 0}))
	    .then(function (lastSeqDoc) {
	      var docIds = Object.keys(docIdsToChangesAndEmits);
	      return Promise.all(docIds.map(function (docId) {
	        return getDocsToPersist(docId, view, docIdsToChangesAndEmits);
	      })).then(function (listOfDocsToPersist) {
	        var docsToPersist = utils.flatten(listOfDocsToPersist);
	        lastSeqDoc.seq = seq;
	        docsToPersist.push(lastSeqDoc);
	        // write all docs in a single operation, update the seq once
	        return view.db.bulkDocs({docs : docsToPersist});
	      });
	    });
	  }
	
	  function getQueue(view) {
	    var viewName = typeof view === 'string' ? view : view.name;
	    var queue = persistentQueues[viewName];
	    if (!queue) {
	      queue = persistentQueues[viewName] = new TaskQueue();
	    }
	    return queue;
	  }
	
	  function updateView(view) {
	    return utils.sequentialize(getQueue(view), function () {
	      return updateViewInQueue(view);
	    })();
	  }
	
	  function updateViewInQueue(view) {
	    // bind the emit function once
	    var mapResults;
	    var doc;
	
	    function emit(key, value) {
	      var output = {id: doc._id, key: normalizeKey(key)};
	      // Don't explicitly store the value unless it's defined and non-null.
	      // This saves on storage space, because often people don't use it.
	      if (typeof value !== 'undefined' && value !== null) {
	        output.value = normalizeKey(value);
	      }
	      mapResults.push(output);
	    }
	
	    var mapFun = mapper(view.mapFun, emit);
	
	    var currentSeq = view.seq || 0;
	
	    function processChange(docIdsToChangesAndEmits, seq) {
	      return function () {
	        return saveKeyValues(view, docIdsToChangesAndEmits, seq);
	      };
	    }
	
	    var queue = new TaskQueue();
	
	    return new Promise(function (resolve, reject) {
	
	      function complete() {
	        queue.finish().then(function () {
	          view.seq = currentSeq;
	          resolve();
	        });
	      }
	
	      function processNextBatch() {
	        view.sourceDB.changes({
	          conflicts: true,
	          include_docs: true,
	          style: 'all_docs',
	          since: currentSeq,
	          limit: CHANGES_BATCH_SIZE
	        }).on('complete', function (response) {
	          var results = response.results;
	          if (!results.length) {
	            return complete();
	          }
	          var docIdsToChangesAndEmits = {};
	          for (var i = 0, l = results.length; i < l; i++) {
	            var change = results[i];
	            if (change.doc._id[0] !== '_') {
	              mapResults = [];
	              doc = change.doc;
	
	              if (!doc._deleted) {
	                tryCode(view.sourceDB, mapFun, [doc]);
	              }
	              mapResults.sort(sortByKeyThenValue);
	
	              var indexableKeysToKeyValues = {};
	              var lastKey;
	              for (var j = 0, jl = mapResults.length; j < jl; j++) {
	                var obj = mapResults[j];
	                var complexKey = [obj.key, obj.id];
	                if (collate(obj.key, lastKey) === 0) {
	                  complexKey.push(j); // dup key+id, so make it unique
	                }
	                var indexableKey = toIndexableString(complexKey);
	                indexableKeysToKeyValues[indexableKey] = obj;
	                lastKey = obj.key;
	              }
	              docIdsToChangesAndEmits[change.doc._id] = {
	                indexableKeysToKeyValues: indexableKeysToKeyValues,
	                changes: change.changes
	              };
	            }
	            currentSeq = change.seq;
	          }
	          queue.add(processChange(docIdsToChangesAndEmits, currentSeq));
	          if (results.length < CHANGES_BATCH_SIZE) {
	            return complete();
	          }
	          return processNextBatch();
	        }).on('error', onError);
	        /* istanbul ignore next */
	        function onError(err) {
	          reject(err);
	        }
	      }
	
	      processNextBatch();
	    });
	  }
	
	  function reduceView(view, results, options) {
	    if (options.group_level === 0) {
	      delete options.group_level;
	    }
	
	    var shouldGroup = options.group || options.group_level;
	
	    var reduceFun = reducer(view.reduceFun);
	
	    var groups = [];
	    var lvl = options.group_level;
	    results.forEach(function (e) {
	      var last = groups[groups.length - 1];
	      var key = shouldGroup ? e.key : null;
	
	      // only set group_level for array keys
	      if (shouldGroup && Array.isArray(key) && typeof lvl === 'number') {
	        key = key.length > lvl ? key.slice(0, lvl) : key;
	      }
	
	      if (last && collate(last.key[0][0], key) === 0) {
	        last.key.push([key, e.id]);
	        last.value.push(e.value);
	        return;
	      }
	      groups.push({key: [
	        [key, e.id]
	      ], value: [e.value]});
	    });
	    for (var i = 0, len = groups.length; i < len; i++) {
	      var e = groups[i];
	      var reduceTry = tryCode(view.sourceDB, reduceFun, [e.key, e.value, false]);
	      // TODO: can't do instanceof BuiltInError because this class is buried
	      // in mapreduce.js
	      if (reduceTry.error && /BuiltInError/.test(reduceTry.error.constructor)) {
	        // CouchDB returns an error if a built-in errors out
	        throw reduceTry.error;
	      }
	      // CouchDB just sets the value to null if a non-built-in errors out
	      e.value = reduceTry.error ? null : reduceTry.output;
	      e.key = e.key[0][0];
	    }
	    // no total_rows/offset when reducing
	    return {rows: sliceResults(groups, options.limit, options.skip)};
	  }
	
	  function queryView(view, opts) {
	    return utils.sequentialize(getQueue(view), function () {
	      return queryViewInQueue(view, opts);
	    })();
	  }
	
	  function queryViewInQueue(view, opts) {
	    var totalRows;
	    var shouldReduce = view.reduceFun && opts.reduce !== false;
	    var skip = opts.skip || 0;
	    if (typeof opts.keys !== 'undefined' && !opts.keys.length) {
	      // equivalent query
	      opts.limit = 0;
	      delete opts.keys;
	    }
	
	    function fetchFromView(viewOpts) {
	      viewOpts.include_docs = true;
	      return view.db.allDocs(viewOpts).then(function (res) {
	        totalRows = res.total_rows;
	        return res.rows.map(function (result) {
	
	          // implicit migration - in older versions of PouchDB,
	          // we explicitly stored the doc as {id: ..., key: ..., value: ...}
	          // this is tested in a migration test
	          /* istanbul ignore next */
	          if ('value' in result.doc && typeof result.doc.value === 'object' &&
	              result.doc.value !== null) {
	            var keys = Object.keys(result.doc.value).sort();
	            // this detection method is not perfect, but it's unlikely the user
	            // emitted a value which was an object with these 3 exact keys
	            var expectedKeys = ['id', 'key', 'value'];
	            if (!(keys < expectedKeys || keys > expectedKeys)) {
	              return result.doc.value;
	            }
	          }
	
	          var parsedKeyAndDocId = pouchCollate.parseIndexableString(result.doc._id);
	          return {
	            key: parsedKeyAndDocId[0],
	            id: parsedKeyAndDocId[1],
	            value: ('value' in result.doc ? result.doc.value : null)
	          };
	        });
	      });
	    }
	
	    function onMapResultsReady(rows) {
	      var finalResults;
	      if (shouldReduce) {
	        finalResults = reduceView(view, rows, opts);
	      } else {
	        finalResults = {
	          total_rows: totalRows,
	          offset: skip,
	          rows: rows
	        };
	      }
	      if (opts.include_docs) {
	        var docIds = utils.uniq(rows.map(rowToDocId));
	
	        return view.sourceDB.allDocs({
	          keys: docIds,
	          include_docs: true,
	          conflicts: opts.conflicts,
	          attachments: opts.attachments,
	          binary: opts.binary
	        }).then(function (allDocsRes) {
	          var docIdsToDocs = {};
	          allDocsRes.rows.forEach(function (row) {
	            if (row.doc) {
	              docIdsToDocs['$' + row.id] = row.doc;
	            }
	          });
	          rows.forEach(function (row) {
	            var docId = rowToDocId(row);
	            var doc = docIdsToDocs['$' + docId];
	            if (doc) {
	              row.doc = doc;
	            }
	          });
	          return finalResults;
	        });
	      } else {
	        return finalResults;
	      }
	    }
	
	    var flatten = function (array) {
	      return array.reduce(function (prev, cur) {
	        return prev.concat(cur);
	      });
	    };
	
	    if (typeof opts.keys !== 'undefined') {
	      var keys = opts.keys;
	      var fetchPromises = keys.map(function (key) {
	        var viewOpts = {
	          startkey : toIndexableString([key]),
	          endkey   : toIndexableString([key, {}])
	        };
	        return fetchFromView(viewOpts);
	      });
	      return Promise.all(fetchPromises).then(flatten).then(onMapResultsReady);
	    } else { // normal query, no 'keys'
	      var viewOpts = {
	        descending : opts.descending
	      };
	      if (typeof opts.startkey !== 'undefined') {
	        viewOpts.startkey = opts.descending ?
	          toIndexableString([opts.startkey, {}]) :
	          toIndexableString([opts.startkey]);
	      }
	      if (typeof opts.endkey !== 'undefined') {
	        var inclusiveEnd = opts.inclusive_end !== false;
	        if (opts.descending) {
	          inclusiveEnd = !inclusiveEnd;
	        }
	
	        viewOpts.endkey = toIndexableString(inclusiveEnd ? [opts.endkey, {}] : [opts.endkey]);
	      }
	      if (typeof opts.key !== 'undefined') {
	        var keyStart = toIndexableString([opts.key]);
	        var keyEnd = toIndexableString([opts.key, {}]);
	        if (viewOpts.descending) {
	          viewOpts.endkey = keyStart;
	          viewOpts.startkey = keyEnd;
	        } else {
	          viewOpts.startkey = keyStart;
	          viewOpts.endkey = keyEnd;
	        }
	      }
	      if (!shouldReduce) {
	        if (typeof opts.limit === 'number') {
	          viewOpts.limit = opts.limit;
	        }
	        viewOpts.skip = skip;
	      }
	      return fetchFromView(viewOpts).then(onMapResultsReady);
	    }
	  }
	
	  function localViewCleanup(db) {
	    return db.get('_local/' + pluginName).then(function (metaDoc) {
	      var docsToViews = {};
	      Object.keys(metaDoc.views).forEach(function (fullViewName) {
	        var parts = parseViewName(fullViewName);
	        var designDocName = '_design/' + parts[0];
	        var viewName = parts[1];
	        docsToViews[designDocName] = docsToViews[designDocName] || {};
	        docsToViews[designDocName][viewName] = true;
	      });
	      var opts = {
	        keys : Object.keys(docsToViews),
	        include_docs : true
	      };
	      return db.allDocs(opts).then(function (res) {
	        var viewsToStatus = {};
	        res.rows.forEach(function (row) {
	          var ddocName = row.key.substring(8);
	          Object.keys(docsToViews[row.key]).forEach(function (viewName) {
	            var fullViewName = ddocName + '/' + viewName;
	            /* istanbul ignore if */
	            if (!metaDoc.views[fullViewName]) {
	              // new format, without slashes, to support PouchDB 2.2.0
	              // migration test in pouchdb's browser.migration.js verifies this
	              fullViewName = viewName;
	            }
	            var viewDBNames = Object.keys(metaDoc.views[fullViewName]);
	            // design doc deleted, or view function nonexistent
	            var statusIsGood = row.doc && row.doc.views && row.doc.views[viewName];
	            viewDBNames.forEach(function (viewDBName) {
	              viewsToStatus[viewDBName] = viewsToStatus[viewDBName] || statusIsGood;
	            });
	          });
	        });
	        var dbsToDelete = Object.keys(viewsToStatus).filter(function (viewDBName) {
	          return !viewsToStatus[viewDBName];
	        });
	        var destroyPromises = dbsToDelete.map(function (viewDBName) {
	          return utils.sequentialize(getQueue(viewDBName), function () {
	            return new db.constructor(viewDBName, db.__opts).destroy();
	          })();
	        });
	        return Promise.all(destroyPromises).then(function () {
	          return {ok: true};
	        });
	      });
	    }, defaultsTo({ok: true}));
	  }
	
	  function queryPromised(db, fun, opts) {
	    if (typeof fun !== 'string') {
	      // temp_view
	      checkQueryParseError(opts, fun);
	
	      var createViewOpts = {
	        db : db,
	        viewName : 'temp_view/temp_view',
	        map : fun.map,
	        reduce : fun.reduce,
	        temporary : true,
	        pluginName: pluginName
	      };
	      tempViewQueue.add(function () {
	        return createView(createViewOpts).then(function (view) {
	          function cleanup() {
	            return view.db.destroy();
	          }
	          return utils.fin(updateView(view).then(function () {
	            return queryView(view, opts);
	          }), cleanup);
	        });
	      });
	      return tempViewQueue.finish();
	    } else {
	      // persistent view
	      var fullViewName = fun;
	      var parts = parseViewName(fullViewName);
	      var designDocName = parts[0];
	      var viewName = parts[1];
	      return db.get('_design/' + designDocName).then(function (doc) {
	        var fun = doc.views && doc.views[viewName];
	
	        if (!fun) {
	          // basic validator; it's assumed that every subclass would want this
	          throw new NotFoundError('ddoc ' + doc._id + ' has no view named ' +
	            viewName);
	        }
	
	        ddocValidator(doc, viewName);
	        checkQueryParseError(opts, fun);
	
	        var createViewOpts = {
	          db : db,
	          viewName : fullViewName,
	          map : fun.map,
	          reduce : fun.reduce,
	          pluginName: pluginName
	        };
	        return createView(createViewOpts).then(function (view) {
	          if (opts.stale === 'ok' || opts.stale === 'update_after') {
	            if (opts.stale === 'update_after') {
	              process.nextTick(function () {
	                updateView(view);
	              });
	            }
	            return queryView(view, opts);
	          } else { // stale not ok
	            return updateView(view).then(function () {
	              return queryView(view, opts);
	            });
	          }
	        });
	      });
	    }
	  }
	
	  var query = function (fun, opts, callback) {
	    var db = this;
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    opts = utils.extend(true, {}, opts);
	
	    if (typeof fun === 'function') {
	      fun = {map : fun};
	    }
	
	    var promise = Promise.resolve().then(function () {
	      return queryPromised(db, fun, opts);
	    });
	    utils.promisedCallback(promise, callback);
	    return promise;
	  };
	
	  var viewCleanup = utils.callbackify(function () {
	    var db = this;
	    return localViewCleanup(db);
	  });
	
	  return {
	    query: query,
	    viewCleanup: viewCleanup
	  };
	}
	
	module.exports = createIndexer;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	/*
	 * Simple task queue to sequentialize actions. Assumes callbacks will eventually fire (once).
	 */
	
	var Promise = __webpack_require__(39).Promise;
	
	function TaskQueue() {
	  this.promise = new Promise(function (fulfill) {fulfill(); });
	}
	TaskQueue.prototype.add = function (promiseFactory) {
	  this.promise = this.promise.catch(function () {
	    // just recover
	  }).then(function () {
	    return promiseFactory();
	  });
	  return this.promise;
	};
	TaskQueue.prototype.finish = function () {
	  return this.promise;
	};
	
	module.exports = TaskQueue;


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	/* istanbul ignore if */
	exports.Promise = __webpack_require__(25);
	
	exports.inherits = __webpack_require__(7);
	exports.extend = __webpack_require__(26);
	var argsarray = __webpack_require__(11);
	
	/* istanbul ignore next */
	exports.promisedCallback = function (promise, callback) {
	  if (callback) {
	    promise.then(function (res) {
	      process.nextTick(function () {
	        callback(null, res);
	      });
	    }, function (reason) {
	      process.nextTick(function () {
	        callback(reason);
	      });
	    });
	  }
	  return promise;
	};
	
	/* istanbul ignore next */
	exports.callbackify = function (fun) {
	  return argsarray(function (args) {
	    var cb = args.pop();
	    var promise = fun.apply(this, args);
	    if (typeof cb === 'function') {
	      exports.promisedCallback(promise, cb);
	    }
	    return promise;
	  });
	};
	
	// Promise finally util similar to Q.finally
	/* istanbul ignore next */
	exports.fin = function (promise, cb) {
	  return promise.then(function (res) {
	    var promise2 = cb();
	    if (typeof promise2.then === 'function') {
	      return promise2.then(function () {
	        return res;
	      });
	    }
	    return res;
	  }, function (reason) {
	    var promise2 = cb();
	    if (typeof promise2.then === 'function') {
	      return promise2.then(function () {
	        throw reason;
	      });
	    }
	    throw reason;
	  });
	};
	
	exports.sequentialize = function (queue, promiseFactory) {
	  return function () {
	    var args = arguments;
	    var that = this;
	    return queue.add(function () {
	      return promiseFactory.apply(that, args);
	    });
	  };
	};
	
	exports.flatten = function (arrs) {
	  var res = [];
	  for (var i = 0, len = arrs.length; i < len; i++) {
	    res = res.concat(arrs[i]);
	  }
	  return res;
	};
	
	// uniq an array of strings, order not guaranteed
	// similar to underscore/lodash _.uniq
	exports.uniq = function (arr) {
	  var map = {};
	
	  for (var i = 0, len = arr.length; i < len; i++) {
	    map['$' + arr[i]] = true;
	  }
	
	  var keys = Object.keys(map);
	  var output = new Array(keys.length);
	
	  for (i = 0, len = keys.length; i < len; i++) {
	    output[i] = keys[i].substring(1);
	  }
	  return output;
	};
	
	var crypto = __webpack_require__(40);
	var Md5 = __webpack_require__(28);
	
	exports.MD5 = function (string) {
	  /* istanbul ignore else */
	  if (!process.browser) {
	    return crypto.createHash('md5').update(string).digest('hex');
	  } else {
	    return Md5.hash(string);
	  }
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 40 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var upsert = __webpack_require__(42);
	var utils = __webpack_require__(39);
	var Promise = utils.Promise;
	
	function stringify(input) {
	  if (!input) {
	    return 'undefined'; // backwards compat for empty reduce
	  }
	  // for backwards compat with mapreduce, functions/strings are stringified
	  // as-is. everything else is JSON-stringified.
	  switch (typeof input) {
	    case 'function':
	      // e.g. a mapreduce map
	      return input.toString();
	    case 'string':
	      // e.g. a mapreduce built-in _reduce function
	      return input.toString();
	    default:
	      // e.g. a JSON object in the case of mango queries
	      return JSON.stringify(input);
	  }
	}
	
	module.exports = function (opts) {
	  var sourceDB = opts.db;
	  var viewName = opts.viewName;
	  var mapFun = opts.map;
	  var reduceFun = opts.reduce;
	  var temporary = opts.temporary;
	  var pluginName = opts.pluginName;
	
	  // the "undefined" part is for backwards compatibility
	  var viewSignature = stringify(mapFun) + stringify(reduceFun) +
	    'undefined';
	
	  if (!temporary && sourceDB._cachedViews) {
	    var cachedView = sourceDB._cachedViews[viewSignature];
	    if (cachedView) {
	      return Promise.resolve(cachedView);
	    }
	  }
	
	  return sourceDB.info().then(function (info) {
	
	    var depDbName = info.db_name + '-mrview-' +
	      (temporary ? 'temp' : utils.MD5(viewSignature));
	
	    // save the view name in the source PouchDB so it can be cleaned up if necessary
	    // (e.g. when the _design doc is deleted, remove all associated view data)
	    function diffFunction(doc) {
	      doc.views = doc.views || {};
	      var fullViewName = viewName;
	      if (fullViewName.indexOf('/') === -1) {
	        fullViewName = viewName + '/' + viewName;
	      }
	      var depDbs = doc.views[fullViewName] = doc.views[fullViewName] || {};
	      /* istanbul ignore if */
	      if (depDbs[depDbName]) {
	        return; // no update necessary
	      }
	      depDbs[depDbName] = true;
	      return doc;
	    }
	    return upsert(sourceDB, '_local/' + pluginName, diffFunction).then(function () {
	      return sourceDB.registerDependentDatabase(depDbName).then(function (res) {
	        var db = res.db;
	        db.auto_compaction = true;
	        var view = {
	          name: depDbName,
	          db: db, 
	          sourceDB: sourceDB,
	          adapter: sourceDB.adapter,
	          mapFun: mapFun,
	          reduceFun: reduceFun
	        };
	        return view.db.get('_local/lastSeq').catch(function (err) {
	          /* istanbul ignore if */
	          if (err.status !== 404) {
	            throw err;
	          }
	        }).then(function (lastSeqDoc) {
	          view.seq = lastSeqDoc ? lastSeqDoc.seq : 0;
	          if (!temporary) {
	            sourceDB._cachedViews = sourceDB._cachedViews || {};
	            sourceDB._cachedViews[viewSignature] = view;
	            view.db.on('destroyed', function () {
	              delete sourceDB._cachedViews[viewSignature];
	            });
	          }
	          return view;
	        });
	      });
	    });
	  });
	};


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var upsert = __webpack_require__(33).upsert;
	
	module.exports = function (db, doc, diffFun) {
	  return upsert.apply(db, [doc, diffFun]);
	};

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(24);
	var clone = utils.clone;
	var getIndexes = __webpack_require__(44);
	var collate = __webpack_require__(17).collate;
	var abstractMapper = __webpack_require__(35);
	var planQuery = __webpack_require__(45);
	var localUtils = __webpack_require__(36);
	var filterInMemoryFields = __webpack_require__(46);
	var massageSelector = localUtils.massageSelector;
	var massageSort = localUtils.massageSort;
	var getValue = localUtils.getValue;
	var validateFindRequest = localUtils.validateFindRequest;
	var validateSort = localUtils.validateSort;
	var reverseOptions = localUtils.reverseOptions;
	var filterInclusiveStart = localUtils.filterInclusiveStart;
	var Promise = utils.Promise;
	
	function indexToSignature(index) {
	  // remove '_design/'
	  return index.ddoc.substring(8) + '/' + index.name;
	}
	
	function doAllDocs(db, originalOpts) {
	  var opts = clone(originalOpts);
	
	  // CouchDB responds in weird ways when you provide a non-string to _id;
	  // we mimic the behavior for consistency. See issue66 tests for details.
	
	  if (opts.descending) {
	    if ('endkey' in opts && typeof opts.endkey !== 'string') {
	      opts.endkey = '';
	    }
	    if ('startkey' in opts && typeof opts.startkey !== 'string') {
	      opts.limit = 0;
	    }
	  } else {
	    if ('startkey' in opts && typeof opts.startkey !== 'string') {
	      opts.startkey = '';
	    }
	    if ('endkey' in opts && typeof opts.endkey !== 'string') {
	      opts.limit = 0;
	    }
	  }
	  if ('key' in opts && typeof opts.key !== 'string') {
	    opts.limit = 0;
	  }
	
	  return db.allDocs(opts);
	}
	
	function find(db, requestDef) {
	
	  if (requestDef.selector) {
	    requestDef.selector = massageSelector(requestDef.selector);
	  }
	  if (requestDef.sort) {
	    requestDef.sort = massageSort(requestDef.sort);
	  }
	
	  validateFindRequest(requestDef);
	
	  return getIndexes(db).then(function (getIndexesRes) {
	
	    var queryPlan = planQuery(requestDef, getIndexesRes.indexes);
	
	    var indexToUse = queryPlan.index;
	
	    validateSort(requestDef, indexToUse);
	
	    var opts = utils.extend(true, {
	      include_docs: true,
	      reduce: false
	    }, queryPlan.queryOpts);
	
	    if ('startkey' in opts && 'endkey' in opts &&
	        collate(opts.startkey, opts.endkey) > 0) {
	      // can't possibly return any results, startkey > endkey
	      return {docs: []};
	    }
	
	    var isDescending = requestDef.sort &&
	      typeof requestDef.sort[0] !== 'string' &&
	      getValue(requestDef.sort[0]) === 'desc';
	
	    if (isDescending) {
	      // either all descending or all ascending
	      opts.descending = true;
	      opts = reverseOptions(opts);
	    }
	
	    if (!queryPlan.inMemoryFields.length) {
	      // no in-memory filtering necessary, so we can let the
	      // database do the limit/skip for us
	      if ('limit' in requestDef) {
	        opts.limit = requestDef.limit;
	      }
	      if ('skip' in requestDef) {
	        opts.skip = requestDef.skip;
	      }
	    }
	
	    return Promise.resolve().then(function () {
	      if (indexToUse.name === '_all_docs') {
	        return doAllDocs(db, opts);
	      } else {
	        var signature = indexToSignature(indexToUse);
	        return abstractMapper.query.call(db, signature, opts);
	      }
	    }).then(function (res) {
	
	      if (opts.inclusive_start === false) {
	        // may have to manually filter the first one,
	        // since couchdb has no true inclusive_start option
	        res.rows = filterInclusiveStart(res.rows, opts.startkey, indexToUse);
	      }
	
	      if (queryPlan.inMemoryFields.length) {
	        // need to filter some stuff in-memory
	        res.rows = filterInMemoryFields(res.rows, requestDef, queryPlan.inMemoryFields);
	      }
	
	      var resp = {
	        docs: res.rows.map(function (row) {
	          var doc = row.doc;
	          if (requestDef.fields) {
	            return utils.pick(doc, requestDef.fields);
	          }
	          return doc;
	        })
	      };
	
	      if (indexToUse.defaultUsed) {
	        resp.warning = 'no matching index found, create an index to optimize query time';
	      }
	
	      return resp;
	    });
	  });
	}
	
	module.exports = find;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(24);
	
	var localUtils = __webpack_require__(36);
	var massageIndexDef = localUtils.massageIndexDef;
	
	function getIndexes(db) {
	  // just search through all the design docs and filter in-memory.
	  // hopefully there aren't that many ddocs.
	  return db.allDocs({
	    startkey: '_design/',
	    endkey: '_design/\uffff',
	    include_docs: true
	  }).then(function (allDocsRes) {
	    var res = {
	      indexes: [{
	        ddoc: null,
	        name: '_all_docs',
	        type: 'special',
	        def: {
	          fields: [{_id: 'asc'}]
	        }
	      }]
	    };
	
	    res.indexes = utils.flatten(res.indexes, allDocsRes.rows.filter(function (row) {
	      return row.doc.language === 'query';
	    }).map(function (row) {
	      var viewNames = row.doc.views !== undefined ? Object.keys(row.doc.views) : [];
	
	      return viewNames.map(function (viewName) {
	        var view = row.doc.views[viewName];
	        return {
	          ddoc: row.id,
	          name: viewName,
	          type: 'json',
	          def: massageIndexDef(view.options.def)
	        };
	      });
	    }));
	
	    // these are sorted by view name for some reason
	    res.indexes.sort(function (left, right) {
	      return utils.compare(left.name, right.name);
	    });
	    res.total_rows = res.indexes.length;
	    return res;
	  });
	}
	
	module.exports = getIndexes;


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(24);
	var log = utils.log;
	var localUtils = __webpack_require__(36);
	var getKey = localUtils.getKey;
	var getValue = localUtils.getValue;
	var getUserFields = localUtils.getUserFields;
	
	// couchdb lowest collation value
	var COLLATE_LO = null;
	
	// couchdb highest collation value (TODO: well not really, but close enough amirite)
	var COLLATE_HI = {"\uffff": {}};
	
	// couchdb second-lowest collation value
	
	function checkFieldInIndex(index, field) {
	  var indexFields = index.def.fields.map(getKey);
	  for (var i = 0, len = indexFields.length; i < len; i++) {
	    var indexField = indexFields[i];
	    if (field === indexField) {
	      return true;
	    }
	  }
	  return false;
	}
	
	// so when you do e.g. $eq/$eq, we can do it entirely in the database.
	// but when you do e.g. $gt/$eq, the first part can be done
	// in the database, but the second part has to be done in-memory,
	// because $gt has forced us to lose precision.
	// so that's what this determines
	function userOperatorLosesPrecision(selector, field) {
	  var matcher = selector[field];
	  var userOperator = getKey(matcher);
	
	  return userOperator !== '$eq';
	}
	
	// sort the user fields by their position in the index,
	// if they're in the index
	function sortFieldsByIndex(userFields, index) {
	  var indexFields = index.def.fields.map(getKey);
	
	  return userFields.slice().sort(function (a, b) {
	    var aIdx = indexFields.indexOf(a);
	    var bIdx = indexFields.indexOf(b);
	    if (aIdx === -1) {
	      aIdx = Number.MAX_VALUE;
	    }
	    if (bIdx === -1) {
	      bIdx = Number.MAX_VALUE;
	    }
	    return utils.compare(aIdx, bIdx);
	  });
	}
	
	// first pass to try to find fields that will need to be sorted in-memory
	function getBasicInMemoryFields(index, selector, userFields) {
	
	  userFields = sortFieldsByIndex(userFields, index);
	
	  // check if any of the user selectors lose precision
	  var needToFilterInMemory = false;
	  for (var i = 0, len = userFields.length; i < len; i++) {
	    var field = userFields[i];
	    if (needToFilterInMemory || !checkFieldInIndex(index, field)) {
	      return userFields.slice(i);
	    }
	    if (i < len - 1 && userOperatorLosesPrecision(selector, field)) {
	      needToFilterInMemory = true;
	    }
	  }
	  return [];
	}
	
	function getInMemoryFieldsFromNe(selector) {
	  var fields = [];
	  Object.keys(selector).forEach(function (field) {
	    var matcher = selector[field];
	    Object.keys(matcher).forEach(function (operator) {
	      if (operator === '$ne') {
	        fields.push(field);
	      }
	    });
	  });
	  return fields;
	}
	
	function getInMemoryFields(coreInMemoryFields, index, selector, userFields) {
	  var result = utils.flatten(
	    // in-memory fields reported as necessary by the query planner
	    coreInMemoryFields,
	    // combine with another pass that checks for any we may have missed
	    getBasicInMemoryFields(index, selector, userFields),
	    // combine with another pass that checks for $ne's
	    getInMemoryFieldsFromNe(selector)
	  );
	
	  return sortFieldsByIndex(utils.uniq(result), index);
	}
	
	// check that at least one field in the user's query is represented
	// in the index. order matters in the case of sorts
	function checkIndexFieldsMatch(indexFields, sortOrder, fields) {
	  if (sortOrder) {
	    // array has to be a strict subarray of index array. furthermore,
	    // the sortOrder fields need to all be represented in the index
	    var sortMatches = utils.oneArrayIsStrictSubArrayOfOther(sortOrder, indexFields);
	    var selectorMatches = utils.oneArrayIsSubArrayOfOther(fields, indexFields);
	
	    return sortMatches && selectorMatches;
	  }
	
	  // all of the user's specified fields still need to be
	  // on the left side of the index array, although the order
	  // doesn't matter
	  return utils.oneSetIsSubArrayOfOther(fields, indexFields);
	}
	
	var logicalMatchers = ['$eq', '$gt', '$gte', '$lt', '$lte'];
	function isNonLogicalMatcher (matcher) {
	  return logicalMatchers.indexOf(matcher) === -1;
	}
	
	// check all the index fields for usages of '$ne'
	// e.g. if the user queries {foo: {$ne: 'foo'}, bar: {$eq: 'bar'}},
	// then we can neither use an index on ['foo'] nor an index on
	// ['foo', 'bar'], but we can use an index on ['bar'] or ['bar', 'foo']
	function checkFieldsLogicallySound(indexFields, selector) {
	  var firstField = indexFields[0];
	  var matcher = selector[firstField];
	
	  var hasLogicalOperator = Object.keys(matcher).some(function (matcherKey) {
	    return !(isNonLogicalMatcher(matcherKey));
	  });
	
	  if (!hasLogicalOperator) {
	    return false;
	  }
	
	  var isInvalidNe = Object.keys(matcher).length === 1 &&
	    getKey(matcher) === '$ne';
	
	  return !isInvalidNe;
	}
	
	function checkIndexMatches(index, sortOrder, fields, selector) {
	
	  var indexFields = index.def.fields.map(getKey);
	
	  var fieldsMatch = checkIndexFieldsMatch(indexFields, sortOrder, fields);
	
	  if (!fieldsMatch) {
	    return false;
	  }
	
	  return checkFieldsLogicallySound(indexFields, selector);
	}
	
	//
	// the algorithm is very simple:
	// take all the fields the user supplies, and if those fields
	// are a strict subset of the fields in some index,
	// then use that index
	//
	//
	function findMatchingIndexes(selector, userFields, sortOrder, indexes) {
	
	  return indexes.reduce(function (res, index) {
	    var indexMatches = checkIndexMatches(index, sortOrder, userFields, selector);
	    if (indexMatches) {
	      res.push(index);
	    }
	    return res;
	  }, []);
	}
	
	// find the best index, i.e. the one that matches the most fields
	// in the user's query
	function findBestMatchingIndex(selector, userFields, sortOrder, indexes) {
	
	  var matchingIndexes = findMatchingIndexes(selector, userFields, sortOrder, indexes);
	
	  if (matchingIndexes.length === 0) {
	    //return `all_docs` as a default index;
	    //I'm assuming that _all_docs is always first
	    var defaultIndex = indexes[0];
	    defaultIndex.defaultUsed = true;
	    return defaultIndex;
	  }
	  if (matchingIndexes.length === 1) {
	    return matchingIndexes[0];
	  }
	
	  var userFieldsMap = utils.arrayToObject(userFields);
	
	  function scoreIndex(index) {
	    var indexFields = index.def.fields.map(getKey);
	    var score = 0;
	    for (var i = 0, len = indexFields.length; i < len; i++) {
	      var indexField = indexFields[i];
	      if (userFieldsMap[indexField]) {
	        score++;
	      }
	    }
	    return score;
	  }
	
	  return utils.max(matchingIndexes, scoreIndex);
	}
	
	function getSingleFieldQueryOptsFor(userOperator, userValue) {
	  switch (userOperator) {
	    case '$eq':
	      return {key: userValue};
	    case '$lte':
	      return {endkey: userValue};
	    case '$gte':
	      return {startkey: userValue};
	    case '$lt':
	      return {
	        endkey: userValue,
	        inclusive_end: false
	      };
	    case '$gt':
	      return {
	        startkey: userValue,
	        inclusive_start: false
	      };
	  }
	}
	
	function getSingleFieldCoreQueryPlan(selector, index) {
	  var field = getKey(index.def.fields[0]);
	  var matcher = selector[field];
	  var inMemoryFields = [];
	
	  var userOperators = Object.keys(matcher);
	
	  var combinedOpts;
	
	  userOperators.forEach(function (userOperator) {
	
	    if (isNonLogicalMatcher(userOperator)) {
	      inMemoryFields.push(field);
	      return;
	    }
	
	    var userValue = matcher[userOperator];
	
	    var newQueryOpts = getSingleFieldQueryOptsFor(userOperator, userValue);
	
	    if (combinedOpts) {
	      combinedOpts = utils.mergeObjects([combinedOpts, newQueryOpts]);
	    } else {
	      combinedOpts = newQueryOpts;
	    }
	  });
	
	  return {
	    queryOpts: combinedOpts,
	    inMemoryFields: inMemoryFields
	  };
	}
	
	function getMultiFieldCoreQueryPlan(userOperator, userValue) {
	  switch (userOperator) {
	    case '$eq':
	      return {
	        startkey: userValue,
	        endkey: userValue
	      };
	    case '$lte':
	      return {
	        endkey: userValue
	      };
	    case '$gte':
	      return {
	        startkey: userValue
	      };
	    case '$lt':
	      return {
	        endkey: userValue,
	        inclusive_end: false
	      };
	    case '$gt':
	      return {
	        startkey: userValue,
	        inclusive_start: false
	      };
	  }
	}
	
	function getMultiFieldQueryOpts(selector, index) {
	
	  var indexFields = index.def.fields.map(getKey);
	
	  var inMemoryFields = [];
	  var startkey = [];
	  var endkey = [];
	  var inclusiveStart;
	  var inclusiveEnd;
	
	
	  function finish(i) {
	
	    if (inclusiveStart !== false) {
	      startkey.push(COLLATE_LO);
	    }
	    if (inclusiveEnd !== false) {
	      endkey.push(COLLATE_HI);
	    }
	    // keep track of the fields where we lost specificity,
	    // and therefore need to filter in-memory
	    inMemoryFields = indexFields.slice(i);
	  }
	
	  for (var i = 0, len = indexFields.length; i < len; i++) {
	    var indexField = indexFields[i];
	
	    var matcher = selector[indexField];
	
	    if (!matcher) { // fewer fields in user query than in index
	      finish(i);
	      break;
	    } else if (i > 0) {
	      if ('$ne' in matcher) { // unusable $ne index
	        finish(i);
	        break;
	      }
	      var usingGtlt = (
	        '$gt' in matcher || '$gte' in matcher ||
	        '$lt' in matcher || '$lte' in matcher);
	      var previousKeys = Object.keys(selector[indexFields[i - 1]]);
	      var previousWasEq = utils.arrayEquals(previousKeys, ['$eq']);
	      var previousWasSame = utils.arrayEquals(previousKeys, Object.keys(matcher));
	      var gtltLostSpecificity = usingGtlt && !previousWasEq && !previousWasSame;
	      if (gtltLostSpecificity) {
	        finish(i);
	        break;
	      }
	    }
	
	    var userOperators = Object.keys(matcher);
	
	    var combinedOpts = null;
	
	    for (var j = 0; j < userOperators.length; j++) {
	      var userOperator = userOperators[j];
	      var userValue = matcher[userOperator];
	
	      var newOpts = getMultiFieldCoreQueryPlan(userOperator, userValue);
	
	      if (combinedOpts) {
	        combinedOpts = utils.mergeObjects([combinedOpts, newOpts]);
	      } else {
	        combinedOpts = newOpts;
	      }
	    }
	
	    startkey.push('startkey' in combinedOpts ? combinedOpts.startkey : COLLATE_LO);
	    endkey.push('endkey' in combinedOpts ? combinedOpts.endkey : COLLATE_HI);
	    if ('inclusive_start' in combinedOpts) {
	      inclusiveStart = combinedOpts.inclusive_start;
	    }
	    if ('inclusive_end' in combinedOpts) {
	      inclusiveEnd = combinedOpts.inclusive_end;
	    }
	  }
	
	  var res = {
	    startkey: startkey,
	    endkey: endkey
	  };
	
	  if (typeof inclusiveStart !== 'undefined') {
	    res.inclusive_start = inclusiveStart;
	  }
	  if (typeof inclusiveEnd !== 'undefined') {
	    res.inclusive_end = inclusiveEnd;
	  }
	
	  return {
	    queryOpts: res,
	    inMemoryFields: inMemoryFields
	  };
	}
	
	function getDefaultQueryPlan () {
	  return {
	    queryOpts: {startkey: null},
	    //getInMemoryFields will do the work here later
	    inMemoryFields: []
	  };
	}
	
	function getCoreQueryPlan(selector, index) {
	  if (index.defaultUsed) {
	    return getDefaultQueryPlan(selector, index);
	  }
	
	  if (index.def.fields.length === 1) {
	    // one field in index, so the value was indexed as a singleton
	    return getSingleFieldCoreQueryPlan(selector, index);
	  }
	  // else index has multiple fields, so the value was indexed as an array
	  return getMultiFieldQueryOpts(selector, index);
	}
	
	function planQuery(request, indexes) {
	
	  log('planning query', request);
	
	  var selector = request.selector;
	  var sort = request.sort;
	
	  var userFieldsRes = getUserFields(selector, sort);
	
	  var userFields = userFieldsRes.fields;
	  var sortOrder = userFieldsRes.sortOrder;
	  var index = findBestMatchingIndex(selector, userFields, sortOrder, indexes);
	
	  var coreQueryPlan = getCoreQueryPlan(selector, index);
	  var queryOpts = coreQueryPlan.queryOpts;
	  var coreInMemoryFields = coreQueryPlan.inMemoryFields;
	
	  var inMemoryFields = getInMemoryFields(coreInMemoryFields, index, selector, userFields);
	
	  var res = {
	    queryOpts: queryOpts,
	    index: index,
	    inMemoryFields: inMemoryFields
	  };
	  log('query plan', res);
	  return res;
	}
	
	module.exports = planQuery;


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	//
	// Do an in-memory filtering of rows that aren't covered by the index.
	// E.g. if the user is asking for foo=1 and bar=2, but the index
	// only covers "foo", then this in-memory filter would take care of
	// "bar".
	//
	
	var isArray = __webpack_require__(47);
	var collate = __webpack_require__(17).collate;
	var localUtils = __webpack_require__(36);
	var isCombinationalField = localUtils.isCombinationalField;
	var getKey = localUtils.getKey;
	var getValue = localUtils.getValue;
	var parseField = localUtils.parseField;
	var utils = __webpack_require__(24);
	var getFieldFromDoc = utils.getFieldFromDoc;
	
	// create a comparator based on the sort object
	function createFieldSorter(sort) {
	
	  function getFieldValuesAsArray(doc) {
	    return sort.map(function (sorting) {
	      var fieldName = getKey(sorting);
	      var parsedField = parseField(fieldName);
	      var docFieldValue = getFieldFromDoc(doc, parsedField);
	      return docFieldValue;
	    });
	  }
	
	  return function (aRow, bRow) {
	    var aFieldValues = getFieldValuesAsArray(aRow.doc);
	    var bFieldValues = getFieldValuesAsArray(bRow.doc);
	    var collation = collate(aFieldValues, bFieldValues);
	    if (collation !== 0) {
	      return collation;
	    }
	    // this is what mango seems to do
	    return utils.compare(aRow.doc._id, bRow.doc._id);
	  };
	}
	
	function filterInMemoryFields (rows, requestDef, inMemoryFields) {
	  rows = rows.filter(function (row) {
	    return rowFilter(row.doc, requestDef.selector, inMemoryFields);
	  });
	
	  if (requestDef.sort) {
	    // in-memory sort
	    var fieldSorter = createFieldSorter(requestDef.sort);
	    rows = rows.sort(fieldSorter);
	    if (typeof requestDef.sort[0] !== 'string' &&
	        getValue(requestDef.sort[0]) === 'desc') {
	      rows = rows.reverse();
	    }
	  }
	
	  if ('limit' in requestDef || 'skip' in requestDef) {
	    // have to do the limit in-memory
	    var skip = requestDef.skip || 0;
	    var limit = ('limit' in requestDef ? requestDef.limit : rows.length) + skip;
	    rows = rows.slice(skip, limit);
	  }
	  return rows;
	}
	
	function rowFilter (doc, selector, inMemoryFields) {
	  return inMemoryFields.every(function (field) {
	    var matcher = selector[field];
	    var parsedField = parseField(field);
	    var docFieldValue = getFieldFromDoc(doc, parsedField);
	    if (isCombinationalField(field)) {
	      return matchCominationalSelector(field, matcher, doc);
	    }
	
	    return matchSelector(matcher, doc, parsedField, docFieldValue);
	  });
	}
	
	function matchSelector (matcher, doc, parsedField, docFieldValue) {
	  if (!matcher) {
	    // no filtering necessary; this field is just needed for sorting
	    return true;
	  }
	
	  return Object.keys(matcher).every(function (userOperator) {
	    var userValue = matcher[userOperator];
	    return match(userOperator, doc, userValue, parsedField, docFieldValue);
	  });
	}
	
	function matchCominationalSelector (field, matcher, doc) {
	
	  if (field === '$or') {
	    return matcher.some(function (orMatchers) {
	      return rowFilter(doc, orMatchers, Object.keys(orMatchers));
	    });
	  }
	
	  if (field === '$not') {
	    return !rowFilter(doc, matcher, Object.keys(matcher));
	  }
	
	  //`$nor`
	  return !matcher.find(function (orMatchers) {
	    return rowFilter(doc, orMatchers, Object.keys(orMatchers));
	  });
	
	}
	
	function match(userOperator, doc, userValue, parsedField, docFieldValue) {
	  if (!matchers[userOperator]) {
	    throw new Error('unknown operator "' + userOperator +
	      '" - should be one of $eq, $lte, $lt, $gt, $gte, $exists, $ne, $in, ' +
	      '$nin, $size, $mod, $regex, $elemMatch, $type or $all');
	  }
	  return matchers[userOperator](doc, userValue, parsedField, docFieldValue);
	}
	
	function fieldExists(docFieldValue) {
	  return typeof docFieldValue !== 'undefined' && docFieldValue !== null;
	}
	
	function fieldIsNotUndefined(docFieldValue) {
	  return typeof docFieldValue !== 'undefined';
	}
	
	function modField (docFieldValue, userValue) {
	  var divisor = userValue[0];
	  var mod = userValue[1];
	  if (divisor === 0) {
	    throw new Error('Bad divisor, cannot divide by zero');
	  }
	
	  if (parseInt(divisor, 10) !== divisor ) {
	    throw new Error('Divisor is not an integer');
	  }
	
	  if (parseInt(mod, 10) !== mod ) {
	    throw new Error('Modulus is not an integer');
	  }
	
	  if (parseInt(docFieldValue, 10) !== docFieldValue) {
	    return false;
	  }
	
	  return docFieldValue % divisor === mod;
	}
	
	function arrayContainsValue (docFieldValue, userValue) {
	  return userValue.some(function (val) {
	    if (docFieldValue instanceof Array) {
	      return docFieldValue.indexOf(val) > -1;
	    }
	
	    return docFieldValue === val;
	  });
	}
	
	function arrayContainsAllValues (docFieldValue, userValue) {
	  return userValue.every(function (val) {
	    return docFieldValue.indexOf(val) > -1;
	  });
	}
	
	function arraySize (docFieldValue, userValue) {
	  return docFieldValue.length === userValue;
	}
	
	function regexMatch(docFieldValue, userValue) {
	  var re = new RegExp(userValue);
	
	  return re.test(docFieldValue);
	}
	
	function typeMatch(docFieldValue, userValue) {
	
	  switch (userValue) {
	    case 'null':
	      return docFieldValue === null;
	    case 'boolean':
	      return typeof(docFieldValue) === 'boolean';
	    case 'number':
	      return typeof(docFieldValue) === 'number';
	    case 'string':
	      return typeof(docFieldValue) === 'string';
	    case 'array':
	      return docFieldValue instanceof Array;
	    case 'object':
	      return ({}).toString.call(docFieldValue) === '[object Object]';
	  }
	
	  throw new Error(userValue + ' not supported as a type.' +
	                  'Please use one of object, string, array, number, boolean or null.');
	
	}
	
	var matchers = {
	
	  '$elemMatch': function (doc, userValue, parsedField, docFieldValue) {
	    if (!isArray(docFieldValue)) {
	      return false;
	    }
	
	    if (docFieldValue.length === 0) {
	      return false;
	    }
	
	    if (typeof docFieldValue[0] === 'object') {
	      return docFieldValue.some(function (val) {
	        return rowFilter(val, userValue, Object.keys(userValue));
	      });
	    }
	
	    return docFieldValue.some(function (val) {
	      return matchSelector(userValue, doc, parsedField, val);
	    });
	  },
	
	  '$eq': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldIsNotUndefined(docFieldValue) && collate(docFieldValue, userValue) === 0;
	  },
	
	  '$gte': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldIsNotUndefined(docFieldValue) && collate(docFieldValue, userValue) >= 0;
	  },
	
	  '$gt': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldIsNotUndefined(docFieldValue) && collate(docFieldValue, userValue) > 0;
	  },
	
	  '$lte': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldIsNotUndefined(docFieldValue) && collate(docFieldValue, userValue) <= 0;
	  },
	
	  '$lt': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldIsNotUndefined(docFieldValue) && collate(docFieldValue, userValue) < 0;
	  },
	
	  '$exists': function (doc, userValue, parsedField, docFieldValue) {
	    //a field that is null is still considered to exist
	    if (userValue) {
	      return fieldIsNotUndefined(docFieldValue);
	    }
	
	    return !fieldIsNotUndefined(docFieldValue);
	  },
	
	  '$mod': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldExists(docFieldValue) && modField(docFieldValue, userValue);
	  },
	
	  '$ne': function (doc, userValue, parsedField, docFieldValue) {
	    return userValue.every(function (neValue) {
	      return collate(docFieldValue, neValue) !== 0;
	    });
	  },
	  '$in': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldExists(docFieldValue) && arrayContainsValue(docFieldValue, userValue);
	  },
	
	  '$nin': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldExists(docFieldValue) && !arrayContainsValue(docFieldValue, userValue);
	  },
	
	  '$size': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldExists(docFieldValue) && arraySize(docFieldValue, userValue);
	  },
	
	  '$all': function (doc, userValue, parsedField, docFieldValue) {
	    return isArray(docFieldValue) && arrayContainsAllValues(docFieldValue, userValue);
	  },
	
	  '$regex': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldExists(docFieldValue) && regexMatch(docFieldValue, userValue);
	  },
	
	  '$type': function (doc, userValue, parsedField, docFieldValue) {
	    return typeMatch(docFieldValue, userValue);
	  }
	};
	
	module.exports = filterInMemoryFields;


/***/ },
/* 47 */
/***/ function(module, exports) {

	
	/**
	 * isArray
	 */
	
	var isArray = Array.isArray;
	
	/**
	 * toString
	 */
	
	var str = Object.prototype.toString;
	
	/**
	 * Whether or not the given `val`
	 * is an array.
	 *
	 * example:
	 *
	 *        isArray([]);
	 *        // > true
	 *        isArray(arguments);
	 *        // > false
	 *        isArray('');
	 *        // > false
	 *
	 * @param {mixed} val
	 * @return {bool}
	 */
	
	module.exports = isArray || function (val) {
	  return !! val && '[object Array]' == str.call(val);
	};


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var abstractMapper = __webpack_require__(35);
	var upsert = __webpack_require__(42);
	
	function deleteIndex(db, index) {
	
	  if (!index.ddoc) {
	    throw new Error('you must supply an index.ddoc when deleting');
	  }
	
	  if (!index.name) {
	    throw new Error('you must supply an index.name when deleting');
	  }
	
	  var docId = index.ddoc;
	  var viewName = index.name;
	
	  function deltaFun (doc) {
	    if (Object.keys(doc.views).length === 1 && doc.views[viewName]) {
	      // only one view in this ddoc, delete the whole ddoc
	      return {_id: docId, _deleted: true};
	    }
	    // more than one view here, just remove the view
	    delete doc.views[viewName];
	    return doc;
	  }
	
	  return upsert(db, docId, deltaFun).then(function () {
	    return abstractMapper.viewCleanup.apply(db);
	  }).then(function () {
	    return {ok: true};
	  });
	}
	
	module.exports = deleteIndex;

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	module.exports={render:function(){with(this) {
	  return _h('form', {
	    staticClass: "ui form",
	    on: {
	      "submit": function($event) {
	        $event.preventDefault();
	        onSubmit($event)
	      }
	    }
	  }, [_h('div', {
	    staticClass: "ui segments"
	  }, [_h('div', {
	    staticClass: "ui tertiary red segment"
	  }, [_h('h1', {
	    staticClass: "ui header"
	  }, ["Character Creation " + _s(character.name)])]), " ", _h('div', {
	    staticClass: "ui tertiary red segment"
	  }, [_h('div', {
	    staticClass: "two fields"
	  }, [_h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.name),
	      expression: "character.name"
	    }],
	    attrs: {
	      "label": "Full Name"
	    },
	    domProps: {
	      "value": (character.name)
	    },
	    on: {
	      "input": function($event) {
	        character.name = $event
	      }
	    }
	  }), " ", _h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.playername),
	      expression: "character.playername"
	    }],
	    attrs: {
	      "label": "Player"
	    },
	    domProps: {
	      "value": (character.playername)
	    },
	    on: {
	      "input": function($event) {
	        character.playername = $event
	      }
	    }
	  })])]), " ", _h('div', {
	    staticClass: "ui horizontal segments"
	  }, [_h('div', {
	    staticClass: "ui tertiary red segment"
	  }, [_h('field-select', {
	    directives: [{
	      name: "model",
	      value: (character.sex),
	      expression: "character.sex"
	    }],
	    attrs: {
	      "label": "Sex",
	      "options": ['Male', 'Female']
	    },
	    domProps: {
	      "value": (character.sex)
	    },
	    on: {
	      "input": function($event) {
	        character.sex = $event
	      }
	    }
	  }), " ", _h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.age),
	      expression: "character.age"
	    }],
	    attrs: {
	      "label": "Age"
	    },
	    domProps: {
	      "value": (character.age)
	    },
	    on: {
	      "input": function($event) {
	        character.age = $event
	      }
	    }
	  }), " ", _h('field-select', {
	    directives: [{
	      name: "model",
	      value: (character.race),
	      expression: "character.race"
	    }],
	    attrs: {
	      "label": "Race",
	      "options": raceOptions
	    },
	    domProps: {
	      "value": (character.race)
	    },
	    on: {
	      "input": function($event) {
	        character.race = $event
	      }
	    }
	  }), " ", _h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.subrace),
	      expression: "character.subrace"
	    }],
	    attrs: {
	      "label": "Subrace"
	    },
	    domProps: {
	      "value": (character.subrace)
	    },
	    on: {
	      "input": function($event) {
	        character.subrace = $event
	      }
	    }
	  })]), " ", _h('div', {
	    staticClass: "ui tertiary red segment"
	  }, [_h('field-select', {
	    directives: [{
	      name: "model",
	      value: (character.class),
	      expression: "character.class"
	    }],
	    attrs: {
	      "label": "Class",
	      "options": classOptions
	    },
	    domProps: {
	      "value": (character.class)
	    },
	    on: {
	      "input": function($event) {
	        character.class = $event
	      }
	    }
	  }), " ", _h('field-select', {
	    directives: [{
	      name: "model",
	      value: (character.alignment),
	      expression: "character.alignment"
	    }],
	    attrs: {
	      "label": "Alignment",
	      "options": alignmentOptions
	    },
	    domProps: {
	      "value": (character.alignment)
	    },
	    on: {
	      "input": function($event) {
	        character.alignment = $event
	      }
	    }
	  }), " ", _h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.background),
	      expression: "character.background"
	    }],
	    attrs: {
	      "label": "Background"
	    },
	    domProps: {
	      "value": (character.background)
	    },
	    on: {
	      "input": function($event) {
	        character.background = $event
	      }
	    }
	  }), " ", _h('div', {
	    staticClass: "two fields"
	  }, [_h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.level),
	      expression: "character.level"
	    }],
	    attrs: {
	      "label": "Level"
	    },
	    domProps: {
	      "value": (character.level)
	    },
	    on: {
	      "input": function($event) {
	        character.level = $event
	      }
	    }
	  }), " ", _h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.xp),
	      expression: "character.xp"
	    }],
	    attrs: {
	      "label": "Experience Points"
	    },
	    domProps: {
	      "value": (character.xp)
	    },
	    on: {
	      "input": function($event) {
	        character.xp = $event
	      }
	    }
	  })])])]), " ", " ", _h('div', {
	    staticClass: "ui tertiary red segment"
	  }, [_h('div', {
	    staticClass: "six fields"
	  }, [_h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.ac),
	      expression: "character.ac"
	    }],
	    attrs: {
	      "label": "Armor Class (AC)"
	    },
	    domProps: {
	      "value": (character.ac)
	    },
	    on: {
	      "input": function($event) {
	        character.ac = $event
	      }
	    }
	  }), " ", _h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.initiative),
	      expression: "character.initiative"
	    }],
	    attrs: {
	      "label": "Initiative",
	      "placeholder": "(Dexterity Mod)"
	    },
	    domProps: {
	      "value": (character.initiative)
	    },
	    on: {
	      "input": function($event) {
	        character.initiative = $event
	      }
	    }
	  }), " ", _h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencyBonus),
	      expression: "character.proficiencyBonus"
	    }],
	    attrs: {
	      "label": "Proficiency Bonus"
	    },
	    domProps: {
	      "value": (character.proficiencyBonus)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencyBonus = $event
	      }
	    }
	  }), " ", _h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.passivePerception),
	      expression: "character.passivePerception"
	    }],
	    attrs: {
	      "label": "Passive Perception",
	      "placeholder": "(10+Perception Mod)"
	    },
	    domProps: {
	      "value": (character.passivePerception)
	    },
	    on: {
	      "input": function($event) {
	        character.passivePerception = $event
	      }
	    }
	  }), " ", _h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.speed),
	      expression: "character.speed"
	    }],
	    attrs: {
	      "label": "Speed",
	      "placeholder": "30ft"
	    },
	    domProps: {
	      "value": (character.speed)
	    },
	    on: {
	      "input": function($event) {
	        character.speed = $event
	      }
	    }
	  }), " ", _h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.hitDice),
	      expression: "character.hitDice"
	    }],
	    attrs: {
	      "label": "Hit Dice",
	      "placeholder": "3d8+2"
	    },
	    domProps: {
	      "value": (character.hitDice)
	    },
	    on: {
	      "input": function($event) {
	        character.hitDice = $event
	      }
	    }
	  })])]), " ", " ", _h('div', {
	    staticClass: "ui tertiary red segment"
	  }, [_h('div', {
	    staticClass: "six fields"
	  }, [_h('div', {
	    staticClass: "ui massive input stat"
	  }, [_h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.str),
	      expression: "character.str"
	    }],
	    attrs: {
	      "label": "Strength",
	      "placeholder": "Str"
	    },
	    domProps: {
	      "value": (character.str)
	    },
	    on: {
	      "input": function($event) {
	        character.str = $event
	      }
	    }
	  }), " ", _h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.dex),
	      expression: "character.dex"
	    }],
	    attrs: {
	      "label": "Dexterity",
	      "placeholder": "Dex"
	    },
	    domProps: {
	      "value": (character.dex)
	    },
	    on: {
	      "input": function($event) {
	        character.dex = $event
	      }
	    }
	  }), " ", _h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.con),
	      expression: "character.con"
	    }],
	    attrs: {
	      "label": "Constitution",
	      "placeholder": "Con"
	    },
	    domProps: {
	      "value": (character.con)
	    },
	    on: {
	      "input": function($event) {
	        character.con = $event
	      }
	    }
	  }), " ", _h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.int),
	      expression: "character.int"
	    }],
	    attrs: {
	      "label": "Intelligence",
	      "placeholder": "Int"
	    },
	    domProps: {
	      "value": (character.int)
	    },
	    on: {
	      "input": function($event) {
	        character.int = $event
	      }
	    }
	  }), " ", _h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.wis),
	      expression: "character.wis"
	    }],
	    attrs: {
	      "label": "Wisdom",
	      "placeholder": "Wis"
	    },
	    domProps: {
	      "value": (character.wis)
	    },
	    on: {
	      "input": function($event) {
	        character.wis = $event
	      }
	    }
	  }), " ", _h('field-text-input', {
	    directives: [{
	      name: "model",
	      value: (character.cha),
	      expression: "character.cha"
	    }],
	    attrs: {
	      "label": "Charisma",
	      "placeholder": "Cha"
	    },
	    domProps: {
	      "value": (character.cha)
	    },
	    on: {
	      "input": function($event) {
	        character.cha = $event
	      }
	    }
	  })])])]), " ", _h('div', {
	    staticClass: "ui tertiary red segment"
	  }, [_h('div', {
	    staticClass: "six fields"
	  }, [_h('div', {
	    staticClass: "field profs"
	  }, [_h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.strSavingThrow),
	      expression: "character.proficiencies.strSavingThrow"
	    }],
	    attrs: {
	      "label": "Saving Throw"
	    },
	    domProps: {
	      "value": (character.proficiencies.strSavingThrow)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.strSavingThrow = $event
	      }
	    }
	  }), _m(0), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.athletics),
	      expression: "character.proficiencies.athletics"
	    }],
	    attrs: {
	      "label": "Athletics"
	    },
	    domProps: {
	      "value": (character.proficiencies.athletics)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.athletics = $event
	      }
	    }
	  }), _m(1)]), " ", " ", _h('div', {
	    staticClass: "field profs"
	  }, [_h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.dexSavingThrow),
	      expression: "character.proficiencies.dexSavingThrow"
	    }],
	    attrs: {
	      "label": "Saving Throw"
	    },
	    domProps: {
	      "value": (character.proficiencies.dexSavingThrow)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.dexSavingThrow = $event
	      }
	    }
	  }), _m(2), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.acrobatics),
	      expression: "character.proficiencies.acrobatics"
	    }],
	    attrs: {
	      "label": "Acrobatics"
	    },
	    domProps: {
	      "value": (character.proficiencies.acrobatics)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.acrobatics = $event
	      }
	    }
	  }), _m(3), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.sleightOfHand),
	      expression: "character.proficiencies.sleightOfHand"
	    }],
	    attrs: {
	      "label": "Sleight of Hand"
	    },
	    domProps: {
	      "value": (character.proficiencies.sleightOfHand)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.sleightOfHand = $event
	      }
	    }
	  }), _m(4), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.stealth),
	      expression: "character.proficiencies.stealth"
	    }],
	    attrs: {
	      "label": "Stealth"
	    },
	    domProps: {
	      "value": (character.proficiencies.stealth)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.stealth = $event
	      }
	    }
	  }), _m(5)]), " ", " ", _h('div', {
	    staticClass: "field profs"
	  }, [_h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.conSavingThrow),
	      expression: "character.proficiencies.conSavingThrow"
	    }],
	    attrs: {
	      "label": "Saving Throw"
	    },
	    domProps: {
	      "value": (character.proficiencies.conSavingThrow)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.conSavingThrow = $event
	      }
	    }
	  }), _m(6)]), " ", " ", _h('div', {
	    staticClass: "field profs"
	  }, [_h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.intSavingThrow),
	      expression: "character.proficiencies.intSavingThrow"
	    }],
	    attrs: {
	      "label": "Saving Throw"
	    },
	    domProps: {
	      "value": (character.proficiencies.intSavingThrow)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.intSavingThrow = $event
	      }
	    }
	  }), _m(7), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.arcana),
	      expression: "character.proficiencies.arcana"
	    }],
	    attrs: {
	      "label": "Arcana"
	    },
	    domProps: {
	      "value": (character.proficiencies.arcana)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.arcana = $event
	      }
	    }
	  }), _m(8), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.history),
	      expression: "character.proficiencies.history"
	    }],
	    attrs: {
	      "label": "History"
	    },
	    domProps: {
	      "value": (character.proficiencies.history)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.history = $event
	      }
	    }
	  }), _m(9), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.investigation),
	      expression: "character.proficiencies.investigation"
	    }],
	    attrs: {
	      "label": "Investigation"
	    },
	    domProps: {
	      "value": (character.proficiencies.investigation)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.investigation = $event
	      }
	    }
	  }), _m(10), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.nature),
	      expression: "character.proficiencies.nature"
	    }],
	    attrs: {
	      "label": "Nature"
	    },
	    domProps: {
	      "value": (character.proficiencies.nature)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.nature = $event
	      }
	    }
	  }), _m(11), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.religion),
	      expression: "character.proficiencies.religion"
	    }],
	    attrs: {
	      "label": "Religion"
	    },
	    domProps: {
	      "value": (character.proficiencies.religion)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.religion = $event
	      }
	    }
	  }), _m(12)]), " ", " ", _h('div', {
	    staticClass: "field profs"
	  }, [_h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.wisSavingThrow),
	      expression: "character.proficiencies.wisSavingThrow"
	    }],
	    attrs: {
	      "label": "Saving Throw"
	    },
	    domProps: {
	      "value": (character.proficiencies.wisSavingThrow)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.wisSavingThrow = $event
	      }
	    }
	  }), _m(13), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.animalHandling),
	      expression: "character.proficiencies.animalHandling"
	    }],
	    attrs: {
	      "label": "Animal Handling"
	    },
	    domProps: {
	      "value": (character.proficiencies.animalHandling)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.animalHandling = $event
	      }
	    }
	  }), _m(14), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.insight),
	      expression: "character.proficiencies.insight"
	    }],
	    attrs: {
	      "label": "Insight"
	    },
	    domProps: {
	      "value": (character.proficiencies.insight)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.insight = $event
	      }
	    }
	  }), _m(15), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.medicine),
	      expression: "character.proficiencies.medicine"
	    }],
	    attrs: {
	      "label": "Medicine"
	    },
	    domProps: {
	      "value": (character.proficiencies.medicine)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.medicine = $event
	      }
	    }
	  }), _m(16), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.perception),
	      expression: "character.proficiencies.perception"
	    }],
	    attrs: {
	      "label": "Perception"
	    },
	    domProps: {
	      "value": (character.proficiencies.perception)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.perception = $event
	      }
	    }
	  }), _m(17), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.survival),
	      expression: "character.proficiencies.survival"
	    }],
	    attrs: {
	      "label": "Survivial"
	    },
	    domProps: {
	      "value": (character.proficiencies.survival)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.survival = $event
	      }
	    }
	  }), _m(18)]), " ", " ", _h('div', {
	    staticClass: "field profs"
	  }, [_h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.chaSavingThrow),
	      expression: "character.proficiencies.chaSavingThrow"
	    }],
	    attrs: {
	      "label": "Saving Throw"
	    },
	    domProps: {
	      "value": (character.proficiencies.chaSavingThrow)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.chaSavingThrow = $event
	      }
	    }
	  }), _m(19), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.deception),
	      expression: "character.proficiencies.deception"
	    }],
	    attrs: {
	      "label": "Deception"
	    },
	    domProps: {
	      "value": (character.proficiencies.deception)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.deception = $event
	      }
	    }
	  }), _m(20), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.intimidation),
	      expression: "character.proficiencies.intimidation"
	    }],
	    attrs: {
	      "label": "Intimidation"
	    },
	    domProps: {
	      "value": (character.proficiencies.intimidation)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.intimidation = $event
	      }
	    }
	  }), _m(21), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.performance),
	      expression: "character.proficiencies.performance"
	    }],
	    attrs: {
	      "label": "Performance"
	    },
	    domProps: {
	      "value": (character.proficiencies.performance)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.performance = $event
	      }
	    }
	  }), _m(22), " ", _h('field-checkbox', {
	    directives: [{
	      name: "model",
	      value: (character.proficiencies.persuasion),
	      expression: "character.proficiencies.persuasion"
	    }],
	    attrs: {
	      "label": "Persuasion"
	    },
	    domProps: {
	      "value": (character.proficiencies.persuasion)
	    },
	    on: {
	      "input": function($event) {
	        character.proficiencies.persuasion = $event
	      }
	    }
	  }), _m(23)])])]), " ", _m(24)])])
	}},staticRenderFns: [function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('br')
	}},function(){with(this) {
	  return _h('div', {
	    staticClass: "ui tertiary red segment"
	  }, [_h('button', {
	    staticClass: "ui large violet button",
	    attrs: {
	      "type": "submit"
	    }
	  }, ["Submit"])])
	}}]}
	if (false) {
	  module.hot.accept()
	  if (module.hot.data) {
	     require("vue-hot-reload-api").rerender("data-v-4", module.exports)
	  }
	}

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_exports__, __vue_options__
	
	/* script */
	__vue_exports__ = __webpack_require__(51)
	
	/* template */
	var __vue_template__ = __webpack_require__(52)
	__vue_options__ = __vue_exports__ = __vue_exports__ || {}
	if (typeof __vue_exports__.default === "object") {
	if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
	__vue_options__ = __vue_exports__ = __vue_exports__.default
	}
	if (typeof __vue_options__ === "function") {
	  __vue_options__ = __vue_options__.options
	}
	__vue_options__.render = __vue_template__.render
	__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
	
	/* hot reload */
	if (false) {(function () {
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  module.hot.accept()
	  if (!module.hot.data) {
	    hotAPI.createRecord("data-v-1", __vue_options__)
	  } else {
	    hotAPI.reload("data-v-1", __vue_options__)
	  }
	})()}
	if (__vue_options__.functional) {console.error("[vue-loader] CharacterList.vue: functional components are not supported and should be defined in plain js files using render functions.")}
	
	module.exports = __vue_exports__


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _pouchdb = __webpack_require__(1);
	
	var _pouchdb2 = _interopRequireDefault(_pouchdb);
	
	var _CharacterService = __webpack_require__(22);
	
	var _CharacterService2 = _interopRequireDefault(_CharacterService);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		data: function data() {
			return {
				characters: null
			};
		},
		mounted: function mounted() {
			self = this;
			_CharacterService2.default.getCharacters().then(function (result) {
				self.characters = result;
			});
		}
	};

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	module.exports={render:function(){with(this) {
	  return _h('table', {
	    staticClass: "ui striped table"
	  }, [_m(0), " ", _h('tbody', [(characters) && _l((characters), function(character) {
	    return _h('tr', [_h('td', [_s(character.name)]), " ", _h('td', [_s(character.race) + " " + _s(character.class) + " (" + _s(character.level) + ")"]), " ", _h('td', [_s(character.playername)])])
	  })])])
	}},staticRenderFns: [function(){with(this) {
	  return _h('thead', [_h('th', ["Name"]), " ", _h('th', ["Description"]), " ", _h('th', ["Player"])])
	}}]}
	if (false) {
	  module.hot.accept()
	  if (module.hot.data) {
	     require("vue-hot-reload-api").rerender("data-v-1", module.exports)
	  }
	}

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_exports__, __vue_options__
	
	/* script */
	__vue_exports__ = __webpack_require__(54)
	
	/* template */
	var __vue_template__ = __webpack_require__(55)
	__vue_options__ = __vue_exports__ = __vue_exports__ || {}
	if (typeof __vue_exports__.default === "object") {
	if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
	__vue_options__ = __vue_exports__ = __vue_exports__.default
	}
	if (typeof __vue_options__ === "function") {
	  __vue_options__ = __vue_options__.options
	}
	__vue_options__.render = __vue_template__.render
	__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
	
	/* hot reload */
	if (false) {(function () {
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  module.hot.accept()
	  if (!module.hot.data) {
	    hotAPI.createRecord("data-v-3", __vue_options__)
	  } else {
	    hotAPI.reload("data-v-3", __vue_options__)
	  }
	})()}
	if (__vue_options__.functional) {console.error("[vue-loader] EncounterCreate.vue: functional components are not supported and should be defined in plain js files using render functions.")}
	
	module.exports = __vue_exports__


/***/ },
/* 54 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = {
		data: function data() {
			return {
				test: null
			};
		}
	};

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	module.exports={render:function(){with(this) {
	  return _m(0)
	}},staticRenderFns: [function(){with(this) {
	  return _h('div', {
	    staticClass: "ui segments"
	  }, [_h('div', {
	    staticClass: "ui tertiary red segment"
	  }, [_h('h1', {
	    staticClass: "ui header"
	  }, ["Encounter Creation"])])])
	}}]}
	if (false) {
	  module.hot.accept()
	  if (module.hot.data) {
	     require("vue-hot-reload-api").rerender("data-v-3", module.exports)
	  }
	}

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_exports__, __vue_options__
	
	/* script */
	__vue_exports__ = __webpack_require__(57)
	
	/* template */
	var __vue_template__ = __webpack_require__(58)
	__vue_options__ = __vue_exports__ = __vue_exports__ || {}
	if (typeof __vue_exports__.default === "object") {
	if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
	__vue_options__ = __vue_exports__ = __vue_exports__.default
	}
	if (typeof __vue_options__ === "function") {
	  __vue_options__ = __vue_options__.options
	}
	__vue_options__.render = __vue_template__.render
	__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
	
	/* hot reload */
	if (false) {(function () {
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  module.hot.accept()
	  if (!module.hot.data) {
	    hotAPI.createRecord("data-v-2", __vue_options__)
	  } else {
	    hotAPI.reload("data-v-2", __vue_options__)
	  }
	})()}
	if (__vue_options__.functional) {console.error("[vue-loader] field-text-input.vue: functional components are not supported and should be defined in plain js files using render functions.")}
	
	module.exports = __vue_exports__


/***/ },
/* 57 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  props: [
	  // required for v-model component
	  'label', 'value', 'placeholder'],
	  computed: {
	    compPlaceholder: function compPlaceholder() {
	      return this.placeholder ? this.placeholder : this.label;
	    }
	  },
	  methods: {
	    onInput: function onInput(event) {
	      this.$emit('input', event.target.value);
	    }
	  }
	};

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	module.exports={render:function(){with(this) {
	  return _h('div', {
	    staticClass: "field"
	  }, [_h('label', [_s(label)]), " ", _h('input', {
	    attrs: {
	      "type": "text",
	      "placeholder": compPlaceholder
	    },
	    domProps: {
	      "value": value
	    },
	    on: {
	      "input": onInput
	    }
	  })])
	}},staticRenderFns: []}
	if (false) {
	  module.hot.accept()
	  if (module.hot.data) {
	     require("vue-hot-reload-api").rerender("data-v-2", module.exports)
	  }
	}

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_exports__, __vue_options__
	
	/* script */
	__vue_exports__ = __webpack_require__(60)
	
	/* template */
	var __vue_template__ = __webpack_require__(61)
	__vue_options__ = __vue_exports__ = __vue_exports__ || {}
	if (typeof __vue_exports__.default === "object") {
	if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
	__vue_options__ = __vue_exports__ = __vue_exports__.default
	}
	if (typeof __vue_options__ === "function") {
	  __vue_options__ = __vue_options__.options
	}
	__vue_options__.render = __vue_template__.render
	__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
	
	/* hot reload */
	if (false) {(function () {
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  module.hot.accept()
	  if (!module.hot.data) {
	    hotAPI.createRecord("data-v-5", __vue_options__)
	  } else {
	    hotAPI.reload("data-v-5", __vue_options__)
	  }
	})()}
	if (__vue_options__.functional) {console.error("[vue-loader] field-select.vue: functional components are not supported and should be defined in plain js files using render functions.")}
	
	module.exports = __vue_exports__


/***/ },
/* 60 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  props: [
	  // required for v-model component
	  'label', 'value',
	
	  // can accept array of strings or array of objects matching
	  // [{ value: "1", text: "One" }, ... ]
	  'options'],
	  computed: {
	    optionsList: function optionsList() {
	      if (typeof this.options[0] == 'string') {
	        return this.options.map(function (option) {
	          return { value: option, text: option };
	        }, []);
	      }
	      return this.options;
	    }
	  },
	  methods: {
	    onChange: function onChange(event) {
	      this.$emit('input', event.target.value);
	    }
	  }
	};

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	module.exports={render:function(){with(this) {
	  return _h('div', {
	    staticClass: "field"
	  }, [_h('label', [_s(label)]), " ", _h('select', {
	    staticClass: "ui dropdown",
	    domProps: {
	      "value": value
	    },
	    on: {
	      "change": onChange
	    }
	  }, [(optionsList) && _l((optionsList), function(option) {
	    return _h('option', {
	      domProps: {
	        "value": option.value
	      }
	    }, [_s(option.text)])
	  })])])
	}},staticRenderFns: []}
	if (false) {
	  module.hot.accept()
	  if (module.hot.data) {
	     require("vue-hot-reload-api").rerender("data-v-5", module.exports)
	  }
	}

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_exports__, __vue_options__
	
	/* script */
	__vue_exports__ = __webpack_require__(63)
	
	/* template */
	var __vue_template__ = __webpack_require__(64)
	__vue_options__ = __vue_exports__ = __vue_exports__ || {}
	if (typeof __vue_exports__.default === "object") {
	if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
	__vue_options__ = __vue_exports__ = __vue_exports__.default
	}
	if (typeof __vue_options__ === "function") {
	  __vue_options__ = __vue_options__.options
	}
	__vue_options__.render = __vue_template__.render
	__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
	
	/* hot reload */
	if (false) {(function () {
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  module.hot.accept()
	  if (!module.hot.data) {
	    hotAPI.createRecord("data-v-6", __vue_options__)
	  } else {
	    hotAPI.reload("data-v-6", __vue_options__)
	  }
	})()}
	if (__vue_options__.functional) {console.error("[vue-loader] field-checkbox-toggle.vue: functional components are not supported and should be defined in plain js files using render functions.")}
	
	module.exports = __vue_exports__


/***/ },
/* 63 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  props: [
	  // required for v-model component
	  'label', 'value'],
	  computed: {
	    compPlaceholder: function compPlaceholder() {
	      return this.placeholder ? this.placeholder : this.label;
	    }
	  },
	  methods: {
	    onChange: function onChange(event) {
	      this.$emit('input', event.target.value);
	    }
	  }
	};

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	module.exports={render:function(){with(this) {
	  return _h('div', {
	    staticClass: "ui toggle checkbox"
	  }, [_h('input', {
	    attrs: {
	      "type": "checkbox"
	    },
	    domProps: {
	      "value": value
	    },
	    on: {
	      "change": onChange
	    }
	  }), " ", _h('label', [_s(label)])])
	}},staticRenderFns: []}
	if (false) {
	  module.hot.accept()
	  if (module.hot.data) {
	     require("vue-hot-reload-api").rerender("data-v-6", module.exports)
	  }
	}

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_exports__, __vue_options__
	
	/* script */
	__vue_exports__ = __webpack_require__(66)
	
	/* template */
	var __vue_template__ = __webpack_require__(67)
	__vue_options__ = __vue_exports__ = __vue_exports__ || {}
	if (typeof __vue_exports__.default === "object") {
	if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
	__vue_options__ = __vue_exports__ = __vue_exports__.default
	}
	if (typeof __vue_options__ === "function") {
	  __vue_options__ = __vue_options__.options
	}
	__vue_options__.render = __vue_template__.render
	__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
	
	/* hot reload */
	if (false) {(function () {
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  module.hot.accept()
	  if (!module.hot.data) {
	    hotAPI.createRecord("data-v-7", __vue_options__)
	  } else {
	    hotAPI.reload("data-v-7", __vue_options__)
	  }
	})()}
	if (__vue_options__.functional) {console.error("[vue-loader] field-checkbox-slider.vue: functional components are not supported and should be defined in plain js files using render functions.")}
	
	module.exports = __vue_exports__


/***/ },
/* 66 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  data: function data() {
	    return {
	      state: null
	    };
	  },
	
	  props: [
	  // required for v-model component
	  'label', 'value', 'trueValue', 'falseValue'],
	  computed: {
	    compTrue: function compTrue() {
	      return this.trueValue ? this.trueValue : true;
	    },
	    compFalse: function compFalse() {
	      return this.falseValue ? this.falseValue : false;
	    }
	  },
	  methods: {
	    onChange: function onChange(event) {
	      if (this.state == true) {
	        this.$emit('input', this.compFalse);
	        this.state = false;
	      } else {
	        this.$emit('input', this.compTrue);
	        this.state = true;
	      }
	      console.log('state', this.state);
	    }
	  },
	  mounted: function mounted() {
	    this.state = this.value ? this.value : false;
	  }
	};

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	module.exports={render:function(){with(this) {
	  return _h('div', {
	    staticClass: "ui slider checkbox"
	  }, [_h('input', {
	    attrs: {
	      "type": "checkbox",
	      "true-value": compTrue,
	      "false-value": compFalse
	    },
	    domProps: {
	      "checked": value
	    },
	    on: {
	      "change": onChange
	    }
	  }), " ", _h('label', [_s(label)])])
	}},staticRenderFns: []}
	if (false) {
	  module.hot.accept()
	  if (module.hot.data) {
	     require("vue-hot-reload-api").rerender("data-v-7", module.exports)
	  }
	}

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_exports__, __vue_options__
	
	/* script */
	__vue_exports__ = __webpack_require__(69)
	
	/* template */
	var __vue_template__ = __webpack_require__(70)
	__vue_options__ = __vue_exports__ = __vue_exports__ || {}
	if (typeof __vue_exports__.default === "object") {
	if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
	__vue_options__ = __vue_exports__ = __vue_exports__.default
	}
	if (typeof __vue_options__ === "function") {
	  __vue_options__ = __vue_options__.options
	}
	__vue_options__.render = __vue_template__.render
	__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
	
	/* hot reload */
	if (false) {(function () {
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  module.hot.accept()
	  if (!module.hot.data) {
	    hotAPI.createRecord("data-v-8", __vue_options__)
	  } else {
	    hotAPI.reload("data-v-8", __vue_options__)
	  }
	})()}
	if (__vue_options__.functional) {console.error("[vue-loader] field-checkbox.vue: functional components are not supported and should be defined in plain js files using render functions.")}
	
	module.exports = __vue_exports__


/***/ },
/* 69 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  data: function data() {
	    return {
	      state: null
	    };
	  },
	
	  props: [
	  // required for v-model component
	  'label', 'value', 'trueValue', 'falseValue'],
	  computed: {
	    compTrue: function compTrue() {
	      return this.trueValue ? this.trueValue : true;
	    },
	    compFalse: function compFalse() {
	      return this.falseValue ? this.falseValue : false;
	    }
	  },
	  methods: {
	    onChange: function onChange(event) {
	      if (this.state == true) {
	        this.$emit('input', this.compFalse);
	        this.state = false;
	      } else {
	        this.$emit('input', this.compTrue);
	        this.state = true;
	      }
	      console.log('state', this.state);
	    }
	  },
	  mounted: function mounted() {
	    this.state = this.value ? this.value : false;
	  }
	};

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	module.exports={render:function(){with(this) {
	  return _h('div', {
	    staticClass: "ui checkbox"
	  }, [_h('input', {
	    attrs: {
	      "type": "checkbox",
	      "true-value": compTrue,
	      "false-value": compFalse
	    },
	    domProps: {
	      "checked": value
	    },
	    on: {
	      "change": onChange
	    }
	  }), " ", _h('label', [_s(label)])])
	}},staticRenderFns: []}
	if (false) {
	  module.hot.accept()
	  if (module.hot.data) {
	     require("vue-hot-reload-api").rerender("data-v-8", module.exports)
	  }
	}

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map