import TorrentViewer from '@/components/TorrentViewer'
import { setMinExecuteTime } from '@/utils/common'
import { chooseFile, decodeTorrent } from '@/utils/file'
import toast from '@/utils/toast'
import { Button, Spin } from '@arco-design/web-react/es'
import { IconDelete, IconEye, IconEyeInvisible, IconFile, IconRefresh } from '@arco-design/web-react/icon'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { create } from 'zustand'

type Store = {
  torrent?: Object // 种子文件解码后的对象
  loading?: boolean // 是否正在加载
  dragIn: boolean // 是否拖入
  hidePieces: boolean // 是否隐藏pieces
  setTorrent: (torrent?: Object) => void
  setLoading: (loading: boolean) => void
  setHidePieces: (hidePieces: boolean) => void
  setDragIn: (dragIn: boolean) => void
}

const useStore = create<Store>()((set) => ({
  hidePieces: true,
  dragIn: false,
  setTorrent: (torrent) => set((prev) => ({ ...prev, torrent })),
  setLoading: (loading) => set((prev) => ({ ...prev, loading })),
  setHidePieces: (hidePieces) => set((prev) => ({ ...prev, hidePieces })),
  setDragIn: (dragIn) => set((prev) => ({ ...prev, dragIn }))
}))

export default () => {
  const { t } = useTranslation()

  const [torrent, setTorrent] = useStore((state) => [state.torrent, state.setTorrent])
  const [loading, setLoading] = useStore((state) => [state.loading, state.setLoading])
  const [hidePieces, setHidePieces] = useStore((state) => [state.hidePieces, state.setHidePieces])
  const [dragIn, setDragIn] = useStore((state) => [state.dragIn, state.setDragIn])

  // 选择种子文件
  const handleTorrentFileChoose = async () => {
    const result = await chooseFile(false, {
      name: 'Torrent File',
      extensions: ['torrent']
    })

    if (result.canceled) {
      return
    }

    const torrentFile = result.filePaths[0]

    await decodeTorrentFile(torrentFile)
  }

  const decodeTorrentFile = async (torrentFile: string) => {
    if (!torrentFile) {
      toast.e(t('page.metadata-viewer.torrent-notfound'))
      return
    }

    if (!torrentFile.endsWith('.torrent')) {
      toast.e(`${t('unsupported-file-type')}:${torrentFile}`)
      return
    }

    setLoading(true)

    // 种子文件解码
    const torrent = await setMinExecuteTime<Object>(decodeTorrent(torrentFile))
    setTorrent(torrent)
    setLoading(false)
  }

  const clearTorrentFile = () => {
    setTorrent(undefined)
  }

  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Spin dot tip={t('page.metadata-viewer.decoding')} />
      </div>
    )
  }

  if (!torrent && !loading) {
    return (
      <div className="absolute inset-0 w-full h-full flex justify-center items-center p-8">
        <div
          className={classNames(
            'transition-all w-full h-full flex flex-col justify-center items-center border-dashed border-[0.3rem]',
            { 'border-blue-500': dragIn }
          )}
          onDragOver={(e) => {
            e.preventDefault()
            console.log(`drag over`)
          }}
          onDragEnter={(e) => {
            e.preventDefault()
            console.log(`drag enter`)
            setDragIn(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            console.log(`drag leave`)
            setDragIn(false)
          }}
          onDrop={async (e) => {
            e.preventDefault()
            setDragIn(false)

            console.log(e.dataTransfer.files)

            const files = e.dataTransfer.files

            if (files.length === 0) {
              return
            }

            await decodeTorrentFile(files[0].path)
          }}
        >
          <Button type="outline" size="large" icon={<IconFile />} onClick={handleTorrentFileChoose}>
            {t('page.metadata-viewer.open-torrent')}
          </Button>
          <p className="text-gray-300 text-2xl p-4"> {t('page.metadata-viewer.drag-torrent')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-full flex flex-col">
      <div className="mb-8 text-center space-x-4">
        <Button
          type="outline"
          icon={hidePieces ? <IconEye /> : <IconEyeInvisible />}
          onClick={() => {
            setHidePieces(!hidePieces)
          }}
        >
          {hidePieces ? t('page.metadata-viewer.show-piece-hash') : t('page.metadata-viewer.show-piece-hash')}
        </Button>
        <Button loading={loading} type="outline" icon={<IconRefresh />} onClick={handleTorrentFileChoose}>
          {t('page.metadata-viewer.reselect-file')}
        </Button>

        <Button type="outline" status="danger" icon={<IconDelete />} onClick={clearTorrentFile}>
          {t('page.metadata-viewer.clear')}
        </Button>
      </div>

      <TorrentViewer data={torrent} hidePieces={hidePieces} />
    </div>
  )
}
