module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "analytics" : false,
        "StatusBar" : false,
        "cordova" : false,
        "document" : false,
        "setTimeout" : false,
        "Bugsnag" : false,
        "setInterval" : false,
        "clearInterval" : false,
        "pluralize"   : false,
        "alert"   : false,
        "event"   : false,
        "location"   : false,
        "ionic"   : false,
        "window"   : false,
        "config"   : false,
        "angular"   : false,
        "moment"    : false,
        "screen"    : false,
        "console"    : false,
        "chrome"    : false,
        "localStorage" : false,
        "jasmine"   : false,
        "$"         : false,
        "_"         : false,
        "module"    : false,
        "require"   : false,
        "Ionic" : false,
        "XMLHttpRequest" : false,
        "process" : false,
        "defer" : false,
        "deferred" : false,
        "PushNotification" : false,
        "navigator" : false,
        "UserVoice" : false,
        "backgroundGeoLocation" : false,
        "inAppPurchase" : false,
        "HumanConnect": false,
        "qmLog": false,
        "qmStorage": false,
        "Quantimodo": false,
        "notificationsHelper": false,
        "qmItems": false,
        "timeHelper": false,
        "qm": false,
        "qmNotifications": false,
        "qmChrome": false,
        "qmPush": false,
        "qmUser": false,
        "userHelper": false,
        "urlHelper": false,
        "qmAnalytics": false,
        "OverApps": false,
        "localforage": false,
        "firebase": false,
        "qmStates": false,
        "chcp": false,
        "jQuery": false
    },
    "rules": {
        "accessor-pairs": "error",
        "array-bracket-newline": "off",
        "array-bracket-spacing": "off",
        "array-callback-return": "off",
        "array-element-newline": "off",
        "arrow-body-style": "error",
        "arrow-parens": "error",
        "arrow-spacing": "error",
        "block-scoped-var": "off",
        "block-spacing": "off",
        "brace-style": "off",
        "callback-return": "off",
        "camelcase": "off",
        "capitalized-comments": "off",
        "class-methods-use-this": "error",
        "comma-dangle": "off",
        "comma-spacing": "off",
        "comma-style": [
            "error",
            "last"
        ],
        "complexity": "off",
        "computed-property-spacing": "off",
        "consistent-return": "off",
        "consistent-this": "off",
        "curly": "off",
        "default-case": "error",
        "dot-location": [
            "error",
            "property"
        ],
        "dot-notation": "off",
        "eol-last": "off",
        "eqeqeq": "off",
        "for-direction": "error",
        "func-call-spacing": "error",
        "func-name-matching": "off",
        "func-names": "off",
        "func-style": "off",
        "function-paren-newline": "off",
        "generator-star-spacing": "error",
        "getter-return": "error",
        "global-require": "error",
        "guard-for-in": "off",
        "handle-callback-err": "off",
        "id-blacklist": "error",
        "id-length": "off",
        "id-match": "error",
        "implicit-arrow-linebreak": "error",
        "indent": "off",
        "indent-legacy": "off",
        "init-declarations": "off",
        "jsx-quotes": "error",
        "key-spacing": "off",
        "keyword-spacing": "off",
        "line-comment-position": "off",
        "linebreak-style": "off",
        "lines-around-comment": "off",
        "lines-around-directive": "off",
        "lines-between-class-members": "error",
        "max-depth": "off",
        "max-len": "off",
        "max-lines": "off",
        "max-nested-callbacks": "error",
        "max-params": "off",
        "max-statements": "off",
        "max-statements-per-line": "off",
        "multiline-comment-style": "off",
        "multiline-ternary": "off",
        "new-parens": "error",
        "newline-after-var": "off",
        "newline-before-return": "off",
        "newline-per-chained-call": "off",
        "no-alert": "off",
        "no-array-constructor": "error",
        "no-await-in-loop": "error",
        "no-bitwise": "error",
        "no-buffer-constructor": "error",
        "no-caller": "off",
        "no-catch-shadow": "error",
        "no-confusing-arrow": "error",
        "no-console": "off",
        "no-continue": "off",
        "no-div-regex": "error",
        "no-duplicate-imports": "error",
        "no-else-return": "off",
        "no-empty-function": "off",
        "no-eq-null": "error",
        "no-eval": "error",
        "no-extend-native": "off",
        "no-extra-bind": "error",
        "no-extra-label": "error",
        "no-extra-parens": "off",
        "no-floating-decimal": "off",
        "no-implicit-globals": "off",
        "no-implied-eval": "error",
        "no-inline-comments": "off",
        "no-inner-declarations": "off",
        "no-invalid-this": "error",
        "no-iterator": "error",
        "no-label-var": "error",
        "no-labels": "error",
        "no-lone-blocks": "error",
        "no-lonely-if": "off",
        "no-loop-func": "off",
        "no-magic-numbers": "off",
        "no-mixed-operators": "off",
        "no-mixed-requires": "error",
        "no-multi-assign": "off",
        "no-multi-spaces": "off",
        "no-multi-str": "error",
        "no-multiple-empty-lines": "error",
        "no-native-reassign": "error",
        "no-negated-condition": "off",
        "no-negated-in-lhs": "error",
        "no-nested-ternary": "off",
        "no-new": "error",
        "no-new-func": "error",
        "no-new-object": "error",
        "no-new-require": "error",
        "no-new-wrappers": "error",
        "no-octal-escape": "error",
        "no-param-reassign": "off",
        "no-path-concat": "error",
        "no-plusplus": "off",
        "no-process-env": "error",
        "no-process-exit": "error",
        "no-proto": "error",
        "no-prototype-builtins": "off",
        "no-restricted-globals": "error",
        "no-restricted-imports": "error",
        "no-restricted-modules": "error",
        "no-restricted-properties": "error",
        "no-restricted-syntax": "error",
        "no-return-assign": "off",
        "no-return-await": "error",
        "no-script-url": "error",
        "no-self-compare": "error",
        "no-sequences": "error",
        "no-shadow": "off",
        "no-shadow-restricted-names": "error",
        "no-spaced-func": "error",
        "no-sync": "off",
        "no-tabs": "off",
        "no-template-curly-in-string": "error",
        "no-ternary": "off",
        "no-throw-literal": "off",
        "no-trailing-spaces": "error",
        "no-undef-init": "error",
        "no-undefined": "off",
        "no-underscore-dangle": "error",
        "no-unmodified-loop-condition": "error",
        "no-unneeded-ternary": "off",
        "no-unused-vars": "off",
        "no-use-before-define": "off",
        "no-useless-call": "error",
        "no-useless-computed-key": "error",
        "no-useless-concat": "off",
        "no-useless-constructor": "error",
        "no-useless-escape": "off",
        "no-useless-rename": "error",
        "no-useless-return": "error",
        "no-var": "off",
        "no-void": "error",
        "no-warning-comments": "off",
        "no-whitespace-before-property": "error",
        "no-with": "error",
        "nonblock-statement-body-position": [
            "error",
            "any"
        ],
        "object-curly-newline": "off",
        "object-curly-spacing": "off",
        "object-property-newline": "off",
        "object-shorthand": "off",
        "one-var": "off",
        "one-var-declaration-per-line": "off",
        "operator-assignment": "off",
        "operator-linebreak": "off",
        "padded-blocks": "off",
        "padding-line-between-statements": "error",
        "prefer-arrow-callback": "off",
        "prefer-const": "error",
        "prefer-destructuring": "off",
        "prefer-numeric-literals": "error",
        "prefer-promise-reject-errors": "error",
        "prefer-reflect": "off",
        "prefer-rest-params": "off",
        "prefer-spread": "error",
        "prefer-template": "off",
        "quote-props": "off",
        "quotes": "off",
        "radix": "off",
        "require-await": "error",
        "require-jsdoc": "off",
        "rest-spread-spacing": "error",
        "semi": "off",
        "semi-spacing": "off",
        "semi-style": [
            "error",
            "last"
        ],
        "sort-imports": "error",
        "sort-keys": "off",
        "sort-vars": "off",
        "space-before-blocks": "off",
        "space-before-function-paren": "off",
        "space-in-parens": "off",
        "space-infix-ops": "off",
        "space-unary-ops": "off",
        "spaced-comment": "off",
        "strict": "off",
        "switch-colon-spacing": "error",
        "symbol-description": "error",
        "template-curly-spacing": "error",
        "template-tag-spacing": "error",
        "unicode-bom": [
            "error",
            "never"
        ],
        "valid-jsdoc": "off",
        "vars-on-top": "off",
        "wrap-regex": "off",
        "yield-star-spacing": "error",
        "yoda": [
            "error",
            "never"
        ]
    }
};
