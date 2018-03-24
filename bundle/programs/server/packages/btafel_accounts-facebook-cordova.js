(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Accounts = Package['accounts-base'].Accounts;
var Facebook = Package['facebook-oauth'].Facebook;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var _ = Package.underscore._;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/btafel_accounts-facebook-cordova/facebook_server.js                                                    //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
Accounts.registerLoginHandler(function(loginRequest) {
  if(!loginRequest.cordova) {
    return undefined;
  }

  loginRequest = loginRequest.authResponse;

  var whitelisted = ['id', 'email', 'name', 'first_name',
      'last_name', 'link', 'gender', 'locale', 'age_range'];

  var identity = getIdentity(loginRequest.accessToken, whitelisted);

  var profilePicture = getProfilePicture(loginRequest.accessToken);

  console.log(profilePicture);

  var serviceData = {
    accessToken: loginRequest.accessToken,
    expiresAt: (+new Date) + (1000 * loginRequest.expiresIn)
  };


  var fields = _.pick(identity, whitelisted);
  _.extend(serviceData, fields);

  var options = {profile: {}};
  var profileFields = _.pick(identity, Meteor.settings.public.facebook.profileFields);
  _.extend(options.profile, profileFields);

  options.profile.avatar = profilePicture;

  return Accounts.updateOrCreateUserFromExternalService("facebook", serviceData, options);

});

var getIdentity = function (accessToken, fields) {
  try {
    return HTTP.get("https://graph.facebook.com/me", {
      params: {
        access_token: accessToken,
        fields: fields.join(",")
      }
    }).data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Facebook. " + err.message),
                   {response: err.response});
  }
};

var getProfilePicture = function (accessToken) {
  try {
    return HTTP.get("https://graph.facebook.com/v2.8/me/picture/?redirect=false", {
      params: {access_token: accessToken}}).data.data.url;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Facebook. " + err.message),
                   {response: err.response});
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/btafel_accounts-facebook-cordova/facebook.js                                                           //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
Accounts.oauth.registerService('facebook');

if (Meteor.isClient) {

  Meteor.loginWithFacebook = function (options, callback) {
    // support a callback without options
    if (!callback && typeof options === "function") {
      callback = options;
      options = null;
    }

    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);

    var fbLoginSuccess = function (data) {
      data.cordova = true;

      Accounts.callLoginMethod({
        methodArguments: [data],
        userCallback: callback
      });
    };

    if (typeof facebookConnectPlugin != "undefined" && ((Meteor.settings && Meteor.settings.public && Meteor.settings.public.facebook) || options)) {
      facebookConnectPlugin.getLoginStatus(
        function (response) {
          if (response.status != "connected") {
            facebookConnectPlugin.login(options.requestPermissions || Meteor.settings.public.facebook.permissions,
              fbLoginSuccess,
              function (error) {
                callback(new Meteor.Error(500, error));
              }
            );
          } else {
            fbLoginSuccess(response);
          }
        },
        function (error) {
          callback(new Meteor.Error(500, error));
        }
      );
    } else {
      Facebook.requestCredential(options, credentialRequestCompleteCallback);
    }
  };

} else {

  if (Meteor.settings &&
    Meteor.settings.facebook &&
    Meteor.settings.facebook.appId &&
    Meteor.settings.facebook.secret) {

    ServiceConfiguration.configurations.remove({
      service: "facebook"
    });

    ServiceConfiguration.configurations.insert({
      service: "facebook",
      appId: Meteor.settings.facebook.appId,
      secret: Meteor.settings.facebook.secret
    });

    Accounts.addAutopublishFields({
      // publish all fields including access token, which can legitimately
      // be used from the client (if transmitted over ssl or on
      // localhost). https://developers.facebook.com/docs/concepts/login/access-tokens-and-types/,
      // "Sharing of Access Tokens"
      forLoggedInUser: ['services.facebook'],
      forOtherUsers: [
        // https://www.facebook.com/help/167709519956542
        'services.facebook.id', 'services.facebook.username', 'services.facebook.gender'
      ]
    });

  } else {
    console.log("Meteor settings for accounts-facebook-cordova not configured correctly.")
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['btafel:accounts-facebook-cordova'] = {};

})();
