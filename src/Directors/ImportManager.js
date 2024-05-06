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