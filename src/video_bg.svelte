<script>
    export let add = "";
</script>

<video autoplay muted loop id="myVideo"
style={`
    position: fixed;
    height: 100%;
    ${add}
    `}
>
<source src="https://firebasestorage.googleapis.com/v0/b/central-do-oleo-vca.appspot.com/o/landing%20bg.mp4?alt=media&token=4b85297f-bb9c-4eb5-bbc8-ac1f4d9bb080" type="video/mp4">
</video>

<h4>Central do Óleo VCA</h4>

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