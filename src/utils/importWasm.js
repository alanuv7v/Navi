export default async function importWasm () {
    
    let i = document.createElement('input')
    i.type = "file"
    i.multiple = false
    i.click()

    let inputChange = new Promise((resolve) => {
        i.addEventListener("change", (event) => {
            resolve(event.target)
        })
    })
    await inputChange

    let file = i.files[0]
    let arr = await file.arrayBuffer()

    console.log(file, arr)

    return WebAssembly.instantiate(arr, {})

}