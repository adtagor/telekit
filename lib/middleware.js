/**
 * A store of middleware;
 *
 * @module telekit/middleware
 * @author Denis Maslennikov <mrdenniska@gmail.com> (nofach.com)
 * @license MIT
 */

/** Dependencies */
const isArrow = require('isarrow');
const isClass = require('isclass');
const debug = require('debug')('telekit:middleware');

/** Implementation */
class Middleware {
    constructor(kit) {
        this.kit = kit;
        this.store = [];
    }

    transmit(type, ...params) {
        let next = true;
        let fn = () => next = true;

        for (let i = 0, c = this.store.length; i < c; i++) {
            if (!next) break;

            if (this.store[i] && this.store[i][type]) {
                next = false;
                this.store[i][type](...params, fn);
                continue;
            }

            next = true;
        }
    }

    /**
     * Add your middleware to stack of middlewares
     *
     * @param  {Class|Function} value - The middleware
     * @return {Middleware}
     */
    use(value, ...others) {
        let handle = value;

        /** Value is array */
        if (Array.isArray(handle)) {
            handle.forEach((item) => this.use(item, ...others));
            return this;
        }

        debug('use %s', handle.name || '_');

        /** Value is function */
        if (typeof(value) == 'function') {
            /** Value is Class */
            if (isClass(value) && !isArrow(value)) {
                handle = new handle(this.kit, ...others);
            } else {
                handle = handle(this.kit, ...others);
            }
        }

        /** Add handle to stack */
        this.store.push(handle);
        return this;
    }
}

/** Methods */
module.exports = Middleware;