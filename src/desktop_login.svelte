<script>
    import {
        FluidForm,
        TextInput,
        PasswordInput,
        Button,
        ButtonSet,
        Modal,
        ToastNotification,
        InlineNotification
    } from "carbon-components-svelte"; 
    import { firestore, auth } from "./firebase"; 
    import VideoBg from './video_bg.svelte';
    import { sessãoAdm } from "./stores";
    
    //ui
    let login_modal = false;
    let login_error = "";

    //login
    let login = { usuario: '', senha : '' }
    const logar = async () => {
        auth.signInWithEmailAndPassword(login.usuario + "@central.do.oleo", login.senha)
        .then((userCredential) => {
            // Signed in
            let { email, uid } = userCredential.user;
            sessãoAdm.set({ email, uid });
            // ...
        })
        .catch((error) => {
            login_error = 
                error.code == "auth/user-not-found"      ?  "Usuário não encontrado" :
                error.code == "auth/invalid-email"       ?  "Endereço de email inválido":
                error.code == "auth/wrong-password"      ?  "Senha incorreta": 
                "";
            // ..
        });
        // ------- login antigo com usuário e senha ----------
        // let check = await firestore.collection("users").where("usuario", "==", login.usuario).where("senha", "==", login.senha).get();
        // if(!check.empty){
        //     sessãoAdm.set(check.docs[0].data());
        // }
        // else{
        //     login_error = "Usuário e senha não encontrados (1)"
        // }
    }
</script>

<VideoBg/>

<Modal
  bind:open = {login_modal}
  modalHeading="Login"
  primaryButtonText="Logar"
  secondaryButtonText="Cancelar"
  on:click:button--secondary={(event)=> {
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
