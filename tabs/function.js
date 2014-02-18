/*
*@author  choizhang
*@function 封装一些常用的网页开发会用到的需要javascript来实现的特效。
*需要用到jqeury库
*
*/


/*
*#1.网页tab选项卡,flash切换
*调用函数方法
$.fn.tab({   //下面的都是必选参数
	tab : 'com-tab',
	plist : 'list-title', 
	listafter : 'mouseafter', 
	pcontent : 'content'
});
解释说明：
$.fn.tab({
	tab : 'tab01', 如果一个页面出现多个tab选项卡，在每个选项卡最外层嵌套一个div，这个参数表示嵌套div的类名以示区分其他选项卡（必填）
	plist : 'list-title', 选项卡菜单ul上的类名 （必填）
	listafter : 'mouseafter', 当前选中菜单li的样式 （必填）
	pcontent : 'content', 选项卡包裹所有内容的div类名 （必填）
	action : 'hover', hover或者click，默认是hover
	num : 3, 页面首次加载时，第几个菜单被选中，默认第一个
	moreclass : 'link', 更多按钮的类名
	more : {url1:'aaa.html', url2:'bbb.html', url3:'ccc.html'} 按照顺序把每一个添加进去，实现切换也可以切换更多的地址
	leftarr : 'banner-prev',    点击向左翻页，只支持点击
	rightarr : 'banner-next',  点击向右翻页
	type : 'move1',    (show, fade, move1)执行的方式，这个跟是否是动画无关
	anima_time : 3000 每隔3秒进行一次切换，自动轮播功能
	phone_tipbar : true    在手机上显示iscroll提供的滚动条，默认不显示
});
*
*/
$.fn.tab = function(param){
	var timeid,intervalid,content,plistli,nowli,nowdiv,preli,prediv,tab, plist, listafter, pcontent, action, len, nowindex,time,type,leftarr,rightarr,myScroll,flag_animate,phone_tipbar;
	ptab = '.' + param.tab;
	plist = '.' + param.plist;
	listafter = param.listafter;
	pcontent = '.' + param.pcontent;
	action = param.action=='click'?'click':'hover';
	nowindex = param.num || 1;
	phone_tipbar = param.phone_tipbar || false;
	type = param.type;
	if(param.anima_time){
		time = param.anima_time;//用户设置了自动的动画时间
	}
	content = $(pcontent).children().children();
  	plistli = $(plist).children('li');
	tab = $(ptab);//
	len = plistli.length;			//菜单条li总个数
	if(nowindex < 1 || nowindex > len)nowindex=1;//纠正用户输入错误的问题
	if(!('ontouchstart' in document.documentElement)) {   //是PC的话
		if(type != 'move1')content.hide();  //move1是不需要隐藏的
	}
	$('.com-tab-listtitle').one("focus", function(){
		$(document).keydown(function(e){
	    	var varkey = (e.keyCode) || (e.which) || (e.charCode); //兼容各个浏览器
			if (varkey == 39) {  //向右键
				switchTab(nowindex, nowindex + 1);
				$('.com-tab-nownav').children('a').trigger('focus')
	        }
	        if (varkey == 37) {  //向左键
				switchTab(nowindex, nowindex - 1);
				$('.com-tab-nownav').children('a').trigger('focus')
	        }
	        if (varkey == 27) {  //esc键关闭，退出tabs模块
				$('#tabs-esc').focus();
	        }
	    });
	});
	$('.com-tab-content li').bind('focus', function(event) {
		console.log('a');
		// console.log($(event.target).isChildOf('.com-tab-content'));
	 //    if (!$(event.target).isChildOf('.com-tab-content')) {
	 //        event.stopPropagation();  //这个功能的测试要关闭开发者工具，屏幕阅读软件有时候也会影响
	 //        $(this).focus();
	 //    }
	});
	content.eq(--nowindex).show();//初始化操作
	plistli.eq(nowindex).addClass(listafter);
	plistli.each(function(index){
		if(action=='click'){
			$(this).click(function(){
				switchTab(nowindex, index);
			});
		} else {
			$(this).mouseover(function(){
				timeid = setTimeout(function(){//防止用户快速的在菜单条上快速移动而导致的内容变化速度太快
					switchTab(nowindex, index);
				}, 200);
			}).mouseout(function(){
				clearTimeout(timeid);
			});
		}
        $(this).children('a').focus(function(){   //给使用键盘tab键可以实现效果
            switchTab(nowindex, index);
        });
	});

	if(time){//如果允许动画自动播放，则初始化
		tab.hover(
			  function(){clearInterval(intervalid);},//防止用户鼠标在内容菜单条区域内时，也进行自动播放
			  function(){intervalid = setInterval(animation, time);}
		);
		function animation(){
            var nextimg = content.eq(nowindex+2).children('img').first();  //对自动轮播的banner预先加载下一张图片,对于用户手动干预的不执行
            if(nextimg.attr('data-src')){
                nextimg.attr('src', nextimg.attr('data-src')).removeAttr('data-src');
            }
            switchTab(nowindex, nowindex + 1);	
		}
		intervalid = setInterval(animation, time);
	}

	//左右箭头方便快速切换tab叶卡，有问题参考yoyo的手机管家（11）
	if(param.leftarr){
		leftarr = $('.' + param.leftarr);
		leftarr.click(function(){
            switchTab(nowindex, nowindex - 1);  //调用了后面封装的函数
        });
	}
	if(param.rightarr){
		rightarr = $('.' + param.rightarr);
		rightarr.click(function(){
            switchTab(nowindex, nowindex + 1); //调用了后面封装的函数
        });
	}

	//切换tab函数，pre为当前显示的tab序号，now为将要切换到的tab序号
	function switchTab(pre, now, animate_phone){
		now = now % len;//用于循环操作，如果轮播了一圈要回来从新轮播
		if(pre == now)return;
		plistli.eq(pre).removeClass(listafter);
		plistli.eq(now).addClass(listafter);
        var loadimg = content.eq(now).find('img');  //也可能是里面嵌套的图片
        if(loadimg){             //这些代码是延迟加载TAB里面的图片的
            loadimg.each(function(){
                if ($(this).attr('data-src')){
                    $(this).attr('src', $(this).attr('data-src')).removeAttr('data-src');
                }
            });
        }
		switch (type){
			case 'fade':
						content.eq(pre).fadeOut(1000);
						content.eq(now).fadeIn(1500);
						break;
			case 'move1':
						if(animate_phone)return;   //这是是手势操作，不需要移动内容，切换菜单栏就好
						if('ontouchstart' in document.documentElement) {
							var tem;
							if(now){
								tem = 'next';
							} else {
								tem = -1;
							}
							myscroll.scrollToPage(now, 0, 800);  //这个具体的值参考iscroll的API
						} else {//这个是pc的滚动方式
							content.parent().parent().animate({scrollLeft: parseInt(content.width())*now}, {queue:false, duration:800});
						}
						break;
			case 'move2':
						var _html = '';
						content = $(pcontent);
						if(bool){
							_html = content.children().first().html();
							content.children().first().animate({marginLeft: '-950px'}, time-2000);
							setTimeout(function(){content.children().first().remove()},2000);
							content.append("<li>"+_html+"</li>");
							//plistli.unbind('click');//没有搞定点击的逻辑，先把按钮的事件去掉，以后再处理
							//plistli.unbind('mouseover');
						} else {
                            var i;
							for(i=now;i<len;i++){
								_html += '<li>'+ content.eq(i).html() + '</li>';
							}
							for(i=0;i<now;i++){
								_html += '<li>'+ content.eq(i).html() + '</li>';
							}
							content.html(_html).hide().fadeIn('slow');
						}
						break;
			default :
						content.eq(pre).hide();    //默认采用hide，show方法
						content.eq(now).show();
		}
		if(param.more){//在菜单条最右边有可能会出现更多的链接，菜单条切换时，样式没变，只是链接URL地址变了
			var tem;
			url = 'url' + (now + 1);
			tem = param.more.url;
			$('.'+param.moreclass).attr('href', tem);
		}
		nowindex = now;//把局部变量中当前选中的数字赋给全局保存的当前索引
	}

	if('ontouchstart' in document.documentElement) {
		type = 'move1';
		content.parent().css("width", parseInt(content.css("width"))*content.length); //在手势操作里面要把内容放在一行里面
		content.addClass("touch-style");   //统一在触屏里面的css样式，因为触屏里面只能手势操作
		if(param.leftarr)leftarr.hide();       //隐藏点击翻页按钮，或者使其失效
		if(param.rightarr)rightarr.hide();

		plistli.each(function(index){   //禁用菜单栏鼠标事件，只是用来装饰用
			if(action=='click'){
				$(this).unbind('click');
			} else {
				$(this).unbind('mouseover');
			}
		});
        if(time){   //可以自动播放的时候
        	myscroll=new iScroll(pcontent,{snap: true,momentum: false,hScrollbar: phone_tipbar,
	              onScrollEnd: changetag,
				  onTouchEnd: function (){   //手离开屏幕继续自动轮播
				  		intervalid = setInterval(animation, time);
				  }
	        });
        } else {     //不能自动播放
        	flag_animate = true;
        	myscroll=new iScroll(pcontent,{snap: true,momentum: false,hScrollbar: phone_tipbar,
	              onScrollEnd: changetag
	        });
        }
        document.querySelector(pcontent).addEventListener('touchstart',function(e){//这个对于轮播不轮播都有用
        	flag_animate = true;      //手接触到手机的时候，停止自动播放
        	clearInterval(intervalid);
    	});
        function changetag(){  //每次轮播结束后执行
        	if(flag_animate){
				switchTab(nowindex, this.currPageX, true);
				flag_animate = false;
				nowindex = this.currPageX;  //这个是让手势从操作的和我前面的值一致，同步的作用
        	}
        }
	}
  	return this;
}

/*
*#2.输入框提示
*调用函数方法
$.fn.input({
	tipinputclass:'searchtip',  
	userinputclass:'search',
	action:'click'
});	
解释说明：
$.fn.input({
	tipinputclass:'searchtip',   输入前样式的类名
	userinputclass:'search',     输入后样式的类名
	action:'click'               触发的行为有（hover，click），默认click
});	
*
*/
$.fn.input = function(param){
	var target,action,tiparea,label,input_focus,input_put;
	if(!param.tipinputclass)alert('缺少必要的参数');
	action = param.action || 'click';
	target = $(param.tipinputclass);
	tiparea = $(param.tiparea);
	input_focus = param.input_focus_class;
	input_put = param.input_put_class;
 	label = target.siblings('label');
	
	target.focus(function(){
		target.addClass(input_focus);
	});
	target.blur(function(){//离开输入状态，文本框中没有值，则显示提示值并让字体变成提示的样式
		if(!target.val()){
			target.removeClass(input_focus);
			label.show();
		}
	});
	if(action == 'hover'){
		target.hover(//鼠标hover的效果等于是触发了点击的效果
			function(){target.trigger('focus');},
			function(){target.trigger('blur');}
		);
	}
	if(target.attr('type') == 'password'){  //密码输入框的核心代码
		var big = false;   //初始是不开启caps键的（概率学），是随便设置的（下面会做修复的），big只是控制caps的开关，跟shift无关
		target.one("keypress", function(e){  //修复函数，如果用户在输入前就已经开启了caps键，没有原生的方法获取，通过判断第一次数字的大小写来判断
		  	if(e.keyCode>=65 && e.keyCode<=90){
		  		tiparea.show();
				big = true;
			} else if(e.keyCode>=97 && e.keyCode<=122){   //第一次是小写字母
				if(!tiparea.is(":hidden")){   //但是提示框确出现了，说明第一个个字母是caps+shift出来的，要进行如下设置
					tiparea.hide();
					big = true;
				}
			}
		});
		target.keydown(function(e){
			if(e.keyCode == 20){
				if(big){        //大写状态还按了那应该变成小写
					tiparea.hide();
					big = false;
				} else {
					tiparea.show();
					big = true;
				}
			}
			if(e.keyCode == 16){  //因为shitf是临时的，keyup会自动还原，所以不用设置big的值，就是说shift没有破坏性
				if(big){
					tiparea.hide();
				} else {
					tiparea.show();
				}
			}
		});
		target.keyup(function(e){   //清除了shift的破坏
			if(e.keyCode == 16){
				if(big){
					tiparea.show();
				} else {
					tiparea.hide();
				}
			}
		});
	}

	target.keydown(function(){
		if(!label.is(':hidden')){   //让用户输入的时候去掉label提示,如果用户输入后再删除完就没必要再提示了，代码也不好写
			label.hide();
			target.addClass(input_put);
		}

	});
	return this; 
}


/*
*#3.弹出窗口
*调用函数方法
$.fn.popwin({
	iframe:true,
	aclassName:'click1', 
	wclassName:'popwin1', 
	pclose:'popclose', 
	mask : 'mask',
	opactiy : 0.5,
	maskclick:true,
	autoclose: 5
});  
解释说明：
$.fn.popwin({
	iframe:true,
	aclassName:'click1', 弹窗源的class
	wclassName:'popwin1', 弹出窗口的class
	pclose:'popclose', 弹出窗口的关闭按钮的class
	mask : 'mask', mask层的类名
	opactiy : 0.5,  mask层的透明度，1是不透明，0是完全透明
	maskclick:true,  点击遮罩层关闭弹窗，false不关闭,全局只有一个mask层，整个页面这个属性应该一致
	autoclose: 5    遮罩层自动关闭的时间
}); 
*
*/
$.fn.popwin = function(param){
	if(!param.aclassName || !param.wclassName)return;
	if(!param.maskclick)param.maskclick = false;
	var aclassName,wclassName,pclose,maskclick,iframe,mask,opacity,src,autoclose,dialogOpen,lastFocus;
	iframe = !!param.iframe || false;
	aclassName = '.' + param.aclassName;
	wclassName = '.' + param.wclassName;
	pclose = '.' + param.pclose;
	mask = '.' + param.mask;
	opactiy = param.opactiy;
	maskclick = '.' + param.maskclick;
	autoclose = param.autoclose;
	src = $(aclassName);
	
	if(iframe){
		wclassName = $(wclassName);
		pclose = $(pclose);
		mask = $(mask);
	}
	else {
		wclassName = $(wclassName);
		pclose = $(pclose);
		mask = $(mask);
	}
	
	//将主要的弹窗代码封装起来，供不同的事件来调用
	var mainfunc = function(){
		dialogOpen = true;
		lastFocus = document.activeElement;
		mask.height($(document).height()).animate({opacity:opactiy},100).fadeIn('slow');//fadeIn在IE里面会让透明度达到100%，默认的CSS会被覆盖
		wclassName.css('top', $(window).height()/2-$(wclassName).height()/2+$(window).scrollTop()).fadeIn('slow').focus();
		pclose.click(function(){
			mask.fadeOut('slow');
			wclassName.fadeOut('slow');	
			$(window).unbind('scroll', noscroll);  //弹窗关闭后将自定义事件释放给系统
            $('body').unbind('mousewheel');
            $(document).unbind('focusin');
            lastFocus.focus();     //让弹窗关闭的时候还原到触发弹窗的地方
            dialogOpen = false;    //主要是给后面的esc的关闭做判断
            pclose.unbind('click');
		});	
		if(param.autoclose){
			setTimeout(function(){
				pclose.trigger('click');	
			}, param.autoclose);
		}
		if(param.maskclick){
			mask.css('cursor', 'pointer').click(function(){
				pclose.trigger('click');	
			});
		} else {
			mask.css('cursor', 'default').unbind('click');
		}
		$(window).bind('scroll', noscroll);
        $('body').bind('mousewheel', function(event){  //打开弹窗的时候用户不能通过鼠标来滚动
            //(event.preventDefault) ? event.preventDefault() : event.returnValue = false;
            return false;
        });
        $(document).bind('focusin', function(event) {
		    if (dialogOpen && !$(event.target).isChildOf('.' + param.wclassName)) {
		        event.stopPropagation();  //这个功能的测试要关闭开发者工具，屏幕阅读软件有时候也会影响
		        wclassName.focus();
		    }
		});
	};
    if(param.aclassName == 'null') {
        mainfunc();      //主要是提供给根据不同情况弹窗不同的场景
    } else {
        src.bind('click', function(){mainfunc();});//在页面中元素被点击的时候进行弹窗
    }
    function noscroll(){
        pclose.trigger('click'); //用户拖动滚动条就关闭弹窗
    }
    $(document).keydown(function(e){
    	var varkey = (e.keyCode) || (e.which) || (e.charCode); //兼容各个浏览器
		if (dialogOpen && varkey == 27) {
			pclose.focus();
			setTimeout(function(){
				pclose.trigger('click');      //可以使用esc去关闭弹窗，无障碍优化
			}, 1500);
            
        }
    });
	return this;
};

jQuery.fn.isChildOf = function(b){  //判断一个元素是否是另一个元素的子节点
	return (this.parents(b).length > 0);
};





/*
*#4.通过改变classname来更换显示结构
*调用函数方法
$.fn.changestate({
	bindelement : '.model2 li', 
	classname : 'hover', 
	action : 'click',
	num: 1
});
解释说明：
$.fn.changestate({
	bindelement : '.model2 li', 对要进行hover事件的元素进行绑定
	classname : 'hover', 要进行改变的类（增加删除）
	action : 'click',  改变classname的方式，（hover，click），默认是hover
	num: 1  第几个元素初始化被加上上面的类
});
*
*/
$.fn.changestate = function(param){
	var bindele, cname, nownum,action;
	bindele = param.bindelement;
	bindele = $(bindele);
	cname = param.classname;
	action = param.action;
	nownum = param.num;
	if(--nownum >= 0)
	  bindele.eq(nownum).addClass(cname);
	
	bindele.each(function(index){
		if(action == 'click'){
			$(this).click(function(){
	  			if(nownum == index)return;
	  			$(this).addClass(cname);
	  			bindele.eq(nownum).removeClass(cname);
	  			nownum = index;
	  		});
		} else {
			$(this).mouseover(function(){
	  			if(nownum == index)return;
	  			$(this).addClass(cname);
	  			bindele.eq(nownum).removeClass(cname);
	  			nownum = index;
	  		});	
		}
		
	});
	return this;
};



/*
 *#5.通过点击按钮来切换查看图片，这个结果要使用ul li来实现
 *调用函数方法
 $.fn.clickchange({
 prevbtn : 'prev',
 prevdisable : 'pdisable',
 nextbtn : 'next',
 nextdisable : 'ndisable',
 showouter : 'showimg',
 showimgnum : 1,
 circle : false
 });
 解释说明：
 $.fn.clickchange({
 prevbtn : 'prev',  上一个按钮的classname
 prevdisable : 'pdisable',  上一个按钮失效的classname
 nextbtn : 'next',   下一个按钮的classname
 nextdisable : 'ndisable',  下一个按钮失效的classname
 showouter : 'showimg',  显示图片的外框，把超出去的隐藏起来
 showimgnum : 1,  在页面上显示的图片个数 ,1能把所有图片循环一遍，数字加1就从末尾少张图片
 circle : false   图片是否是循环播放，就是到最后一张再点下一张就到第一张，循环上下一张按钮不会变色
 });
 *
 */
$.fn.clickchange = function(param){
    var prevbtn, nextbtn, showouter, action, unitpx, now, showimgnum, totalimgnum, prevdisable, nextdisable, i, circle;
    prevbtn = '.' + param.prevbtn;
    prevbtn = $(prevbtn);
    prevdisable = param.prevdisable || '';  //需要设置为空，不然会隐藏
    nextbtn = '.' + param.nextbtn;
    nextbtn = $(nextbtn);
    nextdisable = param.nextdisable || '';
    showouter = '.' + param.showouter;
    action = param.action;
    showimgnum = param.showimgnum;
    circle = param.circle || false;
    showouter = $(showouter);
    totalimgnum = showouter.find('li').length;
    unitpx = showouter.find('li').outerWidth(true);
    now = 0;
    i = totalimgnum-showimgnum;

    prevbtn.click(function(){
        if((now+1) > i && !circle)return;    //如果到了最后一个并且不支持循环的话就退出
        else if((now+1) > i && circle)now = -1;    //如果到了最后一个并且支持循环的话就把图片搞成第一个
        showouter.animate({scrollLeft: unitpx*(++now)}, {queue:false, duration:500});
        if((now+1) > i) prevbtn.addClass(prevdisable);
        else nextbtn.removeClass(nextdisable);

    });
    nextbtn.click(function(){
        if((now-1) < 0 && !circle) return;
        else if((now-1) < 0 && circle)now = i+1; //如果一页里面可以显示多个的时候，需要使用i+1，不然后面点击了不动
        showouter.animate({scrollLeft: unitpx*(--now)}, {queue:false, duration:500});
        if((now-1) < 0) nextbtn.addClass(nextdisable);
        else prevbtn.removeClass(prevdisable);
    });
    return this;
};

/*
 *#5.分页按钮
 *调用函数方法
 $.fn.pagenav({
 showpage : '.com-pagenav-showpage',
 showpageli : '.com-pagenav-showpage li',
 leftfunc : '.com-pagenav-left-func',
 rightfunc : '.com-pagenav-right-func',
 leftarrow : '.com-pagenav-left-arrow',
 rightarrow : '.com-pagenav-right-arrow',
 type:'angle',
pagenum: 7      到指定的页码去，主要是初始化，加载后如需改变，直接调用函数pagenav_to(11)
 });
 解释说明：
pagenav_to(11)   在页面中可以调用参数到指定的页码
 *
 */
$.fn.pagenav = function(param){
    var lid, rid, num, i, showpage, showpageli, leftfunc, rightfunc, leftarrow, rightarrow, length, type;
    showpage = param.showpage || '.com-pagenav-showpage';
    showpageli = param.showpageli || '.com-pagenav-showpage li';
    leftfunc = param.leftfunc || '.com-pagenav-left-func';
    rightfunc = param.rightfunc || '.com-pagenav-right-func';
    leftarrow = param.leftarrow || '.com-pagenav-left-arrow';
    rightarrow = param.rightarrow || '.com-pagenav-right-arrow';
    type = param.type || 'round';
    showpage = $(showpage);
    showpageli = $(showpageli);
    leftfunc = $(leftfunc);
    rightfunc = $(rightfunc);
    leftarrow = $(leftarrow);
    rightarrow = $(rightarrow);
    length = showpageli.length;
    //初始化
    //小于7页的情况
     if(length<8){
         leftfunc.first().hide();
         leftfunc.last().hide();
         rightfunc.first().hide();
         rightfunc.last().hide();
         if(type == "angle"){
             showpage.css('width', 27*length);
         } else {
             showpage.css('width', 27*length-4);
         }
     } else {
         //大于7页的情况
         for(i=0; i<9; i++){
             if(type == "round"){
                 showpageli.eq(i).children('a').css('paddingLeft', 12).children('span').css('paddingRight', 12);
             } else if(type == "angle"){
                 showpageli.eq(i).children('a').css("padding", "3px 10px");
             }
         }
         if(length>99){
             for(i=99; i<length; i++){
                 if(type == "round"){
                     showpageli.eq(i).children('a').css('paddingLeft', 4).children('span').css('paddingRight', 4);
                 } else if(type == "angle"){
                     showpageli.eq(i).children('a').css("padding", "3px 2px");
                 }
             }
         }
         //leftfunc.addClass('com-pagenav-grey');
     }

//        鼠标移开后，让按钮自动对齐,如果是右边的按钮需要减1
    function pagenav_align(direction) {
        var aa = showpage.scrollLeft();
        num = Math.ceil(aa / 35)>(length-7)?(length-7):Math.ceil(aa / 35);
        if( "right" == direction) num--;
        aa = 35*num;
        showpage.animate({scrollLeft: aa}, {queue:false, duration:500});
        if(aa<35) {
            leftarrow.addClass('com-pagenav-grey');
        }else{
            leftfunc.removeClass('com-pagenav-grey');
        }
        if(aa>(35*(length-8))){
            rightarrow.addClass('com-pagenav-grey');
        }else{
            rightfunc.removeClass('com-pagenav-grey');
        }
    }
    leftarrow.hover(
        function () {
            rid = setInterval(function(){
                if(showpage.scrollLeft() <= 0){
                    leftarrow.addClass('com-pagenav-grey');
                    return;
                }
                showpage.scrollLeft(showpage.scrollLeft()-1);
            },20);
        },
        function(){
            clearInterval(rid);
            pagenav_align('right');
        }
    ).click(
        function () {
            showpage.animate({scrollLeft: showpage.scrollLeft()-241}, {queue:false, duration:500});
        }

    );
    rightarrow.hover(
        function () {
            if(showpage.scrollLeft() > 35*(length-8)){
                return;
            }
            lid = setInterval(function(){
                if(showpage.scrollLeft() > (35*(length-7)-1)){
                    rightarrow.addClass('com-pagenav-grey');
                    return;
                }
//                    只有当变化的值很小的时候才能平滑移动
                showpage.scrollLeft(showpage.scrollLeft()+1);
            },20);
        },
        function(){
            clearInterval(lid);
            pagenav_align('left');
        }
    ).click(
        function () {
            if(showpage.scrollLeft() > (35*(length-14))){
                showpage.animate({scrollLeft: (35*(length-7))}, {queue:false, duration:200});
                return;
            }
            showpage.animate({scrollLeft: showpage.scrollLeft()+241}, {queue:false, duration:500});
        }
    );

    var nowpage;
    leftfunc.eq(1).click(function(){  //左边3个都是leftfunc,开始有问题 ,上一页
    	nowpage = $('.com-pagenav-angle-nowpage').parent().index() +1;
    	if(nowpage<2)return;  //不能再上一页了
    	pagenav_to(nowpage -1);
    	console.log(nowpage);
    });
    rightfunc.eq(1).click(function(){
    	nowpage = $('.com-pagenav-angle-nowpage').parent().index() +1;
    	if(nowpage> (length-1))return;  //不能再下一页了
    	pagenav_to(nowpage +1);
    });

    leftfunc.eq(0).click(function(){  //首页
    	nowpage =1;
    	pagenav_to(1);
    });
    rightfunc.eq(2).click(function(){   //末页  
    	nowpage = length;
    	pagenav_to(length);
    });
    function pagenav_to(pagenum){  //这是提供给指定到相应的页码
    	showpage.animate({scrollLeft: (pagenum-4)*35}, {queue:false, duration:500});
    	$('.com-pagenav-angle-nowpage').removeClass('com-pagenav-angle-nowpage');
    	showpageli.eq(pagenum-1).children('a').addClass('com-pagenav-angle-nowpage');

    	if(pagenum < 4){	
    		leftfunc.removeClass('com-pagenav-grey');
    		rightfunc.removeClass('com-pagenav-grey');
    		leftarrow.addClass('com-pagenav-grey');    //这个特殊的要放在前2个后面
    		if(pagenum == 1){
    			leftfunc.addClass('com-pagenav-grey');
    		}
    		
    	} else if(pagenum > (length -4)){	
    		rightfunc.removeClass('com-pagenav-grey');
    		leftfunc.removeClass('com-pagenav-grey');
    		rightarrow.addClass('com-pagenav-grey');   //这个特殊的要放在前2个后面
    		if(pagenum == length){
    			rightfunc.addClass('com-pagenav-grey');
    		}
    	} else {
    		leftfunc.removeClass('com-pagenav-grey');
    		rightfunc.removeClass('com-pagenav-grey');
    	}
    }
    
};

/*
 *#6.垂直跑马灯效果
 *调用函数方法
 $.fn.lamp({
 targetUl : 'show-ul',
 height : 22,
 time : 2000,
 length : 5
 });
 解释说明：
 $.fn.lamp({
 targetUl : 'show-ul',     嵌套里面li的外层ul的类名
 height : 22,              单个li的高度
 time : 2000,              跑马灯滚动间隔时间
 length : 5                如果页面中列表的数目小于5的时候就不滚动
 });
 *
 */
$.fn.lamp = function(param){
    var height, time, targetUl, tem, first, length, targetLen;
    targetUl = param.targetUl;
    targetLen = param.length; //设置的个数
    if(!param.targetUl){
        alert('跑马灯效果参数不足，加载失败！');
        return;
    }

    targetUl = $('.' + param.targetUl);
    length = targetUl.children().length;   //实际的个数
    if(length < targetLen)return;
    height = param.height || 22;
    time = param.time || 4000;
    setInterval(function(){
        first = targetUl.children('li').first();
        tem = first.html();
        first.animate({'marginTop': -height},1000);
        setTimeout(function(){
            first.remove();
        }, 1000);
        targetUl.append($('<li>').html(tem));
    }, time);
};


/*
 *#7.浏览器推荐策略
 *调用函数方法
 $.fn.version({
 type : 1
 });
 解释说明：
 $.fn.version({
 type : 1   有2个值，（1，2），1表示第一种策略，2表示第二种策略
 });
 *
 */
$.fn.version = function(param){
    var type, userAgent, broswer;
    type = param.type;

    $('body').children().first().before($('<div class="com-broswer-tips-hack" style="height: 70px; display: none;"></div>'));
    broswer = $('#com-browser-warn');
//    右侧关闭按钮
    $('.com-broswer-close').click(function(){
        broswer.slideUp("slow");
        $('.com-broswer-tips-hack').hide("slow");
    });
//    不再提示按钮
    $('.com-broswer-notip-broswer').click(function(){
        cookie.set('broswer', 'true', {expires: 30});
        broswer.slideUp("slow");
        $('.com-broswer-tips-hack').hide("slow");
    });

    userAgent = window.navigator.userAgent.toLowerCase();

    //第一种情况
    if(type == 1 && /msie/.test( userAgent ) && !/opera/.test( userAgent )){
        if(!cookie.get('broswer')){
            $('.com-browser-text span').html('高级浏览器（<a href="http://www.google.cn/chrome/intl/zh-CN/landing_chrome.html?hl=zh-CN&brand=CHMI" target="_blank">chrom</a>，<a href="http://firefox.com.cn/" target="_blank">firfox</a>）');
            broswer.slideDown("slow");
            $('.com-broswer-tips-hack').show("slow");
        }
        return;
    }
//    第二种情况
    if(userAgent.indexOf("windows nt 6.1") > -1){  //如果是win7系统
        if(/msie/.test( userAgent ) && !/opera/.test( userAgent )){  //如果是IE系浏览器
            if((userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1] < 9){    //如果版本号小于9
                if(!cookie.get('broswer')){
                    broswer.slideDown("slow");
                    $('.com-broswer-tips-hack').show("slow");
                }
            }
        }
        else {
            //如果是非IE系浏览器
        }
    } else {  //如果是XP系统
        alert(userAgent);
        if(/msie/.test( userAgent ) && !/opera/.test( userAgent )){  //如果是IE系浏览器
            if((userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1] < 8){    //如果版本号小于8
                if(!cookie.get('broswer')){
                    $('.com-browser-text span').html('<a href="http://windows.microsoft.com/zh-CN/internet-explorer/products/ie-8/ie8-how-to" target="_blank">IE8</a>');
                    broswer.slideDown("slow");
                    $('.com-broswer-tips-hack').show("slow");
                }
            }
        }
    }
};

/*
 *#8.JS转盘
 *调用函数方法
 $.fn.dial({
 obj : 'com-reward-now',
 btn : 'com-btn-reward',
 left : 10,
 top : 10,
 width : 150,
 height : 110,
 position : [5,2,7,3,1],
 vertical : 3,
 horizontal : 3
 });
 解释说明：
 $.fn.dial({
 obj : 'com-reward-now',  转动的白色效果框
 btn : 'com-btn-reward',   中间的立即抽奖按钮
 left : 10,               obj是绝对定位的左边距
 top : 10,                obj是绝对定位的上边距
 width : 150,             每个九宫格的宽度
 height : 110,            每个九宫格的高度
 position : [5,2,7,3,1],   抽奖的结果位置，长度表示次数
 vertical : 3,             水平的个数
 horizontal : 3            垂直的个数
 });
 *
 */
$.fn.dial = function(param){
    var position, nowposition, nextid, time, tid, count, circle, obj, btn, left, top, width, height, ttop, tleft, mtop, mleft, num;
    obj = '.' + param.obj;
    btn = '.' + param.btn;
    left = param.left;
    top = param.top;
    width = param.width;
    height = param.height;
    position = param.position;
    num = param.horizontal*2 + (param.vertical-2)*2;
    switch (num){
        case 8:
            circle = 9;
            break;
        case 10:
            circle = 8;
            break;
        default:
            circle = 8;
    }
    obj = $(obj);
    btn = $(btn);
    mleft = left+(param.horizontal-1)*width;
    mtop = top+(param.vertical-1)*height;
    time = position.length;
    function round(){
        ttop = parseInt(obj.css('top'));
        tleft = parseInt(obj.css('left'));
        if(ttop == top && tleft < mleft) {
            obj.css("left", tleft+width);
        }
        if(tleft == mleft && ttop < mtop) {
            obj.css("top", ttop+height);
        }
        if(ttop == mtop && tleft > left) {
            obj.css("left", tleft-width);
        }
        if(tleft == left && ttop > top) {
            obj.css("top", ttop-height);
        }
        if(--count < 1){
            clearInterval(tid);
        }
    }
    //假定从左上角开始id=1，顺时针加1，最后一个id=8
    btn.click(function(){
        if(count>0)return;
        if(time<1){
            alert('sorry,你木有机会了');
            return;
        }
        time--;
        btn.children('span').html(time);
        //这是控制转盘结果的值，应该是从服务器通过ajax获取
        if(nextid){
            nowposition = nextid;
            nextid = position[position.length - time - 1];
        } else {
            nowposition = 1;
            nextid = position[0];
        }
        count = nextid - nowposition + num*circle;
        tid = setInterval(round,200);
        setTimeout(function(){
            clearInterval(tid);
            tid = setInterval(round,100);
        },1000);
        setTimeout(function(){
            clearInterval(tid);
            tid = setInterval(round,50);
        },2000);
        setTimeout(function(){
            clearInterval(tid);
            tid = setInterval(round,100);
        },4000);
        setTimeout(function(){
            clearInterval(tid);
            tid = setInterval(round,200);
        },5000);
    });
};

/*
 *#9.position：fixed；到指定位置之后固定，其他位置采用绝对定位
 *调用函数方法
$.fn.fixed({
	target: 'a4',
	change: 'change4',
	type: 'normal_ie6',
	work_line: 300,
	b_msg: ['bottom', 1075, 876, 575],
	ie6: 'fixed_ie6_bf'
});
 解释说明：
$.fn.fixed({
	target: 'a4',      控制的元素
	change: 'change4',   改变后增加的类名
	type: 'normal_ie6',    就是普通的固定定位，修复fixed在IE6的表现
	work_line: 300,      改变的位置，scrollTop的值
	b_msg: ['bottom', 1075, 876, 575]    可选值，如果采用了bottom来定位则需要使用这些参数。1075是屏幕分辨率的高度(这个决定了你初始的CSS的高度)，876是改变是之前的，575是改变之后的
	ie6: 'fixed_ie6_bf'    fixed_ie6_bf, fixed_ie6_bp, fixed_ie6_tf, fixed_ie6_tp,4个选项，分别对应top,bottom,position,fixed
});
应该是有下面2种组合的
$.fn.fixed({
	target: 'a4',
	change: 'change4',
	work_line: 300,
	b_msg: ['bottom', 1075, 876, 575],
	ie6: 'fixed_ie6_bf'
});
$.fn.fixed({
	target: 'a5',
	type: 'normal_ie6'     //需要在外面CSS将元素的定位用hack改成绝对定位
});
 *
 */
$.fn.fixed = function(param){
    var fixed_work_line, fix_top, fix_bottom, fixed_target, fixed_change, b_height, fixed_position, fixed_size, fixed_type;
    fix_top =false;fix_bottom=true; //让在没有发生条件转换的时候不执行scroll事件，提高性能的一种方式
    fixed_target = $('.' + param.target);
    fixed_change = param.change;
    fixed_work_line = param.work_line;    //实际距离加上分辨率的高度
    b_height = param.b_msg;
    fixed_type = param.type || '';
    if(b_height && b_height[0] == 'bottom') {
        fixed_position = true;
    } else {
        fixed_position = false;
    }

    var t_height = parseInt(fixed_target.css('bottom'));
    function changePosition(){ //根据不同的分辨率的高度来确定元素最终的高度
        if(fixed_position && fixed_target.parent('body').length){
        	height = $(window).height();  //fixed的bottom的距离是跟分辨率的高度有关系的，需要单独确定
        	fixed_size = b_height[1]-height;  //这个值可以给后面的重新赋值bottom有关
            var v = t_height - fixed_size;
            fixed_target.css('bottom', v);
        }
    }
    changePosition();
    $(window).resize(function(){
    	if($.browser.msie && $.browser.version<7)return; //如果是IE6则不需要对底部定位的情况进行处理
    	changePosition();   //解决用户手动对浏览器窗口进行缩放造成的错位
    });


    if($.browser.msie && $.browser.version<7){
    	var fixed_ie6_top = parseInt(fixed_target.css('top'));
    	var fixed_ie6_bottom = parseInt(fixed_target.css('bottom'));
    	var fixed_ie6_msg = param.ie6;

    	if('fixed_ie6_bf' == fixed_ie6_msg || 'fixed_ie6_bp' == fixed_ie6_msg){
    		fixed_ie6_bottom = fixed_ie6_bottom + $(document).height() - $(window).height();
    		fixed_target.css('bottom', fixed_ie6_bottom);
    	}

    	var fixed_ie6_bhack = fixed_target[0].offsetTop; //元素本身距离顶部的高度，因为滚动条会影响，主要是一般效果是这样
    }
    
    $(window).scroll(function(){
        var st, height;
        st = $(window).scrollTop();

        if('normal_ie6' == fixed_type){    //如果是普通的定位，那么只需要对ie6进行单独处理，fixed_type是普通定位的标志
        	if($.browser.msie && $.browser.version < 7)
    			fixed_target.css('top', st + fixed_ie6_top);
    		return;
    	}

        if($.browser.msie && $.browser.version < 7){  //对IE6的fixed的切换进行单独处理
        	
            if(st < fixed_work_line){
            	if('fixed_ie6_tf' == fixed_ie6_msg){
            		fixed_target.css('top', st + fixed_ie6_top);
            	}
            	if('fixed_ie6_bf' == fixed_ie6_msg){
            		fixed_target.css('bottom', fixed_ie6_bottom - st);
            	}
            } else {
            	//fixed_target.css('top', st + parseInt(fixed_ie6_top));
            	if('fixed_ie6_tp' == fixed_ie6_msg){
            		fixed_target.css('top', st);
            	}
            	if('fixed_ie6_bp' == fixed_ie6_msg){
            		fixed_target.css('bottom', fixed_ie6_bottom - st + fixed_ie6_bhack);
            	}
            }  	
            return;
        }

        if(st < fixed_work_line){  //对采用fixed和绝对定位的分界点
            if(fix_top){
            	if(fixed_position && fixed_target.parent('body').length){
            		fixed_target.css('bottom', b_height[2]-fixed_size);
            	} 
            	fixed_target.removeClass(fixed_change);
                fix_bottom = true;
                fix_top = false;
            }
        } else {
            if(fix_bottom){
                if(fixed_position && fixed_target.parent('body').length){
            		fixed_target.css('bottom', b_height[3]-fixed_size);
            	}
            	fixed_target.addClass(fixed_change);
                fix_top = true;
                fix_bottom = false;
            }
        }   
    });
};


/*
 *#10 点击按钮页面滚动到指定位置的动画，主要是解决了兼容性和到达位置元素功能，免去了手动查找位置的麻烦
 	   应该是可以实现3种情况: 1.到指定的元素位置 2.到指定元素位置有一个偏移量 3.到具体数值的位置
$.fn.scAnimate({
	target_ele: '.a',
	position: ['.pos', '+30'],
	animat_time: 1000
});
 解释说明：
$.fn.scAnimate({
	target_ele: '.a',      点击的元素，可以是id，类，元素
	position: ['.pos', '+30'],      到达的位置，可以有3种（1.数值， 2.页面元素, 3.页面元素加减固定值）
	animat_time: 1000      动画的时间，默认值是1000毫秒
});
 *
 */
 $.fn.scAnimate = function(param){
    var st_target, st_position, st_time;
    st_target = $('' + param.target_ele);
    st_position = param.position;
    st_time = param.animat_time || 1000;
    if(isNaN(st_position)){
    	st_position = $('' + st_position[0]);
    	st_position = st_position.offset().top + parseInt(st_position[1]);
    }
    st_target.click(function(){
		$('html,body').animate({  //html是IE支持，body是chrome支持的
		   scrollTop: st_position
		}, st_time);
	});
};

/*
 *#11 二级菜单无障碍的js代码
$.fn.second_menu({
	target_ele: '.a',
	target_next: '.b'
});
 解释说明：
$.fn.second_menu({
	target_ele: '.a',   //有二级菜单的li节点
	target_next: '.b'   //二级菜单最后一个链接的下一个链接，就是要知道现在焦点已经不在二级菜单了
});
 *
 */
 $.fn.second_menu = function(param){
    var sm_target, sm_target_next, sm_tips, sm_inner_ul;
    sm_target = $('' + param.target_ele);    //有二级菜单的li节点
    sm_target_next = $('' + param.target_next);   //二级菜单最后一个链接的下一个链接
    sm_inner_ul = sm_target.children('ul');
    sm_target.focus(function(){
		$(document).bind('keydown', function(event){
			if(event.keyCode == 40) {   //下键打开菜单
				sm_tips = sm_target.attr("aria-label");
				sm_inner_ul.attr("aria-hidden", "false").show();
				sm_target.attr("aria-label", "");
			}
			if(event.keyCode == 27) {   //esc关闭菜单
				sm_inner_ul.hide();
			}
		});
	});
	
	sm_target_next.focus(function(){  //下一个链接被focus之后就清除之前的
		sm_target.attr("aria-label", sm_tips);
		$(document).unbind('keydown');
		sm_target.children('ul').hide();
		sm_inner_ul.attr("aria-hidden", "true");
	});
};