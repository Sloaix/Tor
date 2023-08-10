import { app, dialog, ipcMain } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { Bdecoder, Bencoder } from 'sloaix-node-bencode'
import { name, version } from '../../package.json'
import { calcPieceSize, fileSizeSum, sha1sum, walkDir } from './util'

/**
 * 打开文件对话框
 * @multiple 是否多选
 * @filterExtensions 过滤文件类型
 */
ipcMain.handle(
  'open-file-dialog',
  async (
    _,
    {
      multiple,
      filterExtensions = { name: 'All Files', extensions: ['*'] }
    }: { multiple: boolean; filterExtensions?: { name: string; extensions: string[] } }
  ) => {
    // 默认打开桌面
    const defaultPath = app.getPath('desktop')
    // 打开文件对话框,过滤出种子文件
    return await dialog.showOpenDialog({
      defaultPath: defaultPath,
      properties: multiple ? ['openFile', 'multiSelections'] : ['openFile'],
      filters: [filterExtensions]
    })
  }
)

/**
 * 打开文件夹对话框
 * @multiple 是否多选
 *
 */
ipcMain.handle('open-directory-dialog', async (_, { multiple }: { multiple: boolean }) => {
  // 默认打开桌面
  const defaultPath = app.getPath('desktop')
  return await dialog.showOpenDialog({
    defaultPath: defaultPath,
    properties: multiple ? ['openDirectory', 'multiSelections'] : ['openDirectory']
  })
})

/**
 * 保存文件对话框
 * @defaultPath 默认路径
 */
ipcMain.handle(
  'save-file-dialog',
  async (
    _,
    {
      defaultPath,
      filterExtensions = { name: 'All Files', extensions: ['*'] }
    }: { defaultPath?: string; filterExtensions: { name: string; extensions: string[] } }
  ) => {
    // 默认路径为桌面
    if (!defaultPath) {
      defaultPath = app.getPath('desktop')
    }
    const result = await dialog.showSaveDialog({
      defaultPath: defaultPath,
      filters: [filterExtensions]
    })
    console.log(result)
    return result
  }
)

/**
 * 生成种子文件
 */
ipcMain.handle(
  'generate-torrent',
  async (
    _,
    {
      entry,
      savePath,
      alignPiece,
      pieceSize,
      isPrivate,
      trackers,
      webSeeds,
      source,
      comment
    }: {
      entry: string
      savePath: string
      alignPiece: boolean
      pieceSize: number
      isPrivate: boolean
      trackers: string[]
      webSeeds: string[]
      source?: string
      comment?: string
    }
  ) => {
    if (!savePath) {
      throw new Error('savePath is empty')
    }
    // 获取所有文件,包含隐藏文件
    let files = (await fs.promises.stat(entry)).isDirectory() ? walkDir(entry) : [entry]
    // 按照路径深度升序排序,['/root/file1','/root/dir1/file2','/root/dir1/dir2/file3']

    files = files.sort((a, b) => a.split(path.sep).length - b.split(path.sep).length)

    const singleFileMode = files.length === 1
    const totalSize = fileSizeSum(files)
    console.log(`totalSize: ${totalSize}`)
    const safePieceSize = pieceSize === 0 ? calcPieceSize(totalSize) : pieceSize

    const torrentStructure = {
      //首字母大写 Tor => 'created by': 'Tor v1.0.0'
      'created by': `${name.replace(/^\S/, (s) => s.toUpperCase())} v${version}`,
      'creation date': Math.floor(Date.now() / 1000),
      info: {
        name: path.basename(entry),
        'piece length': safePieceSize
      }
    } as any

    if (trackers && trackers.length > 0) {
      trackers = trackers.filter((tracker) => tracker !== '').sort()
      // 在单个tracker的情况下,使用announce字段
      // 例如: 'announce': 'tracker1'
      torrentStructure['announce'] = trackers[0]

      // 多个tracker,使用announce-list字段,注意每个tracker都是一个数组包裹一个字符串
      // 例如: 'announce-list': [['tracker1'],['tracker2']]
      if (trackers.length > 1) {
        torrentStructure['announce-list'] = trackers.map((tracker) => [tracker])
      }
    }

    if (webSeeds) {
      webSeeds = webSeeds.filter((tracker) => tracker !== '').sort()
      if (webSeeds.length === 1) {
        // 在单个url的情况下,值为string
        // 例如: 'url-list': 'http://example.com'
        torrentStructure['url-list'] = webSeeds[0]
      }
      // 多个url,值为string的数组
      // 例如: 'url-list': ['http://example.com','http://example2.com']
      else if (webSeeds.length > 1) {
        torrentStructure['url-list'] = webSeeds
      }
    }

    if (isPrivate) {
      torrentStructure['info']['private'] = 1
    }

    if (comment) {
      torrentStructure['comment'] = comment
    }

    if (source) {
      torrentStructure['source'] = source
    }

    // 单文件模式
    if (singleFileMode) {
      // 文件的长度,单位为字节
      torrentStructure['info']['length'] = fs.statSync(files[0]).size
      const pieces = sha1sum(files, safePieceSize)
      // 文件的分块hash
      torrentStructure['info']['pieces'] = pieces
    }
    // 多文件模式
    else {
      torrentStructure['info']['files'] = []

      for (const f of files) {
        torrentStructure['info']['files'].push({
          length: fs.statSync(f).size,
          // dir1/dir2/file.ext => [dir1,dir2,file.ext]
          path: path.relative(entry, f).split(path.sep)
        })
      }

      torrentStructure['info']['pieces'] = sha1sum(files, safePieceSize, alignPiece)
    }

    // 生成种子文件
    const torrent = new Bencoder().encode(torrentStructure)

    console.log(`savePath: ${savePath}`)

    // 写入到指定路径
    await fs.promises.writeFile(savePath, torrent)

    await fs.promises.writeFile(
      app.getPath('desktop') + path.basename(entry) + '.json',
      JSON.stringify(torrentStructure, null, 2)
    )

    return savePath
  }
)

/**
 * 判断文件是否存在
 */
ipcMain.handle('exist-file', async (_, filePath: string) => {
  return fs.existsSync(filePath)
})

/**
 * 获取桌面路径
 */
ipcMain.handle('get-desktop-path', async () => {
  return app.getPath('desktop')
})

/**
 * 返回系统平台
 * @returns 'darwin' | 'linux'| 'win32'
 */
ipcMain.handle('get-platform', async () => {
  return process.platform
})
/**
 * 返回Locale
 */
ipcMain.handle('get-system-locale', async () => {
  return app.getSystemLocale()
})

/**
 * 解码种子文件
 * @torrentFile 种子文件路径
 */
ipcMain.handle('decode-torrent', async (_, torrentFile) => {
  if (!torrentFile) {
    throw new Error('No torrent file provided')
  }

  const bytes = await fs.promises.readFile(torrentFile)

  return new Bdecoder().decode(bytes)
})
