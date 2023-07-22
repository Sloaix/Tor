import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

/**
 * 分块读取文件内容
 * @param files 文件路径列表
 * @param chunkSize 每块的大小
 * @param handleChunk 处理每个分块的回调函数
 */
function readFileChunk(files: string[], chunkSize: number, handleChunk: (chunk: Buffer) => void) {
  let chunkBuffer: Buffer = Buffer.alloc(0) // 存储读取到的内容,最大为 chunkSize的两倍,防止读取到的内容不够一个块的大小
  const buf = Buffer.alloc(chunkSize) // 分配 chunkSize 大小的缓冲区

  for (const file of files) {
    // 打印文件路径
    console.log(`readFileChunk ${file}`)
    // 打开文件
    const fd = fs.openSync(file, 'r')
    // 一直读取文件,直到读取到文件末尾
    while (true) {
      // 从偏移量开始读取 chunkSize 个字节
      const bytesRead = fs.readSync(fd, buf, 0, chunkSize, null)

      // 如果读取到的字节为 0,说明已经读取到文件末尾,继续读取下一个文件
      if (bytesRead === 0) {
        break
      }

      // 将本次读取的内容追加到 chunkBuffer 中
      chunkBuffer = Buffer.concat([chunkBuffer, buf.subarray(0, bytesRead)], chunkBuffer.length + bytesRead)

      // 如果总字节超过或者 chunkSize,回调 buffers 中的前 chunkSize 字节
      if (chunkBuffer.length >= chunkSize) {
        const chunk = chunkBuffer.subarray(0, chunkSize)
        handleChunk(chunk)
        // buffer 重新赋值为剩余的内容
        chunkBuffer = chunkBuffer.subarray(chunkSize, chunkBuffer.length)
      }
    }
  }

  // 如果 chunkBuffer 中还有剩余的内容,回调剩余的内容
  if (chunkBuffer.length > 0) {
    handleChunk(chunkBuffer)
  }
}

/**
 * 按照指定的块大小分割文件,计算每块的SHA1值(20字节),将所有块的SHA1值拼接成一个字符串
 * Divide the file according to the specified block size, calculate the SHA1 value (20 bytes) for each block, and concatenate the SHA1 values of all blocks into a string
 */
export function sha1sum(files: string[], pieceSize: number, alignPiece: boolean = false): Buffer {
  if (pieceSize === 0) {
    throw new Error('pieceSize must be greater than 0')
  }

  let sha1Buffer = Buffer.alloc(0)
  const pieceCount = Math.ceil(fileSizeSum(files) / pieceSize)
  console.log(`分块大小: ${pieceSize},分块数量: ${pieceCount},文件总数: ${files.length},文件是否对齐: ${alignPiece}`)

  readFileChunk(files, pieceSize, (chunk) => {
    const sha1 = crypto.createHash('sha1').update(chunk).digest()
    sha1Buffer = Buffer.concat([sha1Buffer, sha1])
  })

  return sha1Buffer
}

/**
 * 计算所有文件的大小
 * @param files
 * @returns
 */
export function fileSizeSum(files: string[]): number {
  let size = 0
  for (const file of files) {
    size += fs.statSync(file).size
  }
  return size
}

/**
 * 根据文件的总大小选择合适的分块大小
 * Choose the appropriate piece size according to the total size of the file
 *
 * @param fileSize 文件的大小
 * @return 分块大小
 */
export function calcPieceSize(fileSize: number): number {
  const PIECE_SIZES = [
    16 * 1024, // 16kb
    32 * 1024, // 32kb
    64 * 1024, // 64kb
    128 * 1024, // 128kb
    256 * 1024, // 256kb
    512 * 1024, // 512kb
    1024 * 1024, // 1mb
    2 * 1024 * 1024, // 2mb
    4 * 1024 * 1024, // 4mb
    8 * 1024 * 1024, // 8mb
    16 * 1024 * 1024 // 16mb
  ].sort((a, b) => a - b)

  // 初始化为最大的分块大小
  let pieceSize = PIECE_SIZES[PIECE_SIZES.length - 1]

  // 根据文件的大小选择合适的分块大小,使用Bittorrent分块大小规则
  for (const item of PIECE_SIZES) {
    if (fileSize < item) {
      pieceSize = item
      break
    }
  }

  return pieceSize
}

/**
 * 递归遍历目录下的所有文件
 * @param dir
 * @returns 文件的绝对路径和相对dir的路径
 */
export function walkDir(dir: string): string[] {
  const files: string[] = []
  const dirEntries = fs.readdirSync(dir, { withFileTypes: true })
  for (const dirEntry of dirEntries) {
    const absPath = path.join(dir, dirEntry.name)
    if (dirEntry.isDirectory()) {
      files.push(...walkDir(absPath))
    } else {
      files.push(absPath)
    }
  }
  return files
}
