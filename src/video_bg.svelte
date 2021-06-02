<script>
    export let add = "";
    import versão from './versão'
</script>

<video autoplay muted loop id="myVideo"
style={`
    position: fixed;
    height: 100%;
    ${add}
    `}
    poster={"loading_bg.png"}
>
<source src="https://firebasestorage.googleapis.com/v0/b/central-do-oleo-vca.appspot.com/o/landing_2.mp4?alt=media&token=5f0a502d-bdf6-4e25-a16f-6988a772af10" type="video/mp4">
</video>

<h4>Central do Óleo VCA</h4>

<span style="font-size: 10px;
    position: fixed;
    bottom: 0px;
    left: 2px;
    display: block;
    color: black;">{versão}</span>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@700&family=Mate+SC&display=swap');  
    h4{
        position: fixed;
        font-family: 'Mate SC', serif;
        color:#f3f3f3c7;
        z-index: 10;
        left: 50%;
        top: 2vh;
        transform: translateX(-50%);
        width: 100vw;
        text-align: center;
    }
</style>