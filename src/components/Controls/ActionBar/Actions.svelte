<script>
	import { candidates } from '@sudoku/stores/candidates';
	import { userGrid } from '@sudoku/stores/grid';
	import { cursor } from '@sudoku/stores/cursor';
	import { hints } from '@sudoku/stores/hints';
	import { notes } from '@sudoku/stores/notes';
	import { settings } from '@sudoku/stores/settings';
	import { keyboardDisabled } from '@sudoku/stores/keyboard';
	import { gamePaused } from '@sudoku/stores/game';
	import { canUndo, canRedo } from '@sudoku/stores/history';
	import { undoAction, redoAction } from '@sudoku/undoRedo';
	import { solveSudokuWithStrategies } from '../../../strategies/index.js';
	import { backtrack } from '../../../stores/backtrack.js';
	import { backtrackEnabled } from '../../../stores/backtrack.js';

	$: hintsAvailable = $hints > 0;

	// 策略选项
	const strategies = [
		{ key: 'all', name: 'All Strategies', description: '使用所有策略组合' },
		{ key: 'PossibleNumber', name: 'Possible Number', description: '基础候选数字策略' },
		{ key: 'NakedPairs', name: 'Naked Pairs', description: '裸对策略' },
		{ key: 'HiddenPairs', name: 'Hidden Pairs', description: '隐藏对策略' },
		{ key: 'Xwing', name: 'X-Wing', description: 'X-wing策略' }
	];

	let selectedStrategy = 'all';
	let showStrategyMenu = false;

	function handleHint() {
		if (hintsAvailable) {
			if ($candidates.hasOwnProperty($cursor.x + ',' + $cursor.y)) {
				candidates.clear($cursor);
			}

			userGrid.applyHint($cursor);
		}
	}

	function handleSmartHint() {
		// 智能提示显示候选数字，不消耗提示次数
		if ($candidates.hasOwnProperty($cursor.x + ',' + $cursor.y)) {
			candidates.clear($cursor);
		}

		const result = userGrid.applySmartHint($cursor);
		if (result.candidates && result.candidates.length > 0) {
			// 使用add方法逐个添加候选数字
			result.candidates.forEach(candidate => {
				candidates.add($cursor, candidate, true); // skipHistory = true
			});
			console.log('策略分析结果:', result);
		}
	}

	async function handleStrategyAnalysis() {
		// 使用选定的策略进行分析
		if ($candidates.hasOwnProperty($cursor.x + ',' + $cursor.y)) {
			candidates.clear($cursor);
		}

		const currentGrid = $userGrid;
		
		if (selectedStrategy === 'all') {
			// 使用所有策略组合
			const [possibleGrid, referenceGrid, strategyGrid] = solveSudokuWithStrategies(currentGrid);
			const cellCandidates = referenceGrid[$cursor.y][$cursor.x];
			
			if (cellCandidates && cellCandidates.length > 0) {
				// 将二维数组转换为一维数组，并去重
				const flatCandidates = [...new Set(cellCandidates.flat())];
				
				// 使用add方法逐个添加候选数字
				flatCandidates.forEach(candidate => {
					if (candidate > 0) { // 只添加有效的候选数字
						candidates.add($cursor, candidate, true); // skipHistory = true
					}
				});
				console.log('策略分析结果:', {
					originalCandidates: cellCandidates,
					flatCandidates: flatCandidates,
					strategies: strategyGrid[$cursor.y][$cursor.x],
					cursor: $cursor,
					posKey: $cursor.x + ',' + $cursor.y
				});
				console.log('当前candidates store:', $candidates);
			}
		} else {
			// 使用单个策略
			console.log('开始执行单个策略分析，选择的策略:', selectedStrategy);
			try {
				// 导入策略注册器和策略类
				console.log('正在导入策略模块...');
				const { strategyRegistry, PossibleNumberStrategy, NakedPairsStrategy, HiddenPairsStrategy, XwingStrategy } = await import('../../../strategies/index.js');
				console.log('策略模块导入成功');
				
				// 根据选择的策略获取对应的策略类
				console.log('正在选择策略类...');
				let StrategyClass;
				switch (selectedStrategy) {
					case 'PossibleNumber':
						StrategyClass = PossibleNumberStrategy;
						break;
					case 'NakedPairs':
						StrategyClass = NakedPairsStrategy;
						break;
					case 'HiddenPairs':
						StrategyClass = HiddenPairsStrategy;
						break;
					case 'Xwing':
						StrategyClass = XwingStrategy;
						break;
					default:
						console.error('未知策略:', selectedStrategy);
						return;
				}
				console.log('策略类选择完成:', StrategyClass);
				
				// 创建策略实例
				console.log('正在创建策略实例...');
				let strategy;
				try {
					strategy = new StrategyClass();
					console.log('策略实例创建成功:', strategy);
				} catch (error) {
					console.error('策略实例创建失败:', error);
					return;
				}
				
				// 执行策略分析
				console.log('开始执行策略分析...');
				let [possibleGrid, referenceGrid, strategyName] = [];
				
				try {
					if (selectedStrategy === 'PossibleNumber') {
						// PossibleNumber策略不需要输入网格
						console.log('执行PossibleNumber策略...');
						[possibleGrid, referenceGrid, strategyName] = strategy.execute();
					} else {
						// 其他策略需要先获取可能的数字网格
						console.log('执行其他策略，先获取初始网格...');
						const possibleStrategy = new PossibleNumberStrategy();
						console.log('PossibleNumberStrategy实例创建成功');
						const [initialPossibleGrid] = possibleStrategy.execute();
						console.log('初始网格获取完成:', initialPossibleGrid);
						console.log('执行选定策略...');
						[possibleGrid, referenceGrid, strategyName] = strategy.execute(initialPossibleGrid);
									}
				console.log('策略分析执行完成');
				console.log('策略执行结果:', { possibleGrid, referenceGrid, strategyName });
			} catch (error) {
				console.error('策略执行失败:', error);
				return;
			}
			
						// 获取当前单元格的候选数字
			console.log('开始处理候选数字...');
			console.log('当前光标位置:', $cursor);
			console.log('参考网格:', referenceGrid);
			const cellCandidates = referenceGrid[$cursor.y][$cursor.x];
			console.log('当前单元格候选数字:', cellCandidates);
			
			if (selectedStrategy === 'PossibleNumber') {
				// PossibleNumber策略直接提供候选数字
				if (cellCandidates && cellCandidates.length > 0) {
					// 将二维数组转换为一维数组，并去重
					const flatCandidates = [...new Set(cellCandidates.flat())];
					
					// 使用add方法逐个添加候选数字
					flatCandidates.forEach(candidate => {
						if (candidate > 0) { // 只添加有效的候选数字
							candidates.add($cursor, candidate, true); // skipHistory = true
						}
					});
					
					console.log('PossibleNumber策略分析结果:', {
						strategy: selectedStrategy,
						strategyName: strategyName,
						originalCandidates: cellCandidates,
						flatCandidates: flatCandidates,
						cursor: $cursor,
						posKey: $cursor.x + ',' + $cursor.y
					});
					console.log('当前candidates store:', $candidates);
				}
			} else {
				// 其他策略显示影响位置
				if (cellCandidates && cellCandidates.length > 0) {
					console.log('高级策略分析结果:', {
						strategy: selectedStrategy,
						strategyName: strategyName,
						influencePositions: cellCandidates,
						cursor: $cursor,
						posKey: $cursor.x + ',' + $cursor.y
					});
					
					// 显示影响位置的信息
					console.log(`${selectedStrategy}策略发现的影响位置:`, cellCandidates);
					
					// 可以选择高亮显示这些影响位置，或者显示策略信息
					// 这里暂时只显示控制台信息
				} else {
					console.log(`${selectedStrategy}策略在当前位置没有发现可应用的规则`);
				}
			}
			} catch (error) {
				console.error('策略分析失败:', error);
				console.error('错误详情:', error.message);
			}
		}
	}

	function handleUndo() {
		undoAction();
	}

	function handleRedo() {
		redoAction();
	}

	function toggleStrategyMenu() {
		showStrategyMenu = !showStrategyMenu;
	}

	function selectStrategy(strategy) {
		selectedStrategy = strategy;
		showStrategyMenu = false;
	}

	function handleBacktrack() {
		console.log('回溯按钮被点击');
		const result = backtrack.backtrackToLastBranch();
		console.log('回溯结果:', result);
	}
</script>

<div class="action-buttons space-x-3">

	<button class="btn btn-round" 
	        disabled={$gamePaused || !$canUndo} 
	        on:click={handleUndo}
	        title="Undo">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
		</svg>
	</button>

	<button class="btn btn-round" 
	        disabled={$gamePaused || !$canRedo} 
	        on:click={handleRedo}
	        title="Redo">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 90 00-8 8v2M21 10l-6 6m6-6l-6-6" />
		</svg>
	</button>

	<button class="btn btn-round btn-badge" disabled={$keyboardDisabled || !hintsAvailable || $userGrid[$cursor.y][$cursor.x] !== 0} on:click={handleHint} title="Hints ({$hints})">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
		</svg>

		{#if $settings.hintsLimited}
			<span class="badge" class:badge-primary={hintsAvailable}>{$hints}</span>
		{/if}
	</button>

	<div class="relative">
		<button class="btn btn-round" disabled={$keyboardDisabled || $userGrid[$cursor.y][$cursor.x] !== 0} on:click={handleStrategyAnalysis} title="Strategy Analysis">
			<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 18v1a3 3 0 006 0v-1" />
				<rect x="4" y="8" width="16" height="8" rx="4" stroke-width="2" stroke="currentColor" fill="none"/>
				<circle cx="8" cy="12" r="1" fill="currentColor" />
				<circle cx="16" cy="12" r="1" fill="currentColor" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v2" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6l2 2" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6l-2 2" />
			</svg>
		</button>

		<button class="btn btn-round ml-1" on:click={toggleStrategyMenu} title="Select Strategy">
			<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		{#if showStrategyMenu}
			<div class="strategy-menu">
				{#each strategies as strategy}
					<button class="strategy-option" 
					        class:active={selectedStrategy === strategy.key}
					        on:click={() => selectStrategy(strategy.key)}>
						<div class="strategy-name">{strategy.name}</div>
						<div class="strategy-description">{strategy.description}</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<button class="btn btn-round btn-badge" on:click={notes.toggle} title="Notes ({$notes ? 'ON' : 'OFF'})">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
		</svg>

		<span class="badge tracking-tighter" class:badge-primary={$notes}>{$notes ? 'ON' : 'OFF'}</span>
	</button>

	<button class="btn btn-round" 
	        disabled={!$backtrackEnabled}
	        on:click={handleBacktrack}
	        title="回溯到上一个分支点">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V6m0 0l-7 7m7-7l7 7" />
		</svg>
	</button>

</div>


<style>
	.action-buttons {
		@apply flex flex-wrap justify-evenly self-end;
	}

	.btn-badge {
		@apply relative;
	}

	.badge {
		min-height: 20px;
		min-width:  20px;
		@apply p-1 rounded-full leading-none text-center text-xs text-white bg-gray-600 inline-block absolute top-0 left-0;
	}

	.badge-primary {
		@apply bg-primary;
	}

	.strategy-menu {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 0.25rem;
		background-color: white;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
		z-index: 50;
		min-width: 12rem;
	}

	.strategy-option {
		width: 100%;
		padding: 0.75rem 1rem;
		text-align: left;
		border-bottom: 1px solid #e5e7eb;
	}

	.strategy-option:hover {
		background-color: #f3f4f6;
	}

	.strategy-option:last-child {
		border-bottom: none;
	}

	.strategy-option.active {
		background-color: #dbeafe;
		color: #1e40af;
	}

	.strategy-name {
		font-weight: 500;
		font-size: 0.875rem;
	}

	.strategy-description {
		font-size: 0.75rem;
		color: #4b5563;
		margin-top: 0.25rem;
	}
</style>