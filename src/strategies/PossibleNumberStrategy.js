import { Strategy } from './Strategy.js';
import { userGrid } from '@sudoku/stores/grid';
import { get } from 'svelte/store';

const SUDOKU_SIZE = 9;

/**
 * 基础可能数字策略
 * 为每个空格计算所有可能的数字
 */
export class PossibleNumberStrategy extends Strategy {
    constructor() {
        super();
        this.strategy = "PossibleNumber";
    }

    execute(possibleNumberGrid) {
        const sudoku = get(userGrid);
        
        // 初始化可能数字网格
        this.newPossibleNumberGrid = Array.from({ length: SUDOKU_SIZE }, () => 
            Array.from({ length: SUDOKU_SIZE }, () => [])
        );

        // 为每个空格计算可能的数字
        for (let row = 0; row < SUDOKU_SIZE; row++) {
            for (let col = 0; col < SUDOKU_SIZE; col++) {
                if (sudoku[row][col] === 0) {
                    this.newPossibleNumberGrid[row][col] = this.getPossibleNumbers(sudoku, row, col);
                    this.getReferenceGrid(sudoku, row, col);
                } else {
                    this.newPossibleNumberGrid[row][col] = [];
                    this.newReferenceGrid[row][col] = [];
                }
            }
        }

        return [this.newPossibleNumberGrid, this.newReferenceGrid, this.strategy];
    }
}