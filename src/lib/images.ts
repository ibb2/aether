import { openDB, deleteDB, wrap, unwrap } from 'idb'

export async function handleFileUploadOPFS(docId: string, file: File) {
    try {
        const fileId = crypto.randomUUID()
        const opfs = await navigator.storage.getDirectory()

        const aetherDirectory = await opfs.getDirectoryHandle('aether', {
            create: true,
        })
        const docDirectory = await aetherDirectory.getDirectoryHandle(docId, {
            create: true,
        })

        const fileReader = new FileReader()
        fileReader.readAsDataURL(file)

        fileReader.onload = async () => {
            const fileData = {
                name: file.name,
                data: fileReader.result, // Base64 or ArrayBuffer
                mimeType: file.type,
            }

            const fileHandler = await aetherDirectory.getFileHandle(fileId, {
                create: true,
            })
            const fileWriter = await fileHandler.createWritable()

            await fileWriter.write(file)
            await fileWriter.close()
        }

        // Store metadata in IndexedDB
        storeFileMetadata(fileId, file).catch(console.error)

        return fileId
    } catch (error) {
        console.error('Error retrieving file from OPFS:', error)
    }
}

export async function getBlobUrlForFileId(fileId: string) {
    const opfsRoot = await navigator.storage.getDirectory()
    const fileHandle = await opfsRoot.getFileHandle(fileId)
    const file = await fileHandle.getFile()
    return URL.createObjectURL(file)
}

let dbInstance: IDBDatabase | null = null

async function initializeDatabase() {
    if (dbInstance) return dbInstance

    try {
        const db = await openDB('FileStorage', 1, {
            upgrade(database) {
                // Check if the 'files' object store already exists
                if (!database.objectStoreNames.contains('files')) {
                    // Create the 'files' object store with 'id' as the key
                    database.createObjectStore('files', { keyPath: 'id' })
                }
            },
        })
        dbInstance = db
        return db
    } catch (error) {
        console.error('Database initialization error:', error)
        throw error
    }
}

async function storeFileMetadata(fileId: string, file: File) {
    try {
        const db = await initializeDatabase() // Ensure the database is initialized
        const tx = db.transaction('files', 'readwrite')
        const store = tx.objectStore('files')

        await store.put({
            id: fileId, // Unique ID for the file
            name: file.name, // File name
            type: file.type, // File MIME type
        })

        await tx.done
    } catch (error) {
        console.error('Error storing file metadata:', error)
        throw error
    }
}
