var $player = $("#player"),
    player = $player.get(0);

$player.playList = new function(){
    var list = [];
    this.currentIndex = -1;
    this.add = function(music){
        if(music instanceof Array) list = list.concat(music);
        else list.add(music);
    };
    this.next = function(){
        var next = list[this.currentIndex+1];
        if(!next)return null;
        this.currentIndex++;
        return next;
    };
    this.prev = function(){
        var prev = list[this.currentIndex-1];
        if(!prev)return null;
        this.currentIndex--;
        return prev;
    };
    this.all = function(){
        return list;
    };
};

$player.play = function(music){
    var index = this.playList.all().indexOf(music);
    if(index<0)return;
    $player.music = music;
    if(index == this.playList.currentIndex){
        if(player.paused)player.play();
        else player.pause();
    }else{
        player.src = music["link_url"];
        player.play();
        this.playList.currentIndex = index;
    }
};

$player.pause = function(){
    player.pause();
};

$player.seekTo = function(time){
    player.currentTime = time;
};

$player.geDuration = function(){
    return player.duration;
};