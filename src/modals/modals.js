$(document).ready(function () {
    function swalIframeOptions(path){
        return {
            showCancelButton: true,
            showConfirmButton: false,
            html: '<iframe width="100%" height="300" src="//web.quantimo.do/'+path+'" frameborder="0"></iframe>'
        }
    }
    function fireIframe(path){
        Swal.fire(swalIframeOptions(path));
    }
    $('#popup-button').click(() => {
        fireIframe('android_popup.html')
    });
    $('#full-inbox-button').click(() => {
        fireIframe('#/app/reminders-inbox')
    });
    $('#compact-inbox-button').click(() => {
        fireIframe('#/app/reminders-inbox-compact')
    });
});
