<script>
  export let hideModal;
</script>

<div style="display: flex; flex-direction: column; align-items: center; padding: 16px; width: 100%; max-height: 80vh; overflow-y: auto;">
  <button on:click={hideModal} style="margin-bottom: 16px;">关闭</button>
  <img src="/strategy.png" alt="数独解题策略图解" style="width: 100%; height: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
</div> 