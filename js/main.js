_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};
var playCtrl = $("#playerCtrl"),
    musicList = $("#music_list"),
    playerProgress = $("#playerProgress"),
    playInfo = $(".playing_info"),
    album_art = $(".album_art"),
    lyric_wrap = $(".lyric_wrap"),
    lyric = lyric_wrap.find("#lyric");
$(document).ready(onReady);
function onReady(){
    getPlayList();
    initPlayerProgress();
    initPlayCtrl();
    $player.bind("error",function(e){
        alert(e.message);
    });
}

function initPlayerProgress(){
    var total =  playerProgress.find(".totalTime"),
        current = playerProgress.find(".currentTime");
    $player.bind("timeupdate",function(){
        var currentTime = this.currentTime,
            duration = this.duration;
        $progressbar.setProgress(currentTime/duration*100);
        current.html(parseTime(currentTime));
    });
    $player.bind("playing",function(){
        $progressbar.slideable = true;
        musicList.find(".selected").addClass("playing");
        playCtrl.find(".play").addClass("playing");
        total.html(parseTime(this.duration));
        renderInfo($player.music);
        renderLyric($player.music);
    });
    $player.bind("pause ended",function(evt){
        musicList.find(".selected").removeClass("playing");
        playCtrl.find(".play").removeClass("playing");
        album_art.removeClass("active");
        if(evt.type == "ended"){
            $progressbar.slideable = false;
            $player.unbind("timeupdate",updateLyric);
            text_temp = undefined;
        }
    });
    $progressbar.bind("change",function(){
        if(!$player.music)return;
        var p = $progressbar.progress;
        var time = $player.geDuration()*(p/100);
        $player.seekTo(time);
        console.log(time)
    });
    function parseTime(time){
        var min = String(parseInt(time/60)),
            sec = String(parseInt(time%60));
        if(min.length==1)min = "0"+min;
        if(sec.length==1)sec = "0"+sec;
        return min+":"+sec;
    }
}

function renderInfo(music){
    playInfo.find(".songName").html(music.name);
    playInfo.find(".singer").html(music.singer);
    album_art.addClass("active");
    album_art.find(".cover").attr("src",music.cover);
    var infoTemp = _.template($("#music_info").html());
    $(".music_info").html(infoTemp(music));
}

function renderLyric(music){
    lyric.html("");
    var lyricLineHeight = 27,
        offset = lyric_wrap.offset().height*0.4;
    music.lyric.fetch(function(data){
        music.lyric.parsed = {};
        var i = 0;
        for(var k in data){
            var txt = data[k];
            if(!txt)txt = "&nbsp;";
            music.lyric.parsed[k] = {
                index:i++,
                text:txt,
                top: i*lyricLineHeight-offset
            };
            var li = $("<li>"+txt+"</li>");
            lyric.append(li);
        }
        $player.bind("timeupdate",updateLyric);
    },function(){
        lyric.html("<li style='text-align: center'>歌词加载失败</li>");
    });
}

var text_temp;
function updateLyric(){
    var data = $player.music.lyric.parsed;
    if(!data)return;
    var currentTime = Math.round(this.currentTime);
    var lrc = data[currentTime];
    if(!lrc)return;
    var text = lrc.text;
    if(text != text_temp){
        locationLrc(lrc);
        text_temp = text;
    }
    function locationLrc(lrc){
        lyric_wrap.find(".lyric_wrap .on").removeClass("on");
        var li = lyric_wrap.find("li:nth-child("+(lrc.index+1)+")");
        li.addClass("on");
        var top = Math.min(0,-lrc.top);
        //lyric.css({"-webkit-transform":"translate(0,-"+lrc.top+"px)"});
        lyric.css({"margin-top":top});
    }
}

function getPlayList(){
    var list = $("#music_list");
    $.ajax({
        url:"demo/music.json",
        cache:false,
        success:function(data){
            list.empty();
            $player.playList.add(data);
            var template = _.template($("#music_list_item").html());
            $.each($player.playList.all(),function(i,m){
                if(m["link_lrc"])m.lyric = new Lyrics(m["link_lrc"]);
                var dom = $(template(m)).get(0);
                dom.index = i;
                dom.music = m;
                list.append(dom);
            })
        },
        error:function(){
            list.html('<li style="text-align: center;display: block;">音乐列表获取失败！</li>');
        }
    });
    list.on("click","li",function(){
        musicList.find(".selected").removeClass("selected");
        $(this).addClass("selected");
        $player.play(this.music);
    });
}

function initPlayCtrl(){
    playCtrl.find(".play").bind("click",function(){
        if($player.music){
            $player.play($player.music);
        }else{
            musicList.find("li:first-child").trigger("click");
        }
    });
    playCtrl.find(".prev").bind("click",function(){
        var prev = musicList.find(".selected").prev("li");
        prev.trigger("click");
    });
    playCtrl.find(".next").bind("click",function(){
        var next = musicList.find(".selected").next("li");
        if(next.length>0)next.trigger("click");
        else{
            musicList.find("li:first-child").trigger("click");
        }
    });
}