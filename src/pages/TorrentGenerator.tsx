import { setMinExecuteTime } from '@/utils/common'
import { chooseDirectory, chooseFile, chooseSaveDirectory, generateTorrent, getDesktopPath } from '@/utils/file'
import toast from '@/utils/toast'
import { Button, Checkbox, Form, Input, Select } from '@arco-design/web-react/es'
import { IconFile, IconFolder, IconSave } from '@arco-design/web-react/icon'
import _ from 'lodash'
import path from 'path'
import { useTranslation } from 'react-i18next'
import { create } from 'zustand'
const FormItem = Form.Item
const PIECE_SIZE_OPTIONS = [
  {
    label: 'page.torrent-generator.auto',
    value: 0
  },
  {
    label: '16 KB',
    value: 16 * 1024
  },
  {
    label: '32 KB',
    value: 32 * 1024
  },
  {
    label: '64 KB',
    value: 64 * 1024
  },
  {
    label: '128 KB',
    value: 128 * 1024
  },
  {
    label: '256 KB',
    value: 256 * 1024
  },
  {
    label: '512 KB',
    value: 512 * 1024
  },
  {
    label: '1 MB',
    value: 1024 * 1024
  },
  {
    label: '2 MB',
    value: 2 * 1024 * 1024
  },
  {
    label: '4 MB',
    value: 4 * 1024 * 1024
  },
  {
    label: '8 MB',
    value: 8 * 1024 * 1024
  },
  {
    label: '16 MB',
    value: 16 * 1024 * 1024
  }
]

type Store = {
  entry?: string // 文件路径
  isDir?: boolean // 是否是文件夹
  comment?: string // 注释
  source?: string // 来源
  webSeeds?: string // web 种子
  trackers?: string // tracker url
  isPrivate: boolean // 私有种子
  pieceSize: number // 分块大小
  alignPiece: boolean // 分块对齐
  processing: boolean // 是否正在生成
  setEntry: (entry: string, isDir: boolean) => void
  setComment: (comment: string) => void
  setSource: (source: string) => void
  setWebSeeds: (webSeeds: string) => void
  setTrackers: (trackers: string) => void
  setIsPrivate: (isPrivate: boolean) => void
  setPieceSize: (pieceSize: number) => void
  setAlignPiece: (alignPiece: boolean) => void
  setProcessing: (processing: boolean) => void
}

const useStore = create<Store>()((set) => ({
  pieceSize: PIECE_SIZE_OPTIONS[0].value, // 默认分块大小为自动
  isPrivate: false, // 默认公开种子
  alignPiece: true, // 默认分块对齐
  processing: false, // 默认不在生成中
  setEntry: (entry, isDir) => set((prev) => ({ ...prev, entry, isDir })),
  setComment: (comment) => set((prev) => ({ ...prev, comment })),
  setSource: (source) => set((prev) => ({ ...prev, source })),
  setWebSeeds: (webSeeds) => set((prev) => ({ ...prev, webSeeds })),
  setTrackers: (trackers) => set((prev) => ({ ...prev, trackers })),
  setIsPrivate: (isPrivate) => set((prev) => ({ ...prev, isPrivate })),
  setPieceSize: (pieceSize) => set((prev) => ({ ...prev, pieceSize })),
  setAlignPiece: (alignPiece) => set((prev) => ({ ...prev, alignPiece })),
  setProcessing: (processing) => set((prev) => ({ ...prev, processing }))
}))

const MESSAGE_ID = 'TorrentGenerator'

export default () => {
  const isDir = useStore((state) => state.isDir)
  const [entry, setEntry] = useStore((state) => [state.entry, state.setEntry])
  const [comment, setComment] = useStore((state) => [state.comment, state.setComment])
  const [source, setSource] = useStore((state) => [state.source, state.setSource])
  const [webSeeds, setWebSeeds] = useStore((state) => [state.webSeeds, state.setWebSeeds])
  const [trackers, setTrackers] = useStore((state) => [state.trackers, state.setTrackers])
  const [isPrivate, setIsPrivate] = useStore((state) => [state.isPrivate, state.setIsPrivate])
  const [pieceSize, setPieceSize] = useStore((state) => [state.pieceSize, state.setPieceSize])
  const [alignPiece, setAlignPiece] = useStore((state) => [state.alignPiece, state.setAlignPiece])
  const [processing, setProcessing] = useStore((state) => [state.processing, state.setProcessing])

  const { t } = useTranslation()

  const handleChooseFile = async (isDir: boolean) => {
    const result = isDir ? await chooseDirectory() : await chooseFile()

    if (result.canceled) {
      return
    }

    const entry = result.filePaths[0]

    setEntry(entry, isDir)
  }

  const handleFileInputChnage = _.throttle(() => {
    toast.w(t('page.torrent-generator.unspport-munual-input'), MESSAGE_ID)
  }, 4000)

  const validteUrls = (urls: string) => {
    let urlIsValid = true
    for (const url of urls.split('\n')) {
      if (!url.trim()) {
        continue
      }

      try {
        new URL(url.trim())
      } catch (e) {
        urlIsValid = false
        break
      }
    }

    return urlIsValid
  }

  // 生成种子
  const handleGenerate = async () => {
    // 校验所有表单项
    if (!entry) {
      toast.e(t('page.torrent-generator.file-path-empty'), MESSAGE_ID)
      return
    }

    if (trackers && !validteUrls(trackers)) {
      toast.e(`Tracker ${t('page.torrent-generator.url-illegal')}`, MESSAGE_ID)
      return
    }

    if (webSeeds && !validteUrls(webSeeds)) {
      toast.e(`Web ${t('page.torrent-generator.url-illegal')}`, MESSAGE_ID)
      return
    }

    const desktopPath = await getDesktopPath()

    // 生成种子文件名
    const defaultFileName = path.basename(entry) + '.torrent'

    // 生成种子默认保存路径
    const defaultPath = path.join(desktopPath, defaultFileName)

    // 获取保存目录
    const saveDir = await chooseSaveDirectory(defaultPath, {
      name: 'Torrent File',
      extensions: ['torrent']
    })

    if (saveDir.canceled) {
      return
    }

    if (!saveDir.filePath) {
      return
    }

    // 如果没有后缀,则自动添加
    if (!saveDir.filePath.endsWith('.torrent')) {
      toast.e(t('page.torrent-generator.must-ended-with-torrent'), MESSAGE_ID)
      return
    }

    setProcessing(true)

    toast.l(t('page.torrent-generator.torrent-generating'), MESSAGE_ID)

    try {
      const generateTorrentPromise = generateTorrent({
        entry: entry,
        savePath: saveDir.filePath,
        comment: comment,
        source: source,
        webSeeds: webSeeds
          ?.split('\n')
          .map((item) => item.trim())
          .filter((item) => !!item),
        trackers: trackers
          ?.split('\n')
          .map((item) => item.trim())
          .filter((item) => !!item),
        isPrivate: isPrivate,
        pieceSize: pieceSize,
        alignPiece: alignPiece
      })

      await setMinExecuteTime(generateTorrentPromise, 1500)

      toast.s(t('page.torrent-generator.torrent-generate-success'), MESSAGE_ID)
    } catch (e) {
      toast.e(t('page.torrent-generator.torrent-generate-fail'), MESSAGE_ID)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Form className="w-full" autoComplete="off" layout="vertical" disabled={processing}>
      <FormItem label={t('page.torrent-generator.file-path')}>
        <Input
          placeholder={t('page.torrent-generator.file-path-placeholder')}
          value={entry}
          onChange={handleFileInputChnage}
          prefix={entry ? isDir ? <IconFolder /> : <IconFile /> : undefined}
        />
      </FormItem>
      <FormItem>
        <Button
          type="outline"
          className="mr-2"
          icon={<IconFolder />}
          onClick={() => {
            handleChooseFile(true)
          }}
        >
          {t('page.torrent-generator.choose-folder')}
        </Button>
        <Button
          type="outline"
          icon={<IconFile />}
          onClick={() => {
            handleChooseFile(false)
          }}
        >
          {t('page.torrent-generator.choose-file')}
        </Button>
      </FormItem>
      <FormItem label={t('page.torrent-generator.piece-size')}>
        <Select
          defaultValue={0}
          onChange={(index: number) => {
            setPieceSize(PIECE_SIZE_OPTIONS[index].value)
          }}
          options={PIECE_SIZE_OPTIONS.map((item, index) => ({ label: t(item.label), value: index }))}
          allowClear
        />
      </FormItem>

      <FormItem label={t('page.torrent-generator.tracker-url')}>
        <Input.TextArea
          placeholder={t('page.torrent-generator.tracker-url-placeholder')}
          value={trackers}
          onChange={(value) => {
            setTrackers(value)
          }}
        />
      </FormItem>

      <FormItem label={t('page.torrent-generator.weebseeds-url')}>
        <Input.TextArea
          placeholder={t('page.torrent-generator.weebseeds-url-placeholder')}
          value={webSeeds}
          onChange={(value) => {
            setWebSeeds(value)
          }}
        />
      </FormItem>

      <FormItem label={t('page.torrent-generator.comment')}>
        <Input.TextArea
          showWordLimit
          maxLength={128}
          placeholder={t('page.torrent-generator.comment-placeholder')}
          onChange={(value) => {
            setComment(value)
          }}
        />
      </FormItem>

      <FormItem label={t('page.torrent-generator.source')}>
        <Input.TextArea
          showWordLimit
          maxLength={128}
          placeholder={t('page.torrent-generator.source-placeholder')}
          onChange={(value) => {
            setSource(value)
          }}
        />
      </FormItem>

      {/* TODO 忽略隐藏文件  */}
      {/* TODO 分块对齐 */}
      {/* <FormItem >
        <Tooltip content={t('page.torrent-generator.piece-alignment-desc')} position="right">
          <Checkbox
            disabled={processing}
            checked={alignPiece}
            onChange={(checked) => {
              setState((prev) => {
                return {
                  ...prev,
                  alignPiece: checked
                }
              })
            }}
          >
            {t('page.torrent-generator.piece-alignment')}
          </Checkbox>
        </Tooltip>
      </FormItem> */}
      <FormItem>
        <Checkbox
          checked={isPrivate}
          onChange={(checked) => {
            setIsPrivate(checked)
          }}
        >
          {t('page.torrent-generator.private-torrent')} ({t('page.torrent-generator.private-torrent-desc')})
        </Checkbox>
      </FormItem>

      <FormItem>
        <Button type="outline" icon={<IconSave />} onClick={handleGenerate} loading={processing}>
          {processing ? t('page.torrent-generator.torrent-generating') : t('page.torrent-generator.torrent-generate')}
        </Button>
      </FormItem>
    </Form>
  )
}
