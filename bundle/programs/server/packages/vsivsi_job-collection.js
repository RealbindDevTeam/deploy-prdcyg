(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var later = Package['mrt:later'].later;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var check = Package.check.check;
var Match = Package.check.Match;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var __coffeescriptShare, Job, JobCollection;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/vsivsi_job-collection/job/src/job_class.coffee.js                                                         //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var JobQueue,
    _clearInterval,
    _setImmediate,
    _setInterval,
    concatReduce,
    isBoolean,
    isFunction,
    isInteger,
    isNonEmptyString,
    isNonEmptyStringOrArrayOfNonEmptyStrings,
    methodCall,
    optionsHelp,
    reduceCallbacks,
    splitLongArray,
    slice = [].slice,
    indexOf = [].indexOf || function (item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (i in this && this[i] === item) return i;
  }

  return -1;
};

methodCall = function (root, method, params, cb, after) {
  var apply, name, ref, ref1, ref2, ref3;

  if (after == null) {
    after = function (ret) {
      return ret;
    };
  }

  apply = (ref = (ref1 = Job._ddp_apply) != null ? ref1[(ref2 = root.root) != null ? ref2 : root] : void 0) != null ? ref : Job._ddp_apply;

  if (typeof apply !== 'function') {
    throw new Error("Job remote method call error, no valid invocation method found.");
  }

  name = ((ref3 = root.root) != null ? ref3 : root) + "_" + method;

  if (cb && typeof cb === 'function') {
    return apply(name, params, function (_this) {
      return function (err, res) {
        if (err) {
          return cb(err);
        }

        return cb(null, after(res));
      };
    }(this));
  } else {
    return after(apply(name, params));
  }
};

optionsHelp = function (options, cb) {
  var ref;

  if (cb != null && typeof cb !== 'function') {
    options = cb;
    cb = void 0;
  } else {
    if (!((typeof options === "undefined" ? "undefined" : _typeof(options)) === 'object' && options instanceof Array && options.length < 2)) {
      throw new Error('options... in optionsHelp must be an Array with zero or one elements');
    }

    options = (ref = options != null ? options[0] : void 0) != null ? ref : {};
  }

  if ((typeof options === "undefined" ? "undefined" : _typeof(options)) !== 'object') {
    throw new Error('in optionsHelp options not an object or bad callback');
  }

  return [options, cb];
};

splitLongArray = function (arr, max) {
  var i, k, ref, results;

  if (!(arr instanceof Array && max > 0)) {
    throw new Error('splitLongArray: bad params');
  }

  results = [];

  for (i = k = 0, ref = Math.ceil(arr.length / max); 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
    results.push(arr.slice(i * max, (i + 1) * max));
  }

  return results;
};

reduceCallbacks = function (cb, num, reduce, init) {
  var cbCount, cbErr, cbRetVal;

  if (reduce == null) {
    reduce = function (a, b) {
      return a || b;
    };
  }

  if (init == null) {
    init = false;
  }

  if (cb == null) {
    return void 0;
  }

  if (!(typeof cb === 'function' && num > 0 && typeof reduce === 'function')) {
    throw new Error('Bad params given to reduceCallbacks');
  }

  cbRetVal = init;
  cbCount = 0;
  cbErr = null;
  return function (err, res) {
    if (!cbErr) {
      if (err) {
        cbErr = err;
        return cb(err);
      } else {
        cbCount++;
        cbRetVal = reduce(cbRetVal, res);

        if (cbCount === num) {
          return cb(null, cbRetVal);
        } else if (cbCount > num) {
          throw new Error("reduceCallbacks callback invoked more than requested " + num + " times");
        }
      }
    }
  };
};

concatReduce = function (a, b) {
  if (!(a instanceof Array)) {
    a = [a];
  }

  return a.concat(b);
};

isInteger = function (i) {
  return typeof i === 'number' && Math.floor(i) === i;
};

isBoolean = function (b) {
  return typeof b === 'boolean';
};

isFunction = function (f) {
  return typeof f === 'function';
};

isNonEmptyString = function (s) {
  return typeof s === 'string' && s.length > 0;
};

isNonEmptyStringOrArrayOfNonEmptyStrings = function (sa) {
  var s;
  return isNonEmptyString(sa) || sa instanceof Array && sa.length !== 0 && function () {
    var k, len, results;
    results = [];

    for (k = 0, len = sa.length; k < len; k++) {
      s = sa[k];

      if (isNonEmptyString(s)) {
        results.push(s);
      }
    }

    return results;
  }().length === sa.length;
};

_setImmediate = function () {
  var args, func;
  func = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];

  if ((typeof Meteor !== "undefined" && Meteor !== null ? Meteor.setTimeout : void 0) != null) {
    return Meteor.setTimeout.apply(Meteor, [func, 0].concat(slice.call(args)));
  } else if (typeof setImmediate !== "undefined" && setImmediate !== null) {
    return setImmediate.apply(null, [func].concat(slice.call(args)));
  } else {
    return setTimeout.apply(null, [func, 0].concat(slice.call(args)));
  }
};

_setInterval = function () {
  var args, func, timeOut;
  func = arguments[0], timeOut = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];

  if ((typeof Meteor !== "undefined" && Meteor !== null ? Meteor.setInterval : void 0) != null) {
    return Meteor.setInterval.apply(Meteor, [func, timeOut].concat(slice.call(args)));
  } else {
    return setInterval.apply(null, [func, timeOut].concat(slice.call(args)));
  }
};

_clearInterval = function (id) {
  if ((typeof Meteor !== "undefined" && Meteor !== null ? Meteor.clearInterval : void 0) != null) {
    return Meteor.clearInterval(id);
  } else {
    return clearInterval(id);
  }
};

JobQueue = function () {
  function JobQueue() {
    var k, options, ref, ref1, ref2, ref3, ref4, root1, type1, worker;
    root1 = arguments[0], type1 = arguments[1], options = 4 <= arguments.length ? slice.call(arguments, 2, k = arguments.length - 1) : (k = 2, []), worker = arguments[k++];
    this.root = root1;
    this.type = type1;
    this.worker = worker;

    if (!(this instanceof JobQueue)) {
      return function (func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor(),
            result = func.apply(child, args);
        return Object(result) === result ? result : child;
      }(JobQueue, [this.root, this.type].concat(slice.call(options), [this.worker]), function () {});
    }

    ref = optionsHelp(options, this.worker), options = ref[0], this.worker = ref[1];

    if (!isNonEmptyString(this.root)) {
      throw new Error("JobQueue: Invalid root, must be nonempty string");
    }

    if (!isNonEmptyStringOrArrayOfNonEmptyStrings(this.type)) {
      throw new Error("JobQueue: Invalid type, must be nonempty string or array of nonempty strings");
    }

    if (!isFunction(this.worker)) {
      throw new Error("JobQueue: Invalid worker, must be a function");
    }

    this.errorCallback = (ref1 = options.errorCallback) != null ? ref1 : function (e) {
      return console.error("JobQueue: ", e);
    };

    if (!isFunction(this.errorCallback)) {
      throw new Error("JobQueue: Invalid errorCallback, must be a function");
    }

    this.pollInterval = options.pollInterval != null && !options.pollInterval ? Job.forever : !(options.pollInterval != null && isInteger(options.pollInterval)) ? 5000 : options.pollInterval;

    if (!(isInteger(this.pollInterval) && this.pollInterval >= 0)) {
      throw new Error("JobQueue: Invalid pollInterval, must be a positive integer");
    }

    this.concurrency = (ref2 = options.concurrency) != null ? ref2 : 1;

    if (!(isInteger(this.concurrency) && this.concurrency >= 0)) {
      throw new Error("JobQueue: Invalid concurrency, must be a positive integer");
    }

    this.payload = (ref3 = options.payload) != null ? ref3 : 1;

    if (!(isInteger(this.payload) && this.payload >= 0)) {
      throw new Error("JobQueue: Invalid payload, must be a positive integer");
    }

    this.prefetch = (ref4 = options.prefetch) != null ? ref4 : 0;

    if (!(isInteger(this.prefetch) && this.prefetch >= 0)) {
      throw new Error("JobQueue: Invalid prefetch, must be a positive integer");
    }

    this.workTimeout = options.workTimeout;

    if (this.workTimeout != null && !(isInteger(this.workTimeout) && this.workTimeout >= 0)) {
      throw new Error("JobQueue: Invalid workTimeout, must be a positive integer");
    }

    this.callbackStrict = options.callbackStrict;

    if (this.callbackStrict != null && !isBoolean(this.callbackStrict)) {
      throw new Error("JobQueue: Invalid callbackStrict, must be a boolean");
    }

    this._workers = {};
    this._tasks = [];
    this._taskNumber = 0;
    this._stoppingGetWork = void 0;
    this._stoppingTasks = void 0;
    this._interval = null;
    this._getWorkOutstanding = false;
    this.paused = true;
    this.resume();
  }

  JobQueue.prototype._getWork = function () {
    var numJobsToGet, options;

    if (!(this._getWorkOutstanding || this.paused)) {
      numJobsToGet = this.prefetch + this.payload * (this.concurrency - this.running()) - this.length();

      if (numJobsToGet > 0) {
        this._getWorkOutstanding = true;
        options = {
          maxJobs: numJobsToGet
        };

        if (this.workTimeout != null) {
          options.workTimeout = this.workTimeout;
        }

        return Job.getWork(this.root, this.type, options, function (_this) {
          return function (err, jobs) {
            var j, k, len;
            _this._getWorkOutstanding = false;

            if (err) {
              return _this.errorCallback(new Error("Received error from getWork(): " + err));
            } else if (jobs != null && jobs instanceof Array) {
              if (jobs.length > numJobsToGet) {
                _this.errorCallback(new Error("getWork() returned jobs (" + jobs.length + ") in excess of maxJobs (" + numJobsToGet + ")"));
              }

              for (k = 0, len = jobs.length; k < len; k++) {
                j = jobs[k];

                _this._tasks.push(j);

                if (_this._stoppingGetWork == null) {
                  _setImmediate(_this._process.bind(_this));
                }
              }

              if (_this._stoppingGetWork != null) {
                return _this._stoppingGetWork();
              }
            } else {
              return _this.errorCallback(new Error("Nonarray response from server from getWork()"));
            }
          };
        }(this));
      }
    }
  };

  JobQueue.prototype._only_once = function (fn) {
    var called;
    called = false;
    return function (_this) {
      return function () {
        if (called) {
          _this.errorCallback(new Error("Worker callback called multiple times"));

          if (_this.callbackStrict) {
            throw new Error("JobQueue: worker callback was invoked multiple times");
          }
        }

        called = true;
        return fn.apply(_this, arguments);
      };
    }(this);
  };

  JobQueue.prototype._process = function () {
    var cb, job, next;

    if (!this.paused && this.running() < this.concurrency && this.length()) {
      if (this.payload > 1) {
        job = this._tasks.splice(0, this.payload);
      } else {
        job = this._tasks.shift();
      }

      job._taskId = "Task_" + this._taskNumber++;
      this._workers[job._taskId] = job;

      next = function (_this) {
        return function () {
          delete _this._workers[job._taskId];

          if (_this._stoppingTasks != null && _this.running() === 0 && _this.length() === 0) {
            return _this._stoppingTasks();
          } else {
            _setImmediate(_this._process.bind(_this));

            return _setImmediate(_this._getWork.bind(_this));
          }
        };
      }(this);

      cb = this._only_once(next);
      return this.worker(job, cb);
    }
  };

  JobQueue.prototype._stopGetWork = function (callback) {
    _clearInterval(this._interval);

    this._interval = null;

    if (this._getWorkOutstanding) {
      return this._stoppingGetWork = callback;
    } else {
      return _setImmediate(callback);
    }
  };

  JobQueue.prototype._waitForTasks = function (callback) {
    if (this.running() !== 0) {
      return this._stoppingTasks = callback;
    } else {
      return _setImmediate(callback);
    }
  };

  JobQueue.prototype._failJobs = function (tasks, callback) {
    var count, job, k, len, results;

    if (tasks.length === 0) {
      _setImmediate(callback);
    }

    count = 0;
    results = [];

    for (k = 0, len = tasks.length; k < len; k++) {
      job = tasks[k];
      results.push(job.fail("Worker shutdown", function (_this) {
        return function (err, res) {
          count++;

          if (count === tasks.length) {
            return callback();
          }
        };
      }(this)));
    }

    return results;
  };

  JobQueue.prototype._hard = function (callback) {
    this.paused = true;
    return this._stopGetWork(function (_this) {
      return function () {
        var i, r, ref, tasks;
        tasks = _this._tasks;
        _this._tasks = [];
        ref = _this._workers;

        for (i in meteorBabelHelpers.sanitizeForInObject(ref)) {
          r = ref[i];
          tasks = tasks.concat(r);
        }

        return _this._failJobs(tasks, callback);
      };
    }(this));
  };

  JobQueue.prototype._stop = function (callback) {
    this.paused = true;
    return this._stopGetWork(function (_this) {
      return function () {
        var tasks;
        tasks = _this._tasks;
        _this._tasks = [];
        return _this._waitForTasks(function () {
          return _this._failJobs(tasks, callback);
        });
      };
    }(this));
  };

  JobQueue.prototype._soft = function (callback) {
    return this._stopGetWork(function (_this) {
      return function () {
        return _this._waitForTasks(callback);
      };
    }(this));
  };

  JobQueue.prototype.length = function () {
    return this._tasks.length;
  };

  JobQueue.prototype.running = function () {
    return Object.keys(this._workers).length;
  };

  JobQueue.prototype.idle = function () {
    return this.length() + this.running() === 0;
  };

  JobQueue.prototype.full = function () {
    return this.running() === this.concurrency;
  };

  JobQueue.prototype.pause = function () {
    if (this.paused) {
      return;
    }

    if (!(this.pollInterval >= Job.forever)) {
      _clearInterval(this._interval);

      this._interval = null;
    }

    this.paused = true;
    return this;
  };

  JobQueue.prototype.resume = function () {
    var k, ref, w;

    if (!this.paused) {
      return;
    }

    this.paused = false;

    _setImmediate(this._getWork.bind(this));

    if (!(this.pollInterval >= Job.forever)) {
      this._interval = _setInterval(this._getWork.bind(this), this.pollInterval);
    }

    for (w = k = 1, ref = this.concurrency; 1 <= ref ? k <= ref : k >= ref; w = 1 <= ref ? ++k : --k) {
      _setImmediate(this._process.bind(this));
    }

    return this;
  };

  JobQueue.prototype.trigger = function () {
    if (this.paused) {
      return;
    }

    _setImmediate(this._getWork.bind(this));

    return this;
  };

  JobQueue.prototype.shutdown = function () {
    var cb, k, options, ref;
    options = 2 <= arguments.length ? slice.call(arguments, 0, k = arguments.length - 1) : (k = 0, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (options.level == null) {
      options.level = 'normal';
    }

    if (options.quiet == null) {
      options.quiet = false;
    }

    if (cb == null) {
      if (!options.quiet) {
        console.warn("using default shutdown callback!");
      }

      cb = function (_this) {
        return function () {
          return console.warn("Shutdown complete");
        };
      }(this);
    }

    switch (options.level) {
      case 'hard':
        if (!options.quiet) {
          console.warn("Shutting down hard");
        }

        return this._hard(cb);

      case 'soft':
        if (!options.quiet) {
          console.warn("Shutting down soft");
        }

        return this._soft(cb);

      default:
        if (!options.quiet) {
          console.warn("Shutting down normally");
        }

        return this._stop(cb);
    }
  };

  return JobQueue;
}();

Job = function () {
  Job.forever = 9007199254740992;
  Job.foreverDate = new Date(8640000000000000);
  Job.jobPriorities = {
    low: 10,
    normal: 0,
    medium: -5,
    high: -10,
    critical: -15
  };
  Job.jobRetryBackoffMethods = ['constant', 'exponential'];
  Job.jobStatuses = ['waiting', 'paused', 'ready', 'running', 'failed', 'cancelled', 'completed'];
  Job.jobLogLevels = ['info', 'success', 'warning', 'danger'];
  Job.jobStatusCancellable = ['running', 'ready', 'waiting', 'paused'];
  Job.jobStatusPausable = ['ready', 'waiting'];
  Job.jobStatusRemovable = ['cancelled', 'completed', 'failed'];
  Job.jobStatusRestartable = ['cancelled', 'failed'];
  Job.ddpMethods = ['startJobs', 'stopJobs', 'startJobServer', 'shutdownJobServer', 'jobRemove', 'jobPause', 'jobResume', 'jobReady', 'jobCancel', 'jobRestart', 'jobSave', 'jobRerun', 'getWork', 'getJob', 'jobLog', 'jobProgress', 'jobDone', 'jobFail'];
  Job.ddpPermissionLevels = ['admin', 'manager', 'creator', 'worker'];
  Job.ddpMethodPermissions = {
    'startJobs': ['startJobs', 'admin'],
    'stopJobs': ['stopJobs', 'admin'],
    'startJobServer': ['startJobServer', 'admin'],
    'shutdownJobServer': ['shutdownJobServer', 'admin'],
    'jobRemove': ['jobRemove', 'admin', 'manager'],
    'jobPause': ['jobPause', 'admin', 'manager'],
    'jobResume': ['jobResume', 'admin', 'manager'],
    'jobCancel': ['jobCancel', 'admin', 'manager'],
    'jobReady': ['jobReady', 'admin', 'manager'],
    'jobRestart': ['jobRestart', 'admin', 'manager'],
    'jobSave': ['jobSave', 'admin', 'creator'],
    'jobRerun': ['jobRerun', 'admin', 'creator'],
    'getWork': ['getWork', 'admin', 'worker'],
    'getJob': ['getJob', 'admin', 'worker'],
    'jobLog': ['jobLog', 'admin', 'worker'],
    'jobProgress': ['jobProgress', 'admin', 'worker'],
    'jobDone': ['jobDone', 'admin', 'worker'],
    'jobFail': ['jobFail', 'admin', 'worker']
  };
  Job._ddp_apply = void 0;

  Job._setDDPApply = function (apply, collectionName) {
    if (typeof apply === 'function') {
      if (typeof collectionName === 'string') {
        if (this._ddp_apply == null) {
          this._ddp_apply = {};
        }

        if (typeof this._ddp_apply === 'function') {
          throw new Error("Job.setDDP must specify a collection name each time if called more than once.");
        }

        return this._ddp_apply[collectionName] = apply;
      } else if (!this._ddp_apply) {
        return this._ddp_apply = apply;
      } else {
        throw new Error("Job.setDDP must specify a collection name each time if called more than once.");
      }
    } else {
      throw new Error("Bad function in Job.setDDPApply()");
    }
  };

  Job.setDDP = function (ddp, collectionNames, Fiber) {
    var collName, k, len, results;

    if (ddp == null) {
      ddp = null;
    }

    if (collectionNames == null) {
      collectionNames = null;
    }

    if (Fiber == null) {
      Fiber = null;
    }

    if (!(typeof collectionNames === 'string' || collectionNames instanceof Array)) {
      Fiber = collectionNames;
      collectionNames = [void 0];
    } else if (typeof collectionNames === 'string') {
      collectionNames = [collectionNames];
    }

    results = [];

    for (k = 0, len = collectionNames.length; k < len; k++) {
      collName = collectionNames[k];

      if (!(ddp != null && ddp.close != null && ddp.subscribe != null)) {
        if (ddp === null && (typeof Meteor !== "undefined" && Meteor !== null ? Meteor.apply : void 0) != null) {
          results.push(this._setDDPApply(Meteor.apply, collName));
        } else {
          throw new Error("Bad ddp object in Job.setDDP()");
        }
      } else if (ddp.observe == null) {
        results.push(this._setDDPApply(ddp.apply.bind(ddp), collName));
      } else {
        if (Fiber == null) {
          results.push(this._setDDPApply(ddp.call.bind(ddp), collName));
        } else {
          results.push(this._setDDPApply(function (name, params, cb) {
            var fib;
            fib = Fiber.current;
            ddp.call(name, params, function (err, res) {
              if (cb != null && typeof cb === 'function') {
                return cb(err, res);
              } else {
                if (err) {
                  return fib.throwInto(err);
                } else {
                  return fib.run(res);
                }
              }
            });

            if (cb != null && typeof cb === 'function') {} else {
              return Fiber["yield"]();
            }
          }, collName));
        }
      }
    }

    return results;
  };

  Job.getWork = function () {
    var cb, k, options, ref, root, type;
    root = arguments[0], type = arguments[1], options = 4 <= arguments.length ? slice.call(arguments, 2, k = arguments.length - 1) : (k = 2, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (typeof type === 'string') {
      type = [type];
    }

    if (options.workTimeout != null) {
      if (!(isInteger(options.workTimeout) && options.workTimeout > 0)) {
        throw new Error('getWork: workTimeout must be a positive integer');
      }
    }

    return methodCall(root, "getWork", [type, options], cb, function (_this) {
      return function (res) {
        var doc, jobs;

        jobs = function () {
          var l, len, results;
          results = [];

          for (l = 0, len = res.length; l < len; l++) {
            doc = res[l];
            results.push(new Job(root, doc));
          }

          return results;
        }() || [];

        if (options.maxJobs != null) {
          return jobs;
        } else {
          return jobs[0];
        }
      };
    }(this));
  };

  Job.processJobs = JobQueue;

  Job.makeJob = function () {
    var depFlag;
    depFlag = false;
    return function (root, doc) {
      if (!depFlag) {
        depFlag = true;
        console.warn("Job.makeJob(root, jobDoc) has been deprecated and will be removed in a future release, use 'new Job(root, jobDoc)' instead.");
      }

      return new Job(root, doc);
    };
  }();

  Job.getJob = function () {
    var cb, id, k, options, ref, root;
    root = arguments[0], id = arguments[1], options = 4 <= arguments.length ? slice.call(arguments, 2, k = arguments.length - 1) : (k = 2, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (options.getLog == null) {
      options.getLog = false;
    }

    return methodCall(root, "getJob", [id, options], cb, function (_this) {
      return function (doc) {
        if (doc) {
          return new Job(root, doc);
        } else {
          return void 0;
        }
      };
    }(this));
  };

  Job.getJobs = function () {
    var cb, chunkOfIds, chunksOfIds, ids, k, l, len, myCb, options, ref, retVal, root;
    root = arguments[0], ids = arguments[1], options = 4 <= arguments.length ? slice.call(arguments, 2, k = arguments.length - 1) : (k = 2, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (options.getLog == null) {
      options.getLog = false;
    }

    retVal = [];
    chunksOfIds = splitLongArray(ids, 32);
    myCb = reduceCallbacks(cb, chunksOfIds.length, concatReduce, []);

    for (l = 0, len = chunksOfIds.length; l < len; l++) {
      chunkOfIds = chunksOfIds[l];
      retVal = retVal.concat(methodCall(root, "getJob", [chunkOfIds, options], myCb, function (_this) {
        return function (doc) {
          var d, len1, m, results;

          if (doc) {
            results = [];

            for (m = 0, len1 = doc.length; m < len1; m++) {
              d = doc[m];
              results.push(new Job(root, d.type, d.data, d));
            }

            return results;
          } else {
            return null;
          }
        };
      }(this)));
    }

    return retVal;
  };

  Job.pauseJobs = function () {
    var cb, chunkOfIds, chunksOfIds, ids, k, l, len, myCb, options, ref, retVal, root;
    root = arguments[0], ids = arguments[1], options = 4 <= arguments.length ? slice.call(arguments, 2, k = arguments.length - 1) : (k = 2, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];
    retVal = false;
    chunksOfIds = splitLongArray(ids, 256);
    myCb = reduceCallbacks(cb, chunksOfIds.length);

    for (l = 0, len = chunksOfIds.length; l < len; l++) {
      chunkOfIds = chunksOfIds[l];
      retVal = methodCall(root, "jobPause", [chunkOfIds, options], myCb) || retVal;
    }

    return retVal;
  };

  Job.resumeJobs = function () {
    var cb, chunkOfIds, chunksOfIds, ids, k, l, len, myCb, options, ref, retVal, root;
    root = arguments[0], ids = arguments[1], options = 4 <= arguments.length ? slice.call(arguments, 2, k = arguments.length - 1) : (k = 2, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];
    retVal = false;
    chunksOfIds = splitLongArray(ids, 256);
    myCb = reduceCallbacks(cb, chunksOfIds.length);

    for (l = 0, len = chunksOfIds.length; l < len; l++) {
      chunkOfIds = chunksOfIds[l];
      retVal = methodCall(root, "jobResume", [chunkOfIds, options], myCb) || retVal;
    }

    return retVal;
  };

  Job.readyJobs = function () {
    var cb, chunkOfIds, chunksOfIds, ids, k, l, len, myCb, options, ref, retVal, root;
    root = arguments[0], ids = arguments[1], options = 4 <= arguments.length ? slice.call(arguments, 2, k = arguments.length - 1) : (k = 2, []), cb = arguments[k++];

    if (ids == null) {
      ids = [];
    }

    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (options.force == null) {
      options.force = false;
    }

    retVal = false;
    chunksOfIds = splitLongArray(ids, 256);

    if (!(chunksOfIds.length > 0)) {
      chunksOfIds = [[]];
    }

    myCb = reduceCallbacks(cb, chunksOfIds.length);

    for (l = 0, len = chunksOfIds.length; l < len; l++) {
      chunkOfIds = chunksOfIds[l];
      retVal = methodCall(root, "jobReady", [chunkOfIds, options], myCb) || retVal;
    }

    return retVal;
  };

  Job.cancelJobs = function () {
    var cb, chunkOfIds, chunksOfIds, ids, k, l, len, myCb, options, ref, retVal, root;
    root = arguments[0], ids = arguments[1], options = 4 <= arguments.length ? slice.call(arguments, 2, k = arguments.length - 1) : (k = 2, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (options.antecedents == null) {
      options.antecedents = true;
    }

    retVal = false;
    chunksOfIds = splitLongArray(ids, 256);
    myCb = reduceCallbacks(cb, chunksOfIds.length);

    for (l = 0, len = chunksOfIds.length; l < len; l++) {
      chunkOfIds = chunksOfIds[l];
      retVal = methodCall(root, "jobCancel", [chunkOfIds, options], myCb) || retVal;
    }

    return retVal;
  };

  Job.restartJobs = function () {
    var cb, chunkOfIds, chunksOfIds, ids, k, l, len, myCb, options, ref, retVal, root;
    root = arguments[0], ids = arguments[1], options = 4 <= arguments.length ? slice.call(arguments, 2, k = arguments.length - 1) : (k = 2, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (options.retries == null) {
      options.retries = 1;
    }

    if (options.dependents == null) {
      options.dependents = true;
    }

    retVal = false;
    chunksOfIds = splitLongArray(ids, 256);
    myCb = reduceCallbacks(cb, chunksOfIds.length);

    for (l = 0, len = chunksOfIds.length; l < len; l++) {
      chunkOfIds = chunksOfIds[l];
      retVal = methodCall(root, "jobRestart", [chunkOfIds, options], myCb) || retVal;
    }

    return retVal;
  };

  Job.removeJobs = function () {
    var cb, chunkOfIds, chunksOfIds, ids, k, l, len, myCb, options, ref, retVal, root;
    root = arguments[0], ids = arguments[1], options = 4 <= arguments.length ? slice.call(arguments, 2, k = arguments.length - 1) : (k = 2, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];
    retVal = false;
    chunksOfIds = splitLongArray(ids, 256);
    myCb = reduceCallbacks(cb, chunksOfIds.length);

    for (l = 0, len = chunksOfIds.length; l < len; l++) {
      chunkOfIds = chunksOfIds[l];
      retVal = methodCall(root, "jobRemove", [chunkOfIds, options], myCb) || retVal;
    }

    return retVal;
  };

  Job.startJobs = function () {
    var cb, k, options, ref, root;
    root = arguments[0], options = 3 <= arguments.length ? slice.call(arguments, 1, k = arguments.length - 1) : (k = 1, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];
    return methodCall(root, "startJobs", [options], cb);
  };

  Job.stopJobs = function () {
    var cb, k, options, ref, root;
    root = arguments[0], options = 3 <= arguments.length ? slice.call(arguments, 1, k = arguments.length - 1) : (k = 1, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (options.timeout == null) {
      options.timeout = 60 * 1000;
    }

    return methodCall(root, "stopJobs", [options], cb);
  };

  Job.startJobServer = function () {
    var cb, k, options, ref, root;
    root = arguments[0], options = 3 <= arguments.length ? slice.call(arguments, 1, k = arguments.length - 1) : (k = 1, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];
    return methodCall(root, "startJobServer", [options], cb);
  };

  Job.shutdownJobServer = function () {
    var cb, k, options, ref, root;
    root = arguments[0], options = 3 <= arguments.length ? slice.call(arguments, 1, k = arguments.length - 1) : (k = 1, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (options.timeout == null) {
      options.timeout = 60 * 1000;
    }

    return methodCall(root, "shutdownJobServer", [options], cb);
  };

  function Job(rootVal, type, data) {
    var doc, ref, time;

    if (!(this instanceof Job)) {
      return new Job(rootVal, type, data);
    }

    this.root = rootVal;
    this._root = rootVal;

    if (((ref = this.root) != null ? ref.root : void 0) != null && typeof this.root.root === 'string') {
      this.root = this._root.root;
    }

    if (data == null && (type != null ? type.data : void 0) != null && (type != null ? type.type : void 0) != null) {
      if (type instanceof Job) {
        return type;
      }

      doc = type;
      data = doc.data;
      type = doc.type;
    } else {
      doc = {};
    }

    if (!((typeof doc === "undefined" ? "undefined" : _typeof(doc)) === 'object' && (typeof data === "undefined" ? "undefined" : _typeof(data)) === 'object' && typeof type === 'string' && typeof this.root === 'string')) {
      throw new Error("new Job: bad parameter(s), " + this.root + " (" + _typeof(this.root) + "), " + type + " (" + (typeof type === "undefined" ? "undefined" : _typeof(type)) + "), " + data + " (" + (typeof data === "undefined" ? "undefined" : _typeof(data)) + "), " + doc + " (" + (typeof doc === "undefined" ? "undefined" : _typeof(doc)) + ")");
    } else if (doc.type != null && doc.data != null) {
      this._doc = doc;
    } else {
      time = new Date();
      this._doc = {
        runId: null,
        type: type,
        data: data,
        status: 'waiting',
        updated: time,
        created: time
      };
      this.priority().retry().repeat().after().progress().depends().log("Constructed");
    }

    return this;
  }

  Job.prototype._echo = function (message, level) {
    if (level == null) {
      level = null;
    }

    switch (level) {
      case 'danger':
        console.error(message);
        break;

      case 'warning':
        console.warn(message);
        break;

      case 'success':
        console.log(message);
        break;

      default:
        console.info(message);
    }
  };

  Job.prototype.depends = function (jobs) {
    var depends, j, k, len;

    if (jobs) {
      if (jobs instanceof Job) {
        jobs = [jobs];
      }

      if (jobs instanceof Array) {
        depends = this._doc.depends;

        for (k = 0, len = jobs.length; k < len; k++) {
          j = jobs[k];

          if (!(j instanceof Job && j._doc._id != null)) {
            throw new Error('Each provided object must be a saved Job instance (with an _id)');
          }

          depends.push(j._doc._id);
        }
      } else {
        throw new Error('Bad input parameter: depends() accepts a falsy value, or Job or array of Jobs');
      }
    } else {
      depends = [];
    }

    this._doc.depends = depends;
    this._doc.resolved = [];
    return this;
  };

  Job.prototype.priority = function (level) {
    var priority;

    if (level == null) {
      level = 0;
    }

    if (typeof level === 'string') {
      priority = Job.jobPriorities[level];

      if (priority == null) {
        throw new Error('Invalid string priority level provided');
      }
    } else if (isInteger(level)) {
      priority = level;
    } else {
      throw new Error('priority must be an integer or valid priority level');
      priority = 0;
    }

    this._doc.priority = priority;
    return this;
  };

  Job.prototype.retry = function (options) {
    var base, ref;

    if (options == null) {
      options = 0;
    }

    if (isInteger(options) && options >= 0) {
      options = {
        retries: options
      };
    }

    if ((typeof options === "undefined" ? "undefined" : _typeof(options)) !== 'object') {
      throw new Error('bad parameter: accepts either an integer >= 0 or an options object');
    }

    if (options.retries != null) {
      if (!(isInteger(options.retries) && options.retries >= 0)) {
        throw new Error('bad option: retries must be an integer >= 0');
      }

      options.retries++;
    } else {
      options.retries = Job.forever;
    }

    if (options.until != null) {
      if (!(options.until instanceof Date)) {
        throw new Error('bad option: until must be a Date object');
      }
    } else {
      options.until = Job.foreverDate;
    }

    if (options.wait != null) {
      if (!(isInteger(options.wait) && options.wait >= 0)) {
        throw new Error('bad option: wait must be an integer >= 0');
      }
    } else {
      options.wait = 5 * 60 * 1000;
    }

    if (options.backoff != null) {
      if (ref = options.backoff, indexOf.call(Job.jobRetryBackoffMethods, ref) < 0) {
        throw new Error('bad option: invalid retry backoff method');
      }
    } else {
      options.backoff = 'constant';
    }

    this._doc.retries = options.retries;
    this._doc.repeatRetries = options.retries;
    this._doc.retryWait = options.wait;

    if ((base = this._doc).retried == null) {
      base.retried = 0;
    }

    this._doc.retryBackoff = options.backoff;
    this._doc.retryUntil = options.until;
    return this;
  };

  Job.prototype.repeat = function (options) {
    var base, ref;

    if (options == null) {
      options = 0;
    }

    if (isInteger(options) && options >= 0) {
      options = {
        repeats: options
      };
    }

    if ((typeof options === "undefined" ? "undefined" : _typeof(options)) !== 'object') {
      throw new Error('bad parameter: accepts either an integer >= 0 or an options object');
    }

    if (options.wait != null && options.schedule != null) {
      throw new Error('bad options: wait and schedule options are mutually exclusive');
    }

    if (options.repeats != null) {
      if (!(isInteger(options.repeats) && options.repeats >= 0)) {
        throw new Error('bad option: repeats must be an integer >= 0');
      }
    } else {
      options.repeats = Job.forever;
    }

    if (options.until != null) {
      if (!(options.until instanceof Date)) {
        throw new Error('bad option: until must be a Date object');
      }
    } else {
      options.until = Job.foreverDate;
    }

    if (options.wait != null) {
      if (!(isInteger(options.wait) && options.wait >= 0)) {
        throw new Error('bad option: wait must be an integer >= 0');
      }
    } else {
      options.wait = 5 * 60 * 1000;
    }

    if (options.schedule != null) {
      if (_typeof(options.schedule) !== 'object') {
        throw new Error('bad option, schedule option must be an object');
      }

      if (!(((ref = options.schedule) != null ? ref.schedules : void 0) != null && options.schedule.schedules instanceof Array)) {
        throw new Error('bad option, schedule object requires a schedules attribute of type Array.');
      }

      if (options.schedule.exceptions != null && !(options.schedule.exceptions instanceof Array)) {
        throw new Error('bad option, schedule object exceptions attribute must be an Array');
      }

      options.wait = {
        schedules: options.schedule.schedules,
        exceptions: options.schedule.exceptions
      };
    }

    this._doc.repeats = options.repeats;
    this._doc.repeatWait = options.wait;

    if ((base = this._doc).repeated == null) {
      base.repeated = 0;
    }

    this._doc.repeatUntil = options.until;
    return this;
  };

  Job.prototype.delay = function (wait) {
    if (wait == null) {
      wait = 0;
    }

    if (!(isInteger(wait) && wait >= 0)) {
      throw new Error('Bad parameter, delay requires a non-negative integer.');
    }

    return this.after(new Date(new Date().valueOf() + wait));
  };

  Job.prototype.after = function (time) {
    var after;

    if (time == null) {
      time = new Date(0);
    }

    if ((typeof time === "undefined" ? "undefined" : _typeof(time)) === 'object' && time instanceof Date) {
      after = time;
    } else {
      throw new Error('Bad parameter, after requires a valid Date object');
    }

    this._doc.after = after;
    return this;
  };

  Job.prototype.log = function () {
    var base, cb, k, message, options, ref, ref1;
    message = arguments[0], options = 3 <= arguments.length ? slice.call(arguments, 1, k = arguments.length - 1) : (k = 1, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (options.level == null) {
      options.level = 'info';
    }

    if (typeof message !== 'string') {
      throw new Error('Log message must be a string');
    }

    if (!(typeof options.level === 'string' && (ref1 = options.level, indexOf.call(Job.jobLogLevels, ref1) >= 0))) {
      throw new Error('Log level options must be one of Job.jobLogLevels');
    }

    if (options.echo != null) {
      if (options.echo && Job.jobLogLevels.indexOf(options.level) >= Job.jobLogLevels.indexOf(options.echo)) {
        this._echo("LOG: " + options.level + ", " + this._doc._id + " " + this._doc.runId + ": " + message, options.level);
      }

      delete options.echo;
    }

    if (this._doc._id != null) {
      return methodCall(this._root, "jobLog", [this._doc._id, this._doc.runId, message, options], cb);
    } else {
      if ((base = this._doc).log == null) {
        base.log = [];
      }

      this._doc.log.push({
        time: new Date(),
        runId: null,
        level: options.level,
        message: message
      });

      if (cb != null && typeof cb === 'function') {
        _setImmediate(cb, null, true);
      }

      return this;
    }
  };

  Job.prototype.progress = function () {
    var cb, completed, k, options, progress, ref, total;
    completed = arguments[0], total = arguments[1], options = 4 <= arguments.length ? slice.call(arguments, 2, k = arguments.length - 1) : (k = 2, []), cb = arguments[k++];

    if (completed == null) {
      completed = 0;
    }

    if (total == null) {
      total = 1;
    }

    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (typeof completed === 'number' && typeof total === 'number' && completed >= 0 && total > 0 && total >= completed) {
      progress = {
        completed: completed,
        total: total,
        percent: 100 * completed / total
      };

      if (options.echo) {
        delete options.echo;

        this._echo("PROGRESS: " + this._doc._id + " " + this._doc.runId + ": " + progress.completed + " out of " + progress.total + " (" + progress.percent + "%)");
      }

      if (this._doc._id != null && this._doc.runId != null) {
        return methodCall(this._root, "jobProgress", [this._doc._id, this._doc.runId, completed, total, options], cb, function (_this) {
          return function (res) {
            if (res) {
              _this._doc.progress = progress;
            }

            return res;
          };
        }(this));
      } else if (this._doc._id == null) {
        this._doc.progress = progress;

        if (cb != null && typeof cb === 'function') {
          _setImmediate(cb, null, true);
        }

        return this;
      }
    } else {
      throw new Error("job.progress: something is wrong with progress params: " + this.id + ", " + completed + " out of " + total);
    }

    return null;
  };

  Job.prototype.save = function () {
    var cb, k, options, ref;
    options = 2 <= arguments.length ? slice.call(arguments, 0, k = arguments.length - 1) : (k = 0, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];
    return methodCall(this._root, "jobSave", [this._doc, options], cb, function (_this) {
      return function (id) {
        if (id) {
          _this._doc._id = id;
        }

        return id;
      };
    }(this));
  };

  Job.prototype.refresh = function () {
    var cb, k, options, ref;
    options = 2 <= arguments.length ? slice.call(arguments, 0, k = arguments.length - 1) : (k = 0, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (options.getLog == null) {
      options.getLog = false;
    }

    if (this._doc._id != null) {
      return methodCall(this._root, "getJob", [this._doc._id, options], cb, function (_this) {
        return function (doc) {
          if (doc != null) {
            _this._doc = doc;
            return _this;
          } else {
            return false;
          }
        };
      }(this));
    } else {
      throw new Error("Can't call .refresh() on an unsaved job");
    }
  };

  Job.prototype.done = function () {
    var cb, k, options, ref, result;
    result = arguments[0], options = 3 <= arguments.length ? slice.call(arguments, 1, k = arguments.length - 1) : (k = 1, []), cb = arguments[k++];

    if (result == null) {
      result = {};
    }

    if (typeof result === 'function') {
      cb = result;
      result = {};
    }

    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (!(result != null && (typeof result === "undefined" ? "undefined" : _typeof(result)) === 'object')) {
      result = {
        value: result
      };
    }

    if (this._doc._id != null && this._doc.runId != null) {
      return methodCall(this._root, "jobDone", [this._doc._id, this._doc.runId, result, options], cb);
    } else {
      throw new Error("Can't call .done() on an unsaved or non-running job");
    }

    return null;
  };

  Job.prototype.fail = function () {
    var cb, k, options, ref, result;
    result = arguments[0], options = 3 <= arguments.length ? slice.call(arguments, 1, k = arguments.length - 1) : (k = 1, []), cb = arguments[k++];

    if (result == null) {
      result = "No error information provided";
    }

    if (typeof result === 'function') {
      cb = result;
      result = "No error information provided";
    }

    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (!(result != null && (typeof result === "undefined" ? "undefined" : _typeof(result)) === 'object')) {
      result = {
        value: result
      };
    }

    if (options.fatal == null) {
      options.fatal = false;
    }

    if (this._doc._id != null && this._doc.runId != null) {
      return methodCall(this._root, "jobFail", [this._doc._id, this._doc.runId, result, options], cb);
    } else {
      throw new Error("Can't call .fail() on an unsaved or non-running job");
    }

    return null;
  };

  Job.prototype.pause = function () {
    var cb, k, options, ref;
    options = 2 <= arguments.length ? slice.call(arguments, 0, k = arguments.length - 1) : (k = 0, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (this._doc._id != null) {
      return methodCall(this._root, "jobPause", [this._doc._id, options], cb);
    } else {
      this._doc.status = 'paused';

      if (cb != null && typeof cb === 'function') {
        _setImmediate(cb, null, true);
      }

      return this;
    }

    return null;
  };

  Job.prototype.resume = function () {
    var cb, k, options, ref;
    options = 2 <= arguments.length ? slice.call(arguments, 0, k = arguments.length - 1) : (k = 0, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (this._doc._id != null) {
      return methodCall(this._root, "jobResume", [this._doc._id, options], cb);
    } else {
      this._doc.status = 'waiting';

      if (cb != null && typeof cb === 'function') {
        _setImmediate(cb, null, true);
      }

      return this;
    }

    return null;
  };

  Job.prototype.ready = function () {
    var cb, k, options, ref;
    options = 2 <= arguments.length ? slice.call(arguments, 0, k = arguments.length - 1) : (k = 0, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (options.force == null) {
      options.force = false;
    }

    if (this._doc._id != null) {
      return methodCall(this._root, "jobReady", [this._doc._id, options], cb);
    } else {
      throw new Error("Can't call .ready() on an unsaved job");
    }

    return null;
  };

  Job.prototype.cancel = function () {
    var cb, k, options, ref;
    options = 2 <= arguments.length ? slice.call(arguments, 0, k = arguments.length - 1) : (k = 0, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (options.antecedents == null) {
      options.antecedents = true;
    }

    if (this._doc._id != null) {
      return methodCall(this._root, "jobCancel", [this._doc._id, options], cb);
    } else {
      throw new Error("Can't call .cancel() on an unsaved job");
    }

    return null;
  };

  Job.prototype.restart = function () {
    var cb, k, options, ref;
    options = 2 <= arguments.length ? slice.call(arguments, 0, k = arguments.length - 1) : (k = 0, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (options.retries == null) {
      options.retries = 1;
    }

    if (options.dependents == null) {
      options.dependents = true;
    }

    if (this._doc._id != null) {
      return methodCall(this._root, "jobRestart", [this._doc._id, options], cb);
    } else {
      throw new Error("Can't call .restart() on an unsaved job");
    }

    return null;
  };

  Job.prototype.rerun = function () {
    var cb, k, options, ref;
    options = 2 <= arguments.length ? slice.call(arguments, 0, k = arguments.length - 1) : (k = 0, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (options.repeats == null) {
      options.repeats = 0;
    }

    if (options.wait == null) {
      options.wait = this._doc.repeatWait;
    }

    if (this._doc._id != null) {
      return methodCall(this._root, "jobRerun", [this._doc._id, options], cb);
    } else {
      throw new Error("Can't call .rerun() on an unsaved job");
    }

    return null;
  };

  Job.prototype.remove = function () {
    var cb, k, options, ref;
    options = 2 <= arguments.length ? slice.call(arguments, 0, k = arguments.length - 1) : (k = 0, []), cb = arguments[k++];
    ref = optionsHelp(options, cb), options = ref[0], cb = ref[1];

    if (this._doc._id != null) {
      return methodCall(this._root, "jobRemove", [this._doc._id, options], cb);
    } else {
      throw new Error("Can't call .remove() on an unsaved job");
    }

    return null;
  };

  Object.defineProperties(Job.prototype, {
    doc: {
      get: function () {
        return this._doc;
      },
      set: function () {
        return console.warn("Job.doc cannot be directly assigned.");
      }
    },
    type: {
      get: function () {
        return this._doc.type;
      },
      set: function () {
        return console.warn("Job.type cannot be directly assigned.");
      }
    },
    data: {
      get: function () {
        return this._doc.data;
      },
      set: function () {
        return console.warn("Job.data cannot be directly assigned.");
      }
    }
  });
  return Job;
}();

if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
  module.exports = Job;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/vsivsi_job-collection/src/shared.coffee.js                                                                //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var JobCollectionBase,
    _validId,
    _validIntGTEOne,
    _validIntGTEZero,
    _validJobDoc,
    _validLaterJSObj,
    _validLog,
    _validLogLevel,
    _validNumGTEOne,
    _validNumGTEZero,
    _validNumGTZero,
    _validProgress,
    _validRetryBackoff,
    _validStatus,
    indexOf = [].indexOf || function (item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (i in this && this[i] === item) return i;
  }

  return -1;
},
    extend = function (child, parent) {
  for (var key in meteorBabelHelpers.sanitizeForInObject(parent)) {
    if (hasProp.call(parent, key)) child[key] = parent[key];
  }

  function ctor() {
    this.constructor = child;
  }

  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
  child.__super__ = parent.prototype;
  return child;
},
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

_validNumGTEZero = function (v) {
  return Match.test(v, Number) && v >= 0.0;
};

_validNumGTZero = function (v) {
  return Match.test(v, Number) && v > 0.0;
};

_validNumGTEOne = function (v) {
  return Match.test(v, Number) && v >= 1.0;
};

_validIntGTEZero = function (v) {
  return _validNumGTEZero(v) && Math.floor(v) === v;
};

_validIntGTEOne = function (v) {
  return _validNumGTEOne(v) && Math.floor(v) === v;
};

_validStatus = function (v) {
  return Match.test(v, String) && indexOf.call(Job.jobStatuses, v) >= 0;
};

_validLogLevel = function (v) {
  return Match.test(v, String) && indexOf.call(Job.jobLogLevels, v) >= 0;
};

_validRetryBackoff = function (v) {
  return Match.test(v, String) && indexOf.call(Job.jobRetryBackoffMethods, v) >= 0;
};

_validId = function (v) {
  return Match.test(v, Match.OneOf(String, Mongo.Collection.ObjectID));
};

_validLog = function () {
  return [{
    time: Date,
    runId: Match.OneOf(Match.Where(_validId), null),
    level: Match.Where(_validLogLevel),
    message: String,
    data: Match.Optional(Object)
  }];
};

_validProgress = function () {
  return {
    completed: Match.Where(_validNumGTEZero),
    total: Match.Where(_validNumGTEZero),
    percent: Match.Where(_validNumGTEZero)
  };
};

_validLaterJSObj = function () {
  return {
    schedules: [Object],
    exceptions: Match.Optional([Object])
  };
};

_validJobDoc = function () {
  return {
    _id: Match.Optional(Match.OneOf(Match.Where(_validId), null)),
    runId: Match.OneOf(Match.Where(_validId), null),
    type: String,
    status: Match.Where(_validStatus),
    data: Object,
    result: Match.Optional(Object),
    failures: Match.Optional([Object]),
    priority: Match.Integer,
    depends: [Match.Where(_validId)],
    resolved: [Match.Where(_validId)],
    after: Date,
    updated: Date,
    workTimeout: Match.Optional(Match.Where(_validIntGTEOne)),
    expiresAfter: Match.Optional(Date),
    log: Match.Optional(_validLog()),
    progress: _validProgress(),
    retries: Match.Where(_validIntGTEZero),
    retried: Match.Where(_validIntGTEZero),
    repeatRetries: Match.Optional(Match.Where(_validIntGTEZero)),
    retryUntil: Date,
    retryWait: Match.Where(_validIntGTEZero),
    retryBackoff: Match.Where(_validRetryBackoff),
    repeats: Match.Where(_validIntGTEZero),
    repeated: Match.Where(_validIntGTEZero),
    repeatUntil: Date,
    repeatWait: Match.OneOf(Match.Where(_validIntGTEZero), Match.Where(_validLaterJSObj)),
    created: Date
  };
};

JobCollectionBase = function (superClass) {
  extend(JobCollectionBase, superClass);

  function JobCollectionBase(root, options) {
    var collectionName;
    this.root = root != null ? root : 'queue';

    if (options == null) {
      options = {};
    }

    if (!(this instanceof JobCollectionBase)) {
      return new JobCollectionBase(this.root, options);
    }

    if (!(this instanceof Mongo.Collection)) {
      throw new Meteor.Error('The global definition of Mongo.Collection has changed since the job-collection package was loaded. Please ensure that any packages that redefine Mongo.Collection are loaded before job-collection.');
    }

    if (Mongo.Collection !== Mongo.Collection.prototype.constructor) {
      throw new Meteor.Error('The global definition of Mongo.Collection has been patched by another package, and the prototype constructor has been left in an inconsistent state. Please see this link for a workaround: https://github.com/vsivsi/meteor-file-sample-app/issues/2#issuecomment-120780592');
    }

    this.later = later;

    if (options.noCollectionSuffix == null) {
      options.noCollectionSuffix = false;
    }

    collectionName = this.root;

    if (!options.noCollectionSuffix) {
      collectionName += '.jobs';
    }

    delete options.noCollectionSuffix;
    Job.setDDP(options.connection, this.root);

    this._createLogEntry = function (message, runId, level, time, data) {
      var l;

      if (message == null) {
        message = '';
      }

      if (runId == null) {
        runId = null;
      }

      if (level == null) {
        level = 'info';
      }

      if (time == null) {
        time = new Date();
      }

      if (data == null) {
        data = null;
      }

      l = {
        time: time,
        runId: runId,
        message: message,
        level: level
      };
      return l;
    };

    this._logMessage = {
      'readied': function () {
        return this._createLogEntry("Promoted to ready");
      }.bind(this),
      'forced': function (id) {
        return this._createLogEntry("Dependencies force resolved", null, 'warning');
      }.bind(this),
      'rerun': function (id, runId) {
        return this._createLogEntry("Rerunning job", null, 'info', new Date(), {
          previousJob: {
            id: id,
            runId: runId
          }
        });
      }.bind(this),
      'running': function (runId) {
        return this._createLogEntry("Job Running", runId);
      }.bind(this),
      'paused': function () {
        return this._createLogEntry("Job Paused");
      }.bind(this),
      'resumed': function () {
        return this._createLogEntry("Job Resumed");
      }.bind(this),
      'cancelled': function () {
        return this._createLogEntry("Job Cancelled", null, 'warning');
      }.bind(this),
      'restarted': function () {
        return this._createLogEntry("Job Restarted");
      }.bind(this),
      'resubmitted': function () {
        return this._createLogEntry("Job Resubmitted");
      }.bind(this),
      'submitted': function () {
        return this._createLogEntry("Job Submitted");
      }.bind(this),
      'completed': function (runId) {
        return this._createLogEntry("Job Completed", runId, 'success');
      }.bind(this),
      'resolved': function (id, runId) {
        return this._createLogEntry("Dependency resolved", null, 'info', new Date(), {
          dependency: {
            id: id,
            runId: runId
          }
        });
      }.bind(this),
      'failed': function (runId, fatal, err) {
        var level, msg, value;
        value = err.value;
        msg = "Job Failed with" + (fatal ? ' Fatal' : '') + " Error" + (value != null && typeof value === 'string' ? ': ' + value : '') + ".";
        level = fatal ? 'danger' : 'warning';
        return this._createLogEntry(msg, runId, level);
      }.bind(this)
    };

    JobCollectionBase.__super__.constructor.call(this, collectionName, options);
  }

  JobCollectionBase.prototype._validNumGTEZero = _validNumGTEZero;
  JobCollectionBase.prototype._validNumGTZero = _validNumGTZero;
  JobCollectionBase.prototype._validNumGTEOne = _validNumGTEOne;
  JobCollectionBase.prototype._validIntGTEZero = _validIntGTEZero;
  JobCollectionBase.prototype._validIntGTEOne = _validIntGTEOne;
  JobCollectionBase.prototype._validStatus = _validStatus;
  JobCollectionBase.prototype._validLogLevel = _validLogLevel;
  JobCollectionBase.prototype._validRetryBackoff = _validRetryBackoff;
  JobCollectionBase.prototype._validId = _validId;
  JobCollectionBase.prototype._validLog = _validLog;
  JobCollectionBase.prototype._validProgress = _validProgress;
  JobCollectionBase.prototype._validJobDoc = _validJobDoc;
  JobCollectionBase.prototype.jobLogLevels = Job.jobLogLevels;
  JobCollectionBase.prototype.jobPriorities = Job.jobPriorities;
  JobCollectionBase.prototype.jobStatuses = Job.jobStatuses;
  JobCollectionBase.prototype.jobStatusCancellable = Job.jobStatusCancellable;
  JobCollectionBase.prototype.jobStatusPausable = Job.jobStatusPausable;
  JobCollectionBase.prototype.jobStatusRemovable = Job.jobStatusRemovable;
  JobCollectionBase.prototype.jobStatusRestartable = Job.jobStatusRestartable;
  JobCollectionBase.prototype.forever = Job.forever;
  JobCollectionBase.prototype.foreverDate = Job.foreverDate;
  JobCollectionBase.prototype.ddpMethods = Job.ddpMethods;
  JobCollectionBase.prototype.ddpPermissionLevels = Job.ddpPermissionLevels;
  JobCollectionBase.prototype.ddpMethodPermissions = Job.ddpMethodPermissions;

  JobCollectionBase.prototype.processJobs = function () {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return function (func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor(),
          result = func.apply(child, args);
      return Object(result) === result ? result : child;
    }(Job.processJobs, [this.root].concat(slice.call(params)), function () {});
  };

  JobCollectionBase.prototype.getJob = function () {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Job.getJob.apply(Job, [this.root].concat(slice.call(params)));
  };

  JobCollectionBase.prototype.getWork = function () {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Job.getWork.apply(Job, [this.root].concat(slice.call(params)));
  };

  JobCollectionBase.prototype.getJobs = function () {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Job.getJobs.apply(Job, [this.root].concat(slice.call(params)));
  };

  JobCollectionBase.prototype.readyJobs = function () {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Job.readyJobs.apply(Job, [this.root].concat(slice.call(params)));
  };

  JobCollectionBase.prototype.cancelJobs = function () {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Job.cancelJobs.apply(Job, [this.root].concat(slice.call(params)));
  };

  JobCollectionBase.prototype.pauseJobs = function () {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Job.pauseJobs.apply(Job, [this.root].concat(slice.call(params)));
  };

  JobCollectionBase.prototype.resumeJobs = function () {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Job.resumeJobs.apply(Job, [this.root].concat(slice.call(params)));
  };

  JobCollectionBase.prototype.restartJobs = function () {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Job.restartJobs.apply(Job, [this.root].concat(slice.call(params)));
  };

  JobCollectionBase.prototype.removeJobs = function () {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Job.removeJobs.apply(Job, [this.root].concat(slice.call(params)));
  };

  JobCollectionBase.prototype.setDDP = function () {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Job.setDDP.apply(Job, params);
  };

  JobCollectionBase.prototype.startJobServer = function () {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Job.startJobServer.apply(Job, [this.root].concat(slice.call(params)));
  };

  JobCollectionBase.prototype.shutdownJobServer = function () {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Job.shutdownJobServer.apply(Job, [this.root].concat(slice.call(params)));
  };

  JobCollectionBase.prototype.startJobs = function () {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Job.startJobs.apply(Job, [this.root].concat(slice.call(params)));
  };

  JobCollectionBase.prototype.stopJobs = function () {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Job.stopJobs.apply(Job, [this.root].concat(slice.call(params)));
  };

  JobCollectionBase.prototype.jobDocPattern = _validJobDoc();

  JobCollectionBase.prototype.allow = function () {
    throw new Error("Server-only function jc.allow() invoked on client.");
  };

  JobCollectionBase.prototype.deny = function () {
    throw new Error("Server-only function jc.deny() invoked on client.");
  };

  JobCollectionBase.prototype.promote = function () {
    throw new Error("Server-only function jc.promote() invoked on client.");
  };

  JobCollectionBase.prototype.setLogStream = function () {
    throw new Error("Server-only function jc.setLogStream() invoked on client.");
  };

  JobCollectionBase.prototype.logConsole = function () {
    throw new Error("Client-only function jc.logConsole() invoked on server.");
  };

  JobCollectionBase.prototype.makeJob = function () {
    var dep;
    dep = false;
    return function () {
      var params;
      params = 1 <= arguments.length ? slice.call(arguments, 0) : [];

      if (!dep) {
        dep = true;
        console.warn("WARNING: jc.makeJob() has been deprecated. Use new Job(jc, doc) instead.");
      }

      return function (func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor(),
            result = func.apply(child, args);
        return Object(result) === result ? result : child;
      }(Job, [this.root].concat(slice.call(params)), function () {});
    };
  }();

  JobCollectionBase.prototype.createJob = function () {
    var dep;
    dep = false;
    return function () {
      var params;
      params = 1 <= arguments.length ? slice.call(arguments, 0) : [];

      if (!dep) {
        dep = true;
        console.warn("WARNING: jc.createJob() has been deprecated. Use new Job(jc, type, data) instead.");
      }

      return function (func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor(),
            result = func.apply(child, args);
        return Object(result) === result ? result : child;
      }(Job, [this.root].concat(slice.call(params)), function () {});
    };
  }();

  JobCollectionBase.prototype._methodWrapper = function (method, func) {
    var ref, toLog, unblockDDPMethods;
    toLog = this._toLog;
    unblockDDPMethods = (ref = this._unblockDDPMethods) != null ? ref : false;
    return function () {
      var params, ref1, retval, user;
      params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      user = (ref1 = this.userId) != null ? ref1 : "[UNAUTHENTICATED]";
      toLog(user, method, "params: " + JSON.stringify(params));

      if (unblockDDPMethods) {
        this.unblock();
      }

      retval = func.apply(null, params);
      toLog(user, method, "returned: " + JSON.stringify(retval));
      return retval;
    };
  };

  JobCollectionBase.prototype._generateMethods = function () {
    var baseMethodName, methodFunc, methodName, methodPrefix, methodsOut, ref;
    methodsOut = {};
    methodPrefix = '_DDPMethod_';
    ref = this;

    for (methodName in meteorBabelHelpers.sanitizeForInObject(ref)) {
      methodFunc = ref[methodName];

      if (!(methodName.slice(0, methodPrefix.length) === methodPrefix)) {
        continue;
      }

      baseMethodName = methodName.slice(methodPrefix.length);
      methodsOut[this.root + "_" + baseMethodName] = this._methodWrapper(baseMethodName, methodFunc.bind(this));
    }

    return methodsOut;
  };

  JobCollectionBase.prototype._idsOfDeps = function (ids, antecedents, dependents, jobStatuses) {
    var antsArray, dependsIds, dependsQuery;
    dependsQuery = [];
    dependsIds = [];

    if (dependents) {
      dependsQuery.push({
        depends: {
          $elemMatch: {
            $in: ids
          }
        }
      });
    }

    if (antecedents) {
      antsArray = [];
      this.find({
        _id: {
          $in: ids
        }
      }, {
        fields: {
          depends: 1
        },
        transform: null
      }).forEach(function (d) {
        var i, k, len, ref, results;

        if (indexOf.call(antsArray, i) < 0) {
          ref = d.depends;
          results = [];

          for (k = 0, len = ref.length; k < len; k++) {
            i = ref[k];
            results.push(antsArray.push(i));
          }

          return results;
        }
      });

      if (antsArray.length > 0) {
        dependsQuery.push({
          _id: {
            $in: antsArray
          }
        });
      }
    }

    if (dependsQuery.length > 0) {
      this.find({
        status: {
          $in: jobStatuses
        },
        $or: dependsQuery
      }, {
        fields: {
          _id: 1
        },
        transform: null
      }).forEach(function (d) {
        var ref;

        if (ref = d._id, indexOf.call(dependsIds, ref) < 0) {
          return dependsIds.push(d._id);
        }
      });
    }

    return dependsIds;
  };

  JobCollectionBase.prototype._rerun_job = function (doc, repeats, wait, repeatUntil) {
    var id, jobId, logObj, runId, time;

    if (repeats == null) {
      repeats = doc.repeats - 1;
    }

    if (wait == null) {
      wait = doc.repeatWait;
    }

    if (repeatUntil == null) {
      repeatUntil = doc.repeatUntil;
    }

    id = doc._id;
    runId = doc.runId;
    time = new Date();
    delete doc._id;
    delete doc.result;
    delete doc.failures;
    delete doc.expiresAfter;
    delete doc.workTimeout;
    doc.runId = null;
    doc.status = "waiting";
    doc.repeatRetries = doc.repeatRetries != null ? doc.repeatRetries : doc.retries + doc.retried;
    doc.retries = doc.repeatRetries;

    if (doc.retries > this.forever) {
      doc.retries = this.forever;
    }

    doc.retryUntil = repeatUntil;
    doc.retried = 0;
    doc.repeats = repeats;

    if (doc.repeats > this.forever) {
      doc.repeats = this.forever;
    }

    doc.repeatUntil = repeatUntil;
    doc.repeated = doc.repeated + 1;
    doc.updated = time;
    doc.created = time;
    doc.progress = {
      completed: 0,
      total: 1,
      percent: 0
    };

    if (logObj = this._logMessage.rerun(id, runId)) {
      doc.log = [logObj];
    } else {
      doc.log = [];
    }

    doc.after = new Date(time.valueOf() + wait);

    if (jobId = this.insert(doc)) {
      this._DDPMethod_jobReady(jobId);

      return jobId;
    } else {
      console.warn("Job rerun/repeat failed to reschedule!", id, runId);
    }

    return null;
  };

  JobCollectionBase.prototype._checkDeps = function (job, dryRun) {
    var cancel, cancelled, depJob, deps, failed, foundIds, j, k, len, len1, log, m, mods, n, ref, ref1, removed, resolved;

    if (dryRun == null) {
      dryRun = true;
    }

    cancel = false;
    resolved = [];
    failed = [];
    cancelled = [];
    removed = [];
    log = [];

    if (job.depends.length > 0) {
      deps = this.find({
        _id: {
          $in: job.depends
        }
      }, {
        fields: {
          _id: 1,
          runId: 1,
          status: 1
        }
      }).fetch();

      if (deps.length !== job.depends.length) {
        foundIds = deps.map(function (d) {
          return d._id;
        });
        ref = job.depends;

        for (k = 0, len = ref.length; k < len; k++) {
          j = ref[k];

          if (!!(indexOf.call(foundIds, j) >= 0)) {
            continue;
          }

          if (!dryRun) {
            this._DDPMethod_jobLog(job._id, null, "Antecedent job " + j + " missing at save");
          }

          removed.push(j);
        }

        cancel = true;
      }

      for (m = 0, len1 = deps.length; m < len1; m++) {
        depJob = deps[m];

        if (ref1 = depJob.status, indexOf.call(this.jobStatusCancellable, ref1) < 0) {
          switch (depJob.status) {
            case "completed":
              resolved.push(depJob._id);
              log.push(this._logMessage.resolved(depJob._id, depJob.runId));
              break;

            case "failed":
              cancel = true;
              failed.push(depJob._id);

              if (!dryRun) {
                this._DDPMethod_jobLog(job._id, null, "Antecedent job failed before save");
              }

              break;

            case "cancelled":
              cancel = true;
              cancelled.push(depJob._id);

              if (!dryRun) {
                this._DDPMethod_jobLog(job._id, null, "Antecedent job cancelled before save");
              }

              break;

            default:
              throw new Meteor.Error("Unknown status in jobSave Dependency check");
          }
        }
      }

      if (!(resolved.length === 0 || dryRun)) {
        mods = {
          $pull: {
            depends: {
              $in: resolved
            }
          },
          $push: {
            resolved: {
              $each: resolved
            },
            log: {
              $each: log
            }
          }
        };
        n = this.update({
          _id: job._id,
          status: 'waiting'
        }, mods);

        if (!n) {
          console.warn("Update for job " + job._id + " during dependency check failed.");
        }
      }

      if (cancel && !dryRun) {
        this._DDPMethod_jobCancel(job._id);

        return false;
      }
    }

    if (dryRun) {
      if (cancel || resolved.length > 0) {
        return {
          jobId: job._id,
          resolved: resolved,
          failed: failed,
          cancelled: cancelled,
          removed: removed
        };
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  JobCollectionBase.prototype._DDPMethod_startJobServer = function (options) {
    check(options, Match.Optional({}));

    if (options == null) {
      options = {};
    }

    if (!this.isSimulation) {
      if (this.stopped && this.stopped !== true) {
        Meteor.clearTimeout(this.stopped);
      }

      this.stopped = false;
    }

    return true;
  };

  JobCollectionBase.prototype._DDPMethod_startJobs = function () {
    var depFlag;
    depFlag = false;
    return function (options) {
      if (!depFlag) {
        depFlag = true;
        console.warn("Deprecation Warning: jc.startJobs() has been renamed to jc.startJobServer()");
      }

      return this._DDPMethod_startJobServer(options);
    };
  }();

  JobCollectionBase.prototype._DDPMethod_shutdownJobServer = function (options) {
    check(options, Match.Optional({
      timeout: Match.Optional(Match.Where(_validIntGTEOne))
    }));

    if (options == null) {
      options = {};
    }

    if (options.timeout == null) {
      options.timeout = 60 * 1000;
    }

    if (!this.isSimulation) {
      if (this.stopped && this.stopped !== true) {
        Meteor.clearTimeout(this.stopped);
      }

      this.stopped = Meteor.setTimeout(function (_this) {
        return function () {
          var cursor, failedJobs;
          cursor = _this.find({
            status: 'running'
          }, {
            transform: null
          });
          failedJobs = cursor.count();

          if (failedJobs !== 0) {
            console.warn("Failing " + failedJobs + " jobs on queue stop.");
          }

          cursor.forEach(function (d) {
            return _this._DDPMethod_jobFail(d._id, d.runId, "Running at Job Server shutdown.");
          });

          if (_this.logStream != null) {
            _this.logStream.end();

            return _this.logStream = null;
          }
        };
      }(this), options.timeout);
    }

    return true;
  };

  JobCollectionBase.prototype._DDPMethod_stopJobs = function () {
    var depFlag;
    depFlag = false;
    return function (options) {
      if (!depFlag) {
        depFlag = true;
        console.warn("Deprecation Warning: jc.stopJobs() has been renamed to jc.shutdownJobServer()");
      }

      return this._DDPMethod_shutdownJobServer(options);
    };
  }();

  JobCollectionBase.prototype._DDPMethod_getJob = function (ids, options) {
    var d, docs, fields, single;
    check(ids, Match.OneOf(Match.Where(_validId), [Match.Where(_validId)]));
    check(options, Match.Optional({
      getLog: Match.Optional(Boolean),
      getFailures: Match.Optional(Boolean)
    }));

    if (options == null) {
      options = {};
    }

    if (options.getLog == null) {
      options.getLog = false;
    }

    if (options.getFailures == null) {
      options.getFailures = false;
    }

    single = false;

    if (_validId(ids)) {
      ids = [ids];
      single = true;
    }

    if (ids.length === 0) {
      return null;
    }

    fields = {
      _private: 0
    };

    if (!options.getLog) {
      fields.log = 0;
    }

    if (!options.getFailures) {
      fields.failures = 0;
    }

    docs = this.find({
      _id: {
        $in: ids
      }
    }, {
      fields: fields,
      transform: null
    }).fetch();

    if (docs != null ? docs.length : void 0) {
      if (this.scrub != null) {
        docs = function () {
          var k, len, results;
          results = [];

          for (k = 0, len = docs.length; k < len; k++) {
            d = docs[k];
            results.push(this.scrub(d));
          }

          return results;
        }.call(this);
      }

      check(docs, [_validJobDoc()]);

      if (single) {
        return docs[0];
      } else {
        return docs;
      }
    }

    return null;
  };

  JobCollectionBase.prototype._DDPMethod_getWork = function (type, options) {
    var d, docs, foundDocs, ids, logObj, mods, num, runId, time;
    check(type, Match.OneOf(String, [String]));
    check(options, Match.Optional({
      maxJobs: Match.Optional(Match.Where(_validIntGTEOne)),
      workTimeout: Match.Optional(Match.Where(_validIntGTEOne))
    }));

    if (this.isSimulation) {
      return;
    }

    if (options == null) {
      options = {};
    }

    if (options.maxJobs == null) {
      options.maxJobs = 1;
    }

    if (this.stopped) {
      return [];
    }

    if (typeof type === 'string') {
      type = [type];
    }

    time = new Date();
    docs = [];
    runId = this._makeNewID();

    while (docs.length < options.maxJobs) {
      ids = this.find({
        type: {
          $in: type
        },
        status: 'ready',
        runId: null
      }, {
        sort: {
          priority: 1,
          retryUntil: 1,
          after: 1
        },
        limit: options.maxJobs - docs.length,
        fields: {
          _id: 1
        },
        transform: null
      }).map(function (d) {
        return d._id;
      });

      if (!((ids != null ? ids.length : void 0) > 0)) {
        break;
      }

      mods = {
        $set: {
          status: 'running',
          runId: runId,
          updated: time
        },
        $inc: {
          retries: -1,
          retried: 1
        }
      };

      if (logObj = this._logMessage.running(runId)) {
        mods.$push = {
          log: logObj
        };
      }

      if (options.workTimeout != null) {
        mods.$set.workTimeout = options.workTimeout;
        mods.$set.expiresAfter = new Date(time.valueOf() + options.workTimeout);
      } else {
        if (mods.$unset == null) {
          mods.$unset = {};
        }

        mods.$unset.workTimeout = "";
        mods.$unset.expiresAfter = "";
      }

      num = this.update({
        _id: {
          $in: ids
        },
        status: 'ready',
        runId: null
      }, mods, {
        multi: true
      });

      if (num > 0) {
        foundDocs = this.find({
          _id: {
            $in: ids
          },
          runId: runId
        }, {
          fields: {
            log: 0,
            failures: 0,
            _private: 0
          },
          transform: null
        }).fetch();

        if ((foundDocs != null ? foundDocs.length : void 0) > 0) {
          if (this.scrub != null) {
            foundDocs = function () {
              var k, len, results;
              results = [];

              for (k = 0, len = foundDocs.length; k < len; k++) {
                d = foundDocs[k];
                results.push(this.scrub(d));
              }

              return results;
            }.call(this);
          }

          check(docs, [_validJobDoc()]);
          docs = docs.concat(foundDocs);
        }
      }
    }

    return docs;
  };

  JobCollectionBase.prototype._DDPMethod_jobRemove = function (ids, options) {
    var num;
    check(ids, Match.OneOf(Match.Where(_validId), [Match.Where(_validId)]));
    check(options, Match.Optional({}));

    if (options == null) {
      options = {};
    }

    if (_validId(ids)) {
      ids = [ids];
    }

    if (ids.length === 0) {
      return false;
    }

    num = this.remove({
      _id: {
        $in: ids
      },
      status: {
        $in: this.jobStatusRemovable
      }
    });

    if (num > 0) {
      return true;
    } else {
      console.warn("jobRemove failed");
    }

    return false;
  };

  JobCollectionBase.prototype._DDPMethod_jobPause = function (ids, options) {
    var logObj, mods, num, time;
    check(ids, Match.OneOf(Match.Where(_validId), [Match.Where(_validId)]));
    check(options, Match.Optional({}));

    if (options == null) {
      options = {};
    }

    if (_validId(ids)) {
      ids = [ids];
    }

    if (ids.length === 0) {
      return false;
    }

    time = new Date();
    mods = {
      $set: {
        status: "paused",
        updated: time
      }
    };

    if (logObj = this._logMessage.paused()) {
      mods.$push = {
        log: logObj
      };
    }

    num = this.update({
      _id: {
        $in: ids
      },
      status: {
        $in: this.jobStatusPausable
      }
    }, mods, {
      multi: true
    });

    if (num > 0) {
      return true;
    } else {
      console.warn("jobPause failed");
    }

    return false;
  };

  JobCollectionBase.prototype._DDPMethod_jobResume = function (ids, options) {
    var logObj, mods, num, time;
    check(ids, Match.OneOf(Match.Where(_validId), [Match.Where(_validId)]));
    check(options, Match.Optional({}));

    if (options == null) {
      options = {};
    }

    if (_validId(ids)) {
      ids = [ids];
    }

    if (ids.length === 0) {
      return false;
    }

    time = new Date();
    mods = {
      $set: {
        status: "waiting",
        updated: time
      }
    };

    if (logObj = this._logMessage.resumed()) {
      mods.$push = {
        log: logObj
      };
    }

    num = this.update({
      _id: {
        $in: ids
      },
      status: "paused",
      updated: {
        $ne: time
      }
    }, mods, {
      multi: true
    });

    if (num > 0) {
      this._DDPMethod_jobReady(ids);

      return true;
    } else {
      console.warn("jobResume failed");
    }

    return false;
  };

  JobCollectionBase.prototype._DDPMethod_jobReady = function (ids, options) {
    var l, logObj, mods, now, num, query;
    check(ids, Match.OneOf(Match.Where(_validId), [Match.Where(_validId)]));
    check(options, Match.Optional({
      force: Match.Optional(Boolean),
      time: Match.Optional(Date)
    }));

    if (this.isSimulation) {
      return;
    }

    now = new Date();

    if (options == null) {
      options = {};
    }

    if (options.force == null) {
      options.force = false;
    }

    if (options.time == null) {
      options.time = now;
    }

    if (_validId(ids)) {
      ids = [ids];
    }

    query = {
      status: "waiting",
      after: {
        $lte: options.time
      }
    };
    mods = {
      $set: {
        status: "ready",
        updated: now
      }
    };

    if (ids.length > 0) {
      query._id = {
        $in: ids
      };
      mods.$set.after = now;
    }

    logObj = [];

    if (options.force) {
      mods.$set.depends = [];
      l = this._logMessage.forced();

      if (l) {
        logObj.push(l);
      }
    } else {
      query.depends = {
        $size: 0
      };
    }

    l = this._logMessage.readied();

    if (l) {
      logObj.push(l);
    }

    if (logObj.length > 0) {
      mods.$push = {
        log: {
          $each: logObj
        }
      };
    }

    num = this.update(query, mods, {
      multi: true
    });

    if (num > 0) {
      return true;
    } else {
      return false;
    }
  };

  JobCollectionBase.prototype._DDPMethod_jobCancel = function (ids, options) {
    var cancelIds, depsCancelled, logObj, mods, num, time;
    check(ids, Match.OneOf(Match.Where(_validId), [Match.Where(_validId)]));
    check(options, Match.Optional({
      antecedents: Match.Optional(Boolean),
      dependents: Match.Optional(Boolean)
    }));

    if (options == null) {
      options = {};
    }

    if (options.antecedents == null) {
      options.antecedents = false;
    }

    if (options.dependents == null) {
      options.dependents = true;
    }

    if (_validId(ids)) {
      ids = [ids];
    }

    if (ids.length === 0) {
      return false;
    }

    time = new Date();
    mods = {
      $set: {
        status: "cancelled",
        runId: null,
        progress: {
          completed: 0,
          total: 1,
          percent: 0
        },
        updated: time
      }
    };

    if (logObj = this._logMessage.cancelled()) {
      mods.$push = {
        log: logObj
      };
    }

    num = this.update({
      _id: {
        $in: ids
      },
      status: {
        $in: this.jobStatusCancellable
      }
    }, mods, {
      multi: true
    });
    cancelIds = this._idsOfDeps(ids, options.antecedents, options.dependents, this.jobStatusCancellable);
    depsCancelled = false;

    if (cancelIds.length > 0) {
      depsCancelled = this._DDPMethod_jobCancel(cancelIds, options);
    }

    if (num > 0 || depsCancelled) {
      return true;
    } else {
      console.warn("jobCancel failed");
    }

    return false;
  };

  JobCollectionBase.prototype._DDPMethod_jobRestart = function (ids, options) {
    var depsRestarted, logObj, mods, num, query, restartIds, time;
    check(ids, Match.OneOf(Match.Where(_validId), [Match.Where(_validId)]));
    check(options, Match.Optional({
      retries: Match.Optional(Match.Where(_validIntGTEZero)),
      until: Match.Optional(Date),
      antecedents: Match.Optional(Boolean),
      dependents: Match.Optional(Boolean)
    }));

    if (options == null) {
      options = {};
    }

    if (options.retries == null) {
      options.retries = 1;
    }

    if (options.retries > this.forever) {
      options.retries = this.forever;
    }

    if (options.dependents == null) {
      options.dependents = false;
    }

    if (options.antecedents == null) {
      options.antecedents = true;
    }

    if (_validId(ids)) {
      ids = [ids];
    }

    if (ids.length === 0) {
      return false;
    }

    time = new Date();
    query = {
      _id: {
        $in: ids
      },
      status: {
        $in: this.jobStatusRestartable
      }
    };
    mods = {
      $set: {
        status: "waiting",
        progress: {
          completed: 0,
          total: 1,
          percent: 0
        },
        updated: time
      },
      $inc: {
        retries: options.retries
      }
    };

    if (logObj = this._logMessage.restarted()) {
      mods.$push = {
        log: logObj
      };
    }

    if (options.until != null) {
      mods.$set.retryUntil = options.until;
    }

    num = this.update(query, mods, {
      multi: true
    });
    restartIds = this._idsOfDeps(ids, options.antecedents, options.dependents, this.jobStatusRestartable);
    depsRestarted = false;

    if (restartIds.length > 0) {
      depsRestarted = this._DDPMethod_jobRestart(restartIds, options);
    }

    if (num > 0 || depsRestarted) {
      this._DDPMethod_jobReady(ids);

      return true;
    } else {
      console.warn("jobRestart failed");
    }

    return false;
  };

  JobCollectionBase.prototype._DDPMethod_jobSave = function (doc, options) {
    var logObj, mods, next, nextDate, num, ref, schedule, time;
    check(doc, _validJobDoc());
    check(options, Match.Optional({
      cancelRepeats: Match.Optional(Boolean)
    }));
    check(doc.status, Match.Where(function (v) {
      return Match.test(v, String) && (v === 'waiting' || v === 'paused');
    }));

    if (options == null) {
      options = {};
    }

    if (options.cancelRepeats == null) {
      options.cancelRepeats = false;
    }

    if (doc.repeats > this.forever) {
      doc.repeats = this.forever;
    }

    if (doc.retries > this.forever) {
      doc.retries = this.forever;
    }

    time = new Date();

    if (doc.after < time) {
      doc.after = time;
    }

    if (doc.retryUntil < time) {
      doc.retryUntil = time;
    }

    if (doc.repeatUntil < time) {
      doc.repeatUntil = time;
    }

    if (this.later != null && typeof doc.repeatWait !== 'number') {
      schedule = (ref = this.later) != null ? ref.schedule(doc.repeatWait) : void 0;

      if (!(schedule && (next = schedule.next(2, schedule.prev(1, doc.after))[1]))) {
        console.warn("No valid available later.js times in schedule after " + doc.after);
        return null;
      }

      nextDate = new Date(next);

      if (!(nextDate <= doc.repeatUntil)) {
        console.warn("No valid available later.js times in schedule before " + doc.repeatUntil);
        return null;
      }

      doc.after = nextDate;
    } else if (this.later == null && doc.repeatWait !== 'number') {
      console.warn("Later.js not loaded...");
      return null;
    }

    if (doc._id) {
      mods = {
        $set: {
          status: 'waiting',
          data: doc.data,
          retries: doc.retries,
          repeatRetries: doc.repeatRetries != null ? doc.repeatRetries : doc.retries + doc.retried,
          retryUntil: doc.retryUntil,
          retryWait: doc.retryWait,
          retryBackoff: doc.retryBackoff,
          repeats: doc.repeats,
          repeatUntil: doc.repeatUntil,
          repeatWait: doc.repeatWait,
          depends: doc.depends,
          priority: doc.priority,
          after: doc.after,
          updated: time
        }
      };

      if (logObj = this._logMessage.resubmitted()) {
        mods.$push = {
          log: logObj
        };
      }

      num = this.update({
        _id: doc._id,
        status: 'paused',
        runId: null
      }, mods);

      if (num && this._checkDeps(doc, false)) {
        this._DDPMethod_jobReady(doc._id);

        return doc._id;
      } else {
        return null;
      }
    } else {
      if (doc.repeats === this.forever && options.cancelRepeats) {
        this.find({
          type: doc.type,
          status: {
            $in: this.jobStatusCancellable
          }
        }, {
          transform: null
        }).forEach(function (_this) {
          return function (d) {
            return _this._DDPMethod_jobCancel(d._id, {});
          };
        }(this));
      }

      doc.created = time;
      doc.log.push(this._logMessage.submitted());
      doc._id = this.insert(doc);

      if (doc._id && this._checkDeps(doc, false)) {
        this._DDPMethod_jobReady(doc._id);

        return doc._id;
      } else {
        return null;
      }
    }
  };

  JobCollectionBase.prototype._DDPMethod_jobProgress = function (id, runId, completed, total, options) {
    var job, mods, num, progress, time;
    check(id, Match.Where(_validId));
    check(runId, Match.Where(_validId));
    check(completed, Match.Where(_validNumGTEZero));
    check(total, Match.Where(_validNumGTZero));
    check(options, Match.Optional({}));

    if (options == null) {
      options = {};
    }

    if (this.stopped) {
      return null;
    }

    progress = {
      completed: completed,
      total: total,
      percent: 100 * completed / total
    };
    check(progress, Match.Where(function (v) {
      var ref;
      return v.total >= v.completed && 0 <= (ref = v.percent) && ref <= 100;
    }));
    time = new Date();
    job = this.findOne({
      _id: id
    }, {
      fields: {
        workTimeout: 1
      }
    });
    mods = {
      $set: {
        progress: progress,
        updated: time
      }
    };

    if ((job != null ? job.workTimeout : void 0) != null) {
      mods.$set.expiresAfter = new Date(time.valueOf() + job.workTimeout);
    }

    num = this.update({
      _id: id,
      runId: runId,
      status: "running"
    }, mods);

    if (num === 1) {
      return true;
    } else {
      console.warn("jobProgress failed");
    }

    return false;
  };

  JobCollectionBase.prototype._DDPMethod_jobLog = function (id, runId, message, options) {
    var job, logObj, mods, num, ref, time;
    check(id, Match.Where(_validId));
    check(runId, Match.OneOf(Match.Where(_validId), null));
    check(message, String);
    check(options, Match.Optional({
      level: Match.Optional(Match.Where(_validLogLevel)),
      data: Match.Optional(Object)
    }));

    if (options == null) {
      options = {};
    }

    time = new Date();
    logObj = {
      time: time,
      runId: runId,
      level: (ref = options.level) != null ? ref : 'info',
      message: message
    };

    if (options.data != null) {
      logObj.data = options.data;
    }

    job = this.findOne({
      _id: id
    }, {
      fields: {
        status: 1,
        workTimeout: 1
      }
    });
    mods = {
      $push: {
        log: logObj
      },
      $set: {
        updated: time
      }
    };

    if ((job != null ? job.workTimeout : void 0) != null && job.status === 'running') {
      mods.$set.expiresAfter = new Date(time.valueOf() + job.workTimeout);
    }

    num = this.update({
      _id: id
    }, mods);

    if (num === 1) {
      return true;
    } else {
      console.warn("jobLog failed");
    }

    return false;
  };

  JobCollectionBase.prototype._DDPMethod_jobRerun = function (id, options) {
    var doc;
    check(id, Match.Where(_validId));
    check(options, Match.Optional({
      repeats: Match.Optional(Match.Where(_validIntGTEZero)),
      until: Match.Optional(Date),
      wait: Match.OneOf(Match.Where(_validIntGTEZero), Match.Where(_validLaterJSObj))
    }));
    doc = this.findOne({
      _id: id,
      status: "completed"
    }, {
      fields: {
        result: 0,
        failures: 0,
        log: 0,
        progress: 0,
        updated: 0,
        after: 0,
        status: 0
      },
      transform: null
    });

    if (doc != null) {
      if (options == null) {
        options = {};
      }

      if (options.repeats == null) {
        options.repeats = 0;
      }

      if (options.repeats > this.forever) {
        options.repeats = this.forever;
      }

      if (options.until == null) {
        options.until = doc.repeatUntil;
      }

      if (options.wait == null) {
        options.wait = 0;
      }

      return this._rerun_job(doc, options.repeats, options.wait, options.until);
    }

    return false;
  };

  JobCollectionBase.prototype._DDPMethod_jobDone = function (id, runId, result, options) {
    var after, d, doc, ids, jobId, logObj, mods, n, next, num, ref, time, wait;
    check(id, Match.Where(_validId));
    check(runId, Match.Where(_validId));
    check(result, Object);
    check(options, Match.Optional({
      repeatId: Match.Optional(Boolean),
      delayDeps: Match.Optional(Match.Where(_validIntGTEZero))
    }));

    if (options == null) {
      options = {
        repeatId: false
      };
    }

    time = new Date();
    doc = this.findOne({
      _id: id,
      runId: runId,
      status: "running"
    }, {
      fields: {
        log: 0,
        failures: 0,
        updated: 0,
        after: 0,
        status: 0
      },
      transform: null
    });

    if (doc == null) {
      if (!this.isSimulation) {
        console.warn("Running job not found", id, runId);
      }

      return false;
    }

    mods = {
      $set: {
        status: "completed",
        result: result,
        progress: {
          completed: doc.progress.total || 1,
          total: doc.progress.total || 1,
          percent: 100
        },
        updated: time
      }
    };

    if (logObj = this._logMessage.completed(runId)) {
      mods.$push = {
        log: logObj
      };
    }

    num = this.update({
      _id: id,
      runId: runId,
      status: "running"
    }, mods);

    if (num === 1) {
      if (doc.repeats > 0) {
        if (typeof doc.repeatWait === 'number') {
          if (doc.repeatUntil - doc.repeatWait >= time) {
            jobId = this._rerun_job(doc);
          }
        } else {
          next = (ref = this.later) != null ? ref.schedule(doc.repeatWait).next(2) : void 0;

          if (next && next.length > 0) {
            d = new Date(next[0]);

            if (d - time > 500 || next.length > 1) {
              if (d - time <= 500) {
                d = new Date(next[1]);
              }

              wait = d - time;

              if (doc.repeatUntil - wait >= time) {
                jobId = this._rerun_job(doc, doc.repeats - 1, wait);
              }
            }
          }
        }
      }

      ids = this.find({
        depends: {
          $all: [id]
        }
      }, {
        transform: null,
        fields: {
          _id: 1
        }
      }).fetch().map(function (_this) {
        return function (d) {
          return d._id;
        };
      }(this));

      if (ids.length > 0) {
        mods = {
          $pull: {
            depends: id
          },
          $push: {
            resolved: id
          }
        };

        if (options.delayDeps != null) {
          after = new Date(time.valueOf() + options.delayDeps);
          mods.$max = {
            after: after
          };
        }

        if (logObj = this._logMessage.resolved(id, runId)) {
          mods.$push.log = logObj;
        }

        n = this.update({
          _id: {
            $in: ids
          }
        }, mods, {
          multi: true
        });

        if (n !== ids.length) {
          console.warn("Not all dependent jobs were resolved " + ids.length + " > " + n);
        }

        this._DDPMethod_jobReady(ids);
      }

      if (options.repeatId && jobId != null) {
        return jobId;
      } else {
        return true;
      }
    } else {
      console.warn("jobDone failed");
    }

    return false;
  };

  JobCollectionBase.prototype._DDPMethod_jobFail = function (id, runId, err, options) {
    var after, doc, logObj, mods, newStatus, num, time;
    check(id, Match.Where(_validId));
    check(runId, Match.Where(_validId));
    check(err, Object);
    check(options, Match.Optional({
      fatal: Match.Optional(Boolean)
    }));

    if (options == null) {
      options = {};
    }

    if (options.fatal == null) {
      options.fatal = false;
    }

    time = new Date();
    doc = this.findOne({
      _id: id,
      runId: runId,
      status: "running"
    }, {
      fields: {
        log: 0,
        failures: 0,
        progress: 0,
        updated: 0,
        after: 0,
        runId: 0,
        status: 0
      },
      transform: null
    });

    if (doc == null) {
      if (!this.isSimulation) {
        console.warn("Running job not found", id, runId);
      }

      return false;
    }

    after = function () {
      switch (doc.retryBackoff) {
        case 'exponential':
          return new Date(time.valueOf() + doc.retryWait * Math.pow(2, doc.retried - 1));

        default:
          return new Date(time.valueOf() + doc.retryWait);
      }
    }();

    newStatus = !options.fatal && doc.retries > 0 && doc.retryUntil >= after ? "waiting" : "failed";
    err.runId = runId;
    mods = {
      $set: {
        status: newStatus,
        runId: null,
        after: after,
        updated: time
      },
      $push: {
        failures: err
      }
    };

    if (logObj = this._logMessage.failed(runId, newStatus === 'failed', err)) {
      mods.$push.log = logObj;
    }

    num = this.update({
      _id: id,
      runId: runId,
      status: "running"
    }, mods);

    if (newStatus === "failed" && num === 1) {
      this.find({
        depends: {
          $all: [id]
        }
      }, {
        transform: null
      }).forEach(function (_this) {
        return function (d) {
          return _this._DDPMethod_jobCancel(d._id);
        };
      }(this));
    }

    if (num === 1) {
      return true;
    } else {
      console.warn("jobFail failed");
    }

    return false;
  };

  return JobCollectionBase;
}(Mongo.Collection);

share.JobCollectionBase = JobCollectionBase;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/vsivsi_job-collection/src/server.coffee.js                                                                //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var eventEmitter,
    userHelper,
    bind = function (fn, me) {
  return function () {
    return fn.apply(me, arguments);
  };
},
    extend = function (child, parent) {
  for (var key in meteorBabelHelpers.sanitizeForInObject(parent)) {
    if (hasProp.call(parent, key)) child[key] = parent[key];
  }

  function ctor() {
    this.constructor = child;
  }

  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
  child.__super__ = parent.prototype;
  return child;
},
    hasProp = {}.hasOwnProperty,
    slice = [].slice,
    indexOf = [].indexOf || function (item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (i in this && this[i] === item) return i;
  }

  return -1;
};

if (Meteor.isServer) {
  eventEmitter = Npm.require('events').EventEmitter;

  userHelper = function (user, connection) {
    var ret;
    ret = user != null ? user : "[UNAUTHENTICATED]";

    if (!connection) {
      ret = "[SERVER]";
    }

    return ret;
  };

  JobCollection = function (superClass) {
    extend(JobCollection, superClass);

    function JobCollection(root, options) {
      var foo, i, len, level, localMethods, methodFunction, methodName, ref;

      if (root == null) {
        root = 'queue';
      }

      if (options == null) {
        options = {};
      }

      this._emit = bind(this._emit, this);
      this._toLog = bind(this._toLog, this);
      this._onCall = bind(this._onCall, this);
      this._onError = bind(this._onError, this);

      if (!(this instanceof JobCollection)) {
        return new JobCollection(root, options);
      }

      JobCollection.__super__.constructor.call(this, root, options);

      this.events = new eventEmitter();
      this._errorListener = this.events.on('error', this._onError);
      this._methodErrorDispatch = this.events.on('error', function (_this) {
        return function (msg) {
          return _this.events.emit(msg.method, msg);
        };
      }(this));
      this._callListener = this.events.on('call', this._onCall);
      this._methodEventDispatch = this.events.on('call', function (_this) {
        return function (msg) {
          return _this.events.emit(msg.method, msg);
        };
      }(this));
      this.stopped = true;

      share.JobCollectionBase.__super__.deny.bind(this)({
        update: function (_this) {
          return function () {
            return true;
          };
        }(this),
        insert: function (_this) {
          return function () {
            return true;
          };
        }(this),
        remove: function (_this) {
          return function () {
            return true;
          };
        }(this)
      });

      this.promote();
      this.logStream = null;
      this.allows = {};
      this.denys = {};
      ref = this.ddpPermissionLevels.concat(this.ddpMethods);

      for (i = 0, len = ref.length; i < len; i++) {
        level = ref[i];
        this.allows[level] = [];
        this.denys[level] = [];
      }

      if (options.connection == null) {
        this._ensureIndex({
          type: 1,
          status: 1
        });

        this._ensureIndex({
          priority: 1,
          retryUntil: 1,
          after: 1
        });

        this.isSimulation = false;
        localMethods = this._generateMethods();

        if (this._localServerMethods == null) {
          this._localServerMethods = {};
        }

        for (methodName in meteorBabelHelpers.sanitizeForInObject(localMethods)) {
          methodFunction = localMethods[methodName];
          this._localServerMethods[methodName] = methodFunction;
        }

        foo = this;

        this._ddp_apply = function (_this) {
          return function (name, params, cb) {
            if (cb != null) {
              return Meteor.setTimeout(function () {
                var e, err, res;
                err = null;
                res = null;

                try {
                  res = _this._localServerMethods[name].apply(_this, params);
                } catch (error) {
                  e = error;
                  err = e;
                }

                return cb(err, res);
              }, 0);
            } else {
              return _this._localServerMethods[name].apply(_this, params);
            }
          };
        }(this);

        Job._setDDPApply(this._ddp_apply, root);

        Meteor.methods(localMethods);
      }
    }

    JobCollection.prototype._onError = function (msg) {
      var user;
      user = userHelper(msg.userId, msg.connection);
      return this._toLog(user, msg.method, "" + msg.error);
    };

    JobCollection.prototype._onCall = function (msg) {
      var user;
      user = userHelper(msg.userId, msg.connection);

      this._toLog(user, msg.method, "params: " + JSON.stringify(msg.params));

      return this._toLog(user, msg.method, "returned: " + JSON.stringify(msg.returnVal));
    };

    JobCollection.prototype._toLog = function (userId, method, message) {
      var ref;
      return (ref = this.logStream) != null ? ref.write(new Date() + ", " + userId + ", " + method + ", " + message + "\n") : void 0;
    };

    JobCollection.prototype._emit = function () {
      var connection, err, method, params, ret, userId;
      method = arguments[0], connection = arguments[1], userId = arguments[2], err = arguments[3], ret = arguments[4], params = 6 <= arguments.length ? slice.call(arguments, 5) : [];

      if (err) {
        return this.events.emit('error', {
          error: err,
          method: method,
          connection: connection,
          userId: userId,
          params: params,
          returnVal: null
        });
      } else {
        return this.events.emit('call', {
          error: null,
          method: method,
          connection: connection,
          userId: userId,
          params: params,
          returnVal: ret
        });
      }
    };

    JobCollection.prototype._methodWrapper = function (method, func) {
      var myTypeof, permitted, self;
      self = this;

      myTypeof = function (val) {
        var type;
        type = typeof val === "undefined" ? "undefined" : _typeof(val);

        if (type === 'object' && type instanceof Array) {
          type = 'array';
        }

        return type;
      };

      permitted = function (_this) {
        return function (userId, params) {
          var performAllTests, performTest;

          performTest = function (tests) {
            var i, len, result, test;
            result = false;

            for (i = 0, len = tests.length; i < len; i++) {
              test = tests[i];

              if (result === false) {
                result = result || function () {
                  switch (myTypeof(test)) {
                    case 'array':
                      return indexOf.call(test, userId) >= 0;

                    case 'function':
                      return test(userId, method, params);

                    default:
                      return false;
                  }
                }();
              }
            }

            return result;
          };

          performAllTests = function (allTests) {
            var i, len, ref, result, t;
            result = false;
            ref = _this.ddpMethodPermissions[method];

            for (i = 0, len = ref.length; i < len; i++) {
              t = ref[i];

              if (result === false) {
                result = result || performTest(allTests[t]);
              }
            }

            return result;
          };

          return !performAllTests(_this.denys) && performAllTests(_this.allows);
        };
      }(this);

      return function () {
        var err, params, retval;
        params = 1 <= arguments.length ? slice.call(arguments, 0) : [];

        try {
          if (!(this.connection && !permitted(this.userId, params))) {
            retval = func.apply(null, params);
          } else {
            err = new Meteor.Error(403, "Method not authorized", "Authenticated user is not permitted to invoke this method.");
            throw err;
          }
        } catch (error) {
          err = error;

          self._emit(method, this.connection, this.userId, err);

          throw err;
        }

        self._emit.apply(self, [method, this.connection, this.userId, null, retval].concat(slice.call(params)));

        return retval;
      };
    };

    JobCollection.prototype.setLogStream = function (writeStream) {
      if (writeStream == null) {
        writeStream = null;
      }

      if (this.logStream) {
        throw new Error("logStream may only be set once per job-collection startup/shutdown cycle");
      }

      this.logStream = writeStream;

      if (!(this.logStream == null || this.logStream.write != null && typeof this.logStream.write === 'function' && this.logStream.end != null && typeof this.logStream.end === 'function')) {
        throw new Error("logStream must be a valid writable node.js Stream");
      }
    };

    JobCollection.prototype.allow = function (allowOptions) {
      var func, results, type;
      results = [];

      for (type in meteorBabelHelpers.sanitizeForInObject(allowOptions)) {
        func = allowOptions[type];

        if (type in this.allows) {
          results.push(this.allows[type].push(func));
        }
      }

      return results;
    };

    JobCollection.prototype.deny = function (denyOptions) {
      var func, results, type;
      results = [];

      for (type in meteorBabelHelpers.sanitizeForInObject(denyOptions)) {
        func = denyOptions[type];

        if (type in this.denys) {
          results.push(this.denys[type].push(func));
        }
      }

      return results;
    };

    JobCollection.prototype.scrub = function (job) {
      return job;
    };

    JobCollection.prototype.promote = function (milliseconds) {
      if (milliseconds == null) {
        milliseconds = 15 * 1000;
      }

      if (typeof milliseconds === 'number' && milliseconds > 0) {
        if (this.interval) {
          Meteor.clearInterval(this.interval);
        }

        this._promote_jobs();

        return this.interval = Meteor.setInterval(this._promote_jobs.bind(this), milliseconds);
      } else {
        return console.warn("jobCollection.promote: invalid timeout: " + this.root + ", " + milliseconds);
      }
    };

    JobCollection.prototype._promote_jobs = function (ids) {
      if (ids == null) {
        ids = [];
      }

      if (this.stopped) {
        return;
      }

      this.find({
        status: 'running',
        expiresAfter: {
          $lt: new Date()
        }
      }).forEach(function (_this) {
        return function (job) {
          return new Job(_this.root, job).fail("Failed for exceeding worker set workTimeout");
        };
      }(this));
      return this.readyJobs();
    };

    return JobCollection;
  }(share.JobCollectionBase);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['vsivsi:job-collection'] = {}, {
  Job: Job,
  JobCollection: JobCollection
});

})();

//# sourceURL=meteor://💻app/packages/vsivsi_job-collection.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvdnNpdnNpX2pvYi1jb2xsZWN0aW9uL2pvYi9zcmMvam9iX2NsYXNzLmNvZmZlZSIsIm1ldGVvcjovL/CfkrthcHAvam9iL3NyYy9qb2JfY2xhc3MuY29mZmVlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy92c2l2c2lfam9iLWNvbGxlY3Rpb24vc3JjL3NoYXJlZC5jb2ZmZWUiLCJtZXRlb3I6Ly/wn5K7YXBwL3NyYy9zaGFyZWQuY29mZmVlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy92c2l2c2lfam9iLWNvbGxlY3Rpb24vc3JjL3NlcnZlci5jb2ZmZWUiLCJtZXRlb3I6Ly/wn5K7YXBwL3NyYy9zZXJ2ZXIuY29mZmVlLmpzIl0sIm5hbWVzIjpbIkpvYlF1ZXVlIiwiX2NsZWFySW50ZXJ2YWwiLCJfc2V0SW1tZWRpYXRlIiwiX3NldEludGVydmFsIiwiY29uY2F0UmVkdWNlIiwiaXNCb29sZWFuIiwiaXNGdW5jdGlvbiIsImlzSW50ZWdlciIsImlzTm9uRW1wdHlTdHJpbmciLCJpc05vbkVtcHR5U3RyaW5nT3JBcnJheU9mTm9uRW1wdHlTdHJpbmdzIiwibWV0aG9kQ2FsbCIsIm9wdGlvbnNIZWxwIiwicmVkdWNlQ2FsbGJhY2tzIiwic3BsaXRMb25nQXJyYXkiLCJzbGljZSIsImluZGV4T2YiLCJpdGVtIiwiaSIsImwiLCJsZW5ndGgiLCJyb290IiwibWV0aG9kIiwicGFyYW1zIiwiY2IiLCJhZnRlciIsImFwcGx5IiwibmFtZSIsInJlZiIsInJlZjEiLCJyZWYyIiwicmVmMyIsInJldCIsIkpvYiIsIl9kZHBfYXBwbHkiLCJFcnJvciIsIl90aGlzIiwiZXJyIiwicmVzIiwib3B0aW9ucyIsIkFycmF5IiwiYXJyIiwibWF4IiwiayIsInJlc3VsdHMiLCJNYXRoIiwiY2VpbCIsInB1c2giLCJudW0iLCJyZWR1Y2UiLCJpbml0IiwiY2JDb3VudCIsImNiRXJyIiwiY2JSZXRWYWwiLCJhIiwiYiIsImNvbmNhdCIsImZsb29yIiwiZiIsInMiLCJzYSIsImxlbiIsImFyZ3MiLCJmdW5jIiwiYXJndW1lbnRzIiwiY2FsbCIsIk1ldGVvciIsInNldFRpbWVvdXQiLCJzZXRJbW1lZGlhdGUiLCJ0aW1lT3V0Iiwic2V0SW50ZXJ2YWwiLCJpZCIsImNsZWFySW50ZXJ2YWwiLCJyZWY0Iiwicm9vdDEiLCJ0eXBlMSIsIndvcmtlciIsInR5cGUiLCJjdG9yIiwicHJvdG90eXBlIiwiY2hpbGQiLCJyZXN1bHQiLCJPYmplY3QiLCJlcnJvckNhbGxiYWNrIiwiZSIsImNvbnNvbGUiLCJlcnJvciIsInBvbGxJbnRlcnZhbCIsImZvcmV2ZXIiLCJjb25jdXJyZW5jeSIsInBheWxvYWQiLCJwcmVmZXRjaCIsIndvcmtUaW1lb3V0IiwiY2FsbGJhY2tTdHJpY3QiLCJfd29ya2VycyIsIl90YXNrcyIsIl90YXNrTnVtYmVyIiwiX3N0b3BwaW5nR2V0V29yayIsIl9zdG9wcGluZ1Rhc2tzIiwiX2ludGVydmFsIiwiX2dldFdvcmtPdXRzdGFuZGluZyIsInBhdXNlZCIsInJlc3VtZSIsIl9nZXRXb3JrIiwibnVtSm9ic1RvR2V0IiwicnVubmluZyIsIm1heEpvYnMiLCJnZXRXb3JrIiwiam9icyIsImoiLCJfcHJvY2VzcyIsImJpbmQiLCJfb25seV9vbmNlIiwiZm4iLCJjYWxsZWQiLCJqb2IiLCJuZXh0Iiwic3BsaWNlIiwic2hpZnQiLCJfdGFza0lkIiwiX3N0b3BHZXRXb3JrIiwiY2FsbGJhY2siLCJfd2FpdEZvclRhc2tzIiwiX2ZhaWxKb2JzIiwidGFza3MiLCJjb3VudCIsImZhaWwiLCJfaGFyZCIsInIiLCJfc3RvcCIsIl9zb2Z0Iiwia2V5cyIsImlkbGUiLCJmdWxsIiwicGF1c2UiLCJ3IiwidHJpZ2dlciIsInNodXRkb3duIiwibGV2ZWwiLCJxdWlldCIsIndhcm4iLCJmb3JldmVyRGF0ZSIsIkRhdGUiLCJqb2JQcmlvcml0aWVzIiwibG93Iiwibm9ybWFsIiwibWVkaXVtIiwiaGlnaCIsImNyaXRpY2FsIiwiam9iUmV0cnlCYWNrb2ZmTWV0aG9kcyIsImpvYlN0YXR1c2VzIiwiam9iTG9nTGV2ZWxzIiwiam9iU3RhdHVzQ2FuY2VsbGFibGUiLCJqb2JTdGF0dXNQYXVzYWJsZSIsImpvYlN0YXR1c1JlbW92YWJsZSIsImpvYlN0YXR1c1Jlc3RhcnRhYmxlIiwiZGRwTWV0aG9kcyIsImRkcFBlcm1pc3Npb25MZXZlbHMiLCJkZHBNZXRob2RQZXJtaXNzaW9ucyIsIl9zZXRERFBBcHBseSIsImNvbGxlY3Rpb25OYW1lIiwic2V0RERQIiwiZGRwIiwiY29sbGVjdGlvbk5hbWVzIiwiRmliZXIiLCJjb2xsTmFtZSIsImNsb3NlIiwic3Vic2NyaWJlIiwib2JzZXJ2ZSIsImZpYiIsImN1cnJlbnQiLCJ0aHJvd0ludG8iLCJydW4iLCJkb2MiLCJwcm9jZXNzSm9icyIsIm1ha2VKb2IiLCJkZXBGbGFnIiwiZ2V0Sm9iIiwiZ2V0TG9nIiwiZ2V0Sm9icyIsImNodW5rT2ZJZHMiLCJjaHVua3NPZklkcyIsImlkcyIsIm15Q2IiLCJyZXRWYWwiLCJkIiwibGVuMSIsIm0iLCJkYXRhIiwicGF1c2VKb2JzIiwicmVzdW1lSm9icyIsInJlYWR5Sm9icyIsImZvcmNlIiwiY2FuY2VsSm9icyIsImFudGVjZWRlbnRzIiwicmVzdGFydEpvYnMiLCJyZXRyaWVzIiwiZGVwZW5kZW50cyIsInJlbW92ZUpvYnMiLCJzdGFydEpvYnMiLCJzdG9wSm9icyIsInRpbWVvdXQiLCJzdGFydEpvYlNlcnZlciIsInNodXRkb3duSm9iU2VydmVyIiwicm9vdFZhbCIsInRpbWUiLCJfcm9vdCIsIl9kb2MiLCJydW5JZCIsInN0YXR1cyIsInVwZGF0ZWQiLCJjcmVhdGVkIiwicHJpb3JpdHkiLCJyZXRyeSIsInJlcGVhdCIsInByb2dyZXNzIiwiZGVwZW5kcyIsImxvZyIsIl9lY2hvIiwibWVzc2FnZSIsImluZm8iLCJfaWQiLCJyZXNvbHZlZCIsImJhc2UiLCJ1bnRpbCIsIndhaXQiLCJiYWNrb2ZmIiwicmVwZWF0UmV0cmllcyIsInJldHJ5V2FpdCIsInJldHJpZWQiLCJyZXRyeUJhY2tvZmYiLCJyZXRyeVVudGlsIiwicmVwZWF0cyIsInNjaGVkdWxlIiwic2NoZWR1bGVzIiwiZXhjZXB0aW9ucyIsInJlcGVhdFdhaXQiLCJyZXBlYXRlZCIsInJlcGVhdFVudGlsIiwiZGVsYXkiLCJ2YWx1ZU9mIiwiZWNobyIsImNvbXBsZXRlZCIsInRvdGFsIiwicGVyY2VudCIsInNhdmUiLCJyZWZyZXNoIiwiZG9uZSIsInZhbHVlIiwiZmF0YWwiLCJyZWFkeSIsImNhbmNlbCIsInJlc3RhcnQiLCJyZXJ1biIsInJlbW92ZSIsImRlZmluZVByb3BlcnRpZXMiLCJnZXQiLCJzZXQiLCJtb2R1bGUiLCJleHBvcnRzIiwiSm9iQ29sbGVjdGlvbkJhc2UiLCJfdmFsaWRJZCIsIl92YWxpZEludEdURU9uZSIsIl92YWxpZEludEdURVplcm8iLCJfdmFsaWRKb2JEb2MiLCJfdmFsaWRMYXRlckpTT2JqIiwiX3ZhbGlkTG9nIiwiX3ZhbGlkTG9nTGV2ZWwiLCJfdmFsaWROdW1HVEVPbmUiLCJfdmFsaWROdW1HVEVaZXJvIiwiX3ZhbGlkTnVtR1RaZXJvIiwiX3ZhbGlkUHJvZ3Jlc3MiLCJfdmFsaWRSZXRyeUJhY2tvZmYiLCJfdmFsaWRTdGF0dXMiLCJleHRlbmQiLCJwYXJlbnQiLCJrZXkiLCJoYXNQcm9wIiwiY29uc3RydWN0b3IiLCJfX3N1cGVyX18iLCJoYXNPd25Qcm9wZXJ0eSIsInYiLCJNYXRjaCIsInRlc3QiLCJOdW1iZXIiLCJTdHJpbmciLCJPbmVPZiIsIk1vbmdvIiwiQ29sbGVjdGlvbiIsIk9iamVjdElEIiwiV2hlcmUiLCJPcHRpb25hbCIsImZhaWx1cmVzIiwiSW50ZWdlciIsImV4cGlyZXNBZnRlciIsInN1cGVyQ2xhc3MiLCJsYXRlciIsIm5vQ29sbGVjdGlvblN1ZmZpeCIsImNvbm5lY3Rpb24iLCJfY3JlYXRlTG9nRW50cnkiLCJfbG9nTWVzc2FnZSIsInByZXZpb3VzSm9iIiwiZGVwZW5kZW5jeSIsIm1zZyIsImpvYkRvY1BhdHRlcm4iLCJhbGxvdyIsImRlbnkiLCJwcm9tb3RlIiwic2V0TG9nU3RyZWFtIiwibG9nQ29uc29sZSIsImRlcCIsImNyZWF0ZUpvYiIsIl9tZXRob2RXcmFwcGVyIiwidG9Mb2ciLCJ1bmJsb2NrRERQTWV0aG9kcyIsIl90b0xvZyIsIl91bmJsb2NrRERQTWV0aG9kcyIsInJldHZhbCIsInVzZXIiLCJ1c2VySWQiLCJKU09OIiwic3RyaW5naWZ5IiwidW5ibG9jayIsIl9nZW5lcmF0ZU1ldGhvZHMiLCJiYXNlTWV0aG9kTmFtZSIsIm1ldGhvZEZ1bmMiLCJtZXRob2ROYW1lIiwibWV0aG9kUHJlZml4IiwibWV0aG9kc091dCIsIl9pZHNPZkRlcHMiLCJhbnRzQXJyYXkiLCJkZXBlbmRzSWRzIiwiZGVwZW5kc1F1ZXJ5IiwiJGVsZW1NYXRjaCIsIiRpbiIsImZpbmQiLCJmaWVsZHMiLCJ0cmFuc2Zvcm0iLCJmb3JFYWNoIiwiJG9yIiwiX3JlcnVuX2pvYiIsImpvYklkIiwibG9nT2JqIiwiaW5zZXJ0IiwiX0REUE1ldGhvZF9qb2JSZWFkeSIsIl9jaGVja0RlcHMiLCJkcnlSdW4iLCJjYW5jZWxsZWQiLCJkZXBKb2IiLCJkZXBzIiwiZmFpbGVkIiwiZm91bmRJZHMiLCJtb2RzIiwibiIsInJlbW92ZWQiLCJmZXRjaCIsIm1hcCIsIl9ERFBNZXRob2Rfam9iTG9nIiwiJHB1bGwiLCIkcHVzaCIsIiRlYWNoIiwidXBkYXRlIiwiX0REUE1ldGhvZF9qb2JDYW5jZWwiLCJfRERQTWV0aG9kX3N0YXJ0Sm9iU2VydmVyIiwiY2hlY2siLCJpc1NpbXVsYXRpb24iLCJzdG9wcGVkIiwiY2xlYXJUaW1lb3V0IiwiX0REUE1ldGhvZF9zdGFydEpvYnMiLCJfRERQTWV0aG9kX3NodXRkb3duSm9iU2VydmVyIiwiY3Vyc29yIiwiZmFpbGVkSm9icyIsIl9ERFBNZXRob2Rfam9iRmFpbCIsImxvZ1N0cmVhbSIsImVuZCIsIl9ERFBNZXRob2Rfc3RvcEpvYnMiLCJfRERQTWV0aG9kX2dldEpvYiIsImRvY3MiLCJzaW5nbGUiLCJCb29sZWFuIiwiZ2V0RmFpbHVyZXMiLCJfcHJpdmF0ZSIsInNjcnViIiwiX0REUE1ldGhvZF9nZXRXb3JrIiwiZm91bmREb2NzIiwiX21ha2VOZXdJRCIsInNvcnQiLCJsaW1pdCIsIiRzZXQiLCIkaW5jIiwiJHVuc2V0IiwibXVsdGkiLCJfRERQTWV0aG9kX2pvYlJlbW92ZSIsIl9ERFBNZXRob2Rfam9iUGF1c2UiLCJfRERQTWV0aG9kX2pvYlJlc3VtZSIsInJlc3VtZWQiLCIkbmUiLCJub3ciLCJxdWVyeSIsIiRsdGUiLCJmb3JjZWQiLCIkc2l6ZSIsInJlYWRpZWQiLCJjYW5jZWxJZHMiLCJkZXBzQ2FuY2VsbGVkIiwiX0REUE1ldGhvZF9qb2JSZXN0YXJ0IiwiZGVwc1Jlc3RhcnRlZCIsInJlc3RhcnRJZHMiLCJyZXN0YXJ0ZWQiLCJfRERQTWV0aG9kX2pvYlNhdmUiLCJuZXh0RGF0ZSIsImNhbmNlbFJlcGVhdHMiLCJwcmV2IiwicmVzdWJtaXR0ZWQiLCJzdWJtaXR0ZWQiLCJfRERQTWV0aG9kX2pvYlByb2dyZXNzIiwiZmluZE9uZSIsIl9ERFBNZXRob2Rfam9iUmVydW4iLCJfRERQTWV0aG9kX2pvYkRvbmUiLCJyZXBlYXRJZCIsImRlbGF5RGVwcyIsIiRhbGwiLCIkbWF4IiwibmV3U3RhdHVzIiwicG93Iiwic2hhcmUiLCJldmVudEVtaXR0ZXIiLCJ1c2VySGVscGVyIiwibWUiLCJpc1NlcnZlciIsIk5wbSIsInJlcXVpcmUiLCJFdmVudEVtaXR0ZXIiLCJKb2JDb2xsZWN0aW9uIiwiZm9vIiwibG9jYWxNZXRob2RzIiwibWV0aG9kRnVuY3Rpb24iLCJfZW1pdCIsIl9vbkNhbGwiLCJfb25FcnJvciIsImV2ZW50cyIsIl9lcnJvckxpc3RlbmVyIiwib24iLCJfbWV0aG9kRXJyb3JEaXNwYXRjaCIsImVtaXQiLCJfY2FsbExpc3RlbmVyIiwiX21ldGhvZEV2ZW50RGlzcGF0Y2giLCJhbGxvd3MiLCJkZW55cyIsIl9lbnN1cmVJbmRleCIsIl9sb2NhbFNlcnZlck1ldGhvZHMiLCJtZXRob2RzIiwicmV0dXJuVmFsIiwid3JpdGUiLCJteVR5cGVvZiIsInBlcm1pdHRlZCIsInNlbGYiLCJ2YWwiLCJwZXJmb3JtQWxsVGVzdHMiLCJwZXJmb3JtVGVzdCIsInRlc3RzIiwiYWxsVGVzdHMiLCJ0Iiwid3JpdGVTdHJlYW0iLCJhbGxvd09wdGlvbnMiLCJkZW55T3B0aW9ucyIsIm1pbGxpc2Vjb25kcyIsImludGVydmFsIiwiX3Byb21vdGVfam9icyIsIiRsdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVFBLElBQUFBLFFBQUE7QUFBQSxJQUFBQyxjQUFBO0FBQUEsSUFBQUMsYUFBQTtBQUFBLElBQUFDLFlBQUE7QUFBQSxJQUFBQyxZQUFBO0FBQUEsSUFBQUMsU0FBQTtBQUFBLElBQUFDLFVBQUE7QUFBQSxJQUFBQyxTQUFBO0FBQUEsSUFBQUMsZ0JBQUE7QUFBQSxJQUFBQyx3Q0FBQTtBQUFBLElBQUFDLFVBQUE7QUFBQSxJQUFBQyxXQUFBO0FBQUEsSUFBQUMsZUFBQTtBQUFBLElBQUFDLGNBQUE7QUFBQSxJQUFBQyxRQUFBLEdBQUFBLEtBQUE7QUFBQSxJQ05FQyxVQUFVLEdBQUdBLE9BQUgsSUFBYyxVQUFTQyxJQUFULEVBQWU7QUFBRSxPQUFLLElBQUlDLElBQUksQ0FBUixFQUFXQyxJQUFJLEtBQUtDLE1BQXpCLEVBQWlDRixJQUFJQyxDQUFyQyxFQUF3Q0QsR0FBeEMsRUFBNkM7QUFBRSxRQUFJQSxLQUFLLElBQUwsSUFBYSxLQUFLQSxDQUFMLE1BQVlELElBQTdCLEVBQW1DLE9BQU9DLENBQVA7QUFBVzs7QUFBQyxTQUFPLENBQUMsQ0FBUjtBQUFZLENETXJKOztBQUFBUCxhQUFhLFVBQUNVLElBQUQsRUFBT0MsTUFBUCxFQUFlQyxNQUFmLEVBQXVCQyxFQUF2QixFQUEyQkMsS0FBM0I7QUFDWCxNQUFBQyxLQUFBLEVBQUFDLElBQUEsRUFBQUMsR0FBQSxFQUFBQyxJQUFBLEVBQUFDLElBQUEsRUFBQUMsSUFBQTs7QUNIQSxNQUFJTixTQUFTLElB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Y0NxRmhCO0FBRUFQLG9CQUFrQnJMLFNBQWxCLENEdEZBaU0sa0JDc0ZBLEdEdEZvQkEsa0JDc0ZwQjtBQUVBWixvQkFBa0JyTCxTQUFsQixDRHZGQXNMLFFDdUZBLEdEdkZVQSxRQ3VGVjtBQUVBRCxvQkFBa0JyTCxTQUFsQixDRHhGQTJMLFNDd0ZBLEdEeEZXQSxTQ3dGWDtBQUVBTixvQkFBa0JyTCxTQUFsQixDRHpGQWdNLGNDeUZBLEdEekZnQkEsY0N5RmhCO0FBRUFYLG9CQUFrQnJMLFNBQWxCLENEMUZBeUwsWUMwRkEsR0QxRmNBLFlDMEZkO0FBRUFKLG9CQUFrQnJMLFNBQWxCLENEMUZBd0UsWUMwRkEsR0QxRmN0SCxJQUFJc0gsWUMwRmxCO0FBRUE2RyxvQkFBa0JyTCxTQUFsQixDRDNGQWdFLGFDMkZBLEdEM0ZlOUcsSUFBSThHLGFDMkZuQjtBQUVBcUgsb0JBQWtCckwsU0FBbEIsQ0Q1RkF1RSxXQzRGQSxHRDVGYXJILElBQUlxSCxXQzRGakI7QUFFQThHLG9CQUFrQnJMLFNBQWxCLENEN0ZBeUUsb0JDNkZBLEdEN0ZzQnZILElBQUl1SCxvQkM2RjFCO0FBRUE0RyxvQkFBa0JyTCxTQUFsQixDRDlGQTBFLGlCQzhGQSxHRDlGbUJ4SCxJQUFJd0gsaUJDOEZ2QjtBQUVBMkcsb0JBQWtCckwsU0FBbEIsQ0QvRkEyRSxrQkMrRkEsR0QvRm9CekgsSUFBSXlILGtCQytGeEI7QUFFQTBHLG9CQUFrQnJMLFNBQWxCLENEaEdBNEUsb0JDZ0dBLEdEaEdzQjFILElBQUkwSCxvQkNnRzFCO0FBRUF5RyxvQkFBa0JyTCxTQUFsQixDRGpHQVMsT0NpR0EsR0RqR1N2RCxJQUFJdUQsT0NpR2I7QUFFQTRLLG9CQUFrQnJMLFNBQWxCLENEbEdBOEQsV0NrR0EsR0RsR2E1RyxJQUFJNEcsV0NrR2pCO0FBRUF1SCxvQkFBa0JyTCxTQUFsQixDRGxHQTZFLFVDa0dBLEdEbEdZM0gsSUFBSTJILFVDa0doQjtBQUVBd0csb0JBQWtCckwsU0FBbEIsQ0RuR0E4RSxtQkNtR0EsR0RuR3FCNUgsSUFBSTRILG1CQ21H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dEhhLEtDcUdmOztBQW9CQSxXQUFPa1AsYUFBUDtBQUVELEdEcFNLLENBQXNCUixNQUFNckssaUJBQTVCO0FDcVNQLEMiLCJmaWxlIjoiL3BhY2thZ2VzL3ZzaXZzaV9qb2ItY29sbGVjdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiMgICAgIENvcHlyaWdodCAoQykgMjAxNC0yMDE3IGJ5IFZhdWdobiBJdmVyc29uXG4jICAgICBtZXRlb3Itam9iLWNsYXNzIGlzIGZyZWUgc29mdHdhcmUgcmVsZWFzZWQgdW5kZXIgdGhlIE1JVC9YMTEgbGljZW5zZS5cbiMgICAgIFNlZSBpbmNsdWRlZCBMSUNFTlNFIGZpbGUgZm9yIGRldGFpbHMuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbiMgRXhwb3J0cyBKb2Igb2JqZWN0XG5cbm1ldGhvZENhbGwgPSAocm9vdCwgbWV0aG9kLCBwYXJhbXMsIGNiLCBhZnRlciA9ICgocmV0KSAtPiByZXQpKSAtPlxuICBhcHBseSA9IEpvYi5fZGRwX2FwcGx5P1tyb290LnJvb3QgPyByb290XSA/IEpvYi5fZGRwX2FwcGx5XG4gIHVubGVzcyB0eXBlb2YgYXBwbHkgaXMgJ2Z1bmN0aW9uJ1xuICAgICB0aHJvdyBuZXcgRXJyb3IgXCJKb2IgcmVtb3RlIG1ldGhvZCBjYWxsIGVycm9yLCBubyB2YWxpZCBpbnZvY2F0aW9uIG1ldGhvZCBmb3VuZC5cIlxuICBuYW1lID0gXCIje3Jvb3Qucm9vdCA/IHJvb3R9XyN7bWV0aG9kfVwiXG4gIGlmIGNiIGFuZCB0eXBlb2YgY2IgaXMgJ2Z1bmN0aW9uJ1xuICAgIGFwcGx5IG5hbWUsIHBhcmFtcywgKGVyciwgcmVzKSA9PlxuICAgICAgcmV0dXJuIGNiIGVyciBpZiBlcnJcbiAgICAgIGNiIG51bGwsIGFmdGVyKHJlcylcbiAgZWxzZVxuICAgIHJldHVybiBhZnRlcihhcHBseSBuYW1lLCBwYXJhbXMpXG5cbm9wdGlvbnNIZWxwID0gKG9wdGlvbnMsIGNiKSAtPlxuICAjIElmIGNiIGlzbid0IGEgZnVuY3Rpb24sIGl0J3MgYXNzdW1lZCB0byBiZSBvcHRpb25zLi4uXG4gIGlmIGNiPyBhbmQgdHlwZW9mIGNiIGlzbnQgJ2Z1bmN0aW9uJ1xuICAgIG9wdGlvbnMgPSBjYlxuICAgIGNiID0gdW5kZWZpbmVkXG4gIGVsc2VcbiAgICB1bmxlc3MgKHR5cGVvZiBvcHRpb25zIGlzICdvYmplY3QnIGFuZFxuICAgICAgICAgICAgb3B0aW9ucyBpbnN0YW5jZW9mIEFycmF5IGFuZFxuICAgICAgICAgICAgb3B0aW9ucy5sZW5ndGggPCAyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yICdvcHRpb25zLi4uIGluIG9wdGlvbnNIZWxwIG11c3QgYmUgYW4gQXJyYXkgd2l0aCB6ZXJvIG9yIG9uZSBlbGVtZW50cydcbiAgICBvcHRpb25zID0gb3B0aW9ucz9bMF0gPyB7fVxuICB1bmxlc3MgdHlwZW9mIG9wdGlvbnMgaXMgJ29iamVjdCdcbiAgICB0aHJvdyBuZXcgRXJyb3IgJ2luIG9wdGlvbnNIZWxwIG9wdGlvbnMgbm90IGFuIG9iamVjdCBvciBiYWQgY2FsbGJhY2snXG4gIHJldHVybiBbb3B0aW9ucywgY2JdXG5cbnNwbGl0TG9uZ0FycmF5ID0gKGFyciwgbWF4KSAtPlxuICB0aHJvdyBuZXcgRXJyb3IgJ3NwbGl0TG9uZ0FycmF5OiBiYWQgcGFyYW1zJyB1bmxlc3MgYXJyIGluc3RhbmNlb2YgQXJyYXkgYW5kIG1heCA+IDBcbiAgYXJyWyhpKm1heCkuLi4oKGkrMSkqbWF4KV0gZm9yIGkgaW4gWzAuLi5NYXRoLmNlaWwoYXJyLmxlbmd0aC9tYXgpXVxuXG4jIFRoaXMgZnVuY3Rpb24gc29ha3MgdXAgbnVtIGNhbGxiYWNrcywgYnkgZGVmYXVsdCByZXR1cm5pbmcgdGhlIGRpc2p1bmN0aW9uIG9mIEJvb2xlYW4gcmVzdWx0c1xuIyBvciByZXR1cm5pbmcgb24gZmlyc3QgZXJyb3IuLi4uIFJlZHVjZSBmdW5jdGlvbiBjYXVzZXMgZGlmZmVyZW50IHJlZHVjZSBiZWhhdmlvciwgc3VjaCBhcyBjb25jYXRlbmF0aW9uXG5yZWR1Y2VDYWxsYmFja3MgPSAoY2IsIG51bSwgcmVkdWNlID0gKChhICwgYikgLT4gKGEgb3IgYikpLCBpbml0ID0gZmFsc2UpIC0+XG4gIHJldHVybiB1bmRlZmluZWQgdW5sZXNzIGNiP1xuICB1bmxlc3MgdHlwZW9mIGNiIGlzICdmdW5jdGlvbicgYW5kIG51bSA+IDAgYW5kIHR5cGVvZiByZWR1Y2UgaXMgJ2Z1bmN0aW9uJ1xuICAgIHRocm93IG5ldyBFcnJvciAnQmFkIHBhcmFtcyBnaXZlbiB0byByZWR1Y2VDYWxsYmFja3MnXG4gIGNiUmV0VmFsID0gaW5pdFxuICBjYkNvdW50ID0gMFxuICBjYkVyciA9IG51bGxcbiAgcmV0dXJuIChlcnIsIHJlcykgLT5cbiAgICB1bmxlc3MgY2JFcnJcbiAgICAgIGlmIGVyclxuICAgICAgICBjYkVyciA9IGVyclxuICAgICAgICBjYiBlcnJcbiAgICAgIGVsc2VcbiAgICAgICAgY2JDb3VudCsrXG4gICAgICAgIGNiUmV0VmFsID0gcmVkdWNlIGNiUmV0VmFsLCByZXNcbiAgICAgICAgaWYgY2JDb3VudCBpcyBudW1cbiAgICAgICAgICBjYiBudWxsLCBjYlJldFZhbFxuICAgICAgICBlbHNlIGlmIGNiQ291bnQgPiBudW1cbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJyZWR1Y2VDYWxsYmFja3MgY2FsbGJhY2sgaW52b2tlZCBtb3JlIHRoYW4gcmVxdWVzdGVkICN7bnVtfSB0aW1lc1wiXG5cbmNvbmNhdFJlZHVjZSA9IChhLCBiKSAtPlxuICBhID0gW2FdIHVubGVzcyBhIGluc3RhbmNlb2YgQXJyYXlcbiAgYS5jb25jYXQgYlxuXG5pc0ludGVnZXIgPSAoaSkgLT4gdHlwZW9mIGkgaXMgJ251bWJlcicgYW5kIE1hdGguZmxvb3IoaSkgaXMgaVxuXG5pc0Jvb2xlYW4gPSAoYikgLT4gdHlwZW9mIGIgaXMgJ2Jvb2xlYW4nXG5cbmlzRnVuY3Rpb24gPSAoZikgLT4gdHlwZW9mIGYgaXMgJ2Z1bmN0aW9uJ1xuXG5pc05vbkVtcHR5U3RyaW5nID0gKHMpIC0+IHR5cGVvZiBzIGlzICdzdHJpbmcnIGFuZCBzLmxlbmd0aCA+IDBcblxuaXNOb25FbXB0eVN0cmluZ09yQXJyYXlPZk5vbkVtcHR5U3RyaW5ncyA9IChzYSkgLT5cbiAgIGlzTm9uRW1wdHlTdHJpbmcoc2EpIG9yXG4gICAgICBzYSBpbnN0YW5jZW9mIEFycmF5IGFuZFxuICAgICAgc2EubGVuZ3RoIGlzbnQgMCBhbmRcbiAgICAgIChzIGZvciBzIGluIHNhIHdoZW4gaXNOb25FbXB0eVN0cmluZyhzKSkubGVuZ3RoIGlzIHNhLmxlbmd0aFxuXG4jIFRoaXMgc21vb3RocyBvdmVyIHRoZSB2YXJpb3VzIGRpZmZlcmVudCBpbXBsZW1lbnRhdGlvbnMuLi5cbl9zZXRJbW1lZGlhdGUgPSAoZnVuYywgYXJncy4uLikgLT5cbiAgaWYgTWV0ZW9yPy5zZXRUaW1lb3V0P1xuICAgIHJldHVybiBNZXRlb3Iuc2V0VGltZW91dCBmdW5jLCAwLCBhcmdzLi4uXG4gIGVsc2UgaWYgc2V0SW1tZWRpYXRlP1xuICAgIHJldHVybiBzZXRJbW1lZGlhdGUgZnVuYywgYXJncy4uLlxuICBlbHNlXG4gICAgIyBCcm93c2VyIGZhbGxiYWNrXG4gICAgcmV0dXJuIHNldFRpbWVvdXQgZnVuYywgMCwgYXJncy4uLlxuXG5fc2V0SW50ZXJ2YWwgPSAoZnVuYywgdGltZU91dCwgYXJncy4uLikgLT5cbiAgaWYgTWV0ZW9yPy5zZXRJbnRlcnZhbD9cbiAgICByZXR1cm4gTWV0ZW9yLnNldEludGVydmFsIGZ1bmMsIHRpbWVPdXQsIGFyZ3MuLi5cbiAgZWxzZVxuICAgICMgQnJvd3NlciAvIG5vZGUuanMgZmFsbGJhY2tcbiAgICByZXR1cm4gc2V0SW50ZXJ2YWwgZnVuYywgdGltZU91dCwgYXJncy4uLlxuXG5fY2xlYXJJbnRlcnZhbCA9IChpZCkgLT5cbiAgaWYgTWV0ZW9yPy5jbGVhckludGVydmFsP1xuICAgIHJldHVybiBNZXRlb3IuY2xlYXJJbnRlcnZhbCBpZFxuICBlbHNlXG4gICAgIyBCcm93c2VyIC8gbm9kZS5qcyBmYWxsYmFja1xuICAgIHJldHVybiBjbGVhckludGVydmFsIGlkXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuY2xhc3MgSm9iUXVldWVcblxuICBjb25zdHJ1Y3RvcjogKEByb290LCBAdHlwZSwgb3B0aW9ucy4uLiwgQHdvcmtlcikgLT5cbiAgICB1bmxlc3MgQCBpbnN0YW5jZW9mIEpvYlF1ZXVlXG4gICAgICByZXR1cm4gbmV3IEpvYlF1ZXVlIEByb290LCBAdHlwZSwgb3B0aW9ucy4uLiwgQHdvcmtlclxuICAgIFtvcHRpb25zLCBAd29ya2VyXSA9IG9wdGlvbnNIZWxwIG9wdGlvbnMsIEB3b3JrZXJcblxuICAgIHVubGVzcyBpc05vbkVtcHR5U3RyaW5nKEByb290KVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSm9iUXVldWU6IEludmFsaWQgcm9vdCwgbXVzdCBiZSBub25lbXB0eSBzdHJpbmdcIilcblxuICAgIHVubGVzcyBpc05vbkVtcHR5U3RyaW5nT3JBcnJheU9mTm9uRW1wdHlTdHJpbmdzKEB0eXBlKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSm9iUXVldWU6IEludmFsaWQgdHlwZSwgbXVzdCBiZSBub25lbXB0eSBzdHJpbmcgb3IgYXJyYXkgb2Ygbm9uZW1wdHkgc3RyaW5nc1wiKVxuXG4gICAgdW5sZXNzIGlzRnVuY3Rpb24oQHdvcmtlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkpvYlF1ZXVlOiBJbnZhbGlkIHdvcmtlciwgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpXG5cbiAgICBAZXJyb3JDYWxsYmFjayA9IG9wdGlvbnMuZXJyb3JDYWxsYmFjayA/IChlKSAtPlxuICAgICAgY29uc29sZS5lcnJvciBcIkpvYlF1ZXVlOiBcIiwgZVxuICAgIHVubGVzcyBpc0Z1bmN0aW9uKEBlcnJvckNhbGxiYWNrKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSm9iUXVldWU6IEludmFsaWQgZXJyb3JDYWxsYmFjaywgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpXG5cbiAgICBAcG9sbEludGVydmFsID1cbiAgICAgIGlmIG9wdGlvbnMucG9sbEludGVydmFsPyBhbmQgbm90IG9wdGlvbnMucG9sbEludGVydmFsXG4gICAgICAgIEpvYi5mb3JldmVyXG4gICAgICBlbHNlIGlmIG5vdCAob3B0aW9ucy5wb2xsSW50ZXJ2YWw/IGFuZCBpc0ludGVnZXIob3B0aW9ucy5wb2xsSW50ZXJ2YWwpKVxuICAgICAgICA1MDAwICAjIG1zXG4gICAgICBlbHNlXG4gICAgICAgIG9wdGlvbnMucG9sbEludGVydmFsXG4gICAgdW5sZXNzIGlzSW50ZWdlcihAcG9sbEludGVydmFsKSBhbmQgQHBvbGxJbnRlcnZhbCA+PSAwXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJKb2JRdWV1ZTogSW52YWxpZCBwb2xsSW50ZXJ2YWwsIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyXCJcblxuICAgIEBjb25jdXJyZW5jeSA9IG9wdGlvbnMuY29uY3VycmVuY3kgPyAxXG4gICAgdW5sZXNzIGlzSW50ZWdlcihAY29uY3VycmVuY3kpIGFuZCBAY29uY3VycmVuY3kgPj0gMFxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiSm9iUXVldWU6IEludmFsaWQgY29uY3VycmVuY3ksIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyXCJcblxuICAgIEBwYXlsb2FkID0gb3B0aW9ucy5wYXlsb2FkID8gMVxuICAgIHVubGVzcyBpc0ludGVnZXIoQHBheWxvYWQpIGFuZCBAcGF5bG9hZCA+PSAwXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJKb2JRdWV1ZTogSW52YWxpZCBwYXlsb2FkLCBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlclwiXG5cbiAgICBAcHJlZmV0Y2ggPSBvcHRpb25zLnByZWZldGNoID8gMFxuICAgIHVubGVzcyBpc0ludGVnZXIoQHByZWZldGNoKSBhbmQgQHByZWZldGNoID49IDBcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkpvYlF1ZXVlOiBJbnZhbGlkIHByZWZldGNoLCBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlclwiXG5cbiAgICBAd29ya1RpbWVvdXQgPSBvcHRpb25zLndvcmtUaW1lb3V0ICAjIE5vIGRlZmF1bHRcbiAgICBpZiBAd29ya1RpbWVvdXQ/IGFuZCBub3QgKGlzSW50ZWdlcihAd29ya1RpbWVvdXQpIGFuZCBAd29ya1RpbWVvdXQgPj0gMClcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkpvYlF1ZXVlOiBJbnZhbGlkIHdvcmtUaW1lb3V0LCBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlclwiXG5cbiAgICBAY2FsbGJhY2tTdHJpY3QgPSBvcHRpb25zLmNhbGxiYWNrU3RyaWN0XG4gICAgaWYgQGNhbGxiYWNrU3RyaWN0PyBhbmQgbm90IGlzQm9vbGVhbihAY2FsbGJhY2tTdHJpY3QpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJKb2JRdWV1ZTogSW52YWxpZCBjYWxsYmFja1N0cmljdCwgbXVzdCBiZSBhIGJvb2xlYW5cIlxuXG4gICAgQF93b3JrZXJzID0ge31cbiAgICBAX3Rhc2tzID0gW11cbiAgICBAX3Rhc2tOdW1iZXIgPSAwXG4gICAgQF9zdG9wcGluZ0dldFdvcmsgPSB1bmRlZmluZWRcbiAgICBAX3N0b3BwaW5nVGFza3MgPSB1bmRlZmluZWRcbiAgICBAX2ludGVydmFsID0gbnVsbFxuICAgIEBfZ2V0V29ya091dHN0YW5kaW5nID0gZmFsc2VcbiAgICBAcGF1c2VkID0gdHJ1ZVxuICAgIEByZXN1bWUoKVxuXG4gIF9nZXRXb3JrOiAoKSAtPlxuICAgICMgRG9uJ3QgcmVlbnRlciwgb3IgcnVuIHdoZW4gcGF1c2VkIG9yIHN0b3BwaW5nXG4gICAgdW5sZXNzIEBfZ2V0V29ya091dHN0YW5kaW5nIG9yIEBwYXVzZWRcbiAgICAgIG51bUpvYnNUb0dldCA9IEBwcmVmZXRjaCArIEBwYXlsb2FkKihAY29uY3VycmVuY3kgLSBAcnVubmluZygpKSAtIEBsZW5ndGgoKVxuICAgICAgaWYgbnVtSm9ic1RvR2V0ID4gMFxuICAgICAgICBAX2dldFdvcmtPdXRzdGFuZGluZyA9IHRydWVcbiAgICAgICAgb3B0aW9ucyA9IHsgbWF4Sm9iczogbnVtSm9ic1RvR2V0IH1cbiAgICAgICAgb3B0aW9ucy53b3JrVGltZW91dCA9IEB3b3JrVGltZW91dCBpZiBAd29ya1RpbWVvdXQ/XG4gICAgICAgIEpvYi5nZXRXb3JrIEByb290LCBAdHlwZSwgb3B0aW9ucywgKGVyciwgam9icykgPT5cbiAgICAgICAgICBAX2dldFdvcmtPdXRzdGFuZGluZyA9IGZhbHNlXG4gICAgICAgICAgaWYgZXJyXG4gICAgICAgICAgICBAZXJyb3JDYWxsYmFjayBuZXcgRXJyb3IgXCJSZWNlaXZlZCBlcnJvciBmcm9tIGdldFdvcmsoKTogI3tlcnJ9XCJcbiAgICAgICAgICBlbHNlIGlmIGpvYnM/IGFuZCBqb2JzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIGlmIGpvYnMubGVuZ3RoID4gbnVtSm9ic1RvR2V0XG4gICAgICAgICAgICAgIEBlcnJvckNhbGxiYWNrIG5ldyBFcnJvciBcImdldFdvcmsoKSByZXR1cm5lZCBqb2JzICgje2pvYnMubGVuZ3RofSkgaW4gZXhjZXNzIG9mIG1heEpvYnMgKCN7bnVtSm9ic1RvR2V0fSlcIlxuICAgICAgICAgICAgZm9yIGogaW4gam9ic1xuICAgICAgICAgICAgICBAX3Rhc2tzLnB1c2ggalxuICAgICAgICAgICAgICBfc2V0SW1tZWRpYXRlIEBfcHJvY2Vzcy5iaW5kKEApIHVubGVzcyBAX3N0b3BwaW5nR2V0V29yaz9cbiAgICAgICAgICAgIEBfc3RvcHBpbmdHZXRXb3JrKCkgaWYgQF9zdG9wcGluZ0dldFdvcms/XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGVycm9yQ2FsbGJhY2sgbmV3IEVycm9yIFwiTm9uYXJyYXkgcmVzcG9uc2UgZnJvbSBzZXJ2ZXIgZnJvbSBnZXRXb3JrKClcIlxuXG4gIF9vbmx5X29uY2U6IChmbikgLT5cbiAgICBjYWxsZWQgPSBmYWxzZVxuICAgIHJldHVybiAoKSA9PlxuICAgICAgaWYgY2FsbGVkXG4gICAgICAgIEBlcnJvckNhbGxiYWNrIG5ldyBFcnJvciBcIldvcmtlciBjYWxsYmFjayBjYWxsZWQgbXVsdGlwbGUgdGltZXNcIlxuICAgICAgICBpZiBAY2FsbGJhY2tTdHJpY3RcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJKb2JRdWV1ZTogd29ya2VyIGNhbGxiYWNrIHdhcyBpbnZva2VkIG11bHRpcGxlIHRpbWVzXCJcbiAgICAgIGNhbGxlZCA9IHRydWVcbiAgICAgIGZuLmFwcGx5IEAsIGFyZ3VtZW50c1xuXG4gIF9wcm9jZXNzOiAoKSAtPlxuICAgIGlmIG5vdCBAcGF1c2VkIGFuZCBAcnVubmluZygpIDwgQGNvbmN1cnJlbmN5IGFuZCBAbGVuZ3RoKClcbiAgICAgIGlmIEBwYXlsb2FkID4gMVxuICAgICAgICBqb2IgPSBAX3Rhc2tzLnNwbGljZSAwLCBAcGF5bG9hZFxuICAgICAgZWxzZVxuICAgICAgICBqb2IgPSBAX3Rhc2tzLnNoaWZ0KClcbiAgICAgIGpvYi5fdGFza0lkID0gXCJUYXNrXyN7QF90YXNrTnVtYmVyKyt9XCJcbiAgICAgIEBfd29ya2Vyc1tqb2IuX3Rhc2tJZF0gPSBqb2JcbiAgICAgIG5leHQgPSAoKSA9PlxuICAgICAgICBkZWxldGUgQF93b3JrZXJzW2pvYi5fdGFza0lkXVxuICAgICAgICBpZiBAX3N0b3BwaW5nVGFza3M/IGFuZCBAcnVubmluZygpIGlzIDAgYW5kIEBsZW5ndGgoKSBpcyAwXG4gICAgICAgICAgQF9zdG9wcGluZ1Rhc2tzKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIF9zZXRJbW1lZGlhdGUgQF9wcm9jZXNzLmJpbmQoQClcbiAgICAgICAgICBfc2V0SW1tZWRpYXRlIEBfZ2V0V29yay5iaW5kKEApXG4gICAgICBjYiA9IEBfb25seV9vbmNlIG5leHRcbiAgICAgIEB3b3JrZXIgam9iLCBjYlxuXG4gIF9zdG9wR2V0V29yazogKGNhbGxiYWNrKSAtPlxuICAgIF9jbGVhckludGVydmFsIEBfaW50ZXJ2YWxcbiAgICBAX2ludGVydmFsID0gbnVsbFxuICAgIGlmIEBfZ2V0V29ya091dHN0YW5kaW5nXG4gICAgICBAX3N0b3BwaW5nR2V0V29yayA9IGNhbGxiYWNrXG4gICAgZWxzZVxuICAgICAgX3NldEltbWVkaWF0ZSBjYWxsYmFjayAgIyBObyBaYWxnbywgdGhhbmtzXG5cbiAgX3dhaXRGb3JUYXNrczogKGNhbGxiYWNrKSAtPlxuICAgIHVubGVzcyBAcnVubmluZygpIGlzIDBcbiAgICAgIEBfc3RvcHBpbmdUYXNrcyA9IGNhbGxiYWNrXG4gICAgZWxzZVxuICAgICAgX3NldEltbWVkaWF0ZSBjYWxsYmFjayAgIyBObyBaYWxnbywgdGhhbmtzXG5cbiAgX2ZhaWxKb2JzOiAodGFza3MsIGNhbGxiYWNrKSAtPlxuICAgIF9zZXRJbW1lZGlhdGUgY2FsbGJhY2sgaWYgdGFza3MubGVuZ3RoIGlzIDAgICMgTm8gWmFsZ28sIHRoYW5rc1xuICAgIGNvdW50ID0gMFxuICAgIGZvciBqb2IgaW4gdGFza3NcbiAgICAgIGpvYi5mYWlsIFwiV29ya2VyIHNodXRkb3duXCIsIChlcnIsIHJlcykgPT5cbiAgICAgICAgY291bnQrK1xuICAgICAgICBpZiBjb3VudCBpcyB0YXNrcy5sZW5ndGhcbiAgICAgICAgICBjYWxsYmFjaygpXG5cbiAgX2hhcmQ6IChjYWxsYmFjaykgLT5cbiAgICBAcGF1c2VkID0gdHJ1ZVxuICAgIEBfc3RvcEdldFdvcmsgKCkgPT5cbiAgICAgIHRhc2tzID0gQF90YXNrc1xuICAgICAgQF90YXNrcyA9IFtdXG4gICAgICBmb3IgaSwgciBvZiBAX3dvcmtlcnNcbiAgICAgICAgdGFza3MgPSB0YXNrcy5jb25jYXQgclxuICAgICAgQF9mYWlsSm9icyB0YXNrcywgY2FsbGJhY2tcblxuICBfc3RvcDogKGNhbGxiYWNrKSAtPlxuICAgIEBwYXVzZWQgPSB0cnVlXG4gICAgQF9zdG9wR2V0V29yayAoKSA9PlxuICAgICAgdGFza3MgPSBAX3Rhc2tzXG4gICAgICBAX3Rhc2tzID0gW11cbiAgICAgIEBfd2FpdEZvclRhc2tzICgpID0+XG4gICAgICAgIEBfZmFpbEpvYnMgdGFza3MsIGNhbGxiYWNrXG5cbiAgX3NvZnQ6IChjYWxsYmFjaykgLT5cbiAgICBAX3N0b3BHZXRXb3JrICgpID0+XG4gICAgICBAX3dhaXRGb3JUYXNrcyBjYWxsYmFja1xuXG4gIGxlbmd0aDogKCkgLT4gQF90YXNrcy5sZW5ndGhcblxuICBydW5uaW5nOiAoKSAtPiBPYmplY3Qua2V5cyhAX3dvcmtlcnMpLmxlbmd0aFxuXG4gIGlkbGU6ICgpIC0+IEBsZW5ndGgoKSArIEBydW5uaW5nKCkgaXMgMFxuXG4gIGZ1bGw6ICgpIC0+IEBydW5uaW5nKCkgaXMgQGNvbmN1cnJlbmN5XG5cbiAgcGF1c2U6ICgpIC0+XG4gICAgcmV0dXJuIGlmIEBwYXVzZWRcbiAgICB1bmxlc3MgQHBvbGxJbnRlcnZhbCA+PSBKb2IuZm9yZXZlclxuICAgICAgX2NsZWFySW50ZXJ2YWwgQF9pbnRlcnZhbFxuICAgICAgQF9pbnRlcnZhbCA9IG51bGxcbiAgICBAcGF1c2VkID0gdHJ1ZVxuICAgIEBcblxuICByZXN1bWU6ICgpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcGF1c2VkXG4gICAgQHBhdXNlZCA9IGZhbHNlXG4gICAgX3NldEltbWVkaWF0ZSBAX2dldFdvcmsuYmluZChAKVxuICAgIHVubGVzcyBAcG9sbEludGVydmFsID49IEpvYi5mb3JldmVyXG4gICAgICBAX2ludGVydmFsID0gX3NldEludGVydmFsIEBfZ2V0V29yay5iaW5kKEApLCBAcG9sbEludGVydmFsXG4gICAgZm9yIHcgaW4gWzEuLkBjb25jdXJyZW5jeV1cbiAgICAgIF9zZXRJbW1lZGlhdGUgQF9wcm9jZXNzLmJpbmQoQClcbiAgICBAXG5cbiAgdHJpZ2dlcjogKCkgLT5cbiAgICByZXR1cm4gaWYgQHBhdXNlZFxuICAgIF9zZXRJbW1lZGlhdGUgQF9nZXRXb3JrLmJpbmQoQClcbiAgICBAXG5cbiAgc2h1dGRvd246IChvcHRpb25zLi4uLCBjYikgLT5cbiAgICBbb3B0aW9ucywgY2JdID0gb3B0aW9uc0hlbHAgb3B0aW9ucywgY2JcbiAgICBvcHRpb25zLmxldmVsID89ICdub3JtYWwnXG4gICAgb3B0aW9ucy5xdWlldCA/PSBmYWxzZVxuICAgIHVubGVzcyBjYj9cbiAgICAgIGNvbnNvbGUud2FybiBcInVzaW5nIGRlZmF1bHQgc2h1dGRvd24gY2FsbGJhY2shXCIgdW5sZXNzIG9wdGlvbnMucXVpZXRcbiAgICAgIGNiID0gKCkgPT5cbiAgICAgICAgY29uc29sZS53YXJuIFwiU2h1dGRvd24gY29tcGxldGVcIlxuICAgIHN3aXRjaCBvcHRpb25zLmxldmVsXG4gICAgICB3aGVuICdoYXJkJ1xuICAgICAgICBjb25zb2xlLndhcm4gXCJTaHV0dGluZyBkb3duIGhhcmRcIiB1bmxlc3Mgb3B0aW9ucy5xdWlldFxuICAgICAgICBAX2hhcmQgY2JcbiAgICAgIHdoZW4gJ3NvZnQnXG4gICAgICAgIGNvbnNvbGUud2FybiBcIlNodXR0aW5nIGRvd24gc29mdFwiIHVubGVzcyBvcHRpb25zLnF1aWV0XG4gICAgICAgIEBfc29mdCBjYlxuICAgICAgZWxzZVxuICAgICAgICBjb25zb2xlLndhcm4gXCJTaHV0dGluZyBkb3duIG5vcm1hbGx5XCIgdW5sZXNzIG9wdGlvbnMucXVpZXRcbiAgICAgICAgQF9zdG9wIGNiXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuY2xhc3MgSm9iXG5cbiAgIyBUaGlzIGlzIHRoZSBKUyBtYXggaW50IHZhbHVlID0gMl41M1xuICBAZm9yZXZlciA9IDkwMDcxOTkyNTQ3NDA5OTJcblxuICAjIFRoaXMgaXMgdGhlIG1heGltdW0gZGF0ZSB2YWx1ZSBpbiBKU1xuICBAZm9yZXZlckRhdGUgPSBuZXcgRGF0ZSA4NjQwMDAwMDAwMDAwMDAwXG5cbiAgQGpvYlByaW9yaXRpZXM6XG4gICAgbG93OiAxMFxuICAgIG5vcm1hbDogMFxuICAgIG1lZGl1bTogLTVcbiAgICBoaWdoOiAtMTBcbiAgICBjcml0aWNhbDogLTE1XG5cbiAgQGpvYlJldHJ5QmFja29mZk1ldGhvZHM6IFsgJ2NvbnN0YW50JywgJ2V4cG9uZW50aWFsJyBdXG5cbiAgQGpvYlN0YXR1c2VzOiBbICd3YWl0aW5nJywgJ3BhdXNlZCcsICdyZWFkeScsICdydW5uaW5nJ1xuICAgICAgICAgICAgICAgICAgJ2ZhaWxlZCcsICdjYW5jZWxsZWQnLCAnY29tcGxldGVkJyBdXG5cbiAgQGpvYkxvZ0xldmVsczogWyAnaW5mbycsICdzdWNjZXNzJywgJ3dhcm5pbmcnLCAnZGFuZ2VyJyBdXG5cbiAgQGpvYlN0YXR1c0NhbmNlbGxhYmxlOiBbICdydW5uaW5nJywgJ3JlYWR5JywgJ3dhaXRpbmcnLCAncGF1c2VkJyBdXG4gIEBqb2JTdGF0dXNQYXVzYWJsZTogWyAncmVhZHknLCAnd2FpdGluZycgXVxuICBAam9iU3RhdHVzUmVtb3ZhYmxlOiAgIFsgJ2NhbmNlbGxlZCcsICdjb21wbGV0ZWQnLCAnZmFpbGVkJyBdXG4gIEBqb2JTdGF0dXNSZXN0YXJ0YWJsZTogWyAnY2FuY2VsbGVkJywgJ2ZhaWxlZCcgXVxuXG4gIEBkZHBNZXRob2RzID0gWyAnc3RhcnRKb2JzJywgJ3N0b3BKb2JzJywgICMgRGVwcmVjYXRlZCFcbiAgICAgICAgICAgICAgICAgICdzdGFydEpvYlNlcnZlcicsICdzaHV0ZG93bkpvYlNlcnZlcicsXG4gICAgICAgICAgICAgICAgICAnam9iUmVtb3ZlJywgJ2pvYlBhdXNlJywgJ2pvYlJlc3VtZScsICdqb2JSZWFkeSdcbiAgICAgICAgICAgICAgICAgICdqb2JDYW5jZWwnLCAnam9iUmVzdGFydCcsICdqb2JTYXZlJywgJ2pvYlJlcnVuJywgJ2dldFdvcmsnXG4gICAgICAgICAgICAgICAgICAnZ2V0Sm9iJywgJ2pvYkxvZycsICdqb2JQcm9ncmVzcycsICdqb2JEb25lJywgJ2pvYkZhaWwnIF1cblxuICBAZGRwUGVybWlzc2lvbkxldmVscyA9IFsgJ2FkbWluJywgJ21hbmFnZXInLCAnY3JlYXRvcicsICd3b3JrZXInIF1cblxuICAjIFRoZXNlIGFyZSB0aGUgZm91ciBsZXZlbHMgb2YgdGhlIGFsbG93L2RlbnkgcGVybWlzc2lvbiBoZWlyYXJjaHlcbiAgQGRkcE1ldGhvZFBlcm1pc3Npb25zID1cbiAgICAnc3RhcnRKb2JzJzogWydzdGFydEpvYnMnLCAnYWRtaW4nXSAgIyBEZXByZWNhdGVkIVxuICAgICdzdG9wSm9icyc6IFsnc3RvcEpvYnMnLCAnYWRtaW4nXSAgICAjIERlcHJlY2F0ZWQhXG4gICAgJ3N0YXJ0Sm9iU2VydmVyJzogWydzdGFydEpvYlNlcnZlcicsICdhZG1pbiddXG4gICAgJ3NodXRkb3duSm9iU2VydmVyJzogWydzaHV0ZG93bkpvYlNlcnZlcicsICdhZG1pbiddXG4gICAgJ2pvYlJlbW92ZSc6IFsnam9iUmVtb3ZlJywgJ2FkbWluJywgJ21hbmFnZXInXVxuICAgICdqb2JQYXVzZSc6IFsnam9iUGF1c2UnLCAnYWRtaW4nLCAnbWFuYWdlciddXG4gICAgJ2pvYlJlc3VtZSc6IFsnam9iUmVzdW1lJywgJ2FkbWluJywgJ21hbmFnZXInXVxuICAgICdqb2JDYW5jZWwnOiBbJ2pvYkNhbmNlbCcsICdhZG1pbicsICdtYW5hZ2VyJ11cbiAgICAnam9iUmVhZHknOiBbJ2pvYlJlYWR5JywgJ2FkbWluJywgJ21hbmFnZXInXVxuICAgICdqb2JSZXN0YXJ0JzogWydqb2JSZXN0YXJ0JywgJ2FkbWluJywgJ21hbmFnZXInXVxuICAgICdqb2JTYXZlJzogWydqb2JTYXZlJywgJ2FkbWluJywgJ2NyZWF0b3InXVxuICAgICdqb2JSZXJ1bic6IFsnam9iUmVydW4nLCAnYWRtaW4nLCAnY3JlYXRvciddXG4gICAgJ2dldFdvcmsnOiBbJ2dldFdvcmsnLCAnYWRtaW4nLCAnd29ya2VyJ11cbiAgICAnZ2V0Sm9iJzogWydnZXRKb2InLCAnYWRtaW4nLCAnd29ya2VyJ11cbiAgICAnam9iTG9nJzogWyAnam9iTG9nJywgJ2FkbWluJywgJ3dvcmtlciddXG4gICAgJ2pvYlByb2dyZXNzJzogWydqb2JQcm9ncmVzcycsICdhZG1pbicsICd3b3JrZXInXVxuICAgICdqb2JEb25lJzogWydqb2JEb25lJywgJ2FkbWluJywgJ3dvcmtlciddXG4gICAgJ2pvYkZhaWwnOiBbJ2pvYkZhaWwnLCAnYWRtaW4nLCAnd29ya2VyJ11cblxuICAjIEF1dG9tYXRpY2FsbHkgd29yayB3aXRoaW4gTWV0ZW9yLCBvdGhlcndpc2Ugc2VlIEBzZXRERFAgYmVsb3dcbiAgQF9kZHBfYXBwbHk6IHVuZGVmaW5lZFxuXG4gICMgQ2xhc3MgbWV0aG9kc1xuXG4gIEBfc2V0RERQQXBwbHk6IChhcHBseSwgY29sbGVjdGlvbk5hbWUpIC0+XG4gICAgaWYgdHlwZW9mIGFwcGx5IGlzICdmdW5jdGlvbidcbiAgICAgIGlmIHR5cGVvZiBjb2xsZWN0aW9uTmFtZSBpcyAnc3RyaW5nJ1xuICAgICAgICAgQF9kZHBfYXBwbHkgPz0ge31cbiAgICAgICAgIGlmIHR5cGVvZiBAX2RkcF9hcHBseSBpcyAnZnVuY3Rpb24nXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJKb2Iuc2V0RERQIG11c3Qgc3BlY2lmeSBhIGNvbGxlY3Rpb24gbmFtZSBlYWNoIHRpbWUgaWYgY2FsbGVkIG1vcmUgdGhhbiBvbmNlLlwiXG4gICAgICAgICBAX2RkcF9hcHBseVtjb2xsZWN0aW9uTmFtZV0gPSBhcHBseVxuICAgICAgZWxzZSB1bmxlc3MgQF9kZHBfYXBwbHlcbiAgICAgICAgIEBfZGRwX2FwcGx5ID0gYXBwbHlcbiAgICAgIGVsc2VcbiAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkpvYi5zZXRERFAgbXVzdCBzcGVjaWZ5IGEgY29sbGVjdGlvbiBuYW1lIGVhY2ggdGltZSBpZiBjYWxsZWQgbW9yZSB0aGFuIG9uY2UuXCJcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJCYWQgZnVuY3Rpb24gaW4gSm9iLnNldEREUEFwcGx5KClcIlxuXG4gICMgVGhpcyBuZWVkcyB0byBiZSBjYWxsZWQgd2hlbiBub3QgcnVubmluZyBpbiBNZXRlb3IgdG8gdXNlIHRoZSBsb2NhbCBERFAgY29ubmVjdGlvbi5cbiAgQHNldEREUDogKGRkcCA9IG51bGwsIGNvbGxlY3Rpb25OYW1lcyA9IG51bGwsIEZpYmVyID0gbnVsbCkgLT5cbiAgICB1bmxlc3MgKHR5cGVvZiBjb2xsZWN0aW9uTmFtZXMgaXMgJ3N0cmluZycpIG9yIChjb2xsZWN0aW9uTmFtZXMgaW5zdGFuY2VvZiBBcnJheSlcbiAgICAgICMgSGFuZGxlIG9wdGlvbmFsIGNvbGxlY3Rpb24gc3RyaW5nIHdpdGggRmliZXIgcHJlc2VudFxuICAgICAgRmliZXIgPSBjb2xsZWN0aW9uTmFtZXNcbiAgICAgIGNvbGxlY3Rpb25OYW1lcyA9IFsgdW5kZWZpbmVkIF1cbiAgICBlbHNlIGlmIHR5cGVvZiBjb2xsZWN0aW9uTmFtZXMgaXMgJ3N0cmluZydcbiAgICAgICMgSWYgc3RyaW5nLCBjb252ZXJ0IHRvIGFycmF5IG9mIHN0cmluZ3NcbiAgICAgIGNvbGxlY3Rpb25OYW1lcyA9IFsgY29sbGVjdGlvbk5hbWVzIF1cbiAgICBmb3IgY29sbE5hbWUgaW4gY29sbGVjdGlvbk5hbWVzXG4gICAgICB1bmxlc3MgZGRwPyBhbmQgZGRwLmNsb3NlPyBhbmQgZGRwLnN1YnNjcmliZT9cbiAgICAgICAgIyBOb3QgdGhlIEREUCBucG0gcGFja2FnZVxuICAgICAgICBpZiBkZHAgaXMgbnVsbCBhbmQgTWV0ZW9yPy5hcHBseT9cbiAgICAgICAgICAjIE1ldGVvciBsb2NhbCBzZXJ2ZXIvY2xpZW50XG4gICAgICAgICAgQF9zZXRERFBBcHBseSBNZXRlb3IuYXBwbHksIGNvbGxOYW1lXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIE5vIG90aGVyIHBvc3NpYmlsaXRpZXMuLi5cbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJCYWQgZGRwIG9iamVjdCBpbiBKb2Iuc2V0RERQKClcIlxuICAgICAgZWxzZSB1bmxlc3MgZGRwLm9ic2VydmU/ICAjIFRoaXMgaXMgYSBNZXRlb3IgRERQIGNvbm5lY3Rpb24gb2JqZWN0XG4gICAgICAgIEBfc2V0RERQQXBwbHkgZGRwLmFwcGx5LmJpbmQoZGRwKSwgY29sbE5hbWVcbiAgICAgIGVsc2UgIyBUaGlzIGlzIHRoZSBucG0gRERQIHBhY2thZ2VcbiAgICAgICAgdW5sZXNzIEZpYmVyP1xuICAgICAgICAgIEBfc2V0RERQQXBwbHkgZGRwLmNhbGwuYmluZChkZHApLCBjb2xsTmFtZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBJZiBGaWJlcnMgaW4gdXNlIHVuZGVyIHB1cmUgbm9kZS5qcyxcbiAgICAgICAgICAjIG1ha2Ugc3VyZSB0byB5aWVsZCBhbmQgdGhyb3cgZXJyb3JzIHdoZW4gbm8gY2FsbGJhY2tcbiAgICAgICAgICBAX3NldEREUEFwcGx5KCgobmFtZSwgcGFyYW1zLCBjYikgLT5cbiAgICAgICAgICAgIGZpYiA9IEZpYmVyLmN1cnJlbnRcbiAgICAgICAgICAgIGRkcC5jYWxsIG5hbWUsIHBhcmFtcywgKGVyciwgcmVzKSAtPlxuICAgICAgICAgICAgICBpZiBjYj8gYW5kIHR5cGVvZiBjYiBpcyAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgY2IgZXJyLCByZXNcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIGVyclxuICAgICAgICAgICAgICAgICAgZmliLnRocm93SW50byBlcnJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICBmaWIucnVuIHJlc1xuICAgICAgICAgICAgaWYgY2I/IGFuZCB0eXBlb2YgY2IgaXMgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIEZpYmVyLnlpZWxkKClcbiAgICAgICAgICApLCBjb2xsTmFtZSlcblxuICAjIENyZWF0ZXMgYSBqb2Igb2JqZWN0IGJ5IHJlc2VydmluZyB0aGUgbmV4dCBhdmFpbGFibGUgam9iIG9mXG4gICMgdGhlIHNwZWNpZmllZCAndHlwZScgZnJvbSB0aGUgc2VydmVyIHF1ZXVlIHJvb3RcbiAgIyByZXR1cm5zIG51bGwgaWYgbm8gc3VjaCBqb2IgZXhpc3RzXG4gIEBnZXRXb3JrOiAocm9vdCwgdHlwZSwgb3B0aW9ucy4uLiwgY2IpIC0+XG4gICAgW29wdGlvbnMsIGNiXSA9IG9wdGlvbnNIZWxwIG9wdGlvbnMsIGNiXG4gICAgdHlwZSA9IFt0eXBlXSBpZiB0eXBlb2YgdHlwZSBpcyAnc3RyaW5nJ1xuICAgIGlmIG9wdGlvbnMud29ya1RpbWVvdXQ/XG4gICAgICB1bmxlc3MgaXNJbnRlZ2VyKG9wdGlvbnMud29ya1RpbWVvdXQpIGFuZCBvcHRpb25zLndvcmtUaW1lb3V0ID4gMFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgJ2dldFdvcms6IHdvcmtUaW1lb3V0IG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyJ1xuICAgIG1ldGhvZENhbGwgcm9vdCwgXCJnZXRXb3JrXCIsIFt0eXBlLCBvcHRpb25zXSwgY2IsIChyZXMpID0+XG4gICAgICBqb2JzID0gKG5ldyBKb2Iocm9vdCwgZG9jKSBmb3IgZG9jIGluIHJlcykgb3IgW11cbiAgICAgIGlmIG9wdGlvbnMubWF4Sm9icz9cbiAgICAgICAgcmV0dXJuIGpvYnNcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGpvYnNbMF1cblxuICAjIFRoaXMgaXMgZGVmaW5lZCBhYm92ZVxuICBAcHJvY2Vzc0pvYnM6IEpvYlF1ZXVlXG5cbiAgIyBNYWtlcyBhIGpvYiBvYmplY3QgZnJvbSBhIGpvYiBkb2N1bWVudFxuICAjIFRoaXMgbWV0aG9kIGlzIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZFxuICBAbWFrZUpvYjogZG8gKCkgLT5cbiAgICBkZXBGbGFnID0gZmFsc2VcbiAgICAocm9vdCwgZG9jKSAtPlxuICAgICAgdW5sZXNzIGRlcEZsYWdcbiAgICAgICAgZGVwRmxhZyA9IHRydWVcbiAgICAgICAgY29uc29sZS53YXJuIFwiSm9iLm1ha2VKb2Iocm9vdCwgam9iRG9jKSBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmUgcmVsZWFzZSwgdXNlICduZXcgSm9iKHJvb3QsIGpvYkRvYyknIGluc3RlYWQuXCJcbiAgICAgIG5ldyBKb2Igcm9vdCwgZG9jXG5cbiAgIyBDcmVhdGVzIGEgam9iIG9iamVjdCBieSBpZCBmcm9tIHRoZSBzZXJ2ZXIgcXVldWUgcm9vdFxuICAjIHJldHVybnMgbnVsbCBpZiBubyBzdWNoIGpvYiBleGlzdHNcbiAgQGdldEpvYjogKHJvb3QsIGlkLCBvcHRpb25zLi4uLCBjYikgLT5cbiAgICBbb3B0aW9ucywgY2JdID0gb3B0aW9uc0hlbHAgb3B0aW9ucywgY2JcbiAgICBvcHRpb25zLmdldExvZyA/PSBmYWxzZVxuICAgIG1ldGhvZENhbGwgcm9vdCwgXCJnZXRKb2JcIiwgW2lkLCBvcHRpb25zXSwgY2IsIChkb2MpID0+XG4gICAgICBpZiBkb2NcbiAgICAgICAgbmV3IEpvYiByb290LCBkb2NcbiAgICAgIGVsc2VcbiAgICAgICAgdW5kZWZpbmVkXG5cbiAgIyBMaWtlIHRoZSBhYm92ZSwgYnV0IHRha2VzIGFuIGFycmF5IG9mIGlkcywgcmV0dXJucyBhcnJheSBvZiBqb2JzXG4gIEBnZXRKb2JzOiAocm9vdCwgaWRzLCBvcHRpb25zLi4uLCBjYikgLT5cbiAgICBbb3B0aW9ucywgY2JdID0gb3B0aW9uc0hlbHAgb3B0aW9ucywgY2JcbiAgICBvcHRpb25zLmdldExvZyA/PSBmYWxzZVxuICAgIHJldFZhbCA9IFtdXG4gICAgY2h1bmtzT2ZJZHMgPSBzcGxpdExvbmdBcnJheSBpZHMsIDMyXG4gICAgbXlDYiA9IHJlZHVjZUNhbGxiYWNrcyhjYiwgY2h1bmtzT2ZJZHMubGVuZ3RoLCBjb25jYXRSZWR1Y2UsIFtdKVxuICAgIGZvciBjaHVua09mSWRzIGluIGNodW5rc09mSWRzXG4gICAgICByZXRWYWwgPSByZXRWYWwuY29uY2F0KG1ldGhvZENhbGwgcm9vdCwgXCJnZXRKb2JcIiwgW2NodW5rT2ZJZHMsIG9wdGlvbnNdLCBteUNiLCAoZG9jKSA9PlxuICAgICAgICBpZiBkb2NcbiAgICAgICAgICAobmV3IEpvYihyb290LCBkLnR5cGUsIGQuZGF0YSwgZCkgZm9yIGQgaW4gZG9jKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbnVsbClcbiAgICByZXR1cm4gcmV0VmFsXG5cbiAgIyBQYXVzZSB0aGlzIGpvYiwgb25seSBSZWFkeSBhbmQgV2FpdGluZyBqb2JzIGNhbiBiZSBwYXVzZWRcbiAgIyBDYWxsaW5nIHRoaXMgdG9nZ2xlcyB0aGUgcGF1c2VkIHN0YXRlLiBVbnBhdXNlZCBqb2JzIGdvIHRvIHdhaXRpbmdcbiAgQHBhdXNlSm9iczogKHJvb3QsIGlkcywgb3B0aW9ucy4uLiwgY2IpIC0+XG4gICAgW29wdGlvbnMsIGNiXSA9IG9wdGlvbnNIZWxwIG9wdGlvbnMsIGNiXG4gICAgcmV0VmFsID0gZmFsc2VcbiAgICBjaHVua3NPZklkcyA9IHNwbGl0TG9uZ0FycmF5IGlkcywgMjU2XG4gICAgbXlDYiA9IHJlZHVjZUNhbGxiYWNrcyhjYiwgY2h1bmtzT2ZJZHMubGVuZ3RoKVxuICAgIGZvciBjaHVua09mSWRzIGluIGNodW5rc09mSWRzXG4gICAgICByZXRWYWwgPSBtZXRob2RDYWxsKHJvb3QsIFwiam9iUGF1c2VcIiwgW2NodW5rT2ZJZHMsIG9wdGlvbnNdLCBteUNiKSB8fCByZXRWYWxcbiAgICByZXR1cm4gcmV0VmFsXG5cbiAgIyBSZXN1bWUgdGhpcyBqb2IsIG9ubHkgUGF1c2VkIGpvYnMgY2FuIGJlIHJlc3VtZWRcbiAgIyBDYWxsaW5nIHRoaXMgdG9nZ2xlcyB0aGUgcGF1c2VkIHN0YXRlLiBVbnBhdXNlZCBqb2JzIGdvIHRvIHdhaXRpbmdcbiAgQHJlc3VtZUpvYnM6IChyb290LCBpZHMsIG9wdGlvbnMuLi4sIGNiKSAtPlxuICAgIFtvcHRpb25zLCBjYl0gPSBvcHRpb25zSGVscCBvcHRpb25zLCBjYlxuICAgIHJldFZhbCA9IGZhbHNlXG4gICAgY2h1bmtzT2ZJZHMgPSBzcGxpdExvbmdBcnJheSBpZHMsIDI1NlxuICAgIG15Q2IgPSByZWR1Y2VDYWxsYmFja3MoY2IsIGNodW5rc09mSWRzLmxlbmd0aClcbiAgICBmb3IgY2h1bmtPZklkcyBpbiBjaHVua3NPZklkc1xuICAgICAgcmV0VmFsID0gbWV0aG9kQ2FsbChyb290LCBcImpvYlJlc3VtZVwiLCBbY2h1bmtPZklkcywgb3B0aW9uc10sIG15Q2IpIHx8IHJldFZhbFxuICAgIHJldHVybiByZXRWYWxcblxuICAjIE1vdmUgd2FpdGluZyBqb2JzIHRvIHRoZSByZWFkeSBzdGF0ZSwgam9icyB3aXRoIGRlcGVuZGVuY2llcyB3aWxsIG5vdFxuICAjIGJlIG1hZGUgcmVhZHkgdW5sZXNzIGZvcmNlIGlzIHVzZWQuXG4gIEByZWFkeUpvYnM6IChyb290LCBpZHMgPSBbXSwgb3B0aW9ucy4uLiwgY2IpIC0+XG4gICAgW29wdGlvbnMsIGNiXSA9IG9wdGlvbnNIZWxwIG9wdGlvbnMsIGNiXG4gICAgb3B0aW9ucy5mb3JjZSA/PSBmYWxzZVxuICAgIHJldFZhbCA9IGZhbHNlXG4gICAgY2h1bmtzT2ZJZHMgPSBzcGxpdExvbmdBcnJheSBpZHMsIDI1NlxuICAgIGNodW5rc09mSWRzID0gW1tdXSB1bmxlc3MgY2h1bmtzT2ZJZHMubGVuZ3RoID4gMFxuICAgIG15Q2IgPSByZWR1Y2VDYWxsYmFja3MoY2IsIGNodW5rc09mSWRzLmxlbmd0aClcbiAgICBmb3IgY2h1bmtPZklkcyBpbiBjaHVua3NPZklkc1xuICAgICAgcmV0VmFsID0gbWV0aG9kQ2FsbChyb290LCBcImpvYlJlYWR5XCIsIFtjaHVua09mSWRzLCBvcHRpb25zXSwgbXlDYikgfHwgcmV0VmFsXG4gICAgcmV0dXJuIHJldFZhbFxuXG4gICMgQ2FuY2VsIHRoaXMgam9iIGlmIGl0IGlzIHJ1bm5pbmcgb3IgYWJsZSB0byBydW4gKHdhaXRpbmcsIHJlYWR5KVxuICBAY2FuY2VsSm9iczogKHJvb3QsIGlkcywgb3B0aW9ucy4uLiwgY2IpIC0+XG4gICAgW29wdGlvbnMsIGNiXSA9IG9wdGlvbnNIZWxwIG9wdGlvbnMsIGNiXG4gICAgb3B0aW9ucy5hbnRlY2VkZW50cyA/PSB0cnVlXG4gICAgcmV0VmFsID0gZmFsc2VcbiAgICBjaHVua3NPZklkcyA9IHNwbGl0TG9uZ0FycmF5IGlkcywgMjU2XG4gICAgbXlDYiA9IHJlZHVjZUNhbGxiYWNrcyhjYiwgY2h1bmtzT2ZJZHMubGVuZ3RoKVxuICAgIGZvciBjaHVua09mSWRzIGluIGNodW5rc09mSWRzXG4gICAgICByZXRWYWwgPSBtZXRob2RDYWxsKHJvb3QsIFwiam9iQ2FuY2VsXCIsIFtjaHVua09mSWRzLCBvcHRpb25zXSwgbXlDYikgfHwgcmV0VmFsXG4gICAgcmV0dXJuIHJldFZhbFxuXG4gICMgUmVzdGFydCBhIGZhaWxlZCBvciBjYW5jZWxsZWQgam9iXG4gIEByZXN0YXJ0Sm9iczogKHJvb3QsIGlkcywgb3B0aW9ucy4uLiwgY2IpIC0+XG4gICAgW29wdGlvbnMsIGNiXSA9IG9wdGlvbnNIZWxwIG9wdGlvbnMsIGNiXG4gICAgb3B0aW9ucy5yZXRyaWVzID89IDFcbiAgICBvcHRpb25zLmRlcGVuZGVudHMgPz0gdHJ1ZVxuICAgIHJldFZhbCA9IGZhbHNlXG4gICAgY2h1bmtzT2ZJZHMgPSBzcGxpdExvbmdBcnJheSBpZHMsIDI1NlxuICAgIG15Q2IgPSByZWR1Y2VDYWxsYmFja3MoY2IsIGNodW5rc09mSWRzLmxlbmd0aClcbiAgICBmb3IgY2h1bmtPZklkcyBpbiBjaHVua3NPZklkc1xuICAgICAgcmV0VmFsID0gbWV0aG9kQ2FsbChyb290LCBcImpvYlJlc3RhcnRcIiwgW2NodW5rT2ZJZHMsIG9wdGlvbnNdLCBteUNiKSB8fCByZXRWYWxcbiAgICByZXR1cm4gcmV0VmFsXG5cbiAgIyBSZW1vdmUgYSBqb2IgdGhhdCBpcyBub3QgYWJsZSB0byBydW4gKGNvbXBsZXRlZCwgY2FuY2VsbGVkLCBmYWlsZWQpIGZyb20gdGhlIHF1ZXVlXG4gIEByZW1vdmVKb2JzOiAocm9vdCwgaWRzLCBvcHRpb25zLi4uLCBjYikgLT5cbiAgICBbb3B0aW9ucywgY2JdID0gb3B0aW9uc0hlbHAgb3B0aW9ucywgY2JcbiAgICByZXRWYWwgPSBmYWxzZVxuICAgIGNodW5rc09mSWRzID0gc3BsaXRMb25nQXJyYXkgaWRzLCAyNTZcbiAgICBteUNiID0gcmVkdWNlQ2FsbGJhY2tzKGNiLCBjaHVua3NPZklkcy5sZW5ndGgpXG4gICAgZm9yIGNodW5rT2ZJZHMgaW4gY2h1bmtzT2ZJZHNcbiAgICAgIHJldFZhbCA9IG1ldGhvZENhbGwocm9vdCwgXCJqb2JSZW1vdmVcIiwgW2NodW5rT2ZJZHMsIG9wdGlvbnNdLCBteUNiKSB8fCByZXRWYWxcbiAgICByZXR1cm4gcmV0VmFsXG5cbiAgIyBTdGFydCB0aGUgam9iIHF1ZXVlXG4gICMgRGVwcmVjYXRlZCFcbiAgQHN0YXJ0Sm9iczogKHJvb3QsIG9wdGlvbnMuLi4sIGNiKSAtPlxuICAgIFtvcHRpb25zLCBjYl0gPSBvcHRpb25zSGVscCBvcHRpb25zLCBjYlxuICAgIG1ldGhvZENhbGwgcm9vdCwgXCJzdGFydEpvYnNcIiwgW29wdGlvbnNdLCBjYlxuXG4gICMgU3RvcCB0aGUgam9iIHF1ZXVlLCBzdG9wIGFsbCBydW5uaW5nIGpvYnNcbiAgIyBEZXByZWNhdGVkIVxuICBAc3RvcEpvYnM6IChyb290LCBvcHRpb25zLi4uLCBjYikgLT5cbiAgICBbb3B0aW9ucywgY2JdID0gb3B0aW9uc0hlbHAgb3B0aW9ucywgY2JcbiAgICBvcHRpb25zLnRpbWVvdXQgPz0gNjAqMTAwMFxuICAgIG1ldGhvZENhbGwgcm9vdCwgXCJzdG9wSm9ic1wiLCBbb3B0aW9uc10sIGNiXG5cbiAgIyBTdGFydCB0aGUgam9iIHF1ZXVlXG4gIEBzdGFydEpvYlNlcnZlcjogKHJvb3QsIG9wdGlvbnMuLi4sIGNiKSAtPlxuICAgIFtvcHRpb25zLCBjYl0gPSBvcHRpb25zSGVscCBvcHRpb25zLCBjYlxuICAgIG1ldGhvZENhbGwgcm9vdCwgXCJzdGFydEpvYlNlcnZlclwiLCBbb3B0aW9uc10sIGNiXG5cbiAgIyBTaHV0ZG93biB0aGUgam9iIHF1ZXVlLCBzdG9wIGFsbCBydW5uaW5nIGpvYnNcbiAgQHNodXRkb3duSm9iU2VydmVyOiAocm9vdCwgb3B0aW9ucy4uLiwgY2IpIC0+XG4gICAgW29wdGlvbnMsIGNiXSA9IG9wdGlvbnNIZWxwIG9wdGlvbnMsIGNiXG4gICAgb3B0aW9ucy50aW1lb3V0ID89IDYwKjEwMDBcbiAgICBtZXRob2RDYWxsIHJvb3QsIFwic2h1dGRvd25Kb2JTZXJ2ZXJcIiwgW29wdGlvbnNdLCBjYlxuXG4gICMgSm9iIGNsYXNzIGluc3RhbmNlIGNvbnN0cnVjdG9yLiBXaGVuIFwibmV3IEpvYiguLi4pXCIgaXMgcnVuXG4gIGNvbnN0cnVjdG9yOiAocm9vdFZhbCwgdHlwZSwgZGF0YSkgLT5cbiAgICB1bmxlc3MgQCBpbnN0YW5jZW9mIEpvYlxuICAgICAgcmV0dXJuIG5ldyBKb2Igcm9vdFZhbCwgdHlwZSwgZGF0YVxuXG4gICAgIyBTZXQgdGhlIHJvb3QgdmFsdWVcbiAgICBAcm9vdCA9IHJvb3RWYWxcbiAgICAjIEtlZXAgYSBjb3B5IG9mIHRoZSBvcmlnaW5hbCByb290IHZhbHVlLCB3aGF0ZXZlciB0eXBlIHRoYXQgaXNcbiAgICBAX3Jvb3QgPSByb290VmFsXG5cbiAgICAjIEhhbmRsZSByb290IGFzIG9iamVjdCB3aXRoIG9iai5yb290IGF0dHJpYnV0ZVxuICAgIGlmIEByb290Py5yb290PyBhbmQgdHlwZW9mIEByb290LnJvb3QgaXMgJ3N0cmluZydcbiAgICAgIEByb290ID0gQF9yb290LnJvb3RcblxuICAgICMgSGFuZGxlIChyb290LCBkb2MpIHNpZ25hdHVyZVxuICAgIGlmIG5vdCBkYXRhPyBhbmQgdHlwZT8uZGF0YT8gYW5kIHR5cGU/LnR5cGU/XG4gICAgICBpZiB0eXBlIGluc3RhbmNlb2YgSm9iXG4gICAgICAgIHJldHVybiB0eXBlXG5cbiAgICAgIGRvYyA9IHR5cGVcbiAgICAgIGRhdGEgPSBkb2MuZGF0YVxuICAgICAgdHlwZSA9IGRvYy50eXBlXG4gICAgZWxzZVxuICAgICAgZG9jID0ge31cblxuICAgIHVubGVzcyB0eXBlb2YgZG9jIGlzICdvYmplY3QnIGFuZFxuICAgICAgICAgICB0eXBlb2YgZGF0YSBpcyAnb2JqZWN0JyBhbmRcbiAgICAgICAgICAgdHlwZW9mIHR5cGUgaXMgJ3N0cmluZycgYW5kXG4gICAgICAgICAgIHR5cGVvZiBAcm9vdCBpcyAnc3RyaW5nJ1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwibmV3IEpvYjogYmFkIHBhcmFtZXRlcihzKSwgI3tAcm9vdH0gKCN7dHlwZW9mIEByb290fSksICN7dHlwZX0gKCN7dHlwZW9mIHR5cGV9KSwgI3tkYXRhfSAoI3t0eXBlb2YgZGF0YX0pLCAje2RvY30gKCN7dHlwZW9mIGRvY30pXCJcblxuICAgIGVsc2UgaWYgZG9jLnR5cGU/IGFuZCBkb2MuZGF0YT8gIyBUaGlzIGNhc2UgaXMgdXNlZCB0byBjcmVhdGUgbG9jYWwgSm9iIG9iamVjdHMgZnJvbSBERFAgY2FsbHNcbiAgICAgIEBfZG9jID0gZG9jXG5cbiAgICBlbHNlICAjIFRoaXMgaXMgdGhlIG5vcm1hbCBcImNyZWF0ZSBhIG5ldyBvYmplY3RcIiBjYXNlXG4gICAgICB0aW1lID0gbmV3IERhdGUoKVxuICAgICAgQF9kb2MgPVxuICAgICAgICBydW5JZDogbnVsbFxuICAgICAgICB0eXBlIDogdHlwZVxuICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIHN0YXR1czogJ3dhaXRpbmcnXG4gICAgICAgIHVwZGF0ZWQ6IHRpbWVcbiAgICAgICAgY3JlYXRlZDogdGltZVxuICAgICAgQHByaW9yaXR5KCkucmV0cnkoKS5yZXBlYXQoKS5hZnRlcigpLnByb2dyZXNzKCkuZGVwZW5kcygpLmxvZyhcIkNvbnN0cnVjdGVkXCIpXG5cbiAgICByZXR1cm4gQFxuXG4gICMgT3ZlcnJpZGUgcG9pbnQgZm9yIG1ldGhvZHMgdGhhdCBoYXZlIGFuIGVjaG8gb3B0aW9uXG4gIF9lY2hvOiAobWVzc2FnZSwgbGV2ZWwgPSBudWxsKSAtPlxuICAgIHN3aXRjaCBsZXZlbFxuICAgICAgd2hlbiAnZGFuZ2VyJyB0aGVuIGNvbnNvbGUuZXJyb3IgbWVzc2FnZVxuICAgICAgd2hlbiAnd2FybmluZycgdGhlbiBjb25zb2xlLndhcm4gbWVzc2FnZVxuICAgICAgd2hlbiAnc3VjY2VzcycgdGhlbiBjb25zb2xlLmxvZyBtZXNzYWdlXG4gICAgICBlbHNlIGNvbnNvbGUuaW5mbyBtZXNzYWdlXG4gICAgcmV0dXJuXG5cbiAgIyBBZGRzIGEgcnVuIGRlcGVuZGFuY3kgb24gb25lIG9yIG1vcmUgZXhpc3Rpbmcgam9icyB0byB0aGlzIGpvYlxuICAjIENhbGxpbmcgd2l0aCBhIGZhbHN5IHZhbHVlIHJlc2V0cyB0aGUgZGVwZW5kZW5jaWVzIHRvIFtdXG4gIGRlcGVuZHM6IChqb2JzKSAtPlxuICAgIGlmIGpvYnNcbiAgICAgIGlmIGpvYnMgaW5zdGFuY2VvZiBKb2JcbiAgICAgICAgam9icyA9IFsgam9icyBdXG4gICAgICBpZiBqb2JzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgZGVwZW5kcyA9IEBfZG9jLmRlcGVuZHNcbiAgICAgICAgZm9yIGogaW4gam9ic1xuICAgICAgICAgIHVubGVzcyBqIGluc3RhbmNlb2YgSm9iIGFuZCBqLl9kb2MuX2lkP1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICdFYWNoIHByb3ZpZGVkIG9iamVjdCBtdXN0IGJlIGEgc2F2ZWQgSm9iIGluc3RhbmNlICh3aXRoIGFuIF9pZCknXG4gICAgICAgICAgZGVwZW5kcy5wdXNoIGouX2RvYy5faWRcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yICdCYWQgaW5wdXQgcGFyYW1ldGVyOiBkZXBlbmRzKCkgYWNjZXB0cyBhIGZhbHN5IHZhbHVlLCBvciBKb2Igb3IgYXJyYXkgb2YgSm9icydcbiAgICBlbHNlXG4gICAgICBkZXBlbmRzID0gW11cbiAgICBAX2RvYy5kZXBlbmRzID0gZGVwZW5kc1xuICAgIEBfZG9jLnJlc29sdmVkID0gW10gICMgVGhpcyBpcyB3aGVyZSBwcmlvciBkZXBlbmRzIGdvIGFzIHRoZXkgYXJlIHNhdGlzZmllZFxuICAgIHJldHVybiBAXG5cbiAgIyBTZXQgdGhlIHJ1biBwcmlvcml0eSBvZiB0aGlzIGpvYlxuICBwcmlvcml0eTogKGxldmVsID0gMCkgLT5cbiAgICBpZiB0eXBlb2YgbGV2ZWwgaXMgJ3N0cmluZydcbiAgICAgIHByaW9yaXR5ID0gSm9iLmpvYlByaW9yaXRpZXNbbGV2ZWxdXG4gICAgICB1bmxlc3MgcHJpb3JpdHk/XG4gICAgICAgIHRocm93IG5ldyBFcnJvciAnSW52YWxpZCBzdHJpbmcgcHJpb3JpdHkgbGV2ZWwgcHJvdmlkZWQnXG4gICAgZWxzZSBpZiBpc0ludGVnZXIobGV2ZWwpXG4gICAgICBwcmlvcml0eSA9IGxldmVsXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yICdwcmlvcml0eSBtdXN0IGJlIGFuIGludGVnZXIgb3IgdmFsaWQgcHJpb3JpdHkgbGV2ZWwnXG4gICAgICBwcmlvcml0eSA9IDBcbiAgICBAX2RvYy5wcmlvcml0eSA9IHByaW9yaXR5XG4gICAgcmV0dXJuIEBcblxuICAjIFNldHMgdGhlIG51bWJlciBvZiBhdHRlbXB0ZWQgcnVucyBvZiB0aGlzIGpvYiBhbmRcbiAgIyB0aGUgdGltZSB0byB3YWl0IGJldHdlZW4gc3VjY2Vzc2l2ZSBhdHRlbXB0c1xuICAjIERlZmF1bHQsIGRvIG5vdCByZXRyeVxuICByZXRyeTogKG9wdGlvbnMgPSAwKSAtPlxuICAgIGlmIGlzSW50ZWdlcihvcHRpb25zKSBhbmQgb3B0aW9ucyA+PSAwXG4gICAgICBvcHRpb25zID0geyByZXRyaWVzOiBvcHRpb25zIH1cbiAgICBpZiB0eXBlb2Ygb3B0aW9ucyBpc250ICdvYmplY3QnXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgJ2JhZCBwYXJhbWV0ZXI6IGFjY2VwdHMgZWl0aGVyIGFuIGludGVnZXIgPj0gMCBvciBhbiBvcHRpb25zIG9iamVjdCdcbiAgICBpZiBvcHRpb25zLnJldHJpZXM/XG4gICAgICB1bmxlc3MgaXNJbnRlZ2VyKG9wdGlvbnMucmV0cmllcykgYW5kIG9wdGlvbnMucmV0cmllcyA+PSAwXG4gICAgICAgIHRocm93IG5ldyBFcnJvciAnYmFkIG9wdGlvbjogcmV0cmllcyBtdXN0IGJlIGFuIGludGVnZXIgPj0gMCdcbiAgICAgIG9wdGlvbnMucmV0cmllcysrXG4gICAgZWxzZVxuICAgICAgb3B0aW9ucy5yZXRyaWVzID0gSm9iLmZvcmV2ZXJcbiAgICBpZiBvcHRpb25zLnVudGlsP1xuICAgICAgdW5sZXNzIG9wdGlvbnMudW50aWwgaW5zdGFuY2VvZiBEYXRlXG4gICAgICAgIHRocm93IG5ldyBFcnJvciAnYmFkIG9wdGlvbjogdW50aWwgbXVzdCBiZSBhIERhdGUgb2JqZWN0J1xuICAgIGVsc2VcbiAgICAgIG9wdGlvbnMudW50aWwgPSBKb2IuZm9yZXZlckRhdGVcbiAgICBpZiBvcHRpb25zLndhaXQ/XG4gICAgICB1bmxlc3MgaXNJbnRlZ2VyKG9wdGlvbnMud2FpdCkgYW5kIG9wdGlvbnMud2FpdCA+PSAwXG4gICAgICAgIHRocm93IG5ldyBFcnJvciAnYmFkIG9wdGlvbjogd2FpdCBtdXN0IGJlIGFuIGludGVnZXIgPj0gMCdcbiAgICBlbHNlXG4gICAgICBvcHRpb25zLndhaXQgPSA1KjYwKjEwMDBcbiAgICBpZiBvcHRpb25zLmJhY2tvZmY/XG4gICAgICB1bmxlc3Mgb3B0aW9ucy5iYWNrb2ZmIGluIEpvYi5qb2JSZXRyeUJhY2tvZmZNZXRob2RzXG4gICAgICAgIHRocm93IG5ldyBFcnJvciAnYmFkIG9wdGlvbjogaW52YWxpZCByZXRyeSBiYWNrb2ZmIG1ldGhvZCdcbiAgICBlbHNlXG4gICAgICBvcHRpb25zLmJhY2tvZmYgPSAnY29uc3RhbnQnXG5cbiAgICBAX2RvYy5yZXRyaWVzID0gb3B0aW9ucy5yZXRyaWVzXG4gICAgQF9kb2MucmVwZWF0UmV0cmllcyA9IG9wdGlvbnMucmV0cmllc1xuICAgIEBfZG9jLnJldHJ5V2FpdCA9IG9wdGlvbnMud2FpdFxuICAgIEBfZG9jLnJldHJpZWQgPz0gMFxuICAgIEBfZG9jLnJldHJ5QmFja29mZiA9IG9wdGlvbnMuYmFja29mZlxuICAgIEBfZG9jLnJldHJ5VW50aWwgPSBvcHRpb25zLnVudGlsXG4gICAgcmV0dXJuIEBcblxuICAjIFNldHMgdGhlIG51bWJlciBvZiB0aW1lcyB0byByZXBlYXRlZGx5IHJ1biB0aGlzIGpvYlxuICAjIGFuZCB0aGUgdGltZSB0byB3YWl0IGJldHdlZW4gc3VjY2Vzc2l2ZSBydW5zXG4gICMgRGVmYXVsdDogcmVwZWF0IGV2ZXJ5IDUgbWludXRlcywgZm9yZXZlci4uLlxuICByZXBlYXQ6IChvcHRpb25zID0gMCkgLT5cbiAgICBpZiBpc0ludGVnZXIob3B0aW9ucykgYW5kIG9wdGlvbnMgPj0gMFxuICAgICAgb3B0aW9ucyA9IHsgcmVwZWF0czogb3B0aW9ucyB9XG4gICAgaWYgdHlwZW9mIG9wdGlvbnMgaXNudCAnb2JqZWN0J1xuICAgICAgdGhyb3cgbmV3IEVycm9yICdiYWQgcGFyYW1ldGVyOiBhY2NlcHRzIGVpdGhlciBhbiBpbnRlZ2VyID49IDAgb3IgYW4gb3B0aW9ucyBvYmplY3QnXG4gICAgaWYgb3B0aW9ucy53YWl0PyBhbmQgb3B0aW9ucy5zY2hlZHVsZT9cbiAgICAgIHRocm93IG5ldyBFcnJvciAnYmFkIG9wdGlvbnM6IHdhaXQgYW5kIHNjaGVkdWxlIG9wdGlvbnMgYXJlIG11dHVhbGx5IGV4Y2x1c2l2ZSdcbiAgICBpZiBvcHRpb25zLnJlcGVhdHM/XG4gICAgICB1bmxlc3MgaXNJbnRlZ2VyKG9wdGlvbnMucmVwZWF0cykgYW5kIG9wdGlvbnMucmVwZWF0cyA+PSAwXG4gICAgICAgIHRocm93IG5ldyBFcnJvciAnYmFkIG9wdGlvbjogcmVwZWF0cyBtdXN0IGJlIGFuIGludGVnZXIgPj0gMCdcbiAgICBlbHNlXG4gICAgICBvcHRpb25zLnJlcGVhdHMgPSBKb2IuZm9yZXZlclxuICAgIGlmIG9wdGlvbnMudW50aWw/XG4gICAgICB1bmxlc3Mgb3B0aW9ucy51bnRpbCBpbnN0YW5jZW9mIERhdGVcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yICdiYWQgb3B0aW9uOiB1bnRpbCBtdXN0IGJlIGEgRGF0ZSBvYmplY3QnXG4gICAgZWxzZVxuICAgICAgb3B0aW9ucy51bnRpbCA9IEpvYi5mb3JldmVyRGF0ZVxuICAgIGlmIG9wdGlvbnMud2FpdD9cbiAgICAgIHVubGVzcyBpc0ludGVnZXIob3B0aW9ucy53YWl0KSBhbmQgb3B0aW9ucy53YWl0ID49IDBcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yICdiYWQgb3B0aW9uOiB3YWl0IG11c3QgYmUgYW4gaW50ZWdlciA+PSAwJ1xuICAgIGVsc2VcbiAgICAgIG9wdGlvbnMud2FpdCA9IDUqNjAqMTAwMFxuICAgIGlmIG9wdGlvbnMuc2NoZWR1bGU/XG4gICAgICB1bmxlc3MgdHlwZW9mIG9wdGlvbnMuc2NoZWR1bGUgaXMgJ29iamVjdCdcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yICdiYWQgb3B0aW9uLCBzY2hlZHVsZSBvcHRpb24gbXVzdCBiZSBhbiBvYmplY3QnXG4gICAgICB1bmxlc3Mgb3B0aW9ucy5zY2hlZHVsZT8uc2NoZWR1bGVzPyBhbmQgb3B0aW9ucy5zY2hlZHVsZS5zY2hlZHVsZXMgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgJ2JhZCBvcHRpb24sIHNjaGVkdWxlIG9iamVjdCByZXF1aXJlcyBhIHNjaGVkdWxlcyBhdHRyaWJ1dGUgb2YgdHlwZSBBcnJheS4nXG4gICAgICBpZiBvcHRpb25zLnNjaGVkdWxlLmV4Y2VwdGlvbnM/IGFuZCBub3QgKG9wdGlvbnMuc2NoZWR1bGUuZXhjZXB0aW9ucyBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgJ2JhZCBvcHRpb24sIHNjaGVkdWxlIG9iamVjdCBleGNlcHRpb25zIGF0dHJpYnV0ZSBtdXN0IGJlIGFuIEFycmF5J1xuICAgICAgb3B0aW9ucy53YWl0ID1cbiAgICAgICAgc2NoZWR1bGVzOiBvcHRpb25zLnNjaGVkdWxlLnNjaGVkdWxlc1xuICAgICAgICBleGNlcHRpb25zOiBvcHRpb25zLnNjaGVkdWxlLmV4Y2VwdGlvbnNcblxuICAgIEBfZG9jLnJlcGVhdHMgPSBvcHRpb25zLnJlcGVhdHNcbiAgICBAX2RvYy5yZXBlYXRXYWl0ID0gb3B0aW9ucy53YWl0XG4gICAgQF9kb2MucmVwZWF0ZWQgPz0gMFxuICAgIEBfZG9jLnJlcGVhdFVudGlsID0gb3B0aW9ucy51bnRpbFxuICAgIHJldHVybiBAXG5cbiAgIyBTZXRzIHRoZSBkZWxheSBiZWZvcmUgdGhpcyBqb2IgY2FuIHJ1biBhZnRlciBpdCBpcyBzYXZlZFxuICBkZWxheTogKHdhaXQgPSAwKSAtPlxuICAgIHVubGVzcyBpc0ludGVnZXIod2FpdCkgYW5kIHdhaXQgPj0gMFxuICAgICAgdGhyb3cgbmV3IEVycm9yICdCYWQgcGFyYW1ldGVyLCBkZWxheSByZXF1aXJlcyBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLidcbiAgICByZXR1cm4gQGFmdGVyIG5ldyBEYXRlKG5ldyBEYXRlKCkudmFsdWVPZigpICsgd2FpdClcblxuICAjIFNldHMgYSB0aW1lIGFmdGVyIHdoaWNoIHRoaXMgam9iIGNhbiBydW4gb25jZSBpdCBpcyBzYXZlZFxuICBhZnRlcjogKHRpbWUgPSBuZXcgRGF0ZSgwKSkgLT5cbiAgICBpZiB0eXBlb2YgdGltZSBpcyAnb2JqZWN0JyBhbmQgdGltZSBpbnN0YW5jZW9mIERhdGVcbiAgICAgIGFmdGVyID0gdGltZVxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciAnQmFkIHBhcmFtZXRlciwgYWZ0ZXIgcmVxdWlyZXMgYSB2YWxpZCBEYXRlIG9iamVjdCdcbiAgICBAX2RvYy5hZnRlciA9IGFmdGVyXG4gICAgcmV0dXJuIEBcblxuICAjIFdyaXRlIGEgbWVzc2FnZSB0byB0aGlzIGpvYidzIGxvZy5cbiAgbG9nOiAobWVzc2FnZSwgb3B0aW9ucy4uLiwgY2IpIC0+XG4gICAgW29wdGlvbnMsIGNiXSA9IG9wdGlvbnNIZWxwIG9wdGlvbnMsIGNiXG4gICAgb3B0aW9ucy5sZXZlbCA/PSAnaW5mbydcbiAgICB1bmxlc3MgdHlwZW9mIG1lc3NhZ2UgaXMgJ3N0cmluZydcbiAgICAgIHRocm93IG5ldyBFcnJvciAnTG9nIG1lc3NhZ2UgbXVzdCBiZSBhIHN0cmluZydcbiAgICB1bmxlc3MgdHlwZW9mIG9wdGlvbnMubGV2ZWwgaXMgJ3N0cmluZycgYW5kIG9wdGlvbnMubGV2ZWwgaW4gSm9iLmpvYkxvZ0xldmVsc1xuICAgICAgdGhyb3cgbmV3IEVycm9yICdMb2cgbGV2ZWwgb3B0aW9ucyBtdXN0IGJlIG9uZSBvZiBKb2Iuam9iTG9nTGV2ZWxzJ1xuICAgIGlmIG9wdGlvbnMuZWNobz9cbiAgICAgIGlmIG9wdGlvbnMuZWNobyBhbmQgSm9iLmpvYkxvZ0xldmVscy5pbmRleE9mKG9wdGlvbnMubGV2ZWwpID49IEpvYi5qb2JMb2dMZXZlbHMuaW5kZXhPZihvcHRpb25zLmVjaG8pXG4gICAgICAgIEBfZWNobyBcIkxPRzogI3tvcHRpb25zLmxldmVsfSwgI3tAX2RvYy5faWR9ICN7QF9kb2MucnVuSWR9OiAje21lc3NhZ2V9XCIsIG9wdGlvbnMubGV2ZWxcbiAgICAgIGRlbGV0ZSBvcHRpb25zLmVjaG9cbiAgICBpZiBAX2RvYy5faWQ/XG4gICAgICByZXR1cm4gbWV0aG9kQ2FsbCBAX3Jvb3QsIFwiam9iTG9nXCIsIFtAX2RvYy5faWQsIEBfZG9jLnJ1bklkLCBtZXNzYWdlLCBvcHRpb25zXSwgY2JcbiAgICBlbHNlICAjIExvZyBjYW4gYmUgY2FsbGVkIG9uIGFuIHVuc2F2ZWQgam9iXG4gICAgICBAX2RvYy5sb2cgPz0gW11cbiAgICAgIEBfZG9jLmxvZy5wdXNoIHsgdGltZTogbmV3IERhdGUoKSwgcnVuSWQ6IG51bGwsIGxldmVsOiBvcHRpb25zLmxldmVsLCBtZXNzYWdlOiBtZXNzYWdlIH1cbiAgICAgIGlmIGNiPyBhbmQgdHlwZW9mIGNiIGlzICdmdW5jdGlvbidcbiAgICAgICAgX3NldEltbWVkaWF0ZSBjYiwgbnVsbCwgdHJ1ZSAgICMgRE8gTk9UIHJlbGVhc2UgWmFsZ29cbiAgICAgIHJldHVybiBAICAjIEFsbG93IGNhbGwgY2hhaW5pbmcgaW4gdGhpcyBjYXNlXG5cbiAgIyBJbmRpY2F0ZSBwcm9ncmVzcyBtYWRlIGZvciBhIHJ1bm5pbmcgam9iLiBUaGlzIGlzIGltcG9ydGFudCBmb3JcbiAgIyBsb25nIHJ1bm5pbmcgam9icyBzbyB0aGUgc2NoZWR1bGVyIGRvZXNuJ3QgYXNzdW1lIHRoZXkgYXJlIGRlYWRcbiAgcHJvZ3Jlc3M6IChjb21wbGV0ZWQgPSAwLCB0b3RhbCA9IDEsIG9wdGlvbnMuLi4sIGNiKSAtPlxuICAgIFtvcHRpb25zLCBjYl0gPSBvcHRpb25zSGVscCBvcHRpb25zLCBjYlxuICAgIGlmICh0eXBlb2YgY29tcGxldGVkIGlzICdudW1iZXInIGFuZFxuICAgICAgICB0eXBlb2YgdG90YWwgaXMgJ251bWJlcicgYW5kXG4gICAgICAgIGNvbXBsZXRlZCA+PSAwIGFuZFxuICAgICAgICB0b3RhbCA+IDAgYW5kXG4gICAgICAgIHRvdGFsID49IGNvbXBsZXRlZClcbiAgICAgIHByb2dyZXNzID1cbiAgICAgICAgY29tcGxldGVkOiBjb21wbGV0ZWRcbiAgICAgICAgdG90YWw6IHRvdGFsXG4gICAgICAgIHBlcmNlbnQ6IDEwMCpjb21wbGV0ZWQvdG90YWxcbiAgICAgIGlmIG9wdGlvbnMuZWNob1xuICAgICAgICBkZWxldGUgb3B0aW9ucy5lY2hvXG4gICAgICAgIEBfZWNobyBcIlBST0dSRVNTOiAje0BfZG9jLl9pZH0gI3tAX2RvYy5ydW5JZH06ICN7cHJvZ3Jlc3MuY29tcGxldGVkfSBvdXQgb2YgI3twcm9ncmVzcy50b3RhbH0gKCN7cHJvZ3Jlc3MucGVyY2VudH0lKVwiXG4gICAgICBpZiBAX2RvYy5faWQ/IGFuZCBAX2RvYy5ydW5JZD9cbiAgICAgICAgcmV0dXJuIG1ldGhvZENhbGwgQF9yb290LCBcImpvYlByb2dyZXNzXCIsIFtAX2RvYy5faWQsIEBfZG9jLnJ1bklkLCBjb21wbGV0ZWQsIHRvdGFsLCBvcHRpb25zXSwgY2IsIChyZXMpID0+XG4gICAgICAgICAgaWYgcmVzXG4gICAgICAgICAgICBAX2RvYy5wcm9ncmVzcyA9IHByb2dyZXNzXG4gICAgICAgICAgcmVzXG4gICAgICBlbHNlIHVubGVzcyBAX2RvYy5faWQ/XG4gICAgICAgIEBfZG9jLnByb2dyZXNzID0gcHJvZ3Jlc3NcbiAgICAgICAgaWYgY2I/IGFuZCB0eXBlb2YgY2IgaXMgJ2Z1bmN0aW9uJ1xuICAgICAgICAgIF9zZXRJbW1lZGlhdGUgY2IsIG51bGwsIHRydWUgICAjIERPIE5PVCByZWxlYXNlIFphbGdvXG4gICAgICAgIHJldHVybiBAXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiam9iLnByb2dyZXNzOiBzb21ldGhpbmcgaXMgd3Jvbmcgd2l0aCBwcm9ncmVzcyBwYXJhbXM6ICN7QGlkfSwgI3tjb21wbGV0ZWR9IG91dCBvZiAje3RvdGFsfVwiXG4gICAgcmV0dXJuIG51bGxcblxuICAjIFNhdmUgdGhpcyBqb2IgdG8gdGhlIHNlcnZlciBqb2IgcXVldWUgQ29sbGVjdGlvbiBpdCB3aWxsIGFsc28gcmVzYXZlIGEgbW9kaWZpZWQgam9iIGlmIHRoZVxuICAjIGpvYiBpcyBub3QgcnVubmluZyBhbmQgaGFzbid0IGNvbXBsZXRlZC5cbiAgc2F2ZTogKG9wdGlvbnMuLi4sIGNiKSAtPlxuICAgIFtvcHRpb25zLCBjYl0gPSBvcHRpb25zSGVscCBvcHRpb25zLCBjYlxuICAgIHJldHVybiBtZXRob2RDYWxsIEBfcm9vdCwgXCJqb2JTYXZlXCIsIFtAX2RvYywgb3B0aW9uc10sIGNiLCAoaWQpID0+XG4gICAgICBpZiBpZFxuICAgICAgICBAX2RvYy5faWQgPSBpZFxuICAgICAgaWRcblxuICAjIFJlZnJlc2ggdGhlIGxvY2FsIGpvYiBzdGF0ZSB3aXRoIHRoZSBzZXJ2ZXIgam9iIHF1ZXVlJ3MgdmVyc2lvblxuICByZWZyZXNoOiAob3B0aW9ucy4uLiwgY2IpIC0+XG4gICAgW29wdGlvbnMsIGNiXSA9IG9wdGlvbnNIZWxwIG9wdGlvbnMsIGNiXG4gICAgb3B0aW9ucy5nZXRMb2cgPz0gZmFsc2VcbiAgICBpZiBAX2RvYy5faWQ/XG4gICAgICByZXR1cm4gbWV0aG9kQ2FsbCBAX3Jvb3QsIFwiZ2V0Sm9iXCIsIFtAX2RvYy5faWQsIG9wdGlvbnNdLCBjYiwgKGRvYykgPT5cbiAgICAgICAgaWYgZG9jP1xuICAgICAgICAgIEBfZG9jID0gZG9jXG4gICAgICAgICAgQFxuICAgICAgICBlbHNlXG4gICAgICAgICAgZmFsc2VcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCBjYWxsIC5yZWZyZXNoKCkgb24gYW4gdW5zYXZlZCBqb2JcIlxuXG4gICMgSW5kaWNhdGUgdG8gdGhlIHNlcnZlciB0aGF0IHRoaXMgcnVuIGhhcyBzdWNjZXNzZnVsbHkgZmluaXNoZWQuXG4gIGRvbmU6IChyZXN1bHQgPSB7fSwgb3B0aW9ucy4uLiwgY2IpIC0+XG4gICAgaWYgdHlwZW9mIHJlc3VsdCBpcyAnZnVuY3Rpb24nXG4gICAgICBjYiA9IHJlc3VsdFxuICAgICAgcmVzdWx0ID0ge31cbiAgICBbb3B0aW9ucywgY2JdID0gb3B0aW9uc0hlbHAgb3B0aW9ucywgY2JcbiAgICB1bmxlc3MgcmVzdWx0PyBhbmQgdHlwZW9mIHJlc3VsdCBpcyAnb2JqZWN0J1xuICAgICAgcmVzdWx0ID0geyB2YWx1ZTogcmVzdWx0IH1cbiAgICBpZiBAX2RvYy5faWQ/IGFuZCBAX2RvYy5ydW5JZD9cbiAgICAgIHJldHVybiBtZXRob2RDYWxsIEBfcm9vdCwgXCJqb2JEb25lXCIsIFtAX2RvYy5faWQsIEBfZG9jLnJ1bklkLCByZXN1bHQsIG9wdGlvbnNdLCBjYlxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGNhbGwgLmRvbmUoKSBvbiBhbiB1bnNhdmVkIG9yIG5vbi1ydW5uaW5nIGpvYlwiXG4gICAgcmV0dXJuIG51bGxcblxuICAjIEluZGljYXRlIHRvIHRoZSBzZXJ2ZXIgdGhhdCB0aGlzIHJ1biBoYXMgZmFpbGVkIGFuZCBwcm92aWRlIGFuIGVycm9yIG1lc3NhZ2UuXG4gIGZhaWw6IChyZXN1bHQgPSBcIk5vIGVycm9yIGluZm9ybWF0aW9uIHByb3ZpZGVkXCIsIG9wdGlvbnMuLi4sIGNiKSAtPlxuICAgIGlmIHR5cGVvZiByZXN1bHQgaXMgJ2Z1bmN0aW9uJ1xuICAgICAgY2IgPSByZXN1bHRcbiAgICAgIHJlc3VsdCA9IFwiTm8gZXJyb3IgaW5mb3JtYXRpb24gcHJvdmlkZWRcIlxuICAgIFtvcHRpb25zLCBjYl0gPSBvcHRpb25zSGVscCBvcHRpb25zLCBjYlxuICAgIHVubGVzcyByZXN1bHQ/IGFuZCB0eXBlb2YgcmVzdWx0IGlzICdvYmplY3QnXG4gICAgICByZXN1bHQgPSB7IHZhbHVlOiByZXN1bHQgfVxuICAgIG9wdGlvbnMuZmF0YWwgPz0gZmFsc2VcbiAgICBpZiBAX2RvYy5faWQ/IGFuZCBAX2RvYy5ydW5JZD9cbiAgICAgIHJldHVybiBtZXRob2RDYWxsIEBfcm9vdCwgXCJqb2JGYWlsXCIsIFtAX2RvYy5faWQsIEBfZG9jLnJ1bklkLCByZXN1bHQsIG9wdGlvbnNdLCBjYlxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGNhbGwgLmZhaWwoKSBvbiBhbiB1bnNhdmVkIG9yIG5vbi1ydW5uaW5nIGpvYlwiXG4gICAgcmV0dXJuIG51bGxcblxuICAjIFBhdXNlIHRoaXMgam9iLCBvbmx5IFJlYWR5IGFuZCBXYWl0aW5nIGpvYnMgY2FuIGJlIHBhdXNlZFxuICBwYXVzZTogKG9wdGlvbnMuLi4sIGNiKSAtPlxuICAgIFtvcHRpb25zLCBjYl0gPSBvcHRpb25zSGVscCBvcHRpb25zLCBjYlxuICAgIGlmIEBfZG9jLl9pZD9cbiAgICAgIHJldHVybiBtZXRob2RDYWxsIEBfcm9vdCwgXCJqb2JQYXVzZVwiLCBbQF9kb2MuX2lkLCBvcHRpb25zXSwgY2JcbiAgICBlbHNlXG4gICAgICBAX2RvYy5zdGF0dXMgPSAncGF1c2VkJ1xuICAgICAgaWYgY2I/IGFuZCB0eXBlb2YgY2IgaXMgJ2Z1bmN0aW9uJ1xuICAgICAgICBfc2V0SW1tZWRpYXRlIGNiLCBudWxsLCB0cnVlICAjIERPIE5PVCByZWxlYXNlIFphbGdvXG4gICAgICByZXR1cm4gQFxuICAgIHJldHVybiBudWxsXG5cbiAgIyBSZXN1bWUgdGhpcyBqb2IsIG9ubHkgUGF1c2VkIGpvYnMgY2FuIGJlIHJlc3VtZWRcbiAgIyBSZXN1bWVkIGpvYnMgZ28gdG8gd2FpdGluZ1xuICByZXN1bWU6IChvcHRpb25zLi4uLCBjYikgLT5cbiAgICBbb3B0aW9ucywgY2JdID0gb3B0aW9uc0hlbHAgb3B0aW9ucywgY2JcbiAgICBpZiBAX2RvYy5faWQ/XG4gICAgICByZXR1cm4gbWV0aG9kQ2FsbCBAX3Jvb3QsIFwiam9iUmVzdW1lXCIsIFtAX2RvYy5faWQsIG9wdGlvbnNdLCBjYlxuICAgIGVsc2VcbiAgICAgIEBfZG9jLnN0YXR1cyA9ICd3YWl0aW5nJ1xuICAgICAgaWYgY2I/IGFuZCB0eXBlb2YgY2IgaXMgJ2Z1bmN0aW9uJ1xuICAgICAgICBfc2V0SW1tZWRpYXRlIGNiLCBudWxsLCB0cnVlICAjIERPIE5PVCByZWxlYXNlIFphbGdvXG4gICAgICByZXR1cm4gQFxuICAgIHJldHVybiBudWxsXG5cbiAgIyBNYWtlIGEgd2FpdGluZyBqb2IgcmVhZHkgdG8gcnVuLiBKb2JzIHdpdGggZGVwZW5kZW5jaWVzIG9ubHkgd2hlbiBmb3JjZWRcbiAgcmVhZHk6IChvcHRpb25zLi4uLCBjYikgLT5cbiAgICBbb3B0aW9ucywgY2JdID0gb3B0aW9uc0hlbHAgb3B0aW9ucywgY2JcbiAgICBvcHRpb25zLmZvcmNlID89IGZhbHNlXG4gICAgaWYgQF9kb2MuX2lkP1xuICAgICAgcmV0dXJuIG1ldGhvZENhbGwgQF9yb290LCBcImpvYlJlYWR5XCIsIFtAX2RvYy5faWQsIG9wdGlvbnNdLCBjYlxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGNhbGwgLnJlYWR5KCkgb24gYW4gdW5zYXZlZCBqb2JcIlxuICAgIHJldHVybiBudWxsXG5cbiAgIyBDYW5jZWwgdGhpcyBqb2IgaWYgaXQgaXMgcnVubmluZyBvciBhYmxlIHRvIHJ1biAod2FpdGluZywgcmVhZHkpXG4gIGNhbmNlbDogKG9wdGlvbnMuLi4sIGNiKSAtPlxuICAgIFtvcHRpb25zLCBjYl0gPSBvcHRpb25zSGVscCBvcHRpb25zLCBjYlxuICAgIG9wdGlvbnMuYW50ZWNlZGVudHMgPz0gdHJ1ZVxuICAgIGlmIEBfZG9jLl9pZD9cbiAgICAgIHJldHVybiBtZXRob2RDYWxsIEBfcm9vdCwgXCJqb2JDYW5jZWxcIiwgW0BfZG9jLl9pZCwgb3B0aW9uc10sIGNiXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgY2FsbCAuY2FuY2VsKCkgb24gYW4gdW5zYXZlZCBqb2JcIlxuICAgIHJldHVybiBudWxsXG5cbiAgIyBSZXN0YXJ0IGEgZmFpbGVkIG9yIGNhbmNlbGxlZCBqb2JcbiAgcmVzdGFydDogKG9wdGlvbnMuLi4sIGNiKSAtPlxuICAgIFtvcHRpb25zLCBjYl0gPSBvcHRpb25zSGVscCBvcHRpb25zLCBjYlxuICAgIG9wdGlvbnMucmV0cmllcyA/PSAxXG4gICAgb3B0aW9ucy5kZXBlbmRlbnRzID89IHRydWVcbiAgICBpZiBAX2RvYy5faWQ/XG4gICAgICByZXR1cm4gbWV0aG9kQ2FsbCBAX3Jvb3QsIFwiam9iUmVzdGFydFwiLCBbQF9kb2MuX2lkLCBvcHRpb25zXSwgY2JcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCBjYWxsIC5yZXN0YXJ0KCkgb24gYW4gdW5zYXZlZCBqb2JcIlxuICAgIHJldHVybiBudWxsXG5cbiAgIyBSdW4gYSBjb21wbGV0ZWQgam9iIGFnYWluIGFzIGEgbmV3IGpvYiwgZXNzZW50aWFsbHkgYSBtYW51YWwgcmVwZWF0XG4gIHJlcnVuOiAob3B0aW9ucy4uLiwgY2IpIC0+XG4gICAgW29wdGlvbnMsIGNiXSA9IG9wdGlvbnNIZWxwIG9wdGlvbnMsIGNiXG4gICAgb3B0aW9ucy5yZXBlYXRzID89IDBcbiAgICBvcHRpb25zLndhaXQgPz0gQF9kb2MucmVwZWF0V2FpdFxuICAgIGlmIEBfZG9jLl9pZD9cbiAgICAgIHJldHVybiBtZXRob2RDYWxsIEBfcm9vdCwgXCJqb2JSZXJ1blwiLCBbQF9kb2MuX2lkLCBvcHRpb25zXSwgY2JcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCBjYWxsIC5yZXJ1bigpIG9uIGFuIHVuc2F2ZWQgam9iXCJcbiAgICByZXR1cm4gbnVsbFxuXG4gICMgUmVtb3ZlIGEgam9iIHRoYXQgaXMgbm90IGFibGUgdG8gcnVuIChjb21wbGV0ZWQsIGNhbmNlbGxlZCwgZmFpbGVkKSBmcm9tIHRoZSBxdWV1ZVxuICByZW1vdmU6IChvcHRpb25zLi4uLCBjYikgLT5cbiAgICBbb3B0aW9ucywgY2JdID0gb3B0aW9uc0hlbHAgb3B0aW9ucywgY2JcbiAgICBpZiBAX2RvYy5faWQ/XG4gICAgICByZXR1cm4gbWV0aG9kQ2FsbCBAX3Jvb3QsIFwiam9iUmVtb3ZlXCIsIFtAX2RvYy5faWQsIG9wdGlvbnNdLCBjYlxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGNhbGwgLnJlbW92ZSgpIG9uIGFuIHVuc2F2ZWQgam9iXCJcbiAgICByZXR1cm4gbnVsbFxuXG4gICAgIyBEZWZpbmUgY29udmVuaWVuY2UgZ2V0dGVycyBmb3Igc29tZSBkb2N1bWVudCBwcm9wZXJ0aWVzXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzIEBwcm90b3R5cGUsXG4gICAgZG9jOlxuICAgICAgZ2V0OiAoKSAtPiBAX2RvY1xuICAgICAgc2V0OiAoKSAtPiBjb25zb2xlLndhcm4gXCJKb2IuZG9jIGNhbm5vdCBiZSBkaXJlY3RseSBhc3NpZ25lZC5cIlxuICAgIHR5cGU6XG4gICAgICBnZXQ6ICgpIC0+IEBfZG9jLnR5cGVcbiAgICAgIHNldDogKCkgLT4gY29uc29sZS53YXJuIFwiSm9iLnR5cGUgY2Fubm90IGJlIGRpcmVjdGx5IGFzc2lnbmVkLlwiXG4gICAgZGF0YTpcbiAgICAgIGdldDogKCkgLT4gQF9kb2MuZGF0YVxuICAgICAgc2V0OiAoKSAtPiBjb25zb2xlLndhcm4gXCJKb2IuZGF0YSBjYW5ub3QgYmUgZGlyZWN0bHkgYXNzaWduZWQuXCJcblxuIyBFeHBvcnQgSm9iIGluIGEgbnBtIHBhY2thZ2VcbmlmIG1vZHVsZT8uZXhwb3J0cz9cbiAgbW9kdWxlLmV4cG9ydHMgPSBKb2JcbiIsInZhciBKb2JRdWV1ZSwgX2NsZWFySW50ZXJ2YWwsIF9zZXRJbW1lZGlhdGUsIF9zZXRJbnRlcnZhbCwgY29uY2F0UmVkdWNlLCBpc0Jvb2xlYW4sIGlzRnVuY3Rpb24sIGlzSW50ZWdlciwgaXNOb25FbXB0eVN0cmluZywgaXNOb25FbXB0eVN0cmluZ09yQXJyYXlPZk5vbkVtcHR5U3RyaW5ncywgbWV0aG9kQ2FsbCwgb3B0aW9uc0hlbHAsIHJlZHVjZUNhbGxiYWNrcywgc3BsaXRMb25nQXJyYXksICAgICBcbiAgc2xpY2UgPSBbXS5zbGljZSxcbiAgaW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG5tZXRob2RDYWxsID0gZnVuY3Rpb24ocm9vdCwgbWV0aG9kLCBwYXJhbXMsIGNiLCBhZnRlcikge1xuICB2YXIgYXBwbHksIG5hbWUsIHJlZiwgcmVmMSwgcmVmMiwgcmVmMztcbiAgaWYgKGFmdGVyID09IG51bGwpIHtcbiAgICBhZnRlciA9IChmdW5jdGlvbihyZXQpIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSk7XG4gIH1cbiAgYXBwbHkgPSAocmVmID0gKHJlZjEgPSBKb2IuX2RkcF9hcHBseSkgIT0gbnVsbCA/IHJlZjFbKHJlZjIgPSByb290LnJvb3QpICE9IG51bGwgPyByZWYyIDogcm9vdF0gOiB2b2lkIDApICE9IG51bGwgPyByZWYgOiBKb2IuX2RkcF9hcHBseTtcbiAgaWYgKHR5cGVvZiBhcHBseSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkpvYiByZW1vdGUgbWV0aG9kIGNhbGwgZXJyb3IsIG5vIHZhbGlkIGludm9jYXRpb24gbWV0aG9kIGZvdW5kLlwiKTtcbiAgfVxuICBuYW1lID0gKChyZWYzID0gcm9vdC5yb290KSAhPSBudWxsID8gcmVmMyA6IHJvb3QpICsgXCJfXCIgKyBtZXRob2Q7XG4gIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gYXBwbHkobmFtZSwgcGFyYW1zLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlcnIsIHJlcykge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNiKG51bGwsIGFmdGVyKHJlcykpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGFmdGVyKGFwcGx5KG5hbWUsIHBhcmFtcykpO1xuICB9XG59O1xuXG5vcHRpb25zSGVscCA9IGZ1bmN0aW9uKG9wdGlvbnMsIGNiKSB7XG4gIHZhciByZWY7XG4gIGlmICgoY2IgIT0gbnVsbCkgJiYgdHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgb3B0aW9ucyA9IGNiO1xuICAgIGNiID0gdm9pZCAwO1xuICB9IGVsc2Uge1xuICAgIGlmICghKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJiBvcHRpb25zIGluc3RhbmNlb2YgQXJyYXkgJiYgb3B0aW9ucy5sZW5ndGggPCAyKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdvcHRpb25zLi4uIGluIG9wdGlvbnNIZWxwIG11c3QgYmUgYW4gQXJyYXkgd2l0aCB6ZXJvIG9yIG9uZSBlbGVtZW50cycpO1xuICAgIH1cbiAgICBvcHRpb25zID0gKHJlZiA9IG9wdGlvbnMgIT0gbnVsbCA/IG9wdGlvbnNbMF0gOiB2b2lkIDApICE9IG51bGwgPyByZWYgOiB7fTtcbiAgfVxuICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbiBvcHRpb25zSGVscCBvcHRpb25zIG5vdCBhbiBvYmplY3Qgb3IgYmFkIGNhbGxiYWNrJyk7XG4gIH1cbiAgcmV0dXJuIFtvcHRpb25zLCBjYl07XG59O1xuXG5zcGxpdExvbmdBcnJheSA9IGZ1bmN0aW9uKGFyciwgbWF4KSB7XG4gIHZhciBpLCBrLCByZWYsIHJlc3VsdHM7XG4gIGlmICghKGFyciBpbnN0YW5jZW9mIEFycmF5ICYmIG1heCA+IDApKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzcGxpdExvbmdBcnJheTogYmFkIHBhcmFtcycpO1xuICB9XG4gIHJlc3VsdHMgPSBbXTtcbiAgZm9yIChpID0gayA9IDAsIHJlZiA9IE1hdGguY2VpbChhcnIubGVuZ3RoIC8gbWF4KTsgMCA8PSByZWYgPyBrIDwgcmVmIDogayA+IHJlZjsgaSA9IDAgPD0gcmVmID8gKytrIDogLS1rKSB7XG4gICAgcmVzdWx0cy5wdXNoKGFyci5zbGljZShpICogbWF4LCAoaSArIDEpICogbWF4KSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHM7XG59O1xuXG5yZWR1Y2VDYWxsYmFja3MgPSBmdW5jdGlvbihjYiwgbnVtLCByZWR1Y2UsIGluaXQpIHtcbiAgdmFyIGNiQ291bnQsIGNiRXJyLCBjYlJldFZhbDtcbiAgaWYgKHJlZHVjZSA9PSBudWxsKSB7XG4gICAgcmVkdWNlID0gKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhIHx8IGI7XG4gICAgfSk7XG4gIH1cbiAgaWYgKGluaXQgPT0gbnVsbCkge1xuICAgIGluaXQgPSBmYWxzZTtcbiAgfVxuICBpZiAoY2IgPT0gbnVsbCkge1xuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cbiAgaWYgKCEodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nICYmIG51bSA+IDAgJiYgdHlwZW9mIHJlZHVjZSA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0JhZCBwYXJhbXMgZ2l2ZW4gdG8gcmVkdWNlQ2FsbGJhY2tzJyk7XG4gIH1cbiAgY2JSZXRWYWwgPSBpbml0O1xuICBjYkNvdW50ID0gMDtcbiAgY2JFcnIgPSBudWxsO1xuICByZXR1cm4gZnVuY3Rpb24oZXJyLCByZXMpIHtcbiAgICBpZiAoIWNiRXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNiRXJyID0gZXJyO1xuICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNiQ291bnQrKztcbiAgICAgICAgY2JSZXRWYWwgPSByZWR1Y2UoY2JSZXRWYWwsIHJlcyk7XG4gICAgICAgIGlmIChjYkNvdW50ID09PSBudW0pIHtcbiAgICAgICAgICByZXR1cm4gY2IobnVsbCwgY2JSZXRWYWwpO1xuICAgICAgICB9IGVsc2UgaWYgKGNiQ291bnQgPiBudW0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJyZWR1Y2VDYWxsYmFja3MgY2FsbGJhY2sgaW52b2tlZCBtb3JlIHRoYW4gcmVxdWVzdGVkIFwiICsgbnVtICsgXCIgdGltZXNcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG59O1xuXG5jb25jYXRSZWR1Y2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gIGlmICghKGEgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBhID0gW2FdO1xuICB9XG4gIHJldHVybiBhLmNvbmNhdChiKTtcbn07XG5cbmlzSW50ZWdlciA9IGZ1bmN0aW9uKGkpIHtcbiAgcmV0dXJuIHR5cGVvZiBpID09PSAnbnVtYmVyJyAmJiBNYXRoLmZsb29yKGkpID09PSBpO1xufTtcblxuaXNCb29sZWFuID0gZnVuY3Rpb24oYikge1xuICByZXR1cm4gdHlwZW9mIGIgPT09ICdib29sZWFuJztcbn07XG5cbmlzRnVuY3Rpb24gPSBmdW5jdGlvbihmKSB7XG4gIHJldHVybiB0eXBlb2YgZiA9PT0gJ2Z1bmN0aW9uJztcbn07XG5cbmlzTm9uRW1wdHlTdHJpbmcgPSBmdW5jdGlvbihzKSB7XG4gIHJldHVybiB0eXBlb2YgcyA9PT0gJ3N0cmluZycgJiYgcy5sZW5ndGggPiAwO1xufTtcblxuaXNOb25FbXB0eVN0cmluZ09yQXJyYXlPZk5vbkVtcHR5U3RyaW5ncyA9IGZ1bmN0aW9uKHNhKSB7XG4gIHZhciBzO1xuICByZXR1cm4gaXNOb25FbXB0eVN0cmluZyhzYSkgfHwgc2EgaW5zdGFuY2VvZiBBcnJheSAmJiBzYS5sZW5ndGggIT09IDAgJiYgKChmdW5jdGlvbigpIHtcbiAgICB2YXIgaywgbGVuLCByZXN1bHRzO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGsgPSAwLCBsZW4gPSBzYS5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgcyA9IHNhW2tdO1xuICAgICAgaWYgKGlzTm9uRW1wdHlTdHJpbmcocykpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHMpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfSkoKSkubGVuZ3RoID09PSBzYS5sZW5ndGg7XG59O1xuXG5fc2V0SW1tZWRpYXRlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBhcmdzLCBmdW5jO1xuICBmdW5jID0gYXJndW1lbnRzWzBdLCBhcmdzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gIGlmICgodHlwZW9mIE1ldGVvciAhPT0gXCJ1bmRlZmluZWRcIiAmJiBNZXRlb3IgIT09IG51bGwgPyBNZXRlb3Iuc2V0VGltZW91dCA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgIHJldHVybiBNZXRlb3Iuc2V0VGltZW91dC5hcHBseShNZXRlb3IsIFtmdW5jLCAwXS5jb25jYXQoc2xpY2UuY2FsbChhcmdzKSkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBzZXRJbW1lZGlhdGUgIT09IFwidW5kZWZpbmVkXCIgJiYgc2V0SW1tZWRpYXRlICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIHNldEltbWVkaWF0ZS5hcHBseShudWxsLCBbZnVuY10uY29uY2F0KHNsaWNlLmNhbGwoYXJncykpKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc2V0VGltZW91dC5hcHBseShudWxsLCBbZnVuYywgMF0uY29uY2F0KHNsaWNlLmNhbGwoYXJncykpKTtcbiAgfVxufTtcblxuX3NldEludGVydmFsID0gZnVuY3Rpb24oKSB7XG4gIHZhciBhcmdzLCBmdW5jLCB0aW1lT3V0O1xuICBmdW5jID0gYXJndW1lbnRzWzBdLCB0aW1lT3V0ID0gYXJndW1lbnRzWzFdLCBhcmdzID0gMyA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpIDogW107XG4gIGlmICgodHlwZW9mIE1ldGVvciAhPT0gXCJ1bmRlZmluZWRcIiAmJiBNZXRlb3IgIT09IG51bGwgPyBNZXRlb3Iuc2V0SW50ZXJ2YWwgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICByZXR1cm4gTWV0ZW9yLnNldEludGVydmFsLmFwcGx5KE1ldGVvciwgW2Z1bmMsIHRpbWVPdXRdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3MpKSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHNldEludGVydmFsLmFwcGx5KG51bGwsIFtmdW5jLCB0aW1lT3V0XS5jb25jYXQoc2xpY2UuY2FsbChhcmdzKSkpO1xuICB9XG59O1xuXG5fY2xlYXJJbnRlcnZhbCA9IGZ1bmN0aW9uKGlkKSB7XG4gIGlmICgodHlwZW9mIE1ldGVvciAhPT0gXCJ1bmRlZmluZWRcIiAmJiBNZXRlb3IgIT09IG51bGwgPyBNZXRlb3IuY2xlYXJJbnRlcnZhbCA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgIHJldHVybiBNZXRlb3IuY2xlYXJJbnRlcnZhbChpZCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGNsZWFySW50ZXJ2YWwoaWQpO1xuICB9XG59O1xuXG5Kb2JRdWV1ZSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gSm9iUXVldWUoKSB7XG4gICAgdmFyIGssIG9wdGlvbnMsIHJlZiwgcmVmMSwgcmVmMiwgcmVmMywgcmVmNCwgcm9vdDEsIHR5cGUxLCB3b3JrZXI7XG4gICAgcm9vdDEgPSBhcmd1bWVudHNbMF0sIHR5cGUxID0gYXJndW1lbnRzWzFdLCBvcHRpb25zID0gNCA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIsIGsgPSBhcmd1bWVudHMubGVuZ3RoIC0gMSkgOiAoayA9IDIsIFtdKSwgd29ya2VyID0gYXJndW1lbnRzW2srK107XG4gICAgdGhpcy5yb290ID0gcm9vdDE7XG4gICAgdGhpcy50eXBlID0gdHlwZTE7XG4gICAgdGhpcy53b3JrZXIgPSB3b3JrZXI7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEpvYlF1ZXVlKSkge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKTtcbiAgICAgICAgcmV0dXJuIE9iamVjdChyZXN1bHQpID09PSByZXN1bHQgPyByZXN1bHQgOiBjaGlsZDtcbiAgICAgIH0pKEpvYlF1ZXVlLCBbdGhpcy5yb290LCB0aGlzLnR5cGVdLmNvbmNhdChzbGljZS5jYWxsKG9wdGlvbnMpLCBbdGhpcy53b3JrZXJdKSwgZnVuY3Rpb24oKXt9KTtcbiAgICB9XG4gICAgcmVmID0gb3B0aW9uc0hlbHAob3B0aW9ucywgdGhpcy53b3JrZXIpLCBvcHRpb25zID0gcmVmWzBdLCB0aGlzLndvcmtlciA9IHJlZlsxXTtcbiAgICBpZiAoIWlzTm9uRW1wdHlTdHJpbmcodGhpcy5yb290KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSm9iUXVldWU6IEludmFsaWQgcm9vdCwgbXVzdCBiZSBub25lbXB0eSBzdHJpbmdcIik7XG4gICAgfVxuICAgIGlmICghaXNOb25FbXB0eVN0cmluZ09yQXJyYXlPZk5vbkVtcHR5U3RyaW5ncyh0aGlzLnR5cGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJKb2JRdWV1ZTogSW52YWxpZCB0eXBlLCBtdXN0IGJlIG5vbmVtcHR5IHN0cmluZyBvciBhcnJheSBvZiBub25lbXB0eSBzdHJpbmdzXCIpO1xuICAgIH1cbiAgICBpZiAoIWlzRnVuY3Rpb24odGhpcy53b3JrZXIpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJKb2JRdWV1ZTogSW52YWxpZCB3b3JrZXIsIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICB9XG4gICAgdGhpcy5lcnJvckNhbGxiYWNrID0gKHJlZjEgPSBvcHRpb25zLmVycm9yQ2FsbGJhY2spICE9IG51bGwgPyByZWYxIDogZnVuY3Rpb24oZSkge1xuICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoXCJKb2JRdWV1ZTogXCIsIGUpO1xuICAgIH07XG4gICAgaWYgKCFpc0Z1bmN0aW9uKHRoaXMuZXJyb3JDYWxsYmFjaykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkpvYlF1ZXVlOiBJbnZhbGlkIGVycm9yQ2FsbGJhY2ssIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICB9XG4gICAgdGhpcy5wb2xsSW50ZXJ2YWwgPSAob3B0aW9ucy5wb2xsSW50ZXJ2YWwgIT0gbnVsbCkgJiYgIW9wdGlvbnMucG9sbEludGVydmFsID8gSm9iLmZvcmV2ZXIgOiAhKChvcHRpb25zLnBvbGxJbnRlcnZhbCAhPSBudWxsKSAmJiBpc0ludGVnZXIob3B0aW9ucy5wb2xsSW50ZXJ2YWwpKSA/IDUwMDAgOiBvcHRpb25zLnBvbGxJbnRlcnZhbDtcbiAgICBpZiAoIShpc0ludGVnZXIodGhpcy5wb2xsSW50ZXJ2YWwpICYmIHRoaXMucG9sbEludGVydmFsID49IDApKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJKb2JRdWV1ZTogSW52YWxpZCBwb2xsSW50ZXJ2YWwsIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyXCIpO1xuICAgIH1cbiAgICB0aGlzLmNvbmN1cnJlbmN5ID0gKHJlZjIgPSBvcHRpb25zLmNvbmN1cnJlbmN5KSAhPSBudWxsID8gcmVmMiA6IDE7XG4gICAgaWYgKCEoaXNJbnRlZ2VyKHRoaXMuY29uY3VycmVuY3kpICYmIHRoaXMuY29uY3VycmVuY3kgPj0gMCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkpvYlF1ZXVlOiBJbnZhbGlkIGNvbmN1cnJlbmN5LCBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlclwiKTtcbiAgICB9XG4gICAgdGhpcy5wYXlsb2FkID0gKHJlZjMgPSBvcHRpb25zLnBheWxvYWQpICE9IG51bGwgPyByZWYzIDogMTtcbiAgICBpZiAoIShpc0ludGVnZXIodGhpcy5wYXlsb2FkKSAmJiB0aGlzLnBheWxvYWQgPj0gMCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkpvYlF1ZXVlOiBJbnZhbGlkIHBheWxvYWQsIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyXCIpO1xuICAgIH1cbiAgICB0aGlzLnByZWZldGNoID0gKHJlZjQgPSBvcHRpb25zLnByZWZldGNoKSAhPSBudWxsID8gcmVmNCA6IDA7XG4gICAgaWYgKCEoaXNJbnRlZ2VyKHRoaXMucHJlZmV0Y2gpICYmIHRoaXMucHJlZmV0Y2ggPj0gMCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkpvYlF1ZXVlOiBJbnZhbGlkIHByZWZldGNoLCBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlclwiKTtcbiAgICB9XG4gICAgdGhpcy53b3JrVGltZW91dCA9IG9wdGlvbnMud29ya1RpbWVvdXQ7XG4gICAgaWYgKCh0aGlzLndvcmtUaW1lb3V0ICE9IG51bGwpICYmICEoaXNJbnRlZ2VyKHRoaXMud29ya1RpbWVvdXQpICYmIHRoaXMud29ya1RpbWVvdXQgPj0gMCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkpvYlF1ZXVlOiBJbnZhbGlkIHdvcmtUaW1lb3V0LCBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlclwiKTtcbiAgICB9XG4gICAgdGhpcy5jYWxsYmFja1N0cmljdCA9IG9wdGlvbnMuY2FsbGJhY2tTdHJpY3Q7XG4gICAgaWYgKCh0aGlzLmNhbGxiYWNrU3RyaWN0ICE9IG51bGwpICYmICFpc0Jvb2xlYW4odGhpcy5jYWxsYmFja1N0cmljdCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkpvYlF1ZXVlOiBJbnZhbGlkIGNhbGxiYWNrU3RyaWN0LCBtdXN0IGJlIGEgYm9vbGVhblwiKTtcbiAgICB9XG4gICAgdGhpcy5fd29ya2VycyA9IHt9O1xuICAgIHRoaXMuX3Rhc2tzID0gW107XG4gICAgdGhpcy5fdGFza051bWJlciA9IDA7XG4gICAgdGhpcy5fc3RvcHBpbmdHZXRXb3JrID0gdm9pZCAwO1xuICAgIHRoaXMuX3N0b3BwaW5nVGFza3MgPSB2b2lkIDA7XG4gICAgdGhpcy5faW50ZXJ2YWwgPSBudWxsO1xuICAgIHRoaXMuX2dldFdvcmtPdXRzdGFuZGluZyA9IGZhbHNlO1xuICAgIHRoaXMucGF1c2VkID0gdHJ1ZTtcbiAgICB0aGlzLnJlc3VtZSgpO1xuICB9XG5cbiAgSm9iUXVldWUucHJvdG90eXBlLl9nZXRXb3JrID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG51bUpvYnNUb0dldCwgb3B0aW9ucztcbiAgICBpZiAoISh0aGlzLl9nZXRXb3JrT3V0c3RhbmRpbmcgfHwgdGhpcy5wYXVzZWQpKSB7XG4gICAgICBudW1Kb2JzVG9HZXQgPSB0aGlzLnByZWZldGNoICsgdGhpcy5wYXlsb2FkICogKHRoaXMuY29uY3VycmVuY3kgLSB0aGlzLnJ1bm5pbmcoKSkgLSB0aGlzLmxlbmd0aCgpO1xuICAgICAgaWYgKG51bUpvYnNUb0dldCA+IDApIHtcbiAgICAgICAgdGhpcy5fZ2V0V29ya091dHN0YW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICBtYXhKb2JzOiBudW1Kb2JzVG9HZXRcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMud29ya1RpbWVvdXQgIT0gbnVsbCkge1xuICAgICAgICAgIG9wdGlvbnMud29ya1RpbWVvdXQgPSB0aGlzLndvcmtUaW1lb3V0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBKb2IuZ2V0V29yayh0aGlzLnJvb3QsIHRoaXMudHlwZSwgb3B0aW9ucywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVyciwgam9icykge1xuICAgICAgICAgICAgdmFyIGosIGssIGxlbjtcbiAgICAgICAgICAgIF90aGlzLl9nZXRXb3JrT3V0c3RhbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmVycm9yQ2FsbGJhY2sobmV3IEVycm9yKFwiUmVjZWl2ZWQgZXJyb3IgZnJvbSBnZXRXb3JrKCk6IFwiICsgZXJyKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChqb2JzICE9IG51bGwpICYmIGpvYnMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgICBpZiAoam9icy5sZW5ndGggPiBudW1Kb2JzVG9HZXQpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5lcnJvckNhbGxiYWNrKG5ldyBFcnJvcihcImdldFdvcmsoKSByZXR1cm5lZCBqb2JzIChcIiArIGpvYnMubGVuZ3RoICsgXCIpIGluIGV4Y2VzcyBvZiBtYXhKb2JzIChcIiArIG51bUpvYnNUb0dldCArIFwiKVwiKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZm9yIChrID0gMCwgbGVuID0gam9icy5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgICAgICAgICAgIGogPSBqb2JzW2tdO1xuICAgICAgICAgICAgICAgIF90aGlzLl90YXNrcy5wdXNoKGopO1xuICAgICAgICAgICAgICAgIGlmIChfdGhpcy5fc3RvcHBpbmdHZXRXb3JrID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIF9zZXRJbW1lZGlhdGUoX3RoaXMuX3Byb2Nlc3MuYmluZChfdGhpcykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoX3RoaXMuX3N0b3BwaW5nR2V0V29yayAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLl9zdG9wcGluZ0dldFdvcmsoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmVycm9yQ2FsbGJhY2sobmV3IEVycm9yKFwiTm9uYXJyYXkgcmVzcG9uc2UgZnJvbSBzZXJ2ZXIgZnJvbSBnZXRXb3JrKClcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH0pKHRoaXMpKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgSm9iUXVldWUucHJvdG90eXBlLl9vbmx5X29uY2UgPSBmdW5jdGlvbihmbikge1xuICAgIHZhciBjYWxsZWQ7XG4gICAgY2FsbGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoY2FsbGVkKSB7XG4gICAgICAgICAgX3RoaXMuZXJyb3JDYWxsYmFjayhuZXcgRXJyb3IoXCJXb3JrZXIgY2FsbGJhY2sgY2FsbGVkIG11bHRpcGxlIHRpbWVzXCIpKTtcbiAgICAgICAgICBpZiAoX3RoaXMuY2FsbGJhY2tTdHJpY3QpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkpvYlF1ZXVlOiB3b3JrZXIgY2FsbGJhY2sgd2FzIGludm9rZWQgbXVsdGlwbGUgdGltZXNcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiBmbi5hcHBseShfdGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSkodGhpcyk7XG4gIH07XG5cbiAgSm9iUXVldWUucHJvdG90eXBlLl9wcm9jZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNiLCBqb2IsIG5leHQ7XG4gICAgaWYgKCF0aGlzLnBhdXNlZCAmJiB0aGlzLnJ1bm5pbmcoKSA8IHRoaXMuY29uY3VycmVuY3kgJiYgdGhpcy5sZW5ndGgoKSkge1xuICAgICAgaWYgKHRoaXMucGF5bG9hZCA+IDEpIHtcbiAgICAgICAgam9iID0gdGhpcy5fdGFza3Muc3BsaWNlKDAsIHRoaXMucGF5bG9hZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBqb2IgPSB0aGlzLl90YXNrcy5zaGlmdCgpO1xuICAgICAgfVxuICAgICAgam9iLl90YXNrSWQgPSBcIlRhc2tfXCIgKyAodGhpcy5fdGFza051bWJlcisrKTtcbiAgICAgIHRoaXMuX3dvcmtlcnNbam9iLl90YXNrSWRdID0gam9iO1xuICAgICAgbmV4dCA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZGVsZXRlIF90aGlzLl93b3JrZXJzW2pvYi5fdGFza0lkXTtcbiAgICAgICAgICBpZiAoKF90aGlzLl9zdG9wcGluZ1Rhc2tzICE9IG51bGwpICYmIF90aGlzLnJ1bm5pbmcoKSA9PT0gMCAmJiBfdGhpcy5sZW5ndGgoKSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLl9zdG9wcGluZ1Rhc2tzKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9zZXRJbW1lZGlhdGUoX3RoaXMuX3Byb2Nlc3MuYmluZChfdGhpcykpO1xuICAgICAgICAgICAgcmV0dXJuIF9zZXRJbW1lZGlhdGUoX3RoaXMuX2dldFdvcmsuYmluZChfdGhpcykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgY2IgPSB0aGlzLl9vbmx5X29uY2UobmV4dCk7XG4gICAgICByZXR1cm4gdGhpcy53b3JrZXIoam9iLCBjYik7XG4gICAgfVxuICB9O1xuXG4gIEpvYlF1ZXVlLnByb3RvdHlwZS5fc3RvcEdldFdvcmsgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIF9jbGVhckludGVydmFsKHRoaXMuX2ludGVydmFsKTtcbiAgICB0aGlzLl9pbnRlcnZhbCA9IG51bGw7XG4gICAgaWYgKHRoaXMuX2dldFdvcmtPdXRzdGFuZGluZykge1xuICAgICAgcmV0dXJuIHRoaXMuX3N0b3BwaW5nR2V0V29yayA9IGNhbGxiYWNrO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gX3NldEltbWVkaWF0ZShjYWxsYmFjayk7XG4gICAgfVxuICB9O1xuXG4gIEpvYlF1ZXVlLnByb3RvdHlwZS5fd2FpdEZvclRhc2tzID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBpZiAodGhpcy5ydW5uaW5nKCkgIT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdG9wcGluZ1Rhc2tzID0gY2FsbGJhY2s7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBfc2V0SW1tZWRpYXRlKGNhbGxiYWNrKTtcbiAgICB9XG4gIH07XG5cbiAgSm9iUXVldWUucHJvdG90eXBlLl9mYWlsSm9icyA9IGZ1bmN0aW9uKHRhc2tzLCBjYWxsYmFjaykge1xuICAgIHZhciBjb3VudCwgam9iLCBrLCBsZW4sIHJlc3VsdHM7XG4gICAgaWYgKHRhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgX3NldEltbWVkaWF0ZShjYWxsYmFjayk7XG4gICAgfVxuICAgIGNvdW50ID0gMDtcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChrID0gMCwgbGVuID0gdGFza3MubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIGpvYiA9IHRhc2tzW2tdO1xuICAgICAgcmVzdWx0cy5wdXNoKGpvYi5mYWlsKFwiV29ya2VyIHNodXRkb3duXCIsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXJyLCByZXMpIHtcbiAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgIGlmIChjb3VudCA9PT0gdGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBKb2JRdWV1ZS5wcm90b3R5cGUuX2hhcmQgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHRoaXMucGF1c2VkID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5fc3RvcEdldFdvcmsoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpLCByLCByZWYsIHRhc2tzO1xuICAgICAgICB0YXNrcyA9IF90aGlzLl90YXNrcztcbiAgICAgICAgX3RoaXMuX3Rhc2tzID0gW107XG4gICAgICAgIHJlZiA9IF90aGlzLl93b3JrZXJzO1xuICAgICAgICBmb3IgKGkgaW4gcmVmKSB7XG4gICAgICAgICAgciA9IHJlZltpXTtcbiAgICAgICAgICB0YXNrcyA9IHRhc2tzLmNvbmNhdChyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3RoaXMuX2ZhaWxKb2JzKHRhc2tzLCBjYWxsYmFjayk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuICBKb2JRdWV1ZS5wcm90b3R5cGUuX3N0b3AgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHRoaXMucGF1c2VkID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5fc3RvcEdldFdvcmsoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0YXNrcztcbiAgICAgICAgdGFza3MgPSBfdGhpcy5fdGFza3M7XG4gICAgICAgIF90aGlzLl90YXNrcyA9IFtdO1xuICAgICAgICByZXR1cm4gX3RoaXMuX3dhaXRGb3JUYXNrcyhmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuX2ZhaWxKb2JzKHRhc2tzLCBjYWxsYmFjayk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgSm9iUXVldWUucHJvdG90eXBlLl9zb2Z0ID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcEdldFdvcmsoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5fd2FpdEZvclRhc2tzKGNhbGxiYWNrKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIEpvYlF1ZXVlLnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fdGFza3MubGVuZ3RoO1xuICB9O1xuXG4gIEpvYlF1ZXVlLnByb3RvdHlwZS5ydW5uaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX3dvcmtlcnMpLmxlbmd0aDtcbiAgfTtcblxuICBKb2JRdWV1ZS5wcm90b3R5cGUuaWRsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmxlbmd0aCgpICsgdGhpcy5ydW5uaW5nKCkgPT09IDA7XG4gIH07XG5cbiAgSm9iUXVldWUucHJvdG90eXBlLmZ1bGwgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5ydW5uaW5nKCkgPT09IHRoaXMuY29uY3VycmVuY3k7XG4gIH07XG5cbiAgSm9iUXVldWUucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMucGF1c2VkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghKHRoaXMucG9sbEludGVydmFsID49IEpvYi5mb3JldmVyKSkge1xuICAgICAgX2NsZWFySW50ZXJ2YWwodGhpcy5faW50ZXJ2YWwpO1xuICAgICAgdGhpcy5faW50ZXJ2YWwgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLnBhdXNlZCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgSm9iUXVldWUucHJvdG90eXBlLnJlc3VtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBrLCByZWYsIHc7XG4gICAgaWYgKCF0aGlzLnBhdXNlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgIF9zZXRJbW1lZGlhdGUodGhpcy5fZ2V0V29yay5iaW5kKHRoaXMpKTtcbiAgICBpZiAoISh0aGlzLnBvbGxJbnRlcnZhbCA+PSBKb2IuZm9yZXZlcikpIHtcbiAgICAgIHRoaXMuX2ludGVydmFsID0gX3NldEludGVydmFsKHRoaXMuX2dldFdvcmsuYmluZCh0aGlzKSwgdGhpcy5wb2xsSW50ZXJ2YWwpO1xuICAgIH1cbiAgICBmb3IgKHcgPSBrID0gMSwgcmVmID0gdGhpcy5jb25jdXJyZW5jeTsgMSA8PSByZWYgPyBrIDw9IHJlZiA6IGsgPj0gcmVmOyB3ID0gMSA8PSByZWYgPyArK2sgOiAtLWspIHtcbiAgICAgIF9zZXRJbW1lZGlhdGUodGhpcy5fcHJvY2Vzcy5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgSm9iUXVldWUucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5wYXVzZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgX3NldEltbWVkaWF0ZSh0aGlzLl9nZXRXb3JrLmJpbmQodGhpcykpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEpvYlF1ZXVlLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYiwgaywgb3B0aW9ucywgcmVmO1xuICAgIG9wdGlvbnMgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCwgayA9IGFyZ3VtZW50cy5sZW5ndGggLSAxKSA6IChrID0gMCwgW10pLCBjYiA9IGFyZ3VtZW50c1trKytdO1xuICAgIHJlZiA9IG9wdGlvbnNIZWxwKG9wdGlvbnMsIGNiKSwgb3B0aW9ucyA9IHJlZlswXSwgY2IgPSByZWZbMV07XG4gICAgaWYgKG9wdGlvbnMubGV2ZWwgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucy5sZXZlbCA9ICdub3JtYWwnO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5xdWlldCA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLnF1aWV0ID0gZmFsc2U7XG4gICAgfVxuICAgIGlmIChjYiA9PSBudWxsKSB7XG4gICAgICBpZiAoIW9wdGlvbnMucXVpZXQpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwidXNpbmcgZGVmYXVsdCBzaHV0ZG93biBjYWxsYmFjayFcIik7XG4gICAgICB9XG4gICAgICBjYiA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybihcIlNodXRkb3duIGNvbXBsZXRlXCIpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgfVxuICAgIHN3aXRjaCAob3B0aW9ucy5sZXZlbCkge1xuICAgICAgY2FzZSAnaGFyZCc6XG4gICAgICAgIGlmICghb3B0aW9ucy5xdWlldCkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIlNodXR0aW5nIGRvd24gaGFyZFwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5faGFyZChjYik7XG4gICAgICBjYXNlICdzb2Z0JzpcbiAgICAgICAgaWYgKCFvcHRpb25zLnF1aWV0KSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiU2h1dHRpbmcgZG93biBzb2Z0XCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9zb2Z0KGNiKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmICghb3B0aW9ucy5xdWlldCkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIlNodXR0aW5nIGRvd24gbm9ybWFsbHlcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0b3AoY2IpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gSm9iUXVldWU7XG5cbn0pKCk7XG5cbkpvYiA9IChmdW5jdGlvbigpIHtcbiAgSm9iLmZvcmV2ZXIgPSA5MDA3MTk5MjU0NzQwOTkyO1xuXG4gIEpvYi5mb3JldmVyRGF0ZSA9IG5ldyBEYXRlKDg2NDAwMDAwMDAwMDAwMDApO1xuXG4gIEpvYi5qb2JQcmlvcml0aWVzID0ge1xuICAgIGxvdzogMTAsXG4gICAgbm9ybWFsOiAwLFxuICAgIG1lZGl1bTogLTUsXG4gICAgaGlnaDogLTEwLFxuICAgIGNyaXRpY2FsOiAtMTVcbiAgfTtcblxuICBKb2Iuam9iUmV0cnlCYWNrb2ZmTWV0aG9kcyA9IFsnY29uc3RhbnQnLCAnZXhwb25lbnRpYWwnXTtcblxuICBKb2Iuam9iU3RhdHVzZXMgPSBbJ3dhaXRpbmcnLCAncGF1c2VkJywgJ3JlYWR5JywgJ3J1bm5pbmcnLCAnZmFpbGVkJywgJ2NhbmNlbGxlZCcsICdjb21wbGV0ZWQnXTtcblxuICBKb2Iuam9iTG9nTGV2ZWxzID0gWydpbmZvJywgJ3N1Y2Nlc3MnLCAnd2FybmluZycsICdkYW5nZXInXTtcblxuICBKb2Iuam9iU3RhdHVzQ2FuY2VsbGFibGUgPSBbJ3J1bm5pbmcnLCAncmVhZHknLCAnd2FpdGluZycsICdwYXVzZWQnXTtcblxuICBKb2Iuam9iU3RhdHVzUGF1c2FibGUgPSBbJ3JlYWR5JywgJ3dhaXRpbmcnXTtcblxuICBKb2Iuam9iU3RhdHVzUmVtb3ZhYmxlID0gWydjYW5jZWxsZWQnLCAnY29tcGxldGVkJywgJ2ZhaWxlZCddO1xuXG4gIEpvYi5qb2JTdGF0dXNSZXN0YXJ0YWJsZSA9IFsnY2FuY2VsbGVkJywgJ2ZhaWxlZCddO1xuXG4gIEpvYi5kZHBNZXRob2RzID0gWydzdGFydEpvYnMnLCAnc3RvcEpvYnMnLCAnc3RhcnRKb2JTZXJ2ZXInLCAnc2h1dGRvd25Kb2JTZXJ2ZXInLCAnam9iUmVtb3ZlJywgJ2pvYlBhdXNlJywgJ2pvYlJlc3VtZScsICdqb2JSZWFkeScsICdqb2JDYW5jZWwnLCAnam9iUmVzdGFydCcsICdqb2JTYXZlJywgJ2pvYlJlcnVuJywgJ2dldFdvcmsnLCAnZ2V0Sm9iJywgJ2pvYkxvZycsICdqb2JQcm9ncmVzcycsICdqb2JEb25lJywgJ2pvYkZhaWwnXTtcblxuICBKb2IuZGRwUGVybWlzc2lvbkxldmVscyA9IFsnYWRtaW4nLCAnbWFuYWdlcicsICdjcmVhdG9yJywgJ3dvcmtlciddO1xuXG4gIEpvYi5kZHBNZXRob2RQZXJtaXNzaW9ucyA9IHtcbiAgICAnc3RhcnRKb2JzJzogWydzdGFydEpvYnMnLCAnYWRtaW4nXSxcbiAgICAnc3RvcEpvYnMnOiBbJ3N0b3BKb2JzJywgJ2FkbWluJ10sXG4gICAgJ3N0YXJ0Sm9iU2VydmVyJzogWydzdGFydEpvYlNlcnZlcicsICdhZG1pbiddLFxuICAgICdzaHV0ZG93bkpvYlNlcnZlcic6IFsnc2h1dGRvd25Kb2JTZXJ2ZXInLCAnYWRtaW4nXSxcbiAgICAnam9iUmVtb3ZlJzogWydqb2JSZW1vdmUnLCAnYWRtaW4nLCAnbWFuYWdlciddLFxuICAgICdqb2JQYXVzZSc6IFsnam9iUGF1c2UnLCAnYWRtaW4nLCAnbWFuYWdlciddLFxuICAgICdqb2JSZXN1bWUnOiBbJ2pvYlJlc3VtZScsICdhZG1pbicsICdtYW5hZ2VyJ10sXG4gICAgJ2pvYkNhbmNlbCc6IFsnam9iQ2FuY2VsJywgJ2FkbWluJywgJ21hbmFnZXInXSxcbiAgICAnam9iUmVhZHknOiBbJ2pvYlJlYWR5JywgJ2FkbWluJywgJ21hbmFnZXInXSxcbiAgICAnam9iUmVzdGFydCc6IFsnam9iUmVzdGFydCcsICdhZG1pbicsICdtYW5hZ2VyJ10sXG4gICAgJ2pvYlNhdmUnOiBbJ2pvYlNhdmUnLCAnYWRtaW4nLCAnY3JlYXRvciddLFxuICAgICdqb2JSZXJ1bic6IFsnam9iUmVydW4nLCAnYWRtaW4nLCAnY3JlYXRvciddLFxuICAgICdnZXRXb3JrJzogWydnZXRXb3JrJywgJ2FkbWluJywgJ3dvcmtlciddLFxuICAgICdnZXRKb2InOiBbJ2dldEpvYicsICdhZG1pbicsICd3b3JrZXInXSxcbiAgICAnam9iTG9nJzogWydqb2JMb2cnLCAnYWRtaW4nLCAnd29ya2VyJ10sXG4gICAgJ2pvYlByb2dyZXNzJzogWydqb2JQcm9ncmVzcycsICdhZG1pbicsICd3b3JrZXInXSxcbiAgICAnam9iRG9uZSc6IFsnam9iRG9uZScsICdhZG1pbicsICd3b3JrZXInXSxcbiAgICAnam9iRmFpbCc6IFsnam9iRmFpbCcsICdhZG1pbicsICd3b3JrZXInXVxuICB9O1xuXG4gIEpvYi5fZGRwX2FwcGx5ID0gdm9pZCAwO1xuXG4gIEpvYi5fc2V0RERQQXBwbHkgPSBmdW5jdGlvbihhcHBseSwgY29sbGVjdGlvbk5hbWUpIHtcbiAgICBpZiAodHlwZW9mIGFwcGx5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAodHlwZW9mIGNvbGxlY3Rpb25OYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAodGhpcy5fZGRwX2FwcGx5ID09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9kZHBfYXBwbHkgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuX2RkcF9hcHBseSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkpvYi5zZXRERFAgbXVzdCBzcGVjaWZ5IGEgY29sbGVjdGlvbiBuYW1lIGVhY2ggdGltZSBpZiBjYWxsZWQgbW9yZSB0aGFuIG9uY2UuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9kZHBfYXBwbHlbY29sbGVjdGlvbk5hbWVdID0gYXBwbHk7XG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLl9kZHBfYXBwbHkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RkcF9hcHBseSA9IGFwcGx5O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSm9iLnNldEREUCBtdXN0IHNwZWNpZnkgYSBjb2xsZWN0aW9uIG5hbWUgZWFjaCB0aW1lIGlmIGNhbGxlZCBtb3JlIHRoYW4gb25jZS5cIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkJhZCBmdW5jdGlvbiBpbiBKb2Iuc2V0RERQQXBwbHkoKVwiKTtcbiAgICB9XG4gIH07XG5cbiAgSm9iLnNldEREUCA9IGZ1bmN0aW9uKGRkcCwgY29sbGVjdGlvbk5hbWVzLCBGaWJlcikge1xuICAgIHZhciBjb2xsTmFtZSwgaywgbGVuLCByZXN1bHRzO1xuICAgIGlmIChkZHAgPT0gbnVsbCkge1xuICAgICAgZGRwID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKGNvbGxlY3Rpb25OYW1lcyA9PSBudWxsKSB7XG4gICAgICBjb2xsZWN0aW9uTmFtZXMgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoRmliZXIgPT0gbnVsbCkge1xuICAgICAgRmliZXIgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoISgodHlwZW9mIGNvbGxlY3Rpb25OYW1lcyA9PT0gJ3N0cmluZycpIHx8IChjb2xsZWN0aW9uTmFtZXMgaW5zdGFuY2VvZiBBcnJheSkpKSB7XG4gICAgICBGaWJlciA9IGNvbGxlY3Rpb25OYW1lcztcbiAgICAgIGNvbGxlY3Rpb25OYW1lcyA9IFt2b2lkIDBdO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbGxlY3Rpb25OYW1lcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbGxlY3Rpb25OYW1lcyA9IFtjb2xsZWN0aW9uTmFtZXNdO1xuICAgIH1cbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChrID0gMCwgbGVuID0gY29sbGVjdGlvbk5hbWVzLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICBjb2xsTmFtZSA9IGNvbGxlY3Rpb25OYW1lc1trXTtcbiAgICAgIGlmICghKChkZHAgIT0gbnVsbCkgJiYgKGRkcC5jbG9zZSAhPSBudWxsKSAmJiAoZGRwLnN1YnNjcmliZSAhPSBudWxsKSkpIHtcbiAgICAgICAgaWYgKGRkcCA9PT0gbnVsbCAmJiAoKHR5cGVvZiBNZXRlb3IgIT09IFwidW5kZWZpbmVkXCIgJiYgTWV0ZW9yICE9PSBudWxsID8gTWV0ZW9yLmFwcGx5IDogdm9pZCAwKSAhPSBudWxsKSkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLl9zZXRERFBBcHBseShNZXRlb3IuYXBwbHksIGNvbGxOYW1lKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQmFkIGRkcCBvYmplY3QgaW4gSm9iLnNldEREUCgpXCIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGRkcC5vYnNlcnZlID09IG51bGwpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuX3NldEREUEFwcGx5KGRkcC5hcHBseS5iaW5kKGRkcCksIGNvbGxOYW1lKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoRmliZXIgPT0gbnVsbCkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLl9zZXRERFBBcHBseShkZHAuY2FsbC5iaW5kKGRkcCksIGNvbGxOYW1lKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuX3NldEREUEFwcGx5KChmdW5jdGlvbihuYW1lLCBwYXJhbXMsIGNiKSB7XG4gICAgICAgICAgICB2YXIgZmliO1xuICAgICAgICAgICAgZmliID0gRmliZXIuY3VycmVudDtcbiAgICAgICAgICAgIGRkcC5jYWxsKG5hbWUsIHBhcmFtcywgZnVuY3Rpb24oZXJyLCByZXMpIHtcbiAgICAgICAgICAgICAgaWYgKChjYiAhPSBudWxsKSAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2IoZXJyLCByZXMpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBmaWIudGhyb3dJbnRvKGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBmaWIucnVuKHJlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICgoY2IgIT0gbnVsbCkgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBGaWJlcltcInlpZWxkXCJdKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSksIGNvbGxOYW1lKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgSm9iLmdldFdvcmsgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2IsIGssIG9wdGlvbnMsIHJlZiwgcm9vdCwgdHlwZTtcbiAgICByb290ID0gYXJndW1lbnRzWzBdLCB0eXBlID0gYXJndW1lbnRzWzFdLCBvcHRpb25zID0gNCA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIsIGsgPSBhcmd1bWVudHMubGVuZ3RoIC0gMSkgOiAoayA9IDIsIFtdKSwgY2IgPSBhcmd1bWVudHNbaysrXTtcbiAgICByZWYgPSBvcHRpb25zSGVscChvcHRpb25zLCBjYiksIG9wdGlvbnMgPSByZWZbMF0sIGNiID0gcmVmWzFdO1xuICAgIGlmICh0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHR5cGUgPSBbdHlwZV07XG4gICAgfVxuICAgIGlmIChvcHRpb25zLndvcmtUaW1lb3V0ICE9IG51bGwpIHtcbiAgICAgIGlmICghKGlzSW50ZWdlcihvcHRpb25zLndvcmtUaW1lb3V0KSAmJiBvcHRpb25zLndvcmtUaW1lb3V0ID4gMCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdnZXRXb3JrOiB3b3JrVGltZW91dCBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlcicpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWV0aG9kQ2FsbChyb290LCBcImdldFdvcmtcIiwgW3R5cGUsIG9wdGlvbnNdLCBjYiwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIHZhciBkb2MsIGpvYnM7XG4gICAgICAgIGpvYnMgPSAoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBsLCBsZW4sIHJlc3VsdHM7XG4gICAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAobCA9IDAsIGxlbiA9IHJlcy5sZW5ndGg7IGwgPCBsZW47IGwrKykge1xuICAgICAgICAgICAgZG9jID0gcmVzW2xdO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKG5ldyBKb2Iocm9vdCwgZG9jKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9KSgpKSB8fCBbXTtcbiAgICAgICAgaWYgKG9wdGlvbnMubWF4Sm9icyAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGpvYnM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGpvYnNbMF07XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIEpvYi5wcm9jZXNzSm9icyA9IEpvYlF1ZXVlO1xuXG4gIEpvYi5tYWtlSm9iID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZXBGbGFnO1xuICAgIGRlcEZsYWcgPSBmYWxzZTtcbiAgICByZXR1cm4gZnVuY3Rpb24ocm9vdCwgZG9jKSB7XG4gICAgICBpZiAoIWRlcEZsYWcpIHtcbiAgICAgICAgZGVwRmxhZyA9IHRydWU7XG4gICAgICAgIGNvbnNvbGUud2FybihcIkpvYi5tYWtlSm9iKHJvb3QsIGpvYkRvYykgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIGEgZnV0dXJlIHJlbGVhc2UsIHVzZSAnbmV3IEpvYihyb290LCBqb2JEb2MpJyBpbnN0ZWFkLlwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgSm9iKHJvb3QsIGRvYyk7XG4gICAgfTtcbiAgfSkoKTtcblxuICBKb2IuZ2V0Sm9iID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNiLCBpZCwgaywgb3B0aW9ucywgcmVmLCByb290O1xuICAgIHJvb3QgPSBhcmd1bWVudHNbMF0sIGlkID0gYXJndW1lbnRzWzFdLCBvcHRpb25zID0gNCA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIsIGsgPSBhcmd1bWVudHMubGVuZ3RoIC0gMSkgOiAoayA9IDIsIFtdKSwgY2IgPSBhcmd1bWVudHNbaysrXTtcbiAgICByZWYgPSBvcHRpb25zSGVscChvcHRpb25zLCBjYiksIG9wdGlvbnMgPSByZWZbMF0sIGNiID0gcmVmWzFdO1xuICAgIGlmIChvcHRpb25zLmdldExvZyA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLmdldExvZyA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gbWV0aG9kQ2FsbChyb290LCBcImdldEpvYlwiLCBbaWQsIG9wdGlvbnNdLCBjYiwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZG9jKSB7XG4gICAgICAgIGlmIChkb2MpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IEpvYihyb290LCBkb2MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIEpvYi5nZXRKb2JzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNiLCBjaHVua09mSWRzLCBjaHVua3NPZklkcywgaWRzLCBrLCBsLCBsZW4sIG15Q2IsIG9wdGlvbnMsIHJlZiwgcmV0VmFsLCByb290O1xuICAgIHJvb3QgPSBhcmd1bWVudHNbMF0sIGlkcyA9IGFyZ3VtZW50c1sxXSwgb3B0aW9ucyA9IDQgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyLCBrID0gYXJndW1lbnRzLmxlbmd0aCAtIDEpIDogKGsgPSAyLCBbXSksIGNiID0gYXJndW1lbnRzW2srK107XG4gICAgcmVmID0gb3B0aW9uc0hlbHAob3B0aW9ucywgY2IpLCBvcHRpb25zID0gcmVmWzBdLCBjYiA9IHJlZlsxXTtcbiAgICBpZiAob3B0aW9ucy5nZXRMb2cgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucy5nZXRMb2cgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0VmFsID0gW107XG4gICAgY2h1bmtzT2ZJZHMgPSBzcGxpdExvbmdBcnJheShpZHMsIDMyKTtcbiAgICBteUNiID0gcmVkdWNlQ2FsbGJhY2tzKGNiLCBjaHVua3NPZklkcy5sZW5ndGgsIGNvbmNhdFJlZHVjZSwgW10pO1xuICAgIGZvciAobCA9IDAsIGxlbiA9IGNodW5rc09mSWRzLmxlbmd0aDsgbCA8IGxlbjsgbCsrKSB7XG4gICAgICBjaHVua09mSWRzID0gY2h1bmtzT2ZJZHNbbF07XG4gICAgICByZXRWYWwgPSByZXRWYWwuY29uY2F0KG1ldGhvZENhbGwocm9vdCwgXCJnZXRKb2JcIiwgW2NodW5rT2ZJZHMsIG9wdGlvbnNdLCBteUNiLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRvYykge1xuICAgICAgICAgIHZhciBkLCBsZW4xLCBtLCByZXN1bHRzO1xuICAgICAgICAgIGlmIChkb2MpIHtcbiAgICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAobSA9IDAsIGxlbjEgPSBkb2MubGVuZ3RoOyBtIDwgbGVuMTsgbSsrKSB7XG4gICAgICAgICAgICAgIGQgPSBkb2NbbV07XG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaChuZXcgSm9iKHJvb3QsIGQudHlwZSwgZC5kYXRhLCBkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldFZhbDtcbiAgfTtcblxuICBKb2IucGF1c2VKb2JzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNiLCBjaHVua09mSWRzLCBjaHVua3NPZklkcywgaWRzLCBrLCBsLCBsZW4sIG15Q2IsIG9wdGlvbnMsIHJlZiwgcmV0VmFsLCByb290O1xuICAgIHJvb3QgPSBhcmd1bWVudHNbMF0sIGlkcyA9IGFyZ3VtZW50c1sxXSwgb3B0aW9ucyA9IDQgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyLCBrID0gYXJndW1lbnRzLmxlbmd0aCAtIDEpIDogKGsgPSAyLCBbXSksIGNiID0gYXJndW1lbnRzW2srK107XG4gICAgcmVmID0gb3B0aW9uc0hlbHAob3B0aW9ucywgY2IpLCBvcHRpb25zID0gcmVmWzBdLCBjYiA9IHJlZlsxXTtcbiAgICByZXRWYWwgPSBmYWxzZTtcbiAgICBjaHVua3NPZklkcyA9IHNwbGl0TG9uZ0FycmF5KGlkcywgMjU2KTtcbiAgICBteUNiID0gcmVkdWNlQ2FsbGJhY2tzKGNiLCBjaHVua3NPZklkcy5sZW5ndGgpO1xuICAgIGZvciAobCA9IDAsIGxlbiA9IGNodW5rc09mSWRzLmxlbmd0aDsgbCA8IGxlbjsgbCsrKSB7XG4gICAgICBjaHVua09mSWRzID0gY2h1bmtzT2ZJZHNbbF07XG4gICAgICByZXRWYWwgPSBtZXRob2RDYWxsKHJvb3QsIFwiam9iUGF1c2VcIiwgW2NodW5rT2ZJZHMsIG9wdGlvbnNdLCBteUNiKSB8fCByZXRWYWw7XG4gICAgfVxuICAgIHJldHVybiByZXRWYWw7XG4gIH07XG5cbiAgSm9iLnJlc3VtZUpvYnMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2IsIGNodW5rT2ZJZHMsIGNodW5rc09mSWRzLCBpZHMsIGssIGwsIGxlbiwgbXlDYiwgb3B0aW9ucywgcmVmLCByZXRWYWwsIHJvb3Q7XG4gICAgcm9vdCA9IGFyZ3VtZW50c1swXSwgaWRzID0gYXJndW1lbnRzWzFdLCBvcHRpb25zID0gNCA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIsIGsgPSBhcmd1bWVudHMubGVuZ3RoIC0gMSkgOiAoayA9IDIsIFtdKSwgY2IgPSBhcmd1bWVudHNbaysrXTtcbiAgICByZWYgPSBvcHRpb25zSGVscChvcHRpb25zLCBjYiksIG9wdGlvbnMgPSByZWZbMF0sIGNiID0gcmVmWzFdO1xuICAgIHJldFZhbCA9IGZhbHNlO1xuICAgIGNodW5rc09mSWRzID0gc3BsaXRMb25nQXJyYXkoaWRzLCAyNTYpO1xuICAgIG15Q2IgPSByZWR1Y2VDYWxsYmFja3MoY2IsIGNodW5rc09mSWRzLmxlbmd0aCk7XG4gICAgZm9yIChsID0gMCwgbGVuID0gY2h1bmtzT2ZJZHMubGVuZ3RoOyBsIDwgbGVuOyBsKyspIHtcbiAgICAgIGNodW5rT2ZJZHMgPSBjaHVua3NPZklkc1tsXTtcbiAgICAgIHJldFZhbCA9IG1ldGhvZENhbGwocm9vdCwgXCJqb2JSZXN1bWVcIiwgW2NodW5rT2ZJZHMsIG9wdGlvbnNdLCBteUNiKSB8fCByZXRWYWw7XG4gICAgfVxuICAgIHJldHVybiByZXRWYWw7XG4gIH07XG5cbiAgSm9iLnJlYWR5Sm9icyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYiwgY2h1bmtPZklkcywgY2h1bmtzT2ZJZHMsIGlkcywgaywgbCwgbGVuLCBteUNiLCBvcHRpb25zLCByZWYsIHJldFZhbCwgcm9vdDtcbiAgICByb290ID0gYXJndW1lbnRzWzBdLCBpZHMgPSBhcmd1bWVudHNbMV0sIG9wdGlvbnMgPSA0IDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMiwgayA9IGFyZ3VtZW50cy5sZW5ndGggLSAxKSA6IChrID0gMiwgW10pLCBjYiA9IGFyZ3VtZW50c1trKytdO1xuICAgIGlmIChpZHMgPT0gbnVsbCkge1xuICAgICAgaWRzID0gW107XG4gICAgfVxuICAgIHJlZiA9IG9wdGlvbnNIZWxwKG9wdGlvbnMsIGNiKSwgb3B0aW9ucyA9IHJlZlswXSwgY2IgPSByZWZbMV07XG4gICAgaWYgKG9wdGlvbnMuZm9yY2UgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucy5mb3JjZSA9IGZhbHNlO1xuICAgIH1cbiAgICByZXRWYWwgPSBmYWxzZTtcbiAgICBjaHVua3NPZklkcyA9IHNwbGl0TG9uZ0FycmF5KGlkcywgMjU2KTtcbiAgICBpZiAoIShjaHVua3NPZklkcy5sZW5ndGggPiAwKSkge1xuICAgICAgY2h1bmtzT2ZJZHMgPSBbW11dO1xuICAgIH1cbiAgICBteUNiID0gcmVkdWNlQ2FsbGJhY2tzKGNiLCBjaHVua3NPZklkcy5sZW5ndGgpO1xuICAgIGZvciAobCA9IDAsIGxlbiA9IGNodW5rc09mSWRzLmxlbmd0aDsgbCA8IGxlbjsgbCsrKSB7XG4gICAgICBjaHVua09mSWRzID0gY2h1bmtzT2ZJZHNbbF07XG4gICAgICByZXRWYWwgPSBtZXRob2RDYWxsKHJvb3QsIFwiam9iUmVhZHlcIiwgW2NodW5rT2ZJZHMsIG9wdGlvbnNdLCBteUNiKSB8fCByZXRWYWw7XG4gICAgfVxuICAgIHJldHVybiByZXRWYWw7XG4gIH07XG5cbiAgSm9iLmNhbmNlbEpvYnMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2IsIGNodW5rT2ZJZHMsIGNodW5rc09mSWRzLCBpZHMsIGssIGwsIGxlbiwgbXlDYiwgb3B0aW9ucywgcmVmLCByZXRWYWwsIHJvb3Q7XG4gICAgcm9vdCA9IGFyZ3VtZW50c1swXSwgaWRzID0gYXJndW1lbnRzWzFdLCBvcHRpb25zID0gNCA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIsIGsgPSBhcmd1bWVudHMubGVuZ3RoIC0gMSkgOiAoayA9IDIsIFtdKSwgY2IgPSBhcmd1bWVudHNbaysrXTtcbiAgICByZWYgPSBvcHRpb25zSGVscChvcHRpb25zLCBjYiksIG9wdGlvbnMgPSByZWZbMF0sIGNiID0gcmVmWzFdO1xuICAgIGlmIChvcHRpb25zLmFudGVjZWRlbnRzID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMuYW50ZWNlZGVudHMgPSB0cnVlO1xuICAgIH1cbiAgICByZXRWYWwgPSBmYWxzZTtcbiAgICBjaHVua3NPZklkcyA9IHNwbGl0TG9uZ0FycmF5KGlkcywgMjU2KTtcbiAgICBteUNiID0gcmVkdWNlQ2FsbGJhY2tzKGNiLCBjaHVua3NPZklkcy5sZW5ndGgpO1xuICAgIGZvciAobCA9IDAsIGxlbiA9IGNodW5rc09mSWRzLmxlbmd0aDsgbCA8IGxlbjsgbCsrKSB7XG4gICAgICBjaHVua09mSWRzID0gY2h1bmtzT2ZJZHNbbF07XG4gICAgICByZXRWYWwgPSBtZXRob2RDYWxsKHJvb3QsIFwiam9iQ2FuY2VsXCIsIFtjaHVua09mSWRzLCBvcHRpb25zXSwgbXlDYikgfHwgcmV0VmFsO1xuICAgIH1cbiAgICByZXR1cm4gcmV0VmFsO1xuICB9O1xuXG4gIEpvYi5yZXN0YXJ0Sm9icyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYiwgY2h1bmtPZklkcywgY2h1bmtzT2ZJZHMsIGlkcywgaywgbCwgbGVuLCBteUNiLCBvcHRpb25zLCByZWYsIHJldFZhbCwgcm9vdDtcbiAgICByb290ID0gYXJndW1lbnRzWzBdLCBpZHMgPSBhcmd1bWVudHNbMV0sIG9wdGlvbnMgPSA0IDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMiwgayA9IGFyZ3VtZW50cy5sZW5ndGggLSAxKSA6IChrID0gMiwgW10pLCBjYiA9IGFyZ3VtZW50c1trKytdO1xuICAgIHJlZiA9IG9wdGlvbnNIZWxwKG9wdGlvbnMsIGNiKSwgb3B0aW9ucyA9IHJlZlswXSwgY2IgPSByZWZbMV07XG4gICAgaWYgKG9wdGlvbnMucmV0cmllcyA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLnJldHJpZXMgPSAxO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5kZXBlbmRlbnRzID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMuZGVwZW5kZW50cyA9IHRydWU7XG4gICAgfVxuICAgIHJldFZhbCA9IGZhbHNlO1xuICAgIGNodW5rc09mSWRzID0gc3BsaXRMb25nQXJyYXkoaWRzLCAyNTYpO1xuICAgIG15Q2IgPSByZWR1Y2VDYWxsYmFja3MoY2IsIGNodW5rc09mSWRzLmxlbmd0aCk7XG4gICAgZm9yIChsID0gMCwgbGVuID0gY2h1bmtzT2ZJZHMubGVuZ3RoOyBsIDwgbGVuOyBsKyspIHtcbiAgICAgIGNodW5rT2ZJZHMgPSBjaHVua3NPZklkc1tsXTtcbiAgICAgIHJldFZhbCA9IG1ldGhvZENhbGwocm9vdCwgXCJqb2JSZXN0YXJ0XCIsIFtjaHVua09mSWRzLCBvcHRpb25zXSwgbXlDYikgfHwgcmV0VmFsO1xuICAgIH1cbiAgICByZXR1cm4gcmV0VmFsO1xuICB9O1xuXG4gIEpvYi5yZW1vdmVKb2JzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNiLCBjaHVua09mSWRzLCBjaHVua3NPZklkcywgaWRzLCBrLCBsLCBsZW4sIG15Q2IsIG9wdGlvbnMsIHJlZiwgcmV0VmFsLCByb290O1xuICAgIHJvb3QgPSBhcmd1bWVudHNbMF0sIGlkcyA9IGFyZ3VtZW50c1sxXSwgb3B0aW9ucyA9IDQgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyLCBrID0gYXJndW1lbnRzLmxlbmd0aCAtIDEpIDogKGsgPSAyLCBbXSksIGNiID0gYXJndW1lbnRzW2srK107XG4gICAgcmVmID0gb3B0aW9uc0hlbHAob3B0aW9ucywgY2IpLCBvcHRpb25zID0gcmVmWzBdLCBjYiA9IHJlZlsxXTtcbiAgICByZXRWYWwgPSBmYWxzZTtcbiAgICBjaHVua3NPZklkcyA9IHNwbGl0TG9uZ0FycmF5KGlkcywgMjU2KTtcbiAgICBteUNiID0gcmVkdWNlQ2FsbGJhY2tzKGNiLCBjaHVua3NPZklkcy5sZW5ndGgpO1xuICAgIGZvciAobCA9IDAsIGxlbiA9IGNodW5rc09mSWRzLmxlbmd0aDsgbCA8IGxlbjsgbCsrKSB7XG4gICAgICBjaHVua09mSWRzID0gY2h1bmtzT2ZJZHNbbF07XG4gICAgICByZXRWYWwgPSBtZXRob2RDYWxsKHJvb3QsIFwiam9iUmVtb3ZlXCIsIFtjaHVua09mSWRzLCBvcHRpb25zXSwgbXlDYikgfHwgcmV0VmFsO1xuICAgIH1cbiAgICByZXR1cm4gcmV0VmFsO1xuICB9O1xuXG4gIEpvYi5zdGFydEpvYnMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2IsIGssIG9wdGlvbnMsIHJlZiwgcm9vdDtcbiAgICByb290ID0gYXJndW1lbnRzWzBdLCBvcHRpb25zID0gMyA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEsIGsgPSBhcmd1bWVudHMubGVuZ3RoIC0gMSkgOiAoayA9IDEsIFtdKSwgY2IgPSBhcmd1bWVudHNbaysrXTtcbiAgICByZWYgPSBvcHRpb25zSGVscChvcHRpb25zLCBjYiksIG9wdGlvbnMgPSByZWZbMF0sIGNiID0gcmVmWzFdO1xuICAgIHJldHVybiBtZXRob2RDYWxsKHJvb3QsIFwic3RhcnRKb2JzXCIsIFtvcHRpb25zXSwgY2IpO1xuICB9O1xuXG4gIEpvYi5zdG9wSm9icyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYiwgaywgb3B0aW9ucywgcmVmLCByb290O1xuICAgIHJvb3QgPSBhcmd1bWVudHNbMF0sIG9wdGlvbnMgPSAzIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSwgayA9IGFyZ3VtZW50cy5sZW5ndGggLSAxKSA6IChrID0gMSwgW10pLCBjYiA9IGFyZ3VtZW50c1trKytdO1xuICAgIHJlZiA9IG9wdGlvbnNIZWxwKG9wdGlvbnMsIGNiKSwgb3B0aW9ucyA9IHJlZlswXSwgY2IgPSByZWZbMV07XG4gICAgaWYgKG9wdGlvbnMudGltZW91dCA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLnRpbWVvdXQgPSA2MCAqIDEwMDA7XG4gICAgfVxuICAgIHJldHVybiBtZXRob2RDYWxsKHJvb3QsIFwic3RvcEpvYnNcIiwgW29wdGlvbnNdLCBjYik7XG4gIH07XG5cbiAgSm9iLnN0YXJ0Sm9iU2VydmVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNiLCBrLCBvcHRpb25zLCByZWYsIHJvb3Q7XG4gICAgcm9vdCA9IGFyZ3VtZW50c1swXSwgb3B0aW9ucyA9IDMgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxLCBrID0gYXJndW1lbnRzLmxlbmd0aCAtIDEpIDogKGsgPSAxLCBbXSksIGNiID0gYXJndW1lbnRzW2srK107XG4gICAgcmVmID0gb3B0aW9uc0hlbHAob3B0aW9ucywgY2IpLCBvcHRpb25zID0gcmVmWzBdLCBjYiA9IHJlZlsxXTtcbiAgICByZXR1cm4gbWV0aG9kQ2FsbChyb290LCBcInN0YXJ0Sm9iU2VydmVyXCIsIFtvcHRpb25zXSwgY2IpO1xuICB9O1xuXG4gIEpvYi5zaHV0ZG93bkpvYlNlcnZlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYiwgaywgb3B0aW9ucywgcmVmLCByb290O1xuICAgIHJvb3QgPSBhcmd1bWVudHNbMF0sIG9wdGlvbnMgPSAzIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSwgayA9IGFyZ3VtZW50cy5sZW5ndGggLSAxKSA6IChrID0gMSwgW10pLCBjYiA9IGFyZ3VtZW50c1trKytdO1xuICAgIHJlZiA9IG9wdGlvbnNIZWxwKG9wdGlvbnMsIGNiKSwgb3B0aW9ucyA9IHJlZlswXSwgY2IgPSByZWZbMV07XG4gICAgaWYgKG9wdGlvbnMudGltZW91dCA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLnRpbWVvdXQgPSA2MCAqIDEwMDA7XG4gICAgfVxuICAgIHJldHVybiBtZXRob2RDYWxsKHJvb3QsIFwic2h1dGRvd25Kb2JTZXJ2ZXJcIiwgW29wdGlvbnNdLCBjYik7XG4gIH07XG5cbiAgZnVuY3Rpb24gSm9iKHJvb3RWYWwsIHR5cGUsIGRhdGEpIHtcbiAgICB2YXIgZG9jLCByZWYsIHRpbWU7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEpvYikpIHtcbiAgICAgIHJldHVybiBuZXcgSm9iKHJvb3RWYWwsIHR5cGUsIGRhdGEpO1xuICAgIH1cbiAgICB0aGlzLnJvb3QgPSByb290VmFsO1xuICAgIHRoaXMuX3Jvb3QgPSByb290VmFsO1xuICAgIGlmICgoKChyZWYgPSB0aGlzLnJvb3QpICE9IG51bGwgPyByZWYucm9vdCA6IHZvaWQgMCkgIT0gbnVsbCkgJiYgdHlwZW9mIHRoaXMucm9vdC5yb290ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5yb290ID0gdGhpcy5fcm9vdC5yb290O1xuICAgIH1cbiAgICBpZiAoKGRhdGEgPT0gbnVsbCkgJiYgKCh0eXBlICE9IG51bGwgPyB0eXBlLmRhdGEgOiB2b2lkIDApICE9IG51bGwpICYmICgodHlwZSAhPSBudWxsID8gdHlwZS50eXBlIDogdm9pZCAwKSAhPSBudWxsKSkge1xuICAgICAgaWYgKHR5cGUgaW5zdGFuY2VvZiBKb2IpIHtcbiAgICAgICAgcmV0dXJuIHR5cGU7XG4gICAgICB9XG4gICAgICBkb2MgPSB0eXBlO1xuICAgICAgZGF0YSA9IGRvYy5kYXRhO1xuICAgICAgdHlwZSA9IGRvYy50eXBlO1xuICAgIH0gZWxzZSB7XG4gICAgICBkb2MgPSB7fTtcbiAgICB9XG4gICAgaWYgKCEodHlwZW9mIGRvYyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGRhdGEgPT09ICdvYmplY3QnICYmIHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgdGhpcy5yb290ID09PSAnc3RyaW5nJykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm5ldyBKb2I6IGJhZCBwYXJhbWV0ZXIocyksIFwiICsgdGhpcy5yb290ICsgXCIgKFwiICsgKHR5cGVvZiB0aGlzLnJvb3QpICsgXCIpLCBcIiArIHR5cGUgKyBcIiAoXCIgKyAodHlwZW9mIHR5cGUpICsgXCIpLCBcIiArIGRhdGEgKyBcIiAoXCIgKyAodHlwZW9mIGRhdGEpICsgXCIpLCBcIiArIGRvYyArIFwiIChcIiArICh0eXBlb2YgZG9jKSArIFwiKVwiKTtcbiAgICB9IGVsc2UgaWYgKChkb2MudHlwZSAhPSBudWxsKSAmJiAoZG9jLmRhdGEgIT0gbnVsbCkpIHtcbiAgICAgIHRoaXMuX2RvYyA9IGRvYztcbiAgICB9IGVsc2Uge1xuICAgICAgdGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICB0aGlzLl9kb2MgPSB7XG4gICAgICAgIHJ1bklkOiBudWxsLFxuICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBzdGF0dXM6ICd3YWl0aW5nJyxcbiAgICAgICAgdXBkYXRlZDogdGltZSxcbiAgICAgICAgY3JlYXRlZDogdGltZVxuICAgICAgfTtcbiAgICAgIHRoaXMucHJpb3JpdHkoKS5yZXRyeSgpLnJlcGVhdCgpLmFmdGVyKCkucHJvZ3Jlc3MoKS5kZXBlbmRzKCkubG9nKFwiQ29uc3RydWN0ZWRcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgSm9iLnByb3RvdHlwZS5fZWNobyA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGxldmVsKSB7XG4gICAgaWYgKGxldmVsID09IG51bGwpIHtcbiAgICAgIGxldmVsID0gbnVsbDtcbiAgICB9XG4gICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgY2FzZSAnZGFuZ2VyJzpcbiAgICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd3YXJuaW5nJzpcbiAgICAgICAgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3N1Y2Nlc3MnOlxuICAgICAgICBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25zb2xlLmluZm8obWVzc2FnZSk7XG4gICAgfVxuICB9O1xuXG4gIEpvYi5wcm90b3R5cGUuZGVwZW5kcyA9IGZ1bmN0aW9uKGpvYnMpIHtcbiAgICB2YXIgZGVwZW5kcywgaiwgaywgbGVuO1xuICAgIGlmIChqb2JzKSB7XG4gICAgICBpZiAoam9icyBpbnN0YW5jZW9mIEpvYikge1xuICAgICAgICBqb2JzID0gW2pvYnNdO1xuICAgICAgfVxuICAgICAgaWYgKGpvYnMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBkZXBlbmRzID0gdGhpcy5fZG9jLmRlcGVuZHM7XG4gICAgICAgIGZvciAoayA9IDAsIGxlbiA9IGpvYnMubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgICBqID0gam9ic1trXTtcbiAgICAgICAgICBpZiAoIShqIGluc3RhbmNlb2YgSm9iICYmIChqLl9kb2MuX2lkICE9IG51bGwpKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFYWNoIHByb3ZpZGVkIG9iamVjdCBtdXN0IGJlIGEgc2F2ZWQgSm9iIGluc3RhbmNlICh3aXRoIGFuIF9pZCknKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVwZW5kcy5wdXNoKGouX2RvYy5faWQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JhZCBpbnB1dCBwYXJhbWV0ZXI6IGRlcGVuZHMoKSBhY2NlcHRzIGEgZmFsc3kgdmFsdWUsIG9yIEpvYiBvciBhcnJheSBvZiBKb2JzJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlcGVuZHMgPSBbXTtcbiAgICB9XG4gICAgdGhpcy5fZG9jLmRlcGVuZHMgPSBkZXBlbmRzO1xuICAgIHRoaXMuX2RvYy5yZXNvbHZlZCA9IFtdO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEpvYi5wcm90b3R5cGUucHJpb3JpdHkgPSBmdW5jdGlvbihsZXZlbCkge1xuICAgIHZhciBwcmlvcml0eTtcbiAgICBpZiAobGV2ZWwgPT0gbnVsbCkge1xuICAgICAgbGV2ZWwgPSAwO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGxldmVsID09PSAnc3RyaW5nJykge1xuICAgICAgcHJpb3JpdHkgPSBKb2Iuam9iUHJpb3JpdGllc1tsZXZlbF07XG4gICAgICBpZiAocHJpb3JpdHkgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nIHByaW9yaXR5IGxldmVsIHByb3ZpZGVkJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc0ludGVnZXIobGV2ZWwpKSB7XG4gICAgICBwcmlvcml0eSA9IGxldmVsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3ByaW9yaXR5IG11c3QgYmUgYW4gaW50ZWdlciBvciB2YWxpZCBwcmlvcml0eSBsZXZlbCcpO1xuICAgICAgcHJpb3JpdHkgPSAwO1xuICAgIH1cbiAgICB0aGlzLl9kb2MucHJpb3JpdHkgPSBwcmlvcml0eTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBKb2IucHJvdG90eXBlLnJldHJ5ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBiYXNlLCByZWY7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucyA9IDA7XG4gICAgfVxuICAgIGlmIChpc0ludGVnZXIob3B0aW9ucykgJiYgb3B0aW9ucyA+PSAwKSB7XG4gICAgICBvcHRpb25zID0ge1xuICAgICAgICByZXRyaWVzOiBvcHRpb25zXG4gICAgICB9O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwYXJhbWV0ZXI6IGFjY2VwdHMgZWl0aGVyIGFuIGludGVnZXIgPj0gMCBvciBhbiBvcHRpb25zIG9iamVjdCcpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5yZXRyaWVzICE9IG51bGwpIHtcbiAgICAgIGlmICghKGlzSW50ZWdlcihvcHRpb25zLnJldHJpZXMpICYmIG9wdGlvbnMucmV0cmllcyA+PSAwKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBvcHRpb246IHJldHJpZXMgbXVzdCBiZSBhbiBpbnRlZ2VyID49IDAnKTtcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMucmV0cmllcysrO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb25zLnJldHJpZXMgPSBKb2IuZm9yZXZlcjtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMudW50aWwgIT0gbnVsbCkge1xuICAgICAgaWYgKCEob3B0aW9ucy51bnRpbCBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYmFkIG9wdGlvbjogdW50aWwgbXVzdCBiZSBhIERhdGUgb2JqZWN0Jyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdGlvbnMudW50aWwgPSBKb2IuZm9yZXZlckRhdGU7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLndhaXQgIT0gbnVsbCkge1xuICAgICAgaWYgKCEoaXNJbnRlZ2VyKG9wdGlvbnMud2FpdCkgJiYgb3B0aW9ucy53YWl0ID49IDApKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYmFkIG9wdGlvbjogd2FpdCBtdXN0IGJlIGFuIGludGVnZXIgPj0gMCcpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb25zLndhaXQgPSA1ICogNjAgKiAxMDAwO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5iYWNrb2ZmICE9IG51bGwpIHtcbiAgICAgIGlmIChyZWYgPSBvcHRpb25zLmJhY2tvZmYsIGluZGV4T2YuY2FsbChKb2Iuam9iUmV0cnlCYWNrb2ZmTWV0aG9kcywgcmVmKSA8IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgb3B0aW9uOiBpbnZhbGlkIHJldHJ5IGJhY2tvZmYgbWV0aG9kJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdGlvbnMuYmFja29mZiA9ICdjb25zdGFudCc7XG4gICAgfVxuICAgIHRoaXMuX2RvYy5yZXRyaWVzID0gb3B0aW9ucy5yZXRyaWVzO1xuICAgIHRoaXMuX2RvYy5yZXBlYXRSZXRyaWVzID0gb3B0aW9ucy5yZXRyaWVzO1xuICAgIHRoaXMuX2RvYy5yZXRyeVdhaXQgPSBvcHRpb25zLndhaXQ7XG4gICAgaWYgKChiYXNlID0gdGhpcy5fZG9jKS5yZXRyaWVkID09IG51bGwpIHtcbiAgICAgIGJhc2UucmV0cmllZCA9IDA7XG4gICAgfVxuICAgIHRoaXMuX2RvYy5yZXRyeUJhY2tvZmYgPSBvcHRpb25zLmJhY2tvZmY7XG4gICAgdGhpcy5fZG9jLnJldHJ5VW50aWwgPSBvcHRpb25zLnVudGlsO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEpvYi5wcm90b3R5cGUucmVwZWF0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBiYXNlLCByZWY7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucyA9IDA7XG4gICAgfVxuICAgIGlmIChpc0ludGVnZXIob3B0aW9ucykgJiYgb3B0aW9ucyA+PSAwKSB7XG4gICAgICBvcHRpb25zID0ge1xuICAgICAgICByZXBlYXRzOiBvcHRpb25zXG4gICAgICB9O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwYXJhbWV0ZXI6IGFjY2VwdHMgZWl0aGVyIGFuIGludGVnZXIgPj0gMCBvciBhbiBvcHRpb25zIG9iamVjdCcpO1xuICAgIH1cbiAgICBpZiAoKG9wdGlvbnMud2FpdCAhPSBudWxsKSAmJiAob3B0aW9ucy5zY2hlZHVsZSAhPSBudWxsKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgb3B0aW9uczogd2FpdCBhbmQgc2NoZWR1bGUgb3B0aW9ucyBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlJyk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLnJlcGVhdHMgIT0gbnVsbCkge1xuICAgICAgaWYgKCEoaXNJbnRlZ2VyKG9wdGlvbnMucmVwZWF0cykgJiYgb3B0aW9ucy5yZXBlYXRzID49IDApKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYmFkIG9wdGlvbjogcmVwZWF0cyBtdXN0IGJlIGFuIGludGVnZXIgPj0gMCcpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb25zLnJlcGVhdHMgPSBKb2IuZm9yZXZlcjtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMudW50aWwgIT0gbnVsbCkge1xuICAgICAgaWYgKCEob3B0aW9ucy51bnRpbCBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYmFkIG9wdGlvbjogdW50aWwgbXVzdCBiZSBhIERhdGUgb2JqZWN0Jyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdGlvbnMudW50aWwgPSBKb2IuZm9yZXZlckRhdGU7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLndhaXQgIT0gbnVsbCkge1xuICAgICAgaWYgKCEoaXNJbnRlZ2VyKG9wdGlvbnMud2FpdCkgJiYgb3B0aW9ucy53YWl0ID49IDApKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYmFkIG9wdGlvbjogd2FpdCBtdXN0IGJlIGFuIGludGVnZXIgPj0gMCcpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb25zLndhaXQgPSA1ICogNjAgKiAxMDAwO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5zY2hlZHVsZSAhPSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMuc2NoZWR1bGUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYmFkIG9wdGlvbiwgc2NoZWR1bGUgb3B0aW9uIG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gICAgICB9XG4gICAgICBpZiAoISgoKChyZWYgPSBvcHRpb25zLnNjaGVkdWxlKSAhPSBudWxsID8gcmVmLnNjaGVkdWxlcyA6IHZvaWQgMCkgIT0gbnVsbCkgJiYgb3B0aW9ucy5zY2hlZHVsZS5zY2hlZHVsZXMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgb3B0aW9uLCBzY2hlZHVsZSBvYmplY3QgcmVxdWlyZXMgYSBzY2hlZHVsZXMgYXR0cmlidXRlIG9mIHR5cGUgQXJyYXkuJyk7XG4gICAgICB9XG4gICAgICBpZiAoKG9wdGlvbnMuc2NoZWR1bGUuZXhjZXB0aW9ucyAhPSBudWxsKSAmJiAhKG9wdGlvbnMuc2NoZWR1bGUuZXhjZXB0aW9ucyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBvcHRpb24sIHNjaGVkdWxlIG9iamVjdCBleGNlcHRpb25zIGF0dHJpYnV0ZSBtdXN0IGJlIGFuIEFycmF5Jyk7XG4gICAgICB9XG4gICAgICBvcHRpb25zLndhaXQgPSB7XG4gICAgICAgIHNjaGVkdWxlczogb3B0aW9ucy5zY2hlZHVsZS5zY2hlZHVsZXMsXG4gICAgICAgIGV4Y2VwdGlvbnM6IG9wdGlvbnMuc2NoZWR1bGUuZXhjZXB0aW9uc1xuICAgICAgfTtcbiAgICB9XG4gICAgdGhpcy5fZG9jLnJlcGVhdHMgPSBvcHRpb25zLnJlcGVhdHM7XG4gICAgdGhpcy5fZG9jLnJlcGVhdFdhaXQgPSBvcHRpb25zLndhaXQ7XG4gICAgaWYgKChiYXNlID0gdGhpcy5fZG9jKS5yZXBlYXRlZCA9PSBudWxsKSB7XG4gICAgICBiYXNlLnJlcGVhdGVkID0gMDtcbiAgICB9XG4gICAgdGhpcy5fZG9jLnJlcGVhdFVudGlsID0gb3B0aW9ucy51bnRpbDtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBKb2IucHJvdG90eXBlLmRlbGF5ID0gZnVuY3Rpb24od2FpdCkge1xuICAgIGlmICh3YWl0ID09IG51bGwpIHtcbiAgICAgIHdhaXQgPSAwO1xuICAgIH1cbiAgICBpZiAoIShpc0ludGVnZXIod2FpdCkgJiYgd2FpdCA+PSAwKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCYWQgcGFyYW1ldGVyLCBkZWxheSByZXF1aXJlcyBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLicpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5hZnRlcihuZXcgRGF0ZShuZXcgRGF0ZSgpLnZhbHVlT2YoKSArIHdhaXQpKTtcbiAgfTtcblxuICBKb2IucHJvdG90eXBlLmFmdGVyID0gZnVuY3Rpb24odGltZSkge1xuICAgIHZhciBhZnRlcjtcbiAgICBpZiAodGltZSA9PSBudWxsKSB7XG4gICAgICB0aW1lID0gbmV3IERhdGUoMCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGltZSA9PT0gJ29iamVjdCcgJiYgdGltZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgIGFmdGVyID0gdGltZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCYWQgcGFyYW1ldGVyLCBhZnRlciByZXF1aXJlcyBhIHZhbGlkIERhdGUgb2JqZWN0Jyk7XG4gICAgfVxuICAgIHRoaXMuX2RvYy5hZnRlciA9IGFmdGVyO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEpvYi5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGJhc2UsIGNiLCBrLCBtZXNzYWdlLCBvcHRpb25zLCByZWYsIHJlZjE7XG4gICAgbWVzc2FnZSA9IGFyZ3VtZW50c1swXSwgb3B0aW9ucyA9IDMgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxLCBrID0gYXJndW1lbnRzLmxlbmd0aCAtIDEpIDogKGsgPSAxLCBbXSksIGNiID0gYXJndW1lbnRzW2srK107XG4gICAgcmVmID0gb3B0aW9uc0hlbHAob3B0aW9ucywgY2IpLCBvcHRpb25zID0gcmVmWzBdLCBjYiA9IHJlZlsxXTtcbiAgICBpZiAob3B0aW9ucy5sZXZlbCA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLmxldmVsID0gJ2luZm8nO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG1lc3NhZ2UgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xvZyBtZXNzYWdlIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICB9XG4gICAgaWYgKCEodHlwZW9mIG9wdGlvbnMubGV2ZWwgPT09ICdzdHJpbmcnICYmIChyZWYxID0gb3B0aW9ucy5sZXZlbCwgaW5kZXhPZi5jYWxsKEpvYi5qb2JMb2dMZXZlbHMsIHJlZjEpID49IDApKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdMb2cgbGV2ZWwgb3B0aW9ucyBtdXN0IGJlIG9uZSBvZiBKb2Iuam9iTG9nTGV2ZWxzJyk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmVjaG8gIT0gbnVsbCkge1xuICAgICAgaWYgKG9wdGlvbnMuZWNobyAmJiBKb2Iuam9iTG9nTGV2ZWxzLmluZGV4T2Yob3B0aW9ucy5sZXZlbCkgPj0gSm9iLmpvYkxvZ0xldmVscy5pbmRleE9mKG9wdGlvbnMuZWNobykpIHtcbiAgICAgICAgdGhpcy5fZWNobyhcIkxPRzogXCIgKyBvcHRpb25zLmxldmVsICsgXCIsIFwiICsgdGhpcy5fZG9jLl9pZCArIFwiIFwiICsgdGhpcy5fZG9jLnJ1bklkICsgXCI6IFwiICsgbWVzc2FnZSwgb3B0aW9ucy5sZXZlbCk7XG4gICAgICB9XG4gICAgICBkZWxldGUgb3B0aW9ucy5lY2hvO1xuICAgIH1cbiAgICBpZiAodGhpcy5fZG9jLl9pZCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gbWV0aG9kQ2FsbCh0aGlzLl9yb290LCBcImpvYkxvZ1wiLCBbdGhpcy5fZG9jLl9pZCwgdGhpcy5fZG9jLnJ1bklkLCBtZXNzYWdlLCBvcHRpb25zXSwgY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoKGJhc2UgPSB0aGlzLl9kb2MpLmxvZyA9PSBudWxsKSB7XG4gICAgICAgIGJhc2UubG9nID0gW107XG4gICAgICB9XG4gICAgICB0aGlzLl9kb2MubG9nLnB1c2goe1xuICAgICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgICBydW5JZDogbnVsbCxcbiAgICAgICAgbGV2ZWw6IG9wdGlvbnMubGV2ZWwsXG4gICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcbiAgICAgIH0pO1xuICAgICAgaWYgKChjYiAhPSBudWxsKSAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgX3NldEltbWVkaWF0ZShjYiwgbnVsbCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG5cbiAgSm9iLnByb3RvdHlwZS5wcm9ncmVzcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYiwgY29tcGxldGVkLCBrLCBvcHRpb25zLCBwcm9ncmVzcywgcmVmLCB0b3RhbDtcbiAgICBjb21wbGV0ZWQgPSBhcmd1bWVudHNbMF0sIHRvdGFsID0gYXJndW1lbnRzWzFdLCBvcHRpb25zID0gNCA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIsIGsgPSBhcmd1bWVudHMubGVuZ3RoIC0gMSkgOiAoayA9IDIsIFtdKSwgY2IgPSBhcmd1bWVudHNbaysrXTtcbiAgICBpZiAoY29tcGxldGVkID09IG51bGwpIHtcbiAgICAgIGNvbXBsZXRlZCA9IDA7XG4gICAgfVxuICAgIGlmICh0b3RhbCA9PSBudWxsKSB7XG4gICAgICB0b3RhbCA9IDE7XG4gICAgfVxuICAgIHJlZiA9IG9wdGlvbnNIZWxwKG9wdGlvbnMsIGNiKSwgb3B0aW9ucyA9IHJlZlswXSwgY2IgPSByZWZbMV07XG4gICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdudW1iZXInICYmIHR5cGVvZiB0b3RhbCA9PT0gJ251bWJlcicgJiYgY29tcGxldGVkID49IDAgJiYgdG90YWwgPiAwICYmIHRvdGFsID49IGNvbXBsZXRlZCkge1xuICAgICAgcHJvZ3Jlc3MgPSB7XG4gICAgICAgIGNvbXBsZXRlZDogY29tcGxldGVkLFxuICAgICAgICB0b3RhbDogdG90YWwsXG4gICAgICAgIHBlcmNlbnQ6IDEwMCAqIGNvbXBsZXRlZCAvIHRvdGFsXG4gICAgICB9O1xuICAgICAgaWYgKG9wdGlvbnMuZWNobykge1xuICAgICAgICBkZWxldGUgb3B0aW9ucy5lY2hvO1xuICAgICAgICB0aGlzLl9lY2hvKFwiUFJPR1JFU1M6IFwiICsgdGhpcy5fZG9jLl9pZCArIFwiIFwiICsgdGhpcy5fZG9jLnJ1bklkICsgXCI6IFwiICsgcHJvZ3Jlc3MuY29tcGxldGVkICsgXCIgb3V0IG9mIFwiICsgcHJvZ3Jlc3MudG90YWwgKyBcIiAoXCIgKyBwcm9ncmVzcy5wZXJjZW50ICsgXCIlKVwiKTtcbiAgICAgIH1cbiAgICAgIGlmICgodGhpcy5fZG9jLl9pZCAhPSBudWxsKSAmJiAodGhpcy5fZG9jLnJ1bklkICE9IG51bGwpKSB7XG4gICAgICAgIHJldHVybiBtZXRob2RDYWxsKHRoaXMuX3Jvb3QsIFwiam9iUHJvZ3Jlc3NcIiwgW3RoaXMuX2RvYy5faWQsIHRoaXMuX2RvYy5ydW5JZCwgY29tcGxldGVkLCB0b3RhbCwgb3B0aW9uc10sIGNiLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICBpZiAocmVzKSB7XG4gICAgICAgICAgICAgIF90aGlzLl9kb2MucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkodGhpcykpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9kb2MuX2lkID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fZG9jLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG4gICAgICAgIGlmICgoY2IgIT0gbnVsbCkgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgX3NldEltbWVkaWF0ZShjYiwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImpvYi5wcm9ncmVzczogc29tZXRoaW5nIGlzIHdyb25nIHdpdGggcHJvZ3Jlc3MgcGFyYW1zOiBcIiArIHRoaXMuaWQgKyBcIiwgXCIgKyBjb21wbGV0ZWQgKyBcIiBvdXQgb2YgXCIgKyB0b3RhbCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIEpvYi5wcm90b3R5cGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYiwgaywgb3B0aW9ucywgcmVmO1xuICAgIG9wdGlvbnMgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCwgayA9IGFyZ3VtZW50cy5sZW5ndGggLSAxKSA6IChrID0gMCwgW10pLCBjYiA9IGFyZ3VtZW50c1trKytdO1xuICAgIHJlZiA9IG9wdGlvbnNIZWxwKG9wdGlvbnMsIGNiKSwgb3B0aW9ucyA9IHJlZlswXSwgY2IgPSByZWZbMV07XG4gICAgcmV0dXJuIG1ldGhvZENhbGwodGhpcy5fcm9vdCwgXCJqb2JTYXZlXCIsIFt0aGlzLl9kb2MsIG9wdGlvbnNdLCBjYiwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgaWYgKGlkKSB7XG4gICAgICAgICAgX3RoaXMuX2RvYy5faWQgPSBpZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaWQ7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuICBKb2IucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2IsIGssIG9wdGlvbnMsIHJlZjtcbiAgICBvcHRpb25zID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDAsIGsgPSBhcmd1bWVudHMubGVuZ3RoIC0gMSkgOiAoayA9IDAsIFtdKSwgY2IgPSBhcmd1bWVudHNbaysrXTtcbiAgICByZWYgPSBvcHRpb25zSGVscChvcHRpb25zLCBjYiksIG9wdGlvbnMgPSByZWZbMF0sIGNiID0gcmVmWzFdO1xuICAgIGlmIChvcHRpb25zLmdldExvZyA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLmdldExvZyA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAodGhpcy5fZG9jLl9pZCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gbWV0aG9kQ2FsbCh0aGlzLl9yb290LCBcImdldEpvYlwiLCBbdGhpcy5fZG9jLl9pZCwgb3B0aW9uc10sIGNiLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRvYykge1xuICAgICAgICAgIGlmIChkb2MgIT0gbnVsbCkge1xuICAgICAgICAgICAgX3RoaXMuX2RvYyA9IGRvYztcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY2FsbCAucmVmcmVzaCgpIG9uIGFuIHVuc2F2ZWQgam9iXCIpO1xuICAgIH1cbiAgfTtcblxuICBKb2IucHJvdG90eXBlLmRvbmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2IsIGssIG9wdGlvbnMsIHJlZiwgcmVzdWx0O1xuICAgIHJlc3VsdCA9IGFyZ3VtZW50c1swXSwgb3B0aW9ucyA9IDMgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxLCBrID0gYXJndW1lbnRzLmxlbmd0aCAtIDEpIDogKGsgPSAxLCBbXSksIGNiID0gYXJndW1lbnRzW2srK107XG4gICAgaWYgKHJlc3VsdCA9PSBudWxsKSB7XG4gICAgICByZXN1bHQgPSB7fTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiByZXN1bHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNiID0gcmVzdWx0O1xuICAgICAgcmVzdWx0ID0ge307XG4gICAgfVxuICAgIHJlZiA9IG9wdGlvbnNIZWxwKG9wdGlvbnMsIGNiKSwgb3B0aW9ucyA9IHJlZlswXSwgY2IgPSByZWZbMV07XG4gICAgaWYgKCEoKHJlc3VsdCAhPSBudWxsKSAmJiB0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0JykpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgdmFsdWU6IHJlc3VsdFxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKCh0aGlzLl9kb2MuX2lkICE9IG51bGwpICYmICh0aGlzLl9kb2MucnVuSWQgIT0gbnVsbCkpIHtcbiAgICAgIHJldHVybiBtZXRob2RDYWxsKHRoaXMuX3Jvb3QsIFwiam9iRG9uZVwiLCBbdGhpcy5fZG9jLl9pZCwgdGhpcy5fZG9jLnJ1bklkLCByZXN1bHQsIG9wdGlvbnNdLCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNhbGwgLmRvbmUoKSBvbiBhbiB1bnNhdmVkIG9yIG5vbi1ydW5uaW5nIGpvYlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgSm9iLnByb3RvdHlwZS5mYWlsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNiLCBrLCBvcHRpb25zLCByZWYsIHJlc3VsdDtcbiAgICByZXN1bHQgPSBhcmd1bWVudHNbMF0sIG9wdGlvbnMgPSAzIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSwgayA9IGFyZ3VtZW50cy5sZW5ndGggLSAxKSA6IChrID0gMSwgW10pLCBjYiA9IGFyZ3VtZW50c1trKytdO1xuICAgIGlmIChyZXN1bHQgPT0gbnVsbCkge1xuICAgICAgcmVzdWx0ID0gXCJObyBlcnJvciBpbmZvcm1hdGlvbiBwcm92aWRlZFwiO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHJlc3VsdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2IgPSByZXN1bHQ7XG4gICAgICByZXN1bHQgPSBcIk5vIGVycm9yIGluZm9ybWF0aW9uIHByb3ZpZGVkXCI7XG4gICAgfVxuICAgIHJlZiA9IG9wdGlvbnNIZWxwKG9wdGlvbnMsIGNiKSwgb3B0aW9ucyA9IHJlZlswXSwgY2IgPSByZWZbMV07XG4gICAgaWYgKCEoKHJlc3VsdCAhPSBudWxsKSAmJiB0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0JykpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgdmFsdWU6IHJlc3VsdFxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZmF0YWwgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucy5mYXRhbCA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAoKHRoaXMuX2RvYy5faWQgIT0gbnVsbCkgJiYgKHRoaXMuX2RvYy5ydW5JZCAhPSBudWxsKSkge1xuICAgICAgcmV0dXJuIG1ldGhvZENhbGwodGhpcy5fcm9vdCwgXCJqb2JGYWlsXCIsIFt0aGlzLl9kb2MuX2lkLCB0aGlzLl9kb2MucnVuSWQsIHJlc3VsdCwgb3B0aW9uc10sIGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY2FsbCAuZmFpbCgpIG9uIGFuIHVuc2F2ZWQgb3Igbm9uLXJ1bm5pbmcgam9iXCIpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBKb2IucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNiLCBrLCBvcHRpb25zLCByZWY7XG4gICAgb3B0aW9ucyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwLCBrID0gYXJndW1lbnRzLmxlbmd0aCAtIDEpIDogKGsgPSAwLCBbXSksIGNiID0gYXJndW1lbnRzW2srK107XG4gICAgcmVmID0gb3B0aW9uc0hlbHAob3B0aW9ucywgY2IpLCBvcHRpb25zID0gcmVmWzBdLCBjYiA9IHJlZlsxXTtcbiAgICBpZiAodGhpcy5fZG9jLl9pZCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gbWV0aG9kQ2FsbCh0aGlzLl9yb290LCBcImpvYlBhdXNlXCIsIFt0aGlzLl9kb2MuX2lkLCBvcHRpb25zXSwgY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kb2Muc3RhdHVzID0gJ3BhdXNlZCc7XG4gICAgICBpZiAoKGNiICE9IG51bGwpICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBfc2V0SW1tZWRpYXRlKGNiLCBudWxsLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBKb2IucHJvdG90eXBlLnJlc3VtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYiwgaywgb3B0aW9ucywgcmVmO1xuICAgIG9wdGlvbnMgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCwgayA9IGFyZ3VtZW50cy5sZW5ndGggLSAxKSA6IChrID0gMCwgW10pLCBjYiA9IGFyZ3VtZW50c1trKytdO1xuICAgIHJlZiA9IG9wdGlvbnNIZWxwKG9wdGlvbnMsIGNiKSwgb3B0aW9ucyA9IHJlZlswXSwgY2IgPSByZWZbMV07XG4gICAgaWYgKHRoaXMuX2RvYy5faWQgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG1ldGhvZENhbGwodGhpcy5fcm9vdCwgXCJqb2JSZXN1bWVcIiwgW3RoaXMuX2RvYy5faWQsIG9wdGlvbnNdLCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2RvYy5zdGF0dXMgPSAnd2FpdGluZyc7XG4gICAgICBpZiAoKGNiICE9IG51bGwpICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBfc2V0SW1tZWRpYXRlKGNiLCBudWxsLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBKb2IucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNiLCBrLCBvcHRpb25zLCByZWY7XG4gICAgb3B0aW9ucyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwLCBrID0gYXJndW1lbnRzLmxlbmd0aCAtIDEpIDogKGsgPSAwLCBbXSksIGNiID0gYXJndW1lbnRzW2srK107XG4gICAgcmVmID0gb3B0aW9uc0hlbHAob3B0aW9ucywgY2IpLCBvcHRpb25zID0gcmVmWzBdLCBjYiA9IHJlZlsxXTtcbiAgICBpZiAob3B0aW9ucy5mb3JjZSA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLmZvcmNlID0gZmFsc2U7XG4gICAgfVxuICAgIGlmICh0aGlzLl9kb2MuX2lkICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBtZXRob2RDYWxsKHRoaXMuX3Jvb3QsIFwiam9iUmVhZHlcIiwgW3RoaXMuX2RvYy5faWQsIG9wdGlvbnNdLCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNhbGwgLnJlYWR5KCkgb24gYW4gdW5zYXZlZCBqb2JcIik7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIEpvYi5wcm90b3R5cGUuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNiLCBrLCBvcHRpb25zLCByZWY7XG4gICAgb3B0aW9ucyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwLCBrID0gYXJndW1lbnRzLmxlbmd0aCAtIDEpIDogKGsgPSAwLCBbXSksIGNiID0gYXJndW1lbnRzW2srK107XG4gICAgcmVmID0gb3B0aW9uc0hlbHAob3B0aW9ucywgY2IpLCBvcHRpb25zID0gcmVmWzBdLCBjYiA9IHJlZlsxXTtcbiAgICBpZiAob3B0aW9ucy5hbnRlY2VkZW50cyA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLmFudGVjZWRlbnRzID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2RvYy5faWQgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG1ldGhvZENhbGwodGhpcy5fcm9vdCwgXCJqb2JDYW5jZWxcIiwgW3RoaXMuX2RvYy5faWQsIG9wdGlvbnNdLCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNhbGwgLmNhbmNlbCgpIG9uIGFuIHVuc2F2ZWQgam9iXCIpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBKb2IucHJvdG90eXBlLnJlc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2IsIGssIG9wdGlvbnMsIHJlZjtcbiAgICBvcHRpb25zID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDAsIGsgPSBhcmd1bWVudHMubGVuZ3RoIC0gMSkgOiAoayA9IDAsIFtdKSwgY2IgPSBhcmd1bWVudHNbaysrXTtcbiAgICByZWYgPSBvcHRpb25zSGVscChvcHRpb25zLCBjYiksIG9wdGlvbnMgPSByZWZbMF0sIGNiID0gcmVmWzFdO1xuICAgIGlmIChvcHRpb25zLnJldHJpZXMgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucy5yZXRyaWVzID0gMTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZGVwZW5kZW50cyA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLmRlcGVuZGVudHMgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAodGhpcy5fZG9jLl9pZCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gbWV0aG9kQ2FsbCh0aGlzLl9yb290LCBcImpvYlJlc3RhcnRcIiwgW3RoaXMuX2RvYy5faWQsIG9wdGlvbnNdLCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNhbGwgLnJlc3RhcnQoKSBvbiBhbiB1bnNhdmVkIGpvYlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgSm9iLnByb3RvdHlwZS5yZXJ1biA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYiwgaywgb3B0aW9ucywgcmVmO1xuICAgIG9wdGlvbnMgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCwgayA9IGFyZ3VtZW50cy5sZW5ndGggLSAxKSA6IChrID0gMCwgW10pLCBjYiA9IGFyZ3VtZW50c1trKytdO1xuICAgIHJlZiA9IG9wdGlvbnNIZWxwKG9wdGlvbnMsIGNiKSwgb3B0aW9ucyA9IHJlZlswXSwgY2IgPSByZWZbMV07XG4gICAgaWYgKG9wdGlvbnMucmVwZWF0cyA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLnJlcGVhdHMgPSAwO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy53YWl0ID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMud2FpdCA9IHRoaXMuX2RvYy5yZXBlYXRXYWl0O1xuICAgIH1cbiAgICBpZiAodGhpcy5fZG9jLl9pZCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gbWV0aG9kQ2FsbCh0aGlzLl9yb290LCBcImpvYlJlcnVuXCIsIFt0aGlzLl9kb2MuX2lkLCBvcHRpb25zXSwgY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjYWxsIC5yZXJ1bigpIG9uIGFuIHVuc2F2ZWQgam9iXCIpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBKb2IucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYiwgaywgb3B0aW9ucywgcmVmO1xuICAgIG9wdGlvbnMgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCwgayA9IGFyZ3VtZW50cy5sZW5ndGggLSAxKSA6IChrID0gMCwgW10pLCBjYiA9IGFyZ3VtZW50c1trKytdO1xuICAgIHJlZiA9IG9wdGlvbnNIZWxwKG9wdGlvbnMsIGNiKSwgb3B0aW9ucyA9IHJlZlswXSwgY2IgPSByZWZbMV07XG4gICAgaWYgKHRoaXMuX2RvYy5faWQgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG1ldGhvZENhbGwodGhpcy5fcm9vdCwgXCJqb2JSZW1vdmVcIiwgW3RoaXMuX2RvYy5faWQsIG9wdGlvbnNdLCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNhbGwgLnJlbW92ZSgpIG9uIGFuIHVuc2F2ZWQgam9iXCIpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhKb2IucHJvdG90eXBlLCB7XG4gICAgZG9jOiB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZG9jO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oXCJKb2IuZG9jIGNhbm5vdCBiZSBkaXJlY3RseSBhc3NpZ25lZC5cIik7XG4gICAgICB9XG4gICAgfSxcbiAgICB0eXBlOiB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZG9jLnR5cGU7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybihcIkpvYi50eXBlIGNhbm5vdCBiZSBkaXJlY3RseSBhc3NpZ25lZC5cIik7XG4gICAgICB9XG4gICAgfSxcbiAgICBkYXRhOiB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZG9jLmRhdGE7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybihcIkpvYi5kYXRhIGNhbm5vdCBiZSBkaXJlY3RseSBhc3NpZ25lZC5cIik7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gSm9iO1xuXG59KSgpO1xuXG5pZiAoKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsID8gbW9kdWxlLmV4cG9ydHMgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBKb2I7XG59XG4iLCIjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4jICAgICBDb3B5cmlnaHQgKEMpIDIwMTQtMjAxNyBieSBWYXVnaG4gSXZlcnNvblxuIyAgICAgam9iLWNvbGxlY3Rpb24gaXMgZnJlZSBzb2Z0d2FyZSByZWxlYXNlZCB1bmRlciB0aGUgTUlUL1gxMSBsaWNlbnNlLlxuIyAgICAgU2VlIGluY2x1ZGVkIExJQ0VOU0UgZmlsZSBmb3IgZGV0YWlscy5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuX3ZhbGlkTnVtR1RFWmVybyA9ICh2KSAtPlxuICBNYXRjaC50ZXN0KHYsIE51bWJlcikgYW5kIHYgPj0gMC4wXG5cbl92YWxpZE51bUdUWmVybyA9ICh2KSAtPlxuICBNYXRjaC50ZXN0KHYsIE51bWJlcikgYW5kIHYgPiAwLjBcblxuX3ZhbGlkTnVtR1RFT25lID0gKHYpIC0+XG4gIE1hdGNoLnRlc3QodiwgTnVtYmVyKSBhbmQgdiA+PSAxLjBcblxuX3ZhbGlkSW50R1RFWmVybyA9ICh2KSAtPlxuICBfdmFsaWROdW1HVEVaZXJvKHYpIGFuZCBNYXRoLmZsb29yKHYpIGlzIHZcblxuX3ZhbGlkSW50R1RFT25lID0gKHYpIC0+XG4gIF92YWxpZE51bUdURU9uZSh2KSBhbmQgTWF0aC5mbG9vcih2KSBpcyB2XG5cbl92YWxpZFN0YXR1cyA9ICh2KSAtPlxuICBNYXRjaC50ZXN0KHYsIFN0cmluZykgYW5kIHYgaW4gSm9iLmpvYlN0YXR1c2VzXG5cbl92YWxpZExvZ0xldmVsID0gKHYpIC0+XG4gIE1hdGNoLnRlc3QodiwgU3RyaW5nKSBhbmQgdiBpbiBKb2Iuam9iTG9nTGV2ZWxzXG5cbl92YWxpZFJldHJ5QmFja29mZiA9ICh2KSAtPlxuICBNYXRjaC50ZXN0KHYsIFN0cmluZykgYW5kIHYgaW4gSm9iLmpvYlJldHJ5QmFja29mZk1ldGhvZHNcblxuX3ZhbGlkSWQgPSAodikgLT5cbiAgTWF0Y2gudGVzdCh2LCBNYXRjaC5PbmVPZihTdHJpbmcsIE1vbmdvLkNvbGxlY3Rpb24uT2JqZWN0SUQpKVxuXG5fdmFsaWRMb2cgPSAoKSAtPlxuICBbe1xuICAgICAgdGltZTogRGF0ZVxuICAgICAgcnVuSWQ6IE1hdGNoLk9uZU9mKE1hdGNoLldoZXJlKF92YWxpZElkKSwgbnVsbClcbiAgICAgIGxldmVsOiBNYXRjaC5XaGVyZShfdmFsaWRMb2dMZXZlbClcbiAgICAgIG1lc3NhZ2U6IFN0cmluZ1xuICAgICAgZGF0YTogTWF0Y2guT3B0aW9uYWwgT2JqZWN0XG4gIH1dXG5cbl92YWxpZFByb2dyZXNzID0gKCkgLT5cbiAgY29tcGxldGVkOiBNYXRjaC5XaGVyZShfdmFsaWROdW1HVEVaZXJvKVxuICB0b3RhbDogTWF0Y2guV2hlcmUoX3ZhbGlkTnVtR1RFWmVybylcbiAgcGVyY2VudDogTWF0Y2guV2hlcmUoX3ZhbGlkTnVtR1RFWmVybylcblxuX3ZhbGlkTGF0ZXJKU09iaiA9ICgpIC0+XG4gIHNjaGVkdWxlczogWyBPYmplY3QgXVxuICBleGNlcHRpb25zOiBNYXRjaC5PcHRpb25hbCBbIE9iamVjdCBdXG5cbl92YWxpZEpvYkRvYyA9ICgpIC0+XG4gIF9pZDogTWF0Y2guT3B0aW9uYWwgTWF0Y2guT25lT2YoTWF0Y2guV2hlcmUoX3ZhbGlkSWQpLCBudWxsKVxuICBydW5JZDogTWF0Y2guT25lT2YoTWF0Y2guV2hlcmUoX3ZhbGlkSWQpLCBudWxsKVxuICB0eXBlOiBTdHJpbmdcbiAgc3RhdHVzOiBNYXRjaC5XaGVyZSBfdmFsaWRTdGF0dXNcbiAgZGF0YTogT2JqZWN0XG4gIHJlc3VsdDogTWF0Y2guT3B0aW9uYWwgT2JqZWN0XG4gIGZhaWx1cmVzOiBNYXRjaC5PcHRpb25hbCBbIE9iamVjdCBdXG4gIHByaW9yaXR5OiBNYXRjaC5JbnRlZ2VyXG4gIGRlcGVuZHM6IFsgTWF0Y2guV2hlcmUoX3ZhbGlkSWQpIF1cbiAgcmVzb2x2ZWQ6IFsgTWF0Y2guV2hlcmUoX3ZhbGlkSWQpIF1cbiAgYWZ0ZXI6IERhdGVcbiAgdXBkYXRlZDogRGF0ZVxuICB3b3JrVGltZW91dDogTWF0Y2guT3B0aW9uYWwgTWF0Y2guV2hlcmUoX3ZhbGlkSW50R1RFT25lKVxuICBleHBpcmVzQWZ0ZXI6IE1hdGNoLk9wdGlvbmFsIERhdGVcbiAgbG9nOiBNYXRjaC5PcHRpb25hbCBfdmFsaWRMb2coKVxuICBwcm9ncmVzczogX3ZhbGlkUHJvZ3Jlc3MoKVxuICByZXRyaWVzOiBNYXRjaC5XaGVyZSBfdmFsaWRJbnRHVEVaZXJvXG4gIHJldHJpZWQ6IE1hdGNoLldoZXJlIF92YWxpZEludEdURVplcm9cbiAgcmVwZWF0UmV0cmllczogTWF0Y2guT3B0aW9uYWwgTWF0Y2guV2hlcmUgX3ZhbGlkSW50R1RFWmVyb1xuICByZXRyeVVudGlsOiBEYXRlXG4gIHJldHJ5V2FpdDogTWF0Y2guV2hlcmUgX3ZhbGlkSW50R1RFWmVyb1xuICByZXRyeUJhY2tvZmY6IE1hdGNoLldoZXJlIF92YWxpZFJldHJ5QmFja29mZlxuICByZXBlYXRzOiBNYXRjaC5XaGVyZSBfdmFsaWRJbnRHVEVaZXJvXG4gIHJlcGVhdGVkOiBNYXRjaC5XaGVyZSBfdmFsaWRJbnRHVEVaZXJvXG4gIHJlcGVhdFVudGlsOiBEYXRlXG4gIHJlcGVhdFdhaXQ6IE1hdGNoLk9uZU9mKE1hdGNoLldoZXJlKF92YWxpZEludEdURVplcm8pLCBNYXRjaC5XaGVyZShfdmFsaWRMYXRlckpTT2JqKSlcbiAgY3JlYXRlZDogRGF0ZVxuXG5jbGFzcyBKb2JDb2xsZWN0aW9uQmFzZSBleHRlbmRzIE1vbmdvLkNvbGxlY3Rpb25cblxuICBjb25zdHJ1Y3RvcjogKEByb290ID0gJ3F1ZXVlJywgb3B0aW9ucyA9IHt9KSAtPlxuICAgIHVubGVzcyBAIGluc3RhbmNlb2YgSm9iQ29sbGVjdGlvbkJhc2VcbiAgICAgIHJldHVybiBuZXcgSm9iQ29sbGVjdGlvbkJhc2UoQHJvb3QsIG9wdGlvbnMpXG5cbiAgICB1bmxlc3MgQCBpbnN0YW5jZW9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IgJ1RoZSBnbG9iYWwgZGVmaW5pdGlvbiBvZiBNb25nby5Db2xsZWN0aW9uIGhhcyBjaGFuZ2VkIHNpbmNlIHRoZSBqb2ItY29sbGVjdGlvbiBwYWNrYWdlIHdhcyBsb2FkZWQuIFBsZWFzZSBlbnN1cmUgdGhhdCBhbnkgcGFja2FnZXMgdGhhdCByZWRlZmluZSBNb25nby5Db2xsZWN0aW9uIGFyZSBsb2FkZWQgYmVmb3JlIGpvYi1jb2xsZWN0aW9uLidcblxuICAgIHVubGVzcyBNb25nby5Db2xsZWN0aW9uIGlzIE1vbmdvLkNvbGxlY3Rpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yXG4gICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yICdUaGUgZ2xvYmFsIGRlZmluaXRpb24gb2YgTW9uZ28uQ29sbGVjdGlvbiBoYXMgYmVlbiBwYXRjaGVkIGJ5IGFub3RoZXIgcGFja2FnZSwgYW5kIHRoZSBwcm90b3R5cGUgY29uc3RydWN0b3IgaGFzIGJlZW4gbGVmdCBpbiBhbiBpbmNvbnNpc3RlbnQgc3RhdGUuIFBsZWFzZSBzZWUgdGhpcyBsaW5rIGZvciBhIHdvcmthcm91bmQ6IGh0dHBzOi8vZ2l0aHViLmNvbS92c2l2c2kvbWV0ZW9yLWZpbGUtc2FtcGxlLWFwcC9pc3N1ZXMvMiNpc3N1ZWNvbW1lbnQtMTIwNzgwNTkyJ1xuXG4gICAgQGxhdGVyID0gbGF0ZXIgICMgbGF0ZXIgb2JqZWN0LCBmb3IgY29udmVuaWVuY2VcblxuICAgIG9wdGlvbnMubm9Db2xsZWN0aW9uU3VmZml4ID89IGZhbHNlXG5cbiAgICBjb2xsZWN0aW9uTmFtZSA9IEByb290XG5cbiAgICB1bmxlc3Mgb3B0aW9ucy5ub0NvbGxlY3Rpb25TdWZmaXhcbiAgICAgIGNvbGxlY3Rpb25OYW1lICs9ICcuam9icydcblxuICAgICMgUmVtb3ZlIG5vbi1zdGFuZGFyZCBvcHRpb25zIGJlZm9yZVxuICAgICMgY2FsbGluZyBNb25nby5Db2xsZWN0aW9uIGNvbnN0cnVjdG9yXG4gICAgZGVsZXRlIG9wdGlvbnMubm9Db2xsZWN0aW9uU3VmZml4XG5cbiAgICBKb2Iuc2V0RERQKG9wdGlvbnMuY29ubmVjdGlvbiwgQHJvb3QpXG5cbiAgICBAX2NyZWF0ZUxvZ0VudHJ5ID0gKG1lc3NhZ2UgPSAnJywgcnVuSWQgPSBudWxsLCBsZXZlbCA9ICdpbmZvJywgdGltZSA9IG5ldyBEYXRlKCksIGRhdGEgPSBudWxsKSAtPlxuICAgICAgbCA9IHsgdGltZTogdGltZSwgcnVuSWQ6IHJ1bklkLCBtZXNzYWdlOiBtZXNzYWdlLCBsZXZlbDogbGV2ZWwgfVxuICAgICAgcmV0dXJuIGxcblxuICAgIEBfbG9nTWVzc2FnZSA9XG4gICAgICAncmVhZGllZCc6ICgoKSAtPiBAX2NyZWF0ZUxvZ0VudHJ5IFwiUHJvbW90ZWQgdG8gcmVhZHlcIikuYmluZChAKVxuICAgICAgJ2ZvcmNlZCc6ICgoaWQpIC0+IEBfY3JlYXRlTG9nRW50cnkgXCJEZXBlbmRlbmNpZXMgZm9yY2UgcmVzb2x2ZWRcIiwgbnVsbCwgJ3dhcm5pbmcnKS5iaW5kKEApXG4gICAgICAncmVydW4nOiAoKGlkLCBydW5JZCkgLT4gQF9jcmVhdGVMb2dFbnRyeSBcIlJlcnVubmluZyBqb2JcIiwgbnVsbCwgJ2luZm8nLCBuZXcgRGF0ZSgpLCB7cHJldmlvdXNKb2I6e2lkOmlkLHJ1bklkOnJ1bklkfX0pLmJpbmQoQClcbiAgICAgICdydW5uaW5nJzogKChydW5JZCkgLT4gQF9jcmVhdGVMb2dFbnRyeSBcIkpvYiBSdW5uaW5nXCIsIHJ1bklkKS5iaW5kKEApXG4gICAgICAncGF1c2VkJzogKCgpIC0+IEBfY3JlYXRlTG9nRW50cnkgXCJKb2IgUGF1c2VkXCIpLmJpbmQoQClcbiAgICAgICdyZXN1bWVkJzogKCgpIC0+IEBfY3JlYXRlTG9nRW50cnkgXCJKb2IgUmVzdW1lZFwiKS5iaW5kKEApXG4gICAgICAnY2FuY2VsbGVkJzogKCgpIC0+IEBfY3JlYXRlTG9nRW50cnkgXCJKb2IgQ2FuY2VsbGVkXCIsIG51bGwsICd3YXJuaW5nJykuYmluZChAKVxuICAgICAgJ3Jlc3RhcnRlZCc6ICgoKSAtPiBAX2NyZWF0ZUxvZ0VudHJ5IFwiSm9iIFJlc3RhcnRlZFwiKS5iaW5kKEApXG4gICAgICAncmVzdWJtaXR0ZWQnOiAoKCkgLT4gQF9jcmVhdGVMb2dFbnRyeSBcIkpvYiBSZXN1Ym1pdHRlZFwiKS5iaW5kKEApXG4gICAgICAnc3VibWl0dGVkJzogKCgpIC0+IEBfY3JlYXRlTG9nRW50cnkgXCJKb2IgU3VibWl0dGVkXCIpLmJpbmQoQClcbiAgICAgICdjb21wbGV0ZWQnOiAoKHJ1bklkKSAtPiBAX2NyZWF0ZUxvZ0VudHJ5IFwiSm9iIENvbXBsZXRlZFwiLCBydW5JZCwgJ3N1Y2Nlc3MnKS5iaW5kKEApXG4gICAgICAncmVzb2x2ZWQnOiAoKGlkLCBydW5JZCkgLT4gQF9jcmVhdGVMb2dFbnRyeSBcIkRlcGVuZGVuY3kgcmVzb2x2ZWRcIiwgbnVsbCwgJ2luZm8nLCBuZXcgRGF0ZSgpLCB7ZGVwZW5kZW5jeTp7aWQ6aWQscnVuSWQ6cnVuSWR9fSkuYmluZChAKVxuICAgICAgJ2ZhaWxlZCc6ICgocnVuSWQsIGZhdGFsLCBlcnIpIC0+XG4gICAgICAgIHZhbHVlID0gZXJyLnZhbHVlXG4gICAgICAgIG1zZyA9IFwiSm9iIEZhaWxlZCB3aXRoI3tpZiBmYXRhbCB0aGVuICcgRmF0YWwnIGVsc2UgJyd9IEVycm9yI3tpZiB2YWx1ZT8gYW5kIHR5cGVvZiB2YWx1ZSBpcyAnc3RyaW5nJyB0aGVuICc6ICcgKyB2YWx1ZSBlbHNlICcnfS5cIlxuICAgICAgICBsZXZlbCA9IGlmIGZhdGFsIHRoZW4gJ2RhbmdlcicgZWxzZSAnd2FybmluZydcbiAgICAgICAgQF9jcmVhdGVMb2dFbnRyeSBtc2csIHJ1bklkLCBsZXZlbCkuYmluZChAKVxuXG4gICAgIyBDYWxsIHN1cGVyJ3MgY29uc3RydWN0b3JcbiAgICBzdXBlciBjb2xsZWN0aW9uTmFtZSwgb3B0aW9uc1xuXG4gIF92YWxpZE51bUdURVplcm86IF92YWxpZE51bUdURVplcm9cbiAgX3ZhbGlkTnVtR1RaZXJvOiBfdmFsaWROdW1HVFplcm9cbiAgX3ZhbGlkTnVtR1RFT25lOiBfdmFsaWROdW1HVEVPbmVcbiAgX3ZhbGlkSW50R1RFWmVybzogX3ZhbGlkSW50R1RFWmVyb1xuICBfdmFsaWRJbnRHVEVPbmU6IF92YWxpZEludEdURU9uZVxuICBfdmFsaWRTdGF0dXM6IF92YWxpZFN0YXR1c1xuICBfdmFsaWRMb2dMZXZlbDogX3ZhbGlkTG9nTGV2ZWxcbiAgX3ZhbGlkUmV0cnlCYWNrb2ZmOiBfdmFsaWRSZXRyeUJhY2tvZmZcbiAgX3ZhbGlkSWQ6IF92YWxpZElkXG4gIF92YWxpZExvZzogX3ZhbGlkTG9nXG4gIF92YWxpZFByb2dyZXNzOiBfdmFsaWRQcm9ncmVzc1xuICBfdmFsaWRKb2JEb2M6IF92YWxpZEpvYkRvY1xuXG4gIGpvYkxvZ0xldmVsczogSm9iLmpvYkxvZ0xldmVsc1xuICBqb2JQcmlvcml0aWVzOiBKb2Iuam9iUHJpb3JpdGllc1xuICBqb2JTdGF0dXNlczogSm9iLmpvYlN0YXR1c2VzXG4gIGpvYlN0YXR1c0NhbmNlbGxhYmxlOiBKb2Iuam9iU3RhdHVzQ2FuY2VsbGFibGVcbiAgam9iU3RhdHVzUGF1c2FibGU6IEpvYi5qb2JTdGF0dXNQYXVzYWJsZVxuICBqb2JTdGF0dXNSZW1vdmFibGU6IEpvYi5qb2JTdGF0dXNSZW1vdmFibGVcbiAgam9iU3RhdHVzUmVzdGFydGFibGU6IEpvYi5qb2JTdGF0dXNSZXN0YXJ0YWJsZVxuICBmb3JldmVyOiBKb2IuZm9yZXZlclxuICBmb3JldmVyRGF0ZTogSm9iLmZvcmV2ZXJEYXRlXG5cbiAgZGRwTWV0aG9kczogSm9iLmRkcE1ldGhvZHNcbiAgZGRwUGVybWlzc2lvbkxldmVsczogSm9iLmRkcFBlcm1pc3Npb25MZXZlbHNcbiAgZGRwTWV0aG9kUGVybWlzc2lvbnM6IEpvYi5kZHBNZXRob2RQZXJtaXNzaW9uc1xuXG4gIHByb2Nlc3NKb2JzOiAocGFyYW1zLi4uKSAtPiBuZXcgSm9iLnByb2Nlc3NKb2JzIEByb290LCBwYXJhbXMuLi5cbiAgZ2V0Sm9iOiAocGFyYW1zLi4uKSAtPiBKb2IuZ2V0Sm9iIEByb290LCBwYXJhbXMuLi5cbiAgZ2V0V29yazogKHBhcmFtcy4uLikgLT4gSm9iLmdldFdvcmsgQHJvb3QsIHBhcmFtcy4uLlxuICBnZXRKb2JzOiAocGFyYW1zLi4uKSAtPiBKb2IuZ2V0Sm9icyBAcm9vdCwgcGFyYW1zLi4uXG4gIHJlYWR5Sm9iczogKHBhcmFtcy4uLikgLT4gSm9iLnJlYWR5Sm9icyBAcm9vdCwgcGFyYW1zLi4uXG4gIGNhbmNlbEpvYnM6IChwYXJhbXMuLi4pIC0+IEpvYi5jYW5jZWxKb2JzIEByb290LCBwYXJhbXMuLi5cbiAgcGF1c2VKb2JzOiAocGFyYW1zLi4uKSAtPiBKb2IucGF1c2VKb2JzIEByb290LCBwYXJhbXMuLi5cbiAgcmVzdW1lSm9iczogKHBhcmFtcy4uLikgLT4gSm9iLnJlc3VtZUpvYnMgQHJvb3QsIHBhcmFtcy4uLlxuICByZXN0YXJ0Sm9iczogKHBhcmFtcy4uLikgLT4gSm9iLnJlc3RhcnRKb2JzIEByb290LCBwYXJhbXMuLi5cbiAgcmVtb3ZlSm9iczogKHBhcmFtcy4uLikgLT4gSm9iLnJlbW92ZUpvYnMgQHJvb3QsIHBhcmFtcy4uLlxuXG4gIHNldEREUDogKHBhcmFtcy4uLikgLT4gSm9iLnNldEREUCBwYXJhbXMuLi5cblxuICBzdGFydEpvYlNlcnZlcjogKHBhcmFtcy4uLikgLT4gSm9iLnN0YXJ0Sm9iU2VydmVyIEByb290LCBwYXJhbXMuLi5cbiAgc2h1dGRvd25Kb2JTZXJ2ZXI6IChwYXJhbXMuLi4pIC0+IEpvYi5zaHV0ZG93bkpvYlNlcnZlciBAcm9vdCwgcGFyYW1zLi4uXG5cbiAgIyBUaGVzZSBhcmUgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkXG4gIHN0YXJ0Sm9iczogKHBhcmFtcy4uLikgLT4gSm9iLnN0YXJ0Sm9icyBAcm9vdCwgcGFyYW1zLi4uXG4gIHN0b3BKb2JzOiAocGFyYW1zLi4uKSAtPiBKb2Iuc3RvcEpvYnMgQHJvb3QsIHBhcmFtcy4uLlxuXG4gIGpvYkRvY1BhdHRlcm46IF92YWxpZEpvYkRvYygpXG5cbiAgIyBXYXJuaW5nIFN0dWJzIGZvciBzZXJ2ZXItb25seSBjYWxsc1xuICBhbGxvdzogKCkgLT4gdGhyb3cgbmV3IEVycm9yIFwiU2VydmVyLW9ubHkgZnVuY3Rpb24gamMuYWxsb3coKSBpbnZva2VkIG9uIGNsaWVudC5cIlxuICBkZW55OiAoKSAtPiB0aHJvdyBuZXcgRXJyb3IgXCJTZXJ2ZXItb25seSBmdW5jdGlvbiBqYy5kZW55KCkgaW52b2tlZCBvbiBjbGllbnQuXCJcbiAgcHJvbW90ZTogKCkgLT4gdGhyb3cgbmV3IEVycm9yIFwiU2VydmVyLW9ubHkgZnVuY3Rpb24gamMucHJvbW90ZSgpIGludm9rZWQgb24gY2xpZW50LlwiXG4gIHNldExvZ1N0cmVhbTogKCkgLT4gdGhyb3cgbmV3IEVycm9yIFwiU2VydmVyLW9ubHkgZnVuY3Rpb24gamMuc2V0TG9nU3RyZWFtKCkgaW52b2tlZCBvbiBjbGllbnQuXCJcblxuICAjIFdhcm5pbmcgU3R1YnMgZm9yIGNsaWVudC1vbmx5IGNhbGxzXG4gIGxvZ0NvbnNvbGU6ICgpIC0+IHRocm93IG5ldyBFcnJvciBcIkNsaWVudC1vbmx5IGZ1bmN0aW9uIGpjLmxvZ0NvbnNvbGUoKSBpbnZva2VkIG9uIHNlcnZlci5cIlxuXG4gICMgRGVwcmVjYXRlZC4gUmVtb3ZlIGluIG5leHQgbWFqb3IgdmVyc2lvblxuICBtYWtlSm9iOiBkbyAoKSAtPlxuICAgIGRlcCA9IGZhbHNlXG4gICAgKHBhcmFtcy4uLikgLT5cbiAgICAgIHVubGVzcyBkZXBcbiAgICAgICAgZGVwID0gdHJ1ZVxuICAgICAgICBjb25zb2xlLndhcm4gXCJXQVJOSU5HOiBqYy5tYWtlSm9iKCkgaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIG5ldyBKb2IoamMsIGRvYykgaW5zdGVhZC5cIlxuICAgICAgbmV3IEpvYiBAcm9vdCwgcGFyYW1zLi4uXG5cbiAgIyBEZXByZWNhdGVkLiBSZW1vdmUgaW4gbmV4dCBtYWpvciB2ZXJzaW9uXG4gIGNyZWF0ZUpvYjogZG8gKCkgLT5cbiAgICBkZXAgPSBmYWxzZVxuICAgIChwYXJhbXMuLi4pIC0+XG4gICAgICB1bmxlc3MgZGVwXG4gICAgICAgIGRlcCA9IHRydWVcbiAgICAgICAgY29uc29sZS53YXJuIFwiV0FSTklORzogamMuY3JlYXRlSm9iKCkgaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIG5ldyBKb2IoamMsIHR5cGUsIGRhdGEpIGluc3RlYWQuXCJcbiAgICAgIG5ldyBKb2IgQHJvb3QsIHBhcmFtcy4uLlxuXG4gIF9tZXRob2RXcmFwcGVyOiAobWV0aG9kLCBmdW5jKSAtPlxuICAgIHRvTG9nID0gQF90b0xvZ1xuICAgIHVuYmxvY2tERFBNZXRob2RzID0gQF91bmJsb2NrRERQTWV0aG9kcyA/IGZhbHNlXG4gICAgIyBSZXR1cm4gdGhlIHdyYXBwZXIgZnVuY3Rpb24gdGhhdCB0aGUgTWV0ZW9yIG1ldGhvZCB3aWxsIGFjdHVhbGx5IGludm9rZVxuICAgIHJldHVybiAocGFyYW1zLi4uKSAtPlxuICAgICAgdXNlciA9IHRoaXMudXNlcklkID8gXCJbVU5BVVRIRU5USUNBVEVEXVwiXG4gICAgICB0b0xvZyB1c2VyLCBtZXRob2QsIFwicGFyYW1zOiBcIiArIEpTT04uc3RyaW5naWZ5KHBhcmFtcylcbiAgICAgIHRoaXMudW5ibG9jaygpIGlmIHVuYmxvY2tERFBNZXRob2RzXG4gICAgICByZXR2YWwgPSBmdW5jKHBhcmFtcy4uLilcbiAgICAgIHRvTG9nIHVzZXIsIG1ldGhvZCwgXCJyZXR1cm5lZDogXCIgKyBKU09OLnN0cmluZ2lmeShyZXR2YWwpXG4gICAgICByZXR1cm4gcmV0dmFsXG5cbiAgX2dlbmVyYXRlTWV0aG9kczogKCkgLT5cbiAgICBtZXRob2RzT3V0ID0ge31cbiAgICBtZXRob2RQcmVmaXggPSAnX0REUE1ldGhvZF8nXG4gICAgZm9yIG1ldGhvZE5hbWUsIG1ldGhvZEZ1bmMgb2YgQCB3aGVuIG1ldGhvZE5hbWVbMC4uLm1ldGhvZFByZWZpeC5sZW5ndGhdIGlzIG1ldGhvZFByZWZpeFxuICAgICAgYmFzZU1ldGhvZE5hbWUgPSBtZXRob2ROYW1lW21ldGhvZFByZWZpeC5sZW5ndGguLl1cbiAgICAgIG1ldGhvZHNPdXRbXCIje0Byb290fV8je2Jhc2VNZXRob2ROYW1lfVwiXSA9IEBfbWV0aG9kV3JhcHBlcihiYXNlTWV0aG9kTmFtZSwgbWV0aG9kRnVuYy5iaW5kKEApKVxuICAgIHJldHVybiBtZXRob2RzT3V0XG5cbiAgX2lkc09mRGVwczogKGlkcywgYW50ZWNlZGVudHMsIGRlcGVuZGVudHMsIGpvYlN0YXR1c2VzKSAtPlxuICAgICMgQ2FuY2VsIHRoZSBlbnRpcmUgdHJlZSBvZiBhbnRlY2VkZW50cyBhbmQvb3IgZGVwZW5kZW50c1xuICAgICMgRGVwZW5kZW50czogam9icyB0aGF0IGxpc3Qgb25lIG9mIHRoZSBpZHMgaW4gdGhlaXIgZGVwZW5kcyBsaXN0XG4gICAgIyBBbnRlY2VkZW50czogam9icyB3aXRoIGFuIGlkIGxpc3RlZCBpbiB0aGUgZGVwZW5kcyBsaXN0IG9mIG9uZSBvZiB0aGUgam9icyBpbiBpZHNcbiAgICBkZXBlbmRzUXVlcnkgPSBbXVxuICAgIGRlcGVuZHNJZHMgPSBbXVxuICAgIGlmIGRlcGVuZGVudHNcbiAgICAgIGRlcGVuZHNRdWVyeS5wdXNoXG4gICAgICAgIGRlcGVuZHM6XG4gICAgICAgICAgJGVsZW1NYXRjaDpcbiAgICAgICAgICAgICRpbjogaWRzXG4gICAgaWYgYW50ZWNlZGVudHNcbiAgICAgIGFudHNBcnJheSA9IFtdXG4gICAgICBAZmluZChcbiAgICAgICAge1xuICAgICAgICAgIF9pZDpcbiAgICAgICAgICAgICRpbjogaWRzXG4gICAgICAgIH1cbiAgICAgICAge1xuICAgICAgICAgIGZpZWxkczpcbiAgICAgICAgICAgIGRlcGVuZHM6IDFcbiAgICAgICAgICB0cmFuc2Zvcm06IG51bGxcbiAgICAgICAgfVxuICAgICAgKS5mb3JFYWNoIChkKSAtPiBhbnRzQXJyYXkucHVzaChpKSBmb3IgaSBpbiBkLmRlcGVuZHMgdW5sZXNzIGkgaW4gYW50c0FycmF5XG4gICAgICBpZiBhbnRzQXJyYXkubGVuZ3RoID4gMFxuICAgICAgICBkZXBlbmRzUXVlcnkucHVzaFxuICAgICAgICAgIF9pZDpcbiAgICAgICAgICAgICRpbjogYW50c0FycmF5XG4gICAgaWYgZGVwZW5kc1F1ZXJ5Lmxlbmd0aCA+IDBcbiAgICAgIEBmaW5kKFxuICAgICAgICB7XG4gICAgICAgICAgc3RhdHVzOlxuICAgICAgICAgICAgJGluOiBqb2JTdGF0dXNlc1xuICAgICAgICAgICRvcjogZGVwZW5kc1F1ZXJ5XG4gICAgICAgIH1cbiAgICAgICAge1xuICAgICAgICAgIGZpZWxkczpcbiAgICAgICAgICAgIF9pZDogMVxuICAgICAgICAgIHRyYW5zZm9ybTogbnVsbFxuICAgICAgICB9XG4gICAgICApLmZvckVhY2ggKGQpIC0+XG4gICAgICAgIGRlcGVuZHNJZHMucHVzaCBkLl9pZCB1bmxlc3MgZC5faWQgaW4gZGVwZW5kc0lkc1xuICAgIHJldHVybiBkZXBlbmRzSWRzXG5cbiAgX3JlcnVuX2pvYjogKGRvYywgcmVwZWF0cyA9IGRvYy5yZXBlYXRzIC0gMSwgd2FpdCA9IGRvYy5yZXBlYXRXYWl0LCByZXBlYXRVbnRpbCA9IGRvYy5yZXBlYXRVbnRpbCkgLT5cbiAgICAjIFJlcGVhdD8gaWYgc28sIG1ha2UgYSBuZXcgam9iIGZyb20gdGhlIG9sZCBvbmVcbiAgICBpZCA9IGRvYy5faWRcbiAgICBydW5JZCA9IGRvYy5ydW5JZFxuICAgIHRpbWUgPSBuZXcgRGF0ZSgpXG4gICAgZGVsZXRlIGRvYy5faWRcbiAgICBkZWxldGUgZG9jLnJlc3VsdFxuICAgIGRlbGV0ZSBkb2MuZmFpbHVyZXNcbiAgICBkZWxldGUgZG9jLmV4cGlyZXNBZnRlclxuICAgIGRlbGV0ZSBkb2Mud29ya1RpbWVvdXRcbiAgICBkb2MucnVuSWQgPSBudWxsXG4gICAgZG9jLnN0YXR1cyA9IFwid2FpdGluZ1wiXG4gICAgZG9jLnJlcGVhdFJldHJpZXMgPSBpZiBkb2MucmVwZWF0UmV0cmllcz8gdGhlbiBkb2MucmVwZWF0UmV0cmllcyBlbHNlIGRvYy5yZXRyaWVzICsgZG9jLnJldHJpZWRcbiAgICBkb2MucmV0cmllcyA9IGRvYy5yZXBlYXRSZXRyaWVzXG4gICAgZG9jLnJldHJpZXMgPSBAZm9yZXZlciBpZiBkb2MucmV0cmllcyA+IEBmb3JldmVyXG4gICAgZG9jLnJldHJ5VW50aWwgPSByZXBlYXRVbnRpbFxuICAgIGRvYy5yZXRyaWVkID0gMFxuICAgIGRvYy5yZXBlYXRzID0gcmVwZWF0c1xuICAgIGRvYy5yZXBlYXRzID0gQGZvcmV2ZXIgaWYgZG9jLnJlcGVhdHMgPiBAZm9yZXZlclxuICAgIGRvYy5yZXBlYXRVbnRpbCA9IHJlcGVhdFVudGlsXG4gICAgZG9jLnJlcGVhdGVkID0gZG9jLnJlcGVhdGVkICsgMVxuICAgIGRvYy51cGRhdGVkID0gdGltZVxuICAgIGRvYy5jcmVhdGVkID0gdGltZVxuICAgIGRvYy5wcm9ncmVzcyA9XG4gICAgICBjb21wbGV0ZWQ6IDBcbiAgICAgIHRvdGFsOiAxXG4gICAgICBwZXJjZW50OiAwXG4gICAgaWYgbG9nT2JqID0gQF9sb2dNZXNzYWdlLnJlcnVuIGlkLCBydW5JZFxuICAgICAgZG9jLmxvZyA9IFtsb2dPYmpdXG4gICAgZWxzZVxuICAgICAgZG9jLmxvZyA9IFtdXG5cbiAgICBkb2MuYWZ0ZXIgPSBuZXcgRGF0ZSh0aW1lLnZhbHVlT2YoKSArIHdhaXQpXG4gICAgaWYgam9iSWQgPSBAaW5zZXJ0IGRvY1xuICAgICAgQF9ERFBNZXRob2Rfam9iUmVhZHkgam9iSWRcbiAgICAgIHJldHVybiBqb2JJZFxuICAgIGVsc2VcbiAgICAgIGNvbnNvbGUud2FybiBcIkpvYiByZXJ1bi9yZXBlYXQgZmFpbGVkIHRvIHJlc2NoZWR1bGUhXCIsIGlkLCBydW5JZFxuICAgIHJldHVybiBudWxsXG5cbiAgX2NoZWNrRGVwczogKGpvYiwgZHJ5UnVuID0gdHJ1ZSkgLT5cbiAgICBjYW5jZWwgPSBmYWxzZVxuICAgIHJlc29sdmVkID0gW11cbiAgICBmYWlsZWQgPSBbXVxuICAgIGNhbmNlbGxlZCA9IFtdXG4gICAgcmVtb3ZlZCA9IFtdXG4gICAgbG9nID0gW11cbiAgICBpZiBqb2IuZGVwZW5kcy5sZW5ndGggPiAwXG4gICAgICBkZXBzID0gQGZpbmQoe19pZDogeyAkaW46IGpvYi5kZXBlbmRzIH19LHsgZmllbGRzOiB7IF9pZDogMSwgcnVuSWQ6IDEsIHN0YXR1czogMSB9IH0pLmZldGNoKClcblxuICAgICAgaWYgZGVwcy5sZW5ndGggaXNudCBqb2IuZGVwZW5kcy5sZW5ndGhcbiAgICAgICAgZm91bmRJZHMgPSBkZXBzLm1hcCAoZCkgLT4gZC5faWRcbiAgICAgICAgZm9yIGogaW4gam9iLmRlcGVuZHMgd2hlbiBub3QgKGogaW4gZm91bmRJZHMpXG4gICAgICAgICAgQF9ERFBNZXRob2Rfam9iTG9nIGpvYi5faWQsIG51bGwsIFwiQW50ZWNlZGVudCBqb2IgI3tqfSBtaXNzaW5nIGF0IHNhdmVcIiB1bmxlc3MgZHJ5UnVuXG4gICAgICAgICAgcmVtb3ZlZC5wdXNoIGpcbiAgICAgICAgY2FuY2VsID0gdHJ1ZVxuXG4gICAgICBmb3IgZGVwSm9iIGluIGRlcHNcbiAgICAgICAgdW5sZXNzIGRlcEpvYi5zdGF0dXMgaW4gQGpvYlN0YXR1c0NhbmNlbGxhYmxlXG4gICAgICAgICAgc3dpdGNoIGRlcEpvYi5zdGF0dXNcbiAgICAgICAgICAgIHdoZW4gXCJjb21wbGV0ZWRcIlxuICAgICAgICAgICAgICByZXNvbHZlZC5wdXNoIGRlcEpvYi5faWRcbiAgICAgICAgICAgICAgbG9nLnB1c2ggQF9sb2dNZXNzYWdlLnJlc29sdmVkIGRlcEpvYi5faWQsIGRlcEpvYi5ydW5JZFxuICAgICAgICAgICAgd2hlbiBcImZhaWxlZFwiXG4gICAgICAgICAgICAgIGNhbmNlbCA9IHRydWVcbiAgICAgICAgICAgICAgZmFpbGVkLnB1c2ggZGVwSm9iLl9pZFxuICAgICAgICAgICAgICBAX0REUE1ldGhvZF9qb2JMb2cgam9iLl9pZCwgbnVsbCwgXCJBbnRlY2VkZW50IGpvYiBmYWlsZWQgYmVmb3JlIHNhdmVcIiB1bmxlc3MgZHJ5UnVuXG4gICAgICAgICAgICB3aGVuIFwiY2FuY2VsbGVkXCJcbiAgICAgICAgICAgICAgY2FuY2VsID0gdHJ1ZVxuICAgICAgICAgICAgICBjYW5jZWxsZWQucHVzaCBkZXBKb2IuX2lkXG4gICAgICAgICAgICAgIEBfRERQTWV0aG9kX2pvYkxvZyBqb2IuX2lkLCBudWxsLCBcIkFudGVjZWRlbnQgam9iIGNhbmNlbGxlZCBiZWZvcmUgc2F2ZVwiIHVubGVzcyBkcnlSdW5cbiAgICAgICAgICAgIGVsc2UgICMgVW5rbm93biBzdGF0dXNcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvciBcIlVua25vd24gc3RhdHVzIGluIGpvYlNhdmUgRGVwZW5kZW5jeSBjaGVja1wiXG5cbiAgICAgIHVubGVzcyByZXNvbHZlZC5sZW5ndGggaXMgMCBvciBkcnlSdW5cbiAgICAgICAgbW9kcyA9XG4gICAgICAgICAgJHB1bGw6XG4gICAgICAgICAgICBkZXBlbmRzOlxuICAgICAgICAgICAgICAkaW46IHJlc29sdmVkXG4gICAgICAgICAgJHB1c2g6XG4gICAgICAgICAgICByZXNvbHZlZDpcbiAgICAgICAgICAgICAgJGVhY2g6IHJlc29sdmVkXG4gICAgICAgICAgICBsb2c6XG4gICAgICAgICAgICAgICRlYWNoOiBsb2dcblxuICAgICAgICBuID0gQHVwZGF0ZShcbiAgICAgICAgICB7XG4gICAgICAgICAgICBfaWQ6IGpvYi5faWRcbiAgICAgICAgICAgIHN0YXR1czogJ3dhaXRpbmcnXG4gICAgICAgICAgfVxuICAgICAgICAgIG1vZHNcbiAgICAgICAgKVxuXG4gICAgICAgIHVubGVzcyBuXG4gICAgICAgICAgY29uc29sZS53YXJuIFwiVXBkYXRlIGZvciBqb2IgI3tqb2IuX2lkfSBkdXJpbmcgZGVwZW5kZW5jeSBjaGVjayBmYWlsZWQuXCJcblxuICAgICAgaWYgY2FuY2VsIGFuZCBub3QgZHJ5UnVuXG4gICAgICAgIEBfRERQTWV0aG9kX2pvYkNhbmNlbCBqb2IuX2lkXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgaWYgZHJ5UnVuXG4gICAgICBpZiBjYW5jZWwgb3IgcmVzb2x2ZWQubGVuZ3RoID4gMFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGpvYklkOiBqb2IuX2lkXG4gICAgICAgICAgcmVzb2x2ZWQ6IHJlc29sdmVkXG4gICAgICAgICAgZmFpbGVkOiBmYWlsZWRcbiAgICAgICAgICBjYW5jZWxsZWQ6IGNhbmNlbGxlZFxuICAgICAgICAgIHJlbW92ZWQ6IHJlbW92ZWRcbiAgICAgICAgfVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICBlbHNlXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gIF9ERFBNZXRob2Rfc3RhcnRKb2JTZXJ2ZXI6IChvcHRpb25zKSAtPlxuICAgIGNoZWNrIG9wdGlvbnMsIE1hdGNoLk9wdGlvbmFsIHt9XG4gICAgb3B0aW9ucyA/PSB7fVxuICAgICMgVGhlIGNsaWVudCBjYW4ndCBhY3R1YWxseSBkbyB0aGlzLCBzbyBza2lwIGl0XG4gICAgdW5sZXNzIEBpc1NpbXVsYXRpb25cbiAgICAgIE1ldGVvci5jbGVhclRpbWVvdXQoQHN0b3BwZWQpIGlmIEBzdG9wcGVkIGFuZCBAc3RvcHBlZCBpc250IHRydWVcbiAgICAgIEBzdG9wcGVkID0gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIF9ERFBNZXRob2Rfc3RhcnRKb2JzOiBkbyAoKSA9PlxuICAgIGRlcEZsYWcgPSBmYWxzZVxuICAgIChvcHRpb25zKSAtPlxuICAgICAgdW5sZXNzIGRlcEZsYWdcbiAgICAgICAgZGVwRmxhZyA9IHRydWVcbiAgICAgICAgY29uc29sZS53YXJuIFwiRGVwcmVjYXRpb24gV2FybmluZzogamMuc3RhcnRKb2JzKCkgaGFzIGJlZW4gcmVuYW1lZCB0byBqYy5zdGFydEpvYlNlcnZlcigpXCJcbiAgICAgIHJldHVybiBAX0REUE1ldGhvZF9zdGFydEpvYlNlcnZlciBvcHRpb25zXG5cbiAgX0REUE1ldGhvZF9zaHV0ZG93bkpvYlNlcnZlcjogKG9wdGlvbnMpIC0+XG4gICAgY2hlY2sgb3B0aW9ucywgTWF0Y2guT3B0aW9uYWxcbiAgICAgIHRpbWVvdXQ6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLldoZXJlIF92YWxpZEludEdURU9uZSlcbiAgICBvcHRpb25zID89IHt9XG4gICAgb3B0aW9ucy50aW1lb3V0ID89IDYwKjEwMDBcblxuICAgICMgVGhlIGNsaWVudCBjYW4ndCBhY3R1YWxseSBkbyBhbnkgb2YgdGhpcywgc28gc2tpcCBpdFxuICAgIHVubGVzcyBAaXNTaW11bGF0aW9uXG4gICAgICBNZXRlb3IuY2xlYXJUaW1lb3V0KEBzdG9wcGVkKSBpZiBAc3RvcHBlZCBhbmQgQHN0b3BwZWQgaXNudCB0cnVlXG4gICAgICBAc3RvcHBlZCA9IE1ldGVvci5zZXRUaW1lb3V0KFxuICAgICAgICAoKSA9PlxuICAgICAgICAgIGN1cnNvciA9IEBmaW5kKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzdGF0dXM6ICdydW5uaW5nJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiBudWxsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKVxuICAgICAgICAgIGZhaWxlZEpvYnMgPSBjdXJzb3IuY291bnQoKVxuICAgICAgICAgIGNvbnNvbGUud2FybiBcIkZhaWxpbmcgI3tmYWlsZWRKb2JzfSBqb2JzIG9uIHF1ZXVlIHN0b3AuXCIgaWYgZmFpbGVkSm9icyBpc250IDBcbiAgICAgICAgICBjdXJzb3IuZm9yRWFjaCAoZCkgPT4gQF9ERFBNZXRob2Rfam9iRmFpbCBkLl9pZCwgZC5ydW5JZCwgXCJSdW5uaW5nIGF0IEpvYiBTZXJ2ZXIgc2h1dGRvd24uXCJcbiAgICAgICAgICBpZiBAbG9nU3RyZWFtPyAjIFNodXR0aW5nIGRvd24gY2xvc2VzIHRoZSBsb2dTdHJlYW0hXG4gICAgICAgICAgICBAbG9nU3RyZWFtLmVuZCgpXG4gICAgICAgICAgICBAbG9nU3RyZWFtID0gbnVsbFxuICAgICAgICBvcHRpb25zLnRpbWVvdXRcbiAgICAgIClcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIF9ERFBNZXRob2Rfc3RvcEpvYnM6IGRvICgpID0+XG4gICAgZGVwRmxhZyA9IGZhbHNlXG4gICAgKG9wdGlvbnMpIC0+XG4gICAgICB1bmxlc3MgZGVwRmxhZ1xuICAgICAgICBkZXBGbGFnID0gdHJ1ZVxuICAgICAgICBjb25zb2xlLndhcm4gXCJEZXByZWNhdGlvbiBXYXJuaW5nOiBqYy5zdG9wSm9icygpIGhhcyBiZWVuIHJlbmFtZWQgdG8gamMuc2h1dGRvd25Kb2JTZXJ2ZXIoKVwiXG4gICAgICByZXR1cm4gQF9ERFBNZXRob2Rfc2h1dGRvd25Kb2JTZXJ2ZXIgb3B0aW9uc1xuXG4gIF9ERFBNZXRob2RfZ2V0Sm9iOiAoaWRzLCBvcHRpb25zKSAtPlxuICAgIGNoZWNrIGlkcywgTWF0Y2guT25lT2YoTWF0Y2guV2hlcmUoX3ZhbGlkSWQpLCBbIE1hdGNoLldoZXJlKF92YWxpZElkKSBdKVxuICAgIGNoZWNrIG9wdGlvbnMsIE1hdGNoLk9wdGlvbmFsXG4gICAgICBnZXRMb2c6IE1hdGNoLk9wdGlvbmFsIEJvb2xlYW5cbiAgICAgIGdldEZhaWx1cmVzOiBNYXRjaC5PcHRpb25hbCBCb29sZWFuXG4gICAgb3B0aW9ucyA/PSB7fVxuICAgIG9wdGlvbnMuZ2V0TG9nID89IGZhbHNlXG4gICAgb3B0aW9ucy5nZXRGYWlsdXJlcyA/PSBmYWxzZVxuICAgIHNpbmdsZSA9IGZhbHNlXG4gICAgaWYgX3ZhbGlkSWQoaWRzKVxuICAgICAgaWRzID0gW2lkc11cbiAgICAgIHNpbmdsZSA9IHRydWVcbiAgICByZXR1cm4gbnVsbCBpZiBpZHMubGVuZ3RoIGlzIDBcbiAgICBmaWVsZHMgPSB7X3ByaXZhdGU6MH1cbiAgICBmaWVsZHMubG9nID0gMCBpZiAhb3B0aW9ucy5nZXRMb2dcbiAgICBmaWVsZHMuZmFpbHVyZXMgPSAwIGlmICFvcHRpb25zLmdldEZhaWx1cmVzXG4gICAgZG9jcyA9IEBmaW5kKFxuICAgICAge1xuICAgICAgICBfaWQ6XG4gICAgICAgICAgJGluOiBpZHNcbiAgICAgIH1cbiAgICAgIHtcbiAgICAgICAgZmllbGRzOiBmaWVsZHNcbiAgICAgICAgdHJhbnNmb3JtOiBudWxsXG4gICAgICB9XG4gICAgKS5mZXRjaCgpXG4gICAgaWYgZG9jcz8ubGVuZ3RoXG4gICAgICBpZiBAc2NydWI/XG4gICAgICAgIGRvY3MgPSAoQHNjcnViIGQgZm9yIGQgaW4gZG9jcylcbiAgICAgIGNoZWNrIGRvY3MsIFtfdmFsaWRKb2JEb2MoKV1cbiAgICAgIGlmIHNpbmdsZVxuICAgICAgICByZXR1cm4gZG9jc1swXVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gZG9jc1xuICAgIHJldHVybiBudWxsXG5cbiAgX0REUE1ldGhvZF9nZXRXb3JrOiAodHlwZSwgb3B0aW9ucykgLT5cbiAgICBjaGVjayB0eXBlLCBNYXRjaC5PbmVPZiBTdHJpbmcsIFsgU3RyaW5nIF1cbiAgICBjaGVjayBvcHRpb25zLCBNYXRjaC5PcHRpb25hbFxuICAgICAgbWF4Sm9iczogTWF0Y2guT3B0aW9uYWwoTWF0Y2guV2hlcmUgX3ZhbGlkSW50R1RFT25lKVxuICAgICAgd29ya1RpbWVvdXQ6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLldoZXJlIF92YWxpZEludEdURU9uZSlcblxuICAgICMgRG9uJ3Qgc2ltdWxhdGUgZ2V0V29yayFcbiAgICBpZiBAaXNTaW11bGF0aW9uXG4gICAgICByZXR1cm5cblxuICAgIG9wdGlvbnMgPz0ge31cbiAgICBvcHRpb25zLm1heEpvYnMgPz0gMVxuICAgICMgRG9uJ3QgcHV0IG91dCBhbnkgbW9yZSBqb2JzIHdoaWxlIHNodXR0aW5nIGRvd25cbiAgICBpZiBAc3RvcHBlZFxuICAgICAgcmV0dXJuIFtdXG5cbiAgICAjIFN1cHBvcnQgc3RyaW5nIHR5cGVzIG9yIGFycmF5cyBvZiBzdHJpbmcgdHlwZXNcbiAgICBpZiB0eXBlb2YgdHlwZSBpcyAnc3RyaW5nJ1xuICAgICAgdHlwZSA9IFsgdHlwZSBdXG4gICAgdGltZSA9IG5ldyBEYXRlKClcbiAgICBkb2NzID0gW11cbiAgICBydW5JZCA9IEBfbWFrZU5ld0lEKCkgIyBUaGlzIGlzIG1ldGVvciBpbnRlcm5hbCwgYnV0IGl0IHdpbGwgZmFpbCBoYXJkIGlmIGl0IGdvZXMgYXdheS5cblxuICAgIHdoaWxlIGRvY3MubGVuZ3RoIDwgb3B0aW9ucy5tYXhKb2JzXG5cbiAgICAgIGlkcyA9IEBmaW5kKFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTpcbiAgICAgICAgICAgICRpbjogdHlwZVxuICAgICAgICAgIHN0YXR1czogJ3JlYWR5J1xuICAgICAgICAgIHJ1bklkOiBudWxsXG4gICAgICAgIH1cbiAgICAgICAge1xuICAgICAgICAgIHNvcnQ6XG4gICAgICAgICAgICBwcmlvcml0eTogMVxuICAgICAgICAgICAgcmV0cnlVbnRpbDogMVxuICAgICAgICAgICAgYWZ0ZXI6IDFcbiAgICAgICAgICBsaW1pdDogb3B0aW9ucy5tYXhKb2JzIC0gZG9jcy5sZW5ndGggIyBuZXZlciBhc2sgZm9yIG1vcmUgdGhhbiBpcyBuZWVkZWRcbiAgICAgICAgICBmaWVsZHM6XG4gICAgICAgICAgICBfaWQ6IDFcbiAgICAgICAgICB0cmFuc2Zvcm06IG51bGxcbiAgICAgICAgfSkubWFwIChkKSAtPiBkLl9pZFxuXG4gICAgICB1bmxlc3MgaWRzPy5sZW5ndGggPiAwXG4gICAgICAgIGJyZWFrICAjIERvbid0IGtlZXAgbG9vcGluZyB3aGVuIHRoZXJlJ3Mgbm8gYXZhaWxhYmxlIHdvcmtcblxuICAgICAgbW9kcyA9XG4gICAgICAgICRzZXQ6XG4gICAgICAgICAgc3RhdHVzOiAncnVubmluZydcbiAgICAgICAgICBydW5JZDogcnVuSWRcbiAgICAgICAgICB1cGRhdGVkOiB0aW1lXG4gICAgICAgICRpbmM6XG4gICAgICAgICAgcmV0cmllczogLTFcbiAgICAgICAgICByZXRyaWVkOiAxXG5cbiAgICAgIGlmIGxvZ09iaiA9IEBfbG9nTWVzc2FnZS5ydW5uaW5nIHJ1bklkXG4gICAgICAgIG1vZHMuJHB1c2ggPVxuICAgICAgICAgIGxvZzogbG9nT2JqXG5cbiAgICAgIGlmIG9wdGlvbnMud29ya1RpbWVvdXQ/XG4gICAgICAgIG1vZHMuJHNldC53b3JrVGltZW91dCA9IG9wdGlvbnMud29ya1RpbWVvdXRcbiAgICAgICAgbW9kcy4kc2V0LmV4cGlyZXNBZnRlciA9IG5ldyBEYXRlKHRpbWUudmFsdWVPZigpICsgb3B0aW9ucy53b3JrVGltZW91dClcbiAgICAgIGVsc2VcbiAgICAgICAgbW9kcy4kdW5zZXQgPz0ge31cbiAgICAgICAgbW9kcy4kdW5zZXQud29ya1RpbWVvdXQgPSBcIlwiXG4gICAgICAgIG1vZHMuJHVuc2V0LmV4cGlyZXNBZnRlciA9IFwiXCJcblxuICAgICAgbnVtID0gQHVwZGF0ZShcbiAgICAgICAge1xuICAgICAgICAgIF9pZDpcbiAgICAgICAgICAgICRpbjogaWRzXG4gICAgICAgICAgc3RhdHVzOiAncmVhZHknXG4gICAgICAgICAgcnVuSWQ6IG51bGxcbiAgICAgICAgfVxuICAgICAgICBtb2RzXG4gICAgICAgIHtcbiAgICAgICAgICBtdWx0aTogdHJ1ZVxuICAgICAgICB9XG4gICAgICApXG5cbiAgICAgIGlmIG51bSA+IDBcbiAgICAgICAgZm91bmREb2NzID0gQGZpbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgX2lkOlxuICAgICAgICAgICAgICAkaW46IGlkc1xuICAgICAgICAgICAgcnVuSWQ6IHJ1bklkXG4gICAgICAgICAgfVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkczpcbiAgICAgICAgICAgICAgbG9nOiAwXG4gICAgICAgICAgICAgIGZhaWx1cmVzOiAwXG4gICAgICAgICAgICAgIF9wcml2YXRlOiAwXG4gICAgICAgICAgICB0cmFuc2Zvcm06IG51bGxcbiAgICAgICAgICB9XG4gICAgICAgICkuZmV0Y2goKVxuXG4gICAgICAgIGlmIGZvdW5kRG9jcz8ubGVuZ3RoID4gMFxuICAgICAgICAgIGlmIEBzY3J1Yj9cbiAgICAgICAgICAgIGZvdW5kRG9jcyA9IChAc2NydWIgZCBmb3IgZCBpbiBmb3VuZERvY3MpXG4gICAgICAgICAgY2hlY2sgZG9jcywgWyBfdmFsaWRKb2JEb2MoKSBdXG4gICAgICAgICAgZG9jcyA9IGRvY3MuY29uY2F0IGZvdW5kRG9jc1xuICAgICAgICAjIGVsc2VcbiAgICAgICAgIyAgIGNvbnNvbGUud2FybiBcImdldFdvcms6IGZpbmQgYWZ0ZXIgdXBkYXRlIGZhaWxlZFwiXG4gICAgcmV0dXJuIGRvY3NcblxuICBfRERQTWV0aG9kX2pvYlJlbW92ZTogKGlkcywgb3B0aW9ucykgLT5cbiAgICBjaGVjayBpZHMsIE1hdGNoLk9uZU9mKE1hdGNoLldoZXJlKF92YWxpZElkKSwgWyBNYXRjaC5XaGVyZShfdmFsaWRJZCkgXSlcbiAgICBjaGVjayBvcHRpb25zLCBNYXRjaC5PcHRpb25hbCB7fVxuICAgIG9wdGlvbnMgPz0ge31cbiAgICBpZiBfdmFsaWRJZChpZHMpXG4gICAgICBpZHMgPSBbaWRzXVxuICAgIHJldHVybiBmYWxzZSBpZiBpZHMubGVuZ3RoIGlzIDBcbiAgICBudW0gPSBAcmVtb3ZlKFxuICAgICAge1xuICAgICAgICBfaWQ6XG4gICAgICAgICAgJGluOiBpZHNcbiAgICAgICAgc3RhdHVzOlxuICAgICAgICAgICRpbjogQGpvYlN0YXR1c1JlbW92YWJsZVxuICAgICAgfVxuICAgIClcbiAgICBpZiBudW0gPiAwXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGNvbnNvbGUud2FybiBcImpvYlJlbW92ZSBmYWlsZWRcIlxuICAgIHJldHVybiBmYWxzZVxuXG4gIF9ERFBNZXRob2Rfam9iUGF1c2U6IChpZHMsIG9wdGlvbnMpIC0+XG4gICAgY2hlY2sgaWRzLCBNYXRjaC5PbmVPZihNYXRjaC5XaGVyZShfdmFsaWRJZCksIFsgTWF0Y2guV2hlcmUoX3ZhbGlkSWQpIF0pXG4gICAgY2hlY2sgb3B0aW9ucywgTWF0Y2guT3B0aW9uYWwge31cbiAgICBvcHRpb25zID89IHt9XG4gICAgaWYgX3ZhbGlkSWQoaWRzKVxuICAgICAgaWRzID0gW2lkc11cbiAgICByZXR1cm4gZmFsc2UgaWYgaWRzLmxlbmd0aCBpcyAwXG4gICAgdGltZSA9IG5ldyBEYXRlKClcblxuICAgIG1vZHMgPVxuICAgICAgJHNldDpcbiAgICAgICAgc3RhdHVzOiBcInBhdXNlZFwiXG4gICAgICAgIHVwZGF0ZWQ6IHRpbWVcblxuICAgIGlmIGxvZ09iaiA9IEBfbG9nTWVzc2FnZS5wYXVzZWQoKVxuICAgICAgbW9kcy4kcHVzaCA9XG4gICAgICAgIGxvZzogbG9nT2JqXG5cbiAgICBudW0gPSBAdXBkYXRlKFxuICAgICAge1xuICAgICAgICBfaWQ6XG4gICAgICAgICAgJGluOiBpZHNcbiAgICAgICAgc3RhdHVzOlxuICAgICAgICAgICRpbjogQGpvYlN0YXR1c1BhdXNhYmxlXG4gICAgICB9XG4gICAgICBtb2RzXG4gICAgICB7XG4gICAgICAgIG11bHRpOiB0cnVlXG4gICAgICB9XG4gICAgKVxuICAgIGlmIG51bSA+IDBcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZVxuICAgICAgY29uc29sZS53YXJuIFwiam9iUGF1c2UgZmFpbGVkXCJcbiAgICByZXR1cm4gZmFsc2VcblxuICBfRERQTWV0aG9kX2pvYlJlc3VtZTogKGlkcywgb3B0aW9ucykgLT5cbiAgICBjaGVjayBpZHMsIE1hdGNoLk9uZU9mKE1hdGNoLldoZXJlKF92YWxpZElkKSwgWyBNYXRjaC5XaGVyZShfdmFsaWRJZCkgXSlcbiAgICBjaGVjayBvcHRpb25zLCBNYXRjaC5PcHRpb25hbCB7fVxuICAgIG9wdGlvbnMgPz0ge31cbiAgICBpZiBfdmFsaWRJZChpZHMpXG4gICAgICBpZHMgPSBbaWRzXVxuICAgIHJldHVybiBmYWxzZSBpZiBpZHMubGVuZ3RoIGlzIDBcbiAgICB0aW1lID0gbmV3IERhdGUoKVxuICAgIG1vZHMgPVxuICAgICAgJHNldDpcbiAgICAgICAgc3RhdHVzOiBcIndhaXRpbmdcIlxuICAgICAgICB1cGRhdGVkOiB0aW1lXG5cbiAgICBpZiBsb2dPYmogPSBAX2xvZ01lc3NhZ2UucmVzdW1lZCgpXG4gICAgICBtb2RzLiRwdXNoID1cbiAgICAgICAgbG9nOiBsb2dPYmpcblxuICAgIG51bSA9IEB1cGRhdGUoXG4gICAgICB7XG4gICAgICAgIF9pZDpcbiAgICAgICAgICAkaW46IGlkc1xuICAgICAgICBzdGF0dXM6IFwicGF1c2VkXCJcbiAgICAgICAgdXBkYXRlZDpcbiAgICAgICAgICAkbmU6IHRpbWVcbiAgICAgIH1cbiAgICAgIG1vZHNcbiAgICAgIHtcbiAgICAgICAgbXVsdGk6IHRydWVcbiAgICAgIH1cbiAgICApXG4gICAgaWYgbnVtID4gMFxuICAgICAgQF9ERFBNZXRob2Rfam9iUmVhZHkgaWRzXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGNvbnNvbGUud2FybiBcImpvYlJlc3VtZSBmYWlsZWRcIlxuICAgIHJldHVybiBmYWxzZVxuXG4gIF9ERFBNZXRob2Rfam9iUmVhZHk6IChpZHMsIG9wdGlvbnMpIC0+XG4gICAgY2hlY2sgaWRzLCBNYXRjaC5PbmVPZihNYXRjaC5XaGVyZShfdmFsaWRJZCksIFsgTWF0Y2guV2hlcmUoX3ZhbGlkSWQpIF0pXG4gICAgY2hlY2sgb3B0aW9ucywgTWF0Y2guT3B0aW9uYWxcbiAgICAgIGZvcmNlOiBNYXRjaC5PcHRpb25hbCBCb29sZWFuXG4gICAgICB0aW1lOiBNYXRjaC5PcHRpb25hbCBEYXRlXG5cbiAgICAjIERvbid0IHNpbXVsYXRlIGpvYlJlYWR5LiBJdCBoYXMgYSBzdHJvbmcgY2hhbmNlIG9mIGNhdXNpbmcgaXNzdWVzIHdpdGhcbiAgICAjIE1ldGVvciBvbiB0aGUgY2xpZW50LCBwYXJ0aWN1bGFybHkgaWYgYW4gb2JzZXJ2ZUNoYW5nZXMoKSBpcyB0cmlnZ2VyaW5nXG4gICAgIyBhIHByb2Nlc3NKb2JzIHF1ZXVlICh3aGljaCBpbiB0dXJuIHNldHMgdGltZXJzLilcbiAgICBpZiBAaXNTaW11bGF0aW9uXG4gICAgICByZXR1cm5cblxuICAgIG5vdyA9IG5ldyBEYXRlKClcblxuICAgIG9wdGlvbnMgPz0ge31cbiAgICBvcHRpb25zLmZvcmNlID89IGZhbHNlXG4gICAgb3B0aW9ucy50aW1lID89IG5vd1xuXG4gICAgaWYgX3ZhbGlkSWQoaWRzKVxuICAgICAgaWRzID0gW2lkc11cblxuICAgIHF1ZXJ5ID1cbiAgICAgIHN0YXR1czogXCJ3YWl0aW5nXCJcbiAgICAgIGFmdGVyOlxuICAgICAgICAkbHRlOiBvcHRpb25zLnRpbWVcblxuICAgIG1vZHMgPVxuICAgICAgJHNldDpcbiAgICAgICAgc3RhdHVzOiBcInJlYWR5XCJcbiAgICAgICAgdXBkYXRlZDogbm93XG5cbiAgICBpZiBpZHMubGVuZ3RoID4gMFxuICAgICAgcXVlcnkuX2lkID1cbiAgICAgICAgJGluOiBpZHNcbiAgICAgIG1vZHMuJHNldC5hZnRlciA9IG5vd1xuXG4gICAgbG9nT2JqID0gW11cblxuICAgIGlmIG9wdGlvbnMuZm9yY2VcbiAgICAgIG1vZHMuJHNldC5kZXBlbmRzID0gW10gICMgRG9uJ3QgbW92ZSB0byByZXNvbHZlZCwgYmVjYXVzZSB0aGV5IHdlcmVuJ3QhXG4gICAgICBsID0gQF9sb2dNZXNzYWdlLmZvcmNlZCgpXG4gICAgICBsb2dPYmoucHVzaCBsIGlmIGxcbiAgICBlbHNlXG4gICAgICBxdWVyeS5kZXBlbmRzID1cbiAgICAgICAgJHNpemU6IDBcblxuICAgIGwgPSBAX2xvZ01lc3NhZ2UucmVhZGllZCgpXG4gICAgbG9nT2JqLnB1c2ggbCBpZiBsXG5cbiAgICBpZiBsb2dPYmoubGVuZ3RoID4gMFxuICAgICAgbW9kcy4kcHVzaCA9XG4gICAgICAgIGxvZzpcbiAgICAgICAgICAkZWFjaDogbG9nT2JqXG5cbiAgICBudW0gPSBAdXBkYXRlKFxuICAgICAgcXVlcnlcbiAgICAgIG1vZHNcbiAgICAgIHtcbiAgICAgICAgbXVsdGk6IHRydWVcbiAgICAgIH1cbiAgICApXG5cbiAgICBpZiBudW0gPiAwXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gIF9ERFBNZXRob2Rfam9iQ2FuY2VsOiAoaWRzLCBvcHRpb25zKSAtPlxuICAgIGNoZWNrIGlkcywgTWF0Y2guT25lT2YoTWF0Y2guV2hlcmUoX3ZhbGlkSWQpLCBbIE1hdGNoLldoZXJlKF92YWxpZElkKSBdKVxuICAgIGNoZWNrIG9wdGlvbnMsIE1hdGNoLk9wdGlvbmFsXG4gICAgICBhbnRlY2VkZW50czogTWF0Y2guT3B0aW9uYWwgQm9vbGVhblxuICAgICAgZGVwZW5kZW50czogTWF0Y2guT3B0aW9uYWwgQm9vbGVhblxuICAgIG9wdGlvbnMgPz0ge31cbiAgICBvcHRpb25zLmFudGVjZWRlbnRzID89IGZhbHNlXG4gICAgb3B0aW9ucy5kZXBlbmRlbnRzID89IHRydWVcbiAgICBpZiBfdmFsaWRJZChpZHMpXG4gICAgICBpZHMgPSBbaWRzXVxuICAgIHJldHVybiBmYWxzZSBpZiBpZHMubGVuZ3RoIGlzIDBcbiAgICB0aW1lID0gbmV3IERhdGUoKVxuXG4gICAgbW9kcyA9XG4gICAgICAkc2V0OlxuICAgICAgICBzdGF0dXM6IFwiY2FuY2VsbGVkXCJcbiAgICAgICAgcnVuSWQ6IG51bGxcbiAgICAgICAgcHJvZ3Jlc3M6XG4gICAgICAgICAgY29tcGxldGVkOiAwXG4gICAgICAgICAgdG90YWw6IDFcbiAgICAgICAgICBwZXJjZW50OiAwXG4gICAgICAgIHVwZGF0ZWQ6IHRpbWVcblxuICAgIGlmIGxvZ09iaiA9IEBfbG9nTWVzc2FnZS5jYW5jZWxsZWQoKVxuICAgICAgbW9kcy4kcHVzaCA9XG4gICAgICAgIGxvZzogbG9nT2JqXG5cbiAgICBudW0gPSBAdXBkYXRlKFxuICAgICAge1xuICAgICAgICBfaWQ6XG4gICAgICAgICAgJGluOiBpZHNcbiAgICAgICAgc3RhdHVzOlxuICAgICAgICAgICRpbjogQGpvYlN0YXR1c0NhbmNlbGxhYmxlXG4gICAgICB9XG4gICAgICBtb2RzXG4gICAgICB7XG4gICAgICAgIG11bHRpOiB0cnVlXG4gICAgICB9XG4gICAgKVxuICAgICMgQ2FuY2VsIHRoZSBlbnRpcmUgdHJlZSBvZiBkZXBlbmRlbnRzXG4gICAgY2FuY2VsSWRzID0gQF9pZHNPZkRlcHMgaWRzLCBvcHRpb25zLmFudGVjZWRlbnRzLCBvcHRpb25zLmRlcGVuZGVudHMsIEBqb2JTdGF0dXNDYW5jZWxsYWJsZVxuXG4gICAgZGVwc0NhbmNlbGxlZCA9IGZhbHNlXG4gICAgaWYgY2FuY2VsSWRzLmxlbmd0aCA+IDBcbiAgICAgIGRlcHNDYW5jZWxsZWQgPSBAX0REUE1ldGhvZF9qb2JDYW5jZWwgY2FuY2VsSWRzLCBvcHRpb25zXG5cbiAgICBpZiBudW0gPiAwIG9yIGRlcHNDYW5jZWxsZWRcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZVxuICAgICAgY29uc29sZS53YXJuIFwiam9iQ2FuY2VsIGZhaWxlZFwiXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgX0REUE1ldGhvZF9qb2JSZXN0YXJ0OiAoaWRzLCBvcHRpb25zKSAtPlxuICAgIGNoZWNrIGlkcywgTWF0Y2guT25lT2YoTWF0Y2guV2hlcmUoX3ZhbGlkSWQpLCBbIE1hdGNoLldoZXJlKF92YWxpZElkKSBdKVxuICAgIGNoZWNrIG9wdGlvbnMsIE1hdGNoLk9wdGlvbmFsXG4gICAgICByZXRyaWVzOiBNYXRjaC5PcHRpb25hbChNYXRjaC5XaGVyZSBfdmFsaWRJbnRHVEVaZXJvKVxuICAgICAgdW50aWw6IE1hdGNoLk9wdGlvbmFsIERhdGVcbiAgICAgIGFudGVjZWRlbnRzOiBNYXRjaC5PcHRpb25hbCBCb29sZWFuXG4gICAgICBkZXBlbmRlbnRzOiBNYXRjaC5PcHRpb25hbCBCb29sZWFuXG4gICAgb3B0aW9ucyA/PSB7fVxuICAgIG9wdGlvbnMucmV0cmllcyA/PSAxXG4gICAgb3B0aW9ucy5yZXRyaWVzID0gQGZvcmV2ZXIgaWYgb3B0aW9ucy5yZXRyaWVzID4gQGZvcmV2ZXJcbiAgICBvcHRpb25zLmRlcGVuZGVudHMgPz0gZmFsc2VcbiAgICBvcHRpb25zLmFudGVjZWRlbnRzID89IHRydWVcbiAgICBpZiBfdmFsaWRJZChpZHMpXG4gICAgICBpZHMgPSBbaWRzXVxuICAgIHJldHVybiBmYWxzZSBpZiBpZHMubGVuZ3RoIGlzIDBcbiAgICB0aW1lID0gbmV3IERhdGUoKVxuXG4gICAgcXVlcnkgPVxuICAgICAgX2lkOlxuICAgICAgICAkaW46IGlkc1xuICAgICAgc3RhdHVzOlxuICAgICAgICAkaW46IEBqb2JTdGF0dXNSZXN0YXJ0YWJsZVxuXG4gICAgbW9kcyA9XG4gICAgICAkc2V0OlxuICAgICAgICBzdGF0dXM6IFwid2FpdGluZ1wiXG4gICAgICAgIHByb2dyZXNzOlxuICAgICAgICAgIGNvbXBsZXRlZDogMFxuICAgICAgICAgIHRvdGFsOiAxXG4gICAgICAgICAgcGVyY2VudDogMFxuICAgICAgICB1cGRhdGVkOiB0aW1lXG4gICAgICAkaW5jOlxuICAgICAgICByZXRyaWVzOiBvcHRpb25zLnJldHJpZXNcblxuICAgIGlmIGxvZ09iaiA9IEBfbG9nTWVzc2FnZS5yZXN0YXJ0ZWQoKVxuICAgICAgbW9kcy4kcHVzaCA9XG4gICAgICAgIGxvZzogbG9nT2JqXG5cbiAgICBpZiBvcHRpb25zLnVudGlsP1xuICAgICAgbW9kcy4kc2V0LnJldHJ5VW50aWwgPSBvcHRpb25zLnVudGlsXG5cbiAgICBudW0gPSBAdXBkYXRlIHF1ZXJ5LCBtb2RzLCB7bXVsdGk6IHRydWV9XG5cbiAgICAjIFJlc3RhcnQgdGhlIGVudGlyZSB0cmVlIG9mIGRlcGVuZGVudHNcbiAgICByZXN0YXJ0SWRzID0gQF9pZHNPZkRlcHMgaWRzLCBvcHRpb25zLmFudGVjZWRlbnRzLCBvcHRpb25zLmRlcGVuZGVudHMsIEBqb2JTdGF0dXNSZXN0YXJ0YWJsZVxuXG4gICAgZGVwc1Jlc3RhcnRlZCA9IGZhbHNlXG4gICAgaWYgcmVzdGFydElkcy5sZW5ndGggPiAwXG4gICAgICBkZXBzUmVzdGFydGVkID0gQF9ERFBNZXRob2Rfam9iUmVzdGFydCByZXN0YXJ0SWRzLCBvcHRpb25zXG5cbiAgICBpZiBudW0gPiAwIG9yIGRlcHNSZXN0YXJ0ZWRcbiAgICAgIEBfRERQTWV0aG9kX2pvYlJlYWR5IGlkc1xuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLndhcm4gXCJqb2JSZXN0YXJ0IGZhaWxlZFwiXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgIyBKb2IgY3JlYXRvciBtZXRob2RzXG5cbiAgX0REUE1ldGhvZF9qb2JTYXZlOiAoZG9jLCBvcHRpb25zKSAtPlxuICAgIGNoZWNrIGRvYywgX3ZhbGlkSm9iRG9jKClcbiAgICBjaGVjayBvcHRpb25zLCBNYXRjaC5PcHRpb25hbFxuICAgICAgY2FuY2VsUmVwZWF0czogTWF0Y2guT3B0aW9uYWwgQm9vbGVhblxuICAgIGNoZWNrIGRvYy5zdGF0dXMsIE1hdGNoLldoZXJlICh2KSAtPlxuICAgICAgTWF0Y2gudGVzdCh2LCBTdHJpbmcpIGFuZCB2IGluIFsgJ3dhaXRpbmcnLCAncGF1c2VkJyBdXG4gICAgb3B0aW9ucyA/PSB7fVxuICAgIG9wdGlvbnMuY2FuY2VsUmVwZWF0cyA/PSBmYWxzZVxuICAgIGRvYy5yZXBlYXRzID0gQGZvcmV2ZXIgaWYgZG9jLnJlcGVhdHMgPiBAZm9yZXZlclxuICAgIGRvYy5yZXRyaWVzID0gQGZvcmV2ZXIgaWYgZG9jLnJldHJpZXMgPiBAZm9yZXZlclxuXG4gICAgdGltZSA9IG5ldyBEYXRlKClcblxuICAgICMgVGhpcyBlbmFibGVzIHRoZSBkZWZhdWx0IGNhc2Ugb2YgXCJydW4gaW1tZWRpYXRlbHlcIiB0b1xuICAgICMgbm90IGJlIGltcGFjdGVkIGJ5IGEgY2xpZW50J3MgY2xvY2tcbiAgICBkb2MuYWZ0ZXIgPSB0aW1lIGlmIGRvYy5hZnRlciA8IHRpbWVcbiAgICBkb2MucmV0cnlVbnRpbCA9IHRpbWUgaWYgZG9jLnJldHJ5VW50aWwgPCB0aW1lXG4gICAgZG9jLnJlcGVhdFVudGlsID0gdGltZSBpZiBkb2MucmVwZWF0VW50aWwgPCB0aW1lXG5cbiAgICAjIElmIGRvYy5yZXBlYXRXYWl0IGlzIGEgbGF0ZXIuanMgb2JqZWN0LCB0aGVuIGRvbid0IHJ1biBiZWZvcmVcbiAgICAjIHRoZSBmaXJzdCB2YWxpZCBzY2hlZHVsZWQgdGltZSB0aGF0IG9jY3VycyBhZnRlciBkb2MuYWZ0ZXJcbiAgICBpZiBAbGF0ZXI/IGFuZCB0eXBlb2YgZG9jLnJlcGVhdFdhaXQgaXNudCAnbnVtYmVyJ1xuICAgICAgIyBVc2luZyBhIHdvcmthcm91bmQgdG8gZmluZCBuZXh0IHRpbWUgYWZ0ZXIgZG9jLmFmdGVyLlxuICAgICAgIyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS92c2l2c2kvbWV0ZW9yLWpvYi1jb2xsZWN0aW9uL2lzc3Vlcy8yMTdcbiAgICAgIHNjaGVkdWxlID0gQGxhdGVyPy5zY2hlZHVsZShkb2MucmVwZWF0V2FpdClcbiAgICAgIHVubGVzcyBzY2hlZHVsZSBhbmQgbmV4dCA9IHNjaGVkdWxlLm5leHQoMiwgc2NoZWR1bGUucHJldigxLCBkb2MuYWZ0ZXIpKVsxXVxuICAgICAgICBjb25zb2xlLndhcm4gXCJObyB2YWxpZCBhdmFpbGFibGUgbGF0ZXIuanMgdGltZXMgaW4gc2NoZWR1bGUgYWZ0ZXIgI3tkb2MuYWZ0ZXJ9XCJcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIG5leHREYXRlID0gbmV3IERhdGUobmV4dClcbiAgICAgIHVubGVzcyBuZXh0RGF0ZSA8PSBkb2MucmVwZWF0VW50aWxcbiAgICAgICAgY29uc29sZS53YXJuIFwiTm8gdmFsaWQgYXZhaWxhYmxlIGxhdGVyLmpzIHRpbWVzIGluIHNjaGVkdWxlIGJlZm9yZSAje2RvYy5yZXBlYXRVbnRpbH1cIlxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgZG9jLmFmdGVyID0gbmV4dERhdGVcbiAgICBlbHNlIGlmIG5vdCBAbGF0ZXI/IGFuZCBkb2MucmVwZWF0V2FpdCBpc250ICdudW1iZXInXG4gICAgICBjb25zb2xlLndhcm4gXCJMYXRlci5qcyBub3QgbG9hZGVkLi4uXCJcbiAgICAgIHJldHVybiBudWxsXG5cbiAgICBpZiBkb2MuX2lkXG5cbiAgICAgIG1vZHMgPVxuICAgICAgICAkc2V0OlxuICAgICAgICAgIHN0YXR1czogJ3dhaXRpbmcnXG4gICAgICAgICAgZGF0YTogZG9jLmRhdGFcbiAgICAgICAgICByZXRyaWVzOiBkb2MucmV0cmllc1xuICAgICAgICAgIHJlcGVhdFJldHJpZXM6IGlmIGRvYy5yZXBlYXRSZXRyaWVzPyB0aGVuIGRvYy5yZXBlYXRSZXRyaWVzIGVsc2UgZG9jLnJldHJpZXMgKyBkb2MucmV0cmllZFxuICAgICAgICAgIHJldHJ5VW50aWw6IGRvYy5yZXRyeVVudGlsXG4gICAgICAgICAgcmV0cnlXYWl0OiBkb2MucmV0cnlXYWl0XG4gICAgICAgICAgcmV0cnlCYWNrb2ZmOiBkb2MucmV0cnlCYWNrb2ZmXG4gICAgICAgICAgcmVwZWF0czogZG9jLnJlcGVhdHNcbiAgICAgICAgICByZXBlYXRVbnRpbDogZG9jLnJlcGVhdFVudGlsXG4gICAgICAgICAgcmVwZWF0V2FpdDogZG9jLnJlcGVhdFdhaXRcbiAgICAgICAgICBkZXBlbmRzOiBkb2MuZGVwZW5kc1xuICAgICAgICAgIHByaW9yaXR5OiBkb2MucHJpb3JpdHlcbiAgICAgICAgICBhZnRlcjogZG9jLmFmdGVyXG4gICAgICAgICAgdXBkYXRlZDogdGltZVxuXG4gICAgICBpZiBsb2dPYmogPSBAX2xvZ01lc3NhZ2UucmVzdWJtaXR0ZWQoKVxuICAgICAgICBtb2RzLiRwdXNoID1cbiAgICAgICAgICBsb2c6IGxvZ09ialxuXG4gICAgICBudW0gPSBAdXBkYXRlKFxuICAgICAgICB7XG4gICAgICAgICAgX2lkOiBkb2MuX2lkXG4gICAgICAgICAgc3RhdHVzOiAncGF1c2VkJ1xuICAgICAgICAgIHJ1bklkOiBudWxsXG4gICAgICAgIH1cbiAgICAgICAgbW9kc1xuICAgICAgKVxuXG4gICAgICBpZiBudW0gYW5kIEBfY2hlY2tEZXBzIGRvYywgZmFsc2VcbiAgICAgICAgQF9ERFBNZXRob2Rfam9iUmVhZHkgZG9jLl9pZFxuICAgICAgICByZXR1cm4gZG9jLl9pZFxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIGVsc2VcbiAgICAgIGlmIGRvYy5yZXBlYXRzIGlzIEBmb3JldmVyIGFuZCBvcHRpb25zLmNhbmNlbFJlcGVhdHNcbiAgICAgICAgIyBJZiB0aGlzIGlzIHVubGltaXRlZCByZXBlYXRpbmcgam9iLCB0aGVuIGNhbmNlbCBhbnkgZXhpc3Rpbmcgam9icyBvZiB0aGUgc2FtZSB0eXBlXG4gICAgICAgIEBmaW5kKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IGRvYy50eXBlXG4gICAgICAgICAgICBzdGF0dXM6XG4gICAgICAgICAgICAgICRpbjogQGpvYlN0YXR1c0NhbmNlbGxhYmxlXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IG51bGxcbiAgICAgICAgICB9XG4gICAgICAgICkuZm9yRWFjaCAoZCkgPT4gQF9ERFBNZXRob2Rfam9iQ2FuY2VsIGQuX2lkLCB7fVxuICAgICAgZG9jLmNyZWF0ZWQgPSB0aW1lXG4gICAgICBkb2MubG9nLnB1c2ggQF9sb2dNZXNzYWdlLnN1Ym1pdHRlZCgpXG4gICAgICBkb2MuX2lkID0gQGluc2VydCBkb2NcbiAgICAgIGlmIGRvYy5faWQgYW5kIEBfY2hlY2tEZXBzIGRvYywgZmFsc2VcbiAgICAgICAgQF9ERFBNZXRob2Rfam9iUmVhZHkgZG9jLl9pZFxuICAgICAgICByZXR1cm4gZG9jLl9pZFxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gbnVsbFxuXG4gICMgV29ya2VyIG1ldGhvZHNcblxuICBfRERQTWV0aG9kX2pvYlByb2dyZXNzOiAoaWQsIHJ1bklkLCBjb21wbGV0ZWQsIHRvdGFsLCBvcHRpb25zKSAtPlxuICAgIGNoZWNrIGlkLCBNYXRjaC5XaGVyZShfdmFsaWRJZClcbiAgICBjaGVjayBydW5JZCwgTWF0Y2guV2hlcmUoX3ZhbGlkSWQpXG4gICAgY2hlY2sgY29tcGxldGVkLCBNYXRjaC5XaGVyZSBfdmFsaWROdW1HVEVaZXJvXG4gICAgY2hlY2sgdG90YWwsIE1hdGNoLldoZXJlIF92YWxpZE51bUdUWmVyb1xuICAgIGNoZWNrIG9wdGlvbnMsIE1hdGNoLk9wdGlvbmFsIHt9XG4gICAgb3B0aW9ucyA/PSB7fVxuXG4gICAgIyBOb3RpZnkgdGhlIHdvcmtlciB0byBzdG9wIHJ1bm5pbmcgaWYgd2UgYXJlIHNodXR0aW5nIGRvd25cbiAgICBpZiBAc3RvcHBlZFxuICAgICAgcmV0dXJuIG51bGxcblxuICAgIHByb2dyZXNzID1cbiAgICAgIGNvbXBsZXRlZDogY29tcGxldGVkXG4gICAgICB0b3RhbDogdG90YWxcbiAgICAgIHBlcmNlbnQ6IDEwMCpjb21wbGV0ZWQvdG90YWxcblxuICAgIGNoZWNrIHByb2dyZXNzLCBNYXRjaC5XaGVyZSAodikgLT5cbiAgICAgIHYudG90YWwgPj0gdi5jb21wbGV0ZWQgYW5kIDAgPD0gdi5wZXJjZW50IDw9IDEwMFxuXG4gICAgdGltZSA9IG5ldyBEYXRlKClcblxuICAgIGpvYiA9IEBmaW5kT25lIHsgX2lkOiBpZCB9LCB7IGZpZWxkczogeyB3b3JrVGltZW91dDogMSB9IH1cblxuICAgIG1vZHMgPVxuICAgICAgJHNldDpcbiAgICAgICAgcHJvZ3Jlc3M6IHByb2dyZXNzXG4gICAgICAgIHVwZGF0ZWQ6IHRpbWVcblxuICAgIGlmIGpvYj8ud29ya1RpbWVvdXQ/XG4gICAgICBtb2RzLiRzZXQuZXhwaXJlc0FmdGVyID0gbmV3IERhdGUodGltZS52YWx1ZU9mKCkgKyBqb2Iud29ya1RpbWVvdXQpXG5cbiAgICBudW0gPSBAdXBkYXRlKFxuICAgICAge1xuICAgICAgICBfaWQ6IGlkXG4gICAgICAgIHJ1bklkOiBydW5JZFxuICAgICAgICBzdGF0dXM6IFwicnVubmluZ1wiXG4gICAgICB9XG4gICAgICBtb2RzXG4gICAgKVxuXG4gICAgaWYgbnVtIGlzIDFcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZVxuICAgICAgY29uc29sZS53YXJuIFwiam9iUHJvZ3Jlc3MgZmFpbGVkXCJcbiAgICByZXR1cm4gZmFsc2VcblxuICBfRERQTWV0aG9kX2pvYkxvZzogKGlkLCBydW5JZCwgbWVzc2FnZSwgb3B0aW9ucykgLT5cbiAgICBjaGVjayBpZCwgTWF0Y2guV2hlcmUoX3ZhbGlkSWQpXG4gICAgY2hlY2sgcnVuSWQsIE1hdGNoLk9uZU9mKE1hdGNoLldoZXJlKF92YWxpZElkKSwgbnVsbClcbiAgICBjaGVjayBtZXNzYWdlLCBTdHJpbmdcbiAgICBjaGVjayBvcHRpb25zLCBNYXRjaC5PcHRpb25hbFxuICAgICAgbGV2ZWw6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLldoZXJlIF92YWxpZExvZ0xldmVsKVxuICAgICAgZGF0YTogTWF0Y2guT3B0aW9uYWwgT2JqZWN0XG4gICAgb3B0aW9ucyA/PSB7fVxuICAgIHRpbWUgPSBuZXcgRGF0ZSgpXG4gICAgbG9nT2JqID1cbiAgICAgICAgdGltZTogdGltZVxuICAgICAgICBydW5JZDogcnVuSWRcbiAgICAgICAgbGV2ZWw6IG9wdGlvbnMubGV2ZWwgPyAnaW5mbydcbiAgICAgICAgbWVzc2FnZTogbWVzc2FnZVxuICAgIGxvZ09iai5kYXRhID0gb3B0aW9ucy5kYXRhIGlmIG9wdGlvbnMuZGF0YT9cblxuICAgIGpvYiA9IEBmaW5kT25lIHsgX2lkOiBpZCB9LCB7IGZpZWxkczogeyBzdGF0dXM6IDEsIHdvcmtUaW1lb3V0OiAxIH0gfVxuXG4gICAgbW9kcyA9XG4gICAgICAkcHVzaDpcbiAgICAgICAgbG9nOiBsb2dPYmpcbiAgICAgICRzZXQ6XG4gICAgICAgIHVwZGF0ZWQ6IHRpbWVcblxuICAgIGlmIGpvYj8ud29ya1RpbWVvdXQ/IGFuZCBqb2Iuc3RhdHVzIGlzICdydW5uaW5nJ1xuICAgICAgbW9kcy4kc2V0LmV4cGlyZXNBZnRlciA9IG5ldyBEYXRlKHRpbWUudmFsdWVPZigpICsgam9iLndvcmtUaW1lb3V0KVxuXG4gICAgbnVtID0gQHVwZGF0ZShcbiAgICAgIHtcbiAgICAgICAgX2lkOiBpZFxuICAgICAgfVxuICAgICAgbW9kc1xuICAgIClcbiAgICBpZiBudW0gaXMgMVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLndhcm4gXCJqb2JMb2cgZmFpbGVkXCJcbiAgICByZXR1cm4gZmFsc2VcblxuICBfRERQTWV0aG9kX2pvYlJlcnVuOiAoaWQsIG9wdGlvbnMpIC0+XG4gICAgY2hlY2sgaWQsIE1hdGNoLldoZXJlKF92YWxpZElkKVxuICAgIGNoZWNrIG9wdGlvbnMsIE1hdGNoLk9wdGlvbmFsXG4gICAgICByZXBlYXRzOiBNYXRjaC5PcHRpb25hbChNYXRjaC5XaGVyZSBfdmFsaWRJbnRHVEVaZXJvKVxuICAgICAgdW50aWw6IE1hdGNoLk9wdGlvbmFsIERhdGVcbiAgICAgIHdhaXQ6IE1hdGNoLk9uZU9mKE1hdGNoLldoZXJlKF92YWxpZEludEdURVplcm8pLCBNYXRjaC5XaGVyZShfdmFsaWRMYXRlckpTT2JqKSlcblxuICAgIGRvYyA9IEBmaW5kT25lKFxuICAgICAge1xuICAgICAgICBfaWQ6IGlkXG4gICAgICAgIHN0YXR1czogXCJjb21wbGV0ZWRcIlxuICAgICAgfVxuICAgICAge1xuICAgICAgICBmaWVsZHM6XG4gICAgICAgICAgcmVzdWx0OiAwXG4gICAgICAgICAgZmFpbHVyZXM6IDBcbiAgICAgICAgICBsb2c6IDBcbiAgICAgICAgICBwcm9ncmVzczogMFxuICAgICAgICAgIHVwZGF0ZWQ6IDBcbiAgICAgICAgICBhZnRlcjogMFxuICAgICAgICAgIHN0YXR1czogMFxuICAgICAgICB0cmFuc2Zvcm06IG51bGxcbiAgICAgIH1cbiAgICApXG5cbiAgICBpZiBkb2M/XG4gICAgICBvcHRpb25zID89IHt9XG4gICAgICBvcHRpb25zLnJlcGVhdHMgPz0gMFxuICAgICAgb3B0aW9ucy5yZXBlYXRzID0gQGZvcmV2ZXIgaWYgb3B0aW9ucy5yZXBlYXRzID4gQGZvcmV2ZXJcbiAgICAgIG9wdGlvbnMudW50aWwgPz0gZG9jLnJlcGVhdFVudGlsXG4gICAgICBvcHRpb25zLndhaXQgPz0gMFxuICAgICAgcmV0dXJuIEBfcmVydW5fam9iIGRvYywgb3B0aW9ucy5yZXBlYXRzLCBvcHRpb25zLndhaXQsIG9wdGlvbnMudW50aWxcblxuICAgIHJldHVybiBmYWxzZVxuXG4gIF9ERFBNZXRob2Rfam9iRG9uZTogKGlkLCBydW5JZCwgcmVzdWx0LCBvcHRpb25zKSAtPlxuICAgIGNoZWNrIGlkLCBNYXRjaC5XaGVyZShfdmFsaWRJZClcbiAgICBjaGVjayBydW5JZCwgTWF0Y2guV2hlcmUoX3ZhbGlkSWQpXG4gICAgY2hlY2sgcmVzdWx0LCBPYmplY3RcbiAgICBjaGVjayBvcHRpb25zLCBNYXRjaC5PcHRpb25hbFxuICAgICAgcmVwZWF0SWQ6IE1hdGNoLk9wdGlvbmFsIEJvb2xlYW5cbiAgICAgIGRlbGF5RGVwczogTWF0Y2guT3B0aW9uYWwoTWF0Y2guV2hlcmUoX3ZhbGlkSW50R1RFWmVybykpXG5cbiAgICBvcHRpb25zID89IHsgcmVwZWF0SWQ6IGZhbHNlIH1cbiAgICB0aW1lID0gbmV3IERhdGUoKVxuICAgIGRvYyA9IEBmaW5kT25lKFxuICAgICAge1xuICAgICAgICBfaWQ6IGlkXG4gICAgICAgIHJ1bklkOiBydW5JZFxuICAgICAgICBzdGF0dXM6IFwicnVubmluZ1wiXG4gICAgICB9XG4gICAgICB7XG4gICAgICAgIGZpZWxkczpcbiAgICAgICAgICBsb2c6IDBcbiAgICAgICAgICBmYWlsdXJlczogMFxuICAgICAgICAgIHVwZGF0ZWQ6IDBcbiAgICAgICAgICBhZnRlcjogMFxuICAgICAgICAgIHN0YXR1czogMFxuICAgICAgICB0cmFuc2Zvcm06IG51bGxcbiAgICAgIH1cbiAgICApXG4gICAgdW5sZXNzIGRvYz9cbiAgICAgIHVubGVzcyBAaXNTaW11bGF0aW9uXG4gICAgICAgIGNvbnNvbGUud2FybiBcIlJ1bm5pbmcgam9iIG5vdCBmb3VuZFwiLCBpZCwgcnVuSWRcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgbW9kcyA9XG4gICAgICAkc2V0OlxuICAgICAgICBzdGF0dXM6IFwiY29tcGxldGVkXCJcbiAgICAgICAgcmVzdWx0OiByZXN1bHRcbiAgICAgICAgcHJvZ3Jlc3M6XG4gICAgICAgICAgY29tcGxldGVkOiBkb2MucHJvZ3Jlc3MudG90YWwgb3IgMVxuICAgICAgICAgIHRvdGFsOiBkb2MucHJvZ3Jlc3MudG90YWwgb3IgMVxuICAgICAgICAgIHBlcmNlbnQ6IDEwMFxuICAgICAgICB1cGRhdGVkOiB0aW1lXG5cbiAgICBpZiBsb2dPYmogPSBAX2xvZ01lc3NhZ2UuY29tcGxldGVkIHJ1bklkXG4gICAgICBtb2RzLiRwdXNoID1cbiAgICAgICAgbG9nOiBsb2dPYmpcblxuICAgIG51bSA9IEB1cGRhdGUoXG4gICAgICB7XG4gICAgICAgIF9pZDogaWRcbiAgICAgICAgcnVuSWQ6IHJ1bklkXG4gICAgICAgIHN0YXR1czogXCJydW5uaW5nXCJcbiAgICAgIH1cbiAgICAgIG1vZHNcbiAgICApXG4gICAgaWYgbnVtIGlzIDFcbiAgICAgIGlmIGRvYy5yZXBlYXRzID4gMFxuICAgICAgICBpZiB0eXBlb2YgZG9jLnJlcGVhdFdhaXQgaXMgJ251bWJlcidcbiAgICAgICAgICBpZiBkb2MucmVwZWF0VW50aWwgLSBkb2MucmVwZWF0V2FpdCA+PSB0aW1lXG4gICAgICAgICAgICBqb2JJZCA9IEBfcmVydW5fam9iIGRvY1xuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBUaGlzIGNvZGUgcHJldmVudHMgYSBqb2IgdGhhdCBqdXN0IHJhbiBhbmQgZmluaXNoZWRcbiAgICAgICAgICAjIGluc3RhbnRseSBmcm9tIGJlaW5nIGltbWVkaWF0ZWx5IHJlcnVuIG9uIHRoZSBzYW1lIG9jY3VyYW5jZVxuICAgICAgICAgIG5leHQgPSBAbGF0ZXI/LnNjaGVkdWxlKGRvYy5yZXBlYXRXYWl0KS5uZXh0KDIpXG4gICAgICAgICAgaWYgbmV4dCBhbmQgbmV4dC5sZW5ndGggPiAwXG4gICAgICAgICAgICBkID0gbmV3IERhdGUobmV4dFswXSlcbiAgICAgICAgICAgIGlmIChkIC0gdGltZSA+IDUwMCkgb3IgKG5leHQubGVuZ3RoID4gMSlcbiAgICAgICAgICAgICAgaWYgZCAtIHRpbWUgPD0gNTAwXG4gICAgICAgICAgICAgICAgZCA9IG5ldyBEYXRlKG5leHRbMV0pXG4gICAgICAgICAgICAgIHdhaXQgPSBkIC0gdGltZVxuICAgICAgICAgICAgICBpZiBkb2MucmVwZWF0VW50aWwgLSB3YWl0ID49IHRpbWVcbiAgICAgICAgICAgICAgICBqb2JJZCA9IEBfcmVydW5fam9iIGRvYywgZG9jLnJlcGVhdHMgLSAxLCB3YWl0XG5cbiAgICAgICMgUmVzb2x2ZSBkZXBlbmRzXG4gICAgICBpZHMgPSBAZmluZChcbiAgICAgICAge1xuICAgICAgICAgIGRlcGVuZHM6XG4gICAgICAgICAgICAkYWxsOiBbIGlkIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRyYW5zZm9ybTogbnVsbFxuICAgICAgICAgIGZpZWxkczpcbiAgICAgICAgICAgIF9pZDogMVxuICAgICAgICB9XG4gICAgICApLmZldGNoKCkubWFwIChkKSA9PiBkLl9pZFxuXG4gICAgICBpZiBpZHMubGVuZ3RoID4gMFxuXG4gICAgICAgIG1vZHMgPVxuICAgICAgICAgICRwdWxsOlxuICAgICAgICAgICAgZGVwZW5kczogaWRcbiAgICAgICAgICAkcHVzaDpcbiAgICAgICAgICAgIHJlc29sdmVkOiBpZFxuXG4gICAgICAgIGlmIG9wdGlvbnMuZGVsYXlEZXBzP1xuICAgICAgICAgIGFmdGVyID0gbmV3IERhdGUodGltZS52YWx1ZU9mKCkgKyBvcHRpb25zLmRlbGF5RGVwcylcbiAgICAgICAgICBtb2RzLiRtYXggPVxuICAgICAgICAgICAgYWZ0ZXI6IGFmdGVyXG5cbiAgICAgICAgaWYgbG9nT2JqID0gQF9sb2dNZXNzYWdlLnJlc29sdmVkIGlkLCBydW5JZFxuICAgICAgICAgIG1vZHMuJHB1c2gubG9nID0gbG9nT2JqXG5cbiAgICAgICAgbiA9IEB1cGRhdGUoXG4gICAgICAgICAge1xuICAgICAgICAgICAgX2lkOlxuICAgICAgICAgICAgICAkaW46IGlkc1xuICAgICAgICAgIH1cbiAgICAgICAgICBtb2RzXG4gICAgICAgICAge1xuICAgICAgICAgICAgbXVsdGk6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgICAgaWYgbiBpc250IGlkcy5sZW5ndGhcbiAgICAgICAgICBjb25zb2xlLndhcm4gXCJOb3QgYWxsIGRlcGVuZGVudCBqb2JzIHdlcmUgcmVzb2x2ZWQgI3tpZHMubGVuZ3RofSA+ICN7bn1cIlxuICAgICAgICAjIFRyeSB0byBwcm9tb3RlIGFueSBqb2JzIHRoYXQganVzdCBoYWQgYSBkZXBlbmRlbmN5IHJlc29sdmVkXG4gICAgICAgIEBfRERQTWV0aG9kX2pvYlJlYWR5IGlkc1xuICAgICAgaWYgb3B0aW9ucy5yZXBlYXRJZCBhbmQgam9iSWQ/XG4gICAgICAgIHJldHVybiBqb2JJZFxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGNvbnNvbGUud2FybiBcImpvYkRvbmUgZmFpbGVkXCJcbiAgICByZXR1cm4gZmFsc2VcblxuICBfRERQTWV0aG9kX2pvYkZhaWw6IChpZCwgcnVuSWQsIGVyciwgb3B0aW9ucykgLT5cbiAgICBjaGVjayBpZCwgTWF0Y2guV2hlcmUoX3ZhbGlkSWQpXG4gICAgY2hlY2sgcnVuSWQsIE1hdGNoLldoZXJlKF92YWxpZElkKVxuICAgIGNoZWNrIGVyciwgT2JqZWN0XG4gICAgY2hlY2sgb3B0aW9ucywgTWF0Y2guT3B0aW9uYWxcbiAgICAgIGZhdGFsOiBNYXRjaC5PcHRpb25hbCBCb29sZWFuXG5cbiAgICBvcHRpb25zID89IHt9XG4gICAgb3B0aW9ucy5mYXRhbCA/PSBmYWxzZVxuXG4gICAgdGltZSA9IG5ldyBEYXRlKClcbiAgICBkb2MgPSBAZmluZE9uZShcbiAgICAgIHtcbiAgICAgICAgX2lkOiBpZFxuICAgICAgICBydW5JZDogcnVuSWRcbiAgICAgICAgc3RhdHVzOiBcInJ1bm5pbmdcIlxuICAgICAgfVxuICAgICAge1xuICAgICAgICBmaWVsZHM6XG4gICAgICAgICAgbG9nOiAwXG4gICAgICAgICAgZmFpbHVyZXM6IDBcbiAgICAgICAgICBwcm9ncmVzczogMFxuICAgICAgICAgIHVwZGF0ZWQ6IDBcbiAgICAgICAgICBhZnRlcjogMFxuICAgICAgICAgIHJ1bklkOiAwXG4gICAgICAgICAgc3RhdHVzOiAwXG4gICAgICAgIHRyYW5zZm9ybTogbnVsbFxuICAgICAgfVxuICAgIClcbiAgICB1bmxlc3MgZG9jP1xuICAgICAgdW5sZXNzIEBpc1NpbXVsYXRpb25cbiAgICAgICAgY29uc29sZS53YXJuIFwiUnVubmluZyBqb2Igbm90IGZvdW5kXCIsIGlkLCBydW5JZFxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBhZnRlciA9IHN3aXRjaCBkb2MucmV0cnlCYWNrb2ZmXG4gICAgICB3aGVuICdleHBvbmVudGlhbCdcbiAgICAgICAgbmV3IERhdGUodGltZS52YWx1ZU9mKCkgKyBkb2MucmV0cnlXYWl0Kk1hdGgucG93KDIsIGRvYy5yZXRyaWVkLTEpKVxuICAgICAgZWxzZVxuICAgICAgICBuZXcgRGF0ZSh0aW1lLnZhbHVlT2YoKSArIGRvYy5yZXRyeVdhaXQpICAjICdjb25zdGFudCdcblxuICAgIG5ld1N0YXR1cyA9IGlmIChub3Qgb3B0aW9ucy5mYXRhbCBhbmRcbiAgICAgICAgICAgICAgICAgICAgZG9jLnJldHJpZXMgPiAwIGFuZFxuICAgICAgICAgICAgICAgICAgICBkb2MucmV0cnlVbnRpbCA+PSBhZnRlcikgdGhlbiBcIndhaXRpbmdcIiBlbHNlIFwiZmFpbGVkXCJcblxuICAgIGVyci5ydW5JZCA9IHJ1bklkICAjIExpbmsgZWFjaCBmYWlsdXJlIHRvIHRoZSBydW4gdGhhdCBnZW5lcmF0ZWQgaXQuXG5cbiAgICBtb2RzID1cbiAgICAgICRzZXQ6XG4gICAgICAgIHN0YXR1czogbmV3U3RhdHVzXG4gICAgICAgIHJ1bklkOiBudWxsXG4gICAgICAgIGFmdGVyOiBhZnRlclxuICAgICAgICB1cGRhdGVkOiB0aW1lXG4gICAgICAkcHVzaDpcbiAgICAgICAgZmFpbHVyZXM6XG4gICAgICAgICAgZXJyXG5cbiAgICBpZiBsb2dPYmogPSBAX2xvZ01lc3NhZ2UuZmFpbGVkIHJ1bklkLCBuZXdTdGF0dXMgaXMgJ2ZhaWxlZCcsIGVyclxuICAgICAgbW9kcy4kcHVzaC5sb2cgPSBsb2dPYmpcblxuICAgIG51bSA9IEB1cGRhdGUoXG4gICAgICB7XG4gICAgICAgIF9pZDogaWRcbiAgICAgICAgcnVuSWQ6IHJ1bklkXG4gICAgICAgIHN0YXR1czogXCJydW5uaW5nXCJcbiAgICAgIH1cbiAgICAgIG1vZHNcbiAgICApXG4gICAgaWYgbmV3U3RhdHVzIGlzIFwiZmFpbGVkXCIgYW5kIG51bSBpcyAxXG4gICAgICAjIENhbmNlbCBhbnkgZGVwZW5kZW50IGpvYnMgdG9vXG4gICAgICBAZmluZChcbiAgICAgICAge1xuICAgICAgICAgIGRlcGVuZHM6XG4gICAgICAgICAgICAkYWxsOiBbIGlkIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRyYW5zZm9ybTogbnVsbFxuICAgICAgICB9XG4gICAgICApLmZvckVhY2ggKGQpID0+IEBfRERQTWV0aG9kX2pvYkNhbmNlbCBkLl9pZFxuICAgIGlmIG51bSBpcyAxXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGNvbnNvbGUud2FybiBcImpvYkZhaWwgZmFpbGVkXCJcbiAgICByZXR1cm4gZmFsc2VcblxuIyBTaGFyZSB0aGVzZSBtZXRob2RzIHNvIHRoZXknbGwgYmUgYXZhaWxhYmxlIG9uIHNlcnZlciBhbmQgY2xpZW50XG5cbnNoYXJlLkpvYkNvbGxlY3Rpb25CYXNlID0gSm9iQ29sbGVjdGlvbkJhc2VcbiIsInZhciBKb2JDb2xsZWN0aW9uQmFzZSwgX3ZhbGlkSWQsIF92YWxpZEludEdURU9uZSwgX3ZhbGlkSW50R1RFWmVybywgX3ZhbGlkSm9iRG9jLCBfdmFsaWRMYXRlckpTT2JqLCBfdmFsaWRMb2csIF92YWxpZExvZ0xldmVsLCBfdmFsaWROdW1HVEVPbmUsIF92YWxpZE51bUdURVplcm8sIF92YWxpZE51bUdUWmVybywgX3ZhbGlkUHJvZ3Jlc3MsIF92YWxpZFJldHJ5QmFja29mZiwgX3ZhbGlkU3RhdHVzLFxuICBpbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH0sXG4gIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5LFxuICBzbGljZSA9IFtdLnNsaWNlO1xuXG5fdmFsaWROdW1HVEVaZXJvID0gZnVuY3Rpb24odikge1xuICByZXR1cm4gTWF0Y2gudGVzdCh2LCBOdW1iZXIpICYmIHYgPj0gMC4wO1xufTtcblxuX3ZhbGlkTnVtR1RaZXJvID0gZnVuY3Rpb24odikge1xuICByZXR1cm4gTWF0Y2gudGVzdCh2LCBOdW1iZXIpICYmIHYgPiAwLjA7XG59O1xuXG5fdmFsaWROdW1HVEVPbmUgPSBmdW5jdGlvbih2KSB7XG4gIHJldHVybiBNYXRjaC50ZXN0KHYsIE51bWJlcikgJiYgdiA+PSAxLjA7XG59O1xuXG5fdmFsaWRJbnRHVEVaZXJvID0gZnVuY3Rpb24odikge1xuICByZXR1cm4gX3ZhbGlkTnVtR1RFWmVybyh2KSAmJiBNYXRoLmZsb29yKHYpID09PSB2O1xufTtcblxuX3ZhbGlkSW50R1RFT25lID0gZnVuY3Rpb24odikge1xuICByZXR1cm4gX3ZhbGlkTnVtR1RFT25lKHYpICYmIE1hdGguZmxvb3IodikgPT09IHY7XG59O1xuXG5fdmFsaWRTdGF0dXMgPSBmdW5jdGlvbih2KSB7XG4gIHJldHVybiBNYXRjaC50ZXN0KHYsIFN0cmluZykgJiYgaW5kZXhPZi5jYWxsKEpvYi5qb2JTdGF0dXNlcywgdikgPj0gMDtcbn07XG5cbl92YWxpZExvZ0xldmVsID0gZnVuY3Rpb24odikge1xuICByZXR1cm4gTWF0Y2gudGVzdCh2LCBTdHJpbmcpICYmIGluZGV4T2YuY2FsbChKb2Iuam9iTG9nTGV2ZWxzLCB2KSA+PSAwO1xufTtcblxuX3ZhbGlkUmV0cnlCYWNrb2ZmID0gZnVuY3Rpb24odikge1xuICByZXR1cm4gTWF0Y2gudGVzdCh2LCBTdHJpbmcpICYmIGluZGV4T2YuY2FsbChKb2Iuam9iUmV0cnlCYWNrb2ZmTWV0aG9kcywgdikgPj0gMDtcbn07XG5cbl92YWxpZElkID0gZnVuY3Rpb24odikge1xuICByZXR1cm4gTWF0Y2gudGVzdCh2LCBNYXRjaC5PbmVPZihTdHJpbmcsIE1vbmdvLkNvbGxlY3Rpb24uT2JqZWN0SUQpKTtcbn07XG5cbl92YWxpZExvZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIHRpbWU6IERhdGUsXG4gICAgICBydW5JZDogTWF0Y2guT25lT2YoTWF0Y2guV2hlcmUoX3ZhbGlkSWQpLCBudWxsKSxcbiAgICAgIGxldmVsOiBNYXRjaC5XaGVyZShfdmFsaWRMb2dMZXZlbCksXG4gICAgICBtZXNzYWdlOiBTdHJpbmcsXG4gICAgICBkYXRhOiBNYXRjaC5PcHRpb25hbChPYmplY3QpXG4gICAgfVxuICBdO1xufTtcblxuX3ZhbGlkUHJvZ3Jlc3MgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICBjb21wbGV0ZWQ6IE1hdGNoLldoZXJlKF92YWxpZE51bUdURVplcm8pLFxuICAgIHRvdGFsOiBNYXRjaC5XaGVyZShfdmFsaWROdW1HVEVaZXJvKSxcbiAgICBwZXJjZW50OiBNYXRjaC5XaGVyZShfdmFsaWROdW1HVEVaZXJvKVxuICB9O1xufTtcblxuX3ZhbGlkTGF0ZXJKU09iaiA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHNjaGVkdWxlczogW09iamVjdF0sXG4gICAgZXhjZXB0aW9uczogTWF0Y2guT3B0aW9uYWwoW09iamVjdF0pXG4gIH07XG59O1xuXG5fdmFsaWRKb2JEb2MgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICBfaWQ6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLk9uZU9mKE1hdGNoLldoZXJlKF92YWxpZElkKSwgbnVsbCkpLFxuICAgIHJ1bklkOiBNYXRjaC5PbmVPZihNYXRjaC5XaGVyZShfdmFsaWRJZCksIG51bGwpLFxuICAgIHR5cGU6IFN0cmluZyxcbiAgICBzdGF0dXM6IE1hdGNoLldoZXJlKF92YWxpZFN0YXR1cyksXG4gICAgZGF0YTogT2JqZWN0LFxuICAgIHJlc3VsdDogTWF0Y2guT3B0aW9uYWwoT2JqZWN0KSxcbiAgICBmYWlsdXJlczogTWF0Y2guT3B0aW9uYWwoW09iamVjdF0pLFxuICAgIHByaW9yaXR5OiBNYXRjaC5JbnRlZ2VyLFxuICAgIGRlcGVuZHM6IFtNYXRjaC5XaGVyZShfdmFsaWRJZCldLFxuICAgIHJlc29sdmVkOiBbTWF0Y2guV2hlcmUoX3ZhbGlkSWQpXSxcbiAgICBhZnRlcjogRGF0ZSxcbiAgICB1cGRhdGVkOiBEYXRlLFxuICAgIHdvcmtUaW1lb3V0OiBNYXRjaC5PcHRpb25hbChNYXRjaC5XaGVyZShfdmFsaWRJbnRHVEVPbmUpKSxcbiAgICBleHBpcmVzQWZ0ZXI6IE1hdGNoLk9wdGlvbmFsKERhdGUpLFxuICAgIGxvZzogTWF0Y2guT3B0aW9uYWwoX3ZhbGlkTG9nKCkpLFxuICAgIHByb2dyZXNzOiBfdmFsaWRQcm9ncmVzcygpLFxuICAgIHJldHJpZXM6IE1hdGNoLldoZXJlKF92YWxpZEludEdURVplcm8pLFxuICAgIHJldHJpZWQ6IE1hdGNoLldoZXJlKF92YWxpZEludEdURVplcm8pLFxuICAgIHJlcGVhdFJldHJpZXM6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLldoZXJlKF92YWxpZEludEdURVplcm8pKSxcbiAgICByZXRyeVVudGlsOiBEYXRlLFxuICAgIHJldHJ5V2FpdDogTWF0Y2guV2hlcmUoX3ZhbGlkSW50R1RFWmVybyksXG4gICAgcmV0cnlCYWNrb2ZmOiBNYXRjaC5XaGVyZShfdmFsaWRSZXRyeUJhY2tvZmYpLFxuICAgIHJlcGVhdHM6IE1hdGNoLldoZXJlKF92YWxpZEludEdURVplcm8pLFxuICAgIHJlcGVhdGVkOiBNYXRjaC5XaGVyZShfdmFsaWRJbnRHVEVaZXJvKSxcbiAgICByZXBlYXRVbnRpbDogRGF0ZSxcbiAgICByZXBlYXRXYWl0OiBNYXRjaC5PbmVPZihNYXRjaC5XaGVyZShfdmFsaWRJbnRHVEVaZXJvKSwgTWF0Y2guV2hlcmUoX3ZhbGlkTGF0ZXJKU09iaikpLFxuICAgIGNyZWF0ZWQ6IERhdGVcbiAgfTtcbn07XG5cbkpvYkNvbGxlY3Rpb25CYXNlID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKEpvYkNvbGxlY3Rpb25CYXNlLCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBKb2JDb2xsZWN0aW9uQmFzZShyb290LCBvcHRpb25zKSB7XG4gICAgdmFyIGNvbGxlY3Rpb25OYW1lO1xuICAgIHRoaXMucm9vdCA9IHJvb3QgIT0gbnVsbCA/IHJvb3QgOiAncXVldWUnO1xuICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEpvYkNvbGxlY3Rpb25CYXNlKSkge1xuICAgICAgcmV0dXJuIG5ldyBKb2JDb2xsZWN0aW9uQmFzZSh0aGlzLnJvb3QsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgTW9uZ28uQ29sbGVjdGlvbikpIHtcbiAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ1RoZSBnbG9iYWwgZGVmaW5pdGlvbiBvZiBNb25nby5Db2xsZWN0aW9uIGhhcyBjaGFuZ2VkIHNpbmNlIHRoZSBqb2ItY29sbGVjdGlvbiBwYWNrYWdlIHdhcyBsb2FkZWQuIFBsZWFzZSBlbnN1cmUgdGhhdCBhbnkgcGFja2FnZXMgdGhhdCByZWRlZmluZSBNb25nby5Db2xsZWN0aW9uIGFyZSBsb2FkZWQgYmVmb3JlIGpvYi1jb2xsZWN0aW9uLicpO1xuICAgIH1cbiAgICBpZiAoTW9uZ28uQ29sbGVjdGlvbiAhPT0gTW9uZ28uQ29sbGVjdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IpIHtcbiAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ1RoZSBnbG9iYWwgZGVmaW5pdGlvbiBvZiBNb25nby5Db2xsZWN0aW9uIGhhcyBiZWVuIHBhdGNoZWQgYnkgYW5vdGhlciBwYWNrYWdlLCBhbmQgdGhlIHByb3RvdHlwZSBjb25zdHJ1Y3RvciBoYXMgYmVlbiBsZWZ0IGluIGFuIGluY29uc2lzdGVudCBzdGF0ZS4gUGxlYXNlIHNlZSB0aGlzIGxpbmsgZm9yIGEgd29ya2Fyb3VuZDogaHR0cHM6Ly9naXRodWIuY29tL3ZzaXZzaS9tZXRlb3ItZmlsZS1zYW1wbGUtYXBwL2lzc3Vlcy8yI2lzc3VlY29tbWVudC0xMjA3ODA1OTInKTtcbiAgICB9XG4gICAgdGhpcy5sYXRlciA9IGxhdGVyO1xuICAgIGlmIChvcHRpb25zLm5vQ29sbGVjdGlvblN1ZmZpeCA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLm5vQ29sbGVjdGlvblN1ZmZpeCA9IGZhbHNlO1xuICAgIH1cbiAgICBjb2xsZWN0aW9uTmFtZSA9IHRoaXMucm9vdDtcbiAgICBpZiAoIW9wdGlvbnMubm9Db2xsZWN0aW9uU3VmZml4KSB7XG4gICAgICBjb2xsZWN0aW9uTmFtZSArPSAnLmpvYnMnO1xuICAgIH1cbiAgICBkZWxldGUgb3B0aW9ucy5ub0NvbGxlY3Rpb25TdWZmaXg7XG4gICAgSm9iLnNldEREUChvcHRpb25zLmNvbm5lY3Rpb24sIHRoaXMucm9vdCk7XG4gICAgdGhpcy5fY3JlYXRlTG9nRW50cnkgPSBmdW5jdGlvbihtZXNzYWdlLCBydW5JZCwgbGV2ZWwsIHRpbWUsIGRhdGEpIHtcbiAgICAgIHZhciBsO1xuICAgICAgaWYgKG1lc3NhZ2UgPT0gbnVsbCkge1xuICAgICAgICBtZXNzYWdlID0gJyc7XG4gICAgICB9XG4gICAgICBpZiAocnVuSWQgPT0gbnVsbCkge1xuICAgICAgICBydW5JZCA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAobGV2ZWwgPT0gbnVsbCkge1xuICAgICAgICBsZXZlbCA9ICdpbmZvJztcbiAgICAgIH1cbiAgICAgIGlmICh0aW1lID09IG51bGwpIHtcbiAgICAgICAgdGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICB9XG4gICAgICBpZiAoZGF0YSA9PSBudWxsKSB7XG4gICAgICAgIGRhdGEgPSBudWxsO1xuICAgICAgfVxuICAgICAgbCA9IHtcbiAgICAgICAgdGltZTogdGltZSxcbiAgICAgICAgcnVuSWQ6IHJ1bklkLFxuICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICBsZXZlbDogbGV2ZWxcbiAgICAgIH07XG4gICAgICByZXR1cm4gbDtcbiAgICB9O1xuICAgIHRoaXMuX2xvZ01lc3NhZ2UgPSB7XG4gICAgICAncmVhZGllZCc6IChmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUxvZ0VudHJ5KFwiUHJvbW90ZWQgdG8gcmVhZHlcIik7XG4gICAgICB9KS5iaW5kKHRoaXMpLFxuICAgICAgJ2ZvcmNlZCc6IChmdW5jdGlvbihpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlTG9nRW50cnkoXCJEZXBlbmRlbmNpZXMgZm9yY2UgcmVzb2x2ZWRcIiwgbnVsbCwgJ3dhcm5pbmcnKTtcbiAgICAgIH0pLmJpbmQodGhpcyksXG4gICAgICAncmVydW4nOiAoZnVuY3Rpb24oaWQsIHJ1bklkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVMb2dFbnRyeShcIlJlcnVubmluZyBqb2JcIiwgbnVsbCwgJ2luZm8nLCBuZXcgRGF0ZSgpLCB7XG4gICAgICAgICAgcHJldmlvdXNKb2I6IHtcbiAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgIHJ1bklkOiBydW5JZFxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KS5iaW5kKHRoaXMpLFxuICAgICAgJ3J1bm5pbmcnOiAoZnVuY3Rpb24ocnVuSWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUxvZ0VudHJ5KFwiSm9iIFJ1bm5pbmdcIiwgcnVuSWQpO1xuICAgICAgfSkuYmluZCh0aGlzKSxcbiAgICAgICdwYXVzZWQnOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVMb2dFbnRyeShcIkpvYiBQYXVzZWRcIik7XG4gICAgICB9KS5iaW5kKHRoaXMpLFxuICAgICAgJ3Jlc3VtZWQnOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVMb2dFbnRyeShcIkpvYiBSZXN1bWVkXCIpO1xuICAgICAgfSkuYmluZCh0aGlzKSxcbiAgICAgICdjYW5jZWxsZWQnOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVMb2dFbnRyeShcIkpvYiBDYW5jZWxsZWRcIiwgbnVsbCwgJ3dhcm5pbmcnKTtcbiAgICAgIH0pLmJpbmQodGhpcyksXG4gICAgICAncmVzdGFydGVkJzogKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlTG9nRW50cnkoXCJKb2IgUmVzdGFydGVkXCIpO1xuICAgICAgfSkuYmluZCh0aGlzKSxcbiAgICAgICdyZXN1Ym1pdHRlZCc6IChmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUxvZ0VudHJ5KFwiSm9iIFJlc3VibWl0dGVkXCIpO1xuICAgICAgfSkuYmluZCh0aGlzKSxcbiAgICAgICdzdWJtaXR0ZWQnOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVMb2dFbnRyeShcIkpvYiBTdWJtaXR0ZWRcIik7XG4gICAgICB9KS5iaW5kKHRoaXMpLFxuICAgICAgJ2NvbXBsZXRlZCc6IChmdW5jdGlvbihydW5JZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlTG9nRW50cnkoXCJKb2IgQ29tcGxldGVkXCIsIHJ1bklkLCAnc3VjY2VzcycpO1xuICAgICAgfSkuYmluZCh0aGlzKSxcbiAgICAgICdyZXNvbHZlZCc6IChmdW5jdGlvbihpZCwgcnVuSWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUxvZ0VudHJ5KFwiRGVwZW5kZW5jeSByZXNvbHZlZFwiLCBudWxsLCAnaW5mbycsIG5ldyBEYXRlKCksIHtcbiAgICAgICAgICBkZXBlbmRlbmN5OiB7XG4gICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICBydW5JZDogcnVuSWRcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSkuYmluZCh0aGlzKSxcbiAgICAgICdmYWlsZWQnOiAoZnVuY3Rpb24ocnVuSWQsIGZhdGFsLCBlcnIpIHtcbiAgICAgICAgdmFyIGxldmVsLCBtc2csIHZhbHVlO1xuICAgICAgICB2YWx1ZSA9IGVyci52YWx1ZTtcbiAgICAgICAgbXNnID0gXCJKb2IgRmFpbGVkIHdpdGhcIiArIChmYXRhbCA/ICcgRmF0YWwnIDogJycpICsgXCIgRXJyb3JcIiArICgodmFsdWUgIT0gbnVsbCkgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/ICc6ICcgKyB2YWx1ZSA6ICcnKSArIFwiLlwiO1xuICAgICAgICBsZXZlbCA9IGZhdGFsID8gJ2RhbmdlcicgOiAnd2FybmluZyc7XG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVMb2dFbnRyeShtc2csIHJ1bklkLCBsZXZlbCk7XG4gICAgICB9KS5iaW5kKHRoaXMpXG4gICAgfTtcbiAgICBKb2JDb2xsZWN0aW9uQmFzZS5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLCBjb2xsZWN0aW9uTmFtZSwgb3B0aW9ucyk7XG4gIH1cblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuX3ZhbGlkTnVtR1RFWmVybyA9IF92YWxpZE51bUdURVplcm87XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLl92YWxpZE51bUdUWmVybyA9IF92YWxpZE51bUdUWmVybztcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuX3ZhbGlkTnVtR1RFT25lID0gX3ZhbGlkTnVtR1RFT25lO1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5fdmFsaWRJbnRHVEVaZXJvID0gX3ZhbGlkSW50R1RFWmVybztcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuX3ZhbGlkSW50R1RFT25lID0gX3ZhbGlkSW50R1RFT25lO1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5fdmFsaWRTdGF0dXMgPSBfdmFsaWRTdGF0dXM7XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLl92YWxpZExvZ0xldmVsID0gX3ZhbGlkTG9nTGV2ZWw7XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLl92YWxpZFJldHJ5QmFja29mZiA9IF92YWxpZFJldHJ5QmFja29mZjtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuX3ZhbGlkSWQgPSBfdmFsaWRJZDtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuX3ZhbGlkTG9nID0gX3ZhbGlkTG9nO1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5fdmFsaWRQcm9ncmVzcyA9IF92YWxpZFByb2dyZXNzO1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5fdmFsaWRKb2JEb2MgPSBfdmFsaWRKb2JEb2M7XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLmpvYkxvZ0xldmVscyA9IEpvYi5qb2JMb2dMZXZlbHM7XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLmpvYlByaW9yaXRpZXMgPSBKb2Iuam9iUHJpb3JpdGllcztcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuam9iU3RhdHVzZXMgPSBKb2Iuam9iU3RhdHVzZXM7XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLmpvYlN0YXR1c0NhbmNlbGxhYmxlID0gSm9iLmpvYlN0YXR1c0NhbmNlbGxhYmxlO1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5qb2JTdGF0dXNQYXVzYWJsZSA9IEpvYi5qb2JTdGF0dXNQYXVzYWJsZTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuam9iU3RhdHVzUmVtb3ZhYmxlID0gSm9iLmpvYlN0YXR1c1JlbW92YWJsZTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuam9iU3RhdHVzUmVzdGFydGFibGUgPSBKb2Iuam9iU3RhdHVzUmVzdGFydGFibGU7XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLmZvcmV2ZXIgPSBKb2IuZm9yZXZlcjtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuZm9yZXZlckRhdGUgPSBKb2IuZm9yZXZlckRhdGU7XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLmRkcE1ldGhvZHMgPSBKb2IuZGRwTWV0aG9kcztcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuZGRwUGVybWlzc2lvbkxldmVscyA9IEpvYi5kZHBQZXJtaXNzaW9uTGV2ZWxzO1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5kZHBNZXRob2RQZXJtaXNzaW9ucyA9IEpvYi5kZHBNZXRob2RQZXJtaXNzaW9ucztcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUucHJvY2Vzc0pvYnMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcGFyYW1zO1xuICAgIHBhcmFtcyA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIHJldHVybiAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKTtcbiAgICAgIHJldHVybiBPYmplY3QocmVzdWx0KSA9PT0gcmVzdWx0ID8gcmVzdWx0IDogY2hpbGQ7XG4gICAgfSkoSm9iLnByb2Nlc3NKb2JzLCBbdGhpcy5yb290XS5jb25jYXQoc2xpY2UuY2FsbChwYXJhbXMpKSwgZnVuY3Rpb24oKXt9KTtcbiAgfTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuZ2V0Sm9iID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBhcmFtcztcbiAgICBwYXJhbXMgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICByZXR1cm4gSm9iLmdldEpvYi5hcHBseShKb2IsIFt0aGlzLnJvb3RdLmNvbmNhdChzbGljZS5jYWxsKHBhcmFtcykpKTtcbiAgfTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuZ2V0V29yayA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJhbXM7XG4gICAgcGFyYW1zID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgcmV0dXJuIEpvYi5nZXRXb3JrLmFwcGx5KEpvYiwgW3RoaXMucm9vdF0uY29uY2F0KHNsaWNlLmNhbGwocGFyYW1zKSkpO1xuICB9O1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5nZXRKb2JzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBhcmFtcztcbiAgICBwYXJhbXMgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICByZXR1cm4gSm9iLmdldEpvYnMuYXBwbHkoSm9iLCBbdGhpcy5yb290XS5jb25jYXQoc2xpY2UuY2FsbChwYXJhbXMpKSk7XG4gIH07XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLnJlYWR5Sm9icyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJhbXM7XG4gICAgcGFyYW1zID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgcmV0dXJuIEpvYi5yZWFkeUpvYnMuYXBwbHkoSm9iLCBbdGhpcy5yb290XS5jb25jYXQoc2xpY2UuY2FsbChwYXJhbXMpKSk7XG4gIH07XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLmNhbmNlbEpvYnMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcGFyYW1zO1xuICAgIHBhcmFtcyA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIHJldHVybiBKb2IuY2FuY2VsSm9icy5hcHBseShKb2IsIFt0aGlzLnJvb3RdLmNvbmNhdChzbGljZS5jYWxsKHBhcmFtcykpKTtcbiAgfTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUucGF1c2VKb2JzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBhcmFtcztcbiAgICBwYXJhbXMgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICByZXR1cm4gSm9iLnBhdXNlSm9icy5hcHBseShKb2IsIFt0aGlzLnJvb3RdLmNvbmNhdChzbGljZS5jYWxsKHBhcmFtcykpKTtcbiAgfTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUucmVzdW1lSm9icyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJhbXM7XG4gICAgcGFyYW1zID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgcmV0dXJuIEpvYi5yZXN1bWVKb2JzLmFwcGx5KEpvYiwgW3RoaXMucm9vdF0uY29uY2F0KHNsaWNlLmNhbGwocGFyYW1zKSkpO1xuICB9O1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5yZXN0YXJ0Sm9icyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJhbXM7XG4gICAgcGFyYW1zID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgcmV0dXJuIEpvYi5yZXN0YXJ0Sm9icy5hcHBseShKb2IsIFt0aGlzLnJvb3RdLmNvbmNhdChzbGljZS5jYWxsKHBhcmFtcykpKTtcbiAgfTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUucmVtb3ZlSm9icyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJhbXM7XG4gICAgcGFyYW1zID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgcmV0dXJuIEpvYi5yZW1vdmVKb2JzLmFwcGx5KEpvYiwgW3RoaXMucm9vdF0uY29uY2F0KHNsaWNlLmNhbGwocGFyYW1zKSkpO1xuICB9O1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5zZXRERFAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcGFyYW1zO1xuICAgIHBhcmFtcyA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIHJldHVybiBKb2Iuc2V0RERQLmFwcGx5KEpvYiwgcGFyYW1zKTtcbiAgfTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuc3RhcnRKb2JTZXJ2ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcGFyYW1zO1xuICAgIHBhcmFtcyA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIHJldHVybiBKb2Iuc3RhcnRKb2JTZXJ2ZXIuYXBwbHkoSm9iLCBbdGhpcy5yb290XS5jb25jYXQoc2xpY2UuY2FsbChwYXJhbXMpKSk7XG4gIH07XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLnNodXRkb3duSm9iU2VydmVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBhcmFtcztcbiAgICBwYXJhbXMgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICByZXR1cm4gSm9iLnNodXRkb3duSm9iU2VydmVyLmFwcGx5KEpvYiwgW3RoaXMucm9vdF0uY29uY2F0KHNsaWNlLmNhbGwocGFyYW1zKSkpO1xuICB9O1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5zdGFydEpvYnMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcGFyYW1zO1xuICAgIHBhcmFtcyA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIHJldHVybiBKb2Iuc3RhcnRKb2JzLmFwcGx5KEpvYiwgW3RoaXMucm9vdF0uY29uY2F0KHNsaWNlLmNhbGwocGFyYW1zKSkpO1xuICB9O1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5zdG9wSm9icyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJhbXM7XG4gICAgcGFyYW1zID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgcmV0dXJuIEpvYi5zdG9wSm9icy5hcHBseShKb2IsIFt0aGlzLnJvb3RdLmNvbmNhdChzbGljZS5jYWxsKHBhcmFtcykpKTtcbiAgfTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuam9iRG9jUGF0dGVybiA9IF92YWxpZEpvYkRvYygpO1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5hbGxvdyA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlNlcnZlci1vbmx5IGZ1bmN0aW9uIGpjLmFsbG93KCkgaW52b2tlZCBvbiBjbGllbnQuXCIpO1xuICB9O1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5kZW55ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiU2VydmVyLW9ubHkgZnVuY3Rpb24gamMuZGVueSgpIGludm9rZWQgb24gY2xpZW50LlwiKTtcbiAgfTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUucHJvbW90ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlNlcnZlci1vbmx5IGZ1bmN0aW9uIGpjLnByb21vdGUoKSBpbnZva2VkIG9uIGNsaWVudC5cIik7XG4gIH07XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLnNldExvZ1N0cmVhbSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlNlcnZlci1vbmx5IGZ1bmN0aW9uIGpjLnNldExvZ1N0cmVhbSgpIGludm9rZWQgb24gY2xpZW50LlwiKTtcbiAgfTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUubG9nQ29uc29sZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNsaWVudC1vbmx5IGZ1bmN0aW9uIGpjLmxvZ0NvbnNvbGUoKSBpbnZva2VkIG9uIHNlcnZlci5cIik7XG4gIH07XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLm1ha2VKb2IgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlcDtcbiAgICBkZXAgPSBmYWxzZTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGFyYW1zO1xuICAgICAgcGFyYW1zID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgICBpZiAoIWRlcCkge1xuICAgICAgICBkZXAgPSB0cnVlO1xuICAgICAgICBjb25zb2xlLndhcm4oXCJXQVJOSU5HOiBqYy5tYWtlSm9iKCkgaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIG5ldyBKb2IoamMsIGRvYykgaW5zdGVhZC5cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpO1xuICAgICAgICByZXR1cm4gT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCA/IHJlc3VsdCA6IGNoaWxkO1xuICAgICAgfSkoSm9iLCBbdGhpcy5yb290XS5jb25jYXQoc2xpY2UuY2FsbChwYXJhbXMpKSwgZnVuY3Rpb24oKXt9KTtcbiAgICB9O1xuICB9KSgpO1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5jcmVhdGVKb2IgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlcDtcbiAgICBkZXAgPSBmYWxzZTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGFyYW1zO1xuICAgICAgcGFyYW1zID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgICBpZiAoIWRlcCkge1xuICAgICAgICBkZXAgPSB0cnVlO1xuICAgICAgICBjb25zb2xlLndhcm4oXCJXQVJOSU5HOiBqYy5jcmVhdGVKb2IoKSBoYXMgYmVlbiBkZXByZWNhdGVkLiBVc2UgbmV3IEpvYihqYywgdHlwZSwgZGF0YSkgaW5zdGVhZC5cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpO1xuICAgICAgICByZXR1cm4gT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCA/IHJlc3VsdCA6IGNoaWxkO1xuICAgICAgfSkoSm9iLCBbdGhpcy5yb290XS5jb25jYXQoc2xpY2UuY2FsbChwYXJhbXMpKSwgZnVuY3Rpb24oKXt9KTtcbiAgICB9O1xuICB9KSgpO1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5fbWV0aG9kV3JhcHBlciA9IGZ1bmN0aW9uKG1ldGhvZCwgZnVuYykge1xuICAgIHZhciByZWYsIHRvTG9nLCB1bmJsb2NrRERQTWV0aG9kcztcbiAgICB0b0xvZyA9IHRoaXMuX3RvTG9nO1xuICAgIHVuYmxvY2tERFBNZXRob2RzID0gKHJlZiA9IHRoaXMuX3VuYmxvY2tERFBNZXRob2RzKSAhPSBudWxsID8gcmVmIDogZmFsc2U7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBhcmFtcywgcmVmMSwgcmV0dmFsLCB1c2VyO1xuICAgICAgcGFyYW1zID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgICB1c2VyID0gKHJlZjEgPSB0aGlzLnVzZXJJZCkgIT0gbnVsbCA/IHJlZjEgOiBcIltVTkFVVEhFTlRJQ0FURURdXCI7XG4gICAgICB0b0xvZyh1c2VyLCBtZXRob2QsIFwicGFyYW1zOiBcIiArIEpTT04uc3RyaW5naWZ5KHBhcmFtcykpO1xuICAgICAgaWYgKHVuYmxvY2tERFBNZXRob2RzKSB7XG4gICAgICAgIHRoaXMudW5ibG9jaygpO1xuICAgICAgfVxuICAgICAgcmV0dmFsID0gZnVuYy5hcHBseShudWxsLCBwYXJhbXMpO1xuICAgICAgdG9Mb2codXNlciwgbWV0aG9kLCBcInJldHVybmVkOiBcIiArIEpTT04uc3RyaW5naWZ5KHJldHZhbCkpO1xuICAgICAgcmV0dXJuIHJldHZhbDtcbiAgICB9O1xuICB9O1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5fZ2VuZXJhdGVNZXRob2RzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGJhc2VNZXRob2ROYW1lLCBtZXRob2RGdW5jLCBtZXRob2ROYW1lLCBtZXRob2RQcmVmaXgsIG1ldGhvZHNPdXQsIHJlZjtcbiAgICBtZXRob2RzT3V0ID0ge307XG4gICAgbWV0aG9kUHJlZml4ID0gJ19ERFBNZXRob2RfJztcbiAgICByZWYgPSB0aGlzO1xuICAgIGZvciAobWV0aG9kTmFtZSBpbiByZWYpIHtcbiAgICAgIG1ldGhvZEZ1bmMgPSByZWZbbWV0aG9kTmFtZV07XG4gICAgICBpZiAoIShtZXRob2ROYW1lLnNsaWNlKDAsIG1ldGhvZFByZWZpeC5sZW5ndGgpID09PSBtZXRob2RQcmVmaXgpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgYmFzZU1ldGhvZE5hbWUgPSBtZXRob2ROYW1lLnNsaWNlKG1ldGhvZFByZWZpeC5sZW5ndGgpO1xuICAgICAgbWV0aG9kc091dFt0aGlzLnJvb3QgKyBcIl9cIiArIGJhc2VNZXRob2ROYW1lXSA9IHRoaXMuX21ldGhvZFdyYXBwZXIoYmFzZU1ldGhvZE5hbWUsIG1ldGhvZEZ1bmMuYmluZCh0aGlzKSk7XG4gICAgfVxuICAgIHJldHVybiBtZXRob2RzT3V0O1xuICB9O1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5faWRzT2ZEZXBzID0gZnVuY3Rpb24oaWRzLCBhbnRlY2VkZW50cywgZGVwZW5kZW50cywgam9iU3RhdHVzZXMpIHtcbiAgICB2YXIgYW50c0FycmF5LCBkZXBlbmRzSWRzLCBkZXBlbmRzUXVlcnk7XG4gICAgZGVwZW5kc1F1ZXJ5ID0gW107XG4gICAgZGVwZW5kc0lkcyA9IFtdO1xuICAgIGlmIChkZXBlbmRlbnRzKSB7XG4gICAgICBkZXBlbmRzUXVlcnkucHVzaCh7XG4gICAgICAgIGRlcGVuZHM6IHtcbiAgICAgICAgICAkZWxlbU1hdGNoOiB7XG4gICAgICAgICAgICAkaW46IGlkc1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChhbnRlY2VkZW50cykge1xuICAgICAgYW50c0FycmF5ID0gW107XG4gICAgICB0aGlzLmZpbmQoe1xuICAgICAgICBfaWQ6IHtcbiAgICAgICAgICAkaW46IGlkc1xuICAgICAgICB9XG4gICAgICB9LCB7XG4gICAgICAgIGZpZWxkczoge1xuICAgICAgICAgIGRlcGVuZHM6IDFcbiAgICAgICAgfSxcbiAgICAgICAgdHJhbnNmb3JtOiBudWxsXG4gICAgICB9KS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgdmFyIGksIGssIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgICAgICBpZiAoaW5kZXhPZi5jYWxsKGFudHNBcnJheSwgaSkgPCAwKSB7XG4gICAgICAgICAgcmVmID0gZC5kZXBlbmRzO1xuICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgICAgIGkgPSByZWZba107XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goYW50c0FycmF5LnB1c2goaSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoYW50c0FycmF5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgZGVwZW5kc1F1ZXJ5LnB1c2goe1xuICAgICAgICAgIF9pZDoge1xuICAgICAgICAgICAgJGluOiBhbnRzQXJyYXlcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZGVwZW5kc1F1ZXJ5Lmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuZmluZCh7XG4gICAgICAgIHN0YXR1czoge1xuICAgICAgICAgICRpbjogam9iU3RhdHVzZXNcbiAgICAgICAgfSxcbiAgICAgICAgJG9yOiBkZXBlbmRzUXVlcnlcbiAgICAgIH0sIHtcbiAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgX2lkOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHRyYW5zZm9ybTogbnVsbFxuICAgICAgfSkuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgIHZhciByZWY7XG4gICAgICAgIGlmIChyZWYgPSBkLl9pZCwgaW5kZXhPZi5jYWxsKGRlcGVuZHNJZHMsIHJlZikgPCAwKSB7XG4gICAgICAgICAgcmV0dXJuIGRlcGVuZHNJZHMucHVzaChkLl9pZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZGVwZW5kc0lkcztcbiAgfTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuX3JlcnVuX2pvYiA9IGZ1bmN0aW9uKGRvYywgcmVwZWF0cywgd2FpdCwgcmVwZWF0VW50aWwpIHtcbiAgICB2YXIgaWQsIGpvYklkLCBsb2dPYmosIHJ1bklkLCB0aW1lO1xuICAgIGlmIChyZXBlYXRzID09IG51bGwpIHtcbiAgICAgIHJlcGVhdHMgPSBkb2MucmVwZWF0cyAtIDE7XG4gICAgfVxuICAgIGlmICh3YWl0ID09IG51bGwpIHtcbiAgICAgIHdhaXQgPSBkb2MucmVwZWF0V2FpdDtcbiAgICB9XG4gICAgaWYgKHJlcGVhdFVudGlsID09IG51bGwpIHtcbiAgICAgIHJlcGVhdFVudGlsID0gZG9jLnJlcGVhdFVudGlsO1xuICAgIH1cbiAgICBpZCA9IGRvYy5faWQ7XG4gICAgcnVuSWQgPSBkb2MucnVuSWQ7XG4gICAgdGltZSA9IG5ldyBEYXRlKCk7XG4gICAgZGVsZXRlIGRvYy5faWQ7XG4gICAgZGVsZXRlIGRvYy5yZXN1bHQ7XG4gICAgZGVsZXRlIGRvYy5mYWlsdXJlcztcbiAgICBkZWxldGUgZG9jLmV4cGlyZXNBZnRlcjtcbiAgICBkZWxldGUgZG9jLndvcmtUaW1lb3V0O1xuICAgIGRvYy5ydW5JZCA9IG51bGw7XG4gICAgZG9jLnN0YXR1cyA9IFwid2FpdGluZ1wiO1xuICAgIGRvYy5yZXBlYXRSZXRyaWVzID0gZG9jLnJlcGVhdFJldHJpZXMgIT0gbnVsbCA/IGRvYy5yZXBlYXRSZXRyaWVzIDogZG9jLnJldHJpZXMgKyBkb2MucmV0cmllZDtcbiAgICBkb2MucmV0cmllcyA9IGRvYy5yZXBlYXRSZXRyaWVzO1xuICAgIGlmIChkb2MucmV0cmllcyA+IHRoaXMuZm9yZXZlcikge1xuICAgICAgZG9jLnJldHJpZXMgPSB0aGlzLmZvcmV2ZXI7XG4gICAgfVxuICAgIGRvYy5yZXRyeVVudGlsID0gcmVwZWF0VW50aWw7XG4gICAgZG9jLnJldHJpZWQgPSAwO1xuICAgIGRvYy5yZXBlYXRzID0gcmVwZWF0cztcbiAgICBpZiAoZG9jLnJlcGVhdHMgPiB0aGlzLmZvcmV2ZXIpIHtcbiAgICAgIGRvYy5yZXBlYXRzID0gdGhpcy5mb3JldmVyO1xuICAgIH1cbiAgICBkb2MucmVwZWF0VW50aWwgPSByZXBlYXRVbnRpbDtcbiAgICBkb2MucmVwZWF0ZWQgPSBkb2MucmVwZWF0ZWQgKyAxO1xuICAgIGRvYy51cGRhdGVkID0gdGltZTtcbiAgICBkb2MuY3JlYXRlZCA9IHRpbWU7XG4gICAgZG9jLnByb2dyZXNzID0ge1xuICAgICAgY29tcGxldGVkOiAwLFxuICAgICAgdG90YWw6IDEsXG4gICAgICBwZXJjZW50OiAwXG4gICAgfTtcbiAgICBpZiAobG9nT2JqID0gdGhpcy5fbG9nTWVzc2FnZS5yZXJ1bihpZCwgcnVuSWQpKSB7XG4gICAgICBkb2MubG9nID0gW2xvZ09ial07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvYy5sb2cgPSBbXTtcbiAgICB9XG4gICAgZG9jLmFmdGVyID0gbmV3IERhdGUodGltZS52YWx1ZU9mKCkgKyB3YWl0KTtcbiAgICBpZiAoam9iSWQgPSB0aGlzLmluc2VydChkb2MpKSB7XG4gICAgICB0aGlzLl9ERFBNZXRob2Rfam9iUmVhZHkoam9iSWQpO1xuICAgICAgcmV0dXJuIGpvYklkO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJKb2IgcmVydW4vcmVwZWF0IGZhaWxlZCB0byByZXNjaGVkdWxlIVwiLCBpZCwgcnVuSWQpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuX2NoZWNrRGVwcyA9IGZ1bmN0aW9uKGpvYiwgZHJ5UnVuKSB7XG4gICAgdmFyIGNhbmNlbCwgY2FuY2VsbGVkLCBkZXBKb2IsIGRlcHMsIGZhaWxlZCwgZm91bmRJZHMsIGosIGssIGxlbiwgbGVuMSwgbG9nLCBtLCBtb2RzLCBuLCByZWYsIHJlZjEsIHJlbW92ZWQsIHJlc29sdmVkO1xuICAgIGlmIChkcnlSdW4gPT0gbnVsbCkge1xuICAgICAgZHJ5UnVuID0gdHJ1ZTtcbiAgICB9XG4gICAgY2FuY2VsID0gZmFsc2U7XG4gICAgcmVzb2x2ZWQgPSBbXTtcbiAgICBmYWlsZWQgPSBbXTtcbiAgICBjYW5jZWxsZWQgPSBbXTtcbiAgICByZW1vdmVkID0gW107XG4gICAgbG9nID0gW107XG4gICAgaWYgKGpvYi5kZXBlbmRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGRlcHMgPSB0aGlzLmZpbmQoe1xuICAgICAgICBfaWQ6IHtcbiAgICAgICAgICAkaW46IGpvYi5kZXBlbmRzXG4gICAgICAgIH1cbiAgICAgIH0sIHtcbiAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgX2lkOiAxLFxuICAgICAgICAgIHJ1bklkOiAxLFxuICAgICAgICAgIHN0YXR1czogMVxuICAgICAgICB9XG4gICAgICB9KS5mZXRjaCgpO1xuICAgICAgaWYgKGRlcHMubGVuZ3RoICE9PSBqb2IuZGVwZW5kcy5sZW5ndGgpIHtcbiAgICAgICAgZm91bmRJZHMgPSBkZXBzLm1hcChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgcmV0dXJuIGQuX2lkO1xuICAgICAgICB9KTtcbiAgICAgICAgcmVmID0gam9iLmRlcGVuZHM7XG4gICAgICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgICAgIGogPSByZWZba107XG4gICAgICAgICAgaWYgKCEoIShpbmRleE9mLmNhbGwoZm91bmRJZHMsIGopID49IDApKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghZHJ5UnVuKSB7XG4gICAgICAgICAgICB0aGlzLl9ERFBNZXRob2Rfam9iTG9nKGpvYi5faWQsIG51bGwsIFwiQW50ZWNlZGVudCBqb2IgXCIgKyBqICsgXCIgbWlzc2luZyBhdCBzYXZlXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZW1vdmVkLnB1c2goaik7XG4gICAgICAgIH1cbiAgICAgICAgY2FuY2VsID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGZvciAobSA9IDAsIGxlbjEgPSBkZXBzLmxlbmd0aDsgbSA8IGxlbjE7IG0rKykge1xuICAgICAgICBkZXBKb2IgPSBkZXBzW21dO1xuICAgICAgICBpZiAocmVmMSA9IGRlcEpvYi5zdGF0dXMsIGluZGV4T2YuY2FsbCh0aGlzLmpvYlN0YXR1c0NhbmNlbGxhYmxlLCByZWYxKSA8IDApIHtcbiAgICAgICAgICBzd2l0Y2ggKGRlcEpvYi5zdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgXCJjb21wbGV0ZWRcIjpcbiAgICAgICAgICAgICAgcmVzb2x2ZWQucHVzaChkZXBKb2IuX2lkKTtcbiAgICAgICAgICAgICAgbG9nLnB1c2godGhpcy5fbG9nTWVzc2FnZS5yZXNvbHZlZChkZXBKb2IuX2lkLCBkZXBKb2IucnVuSWQpKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZmFpbGVkXCI6XG4gICAgICAgICAgICAgIGNhbmNlbCA9IHRydWU7XG4gICAgICAgICAgICAgIGZhaWxlZC5wdXNoKGRlcEpvYi5faWQpO1xuICAgICAgICAgICAgICBpZiAoIWRyeVJ1bikge1xuICAgICAgICAgICAgICAgIHRoaXMuX0REUE1ldGhvZF9qb2JMb2coam9iLl9pZCwgbnVsbCwgXCJBbnRlY2VkZW50IGpvYiBmYWlsZWQgYmVmb3JlIHNhdmVcIik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY2FuY2VsbGVkXCI6XG4gICAgICAgICAgICAgIGNhbmNlbCA9IHRydWU7XG4gICAgICAgICAgICAgIGNhbmNlbGxlZC5wdXNoKGRlcEpvYi5faWQpO1xuICAgICAgICAgICAgICBpZiAoIWRyeVJ1bikge1xuICAgICAgICAgICAgICAgIHRoaXMuX0REUE1ldGhvZF9qb2JMb2coam9iLl9pZCwgbnVsbCwgXCJBbnRlY2VkZW50IGpvYiBjYW5jZWxsZWQgYmVmb3JlIHNhdmVcIik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKFwiVW5rbm93biBzdGF0dXMgaW4gam9iU2F2ZSBEZXBlbmRlbmN5IGNoZWNrXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCEocmVzb2x2ZWQubGVuZ3RoID09PSAwIHx8IGRyeVJ1bikpIHtcbiAgICAgICAgbW9kcyA9IHtcbiAgICAgICAgICAkcHVsbDoge1xuICAgICAgICAgICAgZGVwZW5kczoge1xuICAgICAgICAgICAgICAkaW46IHJlc29sdmVkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAkcHVzaDoge1xuICAgICAgICAgICAgcmVzb2x2ZWQ6IHtcbiAgICAgICAgICAgICAgJGVhY2g6IHJlc29sdmVkXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9nOiB7XG4gICAgICAgICAgICAgICRlYWNoOiBsb2dcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIG4gPSB0aGlzLnVwZGF0ZSh7XG4gICAgICAgICAgX2lkOiBqb2IuX2lkLFxuICAgICAgICAgIHN0YXR1czogJ3dhaXRpbmcnXG4gICAgICAgIH0sIG1vZHMpO1xuICAgICAgICBpZiAoIW4pIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJVcGRhdGUgZm9yIGpvYiBcIiArIGpvYi5faWQgKyBcIiBkdXJpbmcgZGVwZW5kZW5jeSBjaGVjayBmYWlsZWQuXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoY2FuY2VsICYmICFkcnlSdW4pIHtcbiAgICAgICAgdGhpcy5fRERQTWV0aG9kX2pvYkNhbmNlbChqb2IuX2lkKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZHJ5UnVuKSB7XG4gICAgICBpZiAoY2FuY2VsIHx8IHJlc29sdmVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBqb2JJZDogam9iLl9pZCxcbiAgICAgICAgICByZXNvbHZlZDogcmVzb2x2ZWQsXG4gICAgICAgICAgZmFpbGVkOiBmYWlsZWQsXG4gICAgICAgICAgY2FuY2VsbGVkOiBjYW5jZWxsZWQsXG4gICAgICAgICAgcmVtb3ZlZDogcmVtb3ZlZFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH07XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLl9ERFBNZXRob2Rfc3RhcnRKb2JTZXJ2ZXIgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgY2hlY2sob3B0aW9ucywgTWF0Y2guT3B0aW9uYWwoe30pKTtcbiAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuICAgIGlmICghdGhpcy5pc1NpbXVsYXRpb24pIHtcbiAgICAgIGlmICh0aGlzLnN0b3BwZWQgJiYgdGhpcy5zdG9wcGVkICE9PSB0cnVlKSB7XG4gICAgICAgIE1ldGVvci5jbGVhclRpbWVvdXQodGhpcy5zdG9wcGVkKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuX0REUE1ldGhvZF9zdGFydEpvYnMgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlcEZsYWc7XG4gICAgZGVwRmxhZyA9IGZhbHNlO1xuICAgIHJldHVybiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBpZiAoIWRlcEZsYWcpIHtcbiAgICAgICAgZGVwRmxhZyA9IHRydWU7XG4gICAgICAgIGNvbnNvbGUud2FybihcIkRlcHJlY2F0aW9uIFdhcm5pbmc6IGpjLnN0YXJ0Sm9icygpIGhhcyBiZWVuIHJlbmFtZWQgdG8gamMuc3RhcnRKb2JTZXJ2ZXIoKVwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9ERFBNZXRob2Rfc3RhcnRKb2JTZXJ2ZXIob3B0aW9ucyk7XG4gICAgfTtcbiAgfSkoKTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuX0REUE1ldGhvZF9zaHV0ZG93bkpvYlNlcnZlciA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBjaGVjayhvcHRpb25zLCBNYXRjaC5PcHRpb25hbCh7XG4gICAgICB0aW1lb3V0OiBNYXRjaC5PcHRpb25hbChNYXRjaC5XaGVyZShfdmFsaWRJbnRHVEVPbmUpKVxuICAgIH0pKTtcbiAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuICAgIGlmIChvcHRpb25zLnRpbWVvdXQgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucy50aW1lb3V0ID0gNjAgKiAxMDAwO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNTaW11bGF0aW9uKSB7XG4gICAgICBpZiAodGhpcy5zdG9wcGVkICYmIHRoaXMuc3RvcHBlZCAhPT0gdHJ1ZSkge1xuICAgICAgICBNZXRlb3IuY2xlYXJUaW1lb3V0KHRoaXMuc3RvcHBlZCk7XG4gICAgICB9XG4gICAgICB0aGlzLnN0b3BwZWQgPSBNZXRlb3Iuc2V0VGltZW91dCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBjdXJzb3IsIGZhaWxlZEpvYnM7XG4gICAgICAgICAgY3Vyc29yID0gX3RoaXMuZmluZCh7XG4gICAgICAgICAgICBzdGF0dXM6ICdydW5uaW5nJ1xuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogbnVsbFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGZhaWxlZEpvYnMgPSBjdXJzb3IuY291bnQoKTtcbiAgICAgICAgICBpZiAoZmFpbGVkSm9icyAhPT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiRmFpbGluZyBcIiArIGZhaWxlZEpvYnMgKyBcIiBqb2JzIG9uIHF1ZXVlIHN0b3AuXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjdXJzb3IuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMuX0REUE1ldGhvZF9qb2JGYWlsKGQuX2lkLCBkLnJ1bklkLCBcIlJ1bm5pbmcgYXQgSm9iIFNlcnZlciBzaHV0ZG93bi5cIik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKF90aGlzLmxvZ1N0cmVhbSAhPSBudWxsKSB7XG4gICAgICAgICAgICBfdGhpcy5sb2dTdHJlYW0uZW5kKCk7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMubG9nU3RyZWFtID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSwgb3B0aW9ucy50aW1lb3V0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLl9ERFBNZXRob2Rfc3RvcEpvYnMgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlcEZsYWc7XG4gICAgZGVwRmxhZyA9IGZhbHNlO1xuICAgIHJldHVybiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBpZiAoIWRlcEZsYWcpIHtcbiAgICAgICAgZGVwRmxhZyA9IHRydWU7XG4gICAgICAgIGNvbnNvbGUud2FybihcIkRlcHJlY2F0aW9uIFdhcm5pbmc6IGpjLnN0b3BKb2JzKCkgaGFzIGJlZW4gcmVuYW1lZCB0byBqYy5zaHV0ZG93bkpvYlNlcnZlcigpXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX0REUE1ldGhvZF9zaHV0ZG93bkpvYlNlcnZlcihvcHRpb25zKTtcbiAgICB9O1xuICB9KSgpO1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5fRERQTWV0aG9kX2dldEpvYiA9IGZ1bmN0aW9uKGlkcywgb3B0aW9ucykge1xuICAgIHZhciBkLCBkb2NzLCBmaWVsZHMsIHNpbmdsZTtcbiAgICBjaGVjayhpZHMsIE1hdGNoLk9uZU9mKE1hdGNoLldoZXJlKF92YWxpZElkKSwgW01hdGNoLldoZXJlKF92YWxpZElkKV0pKTtcbiAgICBjaGVjayhvcHRpb25zLCBNYXRjaC5PcHRpb25hbCh7XG4gICAgICBnZXRMb2c6IE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pLFxuICAgICAgZ2V0RmFpbHVyZXM6IE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pXG4gICAgfSkpO1xuICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZ2V0TG9nID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMuZ2V0TG9nID0gZmFsc2U7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmdldEZhaWx1cmVzID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMuZ2V0RmFpbHVyZXMgPSBmYWxzZTtcbiAgICB9XG4gICAgc2luZ2xlID0gZmFsc2U7XG4gICAgaWYgKF92YWxpZElkKGlkcykpIHtcbiAgICAgIGlkcyA9IFtpZHNdO1xuICAgICAgc2luZ2xlID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGlkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBmaWVsZHMgPSB7XG4gICAgICBfcHJpdmF0ZTogMFxuICAgIH07XG4gICAgaWYgKCFvcHRpb25zLmdldExvZykge1xuICAgICAgZmllbGRzLmxvZyA9IDA7XG4gICAgfVxuICAgIGlmICghb3B0aW9ucy5nZXRGYWlsdXJlcykge1xuICAgICAgZmllbGRzLmZhaWx1cmVzID0gMDtcbiAgICB9XG4gICAgZG9jcyA9IHRoaXMuZmluZCh7XG4gICAgICBfaWQ6IHtcbiAgICAgICAgJGluOiBpZHNcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBmaWVsZHM6IGZpZWxkcyxcbiAgICAgIHRyYW5zZm9ybTogbnVsbFxuICAgIH0pLmZldGNoKCk7XG4gICAgaWYgKGRvY3MgIT0gbnVsbCA/IGRvY3MubGVuZ3RoIDogdm9pZCAwKSB7XG4gICAgICBpZiAodGhpcy5zY3J1YiAhPSBudWxsKSB7XG4gICAgICAgIGRvY3MgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGssIGxlbiwgcmVzdWx0cztcbiAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yIChrID0gMCwgbGVuID0gZG9jcy5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgICAgICAgZCA9IGRvY3Nba107XG4gICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5zY3J1YihkKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9KS5jYWxsKHRoaXMpO1xuICAgICAgfVxuICAgICAgY2hlY2soZG9jcywgW192YWxpZEpvYkRvYygpXSk7XG4gICAgICBpZiAoc2luZ2xlKSB7XG4gICAgICAgIHJldHVybiBkb2NzWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRvY3M7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5fRERQTWV0aG9kX2dldFdvcmsgPSBmdW5jdGlvbih0eXBlLCBvcHRpb25zKSB7XG4gICAgdmFyIGQsIGRvY3MsIGZvdW5kRG9jcywgaWRzLCBsb2dPYmosIG1vZHMsIG51bSwgcnVuSWQsIHRpbWU7XG4gICAgY2hlY2sodHlwZSwgTWF0Y2guT25lT2YoU3RyaW5nLCBbU3RyaW5nXSkpO1xuICAgIGNoZWNrKG9wdGlvbnMsIE1hdGNoLk9wdGlvbmFsKHtcbiAgICAgIG1heEpvYnM6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLldoZXJlKF92YWxpZEludEdURU9uZSkpLFxuICAgICAgd29ya1RpbWVvdXQ6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLldoZXJlKF92YWxpZEludEdURU9uZSkpXG4gICAgfSkpO1xuICAgIGlmICh0aGlzLmlzU2ltdWxhdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuICAgIGlmIChvcHRpb25zLm1heEpvYnMgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucy5tYXhKb2JzID0gMTtcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RvcHBlZCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0eXBlID0gW3R5cGVdO1xuICAgIH1cbiAgICB0aW1lID0gbmV3IERhdGUoKTtcbiAgICBkb2NzID0gW107XG4gICAgcnVuSWQgPSB0aGlzLl9tYWtlTmV3SUQoKTtcbiAgICB3aGlsZSAoZG9jcy5sZW5ndGggPCBvcHRpb25zLm1heEpvYnMpIHtcbiAgICAgIGlkcyA9IHRoaXMuZmluZCh7XG4gICAgICAgIHR5cGU6IHtcbiAgICAgICAgICAkaW46IHR5cGVcbiAgICAgICAgfSxcbiAgICAgICAgc3RhdHVzOiAncmVhZHknLFxuICAgICAgICBydW5JZDogbnVsbFxuICAgICAgfSwge1xuICAgICAgICBzb3J0OiB7XG4gICAgICAgICAgcHJpb3JpdHk6IDEsXG4gICAgICAgICAgcmV0cnlVbnRpbDogMSxcbiAgICAgICAgICBhZnRlcjogMVxuICAgICAgICB9LFxuICAgICAgICBsaW1pdDogb3B0aW9ucy5tYXhKb2JzIC0gZG9jcy5sZW5ndGgsXG4gICAgICAgIGZpZWxkczoge1xuICAgICAgICAgIF9pZDogMVxuICAgICAgICB9LFxuICAgICAgICB0cmFuc2Zvcm06IG51bGxcbiAgICAgIH0pLm1hcChmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkLl9pZDtcbiAgICAgIH0pO1xuICAgICAgaWYgKCEoKGlkcyAhPSBudWxsID8gaWRzLmxlbmd0aCA6IHZvaWQgMCkgPiAwKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIG1vZHMgPSB7XG4gICAgICAgICRzZXQ6IHtcbiAgICAgICAgICBzdGF0dXM6ICdydW5uaW5nJyxcbiAgICAgICAgICBydW5JZDogcnVuSWQsXG4gICAgICAgICAgdXBkYXRlZDogdGltZVxuICAgICAgICB9LFxuICAgICAgICAkaW5jOiB7XG4gICAgICAgICAgcmV0cmllczogLTEsXG4gICAgICAgICAgcmV0cmllZDogMVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgaWYgKGxvZ09iaiA9IHRoaXMuX2xvZ01lc3NhZ2UucnVubmluZyhydW5JZCkpIHtcbiAgICAgICAgbW9kcy4kcHVzaCA9IHtcbiAgICAgICAgICBsb2c6IGxvZ09ialxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMud29ya1RpbWVvdXQgIT0gbnVsbCkge1xuICAgICAgICBtb2RzLiRzZXQud29ya1RpbWVvdXQgPSBvcHRpb25zLndvcmtUaW1lb3V0O1xuICAgICAgICBtb2RzLiRzZXQuZXhwaXJlc0FmdGVyID0gbmV3IERhdGUodGltZS52YWx1ZU9mKCkgKyBvcHRpb25zLndvcmtUaW1lb3V0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChtb2RzLiR1bnNldCA9PSBudWxsKSB7XG4gICAgICAgICAgbW9kcy4kdW5zZXQgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBtb2RzLiR1bnNldC53b3JrVGltZW91dCA9IFwiXCI7XG4gICAgICAgIG1vZHMuJHVuc2V0LmV4cGlyZXNBZnRlciA9IFwiXCI7XG4gICAgICB9XG4gICAgICBudW0gPSB0aGlzLnVwZGF0ZSh7XG4gICAgICAgIF9pZDoge1xuICAgICAgICAgICRpbjogaWRzXG4gICAgICAgIH0sXG4gICAgICAgIHN0YXR1czogJ3JlYWR5JyxcbiAgICAgICAgcnVuSWQ6IG51bGxcbiAgICAgIH0sIG1vZHMsIHtcbiAgICAgICAgbXVsdGk6IHRydWVcbiAgICAgIH0pO1xuICAgICAgaWYgKG51bSA+IDApIHtcbiAgICAgICAgZm91bmREb2NzID0gdGhpcy5maW5kKHtcbiAgICAgICAgICBfaWQ6IHtcbiAgICAgICAgICAgICRpbjogaWRzXG4gICAgICAgICAgfSxcbiAgICAgICAgICBydW5JZDogcnVuSWRcbiAgICAgICAgfSwge1xuICAgICAgICAgIGZpZWxkczoge1xuICAgICAgICAgICAgbG9nOiAwLFxuICAgICAgICAgICAgZmFpbHVyZXM6IDAsXG4gICAgICAgICAgICBfcHJpdmF0ZTogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgdHJhbnNmb3JtOiBudWxsXG4gICAgICAgIH0pLmZldGNoKCk7XG4gICAgICAgIGlmICgoZm91bmREb2NzICE9IG51bGwgPyBmb3VuZERvY3MubGVuZ3RoIDogdm9pZCAwKSA+IDApIHtcbiAgICAgICAgICBpZiAodGhpcy5zY3J1YiAhPSBudWxsKSB7XG4gICAgICAgICAgICBmb3VuZERvY3MgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciBrLCBsZW4sIHJlc3VsdHM7XG4gICAgICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgZm9yIChrID0gMCwgbGVuID0gZm91bmREb2NzLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICAgICAgICAgICAgZCA9IGZvdW5kRG9jc1trXTtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5zY3J1YihkKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICB9KS5jYWxsKHRoaXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjaGVjayhkb2NzLCBbX3ZhbGlkSm9iRG9jKCldKTtcbiAgICAgICAgICBkb2NzID0gZG9jcy5jb25jYXQoZm91bmREb2NzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZG9jcztcbiAgfTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuX0REUE1ldGhvZF9qb2JSZW1vdmUgPSBmdW5jdGlvbihpZHMsIG9wdGlvbnMpIHtcbiAgICB2YXIgbnVtO1xuICAgIGNoZWNrKGlkcywgTWF0Y2guT25lT2YoTWF0Y2guV2hlcmUoX3ZhbGlkSWQpLCBbTWF0Y2guV2hlcmUoX3ZhbGlkSWQpXSkpO1xuICAgIGNoZWNrKG9wdGlvbnMsIE1hdGNoLk9wdGlvbmFsKHt9KSk7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cbiAgICBpZiAoX3ZhbGlkSWQoaWRzKSkge1xuICAgICAgaWRzID0gW2lkc107XG4gICAgfVxuICAgIGlmIChpZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIG51bSA9IHRoaXMucmVtb3ZlKHtcbiAgICAgIF9pZDoge1xuICAgICAgICAkaW46IGlkc1xuICAgICAgfSxcbiAgICAgIHN0YXR1czoge1xuICAgICAgICAkaW46IHRoaXMuam9iU3RhdHVzUmVtb3ZhYmxlXG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKG51bSA+IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJqb2JSZW1vdmUgZmFpbGVkXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLl9ERFBNZXRob2Rfam9iUGF1c2UgPSBmdW5jdGlvbihpZHMsIG9wdGlvbnMpIHtcbiAgICB2YXIgbG9nT2JqLCBtb2RzLCBudW0sIHRpbWU7XG4gICAgY2hlY2soaWRzLCBNYXRjaC5PbmVPZihNYXRjaC5XaGVyZShfdmFsaWRJZCksIFtNYXRjaC5XaGVyZShfdmFsaWRJZCldKSk7XG4gICAgY2hlY2sob3B0aW9ucywgTWF0Y2guT3B0aW9uYWwoe30pKTtcbiAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuICAgIGlmIChfdmFsaWRJZChpZHMpKSB7XG4gICAgICBpZHMgPSBbaWRzXTtcbiAgICB9XG4gICAgaWYgKGlkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGltZSA9IG5ldyBEYXRlKCk7XG4gICAgbW9kcyA9IHtcbiAgICAgICRzZXQ6IHtcbiAgICAgICAgc3RhdHVzOiBcInBhdXNlZFwiLFxuICAgICAgICB1cGRhdGVkOiB0aW1lXG4gICAgICB9XG4gICAgfTtcbiAgICBpZiAobG9nT2JqID0gdGhpcy5fbG9nTWVzc2FnZS5wYXVzZWQoKSkge1xuICAgICAgbW9kcy4kcHVzaCA9IHtcbiAgICAgICAgbG9nOiBsb2dPYmpcbiAgICAgIH07XG4gICAgfVxuICAgIG51bSA9IHRoaXMudXBkYXRlKHtcbiAgICAgIF9pZDoge1xuICAgICAgICAkaW46IGlkc1xuICAgICAgfSxcbiAgICAgIHN0YXR1czoge1xuICAgICAgICAkaW46IHRoaXMuam9iU3RhdHVzUGF1c2FibGVcbiAgICAgIH1cbiAgICB9LCBtb2RzLCB7XG4gICAgICBtdWx0aTogdHJ1ZVxuICAgIH0pO1xuICAgIGlmIChudW0gPiAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFwiam9iUGF1c2UgZmFpbGVkXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLl9ERFBNZXRob2Rfam9iUmVzdW1lID0gZnVuY3Rpb24oaWRzLCBvcHRpb25zKSB7XG4gICAgdmFyIGxvZ09iaiwgbW9kcywgbnVtLCB0aW1lO1xuICAgIGNoZWNrKGlkcywgTWF0Y2guT25lT2YoTWF0Y2guV2hlcmUoX3ZhbGlkSWQpLCBbTWF0Y2guV2hlcmUoX3ZhbGlkSWQpXSkpO1xuICAgIGNoZWNrKG9wdGlvbnMsIE1hdGNoLk9wdGlvbmFsKHt9KSk7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cbiAgICBpZiAoX3ZhbGlkSWQoaWRzKSkge1xuICAgICAgaWRzID0gW2lkc107XG4gICAgfVxuICAgIGlmIChpZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgIG1vZHMgPSB7XG4gICAgICAkc2V0OiB7XG4gICAgICAgIHN0YXR1czogXCJ3YWl0aW5nXCIsXG4gICAgICAgIHVwZGF0ZWQ6IHRpbWVcbiAgICAgIH1cbiAgICB9O1xuICAgIGlmIChsb2dPYmogPSB0aGlzLl9sb2dNZXNzYWdlLnJlc3VtZWQoKSkge1xuICAgICAgbW9kcy4kcHVzaCA9IHtcbiAgICAgICAgbG9nOiBsb2dPYmpcbiAgICAgIH07XG4gICAgfVxuICAgIG51bSA9IHRoaXMudXBkYXRlKHtcbiAgICAgIF9pZDoge1xuICAgICAgICAkaW46IGlkc1xuICAgICAgfSxcbiAgICAgIHN0YXR1czogXCJwYXVzZWRcIixcbiAgICAgIHVwZGF0ZWQ6IHtcbiAgICAgICAgJG5lOiB0aW1lXG4gICAgICB9XG4gICAgfSwgbW9kcywge1xuICAgICAgbXVsdGk6IHRydWVcbiAgICB9KTtcbiAgICBpZiAobnVtID4gMCkge1xuICAgICAgdGhpcy5fRERQTWV0aG9kX2pvYlJlYWR5KGlkcyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFwiam9iUmVzdW1lIGZhaWxlZFwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5fRERQTWV0aG9kX2pvYlJlYWR5ID0gZnVuY3Rpb24oaWRzLCBvcHRpb25zKSB7XG4gICAgdmFyIGwsIGxvZ09iaiwgbW9kcywgbm93LCBudW0sIHF1ZXJ5O1xuICAgIGNoZWNrKGlkcywgTWF0Y2guT25lT2YoTWF0Y2guV2hlcmUoX3ZhbGlkSWQpLCBbTWF0Y2guV2hlcmUoX3ZhbGlkSWQpXSkpO1xuICAgIGNoZWNrKG9wdGlvbnMsIE1hdGNoLk9wdGlvbmFsKHtcbiAgICAgIGZvcmNlOiBNYXRjaC5PcHRpb25hbChCb29sZWFuKSxcbiAgICAgIHRpbWU6IE1hdGNoLk9wdGlvbmFsKERhdGUpXG4gICAgfSkpO1xuICAgIGlmICh0aGlzLmlzU2ltdWxhdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBub3cgPSBuZXcgRGF0ZSgpO1xuICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZm9yY2UgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucy5mb3JjZSA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy50aW1lID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMudGltZSA9IG5vdztcbiAgICB9XG4gICAgaWYgKF92YWxpZElkKGlkcykpIHtcbiAgICAgIGlkcyA9IFtpZHNdO1xuICAgIH1cbiAgICBxdWVyeSA9IHtcbiAgICAgIHN0YXR1czogXCJ3YWl0aW5nXCIsXG4gICAgICBhZnRlcjoge1xuICAgICAgICAkbHRlOiBvcHRpb25zLnRpbWVcbiAgICAgIH1cbiAgICB9O1xuICAgIG1vZHMgPSB7XG4gICAgICAkc2V0OiB7XG4gICAgICAgIHN0YXR1czogXCJyZWFkeVwiLFxuICAgICAgICB1cGRhdGVkOiBub3dcbiAgICAgIH1cbiAgICB9O1xuICAgIGlmIChpZHMubGVuZ3RoID4gMCkge1xuICAgICAgcXVlcnkuX2lkID0ge1xuICAgICAgICAkaW46IGlkc1xuICAgICAgfTtcbiAgICAgIG1vZHMuJHNldC5hZnRlciA9IG5vdztcbiAgICB9XG4gICAgbG9nT2JqID0gW107XG4gICAgaWYgKG9wdGlvbnMuZm9yY2UpIHtcbiAgICAgIG1vZHMuJHNldC5kZXBlbmRzID0gW107XG4gICAgICBsID0gdGhpcy5fbG9nTWVzc2FnZS5mb3JjZWQoKTtcbiAgICAgIGlmIChsKSB7XG4gICAgICAgIGxvZ09iai5wdXNoKGwpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBxdWVyeS5kZXBlbmRzID0ge1xuICAgICAgICAkc2l6ZTogMFxuICAgICAgfTtcbiAgICB9XG4gICAgbCA9IHRoaXMuX2xvZ01lc3NhZ2UucmVhZGllZCgpO1xuICAgIGlmIChsKSB7XG4gICAgICBsb2dPYmoucHVzaChsKTtcbiAgICB9XG4gICAgaWYgKGxvZ09iai5sZW5ndGggPiAwKSB7XG4gICAgICBtb2RzLiRwdXNoID0ge1xuICAgICAgICBsb2c6IHtcbiAgICAgICAgICAkZWFjaDogbG9nT2JqXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIG51bSA9IHRoaXMudXBkYXRlKHF1ZXJ5LCBtb2RzLCB7XG4gICAgICBtdWx0aTogdHJ1ZVxuICAgIH0pO1xuICAgIGlmIChudW0gPiAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuX0REUE1ldGhvZF9qb2JDYW5jZWwgPSBmdW5jdGlvbihpZHMsIG9wdGlvbnMpIHtcbiAgICB2YXIgY2FuY2VsSWRzLCBkZXBzQ2FuY2VsbGVkLCBsb2dPYmosIG1vZHMsIG51bSwgdGltZTtcbiAgICBjaGVjayhpZHMsIE1hdGNoLk9uZU9mKE1hdGNoLldoZXJlKF92YWxpZElkKSwgW01hdGNoLldoZXJlKF92YWxpZElkKV0pKTtcbiAgICBjaGVjayhvcHRpb25zLCBNYXRjaC5PcHRpb25hbCh7XG4gICAgICBhbnRlY2VkZW50czogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbiksXG4gICAgICBkZXBlbmRlbnRzOiBNYXRjaC5PcHRpb25hbChCb29sZWFuKVxuICAgIH0pKTtcbiAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmFudGVjZWRlbnRzID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMuYW50ZWNlZGVudHMgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZGVwZW5kZW50cyA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLmRlcGVuZGVudHMgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoX3ZhbGlkSWQoaWRzKSkge1xuICAgICAgaWRzID0gW2lkc107XG4gICAgfVxuICAgIGlmIChpZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgIG1vZHMgPSB7XG4gICAgICAkc2V0OiB7XG4gICAgICAgIHN0YXR1czogXCJjYW5jZWxsZWRcIixcbiAgICAgICAgcnVuSWQ6IG51bGwsXG4gICAgICAgIHByb2dyZXNzOiB7XG4gICAgICAgICAgY29tcGxldGVkOiAwLFxuICAgICAgICAgIHRvdGFsOiAxLFxuICAgICAgICAgIHBlcmNlbnQ6IDBcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlZDogdGltZVxuICAgICAgfVxuICAgIH07XG4gICAgaWYgKGxvZ09iaiA9IHRoaXMuX2xvZ01lc3NhZ2UuY2FuY2VsbGVkKCkpIHtcbiAgICAgIG1vZHMuJHB1c2ggPSB7XG4gICAgICAgIGxvZzogbG9nT2JqXG4gICAgICB9O1xuICAgIH1cbiAgICBudW0gPSB0aGlzLnVwZGF0ZSh7XG4gICAgICBfaWQ6IHtcbiAgICAgICAgJGluOiBpZHNcbiAgICAgIH0sXG4gICAgICBzdGF0dXM6IHtcbiAgICAgICAgJGluOiB0aGlzLmpvYlN0YXR1c0NhbmNlbGxhYmxlXG4gICAgICB9XG4gICAgfSwgbW9kcywge1xuICAgICAgbXVsdGk6IHRydWVcbiAgICB9KTtcbiAgICBjYW5jZWxJZHMgPSB0aGlzLl9pZHNPZkRlcHMoaWRzLCBvcHRpb25zLmFudGVjZWRlbnRzLCBvcHRpb25zLmRlcGVuZGVudHMsIHRoaXMuam9iU3RhdHVzQ2FuY2VsbGFibGUpO1xuICAgIGRlcHNDYW5jZWxsZWQgPSBmYWxzZTtcbiAgICBpZiAoY2FuY2VsSWRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGRlcHNDYW5jZWxsZWQgPSB0aGlzLl9ERFBNZXRob2Rfam9iQ2FuY2VsKGNhbmNlbElkcywgb3B0aW9ucyk7XG4gICAgfVxuICAgIGlmIChudW0gPiAwIHx8IGRlcHNDYW5jZWxsZWQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJqb2JDYW5jZWwgZmFpbGVkXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLl9ERFBNZXRob2Rfam9iUmVzdGFydCA9IGZ1bmN0aW9uKGlkcywgb3B0aW9ucykge1xuICAgIHZhciBkZXBzUmVzdGFydGVkLCBsb2dPYmosIG1vZHMsIG51bSwgcXVlcnksIHJlc3RhcnRJZHMsIHRpbWU7XG4gICAgY2hlY2soaWRzLCBNYXRjaC5PbmVPZihNYXRjaC5XaGVyZShfdmFsaWRJZCksIFtNYXRjaC5XaGVyZShfdmFsaWRJZCldKSk7XG4gICAgY2hlY2sob3B0aW9ucywgTWF0Y2guT3B0aW9uYWwoe1xuICAgICAgcmV0cmllczogTWF0Y2guT3B0aW9uYWwoTWF0Y2guV2hlcmUoX3ZhbGlkSW50R1RFWmVybykpLFxuICAgICAgdW50aWw6IE1hdGNoLk9wdGlvbmFsKERhdGUpLFxuICAgICAgYW50ZWNlZGVudHM6IE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pLFxuICAgICAgZGVwZW5kZW50czogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbilcbiAgICB9KSk7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5yZXRyaWVzID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMucmV0cmllcyA9IDE7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLnJldHJpZXMgPiB0aGlzLmZvcmV2ZXIpIHtcbiAgICAgIG9wdGlvbnMucmV0cmllcyA9IHRoaXMuZm9yZXZlcjtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZGVwZW5kZW50cyA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLmRlcGVuZGVudHMgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuYW50ZWNlZGVudHMgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucy5hbnRlY2VkZW50cyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChfdmFsaWRJZChpZHMpKSB7XG4gICAgICBpZHMgPSBbaWRzXTtcbiAgICB9XG4gICAgaWYgKGlkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGltZSA9IG5ldyBEYXRlKCk7XG4gICAgcXVlcnkgPSB7XG4gICAgICBfaWQ6IHtcbiAgICAgICAgJGluOiBpZHNcbiAgICAgIH0sXG4gICAgICBzdGF0dXM6IHtcbiAgICAgICAgJGluOiB0aGlzLmpvYlN0YXR1c1Jlc3RhcnRhYmxlXG4gICAgICB9XG4gICAgfTtcbiAgICBtb2RzID0ge1xuICAgICAgJHNldDoge1xuICAgICAgICBzdGF0dXM6IFwid2FpdGluZ1wiLFxuICAgICAgICBwcm9ncmVzczoge1xuICAgICAgICAgIGNvbXBsZXRlZDogMCxcbiAgICAgICAgICB0b3RhbDogMSxcbiAgICAgICAgICBwZXJjZW50OiAwXG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZWQ6IHRpbWVcbiAgICAgIH0sXG4gICAgICAkaW5jOiB7XG4gICAgICAgIHJldHJpZXM6IG9wdGlvbnMucmV0cmllc1xuICAgICAgfVxuICAgIH07XG4gICAgaWYgKGxvZ09iaiA9IHRoaXMuX2xvZ01lc3NhZ2UucmVzdGFydGVkKCkpIHtcbiAgICAgIG1vZHMuJHB1c2ggPSB7XG4gICAgICAgIGxvZzogbG9nT2JqXG4gICAgICB9O1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy51bnRpbCAhPSBudWxsKSB7XG4gICAgICBtb2RzLiRzZXQucmV0cnlVbnRpbCA9IG9wdGlvbnMudW50aWw7XG4gICAgfVxuICAgIG51bSA9IHRoaXMudXBkYXRlKHF1ZXJ5LCBtb2RzLCB7XG4gICAgICBtdWx0aTogdHJ1ZVxuICAgIH0pO1xuICAgIHJlc3RhcnRJZHMgPSB0aGlzLl9pZHNPZkRlcHMoaWRzLCBvcHRpb25zLmFudGVjZWRlbnRzLCBvcHRpb25zLmRlcGVuZGVudHMsIHRoaXMuam9iU3RhdHVzUmVzdGFydGFibGUpO1xuICAgIGRlcHNSZXN0YXJ0ZWQgPSBmYWxzZTtcbiAgICBpZiAocmVzdGFydElkcy5sZW5ndGggPiAwKSB7XG4gICAgICBkZXBzUmVzdGFydGVkID0gdGhpcy5fRERQTWV0aG9kX2pvYlJlc3RhcnQocmVzdGFydElkcywgb3B0aW9ucyk7XG4gICAgfVxuICAgIGlmIChudW0gPiAwIHx8IGRlcHNSZXN0YXJ0ZWQpIHtcbiAgICAgIHRoaXMuX0REUE1ldGhvZF9qb2JSZWFkeShpZHMpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihcImpvYlJlc3RhcnQgZmFpbGVkXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLl9ERFBNZXRob2Rfam9iU2F2ZSA9IGZ1bmN0aW9uKGRvYywgb3B0aW9ucykge1xuICAgIHZhciBsb2dPYmosIG1vZHMsIG5leHQsIG5leHREYXRlLCBudW0sIHJlZiwgc2NoZWR1bGUsIHRpbWU7XG4gICAgY2hlY2soZG9jLCBfdmFsaWRKb2JEb2MoKSk7XG4gICAgY2hlY2sob3B0aW9ucywgTWF0Y2guT3B0aW9uYWwoe1xuICAgICAgY2FuY2VsUmVwZWF0czogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbilcbiAgICB9KSk7XG4gICAgY2hlY2soZG9jLnN0YXR1cywgTWF0Y2guV2hlcmUoZnVuY3Rpb24odikge1xuICAgICAgcmV0dXJuIE1hdGNoLnRlc3QodiwgU3RyaW5nKSAmJiAodiA9PT0gJ3dhaXRpbmcnIHx8IHYgPT09ICdwYXVzZWQnKTtcbiAgICB9KSk7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5jYW5jZWxSZXBlYXRzID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMuY2FuY2VsUmVwZWF0cyA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAoZG9jLnJlcGVhdHMgPiB0aGlzLmZvcmV2ZXIpIHtcbiAgICAgIGRvYy5yZXBlYXRzID0gdGhpcy5mb3JldmVyO1xuICAgIH1cbiAgICBpZiAoZG9jLnJldHJpZXMgPiB0aGlzLmZvcmV2ZXIpIHtcbiAgICAgIGRvYy5yZXRyaWVzID0gdGhpcy5mb3JldmVyO1xuICAgIH1cbiAgICB0aW1lID0gbmV3IERhdGUoKTtcbiAgICBpZiAoZG9jLmFmdGVyIDwgdGltZSkge1xuICAgICAgZG9jLmFmdGVyID0gdGltZTtcbiAgICB9XG4gICAgaWYgKGRvYy5yZXRyeVVudGlsIDwgdGltZSkge1xuICAgICAgZG9jLnJldHJ5VW50aWwgPSB0aW1lO1xuICAgIH1cbiAgICBpZiAoZG9jLnJlcGVhdFVudGlsIDwgdGltZSkge1xuICAgICAgZG9jLnJlcGVhdFVudGlsID0gdGltZTtcbiAgICB9XG4gICAgaWYgKCh0aGlzLmxhdGVyICE9IG51bGwpICYmIHR5cGVvZiBkb2MucmVwZWF0V2FpdCAhPT0gJ251bWJlcicpIHtcbiAgICAgIHNjaGVkdWxlID0gKHJlZiA9IHRoaXMubGF0ZXIpICE9IG51bGwgPyByZWYuc2NoZWR1bGUoZG9jLnJlcGVhdFdhaXQpIDogdm9pZCAwO1xuICAgICAgaWYgKCEoc2NoZWR1bGUgJiYgKG5leHQgPSBzY2hlZHVsZS5uZXh0KDIsIHNjaGVkdWxlLnByZXYoMSwgZG9jLmFmdGVyKSlbMV0pKSkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJObyB2YWxpZCBhdmFpbGFibGUgbGF0ZXIuanMgdGltZXMgaW4gc2NoZWR1bGUgYWZ0ZXIgXCIgKyBkb2MuYWZ0ZXIpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIG5leHREYXRlID0gbmV3IERhdGUobmV4dCk7XG4gICAgICBpZiAoIShuZXh0RGF0ZSA8PSBkb2MucmVwZWF0VW50aWwpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIk5vIHZhbGlkIGF2YWlsYWJsZSBsYXRlci5qcyB0aW1lcyBpbiBzY2hlZHVsZSBiZWZvcmUgXCIgKyBkb2MucmVwZWF0VW50aWwpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGRvYy5hZnRlciA9IG5leHREYXRlO1xuICAgIH0gZWxzZSBpZiAoKHRoaXMubGF0ZXIgPT0gbnVsbCkgJiYgZG9jLnJlcGVhdFdhaXQgIT09ICdudW1iZXInKSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJMYXRlci5qcyBub3QgbG9hZGVkLi4uXCIpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChkb2MuX2lkKSB7XG4gICAgICBtb2RzID0ge1xuICAgICAgICAkc2V0OiB7XG4gICAgICAgICAgc3RhdHVzOiAnd2FpdGluZycsXG4gICAgICAgICAgZGF0YTogZG9jLmRhdGEsXG4gICAgICAgICAgcmV0cmllczogZG9jLnJldHJpZXMsXG4gICAgICAgICAgcmVwZWF0UmV0cmllczogZG9jLnJlcGVhdFJldHJpZXMgIT0gbnVsbCA/IGRvYy5yZXBlYXRSZXRyaWVzIDogZG9jLnJldHJpZXMgKyBkb2MucmV0cmllZCxcbiAgICAgICAgICByZXRyeVVudGlsOiBkb2MucmV0cnlVbnRpbCxcbiAgICAgICAgICByZXRyeVdhaXQ6IGRvYy5yZXRyeVdhaXQsXG4gICAgICAgICAgcmV0cnlCYWNrb2ZmOiBkb2MucmV0cnlCYWNrb2ZmLFxuICAgICAgICAgIHJlcGVhdHM6IGRvYy5yZXBlYXRzLFxuICAgICAgICAgIHJlcGVhdFVudGlsOiBkb2MucmVwZWF0VW50aWwsXG4gICAgICAgICAgcmVwZWF0V2FpdDogZG9jLnJlcGVhdFdhaXQsXG4gICAgICAgICAgZGVwZW5kczogZG9jLmRlcGVuZHMsXG4gICAgICAgICAgcHJpb3JpdHk6IGRvYy5wcmlvcml0eSxcbiAgICAgICAgICBhZnRlcjogZG9jLmFmdGVyLFxuICAgICAgICAgIHVwZGF0ZWQ6IHRpbWVcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGlmIChsb2dPYmogPSB0aGlzLl9sb2dNZXNzYWdlLnJlc3VibWl0dGVkKCkpIHtcbiAgICAgICAgbW9kcy4kcHVzaCA9IHtcbiAgICAgICAgICBsb2c6IGxvZ09ialxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgbnVtID0gdGhpcy51cGRhdGUoe1xuICAgICAgICBfaWQ6IGRvYy5faWQsXG4gICAgICAgIHN0YXR1czogJ3BhdXNlZCcsXG4gICAgICAgIHJ1bklkOiBudWxsXG4gICAgICB9LCBtb2RzKTtcbiAgICAgIGlmIChudW0gJiYgdGhpcy5fY2hlY2tEZXBzKGRvYywgZmFsc2UpKSB7XG4gICAgICAgIHRoaXMuX0REUE1ldGhvZF9qb2JSZWFkeShkb2MuX2lkKTtcbiAgICAgICAgcmV0dXJuIGRvYy5faWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGRvYy5yZXBlYXRzID09PSB0aGlzLmZvcmV2ZXIgJiYgb3B0aW9ucy5jYW5jZWxSZXBlYXRzKSB7XG4gICAgICAgIHRoaXMuZmluZCh7XG4gICAgICAgICAgdHlwZTogZG9jLnR5cGUsXG4gICAgICAgICAgc3RhdHVzOiB7XG4gICAgICAgICAgICAkaW46IHRoaXMuam9iU3RhdHVzQ2FuY2VsbGFibGVcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0cmFuc2Zvcm06IG51bGxcbiAgICAgICAgfSkuZm9yRWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLl9ERFBNZXRob2Rfam9iQ2FuY2VsKGQuX2lkLCB7fSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkodGhpcykpO1xuICAgICAgfVxuICAgICAgZG9jLmNyZWF0ZWQgPSB0aW1lO1xuICAgICAgZG9jLmxvZy5wdXNoKHRoaXMuX2xvZ01lc3NhZ2Uuc3VibWl0dGVkKCkpO1xuICAgICAgZG9jLl9pZCA9IHRoaXMuaW5zZXJ0KGRvYyk7XG4gICAgICBpZiAoZG9jLl9pZCAmJiB0aGlzLl9jaGVja0RlcHMoZG9jLCBmYWxzZSkpIHtcbiAgICAgICAgdGhpcy5fRERQTWV0aG9kX2pvYlJlYWR5KGRvYy5faWQpO1xuICAgICAgICByZXR1cm4gZG9jLl9pZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuX0REUE1ldGhvZF9qb2JQcm9ncmVzcyA9IGZ1bmN0aW9uKGlkLCBydW5JZCwgY29tcGxldGVkLCB0b3RhbCwgb3B0aW9ucykge1xuICAgIHZhciBqb2IsIG1vZHMsIG51bSwgcHJvZ3Jlc3MsIHRpbWU7XG4gICAgY2hlY2soaWQsIE1hdGNoLldoZXJlKF92YWxpZElkKSk7XG4gICAgY2hlY2socnVuSWQsIE1hdGNoLldoZXJlKF92YWxpZElkKSk7XG4gICAgY2hlY2soY29tcGxldGVkLCBNYXRjaC5XaGVyZShfdmFsaWROdW1HVEVaZXJvKSk7XG4gICAgY2hlY2sodG90YWwsIE1hdGNoLldoZXJlKF92YWxpZE51bUdUWmVybykpO1xuICAgIGNoZWNrKG9wdGlvbnMsIE1hdGNoLk9wdGlvbmFsKHt9KSk7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cbiAgICBpZiAodGhpcy5zdG9wcGVkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcHJvZ3Jlc3MgPSB7XG4gICAgICBjb21wbGV0ZWQ6IGNvbXBsZXRlZCxcbiAgICAgIHRvdGFsOiB0b3RhbCxcbiAgICAgIHBlcmNlbnQ6IDEwMCAqIGNvbXBsZXRlZCAvIHRvdGFsXG4gICAgfTtcbiAgICBjaGVjayhwcm9ncmVzcywgTWF0Y2guV2hlcmUoZnVuY3Rpb24odikge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIHJldHVybiB2LnRvdGFsID49IHYuY29tcGxldGVkICYmICgwIDw9IChyZWYgPSB2LnBlcmNlbnQpICYmIHJlZiA8PSAxMDApO1xuICAgIH0pKTtcbiAgICB0aW1lID0gbmV3IERhdGUoKTtcbiAgICBqb2IgPSB0aGlzLmZpbmRPbmUoe1xuICAgICAgX2lkOiBpZFxuICAgIH0sIHtcbiAgICAgIGZpZWxkczoge1xuICAgICAgICB3b3JrVGltZW91dDogMVxuICAgICAgfVxuICAgIH0pO1xuICAgIG1vZHMgPSB7XG4gICAgICAkc2V0OiB7XG4gICAgICAgIHByb2dyZXNzOiBwcm9ncmVzcyxcbiAgICAgICAgdXBkYXRlZDogdGltZVxuICAgICAgfVxuICAgIH07XG4gICAgaWYgKChqb2IgIT0gbnVsbCA/IGpvYi53b3JrVGltZW91dCA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgbW9kcy4kc2V0LmV4cGlyZXNBZnRlciA9IG5ldyBEYXRlKHRpbWUudmFsdWVPZigpICsgam9iLndvcmtUaW1lb3V0KTtcbiAgICB9XG4gICAgbnVtID0gdGhpcy51cGRhdGUoe1xuICAgICAgX2lkOiBpZCxcbiAgICAgIHJ1bklkOiBydW5JZCxcbiAgICAgIHN0YXR1czogXCJydW5uaW5nXCJcbiAgICB9LCBtb2RzKTtcbiAgICBpZiAobnVtID09PSAxKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFwiam9iUHJvZ3Jlc3MgZmFpbGVkXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLl9ERFBNZXRob2Rfam9iTG9nID0gZnVuY3Rpb24oaWQsIHJ1bklkLCBtZXNzYWdlLCBvcHRpb25zKSB7XG4gICAgdmFyIGpvYiwgbG9nT2JqLCBtb2RzLCBudW0sIHJlZiwgdGltZTtcbiAgICBjaGVjayhpZCwgTWF0Y2guV2hlcmUoX3ZhbGlkSWQpKTtcbiAgICBjaGVjayhydW5JZCwgTWF0Y2guT25lT2YoTWF0Y2guV2hlcmUoX3ZhbGlkSWQpLCBudWxsKSk7XG4gICAgY2hlY2sobWVzc2FnZSwgU3RyaW5nKTtcbiAgICBjaGVjayhvcHRpb25zLCBNYXRjaC5PcHRpb25hbCh7XG4gICAgICBsZXZlbDogTWF0Y2guT3B0aW9uYWwoTWF0Y2guV2hlcmUoX3ZhbGlkTG9nTGV2ZWwpKSxcbiAgICAgIGRhdGE6IE1hdGNoLk9wdGlvbmFsKE9iamVjdClcbiAgICB9KSk7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cbiAgICB0aW1lID0gbmV3IERhdGUoKTtcbiAgICBsb2dPYmogPSB7XG4gICAgICB0aW1lOiB0aW1lLFxuICAgICAgcnVuSWQ6IHJ1bklkLFxuICAgICAgbGV2ZWw6IChyZWYgPSBvcHRpb25zLmxldmVsKSAhPSBudWxsID8gcmVmIDogJ2luZm8nLFxuICAgICAgbWVzc2FnZTogbWVzc2FnZVxuICAgIH07XG4gICAgaWYgKG9wdGlvbnMuZGF0YSAhPSBudWxsKSB7XG4gICAgICBsb2dPYmouZGF0YSA9IG9wdGlvbnMuZGF0YTtcbiAgICB9XG4gICAgam9iID0gdGhpcy5maW5kT25lKHtcbiAgICAgIF9pZDogaWRcbiAgICB9LCB7XG4gICAgICBmaWVsZHM6IHtcbiAgICAgICAgc3RhdHVzOiAxLFxuICAgICAgICB3b3JrVGltZW91dDogMVxuICAgICAgfVxuICAgIH0pO1xuICAgIG1vZHMgPSB7XG4gICAgICAkcHVzaDoge1xuICAgICAgICBsb2c6IGxvZ09ialxuICAgICAgfSxcbiAgICAgICRzZXQ6IHtcbiAgICAgICAgdXBkYXRlZDogdGltZVxuICAgICAgfVxuICAgIH07XG4gICAgaWYgKCgoam9iICE9IG51bGwgPyBqb2Iud29ya1RpbWVvdXQgOiB2b2lkIDApICE9IG51bGwpICYmIGpvYi5zdGF0dXMgPT09ICdydW5uaW5nJykge1xuICAgICAgbW9kcy4kc2V0LmV4cGlyZXNBZnRlciA9IG5ldyBEYXRlKHRpbWUudmFsdWVPZigpICsgam9iLndvcmtUaW1lb3V0KTtcbiAgICB9XG4gICAgbnVtID0gdGhpcy51cGRhdGUoe1xuICAgICAgX2lkOiBpZFxuICAgIH0sIG1vZHMpO1xuICAgIGlmIChudW0gPT09IDEpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJqb2JMb2cgZmFpbGVkXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgSm9iQ29sbGVjdGlvbkJhc2UucHJvdG90eXBlLl9ERFBNZXRob2Rfam9iUmVydW4gPSBmdW5jdGlvbihpZCwgb3B0aW9ucykge1xuICAgIHZhciBkb2M7XG4gICAgY2hlY2soaWQsIE1hdGNoLldoZXJlKF92YWxpZElkKSk7XG4gICAgY2hlY2sob3B0aW9ucywgTWF0Y2guT3B0aW9uYWwoe1xuICAgICAgcmVwZWF0czogTWF0Y2guT3B0aW9uYWwoTWF0Y2guV2hlcmUoX3ZhbGlkSW50R1RFWmVybykpLFxuICAgICAgdW50aWw6IE1hdGNoLk9wdGlvbmFsKERhdGUpLFxuICAgICAgd2FpdDogTWF0Y2guT25lT2YoTWF0Y2guV2hlcmUoX3ZhbGlkSW50R1RFWmVybyksIE1hdGNoLldoZXJlKF92YWxpZExhdGVySlNPYmopKVxuICAgIH0pKTtcbiAgICBkb2MgPSB0aGlzLmZpbmRPbmUoe1xuICAgICAgX2lkOiBpZCxcbiAgICAgIHN0YXR1czogXCJjb21wbGV0ZWRcIlxuICAgIH0sIHtcbiAgICAgIGZpZWxkczoge1xuICAgICAgICByZXN1bHQ6IDAsXG4gICAgICAgIGZhaWx1cmVzOiAwLFxuICAgICAgICBsb2c6IDAsXG4gICAgICAgIHByb2dyZXNzOiAwLFxuICAgICAgICB1cGRhdGVkOiAwLFxuICAgICAgICBhZnRlcjogMCxcbiAgICAgICAgc3RhdHVzOiAwXG4gICAgICB9LFxuICAgICAgdHJhbnNmb3JtOiBudWxsXG4gICAgfSk7XG4gICAgaWYgKGRvYyAhPSBudWxsKSB7XG4gICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLnJlcGVhdHMgPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zLnJlcGVhdHMgPSAwO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMucmVwZWF0cyA+IHRoaXMuZm9yZXZlcikge1xuICAgICAgICBvcHRpb25zLnJlcGVhdHMgPSB0aGlzLmZvcmV2ZXI7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy51bnRpbCA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMudW50aWwgPSBkb2MucmVwZWF0VW50aWw7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy53YWl0ID09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucy53YWl0ID0gMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9yZXJ1bl9qb2IoZG9jLCBvcHRpb25zLnJlcGVhdHMsIG9wdGlvbnMud2FpdCwgb3B0aW9ucy51bnRpbCk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICBKb2JDb2xsZWN0aW9uQmFzZS5wcm90b3R5cGUuX0REUE1ldGhvZF9qb2JEb25lID0gZnVuY3Rpb24oaWQsIHJ1bklkLCByZXN1bHQsIG9wdGlvbnMpIHtcbiAgICB2YXIgYWZ0ZXIsIGQsIGRvYywgaWRzLCBqb2JJZCwgbG9nT2JqLCBtb2RzLCBuLCBuZXh0LCBudW0sIHJlZiwgdGltZSwgd2FpdDtcbiAgICBjaGVjayhpZCwgTWF0Y2guV2hlcmUoX3ZhbGlkSWQpKTtcbiAgICBjaGVjayhydW5JZCwgTWF0Y2guV2hlcmUoX3ZhbGlkSWQpKTtcbiAgICBjaGVjayhyZXN1bHQsIE9iamVjdCk7XG4gICAgY2hlY2sob3B0aW9ucywgTWF0Y2guT3B0aW9uYWwoe1xuICAgICAgcmVwZWF0SWQ6IE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pLFxuICAgICAgZGVsYXlEZXBzOiBNYXRjaC5PcHRpb25hbChNYXRjaC5XaGVyZShfdmFsaWRJbnRHVEVaZXJvKSlcbiAgICB9KSk7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgcmVwZWF0SWQ6IGZhbHNlXG4gICAgICB9O1xuICAgIH1cbiAgICB0aW1lID0gbmV3IERhdGUoKTtcbiAgICBkb2MgPSB0aGlzLmZpbmRPbmUoe1xuICAgICAgX2lkOiBpZCxcbiAgICAgIHJ1bklkOiBydW5JZCxcbiAgICAgIHN0YXR1czogXCJydW5uaW5nXCJcbiAgICB9LCB7XG4gICAgICBmaWVsZHM6IHtcbiAgICAgICAgbG9nOiAwLFxuICAgICAgICBmYWlsdXJlczogMCxcbiAgICAgICAgdXBkYXRlZDogMCxcbiAgICAgICAgYWZ0ZXI6IDAsXG4gICAgICAgIHN0YXR1czogMFxuICAgICAgfSxcbiAgICAgIHRyYW5zZm9ybTogbnVsbFxuICAgIH0pO1xuICAgIGlmIChkb2MgPT0gbnVsbCkge1xuICAgICAgaWYgKCF0aGlzLmlzU2ltdWxhdGlvbikge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJSdW5uaW5nIGpvYiBub3QgZm91bmRcIiwgaWQsIHJ1bklkKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbW9kcyA9IHtcbiAgICAgICRzZXQ6IHtcbiAgICAgICAgc3RhdHVzOiBcImNvbXBsZXRlZFwiLFxuICAgICAgICByZXN1bHQ6IHJlc3VsdCxcbiAgICAgICAgcHJvZ3Jlc3M6IHtcbiAgICAgICAgICBjb21wbGV0ZWQ6IGRvYy5wcm9ncmVzcy50b3RhbCB8fCAxLFxuICAgICAgICAgIHRvdGFsOiBkb2MucHJvZ3Jlc3MudG90YWwgfHwgMSxcbiAgICAgICAgICBwZXJjZW50OiAxMDBcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlZDogdGltZVxuICAgICAgfVxuICAgIH07XG4gICAgaWYgKGxvZ09iaiA9IHRoaXMuX2xvZ01lc3NhZ2UuY29tcGxldGVkKHJ1bklkKSkge1xuICAgICAgbW9kcy4kcHVzaCA9IHtcbiAgICAgICAgbG9nOiBsb2dPYmpcbiAgICAgIH07XG4gICAgfVxuICAgIG51bSA9IHRoaXMudXBkYXRlKHtcbiAgICAgIF9pZDogaWQsXG4gICAgICBydW5JZDogcnVuSWQsXG4gICAgICBzdGF0dXM6IFwicnVubmluZ1wiXG4gICAgfSwgbW9kcyk7XG4gICAgaWYgKG51bSA9PT0gMSkge1xuICAgICAgaWYgKGRvYy5yZXBlYXRzID4gMCkge1xuICAgICAgICBpZiAodHlwZW9mIGRvYy5yZXBlYXRXYWl0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGlmIChkb2MucmVwZWF0VW50aWwgLSBkb2MucmVwZWF0V2FpdCA+PSB0aW1lKSB7XG4gICAgICAgICAgICBqb2JJZCA9IHRoaXMuX3JlcnVuX2pvYihkb2MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXh0ID0gKHJlZiA9IHRoaXMubGF0ZXIpICE9IG51bGwgPyByZWYuc2NoZWR1bGUoZG9jLnJlcGVhdFdhaXQpLm5leHQoMikgOiB2b2lkIDA7XG4gICAgICAgICAgaWYgKG5leHQgJiYgbmV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBkID0gbmV3IERhdGUobmV4dFswXSk7XG4gICAgICAgICAgICBpZiAoKGQgLSB0aW1lID4gNTAwKSB8fCAobmV4dC5sZW5ndGggPiAxKSkge1xuICAgICAgICAgICAgICBpZiAoZCAtIHRpbWUgPD0gNTAwKSB7XG4gICAgICAgICAgICAgICAgZCA9IG5ldyBEYXRlKG5leHRbMV0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHdhaXQgPSBkIC0gdGltZTtcbiAgICAgICAgICAgICAgaWYgKGRvYy5yZXBlYXRVbnRpbCAtIHdhaXQgPj0gdGltZSkge1xuICAgICAgICAgICAgICAgIGpvYklkID0gdGhpcy5fcmVydW5fam9iKGRvYywgZG9jLnJlcGVhdHMgLSAxLCB3YWl0KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWRzID0gdGhpcy5maW5kKHtcbiAgICAgICAgZGVwZW5kczoge1xuICAgICAgICAgICRhbGw6IFtpZF1cbiAgICAgICAgfVxuICAgICAgfSwge1xuICAgICAgICB0cmFuc2Zvcm06IG51bGwsXG4gICAgICAgIGZpZWxkczoge1xuICAgICAgICAgIF9pZDogMVxuICAgICAgICB9XG4gICAgICB9KS5mZXRjaCgpLm1hcCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gZC5faWQ7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBpZiAoaWRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbW9kcyA9IHtcbiAgICAgICAgICAkcHVsbDoge1xuICAgICAgICAgICAgZGVwZW5kczogaWRcbiAgICAgICAgICB9LFxuICAgICAgICAgICRwdXNoOiB7XG4gICAgICAgICAgICByZXNvbHZlZDogaWRcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGlmIChvcHRpb25zLmRlbGF5RGVwcyAhPSBudWxsKSB7XG4gICAgICAgICAgYWZ0ZXIgPSBuZXcgRGF0ZSh0aW1lLnZhbHVlT2YoKSArIG9wdGlvbnMuZGVsYXlEZXBzKTtcbiAgICAgICAgICBtb2RzLiRtYXggPSB7XG4gICAgICAgICAgICBhZnRlcjogYWZ0ZXJcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChsb2dPYmogPSB0aGlzLl9sb2dNZXNzYWdlLnJlc29sdmVkKGlkLCBydW5JZCkpIHtcbiAgICAgICAgICBtb2RzLiRwdXNoLmxvZyA9IGxvZ09iajtcbiAgICAgICAgfVxuICAgICAgICBuID0gdGhpcy51cGRhdGUoe1xuICAgICAgICAgIF9pZDoge1xuICAgICAgICAgICAgJGluOiBpZHNcbiAgICAgICAgICB9XG4gICAgICAgIH0sIG1vZHMsIHtcbiAgICAgICAgICBtdWx0aTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG4gIT09IGlkcy5sZW5ndGgpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJOb3QgYWxsIGRlcGVuZGVudCBqb2JzIHdlcmUgcmVzb2x2ZWQgXCIgKyBpZHMubGVuZ3RoICsgXCIgPiBcIiArIG4pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX0REUE1ldGhvZF9qb2JSZWFkeShpZHMpO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMucmVwZWF0SWQgJiYgKGpvYklkICE9IG51bGwpKSB7XG4gICAgICAgIHJldHVybiBqb2JJZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJqb2JEb25lIGZhaWxlZFwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIEpvYkNvbGxlY3Rpb25CYXNlLnByb3RvdHlwZS5fRERQTWV0aG9kX2pvYkZhaWwgPSBmdW5jdGlvbihpZCwgcnVuSWQsIGVyciwgb3B0aW9ucykge1xuICAgIHZhciBhZnRlciwgZG9jLCBsb2dPYmosIG1vZHMsIG5ld1N0YXR1cywgbnVtLCB0aW1lO1xuICAgIGNoZWNrKGlkLCBNYXRjaC5XaGVyZShfdmFsaWRJZCkpO1xuICAgIGNoZWNrKHJ1bklkLCBNYXRjaC5XaGVyZShfdmFsaWRJZCkpO1xuICAgIGNoZWNrKGVyciwgT2JqZWN0KTtcbiAgICBjaGVjayhvcHRpb25zLCBNYXRjaC5PcHRpb25hbCh7XG4gICAgICBmYXRhbDogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbilcbiAgICB9KSk7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5mYXRhbCA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLmZhdGFsID0gZmFsc2U7XG4gICAgfVxuICAgIHRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgIGRvYyA9IHRoaXMuZmluZE9uZSh7XG4gICAgICBfaWQ6IGlkLFxuICAgICAgcnVuSWQ6IHJ1bklkLFxuICAgICAgc3RhdHVzOiBcInJ1bm5pbmdcIlxuICAgIH0sIHtcbiAgICAgIGZpZWxkczoge1xuICAgICAgICBsb2c6IDAsXG4gICAgICAgIGZhaWx1cmVzOiAwLFxuICAgICAgICBwcm9ncmVzczogMCxcbiAgICAgICAgdXBkYXRlZDogMCxcbiAgICAgICAgYWZ0ZXI6IDAsXG4gICAgICAgIHJ1bklkOiAwLFxuICAgICAgICBzdGF0dXM6IDBcbiAgICAgIH0sXG4gICAgICB0cmFuc2Zvcm06IG51bGxcbiAgICB9KTtcbiAgICBpZiAoZG9jID09IG51bGwpIHtcbiAgICAgIGlmICghdGhpcy5pc1NpbXVsYXRpb24pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiUnVubmluZyBqb2Igbm90IGZvdW5kXCIsIGlkLCBydW5JZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGFmdGVyID0gKGZ1bmN0aW9uKCkge1xuICAgICAgc3dpdGNoIChkb2MucmV0cnlCYWNrb2ZmKSB7XG4gICAgICAgIGNhc2UgJ2V4cG9uZW50aWFsJzpcbiAgICAgICAgICByZXR1cm4gbmV3IERhdGUodGltZS52YWx1ZU9mKCkgKyBkb2MucmV0cnlXYWl0ICogTWF0aC5wb3coMiwgZG9jLnJldHJpZWQgLSAxKSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRpbWUudmFsdWVPZigpICsgZG9jLnJldHJ5V2FpdCk7XG4gICAgICB9XG4gICAgfSkoKTtcbiAgICBuZXdTdGF0dXMgPSAoIW9wdGlvbnMuZmF0YWwgJiYgZG9jLnJldHJpZXMgPiAwICYmIGRvYy5yZXRyeVVudGlsID49IGFmdGVyKSA/IFwid2FpdGluZ1wiIDogXCJmYWlsZWRcIjtcbiAgICBlcnIucnVuSWQgPSBydW5JZDtcbiAgICBtb2RzID0ge1xuICAgICAgJHNldDoge1xuICAgICAgICBzdGF0dXM6IG5ld1N0YXR1cyxcbiAgICAgICAgcnVuSWQ6IG51bGwsXG4gICAgICAgIGFmdGVyOiBhZnRlcixcbiAgICAgICAgdXBkYXRlZDogdGltZVxuICAgICAgfSxcbiAgICAgICRwdXNoOiB7XG4gICAgICAgIGZhaWx1cmVzOiBlcnJcbiAgICAgIH1cbiAgICB9O1xuICAgIGlmIChsb2dPYmogPSB0aGlzLl9sb2dNZXNzYWdlLmZhaWxlZChydW5JZCwgbmV3U3RhdHVzID09PSAnZmFpbGVkJywgZXJyKSkge1xuICAgICAgbW9kcy4kcHVzaC5sb2cgPSBsb2dPYmo7XG4gICAgfVxuICAgIG51bSA9IHRoaXMudXBkYXRlKHtcbiAgICAgIF9pZDogaWQsXG4gICAgICBydW5JZDogcnVuSWQsXG4gICAgICBzdGF0dXM6IFwicnVubmluZ1wiXG4gICAgfSwgbW9kcyk7XG4gICAgaWYgKG5ld1N0YXR1cyA9PT0gXCJmYWlsZWRcIiAmJiBudW0gPT09IDEpIHtcbiAgICAgIHRoaXMuZmluZCh7XG4gICAgICAgIGRlcGVuZHM6IHtcbiAgICAgICAgICAkYWxsOiBbaWRdXG4gICAgICAgIH1cbiAgICAgIH0sIHtcbiAgICAgICAgdHJhbnNmb3JtOiBudWxsXG4gICAgICB9KS5mb3JFYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5fRERQTWV0aG9kX2pvYkNhbmNlbChkLl9pZCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfVxuICAgIGlmIChudW0gPT09IDEpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJqb2JGYWlsIGZhaWxlZFwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIHJldHVybiBKb2JDb2xsZWN0aW9uQmFzZTtcblxufSkoTW9uZ28uQ29sbGVjdGlvbik7XG5cbnNoYXJlLkpvYkNvbGxlY3Rpb25CYXNlID0gSm9iQ29sbGVjdGlvbkJhc2U7XG4iLCIjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4jICAgICBDb3B5cmlnaHQgKEMpIDIwMTQtMjAxNyBieSBWYXVnaG4gSXZlcnNvblxuIyAgICAgam9iLWNvbGxlY3Rpb24gaXMgZnJlZSBzb2Z0d2FyZSByZWxlYXNlZCB1bmRlciB0aGUgTUlUL1gxMSBsaWNlbnNlLlxuIyAgICAgU2VlIGluY2x1ZGVkIExJQ0VOU0UgZmlsZSBmb3IgZGV0YWlscy5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuaWYgTWV0ZW9yLmlzU2VydmVyXG5cbiAgZXZlbnRFbWl0dGVyID0gTnBtLnJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxuXG4gIHVzZXJIZWxwZXIgPSAodXNlciwgY29ubmVjdGlvbikgLT5cbiAgICByZXQgPSB1c2VyID8gXCJbVU5BVVRIRU5USUNBVEVEXVwiXG4gICAgdW5sZXNzIGNvbm5lY3Rpb25cbiAgICAgIHJldCA9IFwiW1NFUlZFUl1cIlxuICAgIHJldFxuXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyMgam9iLWNvbGxlY3Rpb24gc2VydmVyIGNsYXNzXG5cbiAgY2xhc3MgSm9iQ29sbGVjdGlvbiBleHRlbmRzIHNoYXJlLkpvYkNvbGxlY3Rpb25CYXNlXG5cbiAgICBjb25zdHJ1Y3RvcjogKHJvb3QgPSAncXVldWUnLCBvcHRpb25zID0ge30pIC0+XG4gICAgICB1bmxlc3MgQCBpbnN0YW5jZW9mIEpvYkNvbGxlY3Rpb25cbiAgICAgICAgcmV0dXJuIG5ldyBKb2JDb2xsZWN0aW9uKHJvb3QsIG9wdGlvbnMpXG5cbiAgICAgICMgQ2FsbCBzdXBlcidzIGNvbnN0cnVjdG9yXG4gICAgICBzdXBlciByb290LCBvcHRpb25zXG5cbiAgICAgIEBldmVudHMgPSBuZXcgZXZlbnRFbWl0dGVyKClcblxuICAgICAgQF9lcnJvckxpc3RlbmVyID0gQGV2ZW50cy5vbiAnZXJyb3InLCBAX29uRXJyb3JcblxuICAgICAgIyBBZGQgZXZlbnRzIGZvciBhbGwgaW5kaXZpZHVhbCBzdWNjZXNzZnVsIEREUCBtZXRob2RzXG4gICAgICBAX21ldGhvZEVycm9yRGlzcGF0Y2ggPSBAZXZlbnRzLm9uICdlcnJvcicsIChtc2cpID0+XG4gICAgICAgIEBldmVudHMuZW1pdCBtc2cubWV0aG9kLCBtc2dcblxuICAgICAgQF9jYWxsTGlzdGVuZXIgPSBAZXZlbnRzLm9uICdjYWxsJywgQF9vbkNhbGxcblxuICAgICAgIyBBZGQgZXZlbnRzIGZvciBhbGwgaW5kaXZpZHVhbCBzdWNjZXNzZnVsIEREUCBtZXRob2RzXG4gICAgICBAX21ldGhvZEV2ZW50RGlzcGF0Y2ggPSBAZXZlbnRzLm9uICdjYWxsJywgKG1zZykgPT5cbiAgICAgICAgQGV2ZW50cy5lbWl0IG1zZy5tZXRob2QsIG1zZ1xuXG4gICAgICBAc3RvcHBlZCA9IHRydWVcblxuICAgICAgIyBObyBjbGllbnQgbXV0YXRvcnMgYWxsb3dlZFxuICAgICAgc2hhcmUuSm9iQ29sbGVjdGlvbkJhc2UuX19zdXBlcl9fLmRlbnkuYmluZChAKVxuICAgICAgICB1cGRhdGU6ICgpID0+IHRydWVcbiAgICAgICAgaW5zZXJ0OiAoKSA9PiB0cnVlXG4gICAgICAgIHJlbW92ZTogKCkgPT4gdHJ1ZVxuXG4gICAgICBAcHJvbW90ZSgpXG5cbiAgICAgIEBsb2dTdHJlYW0gPSBudWxsXG5cbiAgICAgIEBhbGxvd3MgPSB7fVxuICAgICAgQGRlbnlzID0ge31cblxuICAgICAgIyBJbml0aWFsaXplIGFsbG93L2RlbnkgbGlzdHMgZm9yIHBlcm1pc3Npb24gbGV2ZWxzIGFuZCBkZHAgbWV0aG9kc1xuICAgICAgZm9yIGxldmVsIGluIEBkZHBQZXJtaXNzaW9uTGV2ZWxzLmNvbmNhdCBAZGRwTWV0aG9kc1xuICAgICAgICBAYWxsb3dzW2xldmVsXSA9IFtdXG4gICAgICAgIEBkZW55c1tsZXZlbF0gPSBbXVxuXG4gICAgICAjIElmIGEgY29ubmVjdGlvbiBvcHRpb24gaXMgZ2l2ZW4sIHRoZW4gdGhpcyBKb2JDb2xsZWN0aW9uIGlzIGFjdHVhbGx5IGhvc3RlZFxuICAgICAgIyByZW1vdGVseSwgc28gZG9uJ3QgZXN0YWJsaXNoIGxvY2FsIGFuZCByZW1vdGVseSBjYWxsYWJsZSBzZXJ2ZXIgbWV0aG9kcyBpbiB0aGF0IGNhc2VcbiAgICAgIHVubGVzcyBvcHRpb25zLmNvbm5lY3Rpb24/XG4gICAgICAgICMgRGVmYXVsdCBpbmRleGVzLCBvbmx5IHdoZW4gbm90IHJlbW90ZWx5IGNvbm5lY3RlZCFcbiAgICAgICAgQF9lbnN1cmVJbmRleCB7IHR5cGUgOiAxLCBzdGF0dXMgOiAxIH1cbiAgICAgICAgQF9lbnN1cmVJbmRleCB7IHByaW9yaXR5IDogMSwgcmV0cnlVbnRpbCA6IDEsIGFmdGVyIDogMSB9XG4gICAgICAgIEBpc1NpbXVsYXRpb24gPSBmYWxzZVxuICAgICAgICBsb2NhbE1ldGhvZHMgPSBAX2dlbmVyYXRlTWV0aG9kcygpXG4gICAgICAgIEBfbG9jYWxTZXJ2ZXJNZXRob2RzID89IHt9XG4gICAgICAgIEBfbG9jYWxTZXJ2ZXJNZXRob2RzW21ldGhvZE5hbWVdID0gbWV0aG9kRnVuY3Rpb24gZm9yIG1ldGhvZE5hbWUsIG1ldGhvZEZ1bmN0aW9uIG9mIGxvY2FsTWV0aG9kc1xuICAgICAgICBmb28gPSB0aGlzXG4gICAgICAgIEBfZGRwX2FwcGx5ID0gKG5hbWUsIHBhcmFtcywgY2IpID0+XG4gICAgICAgICAgaWYgY2I/XG4gICAgICAgICAgICBNZXRlb3Iuc2V0VGltZW91dCAoKCkgPT5cbiAgICAgICAgICAgICAgZXJyID0gbnVsbFxuICAgICAgICAgICAgICByZXMgPSBudWxsXG4gICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIHJlcyA9IEBfbG9jYWxTZXJ2ZXJNZXRob2RzW25hbWVdLmFwcGx5KHRoaXMsIHBhcmFtcylcbiAgICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICAgIGVyciA9IGVcbiAgICAgICAgICAgICAgY2IgZXJyLCByZXMpLCAwXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQF9sb2NhbFNlcnZlck1ldGhvZHNbbmFtZV0uYXBwbHkodGhpcywgcGFyYW1zKVxuXG4gICAgICAgIEpvYi5fc2V0RERQQXBwbHkgQF9kZHBfYXBwbHksIHJvb3RcblxuICAgICAgICBNZXRlb3IubWV0aG9kcyBsb2NhbE1ldGhvZHNcblxuICAgIF9vbkVycm9yOiAobXNnKSA9PlxuICAgICAgdXNlciA9IHVzZXJIZWxwZXIgbXNnLnVzZXJJZCwgbXNnLmNvbm5lY3Rpb25cbiAgICAgIEBfdG9Mb2cgdXNlciwgbXNnLm1ldGhvZCwgXCIje21zZy5lcnJvcn1cIlxuXG4gICAgX29uQ2FsbDogKG1zZykgPT5cbiAgICAgIHVzZXIgPSB1c2VySGVscGVyIG1zZy51c2VySWQsIG1zZy5jb25uZWN0aW9uXG4gICAgICBAX3RvTG9nIHVzZXIsIG1zZy5tZXRob2QsIFwicGFyYW1zOiBcIiArIEpTT04uc3RyaW5naWZ5KG1zZy5wYXJhbXMpXG4gICAgICBAX3RvTG9nIHVzZXIsIG1zZy5tZXRob2QsIFwicmV0dXJuZWQ6IFwiICsgSlNPTi5zdHJpbmdpZnkobXNnLnJldHVyblZhbClcblxuICAgIF90b0xvZzogKHVzZXJJZCwgbWV0aG9kLCBtZXNzYWdlKSA9PlxuICAgICAgQGxvZ1N0cmVhbT8ud3JpdGUgXCIje25ldyBEYXRlKCl9LCAje3VzZXJJZH0sICN7bWV0aG9kfSwgI3ttZXNzYWdlfVxcblwiXG4gICAgICAjIHByb2Nlc3Muc3Rkb3V0LndyaXRlIFwiI3tuZXcgRGF0ZSgpfSwgI3t1c2VySWR9LCAje21ldGhvZH0sICN7bWVzc2FnZX1cXG5cIlxuXG4gICAgX2VtaXQ6IChtZXRob2QsIGNvbm5lY3Rpb24sIHVzZXJJZCwgZXJyLCByZXQsIHBhcmFtcy4uLikgPT5cbiAgICAgIGlmIGVyclxuICAgICAgICBAZXZlbnRzLmVtaXQgJ2Vycm9yJyxcbiAgICAgICAgICBlcnJvcjogZXJyXG4gICAgICAgICAgbWV0aG9kOiBtZXRob2RcbiAgICAgICAgICBjb25uZWN0aW9uOiBjb25uZWN0aW9uXG4gICAgICAgICAgdXNlcklkOiB1c2VySWRcbiAgICAgICAgICBwYXJhbXM6IHBhcmFtc1xuICAgICAgICAgIHJldHVyblZhbDogbnVsbFxuICAgICAgZWxzZVxuICAgICAgICBAZXZlbnRzLmVtaXQgJ2NhbGwnLFxuICAgICAgICAgIGVycm9yOiBudWxsXG4gICAgICAgICAgbWV0aG9kOiBtZXRob2RcbiAgICAgICAgICBjb25uZWN0aW9uOiBjb25uZWN0aW9uXG4gICAgICAgICAgdXNlcklkOiB1c2VySWRcbiAgICAgICAgICBwYXJhbXM6IHBhcmFtc1xuICAgICAgICAgIHJldHVyblZhbDogcmV0XG5cbiAgICBfbWV0aG9kV3JhcHBlcjogKG1ldGhvZCwgZnVuYykgLT5cbiAgICAgIHNlbGYgPSB0aGlzXG4gICAgICBteVR5cGVvZiA9ICh2YWwpIC0+XG4gICAgICAgIHR5cGUgPSB0eXBlb2YgdmFsXG4gICAgICAgIHR5cGUgPSAnYXJyYXknIGlmIHR5cGUgaXMgJ29iamVjdCcgYW5kIHR5cGUgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICByZXR1cm4gdHlwZVxuICAgICAgcGVybWl0dGVkID0gKHVzZXJJZCwgcGFyYW1zKSA9PlxuICAgICAgICBwZXJmb3JtVGVzdCA9ICh0ZXN0cykgPT5cbiAgICAgICAgICByZXN1bHQgPSBmYWxzZVxuICAgICAgICAgIGZvciB0ZXN0IGluIHRlc3RzIHdoZW4gcmVzdWx0IGlzIGZhbHNlXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgb3Igc3dpdGNoIG15VHlwZW9mKHRlc3QpXG4gICAgICAgICAgICAgIHdoZW4gJ2FycmF5JyB0aGVuIHVzZXJJZCBpbiB0ZXN0XG4gICAgICAgICAgICAgIHdoZW4gJ2Z1bmN0aW9uJyB0aGVuIHRlc3QodXNlcklkLCBtZXRob2QsIHBhcmFtcylcbiAgICAgICAgICAgICAgZWxzZSBmYWxzZVxuICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgcGVyZm9ybUFsbFRlc3RzID0gKGFsbFRlc3RzKSA9PlxuICAgICAgICAgIHJlc3VsdCA9IGZhbHNlXG4gICAgICAgICAgZm9yIHQgaW4gQGRkcE1ldGhvZFBlcm1pc3Npb25zW21ldGhvZF0gd2hlbiByZXN1bHQgaXMgZmFsc2VcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCBvciBwZXJmb3JtVGVzdChhbGxUZXN0c1t0XSlcbiAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIHJldHVybiBub3QgcGVyZm9ybUFsbFRlc3RzKEBkZW55cykgYW5kIHBlcmZvcm1BbGxUZXN0cyhAYWxsb3dzKVxuICAgICAgIyBSZXR1cm4gdGhlIHdyYXBwZXIgZnVuY3Rpb24gdGhhdCB0aGUgTWV0ZW9yIG1ldGhvZCB3aWxsIGFjdHVhbGx5IGludm9rZVxuICAgICAgcmV0dXJuIChwYXJhbXMuLi4pIC0+XG4gICAgICAgIHRyeVxuICAgICAgICAgIHVubGVzcyB0aGlzLmNvbm5lY3Rpb24gYW5kIG5vdCBwZXJtaXR0ZWQodGhpcy51c2VySWQsIHBhcmFtcylcbiAgICAgICAgICAgIHJldHZhbCA9IGZ1bmMocGFyYW1zLi4uKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVyciA9IG5ldyBNZXRlb3IuRXJyb3IgNDAzLCBcIk1ldGhvZCBub3QgYXV0aG9yaXplZFwiLCBcIkF1dGhlbnRpY2F0ZWQgdXNlciBpcyBub3QgcGVybWl0dGVkIHRvIGludm9rZSB0aGlzIG1ldGhvZC5cIlxuICAgICAgICAgICAgdGhyb3cgZXJyXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgIHNlbGYuX2VtaXQgbWV0aG9kLCB0aGlzLmNvbm5lY3Rpb24sIHRoaXMudXNlcklkLCBlcnJcbiAgICAgICAgICB0aHJvdyBlcnJcbiAgICAgICAgc2VsZi5fZW1pdCBtZXRob2QsIHRoaXMuY29ubmVjdGlvbiwgdGhpcy51c2VySWQsIG51bGwsIHJldHZhbCwgcGFyYW1zLi4uXG4gICAgICAgIHJldHVybiByZXR2YWxcblxuICAgIHNldExvZ1N0cmVhbTogKHdyaXRlU3RyZWFtID0gbnVsbCkgLT5cbiAgICAgIGlmIEBsb2dTdHJlYW1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwibG9nU3RyZWFtIG1heSBvbmx5IGJlIHNldCBvbmNlIHBlciBqb2ItY29sbGVjdGlvbiBzdGFydHVwL3NodXRkb3duIGN5Y2xlXCJcbiAgICAgIEBsb2dTdHJlYW0gPSB3cml0ZVN0cmVhbVxuICAgICAgdW5sZXNzIG5vdCBAbG9nU3RyZWFtPyBvclxuICAgICAgICAgICAgIEBsb2dTdHJlYW0ud3JpdGU/IGFuZFxuICAgICAgICAgICAgIHR5cGVvZiBAbG9nU3RyZWFtLndyaXRlIGlzICdmdW5jdGlvbicgYW5kXG4gICAgICAgICAgICAgQGxvZ1N0cmVhbS5lbmQ/IGFuZFxuICAgICAgICAgICAgIHR5cGVvZiBAbG9nU3RyZWFtLmVuZCBpcyAnZnVuY3Rpb24nXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcImxvZ1N0cmVhbSBtdXN0IGJlIGEgdmFsaWQgd3JpdGFibGUgbm9kZS5qcyBTdHJlYW1cIlxuXG4gICAgIyBSZWdpc3RlciBhcHBsaWNhdGlvbiBhbGxvdyBydWxlc1xuICAgIGFsbG93OiAoYWxsb3dPcHRpb25zKSAtPlxuICAgICAgQGFsbG93c1t0eXBlXS5wdXNoKGZ1bmMpIGZvciB0eXBlLCBmdW5jIG9mIGFsbG93T3B0aW9ucyB3aGVuIHR5cGUgb2YgQGFsbG93c1xuXG4gICAgIyBSZWdpc3RlciBhcHBsaWNhdGlvbiBkZW55IHJ1bGVzXG4gICAgZGVueTogKGRlbnlPcHRpb25zKSAtPlxuICAgICAgQGRlbnlzW3R5cGVdLnB1c2goZnVuYykgZm9yIHR5cGUsIGZ1bmMgb2YgZGVueU9wdGlvbnMgd2hlbiB0eXBlIG9mIEBkZW55c1xuXG4gICAgIyBIb29rIGZ1bmN0aW9uIHRvIHNhbml0aXplIGRvY3VtZW50cyBiZWZvcmUgdmFsaWRhdGluZyB0aGVtIGluIGdldFdvcmsoKSBhbmQgZ2V0Sm9iKClcbiAgICBzY3J1YjogKGpvYikgLT5cbiAgICAgIGpvYlxuXG4gICAgcHJvbW90ZTogKG1pbGxpc2Vjb25kcyA9IDE1KjEwMDApIC0+XG4gICAgICBpZiB0eXBlb2YgbWlsbGlzZWNvbmRzIGlzICdudW1iZXInIGFuZCBtaWxsaXNlY29uZHMgPiAwXG4gICAgICAgIGlmIEBpbnRlcnZhbFxuICAgICAgICAgIE1ldGVvci5jbGVhckludGVydmFsIEBpbnRlcnZhbFxuICAgICAgICBAX3Byb21vdGVfam9icygpXG4gICAgICAgIEBpbnRlcnZhbCA9IE1ldGVvci5zZXRJbnRlcnZhbCBAX3Byb21vdGVfam9icy5iaW5kKEApLCBtaWxsaXNlY29uZHNcbiAgICAgIGVsc2VcbiAgICAgICAgY29uc29sZS53YXJuIFwiam9iQ29sbGVjdGlvbi5wcm9tb3RlOiBpbnZhbGlkIHRpbWVvdXQ6ICN7QHJvb3R9LCAje21pbGxpc2Vjb25kc31cIlxuXG4gICAgX3Byb21vdGVfam9iczogKGlkcyA9IFtdKSAtPlxuICAgICAgaWYgQHN0b3BwZWRcbiAgICAgICAgcmV0dXJuXG4gICAgICAjIFRoaXMgbG9va3MgZm9yIHpvbWJpZSBydW5uaW5nIGpvYnMgYW5kIGF1dG9mYWlscyB0aGVtXG4gICAgICBAZmluZCh7c3RhdHVzOiAncnVubmluZycsIGV4cGlyZXNBZnRlcjogeyAkbHQ6IG5ldyBEYXRlKCkgfX0pXG4gICAgICAgIC5mb3JFYWNoIChqb2IpID0+XG4gICAgICAgICAgbmV3IEpvYihAcm9vdCwgam9iKS5mYWlsKFwiRmFpbGVkIGZvciBleGNlZWRpbmcgd29ya2VyIHNldCB3b3JrVGltZW91dFwiKTtcbiAgICAgICMgQ2hhbmdlIGpvYnMgZnJvbSB3YWl0aW5nIHRvIHJlYWR5IHdoZW4gdGhlaXIgdGltZSBoYXMgY29tZVxuICAgICAgIyBhbmQgZGVwZW5kZW5jaWVzIGhhdmUgYmVlbiBzYXRpc2ZpZWRcbiAgICAgIEByZWFkeUpvYnMoKVxuIiwidmFyIGV2ZW50RW1pdHRlciwgdXNlckhlbHBlciwgICAgICAgICAgICAgICBcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH0sXG4gIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5LFxuICBzbGljZSA9IFtdLnNsaWNlLFxuICBpbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH07XG5cbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgZXZlbnRFbWl0dGVyID0gTnBtLnJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbiAgdXNlckhlbHBlciA9IGZ1bmN0aW9uKHVzZXIsIGNvbm5lY3Rpb24pIHtcbiAgICB2YXIgcmV0O1xuICAgIHJldCA9IHVzZXIgIT0gbnVsbCA/IHVzZXIgOiBcIltVTkFVVEhFTlRJQ0FURURdXCI7XG4gICAgaWYgKCFjb25uZWN0aW9uKSB7XG4gICAgICByZXQgPSBcIltTRVJWRVJdXCI7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH07XG4gIEpvYkNvbGxlY3Rpb24gPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICAgIGV4dGVuZChKb2JDb2xsZWN0aW9uLCBzdXBlckNsYXNzKTtcblxuICAgIGZ1bmN0aW9uIEpvYkNvbGxlY3Rpb24ocm9vdCwgb3B0aW9ucykge1xuICAgICAgdmFyIGZvbywgaSwgbGVuLCBsZXZlbCwgbG9jYWxNZXRob2RzLCBtZXRob2RGdW5jdGlvbiwgbWV0aG9kTmFtZSwgcmVmO1xuICAgICAgaWYgKHJvb3QgPT0gbnVsbCkge1xuICAgICAgICByb290ID0gJ3F1ZXVlJztcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgfVxuICAgICAgdGhpcy5fZW1pdCA9IGJpbmQodGhpcy5fZW1pdCwgdGhpcyk7XG4gICAgICB0aGlzLl90b0xvZyA9IGJpbmQodGhpcy5fdG9Mb2csIHRoaXMpO1xuICAgICAgdGhpcy5fb25DYWxsID0gYmluZCh0aGlzLl9vbkNhbGwsIHRoaXMpO1xuICAgICAgdGhpcy5fb25FcnJvciA9IGJpbmQodGhpcy5fb25FcnJvciwgdGhpcyk7XG4gICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgSm9iQ29sbGVjdGlvbikpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBKb2JDb2xsZWN0aW9uKHJvb3QsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgSm9iQ29sbGVjdGlvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLCByb290LCBvcHRpb25zKTtcbiAgICAgIHRoaXMuZXZlbnRzID0gbmV3IGV2ZW50RW1pdHRlcigpO1xuICAgICAgdGhpcy5fZXJyb3JMaXN0ZW5lciA9IHRoaXMuZXZlbnRzLm9uKCdlcnJvcicsIHRoaXMuX29uRXJyb3IpO1xuICAgICAgdGhpcy5fbWV0aG9kRXJyb3JEaXNwYXRjaCA9IHRoaXMuZXZlbnRzLm9uKCdlcnJvcicsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24obXNnKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmV2ZW50cy5lbWl0KG1zZy5tZXRob2QsIG1zZyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICB0aGlzLl9jYWxsTGlzdGVuZXIgPSB0aGlzLmV2ZW50cy5vbignY2FsbCcsIHRoaXMuX29uQ2FsbCk7XG4gICAgICB0aGlzLl9tZXRob2RFdmVudERpc3BhdGNoID0gdGhpcy5ldmVudHMub24oJ2NhbGwnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1zZykge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5ldmVudHMuZW1pdChtc2cubWV0aG9kLCBtc2cpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgICAgIHNoYXJlLkpvYkNvbGxlY3Rpb25CYXNlLl9fc3VwZXJfXy5kZW55LmJpbmQodGhpcykoe1xuICAgICAgICB1cGRhdGU6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pKHRoaXMpLFxuICAgICAgICBpbnNlcnQ6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pKHRoaXMpLFxuICAgICAgICByZW1vdmU6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pKHRoaXMpXG4gICAgICB9KTtcbiAgICAgIHRoaXMucHJvbW90ZSgpO1xuICAgICAgdGhpcy5sb2dTdHJlYW0gPSBudWxsO1xuICAgICAgdGhpcy5hbGxvd3MgPSB7fTtcbiAgICAgIHRoaXMuZGVueXMgPSB7fTtcbiAgICAgIHJlZiA9IHRoaXMuZGRwUGVybWlzc2lvbkxldmVscy5jb25jYXQodGhpcy5kZHBNZXRob2RzKTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBsZXZlbCA9IHJlZltpXTtcbiAgICAgICAgdGhpcy5hbGxvd3NbbGV2ZWxdID0gW107XG4gICAgICAgIHRoaXMuZGVueXNbbGV2ZWxdID0gW107XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5jb25uZWN0aW9uID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fZW5zdXJlSW5kZXgoe1xuICAgICAgICAgIHR5cGU6IDEsXG4gICAgICAgICAgc3RhdHVzOiAxXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9lbnN1cmVJbmRleCh7XG4gICAgICAgICAgcHJpb3JpdHk6IDEsXG4gICAgICAgICAgcmV0cnlVbnRpbDogMSxcbiAgICAgICAgICBhZnRlcjogMVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5pc1NpbXVsYXRpb24gPSBmYWxzZTtcbiAgICAgICAgbG9jYWxNZXRob2RzID0gdGhpcy5fZ2VuZXJhdGVNZXRob2RzKCk7XG4gICAgICAgIGlmICh0aGlzLl9sb2NhbFNlcnZlck1ldGhvZHMgPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuX2xvY2FsU2VydmVyTWV0aG9kcyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGZvciAobWV0aG9kTmFtZSBpbiBsb2NhbE1ldGhvZHMpIHtcbiAgICAgICAgICBtZXRob2RGdW5jdGlvbiA9IGxvY2FsTWV0aG9kc1ttZXRob2ROYW1lXTtcbiAgICAgICAgICB0aGlzLl9sb2NhbFNlcnZlck1ldGhvZHNbbWV0aG9kTmFtZV0gPSBtZXRob2RGdW5jdGlvbjtcbiAgICAgICAgfVxuICAgICAgICBmb28gPSB0aGlzO1xuICAgICAgICB0aGlzLl9kZHBfYXBwbHkgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24obmFtZSwgcGFyYW1zLCBjYikge1xuICAgICAgICAgICAgaWYgKGNiICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIE1ldGVvci5zZXRUaW1lb3V0KChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgZSwgZXJyLCByZXM7XG4gICAgICAgICAgICAgICAgZXJyID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICByZXMgPSBfdGhpcy5fbG9jYWxTZXJ2ZXJNZXRob2RzW25hbWVdLmFwcGx5KF90aGlzLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICBlID0gZXJyb3I7XG4gICAgICAgICAgICAgICAgICBlcnIgPSBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gY2IoZXJyLCByZXMpO1xuICAgICAgICAgICAgICB9KSwgMCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuX2xvY2FsU2VydmVyTWV0aG9kc1tuYW1lXS5hcHBseShfdGhpcywgcGFyYW1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KSh0aGlzKTtcbiAgICAgICAgSm9iLl9zZXRERFBBcHBseSh0aGlzLl9kZHBfYXBwbHksIHJvb3QpO1xuICAgICAgICBNZXRlb3IubWV0aG9kcyhsb2NhbE1ldGhvZHMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIEpvYkNvbGxlY3Rpb24ucHJvdG90eXBlLl9vbkVycm9yID0gZnVuY3Rpb24obXNnKSB7XG4gICAgICB2YXIgdXNlcjtcbiAgICAgIHVzZXIgPSB1c2VySGVscGVyKG1zZy51c2VySWQsIG1zZy5jb25uZWN0aW9uKTtcbiAgICAgIHJldHVybiB0aGlzLl90b0xvZyh1c2VyLCBtc2cubWV0aG9kLCBcIlwiICsgbXNnLmVycm9yKTtcbiAgICB9O1xuXG4gICAgSm9iQ29sbGVjdGlvbi5wcm90b3R5cGUuX29uQ2FsbCA9IGZ1bmN0aW9uKG1zZykge1xuICAgICAgdmFyIHVzZXI7XG4gICAgICB1c2VyID0gdXNlckhlbHBlcihtc2cudXNlcklkLCBtc2cuY29ubmVjdGlvbik7XG4gICAgICB0aGlzLl90b0xvZyh1c2VyLCBtc2cubWV0aG9kLCBcInBhcmFtczogXCIgKyBKU09OLnN0cmluZ2lmeShtc2cucGFyYW1zKSk7XG4gICAgICByZXR1cm4gdGhpcy5fdG9Mb2codXNlciwgbXNnLm1ldGhvZCwgXCJyZXR1cm5lZDogXCIgKyBKU09OLnN0cmluZ2lmeShtc2cucmV0dXJuVmFsKSk7XG4gICAgfTtcblxuICAgIEpvYkNvbGxlY3Rpb24ucHJvdG90eXBlLl90b0xvZyA9IGZ1bmN0aW9uKHVzZXJJZCwgbWV0aG9kLCBtZXNzYWdlKSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgcmV0dXJuIChyZWYgPSB0aGlzLmxvZ1N0cmVhbSkgIT0gbnVsbCA/IHJlZi53cml0ZSgobmV3IERhdGUoKSkgKyBcIiwgXCIgKyB1c2VySWQgKyBcIiwgXCIgKyBtZXRob2QgKyBcIiwgXCIgKyBtZXNzYWdlICsgXCJcXG5cIikgOiB2b2lkIDA7XG4gICAgfTtcblxuICAgIEpvYkNvbGxlY3Rpb24ucHJvdG90eXBlLl9lbWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY29ubmVjdGlvbiwgZXJyLCBtZXRob2QsIHBhcmFtcywgcmV0LCB1c2VySWQ7XG4gICAgICBtZXRob2QgPSBhcmd1bWVudHNbMF0sIGNvbm5lY3Rpb24gPSBhcmd1bWVudHNbMV0sIHVzZXJJZCA9IGFyZ3VtZW50c1syXSwgZXJyID0gYXJndW1lbnRzWzNdLCByZXQgPSBhcmd1bWVudHNbNF0sIHBhcmFtcyA9IDYgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCA1KSA6IFtdO1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZXR1cm4gdGhpcy5ldmVudHMuZW1pdCgnZXJyb3InLCB7XG4gICAgICAgICAgZXJyb3I6IGVycixcbiAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICBjb25uZWN0aW9uOiBjb25uZWN0aW9uLFxuICAgICAgICAgIHVzZXJJZDogdXNlcklkLFxuICAgICAgICAgIHBhcmFtczogcGFyYW1zLFxuICAgICAgICAgIHJldHVyblZhbDogbnVsbFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50cy5lbWl0KCdjYWxsJywge1xuICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgIGNvbm5lY3Rpb246IGNvbm5lY3Rpb24sXG4gICAgICAgICAgdXNlcklkOiB1c2VySWQsXG4gICAgICAgICAgcGFyYW1zOiBwYXJhbXMsXG4gICAgICAgICAgcmV0dXJuVmFsOiByZXRcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIEpvYkNvbGxlY3Rpb24ucHJvdG90eXBlLl9tZXRob2RXcmFwcGVyID0gZnVuY3Rpb24obWV0aG9kLCBmdW5jKSB7XG4gICAgICB2YXIgbXlUeXBlb2YsIHBlcm1pdHRlZCwgc2VsZjtcbiAgICAgIHNlbGYgPSB0aGlzO1xuICAgICAgbXlUeXBlb2YgPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgdmFyIHR5cGU7XG4gICAgICAgIHR5cGUgPSB0eXBlb2YgdmFsO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ29iamVjdCcgJiYgdHlwZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgdHlwZSA9ICdhcnJheSc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHR5cGU7XG4gICAgICB9O1xuICAgICAgcGVybWl0dGVkID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih1c2VySWQsIHBhcmFtcykge1xuICAgICAgICAgIHZhciBwZXJmb3JtQWxsVGVzdHMsIHBlcmZvcm1UZXN0O1xuICAgICAgICAgIHBlcmZvcm1UZXN0ID0gZnVuY3Rpb24odGVzdHMpIHtcbiAgICAgICAgICAgIHZhciBpLCBsZW4sIHJlc3VsdCwgdGVzdDtcbiAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChpID0gMCwgbGVuID0gdGVzdHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgdGVzdCA9IHRlc3RzW2ldO1xuICAgICAgICAgICAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCB8fCAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICBzd2l0Y2ggKG15VHlwZW9mKHRlc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5kZXhPZi5jYWxsKHRlc3QsIHVzZXJJZCkgPj0gMDtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0KHVzZXJJZCwgbWV0aG9kLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH07XG4gICAgICAgICAgcGVyZm9ybUFsbFRlc3RzID0gZnVuY3Rpb24oYWxsVGVzdHMpIHtcbiAgICAgICAgICAgIHZhciBpLCBsZW4sIHJlZiwgcmVzdWx0LCB0O1xuICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgICByZWYgPSBfdGhpcy5kZHBNZXRob2RQZXJtaXNzaW9uc1ttZXRob2RdO1xuICAgICAgICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgIHQgPSByZWZbaV07XG4gICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0IHx8IHBlcmZvcm1UZXN0KGFsbFRlc3RzW3RdKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldHVybiAhcGVyZm9ybUFsbFRlc3RzKF90aGlzLmRlbnlzKSAmJiBwZXJmb3JtQWxsVGVzdHMoX3RoaXMuYWxsb3dzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZXJyLCBwYXJhbXMsIHJldHZhbDtcbiAgICAgICAgcGFyYW1zID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCEodGhpcy5jb25uZWN0aW9uICYmICFwZXJtaXR0ZWQodGhpcy51c2VySWQsIHBhcmFtcykpKSB7XG4gICAgICAgICAgICByZXR2YWwgPSBmdW5jLmFwcGx5KG51bGwsIHBhcmFtcyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVyciA9IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIk1ldGhvZCBub3QgYXV0aG9yaXplZFwiLCBcIkF1dGhlbnRpY2F0ZWQgdXNlciBpcyBub3QgcGVybWl0dGVkIHRvIGludm9rZSB0aGlzIG1ldGhvZC5cIik7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGVyciA9IGVycm9yO1xuICAgICAgICAgIHNlbGYuX2VtaXQobWV0aG9kLCB0aGlzLmNvbm5lY3Rpb24sIHRoaXMudXNlcklkLCBlcnIpO1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLl9lbWl0LmFwcGx5KHNlbGYsIFttZXRob2QsIHRoaXMuY29ubmVjdGlvbiwgdGhpcy51c2VySWQsIG51bGwsIHJldHZhbF0uY29uY2F0KHNsaWNlLmNhbGwocGFyYW1zKSkpO1xuICAgICAgICByZXR1cm4gcmV0dmFsO1xuICAgICAgfTtcbiAgICB9O1xuXG4gICAgSm9iQ29sbGVjdGlvbi5wcm90b3R5cGUuc2V0TG9nU3RyZWFtID0gZnVuY3Rpb24od3JpdGVTdHJlYW0pIHtcbiAgICAgIGlmICh3cml0ZVN0cmVhbSA9PSBudWxsKSB7XG4gICAgICAgIHdyaXRlU3RyZWFtID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmxvZ1N0cmVhbSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJsb2dTdHJlYW0gbWF5IG9ubHkgYmUgc2V0IG9uY2UgcGVyIGpvYi1jb2xsZWN0aW9uIHN0YXJ0dXAvc2h1dGRvd24gY3ljbGVcIik7XG4gICAgICB9XG4gICAgICB0aGlzLmxvZ1N0cmVhbSA9IHdyaXRlU3RyZWFtO1xuICAgICAgaWYgKCEoKHRoaXMubG9nU3RyZWFtID09IG51bGwpIHx8ICh0aGlzLmxvZ1N0cmVhbS53cml0ZSAhPSBudWxsKSAmJiB0eXBlb2YgdGhpcy5sb2dTdHJlYW0ud3JpdGUgPT09ICdmdW5jdGlvbicgJiYgKHRoaXMubG9nU3RyZWFtLmVuZCAhPSBudWxsKSAmJiB0eXBlb2YgdGhpcy5sb2dTdHJlYW0uZW5kID09PSAnZnVuY3Rpb24nKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJsb2dTdHJlYW0gbXVzdCBiZSBhIHZhbGlkIHdyaXRhYmxlIG5vZGUuanMgU3RyZWFtXCIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBKb2JDb2xsZWN0aW9uLnByb3RvdHlwZS5hbGxvdyA9IGZ1bmN0aW9uKGFsbG93T3B0aW9ucykge1xuICAgICAgdmFyIGZ1bmMsIHJlc3VsdHMsIHR5cGU7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKHR5cGUgaW4gYWxsb3dPcHRpb25zKSB7XG4gICAgICAgIGZ1bmMgPSBhbGxvd09wdGlvbnNbdHlwZV07XG4gICAgICAgIGlmICh0eXBlIGluIHRoaXMuYWxsb3dzKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuYWxsb3dzW3R5cGVdLnB1c2goZnVuYykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgSm9iQ29sbGVjdGlvbi5wcm90b3R5cGUuZGVueSA9IGZ1bmN0aW9uKGRlbnlPcHRpb25zKSB7XG4gICAgICB2YXIgZnVuYywgcmVzdWx0cywgdHlwZTtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAodHlwZSBpbiBkZW55T3B0aW9ucykge1xuICAgICAgICBmdW5jID0gZGVueU9wdGlvbnNbdHlwZV07XG4gICAgICAgIGlmICh0eXBlIGluIHRoaXMuZGVueXMpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5kZW55c1t0eXBlXS5wdXNoKGZ1bmMpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcblxuICAgIEpvYkNvbGxlY3Rpb24ucHJvdG90eXBlLnNjcnViID0gZnVuY3Rpb24oam9iKSB7XG4gICAgICByZXR1cm4gam9iO1xuICAgIH07XG5cbiAgICBKb2JDb2xsZWN0aW9uLnByb3RvdHlwZS5wcm9tb3RlID0gZnVuY3Rpb24obWlsbGlzZWNvbmRzKSB7XG4gICAgICBpZiAobWlsbGlzZWNvbmRzID09IG51bGwpIHtcbiAgICAgICAgbWlsbGlzZWNvbmRzID0gMTUgKiAxMDAwO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBtaWxsaXNlY29uZHMgPT09ICdudW1iZXInICYmIG1pbGxpc2Vjb25kcyA+IDApIHtcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJ2YWwpIHtcbiAgICAgICAgICBNZXRlb3IuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9wcm9tb3RlX2pvYnMoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJ2YWwgPSBNZXRlb3Iuc2V0SW50ZXJ2YWwodGhpcy5fcHJvbW90ZV9qb2JzLmJpbmQodGhpcyksIG1pbGxpc2Vjb25kcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKFwiam9iQ29sbGVjdGlvbi5wcm9tb3RlOiBpbnZhbGlkIHRpbWVvdXQ6IFwiICsgdGhpcy5yb290ICsgXCIsIFwiICsgbWlsbGlzZWNvbmRzKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgSm9iQ29sbGVjdGlvbi5wcm90b3R5cGUuX3Byb21vdGVfam9icyA9IGZ1bmN0aW9uKGlkcykge1xuICAgICAgaWYgKGlkcyA9PSBudWxsKSB7XG4gICAgICAgIGlkcyA9IFtdO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuc3RvcHBlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmZpbmQoe1xuICAgICAgICBzdGF0dXM6ICdydW5uaW5nJyxcbiAgICAgICAgZXhwaXJlc0FmdGVyOiB7XG4gICAgICAgICAgJGx0OiBuZXcgRGF0ZSgpXG4gICAgICAgIH1cbiAgICAgIH0pLmZvckVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihqb2IpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IEpvYihfdGhpcy5yb290LCBqb2IpLmZhaWwoXCJGYWlsZWQgZm9yIGV4Y2VlZGluZyB3b3JrZXIgc2V0IHdvcmtUaW1lb3V0XCIpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMucmVhZHlKb2JzKCk7XG4gICAgfTtcblxuICAgIHJldHVybiBKb2JDb2xsZWN0aW9uO1xuXG4gIH0pKHNoYXJlLkpvYkNvbGxlY3Rpb25CYXNlKTtcbn1cbiJdfQ==
