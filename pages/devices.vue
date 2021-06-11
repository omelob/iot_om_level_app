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
            label="Nombre Dispositivo" type="text" 
            placeholder="Ex: Home, Office, ..." 
          />
        </div>
        <div class="col-4">
          <base-input 
            label="Nombre Dispositivo" type="text" 
            placeholder="Ex: Home, Office, ..." 
          />
        </div>
        <div class="col-4">
          <slot name="label">
            <label>Template</label>
          </slot>
          <el-select 
            placeholder="Select Template"
            value="1" 
            class="select-primary"
            style="width:100%"
          >
            <el-option
              class="text-dark"
              label="Template 1"
            ></el-option>
            <el-option
              class="text-dark"
              label="Template 2"
            ></el-option>
            <el-option
              class="text-dark"
              label="Template 3"
            ></el-option>
          </el-select>
        </div>
      </div>
      <div class="row pull-right">
        <div class="col-12">
          <base-button 
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
        <el-table :data="devices">
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
    <Json :value="devices" />
    <pre>
      {{devices}}
    </pre>
    
  </div> 
</template>

<script>
import { Table, TableColumn } from 'element-ui';
import { Select, Option } from 'element-ui';


export default {
  components: {
    
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Option.name]: Option,
    [Select.name]: Select,
  },
  data(){
    return {
      devices: [
        {
          name: "Home",
          dId: "8888",
          templateName: "Power Sensor",
          templateId: "9294829489hjh0u",
          saverRule: false
        },
        {
          name: "Office",
          dId: "22222",
          templateName: "Temp Sensor",
          templateId: "9294829489hjh0v",
          saverRule: true
        },
        {
          name: "Farm",
          dId: "77777",
          templateName: "Humidity Sensor",
          templateId: "9294829489hjh0w",
          saverRule: false
        }
      ]
    };
  },
  methods: {
    deleteDevice(device){
      alert("Deleting "+device.name)
    },
    updateSaverRuleStatus(index){
      this.devices[index].saverRule = !this.devices[index].saverRule
    }
  }
}
</script>
