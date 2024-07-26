export default class Tie {
    constructor (string, from, to) {
        if (string) {
            let s = string.split("/")
            this.from = s[0]
            this.to = s[1]
        } else {
            this.from = from
            this.to = to
        }
    }
    get toString () {
        return this.from + "/" + this.to
    }
    get toArray () {
        return [this.from, this.to]
    }
    get mirror () {
        return structuredClone(this.toArray).reverse().join("/")
    }
}