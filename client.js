const asyncRedis = require("async-redis");

const redis = {
    expirationTime: 2 * 60 * 60,
    connect(configs) {
        if (configs.expirationTime){
            this.expirationTime = configs.expirationTime
        }
        this.client = asyncRedis.createClient(configs || {});
        return new Promise((res, rej) => {
            this.client.on("ready", () => {
                res(this.client)
            });
            this.client.on("error", (e) => {
                rej()
            });
        })

    },
    async getKeys(key) {
        try {
            return await this.client.keys(key);
        } catch (error) {
            console.error('<<RDS-ERR>>: ', error);
            return false;
        }
    },

    async setter(key, value) {
        try {
            await this.client.SETEX(key, this.expirationTime, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('<<RDS-ERR>>: ', error);
            return false;
        }
    },

    async getter(key) {
        try {
            const result = await this.client.get(key);
            return JSON.parse(result);
        } catch (error) {
            console.error('<<RDS-ERR>>: ', error);
            return false;
        }
    },

    deleter(key) {
        return this.client.del(key)
            .then(result => true)
            .catch(e => console.error('<<RDS-ERR>>: ', error));
    },

    pub(key, value) {
        this.client.publish(key, value);
    }
};

module.exports = redis;
