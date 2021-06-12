// widget que recibe datos
<template>
    <card>
        <div slot="header">
            <h4 class="card-title">{{config.selectedDevice.name}}-{{config.variableFullName}}</h4>
        </div>
        <i class="fa " :class="[config.icon, getIconColorClass()]" style="font-size: 30px"></i>
    </card>
</template>

<script>

export default {
    props: ['config'],
    data(){
        return {
            value: false,            
        };
    },
    mounted(){
        // /uderId/dId/temperature/sdata 
        const topic = this.config.userId + "/" + this.config.selectedDevice.dId + "/" + this.config.variable + "/sdata";
        console.log(topic);
        this.$nuxt.$on(topic, this.processReceivedData)
    },
    beforeDestroy(){
        this.$nuxt.$off(this.config.userId + "/" + this.config.selectedDevice.dId + "/" + this.config.variable + "/sdata")
    },
    methods: {

        processReceivedData(data){
            console.log("received");
            console.log(data);
            this.value = data.value;
        },

        getIconColorClass(){

            if (!this.value) {
                return "text-dark";
            }        
            return `text-${this.config.class}`;

        }
    }
}
</script>



// /userId/+/+/sdata disp a la plataforma
// /userId/+/+/actdata de la plataforma al disp
