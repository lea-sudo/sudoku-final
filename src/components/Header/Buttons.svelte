<script>
	import { modal } from '@sudoku/stores/modal';
	import { pauseGame, resumeGame } from '@sudoku/game';

	function handleShareButton() {
		pauseGame();
		modal.show('share', { onHide: resumeGame });
	}

	function handleSettingsButton() {
		pauseGame();
		modal.show('settings', { onHide: resumeGame });
	}

	function handleImportButton() {
		pauseGame();
		modal.show('import', { onHide: resumeGame });
	}

	function handleStrategyIntroButton() {
		pauseGame();
		modal.show('strategyIntro', { onHide: resumeGame });
	}




</script>

<div class="flex justify-evenly space-x-3">

	<button class="btn btn-header" title="Import Sudoku from URL" on:click={handleImportButton}>
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
		</svg>
	</button>

	<button class="btn btn-header" title="Share this Sudoku puzzle" on:click={handleShareButton}>
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
		</svg>
	</button>

	<button class="btn btn-header" title="解题策略介绍" on:click={handleStrategyIntroButton}>
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" />
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16h.01M12 12a2 2 0 10-2-2 2 2 0 012 2zm0 0v2" />
		</svg>
	</button>

	<button class="btn btn-header" title="Open Settings" on:click={handleSettingsButton}>
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		</svg>
	</button>

</div>

<style>
	.btn-header {
		@apply bg-white bg-opacity-0 transition-opacity p-3;
	}

	.btn-header:hover {
		@apply bg-opacity-25;
	}

	.btn-header:active {
		@apply bg-opacity-50;
	}

	.btn-header:focus {
		@apply shadow-outline-inverse;
	}
</style>