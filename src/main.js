import { createApp } from 'vue'
import App from './App.vue'

import Aura from '@primeuix/themes/aura';

// Importar PrimeVue
import PrimeVue from 'primevue/config'

// Importar DataTable y otros componentes necesarios
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'


import 'primeicons/primeicons.css'   // Iconos

const app = createApp(App)

app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});


// Registrar componentes globalmente
app.component('DataTable', DataTable)
app.component('Column', Column)

app.mount('#app')



