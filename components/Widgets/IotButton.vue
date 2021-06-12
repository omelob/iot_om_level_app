// widget que envia datos
<template>
    <card>
        <div slot="header">
            <h4 class="card-title">{{config.selectedDevice.name}}-{{config.variableFullName}}</h4>
        </div>
        <i 
            class="fa " 
            :class="[config.icon, getIconColorClass()]"
            style="font-size: 30px"></i>
        <base-button 
            @click="sendValue()"
            :type="config.class" 
            class="mb-3 pull-right" 
            size="lg"
        >Add</base-button>
    </card>
</template>

<script>
import BaseButton from '../BaseButton.vue';

export default {
    props: ['config'],
    data(){
        return {
            
            sending: false, 

        };
    },
    mounted(){
        
    },
    methods: {

        sendValue(){
            this.sending = true;

            setTimeout(() => {
                this.sending = false;
            }, 500);

            // /userId/+/+/actdata
            const toSend = {
                topic: this.config.userId + "/" + this.config.selectedDevice.dId + "/" + this.config.variable + "/actdata",
                msg:{
                    value: this.config.message
                }
            };

            console.log(toSend);
            this.$nuxt.$emit('mqtt-sender', toSend);
        },

        getIconColorClass(){

            if (!this.sending) {
                return "text-dark";
            }        
            return `text-${this.config.class}`;

        }
    }
}
</script>



// /userId/+/+/sdata disp a la plataforma
// /userId/+/+/actdata de la plataforma al disp