<Modal
  bind:open
  modalHeading="Registrar serviço"
  primaryButtonText="OK!"
  secondaryButtonText="Não, obrigado."
  on:click:button--secondary={() => (open = false)}
  on:open
  on:close
  on:submit={registrar}
  primaryButtonDisabled={value.length==0}
  size="sm"
  hasForm={true}
  preventCloseOnClickOutside={true}
>
    <p>Criar um registro de serviço ou agendar serviço para realização</p>

    <SL>
      <SLH>
        <SLR head>
          <SLC head>Cliente</SLC>
          <SLC head>Carro</SLC>
          <SLC head>Representante</SLC>
        </SLR>
      </SLH>
      <SLB>
        <SLR>
          <SLC>
            {cliente.nome}
          </SLC>
          <SLC>
            {`${carro.placa}, ${carro.modelo}`}
          </SLC>
          <SLC>
            {representante.nome}
          </SLC>
        </SLR>
      </SLB>
    </SL>

    <FluidForm>
    <TextInput bind:value={value} labelText="Valor (R$)" placeholder="00,00" on:change={(ev) => { value = formatter.format(parseInt(value)/100)}}/>
      <div class="checkbox_group">
        <DatePicker bind:value={data} locale="pt" datePickerType="single" dateFormat="d/m/Y">
          <DatePickerInput placeholder="dia/mês/ano"/>
        </DatePicker>
        <Checkbox bind:checked={feito} labelText="Já realizado (para saída)"  />
      </div>
    </FluidForm>
    
</Modal>


<div class="barra_pesquisa">
  <Search 
          bind:value={placa}
          placeholder="Placa de carro formato 'AAA0A00'" 
          on:keydown={(e) => {
            if(e.key==="Enter"){
                e.preventDefault();
                if(placa.match(/[A-Z]{3}[0-9][0-9A-Z][0-9]{2}/)){
                    let carro_ = $carros.find( car => car.placa === placa)
                    if(carro_){
                        carro = carro_;
                        open = true;
                    }
                    else notValid = "Placa não encontrada";
                }
                else notValid = "Placa inválida"
            }
            }}/>
</div>



{#if notValid!==""}
  <ToastNotification
    title="Erro"
    subtitle={notValid}
    on:close={(event)=>{notValid=""}}
  />
{/if}

<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
</svelte:head>

<style>
  .checkbox_group{
    display: flex;
  }
</style>

<script>

    import { Modal, Checkbox, Search, ToastNotification, FluidForm, TextInput, DatePickerInput, DatePicker } from "carbon-components-svelte"; 
    import {
      StructuredList as SL,
      StructuredListHead as SLH,
      StructuredListRow as SLR,
      StructuredListCell as SLC,
      StructuredListBody as SLB,
    } from "carbon-components-svelte";
    import { carros, clientes, representantes } from "./stores";
    import 'flatpickr/dist/l10n/pt.js'
    import { firestore } from './firebase';

    //campos para registro
    let value="";
    let feito = false;
    let data = "";
    
    //visualização
    let carro = {dono: null};
    $: cliente = $clientes.find(cliente => carro.dono === cliente.id) || {nome: null};
    $: representante = $representantes.find(rep => cliente.representante === rep.id) || {nome: null};
    
    //ui
    let placa = "";
    let open;
    let notValid = ""; 

    //registro
    const registrar  = () =>{
      console.log(value, feito, data);
      //DATA
      let d = data.length>0? data : new Date().toLocaleDateString();
      //firestore add registro
      //let carro, entrada, feito, id, representante, saida, valor
      let [carro$, entrada$, feito$, ref$, representante$, saida$, valor$] = [
        carro.id,
        feito? d : new Date().toLocaleDateString(),
        feito,
        firestore.collection("Services").doc(),
        representante.id,
        d,
        value
      ];

      ref$.set({
        carro: carro$, entrada: entrada$, feito: feito$, id: ref$.id, representante: representante$, saida: saida$, valor: valor$
      })

      //joga para o histórico caso esteja marcado como feito
      if(feito){
        let historyref = firestore.collection("Histories").doc();
        historyref.set({
          carro: carro.id,
          id: historyref.id,
          representante: representante.id,
          saida: saida$,
          servico: ref$.id
        })
      }

      //cleaning
      value="";
      feito = false;
      data = "";
    }
    
    //formatter
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

</script>