import Realm from "realm";
import { v4 as uuidv4 } from "uuid";

const linkScheme = {
    name: "link",
    properties: {
        tie: {type: "string", optional: true},
        query: "string",
        distance: {type: 'float', optional: true},
        atRange: {type: 'list', objectType: 'float'}
    }
}
const NodeSchema = {
    name: "node",
    properties: {
        id: "string",
        key: "string",
        valueType: {type: "string", default: "string", optional: true},
        value: {type: "string", optional: true},
        links: {type: 'list', objectType: 'link'}
    },
};

const n = {
    name: "n",
    properties: {
        id: "string",
        key: "string",
        valueType: {type: "string", optional: true, default: "___"}, // null | string | number | image | video | audio | mp3 | mp4 ...
    },
};

async function test () {
    //@ts-ignore
    const realm = await Realm.open({
        path: './realm_network',
        schema: [NodeSchema, linkScheme],
        schemaVersion: 0, // increment this number whenever schema changes
    }) 

    realm.write(() => {
        realm.create("node", {
            id: uuidv4(),
            key: "@Alan",
            value: "Yeah it's me",
            links: []
        })
    })
    
    const nodes = realm.objects("node")
    console.log(nodes)
    
    realm.close()
}

test()



