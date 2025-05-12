import { ref, onMounted, onUnmounted, computed } from 'vue';

/**
 * Composable para gestionar la selección de celdas en tablas con drag & drop
 * y capacidad de copiar al portapapeles compatible con Excel.
 * 
 * @param {Object} options Opciones de configuración
 * @param {Array} options.data Array de datos para la tabla
 * @param {Array} options.columns Definición de columnas
 * @param {Function} options.onSelectionChange Callback cuando cambia la selección
 * @param {Function} options.onCopy Callback cuando se copian datos
 * @returns {Object} Métodos y propiedades expuestas por el composable
 */
export function useSelectableCells(options = {}) {
  const data = options.data || ref([]);
  const columns = options.columns || ref([]);
  const onSelectionChange = options.onSelectionChange || (() => {});
  const onCopy = options.onCopy || (() => {});

  // Variables para la selección de celdas
  const selectedCells = ref(new Set()); // Conjunto de celdas seleccionadas en formato "rowIndex:columnField"
  const selectedCellInfo = ref('');
  const isDragging = ref(false);
  const startCell = ref(null); // Celda donde inicia el drag { rowIndex, columnField }
  const currentCell = ref(null); // Celda actual durante el drag { rowIndex, columnField }

  // Campos (columnas) de la tabla para el tracking
  const columnFields = computed(() => {
    if (Array.isArray(columns.value)) {
      return columns.value.map(col => col.field);
    }
    return [];
  });

  // Función para manejar clic en celda e iniciar drag
  const handleCellMouseDown = (event, rowIndex, columnField) => {
    // Si se mantiene presionada la tecla Ctrl, añadir a la selección existente
    if (!event.ctrlKey) {
      selectedCells.value.clear();
    }

    // Iniciar el drag
    isDragging.value = true;
    startCell.value = { rowIndex, columnField };
    currentCell.value = { rowIndex, columnField };
    
    // Seleccionar la celda inicial
    const cellKey = `${rowIndex}:${columnField}`;
    if (event.ctrlKey && selectedCells.value.has(cellKey)) {
      selectedCells.value.delete(cellKey);
    } else {
      selectedCells.value.add(cellKey);
    }
    
    updateSelectionInfo();
    emitSelectionChange();
  };

  // Función para manejar movimiento del mouse durante el drag
  const handleCellMouseOver = (rowIndex, columnField) => {
    if (!isDragging.value || !startCell.value) return;
    
    currentCell.value = { rowIndex, columnField };
    updateSelectionRectangle();
  };

  // Función para finalizar el drag
  const handleMouseUp = () => {
    if (isDragging.value) {
      isDragging.value = false;
      emitSelectionChange();
    }
  };

  // Función para actualizar la selección rectangular entre startCell y currentCell
  const updateSelectionRectangle = () => {
    if (!startCell.value || !currentCell.value) return;

    // Limpiar la selección previa (excepto si se está manteniendo Ctrl)
    if (!event?.ctrlKey) {
      selectedCells.value.clear();
    }

    // Encontrar el rango de filas y columnas para seleccionar
    const startRow = Math.min(startCell.value.rowIndex, currentCell.value.rowIndex);
    const endRow = Math.max(startCell.value.rowIndex, currentCell.value.rowIndex);
    
    const startColIndex = columnFields.value.indexOf(startCell.value.columnField);
    const endColIndex = columnFields.value.indexOf(currentCell.value.columnField);
    const startCol = Math.min(startColIndex, endColIndex);
    const endCol = Math.max(startColIndex, endColIndex);

    // Seleccionar todas las celdas en el rectángulo
    for (let i = startRow; i <= endRow; i++) {
      for (let j = startCol; j <= endCol; j++) {
        const field = columnFields.value[j];
        selectedCells.value.add(`${i}:${field}`);
      }
    }
    
    updateSelectionInfo();
  };

  // Función para verificar si una celda está seleccionada
  const isCellSelected = (rowIndex, columnField) => {
    return selectedCells.value.has(`${rowIndex}:${columnField}`);
  };

  // Función para limpiar la selección al hacer clic fuera de la tabla
  const handleGlobalClick = (event) => {
    const isClickOutsideTable = !event.target.closest('.p-datatable');
    
    if (isClickOutsideTable && selectedCells.value.size > 0 && !event.ctrlKey) {
      selectedCells.value.clear();
      selectedCellInfo.value = '';
      emitSelectionChange();
    }
  };

  // Función para actualizar la información de las celdas seleccionadas
  const updateSelectionInfo = () => {
    if (selectedCells.value.size === 0) {
      selectedCellInfo.value = '';
      return;
    }
    
    selectedCellInfo.value = `${selectedCells.value.size} celda${selectedCells.value.size > 1 ? 's' : ''} seleccionada${selectedCells.value.size > 1 ? 's' : ''}`;
  };

  // Función para emitir evento de cambio de selección
  const emitSelectionChange = () => {
    const selectedData = [];
    
    if (selectedCells.value.size > 0) {
      // Convertir a un array de objetos {rowIndex, columnField, value}
      selectedCells.value.forEach(cellKey => {
        const [rowIndex, columnField] = cellKey.split(':');
        const rowIndexNum = parseInt(rowIndex);
        const rowData = data.value[rowIndexNum];
        
        if (rowData) {
          selectedData.push({
            rowIndex: rowIndexNum,
            columnField,
            value: rowData[columnField],
            rowData
          });
        }
      });
    }
    
    onSelectionChange(selectedData);
  };

  // Función para capturar Ctrl+C y copiar contenido seleccionado
  const handleKeyDown = (event) => {
    // Detectar Ctrl+C
    if (event.ctrlKey && event.key === 'c' && selectedCells.value.size > 0) {
      copySelectedCellsToClipboard();
    }
  };

  // Función para copiar celdas seleccionadas al portapapeles en formato compatible con Excel
  const copySelectedCellsToClipboard = () => {
    // Obtener filas y columnas seleccionadas ordenadas
    const rows = new Set();
    const cols = new Set();
    
    selectedCells.value.forEach(cell => {
      const [rowIndex, columnField] = cell.split(':');
      rows.add(parseInt(rowIndex));
      cols.add(columnField);
    });
    
    const sortedRows = Array.from(rows).sort((a, b) => a - b);
    const sortedCols = Array.from(cols).sort((a, b) => 
      columnFields.value.indexOf(a) - columnFields.value.indexOf(b)
    );
    
    // Crear matriz de datos para la selección
    const grid = [];
    for (const rowIndex of sortedRows) {
      const rowData = [];
      for (const columnField of sortedCols) {
        if (selectedCells.value.has(`${rowIndex}:${columnField}`)) {
          const item = data.value[rowIndex];
          let valor = item[columnField];
          
          // Buscar si hay un formateador para esta columna
          const column = columns.value.find(col => col.field === columnField);
          
          if (column && column.formatter) {
            // Usar el formateador pero en versión "plana" para Excel
            valor = column.formatter(valor, item, true);
          }
          
          rowData.push(valor);
        } else {
          rowData.push(''); // Celda vacía si no está seleccionada
        }
      }
      grid.push(rowData);
    }
    
    // Convertir la matriz a formato TSV (compatible con Excel)
    const tsv = grid.map(row => row.join('\t')).join('\n');
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(tsv)
      .then(() => {
        // Mostrar mensaje de éxito temporal
        const prevInfo = selectedCellInfo.value;
        selectedCellInfo.value = '¡Copiado al portapapeles! Listo para pegar en Excel';
        
        // Emitir evento de copia
        onCopy({ data: tsv, grid });
        
        setTimeout(() => {
          selectedCellInfo.value = prevInfo;
        }, 2000);
      })
      .catch(err => {
        console.error('Error al copiar:', err);
        selectedCellInfo.value = 'Error al copiar al portapapeles';
      });
  };

  // Obtener el texto a mostrar para una celda
  const formatCellValue = (data, field) => {
    const column = columns.value.find(col => col.field === field);
    
    if (column && column.formatter) {
      return column.formatter(data[field], data, false);
    }
    
    return data[field];
  };

  // Configurar listeners cuando se monta el componente
  const setupListeners = () => {
    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
  };

  // Limpiar listeners cuando se desmonta el componente
  const cleanupListeners = () => {
    document.removeEventListener('click', handleGlobalClick);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('keydown', handleKeyDown);
  };

  // Seleccionar todas las celdas
  const selectAll = () => {
    selectedCells.value.clear();
    data.value.forEach((_, rowIndex) => {
      columns.value.forEach(column => {
        selectedCells.value.add(`${rowIndex}:${column.field}`);
      });
    });
    updateSelectionInfo();
    emitSelectionChange();
  };

  // Limpiar selección
  const clearSelection = () => {
    selectedCells.value.clear();
    selectedCellInfo.value = '';
    emitSelectionChange();
  };

  return {
    // Estado reactivo
    selectedCells,
    selectedCellInfo,
    isDragging,
    
    // Funciones para eventos
    handleCellMouseDown,
    handleCellMouseOver,
    handleMouseUp,
    isCellSelected,
    formatCellValue,
    
    // Funciones de utilidad
    setupListeners,
    cleanupListeners,
    selectAll,
    clearSelection,
    copySelectedCellsToClipboard
  };
}