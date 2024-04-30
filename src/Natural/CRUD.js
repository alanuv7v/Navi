//...이 layer는 필요없는 것 같다.
//그냥 쓸모있는 것만 다 usecase 계층 (UserAction.js)로 옮길란다.
//CRUD 모듈을 따로 만드는건 점점 의미없어지고 있다. Entity 자체에서 관련 기능을 제공중이기 때문이다. 
//Create는 new 키워드로 생성, Read는 entity의 데이터 직접 읽기, Update는 entity의 데이터 직접 set, Delete는 그냥 그것이 포함된 객체에서 삭제.

// CRUD
// = CRSD. Create Read Save Delete
// = CLSD. Create Load Save Delete, Creative LSD...? Create LSD.....??
// CRUD는 DB의 액션에 가깝고, CLSD는 앱의 액션에 가깝다. 앱은 데이터를 가져오는것 뿐만 아니라 세션에 저장도 하니까. 그게 Read와 Load의 차이겠지.
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

export async function createDictionary(nameString) {

}

export async function loadSession(usage) {
    
}

export async function loadRoot() {
    
}

export async function loadDocument(nameString) {
    
}

export async function saveSession(usage) {
    
}

export async function saveDocument(handle) {
    
}

export async function saveTreeChanges(treeData) {
    
}

export async function deleteSession(usage) {
    
}

export async function deleteNode(node) {

}
