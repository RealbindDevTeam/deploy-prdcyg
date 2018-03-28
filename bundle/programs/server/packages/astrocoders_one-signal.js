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

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/astrocoders_one-signal/lib/one_signal.js                                                 //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
var _interopRequireDefault = require("@babel/runtime/helpers/builtin/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/builtin/objectSpread"));

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
    SentNotifications.insert((0, _objectSpread2.default)({}, data, {
      createdAt: new Date()
    }));
    return OneSignal.send('POST', url, (0, _objectSpread2.default)({}, data, {
      app_id: appId,
      include_player_ids: players
    }));
  }

};
///////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
require("/node_modules/meteor/astrocoders:one-signal/lib/one_signal.js");

/* Exports */
Package._define("astrocoders:one-signal", {
  OneSignal: OneSignal,
  SentNotifications: SentNotifications
});

})();

//# sourceURL=meteor://💻app/packages/astrocoders_one-signal.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYXN0cm9jb2RlcnM6b25lLXNpZ25hbC9saWIvb25lX3NpZ25hbC5qcyJdLCJuYW1lcyI6WyJTZW50Tm90aWZpY2F0aW9ucyIsIk1vbmdvIiwiQ29sbGVjdGlvbiIsIk9uZVNpZ25hbCIsIl9iYXNlIiwic2VuZCIsIm1ldGhvZCIsImFwaSIsImRhdGEiLCJ1cmwiLCJhcGlLZXkiLCJNZXRlb3IiLCJzZXR0aW5ncyIsIm9uZVNpZ25hbCIsIkhUVFAiLCJjYWxsIiwiaGVhZGVycyIsIkF1dGhvcml6YXRpb24iLCJOb3RpZmljYXRpb25zIiwiX2FwaSIsImNyZWF0ZSIsInBsYXllcnMiLCJhcHBJZCIsImluc2VydCIsImNyZWF0ZWRBdCIsIkRhdGUiLCJhcHBfaWQiLCJpbmNsdWRlX3BsYXllcl9pZHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBQSxvQkFBb0IsSUFBSUMsTUFBTUMsVUFBVixDQUFxQix3QkFBckIsQ0FBcEI7QUFFQUMsWUFBWTtBQUNWQyxTQUFPLCtCQURHOztBQUVWQyxPQUFLQyxNQUFMLEVBQWFDLEdBQWIsRUFBa0JDLElBQWxCLEVBQXVCO0FBQ3JCLFVBQU1DLE1BQU8sR0FBRSxLQUFLTCxLQUFNLElBQUdHLEdBQUksRUFBakM7QUFDQSxVQUFNO0FBQUVHO0FBQUYsUUFBYUMsT0FBT0MsUUFBUCxDQUFnQkMsU0FBbkM7QUFFQSxXQUFPQyxLQUFLQyxJQUFMLENBQVVULE1BQVYsRUFBa0JHLEdBQWxCLEVBQXVCO0FBQzVCRCxVQUQ0QjtBQUU1QlEsZUFBUztBQUNQQyx1QkFBZ0IsU0FBUVAsTUFBTztBQUR4QjtBQUZtQixLQUF2QixDQUFQO0FBTUQ7O0FBWlMsQ0FBWjtBQWVBUCxVQUFVZSxhQUFWLEdBQTBCO0FBQ3hCQyxRQUFNLGVBRGtCOztBQUV4QkMsU0FBT0MsT0FBUCxFQUFnQmIsSUFBaEIsRUFBcUI7QUFDbkIsVUFBTUMsTUFBTyxHQUFFLEtBQUtVLElBQUssRUFBekI7QUFDQSxVQUFNO0FBQUVHO0FBQUYsUUFBWVgsT0FBT0MsUUFBUCxDQUFnQkMsU0FBbEM7QUFFQWIsc0JBQWtCdUIsTUFBbEIsaUNBQ0tmLElBREw7QUFFRWdCLGlCQUFXLElBQUlDLElBQUo7QUFGYjtBQUtBLFdBQU90QixVQUFVRSxJQUFWLENBQWUsTUFBZixFQUF1QkksR0FBdkIsa0NBQ0ZELElBREU7QUFFTGtCLGNBQVFKLEtBRkg7QUFHTEssMEJBQW9CTjtBQUhmLE9BQVA7QUFLRDs7QUFoQnVCLENBQTFCLEMiLCJmaWxlIjoiL3BhY2thZ2VzL2FzdHJvY29kZXJzX29uZS1zaWduYWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJTZW50Tm90aWZpY2F0aW9ucyA9IG5ldyBNb25nby5Db2xsZWN0aW9uKCdvbmVTaWduYWxOb3RpZmljYXRpb25zJyk7XG5cbk9uZVNpZ25hbCA9IHtcbiAgX2Jhc2U6ICdodHRwczovL29uZXNpZ25hbC5jb20vYXBpL3YxLycsXG4gIHNlbmQobWV0aG9kLCBhcGksIGRhdGEpe1xuICAgIGNvbnN0IHVybCA9IGAke3RoaXMuX2Jhc2V9LyR7YXBpfWA7XG4gICAgY29uc3QgeyBhcGlLZXkgfSA9IE1ldGVvci5zZXR0aW5ncy5vbmVTaWduYWw7XG5cbiAgICByZXR1cm4gSFRUUC5jYWxsKG1ldGhvZCwgdXJsLCB7XG4gICAgICBkYXRhLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmFzaWMgJHthcGlLZXl9YCxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0sXG59O1xuXG5PbmVTaWduYWwuTm90aWZpY2F0aW9ucyA9IHtcbiAgX2FwaTogJ25vdGlmaWNhdGlvbnMnLFxuICBjcmVhdGUocGxheWVycywgZGF0YSl7XG4gICAgY29uc3QgdXJsID0gYCR7dGhpcy5fYXBpfWA7XG4gICAgY29uc3QgeyBhcHBJZCB9ID0gTWV0ZW9yLnNldHRpbmdzLm9uZVNpZ25hbDtcblxuICAgIFNlbnROb3RpZmljYXRpb25zLmluc2VydCh7XG4gICAgICAuLi5kYXRhLFxuICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIE9uZVNpZ25hbC5zZW5kKCdQT1NUJywgdXJsLCB7XG4gICAgICAuLi5kYXRhLFxuICAgICAgYXBwX2lkOiBhcHBJZCxcbiAgICAgIGluY2x1ZGVfcGxheWVyX2lkczogcGxheWVycyxcbiAgICB9KTtcbiAgfSxcbn07XG4iXX0=
