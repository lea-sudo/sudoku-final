import share from './Share.svelte';
import qrcode from './QRCode.svelte';
import settings from './Settings.svelte';
import confirm from './Confirm.svelte';
import prompt from './Prompt.svelte';
import welcome from './Welcome.svelte';
import gameover from './GameOver.svelte';
import importModal from './Import.svelte';
import strategyIntro from './StrategyIntro.svelte';

export default {
	share,
	qrcode,
	settings,
	confirm,
	prompt,
	welcome,
	gameover,
	import: importModal,
	strategyIntro
}