<template>
  <div class="row">
    
    <IotButton 
      :config="configButton"
    />
    <IotIndicator 
      :config="configIndicator"
    />
    <button @click="sendData1()">SEND</button>
  </div> 
</template>

<script>
export default {
  data() {
    return {
      value:false,
      configButton: {                
        userId: "userid",
        selectedDevice: {
          name: "Home",
          dId: "8888",
          templateName: "Power Sensor",
          templateId: "9294829489hjh0u",
          saverRule: false
        },
        variableFullName: "pump",
        variable: "var1",
        icon: "fa-sun",
        column: "col-6",
        widget: "indicator",
        class: "success"
      },
            configIndicator:{                
                userId: "userid",
                selectedDevice: {
                    name: "Home",
                    dId: "8888",
                    templateName: "Power Sensor",
                    templateId: "9294829489hjh0u",
                    saverRule: false
                },
                variableFullName: "pump",
                variable: "var1",
                icon: "fa-sun",
                column: "col-6",
                widget: "indicator",
                class: "danger",
                message: "{'fanStatus': 'stop'}"
            },
      
    }
  },
  methods: {
    sendData1() {
      this.value = !this.value;
      const toSend = {
        value: this.value
      };
      this.$nuxt.$emit("userid/8888/var1/sdata", toSend);
    },
  }
}
</script>
