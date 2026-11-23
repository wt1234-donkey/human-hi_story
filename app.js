const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const state = {theme:'all',period:'all',region:'all',status:'all',query:''};
let catalog = {themes:[],nodes:[]};
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
];

function setTheme(id,scroll=true){state.theme=id;renderThemeFilters();renderTimeline();if(scroll)$('#explore').scrollIntoView({behavior:'smooth'});}

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
   if(state.status!=='all' && n.status!==state.status)return false;
   if(q && ![n.title,n.region,n.when,n.summary,...tagNames(n)].join(' ').toLocaleLowerCase('zh-CN').includes(q))return false;
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
 $('#dialogContent').innerHTML=`<p class="detail-eyebrow">${esc(n.id)} / ${esc(themeById(n.theme)?.name)} / ${esc(statusLabel(n))}</p><h2 id="dialogTitle">${esc(n.title)}</h2><div class="detail-bits"><span>${esc(n.when)}</span><span>${esc(n.region)}</span><span>${esc(n.kind)}</span></div><p class="detail-summary">${esc(n.summary)}</p><div class="detail-divider"></div>${source}<div class="detail-divider"></div><h3>关联主线</h3><div class="detail-related">${[n.theme,...n.related].map(id=>`<button type="button" data-theme="${id}">${esc(themeById(id)?.name)}</button>`).join('')}</div>`;
 const dialog=$('#detailDialog');if(!dialog.open)dialog.showModal();
}

function fillSelects(){
 const regions=['西亚','南亚','东亚','东非','欧洲','非洲','美洲','中美洲','加勒比','欧亚','跨地区','全球'];
 $('#regionFilter').insertAdjacentHTML('beforeend',regions.map(r=>`<option value="${r}">${r}</option>`).join(''));
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
 for(const [id,key] of [['periodFilter','period'],['regionFilter','region'],['statusFilter','status']])$("#"+id).addEventListener('change',e=>{state[key]=e.target.value;renderTimeline()});
 $('#clearFilters').addEventListener('click',()=>{Object.assign(state,{theme:'all',period:'all',region:'all',status:'all',query:''});$('#searchInput').value='';for(const id of ['periodFilter','regionFilter','statusFilter'])$('#'+id).value='all';renderThemeFilters();renderTimeline()});
 $('#compareA').addEventListener('change',renderCompare);$('#compareB').addEventListener('change',renderCompare);
}

async function start(){
 try{
   const response=await fetch('catalog.json');if(!response.ok)throw new Error('目录加载失败');
   catalog=await response.json();
   $('#themeTotal').textContent=catalog.themes.length;$('#nodeTotal').textContent=catalog.nodes.length;$('#sourcedTotal').textContent=catalog.nodes.filter(n=>n.status==='sourced').length;
   renderThemes();fillSelects();renderPaths();bind();renderThemeFilters();renderTimeline();renderCompare();
 }catch(error){$('#themeGrid').innerHTML='<p class="loading">目录暂时无法加载，请刷新页面重试。</p>';$('#timelineList').innerHTML='<p class="loading">目录暂时无法加载。</p>';console.error(error)}
}
start();
