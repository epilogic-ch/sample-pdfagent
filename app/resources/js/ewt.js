const ewt = {
    // effectue un submit standard sur /web
    submit: function(action, params, context, event) {
        if (event && event.ctrlKey) {

            document.getElementById('form').setAttribute('target', '_blank');  
            event.preventDefault();
        }

        let command = {};
        command.action = action;
        command.params = params;

        document.getElementById('ewt_command').value = JSON.stringify(command);

        document.getElementById('form').submit();
        document.getElementById('form').removeAttribute('target');
    },

    // effectue un submit sur /web via XMLHttpRequest
    ajax: function(action, params, context, options) {
        if (action) {
            let command = {};
            command.action = action;
            command.params = params;

            document.getElementById('ewt_command').value = JSON.stringify(command);
        }

        const hiddenFields = new FormData();
        document.querySelectorAll('.ewt-hidden-field').forEach(function(element) {
            if (element.name) { // Vérifie que l'élément a un nom
                if (element.type === 'checkbox' || element.type === 'radio') {
                    if (element.checked) {
                        hiddenFields.append(element.name, element.value);
                    }
                }
                else {
                    hiddenFields.append(element.name, element.value);
                }
            }
        });

        options = extend({
            method: 'POST',
            url: window.location.pathname,
            asynchronous: true,
            body: hiddenFields,
            headers: undefined,
            timeout: 2500,  // on met un timeout histoire de ne pas générer d'erreur 502 dans le cas de traitements longs
            onLoad: undefined,
            onLoadStart: undefined,
            onLoadEnd: undefined,
            onError: undefined,
            onAbort: undefined,
            onTimeout: undefined,
            onProgress: undefined,
            onReadyStateChange: undefined,
            withCredentials: undefined,
            responseType: undefined
        }, (options || {}));

        var xhr = new XMLHttpRequest();
        if (options.withCredentials != undefined) xhr.withCredentials = options.withCredentials;
        if (options.responseType != undefined) xhr.responseType = options.responseType;
        xhr.open(options.method, options.url, options.asynchronous);

        if (options.headers) {
            for (const [key, val] of Object.entries(options.headers)) {
                xhr.setRequestHeader(key, val);
            };
        }

        if (options.onLoad) xhr.onload = function(e) { options.onLoad(xhr, e) };
        if (options.onLoadStart) xhr.onloadstart = function(e) { options.onLoadStart(xhr, e) };
        if (options.onLoadEnd) xhr.onloadend = function(e) { options.onLoadEnd(xhr, e) };
        if (options.onError) xhr.onerror = function(e) { options.onError(xhr, e) };
        if (options.onAbort) xhr.onabort = function(e) { options.onAbor(xhr, e) };
        if (options.onTimeout && options.timeout > 0) {
            xhr.timeout = options.timeout;
            xhr.ontimeout = function(e) { options.onTimeout(xhr, e) };
        }
        if (options.onProgress) xhr.onprogress = function(e) { options.onProgress(xhr, e) };
        if (options.onReadyStateChange) xhr.onreadystatechange = function(e) { options.onReadyStateChange(xhr, e) };

        xhr.send(options.body);
    },

    /*
     * Effectue un appel REST (servlet /rest) via XMLHttpRequest
     * Exemple:
     *   ewt.rest({
     *     url: "../rest/" + appSettings.application + "/toolboxClient?action=download&idEntry=" + idEntry,
     *     body: new FormData(form),
     *     responseType: 'blob',
     *     onLoad: function(xhr) {
     *         if (xhr.status == 200) {
     *             console.log(xhr.response);
     *             // ...
     *         }
     *         else {
     *             alert("Erreur rencontrée lors du téléchargement");
     *         }
     *     }
     *   })
     */
    rest: function(options, context) {
        var defaultHeaders = { "x-ewt-sessionid": document.getElementById('ewt_sessionid').value };

        options = extend({
            method: 'POST',
            url: window.location.pathname,
            asynchronous: true,
            body: undefined,
            headers: defaultHeaders,
            timeout: 2500,  // on met un timeout histoire de ne pas générer d'erreur 502 dans le cas de traitements longs
            onLoad: undefined,
            onLoadStart: undefined,
            onLoadEnd: undefined,
            onError: undefined,
            onAbort: undefined,
            onTimeout: undefined,
            onProgress: undefined,
            onReadyStateChange: undefined,
            withCredentials: undefined,
            responseType: undefined
        }, (options || {}));

        var xhr = new XMLHttpRequest();
        if (options.withCredentials != undefined) xhr.withCredentials = options.withCredentials;
        if (options.responseType != undefined) xhr.responseType = options.responseType;
        xhr.open(options.method, options.url, options.asynchronous);

        if (options.headers) {
            for (const [key, val] of Object.entries(options.headers)) {
                xhr.setRequestHeader(key, val);
            };
        }

        if (options.onLoad) xhr.onload = function(e) { options.onLoad(xhr, e) };
        if (options.onLoadStart) xhr.onloadstart = function(e) { options.onLoadStart(xhr, e) };
        if (options.onLoadEnd) xhr.onloadend = function(e) { options.onLoadEnd(xhr, e) };
        if (options.onError) xhr.onerror = function(e) { options.onError(xhr, e) };
        if (options.onAbort) xhr.onabort = function(e) { options.onAbor(xhr, e) };
        if (options.onTimeout && options.timeout > 0) {
            xhr.timeout = options.timeout;
            xhr.ontimeout = function(e) { options.onTimeout(xhr, e) };
        }
        if (options.onProgress) xhr.onprogress = function(e) { options.onProgress(xhr, e) };
        if (options.onReadyStateChange) xhr.onreadystatechange = function(e) { options.onReadyStateChange(xhr, e) };

        xhr.send(options.body);
        return xhr;
    },

    data: function(options, context) {
        options = extend({
            method: 'GET',
            url: appSettings.contextPath + '/data/' + appSettings.application,
            withCredentials: true,
            responseType: 'blob',
            onLoad: function(xhr, e) {
                if (xhr.status === 200) {
                    this.data(xhr, e, this);
                }
            }
        }, (options || {}));

        this.rest(options, context);
    },
};

function extend(target, ...sources) {
    sources.forEach(source => {
        for (let key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    });
    return target;
}