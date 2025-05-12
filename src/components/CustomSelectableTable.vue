<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useSelectableCells } from '../composables/useSelectableCells';

// Datos de ejemplo
const data = ref([
  { id: 1, producto: 'Widget A', ventas: 120 },
  { id: 2, producto: 'Widget B', ventas: 85 },
  { id: 3, producto: 'Widget C', ventas: 200 }
]);

// Definición de columnas
const columns = ref([
  { field: 'id', header: 'ID' },
  { field: 'producto', header: 'Producto' },
  { field: 'ventas', header: 'Ventas' }
]);

// Usar el composable de selección de celdas
const {
  selectedCells,
  selectedCellInfo,
  handleCellMouseDown,
  handleCellMouseOver,
  isCellSelected,
  setupListeners,
  cleanupListeners,
  copySelectedCellsToClipboard
} = useSelectableCells({
  data,
  columns,
  onSelectionChange: (selectedData) => {
    console.log('Selección cambiada:', selectedData);
  },
  onCopy: (copyEvent) => {
    console.log('Datos copiados:', copyEvent);
  }
});

// Configurar y limpiar listeners
onMounted(() => {
  setupListeners();
});

onUnmounted(() => {
  cleanupListeners();
});
</script>

<template>
  <div class="custom-table-demo">
    <h2>Tabla Personalizada con Selección de Celdas</h2>
    
    <!-- Información de la selección -->
    <div v-if="selectedCellInfo" class="selection-info">
      {{ selectedCellInfo }}
    </div>
    
    <!-- Implementación de tabla simple -->
    <table class="custom-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.field">{{ col.header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in data" :key="row.id">
          <td v-for="col in columns" :key="col.field">
            <div 
              :class="{ 'cell-selected': isCellSelected(rowIndex, col.field) }"
              class="table-cell" 
              @mousedown="handleCellMouseDown($event, rowIndex, col.field)"
              @mouseover="handleCellMouseOver(rowIndex, col.field)"
            >
              {{ row[col.field] }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="instructions">
      <p>Selecciona celdas arrastrando el ratón y usa <kbd>Ctrl+C</kbd> para copiar el contenido.</p>
      <button @click="copySelectedCellsToClipboard">Copiar Selección</button>
    </div>
  </div>
</template>

<style scoped>
.custom-table-demo {
  margin: 2rem auto;
  max-width: 600px;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.selection-info {
  background-color: #f0f8ff;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 6px;
  color: #0056b3;
  font-weight: bold;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
}

.custom-table th {
  background-color: #f5f7fa;
  padding: 0.75rem;
  text-align: left;
  font-weight: bold;
  border-bottom: 2px solid #e0e4e8;
}

.custom-table td {
  padding: 0;
  border-bottom: 1px solid #e0e4e8;
}

.table-cell {
  padding: 0.75rem;
  user-select: none;
  cursor: pointer;
  height: 100%;
  width: 100%;
}

.cell-selected {
  background-color: #e3f2fd;
  color: #0056b3;
  font-weight: bold;
}

.table-cell:hover {
  background-color: #f5f9ff;
}

.instructions {
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
  text-align: center;
}

kbd {
  background-color: #f5f7fa;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 2px 4px;
  font-family: monospace;
}

button {
  background-color: #0056b3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  cursor: pointer;
}

button:hover {
  background-color: #003d82;
}
</style>