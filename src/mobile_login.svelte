
<script>
    import {
        FluidForm,
        TextInput,
        PasswordInput,
        Button,
        ButtonSet,
        Modal,
        ToastNotification
    } from "carbon-components-svelte"; 
    import { InlineNotification } from "carbon-components-svelte";  
    import { firestore } from "./firebase"; 
    import { sessão, representantes } from "./stores";
    import VideoBg from "./video_bg.svelte";
    import { onMount } from 'svelte';

    


    //cadastro
    let nome;
    let telefone;
    let usuario;
    let senha;
    const registrar = async () => {
        let check = await firestore.collection("Representantes").where("usuario", "==", usuario).get();
        if(!check.empty){
            cadastro_error = "Nome de usuário já em uso";
        }
        else{
            cadastro_sucesso = true;
            let ref = firestore.collection("Representantes").doc();
            ref.set({
                id: ref.id,
                nome : nome.trim(), telefone, usuario, senha,
                autorizado : false
            });
            nome = telefone = usuario = senha = "";
        }
    }

    //login
    let login = { usuario: '', senha : '' }
    const logar = async () => {

        let check = $representantes.find(rep => rep.usuario.trim() === login.usuario.trim() && rep.senha.trim() === login.senha.trim() );
        if(!(check===undefined)){
            if(!check.autorizado){
                login_error = "Cadastro ainda não autorizado (2)"
            }
            else sessão.set(check);
        }
        else{
            login_error = "Usuário e senha não encontrados (1)"
        }
    }

    //ui
    let register_modal = false;
    let login_modal = false;
    let login_error = "";
    let cadastro_error = "";
    let cadastro_sucesso = false;


</script>

<VideoBg add="transform: translateX(-50%)"/>

<Modal
  bind:open={register_modal}
  size="lg"
  modalHeading="Registrar"
  primaryButtonText="Confirma"
  secondaryButtonText="Cancela"
  on:click:button--secondary={()=>{login_modal=true; register_modal=false}}
  on:open={()=>{login_modal=false;}}
  on:close
  on:submit={()=>{login_modal=false; register_modal=false; registrar()}}  
  hasForm
>
  <p>Seu cadastro deverá ser confirmado antes de logar</p>
  <FluidForm>
    <TextInput bind:value={nome} labelText="Nome" placeholder="" required />
    <TextInput bind:value={telefone} labelText="Telefone" placeholder="" required />
    <TextInput bind:value={usuario} labelText="Usuário" placeholder="" required />
    <PasswordInput
        bind:value={senha}
        required
        type="password"
        labelText="Senha"   
    />
  </FluidForm>
</Modal>

<Modal
  bind:open = {login_modal}
  size="lg"
  modalHeading="Login"
  primaryButtonText="Logar"
  secondaryButtonText="Registrar"
  on:click:button--secondary={(event)=> {
      register_modal=true;
      login_modal=false;
    }}
  on:open
  on:close
  on:submit={logar}
  hasForm
>
<p>Use seus dados de usuário e senha para acessar</p>
<FluidForm>
    <div>
        <TextInput bind:value={login.usuario} labelText="Usuário" placeholder="" required />
        <PasswordInput
            bind:value={login.senha}
            required
            type="password"
            labelText="Senha"
        />
        {#if login_error.length>0}
            <InlineNotification
                title="Erro:"
                subtitle={login_error}
            />
        {/if}
    </div>
</FluidForm>

</Modal>

<Button style=" left: 50%;
                top: 85vh;
                display: flex;
                transform: translateX(-50%);
                padding-left: 15%;" kind="tertiary" on:click={() => {login_modal=true}}>
    <span style="text-align: center; color: white">Acesso</span>
</Button>


{#if cadastro_sucesso==true}
<ToastNotification
  kind="success"
  title="Cadastro"
  subtitle="Você realizou seu cadastro com sucesso"
  caption="Mas deve esperar aprovação da administração antes de conseguir logar"
/>
{/if}