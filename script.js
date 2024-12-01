let registros = [];

// Configuración global de Toastr
toastr.options = {
    "closeButton": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": true,
    "timeOut": "3000"
};

function agregarPersona() {
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const area = document.getElementById('area').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;

    if (nombre && apellido && area && fecha) {
        const registro = { 
            nombre, 
            apellido, 
            area, 
            fecha, 
            hora: hora || 'No especificada'
        };
        registros.push(registro);
        actualizarListaRegistros();
        document.getElementById('registroForm').reset();
        
        // Notificación de éxito
        toastr.success(`${nombre} ${apellido} ha sido registrado correctamente`, 'Registro Exitoso');
    } else {
        // Notificación de error
        toastr.error('Por favor, complete los campos obligatorios (Nombre, Apellido, Área y Fecha)', 'Error');
    }
}

function actualizarListaRegistros() {
    const listaRegistros = document.getElementById('listaRegistros');
    listaRegistros.innerHTML = '';
    
    registros.forEach((registro, index) => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-start';
        item.innerHTML = `
            <div class="ms-2 me-auto">
                <h5>${registro.nombre} ${registro.apellido}</h5>
                <p class="mb-0">Área: ${registro.area}<br>
                Fecha: ${registro.fecha}<br>
                Hora: ${registro.hora}</p>
            </div>
            <div class="btn-group-vertical gap-2">
                <button class="btn btn-sm btn-outline-primary" onclick="editarRegistro(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarRegistro(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        listaRegistros.appendChild(item);
    });
}

// También puedes eliminar la función enviarRegistros() ya que no se usará más

function exportarExcel() {
    if (registros.length === 0) {
        toastr.error('No hay registros para exportar', 'Error');
        return;
    }

    try {
        // Preparar los datos
        const data = registros.map(registro => ({
            'NOMBRE': registro.nombre,
            'APELLIDO': registro.apellido,
            'ÁREA': registro.area,
            'FECHA': registro.fecha,
            'HORA': registro.hora
        }));

        // Crear una hoja de trabajo
        const ws = XLSX.utils.json_to_sheet(data);
        
        // Definir el ancho de las columnas
        ws['!cols'] = [
            { wch: 15 }, // Nombre
            { wch: 15 }, // Apellido
            { wch: 20 }, // Área
            { wch: 12 }, // Fecha
            { wch: 10 }  // Hora
        ];

        // Crear un libro de trabajo
        const wb = XLSX.utils.book_new();
        
        // Agregar la hoja al libro
        XLSX.utils.book_append_sheet(wb, ws, "Registros");

        // Generar el archivo y descargarlo
        XLSX.writeFile(wb, "registros_personal.xlsx");
        
        // Notificación de éxito
        toastr.success('El archivo Excel ha sido generado correctamente', 'Exportación Exitosa');
    } catch (error) {
        console.error('Error al exportar:', error);
        toastr.error('Hubo un error al exportar el archivo', 'Error');
    }
}

let pdfTitleModal = null;

// Agregar dentro del DOMContentLoaded existente
document.addEventListener('DOMContentLoaded', function() {
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

    // Agregar el event listener para el botón de confirmar eliminación
    document.getElementById('confirmDelete').addEventListener('click', function() {
        if (deleteIndex !== null) {
            const registro = registros[deleteIndex];
            registros.splice(deleteIndex, 1);
            actualizarListaRegistros();
            
            // Notificación de eliminación
            toastr.warning(`${registro.nombre} ${registro.apellido} ha sido eliminado`, 'Registro Eliminado');
            
            // Cerrar el modal
            deleteModal.hide();
            deleteIndex = null;
        }
    });
    
    // Inicializar el modal de título PDF
    pdfTitleModal = new bootstrap.Modal(document.getElementById('pdfTitleModal'));
    
    // Event listener para el botón de exportar PDF
    document.getElementById('confirmPdfExport').addEventListener('click', function() {
        const titulo = document.getElementById('pdfTitle').value.trim() || 'Registro de Personal';
        generarPDF(titulo);
        pdfTitleModal.hide();
        document.getElementById('pdfTitle').value = ''; // Limpiar el input
    });
});

function exportarPDF() {
    if (registros.length === 0) {
        toastr.error('No hay registros para exportar', 'Error');
        return;
    }
    pdfTitleModal.show();
}

function generarPDF(titulo) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Configurar los datos para la tabla
        const rows = registros.map(registro => [
            registro.nombre,
            registro.apellido,
            registro.area,
            registro.fecha,
            registro.hora
        ]);

        // Agregar título personalizado
        doc.setFontSize(16);
        doc.setTextColor(52, 71, 103);
        doc.setFont('helvetica', 'bold');
        doc.text(titulo || 'Registro de Personal', 14, 15);

        // Agregar fecha de generación
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(103, 116, 142);
        const fecha = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Generado el: ${fecha}`, 14, 26);

        // Agregar la tabla al PDF
        doc.autoTable({
            head: [['Nombre', 'Apellido', 'Área', 'Fecha', 'Hora']],
            body: rows,
            startY: 30,
            margin: { top: 20 },
            styles: { fontSize: 10 },
            headStyles: { fillColor: [94, 114, 228] }
        });

        // Descargar el PDF
        const nombreArchivo = titulo.toLowerCase().replace(/ /g, '_') + '.pdf';
        doc.save(nombreArchivo);
        
        // Notificación de éxito
        toastr.success('El archivo PDF ha sido generado correctamente', 'Exportación Exitosa');
    } catch (error) {
        console.error('Error al exportar PDF:', error);
        toastr.error('Hubo un error al exportar el archivo', 'Error');
    }
}

// Agregar estilos para los nuevos botones
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .btn-info {
            background-color: #11cdef;
            border: none;
            color: white;
        }
        
        .btn-info:hover {
            background-color: #0da5c2;
            transform: translateY(-2px);
        }
        
        .btn-danger {
            background-color: #f5365c;
            border: none;
        }
        
        .btn-danger:hover {
            background-color: #d31e40;
            transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
            .d-flex.gap-2 {
                flex-direction: column;
            }
            
            .btn {
                width: 100% !important;
                margin-bottom: 0.5rem;
            }
        }
    </style>
`);

// Agregar una función de prueba para verificar que XLSX está disponible
function verificarXLSX() {
    if (typeof XLSX === 'undefined') {
        console.error('XLSX no está definido');
        return false;
    }
    console.log('XLSX está disponible');
    return true;
}

// Llamar a la función de verificación cuando se carga la página
document.addEventListener('DOMContentLoaded', verificarXLSX);

// Variable global para almacenar el índice del registro a eliminar
let deleteIndex = null;
let deleteModal = null;

// Inicializar el modal cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

    // Agregar el event listener para el botón de confirmar eliminación
    document.getElementById('confirmDelete').addEventListener('click', function() {
        if (deleteIndex !== null) {
            const registro = registros[deleteIndex];
            registros.splice(deleteIndex, 1);
            actualizarListaRegistros();
            
            // Notificación de eliminación
            toastr.warning(`${registro.nombre} ${registro.apellido} ha sido eliminado`, 'Registro Eliminado');
            
            // Cerrar el modal
            deleteModal.hide();
            deleteIndex = null;
        }
    });
});

function eliminarRegistro(index) {
    const registro = registros[index];
    deleteIndex = index;
    
    // Actualizar el contenido del modal
    document.getElementById('deleteModalBody').innerHTML = 
        `¿Está seguro que desea eliminar el registro de <strong>${registro.nombre} ${registro.apellido}</strong>?`;
    
    // Mostrar el modal
    deleteModal.show();
}

// Agregar estilos adicionales para el modal
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .modal-content {
            border-radius: 15px;
            border: none;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        
        .modal-header {
            padding: 1.5rem 1.5rem 1rem;
        }
        
        .modal-body {
            padding: 1rem 1.5rem;
        }
        
        .modal-footer {
            padding: 1rem 1.5rem 1.5rem;
        }
        
        .modal-title {
            color: #344767;
            font-weight: 600;
        }
        
        .modal .btn {
            padding: 0.5rem 1.5rem;
            font-weight: 500;
        }
        
        .modal .btn-secondary {
            background-color: #8898aa;
            border: none;
        }
        
        .modal .btn-danger {
            background-color: #f5365c;
            border: none;
        }
        
        .modal .btn-close:focus {
            box-shadow: none;
        }
    </style>
`);

function editarRegistro(index) {
    const registro = registros[index];
    
    // Llenar el formulario con los datos del registro
    document.getElementById('nombre').value = registro.nombre;
    document.getElementById('apellido').value = registro.apellido;
    document.getElementById('area').value = registro.area;
    document.getElementById('fecha').value = registro.fecha;
    document.getElementById('hora').value = registro.hora !== 'No especificada' ? registro.hora : '';
    
    // Eliminar el registro actual
    registros.splice(index, 1);
    actualizarListaRegistros();
    
    // Notificación de edición
    toastr.info(`Editando registro de ${registro.nombre} ${registro.apellido}`, 'Modo Edición');
}

// Agregar estilos para los botones
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .btn-group-vertical {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .btn-outline-primary {
            color: #5e72e4;
            border-color: #5e72e4;
        }
        
        .btn-outline-primary:hover {
            background-color: #5e72e4;
            color: white;
        }
        
        .btn-outline-danger {
            color: #f5365c;
            border-color: #f5365c;
        }
        
        .btn-outline-danger:hover {
            background-color: #f5365c;
            color: white;
        }
        
        .list-group-item {
            position: relative;
        }
        
        .btn-group-vertical .btn {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
        }
    </style>
`);

// Estilos adicionales para las notificaciones
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .toast-success {
            background-color: #2dce89 !important;
        }
        
        .toast-error {
            background-color: #f5365c !important;
        }
        
        .toast-info {
            background-color: #11cdef !important;
        }
        
        .toast-warning {
            background-color: #fb6340 !important;
        }
        
        #toast-container > div {
            opacity: 1;
            border-radius: 10px;
            padding: 15px 15px 15px 50px;
            box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
        }
    </style>
`);