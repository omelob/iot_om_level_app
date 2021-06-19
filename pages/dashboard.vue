<template>
  <div>
    <h2>Dashboard</h2>
  </div> 
 
</template>
<script>
import { defineComponent } from '@vue/composition-api'

export default {
  middleware: "authenticated"
}
</script>

