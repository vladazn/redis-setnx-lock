const redis = require("./client");
const locker = require("./locker");

const _exports = {
    async connect(configs) {
        try{
            return await redis.connect(configs);
        }catch(e){
            console.warn(e);
        }
    },

    Locker: locker,
}

module.exports = _exports;