let registros = [];

function agregarPersona() {
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const area = document.getElementById('area').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;

    if (nombre && apellido && area && fecha && hora) {
        const registro = { nombre, apellido, area, fecha, hora };
        registros.push(registro);
        actualizarListaRegistros();
        document.getElementById('registroForm').reset();
    } else {
        alert('Por favor, complete todos los campos');
    }
}

function actualizarListaRegistros() {
    const listaRegistros = document.getElementById('listaRegistros');
    listaRegistros.innerHTML = '';
    
    registros.forEach((registro, index) => {
        const item = document.createElement('div');
        item.className = 'list-group-item';
        item.innerHTML = `
            <h5>${registro.nombre} ${registro.apellido}</h5>
            <p>Área: ${registro.area}<br>
            Fecha: ${registro.fecha}<br>
            Hora: ${registro.hora}</p>
        `;
        listaRegistros.appendChild(item);
    });
}

// También puedes eliminar la función enviarRegistros() ya que no se usará más

function exportarExcel() {
    if (registros.length === 0) {
        alert('No hay registros para exportar');
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
    } catch (error) {
        console.error('Error al exportar:', error);
        alert('Hubo un error al exportar el archivo. Por favor, intente nuevamente.');
    }
}

function exportarPDF() {
    if (registros.length === 0) {
        alert('No hay registros para exportar');
        return;
    }

    try {
        // Crear nuevo PDF
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

        // Configuración de estilos para la tabla
        const styles = {
            font: 'helvetica',
            fontStyle: 'normal',
            fontSize: 10,
            cellPadding: 5,
            lineColor: [233, 236, 239], // Color de líneas suave
            lineWidth: 0.5,
        };

        // Configuración de los encabezados
        const headers = [['NOMBRE', 'APELLIDO', 'ÁREA', 'FECHA', 'HORA']];
        
        // Configuración de tema personalizado
        const tableConfig = {
            head: headers,
            body: rows,
            startY: 30,
            margin: { top: 20 },
            styles: styles,
            headStyles: {
                fillColor: [94, 114, 228], // Azul corporativo
                textColor: [255, 255, 255],
                fontSize: 11,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                textColor: [52, 71, 103], // Color de texto corporativo
                fontSize: 10,
                halign: 'left'
            },
            alternateRowStyles: {
                fillColor: [248, 249, 254] // Color de fila alternada
            },
            columnStyles: {
                0: { cellWidth: 35 }, // Nombre
                1: { cellWidth: 35 }, // Apellido
                2: { cellWidth: 40 }, // Área
                3: { cellWidth: 40 }, // Fecha
                4: { cellWidth: 30 }  // Hora
            },
            theme: 'grid'
        };

        // Agregar título
        doc.setFontSize(16);
        doc.setTextColor(52, 71, 103);
        doc.setFont('helvetica', 'bold');
        doc.text('Registro de Personal', 14, 20);

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
        doc.autoTable(tableConfig);

        // Agregar pie de página
        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(103, 116, 142);
            doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
        }

        // Descargar el PDF
        doc.save('registros_personal.pdf');
    } catch (error) {
        console.error('Error al exportar PDF:', error);
        alert('Hubo un error al exportar el PDF. Por favor, intente nuevamente.');
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