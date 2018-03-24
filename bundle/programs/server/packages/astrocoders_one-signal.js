(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var SentNotifications, OneSignal;

var require = meteorInstall({"node_modules":{"meteor":{"astrocoders:one-signal":{"lib":{"one_signal.js":function(require){

//////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                              //
// packages/astrocoders_one-signal/lib/one_signal.js                                            //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

SentNotifications = new Mongo.Collection('oneSignalNotifications');
OneSignal = {
  _base: 'https://onesignal.com/api/v1/',

  send(method, api, data) {
    const url = `${this._base}/${api}`;
    const {
      apiKey
    } = Meteor.settings.oneSignal;
    return HTTP.call(method, url, {
      data,
      headers: {
        Authorization: `Basic ${apiKey}`
      }
    });
  }

};
OneSignal.Notifications = {
  _api: 'notifications',

  create(players, data) {
    const url = `${this._api}`;
    const {
      appId
    } = Meteor.settings.oneSignal;
    SentNotifications.insert((0, _extends3.default)({}, data, {
      createdAt: new Date()
    }));
    return OneSignal.send('POST', url, (0, _extends3.default)({}, data, {
      app_id: appId,
      include_player_ids: players
    }));
  }

};
//////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
require("./node_modules/meteor/astrocoders:one-signal/lib/one_signal.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['astrocoders:one-signal'] = {}, {
  OneSignal: OneSignal,
  SentNotifications: SentNotifications
});

})();

//# sourceURL=meteor://💻app/packages/astrocoders_one-signal.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYXN0cm9jb2RlcnM6b25lLXNpZ25hbC9saWIvb25lX3NpZ25hbC5qcyJdLCJuYW1lcyI6WyJTZW50Tm90aWZpY2F0aW9ucyIsIk1vbmdvIiwiQ29sbGVjdGlvbiIsIk9uZVNpZ25hbCIsIl9iYXNlIiwic2VuZCIsIm1ldGhvZCIsImFwaSIsImRhdGEiLCJ1cmwiLCJhcGlLZXkiLCJNZXRlb3IiLCJzZXR0aW5ncyIsIm9uZVNpZ25hbCIsIkhUVFAiLCJjYWxsIiwiaGVhZGVycyIsIkF1dGhvcml6YXRpb24iLCJOb3RpZmljYXRpb25zIiwiX2FwaSIsImNyZWF0ZSIsInBsYXllcnMiLCJhcHBJZCIsImluc2VydCIsImNyZWF0ZWRBdCIsIkRhdGUiLCJhcHBfaWQiLCJpbmNsdWRlX3BsYXllcl9pZHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUFBLG9CQUFvQixJQUFJQyxNQUFNQyxVQUFWLENBQXFCLHdCQUFyQixDQUFwQjtBQUVBQyxZQUFZO0FBQ1ZDLFNBQU8sK0JBREc7O0FBRVZDLE9BQUtDLE1BQUwsRUFBYUMsR0FBYixFQUFrQkMsSUFBbEIsRUFBdUI7QUFDckIsVUFBTUMsTUFBTyxHQUFFLEtBQUtMLEtBQU0sSUFBR0csR0FBSSxFQUFqQztBQUNBLFVBQU07QUFBRUc7QUFBRixRQUFhQyxPQUFPQyxRQUFQLENBQWdCQyxTQUFuQztBQUVBLFdBQU9DLEtBQUtDLElBQUwsQ0FBVVQsTUFBVixFQUFrQkcsR0FBbEIsRUFBdUI7QUFDNUJELFVBRDRCO0FBRTVCUSxlQUFTO0FBQ1BDLHVCQUFnQixTQUFRUCxNQUFPO0FBRHhCO0FBRm1CLEtBQXZCLENBQVA7QUFNRDs7QUFaUyxDQUFaO0FBZUFQLFVBQVVlLGFBQVYsR0FBMEI7QUFDeEJDLFFBQU0sZUFEa0I7O0FBRXhCQyxTQUFPQyxPQUFQLEVBQWdCYixJQUFoQixFQUFxQjtBQUNuQixVQUFNQyxNQUFPLEdBQUUsS0FBS1UsSUFBSyxFQUF6QjtBQUNBLFVBQU07QUFBRUc7QUFBRixRQUFZWCxPQUFPQyxRQUFQLENBQWdCQyxTQUFsQztBQUVBYixzQkFBa0J1QixNQUFsQiw0QkFDS2YsSUFETDtBQUVFZ0IsaUJBQVcsSUFBSUMsSUFBSjtBQUZiO0FBS0EsV0FBT3RCLFVBQVVFLElBQVYsQ0FBZSxNQUFmLEVBQXVCSSxHQUF2Qiw2QkFDRkQsSUFERTtBQUVMa0IsY0FBUUosS0FGSDtBQUdMSywwQkFBb0JOO0FBSGYsT0FBUDtBQUtEOztBQWhCdUIsQ0FBMUIsQyIsImZpbGUiOiIvcGFja2FnZXMvYXN0cm9jb2RlcnNfb25lLXNpZ25hbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlNlbnROb3RpZmljYXRpb25zID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ29uZVNpZ25hbE5vdGlmaWNhdGlvbnMnKTtcblxuT25lU2lnbmFsID0ge1xuICBfYmFzZTogJ2h0dHBzOi8vb25lc2lnbmFsLmNvbS9hcGkvdjEvJyxcbiAgc2VuZChtZXRob2QsIGFwaSwgZGF0YSl7XG4gICAgY29uc3QgdXJsID0gYCR7dGhpcy5fYmFzZX0vJHthcGl9YDtcbiAgICBjb25zdCB7IGFwaUtleSB9ID0gTWV0ZW9yLnNldHRpbmdzLm9uZVNpZ25hbDtcblxuICAgIHJldHVybiBIVFRQLmNhbGwobWV0aG9kLCB1cmwsIHtcbiAgICAgIGRhdGEsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIEF1dGhvcml6YXRpb246IGBCYXNpYyAke2FwaUtleX1gLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSxcbn07XG5cbk9uZVNpZ25hbC5Ob3RpZmljYXRpb25zID0ge1xuICBfYXBpOiAnbm90aWZpY2F0aW9ucycsXG4gIGNyZWF0ZShwbGF5ZXJzLCBkYXRhKXtcbiAgICBjb25zdCB1cmwgPSBgJHt0aGlzLl9hcGl9YDtcbiAgICBjb25zdCB7IGFwcElkIH0gPSBNZXRlb3Iuc2V0dGluZ3Mub25lU2lnbmFsO1xuXG4gICAgU2VudE5vdGlmaWNhdGlvbnMuaW5zZXJ0KHtcbiAgICAgIC4uLmRhdGEsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgfSk7XG5cbiAgICByZXR1cm4gT25lU2lnbmFsLnNlbmQoJ1BPU1QnLCB1cmwsIHtcbiAgICAgIC4uLmRhdGEsXG4gICAgICBhcHBfaWQ6IGFwcElkLFxuICAgICAgaW5jbHVkZV9wbGF5ZXJfaWRzOiBwbGF5ZXJzLFxuICAgIH0pO1xuICB9LFxufTtcbiJdfQ==
