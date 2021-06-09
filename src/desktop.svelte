<div id="app_wrapper">
  
<RegistrationInput></RegistrationInput>


<div class="representantes">
  <List class="elevation-2" style="
                                width:300px; 
                                height: 100vh;
                                padding: 0;">
    <ListItem on:click={() => actived_representante_view = ""}>
      {#if actived_representante_view === ""}
        <h5 style="height:35px">Representantes:</h5>
      {:else}
      <h5 style="height:35px">Início:</h5>
      {/if}
    </ListItem>
    <Divider/>
    {#each $representantes.filter(re => re.autorizado) as representante}
      <ListItem active={representante.id==actived_representante_view} on:click={() => actived_representante_view = representante.id}>
        <span>{representante.nome}</span>
      </ListItem>
    {/each}
  </List>
</div>


<div class="content_wrapper" >

  {#if actived_representante_view === ""}

  {#if $representantes.filter(rep => rep.autorizado ==false).length >0}
    <div class="representantes_em_aberto" transition:fade>
      <h4>Cadastro de representantes em espera</h4>
      <DataTable 
        batchSelection bind:selectedRowIds={emEsperaSelecionados}
        headers={[{key: "nome", value: "Nome"},
                  {key: "telefone", value: "Telefone"}
                  ]}
        rows={$representantes.filter(rep => rep.autorizado ==false)} 
        >
        <Toolbar>
          <ToolbarBatchActions formatTotalSelected={(totalSelected) => `${totalSelected} cadastros${totalSelected === 1 ? "" : "s"} selecionados`}>
            <Button on:click={cadastrosEmEspera.confirma}>Confirmar cadastro</Button>
            <Button on:click={cadastrosEmEspera.remove}>Remover cadastro</Button>
          </ToolbarBatchActions>
        </Toolbar>
      </DataTable>
    </div>
  {/if}

  {#if  $servicos.filter(ser => !ser.feito).length>0}
    <div class="serviços" transition:fade>
      <h3>
        Serviços em aberto
      </h3>
      <DataTable 
        batchSelection bind:selectedRowIds
        headers={[{key: "entrada", value: "Data entrada"},
                  {key: "valor", value: "Valor (R$)"}, 
                  {key: "saida", value: "Data saída"},
                  {key: "carro.placa", value: "Veículo - Placa"},
                  {key: "carro.modelo", value: "Veículo - Modelo"},
                  ]}
        rows={$servicos.filter(ser => !ser.feito).map(ser => {
            let find = $carros.find(car => car.id === ser.carro);
            if(find) ser.carro = {...find};
            return ser
          })} 
        >
        <Toolbar>
          <ToolbarBatchActions formatTotalSelected={(totalSelected) => `${totalSelected} serviço${totalSelected === 1 ? "" : "s"} selecionados`}>
            <Button on:click={confirmarSaida}>Confirmar saida</Button>
            <Button on:click={removerSaida}>Remover registro</Button>
          </ToolbarBatchActions>
        </Toolbar>
      </DataTable>
    </div>
  {/if}
  
  {#if  $historico.length>0}
  <div class="histórico" transition:fade>
    <h3>
      Histórico completo
    </h3>
    <DataTable 
      headers={[
          {key:"entrada", value: "Entrada"},
          {key: "saida", value: "Data saída"}, 
          {key:"placa", value: "Placa"},
          {key:"modelo", value: "Modelo"},
          {key:"representante_nome", value: "Representante"},
          {key:"valor", value: "Valor(R$)"},
          ]}
      rows={$historico}
      ></DataTable>
  </div>
  {/if}
  {/if}


  
  {#each $representantes as representante}
  {#if actived_representante_view === representante.id}
  <div class="representante_view" style="min-height: 80vh;" transition:fade>
    <h4>{representante.nome}</h4>
    <br/>
    {#if Array.isArray(representante.clientes)}
      <h5>Clientes</h5>
      {#each representante.clientes as cliente} 
      {#if cliente!==null}
        <Accordion>
          <AccordionItem title={`${cliente.nome}, (${cliente.carros.length}) carros com (${cliente.carros.reduce((a, b) => a+ b.servicos.length , 0)}) serviços`}>
            <DataTable 
              headers={[
                  {key:"modelo", value: "Modelo"},
                  {key:"placa", value: "Placa"},
                  ]}
              rows={cliente.carros}
              expandable
              >
              <div slot="expanded-row" let:row>
                <DataTable 
                  headers={[
                      {key:"entrada", value: "Entrada"},
                      {key:"saida", value: "Saída"},
                      {key:"valor", value: "Valor"}
                      ]}
                  rows={row.servicos}
                ></DataTable>
              </div>
            </DataTable>
          </AccordionItem>
        </Accordion>
      {/if}
      {/each}
    {/if}

    <div style="align-self: end;">
      <h6 style="color: red"> Área de risco (ações não podem ser desfeitas)</h6>
      <Button kind="danger" on:click={() => {
          deleteModal.target = representante
          deleteModal.open=true;
        }}>
        Deletar representante e os dados associados
      </Button>
    </div>

    {#if deleteModal.target!=null}
      <Modal
        size="xs"
        bind:open = {deleteModal.open}
        modalHeading="Deletar representante"
        primaryButtonText="Confirmar"
        secondaryButtonText="Cancelar"
        on:click:button--secondary={()=> deleteModal.open = false}
        on:open
        on:close
        on:submit={deleteModalSubmit}
      >
        <p>Deseja deletar {deleteModal.target.nome}</p>
      </Modal>
    {/if}

  </div>
  {/if}
  
  {/each}
</div>


</div>

<script>
  import "carbon-components-svelte/css/all.css";
  import { List, ListItem, Divider,  } from 'svelte-materialify';
  import { historico, servicos, carros, clientes, representantes } from "./stores";
  import { DataTable, Accordion, AccordionItem, Button, ToolbarBatchActions, Toolbar, Modal } from "carbon-components-svelte";

  import RegistrationInput from './registration.svelte';

  import { fade } from "svelte/transition";
  import { firestore } from "./firebase";
  
  //variáveis de controle
  // serviços opções selecionadas 
  let selectedRowIds = [];

  //cadastros em espera
  let emEsperaSelecionados = [];

  const cadastrosEmEspera = {
    confirma : () => {
      emEsperaSelecionados.forEach( repId => {
        firestore.collection("Representantes").doc(repId).update({autorizado: true})
      });
      emEsperaSelecionados = []
    },
    remove: () => {
      emEsperaSelecionados.forEach( repId => {
        firestore.collection("Representantes").doc(repId).delete();
      });
      emEsperaSelecionados = []
    }
  }

  //controle de visualização de renderização de representante
  let actived_representante_view = "";  


  //funções
  //saida de serviços
  const confirmarSaida = () => {
    [...$servicos.filter(ser => selectedRowIds.includes(ser.id))
    .map(shipping => {
      shipping.carro = shipping.carro.id;
      shipping.servico = shipping.id;
      delete shipping.entrada;
      delete shipping.valor;
      delete shipping.feito;
      return shipping;
    })].forEach(shippingHistory => {
      let ref = firestore.collection("Histories").doc();
      ref.set({
        ...shippingHistory,
        id : ref.id
      });

      firestore.collection("Services").doc(shippingHistory.id).update({ feito : true });
    });
    selectedRowIds = [];
  }

  //remoção de serviços
  const removerSaida = () => {
    selectedRowIds.forEach(shippingServiceID => firestore.collection("Services").doc(shippingServiceID).delete());
    selectedRowIds = []
  }

  //remoção de representantes
  let deleteModal = { 
    target : null,
    open : false
  }

  const deleteModalSubmit = async ()=>{
    let repRef = firestore.collection("Representantes").doc(deleteModal.target.id);
    
    //clientes prep
    let clientes_ = $clientes.filter( cli => cli.representante == deleteModal.target.id);

    //carros prep
    let carros_ = $carros.filter(car => clientes_.map(cli => cli.carros).join().includes(car.id) )


    carros_.forEach(car => firestore.collection("Carros").doc(car.id).delete());
    clientes_.forEach(cli => firestore.collection("Clientes").doc(cli.id).delete());
    repRef.delete();

    deleteModal.open = false;
    deleteModal.target = null;
  }
  
</script>

<style lang="scss">
  #app_wrapper{
    display: grid;
    grid-template-areas: 
      'p p'
      'r c'
      'r c'
      'r c'
    ;
    grid-template-columns: 300px auto;
    
  }
  :global(.barra_pesquisa){
    grid-area: p;
    position: fixed;
    width: 100vw;
    z-index: 999;
  }
  .representantes{
    grid-area: r;
    margin-top: 3rem;
  }
  .content_wrapper{
    grid-area: c;
    margin-top: 4rem;
  }

  .content_wrapper{
    padding: 2rem;
    display: grid;
    grid-gap: 35px;
  }

  .representante_view{
    display: grid;
    grid-gap: 15px;    
    grid-template-rows: 3rem 10px 3rem;
  }
  

</style>