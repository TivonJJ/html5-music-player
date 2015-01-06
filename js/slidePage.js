(function(){
    var page = $(".content"),
        panelGroup = page.find(".panelGroup"),
        panels = panelGroup.find(".panel");
    var pageWidth = page.offset().width;
    var pointer = new Pointer();
    page.bind("touchstart",function(evt){
        var t = evt.touches[0];
        pointer.sx = t.pageX;
        pointer.sy = t.pageY;
        pointer.ts = evt.timeStamp;
        page.bind("touchmove",onTouchMove);
    });
    page.bind("touchend",function(evt){
        page.unbind("touchmove",onTouchMove);
        var ts = evt.timeStamp - pointer.ts;
        var mx = pointer.mx();
        if(!pointer.cx){
            return pointer.reset();
        }
        if(ts<200){
            if(mx>0)page.prev();
            else if(mx<0)page.next();
            else page.homing();
        }else{
            if(Math.abs(mx) >= (pageWidth * 0.5)){
                console.log(mx);
                if(mx>0)page.prev();
                else page.next();
            }else{
                page.homing();
            }
        }
        pointer.reset();
    });
    function onTouchMove(evt){
        evt.preventDefault();
        var t = evt.touches[0];
        pointer.cx = t.pageX;
        pointer.cy = t.pageY;
        page.setLeft((-(pageWidth*page.currentPageIndex))+pointer.mx());
    }

    page.currentPageIndex = 0;
    page.setLeft = function(left,duration){
        if(!duration)duration = 0;
        panelGroup.css({"-webkit-transition":" "+duration+"ms","-webkit-transform":"translate("+left+"px,0)"});
        //panelGroup.css({"-webkit-transition":"left "+duration+"ms","left":left});
    };
    page.slideTo = function(pageIndex){
        if(pageIndex == this.currentPageIndex)return;
        page.setLeft(pageWidth*pageIndex,300);
        this.currentPageIndex = pageIndex;
    };
    page.prev = function(){
        var prev = this.currentPageIndex-1;
        if(prev<0)return this.homing();
        page.setLeft(-(pageWidth*prev),300);
        this.currentPageIndex = prev;
    };
    page.next = function(){
        var next = this.currentPageIndex+1;
        if(next>=3)return this.homing();
        page.setLeft(-(pageWidth*next),300);
        this.currentPageIndex = next;
    };
    page.homing = function(){
        page.setLeft(-(pageWidth*this.currentPageIndex),300);
    };

    function Pointer(){
        this.sx = 0;
        this.sy = 0;
        this.cx = 0;
        this.cy = 0;
        this.ts = 0;
        this.mx = function(){
            return this.cx - this.sx
        };
        this.my = function(){
            return this.cy - this.sy;
        };
        this.reset = function(){
            this.sx = 0;
            this.sy = 0;
            this.cx = 0;
            this.cy = 0;
            this.ts = 0;
        }
    }

    window.addEventListener("load",function(){
       pageWidth =  page.offset().width;
    });
})();