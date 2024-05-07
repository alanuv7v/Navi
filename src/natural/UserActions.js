import appSession from "../resource/appSession"
import * as LocalDB from "../interface/LocalDB"
import Root from "../entity/Root"
import Seed from "../entity/Seed"
import Query from "../entity/Query"
import DB from "../resource/DB"
import * as FileSystem from "../tech/FileSystem"

export async function openRoot() {
    
    const rootHandle = await window.showDirectoryPicker()
    
    if (!(await rootHandle.queryPermission()) === "granted") {
        await rootHandle.requestPermission()
    }
    
    appSession.root = new Root(rootHandle)

    saveSession()

    console.log(`Opened root: ${appSession.root.name}`)

    return appSession.root

}

export async function openTree(queryString) {
    try {

        let seed = new Seed(queryString)
        appSession.seeds.push(seed)
        
        await seed.parse()
        appSession.tree = seed.plant()
        appSession.adress = queryString

        saveSession()

        return appSession.tree

    }
    catch (err) {
        console.error(err, `Failed to open tree by the given query: ${queryString}. the query is formatted wrongly or matching doucment and prop does not exist in the root.`)
    }
}

export async function saveChange() {
    //saveDocument가 아닌 이유: Tree 안에는 stemOut으로 연결된 타 문서도 있을 수 있음. 
    //Tree를 수정함으로써 타 문서도 수정했다면, 씨앗 문서 뿐만 아니라 타 문서의 변경사항도 저장해야 함.
    let res = []
    appSession.seeds.forEach(async (seed) => {
        res.push(await FileSystem.writeToFile(seed.document.handle, await seed.stringify()))
    })
    return res

    // !! 내가 지금 생각하는 것: stemOut할 때는 children에 새 노드가 추가되지만, 이 노드의 value는 변하지 않는다. 또한 새 노드의 parent에 이 노드가 추가되지 않는다.
    // 따라서 appSession.seed.node.value는 stemOut으로 생긴 노드의 부모에 영향받지 않는다.
    // UserActions.saveChange() 시에 stemOut node의 변화는... 어떻게 해야 할까.
    /* 
    열려있는 모든 다른 document들에 각기 다른 node value를 저장해야 한다.
    우선 열려있는 모든 document들과 각자의 seed를 기록한다.
    그들을 순회하며 그 seed의 value를 seed.document.handle에 저장하면 된다.
    메인으로 열리는건 appSession.seed다.
    그럼 그 seed에서 열린 다른 seed들은... 어디 저장하지. seed.seeds에 저장해야 하나? appSession.seed[접목된 tree의 seed를 지칭하는 어떤 명사]에 저장하면 좋을듯.
    이름을 짓는게 역시 관건...
    parasite는 너무 부정적이고...
    openedSeeds?
    implantedSeeds?
    innerSeeds?
    
    */

}

export async function saveSession() {
    return await LocalDB.saveSession(appSession)
}

export function loadSession () {
    
}

export async function clearDB () {
    return await DB.delete()
}


export function createDocument () {
}

export const Edit = {
    selectedNode: {
        copyNode: (node) => {
            appSession.copiedNode = appSession.selectedNode
            return appSession.copiedNode
        },
        pasteNode: (parentNodeQueryString) => {
            appSession.copiedNode.changeParent(appSession.selectedNode)
            return appSession.selectedNode
        },
        addNode: (key, value) => {
            //let parentNode = Tree.selectedNode
            //this.pasteNode(parentNode)
            appSession.selectedNode.addChild(key, value)
            return appSession.selectedNode
        },
        deleteNode: () => {
            let originalParent = appSession.selectedNode.parent
            appSession.selectedNode.delete()
            return originalParent
        },
        changeOrder: (change) => {
            appSession.selectedNode.changeOrder(change)
            return appSession.selectedNode
        },
        changeDepth: (change) => {
            appSession.selectedNode.changeDepth(change)
            return appSession.selectedNode
        },
        link: (targetQueryString) => {
            appSession.selectedNode.linkTo(targetQueryString)
            return appSession.selectedNode
        }
    }
}

export const Prune = {

    selectedNode: {
        hideNode: () => {
            appSession.selectedNode.hide()
            return appSession.selectedNode
        },
    },

    filterNodes: (key) => {
    }

}

export const Navigate = {
    //search는 openTree와 동일해서 제외.
    selectedNode: {
        stemOut: () => {
            appSession.selectedNode.stemOut()
            return appSession.selectedNode
        },
        plant: (queryString) => {
            let newSeed = new Seed(appSession.selectedNode.pathString())
            newSeed.plant()
        }
    }
}
