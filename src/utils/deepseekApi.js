import { SYSTEM_PROMPT, PROMPT_TEMPLATES, REVIEW_PROMPT } from './prompts'

const API_URL = 'https://api.deepseek.com/v1/chat/completions'

export const STORAGE_KEY = 'deepseek_api_key'

export function getStoredApiKey() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function setStoredApiKey(key) {
  try {
    if (key) {
      sessionStorage.setItem(STORAGE_KEY, key)
    } else {
      sessionStorage.removeItem(STORAGE_KEY)
    }
    return true
  } catch {
    return false
  }
}

export function clearStoredApiKey() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

export class ApiAuthError extends Error {
  constructor(message) {
    super(message || 'API Key 无效或已过期')
    this.name = 'ApiAuthError'
  }
}

function detectLanguage(text) {
  const sample = text.slice(0, 500)
  const chineseChars = sample.match(/[\u4e00-\u9fa5]/g) || []
  const ratio = chineseChars.length / sample.length
  return ratio > 0.15 ? 'zh' : 'en'
}

function buildModePrompts(mode) {
  const coreModules = [
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

  if (mode === 'quick') {
    return [
      { id: 'problem', prompt: PROMPT_TEMPLATES.problem },
      { id: 'keyFindings', prompt: PROMPT_TEMPLATES.keyFindings },
    ]
  }

  const list = coreModules.map((id) => ({ id, prompt: PROMPT_TEMPLATES[id] }))

  if (mode === 'review') {
    list.push({ id: 'reviewScore', prompt: REVIEW_PROMPT })
  }

  return list
}

function chunkTextBySection(text) {
  const patterns = [
    /\b(abstract|introduction|related\s*work|background|method|methodology|approach|model|architecture|experiment|experiments|results|discussion|conclusion|appendix|references)\b/gi,
    /^(1\.|2\.|3\.|4\.|5\.|6\.|7\.|8\.)/gm,
  ]

  let sectionMap = {
    intro: '',
    method: '',
    experiment: '',
    conclusion: '',
    other: '',
  }

  const lower = text.toLowerCase()
  const lowerLines = lower.split('\n')
  const lines = text.split('\n')

  let currentSection = 'other'

  for (let i = 0; i < lines.length; i++) {
    const line = lowerLines[i].trim()

    if (/^(abstract|introduction|1\.)/.test(line) || /^\s*(1\.\s*intro|intro\s*[:：])/i.test(line)) {
      currentSection = 'intro'
    } else if (/^(related\s*work|background|2\.)/.test(line) || /^\s*(2\.)/.test(line)) {
      currentSection = 'intro'
    } else if (/^(method|methodology|approach|model|architecture|3\.)/.test(line)) {
      currentSection = 'method'
    } else if (/^(experiment|experiments|results|implementation|4\.)/.test(line)) {
      currentSection = 'experiment'
    } else if (/^(conclusion|discussion|5\.)/.test(line)) {
      currentSection = 'conclusion'
    } else if (/^(references|appendix|acknowledg)/.test(line)) {
      currentSection = 'other'
    }

    sectionMap[currentSection] += lines[i] + '\n'
  }

  const totalLen = Object.values(sectionMap).reduce((a, b) => a + b.length, 0)
  if (totalLen < 2000) return null
  return sectionMap
}

function splitByTokens(text, chunkSize = 8000, overlap = 800) {
  const tokens = Math.ceil(text.length / 4)
  if (tokens <= chunkSize) return [text]

  const chunks = []
  const charChunkSize = chunkSize * 4
  const charOverlap = overlap * 4

  for (let start = 0; start < text.length; start += charChunkSize - charOverlap) {
    const end = Math.min(start + charChunkSize, text.length)
    chunks.push(text.slice(start, end))
    if (end === text.length) break
  }

  return chunks
}

async function callDeepSeek(systemPrompt, userPrompt, temperature = 0.6) {
  const apiKey = getStoredApiKey()
  if (!apiKey) {
    throw new ApiAuthError('请先填写 API Key')
  }

  let response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: 4000,
      }),
    })
  } catch (err) {
    if (err.name === 'AbortError' || err.message?.includes('timeout')) {
      throw new Error('请求超时，请重试')
    }
    if (err.message?.includes('Failed to fetch')) {
      throw new Error('网络连接失败，请检查网络')
    }
    throw err
  }

  if (response.status === 401 || response.status === 403) {
    clearStoredApiKey()
    throw new ApiAuthError('API Key 无效或已过期，请重新填写')
  }

  if (response.status === 429) {
    throw new Error('请求过于频繁，请稍后再试')
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API 调用失败 (${response.status})`)
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content || ''
  return content
}

function cleanModuleContent(raw, moduleId) {
  if (!raw) return ''
  let cleaned = raw
  // remove any leftover ===MODULE:xxx=== markers
  cleaned = cleaned.replace(/===MODULE:[a-zA-Z0-9]+===/gi, '')
  // remove trailing backticks at edges if they are wrap artifacts
  cleaned = cleaned.trim()
  return cleaned
}

function buildMasterPrompt(modulePrompts, paperContent, language) {
  const langNote =
    language === 'zh'
      ? '重要：你必须用中文输出，不要输出英文。'
      : 'Important: You must output in English. Do not output Chinese.'

  let combined =
    `===SYSTEM===
${SYSTEM_PROMPT}

${langNote}

Below are the module-specific instructions.

===INSTRUCTIONS FOR EACH MODULE===

${modulePrompts
  .map(
    (m, idx) =>
      `---START MODULE ${idx + 1}: ${m.id}---
${m.prompt}
---END MODULE ${idx + 1}---
`,
  )
  .join('\n\n')}

===OUTPUT FORMAT===
Your output MUST strictly follow this format for EACH module:
===MODULE:module_id===
[module content in Markdown, properly formatted with ## headings, lists, etc.]

Repeat the pattern for every module requested. Do NOT wrap everything in JSON. Do NOT add a master intro or a master conclusion. Just the modules separated by markers.

===PAPER CONTENT (${paperContent.length.toLocaleString()} chars)===
${paperContent}
`

  return combined
}

function parseMasterOutput(output) {
  const result = {}
  const regex = /===MODULE:\s*([a-zA-Z0-9_]+)\s*===/gi
  const matches = [...output.matchAll(regex)]

  if (matches.length === 0) {
    // fallback: treat all output as keyFindings/professor
    result.professor = output.trim()
    return result
  }

  for (let i = 0; i < matches.length; i++) {
    const id = matches[i][1]
    const start = matches[i].index + matches[i][0].length
    const end = i + 1 < matches.length ? matches[i + 1].index : output.length
    result[id] = cleanModuleContent(output.slice(start, end), id)
  }

  return result
}

/**
 * Main analysis entry point. Takes paper text and analysis mode.
 * Calls onProgress({ moduleId, status, content }) as modules complete.
 * Returns a final object of { moduleId: markdownString }.
 */
export async function analyzePaper(text, mode = 'deep', onProgress = () => {}) {
  const language = detectLanguage(text)
  const modulePrompts = buildModePrompts(mode)
  const totalModules = modulePrompts.length
  const totalChars = text.length

  onProgress({ moduleId: '__status__', content: `Detected ${language.toUpperCase()} paper (${totalChars.toLocaleString()} chars). Building analysis plan...` })

  // Short papers: single call
  if (totalChars < 25000) {
    onProgress({ moduleId: '__status__', content: 'Sending paper to AI for full analysis...' })

    const masterPrompt = buildMasterPrompt(modulePrompts, text, language)
    const output = await callDeepSeek(SYSTEM_PROMPT, masterPrompt, 0.6)

    const parsed = parseMasterOutput(output)

    for (let i = 0; i < modulePrompts.length; i++) {
      const m = modulePrompts[i]
      if (parsed[m.id]) {
        onProgress({ moduleId: m.id, content: parsed[m.id], index: i, total: totalModules })
      } else {
        onProgress({
          moduleId: m.id,
          content: `*(Module content was not returned separately — see other modules' content.)*`,
          index: i,
          total: totalModules,
        })
      }
    }

    return parsed
  }

  // Long papers: chunk-by-section strategy
  onProgress({ moduleId: '__status__', content: 'Long paper detected. Switching to multi-pass analysis...' })

  const sections = chunkTextBySection(text) || {}
  const introPart = (sections.intro || '').slice(0, 10000)
  const conclusionPart = (sections.conclusion || '').slice(0, 8000)
  const methodPart = (sections.method || '').slice(0, 12000)
  const experimentPart = (sections.experiment || '').slice(0, 12000)

  // Round 1: skeleton + first modules
  const skeletonPrompt = `You are reading a long research paper. I will send it in parts.

Please read the Introduction and Conclusion below, and output:
(1) a brief 3-5 sentence description of the paper's problem and contribution
(2) the main structure of the paper, in bullet points
(3) the paper's title if you can infer it

Keep it concise — this will be used as context for subsequent detailed analysis.

${language === 'zh' ? '用中文输出。' : 'Output in English.'}

---INTRODUCTION---
${introPart}

---CONCLUSION---
${conclusionPart}
`
  const skeleton = await callDeepSeek(SYSTEM_PROMPT, skeletonPrompt, 0.5)
  const resultBag = {
    _skeleton: skeleton,
  }
  onProgress({ moduleId: '__status__', content: 'Skeleton built. Now analyzing method section...' })

  // Round 2: method-heavy modules
  const methodPrompt = `CONTEXT (paper skeleton — do NOT copy this into your answer):
${skeleton}

---METHOD SECTION OF THE PAPER---
${methodPart}

Based on the method section AND the skeleton above, now produce ONLY the following modules from the paper analysis plan:
===MODULE:coreIdea===
${PROMPT_TEMPLATES.coreIdea}

===MODULE:method===
${PROMPT_TEMPLATES.method}

===MODULE:innovation===
${PROMPT_TEMPLATES.innovation}

===MODULE:knowledgeGraph===
${PROMPT_TEMPLATES.knowledgeGraph}

Output format: use the ===MODULE:xxx=== separators as instructed earlier.
${language === 'zh' ? '用中文输出。' : 'Output in English.'}`

  const methodOutput = await callDeepSeek(SYSTEM_PROMPT, methodPrompt, 0.6)
  const methodParsed = parseMasterOutput(methodOutput)
  Object.assign(resultBag, methodParsed)

  for (const id of ['coreIdea', 'method', 'innovation', 'knowledgeGraph']) {
    if (methodParsed[id]) {
      const idx = modulePrompts.findIndex((m) => m.id === id)
      if (idx >= 0) onProgress({ moduleId: id, content: methodParsed[id], index: idx, total: totalModules })
    }
  }

  onProgress({ moduleId: '__status__', content: 'Analyzing experiment section...' })

  // Round 3: experiments-heavy modules
  const experimentPrompt = `CONTEXT (paper skeleton — do NOT copy this into your answer):
${skeleton}

---EXPERIMENT & RESULTS SECTION OF THE PAPER---
${experimentPart}

Based on the experiment section AND the skeleton above, now produce ONLY the following modules from the paper analysis plan:
===MODULE:problem===
${PROMPT_TEMPLATES.problem}

===MODULE:limitations===
${PROMPT_TEMPLATES.limitations}

===MODULE:keyFindings===
${PROMPT_TEMPLATES.keyFindings}

Output format: use the ===MODULE:xxx=== separators as instructed earlier.
${language === 'zh' ? '用中文输出。' : 'Output in English.'}`

  const expOutput = await callDeepSeek(SYSTEM_PROMPT, experimentPrompt, 0.6)
  const expParsed = parseMasterOutput(expOutput)
  Object.assign(resultBag, expParsed)

  for (const id of ['problem', 'limitations', 'keyFindings']) {
    if (expParsed[id]) {
      const idx = modulePrompts.findIndex((m) => m.id === id)
      if (idx >= 0) onProgress({ moduleId: id, content: expParsed[id], index: idx, total: totalModules })
    }
  }

  onProgress({ moduleId: '__status__', content: 'Synthesizing background, learning path, interview, and professor lecture...' })

  // Round 4: synthesis-heavy modules
  const synthesisPrompt = `CONTEXT (paper skeleton — do NOT copy this into your answer):
${skeleton}

---SUMMARY OF PAPER CONTENT (not full text, but what we have already learned from prior passes)---
${Object.entries(resultBag)
  .filter(([k]) => !k.startsWith('_'))
  .map(([k, v]) => `[${k}] ${(v || '').slice(0, 600)}`)
  .join('\n\n')}

Based on the full understanding above, produce these final modules. REMEMBER — output language MUST match the paper's language (${
    language === 'zh' ? 'Chinese' : 'English'
  }).

===MODULE:background===
${PROMPT_TEMPLATES.background}

===MODULE:learningPath===
${PROMPT_TEMPLATES.learningPath}

===MODULE:interview===
${PROMPT_TEMPLATES.interview}

===MODULE:professor===
${PROMPT_TEMPLATES.professor}

Output format: use the ===MODULE:xxx=== separators.
${language === 'zh' ? '用中文输出。' : 'Output in English.'}`

  const synthOutput = await callDeepSeek(SYSTEM_PROMPT, synthesisPrompt, 0.7)
  const synthParsed = parseMasterOutput(synthOutput)
  Object.assign(resultBag, synthParsed)

  for (const id of ['background', 'learningPath', 'interview', 'professor']) {
    if (synthParsed[id]) {
      const idx = modulePrompts.findIndex((m) => m.id === id)
      if (idx >= 0) onProgress({ moduleId: id, content: synthParsed[id], index: idx, total: totalModules })
    }
  }

  // Optional review score
  if (mode === 'review') {
    onProgress({ moduleId: '__status__', content: 'Generating peer-review score card...' })
    const reviewPrompt = `CONTEXT (paper skeleton + prior analysis for review reference):
${skeleton}

---Prior analysis summary---
${Object.entries(resultBag)
  .filter(([k]) => !k.startsWith('_'))
  .map(([k, v]) => `[${k}] ${(v || '').slice(0, 400)}`)
  .join('\n\n')}

${REVIEW_PROMPT}

Output language: ${language === 'zh' ? 'Chinese' : 'English'}.`

    const reviewOutput = await callDeepSeek(SYSTEM_PROMPT, reviewPrompt, 0.6)
    resultBag.reviewScore = reviewOutput.trim()
    const idx = modulePrompts.findIndex((m) => m.id === 'reviewScore')
    if (idx >= 0) onProgress({ moduleId: 'reviewScore', content: reviewOutput.trim(), index: idx, total: totalModules })
  }

  onProgress({ moduleId: '__status__', content: `All ${totalModules} modules complete.` })
  return resultBag
}
