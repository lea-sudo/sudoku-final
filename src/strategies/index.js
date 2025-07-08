import { StrategyRegistry } from './StrategyRegistry.js';
import { PossibleNumberStrategy } from './PossibleNumberStrategy.js';
import { NakedPairsStrategy } from './NakedPairsStrategy.js';
import { HiddenPairsStrategy } from './HiddenPairsStrategy.js';
import { XwingStrategy } from './XwingStrategy.js';

// 创建全局策略注册器实例
export const strategyRegistry = new StrategyRegistry();

// 注册所有策略
strategyRegistry.registerStrategy('PossibleNumber', PossibleNumberStrategy);
strategyRegistry.registerStrategy('NakedPairs', NakedPairsStrategy);
strategyRegistry.registerStrategy('HiddenPairs', HiddenPairsStrategy);
strategyRegistry.registerStrategy('Xwing', XwingStrategy);

// 导出策略类供直接使用
export { Strategy } from './Strategy.js';
export { PossibleNumberStrategy } from './PossibleNumberStrategy.js';
export { NakedPairsStrategy } from './NakedPairsStrategy.js';
export { HiddenPairsStrategy } from './HiddenPairsStrategy.js';
export { XwingStrategy } from './XwingStrategy.js';
export { StrategyRegistry } from './StrategyRegistry.js';
export { solveSudokuTest, benchmarkStrategies, solveSudokuWithStrategies } from './SudokuSolver.js';