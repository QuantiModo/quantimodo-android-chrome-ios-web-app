(function () {
    "use strict";

    if (typeof mashapeKey !== 'undefined' && mashapeKey) {
        var baseUrl = 'https://quantimodo-quantimodo-v1.p.mashape.com';
    } else {
        var baseUrl = '{{{base}}}';
    }

    var mainDiv;
    var listData;
    var popup;
    var callbackInterval = null;
    var callbackCancelTimeout = null;
    var useConnectionWindow = true;
    var methodsDelegated = false;
    var access_token;
    var mashapeKey;

    var templatePopup =
        '<div id="qm-popup">' +
        '    <div id="qm-popup-inner">' +
        '        <h2>Connect</h2>' +
        '        <img id="qm-close" alt="x" src="https://app.quantimo.do/qm-connect/close.png">' +
        '        <div id="qm-main"></div>' +
        '    </div>' +
        '</div>';

    var templateConnectBlock =
        '<div class="qm-account-block" data-name="<%= name %>">' +
        '    <div class="qm-account-block-left">' +
        '        <img class="qm-connect-image" src="<%= image %>" alt="<%= displayName %> logo">' +
        '        <% if (connected) { %>' +
        '            <img class="qm-connector-status" src="https://app.quantimo.do/qm-connect/connected.png">' +
        '        <% } %>' +
        '    </div>' +
        '    <div class="qm-account-block-right">' +
        '        <h4 class="qm-account-name"><%= displayName %></h4>' +
        '        <% if (connected && lastUpdate) { %>' +
        '            <div class="qm-account-last-updated">Last updated <%= timeDiff(new Date(lastUpdate * 1000), " ago") %>: <%= totalMeasurementsInLastUpdate %> new measurements</div>' +
        '        <% } %>' +
        '        <% if (errorMessage) { %><span class="qm-account-block-error"><%= errorMessage %></span><br><% } %>' +
        '        <span><%= shortDescription %></span>' +
        '    </div>' +
        '    <div class="clear"></div>' +
        '    <div class="qm-account-block-fields"></div>' +
        '    <div class="qm-account-block-bottom">' +
        '        <% if (connected && updateStatus == "WAITING") { %>' +
        '           <a class="qm-button qm-account-scheduled-button" href="#">Update Scheduled</a>' +
        '           <a class="qm-button qm-account-disconnect-button" href="#">Disconnect</a>' +
        '        <% } else if (connected && updateStatus == "UPDATING") { %>' +
        '           <a class="qm-button qm-account-sync-button" href="#">Updating</a>' +
        '           <a class="qm-button qm-account-disconnect-button" href="#">Disconnect</a>' +
        '        <% } else if (connected) { %>' +
        '           <a class="qm-button qm-account-sync-button" href="#">Sync</a>' +
        '           <a class="qm-button qm-account-disconnect-button" href="#">Disconnect</a>' +
        '        <% } else { %>' +
        '            <a class="qm-button qm-account-get-button" target="_blank" href="<%= getItUrl %>">GET IT HERE</a>' +
        '            <a class="qm-button qm-account-connect-button" href="#">Connect</a>' +
        '        <% } %>' +
        '    </div><hr>' +
        '</div>';

    createStyles();

    window.qmSetupInPopup = function () {
        createHiddenPopupBlock();
        showLoader(true);
        loadConnectors(function () {
            renderMain();
            showPopup();
            showLoader(false);
        });
    };

    window.qmSetupOnPage = function (selector) {
        var parent = document.querySelector(selector);
        mainDiv = document.createElement('div');
        mainDiv.setAttribute('id', 'qm-main');
        parent.appendChild(mainDiv);
        showLoader(true);
        loadConnectors(function () {
            renderMain();
            showLoader(false);
        });
    };

    window.qmSetupOnIonic = function() {
        baseUrl = config.getURL();
        access_token = localStorage[config.appSettings.storage_identifier + 'accessToken'];
        if (config.get('use_mashape') && config.getMashapeKey())
            mashapeKey = config.getMashapeKey();
        useConnectionWindow = false;

        var theDiv = document.getElementById('import_iframe');
        theDiv.innerHTML = '<div id="qm-main"></div>';

        mainDiv = document.getElementById('qm-main');
        showLoader(true);
        loadConnectors(function () {
            renderMain();
            showLoader(false);
        });
    };

    window.qmSetupOnMobile = function () {
        useConnectionWindow = false;
        document.body.innerHTML = '<div id="qm-main"></div>';
        mainDiv = document.getElementById('qm-main');
        showLoader(true);
        loadConnectors(function () {
            renderMain();
            showLoader(false);
        });
    };

    // http://ejohn.org/blog/javascript-micro-templating/
    function template(str, data) {
        data.baseUrl = baseUrl;
        data.timeDiff = timeDiff;
        var fn = new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +
            "with(obj){p.push('" +
            str
                .replace(/[\r\t\n]/g, " ")
                .split("<%").join("\t")
                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                .replace(/\t=(.*?)%>/g, "',$1,'")
                .split("\t").join("');")
                .split("%>").join("p.push('")
                .split("\r").join("\\'")
            + "');}return p.join('');");
        return fn(data);
    }

    function matches(el, selector) {
        return (el.matches || el.matchesSelector || el.msMatchesSelector ||
            el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector)
            .call(el, selector);
    }

    function countObjectAttributes(o) {
        if (typeof o != "object") {
            return null;
        }
        var count = 0;
        for (var k in o) {
            if (o.hasOwnProperty(k)) {
                ++count;
            }
        }
        return count;
    }

    function addClass(el, className) {
        if (el.classList) {
            el.classList.add(className);
        } else {
            el.className += ' ' + className;
        }
    }

    function hasClass(el, className) {
        if (el.classList) {
            return el.classList.contains(className);
        } else {
            return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
        }
    }

    // https://jsfiddle.net/1a6j4es1/28/
    function delegateSelector(selector, event, childSelector, handler) {
        var elements = document.querySelectorAll(selector);
        [].forEach.call(elements, function (el) {
            el.addEventListener(event, function (e) {
                if (matches(e.target, childSelector)) {
                    handler(e);
                }
            });
        });
    }

    function closest(el, selector) {
        while (el) {
            if (matches(el, selector)) {
                return el;
            } else {
                el = el.parentElement;
            }
        }
        return false;
    }

    function timeDiff(date, suffix) {
        function numberEnding(number) {
            return (number > 1) ? 's' : '';
        }

        var diff = (new Date().getTime() - date.getTime()) / 1000;
        var years = Math.floor(diff / 31536000);
        if (years) {
            return years + ' year' + numberEnding(years) + suffix;
        }
        var days = Math.floor((diff %= 31536000) / 86400);
        if (days) {
            return days + ' day' + numberEnding(days) + suffix;
        }
        var hours = Math.floor((diff %= 86400) / 3600);
        if (hours) {
            return hours + ' hour' + numberEnding(hours) + suffix;
        }
        var minutes = Math.floor((diff %= 3600) / 60);
        if (minutes) {
            return minutes + ' minute' + numberEnding(minutes) + suffix;
        }
        var seconds = Math.floor(diff % 60);
        if (seconds) {
            return seconds + ' second' + numberEnding(seconds) + suffix;
        }
        return 'just now';
    }

    function createHiddenPopupBlock() {
        if (document.getElementById('qm-main')) {
            return;
        }

        var temp = document.createElement('div');
        temp.innerHTML = template(templatePopup, {});
        document.body.appendChild(temp.children[0]);

        popup = document.getElementById('qm-popup');

        var closeButton = document.getElementById('qm-close');
        closeButton.addEventListener('click', function () {
            popup.style.display = 'none';
        });

        mainDiv = document.getElementById('qm-main');
    }

    function createStyles() {
        var css =
            '#qm-popup {' +
            '    display: none;' +
            '    position:absolute;' +
            '    left:50%;' +
            '    top:15%;' +
            '}' +
            '* {' +
            '   font-family: sans-serif' +
            '}' +

            'clear {' +
            ' clear: both;' +
            '}' +

            '#qm-popup-inner {' +
            '    max-width:900px;' +
            '    min-width:600px;' +
            '    padding:10px 50px;' +
            '    border:2px solid gray;' +
            '    border-radius:10px;' +
            '    background-color:#fff;' +
            '    position: relative;' +
            '}' +
            '#qm-close {' +
            '    position:absolute;' +
            '    right:-14px;' +
            '    top:-14px;' +
            '    cursor:pointer' +
            '}' +
            'div.qm-account-block {' +
            '}' +
            '.qm-account-block-left {' +
            '    float: left;' +
            '    position: relative;' +
            '    width: 132px;' +
            '}' +
            '.qm-account-block-right {' +
            '    float: left;' +
            '    position:relative;' +
            '}' +
            '.qm-account-block-error {' +
            '    border: solid 1px red;' +
            '    text-align: center;' +
            '    width: 90%;' +
            '    margin: 0 auto;' +
            '    background-color: pink;' +
            '    padding: 3px;' +
            '    color: red;' +
            '}' +
            '.qm-account-block-right span {' +
            '    font-size: 1.2em;' +
            '    color: #888;' +
            '    font-weight: 100;' +
            '}' +
            '.qm-account-block-bottom {' +
            '    clear: both;' +
            '    margin-bottom: 10px;' +
            '}' +
            'img.qm-connect-image {' +
            '    width: 116px;' +
            '    height: 116px;' +
            '}' +
            'img.qm-connector-status {' +
            '    position: absolute;' +
            '    top: -10px;' +
            '    right: 0px;' +
            '    height: 50px;' +
            '    width: 50px;' +
            '}' +
            '.qm-account-name {' +
            '    font-size: 1.5em;' +
            '    font-family: sans-serif;' +
            '    font-weight: bold;' +
            '    margin: 0;' +
            '    margin-bottom: 13px' +
            '}' +
            '.qm-account-last-updated {' +
            '    position: absolute;' +
            '    right: 0px;' +
            '    top: 5px;' +
            '    color: gray;' +
            '    font-size: 0.9em;' +
            '}' +
            'a.qm-button {' +
            '    display: inline-block; ' +
            '    margin: 0px;' +
            '    color: #2a6496;' +
            '    font-size: 1.4em;' +
            '    font-weight: 500;' +
            '    text-decoration: none;' +
            '    text-transform: uppercase;' +
            '    width: 49%;' +
            '    margin-top: 5px;' +
            '    text-align: center;' +
            '}' +
            '.qm-account-block-field-text {' +
            '    display: inline-block;' +
            '    width: 80px;' +
            '    margin-right: 10px;' +
            '    margin-top: 10px;' +
            '}' +
            'div.clear {' +
            '   clear: both;' +
            '}' +
            '@media (max-width: 640px) {' +
            '    .qm-account-last-updated {' +
            '         position: static;' +
            '    }' +
            '}' +
            '.qm-account-block:last-child hr {' +
            '    display: none;' +
            '}' +
            '@media (min-width: 640px){' +
            '    #qm-loader {' +
            '           left:calc(50% - 250px);' +
            '           top: calc(50% - 125px);' +
            '  }' +
            '}' +
            '@media (max-width: 639px){' +
            '    #qm-loader {' +
            '           width: 125px;' +
            '           left:calc(50% - 60px);' +
            '           top: calc(50% - 125px);' +
            '  }' +
            '}';

        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');

        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);
    }

    function apiCall(method, api, success, error) {
        if (!error) {
            error = function () {
            };
        }

        var request = new XMLHttpRequest();
        request.open(method, baseUrl + api, true);

        if (typeof access_token !== 'undefined' && access_token) {
            //access_token should be obtained from QuantiModo API server
            request.setRequestHeader('Authorization', 'Bearer ' + access_token);
        }

        if (typeof accessToken !== 'undefined' && accessToken) {
            //access_token should be obtained from QuantiModo API server
            request.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        }

        if (typeof mashapeKey !== 'undefined' && mashapeKey) {
            //mashape key to perform API requests
            request.setRequestHeader('X-Mashape-Key', mashapeKey);
        }

        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                var data = JSON.parse(request.responseText);
                success(data);
            } else {
                error(request.responseText);
            }
        };
        request.onerror = error;

        request.send();
    }

    function showPopup() {
        var width = window.innerWidth * 0.8;
        if (width > 1100) {
            width = 1100;
        }
        var left = (window.innerWidth - width) / 2;
        popup.style.width = width + 'px';
        popup.style.left = left + 'px';
        popup.style.display = 'block';
    }

    function loadConnectors(callback) {
        apiCall('GET', '/api/v1/connectors/list', function (data) {
            listData = {};
            data.forEach(function (item) {
                listData[item.name] = item;
            });
            callback();
        });
    }

    function redirectFromConnectButton(button, block, targetUrl) {
        if (hasClass(button, 'qm-account-connect-button-with-params')) {
            var queryParams = [];
            var fields = block.querySelectorAll('.qm-account-block-field-input');
            for (var i in fields) {
                if (fields.hasOwnProperty(i)) {
                    var field = fields[i];
                    queryParams.push(encodeURIComponent(field.name) + '=' + encodeURIComponent(field.value));
                }
            }
            targetUrl += "?" + queryParams.join('&');
        }

        var theDiv = document.getElementById('import_iframe');
        if(theDiv){

            theDiv.scrollIntoView();

            var iframe = document.createElement('iframe');

            iframe.src = targetUrl;
            iframe.style.cssText += "width:100% !important; height:300px !important; border: solid 1px gray; padding: 10px;";
            
            var qmmain = document.getElementById('qm-main');
            
            theDiv.insertBefore(iframe, qmmain);

            var closeButton = document.createElement("input");

            closeButton.type = "button";
            closeButton.value = "Close";
            closeButton.style.cssText += "width: 100%; margin-bottom: 20px; border-width: 1px; height: 30px;";
            
            closeButton.onclick = function(){
                theDiv.removeChild(closeButton);
                theDiv.removeChild(hr);
                theDiv.removeChild(iframe);

                window.qmSetupOnIonic();
            };

            theDiv.insertBefore(closeButton, qmmain);

            var hr = document.createElement('hr');
            theDiv.insertBefore(hr, qmmain);

            showLoader(false);

        } else {
            window.location = targetUrl;
        }
    }

    function addFieldsFromConnectButton(button, block, instructions) {
        for (var i in instructions.parameters) {
            if (instructions.parameters.hasOwnProperty(i)) {
                var parameter = instructions.parameters[i];
                var fields = block.querySelector('.qm-account-block-fields');
                var span = document.createElement('span');
                span.setAttribute('class', 'qm-account-block-field-text');
                span.innerHTML = parameter['displayName'];
                var input = document.createElement('input');
                input.setAttribute('type', parameter['type']);
                input.value = parameter['defaultValue'];
                input.setAttribute('name', parameter['key']);
                input.setAttribute('placeholder', parameter['placeholder']);
                input.setAttribute('class', 'qm-account-block-field-input');
                fields.appendChild(span);
                fields.appendChild(input);
                fields.appendChild(document.createElement('br'));
                addClass(button, 'qm-account-connect-button-with-params');

                input.addEventListener('keypress', function (event) {

                    if (event.keyCode == 13) {

                        var block = closest(event.target, '.qm-account-block');
                        var connectButton = block.getElementsByClassName('qm-account-connect-button')[0];

                        if (connectButton) {
                            connectButton.click();
                        }

                    }
                });
            }
        }
    }

    function renderMain() {
        var renderedBlock;
        mainDiv.innerHTML = '';

        for (var key in listData) {
            if (listData.hasOwnProperty(key)) {
                renderedBlock = template(templateConnectBlock, listData[key]);
                mainDiv.innerHTML += renderedBlock;
            }
        }

        if (methodsDelegated) {
            return;
        }

        delegateSelector('#qm-main', 'click', '.qm-account-connect-button', function (event) {
            event.preventDefault();
            var block = closest(event.target, '.qm-account-block');
            var name = block.getAttribute('data-name');
            var instructions = listData[name].connectInstructions;
            var hasParameters = countObjectAttributes(instructions.parameters);
            if (useConnectionWindow && !hasParameters) {
                showLoader(true);
                showAuthWindow(instructions.url);
                waitForAccount(function () {
                    if (listData[name] && listData[name].connected) {
                        showLoader(false);
                        renderMain();
                        clearIntervals();
                    }
                });
            } else {
                if (hasParameters && !hasClass(event.target, 'qm-account-connect-button-with-params')) {
                    addFieldsFromConnectButton(event.target, block, instructions);
                } else {
                    showLoader(true);
                    redirectFromConnectButton(event.target, block, instructions.url);
                }
            }
        });

        delegateSelector('#qm-main', 'click', '.qm-account-disconnect-button', function (event) {
            event.preventDefault();
            showLoader(true);
            var block = closest(event.target, '.qm-account-block');
            var name = block.getAttribute('data-name');
            apiCall('GET', '/api/v1/connectors/' + name + '/disconnect', function () {
                loadConnectors(function () {
                    if (listData[name] && !listData[name].connected) {
                        showLoader(false);
                        renderMain();
                        clearIntervals();
                    }
                });
            });
        });

        delegateSelector('#qm-main', 'click', '.qm-account-sync-button', function (event) {
            event.preventDefault();
            var block = closest(event.target, '.qm-account-block');
            var name = block.getAttribute('data-name');
            (function (target) {
                target.innerHTML = 'Scheduling...';
                apiCall('GET', '/api/v1/connectors/' + name + '/update', function () {
                    loadConnectors(function () {
                        if (listData[name] && listData[name].connected) {
                            target.innerHTML = 'Update Scheduled';
                            renderMain();
                            clearIntervals();
                        }
                    });
                });
            })(event.target);
        });

        delegateSelector('#qm-main', 'click', '.qm-account-scheduled-button', function (event) {
            event.preventDefault();
            return false;
        });

        methodsDelegated = true;
    }

    function showLoader(show) {
        var loader = document.getElementById('qm-loader-wrapper');

        if (!loader) {
            var loaderWrapper = document.createElement('div');
            loaderWrapper.style.display = 'flex';
            loaderWrapper.style['align-items'] = 'center';
            loaderWrapper.style['justify-content'] = 'center';
            loaderWrapper.style.position = 'absolute';
            loaderWrapper.style.top = '0';
            loaderWrapper.style.left = '0';
            loaderWrapper.style.height = '100%';
            loaderWrapper.style.width = '100%';
            loaderWrapper.style['background-color'] = 'rgba(255, 255, 255, 0.75)';
            loaderWrapper.style['z-index'] = '30';
            loaderWrapper.setAttribute('id', 'qm-loader-wrapper');

            var img = document.createElement('img');
            img.src = 'https://app.quantimo.do/qm-connect/loader_gears.gif';
            img.setAttribute('id', 'qm-loader');
            img.style['z-index'] = '31';

            loaderWrapper.appendChild(img);
            document.body.appendChild(loaderWrapper);

            loader = document.getElementById('qm-loader-wrapper');
        }
        if (show) {
            loader.style.display = 'flex';
        } else {
            loader.style.display = 'none';
        }
    }

    function waitForAccount(callback) {
        // clear old intervals
        clearIntervals();

        // set new interval to check connection
        callbackInterval = setInterval(function () {
            loadConnectors(callback);
        }, 3000);

        // stop refreshing the API after 2 minutes
        callbackCancelTimeout = setTimeout(function () {
            clearIntervals();
            // TODO error message
        }, 120000);
    }

    function clearIntervals() {
        clearInterval(callbackInterval);
        callbackInterval = null;
        clearTimeout(callbackCancelTimeout);
    }

    function showAuthWindow(url) {
        var authWindow;
        var windowSize = {
            width: Math.floor(window.outerWidth * 0.8),
            height: Math.floor(window.outerHeight * 0.7)
        };
        if (windowSize.height < 500) {
            windowSize.height = Math.min(500, window.outerHeight);
        }
        if (windowSize.width < 800) {
            windowSize.width = Math.min(800, window.outerWidth);
        }
        windowSize.left = window.screenX + (window.outerWidth - windowSize.width) / 2;
        windowSize.top = window.screenY + (window.outerHeight - windowSize.height) / 8;
        var windowOptions = "width=" + windowSize.width + ",height=" + windowSize.height;
        windowOptions += ",toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0";
        windowOptions += ",left=" + windowSize.left + ",top=" + windowSize.top;

        authWindow = window.open(url, "Authorization", windowOptions);
        if (authWindow) {
            authWindow.focus();
        }
        return authWindow;
    }

    // TODO default error handler function

})();
