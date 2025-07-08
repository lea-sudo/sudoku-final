/**
 * 策略注册器
 * 负责管理和动态注册数独求解策略
 */
export class StrategyRegistry {
    constructor() {
        this.strategyMap = new Map();
    }

    /**
     * 注册策略
     * @param {string} strategyName - 策略名称
     * @param {Function} strategyClass - 策略类构造函数
     */
    registerStrategy(strategyName, strategyClass) {
        if (typeof strategyClass === 'function') {
            this.strategyMap.set(strategyName, strategyClass);
        } else {
            throw new Error('Strategy class must be a function');
        }
    }

    /**
     * 获取策略类
     * @param {string} strategyName - 策略名称
     * @returns {Function|undefined} 策略类构造函数
     */
    getStrategy(strategyName) {
        return this.strategyMap.get(strategyName);
    }

    /**
     * 获取所有已注册的策略名称
     * @returns {Array} 策略名称数组
     */
    getStrategyKeys() {
        return Array.from(this.strategyMap.keys());
    }

    /**
     * 检查策略是否已注册
     * @param {string} strategyName - 策略名称
     * @returns {boolean} 是否已注册
     */
    hasStrategy(strategyName) {
        return this.strategyMap.has(strategyName);
    }

    /**
     * 移除策略
     * @param {string} strategyName - 策略名称
     * @returns {boolean} 是否成功移除
     */
    removeStrategy(strategyName) {
        return this.strategyMap.delete(strategyName);
    }

    /**
     * 清空所有策略
     */
    clear() {
        this.strategyMap.clear();
    }

    /**
     * 获取已注册策略的数量
     * @returns {number} 策略数量
     */
    size() {
        return this.strategyMap.size;
    }
}