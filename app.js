const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const state = {theme:'all',period:'all',region:'all',tradition:'all',subtopic:'all',status:'all',query:''};
let catalog = {themes:[],nodes:[],relations:[]};
const themeById = (id) => catalog.themes.find(t => t.id === id);
const tagNames = (node) => [node.theme,...node.related].map(id => themeById(id)?.name).filter(Boolean);
const periodOf = (node) => node.year == null ? 'undated' : node.year <= 0 ? 'bce' : node.year <= 999 ? 'early' : node.year <= 1799 ? 'middle' : 'recent';
const statusLabel = node => node.status === 'sourced' ? '附直接来源' : '待核候选';

const paths = [
 {title:'农业、定居与早期城市',desc:'从食物生产与定居出发，对读西亚、东亚和南亚的不同路径。',themes:['T02','T04'],nodes:['T02-N01','T04-N01','T04-N02'],sections:[['从农业社群到城市','北美索不达米亚的农业社群与南部后来的城市化之间相隔很长时间。把两者直接画成一条“必然进步”的箭头，会遮住不同地区各自的生产方式和聚居选择。'],['对读不同地区','乌鲁克与印度河流域城市可放在同一张时间轴上比较：关注聚落规模、用水与组织形式，同时保留各自的年代范围与考古证据。']]},
 {title:'文字、记录与知识传播',desc:'从早期记事到印刷技术，观察知识如何被保存与扩散。',themes:['T03','T06'],nodes:['T03-N01','T03-N03','T03-N04'],sections:[['记录为什么重要','早期书写与城市的记事需求相互关联。记录保存的信息能够服务于交换、管理和知识传递，但具体用途需要查阅出土文本。'],['印刷有多条历史','东亚的印刷发展与15世纪欧洲的金属活字印刷属于不同的技术与社会脉络。本路径把它们并列阅读，不设一个“世界首次印刷”的单一节点。']]},
 {title:'宗教、制度与跨地区交流',desc:'把信仰传统放在其社会组织与交流网络中阅读。',themes:['T01','T07'],nodes:['T01-N01','T01-N02','T01-N03','T07-N02'],sections:[['地点与传统','南亚、东非和阿拉伯半岛都留下了宗教传统发展的重要线索。理解它们，需要分别阅读当地社会、政治组织与文献。'],['交流中的变化','商路与人员流动让思想传播成为可能；传播路线并不能单独解释信仰为何被接受、改变或争论。关系图只把这些主题连在一起，不自动宣称因果。']]},
 {title:'能源、工业化与城市生活',desc:'沿生产方式、城市环境和劳动生活的交汇处继续探索。',themes:['T02','T04','T10'],nodes:['T02-N03','T04-N04','T10-N04'],sections:[['生产与聚居','英国工业时期的蒸汽动力是观察能源与生产变化的一条线索。城市扩张和劳动生活有各自的地区差异，不能仅由一项技术解释。'],['劳动制度的回应','国际劳工组织于1919年成立。本路径将机械化、城市生活与劳动制度并列，追问不同群体如何经历这些变化。']]},
 {title:'技术、战争与公共卫生',desc:'比较技术实践在冲突与照护中的不同作用。',themes:['T03','T05','T09'],nodes:['T05-N03','T09-N03','T09-N04'],sections:[['同一时代，不同用途','20世纪的战争、药物研究和公共卫生行动涉及各自不同的机构和目标。把它们放在同一时期比较，能够追问技术选择由谁决定、影响了谁。'],['从发现到公共行动','青霉素的发现与临床使用并非同一年；消灭天花则依赖跨地区的公共卫生协作。技术史需要同时记录实验、应用与组织实施。']]},
 {title:'南亚思想与佛教传播',desc:'从吠陀传统、佛教与耆那教的不同回应，读到王室赞助、犍陀罗和东亚。',themes:['T01','T07'],nodes:['T01-N07','T01-N08','T01-N01','T01-N11','T01-N12','T01-N17','T01-N18'],sections:[['传统不是单点创立','不同经典和实践在南亚跨越多个世纪发展。佛教、耆那教对既有思想环境作出不同回应。'],['传播需要地方实践','王室赞助、寺院、造像、贸易、译经与地方宫廷分别发挥作用，不能画成一条必然的东传直线。']]},
 {title:'三大一神教的制度与地区发展',desc:'并读犹太教、基督教、伊斯兰教的不同历史节点和地方社群。',themes:['T01','T06'],nodes:['T01-N13','T01-N14','T01-N15','T01-N02','T01-N03','T01-N20','T01-N24','T01-N25'],sections:[['从地方到跨地区','三条传统各有经典、社群和制度史，时间上的并列不表示彼此直接衍生。'],['地区经验','罗马世界、东非、西亚、西非和东南亚提供不同传播与地方接受的实例。']]},
 {title:'信仰、权力与战争',desc:'对照赞助、争论、改革、军事动员及战时保护的具体历史语境。',themes:['T01','T05'],nodes:['T05-N05','T01-N11','T01-N22','T05-N06','T01-N04','T05-N07','T05-N09','T05-N10'],sections:[['区分关系类型','阿育王的战后政策、拜占庭圣像争论、十字军行动和宗教改革属于不同的制度与冲突问题。'],['平民和保护','近现代战争中的群体迫害与平民经历必须单列；日内瓦公约代表战时保护规则的演进，不能把战争概述替代受害者史。']]},
 {title:'佛教的地方化与经典网络',desc:'对读斯里兰卡、东亚、喜马拉雅与东南亚的寺院、经典、造像和朝圣。',themes:['T01','T06'],nodes:['T01-N39','T01-N40','T01-N41','T01-N42','T01-N43','T01-N44','T01-N45','T01-N62'],sections:[['多地的佛教史','圣地、译经、宗派、艺术与藏经保存各有形成过程；并列节点便于比较，不表示它们依次产生。'],['追踪具体媒介','查看每条节点的资料来源，再区分旅行者、寺院、宫廷与工匠在不同地区的作用。']]},
 {title:'基督教社群、分歧与改革',desc:'沿亚美尼亚、埃及、东欧、埃塞俄比亚与拉丁教会的不同历程阅读。',themes:['T01','T05'],nodes:['T01-N37','T01-N38','T01-N47','T01-N48','T01-N46','T01-N04','T01-N63','T01-N64'],sections:[['多中心的社群','修道、王室支持、教会分歧和地方建筑传统不能归结为一条单向传播路线。'],['改革与殖民语境','宗教改革、特伦托会议与殖民时期传教属于不同场景；关系只在来源支持时单独标注。']]},
 {title:'伊斯兰制度与非洲学术网络',desc:'并读教派形成、苏菲实践、朝觐、撒哈拉南缘的学术城市。',themes:['T01','T04'],nodes:['T01-N49','T01-N50','T01-N24','T01-N51','T01-N25','T01-N52'],sections:[['内部多样性','法学、宗教实践和社群认同随地区与时代变化，不能用单一机构代表整个传统。'],['城市与网络','朝觐港口和廷巴克图的学校展示人员、书籍与地方制度的不同联系。']]},
 {title:'地方圣地与物质文化',desc:'比较安第斯、约鲁巴与其他传统的遗址、圣林和城市艺术。',themes:['T01','T04'],nodes:['T01-N34','T01-N32','T01-N35','T01-N36'],sections:[['地点也是历史材料','神庙、城市艺术与圣林提供可观察的线索，但其用途和意义须结合当地传统与具体资料解释。'],['并读而非传承链','这些节点位于不同社会；阅读路径只提供比较，不宣称它们之间有历史传承关系。']]},
 {title:'寺庙、圣地与地方社会',desc:'从美山、吴哥、蒲甘到武当与大洋洲祭祀场所，比较宗教空间的组织方式。',themes:['T01','T04'],nodes:['T01-N65','T01-N66','T01-N67','T01-N69','T01-N68','T01-N74'],sections:[['地点不能替代整个传统','寺庙、圣林和祭祀场所的历史依赖具体的营建、使用和地方社群；本路径只做跨地区对读。'],['关注空间与权力','王室赞助、布施、航海联盟和社群守护是不同机制，各节点分别标明其依据。']]},
 {title:'古代联盟与近代帝国冲突',desc:'比较希腊城邦、清朝、印度殖民地及东亚战争中的权力格局。',themes:['T05','T06'],nodes:['T05-N13','T05-N14','T05-N17','T05-N18','T05-N19','T05-N22'],sections:[['战争有各自的动员方式','城邦联盟、贸易和军事扩张、殖民治理及内部叛乱不属于同一种冲突。'],['留意材料视角','战时版画、殖民档案与博物馆概述各有取材范围，不能把一方叙述当作所有参与者的经历。']]},
 {title:'战争中的平民与强迫迁移',desc:'从欧洲内战到20世纪种族灭绝，阅读受害者经历及其司法记录。',themes:['T05','T10'],nodes:['T05-N15','T05-N20','T05-N23','T05-N24','T05-N28','T05-N30','T05-N32'],sections:[['区分不同暴力','内战、核轰炸、国家迫害和种族灭绝的法律与历史语境不同，节点不以一个伤亡数字作统一排序。'],['记录受害者','资料应说明遭到迫害的群体、地点与责任；对争议和估计数字保留来源的精度。']]},
 {title:'停战、维和与国际人道法',desc:'沿和约、维和行动、战时保护条约与追诉机构，观察各制度的适用范围。',themes:['T05','T06'],nodes:['T05-N16','T05-N07','T05-N10','T05-N12','T05-N25','T05-N27','T05-N29','T05-N31','T05-N33'],sections:[['不同制度处理不同问题','停战、维和、伤者与平民保护、刑事追诉分别有自己的授权、参与方和适用范围。'],['法律文本与实践分开','条约通过不等于立即生效或完全执行；每个节点只陈述其来源能支持的制度事实。']]},
 {title:'各地圣地与地方社会',desc:'比较安第斯、非洲、太平洋及南亚的祭祀地点、王权和社区传统。',themes:['T01','T04'],nodes:['T01-N78','T01-N79','T01-N80','T01-N81','T01-N82','T01-N83','T01-N84'],sections:[['不同地点，不同证据','查文石构、绍纳石雕、卡亚圣林、布干达王陵、南马都尔石岛、康提佛牙寺和加奥陵墓各有自己的年代与社会脉络。'],['当地社群的持续实践','有些遗址今天仍有仪式意义。遗址营建日期、文物年代与现行实践不可当作同一个时间点。']]},
 {title:'宗教建筑与战时文化保护',desc:'从科尔多瓦、特热比奇到巴米扬，区分遗址历史、蓄意破坏与保护条约。',themes:['T01','T05'],nodes:['T01-N85','T01-N86','T01-N87','T05-N43','T05-N45'],sections:[['地点有多层历史','清真寺与主教座堂的建筑阶段、犹太社群与教堂的邻处、佛教洞窟与造像都要分别依据材料说明。'],['保护规则有适用范围','1954年海牙公约是国家间的法律框架；2001年巴米扬立佛被毁是另一个具体事件，不从时间相邻推定个案法律责任。']]},
 {title:'殖民、革命与战争中的人',desc:'通过海地、拉吉什、美西战争和亚美尼亚种族灭绝，留意材料与受害者视角。',themes:['T05','T10'],nodes:['T05-N34','T05-N35','T05-N36','T05-N37'],sections:[['史料类型影响我们看到什么','王宫浮雕、国家纪念地年表、驻军史和大屠杀研究机构保存的是不同类型的材料。'],['区分战争与迫害','民族独立战争、帝国扩张和针对特定群体的有组织杀害不能合并成一个战役名单。']]},
 {title:'世界大战、停战与追诉',desc:'从索姆河战役到军控条约、朝鲜停战和前南斯拉夫法庭。',themes:['T05','T06'],nodes:['T05-N03','T05-N38','T05-N39','T05-N44','T05-N11','T05-N40','T05-N42','T05-N41','T05-N32'],sections:[['从战事到机制','一战毒气使用与1925年议定书、朝鲜战争与停战、波黑战争与国际追诉各有可查的关系，但并非同一种制度。'],['保留法律时间线','条约签署、生效和执行，法庭设立与具体审判都不能混作单一日期。']]},
 {title:'佛教圣地与南亚多宗教石窟',desc:'从蓝毗尼、菩提伽耶到埃洛拉，区分传统记忆、铭文与后世建筑。',themes:['T01','T04'],nodes:['T01-N01','T01-N89','T01-N90','T01-N92'],sections:[['年代和证据','蓝毗尼的阿育王石柱年代不是佛陀生年；菩提伽耶的早期赞助和现存主殿也属于不同阶段。'],['多种传统并置','埃洛拉保存佛教、印度教与耆那教营建，不宜当成单一传统的遗址。']]},
 {title:'美洲聚落与祭祀景观',desc:'比较卡拉尔、特奥蒂瓦坎与卡霍基亚的城市和仪式空间。',themes:['T01','T04'],nodes:['T01-N88','T01-N91','T01-N93'],sections:[['相似形式不等于同一起源','广场、金字塔与土墩在各地社会具有不同用途，需结合考古材料阅读。'],['聚落的组织','农业、劳动、公共建筑与祭祀之间的联系需要在具体遗址中逐项解释。']]},
 {title:'在世圣地与祖先纪念',desc:'从阿南古土地法、拉帕努伊石像到东亚神社与孔庙。',themes:['T01','T10'],nodes:['T01-N95','T01-N96','T01-N97','T01-N98'],sections:[['活的传统','乌鲁鲁—卡塔丘塔的阿南古法持续存在，不能只当作古迹。'],['建筑的阶段','祭台、神社和庙宇的现存形态与最初营建可能相隔数百年。']]},
 {title:'反殖民战争与独立安排',desc:'并读阿杜瓦、阿尔及利亚及孟加拉国的不同独立历程。',themes:['T05','T06'],nodes:['T05-N46','T05-N49','T05-N51'],sections:[['不同的政治过程','战场胜利、谈判停火和独立战争中的平民暴行各有自己的证据。'],['关注平民','民族独立叙事不能遮盖战争中的群体暴力及其争议数字。']]},
 {title:'战争、化学武器与平民保护',desc:'对照两伊战争、哈拉卜贾与地雷和集束弹药禁约。',themes:['T05','T06'],nodes:['T05-N39','T05-N52','T05-N53','T05-N44','T05-N55','T05-N57'],sections:[['法律与事件','1925年议定书、化学武器公约和两类常规武器公约的禁止范围不同。'],['战俘与平民','红十字记录的战俘探视、哈拉卜贾袭击和战后遗留伤害应分开理解。']]},
 {title:'战后审判与和平协议',desc:'从纽伦堡到代顿和塞拉利昂，区分追责、停火及战后实施。',themes:['T05','T06'],nodes:['T05-N48','T05-N41','T05-N42','T05-N54','T05-N56'],sections:[['机制各异','国际军事法庭、安理会法庭、混合法庭和和平协议的管辖及目标不同。'],['过程而非终点','签署协议或成立法庭并不意味着战后保护、返回和司法立即完成。']]},

 {title:'经卷、译本与印刷媒介',desc:'从犹太社群抄卷、佛教写本到金属活字与英语圣经译本。',themes:['T01','T03'],nodes:['T01-N100','T01-N101','T01-N103','T01-N104','T01-N105'],sections:[['文献有不同年代','写本形成、经文编纂、印本制作和后来保存地点并非一个时间点。'],['两地金属活字','《直指》和古腾堡《圣经》各有独立的史料与技术脉络；关系图中的并置只供比较。']]},
 {title:'宗教教育与跨教派对话',desc:'由开罗学术机构读到20世纪教会合作及宗教间关系文件。',themes:['T01','T06'],nodes:['T01-N102','T01-N106','T01-N31','T01-N107'],sections:[['机构与文本','学校、跨教会组织和大公会议声明有不同参与范围，不能归结成单一宗教改革。'],['辨别立场','当代宗教文件是相关机构的原始文本，阅读时要区分其主张与历史学者的解释。']]},
 {title:'从陆战规则到战俘与难民保护',desc:'按1868、1899、1929、1948、1951年的制度时间点对照不同保护对象。',themes:['T05','T06'],nodes:['T05-N07','T05-N58','T05-N59','T05-N60','T05-N08','T05-N61','T05-N10','T05-N62'],sections:[['适用对象不同','武器、作战方法、战俘、灭绝种族罪与难民各有不同的法律文本。'],['战后制度形成','时间线不代表条约被普遍遵守，条约通过、生效和具体执行应分别核查。']]},
 {title:'安理会、和平协议与自决',desc:'比较海湾危机的决议链、北爱尔兰协议及苏丹南北和平进程。',themes:['T05','T06'],nodes:['T05-N63','T05-N64','T05-N65','T05-N66','T05-N67'],sections:[['三种制度路径','安理会决议、区域和平协议和自决公投的主体与授权不同。'],['持续追踪执行','授权、签署或投票都是过程中的节点，后续安全与政治安排仍需单独记录。']]},

 {title:'改革、王权与宗教组织',desc:'并读英格兰立法、锡克经典和现代政府间宗教合作组织。',themes:['T01','T06'],nodes:['T01-N04','T01-N108','T01-N60','T01-N109','T01-N115'],sections:[['不同组织主体','议会、宗教古鲁与政府间组织的授权与代表范围不同。'],['文本的阶段','法律通过、经典初编和后来定型各有自己的日期与证据。']]},
 {title:'祆教与巴哈伊文献的保存',desc:'从馆藏祆教抄本到巴哈伊经典，区分原初文本和存世版本。',themes:['T01','T06'],nodes:['T01-N16','T01-N110','T01-N30','T01-N111'],sections:[['抄本与传统','1723年是特定抄本的题记时间，不能当成祆教起源。'],['宗教自述的边界','巴哈伊权威文本库记录其经典的成书与宗教意义，文献说明应标出来源立场。']]},
 {title:'跨宗教对话与信仰自由',desc:'对照1893年会议、1948年人权宣言、1965年教会宣言与1981年联合国文件。',themes:['T01','T06'],nodes:['T01-N112','T01-N113','T01-N106','T01-N107','T01-N114','T01-N116'],sections:[['参与范围不同','跨宗教会议、教会文件和联合国宣言的作者与受众不同。'],['宣言不是执行记录','文本可表明原则；各地实践及争议仍需独立史料。']]},
 {title:'跨地区战争与战后条款',desc:'七年战争及和约、约克镇、滑铁卢、克里米亚后勤和一战的停战与和约。',themes:['T05','T06'],nodes:['T05-N68','T05-N69','T05-N70','T05-N71','T05-N72','T05-N03','T05-N73','T05-N74'],sections:[['战争地理','欧洲、北美、南亚与黑海地区的战场规模和交战方不同。'],['战争终止的阶段','战役、投降、停战、和约签署与生效应分列，不以一个胜负节点替代战后安排。']]},
 {title:'东亚战争与安理会危机决议',desc:'对读1937年东亚战事、二战背景和1982年安理会对另一地区危机的反应。',themes:['T05','T06'],nodes:['T05-N75','T05-N08','T05-N04','T05-N76'],sections:[['不同历史情境','1937年中日战争与1982年南大西洋冲突没有直接传承关系，此处仅比较战争叙述与国际制度。'],['决议的性质','安理会文本说明当时要求，不等于对争议主权或战事结局作出完整评判。']]},

];

function setTheme(id,scroll=true){state.theme=id;state.subtopic='all';$('#subtopicFilter').value='all';if(id!=='T01'){state.tradition='all';$('#traditionFilter').value='all'}renderThemeFilters();renderTimeline();if(scroll)$('#explore').scrollIntoView({behavior:'smooth'});}

function renderThemes(){
 const colors=['#b96544','#7a8573','#a78050','#4f7775','#9f574d','#60788e','#b18052','#7c926d','#a56d6c','#6f7890'];
 $('#themeGrid').innerHTML=catalog.themes.map((t,i)=>`<button type="button" class="theme-card" style="--card-color:${colors[i]}" data-theme="${t.id}" aria-label="查看${esc(t.name)}主线"><small>主题 / ${esc(t.id)}</small><h3>${esc(t.name)}</h3><p>${esc(t.question)}</p><span class="card-foot">${catalog.nodes.filter(n=>n.theme===t.id).length} 个编目节点 <span aria-hidden="true">↗</span></span></button>`).join('');
 $('#themeGrid').addEventListener('click',e=>{const b=e.target.closest('[data-theme]');if(b)setTheme(b.dataset.theme)});
}

function renderThemeFilters(){
 $('#themeFilters').innerHTML=[{id:'all',name:'全部主线'},...catalog.themes].map(t=>`<button type="button" class="theme-chip" data-theme="${t.id}" aria-pressed="${state.theme===t.id}">${esc(t.name)}</button>`).join('');
}

function filteredNodes(){
 const q=state.query.trim().toLocaleLowerCase('zh-CN');
 return catalog.nodes.filter(n=>{
   if(state.theme!=='all' && ![n.theme,...n.related].includes(state.theme))return false;
   if(state.period!=='all' && periodOf(n)!==state.period)return false;
   if(state.region!=='all' && !n.region.includes(state.region))return false;
   if(state.tradition!=='all' && n.tradition!==state.tradition)return false;
   if(state.subtopic!=='all' && n.subtopic!==state.subtopic)return false;
   if(state.status!=='all' && n.status!==state.status)return false;
   if(q && ![n.title,n.region,n.when,n.summary,n.tradition,n.subtopic,...tagNames(n)].join(' ').toLocaleLowerCase('zh-CN').includes(q))return false;
   return true;
 }).sort((a,b)=>(a.year??Infinity)-(b.year??Infinity)||a.title.localeCompare(b.title,'zh-CN'));
}

function renderTimeline(){
 const list=filteredNodes();
 $('#resultCount').textContent=`${list.length} / ${catalog.nodes.length} 个节点`;
 $('#timelineList').innerHTML=list.length?list.map(n=>`<button type="button" class="timeline-item" data-id="${n.id}" aria-label="阅读${esc(n.title)}详情"><span class="date">${esc(n.when)}</span><span class="entry"><span class="entry-title">${esc(n.title)}<span class="status-pill ${n.status==='sourced'?'':'candidate'}">${statusLabel(n)}</span></span><span class="entry-meta">${esc(n.region)}<span class="bullet">·</span>${esc(themeById(n.theme)?.name)}<span class="bullet">·</span>${esc(n.kind)}</span></span><span class="entry-action" aria-hidden="true">↗</span></button>`).join(''):'<p class="empty-state">没有符合这些条件的节点。试着清除部分筛选条件。</p>';
}

function renderCompare(){
 const a=$('#compareA').value,b=$('#compareB').value;
 if(a===b){$('#compareResults').innerHTML='<p class="compare-help">请选择两条不同的主线。</p>';return}
 const matches=catalog.nodes.filter(n=>{const tags=[n.theme,...n.related];return tags.includes(a)&&tags.includes(b)}).sort((x,y)=>(x.year??Infinity)-(y.year??Infinity));
 $('#compareResults').innerHTML=matches.length?`<p class="compare-help">找到 ${matches.length} 个同时关联两条主线的节点：</p>`+matches.slice(0,6).map(n=>`<div class="compare-result"><button type="button" data-id="${n.id}">${esc(n.title)}</button><span>${esc(n.when)}</span></div>`).join('')+(matches.length>6?`<p class="compare-help">另有 ${matches.length-6} 个节点；可在时间检索中继续筛选。</p>`:''):'<p class="compare-help">这两条主线目前没有共同编目的节点。</p>';
}

function renderPaths(){
 $('#pathGrid').innerHTML=paths.map((p,i)=>`<article class="path-card"><span class="path-label">专题路径 / ${String(i+1).padStart(2,'0')}</span><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p><button type="button" data-path="${i}">阅读专题 <span aria-hidden="true">↗</span></button></article>`).join('');
}

function openPath(index){
 const p=paths[index];if(!p)return;
 $('#dialogContent').innerHTML=`<p class="detail-eyebrow">专题路径 / ${String(index+1).padStart(2,'0')}</p><h2 id="dialogTitle">${esc(p.title)}</h2><p class="detail-summary">${esc(p.desc)}</p>${p.sections.map(([heading,text])=>`<div class="detail-divider"></div><h3>${esc(heading)}</h3><p class="detail-summary">${esc(text)}</p>`).join('')}<div class="detail-divider"></div><h3>沿这些节点继续阅读</h3><div class="path-nodes">${p.nodes.map(id=>{const n=catalog.nodes.find(x=>x.id===id);return `<button type="button" data-id="${id}"><span>${esc(n?.title)}</span><small>${esc(n?.when)} · ${statusLabel(n)}</small></button>`}).join('')}</div><p class="detail-note">专题导读的具体事实以节点详情所列来源为准；标为待核的节点仍属研究候选。</p>`;
 const dialog=$('#detailDialog');if(!dialog.open)dialog.showModal();
}

function openDetail(id){
 const n=catalog.nodes.find(node=>node.id===id);if(!n)return;
 const source=n.sources.length?`<h3>资料来源</h3>${n.sources.map(s=>`<a class="detail-source" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a>`).join('')}<p class="detail-note">来源支持本页概述；更多细节仍需按陈述逐条编注。</p>`:'<h3>资料状态</h3><p class="detail-note">这是尚未完成逐条来源核对的编目候选。当前标题、年代与地区仅用于规划和检索，不作已核实的历史结论。</p>';
 const relations=(catalog.relations||[]).filter(r=>r.fromId===id||r.toId===id);
 const connected=relations.length?`<div class="detail-divider"></div><h3>有据可查的节点关系</h3><p class="detail-note">箭头表示本目录的阅读方向；每条关系单独附有说明与依据。</p><div class="relation-list">${relations.map(r=>{const other=catalog.nodes.find(x=>x.id===(r.fromId===id?r.toId:r.fromId));return `<div class="relation-item"><span class="relation-kind">${esc(r.kind)} · ${r.fromId===id?'指向后续节点':'来自前序节点'}</span><button type="button" data-id="${esc(other?.id)}">${esc(other?.title)}</button><p>${esc(r.note)}</p><a href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">查看关系依据 ↗</a></div>`}).join('')}</div>`:'';
 $('#dialogContent').innerHTML=`<p class="detail-eyebrow">${esc(n.id)} / ${esc(themeById(n.theme)?.name)} / ${esc(statusLabel(n))}</p><h2 id="dialogTitle">${esc(n.title)}</h2><div class="detail-bits"><span>${esc(n.when)}</span><span>${esc(n.region)}</span><span>${esc(n.kind)}</span>${n.tradition?`<span>${esc(n.tradition)}</span>`:''}${n.subtopic?`<span>${esc(n.subtopic)}</span>`:''}</div><p class="detail-summary">${esc(n.summary)}</p><div class="detail-divider"></div>${source}${connected}<div class="detail-divider"></div><h3>关联主线</h3><div class="detail-related">${[n.theme,...n.related].map(id=>`<button type="button" data-theme="${id}">${esc(themeById(id)?.name)}</button>`).join('')}</div>`;
 const dialog=$('#detailDialog');if(!dialog.open)dialog.showModal();
}

function fillSelects(){
 const regions=['西亚','南亚','东亚','东南亚','中亚','东非','北非','西非','中非','非洲南部','非洲','欧洲','北美洲','南美洲','中美洲','加勒比','美洲','大洋洲','欧亚','地中海','跨地区','全球'];
 $('#regionFilter').insertAdjacentHTML('beforeend',regions.map(r=>`<option value="${r}">${r}</option>`).join(''));
 const traditions=[...new Set(catalog.nodes.map(n=>n.tradition).filter(Boolean))];
 $('#traditionFilter').insertAdjacentHTML('beforeend',traditions.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join(''));
 const subtopics=[...new Set(catalog.nodes.map(n=>n.subtopic).filter(Boolean))];
 $('#subtopicFilter').insertAdjacentHTML('beforeend',subtopics.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join(''));
 for(const select of [$('#compareA'),$('#compareB')])select.innerHTML=catalog.themes.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');
 $('#compareA').value='T02';$('#compareB').value='T04';
}

function bind(){
 $('#navSearch').addEventListener('click',()=>{$('#explore').scrollIntoView({behavior:'smooth'});$('#searchInput').focus({preventScroll:true})});
 $('#themeFilters').addEventListener('click',e=>{const b=e.target.closest('[data-theme]');if(b)setTheme(b.dataset.theme,false)});
 $('#timelineList').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b)openDetail(b.dataset.id)});
 $('#compareResults').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b)openDetail(b.dataset.id)});
 $('#pathGrid').addEventListener('click',e=>{const b=e.target.closest('[data-path]');if(b)openPath(Number(b.dataset.path))});
 $('#dialogContent').addEventListener('click',e=>{const item=e.target.closest('[data-id]');if(item){openDetail(item.dataset.id);return}const b=e.target.closest('[data-theme]');if(b){$('#detailDialog').close();setTheme(b.dataset.theme)}});
 $('#closeDialog').addEventListener('click',()=>$('#detailDialog').close());
 $('#detailDialog').addEventListener('click',e=>{if(e.target===$('#detailDialog'))$('#detailDialog').close()});
 $('#searchInput').addEventListener('input',e=>{state.query=e.target.value;renderTimeline()});
 for(const [id,key] of [['periodFilter','period'],['regionFilter','region'],['traditionFilter','tradition'],['subtopicFilter','subtopic'],['statusFilter','status']])$("#"+id).addEventListener('change',e=>{state[key]=e.target.value;renderTimeline()});
 $('#clearFilters').addEventListener('click',()=>{Object.assign(state,{theme:'all',period:'all',region:'all',tradition:'all',subtopic:'all',status:'all',query:''});$('#searchInput').value='';for(const id of ['periodFilter','regionFilter','traditionFilter','subtopicFilter','statusFilter'])$('#'+id).value='all';renderThemeFilters();renderTimeline()});
 $('#compareA').addEventListener('change',renderCompare);$('#compareB').addEventListener('change',renderCompare);
}

async function start(){
 try{
   const response=await fetch('catalog.json?v=20261124-r6');if(!response.ok)throw new Error('目录加载失败');
   catalog=await response.json();
   $('#themeTotal').textContent=catalog.themes.length;$('#nodeTotal').textContent=catalog.nodes.length;$('#sourcedTotal').textContent=catalog.nodes.filter(n=>n.status==='sourced').length;
   renderThemes();fillSelects();renderPaths();bind();renderThemeFilters();renderTimeline();renderCompare();
 }catch(error){$('#themeGrid').innerHTML='<p class="loading">目录暂时无法加载，请刷新页面重试。</p>';$('#timelineList').innerHTML='<p class="loading">目录暂时无法加载。</p>';console.error(error)}
}
start();
