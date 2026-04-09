export default class HealthController {
    static _singleton = null
    static instance() {
        this._singleton ||= new this()
        return this._singleton
    }

    healthCheck(req, res) {
        return Promise.resolve()
            .then(() => res.status(200).send("ok"))
    }
}