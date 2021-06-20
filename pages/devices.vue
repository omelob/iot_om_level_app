<template>
  <div>
    <!-- Form add device -->
    <div class="row">
      <card>
      <div>
        <h4 class="card-title">Agregue un nuevo dispositivo</h4>
      </div>

      <div class="row"> 
        <div class="col-4">
          <base-input 
            label="Nombre Dispositivo" 
            type="text" 
            placeholder="Ex: Home, Office, ..." 
            v-model="newDevice.name"
          />
        </div>
        <div class="col-4">
          <base-input 
            label="Device Id" 
            type="text" 
            placeholder="Ex: 2222-7777-9999"
            v-model="newDevice.dId" 
          />
        </div>
        <div class="col-4">
          <slot name="label">
            <label>Template</label>
          </slot>

          <el-select 
            v-model="selectedIndexTemplate"
            placeholder="Select Template"
            class="select-primary"
            style="width:100%"
          >
            <el-option v-for="template, index in templates"
              :key="template._id"
              class="text-dark"
              :value="index"
              :label="template.name"
            ></el-option>
            
          </el-select>
        </div>
      </div>
      <div class="row pull-right">
        <div class="col-12">
          <base-button
            @click="createNewDevice" 
            type="primary"
            class="mb-3"
            size="lg"
          >Add</base-button>
        </div>
      </div>
      </card>
    </div>

    <!-- Devices Table -->
    <div class="row">
      <card>
      <div>
        <h4 class="card-title">Dispositivos</h4>
      </div>
        <el-table :data="$store.state.devices">
          <el-table-column label="#" min-width="50" align="center">
            <div slot-scope="{row, $index}">
              {{$index +1}}
            </div>
          </el-table-column>
          <el-table-column prop="name" label="Name"></el-table-column>
          <el-table-column prop="dId" label="Device Id"></el-table-column>
          <el-table-column prop="templateName" label="Template"></el-table-column>
          <el-table-column label="Actions">
            <div slot-scope="{row, $index}">
              
              <el-tooltip content="Saver Status Indicator" style="margin-right: 10px">
                <i class="fas fa-database" :class="{'text-success' : row.saverRule, 'text-dark' : !row.saverRule}"></i>
              </el-tooltip>
              <el-tooltip content="Database Saver">
                <base-switch
                  @click="updateSaverRuleStatus($index)"
                  :value="row.saverRule"
                  type="primary"
                  on-text="On"
                  off-text="Off"
                ></base-switch>
              </el-tooltip>
              <el-tooltip
                content="Delete"
                effect="light"
                :open-delay="300"
                placement="top"
              >
                <base-button 
                  type="danger"
                  icon
                  size="sm"
                  class="btn-link"
                  @click="deleteDevice(row)"
                >
                  <i class="tim-icons icon-simple-remove"></i>
                </base-button>
              </el-tooltip>
            </div>
            
          </el-table-column>
        </el-table>
      </card>
    </div>
    <Json :value="templates" />
    <!-- <pre>
      {{devices}}
    </pre> -->
    
  </div> 
</template>

<script>
import { Table, TableColumn } from 'element-ui';
import { Select, Option } from 'element-ui';


export default {
  middleware: "authenticated",
  components: {    
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Option.name]: Option,
    [Select.name]: Select,
  },
  data(){
    return {
      templates: [],
      selectedIndexTemplate: null,
      newDevice: {
        name: "",
        dId: "",
        templateId: "",
        templateName: ""
      }
    };
  },
  mounted(){
    this.$store.dispatch("getDevices");
    this.getTemplates();
  },
  methods: {
    // New device
    createNewDevice() {

      // Validacion
      if (this.newDevice.name == "") {
        this.$notify({
          type: "warning",
          icon: "tim-icons icon-alert-circle-exc",
          message: " Device Name is Empty :("
        });
        return;
      }
      if (this.newDevice.dId == "") {
        this.$notify({
          type: "warning",
          icon: "tim-icons icon-alert-circle-exc",
          message: " Device ID is Empty :("
        });
        return;
      }
      if (this.selectedIndexTemplate == null) {
        this.$notify({
          type: "warning",
          icon: "tim-icons icon-alert-circle-exc",
          message: " Tempalte must be selected"
        });
        return;
      }

      // armamos los headers
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };

      //ESCRIBIMOS EL NOMBRE Y EL ID DEL TEMPLATE SELECCIONADO EN EL OBJETO newDevice
      this.newDevice.templateId = this.templates[ this.selectedIndexTemplate ]._id;
      this.newDevice.templateName = this.templates[ this.selectedIndexTemplate ].name;

      const toSend = {
        newDevice: this.newDevice
      };

      this.$axios
        .post("/device", toSend, axiosHeaders)
        .then(res => {
          if (res.data.status == "success") {

            this.$store.dispatch("getDevices");

            // borra el formulario
            this.newDevice.name = "";
            this.newDevice.dId = "";
            this.selectedIndexTemplate = null;

            // se envia una notificacion
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "Success! Device was added"
            });

            return;
          }
        })
        .catch(e => {
          if (
            e.response.data.status == "error" &&
            e.response.data.error.errors.dId.kind == "unique"
          ) {
            this.$notify({
              type: "warning",
              icon: "tim-icons icon-alert-circle-exc",
              message:
                "The device is already registered in the system. Try another device"
            });
            return;
          } else {
            this.showNotify("danger", "Error");
            return;
          }
        });
    },
    

    // Get templates
    async getTemplates() {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };
      try {
        const res = await this.$axios.get("/template", axiosHeaders);
        console.log(res.data);

        if (res.data.status == "success") {
          this.templates = res.data.data;
        }

      } catch (error) {
        this.$notify({
          type: "danger",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Error getting templates..."
        });
        console.log(error);
        return;
      }
    },

    deleteDevice(device){
      const axiosHeader = {
        headers: {
          token: this.$store.state.auth.token
        },
        params: {
          dId: device.dId
        }
      };
      this.$axios
        .delete("/device", axiosHeader)
        .then(res => {
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: device.name + " deleted!"
            });
            this.$store.dispatch("getDevices");
          }
          
        })
        .catch(e => {
          console.log(e);
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: " Error deleting " + device.name
          });
        })      
    },

    updateSaverRuleStatus(index){
      console.log(index);
      this.devices[index].saverRule = !this.devices[index].saverRule
    }
  }
};
</script>
