var timer = null, ad_time = 5, ad_time_auto = 10, logintype = "";
var _peerId = '', _peerNum = 0, _totalP2PDownloaded = 0, _totalP2PUploaded = 0;
$app = true;
$ios = false;
try {
    window.jsBridgeInstance.sendMessage("inApp", "", "");
}catch (e) {
    $app = false;
}
if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
    $ios = true;
}
$(function(){
    var refreshHtml = '<div style="\n' +
        '    position: fixed;\n' +
        '    right: 0;\n' +
        '    bottom:  160px;\n' +
        '    z-index: 2147483647;\n' +
        '">\n' +
        '        <button onclick="window.location.reload()" type="button" class="btn red-pale text-tint" style="\n' +
        '    /* z-index: 99999; */\n' +
        '    /* position: fixed; */\n' +
        '    /* bottom: 160px; */\n' +
        '    /* right: 0; */\n' +
        '"><i class="icon icon-refresh"></i></button>\n' +
        '    </div>';
    if($app){
        $("body").append(refreshHtml)
    }
    $(".comment-line").css("cssText", "bottom:"+parseInt($(window).width()/375*88)+"px !important")
    $(".pagination-fixed.has-ad .pagination").css("cssText", "bottom:0px !important")
})


function setPlayer(res){
    if (self !== top) {
        return
    }
    if(res.code === 1){
        var source = res.data;
        var poster = poster_url;
        // if($app){
        //   $('.player').append('<img src="' + poster + '" class="video-thumb" />');
        //   startPlayerAd(function(){
        //     var list = {
        //       auto: source,
        //       high: 'nil',
        //       mid: 'nil',
        //       low: 'nil'
        //     }
        //     const default_url = source.split('/').slice(0,-1).join('/')
        //     try {
        //       $.get(source, function(res){
        //         const temp_arr = res.split('\n');
        //         temp_arr.map(function(item, k){
        //           if(k%2 === 1){
        //             const name = item.match(/NAME="(.*?)"/);
        //             const qingxidu = parseInt(name[1]);
        //             const string = source.split('?');
        //             const qingxidu_name = [default_url, temp_arr[k+1].split('.')[0]+'.m3u8?'+string[1]].join('/');
        //             if(qingxidu === 720){
        //               list.high = qingxidu_name;
        //             }
        //             if(qingxidu === 480){
        //               list.mid = qingxidu_name;
        //               if(list.auto === 'nil'){
        //                 list.auto = qingxidu_name
        //               }
        //             }
        //             if(qingxidu === 360){
        //               list.low = qingxidu_name;
        //               if(list.auto === 'nil'){
        //                 list.auto = qingxidu_name
        //               }
        //             }
        //             if(qingxidu === 240){
        //               if(list.auto === 'nil'){
        //                 list.auto = qingxidu_name
        //               }
        //             }
        //           }
        //         })
        //         const playurl = [list.auto, list.high, list.mid, list.low].join('$')
        //         window.jsBridgeInstance.sendMessage("play", playurl, that.item.title);
        //       })
        //     }
        //     catch (e) {
        //       alert([e, "play", 'https:' + source, that.item.title].join('|'))
        //     }
        //   })
        //   return
        // }

        var video = document.createElement('Video');
        window.video = video;
        video.poster = poster;
        video.src = source;
        video.controls = 'controls';
        video.playsinline = true;
        $('.player .van-loading').hide();
        $('#player').append(video);
        $(video).attr("playsinline","")
        try {
            if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
                throw "iphone";
            }
            // For more options see: https://github.com/sampotts/plyr/#options
            // captions.update is required for captions to work with hls.js
            if (!Hls.isSupported()) {
                video.src = source;
            }
            else {
                let player = new Plyr(video, {
                    poster: poster,
                    invertTime: false,
                    fullscreen: {
                        enabled: true,
                        fallback: true,
                        iosNative: true
                    }
                });
                let hls = new Hls({
                    xhrSetup: player.Xhr,
                    maxBufferLength: 30,
                    maxMaxBufferLength: 30,
                });
                hls.loadSource(source);
                hls.attachMedia(video);

                window.hls = hls;
                window.player = player;
                player.on('ready', function () {
                    var stadiv = '<div id="stats" style="top: 0; width:100%; position: absolute; background: rgba(0,0,0,0.2); color: #fff; font-size: 12px; z-index: 2"></div>'
                    var timediv = "<div class=\"showTime\">00:00 / 00:00</div>"
                    $('.player div.plyr').append(stadiv+timediv);
                    $('.player video').show()
                })
            }
        }catch (e) {
            console.log(e)
        }
    }else{
        $('#player').append(res.msg);
    }
}

function setLivePlayer(){
    var source = m3u8_url;
    var poster = poster_url;
    var video = document.createElement('Video');
    window.video = video;
    video.poster = poster;
    video.src = source;
    video.controls = 'controls';
    video.playsinline = true;
    $('.player .van-loading').hide();
    $('#player').html(video);
    try {
        if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
            throw "iphone";
        }
        if (!Hls.isSupported()) {
            video.src = source;
        }
        else {
            var showloading = true;
            var hls = new Hls({
                p2pConfig: {
                    // logLevel: true,
                    live: false,
                    // Other p2pConfig options provided by CDNBye
                    segmentId: function (level, sn, tsUrl) {
                        // const formatedUrl = `${level}-${sn}`;  // 默认实现
                        return tsUrl;
                    },
                    wsSignalerAddr: 'wss://p.yase8.com',
                },
            });
            hls.loadSource(source);
            hls.attachMedia(video);

            window.hls = hls;
            var player = new Plyr(video, {
                poster: poster,
                fullscreen: {
                    enabled: true,
                    fallback: true,
                    iosNative: true
                },
            });
            window.player = player;
            player.on('ready', function () {
                var stadiv = '<div id="stats" style="top: 0; width:100%; position: absolute; background: rgba(0,0,0,0.2); color: #fff; font-size: 12px; z-index: 2"></div>'
                $('#player > div.plyr').append(stadiv);
                $('.player video').show()
            })
        }
    }catch (e) {
        console.log(e)
    }
}
function setAd(res){
    if(res.code === 1){
        var ad_top_list = [];
        var ad_top_list_bocai = [];
        var ad_top_list_bocai_temp = [];
        var ad_top_list_bocai_temp2 = [];
        var ad_top_list_arr = [];
        //顶部广告位 13
        var ad_list_list = [];
        //列表随机广告  2
        var ad_player_list = [];
        //视频播放器广告 19
        var ad_player_bottom_list = [];
        //视频播放器底部广告 7
        var ad_wap_fixed_bottom_list = [];
        //视频播放器底部广告 7
        res.data.forEach(function(item, key){
            if(parseInt(item.pid) === 13){
                if(typeof(ad_top_list[item.group_num]) === "undefined"){
                    ad_top_list[item.group_num] = []
                }
                if(typeof(ad_top_list_bocai_temp[item.group_num]) === "undefined"){
                    ad_top_list_bocai_temp[item.group_num] = []
                }
                ad_num = Math.ceil(item.height / 60)
                if(item.group_num > 0){
                    ad_top_list[item.group_num].push(item)
                    ad_top_list_bocai_temp[item.group_num].push(item)
                }else{
                    var i = 0;
                    while(i < ad_num){
                        ad_top_list[item.group_num].push(item)
                        i++;
                    }
                    ad_top_list_bocai_temp[item.group_num].push(item)
                }
                // ad_top_list_bocai.push(item)
            }else if(parseInt(item.pid) === 2){
                ad_list_list.push(item)
            }else if(parseInt(item.pid) === 19){
                ad_player_list.push(item)
            }else if(parseInt(item.pid) === 7){
                ad_player_bottom_list.push(item)
            }else if(parseInt(item.pid) === 24){
                ad_wap_fixed_bottom_list.push(item)
            }
        })

        ad_top_list.forEach(function(item,key){
            if(key === 0){
                item.forEach(function(x, j) {
                    ad_top_list_arr.push(x)
                })
            }else{
                ad_num = 0
                item.forEach(function(x, j){
                    ad_num += Math.ceil(x.height / 60)
                })
                var i = 0;
                while(i < ad_num){
                    ad_top_list_arr.push(item)
                    i++;
                }
            }
        })
        ad_top_list_arr = shuffle(ad_top_list_arr.derangedArray())
        if($("#list_asiall").length > 0){
            ad_top_list_bocai_temp.forEach(function(item,key){
                ad_top_list_bocai_temp2.push(item)
            })
            ad_top_list_bocai_temp2 = shuffle(ad_top_list_bocai_temp2.derangedArray())
            ad_top_list_bocai_temp2.forEach(function(item,key){
                if(key === 0){
                    item.forEach(function(x, j) {
                        ad_top_list_bocai.push(x)
                    })
                }else{
                    ad_top_list_bocai.push(item)
                }
            })
            getAllListHtml(ad_top_list_bocai, "list_asiall")
        }
        var tadi = Math.floor((Math.random()*ad_top_list_arr.length));
        var tad = ad_top_list_arr[tadi]
        ad_top_list_arr.remove(tadi)
        getAdHtml(tad, si1)
        var badi = Math.floor((Math.random()*ad_top_list_arr.length));
        tad = ad_top_list_arr[badi]
        ad_top_list_arr.remove(badi)
        getAdHtml(tad, si2)
        if(typeof(si5) !== "undefined" && si5 !== "" && $("#"+si5).length > 0){
            var badi2 = Math.floor((Math.random()*ad_top_list_arr.length));
            tad = ad_top_list_arr[badi2]
            ad_top_list_arr.remove(badi2)
            getAdHtml(tad, si5)
        }
        if(typeof(si4) !== "undefined" && si4 !== "" && $("#"+si4).length > 0) {
            getAdHtml(ad_player_bottom_list, si4)
        }
        if($("#fixedas").length > 0) {
            var badi2 = Math.floor((Math.random()*ad_wap_fixed_bottom_list.length));
            tad = ad_wap_fixed_bottom_list[badi2]
            if (typeof(tad) != "undefined") {
                getAdBottomFixedHtml(tad, "fixedas");
            }
        }
        if(ad_list_list.length > 0 && $("#list_asi").length > 0)
        {
            ad_list_list = shuffle(ad_list_list.derangedArray())
            getRandListHtml(ad_list_list, "list_asi")
        }
        if(ad_top_list_arr.length > 0 && $("#list_asip").length > 0){
            getRandListHtmlPic(ad_top_list_arr, "list_asip")
        }
        if(ad_top_list_arr.length > 0 && $("#list_asin").length > 0){
            getRandListHtmlNovel(ad_top_list_arr, "list_asin")
        }
        if(ad_top_list_arr.length > 0 && $("#list_asic").length > 0){
            getRandListHtmlComic(ad_top_list_arr, "list_asic")
        }
        if($("#player").length > 0){
            ad_player_list = shuffle(ad_player_list.derangedArray())
            setPlayerAd(ad_player_list)
        }
        $(".aasdwa").click(function(){
            id = $(this).attr("data-id")
            $.get("/api/aaaac/add_viewnum",{id: id})
        })
    }
}
function setPlayerAd(list){
    var div = document.createElement("div")
    div.id = si3
    $(div).append("<span class='closead'>关闭广告</span>");
    $(div).css({
        'width': '100%',
        'height': '100%',
        'background': '#010',
        'position': 'absolute',
        'z-index': 1001,
        'text-align': 'center',
        'top': 0,
        'display': 'flex',
        'justify-content': 'center',
        'align-items': 'center'
    });
    $(div).find("a").first().css({
        'margin-right': 10
    });
    $("#player").append(div)
    $(div).find("a").css({
        'display': 'inline-block',
        'position': 'relative',
        'width': "48%",
        'margin': "1%",
        'overflow': "hidden",
        'background-size': '100% 100%',
        'background-position': 'center center',
        'background-repeat': 'no-repeat'
    });
    for(k in list){
        var item = list[k];
        if(item.pic){
            $(div).append(getPlayerAdItemHtml(item));
        }
    }
    setHref()
    startPlayerAd()
    function startPlayerAd(){
        timer && clearTimeout(timer)
        timer = setTimeout(function(){
            $('#player .closead').click(function(){
                if(ad_time < 0) {
                    $(div).remove()
                    timer && clearTimeout(timer)
                    ad_time = 0
                    ad_time_auto = 0
                    try{
                        player.play()
                    }catch(e){

                    }
                }
            })
            stopPlayerAd();
        }, 300);
    }
    function stopPlayerAd(){
        if (ad_time_auto <= 0) {
            $(div).remove();
            timer && clearTimeout(timer)
            return;
        } else if (ad_time_auto > 0) {
            if(ad_time > 0){
                $('#player .closead').html(ad_time+'秒 | 关闭广告' );
            }else{
                $('#player .closead').html('关闭广告' );
            }
        }
        ad_time--;
        ad_time_auto--;
        timer && clearTimeout(timer)
        timer = setTimeout(function() {
            stopPlayerAd()
        }, 1000);
    }
}
function getAllListHtml(ad, obj){
    var object = $("#" + obj)
    if(object.length > 0){
        var html = "";
        for(var i = 0; i < ad.length; i++){
            if(ad.length > 0) {
                var list_ad = ad[i]
                html += getAdHtmlValue(list_ad)
            }
        }
        $("#"+obj).html(html)
        setHref()
    }
}
function getRandListHtml(ad, obj){
    var object = $("#" + obj)
    var len = object.find("div.video-item").length;
    var adlength = 5;
    if(object.hasClass("video-list")){
        adlength = 4;
    }
    adRand = len / adlength;
    for(i = 0; i < adlength; i++){
        if(ad.length > 0){
            var s = GetRandomNum(i*adRand, (i+1)*adRand) + i
            randi = Math.floor((Math.random()*ad.length));
            var list_ad = ad[randi]
            ad.remove(randi)
            object.find("div.video-item").eq(s-1).before(getVideoListItemAd(list_ad))
        }
        setHref()
    }
}
function getRandListHtmlPic(ad, obj){
    var object = $("#" + obj)
    if(object.length > 0){
        for(var i = 0; i < 4; i++){
            if(ad.length > 0) {
                var s = (i+1)*9 + i
                randi = Math.floor((Math.random()*ad.length));
                var list_ad = ad[randi]
                ad.remove(randi)
                object.find("li").eq(s).after(getAdHtmlValue(list_ad))
            }
        }
        setHref()
    }
}

function getRandListHtmlNovel(ad, obj){
    var object = $("#" + obj)
    if(object.length > 0){
        for(var i = 0; i < 4; i++){
            console.log(i)
            if(ad.length > 0) {
                var s = (i+1)*7 + i
                randi = Math.floor((Math.random()*ad.length));
                var list_ad = ad[randi]
                ad.remove(randi)
                object.find("li").eq(s).after(getAdHtmlValue(list_ad))
            }
        }
        setHref()
    }
}

function getRandListHtmlComic(ad, obj){
    var object = $("#" + obj)
    if(object.length > 0){
        for(var i = 0; i < 4; i++){
            if(ad.length > 0) {
                var s = (i+1)*11 + i
                randi = Math.floor((Math.random()*ad.length));
                var list_ad = ad[randi]
                ad.remove(randi)
                object.find("li").eq(s).after(getAdHtmlValue(list_ad))
            }
        }
        setHref()
    }
}
function getAdHtmlValue(ad, obj){
    var html = "";
    if(Array.isArray(ad)){
        for(i of ad){
            html += getAdItemHtml(i)
        }
    }else{
        html += getAdItemHtml(ad)
    }
    return "<div class='space-sm'>"+html+"</div>"
}
Array.prototype.remove = function(dx) {

    if(isNaN(dx) || dx > this.length){
        return false;
    }

    for(var i = 0,n = 0;i < this.length; i++) {
        if(this[i] != this[dx]) {
            this[n++] = this[i];
        }
    }
    this.length -= 1;
};
function getVideoListItemAd(item){
    var html = '<div class="video-item space-sm">\n' +
        '        <div class="white">\n' +
        '            <a href="[URL]" class="aasdwa" data-id="'+item.id+'" target="_blank" class="video-thumb">\n' +
        '                <div class="video-thumb">\n' +
        '                    <div\n' +
        '                        class="lazy video-thumb-image"\n' +
        '                        style="background-image: url(\'[IMG]\');"\n' +
        '                    ></div>\n' +
        '                    <div class="video-item-tags flex space-between">\n' +
        '                        <div>\n' +
        '                            <span class="video-tuijian">推荐</span>\n' +
        '                        </div>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '            </a>\n' +
        '            <div class="video-item-title">\n' +
        '                <a class="aasdwa" data-id="'+item.id+'" href="[URL]" target="_blank">[TITLE]</a>\n' +
        '            </div>\n' +
        '            <div class="video-nums">\n' +
        '                <i class="iconfont iconplay_icon_view"></i> '+GetRandomNum(1,99)+'万<span class="split-line">-</span><i class="icon icon-thumbs-o-up"></i>'+GetRandomNum(1,99)+'万\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>';
    return html.replace(/\[IMG\]/g, item.pic).
    replace(/\[TITLE\]/g, item.list_title).
    replace(/\[URL\]/g, item.url)
}
function GetRandomNum(Min,Max){
    var Range=Max-Min;
    var Rand=Math.random();
    return(Min+Math.round(Rand*Range));
}
function getAdHtml(ad, obj){
    var html = "";
    if(Array.isArray(ad)){
        for(i of ad){
            html += getAdItemHtml(i)
        }
    }else{
        html += getAdItemHtml(ad)
    }
    $("#"+obj).html(html)
    setHref()
}
function getAdBottomFixedHtml(ad, obj){
    var html = getAdBottomFixedItemHtml(ad)
    $("#"+obj).html(html)
    setHref()
}
function getAdBottomFixedItemHtml(i){
    if(i.code_touch){
        return i.code_touch
    }else {
        return "<div><a class='aasdwa' data-id='" + i.id + "' target='_blank' href='" + i.url + "'><img style='width:100%; height:100px;' src='" + i.pic_touch + "' /></a></div>"
    }
}
function getAdItemHtml(i){
    if(i.code_touch){
        return i.code_touch
    }else{
        return "<div><a class='aasdwa' data-id='"+i.id+"' target='_blank' href='"+i.url+"'><img style='width:100%; height:"+i.height+"px;' src='"+i.pic_touch+"' /></a></div>"
    }
}
function getPlayerAdItemHtml(i){
    return "<a class='aasdwa' data-id='"+i.id+"' style='width:48%; margin: 1%;' target='_blank' href='"+i.url+"'><img style='width:100%;' src='"+i.pic_touch+"' /></a>"
}
if (!Array.prototype.derangedArray) {
    Array.prototype.derangedArray = function() {
        for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
        return this;
    };
}
function shuffle(arr) {
    var len = arr.length;
    for (var i = 0; i < len - 1; i++) {
        var index = parseInt(Math.random() * (len - i));
        var temp = arr[index];
        arr[index] = arr[len - i - 1];
        arr[len - i - 1] = temp;
    }
    return arr;
}
