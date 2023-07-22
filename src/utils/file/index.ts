import { ipcRenderer } from 'electron'

type OpenFileResult = {
  canceled: boolean
  filePaths: string[]
}

type SaveFileResult = {
  canceled: boolean
  filePath?: string
}

export async function chooseFile(
  multiple = false,
  filterExtensions?: {
    name: string
    extensions: string[]
  }
): Promise<OpenFileResult> {
  return (await ipcRenderer.invoke('open-file-dialog', { multiple, filterExtensions })) as OpenFileResult
}

export async function chooseDirectory(multiple = false): Promise<OpenFileResult> {
  return (await ipcRenderer.invoke('open-directory-dialog', { multiple })) as OpenFileResult
}

export async function chooseSaveDirectory(
  defaultPath?: string,
  filterExtensions?: {
    name: string
    extensions: string[]
  }
): Promise<SaveFileResult> {
  return (await ipcRenderer.invoke('save-file-dialog', { defaultPath, filterExtensions })) as SaveFileResult
}

export async function decodeTorrent(torrentFile: string): Promise<Object> {
  return (await ipcRenderer.invoke('decode-torrent', torrentFile)) as Object
}

export async function existFile(filePath: string): Promise<boolean> {
  return (await ipcRenderer.invoke('exist-file', filePath)) as boolean
}

export async function getDesktopPath(): Promise<string> {
  return (await ipcRenderer.invoke('get-desktop-path')) as string
}

export async function generateTorrent(args: any): Promise<void> {
  await ipcRenderer.invoke('generate-torrent', { ...args })
}
