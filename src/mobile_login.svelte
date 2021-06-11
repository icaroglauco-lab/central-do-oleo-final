
<script>
    import {
        FluidForm,
        TextInput,
        PasswordInput,
        Button,
        Modal,
        ToastNotification
    } from "carbon-components-svelte"; 
    import { InlineNotification } from "carbon-components-svelte";  
import { docData } from "rxfire/firestore";
    import { firestore, auth } from "./firebase"; 
    import { sessão, representantes } from "./stores";
    import VideoBg from "./video_bg.svelte";


    //TODO
    //Recuperação de senha com modal de recuperação

    //cadastro
    let nome;
    let telefone;
    let senha;
    let email;

    const registrar = async () => {
        auth.createUserWithEmailAndPassword(email.trim().toLowerCase(), senha.trim().toLowerCase())
        .then((userCredential) => {
            // registrado email e senha
            let { email, uid } = userCredential.user;
            cadastro_sucesso = true;
            let ref = firestore.collection("Representantes").doc(uid);
            ref.set({
                id : uid,
                email,
                nome : nome.trim(), telefone, senha, autorizado : false
            });
            nome = telefone = email = senha = "";
            register_modal=false;
            // ...
        })
        .catch((error) => {
            console.log("error", error.code)
            cadastro_error = 
                error.code == "auth/email-already-in-use"?  "Endereço de email já em uso" :
                error.code == "auth/invalid-email"       ?  "Endereço de email inválido":
                error.code == "auth/weak-password"       ?  "Senha considerada insegura": 
                "";
            // ..
        })

        // ------------ old code ------------
        // let check = await firestore.collection("Representantes").where("usuario", "==", usuario).get();
        // if(!check.empty){
        //     cadastro_error = "Nome de usuário já em uso";
        // }
        // else{
        //     cadastro_sucesso = true;
        //     let ref = firestore.collection("Representantes").doc();
        //     ref.set({
        //         id: ref.id,
        //         nome : nome.trim(), telefone, usuario, senha,
        //         autorizado : false
        //     });
        //     nome = telefone = usuario = senha = "";
        // }
    }

    //login
    let login = { email: '', senha : '' }
    const logar = async () => {

        auth.signInWithEmailAndPassword(login.email.trim().toLowerCase() , login.senha.trim().toLowerCase())
        .then((userCredential) => {
            // Logado
            let { uid, email } = userCredential.user;
            let ref = docData(firestore.collection("Representantes").doc(uid))
            ref.subscribe(check => {
                if(!("id" in check)){
                    login_error = "Erro interno ao encontrar dados do representante associados a esse login, favor, entre em contato com a administração e informe esse erro"
                    return;
                }
                if(!check.autorizado){
                    login_error = "Cadastro ainda não autorizado"
                }
                else sessão.set({
                    ...check,
                    email,
                });
            })
            
            // ...
        })
        .catch((error) => {
            login_error = 
                error.code == "auth/user-not-found"      ?  "Usuário não encontrado" :
                error.code == "auth/invalid-email"       ?  "Endereço de email inválido":
                error.code == "auth/wrong-password"      ?  "Senha incorreta": 
                "";
        });

        // -------------- old code ------------------
        // let check = $representantes.find(rep => rep.usuario.trim() === login.usuario.trim() && rep.senha.trim() === login.senha.trim() );
        
        // if(!(check===undefined)){
        //     if("clientes" in check) check.clientes = check.clientes.map(cli => cli.id);
        //     if(!check.autorizado){
        //         login_error = "Cadastro ainda não autorizado (2)"
        //     }
        //     else sessão.set(check);
        // }
        // else{
        //     login_error = "Usuário e senha não encontrados (1)"
        // }
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
  on:submit={()=>{login_modal=false; registrar()}}  
  hasForm
>
  <p>Seu cadastro deverá ser confirmado antes de logar</p>
  <FluidForm>
    <TextInput bind:value={nome} labelText="Nome" placeholder="" required />
    <TextInput bind:value={telefone} labelText="Telefone" placeholder="" required />
    <TextInput bind:value={email} labelText="Email" placeholder="" type="email" required />
    <PasswordInput
        bind:value={senha}
        required
        type="password"
        labelText="Senha"   
    />
    {#if cadastro_error.length>0}
        <InlineNotification
            title="Erro:"
            subtitle={cadastro_error}
        />
    {/if}
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
        <TextInput bind:value={login.email} labelText="Email" placeholder="" required />
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