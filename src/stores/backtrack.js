import { writable, get } from 'svelte/store';
import { userGrid } from '../node_modules/@sudoku/stores/grid.js';
import { candidates } from '../node_modules/@sudoku/stores/candidates.js';

// 回溯历史，仅保存有分支点（有多个候选数的格子）时的状态
const backtrackHistory = writable([]);
const backtrackEnabled = writable(false);

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function saveBacktrackPoint() {
    const $userGrid = get(userGrid);
    const $candidates = get(candidates);
    // 检查当前是否存在有多个候选数的格子
    const hasMultiCandidateCells = Object.values($candidates).some(
        arr => arr && arr.length > 1
    );
    
    if (hasMultiCandidateCells) {
        backtrackHistory.update($history => {
            $history.push({
                grid: deepCopy($userGrid),
                candidates: deepCopy($candidates),
                timestamp: Date.now()
            });
            if ($history.length > 50) $history.shift();
            return $history;
        });
        backtrackEnabled.set(true);
    }
}

function backtrackToLastBranch() {
    console.log('开始执行回溯...');
    if (!get(backtrackEnabled)) {
        console.log('回溯未启用');
        return false;
    }
    const $history = get(backtrackHistory);
    console.log('历史记录数量:', $history.length);
    if ($history.length === 0) {
        console.log('没有历史记录');
        return false;
    }
    // 取最近的分支点
    const state = $history[$history.length - 1];
    console.log('恢复状态:', state);
    
    // 使用 setGrid 方法直接设置整个网格
    console.log('更新前的网格:', get(userGrid));
    userGrid.setGrid(deepCopy(state.grid), true);
    console.log('更新后的网格:', get(userGrid));
    
    // 使用 setCandidates 方法直接设置整个候选数状态
    console.log('更新前的候选数:', get(candidates));
    candidates.setCandidates(deepCopy(state.candidates), true);
    console.log('更新后的候选数:', get(candidates));
    
    // 移除已用的历史点
    backtrackHistory.update($history => $history.slice(0, $history.length - 1));
    if ($history.length <= 1) backtrackEnabled.set(false);
    console.log('回溯完成');
    return true;
}

function initializeBacktrack() {
    backtrackHistory.set([]);
    backtrackEnabled.set(false);
}

// 自动监听 userGrid 和 candidates 变化，保存分支点
userGrid.subscribe(() => saveBacktrackPoint());
candidates.subscribe(() => saveBacktrackPoint());

export const backtrack = {
    initialize: initializeBacktrack,
    saveBacktrackPoint,
    backtrackToLastBranch,
    enabled: backtrackEnabled,
    subscribe: backtrackEnabled.subscribe
};

// 直接导出 enabled store，方便组件订阅
export { backtrackEnabled }; 