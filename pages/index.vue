<template>
    <div><h3>Index</h3></div>
</template>

<script>
    export default {
        middleware: "authenticated",
        mounted(){
            $nuxt.$router.push("/dashboard")
        }
    }
</script>

<style>

</style>