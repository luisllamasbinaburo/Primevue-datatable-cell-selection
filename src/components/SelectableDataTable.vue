<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useSelectableCells } from '../composables/useSelectableCells';

// Props del componente
const props = defineProps({
  /**
   * Datos para la tabla
   */
  value: {
    type: Array,
    required: true
  },
  /**
   * Definición de columnas [{ field, header, formatter }]
   */
  columns: {
    type: Array,
    required: true
  },
  /**
   * Estilo para la tabla
   */
  tableStyle: {
    type: Object,
    default: () => ({ 'min-width': '50rem' })
  },
  /**
   * Habilitar filas con rayas
   */
  stripedRows: {
    type: Boolean,
    default: true
  }
});

// Emits para informar a los componentes padres
const emit = defineEmits(['selection-change', 'copy']);

// Usar el composable que contiene toda la lógica de selección
const {
  selectedCells,
  selectedCellInfo,
  handleCellMouseDown,
  handleCellMouseOver,
  handleMouseUp,
  isCellSelected,
  formatCellValue,
  setupListeners,
  cleanupListeners,
  selectAll,
  clearSelection,
  copySelectedCellsToClipboard
} = useSelectableCells({
  data: ref(props.value),
  columns: ref(props.columns),
  onSelectionChange: (selectedData) => emit('selection-change', selectedData),
  onCopy: (copyEvent) => emit('copy', copyEvent)
});

// Configurar y limpiar listeners al montar/desmontar el componente
onMounted(() => {
  setupListeners();
});

onUnmounted(() => {
  cleanupListeners();
});

// Exponer métodos para uso externo
defineExpose({
  clearSelection,
  selectAll,
  copyToClipboard: copySelectedCellsToClipboard
});
</script>

<template>
  <div class="selectable-datatable-container">
    <!-- Información de celda seleccionada -->
    <div class="selected-info">
      {{ selectedCellInfo }}
      <span v-if="selectedCells.size > 0" class="copy-hint">(Usa Ctrl+C para copiar la selección)</span>
    </div>
    
    <!-- Tabla de PrimeVue con selección de celdas mediante drag -->
    <DataTable 
      :value="value" 
      :stripedRows="stripedRows" 
      :tableStyle="tableStyle"
      class="selectable-table"
    >
      <template v-for="column in columns" :key="column.field">
        <Column :field="column.field" :header="column.header">
          <template #body="{ data, index }">
            <div 
              :class="{ 'cell-selected': isCellSelected(index, column.field) }" 
              class="selectable-cell"
              @mousedown="handleCellMouseDown($event, index, column.field)"
              @mouseover="handleCellMouseOver(index, column.field)"
            >
              {{ formatCellValue(data, column.field) }}
            </div>
          </template>
        </Column>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.selectable-datatable-container {
  position: relative;
  width: 100%;
}

.selected-info {
  background-color: #e3f2fd;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-weight: bold;
  color: #1565c0;
  border-left: 4px solid #1565c0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 2rem;
}

.copy-hint {
  font-size: 0.8rem;
  opacity: 0.8;
  font-weight: normal;
}

/* Estilos para celdas seleccionables */
.selectable-table {
  user-select: none; /* Evitar selección de texto durante el drag */
}

.selectable-cell {
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  height: 100%;
  width: 100%;
}
</style>

<style>
td:has(.cell-selected) {
  background-color: #e3f2fd !important;
  color: #1565c0 !important;
}
</style>