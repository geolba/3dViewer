// Filename: logger.js -> static class
define([], function () {

    var error = function (msg, showtoast) {
        //if (showtoast) {
        //    toastr.options = {
        //        "closeButton": true,
        //        "debug": false,
        //        "positionClass": "toast-bottom-full-width",
        //        "onclick": null,
        //        "showDuration": "300",
        //        "hideDuration": "1000",
        //        "timeOut": "300000",
        //        "extendedTimeOut": "1000",
        //        "showEasing": "swing",
        //        "hideEasing": "linear",
        //        "showMethod": "fadeIn",
        //        "hideMethod": "fadeOut"
        //    };
        //    toastr.error(msg);
        //}
        console.error(msg);
    };

    var info = function (msg, showtoast) {
        //if (showtoast) {
        //    toastr.options = {
        //        "closeButton": false,
        //        "debug": false,
        //        "positionClass": "toast-bottom-right",
        //        "onclick": null,
        //        "showDuration": "300",
        //        "hideDuration": "1000",
        //        "timeOut": "5000",
        //        "extendedTimeOut": "1000",
        //        "showEasing": "swing",
        //        "hideEasing": "linear",
        //        "showMethod": "fadeIn",
        //        "hideMethod": "fadeOut"
        //    };
        //    toastr.info(msg);
        //}
        console.info(msg);
    };

    var warning = function (msg, showtoast) {
        //if (showtoast) {
        //    toastr.options = {
        //        "closeButton": false,
        //        "debug": false,
        //        "positionClass": "toast-bottom-right",
        //        "onclick": null,
        //        "showDuration": "200",
        //        "hideDuration": "1000",
        //        "timeOut": "5000",
        //        "extendedTimeOut": "1000",
        //        "showEasing": "swing",
        //        "hideEasing": "linear",
        //        "showMethod": "fadeIn",
        //        "hideMethod": "fadeOut"
        //    };
        //    toastr.warning(msg);
        //}
        console.warn(msg);
    };

    var success = function (msg, showtoast) {
        //if (showtoast) {
        //    toastr.options = {
        //        "closeButton": false,
        //        "debug": false,
        //        "positionClass": "toast-bottom-right",
        //        "onclick": null,
        //        "showDuration": "300",
        //        "hideDuration": "1000",
        //        "timeOut": "5000",
        //        "extendedTimeOut": "1000",
        //        "showEasing": "swing",
        //        "hideEasing": "linear",
        //        "showMethod": "fadeIn",
        //        "hideMethod": "fadeOut"
        //    };
        //    toastr.success(msg);
        //}
        console.info(msg);
    };

    return {
        error: error,
        info: info,
        warning: warning,
        success: success
    };

});