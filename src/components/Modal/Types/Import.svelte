<script>
    import { importSudokuFromUrl, isValidSudokuUrl } from '../../../services/sudokuImporter.js';
    import { startCustom } from '@sudoku/game';
    import { modal } from '@sudoku/stores/modal';

    export let data = {};
    export let hideModal;

    let url = '';
    let isLoading = false;
    let error = '';
    let success = false;
    let importResult = null;

    async function handleImport() {
        if (!url.trim()) {
            error = '请输入URL';
            return;
        }
        if (!isValidSudokuUrl(url)) {
            error = '请输入有效的Sudoku Wiki URL';
            return;
        }
        isLoading = true;
        error = '';
        success = false;
        importResult = null;
        try {
            console.log('开始导入URL:', url);
            const result = await importSudokuFromUrl(url);
            console.log('导入结果:', result);
            if (result.success) {
                success = true;
                importResult = result;
                error = '';
                console.log('导入成功，sencode:', result.sencode);
            } else {
                error = result.error || '导入失败';
                console.error('导入失败:', result.error);
            }
        } catch (err) {
            error = err.message || '导入出错';
            console.error('导入异常:', err);
        } finally {
            isLoading = false;
        }
    }

    function handleLoadPuzzle() {
        if (importResult && importResult.sencode) {
            console.log('开始加载数独题目:', importResult.sencode);
            try {
                startCustom(importResult.sencode);
                console.log('数独题目加载成功');
                // 确保游戏状态正确恢复
                setTimeout(() => {
                    hideModal();
                }, 100);
            } catch (error) {
                console.error('加载数独题目失败:', error);
                error = '加载题目失败: ' + error.message;
            }
        } else {
            console.error('没有有效的sencode数据');
            error = '没有有效的数独数据';
        }
    }

    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            handleImport();
        }
    }
</script>

<div class="import-modal">
    <h2>导入数独题目</h2>
    <input
        type="url"
        bind:value={url}
        placeholder="https://www.sudokuwiki.org/Daily_Sudoku"
        on:keypress={handleKeyPress}
        disabled={isLoading}
        style="width:100%;padding:8px;margin-bottom:8px;"
    />
    {#if error}
        <div style="color:red;margin-bottom:8px;">{error}</div>
    {/if}
    {#if success && importResult}
        <div style="color:green;margin-bottom:8px;">
            导入成功！标题: {importResult.title}
        </div>
    {/if}
    <div style="display:flex;gap:8px;">
        <button on:click={handleImport} disabled={isLoading}>
            {isLoading ? '导入中...' : '导入'}
        </button>
        {#if success && importResult}
            <button on:click={handleLoadPuzzle}>加载题目</button>
        {/if}
        <button on:click={hideModal}>取消</button>
    </div>
</div>