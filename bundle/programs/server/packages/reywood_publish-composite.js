(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var _ = Package.underscore._;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var enableDebugLogging, publishComposite;

var require = meteorInstall({"node_modules":{"meteor":{"reywood:publish-composite":{"lib":{"publish_composite.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/reywood_publish-composite/lib/publish_composite.js                                                      //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.export({
  enableDebugLogging: () => enableDebugLogging,
  publishComposite: () => publishComposite
});

let _;

module.watch(require("meteor/underscore"), {
  _(v) {
    _ = v;
  }

}, 0);
let Meteor;
module.watch(require("meteor/meteor"), {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Publication;
module.watch(require("./publication"), {
  default(v) {
    Publication = v;
  }

}, 2);
let Subscription;
module.watch(require("./subscription"), {
  default(v) {
    Subscription = v;
  }

}, 3);
let debugLog, enableDebugLogging;
module.watch(require("./logging"), {
  debugLog(v) {
    debugLog = v;
  },

  enableDebugLogging(v) {
    enableDebugLogging = v;
  }

}, 4);

function publishComposite(name, options) {
  return Meteor.publish(name, function publish(...args) {
    const subscription = new Subscription(this);
    const instanceOptions = prepareOptions.call(this, options, args);
    const publications = [];
    instanceOptions.forEach(opt => {
      const pub = new Publication(subscription, opt);
      pub.publish();
      publications.push(pub);
    });
    this.onStop(() => {
      publications.forEach(pub => pub.unpublish());
    });
    debugLog('Meteor.publish', 'ready');
    this.ready();
  });
} // For backwards compatibility


Meteor.publishComposite = publishComposite;

function prepareOptions(options, args) {
  let preparedOptions = options;

  if (typeof preparedOptions === 'function') {
    preparedOptions = preparedOptions.apply(this, args);
  }

  if (!preparedOptions) {
    return [];
  }

  if (!_.isArray(preparedOptions)) {
    preparedOptions = [preparedOptions];
  }

  return preparedOptions;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"doc_ref_counter.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/reywood_publish-composite/lib/doc_ref_counter.js                                                        //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
class DocumentRefCounter {
  constructor(observer) {
    this.heap = {};
    this.observer = observer;
  }

  increment(collectionName, docId) {
    const key = `${collectionName}:${docId.valueOf()}`;

    if (!this.heap[key]) {
      this.heap[key] = 0;
    }

    this.heap[key] += 1;
  }

  decrement(collectionName, docId) {
    const key = `${collectionName}:${docId.valueOf()}`;

    if (this.heap[key]) {
      this.heap[key] -= 1;
      this.observer.onChange(collectionName, docId, this.heap[key]);
    }
  }

}

module.exportDefault(DocumentRefCounter);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"logging.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/reywood_publish-composite/lib/logging.js                                                                //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.export({
  debugLog: () => debugLog,
  enableDebugLogging: () => enableDebugLogging
});

/* eslint-disable no-console */
let debugLoggingEnabled = false;

function debugLog(source, message) {
  if (!debugLoggingEnabled) {
    return;
  }

  let paddedSource = source;

  while (paddedSource.length < 35) {
    paddedSource += ' ';
  }

  console.log(`[${paddedSource}] ${message}`);
}

function enableDebugLogging() {
  debugLoggingEnabled = true;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publication.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/reywood_publish-composite/lib/publication.js                                                            //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
let Meteor;
module.watch(require("meteor/meteor"), {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Match, check;
module.watch(require("meteor/check"), {
  Match(v) {
    Match = v;
  },

  check(v) {
    check = v;
  }

}, 1);

let _;

module.watch(require("meteor/underscore"), {
  _(v) {
    _ = v;
  }

}, 2);
let debugLog;
module.watch(require("./logging"), {
  debugLog(v) {
    debugLog = v;
  }

}, 3);
let PublishedDocumentList;
module.watch(require("./published_document_list"), {
  default(v) {
    PublishedDocumentList = v;
  }

}, 4);

class Publication {
  constructor(subscription, options, args) {
    check(options, {
      find: Function,
      children: Match.Optional([Object]),
      collectionName: Match.Optional(String)
    });
    this.subscription = subscription;
    this.options = options;
    this.args = args || [];
    this.childrenOptions = options.children || [];
    this.publishedDocs = new PublishedDocumentList();
    this.collectionName = options.collectionName;
  }

  publish() {
    this.cursor = this._getCursor();

    if (!this.cursor) {
      return;
    }

    const collectionName = this._getCollectionName(); // Use Meteor.bindEnvironment to make sure the callbacks are run with the same
    // environmentVariables as when publishing the "parent".
    // It's only needed when publish is being recursively run.


    this.observeHandle = this.cursor.observe({
      added: Meteor.bindEnvironment(doc => {
        const alreadyPublished = this.publishedDocs.has(doc._id);

        if (alreadyPublished) {
          debugLog('Publication.observeHandle.added', `${collectionName}:${doc._id} already published`);
          this.publishedDocs.unflagForRemoval(doc._id);

          this._republishChildrenOf(doc);

          this.subscription.changed(collectionName, doc._id, doc);
        } else {
          this.publishedDocs.add(collectionName, doc._id);

          this._publishChildrenOf(doc);

          this.subscription.added(collectionName, doc);
        }
      }),
      changed: Meteor.bindEnvironment(newDoc => {
        debugLog('Publication.observeHandle.changed', `${collectionName}:${newDoc._id}`);

        this._republishChildrenOf(newDoc);
      }),
      removed: doc => {
        debugLog('Publication.observeHandle.removed', `${collectionName}:${doc._id}`);

        this._removeDoc(collectionName, doc._id);
      }
    });
    this.observeChangesHandle = this.cursor.observeChanges({
      changed: (id, fields) => {
        debugLog('Publication.observeChangesHandle.changed', `${collectionName}:${id}`);
        this.subscription.changed(collectionName, id, fields);
      }
    });
  }

  unpublish() {
    debugLog('Publication.unpublish', this._getCollectionName());

    this._stopObservingCursor();

    this._unpublishAllDocuments();
  }

  _republish() {
    this._stopObservingCursor();

    this.publishedDocs.flagAllForRemoval();
    debugLog('Publication._republish', 'run .publish again');
    this.publish();
    debugLog('Publication._republish', 'unpublish docs from old cursor');

    this._removeFlaggedDocs();
  }

  _getCursor() {
    return this.options.find.apply(this.subscription.meteorSub, this.args);
  }

  _getCollectionName() {
    return this.collectionName || this.cursor && this.cursor._getCollectionName();
  }

  _publishChildrenOf(doc) {
    _.each(this.childrenOptions, function createChildPublication(options) {
      const pub = new Publication(this.subscription, options, [doc].concat(this.args));
      this.publishedDocs.addChildPub(doc._id, pub);
      pub.publish();
    }, this);
  }

  _republishChildrenOf(doc) {
    this.publishedDocs.eachChildPub(doc._id, publication => {
      publication.args[0] = doc;

      publication._republish();
    });
  }

  _unpublishAllDocuments() {
    this.publishedDocs.eachDocument(doc => {
      this._removeDoc(doc.collectionName, doc.docId);
    }, this);
  }

  _stopObservingCursor() {
    debugLog('Publication._stopObservingCursor', 'stop observing cursor');

    if (this.observeHandle) {
      this.observeHandle.stop();
      delete this.observeHandle;
    }

    if (this.observeChangesHandle) {
      this.observeChangesHandle.stop();
      delete this.observeChangesHandle;
    }
  }

  _removeFlaggedDocs() {
    this.publishedDocs.eachDocument(doc => {
      if (doc.isFlaggedForRemoval()) {
        this._removeDoc(doc.collectionName, doc.docId);
      }
    }, this);
  }

  _removeDoc(collectionName, docId) {
    this.subscription.removed(collectionName, docId);

    this._unpublishChildrenOf(docId);

    this.publishedDocs.remove(docId);
  }

  _unpublishChildrenOf(docId) {
    debugLog('Publication._unpublishChildrenOf', `unpublishing children of ${this._getCollectionName()}:${docId}`);
    this.publishedDocs.eachChildPub(docId, publication => {
      publication.unpublish();
    });
  }

}

module.exportDefault(Publication);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"subscription.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/reywood_publish-composite/lib/subscription.js                                                           //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
let _;

module.watch(require("meteor/underscore"), {
  _(v) {
    _ = v;
  }

}, 0);
let DocumentRefCounter;
module.watch(require("./doc_ref_counter"), {
  default(v) {
    DocumentRefCounter = v;
  }

}, 1);
let debugLog;
module.watch(require("./logging"), {
  debugLog(v) {
    debugLog = v;
  }

}, 2);

class Subscription {
  constructor(meteorSub) {
    this.meteorSub = meteorSub;
    this.docHash = {};
    this.refCounter = new DocumentRefCounter({
      onChange: (collectionName, docId, refCount) => {
        debugLog('Subscription.refCounter.onChange', `${collectionName}:${docId.valueOf()} ${refCount}`);

        if (refCount <= 0) {
          meteorSub.removed(collectionName, docId);

          this._removeDocHash(collectionName, docId);
        }
      }
    });
  }

  added(collectionName, doc) {
    this.refCounter.increment(collectionName, doc._id);

    if (this._hasDocChanged(collectionName, doc._id, doc)) {
      debugLog('Subscription.added', `${collectionName}:${doc._id}`);
      this.meteorSub.added(collectionName, doc._id, doc);

      this._addDocHash(collectionName, doc);
    }
  }

  changed(collectionName, id, changes) {
    if (this._shouldSendChanges(collectionName, id, changes)) {
      debugLog('Subscription.changed', `${collectionName}:${id}`);
      this.meteorSub.changed(collectionName, id, changes);

      this._updateDocHash(collectionName, id, changes);
    }
  }

  removed(collectionName, id) {
    debugLog('Subscription.removed', `${collectionName}:${id.valueOf()}`);
    this.refCounter.decrement(collectionName, id);
  }

  _addDocHash(collectionName, doc) {
    this.docHash[buildHashKey(collectionName, doc._id)] = doc;
  }

  _updateDocHash(collectionName, id, changes) {
    const key = buildHashKey(collectionName, id);
    const existingDoc = this.docHash[key] || {};
    this.docHash[key] = _.extend(existingDoc, changes);
  }

  _shouldSendChanges(collectionName, id, changes) {
    return this._isDocPublished(collectionName, id) && this._hasDocChanged(collectionName, id, changes);
  }

  _isDocPublished(collectionName, id) {
    const key = buildHashKey(collectionName, id);
    return !!this.docHash[key];
  }

  _hasDocChanged(collectionName, id, doc) {
    const existingDoc = this.docHash[buildHashKey(collectionName, id)];

    if (!existingDoc) {
      return true;
    }

    return _.any(_.keys(doc), key => !_.isEqual(doc[key], existingDoc[key]));
  }

  _removeDocHash(collectionName, id) {
    const key = buildHashKey(collectionName, id);
    delete this.docHash[key];
  }

}

function buildHashKey(collectionName, id) {
  return `${collectionName}::${id.valueOf()}`;
}

module.exportDefault(Subscription);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"published_document.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/reywood_publish-composite/lib/published_document.js                                                     //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
class PublishedDocument {
  constructor(collectionName, docId) {
    this.collectionName = collectionName;
    this.docId = docId;
    this.childPublications = [];
    this._isFlaggedForRemoval = false;
  }

  addChildPub(childPublication) {
    this.childPublications.push(childPublication);
  }

  eachChildPub(callback) {
    this.childPublications.forEach(callback);
  }

  isFlaggedForRemoval() {
    return this._isFlaggedForRemoval;
  }

  unflagForRemoval() {
    this._isFlaggedForRemoval = false;
  }

  flagForRemoval() {
    this._isFlaggedForRemoval = true;
  }

}

module.exportDefault(PublishedDocument);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"published_document_list.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/reywood_publish-composite/lib/published_document_list.js                                                //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
let _;

module.watch(require("meteor/underscore"), {
  _(v) {
    _ = v;
  }

}, 0);
let PublishedDocument;
module.watch(require("./published_document"), {
  default(v) {
    PublishedDocument = v;
  }

}, 1);

class PublishedDocumentList {
  constructor() {
    this.documents = {};
  }

  add(collectionName, docId) {
    const key = valueOfId(docId);

    if (!this.documents[key]) {
      this.documents[key] = new PublishedDocument(collectionName, docId);
    }
  }

  addChildPub(docId, publication) {
    if (!publication) {
      return;
    }

    const key = valueOfId(docId);
    const doc = this.documents[key];

    if (typeof doc === 'undefined') {
      throw new Error(`Doc not found in list: ${key}`);
    }

    this.documents[key].addChildPub(publication);
  }

  get(docId) {
    const key = valueOfId(docId);
    return this.documents[key];
  }

  remove(docId) {
    const key = valueOfId(docId);
    delete this.documents[key];
  }

  has(docId) {
    return !!this.get(docId);
  }

  eachDocument(callback, context) {
    _.each(this.documents, function execCallbackOnDoc(doc) {
      callback.call(this, doc);
    }, context || this);
  }

  eachChildPub(docId, callback) {
    const doc = this.get(docId);

    if (doc) {
      doc.eachChildPub(callback);
    }
  }

  getIds() {
    const docIds = [];
    this.eachDocument(doc => {
      docIds.push(doc.docId);
    });
    return docIds;
  }

  unflagForRemoval(docId) {
    const doc = this.get(docId);

    if (doc) {
      doc.unflagForRemoval();
    }
  }

  flagAllForRemoval() {
    this.eachDocument(doc => {
      doc.flagForRemoval();
    });
  }

}

function valueOfId(docId) {
  if (docId === null) {
    throw new Error('Document ID is null');
  }

  if (typeof docId === 'undefined') {
    throw new Error('Document ID is undefined');
  }

  return docId.valueOf();
}

module.exportDefault(PublishedDocumentList);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
var exports = require("/node_modules/meteor/reywood:publish-composite/lib/publish_composite.js");
require("/node_modules/meteor/reywood:publish-composite/lib/doc_ref_counter.js");
require("/node_modules/meteor/reywood:publish-composite/lib/logging.js");
require("/node_modules/meteor/reywood:publish-composite/lib/publication.js");
require("/node_modules/meteor/reywood:publish-composite/lib/subscription.js");

/* Exports */
Package._define("reywood:publish-composite", exports, {
  enableDebugLogging: enableDebugLogging,
  publishComposite: publishComposite
});

})();

//# sourceURL=meteor://💻app/packages/reywood_publish-composite.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcmV5d29vZDpwdWJsaXNoLWNvbXBvc2l0ZS9saWIvcHVibGlzaF9jb21wb3NpdGUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3JleXdvb2Q6cHVibGlzaC1jb21wb3NpdGUvbGliL2RvY19yZWZfY291bnRlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcmV5d29vZDpwdWJsaXNoLWNvbXBvc2l0ZS9saWIvbG9nZ2luZy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcmV5d29vZDpwdWJsaXNoLWNvbXBvc2l0ZS9saWIvcHVibGljYXRpb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3JleXdvb2Q6cHVibGlzaC1jb21wb3NpdGUvbGliL3N1YnNjcmlwdGlvbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcmV5d29vZDpwdWJsaXNoLWNvbXBvc2l0ZS9saWIvcHVibGlzaGVkX2RvY3VtZW50LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9yZXl3b29kOnB1Ymxpc2gtY29tcG9zaXRlL2xpYi9wdWJsaXNoZWRfZG9jdW1lbnRfbGlzdC5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnQiLCJlbmFibGVEZWJ1Z0xvZ2dpbmciLCJwdWJsaXNoQ29tcG9zaXRlIiwiXyIsIndhdGNoIiwicmVxdWlyZSIsInYiLCJNZXRlb3IiLCJQdWJsaWNhdGlvbiIsImRlZmF1bHQiLCJTdWJzY3JpcHRpb24iLCJkZWJ1Z0xvZyIsIm5hbWUiLCJvcHRpb25zIiwicHVibGlzaCIsImFyZ3MiLCJzdWJzY3JpcHRpb24iLCJpbnN0YW5jZU9wdGlvbnMiLCJwcmVwYXJlT3B0aW9ucyIsImNhbGwiLCJwdWJsaWNhdGlvbnMiLCJmb3JFYWNoIiwib3B0IiwicHViIiwicHVzaCIsIm9uU3RvcCIsInVucHVibGlzaCIsInJlYWR5IiwicHJlcGFyZWRPcHRpb25zIiwiYXBwbHkiLCJpc0FycmF5IiwiRG9jdW1lbnRSZWZDb3VudGVyIiwiY29uc3RydWN0b3IiLCJvYnNlcnZlciIsImhlYXAiLCJpbmNyZW1lbnQiLCJjb2xsZWN0aW9uTmFtZSIsImRvY0lkIiwia2V5IiwidmFsdWVPZiIsImRlY3JlbWVudCIsIm9uQ2hhbmdlIiwiZXhwb3J0RGVmYXVsdCIsImRlYnVnTG9nZ2luZ0VuYWJsZWQiLCJzb3VyY2UiLCJtZXNzYWdlIiwicGFkZGVkU291cmNlIiwibGVuZ3RoIiwiY29uc29sZSIsImxvZyIsIk1hdGNoIiwiY2hlY2siLCJQdWJsaXNoZWREb2N1bWVudExpc3QiLCJmaW5kIiwiRnVuY3Rpb24iLCJjaGlsZHJlbiIsIk9wdGlvbmFsIiwiT2JqZWN0IiwiU3RyaW5nIiwiY2hpbGRyZW5PcHRpb25zIiwicHVibGlzaGVkRG9jcyIsImN1cnNvciIsIl9nZXRDdXJzb3IiLCJfZ2V0Q29sbGVjdGlvbk5hbWUiLCJvYnNlcnZlSGFuZGxlIiwib2JzZXJ2ZSIsImFkZGVkIiwiYmluZEVudmlyb25tZW50IiwiZG9jIiwiYWxyZWFkeVB1Ymxpc2hlZCIsImhhcyIsIl9pZCIsInVuZmxhZ0ZvclJlbW92YWwiLCJfcmVwdWJsaXNoQ2hpbGRyZW5PZiIsImNoYW5nZWQiLCJhZGQiLCJfcHVibGlzaENoaWxkcmVuT2YiLCJuZXdEb2MiLCJyZW1vdmVkIiwiX3JlbW92ZURvYyIsIm9ic2VydmVDaGFuZ2VzSGFuZGxlIiwib2JzZXJ2ZUNoYW5nZXMiLCJpZCIsImZpZWxkcyIsIl9zdG9wT2JzZXJ2aW5nQ3Vyc29yIiwiX3VucHVibGlzaEFsbERvY3VtZW50cyIsIl9yZXB1Ymxpc2giLCJmbGFnQWxsRm9yUmVtb3ZhbCIsIl9yZW1vdmVGbGFnZ2VkRG9jcyIsIm1ldGVvclN1YiIsImVhY2giLCJjcmVhdGVDaGlsZFB1YmxpY2F0aW9uIiwiY29uY2F0IiwiYWRkQ2hpbGRQdWIiLCJlYWNoQ2hpbGRQdWIiLCJwdWJsaWNhdGlvbiIsImVhY2hEb2N1bWVudCIsInN0b3AiLCJpc0ZsYWdnZWRGb3JSZW1vdmFsIiwiX3VucHVibGlzaENoaWxkcmVuT2YiLCJyZW1vdmUiLCJkb2NIYXNoIiwicmVmQ291bnRlciIsInJlZkNvdW50IiwiX3JlbW92ZURvY0hhc2giLCJfaGFzRG9jQ2hhbmdlZCIsIl9hZGREb2NIYXNoIiwiY2hhbmdlcyIsIl9zaG91bGRTZW5kQ2hhbmdlcyIsIl91cGRhdGVEb2NIYXNoIiwiYnVpbGRIYXNoS2V5IiwiZXhpc3RpbmdEb2MiLCJleHRlbmQiLCJfaXNEb2NQdWJsaXNoZWQiLCJhbnkiLCJrZXlzIiwiaXNFcXVhbCIsIlB1Ymxpc2hlZERvY3VtZW50IiwiY2hpbGRQdWJsaWNhdGlvbnMiLCJfaXNGbGFnZ2VkRm9yUmVtb3ZhbCIsImNoaWxkUHVibGljYXRpb24iLCJjYWxsYmFjayIsImZsYWdGb3JSZW1vdmFsIiwiZG9jdW1lbnRzIiwidmFsdWVPZklkIiwiRXJyb3IiLCJnZXQiLCJjb250ZXh0IiwiZXhlY0NhbGxiYWNrT25Eb2MiLCJnZXRJZHMiLCJkb2NJZHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsT0FBT0MsTUFBUCxDQUFjO0FBQUNDLHNCQUFtQixNQUFJQSxrQkFBeEI7QUFBMkNDLG9CQUFpQixNQUFJQTtBQUFoRSxDQUFkOztBQUFpRyxJQUFJQyxDQUFKOztBQUFNSixPQUFPSyxLQUFQLENBQWFDLFFBQVEsbUJBQVIsQ0FBYixFQUEwQztBQUFDRixJQUFFRyxDQUFGLEVBQUk7QUFBQ0gsUUFBRUcsQ0FBRjtBQUFJOztBQUFWLENBQTFDLEVBQXNELENBQXREO0FBQXlELElBQUlDLE1BQUo7QUFBV1IsT0FBT0ssS0FBUCxDQUFhQyxRQUFRLGVBQVIsQ0FBYixFQUFzQztBQUFDRSxTQUFPRCxDQUFQLEVBQVM7QUFBQ0MsYUFBT0QsQ0FBUDtBQUFTOztBQUFwQixDQUF0QyxFQUE0RCxDQUE1RDtBQUErRCxJQUFJRSxXQUFKO0FBQWdCVCxPQUFPSyxLQUFQLENBQWFDLFFBQVEsZUFBUixDQUFiLEVBQXNDO0FBQUNJLFVBQVFI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Q0E4RmVVLHFCQTlGZixFIiwiZmlsZSI6Ii9wYWNrYWdlcy9yZXl3b29kX3B1Ymxpc2gtY29tcG9zaXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgXyB9IGZyb20gJ21ldGVvci91bmRlcnNjb3JlJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG5pbXBvcnQgUHVibGljYXRpb24gZnJvbSAnLi9wdWJsaWNhdGlvbic7XG5pbXBvcnQgU3Vic2NyaXB0aW9uIGZyb20gJy4vc3Vic2NyaXB0aW9uJztcbmltcG9ydCB7IGRlYnVnTG9nLCBlbmFibGVEZWJ1Z0xvZ2dpbmcgfSBmcm9tICcuL2xvZ2dpbmcnO1xuXG5cbmZ1bmN0aW9uIHB1Ymxpc2hDb21wb3NpdGUobmFtZSwgb3B0aW9ucykge1xuICAgIHJldHVybiBNZXRlb3IucHVibGlzaChuYW1lLCBmdW5jdGlvbiBwdWJsaXNoKC4uLmFyZ3MpIHtcbiAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gbmV3IFN1YnNjcmlwdGlvbih0aGlzKTtcbiAgICAgICAgY29uc3QgaW5zdGFuY2VPcHRpb25zID0gcHJlcGFyZU9wdGlvbnMuY2FsbCh0aGlzLCBvcHRpb25zLCBhcmdzKTtcbiAgICAgICAgY29uc3QgcHVibGljYXRpb25zID0gW107XG5cbiAgICAgICAgaW5zdGFuY2VPcHRpb25zLmZvckVhY2goKG9wdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHViID0gbmV3IFB1YmxpY2F0aW9uKHN1YnNjcmlwdGlvbiwgb3B0KTtcbiAgICAgICAgICAgIHB1Yi5wdWJsaXNoKCk7XG4gICAgICAgICAgICBwdWJsaWNhdGlvbnMucHVzaChwdWIpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm9uU3RvcCgoKSA9PiB7XG4gICAgICAgICAgICBwdWJsaWNhdGlvbnMuZm9yRWFjaChwdWIgPT4gcHViLnVucHVibGlzaCgpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGVidWdMb2coJ01ldGVvci5wdWJsaXNoJywgJ3JlYWR5Jyk7XG4gICAgICAgIHRoaXMucmVhZHkoKTtcbiAgICB9KTtcbn1cblxuLy8gRm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG5NZXRlb3IucHVibGlzaENvbXBvc2l0ZSA9IHB1Ymxpc2hDb21wb3NpdGU7XG5cbmZ1bmN0aW9uIHByZXBhcmVPcHRpb25zKG9wdGlvbnMsIGFyZ3MpIHtcbiAgICBsZXQgcHJlcGFyZWRPcHRpb25zID0gb3B0aW9ucztcblxuICAgIGlmICh0eXBlb2YgcHJlcGFyZWRPcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHByZXBhcmVkT3B0aW9ucyA9IHByZXBhcmVkT3B0aW9ucy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG5cbiAgICBpZiAoIXByZXBhcmVkT3B0aW9ucykge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgaWYgKCFfLmlzQXJyYXkocHJlcGFyZWRPcHRpb25zKSkge1xuICAgICAgICBwcmVwYXJlZE9wdGlvbnMgPSBbcHJlcGFyZWRPcHRpb25zXTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJlcGFyZWRPcHRpb25zO1xufVxuXG5cbmV4cG9ydCB7XG4gICAgZW5hYmxlRGVidWdMb2dnaW5nLFxuICAgIHB1Ymxpc2hDb21wb3NpdGUsXG59O1xuIiwiY2xhc3MgRG9jdW1lbnRSZWZDb3VudGVyIHtcbiAgICBjb25zdHJ1Y3RvcihvYnNlcnZlcikge1xuICAgICAgICB0aGlzLmhlYXAgPSB7fTtcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG9ic2VydmVyO1xuICAgIH1cblxuICAgIGluY3JlbWVudChjb2xsZWN0aW9uTmFtZSwgZG9jSWQpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gYCR7Y29sbGVjdGlvbk5hbWV9OiR7ZG9jSWQudmFsdWVPZigpfWA7XG4gICAgICAgIGlmICghdGhpcy5oZWFwW2tleV0pIHtcbiAgICAgICAgICAgIHRoaXMuaGVhcFtrZXldID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhlYXBba2V5XSArPSAxO1xuICAgIH1cblxuICAgIGRlY3JlbWVudChjb2xsZWN0aW9uTmFtZSwgZG9jSWQpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gYCR7Y29sbGVjdGlvbk5hbWV9OiR7ZG9jSWQudmFsdWVPZigpfWA7XG4gICAgICAgIGlmICh0aGlzLmhlYXBba2V5XSkge1xuICAgICAgICAgICAgdGhpcy5oZWFwW2tleV0gLT0gMTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5vbkNoYW5nZShjb2xsZWN0aW9uTmFtZSwgZG9jSWQsIHRoaXMuaGVhcFtrZXldKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRG9jdW1lbnRSZWZDb3VudGVyO1xuIiwiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5sZXQgZGVidWdMb2dnaW5nRW5hYmxlZCA9IGZhbHNlO1xuXG5mdW5jdGlvbiBkZWJ1Z0xvZyhzb3VyY2UsIG1lc3NhZ2UpIHtcbiAgICBpZiAoIWRlYnVnTG9nZ2luZ0VuYWJsZWQpIHsgcmV0dXJuOyB9XG4gICAgbGV0IHBhZGRlZFNvdXJjZSA9IHNvdXJjZTtcbiAgICB3aGlsZSAocGFkZGVkU291cmNlLmxlbmd0aCA8IDM1KSB7IHBhZGRlZFNvdXJjZSArPSAnICc7IH1cbiAgICBjb25zb2xlLmxvZyhgWyR7cGFkZGVkU291cmNlfV0gJHttZXNzYWdlfWApO1xufVxuXG5mdW5jdGlvbiBlbmFibGVEZWJ1Z0xvZ2dpbmcoKSB7XG4gICAgZGVidWdMb2dnaW5nRW5hYmxlZCA9IHRydWU7XG59XG5cbmV4cG9ydCB7XG4gICAgZGVidWdMb2csXG4gICAgZW5hYmxlRGVidWdMb2dnaW5nLFxufTtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgTWF0Y2gsIGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcbmltcG9ydCB7IF8gfSBmcm9tICdtZXRlb3IvdW5kZXJzY29yZSc7XG5cbmltcG9ydCB7IGRlYnVnTG9nIH0gZnJvbSAnLi9sb2dnaW5nJztcbmltcG9ydCBQdWJsaXNoZWREb2N1bWVudExpc3QgZnJvbSAnLi9wdWJsaXNoZWRfZG9jdW1lbnRfbGlzdCc7XG5cblxuY2xhc3MgUHVibGljYXRpb24ge1xuICAgIGNvbnN0cnVjdG9yKHN1YnNjcmlwdGlvbiwgb3B0aW9ucywgYXJncykge1xuICAgICAgICBjaGVjayhvcHRpb25zLCB7XG4gICAgICAgICAgICBmaW5kOiBGdW5jdGlvbixcbiAgICAgICAgICAgIGNoaWxkcmVuOiBNYXRjaC5PcHRpb25hbChbT2JqZWN0XSksXG4gICAgICAgICAgICBjb2xsZWN0aW9uTmFtZTogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb24gPSBzdWJzY3JpcHRpb247XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIHRoaXMuYXJncyA9IGFyZ3MgfHwgW107XG4gICAgICAgIHRoaXMuY2hpbGRyZW5PcHRpb25zID0gb3B0aW9ucy5jaGlsZHJlbiB8fCBbXTtcbiAgICAgICAgdGhpcy5wdWJsaXNoZWREb2NzID0gbmV3IFB1Ymxpc2hlZERvY3VtZW50TGlzdCgpO1xuICAgICAgICB0aGlzLmNvbGxlY3Rpb25OYW1lID0gb3B0aW9ucy5jb2xsZWN0aW9uTmFtZTtcbiAgICB9XG5cbiAgICBwdWJsaXNoKCkge1xuICAgICAgICB0aGlzLmN1cnNvciA9IHRoaXMuX2dldEN1cnNvcigpO1xuICAgICAgICBpZiAoIXRoaXMuY3Vyc29yKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGNvbnN0IGNvbGxlY3Rpb25OYW1lID0gdGhpcy5fZ2V0Q29sbGVjdGlvbk5hbWUoKTtcblxuICAgICAgICAvLyBVc2UgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudCB0byBtYWtlIHN1cmUgdGhlIGNhbGxiYWNrcyBhcmUgcnVuIHdpdGggdGhlIHNhbWVcbiAgICAgICAgLy8gZW52aXJvbm1lbnRWYXJpYWJsZXMgYXMgd2hlbiBwdWJsaXNoaW5nIHRoZSBcInBhcmVudFwiLlxuICAgICAgICAvLyBJdCdzIG9ubHkgbmVlZGVkIHdoZW4gcHVibGlzaCBpcyBiZWluZyByZWN1cnNpdmVseSBydW4uXG4gICAgICAgIHRoaXMub2JzZXJ2ZUhhbmRsZSA9IHRoaXMuY3Vyc29yLm9ic2VydmUoe1xuICAgICAgICAgICAgYWRkZWQ6IE1ldGVvci5iaW5kRW52aXJvbm1lbnQoKGRvYykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFscmVhZHlQdWJsaXNoZWQgPSB0aGlzLnB1Ymxpc2hlZERvY3MuaGFzKGRvYy5faWQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFscmVhZHlQdWJsaXNoZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVidWdMb2coJ1B1YmxpY2F0aW9uLm9ic2VydmVIYW5kbGUuYWRkZWQnLCBgJHtjb2xsZWN0aW9uTmFtZX06JHtkb2MuX2lkfSBhbHJlYWR5IHB1Ymxpc2hlZGApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnB1Ymxpc2hlZERvY3MudW5mbGFnRm9yUmVtb3ZhbChkb2MuX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVwdWJsaXNoQ2hpbGRyZW5PZihkb2MpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbi5jaGFuZ2VkKGNvbGxlY3Rpb25OYW1lLCBkb2MuX2lkLCBkb2MpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHVibGlzaGVkRG9jcy5hZGQoY29sbGVjdGlvbk5hbWUsIGRvYy5faWQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wdWJsaXNoQ2hpbGRyZW5PZihkb2MpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbi5hZGRlZChjb2xsZWN0aW9uTmFtZSwgZG9jKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNoYW5nZWQ6IE1ldGVvci5iaW5kRW52aXJvbm1lbnQoKG5ld0RvYykgPT4ge1xuICAgICAgICAgICAgICAgIGRlYnVnTG9nKCdQdWJsaWNhdGlvbi5vYnNlcnZlSGFuZGxlLmNoYW5nZWQnLCBgJHtjb2xsZWN0aW9uTmFtZX06JHtuZXdEb2MuX2lkfWApO1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlcHVibGlzaENoaWxkcmVuT2YobmV3RG9jKTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgcmVtb3ZlZDogKGRvYykgPT4ge1xuICAgICAgICAgICAgICAgIGRlYnVnTG9nKCdQdWJsaWNhdGlvbi5vYnNlcnZlSGFuZGxlLnJlbW92ZWQnLCBgJHtjb2xsZWN0aW9uTmFtZX06JHtkb2MuX2lkfWApO1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZURvYyhjb2xsZWN0aW9uTmFtZSwgZG9jLl9pZCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm9ic2VydmVDaGFuZ2VzSGFuZGxlID0gdGhpcy5jdXJzb3Iub2JzZXJ2ZUNoYW5nZXMoe1xuICAgICAgICAgICAgY2hhbmdlZDogKGlkLCBmaWVsZHMpID0+IHtcbiAgICAgICAgICAgICAgICBkZWJ1Z0xvZygnUHVibGljYXRpb24ub2JzZXJ2ZUNoYW5nZXNIYW5kbGUuY2hhbmdlZCcsIGAke2NvbGxlY3Rpb25OYW1lfToke2lkfWApO1xuICAgICAgICAgICAgICAgIHRoaXMuc3Vic2NyaXB0aW9uLmNoYW5nZWQoY29sbGVjdGlvbk5hbWUsIGlkLCBmaWVsZHMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdW5wdWJsaXNoKCkge1xuICAgICAgICBkZWJ1Z0xvZygnUHVibGljYXRpb24udW5wdWJsaXNoJywgdGhpcy5fZ2V0Q29sbGVjdGlvbk5hbWUoKSk7XG4gICAgICAgIHRoaXMuX3N0b3BPYnNlcnZpbmdDdXJzb3IoKTtcbiAgICAgICAgdGhpcy5fdW5wdWJsaXNoQWxsRG9jdW1lbnRzKCk7XG4gICAgfVxuXG4gICAgX3JlcHVibGlzaCgpIHtcbiAgICAgICAgdGhpcy5fc3RvcE9ic2VydmluZ0N1cnNvcigpO1xuXG4gICAgICAgIHRoaXMucHVibGlzaGVkRG9jcy5mbGFnQWxsRm9yUmVtb3ZhbCgpO1xuXG4gICAgICAgIGRlYnVnTG9nKCdQdWJsaWNhdGlvbi5fcmVwdWJsaXNoJywgJ3J1biAucHVibGlzaCBhZ2FpbicpO1xuICAgICAgICB0aGlzLnB1Ymxpc2goKTtcblxuICAgICAgICBkZWJ1Z0xvZygnUHVibGljYXRpb24uX3JlcHVibGlzaCcsICd1bnB1Ymxpc2ggZG9jcyBmcm9tIG9sZCBjdXJzb3InKTtcbiAgICAgICAgdGhpcy5fcmVtb3ZlRmxhZ2dlZERvY3MoKTtcbiAgICB9XG5cbiAgICBfZ2V0Q3Vyc29yKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmZpbmQuYXBwbHkodGhpcy5zdWJzY3JpcHRpb24ubWV0ZW9yU3ViLCB0aGlzLmFyZ3MpO1xuICAgIH1cblxuICAgIF9nZXRDb2xsZWN0aW9uTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbk5hbWUgfHwgKHRoaXMuY3Vyc29yICYmIHRoaXMuY3Vyc29yLl9nZXRDb2xsZWN0aW9uTmFtZSgpKTtcbiAgICB9XG5cbiAgICBfcHVibGlzaENoaWxkcmVuT2YoZG9jKSB7XG4gICAgICAgIF8uZWFjaCh0aGlzLmNoaWxkcmVuT3B0aW9ucywgZnVuY3Rpb24gY3JlYXRlQ2hpbGRQdWJsaWNhdGlvbihvcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBwdWIgPSBuZXcgUHVibGljYXRpb24odGhpcy5zdWJzY3JpcHRpb24sIG9wdGlvbnMsIFtkb2NdLmNvbmNhdCh0aGlzLmFyZ3MpKTtcbiAgICAgICAgICAgIHRoaXMucHVibGlzaGVkRG9jcy5hZGRDaGlsZFB1Yihkb2MuX2lkLCBwdWIpO1xuICAgICAgICAgICAgcHViLnB1Ymxpc2goKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfVxuXG4gICAgX3JlcHVibGlzaENoaWxkcmVuT2YoZG9jKSB7XG4gICAgICAgIHRoaXMucHVibGlzaGVkRG9jcy5lYWNoQ2hpbGRQdWIoZG9jLl9pZCwgKHB1YmxpY2F0aW9uKSA9PiB7XG4gICAgICAgICAgICBwdWJsaWNhdGlvbi5hcmdzWzBdID0gZG9jO1xuICAgICAgICAgICAgcHVibGljYXRpb24uX3JlcHVibGlzaCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfdW5wdWJsaXNoQWxsRG9jdW1lbnRzKCkge1xuICAgICAgICB0aGlzLnB1Ymxpc2hlZERvY3MuZWFjaERvY3VtZW50KChkb2MpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZURvYyhkb2MuY29sbGVjdGlvbk5hbWUsIGRvYy5kb2NJZCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH1cblxuICAgIF9zdG9wT2JzZXJ2aW5nQ3Vyc29yKCkge1xuICAgICAgICBkZWJ1Z0xvZygnUHVibGljYXRpb24uX3N0b3BPYnNlcnZpbmdDdXJzb3InLCAnc3RvcCBvYnNlcnZpbmcgY3Vyc29yJyk7XG5cbiAgICAgICAgaWYgKHRoaXMub2JzZXJ2ZUhhbmRsZSkge1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlSGFuZGxlLnN0b3AoKTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm9ic2VydmVIYW5kbGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vYnNlcnZlQ2hhbmdlc0hhbmRsZSkge1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlQ2hhbmdlc0hhbmRsZS5zdG9wKCk7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5vYnNlcnZlQ2hhbmdlc0hhbmRsZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9yZW1vdmVGbGFnZ2VkRG9jcygpIHtcbiAgICAgICAgdGhpcy5wdWJsaXNoZWREb2NzLmVhY2hEb2N1bWVudCgoZG9jKSA9PiB7XG4gICAgICAgICAgICBpZiAoZG9jLmlzRmxhZ2dlZEZvclJlbW92YWwoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZURvYyhkb2MuY29sbGVjdGlvbk5hbWUsIGRvYy5kb2NJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH1cblxuICAgIF9yZW1vdmVEb2MoY29sbGVjdGlvbk5hbWUsIGRvY0lkKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9uLnJlbW92ZWQoY29sbGVjdGlvbk5hbWUsIGRvY0lkKTtcbiAgICAgICAgdGhpcy5fdW5wdWJsaXNoQ2hpbGRyZW5PZihkb2NJZCk7XG4gICAgICAgIHRoaXMucHVibGlzaGVkRG9jcy5yZW1vdmUoZG9jSWQpO1xuICAgIH1cblxuICAgIF91bnB1Ymxpc2hDaGlsZHJlbk9mKGRvY0lkKSB7XG4gICAgICAgIGRlYnVnTG9nKCdQdWJsaWNhdGlvbi5fdW5wdWJsaXNoQ2hpbGRyZW5PZicsIGB1bnB1Ymxpc2hpbmcgY2hpbGRyZW4gb2YgJHt0aGlzLl9nZXRDb2xsZWN0aW9uTmFtZSgpfToke2RvY0lkfWApO1xuXG4gICAgICAgIHRoaXMucHVibGlzaGVkRG9jcy5lYWNoQ2hpbGRQdWIoZG9jSWQsIChwdWJsaWNhdGlvbikgPT4ge1xuICAgICAgICAgICAgcHVibGljYXRpb24udW5wdWJsaXNoKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHVibGljYXRpb247XG4iLCJpbXBvcnQgeyBfIH0gZnJvbSAnbWV0ZW9yL3VuZGVyc2NvcmUnO1xuXG5pbXBvcnQgRG9jdW1lbnRSZWZDb3VudGVyIGZyb20gJy4vZG9jX3JlZl9jb3VudGVyJztcbmltcG9ydCB7IGRlYnVnTG9nIH0gZnJvbSAnLi9sb2dnaW5nJztcblxuXG5jbGFzcyBTdWJzY3JpcHRpb24ge1xuICAgIGNvbnN0cnVjdG9yKG1ldGVvclN1Yikge1xuICAgICAgICB0aGlzLm1ldGVvclN1YiA9IG1ldGVvclN1YjtcbiAgICAgICAgdGhpcy5kb2NIYXNoID0ge307XG4gICAgICAgIHRoaXMucmVmQ291bnRlciA9IG5ldyBEb2N1bWVudFJlZkNvdW50ZXIoe1xuICAgICAgICAgICAgb25DaGFuZ2U6IChjb2xsZWN0aW9uTmFtZSwgZG9jSWQsIHJlZkNvdW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZGVidWdMb2coJ1N1YnNjcmlwdGlvbi5yZWZDb3VudGVyLm9uQ2hhbmdlJywgYCR7Y29sbGVjdGlvbk5hbWV9OiR7ZG9jSWQudmFsdWVPZigpfSAke3JlZkNvdW50fWApO1xuICAgICAgICAgICAgICAgIGlmIChyZWZDb3VudCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGVvclN1Yi5yZW1vdmVkKGNvbGxlY3Rpb25OYW1lLCBkb2NJZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZURvY0hhc2goY29sbGVjdGlvbk5hbWUsIGRvY0lkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRlZChjb2xsZWN0aW9uTmFtZSwgZG9jKSB7XG4gICAgICAgIHRoaXMucmVmQ291bnRlci5pbmNyZW1lbnQoY29sbGVjdGlvbk5hbWUsIGRvYy5faWQpO1xuXG4gICAgICAgIGlmICh0aGlzLl9oYXNEb2NDaGFuZ2VkKGNvbGxlY3Rpb25OYW1lLCBkb2MuX2lkLCBkb2MpKSB7XG4gICAgICAgICAgICBkZWJ1Z0xvZygnU3Vic2NyaXB0aW9uLmFkZGVkJywgYCR7Y29sbGVjdGlvbk5hbWV9OiR7ZG9jLl9pZH1gKTtcbiAgICAgICAgICAgIHRoaXMubWV0ZW9yU3ViLmFkZGVkKGNvbGxlY3Rpb25OYW1lLCBkb2MuX2lkLCBkb2MpO1xuICAgICAgICAgICAgdGhpcy5fYWRkRG9jSGFzaChjb2xsZWN0aW9uTmFtZSwgZG9jKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNoYW5nZWQoY29sbGVjdGlvbk5hbWUsIGlkLCBjaGFuZ2VzKSB7XG4gICAgICAgIGlmICh0aGlzLl9zaG91bGRTZW5kQ2hhbmdlcyhjb2xsZWN0aW9uTmFtZSwgaWQsIGNoYW5nZXMpKSB7XG4gICAgICAgICAgICBkZWJ1Z0xvZygnU3Vic2NyaXB0aW9uLmNoYW5nZWQnLCBgJHtjb2xsZWN0aW9uTmFtZX06JHtpZH1gKTtcbiAgICAgICAgICAgIHRoaXMubWV0ZW9yU3ViLmNoYW5nZWQoY29sbGVjdGlvbk5hbWUsIGlkLCBjaGFuZ2VzKTtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURvY0hhc2goY29sbGVjdGlvbk5hbWUsIGlkLCBjaGFuZ2VzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZWQoY29sbGVjdGlvbk5hbWUsIGlkKSB7XG4gICAgICAgIGRlYnVnTG9nKCdTdWJzY3JpcHRpb24ucmVtb3ZlZCcsIGAke2NvbGxlY3Rpb25OYW1lfToke2lkLnZhbHVlT2YoKX1gKTtcbiAgICAgICAgdGhpcy5yZWZDb3VudGVyLmRlY3JlbWVudChjb2xsZWN0aW9uTmFtZSwgaWQpO1xuICAgIH1cblxuICAgIF9hZGREb2NIYXNoKGNvbGxlY3Rpb25OYW1lLCBkb2MpIHtcbiAgICAgICAgdGhpcy5kb2NIYXNoW2J1aWxkSGFzaEtleShjb2xsZWN0aW9uTmFtZSwgZG9jLl9pZCldID0gZG9jO1xuICAgIH1cblxuICAgIF91cGRhdGVEb2NIYXNoKGNvbGxlY3Rpb25OYW1lLCBpZCwgY2hhbmdlcykge1xuICAgICAgICBjb25zdCBrZXkgPSBidWlsZEhhc2hLZXkoY29sbGVjdGlvbk5hbWUsIGlkKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdEb2MgPSB0aGlzLmRvY0hhc2hba2V5XSB8fCB7fTtcbiAgICAgICAgdGhpcy5kb2NIYXNoW2tleV0gPSBfLmV4dGVuZChleGlzdGluZ0RvYywgY2hhbmdlcyk7XG4gICAgfVxuXG4gICAgX3Nob3VsZFNlbmRDaGFuZ2VzKGNvbGxlY3Rpb25OYW1lLCBpZCwgY2hhbmdlcykge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNEb2NQdWJsaXNoZWQoY29sbGVjdGlvbk5hbWUsIGlkKSAmJlxuICAgICAgICAgICAgdGhpcy5faGFzRG9jQ2hhbmdlZChjb2xsZWN0aW9uTmFtZSwgaWQsIGNoYW5nZXMpO1xuICAgIH1cblxuICAgIF9pc0RvY1B1Ymxpc2hlZChjb2xsZWN0aW9uTmFtZSwgaWQpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gYnVpbGRIYXNoS2V5KGNvbGxlY3Rpb25OYW1lLCBpZCk7XG4gICAgICAgIHJldHVybiAhIXRoaXMuZG9jSGFzaFtrZXldO1xuICAgIH1cblxuICAgIF9oYXNEb2NDaGFuZ2VkKGNvbGxlY3Rpb25OYW1lLCBpZCwgZG9jKSB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nRG9jID0gdGhpcy5kb2NIYXNoW2J1aWxkSGFzaEtleShjb2xsZWN0aW9uTmFtZSwgaWQpXTtcblxuICAgICAgICBpZiAoIWV4aXN0aW5nRG9jKSB7IHJldHVybiB0cnVlOyB9XG5cbiAgICAgICAgcmV0dXJuIF8uYW55KF8ua2V5cyhkb2MpLCBrZXkgPT4gIV8uaXNFcXVhbChkb2Nba2V5XSwgZXhpc3RpbmdEb2Nba2V5XSkpO1xuICAgIH1cblxuICAgIF9yZW1vdmVEb2NIYXNoKGNvbGxlY3Rpb25OYW1lLCBpZCkge1xuICAgICAgICBjb25zdCBrZXkgPSBidWlsZEhhc2hLZXkoY29sbGVjdGlvbk5hbWUsIGlkKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuZG9jSGFzaFtrZXldO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gYnVpbGRIYXNoS2V5KGNvbGxlY3Rpb25OYW1lLCBpZCkge1xuICAgIHJldHVybiBgJHtjb2xsZWN0aW9uTmFtZX06OiR7aWQudmFsdWVPZigpfWA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFN1YnNjcmlwdGlvbjtcbiIsImNsYXNzIFB1Ymxpc2hlZERvY3VtZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihjb2xsZWN0aW9uTmFtZSwgZG9jSWQpIHtcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uTmFtZSA9IGNvbGxlY3Rpb25OYW1lO1xuICAgICAgICB0aGlzLmRvY0lkID0gZG9jSWQ7XG4gICAgICAgIHRoaXMuY2hpbGRQdWJsaWNhdGlvbnMgPSBbXTtcbiAgICAgICAgdGhpcy5faXNGbGFnZ2VkRm9yUmVtb3ZhbCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGFkZENoaWxkUHViKGNoaWxkUHVibGljYXRpb24pIHtcbiAgICAgICAgdGhpcy5jaGlsZFB1YmxpY2F0aW9ucy5wdXNoKGNoaWxkUHVibGljYXRpb24pO1xuICAgIH1cblxuICAgIGVhY2hDaGlsZFB1YihjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmNoaWxkUHVibGljYXRpb25zLmZvckVhY2goY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGlzRmxhZ2dlZEZvclJlbW92YWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc0ZsYWdnZWRGb3JSZW1vdmFsO1xuICAgIH1cblxuICAgIHVuZmxhZ0ZvclJlbW92YWwoKSB7XG4gICAgICAgIHRoaXMuX2lzRmxhZ2dlZEZvclJlbW92YWwgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBmbGFnRm9yUmVtb3ZhbCgpIHtcbiAgICAgICAgdGhpcy5faXNGbGFnZ2VkRm9yUmVtb3ZhbCA9IHRydWU7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQdWJsaXNoZWREb2N1bWVudDtcbiIsImltcG9ydCB7IF8gfSBmcm9tICdtZXRlb3IvdW5kZXJzY29yZSc7XG5cbmltcG9ydCBQdWJsaXNoZWREb2N1bWVudCBmcm9tICcuL3B1Ymxpc2hlZF9kb2N1bWVudCc7XG5cblxuY2xhc3MgUHVibGlzaGVkRG9jdW1lbnRMaXN0IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5kb2N1bWVudHMgPSB7fTtcbiAgICB9XG5cbiAgICBhZGQoY29sbGVjdGlvbk5hbWUsIGRvY0lkKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHZhbHVlT2ZJZChkb2NJZCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmRvY3VtZW50c1trZXldKSB7XG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50c1trZXldID0gbmV3IFB1Ymxpc2hlZERvY3VtZW50KGNvbGxlY3Rpb25OYW1lLCBkb2NJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRDaGlsZFB1Yihkb2NJZCwgcHVibGljYXRpb24pIHtcbiAgICAgICAgaWYgKCFwdWJsaWNhdGlvbikgeyByZXR1cm47IH1cblxuICAgICAgICBjb25zdCBrZXkgPSB2YWx1ZU9mSWQoZG9jSWQpO1xuICAgICAgICBjb25zdCBkb2MgPSB0aGlzLmRvY3VtZW50c1trZXldO1xuXG4gICAgICAgIGlmICh0eXBlb2YgZG9jID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEb2Mgbm90IGZvdW5kIGluIGxpc3Q6ICR7a2V5fWApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kb2N1bWVudHNba2V5XS5hZGRDaGlsZFB1YihwdWJsaWNhdGlvbik7XG4gICAgfVxuXG4gICAgZ2V0KGRvY0lkKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHZhbHVlT2ZJZChkb2NJZCk7XG4gICAgICAgIHJldHVybiB0aGlzLmRvY3VtZW50c1trZXldO1xuICAgIH1cblxuICAgIHJlbW92ZShkb2NJZCkge1xuICAgICAgICBjb25zdCBrZXkgPSB2YWx1ZU9mSWQoZG9jSWQpO1xuICAgICAgICBkZWxldGUgdGhpcy5kb2N1bWVudHNba2V5XTtcbiAgICB9XG5cbiAgICBoYXMoZG9jSWQpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5nZXQoZG9jSWQpO1xuICAgIH1cblxuICAgIGVhY2hEb2N1bWVudChjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgICBfLmVhY2godGhpcy5kb2N1bWVudHMsIGZ1bmN0aW9uIGV4ZWNDYWxsYmFja09uRG9jKGRvYykge1xuICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBkb2MpO1xuICAgICAgICB9LCBjb250ZXh0IHx8IHRoaXMpO1xuICAgIH1cblxuICAgIGVhY2hDaGlsZFB1Yihkb2NJZCwgY2FsbGJhY2spIHtcbiAgICAgICAgY29uc3QgZG9jID0gdGhpcy5nZXQoZG9jSWQpO1xuXG4gICAgICAgIGlmIChkb2MpIHtcbiAgICAgICAgICAgIGRvYy5lYWNoQ2hpbGRQdWIoY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SWRzKCkge1xuICAgICAgICBjb25zdCBkb2NJZHMgPSBbXTtcblxuICAgICAgICB0aGlzLmVhY2hEb2N1bWVudCgoZG9jKSA9PiB7XG4gICAgICAgICAgICBkb2NJZHMucHVzaChkb2MuZG9jSWQpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZG9jSWRzO1xuICAgIH1cblxuICAgIHVuZmxhZ0ZvclJlbW92YWwoZG9jSWQpIHtcbiAgICAgICAgY29uc3QgZG9jID0gdGhpcy5nZXQoZG9jSWQpO1xuXG4gICAgICAgIGlmIChkb2MpIHtcbiAgICAgICAgICAgIGRvYy51bmZsYWdGb3JSZW1vdmFsKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmbGFnQWxsRm9yUmVtb3ZhbCgpIHtcbiAgICAgICAgdGhpcy5lYWNoRG9jdW1lbnQoKGRvYykgPT4ge1xuICAgICAgICAgICAgZG9jLmZsYWdGb3JSZW1vdmFsKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdmFsdWVPZklkKGRvY0lkKSB7XG4gICAgaWYgKGRvY0lkID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRG9jdW1lbnQgSUQgaXMgbnVsbCcpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGRvY0lkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RvY3VtZW50IElEIGlzIHVuZGVmaW5lZCcpO1xuICAgIH1cbiAgICByZXR1cm4gZG9jSWQudmFsdWVPZigpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBQdWJsaXNoZWREb2N1bWVudExpc3Q7XG4iXX0=
