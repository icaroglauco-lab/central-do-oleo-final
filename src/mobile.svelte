<div id="app_wrapper">

<ContentSwitcher bind:selectedIndex size="xl" style="width: 100vw; height: 4rem;">
    <Switch>
        <div class="wrapper">
            <div class="icon">
                <FaUserAstronaut/>
            </div>
            <span>
                Clientes
            </span>
        </div>
    </Switch>
    <Switch>
        <div class="wrapper">
            <span>
                Serviços
            </span>
            <div class="icon">
                <FaCarSide/>
            </div>
        </div>
    </Switch>
</ContentSwitcher>

<Modal
  bind:open={cliente_modal}
  modalHeading="Cliente registro"
  primaryButtonText="OK!"
  secondaryButtonText="Não, obrigado."
  on:click:button--secondary={() => (cliente_modal = false)}
  on:close
  on:submit={()=>{
      cliente_modal_submit();
      cliente_modal = false;
  }}
  primaryButtonDisabled={cadastro.nome.length==0}
  size="sm"
  hasForm={true}
  preventCloseOnClickOutside={true}
>
    <FluidForm>
        <TextInput bind:value={cadastro.nome} labelText="Nome"/>
        <TextInput bind:value={cadastro.telefone} labelText="Telefone"/>
    </FluidForm>

    <SL>
        <SLH>
            <SLR>
                <SLC head>Carros nesse cadastro</SLC>
            </SLR>
        </SLH>
        <SLB>
            {#each cadastro.carros as carro_list_item}
            <SLR>
                <ClickableTile on:click={()=>{
                    editar_cadastro_carro(carro_list_item);
                    cadastro_modal = true;
                }}>
                    {`${carro_list_item.placa} - ${carro_list_item.modelo}`}
                </ClickableTile>
            </SLR>
            {/each}
        </SLB>
    </SL>

    

    <Button kind="tertiary" 
        on:click={()=>{
            registrar_carro();
            cadastro_modal = true;
        }}
    >
        Novo carro
    </Button>    
    
</Modal>

<Modal
  bind:open={cadastro_modal}
  modalHeading="Registrar carro de cliente"
  primaryButtonText="OK!"
  secondaryButtonText="Não, obrigado."
  on:click:button--secondary={() => (cadastro_modal = false)}
  on:close
  on:submit={()=>{
      if( notValid.length!==0 ) return;
      carro_modal_submit();
      cadastro_modal = false;
      notValid = "";
  }}
  primaryButtonDisabled={notValid.length!==0}
  size="sm"
  hasForm={true}
  preventCloseOnClickOutside={true}
>
    <FluidForm>
        <TextInput bind:value={carro_cadastro.modelo} labelText="Modelo"/>
        <TextInput bind:value={carro_cadastro.placa} labelText="Placa"/>
        {#if notValid.length>0}
            <InlineNotification
                title="Erro:"
                subtitle={notValid}
            />
        {/if}
    </FluidForm>

    {#if (FLAG_carro=="edição")}
    <Button kind="danger" style="align-self: end"
        on:click={()=>{
            
            //remove from local
            temp_carros = temp_carros.filter(car => car.data.id !== carro_cadastro.id);
            cadastro.carros = cadastro.carros.filter( car => car.id !== carro_cadastro.id );

            //remove from firebase
            firestore.collection("Carros").doc(carro_cadastro.id).delete();

            //clean
            cadastro_modal = false;
            notValid = "";
            carro_cadastro_reset();

            //todo - remove from firebase
        }}
    >
        Remover do cadastro
    </Button>
    {/if}
</Modal>

{#if selectedIndex === 0}
    <div class="content">

        <Tile>
            <h4>Sua lista de clientes</h4>
        </Tile>
        <DataTable
            headers={[
                {key: "nome", value : "Nome"},
                {key: "telefone", value : "Telefone"},
                {key: "n_carros", value : "Qnt. de carros"},]}
            rows={filtered_list}
            expandable
        >
            <Toolbar>
                <ToolbarSearch bind:value={cliente_query} />
            </Toolbar>
            <div slot="expanded-row" let:row>
                <Button kind="tertiary" 
                    on:click={()=>{
                        let {nome, representante, telefone, carros, id} = row;
                        editar_cadastro({nome, representante, telefone, carros, id});
                        // cadastro = {...cadastro, ...row};
                        cliente_modal = true;
                    }}
                >
                    Editar
                </Button>

                <Button kind="danger" 
                    on:click={()=>{
                        let {nome, representante, telefone, carros, id} = row;
                        remover_cliente({nome, representante, telefone, carros, id});
                    }}
                >
                    Remover
                </Button>
                
            </div>
        </DataTable>

        <Button kind="tertiary" 
            style=" position: fixed;
                    bottom: 0.5rem;
                    left: 50%;
                    height: 62px;
                    width: 150px;
                    transform: translateX(-50%);" 
                    icon={FaUserPlus}
            on:click={()=>{
                novo_cadastro();
                cliente_modal = true;
            }}            
        >
        </Button>
    </div>
{/if}   

{#if selectedIndex==1}

    <div class="content">
        <Tile>
            <h5>Sua lista de serviços realizados a seus clientes</h5>
        </Tile>

        {#each $sessão_clientes as cliente} 
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
        {/each}
    </div>

{/if}

</div>

<style>
    .content{
        display: flex;
        height: 100vh;
        width: 100vw;
        flex-direction: column;
        background-color: white;
    }

    .wrapper{
        display: flex;
        margin-right: 0.5rem;
        align-items: center;
    }
    .icon{
        height: 60px;
    }
    .icon svg {
        height: 100%;
    }
    .wrapper span{
        margin-left: 15px;
    }
    
    :global(.bx--content-switcher-btn){
        border-radius: 0px !important;
    }
    
    #app_wrapper{
        height: 100vh;
        display: grid;
        grid-template-areas: none;
        grid-template-columns: 100%;
    }
</style>

<script>
    import { ContentSwitcher, Switch, InlineNotification } from "carbon-components-svelte";
    import FaUserAstronaut from 'svelte-icons/fa/FaUserAstronaut.svelte';
    import FaCarSide from 'svelte-icons/fa/FaCarSide.svelte'
    import { Tile, DataTable, Toolbar, ToolbarBatchActions, Button, ToolbarSearch, Modal, ClickableTile , FluidForm, TextInput, Accordion, AccordionItem } from "carbon-components-svelte";
    import { representantes,  historico, servicos, clientes, carros, sessão, sessão_clientes } from "./stores";
    import FaUserPlus from 'svelte-icons/fa/FaUserPlus.svelte'
    import { firestore } from "./firebase";
    import {
      StructuredList as SL,
      StructuredListHead as SLH,
      StructuredListRow as SLR,
      StructuredListCell as SLC,
      StructuredListBody as SLB,
    } from "carbon-components-svelte";
    import {onMount} from 'svelte';

    
    

    //variáveis de controle
    let selectedIndex = 0;
    let selectedRowIds = [];
    let cliente_query = "";
    let cliente_ref;
    let carro_ref;
    let FLAG_cliente;
    let FLAG_carro;

    //cadastro de cliente
     let cadastro = {
        nome : "",
        telefone: "",
        carros : []
        //representante, id, gerados!
    }
    let temp_carros = []; //variavel de cadastro de carros
                          //temporariamente enquanto não confirma cliente

    //cadastro de carros
    let carro_cadastro = {
        modelo : "",
        placa: "",
        //id e dono, gerados!
    }

    //ui
    let cliente_modal = false;
    let cadastro_modal= false;
    let notValid = "";
    $: if(carro_cadastro.placa.trim().toLowerCase().match(/[A-Z]{3}[0-9][0-9A-Z][0-9]{2}/)){
        let carro_ = $carros.find( car => car.placa === carro_cadastro.placa && car.id !== (carro_cadastro.id || null)) //procura um carro na lista de carros, que ja tenha a placa do carro em cadastro
        if(carro_ || temp_carros.find(e => e.data.placa === carro_cadastro.placa  && e.data.id !== (carro_cadastro.id || null))){
            notValid = "Placa já existente";
        }
        else notValid = "";
    }
    else notValid = "Placa inválida"



    //Cliente
    const novo_cadastro = () => { //função é de abrir um escopo seguro de erros para separar edição de cadastro e criação de um
        cliente_ref = firestore.collection("Clientes").doc();
        cadastro = {
            nome : "",
            telefone: "",
            carros : []
            //representante, id, gerados!
        }
        temp_carros = [];
        FLAG_cliente = "novo"
    }

    const editar_cadastro = (cliente_data) => { //função para edição, deve-se passar os dados integrais do cliente
        cadastro = {
            ...cliente_data
        }
        cliente_ref = firestore.collection("Clientes").doc(cliente_data.id);
        FLAG_cliente = "edição"
    }

    //função de submit do modal de cliente 
    const cliente_modal_submit = () => {
        temp_carros.forEach(carr => {
            carr.ref.set(carr.data);
        });
        temp_carros = [];
        if(FLAG_cliente === "novo") registrar_cliente();
        if(FLAG_cliente === "edição") realizar_edição_cliente();
    }

    //função de cadastro de cliente
    const registrar_cliente = () => { //apenas chuta pro gol do cadastro
        let cliente_data = {
            id : cliente_ref.id,
            representante : $sessão.id,
            ...cadastro
        };

        if(cliente_data.hasOwnProperty("carros")) cliente_data = {...cliente_data, carros: cliente_data.carros.map(car => car.id)};
        cliente_ref.set(cliente_data);

        let clientes_ = $sessão.clientes || [];

        firestore.collection("Representantes").doc($sessão.id).update({
            clientes : [...clientes_, cliente_data.id]
        });
        sessão.update( prev => {
            return {...prev, clientes : [...(prev.clientes||[]), cliente_data.id]}
        });


        cadastro = { //reset
            nome : "",
            telefone: "",
            carros : []
        }
    }
    //função de chutar pro gol da edição de cadastro
    const realizar_edição_cliente = () => {
        cliente_ref.update({
            ...cadastro,
            carros : cadastro.carros.map( car => car.id )
        });
        //campos mantenhem-se os mesmos
    }
    

    //remover cliente
    const remover_cliente = (cliente) => {
        
        //carros prep
        let carros_ = $carros.filter(car => cliente.carros.map(c=> c? c.id : null).includes(car.id) );
        
        let filtered = $sessão.clientes.filter(cli => cli !== cliente.id);
        firestore.collection("Representantes").doc($sessão.id).update({
            clientes : filtered
        })
        firestore.collection("Clientes").doc(cliente.id).delete();

        carros_.forEach(car => firestore.collection("Carros").doc(car.id).delete());    
    }

    //Carro
    const carro_modal_submit = () => {
        if(FLAG_carro === "novo") realizar_cadastro_carro();
        if(FLAG_carro === "edição") realizar_edição_carro();
    }

    //função de cadastro de carro
    const registrar_carro = () => { //apenas prepara o scopo
        carro_ref = firestore.collection("Carros").doc();
        carro_cadastro_reset();
        FLAG_carro = "novo"
    }

    const realizar_cadastro_carro = () => {
        let { modelo, placa } = carro_cadastro;
	    let aux = {
            id : carro_ref.id,
            dono : cliente_ref.id,
            modelo, placa
        }
        
        temp_carros = [...temp_carros, { ref: carro_ref, data : aux}]
        carro_cadastro_reset();

        //local changes
        cadastro.carros = [...cadastro.carros, {...aux}];

    }

    const carro_cadastro_reset = () => {
        carro_cadastro = { //reset
            modelo : "",
            placa: "",
        }
    }
    
    const editar_cadastro_carro = (carro_data) => {
        carro_ref = firestore.collection("Carros").doc(carro_data.id);
        carro_cadastro = { //passing
            ...carro_data
        }
        FLAG_carro = "edição"
    }
    
    const realizar_edição_carro = () => {
        let { dono, id, modelo, placa } = carro_cadastro;
        carro_ref.update({ dono, id, modelo, placa });

        //local changes
        let index = cadastro.carros.findIndex(car => car.id === carro_ref.id);
        let auxf = cadastro.carros[index];
        auxf = {...auxf, modelo, placa };
        cadastro.carros[index] = {...auxf};
    }
    



    //lista de clientes em observação a mudança de dados
    $: fullList = $sessão_clientes.map(cliente => {
        cliente.n_carros = cliente.carros.length;
        return cliente;
    });
    $: filtered_list = fullList.filter( cliente => cliente.nome.includes(cliente_query) ||cliente.telefone.includes(cliente_query) || `carros ${cliente.n_carros}`.includes(cliente_query)  );

    //onesignal

    onMount(()=>{
        let {OneSignal} = window;

        

        OneSignal.push(["init", {
            appId: "686430d5-b7be-47a4-a6a1-ec8c8ddaba33",
            // Your other init settings
        }]);

        function setUserIdFirestore (){
            
            OneSignal.push(()=>{
                OneSignal.getUserId(function(userId) {
                    
                    let notification_devices = $sessão.notification_devices || [];
                    if(!notification_devices.includes(userId) && userId!==null) notification_devices.push(userId);
                    firestore.collection("Representantes").doc($sessão.id).set({...$sessão, notification_devices})
                });
            })
        }

        setUserIdFirestore();
        OneSignal.push(()=>{
            OneSignal.on('subscriptionChange', function (isSubscribed) {
                
                if(isSubscribed){
                    setUserIdFirestore();
                }
            });
        })
    })
    
        


</script>
