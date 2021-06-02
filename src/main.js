import App from './index.svelte'
import versao from './versão.js'

console.log(versao);

const app = new App({
  target: document.getElementById('app')
})

export default app
