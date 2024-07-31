//CRUD

export async function showDirectoryPicker() {
    if (!('showOpenFilePicker' in window)) {
        return new Error("FileSystemAPI is not supported in this environment")
    }
    return await window.showDirectoryPicker()
}

export async function createFile(parentDirHandle, name, extension) {
    const fileName = extension ? `${name}.${extension}` : name
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
        const newFolderHandle = await parentDirHandle.getDirectoryHandle(name, { create: true });
        return newFolderHandle
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
            files.push({
                name, 
                handle, 
                kind, 
                children: await listAllFilesAndDirs(handle)
            });
        } else {
            files.push({name, handle, kind});
        }
    }
    return files;
}

export function getSubItemByPath (tree, path) {
    let pathSegments = path.split("/")
    let lastHandle
    for (let i = 0; i < pathSegments.length; i++) {
        const seg = pathSegments[i];
        lastHandle = tree.children.find(c => c.name === seg)
        if (i === pathSegments.length-1) break
    }
    return lastHandle
}


export async function downloadFile (name, blob) {
    
    const url = window.URL.createObjectURL(blob);

    // Create a link to download it
    const a = document.createElement("a");
    a.href = url;
    a.download = name
    a.click();

}

export async function copyFile (sourceHandle, destinationHandle) {
    let sourceFile = await sourceHandle.getFile()
    let writableStream = destinationHandle.createWritable()
    await sourceFile.stream().pipeTo(writableStream)
    return destinationHandle
}