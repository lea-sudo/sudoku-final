import { Strategy } from './Strategy.js';

const SUDOKU_SIZE = 9;
const BOX_SIZE = 3;

/**
 * 裸对策略
 * 找到只有两个候选数字的单元格对，并从相关单元格中移除这些数字
 */
export class NakedPairsStrategy extends Strategy {
    constructor(possibleNumberGrid = []) {
        super(possibleNumberGrid);
        this.strategy = "NakedPairs";
    }

    execute(possibleNumberGrid) {
        if (!possibleNumberGrid) {
            throw new Error("NakedPairs策略需要可能数字网格作为输入");
        }

        this.newPossibleNumberGrid = JSON.parse(JSON.stringify(possibleNumberGrid));

        // 处理所有行
        for (let row = 0; row < SUDOKU_SIZE; row++) {
            const rowCells = this.newPossibleNumberGrid[row];
            const pairs = this.findNakedPairs(rowCells);
            const executed = this.removeNakedPairs(rowCells, pairs);
            
            executed.forEach(([executedIndex, index1, index2]) => {
                this.newReferenceGrid[row][executedIndex].push([row, index1], [row, index2]);
            });
        }

        // 处理所有列
        for (let col = 0; col < SUDOKU_SIZE; col++) {
            const colCells = this.newPossibleNumberGrid.map(row => row[col]);
            const pairs = this.findNakedPairs(colCells);
            const executed = this.removeNakedPairs(colCells, pairs);
            
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

                const pairs = this.findNakedPairs(box);
                const executed = this.removeNakedPairs(box, pairs);

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
     * 找到裸对
     */
    findNakedPairs(cells) {
        const pairs = [];
        const pairMap = new Map();

        cells.forEach((cell, index) => {
            if (cell.length === 2) {
                const key = cell.join(',');
                if (pairMap.has(key)) {
                    pairMap.get(key).push(index);
                } else {
                    pairMap.set(key, [index]);
                }
            }
        });

        pairMap.forEach((indices, key) => {
            if (indices.length === 2) {
                const [num1, num2] = key.split(',').map(Number);
                pairs.push({
                    indices: indices,
                    numbers: [num1, num2]
                });
            }
        });

        return pairs;
    }

    /**
     * 移除裸对数字
     */
    removeNakedPairs(cells, pairs) {
        const executed = [];

        pairs.forEach(pair => {
            const { indices, numbers } = pair;
            const [index1, index2] = indices;

            cells.forEach((cell, index) => {
                if (index !== index1 && index !== index2 && cell.length > 0) {
                    const originalLength = cell.length;
                    
                    // 移除裸对的数字
                    for (let i = cell.length - 1; i >= 0; i--) {
                        if (numbers.includes(cell[i])) {
                            cell.splice(i, 1);
                        }
                    }

                    // 如果有数字被移除，记录执行信息
                    if (cell.length < originalLength) {
                        executed.push([index, index1, index2]);
                    }
                }
            });
        });

        return executed;
    }
}