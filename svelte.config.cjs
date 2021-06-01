module.exports = {
    kit: {
      // ...
      vite: {
        // ...
        optimizeDeps: {
          include: ['carbon-components-svelte', 'clipboard-copy']
        }
      }
    }
  };