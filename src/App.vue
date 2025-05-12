<script setup>
import { ref, onMounted } from 'vue';
import SelectableDataTable from './components/SelectableDataTable.vue';
import CustomSelectableTable from './components/CustomSelectableTable.vue';

// Datos para la tabla
const productos = ref([]);

// Definición de columnas para la tabla
const columns = [
  { 
    field: 'id', 
    header: 'ID'
  },
  { 
    field: 'nombre', 
    header: 'Nombre'
  },
  { 
    field: 'categoria', 
    header: 'Categoría'
  },
  { 
    field: 'precio', 
    header: 'Precio',
    formatter: (valor, data, forExport) => {
      // Si es para exportar, devolvemos el valor sin formato
      if (forExport) return valor;
      // Si es para mostrar, formateamos como moneda
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(valor);
    }
  },
  { 
    field: 'stock', 
    header: 'Stock'
  }
];

// Al montar el componente, cargamos datos de ejemplo
onMounted(() => {
  // Datos de ejemplo para la tabla
  productos.value = [
    { id: 1, nombre: 'Laptop', categoria: 'Electrónicos', precio: 999.99, stock: 15 },
    { id: 2, nombre: 'Monitor 24"', categoria: 'Electrónicos', precio: 249.99, stock: 20 },
    { id: 3, nombre: 'Teclado', categoria: 'Accesorios', precio: 59.99, stock: 30 },
    { id: 4, nombre: 'Mouse', categoria: 'Accesorios', precio: 29.99, stock: 25 },
    { id: 5, nombre: 'Impresora', categoria: 'Electrónicos', precio: 199.99, stock: 10 },
  ];
});

// Control de pestañas
const activeTab = ref('primevue');

// Referencia al componente de tabla para acceder a sus métodos
const tableRef = ref(null);

// Manejar cambios en la selección
const handleSelectionChange = (selectedData) => {
  console.log('Celdas seleccionadas:', selectedData);
};

// Manejar eventos de copia
const handleCopy = (copyEvent) => {
  console.log('Datos copiados al portapapeles');
};

// Método para seleccionar todas las celdas
const selectAllCells = () => {
  tableRef.value.selectAll();
};

// Método para limpiar la selección
const clearSelection = () => {
  tableRef.value.clearSelection();
};
</script>

<template>
  <div class="app-container">
    <h1>Tablas con Selección de Celdas</h1>
    
    <!-- Pestañas para cambiar entre ejemplos -->
    <div class="tabs">
      <button 
        @click="activeTab = 'primevue'" 
        :class="{ 'active': activeTab === 'primevue' }"
      >
        Tabla PrimeVue
      </button>
      <button 
        @click="activeTab = 'custom'" 
        :class="{ 'active': activeTab === 'custom' }"
      >
        Tabla Personalizada
      </button>
    </div>
    
    <!-- Ejemplo con PrimeVue -->
    <div v-if="activeTab === 'primevue'" class="card">
      <h2>Tabla de Productos con PrimeVue</h2>
      
      <div class="actions">
        <button @click="selectAllCells" class="action-button">Seleccionar Todo</button>
        <button @click="clearSelection" class="action-button">Limpiar Selección</button>
      </div>
      
      <!-- Usando nuestro componente reutilizable -->
      <SelectableDataTable
        ref="tableRef"
        :value="productos"
        :columns="columns"
        :tableStyle="{ 'min-width': '50rem' }"
        stripedRows
        @selection-change="handleSelectionChange"
        @copy="handleCopy"
      />

      <div class="example-description">
        <p>Este ejemplo utiliza el componente <code>SelectableDataTable</code> basado en PrimeVue con el composable <code>useSelectableCells</code>.</p>
      </div>
    </div>
    
    <!-- Ejemplo con tabla personalizada -->
    <div v-if="activeTab === 'custom'" class="card">
      <h2>Implementación Personalizada</h2>
      
      <CustomSelectableTable />
      
      <div class="example-description">
        <p>Este ejemplo utiliza el composable <code>useSelectableCells</code> directamente en una tabla HTML estándar, demostrando su flexibilidad.</p>
      </div>
    </div>
  </div>
</template>

<style>
body {
  background-color: #f8f9fa;
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

h2 {
  color: #3B82F6;
  margin-bottom: 1.5rem;
  text-align: center;
}

.card {
  background-color: white;
  border-radius: 10px;
  padding: 2rem;
  margin: 1rem 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.tabs button {
  background-color: #f0f0f0;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  margin: 0 0.5rem;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.tabs button.active {
  background-color: #3B82F6;
  color: white;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.action-button {
  background-color: #3B82F6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #2563EB;
}

.example-description {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f5f7fa;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #666;
}

code {
  background-color: #e9ecef;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
}
</style>
