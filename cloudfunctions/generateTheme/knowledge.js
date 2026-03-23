const sceneProfiles = [
  {
    id: 'historic-alley',
    keywords: ['老街', '老城区', '里弄', '巷子', '胡同', '旧城', '街区', '居民区'],
    labels: ['历史感', '生活感', '细节密度高'],
    missionHints: ['砖墙纹理', '旧招牌颜色', '门窗形状', '人声与车铃', '晾晒与日常痕迹'],
    categories: ['纹理', '色彩', '形状', '声音'],
  },
  {
    id: 'commercial-district',
    keywords: ['商圈', '广场', '写字楼', '商业区', '商场', '办公区', '中心'],
    labels: ['现代感', '节奏快', '光影对比强'],
    missionHints: ['玻璃反光', '霓虹色块', '重复立面', '脚步与提示音', '品牌标识'],
    categories: ['色彩', '形状', '声音'],
  },
  {
    id: 'park-waterfront',
    keywords: ['公园', '绿地', '湖边', '江边', '河边', '滨水', '步道', '植物园'],
    labels: ['自然感', '空气流动', '层次柔和'],
    missionHints: ['叶片纹理', '水面反光', '风声', '鸟鸣', '自然色阶'],
    categories: ['纹理', '声音', '色彩'],
  },
  {
    id: 'campus-community',
    keywords: ['校园', '大学', '学校', '社区', '住宅', '家属区', '生活区'],
    labels: ['日常感', '青春感', '可停留'],
    missionHints: ['公告栏颜色', '楼梯转角', '操场线条', '交谈与铃声', '树荫图案'],
    categories: ['色彩', '形状', '声音', '纹理'],
  },
  {
    id: 'market-transport',
    keywords: ['菜场', '集市', '车站', '公交站', '地铁站', '码头', '交通枢纽'],
    labels: ['流动感', '信息密集', '声音丰富'],
    missionHints: ['方向箭头', '包装色彩', '报站声', '轮子与轨迹', '匆忙的纹理'],
    categories: ['声音', '色彩', '形状'],
  },
];

const missionTemplates = [
  {
    id: 'color-pop',
    category: '色彩',
    modes: ['pure', 'advanced'],
    cues: ['高饱和色块', '撞色边角', '被忽视的暖色', '安静的冷色'],
    templates: [
      '找到一处最能代表这片区域气质的色彩。',
      '拍下一个和周围环境形成反差的颜色角落。',
      '寻找一组自然出现的渐变色，并记录它的来源。',
    ],
  },
  {
    id: 'texture-trace',
    category: '纹理',
    modes: ['pure', 'advanced'],
    cues: ['粗糙表面', '重复纹样', '时间痕迹', '风化细节'],
    templates: [
      '找到一种会让你想伸手触摸的纹理。',
      '拍下最能表现岁月痕迹的一处表面。',
      '寻找一组重复出现的纹理，并比较它们的差异。',
    ],
  },
  {
    id: 'shape-rhythm',
    category: '形状',
    modes: ['pure', 'advanced'],
    cues: ['弧线', '转角', '重复几何', '方向线条'],
    templates: [
      '寻找一个打破周围秩序的形状。',
      '拍下一处有节奏感的重复线条。',
      '找到一处让空间变得柔软的弧线。',
    ],
  },
  {
    id: 'sound-pocket',
    category: '声音',
    modes: ['pure', 'advanced'],
    cues: ['风声', '摩擦声', '脚步声', '远近层次'],
    templates: [
      '找到一个能听见细碎声音的地方。',
      '记录一段来自远处却影响你步伐的声音。',
      '寻找一种有节奏的环境声，并写下它像什么。',
    ],
  },
  {
    id: 'daily-story',
    category: '城市',
    modes: ['pure', 'advanced'],
    cues: ['生活痕迹', '停留感', '小店与摊位', '街头秩序'],
    templates: [
      '找到一个最有日常温度的角落。',
      '拍下一个让你觉得这座城市很具体的瞬间。',
      '观察一处不起眼的设施，并猜测它服务了谁。',
    ],
  },
];

const preferenceBias = {
  '人文历史': ['historic-alley', 'campus-community'],
  '自然景观': ['park-waterfront'],
  '市井生活': ['market-transport', 'historic-alley', 'campus-community'],
};

module.exports = {
  sceneProfiles,
  missionTemplates,
  preferenceBias,
};
