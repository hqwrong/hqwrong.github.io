/**
 * Created
 */

$(function(){
    var weixinShareClass = '_share_weixin';
    var isWeixinBrowser = (function(){
        var ua = navigator.userAgent.toLowerCase();
        if(ua.match(/MicroMessenger/i)=="micromessenger") {
            return true;
        } else {
            return false;
        }
    })();
    $('.'+weixinShareClass).click(function(){
        if (isWeixinBrowser) {
            var layer = $('#__for_share');
            if(!layer.length){
                var div = document.createElement('div');
                div.id = '__for_share';
                $(div).html('<div class="share_img"></div>').hide().appendTo(document.body);
                layer = $('#__for_share');
                layer.click(function(){
                    layer.hide();
                });
            }
            layer.show();
        }
    });
});
