const PRESET_THEMES = [
  {
    title: '形状漫步：意外的弧线',
    description: '沿着街道寻找不属于直线城市的柔软边缘。',
    category: '视觉',
    missions: ['寻找一个带弧度的招牌', '拍下一处圆角细节', '记下最让你驻足的形状'],
    vibeColor: '#6b7c59',
  },
  {
    title: '声音漫步：近处与远处',
    description: '用耳朵划分空间，找到今天城市最轻的一层声音。',
    category: '感官',
    missions: ['找到一处连续的环境声', '记录一种突然出现的声音', '写下你听到的节奏'],
    vibeColor: '#52708a',
  },
  {
    title: '市井漫步：慢生活切片',
    description: '从日常细节里找出这片街区最真实的温度。',
    category: '城市',
    missions: ['拍一处摊位或小店角落', '记录一句街头观察', '找到最有生活感的瞬间'],
    vibeColor: '#9b6b4f',
  },
];

const RANDOM_THEME_CATEGORIES = ['形状漫步', '色彩漫步', '声音漫步', '纹理漫步', '市井漫步', '自然漫步'];

const COMBINE_THEME_OPTIONS = ['形状', '颜色', '声音', '纹理', '动物', '气味', '城市'];

const MOODS = ['好奇', '平静', '活力', '怀旧'];
const WEATHERS = ['晴朗', '多云', '雨天', '大风'];
const SEASONS = ['春季', '夏季', '秋季', '冬季'];
const PREFERENCES = ['人文历史', '自然景观', '市井生活'];

module.exports = {
  PRESET_THEMES,
  RANDOM_THEME_CATEGORIES,
  COMBINE_THEME_OPTIONS,
  MOODS,
  WEATHERS,
  SEASONS,
  PREFERENCES,
};
