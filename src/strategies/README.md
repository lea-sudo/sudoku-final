# HappySudoku 策略系统

## 概述

这是 HappySudoku 项目的核心算法模块，实现了完整的数独求解策略系统。该系统采用策略模式设计，支持动态策略注册与组合优化，为数独游戏提供智能提示和求解功能。

## 系统架构

```
src/strategies/
├── README.md                 # 本文档
├── index.js                  # 策略注册和统一导出
├── Strategy.js               # 策略基类
├── StrategyRegistry.js       # 策略注册器
├── SudokuSolver.js          # 策略执行核心算法
├── PossibleNumberStrategy.js # 基础可能数字策略
├── NakedPairsStrategy.js     # 裸对策略
├── HiddenPairsStrategy.js    # 隐藏对策略
└── XwingStrategy.js          # X-Wing策略
```

## 使用方法

### 基础使用

```javascript
import { solveSudokuTest } from '@sudoku/strategies';

// 数独网格 (0表示空格)
const sudoku = [
    [0,3,0,0,0,0,0,0,0],
    [7,0,0,0,0,0,0,0,1],
    // ... 其他行
];

// 获取求解结果
const [possibleNumbers, referenceNumbers, strategies] = solveSudokuTest(sudoku);

// possibleNumbers: 每个位置的候选数字
// referenceNumbers: 参考位置信息
// strategies: 每个位置使用的策略序列
```

### 在现有代码中集成

在项目的求解函数中使用（如 `src/components/Controls/ActionBar/Actions.svelte`）：

```javascript
import { solveSudokuTest } from '@sudoku/strategies';

function solve() {
    const startTime = performance.now();
    let [possibleNumbers, referenceNumbers, strategy] = solveSudokuTest($userGrid);
    
    $userGrid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell === 0) {
                candidates.set({x: colIndex, y: rowIndex}, possibleNumbers[rowIndex][colIndex]);
                referenceGrid.set({x: colIndex, y: rowIndex}, referenceNumbers[rowIndex][colIndex]);
                strategyGrid.set({x: colIndex, y: rowIndex}, strategy[rowIndex][colIndex]);
            }
        });
    });
    
    const endTime = performance.now();
    console.log(`求解耗时: ${endTime - startTime} ms`);
}
```

## 核心组件详解

### 1. 策略基类 (Strategy.js)

所有数独求解策略的抽象基类，定义了通用接口和基础功能：

- `execute(possibleNumberGrid)`: 执行策略的主方法
- `getRow(sudoku, row)`: 获取指定行的所有数字
- `getCol(sudoku, col)`: 获取指定列的所有数字
- `getBox(sudoku, row, col)`: 获取指定位置所在3x3方格的所有数字
- `getPossibleNumbers(sudoku, row, col)`: 计算指定位置的可能数字
- `getReferenceGrid(sudoku, rowIndex, colIndex)`: 生成参考网格

### 2. 策略注册器 (StrategyRegistry.js)

动态管理和注册数独求解策略：

```javascript
import { strategyRegistry } from '@sudoku/strategies';

// 注册新策略
strategyRegistry.registerStrategy('MyStrategy', MyStrategyClass);

// 获取策略
const strategy = strategyRegistry.getStrategy('MyStrategy');

// 获取所有策略名称
const allStrategies = strategyRegistry.getStrategyKeys();
```

### 3. 策略执行核心 (SudokuSolver.js)

实现智能策略组合和优化算法：

1. **全局最优策略组合搜索**: 使用深度优先搜索找到能最大化候选值小于等于提示级别的单元格数量的策略组合
2. **单元格策略优化**: 为每个单元格选择最优的策略序列，避免冗余计算
3. **性能基准测试**: 提供策略性能分析工具

## 已实现策略

### 1. PossibleNumber 策略
- **功能**: 计算每个空格的基础可能数字
- **原理**: 根据数独规则，排除同行、同列、同3x3方格中已存在的数字
- **时间复杂度**: O(n²)
- **适用场景**: 所有数独求解的基础步骤

### 2. NakedPairs 策略
- **功能**: 寻找裸对（只有两个候选数字的单元格对）
- **原理**: 如果两个单元格只能填入相同的两个数字，则可以从相关区域的其他单元格中移除这两个数字
- **时间复杂度**: O(n³)
- **适用场景**: 中等难度数独的优化

### 3. HiddenPairs 策略
- **功能**: 寻找隐藏对（只在两个位置出现的数字对）
- **原理**: 如果两个数字只能出现在相同的两个位置，则这两个位置只能填入这两个数字
- **时间复杂度**: O(n³)
- **适用场景**: 高难度数独的关键技巧

### 4. X-Wing 策略
- **功能**: 寻找X-Wing模式
- **原理**: 如果某个数字在两行（或两列）中只能出现在相同的两个列（或行）位置，则可以从这些列（或行）的其他位置移除该数字
- **时间复杂度**: O(n⁴)
- **适用场景**: 专家级数独的高级技巧

## 性能指标

基于标准测试数独的性能数据（10次测试平均值）：

| 策略组合 | 平均执行时间 |
|---------|-------------|
| PossibleNumber | 0.92 ms |
| PossibleNumber + NakedPairs | 1.67 ms |
| PossibleNumber + NakedPairs + HiddenPairs | 3.26 ms |
| 完整策略组合 | ~5.0 ms |

## 扩展开发

### 添加新策略

1. **创建策略类文件**:
```javascript
// NewStrategy.js
import { Strategy } from './Strategy.js';

export class NewStrategy extends Strategy {
    constructor(possibleNumberGrid = []) {
        super(possibleNumberGrid);
        this.strategy = "NewStrategy";
    }

    execute(possibleNumberGrid) {
        if (!possibleNumberGrid) {
            throw new Error("NewStrategy需要可能数字网格作为输入");
        }

        this.newPossibleNumberGrid = JSON.parse(JSON.stringify(possibleNumberGrid));
        
        // 实现策略逻辑
        // ...

        return [this.newPossibleNumberGrid, this.newReferenceGrid, this.strategy];
    }
}
```

2. **注册策略**:
```javascript
// 在 index.js 中添加
import { NewStrategy } from './NewStrategy.js';
strategyRegistry.registerStrategy('NewStrategy', NewStrategy);
```

3. **更新导出**:
```javascript
// 在 index.js 中添加导出
export { NewStrategy } from './NewStrategy.js';
```

## 数据结构

### 数独网格 (sudoku)
```javascript
// 9x9二维数组，0表示空格，1-9表示已填数字
[
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    // ...
]
```

### 可能数字网格 (possibleNumberGrid)
```javascript
// 9x9二维数组，每个元素是该位置可能的数字数组
[
    [[1,2,4], [2,4], [], [2,4,6,8,9], [], [4,6,8,9], [1,2,4,9], [7], [2,3,4,9]],
    [[], [2,4,7], [2,4,7], [], [], [], [2,3,4], [6,8], [2,3,4,8]],
    // ...
]
```

### 参考网格 (referenceGrid)
```javascript
// 9x9二维数组，每个元素是影响该位置的其他位置坐标数组
[
    [[[0,1], [2,0]], [[0,0], [0,2]], [], // ...
    // ...
]
```

### 策略网格 (strategyGrid)
```javascript
// 9x9二维数组，每个元素是该位置使用的策略名称数组
[
    [["PossibleNumber"], ["PossibleNumber", "NakedPairs"], [], // ...
    // ...
]
```

## 常见问题

### Q: 策略执行顺序重要吗？
A: 是的。策略有依赖关系，PossibleNumber必须先执行，其他策略基于其结果进行优化。

### Q: 如何处理无解数独？
A: 系统会检测到某些位置候选数字为空且未填入数字的情况，此时返回相应的错误状态。

### Q: 策略性能如何监控？
A: 使用 `benchmarkStrategies` 函数进行性能测试，可以监控各策略的执行时间。

### Q: 如何与现有游戏逻辑集成？
A: 导入 `solveSudokuTest` 函数，在需要提示的地方调用即可，返回的数据结构与现有系统兼容。

---

**维护者**: MichaelSou1  
**最后更新**: 2025-06-19  
**版本**: 1.0.0