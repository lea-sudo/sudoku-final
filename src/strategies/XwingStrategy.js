import { Strategy } from './Strategy.js';

const SUDOKU_SIZE = 9;

/**
 * X-Wing策略
 * 在两行或两列中找到相同数字只出现在相同两个位置的情况
 * 然后从这些位置的其他相关行/列中移除该数字
 */
export class XwingStrategy extends Strategy {
    constructor(possibleNumberGrid = []) {
        super(possibleNumberGrid);
        this.strategy = "Xwing";
    }

    execute(possibleNumberGrid) {
        if (!possibleNumberGrid) {
            throw new Error("Xwing策略需要可能数字网格作为输入");
        }

        this.newPossibleNumberGrid = JSON.parse(JSON.stringify(possibleNumberGrid));

        // 检查行中的X-Wing模式
        this.findRowXwings();
        
        // 检查列中的X-Wing模式
        this.findColXwings();

        return [this.newPossibleNumberGrid, this.newReferenceGrid, this.strategy];
    }

    /**
     * 寻找行中的X-Wing模式
     */
    findRowXwings() {
        for (let num = 1; num <= 9; num++) {
            const rowPatterns = [];
            
            // 找到每行中该数字可能出现的列位置
            for (let row = 0; row < SUDOKU_SIZE; row++) {
                const positions = [];
                for (let col = 0; col < SUDOKU_SIZE; col++) {
                    if (this.newPossibleNumberGrid[row][col].includes(num)) {
                        positions.push(col);
                    }
                }
                
                // 只考虑恰好有两个位置的行
                if (positions.length === 2) {
                    rowPatterns.push({ row, positions });
                }
            }

            // 寻找X-Wing模式：两行有相同的两个列位置
            for (let i = 0; i < rowPatterns.length; i++) {
                for (let j = i + 1; j < rowPatterns.length; j++) {
                    const pattern1 = rowPatterns[i];
                    const pattern2 = rowPatterns[j];
                    
                    if (this.arraysEqual(pattern1.positions, pattern2.positions)) {
                        this.executeRowXwing(num, pattern1.row, pattern2.row, pattern1.positions);
                    }
                }
            }
        }
    }

    /**
     * 寻找列中的X-Wing模式
     */
    findColXwings() {
        for (let num = 1; num <= 9; num++) {
            const colPatterns = [];
            
            // 找到每列中该数字可能出现的行位置
            for (let col = 0; col < SUDOKU_SIZE; col++) {
                const positions = [];
                for (let row = 0; row < SUDOKU_SIZE; row++) {
                    if (this.newPossibleNumberGrid[row][col].includes(num)) {
                        positions.push(row);
                    }
                }
                
                // 只考虑恰好有两个位置的列
                if (positions.length === 2) {
                    colPatterns.push({ col, positions });
                }
            }

            // 寻找X-Wing模式：两列有相同的两个行位置
            for (let i = 0; i < colPatterns.length; i++) {
                for (let j = i + 1; j < colPatterns.length; j++) {
                    const pattern1 = colPatterns[i];
                    const pattern2 = colPatterns[j];
                    
                    if (this.arraysEqual(pattern1.positions, pattern2.positions)) {
                        this.executeColXwing(num, pattern1.col, pattern2.col, pattern1.positions);
                    }
                }
            }
        }
    }

    /**
     * 执行行X-Wing消除
     */
    executeRowXwing(num, row1, row2, cols) {
        const [col1, col2] = cols;
        
        // 从这两列的其他行中移除该数字
        for (let row = 0; row < SUDOKU_SIZE; row++) {
            if (row !== row1 && row !== row2) {
                // 检查第一列
                if (this.removeNumberFromCell(row, col1, num)) {
                    this.newReferenceGrid[row][col1].push([row1, col1], [row2, col1]);
                }
                
                // 检查第二列
                if (this.removeNumberFromCell(row, col2, num)) {
                    this.newReferenceGrid[row][col2].push([row1, col2], [row2, col2]);
                }
            }
        }
    }

    /**
     * 执行列X-Wing消除
     */
    executeColXwing(num, col1, col2, rows) {
        const [row1, row2] = rows;
        
        // 从这两行的其他列中移除该数字
        for (let col = 0; col < SUDOKU_SIZE; col++) {
            if (col !== col1 && col !== col2) {
                // 检查第一行
                if (this.removeNumberFromCell(row1, col, num)) {
                    this.newReferenceGrid[row1][col].push([row1, col1], [row1, col2]);
                }
                
                // 检查第二行
                if (this.removeNumberFromCell(row2, col, num)) {
                    this.newReferenceGrid[row2][col].push([row2, col1], [row2, col2]);
                }
            }
        }
    }

    /**
     * 从指定位置移除特定数字
     */
    removeNumberFromCell(row, col, num) {
        const cell = this.newPossibleNumberGrid[row][col];
        const index = cell.indexOf(num);
        
        if (index > -1) {
            cell.splice(index, 1);
            return true;
        }
        
        return false;
    }

    /**
     * 比较两个数组是否相等
     */
    arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        return arr1.every((val, index) => val === arr2[index]);
    }
}