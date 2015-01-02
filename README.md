node-in-app-purchase-check
==========================

## Why

PhoneGap purchase plugin [cc.fovea.cordova.purchase](https://github.com/j3k0/cordova-plugin-purchase) is the best purchase plugin as I know, which supports iOS and Android google play.

To use it for auto-renewable subscription, you have to provide receipt verification. This code provides an easy way to setup your own service in nodejs.

## How to use it

1. You can deploy it to any nodejs platform, such as you can deploy it [openshift](https://www.openshift.com/), which is supported by our code without any change. If you don't know how to use openshift, see here: (https://developers.openshift.com/en/node-js-getting-started.html)

2. After deploy, you can change your code like below. You can see more sample code from here:(https://github.com/Fovea/cordova-plugin-purchase-demo)


```
    var password = 'Your app shared secrect from iTunes Connect'
    var productId = 'your product id';
    var productAlias = 'your product alias';
    var isSandBox = true; // true for sandbox test, false for production

    // Enable remote receipt validation
    // isAutoRenew=true means this is auto renew, false means non auto renew
    var queryString = '?password=' + password + '&isSandBox=' + isSandBox + '&isAutoRenew=true';
    store.validator = "http://{Your host here}/verify" + queryString;
```


## TODO

1. support Android google play
2. support Amazon app store

## NOTES:

1. [how to sync openshift and github code](https://forums.openshift.com/how-to-keep-a-github-repository-and-an-openshift-repository-in-sync)
