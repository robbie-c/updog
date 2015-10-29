var errors = require('../../common/errors');

function doApiCallInner(url, data, callback) {

    var ajaxSuccess = function (callback, rawResponseData) {
        var status = rawResponseData.status;
        var data = rawResponseData.data;
        var rawError = rawResponseData.error;

        if (status === 'success') {
            callback(null, data);
        } else {
            // even though the AJAX call succeeded, the API call failed
            var error = errors.deserializeError(rawError);
            callback(error);
        }
    }.bind(undefined, callback);

    var ajaxError = function (callback, jqXHR, textStatus, errorThrown) {
        var error = new Error(errorThrown);
        callback(error);
    }.bind(undefined, callback);

    $.ajax({
        url: url,
        data: JSON.stringify({
            data: data
        }),
        success: ajaxSuccess,
        error: ajaxError,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8'
    })
}

function doApiCall(url, data, callback) {
    if (!callback) {
        return new Promise(function (resolve, reject) {
            doApiCallInner(url, data, function (err, resp) {
                if (err) {
                    reject(err);
                } else {
                    resolve(resp);
                }
            });
        });
    } else {
        doApiCallInner(url, data, callback);
    }
}

module.exports = {
    doApiCall: doApiCall
};
