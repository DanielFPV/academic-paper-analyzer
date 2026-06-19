export const MODULES = {
  problem: {
    id: 'problem',
    title: 'What Problem Does This Paper Solve?',
    icon: 'target',
    fullWidth: false,
    delay: 0,
  },
  background: {
    id: 'background',
    title: 'Background Knowledge',
    icon: 'book',
    fullWidth: false,
    delay: 100,
  },
  coreIdea: {
    id: 'coreIdea',
    title: 'Core Idea',
    icon: 'lightbulb',
    fullWidth: false,
    delay: 200,
  },
  method: {
    id: 'method',
    title: 'Method Analysis',
    icon: 'flask',
    fullWidth: false,
    delay: 300,
  },
  innovation: {
    id: 'innovation',
    title: 'Innovation Analysis',
    icon: 'spark',
    fullWidth: false,
    delay: 400,
  },
  limitations: {
    id: 'limitations',
    title: 'Limitations & Critical Review',
    icon: 'scale',
    fullWidth: false,
    delay: 500,
  },
  learningPath: {
    id: 'learningPath',
    title: 'Learning Path',
    icon: 'path',
    fullWidth: false,
    delay: 600,
  },
  interview: {
    id: 'interview',
    title: 'Interview Questions',
    icon: 'chat',
    fullWidth: false,
    delay: 700,
  },
  keyFindings: {
    id: 'keyFindings',
    title: 'Key Findings',
    icon: 'trophy',
    fullWidth: true,
    delay: 800,
  },
  professor: {
    id: 'professor',
    title: 'Professor Explanation',
    icon: 'gradCap',
    fullWidth: true,
    delay: 900,
  },
  knowledgeGraph: {
    id: 'knowledgeGraph',
    title: 'Knowledge Graph',
    icon: 'graph',
    fullWidth: true,
    delay: 1000,
  },
}

export const MODULE_ORDER = [
  'problem',
  'background',
  'coreIdea',
  'method',
  'innovation',
  'limitations',
  'learningPath',
  'interview',
  'keyFindings',
  'professor',
  'knowledgeGraph',
]

export const MODES = {
  quick: {
    id: 'quick',
    label: 'Quick Summary',
    description: 'Fast overview (~500 words)',
    modules: ['problem', 'keyFindings'],
  },
  deep: {
    id: 'deep',
    label: 'Deep Learning',
    description: 'Full 11-module analysis',
    modules: MODULE_ORDER,
  },
  review: {
    id: 'review',
    label: 'Research Review',
    description: 'Deep + peer review scoring',
    modules: [...MODULE_ORDER, 'reviewScore'],
  },
}

export const REVIEW_SCORE_DIMENSIONS = [
  { key: 'innovation', label: 'Innovation', emoji: '💡' },
  { key: 'rigor', label: 'Academic Rigor', emoji: '🔬' },
  { key: 'experiment', label: 'Experiment Design', emoji: '📊' },
  { key: 'writing', label: 'Writing Quality', emoji: '✍️' },
  { key: 'potential', label: 'Publication Potential', emoji: '🎯' },
]

export function emptyAnalysis() {
  return MODULE_ORDER.reduce((acc, key) => {
    acc[key] = null
    return acc
  }, {})
}

export function getModuleMeta(id) {
  return MODULES[id] || { title: id, fullWidth: false, icon: 'doc', delay: 0 }
}
