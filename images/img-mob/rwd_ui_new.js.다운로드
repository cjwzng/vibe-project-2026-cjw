var rv = -1;
var browser_state = false;
if (navigator.appName == 'Microsoft Internet Explorer') {
	var ua = navigator.userAgent;
	var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
	if (re.exec(ua) != null)
	rv = parseFloat(RegExp.$1);
	if (rv > -1 && rv < 8){
		browser_state = true;
	} 
}
	
$(document).ready(function(){
	$("#header .notice_b").clone(true).prependTo("#main .noticeBox"); //공지사항
	$(".notice_b .day a").click(function(){
		$(".notice_b").stop().animate({height : 0}, 500);
	});

	/* 
		allGnb
	*/

	//$(".all_menu a.click").click(function(){ //전체메뉴
		//$(".ctg_depth dl>dd>ul>li ul").hide();
		//$("body").addClass("rebuildLayout");
	//});
	$(".menu_view a.list_close").click(function(){
		$("body").removeClass("rebuildLayout");
	});

	var gnb_modalHtml = "<div class='gnb_modal' style=''></div>"
	$("#wrapper").append(gnb_modalHtml);
	
	//2014-11-24
	var first = true; //최초 접속시 체크 
	var sizeCheck = sizeW();
	var gnbImgArr = new Array();
	var widthBrowser;
	$('<div></div>').insertBefore('.ctg_wrap').addClass('gnb_menu_mob hide'); 
	$('.gnb_menu>ul').clone().appendTo('.gnb_menu_mob');
	$('.gnb_menu_mob li div ul').remove();
	
	if(rv == 8){
		widthBrowser = 960;
	}else{
		widthBrowser = 943;
	};

	//IE8 이하에서 예외처리 
	if(rv != 7){
		$(window).resize(function(){
			var wh = $("#wrapper").height();
			//$(".allGnb").css("top", $("#noti_top_wrap").height());
			//$(".gnb_modal").css("top", $("#noti_top_wrap").height());
			//if($(window).width() < 768){ -16px
			if($(window).width() < 943){ //전체메뉴
				//$(".allGnb .menuOn").css({"display":"block"});
				//20160629 반응형제거
				if(rv != 7){ //IE7 분기
					$("body.rebuildLayout .gnb_modal").css({"display" : "block", "height" : wh + "px"});
					$("body.rebuildLayout .ctg_wrap").css({"right" : "0"});
					$("body.rebuildLayout .ctg_cont").css({"height" : wh + "px"});
					$("body.rebuildLayout .menu_view").css({"height" : wh-100 + "px"});
					$("body.rebuildLayout .all_menu_wrap").show().css("height", wh + "px");
					$(".ctg_depth dl>dd>ul>li ul").show();
					$(".ctg_depth dl>dd>ul>li>span").css("display","block");
					$(".ctg_depth dl>dd>ul>li>a").hide();
					$(".ctg_depth dl>dd>ul>li>a.direct").show();
					$(".ctg_depth dl").hide();
				}
				$(".ctg_depth .mobile").show();
				//20160629 반응형제거
				//$("body.rebuildLayout .allMenuWarp").removeClass("all_menu_wrap").children().removeClass("menu_view").children().removeClass("menu_list");
				//$("body.rebuildLayout #header").css("margin-left", "258px");
				//$("body.rebuildLayout #main, body.rebuildLayout #container, body.rebuildLayout #footer").css("left", "258px");
				//$("body.rebuildLayout .allMenuWarp").css("left", "0");
				//$("body.rebuildLayout .menuOff").css({"display":"block"});
				//$("body.rebuildLayout .menuOn").css({"display":"none"});
			}else{
				//$(".allGnb .menuOn").css({"display":"none"});
				$("body.rebuildLayout .all_menu_wrap").css("height","415px");
				$(".ctg_menu").css({"margin":"0 auto", "overflow": "hidden"});
				$(".ctg_depth dl").show();
				$(".ctg_depth dl>dd>ul>li ul").hide();
				$(".ctg_depth dl>dd>ul>li>span").css("display","none");
				$(".ctg_depth dl>dd>ul>li>a").show();
				//$("body.rebuildLayout .allMenuWarp").addClass("all_menu_wrap").children().addClass("menu_view").children("div").addClass("menu_list");
				//$("body.rebuildLayout #header").css("margin-left", "0");
				//$("body.rebuildLayout #main, body.rebuildLayout #container, body.rebuildLayout #footer").css("left", "0");
				//$("body.rebuildLayout .allMenuWarp").css("left", "-263px");
				//$("body.rebuildLayout .menuOff").css({"display":"none"});
				$(".gnb_modal").css("display", "none");
				$(".ctg_depth .mobile").hide();
			}		
			
			if($(window).width() < widthBrowser){ //전체메뉴 
				
				$('.gnb_wrap .gnb_util').addClass('hide');
				$('.gnb_wrap .gnb_menu').addClass('hide'); 
				$(".gnb_menu_mob").removeClass('hide');
			}else{
				
				$('.gnb_wrap .gnb_util').removeClass('hide');
				$('.gnb_wrap .gnb_menu').removeClass('hide');
				$(".gnb_menu_mob").addClass('hide');
			}
			//gnb menu size
			var currentSize = sizeW();
			
			if(sizeCheck == currentSize && first == false){
				return;
			}else{
				first = false;
				sizeCheck = currentSize;
			};
			
			if(sizeCheck == widthBrowser){
				$("#gnb .gnb_menu_mob > ul > li").each(function(){
					gnbImgArr.push($(this).find("> div").find("a").html());

					var menuName = $(this).find("> div").find("img").attr("alt");
					$(this).find("> div").find("img").remove();
					
					/* menuName 이 금융서비스 일 경우에만 작동 */
					if( menuName == "금융서비스"){
						menuName = menuName.substring(0,2) + "<br />" + menuName.substring(2, menuName.length);
					}

					var menuHtml = "<span>" + menuName + "</span>";
					$(this).find("> div").find("a").html(menuHtml);
				});
				
			}/*else if($(window).width() >= 768 && $(window).width() < 943){
				$("#gnb .gnb_menu_mob > ul > li").each(function(i){
					
					$(this).find("> div").find("span").remove();
					
					$(this).find("> div").find("a").html(gnbImgArr[i]);
				});
			}*/else{
				$("#gnb .gnb_menu_mob > ul > li").each(function(i){
					
					$(this).find("> div").find("span").remove();
					
					$(this).find("> div").find("a").html(gnbImgArr[i]);
				});
			};
		}).resize();
	}
	
	//gnb width size check
	function sizeW(){
		var chk;

		/*if($(window).width() < 768){
			chk = 768;
		}else if($(window).width() >= 768 && $(window).width() < 943){*/
		if($(window).width() < widthBrowser){
			chk = widthBrowser;
		}else{
			chk = null;
		};

		return chk;
	};



	//메뉴 XML파싱
	//1depth메뉴명 수정시 menuArr내 메뉴명수정필요
	
	var allMenuArr = [["금융상품", "mall"],["금융서비스","service"],["금융정보","info"],["카드","card"],["고객센터","cscenter"],["금융사기예방센터","secure"]];
	var gnbMenuArr = [["금융상품", "mall"],["금융서비스","service"],["금융정보","info"],["카드","card"]];
	//퇴직연금데이터
	var penstionHTML = "<li><a href='http://pension.ibk.co.kr/jsp/index.jsp' target='_blank' title='새창열림'>퇴직연금</a></li>";
	var penstionAllHTML = "<li><span style='display: none;'>퇴직연금</span><a href='http://pension.ibk.co.kr/jsp/index.jsp' data-ajax='false'>퇴직연금</a>"
		penstionAllHTML +="	   <ul class='ctg_d2' style='display: none;'>";
		penstionAllHTML +="		   <li><a href='http://pension.ibk.co.kr/jsp/index.jsp' data-ajax='false'>IBK퇴직연금</a></li>";
		penstionAllHTML +="  	   <li><a href='http://pension.ibk.co.kr/jsp/web/ko/info/info00.jsp' data-ajax='false'>퇴직연금안내</a></li>";
		penstionAllHTML +="		   <li><a href='http://pension.ibk.co.kr/jsp/co/login.jsp' data-ajax='false'>사이버창구</a></li>";
		penstionAllHTML +="		   <li><a href='http://pension.ibk.co.kr/jsp/web/ko/rl/ED_RL_info1.jsp' data-ajax='false'>IBK퇴직설계연구소</a></li>";
		penstionAllHTML +="		</ul>";
		penstionAllHTML +="</li>";

		var menu01HTML = "<item depth='2' id='FM11000000' name='개인 상품몰' p_id='FM00000000' url='https://mybank.ibk.co.kr/'></item>"
		var menu02HTML = "<item depth='2' id='FM12000000' name='기업 상품몰' p_id='FM00000000' url='https://kiup.ibk.co.kr/'></item>"

	var dt = "xml";
	if(browser_state) dt = "text";
	$.ajax({
		type : "GET",
		dataType: dt,
		url: "/common/swf/xml/uc_whole.xml",
		success: function(data) {
			var xml = parseXml(data);
			for(var i=0; i<allMenuArr.length; i++){
				$(xml).find('item').filter(function(){
					return $(this).attr('name') == allMenuArr[i][0]
				}).each(function(k, itm) {
				   var el = "<dl class='"+allMenuArr[i][1]+"'>";
					   el+= "<dt>"+allMenuArr[i][0]+"</dt><dd>";
					   el+= "<ul class='ctg_d1'>";
				   $(itm).children().each(function(k, itm){
					   if($(itm).children().length > 0){
						   var el1 = "<ul class='ctg_d2'>";
						   $(itm).children().each(function(k, itm){
							   if($(itm).children().length > 0){
								   var el2 = "<ul>";
								   $(itm).children().each(function(k, itm){
									   el2 += returnMenu(itm);
								   });
								   el2 += "</ul>";
								   el1 += returnMenu(itm, el2);
							   }else el1 += returnMenu(itm);
						   });
						   el1 += "</ul>";
							   if($(this).attr('name') == '예금' || $(this).attr('name') == '대출' || $(this).attr('name') == '펀드' || $(this).attr('name') == '외환' || $(this).attr('name') == '보험')  el += returnMenu(itm, el1, true, 'mobile');
							   else  el += returnMenu(itm, el1, true, 'pc');
					   }else el += returnDirect(itm);
				   });
				   el+= "</ul></dd></dl>";
				   $(".ctg_depth").append(el);
				});
			}
			$(".ctg_depth .mall>dd>ul").prepend('<li><a href="https://mybank.ibk.co.kr/uib/jsp/guest/ntr/ntr00/ntr0000/PNTR000000_i.jsp?_linkFrmChk=Y">개인 상품몰</a></li><li><a href="https://kiup.ibk.co.kr/uib/jsp/guest/ntr/ntr70/ntr7000/ENTR700000_m.jsp?_linkFrmChk=Y">기업 상품몰</a></li>'); //추가

			$(window).trigger('resize');

			//GNB메뉴 파싱
			for(var i=0; i<gnbMenuArr.length; i++){
				$(xml).find('item').filter(function(){
					return $(this).attr('name') == allMenuArr[i][0]
				}).each(function(k, itm) {
					var el = "<ul>";
					$(itm).children().each(function(k, itm){
						var el1 = "";
						$(itm).children().each(function(k, itm){
							el1 += returnMenu(itm);
						});
						el += returnMenuGnb(itm, el1);
					});
					if($(itm).attr("name") == "금융상품") el += penstionHTML;
					el += "</ul>";
					//$(".gnb_menu ."+allMenuArr[i][1]+" .drop_down").append(el);
				});		
			}
			//링크노드생성
			function returnMenu(itm, child, s, c){
				if(child != undefined && s) return "<li class="+c+"><span>"+replaceStr($(itm).attr("name"))+"</span><a href='"+returnLink($(itm).attr("url"), child)+"'>"+$(itm).attr("name")+"</a>"+child+"</li>";
				else if(child != undefined) return "<li class="+c+"><a href='"+returnLink($(itm).attr("url"), child)+"'>"+replaceStr($(itm).attr("name"))+"</a>"+child+"</li>";
				else return "<li class="+c+"><a href='"+$(itm).attr("url")+"'>"+replaceStr($(itm).attr("name"))+"</a></li>";
			}
			function returnDirect(itm){
				return "<li><a class='direct' href='"+$(itm).attr("url")+"'>"+replaceStr($(itm).attr("name"))+"</a></li>";
			}
			function returnMenuGnb(itm, child){
				 return "<li><a href='"+returnLink($(itm).attr("url"), child)+"'>"+$(itm).attr("name")+"</a></li>";
			}
			function returnLink(url, child){
				if(url == "#") return $("a:first", $(child)).attr("href");
				else return url;
			}
			function returnLink(url, child){
				if(url == "#") return $("a:first", $(child)).attr("href");
				else return url;
			}
			function replaceStr(str){
				return str.replace(/\\n/g, "<br />")
				
			}
			function parseXml(xml){		
				if(browser_state){
					if(window.XMLHttpRequest){
						xmlhttp = new XMLHttpRequest();
					}else{
						xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
					}
					xmlhttp.open("GET", "/common/swf/xml/uc_whole.xml", false);
					xmlhttp.send();
					xmlDoc = xmlhttp.responseXML;
					xml = xmlDoc;	
				}
				return xml;
			}
			//Event binding
			//모바일 메뉴열기
			$(".btn_ctg").on("tap click", function(){
				$("body").addClass("rebuildLayout");
				$(window).trigger("resize");
				$('.all_menu_wrap').css({"display": "block", "height": $("#wrapper").height()+"px"});
				$(".ctg_wrap").css("right", "-320px");
				$('.ctg_wrap').stop().animate({right : "0"}, 500, "easeOutCirc");
			});
			//모바일 메뉴닫기 
			$(".btn_ctg_close").on("tpa click", function(){
				$(".gnb_modal").css("display", "none");
				$('.ctg_wrap').stop().animate({right : "-320px"}, 500, "easeOutCirc", function(){
					$("body").removeClass("rebuildLayout");
					$('.all_menu_wrap').css({"display": "none", "height": "0"});
					$(".ctg_menu").css({"margin":"0 auto"});//, "overflow": "hidden"
					$(".ctg_tit p").removeClass("txt").text("IBK기업은행");
					$(".ctg_tit a").addClass("off");
					$(".ctg_depth dl>dd>ul>li ul").hide();
				});
			});
			//모바일 모달 클릭시
			$(".gnb_modal").on("tpa click", function(){
				$(".btn_ctg_close").trigger("click");
			});
			//모바일 1depth메뉴 클릭시
			$(".ctg_root li:not(.link) a").on("tap click", function(){
				$(".ctg_tit p").addClass("txt").text($(this).text());
				$(".ctg_tit a").removeClass("off");
				$(".ctg_depth dl").hide();
				$(".ctg_depth dl>dd>ul>li>ul").hide();
				$(".ctg_depth dl>dd>ul>li").removeClass("open");
				$(".ctg_depth dl."+$(this).attr('data-link')).show();
				$(".menu_view").css("overflow-y","hidden").scrollTop(0);
				$('.ctg_menu').stop().animate({marginLeft : "-320px"}, 500, "easeOutCirc", function(){
					//1depth에서 2depth로 이동시 스크롤바 히든
					$(".menu_view").css("overflow-y","auto");
				});
			});
			//모바일 1depth메뉴 돌아가기 클릭시
			$(".ctg_tit a").on("tap click", function(){
				$(".ctg_tit p").removeClass("txt").text("IBK기업은행");
				$(".ctg_tit a").addClass("off");
				$(".menu_view").css("overflow-y","hidden").scrollTop(0);
				$('.ctg_menu').stop().animate({marginLeft : "0"}, 500, "easeOutCirc", function(){
					//1depth메뉴로 돌아갈때 2depth메뉴 hide
					$(".ctg_depth dl").hide();
					$(".menu_view").css("overflow-y","auto");
				});
			});
			//모바일 2depth열고닫기
			$(".ctg_depth dl>dd>ul>li>span").on("tap click", function(){
				var t = $(this).parent(),
					p = $(">ul", t);
				if(p.is(":visible")){
					p.stop().slideUp();
					t.removeClass("open");
				}else{
					p.stop().slideDown();
					t.addClass("open");
				}
			});
			//모바일 2depth메뉴 클릭시
			//$(".ctg_d2>li>a").filter(function(){
				//return $(this).parent().children().length > 1;
			//}).on('tap click', function(){
				//var t = $(">ul", $(this).parent());
				//if(t.is(":visible")) t.stop().slideUp();
				//else t.stop().slideDown();
			//});
			mainGnb();
			
			//$(".ctg_depth dl>dd>ul>li ul").hide();
		},
		error: function(xhr, status, error){}
	});







	$(".gnb_util .util").clone().prependTo(".ctg_wrap .utilList"); //util메뉴
	$(".gnb_util .language_list").clone().prependTo(".ctg_wrap .languageBox"); //다국어
	$(".allGnb .language_list li:odd").css("width", "125px");
	$(".allGnb .allMenuWarp").css("left", "-263px");
	$(".allGnb a.menuOn").click(function(){
		var wh = $("#wrapper").height()
		$("body").addClass("rebuildLayout");
		$(".gnb_modal").css({"display" : "block", "height" : wh + "px"});
		$(".allMenuWarp").show().height(parseInt($("#wrapper").height()));
		$(".allMenuWarp").removeClass("all_menu_wrap").children().removeClass("menu_view").children().removeClass("menu_list");
		$(".allMenuWarp").animate({left:"0"}, 500, "easeOutCirc");
		$("#header").animate({marginLeft:"258px"}, 500, "easeOutCirc");
		$("#main , #footer").animate({left:"258px"}, 500, "easeOutCirc");
		$(".allGnb .menuOn").hide();
		$(".allGnb .menuOff").show();
	});

	$(".allGnb .menuOff").click(function(){
		//console.log("menuOff click");
		$(".gnb_modal").css("display", "none");
		$("body").removeClass("rebuildLayout");
		$("#header").animate({marginLeft:"0"}, 500, "easeOutCirc");
		$("#main , #footer").animate({left:"0"}, 500, "easeOutCirc");
		$(".allGnb .allMenuWarp").animate({left:"-258px"}, 500, "easeOutCirc", function(){
			$(".allGnb .allMenuWarp").hide();
			$(".allMenuWarp").addClass("all_menu_wrap").children().addClass("menu_view").children("div").addClass("menu_list");
			$(".allGnb .menuOn").show();
			$(".allGnb .menuOff").hide();
		});
	});

	$(".gnb_modal").click(function(){
		//console.log("modal click");
		$(".allGnb .menuOff").trigger("click");
	});

	$(".gnbList ul>li").each(function(){ //depth 유무 체크
		$(".gnbList ul.none").parent().removeClass("subDepth");
		if($(this).find(">ul").length != 0){
			$(this).addClass("subDepth");
		};
	});

	$(".gnbList ul li ul").hide();
	$(".gnbList ul>li.subDepth>a").click(function () {
		
		switch ( ep.getDeviceType() ) {
				case conf.device.pc :
					return;
				break;
				};			
		//if ( ($(this).parent("li").find("ul").length > 0) ) { 
		if ( ($(this).parent("li").find("ul").length > 0) && ( $(this).parent().find(">ul").hasClass("mDdepth4") == false )  ) { 
			if (!$(this).parent("li").hasClass("on")) {
				$(this).parent().parent().find("li.on ul").slideUp("500").end().find("li.on").removeClass("on");
				$(this).parent("li").addClass("on").find(">ul").slideDown("500");
			} else {
				$(this).parent().parent().find("li.on ul").parent().removeClass("on").children("ul").slideUp("500");
			}
			return false;
		}
	});
});
