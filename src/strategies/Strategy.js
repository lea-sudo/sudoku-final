import { userGrid } from '@sudoku/stores/grid';
import { get } from 'svelte/store';

const SUDOKU_SIZE = 9;
const BOX_SIZE = 3;

/**
 * 策略基类
 * 定义了所有数独求解策略的通用接口和基础功能
 */
export class Strategy {
    constructor(possibleNumberGrid = []) {
        this.newPossibleNumberGrid = possibleNumberGrid.length > 0 
            ? JSON.parse(JSON.stringify(possibleNumberGrid))
            : Array.from({ length: SUDOKU_SIZE }, () => Array.from({ length: SUDOKU_SIZE }, () => []));
        this.newReferenceGrid = Array.from({ length: SUDOKU_SIZE }, () => Array.from({ length: SUDOKU_SIZE }, () => []));
        this.strategy = "";
        this.sudoku = get(userGrid);
    }

    /**
     * 执行策略的主方法
     * @param {Array} possibleNumberGrid - 可能数字网格
     * @returns {Array} [更新后的可能数字网格, 参考网格, 策略名称]
     */
    execute(possibleNumberGrid) {
        if (possibleNumberGrid) {
            this.newPossibleNumberGrid = JSON.parse(JSON.stringify(possibleNumberGrid));
        }
        return [this.newPossibleNumberGrid, this.newReferenceGrid, this.strategy];
    }

    /**
     * 获取指定行的所有数字
     */
    getRow(sudoku, row) {
        return sudoku[row];
    }

    /**
     * 获取指定列的所有数字
     */
    getCol(sudoku, col) {
        return sudoku.map(row => row[col]);
    }

    /**
     * 获取指定位置所在3x3方格的所有数字
     */
    getBox(sudoku, row, col) {
        const box = [];
        const startRow = row - row % BOX_SIZE;
        const startCol = col - col % BOX_SIZE;
        for (let r = 0; r < BOX_SIZE; r++) {
            for (let c = 0; c < BOX_SIZE; c++) {
                box.push(sudoku[startRow + r][startCol + c]);
            }
        }
        return box;
    }

    /**
     * 获取指定位置的可能数字
     */
    getPossibleNumbers(sudoku, row, col) {
        if (sudoku[row][col] !== 0) {
            return [];
        }

        let usedNumbers = new Set([
            ...this.getRow(sudoku, row),
            ...this.getCol(sudoku, col),
            ...this.getBox(sudoku, row, col)
        ]);

        let possibleNumbers = [];
        for (let num = 1; num <= 9; num++) {
            if (!usedNumbers.has(num)) {
                possibleNumbers.push(num);
            }
        }

        return possibleNumbers;
    }

    /**
     * 生成参考网格，标记影响当前位置的其他位置
     */
    getReferenceGrid(sudoku, rowIndex, colIndex) {
        // 清空当前位置的参考信息
        this.newReferenceGrid[rowIndex][colIndex] = [];

        // 添加同行的已填数字位置
        for (let num = 0; num < SUDOKU_SIZE; num++) {
            if (sudoku[rowIndex][num] !== 0 && num !== colIndex) {
                this.newReferenceGrid[rowIndex][colIndex].push([rowIndex, num]);
            }
        }

        // 添加同列的已填数字位置
        for (let num = 0; num < SUDOKU_SIZE; num++) {
            if (sudoku[num][colIndex] !== 0 && num !== rowIndex) {
                this.newReferenceGrid[rowIndex][colIndex].push([num, colIndex]);
            }
        }

        // 添加同一3x3方格的已填数字位置
        const startRow = rowIndex - rowIndex % BOX_SIZE;
        const startCol = colIndex - colIndex % BOX_SIZE;
        for (let r = 0; r < BOX_SIZE; r++) {
            for (let c = 0; c < BOX_SIZE; c++) {
                const currentRow = startRow + r;
                const currentCol = startCol + c;
                if (sudoku[currentRow][currentCol] !== 0 && 
                    (currentRow !== rowIndex || currentCol !== colIndex)) {
                    this.newReferenceGrid[rowIndex][colIndex].push([currentRow, currentCol]);
                }
            }
        }
    }
}