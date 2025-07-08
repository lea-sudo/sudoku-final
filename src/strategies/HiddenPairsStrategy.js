import { Strategy } from './Strategy.js';

const SUDOKU_SIZE = 9;
const BOX_SIZE = 3;

/**
 * 隐藏对策略
 * 找到只在两个位置出现的数字对，并从这些位置移除其他候选数字
 */
export class HiddenPairsStrategy extends Strategy {
    constructor(possibleNumberGrid = []) {
        super(possibleNumberGrid);
        this.strategy = "HiddenPairs";
    }

    execute(possibleNumberGrid) {
        if (!possibleNumberGrid) {
            throw new Error("HiddenPairs策略需要可能数字网格作为输入");
        }

        this.newPossibleNumberGrid = JSON.parse(JSON.stringify(possibleNumberGrid));

        // 处理所有行
        for (let row = 0; row < SUDOKU_SIZE; row++) {
            const rowCells = this.newPossibleNumberGrid[row];
            const pairs = this.findHiddenPairs(rowCells);
            const executed = this.removeHiddenPairs(rowCells, pairs);
            
            executed.forEach(([executedIndex, index1, index2]) => {
                this.newReferenceGrid[row][executedIndex].push([row, index1], [row, index2]);
            });
        }

        // 处理所有列
        for (let col = 0; col < SUDOKU_SIZE; col++) {
            const colCells = this.newPossibleNumberGrid.map(row => row[col]);
            const pairs = this.findHiddenPairs(colCells);
            const executed = this.removeHiddenPairs(colCells, pairs);
            
            executed.forEach(([executedIndex, index1, index2]) => {
                this.newReferenceGrid[executedIndex][col].push([index1, col], [index2, col]);
            });

            // 将修改后的列数据写回网格
            colCells.forEach((cell, row) => {
                this.newPossibleNumberGrid[row][col] = cell;
            });
        }

        // 处理所有3x3方格
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const startRow = boxRow * BOX_SIZE;
                const startCol = boxCol * BOX_SIZE;
                
                const box = [];
                for (let r = 0; r < BOX_SIZE; r++) {
                    for (let c = 0; c < BOX_SIZE; c++) {
                        box.push(this.newPossibleNumberGrid[startRow + r][startCol + c]);
                    }
                }

                const pairs = this.findHiddenPairs(box);
                const executed = this.removeHiddenPairs(box, pairs);

                executed.forEach(([executedIndex, index1, index2]) => {
                    const r = Math.floor(executedIndex / BOX_SIZE);
                    const c = executedIndex % BOX_SIZE;
                    const r1 = Math.floor(index1 / BOX_SIZE);
                    const c1 = index1 % BOX_SIZE;
                    const r2 = Math.floor(index2 / BOX_SIZE);
                    const c2 = index2 % BOX_SIZE;

                    this.newReferenceGrid[startRow + r][startCol + c].push(
                        [startRow + r1, startCol + c1], 
                        [startRow + r2, startCol + c2]
                    );
                });

                // 将修改后的方格数据写回网格
                box.forEach((cell, index) => {
                    const r = Math.floor(index / BOX_SIZE);
                    const c = index % BOX_SIZE;
                    this.newPossibleNumberGrid[startRow + r][startCol + c] = cell;
                });
            }
        }

        return [this.newPossibleNumberGrid, this.newReferenceGrid, this.strategy];
    }

    /**
     * 找到隐藏对
     */
    findHiddenPairs(cells) {
        const pairs = [];
        const numberPositions = new Map();

        // 记录每个数字出现的位置
        cells.forEach((cell, index) => {
            if (cell.length > 0) {
                cell.forEach(num => {
                    if (!numberPositions.has(num)) {
                        numberPositions.set(num, []);
                    }
                    numberPositions.get(num).push(index);
                });
            }
        });

        // 找到只在两个位置出现的数字
        const twoPositionNumbers = [];
        numberPositions.forEach((positions, num) => {
            if (positions.length === 2) {
                twoPositionNumbers.push({ num, positions });
            }
        });

        // 寻找隐藏对：两个数字出现在相同的两个位置
        for (let i = 0; i < twoPositionNumbers.length; i++) {
            for (let j = i + 1; j < twoPositionNumbers.length; j++) {
                const first = twoPositionNumbers[i];
                const second = twoPositionNumbers[j];
                
                if (this.arraysEqual(first.positions, second.positions)) {
                    pairs.push({
                        indices: first.positions,
                        numbers: [first.num, second.num]
                    });
                }
            }
        }

        return pairs;
    }

    /**
     * 移除隐藏对的其他候选数字
     */
    removeHiddenPairs(cells, pairs) {
        const executed = [];

        pairs.forEach(pair => {
            const { indices, numbers } = pair;
            
            indices.forEach(index => {
                const cell = cells[index];
                if (cell.length > 2) {
                    const originalLength = cell.length;
                    
                    // 只保留隐藏对的数字
                    for (let i = cell.length - 1; i >= 0; i--) {
                        if (!numbers.includes(cell[i])) {
                            cell.splice(i, 1);
                        }
                    }

                    // 如果有数字被移除，记录执行信息
                    if (cell.length < originalLength) {
                        executed.push([index, indices[0], indices[1]]);
                    }
                }
            });
        });

        return executed;
    }

    /**
     * 比较两个数组是否相等
     */
    arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        return arr1.every((val, index) => val === arr2[index]);
    }
}