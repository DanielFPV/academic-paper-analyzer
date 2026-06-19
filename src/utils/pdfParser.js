import * as pdfjsLib from 'pdfjs-dist'

// 设置 worker 源
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

/**
 * 解析 PDF 文件并提取文本内容
 * @param {File} file - PDF 文件
 * @returns {Promise<string>} - 提取的文本内容
 */
export async function parsePdf(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result)
        
        // 使用更稳定的配置加载 PDF
        const loadingTask = pdfjsLib.getDocument({
          data: typedArray,
          useWorkerFetch: false,
          isEvalSupported: false,
          useSystemFonts: true
        })
        
        const pdf = await loadingTask.promise
        const numPages = pdf.numPages
        let fullText = ''

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map(item => item.str)
            .join(' ')
          fullText += pageText + '\n\n'
        }

        if (fullText.trim().length === 0) {
          reject(new Error('无法从 PDF 中提取文本内容'))
        } else {
          resolve(fullText.trim())
        }
      } catch (error) {
        console.error('PDF 解析错误:', error)
        reject(new Error('读取 PDF 失败，请确保文件格式正确'))
      }
    }

    reader.onerror = () => {
      reject(new Error('读取 PDF 失败，请确保文件格式正确'))
    }

    reader.readAsArrayBuffer(file)
  })
}
