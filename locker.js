const redis = require("./client");

class Locker {
    /**
     * Created by root on 5/5/17.
     */
    constructor () {
    }

    get Key() {
        return this.id || 'key'
    }

    get Info() {
        return JSON.stringify({});
    }

    async save() {
        await redis.setter(this.Key, this.Info);
    }

    async delete() {
        return await redis.deleter(this.Key)
    }

    async syncWithRedis() {
        const data = await redis.getter(this.Key, false);
        if(!data){
            return false;
        }
        for(const key of Object.keys(data)){
            this[key] = data[key];
        }
        return true;
    }

    async lock () {
        let lockName = "lock_" + this.Key;
        return new Promise((resolve) => {
            this.tryToLock(lockName, resolve);
        });
    }

    async lockAndSync () {
        try {
            await this.lock();
            return await this.syncWithRedis();
        } catch (err) {
            return Promise.reject(err);
        }
    }

    async unlock () {
        let lockName = "lock_" + this.Key;
        await redis.client.del(lockName);
    }


    async updateAndUnlock () {
        try {
            await this.save();
            await this.unlock();
        } catch (err) {
            await this.unlock();
            return Promise.reject(err);
        }
    }


    tryToLock(lockName, resolve) {
        let interval = setInterval(() => {
            redis.client.SETNX(lockName, 'foo', (err, done) => {
                if(done) {
                    clearInterval(interval);
                    redis.client.EXPIRE(lockName, 15, resolve);
                }
            });
        }, 10);
    };
}

module.exports = Locker;
