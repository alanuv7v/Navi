//CRUD

export async function showDirectoryPicker() {
    if (!('showOpenFilePicker' in window)) {
        return new Error("FileSystemAPI is not supported in this environment")
    }
    return await window.showDirectoryPicker()
}

export async function createFile(parentDirHandle, name, extension) {
    const fileName = `${name}.${extension}`
    try {
        const fileHandle = await parentDirHandle.getFileHandle(fileName, { create: true });
        return fileHandle
    }
    catch (err) {
        return new Error(`Cannot create a file(${fileName}) in ${parentDirHandle}`, err)
    }
}

export async function createFolder(parentDirHandle, name) {
    try {
        const parentDirHandle = await parentFolderHandle.getDirectoryHandle(name, { create: true });
        return parentDirHandle
    }
    catch (err) {
        return new Error(`Cannot create a folder(${name}) in ${parentDirHandle}`, err)
    }
}

export async function writeToFile(fileHandle, toWrite) {
    try {
        const writable = await fileHandle.createWritable();
        await writable.write(toWrite);
        await writable.close();
        return true
    }
    catch (err) {
        return new Error(`Cannot write to a file(${fileHandle}) in the local filesystem`, err)
    }
}

export async function deleteHandle(handle) {
    try {
        const parentFolderHandle = await window.showDirectoryPicker();
        const newFolderHandle = await parentFolderHandle.getDirectoryHandle(name, { create: true });
        return newFolderHandle
    }
    catch {
        return new Error(`Cannot delete ${handle} in the local filesystem`, err)
    }
}

export async function listAllFilesAndDirs(dirHandle) {
    const files = [];
    for await (let [name, handle] of dirHandle) {
        const {kind} = handle;
        if (handle.kind === 'directory') {
            files.push({name, handle, kind, children: await listAllFilesAndDirs(handle)});
        } else {
            files.push({name, handle, kind});
        }
    }
    return files;
}