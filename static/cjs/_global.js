// ---------------------------------------------------------------------------------------------
// Ready 以后的操作
$(function(){



// 获取顶层四个对象, 以及它们的 jQuery 实例对象;
// 获取 xj.storage 对象和 dir & scroll 实例对象;
let pub_win = window, pub_doc = document;
let pub_html = document.documentElement, pub_body = document.body;
let jqi_win = $(pub_win), jqi_doc = $(pub_doc), jqi_html = $(pub_html), jqi_body = $(pub_body);

let xjls = xj.storage.localStorage;
let xjss = xj.storage.sessionStorage;

let jqi_xjDir01 = $('#xjDir01');
let xjDir01Return = xj.Dir.return[jqi_xjDir01.attr('xjDirId')];

let jqi_xjScroll01 = $('#xjScroll01');
let xjScroll01Return = xj.Scroll.return[jqi_xjScroll01.attr('xjScrollId')];



// 窗口宽度尺寸小于 1284 就取消 body 的渐变背景;
// 避免阴影出现在 head 和 main 和 foot 的间隙里;
let hiddenShadow = function(){ jqi_body.css('backgroundImage', (pub_html.clientWidth <= 1284 ? 'none' : '')) };
jqi_win.on('resize', function(){ hiddenShadow() });
hiddenShadow();



// 阻止 main 和 tool 锚点默认事件, 改为滚动定位;
// 在 id 中可能存在非法符号, 用属性选择器来选择;
$('#pub_main, #pub_tool').on('click', 'a', function(e){
	
	let id = e.currentTarget.getAttribute('href');
	if(/^#/.test(id) === false){ return }
	else{ id = id.slice(1) };
	
	let jqi_idNode = $('[id="'+ id +'"]');
	if(jqi_idNode.length !== 0){
		e.preventDefault();
		jqi_idNode.xjArrive([0, 0,], 250);
		location.hash = id;
	};
	
});



// 点击右下角按钮返回顶部, 这不能用 xjArrive 了;
// 因为顶部的 head 可能是 position:fixed 定位的;
$('#pub_toolBackToTop').on('click', function(e){
$(document.scrollingElement).stop().animate({scrollTop:0}, 250) });

// 点击右下角的按钮, 来切换当前页面的导航小菜单;
// 这里用 sessionStorage 来实现跨页面的历史记录;
let jqi_pub_toolAnchorTip = $('#pub_toolAnchorTip');

if(xjss.get('toolAnchorTip') 
=== null){ xjss.set('toolAnchorTip', true) };
if(xjss.get('toolAnchorTip') !== true){ jqi_pub_toolAnchorTip.hide() };

$('#pub_toolNavigated').on('click', function(){
	if(xjss.get('toolAnchorTip') === true){
		xjss.set('toolAnchorTip', false);
		jqi_pub_toolAnchorTip.hide();
	}else{
		xjss.set('toolAnchorTip', true);
		jqi_pub_toolAnchorTip.show();
	};
});



});



// ---------------------------------------------------------------------------------------------
// 全局方法所在对象
window.xj2 = {};

// 表格排序功能函数
window.xj2._buildPowerTable = function(tableID){
	
	// 获取相关节点
	let ele_table = document.getElementById(tableID);
	let ele_thead = ele_table.querySelector('thead');
	let ele_tbody = ele_table.querySelector('tbody');
	let ele_thead_th = Array.prototype.slice.apply(ele_thead.querySelectorAll('th'));
	let ele_tbody_tr = Array.prototype.slice.apply(ele_tbody.querySelectorAll('tr'));
	
	let ele_thead_th_icon = ele_thead_th.map(
	function(ele_th){ return ele_th.querySelector('i.icon.fas') });
	let ele_originalSort_th = ele_thead_th[ ele_table.getAttribute('originalSort') ];
	
	// 定义排序方法
	function sortMethod(type, a, b){
		switch(type){
			
			// 字符串直接本地化比对后排序即可
			// case 'number' : { return a - b }; break;
			case 'string' : { return a.localeCompare(b) }; break;
			
			// isNaN 时将其视为大于所有的数值
			case 'number' : { 
				if(isNaN(parseFloat(a))){ return 1 }
				else if(isNaN(parseFloat(b))){ return -1 }
				else{ return (parseFloat(a) - parseFloat(b)) };
			}; break;
			
			// 日期排序, 因为 IE 始终无法处理 '2012-12-12' 这种格式的时间, 所以这里得将 '-' 替换成 '/'
			case 'dateTime' : { return new Date(a.split('-').join('/')).getTime() - 
			new Date(b.split('-').join('/')).getTime(); }; break;
			
			// 针对 '500 ~ 2000' 范围数的排序
			case 'numberRange' : { if(a.split(/ *~ */)[0] === b.split(/ *~ */)[0]){ return a.split(/ *~ */)[1] - b.split(/ *~ */)[1] }
				else{ return a.split(/ *~ */)[0] - b.split(/ *~ */)[0] };
			}; break;
			
		};
	};
	
	// 定义排序操作
	function sortHandle(type, flag, cellIndex){
		ele_tbody_tr.sort(function(a, b){return sortMethod(type, a.cells[cellIndex].textContent !== '' ? a.cells[cellIndex].textContent : a.cells[cellIndex].innerHTML, 
		b.cells[cellIndex].textContent !== '' ? b.cells[cellIndex].textContent : b.cells[cellIndex].innerHTML)*flag }); // 排序
		ele_tbody_tr.forEach(function(ele_tr){ ele_tbody.appendChild(ele_tr) }); // 添加
	};
	
	// 实行排序操作
	ele_thead_th.forEach(function(ele_th){
		ele_th.addEventListener('click', function(){
			
			// 获取排序类型
			let sortType = ele_th.getAttribute('sortType');
			if(Boolean(sortType) === false){ sortType = 'string' };
			
			// 获取设置了图标的 th > i 节点
			let ele_upIcon = ele_thead.querySelector('.fa-sort-up');
			let ele_downIcon = ele_thead.querySelector('.fa-sort-down');
			if(ele_upIcon){ ele_upIcon.classList.remove('fa-sort-up') };
			if(ele_downIcon){ ele_downIcon.classList.remove('fa-sort-down') };
			ele_thead_th_icon.forEach(function(i){ i.classList.add('fa-sort') });
			
			// 如果是第三次点击了, 则恢复原始排序并终止
			if(ele_th.sortFlag === -1){
				sortHandle(ele_originalSort_th.hasAttribute('sortType') ? ele_originalSort_th.getAttribute('sortType') : 'string', 1, ele_originalSort_th.cellIndex);
				ele_thead_th.forEach(function(ele_th){ delete ele_th.sortFlag });
				return;
			};
			
			// 确定升序降序, 删掉其他 th 排序属性, 排序
			if(ele_th.sortFlag === undefined){ ele_th.sortFlag = 1 }else if(ele_th.sortFlag === 1){ ele_th.sortFlag = -1 };
			ele_thead_th.forEach(function(node){ if(node !== ele_th){ delete node.sortFlag } });
			sortHandle(sortType, ele_th.sortFlag, ele_th.cellIndex);
			
			// 设置升序或降序的排序小三角图标
			ele_th.querySelector('.icon').classList.remove('fa-sort');
			ele_th.querySelector('.icon').classList.add(ele_th.sortFlag === 1 ? 'fa-sort-up' : 'fa-sort-down');
			
		}, false);
	});
	
	// 返回当前表格
	return ele_table;
	
};

// 表格原始文本处理
window.xj2._hideText = function(text, encode){
	if(encode !== true){ return (text.replace('# ','<h>') + '</h>') };
	return text.replace(/# ([\s\S]+)/, function($0, $1){ return ('<h>'+ $1.replace(/</g,'&lt;').replace(/>/g,'&gt;') +'</h>') });
};

// 动态高亮表格背景
window.xj2._groupedSet = function(jqi_powerTable){
	
	// 获取行并移除高亮
	let jqi_tr = jqi_powerTable
	.find('tbody tr').removeClass('tr-active');
	
	// 高亮首个非隐藏行
	for(let i01=0, l01=jqi_tr.length; i01<l01; i01++){
		if(jqi_tr.get(i01).classList.contains('hideTr') === true){ continue };
		jqi_tr.eq(i01).addClass('tr-active');
		break;
	};
	
	// 遍历表格的所有行
	for(let i01=0, l01=jqi_tr.length; i01<l01; i01++){
		
		// 当前行被隐藏, 那无需计算直接跳过
		let thisRow = jqi_tr.get(i01), prevRow = 'ignore';
		if(thisRow.classList.contains('hideTr') === true){ continue };
		
		// 从当前行开始, 再次遍历前面所有行
		for(let i02=i01-1; i02>-1; i02--){
			
			// 如果上一行是隐藏的就直接跳过
			let prevRow = jqi_tr.get(i02), oneGroup = false;
			if(prevRow.classList.contains('hideTr') === true){ continue }else 
			if(thisRow.getAttribute('group') === prevRow.getAttribute('group')){ oneGroup = true };
			
			// 如果上一行和当前行同类则同步
			if(oneGroup === true ){ if(prevRow.classList.contains('tr-active') === true ){
				thisRow.classList.add('tr-active') }; break;
			};
			
			// 如果非同类则高亮取反跳出循环
			if(oneGroup === false){ if(prevRow.classList.contains('tr-active') === false){
				thisRow.classList.add('tr-active') }; break;
			};
			
		};
		
	};
	
};

// 合并表格同类的行
window.xj2._rowSpanSet = function(jqi_powerTable, nth){
	
	// 项目表格行和节点
	let jqi_tr = jqi_powerTable.find('tbody tr');
	let jqi_td0 = jqi_tr.find('td:nth-of-type('+nth+')').removeClass('hideTd').removeAttr('rowSpan');
	
	// 遍历表格的所有行
	for(let i01=0, l01=jqi_tr.length; i01<l01; i01++){
		
		// 当前行被隐藏, 那无需计算直接跳过
		if(jqi_tr.get(i01).classList.contains('hideTr') === true){ continue };
		
		// 创建 rowSpan, 获取"科技名称"的值
		let rowSpanValue = 1, groupValue = jqi_tr.get(i01).getAttribute('group');
		
		// 从当前行开始, 再次遍历后面所有行
		for(let i02=i01+1, l02=jqi_tr.length; i02<l02; i02++){
			
			// 下一行是被隐藏的那就直接跳过
			if(jqi_tr.get(i02).classList.contains('hideTr') === true){ continue };
			
			// 下行不隐藏但不同组则循环终止
			if(jqi_tr.get(i02).getAttribute('group') !== groupValue){ break };
			
			// 下行不隐藏且同组则 rowSpan+1
			jqi_td0.get(i02).classList.add('hideTd'); rowSpanValue += 1;
			
		};
		
		// 设置 rowSpan, 循环跳过后面同组项
		if(rowSpanValue === 1){ continue };
		jqi_td0.get(i01).setAttribute
		('rowSpan', rowSpanValue);
		i01 = i01 + rowSpanValue - 1;
		
	};
	
};



// ---------------------------------------------------------------------------------------------
// 导航和标题的文本
(function(){



// 创建常用变量合集
let xjls = xj.storage.localStorage;
let langList = [ 'zh', 'jp', 'en', ];
let langText = xjls.get('languageText');
let langCode = langList.indexOf(langText);
let istIndex = /\/page\//i.test(location.pathname) === false;



// 如果之前从未设置过语言, 那就默认使用简体中文
// 设置过语言了, 但并不在预设范围内也是简体中文
if(langText === null || langList.includes(langText) === false){
	xjls.set('languageText','zh');
	langText = 'zh', langCode = 0;
};

// 检测地址中的参数, 值不为空且在预设范围内才行
// 如果发现合适的值就更新 langCode 和 langText;
if(location.search !== ''){
	let urlsps = new URLSearchParams(location.search);
	let urlspsLang = urlsps.get('lang');
	if(urlspsLang !== '' && langList.includes(urlspsLang) === true){
		langCode = langList.indexOf(urlspsLang);
		langText = urlspsLang;
	};
};

// 设置语言, 翻译可能自动变更 html 的 lang 属性;
// 所以给 html 加上 lang-* 的类名以固定元素显示;
xjls.set('languageText', langText);
xj2.lang = {code: langCode, text: langText, };
document.documentElement.classList.add('lang-' + langText);
document.documentElement.setAttribute('lang', 
(langText==='zh') ? 'zh-cmn-hans' : langText);



// 创建多语言的文本
xj2.i18n = {
	
	尚未完成: ['尚未完成', 'まだ作成中', 'Unfinish Yet…', ][langCode],
	铁骑少女攻略百科: ['铁骑少女攻略百科', '鉄騎少女百科事典', 'Wiki of Cavalry Girls', ][langCode],
	
	攻略百科: ['攻略百科', 			'百科事典',					'Guide & Wiki',				][langCode], 基本介绍: ['(基本介绍)', 		'(基本の紹介)',				'(Introduction)',			][langCode],
	
	新手指南: ['新手指南',			'初心者ガイド',				'Novice Guide',				][langCode], // -------------------------------------------------------------------------------------------------
	入门引导: ['入门引导',			'モデル概要',				'Modes Introduce',			][langCode], 模式介绍: ['(玩法差异)',		'(遊び方の違い)',			'(Different Gameplay)',		][langCode],
	概念解析: ['概念解析',			'内勤の運営',				'Bases Operation',			][langCode], 杂务管理: ['(杂务管理)',		'(コマンド管理)',			'(Command Management)',		][langCode],
	操作细节: ['操作细节',			'装備構成',					'Equip Construct',			][langCode], 战力构筑: ['(战力构筑)',		'(機体戦力構築)',			'(Building Combating)',		][langCode],
	
	游戏数据: ['游戏数据',			'ゲームデータ',				'Game Data',				][langCode], // -------------------------------------------------------------------------------------------------
	
	科技列表: ['科技列表',			'武器覧表',					'Weapon List',				][langCode], 真理化身: ['(真理化身)',		'(真理の化身)',				'(Avatar Incarnation)',		][langCode],
	天体信息: ['天体信息',			'武器部品',					'Weapon Model',				][langCode], 强化改造: ['(强化改造)',		'(強化の改造)',				'(Strengthen Reform)',		][langCode],
	建筑概览: ['建筑概览',			'武器融合',					'Weapon Fusion',			][langCode], 奇异拼接: ['(奇异拼接)',		'(特異の融合)',				'(Strange Splicing)',		][langCode],
	
	天体特性: ['天体特性',			'武器融合',					'Weapon Fusion',			][langCode], 奇异拼接: ['(奇异拼接)',		'(特異の融合)',				'(Strange Splicing)',		][langCode],
	文明特性: ['文明特性',			'武器融合',					'Weapon Fusion',			][langCode], 奇异拼接: ['(奇异拼接)',		'(特異の融合)',				'(Strange Splicing)',		][langCode],
	创建文明: ['创建文明',			'武器融合',					'Weapon Fusion',			][langCode], 奇异拼接: ['(奇异拼接)',		'(特異の融合)',				'(Strange Splicing)',		][langCode],
	
	议会任务: ['议会任务',			'武器融合',					'Weapon Fusion',			][langCode], 奇异拼接: ['(奇异拼接)',		'(特異の融合)',				'(Strange Splicing)',		][langCode],
	武器参数: ['武器参数',			'武器融合',					'Weapon Fusion',			][langCode], 奇异拼接: ['(奇异拼接)',		'(特異の融合)',				'(Strange Splicing)',		][langCode],
	外交行动: ['外交行动',			'武器融合',					'Weapon Fusion',			][langCode], 奇异拼接: ['(奇异拼接)',		'(特異の融合)',				'(Strange Splicing)',		][langCode],
	
	商品属性: ['商品属性',			'武器融合',					'Weapon Fusion',			][langCode], 奇异拼接: ['(奇异拼接)',		'(特異の融合)',				'(Strange Splicing)',		][langCode],
	关卡记录: ['关卡记录',			'武器融合',					'Weapon Fusion',			][langCode], 奇异拼接: ['(奇异拼接)',		'(特異の融合)',				'(Strange Splicing)',		][langCode],
	成就系统: ['成就系统',			'武器融合',					'Weapon Fusion',			][langCode], 奇异拼接: ['(奇异拼接)',		'(特異の融合)',				'(Strange Splicing)',		][langCode],
	
	机体详情: ['机体详情',			'機体詳細',					'Mecha List',				][langCode], 装备载体: ['(装备载体)',		'(装備キャリア)',			'(Equipment Carrier)',		][langCode],
	主体强化: ['主体强化',			'ボディ強化',				'Mecha Main',				][langCode], 防御提升: ['(防御提升)',		'(防御アップ)',				'(Defense Increase)',		][langCode],
	足部强化: ['足部强化',			'足部の強化',				'Mecha Foot',				][langCode], 速度提升: ['(速度提升)',		'(速度が上がる)',			'(Speed Increase)',			][langCode],
	机身挂件: ['机身挂件',			'ペンダント',				'Mecha Hang',				][langCode], 方向增益: ['(方向增益)',		'(ほうこうりとく)',			'(Direction Gain)',			][langCode],
	机体改造: ['机体改造',			'機体改造',					'Mecha Mend',				][langCode], 特别增益: ['(特别增益)',		'(とくしゅりとく)',			'(Special Gain)',			][langCode],
	投掷物品: ['投掷物品',			'投擲物',					'Mecha Frag',				][langCode], 手雷炸弹: ['(手雷炸弹)',		'(手雷爆弾)',				'(Grenade Bomb)',			][langCode],
	
	主角小队: ['主角小队',			'主役小隊',					'Pilot Intro',				][langCode], 履历档案: ['(履历档案)',		'(履歴情報)',				'(Resume File)',			][langCode],
	思潮影响: ['思潮影响',			'思潮影響',					'Pilot Think',				][langCode], 三观倾向: ['(三观倾向)',		'(三観傾向)',				'(Mind Tendency)',			][langCode],
	忠诚好感: ['忠诚好感',			'忠誠の心',					'Pilot Loyal',				][langCode], 人情世故: ['(人情世故)',		'(義理人情)',				'(Socialize Active)',		][langCode],
	饰品装备: ['饰品装备',			'アクセサリー',				'Pilot Jewel',				][langCode], 玉制物件: ['(玉制物件)',		'(玉の制品)',				'(Jade Objects)',			][langCode],
	战场技能: ['战场技能',			'戦場スキル',				'Pilot Skill',				][langCode], 精神力量: ['(精神力量)',		'(精神の力)',				'(Spiritual Power)',		][langCode],
	军衔等级: ['军衔等级',			'肩書階級',					'Pilot Level',				][langCode], 炮灰地位: ['(炮灰地位)',		'(砲灰地位)',				'(Consumables Status)',		][langCode],
	
	敌军情报: ['敌军情报',			'敵軍の情報',				'Enemy Info',				][langCode], 知己知彼: ['(知己知彼)',		'(己を知り彼を知る)',		'(Know They Are)',			][langCode],
	编队建制: ['编队建制',			'敵軍編隊制',				'Enemy Group',				][langCode], 搭配成群: ['(搭配成群)',		'(グループ化)',				'(Pair With Groups)',		][langCode],
	剧情模式: ['剧情模式',			'ストーリーモード',			'Enemy Plot',				][langCode], 主线战局: ['(主线战局)',		'(メインラインの戦局)',		'(Main Battle Situation)',	][langCode],
	特殊遭遇: ['特殊遭遇',			'特殊のな境遇',				'Enemy Mode',				][langCode], 别样玩法: ['(别样玩法)',		'(別の遊び方)',				'(Unique Gameplay)',		][langCode],
	外勤任务: ['外勤任务',			'外勤任務',					'Enemy Outer',				][langCode], 主动出击: ['(主动出击)',		'(自発的に出撃する).',		'(Outside Takes)',			][langCode],
	假日安排: ['假日安排',			'休日予定',					'Enemy Rest',				][langCode], 可选任务: ['(可选任务)',		'(オプションのタスク)',		'(Optional Tasks)',			][langCode],
	
	城防设施: ['城防设施',			'防衛施設',					'Manage Defenses',			][langCode], 防守装置: ['(防守装置)',		'(ガード装置)',				'(Defense Device)',			][langCode],
	战略支援: ['战略支援',			'戦略支援',					'Manage Strategy',			][langCode], 空中打击: ['(空中打击)',		'(空中攻撃)',				'(Air Strike)',				][langCode],
	家具清单: ['家具清单',			'家具リスト',				'Manage Renovate',			][langCode], 宿舍装修: ['(宿舍装修)',		'(寮の内装)',				'(Dormitory Decoration)',	][langCode],
	回收废料: ['回收废料',			'廃棄物回収',				'Manage Material',			][langCode], 残骸解体: ['(残骸解体)',		'(残骸解体)',				'(Wreck Disintegration)',	][langCode],
	费用计算: ['费用计算',			'費用計算',					'Manage Expenses',			][langCode], 收支细节: ['(收支细节)',		'(収支詳細)',				'(Finance Details)',		][langCode],
	基地部门: ['基地部门',			'基地部門',					'Manage Building',			][langCode], 运营建设: ['(运营建设)',		'(運営建設)',				'(Operate & Construct)',	][langCode],
	
	商品权重: ['商品权重',			'商品ウェイト',				'Others Priority',			][langCode], 售卖概率: ['(售卖概率)',		'(販売確率)',				'(Selling Probability)',	][langCode],
	成就系统: ['成就系统',			'成果システム',				'Others Achieved',			][langCode], 探索进度: ['(探索进度)',		'(探索の進度)',				'(Explore Progress)',		][langCode],
	奖惩机制: ['奖惩机制',			'賞罰の仕組み',				'Others Advanced',			][langCode], 好坏加成: ['(好坏加成)',		'(善悪を足す)',				'(Extra Bonus)',			][langCode],
	台词对白: ['台词对白',			'せりふセリフ',				'Others Dialogue',			][langCode], 角色塑造: ['(角色塑造)',		'(役作こうぞう)',			'(Role Build)',				][langCode],
	术语提示: ['术语提示',			'用語ヒント',				'Others Parlance',			][langCode], 解析文本: ['(解析文本)',		'(テキスト解析)',			'(Analyze Text)',			][langCode],
	问题合集: ['问题合集',			'問題の集合',				'Others Question',			][langCode], 疑难杂症: ['(疑难杂症)',		'(難病解析する)',			'(Problem Analyse)',		][langCode],
	
	事件剧情: ['事件剧情',			'イベントリスト',			'Event Listing',			][langCode], // -------------------------------------------------------------------------------------------------
	剧情环境: ['剧情环境',			'ストーリーモード',			'Event Plot',				][langCode], 发生顺序: ['(发生顺序)',		'(発生の順序)',				'(Sequent Occur)',			][langCode],
	特殊场景: ['特殊场景',			'その他のモード',			'Event Other',				][langCode], 额外收获: ['(额外收获)',		'(余分な収穫)',				'(Extra Harvest)',			][langCode],
	事件详情: ['事件详情',			'イベント詳細',				'Event Detail',				][langCode], 选择结果: ['(选择结果)',		'(結果の選択)',				'(Select Result)',			][langCode],
	
	衍生内容: ['衍生内容',			'デリバティブ',				'Derivative',				][langCode], // -------------------------------------------------------------------------------------------------
	网站更新: ['网站更新',			'ウェブサイトの更新',		'Wiki Update',				][langCode], 历史记录: ['(历史记录)',		'(歴史の記録)',				'(History Record)',			][langCode],
	艺术作品: ['艺术作品',			'アーティスト作品',			'Artist Works',				][langCode], // None
	创意工坊: ['创意工坊',			'ワークショップ',			'Works Shop',				][langCode], // None
	
	相关地址: ['相关地址',			'そうかんアドレス',			'Related Links',			][langCode], // -------------------------------------------------------------------------------------------------
	游戏更新: ['游戏更新',			'ゲームアップデート',		'Game Updated',				][langCode], // None
	蒸汽社区: ['蒸汽社区',			'ゲームコミュニティ',		'Game Discuss',				][langCode], // None
	哔哩哔哩: ['哔哩哔哩',			'ぴりぴり.com',				'BiliBili.com',				][langCode], // None
	百度贴吧: ['百度贴吧',			'百度フォーラム',			'TieBa.BaiDu',				][langCode], // None
	百科反馈: ['百科反馈',			'百科のエラーの報告',		'Wiki Feedback',			][langCode], // None
	百科下载: ['百科下载',			'百科のダウンロード',		'Wiki Download',			][langCode], // None
	
	友情链接: ['友情链接',			'相互リンク',				'Friendship Link',			][langCode], // -------------------------------------------------------------------------------------------------
	废土快递: ['废土快递',			'廃土の急便',				'Wasteland Express',		][langCode], // None
	铁骑少女: ['铁骑少女',			'鉄騎の少女',				'Cavalry Girls',			][langCode], // None
	
};



// 子页左侧导航数据
xj2._dirRepeatAnchor = $(/*html*/`
		
	<li><a href="${istIndex?'.':'..'}/index.html"><i class="xjDir-icon"><img style="display:inline-block;vertical-align:top;height:54px;border:0;" src="${istIndex?'.':'..'}/static/icon/logo01.png" /></i></a></li>
	
	<li class="xjDir-divide"></li>
	<li class="xjDir-spread">
		<a class="xj-ripple" href="javascript:void(0)"><i class="xjDir-icon fas fa-compass"></i><i class="xjDir-text">新手指南</i><i class="xjDir-sign"></i></a>
		<ul>
			<li><a href="./${istIndex?'page/':''}guide_start.html">				<i class="xjDir-icon fas fa-1">.</i>					<i class="xjDir-text"><span>入门引导</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}guide_concept.html">			<i class="xjDir-icon fas fa-2">.</i>					<i class="xjDir-text"><span>概念解析</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}guide_operation.html">			<i class="xjDir-icon fas fa-3">.</i>					<i class="xjDir-text"><span>操作细节</span></i></a></li>
		</ul>
	</li>
	
	<li class="xjDir-divide"></li>
	<li class="xjDir-spread">
		<a class="xj-ripple" href="javascript:void(0)"><i class="xjDir-icon fas fa-circle-info"></i><i class="xjDir-text">游戏数据</i><i class="xjDir-sign"></i></a>
		<ul>
			<li><a href="./${istIndex?'page/':''}data_techList.html">			<i class="xjDir-icon fas fa-microscope"></i>			<i class="xjDir-text"><span>科技列表</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_building.html">			<i class="xjDir-icon fas fa-landmark"></i>				<i class="xjDir-text"><span>建筑概览</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_starInfo.html">			<i class="xjDir-icon fas fa-sun"></i>					<i class="xjDir-text"><span>天体信息</span></i></a></li>
			<li class="xjDir-divide"></li>
			
			<!--◇
			天体特性 用这个图标? <i class="fa-solid fa-group-arrows-rotate"></i>
			天体特性 用这个图标? <i class="fa-solid fa-plus-minus"></i>
			<li class="xjDir-disabled"><a href="javascript:void(0)">			<i class="xjDir-icon fas fa-brain"></i>					<i class="xjDir-text"><span>${xj2.i18n.思潮特质}</span></i></a></li>
			<li class="xjDir-disabled"><a href="javascript:void(0)">			<i class="xjDir-icon fas fa-explosion"></i>				<i class="xjDir-text"><span>${xj2.i18n.武器参数}</span></i></a></li>
			<li class="xjDir-disabled"><a href="javascript:void(0)">			<i class="xjDir-icon fas fa-list-check"></i>			<i class="xjDir-text"><span>${xj2.i18n.议会任务}</span></i></a></li>
			<li class="xjDir-divide"></li>
			◇-->
			
			<li class="xjDir-disabled"><a href="javascript:void(0)">			<i class="xjDir-icon fas fa-question"></i>				<i class="xjDir-text"><span>${xj2.i18n.天体特性}</span></i></a></li>
			<li class="xjDir-disabled"><a href="javascript:void(0)">			<i class="xjDir-icon fas fa-question"></i>				<i class="xjDir-text"><span>${xj2.i18n.文明特性}</span></i></a></li>
			<li class="xjDir-disabled"><a href="javascript:void(0)">			<i class="xjDir-icon fas fa-question"></i>				<i class="xjDir-text"><span>${xj2.i18n.创建文明}</span></i></a></li>
			<li class="xjDir-divide"></li>
			
			<li class="xjDir-disabled"><a href="javascript:void(0)">			<i class="xjDir-icon fas fa-question"></i>				<i class="xjDir-text"><span>${xj2.i18n.议会任务}</span></i></a></li>
			<li class="xjDir-disabled"><a href="javascript:void(0)">			<i class="xjDir-icon fas fa-question"></i>				<i class="xjDir-text"><span>${xj2.i18n.武器参数}</span></i></a></li>
			<li class="xjDir-disabled"><a href="javascript:void(0)">			<i class="xjDir-icon fas fa-question"></i>				<i class="xjDir-text"><span>${xj2.i18n.外交行动}</span></i></a></li>
			<li class="xjDir-divide"></li>
			
			<li class="xjDir-disabled"><a href="javascript:void(0)">			<i class="xjDir-icon fas fa-question"></i>				<i class="xjDir-text"><span>${xj2.i18n.商品属性}</span></i></a></li>
			<li class="xjDir-disabled"><a href="javascript:void(0)">			<i class="xjDir-icon fas fa-question"></i>				<i class="xjDir-text"><span>${xj2.i18n.关卡记录}</span></i></a></li>
			<li class="xjDir-disabled"><a href="javascript:void(0)">			<i class="xjDir-icon fas fa-question"></i>				<i class="xjDir-text"><span>${xj2.i18n.成就系统}</span></i></a></li>
			<li class="xjDir-divide"></li>
			
			<!--◇
			<li><a href="./${istIndex?'page/':''}data_mecha_list.html">			<i class="xjDir-icon fas fa-robot"></i>					<i class="xjDir-text"><span>${xj2.i18n.机体详情}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_mecha_main.html">			<i class="xjDir-icon fas fa-user-gear"></i>				<i class="xjDir-text"><span>${xj2.i18n.主体强化}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_mecha_foot.html">			<i class="xjDir-icon fas fa-gauge-high"></i>			<i class="xjDir-text"><span>${xj2.i18n.足部强化}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_mecha_hang.html">			<i class="xjDir-icon fas fa-shield-halved"></i>			<i class="xjDir-text"><span>${xj2.i18n.机身挂件}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_mecha_mend.html">			<i class="xjDir-icon fas fa-screwdriver-wrench"></i>	<i class="xjDir-text"><span>${xj2.i18n.机体改造}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_mecha_frag.html">			<i class="xjDir-icon fas fa-bomb"></i>					<i class="xjDir-text"><span>${xj2.i18n.投掷物品}</span></i></a></li>
			<li class="xjDir-divide"></li>
			
			<li><a href="./${istIndex?'page/':''}data_pilot_intro.html">		<i class="xjDir-icon fas fa-people-group"></i>			<i class="xjDir-text"><span>${xj2.i18n.主角小队}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_pilot_think.html">		<i class="xjDir-icon fas fa-book-open-reader"></i>		<i class="xjDir-text"><span>${xj2.i18n.思潮影响}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_pilot_loyal.html">		<i class="xjDir-icon fas fa-heart"></i>					<i class="xjDir-text"><span>${xj2.i18n.忠诚好感}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_pilot_jewel.html">		<i class="xjDir-icon fas fa-gem"></i>					<i class="xjDir-text"><span>${xj2.i18n.饰品装备}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_pilot_skill.html">		<i class="xjDir-icon fas fa-star"></i>					<i class="xjDir-text"><span>${xj2.i18n.战场技能}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_pilot_level.html">		<i class="xjDir-icon fas fa-medal"></i>					<i class="xjDir-text"><span>${xj2.i18n.军衔等级}</span></i></a></li>
			<li class="xjDir-divide"></li>
			
			<li><a href="./${istIndex?'page/':''}data_enemy_info.html">			<i class="xjDir-icon fas fa-skull"></i>					<i class="xjDir-text"><span>${xj2.i18n.敌军情报}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_enemy_group.html">		<i class="xjDir-icon fas fa-users-line"></i>			<i class="xjDir-text"><span>${xj2.i18n.编队建制}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_enemy_plot.html">			<i class="xjDir-icon fas fa-list-ol"></i>				<i class="xjDir-text"><span>${xj2.i18n.剧情模式}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_enemy_mode.html">			<i class="xjDir-icon fas fa-list-check"></i>			<i class="xjDir-text"><span>${xj2.i18n.特殊遭遇}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_enemy_outer.html">		<i class="xjDir-icon far fa-paste"></i>					<i class="xjDir-text"><span>${xj2.i18n.外勤任务}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_enemy_rest.html">			<i class="xjDir-icon fas fa-calendar-days"></i>			<i class="xjDir-text"><span>${xj2.i18n.假日安排}</span></i></a></li>
			<li class="xjDir-divide"></li>
			
			<li><a href="./${istIndex?'page/':''}data_manage_defenses.html">	<i class="xjDir-icon fas fa-chess-rook"></i>			<i class="xjDir-text"><span>${xj2.i18n.城防设施}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_manage_strategy.html">	<i class="xjDir-icon fas fa-plane-up"></i>				<i class="xjDir-text"><span>${xj2.i18n.战略支援}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_manage_renovate.html">	<i class="xjDir-icon fas fa-chair"></i>					<i class="xjDir-text"><span>${xj2.i18n.家具清单}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_manage_material.html">	<i class="xjDir-icon fas fa-recycle"></i>				<i class="xjDir-text"><span>${xj2.i18n.回收废料}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_manage_expenses.html">	<i class="xjDir-icon fas fa-money-bill"></i>			<i class="xjDir-text"><span>${xj2.i18n.费用计算}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_manage_building.html">	<i class="xjDir-icon fas fa-warehouse"></i>				<i class="xjDir-text"><span>${xj2.i18n.基地部门}</span></i></a></li>
			<li class="xjDir-divide"></li>
			
			<li><a href="./${istIndex?'page/':''}data_others_priority.html">	<i class="xjDir-icon fas fa-scale-balanced"></i>		<i class="xjDir-text"><span>${xj2.i18n.商品权重}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_others_achieved.html">	<i class="xjDir-icon fas fa-trophy"></i>				<i class="xjDir-text"><span>${xj2.i18n.成就系统}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_others_advanced.html">	<i class="xjDir-icon fas fa-sliders"></i>				<i class="xjDir-text"><span>${xj2.i18n.奖惩机制}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_others_dialogue.html">	<i class="xjDir-icon fas fa-comment-dots"></i>			<i class="xjDir-text"><span>${xj2.i18n.台词对白}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_others_parlance.html">	<i class="xjDir-icon fas fa-tags"></i>					<i class="xjDir-text"><span>${xj2.i18n.术语提示}</span></i></a></li>
			<li><a href="./${istIndex?'page/':''}data_others_question.html">	<i class="xjDir-icon fas fa-circle-question"></i>		<i class="xjDir-text"><span>${xj2.i18n.问题合集}</span></i></a></li>
			◇-->
		</ul>
	</li>
	
	<li class="xjDir-divide"></li>
	<li class="xjDir-spread">
		<a class="xj-ripple" href="javascript:void(0)"><i class="xjDir-icon fas fa-square-pen"></i><i class="xjDir-text">${xj2.i18n.事件剧情}</i><i class="xjDir-sign"></i></a>
		<ul>
			<li class="xjDir-disabled"><a href="javascript:void(0)">			<i class="xjDir-icon fas fa-file"></i>					<i class="xjDir-text"><span>${xj2.i18n.剧情环境}</span></i></a></li>
			<li class="xjDir-disabled"><a href="javascript:void(0)">			<i class="xjDir-icon fas fa-file-lines"></i>			<i class="xjDir-text"><span>${xj2.i18n.特殊场景}</span></i></a></li>
			<li class="xjDir-disabled"><a href="javascript:void(0)">			<i class="xjDir-icon fas fa-book"></i>					<i class="xjDir-text"><span>${xj2.i18n.事件详情}</span></i></a></li>
		</ul>
	</li>
	
	<li class="xjDir-divide"></li>
	<li class="xjDir-spread">
		<a class="xj-ripple" href="javascript:void(0)"><i class="xjDir-icon fas fa-square-plus"></i><i class="xjDir-text">${xj2.i18n.衍生内容}</i><i class="xjDir-sign"></i></a>
		<ul>
			<li><a href="./${istIndex?'page/':''}ertra_wiki_update.html">							<i class="xjDir-icon fas fa-rotate"></i>				<i class="xjDir-text"><span>${xj2.i18n.网站更新}</span></i></a></li>
			<li><a target="_blank" href="https://steamcommunity.com/app/1312900/images/">			<i class="xjDir-icon fas fa-paintbrush"></i>			<i class="xjDir-text"><span>${xj2.i18n.艺术作品}</span></i></a></li>
			<li><a target="_blank" href="https://steamcommunity.com/app/1312900/workshop/">			<i class="xjDir-icon fas fa-puzzle-piece"></i>			<i class="xjDir-text"><span>${xj2.i18n.创意工坊}</span></i></a></li>
			<!--
			<li class="xjDir-disabled"><a href="./${istIndex?'page/':''}extra_modify_save.html">	<i class="xjDir-icon fas fa-code"></i>					<i class="xjDir-text"><span>${xj2.i18n.修改存档}</span></i></a></li>
			<li class="xjDir-disabled"><a href="./${istIndex?'page/':''}ertra_good_mod.html">		<i class="xjDir-icon fas fa-puzzle-piece"></i>			<i class="xjDir-text"><span>${xj2.i18n.模组推荐}</span></i></a></li>
			-->
		</ul>
	</li>
	
	<li class="xjDir-divide"></li>
	<li class="xjDir-spread">
		<a class="xj-ripple" href="javascript:void(0)"><i class="xjDir-icon fas fa-signs-post"></i><i class="xjDir-text">${xj2.i18n.相关地址}</i><i class="xjDir-sign"></i></a>
		<ul>
			<li><a target="_blank" href="https://steamcommunity.com/app/1312900/eventcomments/">	<i class="xjDir-icon fas fa-clock-rotate-left"></i>		<i class="xjDir-text"><span>${xj2.i18n.游戏更新}</span></i></a></li>
			<li><a target="_blank" href="https://steamcommunity.com/app/1312900/discussions/">		<i class="xjDir-icon fab fa-steam"></i>					<i class="xjDir-text"><span>${xj2.i18n.蒸汽社区}</span></i></a></li>
			<li><a target="_blank" href="https://search.bilibili.com/all?keyword=暗深森林">			<i class="xjDir-icon fab fa-bilibili"></i>				<i class="xjDir-text"><span>${xj2.i18n.哔哩哔哩}</span></i></a></li>
			<li><a target="_blank" href="https://tieba.baidu.com/f?kw=深暗森林">					<i class="xjDir-icon fas fa-paw"></i>					<i class="xjDir-text"><span>${xj2.i18n.百度贴吧}</span></i></a></li>
			<li><a target="_blank" href="https://github.com/xjwiki/deepDarkForest/issues">			<i class="xjDir-icon fas fa-bug"></i>					<i class="xjDir-text"><span>${xj2.i18n.百科反馈}</span></i></a></li>
			<li><a target="_blank" href="https://github.com/xjwiki/deepDarkForest/releases">		<i class="xjDir-icon fas fa-download"></i>				<i class="xjDir-text"><span>${xj2.i18n.百科下载}</span></i></a></li>
		</ul>
	</li>
	
	<li class="xjDir-spread">
		<a class="xj-ripple" href="javascript:void(0)"><i class="xjDir-icon fas fa-handshake-simple"></i><i class="xjDir-text">${xj2.i18n.友情链接}</i><i class="xjDir-sign"></i></a>
		<ul>
			<li><a target="_blank" href="https://xjwiki.github.io/wastelandExpress/">				<i class="xjDir-icon fas fa-hand-point-right"></i>		<i class="xjDir-text"><span>${xj2.i18n.废土快递}</span></i></a></li>
			<li><a target="_blank" href="https://xjwiki.github.io/cavalryGirls/">					<i class="xjDir-icon fas fa-hand-point-right"></i>		<i class="xjDir-text"><span>${xj2.i18n.铁骑少女}</span></i></a></li>
		</ul>
	</li>
	
`);

})();


