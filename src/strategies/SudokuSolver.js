import { strategyRegistry } from './index.js';
import { settings } from '../node_modules/@sudoku/stores/settings.js';
import { get } from 'svelte/store';

const MAXLEVEL = 3; // 最大提示级别

/**
 * 数独求解测试函数
 * 使用策略组合优化求解数独
 * @param {Array} sudoku - 数独网格
 * @returns {Array} [可能数字网格, 参考网格, 策略网格]
 */
export function solveSudokuTest(sudoku) {
    let level = 0;
    const currentSettings = get(settings);
    if (currentSettings && currentSettings.minhintlevelateachstep) {
        level = currentSettings.minhintlevelateachstep;
    }

    const strategyKeys = strategyRegistry.getStrategyKeys();

    // PossibleNumber策略作为初始调用策略
    let initialStrategyClass = strategyRegistry.getStrategy(strategyKeys[0]);
    let initialStrategy = new initialStrategyClass();
    let [initialPossibleGrid, initialReferenceGrid, initialStrategyName] = initialStrategy.execute();

    let maxCellsBelowLevel = initialPossibleGrid.flat().filter(cell => cell.length <= MAXLEVEL && cell.length > 0).length;
    let possibleNumbersGrid = initialPossibleGrid;
    let bestStrategyCombination = maxCellsBelowLevel > 0 ? [initialStrategyName] : [];

    /**
     * 深度优先搜索最优策略组合
     */
    function dfs(currentGrid, currentStrategyIndex, currentCombination) {
        if (currentStrategyIndex >= strategyKeys.length) {
            return;
        }

        for (let i = currentStrategyIndex; i < strategyKeys.length; i++) {
            let strategyKey = strategyKeys[i];
            let strategyClass = strategyRegistry.getStrategy(strategyKey);
            let strategy = new strategyClass();
            let [newPossibleGrid, newReferenceGrid, strategyName] = strategy.execute(currentGrid);

            let cellsBelowLevel = newPossibleGrid.flat().filter(cell => cell.length <= MAXLEVEL && cell.length > 0).length;

            if (cellsBelowLevel > maxCellsBelowLevel) {
                maxCellsBelowLevel = cellsBelowLevel;
                bestStrategyCombination = [...currentCombination, strategyName];
                possibleNumbersGrid = newPossibleGrid;
            }

            dfs(newPossibleGrid, i + 1, [...currentCombination, strategyName]);
        }
    }

    // 获取全局的最优策略组合
    dfs(initialPossibleGrid, 1, bestStrategyCombination);

    // 依次记录最优策略组合里每个策略输出的所有单元格的候选值
    let prevPossibleGrid = initialPossibleGrid;
    let referenceGridMap = new Map();
    let possibleGridMap = new Map();

    for (let i = 0; i < bestStrategyCombination.length; i++) {
        let key = bestStrategyCombination[i];
        let strategyClass = strategyRegistry.getStrategy(key);
        let strategy = new strategyClass();

        let newPossibleGrid, newReferenceGrid, strategyName;
        if (key === "PossibleNumber") {
            [newPossibleGrid, newReferenceGrid, strategyName] = strategy.execute();
        } else {
            [newPossibleGrid, newReferenceGrid, strategyName] = strategy.execute(prevPossibleGrid);
        }

        prevPossibleGrid = newPossibleGrid;
        possibleGridMap.set(key, newPossibleGrid);
        referenceGridMap.set(key, newReferenceGrid);
    }

    // 针对每个单元格选择策略组合
    const referenceNumbersGrid = sudoku.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
            if (cell === 0 && possibleNumbersGrid[rowIndex][colIndex].length > 0) {
                let minKey = null;
                let minLength = Infinity;
                for (let [key, grid] of possibleGridMap) {
                    let length = grid[rowIndex][colIndex].length;
                    if (length < minLength) {
                        minLength = length;
                        minKey = key;
                    }
                }
                let collectedStrategies = [];
                for (let key of bestStrategyCombination) {
                    collectedStrategies.push(key);
                    if (key === minKey) break;
                }

                for (let i = collectedStrategies.length - 1; i >= 0; i--) {
                    let key = collectedStrategies[i];
                    let value = referenceGridMap.get(key)[rowIndex][colIndex];
                    if (value.length > 0) {
                        return value;
                    }
                }
                return [];
            } else {
                return [];
            }
        })
    );

    // 针对每个单元格选择策略组合
    const strategyGrid = sudoku.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
            if (cell === 0 && possibleNumbersGrid[rowIndex][colIndex].length > 0) {
                let minKey = null;
                let minLength = Infinity;
                for (let [key, grid] of possibleGridMap) {
                    let length = grid[rowIndex][colIndex].length;
                    if (length < minLength) {
                        minLength = length;
                        minKey = key;
                    }
                }
                let strategySequence = [];
                for (let key of bestStrategyCombination) {
                    strategySequence.push(key);
                    if (key === minKey) break;
                }
                return strategySequence;
            } else {
                return [];
            }
        })
    );

    return [possibleNumbersGrid, referenceNumbersGrid, strategyGrid];
}

/**
 * 性能测试函数
 * @param {Array} sudoku - 数独网格
 * @param {number} iterations - 测试次数
 * @returns {Object} 性能测试结果
 */
export function benchmarkStrategies(sudoku, iterations = 10) {
    const results = {};
    const strategyKeys = strategyRegistry.getStrategyKeys();

    strategyKeys.forEach(strategyKey => {
        const times = [];
        
        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            
            let strategyClass = strategyRegistry.getStrategy(strategyKey);
            let strategy = new strategyClass();
            
            if (strategyKey === 'PossibleNumber') {
                strategy.execute();
            } else {
                // 先执行PossibleNumber获取初始网格
                let possibleStrategy = new (strategyRegistry.getStrategy('PossibleNumber'))();
                let [possibleGrid] = possibleStrategy.execute();
                strategy.execute(possibleGrid);
            }
            
            const endTime = performance.now();
            times.push(endTime - startTime);
        }
        
        results[strategyKey] = {
            average: times.reduce((a, b) => a + b, 0) / times.length,
            min: Math.min(...times),
            max: Math.max(...times),
            times: times
        };
    });

    return results;
}

export function solveSudokuWithStrategies(sudoku) {
    return solveSudokuTest(sudoku);
}