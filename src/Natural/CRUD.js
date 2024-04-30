// CRUD
// = 이게 실상 모든 유저 액션이다.
// 다만 이 모듈은 UserActions의 바로 아래 디펜던시로 사용하겠다.
// UserActions에 있는 함수들은 더 귀찮음을 덜어주기 위해 인수 직접 입력이 다수 생략되고 대부분의 인수가 appSession의 정보에서 주어진다.

import Root from "../Entities/Root"
import * as FileSystem from "../Workers/FileSystem"
import appSession from "../Resources/appSession"
import Query from "../Entities/Query"
import Seed from "../Entities/Seed"
import Tree from "../Entities/Tree"

export async function createSession(usage) {
// usage는 id도 될 수 있고 다른 무언가도 될 수 있다.
// 세션을 생성하면 기본적으로 id를 갖게된다.
// id를 유저가 입력한 string으로 바꿀 수도 있다.
    
}
export async function createRoot(nameString) {
    let parentDirHandle = await FileSystem.showDirectoryPicker()
    return await FileSystem.createFolder(parentDirHandle, nameString)
}

export async function createDocument(nameString) {
    let parentDirHandle = appSession.root
    return await FileSystem.createFile(appSession.root, nameString, "yaml")
}

export async function createSeed(queryString) {
    let {document, treeData} = await new Query(queryString).result()
    return new Seed({document, treeData})
}

export async function createTree(queryString) {
    let seed = createSeed(queryString)
    return (await seed).sprout()
}

export async function createNode(keyString) {
    appSession.tree.addNode()
}

export async function createDictionary(nameString)

export async function readSession(usage)
export async function readRoot() => openDirectoryPicker
export async function readDocument(nameString)

export async function saveSession(usage)
export async function saveDocument(documentName)
export async function saveTreeChanges(treeData)

export async function deleteSession(usage)
//deleteRoot(nameString)
    //모든 docs를 날려버리는 것. 매우 크나큰 결정이기에 그냥 유저가 파일시스템에서 알아서 지우게 두는게 낫다.
    export async function deleteDocument(nameString)
    //앱 상에서 지원하는 가장 큰 삭제 기능인걸로. 이것도 한번 더 의사 물어봐야 된다.
    export async function deleteNode(node)
//deleteDictionary()