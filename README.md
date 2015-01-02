node-in-app-purchase-check
==========================

** Why

PhoneGap purchase plugin [cc.fovea.cordova.purchase](https://github.com/j3k0/cordova-plugin-purchase) is the best purchase plugin as I know for PhoneGap, which supports iOS and Android google play.

To use it for auto-renewable subscription with this plugin, you have to provide receipt verification. This code provides an easy way to setup your own service.

** How to use it

1. You can deploy it to any nodejs platform, such as you can deploy it [openshift](https://www.openshift.com/), which is supported in our code.

2. After deploy, you can change your code like below. You can see more sample code from here:[https://github.com/Fovea/cordova-plugin-purchase-demo]


'''
    var password = 'Your app shared secrect from iTunes Connect'
    var productId = 'your product id';
    var productAlias = 'your product alias';
    var isSandBox = true; // true for sandbox test, false for production

    // Enable remote receipt validation
    // isAutoRenew=true means this is auto renew, false means non auto renew
    var queryString = '?password=' + password + '&isSandBox=' + isSandBox + '&isAutoRenew=true';
    store.validator = "http://{Your host here}/verify" + queryString;

'''


** TODO
1. support Android google play
2. support Amazon app store
