function validarFormulario(event) {
    event.preventDefault(); // Prevenir el envío del formulario

    var usuario = document.getElementById("usuario").value;
    var contrasena = document.getElementById("contrasena").value;

    if (usuario === "OM-Ampersand" && contrasena === "OModa125*") {
        // Redirigir a la segunda ventana
        window.location.href = "bienvenido.html";
    } else if (usuario === "JugueteriaEureka" && contrasena === "Eureka125*") {
        // Hacer algo si el usuario y contraseña son diferentes
        window.location.href = "https://jugueteriaeureka.github.io/bienvenido.html";
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
}

function irAlmacen() {
    window.location.href = "almacen.html";
}

function irSucursales() {
    window.location.href = "sucursales.html";
}

function CerrarSesion() {
    window.location.href = "https://wisestock.tech/inicio.html";
}

function VolverAtras() {
    window.location.href = "menu.html";
}

function Comenzar() {
    window.location.href = "menu.html";
}

// Añadido Define un objeto para almacenar el producto seleccionado
let codigoActual = 1;
let letra1 = 'A';
let letra2 = 'A';
let productoSeleccionado2 = {};

function obtenerUltimoCodigo() {
    const inventario = document.getElementById('inventario').getElementsByTagName('tr');
    const ultimaFila = inventario[inventario.length - 1];
    const ultimoCodigo = ultimaFila ? ultimaFila.querySelector('td:nth-child(8)').textContent : 'AA000';
    return ultimoCodigo;
}

function generarCodigo() {
    const ultimoCodigo = obtenerUltimoCodigo();
    const numero = parseInt(ultimoCodigo.substring(2)) + 1;
    const codigoNumeros = String(numero).padStart(3, '0');
    const codigo = letra1 + letra2 + codigoNumeros;

    if (numero > 999) {
        letra2 = String.fromCharCode(letra2.charCodeAt(0) + 1);
        if (letra2 > 'Z') {
            letra2 = 'A';
            letra1 = String.fromCharCode(letra1.charCodeAt(0) + 1);
            if (letra1 > 'Z') {
                letra1 = 'A';
            }
        }
    }

    return codigo;
}

function obtenerFechaActual() {
    const fecha = new Date();
    const opcionesFecha = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return fecha.toLocaleDateString('es-ES', opcionesFecha);
}

function agregarProducto() {
    const fechaActual = obtenerFechaActual(); // Obtener la fecha actual
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const seccion = document.getElementById('seccion').value;
    const compra = document.getElementById('compra').value;
    const venta = document.getElementById('venta').value;
    const stock = document.getElementById('stock').value;
    const codigo = generarCodigo();

    const inventario = document.getElementById('inventario');

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${fechaActual}</td>
        <td>${nombre}</td>
        <td>${descripcion}</td>
        <td>${seccion}</td>
        <td>${compra}</td>
        <td>${venta}</td>
        <td>${stock}</td>
        <td>${codigo}</td>
    `;

    inventario.appendChild(newRow);

    // Enviar el producto a la hoja de cálculo
    enviarProductoHojaCalculo(fechaActual, nombre, descripcion, seccion, compra, venta, stock, codigo);

    alert("Producto añadido con éxito.");
}

async function enviarProductoHojaCalculo(fechaActual, nombre, descripcion, seccion, compra, venta, stock, codigo) {
    try {
        const respuesta = await fetch('https://sheet.best/api/sheets/88819217-85ef-4b96-85f4-e2966fc927c0', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "Fecha": fechaActual,
                "Nombre": nombre,
                "Descripción": descripcion,
                "Sección": seccion,
                "Compra": compra,
                "Venta": venta,
                "Stock": stock,
                "Código": codigo
            })
        });

        const contenido = await respuesta.json();
        console.log(contenido);
    } catch (error) {
        console.log(error);
    }
}

function sumarStockProducto(button) {
    const row = button.parentElement.parentElement;
    const stockCell = row.querySelector('td:nth-child(6)');
    stockCell.textContent = Number(stockCell.textContent) + 1;
}

function restarStockProducto(button) {
    const row = button.parentElement.parentElement;
    const stockCell = row.querySelector('td:nth-child(6)');
    if (Number(stockCell.textContent) > 0) {
        stockCell.textContent = Number(stockCell.textContent) - 1;
    }
}

function sumarStock() {
    const codigo = document.getElementById('codigoStock').value;
    const cantidad = Number(document.getElementById('cantidad').value);

    const inventario = document.getElementById('inventario').getElementsByTagName('tr');
    for (let i = 1; i < inventario.length; i++) {
        const codigoProducto = inventario[i].getElementsByTagName('td')[7].textContent;
        if (codigo === codigoProducto) {
            const stockCell = inventario[i].getElementsByTagName('td')[6];
            stockCell.textContent = Number(stockCell.textContent) + cantidad;
            break;
        }
    }

    // Mostrar alerta
    alert("El producto ha sido correctamente modificado.");

    // Actualizar la Hoja de Cálculo
    actualizarStockHojaCalculo(codigo, Number(cantidad), true);
}

function restarStock() {
    const codigo = document.getElementById('codigoStock').value;
    const cantidad = Number(document.getElementById('cantidad').value);

    const inventario = document.getElementById('inventario').getElementsByTagName('tr');
    for (let i = 1; i < inventario.length; i++) {
        const codigoProducto = inventario[i].getElementsByTagName('td')[7].textContent;
        if (codigo === codigoProducto) {
            const stockCell = inventario[i].getElementsByTagName('td')[6];
            if (Number(stockCell.textContent) >= cantidad) {
                stockCell.textContent = Number(stockCell.textContent) - cantidad;
            }
            break;
        }
    }
    
    // Mostrar alerta
    alert("El producto ha sido correctamente modificado.");

    // Actualizar la Hoja de Cálculo
    actualizarStockHojaCalculo(codigo, Number(cantidad), false);
}

async function actualizarStockHojaCalculo(codigo, cantidad, esSuma) {
    try {
        const respuesta = await fetch(`https://sheet.best/api/sheets/88819217-85ef-4b96-85f4-e2966fc927c0/Código/${codigo}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const contenido = await respuesta.json();

        if (contenido.length > 0) {
            const producto = contenido[0];

            if (esSuma) {
                producto.Stock = parseInt(producto.Stock) + parseInt(cantidad);
            } else {
                producto.Stock = parseInt(producto.Stock) - parseInt(cantidad);
                if (producto.Stock < 0) {
                    producto.Stock = 0; // No permitir stock negativo
                }
            }

            const actualizacion = await fetch(`https://sheet.best/api/sheets/88819217-85ef-4b96-85f4-e2966fc927c0/Código/${codigo}`, {
                method: 'PATCH',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "Stock": producto.Stock
                })
            });

            const respuestaActualizacion = await actualizacion.json();
            console.log(respuestaActualizacion);
        }
    } catch (error) {
        console.log(error);
    }
}

async function actualizarProductoHojaCalculo(producto) {
    try {
        const respuesta = await fetch(`https://sheet.best/api/sheets/88819217-85ef-4b96-85f4-e2966fc927c0/Código/${producto.codigo}`, {
            method: 'PATCH',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "Fecha": producto.fechaActual,
                "Nombre": producto.nombre,
                "Descripción": producto.descripcion,
                "Sección": producto.seccion,
                "Compra": producto.compra,
                "Venta": producto.venta,
                "Stock": producto.stock
            })
        });

        const contenido = await respuesta.json();
        console.log(contenido);
    } catch (error) {
        console.log(error);
    }
}

function mostrarContenido(tab) {
    const tabs = document.querySelectorAll('.contenido-tab');
    tabs.forEach(t => t.style.display = 'none');
    document.getElementById(tab + 'Tab').style.display = 'block';
}

function buscarProducto() {
    const codigo = document.getElementById('codigoProducto').value;
    const inventario = document.getElementById('inventario').getElementsByTagName('tr');

    for (let i = 1; i < inventario.length; i++) {
        const codigoProducto = inventario[i].getElementsByTagName('td')[7].textContent;

        if (codigo === codigoProducto) {
            const nombre = inventario[i].getElementsByTagName('td')[1].textContent;
            const descripcion = inventario[i].getElementsByTagName('td')[2].textContent;
            const seccion = inventario[i].getElementsByTagName('td')[3].textContent;
            const compra = inventario[i].getElementsByTagName('td')[4].textContent;
            const venta = inventario[i].getElementsByTagName('td')[5].textContent;
            const stock = inventario[i].getElementsByTagName('td')[6].textContent;

            productoSeleccionado2 = {
                nombre: nombre,
                descripcion: descripcion,
                seccion: seccion,
                compra: compra,
                venta: venta,
                stock: stock,
                codigo: codigo
            };

            // Mostrar los detalles del producto en la interfaz de modificación
            document.getElementById('nombreMod').value = nombre;
            document.getElementById('descripcionMod').value = descripcion;
            document.getElementById('seccionMod').value = seccion;
            document.getElementById('compraMod').value = compra;
            document.getElementById('ventaMod').value = venta;
            document.getElementById('stockMod').value = stock;

            // Mostrar la interfaz de modificación
            document.getElementById('modificarProducto').style.display = 'block';
            return; // Salir de la función después de encontrar el producto
        }
    }

    // Si llegamos aquí, significa que no se encontró el producto con el código ingresado
    alert("No se encontró ningún producto con el código proporcionado.");
}

function confirmarModificacion() {
    // Mostrar cuadro de diálogo de confirmación
    const confirmacion = confirm("¿Está seguro de que quiere modificar este producto?");

    if (confirmacion) {
        // Modificar el producto en la tabla de inventario
        const inventario = document.getElementById('inventario').getElementsByTagName('tr');

        for (let i = 1; i < inventario.length; i++) {
            const codigoProducto = inventario[i].getElementsByTagName('td')[7].textContent;

            if (productoSeleccionado2.codigo === codigoProducto) {
                inventario[i].getElementsByTagName('td')[1].textContent = document.getElementById('nombreMod').value;
                inventario[i].getElementsByTagName('td')[2].textContent = document.getElementById('descripcionMod').value;
                inventario[i].getElementsByTagName('td')[3].textContent = document.getElementById('seccionMod').value;
                inventario[i].getElementsByTagName('td')[4].textContent = document.getElementById('compraMod').value;
                inventario[i].getElementsByTagName('td')[5].textContent = document.getElementById('ventaMod').value;
                inventario[i].getElementsByTagName('td')[6].textContent = document.getElementById('stockMod').value;

                // Actualizar el producto seleccionado
                productoSeleccionado2.nombre = document.getElementById('nombreMod').value;
                productoSeleccionado2.descripcion = document.getElementById('descripcionMod').value;
                productoSeleccionado2.seccion = document.getElementById('seccionMod').value;
                productoSeleccionado2.compra = document.getElementById('compraMod').value;
                productoSeleccionado2.venta = document.getElementById('ventaMod').value;
                productoSeleccionado2.stock = document.getElementById('stockMod').value;

                // Ocultar la interfaz de modificación después de modificar el producto
                document.getElementById('modificarProducto').style.display = 'none';

                // Mostrar alerta de modificación exitosa
                alert("Producto modificado con éxito.");

                // Actualizar la hoja de cálculo
                actualizarProductoHojaCalculo(productoSeleccionado2);
                return; // Salir de la función después de modificar el producto
            }
        }
    }
}

async function actualizarProductoHojaCalculo(producto) {
    try {
        const respuesta = await fetch(`https://sheet.best/api/sheets/88819217-85ef-4b96-85f4-e2966fc927c0/Código/${producto.codigo}`, {
            method: 'PATCH',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "Fecha": producto.fechaActual,
                "Nombre": producto.nombre,
                "Descripción": producto.descripcion,
                "Sección": producto.seccion,
                "Compra": producto.compra,
                "Venta": producto.venta,
                "Stock": producto.stock
            })
        });

        const contenido = await respuesta.json();
        console.log(contenido);
    } catch (error) {
        console.log(error);
    }
}

function cancelarModificacion() {
    // Ocultar la interfaz de modificación si se cancela
    document.getElementById('modificarProducto').style.display = 'none';
}

function buscarProductos() {
    const criterio = document.getElementById('criterio').value;
    const busqueda = document.getElementById('busqueda').value.toLowerCase();
    const inventario = document.getElementById('inventario').getElementsByTagName('tr');
    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = '';

    for (let i = 1; i < inventario.length; i++) {
        const valorCelda = inventario[i].getElementsByTagName('td')[getIndiceCriterio(criterio)].textContent.toLowerCase();

        if (valorCelda.includes(busqueda)) {
            const fechaActual = inventario[i].getElementsByTagName('td')[0].textContent;
            const nombre = inventario[i].getElementsByTagName('td')[1].textContent;
            const descripcion = inventario[i].getElementsByTagName('td')[2].textContent;
            const seccion = inventario[i].getElementsByTagName('td')[3].textContent;
            const compra = inventario[i].getElementsByTagName('td')[4].textContent;
            const venta = inventario[i].getElementsByTagName('td')[5].textContent;
            const stock = inventario[i].getElementsByTagName('td')[6].textContent;
            const codigo = inventario[i].getElementsByTagName('td')[7].textContent;

            resultadosDiv.innerHTML += `
                <div>
                    <h3>${fechaActual}</h3>
                    <h3>${nombre}</h3>
                    <p>Descripción: ${descripcion}</p>
                    <p>Sección: ${seccion}</p>
                    <p>Compra: ${compra}</p>
                    <p>Venta: ${venta}</p>
                    <p>Stock: ${stock}</p>
                    <p>Código: ${codigo}</p>
                </div>
            `;
        }
    }
}

function getIndiceCriterio(criterio) {
    switch (criterio) {
        case 'fechaActual':
            return 0;
        case 'nombre':
            return 1;
        case 'descripcion':
            return 2;
        case 'seccion':
            return 3;
        case 'compra':
            return 4;
        case 'venta':
            return 5;
        case 'stock':
            return 6;
        case 'codigo':
            return 7;
        default:
            return 0;
    }
}

function mostrarContenido(tab) {
    const tabs = document.querySelectorAll('.contenido-tab');
    tabs.forEach(t => t.style.display = 'none');
    document.getElementById(tab + 'Tab').style.display = 'block';

    if (tab === 'EditarS') {
        const selectSucursales = document.getElementById('selectSucursales');
        selectSucursales.innerHTML = '';

        sucursales.forEach(sucursal => {
            const option = document.createElement('option');
            option.value = sucursal.nombre;
            option.textContent = sucursal.nombre;
            selectSucursales.appendChild(option);
        });

            // Agregar "Sucursal_CUU" al desplegable
            const optionCUU = document.createElement('option');
            optionCUU.value = "Sucursal CUU";
            optionCUU.textContent = "Sucursal CUU";
            selectSucursales.appendChild(optionCUU);

            const optionCRE = document.createElement('option');
            optionCRE.value = "Credito";
            optionCRE.textContent = "Credito";
            selectSucursales.appendChild(optionCRE);

            const optionPRE = document.createElement('option');
            optionPRE.value = "Prestamo";
            optionPRE.textContent = "Prestamo";
            selectSucursales.appendChild(optionPRE);
    }
}

let sucursales = [];

function crearTablaSucursal() {
    const nombreSucursal = document.getElementById('nombreSucursal').value;
    const sucursal = { nombre: nombreSucursal, inventario: [] };
    sucursales.push(sucursal);

    const sucursalesContenido = document.getElementById('sucursalesContenido');
    const nuevaTabla = document.createElement('div');
    nuevaTabla.innerHTML = `
        <h2>Sucursal: ${nombreSucursal}</h2>
        <table>
            <tr>
                <th>Fecha</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Sección</th>
                <th>Compra</th>
                <th>Venta</th>
                <th>Stock</th>
                <th>Código</th>
            </tr>
        </table>
        <button class="boton-secundario" type="button" onclick="distribuirStock('${nombreSucursal}')">Distribuir Stock</button>
    `;
    sucursal.tabla = nuevaTabla.querySelector('table');
    sucursalesContenido.appendChild(nuevaTabla);
        alert("Sucursal añadida con éxito.");
}

async function cargarProductosSucursal_CUU(sucursalSucursal_CUUContenido, Sucursal_CUUTabla) {
    const inventarioTabla = document.getElementById(Sucursal_CUUTabla);

    // Obtener los productos de la sucursal "Sucursal_CUU" de la hoja de cálculo
    const productos = await obtenerProductosSucursal_CUU();

    // Limpiar la tabla antes de agregar nuevos productos
    inventarioTabla.innerHTML = '<tr><th>Fecha</th><th>Nombre</th><th>Descripción</th><th>Sección</th><th>Compra</th><th>Venta</th><th>Stock</th><th>Código</th></tr>';

    // Llenar la tabla con los productos
    productos.forEach(producto => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${producto.Fecha}</td>
            <td>${producto.Nombre}</td>
            <td>${producto.Descripción}</td>
            <td>${producto.Sección}</td>
            <td>${producto.Compra}</td>
            <td>${producto.Venta}</td>
            <td>${producto.Stock}</td>
            <td>${producto.Código}</td>
        `;
        inventarioTabla.appendChild(newRow);
    });
}

window.addEventListener('load', async () => {
    // Cargar productos en la tabla de la sucursal "Sucursal_CUU"
    await cargarProductosSucursal_CUU('sucursalSucursal_CUUContenido', 'Sucursal_CUUTabla');
});

async function cargarProductosCredito(sucursalCreditoContenido, CreditoTabla) {
    const inventarioTabla = document.getElementById(CreditoTabla);

    // Obtener los productos de la sucursal "Credito" de la hoja de cálculo
    const productos = await obtenerProductosCredito();

    // Limpiar la tabla antes de agregar nuevos productos
    inventarioTabla.innerHTML = '<tr><th>Fecha</th><th>Nombre</th><th>Descripción</th><th>Sección</th><th>Compra</th><th>Venta</th><th>Stock</th><th>Código</th></tr>';

    // Llenar la tabla con los productos
    productos.forEach(producto => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${producto.Fecha}</td>
            <td>${producto.Nombre}</td>
            <td>${producto.Descripción}</td>
            <td>${producto.Sección}</td>
            <td>${producto.Compra}</td>
            <td>${producto.Venta}</td>
            <td>${producto.Stock}</td>
            <td>${producto.Código}</td>
        `;
        inventarioTabla.appendChild(newRow);
    });
}

window.addEventListener('load', async () => {
    // Cargar productos en la tabla de la sucursal "Sucursal_CUU"
    await cargarProductosCredito('sucursalCreditoContenido', 'CreditoTabla');
});

async function cargarProductosPrestamo(sucursalPrestamoContenido, PrestamoTabla) {
    const inventarioTabla = document.getElementById(PrestamoTabla);

    // Obtener los productos de la sucursal "Credito" de la hoja de cálculo
    const productos = await obtenerProductosPrestamo();

    // Limpiar la tabla antes de agregar nuevos productos
    inventarioTabla.innerHTML = '<tr><th>Fecha</th><th>Nombre</th><th>Descripción</th><th>Sección</th><th>Compra</th><th>Venta</th><th>Stock</th><th>Código</th></tr>';

    // Llenar la tabla con los productos
    productos.forEach(producto => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${producto.Fecha}</td>
            <td>${producto.Nombre}</td>
            <td>${producto.Descripción}</td>
            <td>${producto.Sección}</td>
            <td>${producto.Compra}</td>
            <td>${producto.Venta}</td>
            <td>${producto.Stock}</td>
            <td>${producto.Código}</td>
        `;
        inventarioTabla.appendChild(newRow);
    });
}

window.addEventListener('load', async () => {
    // Cargar productos en la tabla de la sucursal "Sucursal_CUU"
    await cargarProductosPrestamo('sucursalPrestamoContenido', 'PrestamoTabla');
});

async function obtenerProductosSucursal_CUU() {
    try {
        const respuesta = await fetch(`https://sheet.best/api/sheets/88819217-85ef-4b96-85f4-e2966fc927c0/tabs/Sucursal_CUU`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const productos = await respuesta.json();
        return productos;
    } catch (error) {
        console.log(error);
        return [];
    }
}

async function obtenerProductosCredito() {
    try {
        const respuesta = await fetch(`https://sheet.best/api/sheets/88819217-85ef-4b96-85f4-e2966fc927c0/tabs/Credito`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const productos = await respuesta.json();
        return productos;
    } catch (error) {
        console.log(error);
        return [];
    }
}

async function obtenerProductosPrestamo() {
    try {
        const respuesta = await fetch(`https://sheet.best/api/sheets/88819217-85ef-4b96-85f4-e2966fc927c0/tabs/Prestamo`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const productos = await respuesta.json();
        return productos;
    } catch (error) {
        console.log(error);
        return [];
    }
}

async function enviarProductoSucursal_CUU(producto) {
    try {
        const respuesta = await fetch('https://sheet.best/api/sheets/88819217-85ef-4b96-85f4-e2966fc927c0/tabs/Sucursal_CUU', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "Fecha": producto.fechaActual,
                "Nombre": producto.nombre,
                "Descripción": producto.descripcion,
                "Sección": producto.seccion,
                "Compra": producto.compra,
                "Venta": producto.venta,
                "Stock": producto.stock,
                "Código": producto.codigo
            })
        });

        const contenido = await respuesta.json();
        console.log(contenido);
    } catch (error) {
        console.log(error);
    }
}

async function enviarProductoCredito(producto) {
    try {
        const respuesta = await fetch('https://sheet.best/api/sheets/88819217-85ef-4b96-85f4-e2966fc927c0/tabs/Credito', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "Fecha": producto.fechaActual,
                "Nombre": producto.nombre,
                "Descripción": producto.descripcion,
                "Sección": producto.seccion,
                "Compra": producto.compra,
                "Venta": producto.venta,
                "Stock": producto.stock,
                "Código": producto.codigo
            })
        });

        const contenido = await respuesta.json();
        console.log(contenido);
    } catch (error) {
        console.log(error);
    }
}

async function enviarProductoPrestamo(producto) {
    try {
        const respuesta = await fetch('https://sheet.best/api/sheets/88819217-85ef-4b96-85f4-e2966fc927c0/tabs/Prestamo', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "Fecha": producto.fechaActual,
                "Nombre": producto.nombre,
                "Descripción": producto.descripcion,
                "Sección": producto.seccion,
                "Compra": producto.compra,
                "Venta": producto.venta,
                "Stock": producto.stock,
                "Código": producto.codigo
            })
        });

        const contenido = await respuesta.json();
        console.log(contenido);
    } catch (error) {
        console.log(error);
    }
}

async function enviarProductoSucursal_CUAU(producto) {
    try {
        const respuesta = await fetch('https://sheet.best/api/sheets/88819217-85ef-4b96-85f4-e2966fc927c0/tabs/Sucursal_CUAU', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "Fecha": producto.fechaActual,
                "Nombre": producto.nombre,
                "Descripción": producto.descripcion,
                "Sección": producto.seccion,
                "Compra": producto.compra,
                "Venta": producto.venta,
                "Stock": producto.stock,
                "Código": producto.codigo
            })
        });

        const contenido = await respuesta.json();
        console.log(contenido);
    } catch (error) {
        console.log(error);
    }
}


function distribuirStock(sucursalNombre) {
    const sucursal = sucursales.find(s => s.nombre === sucursalNombre);
    if (!sucursal) return;

    const codigo = prompt(`Ingrese el código del producto para la sucursal ${sucursalNombre}`);
    const cantidad = parseInt(prompt(`Ingrese la cantidad de stock a distribuir a la sucursal ${sucursalNombre}`));

        const inventario = document.getElementById('inventario').getElementsByTagName('tr');
        for (let i = 1; i < inventario.length; i++) {
            const codigoProducto = inventario[i].getElementsByTagName('td')[7].textContent;
            if (codigo === codigoProducto) {
                const stockCell = inventario[i].getElementsByTagName('td')[6];
                const cantidadDistribuida = Math.min(cantidad, Number(stockCell.textContent));
                stockCell.textContent = Number(stockCell.textContent) - cantidadDistribuida;

                const newRow = sucursal.tabla.insertRow();
                newRow.innerHTML = `
                    <td>${inventario[i].getElementsByTagName('td')[0].textContent}</td>
                    <td>${inventario[i].getElementsByTagName('td')[1].textContent}</td>
                    <td>${inventario[i].getElementsByTagName('td')[2].textContent}</td>
                    <td>${inventario[i].getElementsByTagName('td')[3].textContent}</td>
                    <td>${inventario[i].getElementsByTagName('td')[4].textContent}</td>
                    <td>${inventario[i].getElementsByTagName('td')[5].textContent}</td>
                    <td>${cantidadDistribuida}</td>
                    <td>${codigo}</td>
                `;
                
                const productoDistribuido = {
                    fechaActual: inventario[i].getElementsByTagName('td')[0].textContent,
                    nombre: inventario[i].getElementsByTagName('td')[1].textContent,
                    descripcion: inventario[i].getElementsByTagName('td')[2].textContent,
                    seccion: inventario[i].getElementsByTagName('td')[3].textContent,
                    compra: inventario[i].getElementsByTagName('td')[4].textContent,
                    venta: inventario[i].getElementsByTagName('td')[5].textContent,
                    stock: cantidadDistribuida,
                    codigo: codigo
                };

                sucursal.inventario.push(productoDistribuido);

                // Si el nombre de la sucursal es "Sucursal_CUU", activa enviarProductoHojaCalculo
                if (sucursalNombre === "Sucursal_CUU") {
                    enviarProductoSucursal_CUU(productoDistribuido);
                    
                } else if (sucursalNombre === "Credito") {
                // Agrega acciones específicas para "Otra Sucursal"
                    enviarProductoCredito(productoDistribuido);

                } else if (sucursalNombre === "Prestamo") {
                    // Agrega acciones específicas para "Otra Sucursal"
                        enviarProductoPrestamo(productoDistribuido);

                } else if (sucursalNombre === "Sucursal CUAU") {
                    // Agrega acciones específicas para "Otra Sucursal"
                        enviarProductoSucursal_CUAU(productoDistribuido);

                }

                break;
            }
        }
}

function agregarProductoSucursal_CUU() {
    const sucursales = [
        { nombre: "Sucursal_CUU", tabla: document.getElementById('Sucursal_CUUTabla'), inventario: [] },
        // Otras sucursales...
    ];
    const sucursalNombre = "Sucursal_CUU";
    const sucursal = sucursales.find(s => s.nombre === sucursalNombre);

    if (!sucursal) {
        alert("Sucursal no encontrada.");
        return;
    }

    const codigo = prompt(`Ingrese el código del producto a agregar a la sucursal ${sucursalNombre}`);

    const inventario = document.getElementById('inventario').getElementsByTagName('tr');

    for (let i = 1; i < inventario.length; i++) {
        const codigoProducto = inventario[i].getElementsByTagName('td')[7].textContent;

        if (codigo === codigoProducto) {
            const cantidadStockAlmacen = parseInt(inventario[i].getElementsByTagName('td')[6].textContent);

            // Preguntar la cantidad de stock a llevar a la sucursal
            const cantidad = parseInt(prompt(`Ingrese la cantidad de stock a llevar a la sucursal ${sucursalNombre}`));

            if (isNaN(cantidad) || cantidad <= 0 || cantidad > cantidadStockAlmacen) {
                alert("Cantidad inválida. Asegúrese de ingresar un número mayor que cero y no mayor que el stock disponible en el almacén principal.");
                return;
            }

            // Restar la cantidad del stock en el almacén principal
            inventario[i].getElementsByTagName('td')[6].textContent = cantidadStockAlmacen - cantidad;

            // Agregar el producto a la tabla de la sucursal Sucursal_CUU con la cantidad especificada
            const tablaSucursal_CUU = document.getElementById('Sucursal_CUUTabla');
            const newRow = tablaSucursal_CUU.insertRow();
            newRow.innerHTML = `
                <td>${inventario[i].getElementsByTagName('td')[0].textContent}</td>
                <td>${inventario[i].getElementsByTagName('td')[1].textContent}</td>
                <td>${inventario[i].getElementsByTagName('td')[2].textContent}</td>
                <td>${inventario[i].getElementsByTagName('td')[3].textContent}</td>
                <td>${inventario[i].getElementsByTagName('td')[4].textContent}</td>
                <td>${inventario[i].getElementsByTagName('td')[5].textContent}</td>
                <td>${cantidad}</td>
                <td>${codigo}</td>
            `;

            // Actualizar el stock localmente en la sucursal
            sucursal.inventario.push({
                fechaActual: inventario[i].getElementsByTagName('td')[0].textContent,
                nombre: inventario[i].getElementsByTagName('td')[1].textContent,
                descripcion: inventario[i].getElementsByTagName('td')[2].textContent,
                seccion: inventario[i].getElementsByTagName('td')[3].textContent,
                compra: inventario[i].getElementsByTagName('td')[4].textContent,
                venta: inventario[i].getElementsByTagName('td')[5].textContent,
                stock: cantidad,
                codigo: codigo
            });

            // Enviar el producto a la hoja de cálculo
            enviarProductoSucursal_CUU({
                fechaActual: inventario[i].getElementsByTagName('td')[0].textContent,
                nombre: inventario[i].getElementsByTagName('td')[1].textContent,
                descripcion: inventario[i].getElementsByTagName('td')[2].textContent,
                seccion: inventario[i].getElementsByTagName('td')[3].textContent,
                compra: inventario[i].getElementsByTagName('td')[4].textContent,
                venta: inventario[i].getElementsByTagName('td')[5].textContent,
                stock: cantidad,
                codigo: codigo
            });

            alert(`Se llevaron ${cantidad} unidades del producto con código ${codigo} a la sucursal ${sucursalNombre}`);
            return; // Salir después de agregar el producto
        }
    }

    alert(`No se encontró ningún producto con el código proporcionado en el inventario.`);
}

function agregarProductoCredito() {
    const sucursales = [
        { nombre: "Credito", tabla: document.getElementById('CreditoTabla'), inventario: [] },
        // Otras sucursales...
    ];
    const sucursalNombre = "Credito";
    const sucursal = sucursales.find(s => s.nombre === sucursalNombre);

    if (!sucursal) {
        alert("Sucursal no encontrada.");
        return;
    }

    const codigo = prompt(`Ingrese el código del producto a agregar a la sucursal ${sucursalNombre}`);

    const inventario = document.getElementById('inventario').getElementsByTagName('tr');

    for (let i = 1; i < inventario.length; i++) {
        const codigoProducto = inventario[i].getElementsByTagName('td')[7].textContent;

        if (codigo === codigoProducto) {
            const cantidadStockAlmacen = parseInt(inventario[i].getElementsByTagName('td')[6].textContent);

            // Preguntar la cantidad de stock a llevar a la sucursal
            const cantidad = parseInt(prompt(`Ingrese la cantidad de stock a llevar a la sucursal ${sucursalNombre}`));

            if (isNaN(cantidad) || cantidad <= 0 || cantidad > cantidadStockAlmacen) {
                alert("Cantidad inválida. Asegúrese de ingresar un número mayor que cero y no mayor que el stock disponible en el almacén principal.");
                return;
            }

            // Restar la cantidad del stock en el almacén principal
            inventario[i].getElementsByTagName('td')[6].textContent = cantidadStockAlmacen - cantidad;

            // Agregar el producto a la tabla de la sucursal Sucursal_CUU con la cantidad especificada
            const tablaSucursal_CUU = document.getElementById('CreditoTabla');
            const newRow = tablaSucursal_CUU.insertRow();
            newRow.innerHTML = `
                <td>${inventario[i].getElementsByTagName('td')[0].textContent}</td>
                <td>${inventario[i].getElementsByTagName('td')[1].textContent}</td>
                <td>${inventario[i].getElementsByTagName('td')[2].textContent}</td>
                <td>${inventario[i].getElementsByTagName('td')[3].textContent}</td>
                <td>${inventario[i].getElementsByTagName('td')[4].textContent}</td>
                <td>${inventario[i].getElementsByTagName('td')[5].textContent}</td>
                <td>${cantidad}</td>
                <td>${codigo}</td>
            `;

            // Actualizar el stock localmente en la sucursal
            sucursal.inventario.push({
                fechaActual: inventario[i].getElementsByTagName('td')[0].textContent,
                nombre: inventario[i].getElementsByTagName('td')[1].textContent,
                descripcion: inventario[i].getElementsByTagName('td')[2].textContent,
                seccion: inventario[i].getElementsByTagName('td')[3].textContent,
                compra: inventario[i].getElementsByTagName('td')[4].textContent,
                venta: inventario[i].getElementsByTagName('td')[5].textContent,
                stock: cantidad,
                codigo: codigo
            });

            // Enviar el producto a la hoja de cálculo
            enviarProductoCredito({
                fechaActual: inventario[i].getElementsByTagName('td')[0].textContent,
                nombre: inventario[i].getElementsByTagName('td')[1].textContent,
                descripcion: inventario[i].getElementsByTagName('td')[2].textContent,
                seccion: inventario[i].getElementsByTagName('td')[3].textContent,
                compra: inventario[i].getElementsByTagName('td')[4].textContent,
                venta: inventario[i].getElementsByTagName('td')[5].textContent,
                stock: cantidad,
                codigo: codigo
            });

            alert(`Se llevaron ${cantidad} unidades del producto con código ${codigo} a la sucursal ${sucursalNombre}`);
            return; // Salir después de agregar el producto
        }
    }

    alert(`No se encontró ningún producto con el código proporcionado en el inventario.`);
}

function agregarProductoPrestamo() {
    const sucursales = [
        { nombre: "Prestamo", tabla: document.getElementById('PrestamoTabla'), inventario: [] },
        // Otras sucursales...
    ];
    const sucursalNombre = "Prestamo";
    const sucursal = sucursales.find(s => s.nombre === sucursalNombre);

    if (!sucursal) {
        alert("Sucursal no encontrada.");
        return;
    }

    const codigo = prompt(`Ingrese el código del producto a agregar a la sucursal ${sucursalNombre}`);

    const inventario = document.getElementById('inventario').getElementsByTagName('tr');

    for (let i = 1; i < inventario.length; i++) {
        const codigoProducto = inventario[i].getElementsByTagName('td')[7].textContent;

        if (codigo === codigoProducto) {
            const cantidadStockAlmacen = parseInt(inventario[i].getElementsByTagName('td')[6].textContent);

            // Preguntar la cantidad de stock a llevar a la sucursal
            const cantidad = parseInt(prompt(`Ingrese la cantidad de stock a llevar a la sucursal ${sucursalNombre}`));

            if (isNaN(cantidad) || cantidad <= 0 || cantidad > cantidadStockAlmacen) {
                alert("Cantidad inválida. Asegúrese de ingresar un número mayor que cero y no mayor que el stock disponible en el almacén principal.");
                return;
            }

            // Restar la cantidad del stock en el almacén principal
            inventario[i].getElementsByTagName('td')[6].textContent = cantidadStockAlmacen - cantidad;

            // Agregar el producto a la tabla de la sucursal Sucursal_CUU con la cantidad especificada
            const tablaSucursal_CUU = document.getElementById('PrestamoTabla');
            const newRow = tablaSucursal_CUU.insertRow();
            newRow.innerHTML = `
                <td>${inventario[i].getElementsByTagName('td')[0].textContent}</td>
                <td>${inventario[i].getElementsByTagName('td')[1].textContent}</td>
                <td>${inventario[i].getElementsByTagName('td')[2].textContent}</td>
                <td>${inventario[i].getElementsByTagName('td')[3].textContent}</td>
                <td>${inventario[i].getElementsByTagName('td')[4].textContent}</td>
                <td>${inventario[i].getElementsByTagName('td')[5].textContent}</td>
                <td>${cantidad}</td>
                <td>${codigo}</td>
            `;

            // Actualizar el stock localmente en la sucursal
            sucursal.inventario.push({
                fechaActual: inventario[i].getElementsByTagName('td')[0].textContent,
                nombre: inventario[i].getElementsByTagName('td')[1].textContent,
                descripcion: inventario[i].getElementsByTagName('td')[2].textContent,
                seccion: inventario[i].getElementsByTagName('td')[3].textContent,
                compra: inventario[i].getElementsByTagName('td')[4].textContent,
                venta: inventario[i].getElementsByTagName('td')[5].textContent,
                stock: cantidad,
                codigo: codigo
            });

            // Enviar el producto a la hoja de cálculo
            enviarProductoPrestamo({
                fechaActual: inventario[i].getElementsByTagName('td')[0].textContent,
                nombre: inventario[i].getElementsByTagName('td')[1].textContent,
                descripcion: inventario[i].getElementsByTagName('td')[2].textContent,
                seccion: inventario[i].getElementsByTagName('td')[3].textContent,
                compra: inventario[i].getElementsByTagName('td')[4].textContent,
                venta: inventario[i].getElementsByTagName('td')[5].textContent,
                stock: cantidad,
                codigo: codigo
            });

            alert(`Se llevaron ${cantidad} unidades del producto con código ${codigo} a la sucursal ${sucursalNombre}`);
            return; // Salir después de agregar el producto
        }
    }

    alert(`No se encontró ningún producto con el código proporcionado en el inventario.`);
}

let productoSeleccionado = null;

function distribuirStockSucursal() {
    const sucursalSeleccionada = document.getElementById('selectSucursales').value;
    const sucursal = sucursales.find(s => s.nombre === sucursalSeleccionada);

    if (!sucursal) {
        alert("Por favor selecciona una sucursal válida.");
        return;
    }

    const codigo = prompt(`Ingrese el código del producto para la sucursal ${sucursalSeleccionada}`);
    const cantidad = parseInt(prompt(`Ingrese la cantidad de stock a distribuir a la sucursal ${sucursalSeleccionada}`));

    const inventario = document.getElementById('inventario').getElementsByTagName('tr');

    for (let i = 1; i < inventario.length; i++) {
        const codigoProducto = inventario[i].getElementsByTagName('td')[7].textContent;

        if (codigo === codigoProducto) {
            const stockCell = inventario[i].getElementsByTagName('td')[6];
            const cantidadDistribuida = Math.min(cantidad, Number(stockCell.textContent));

            if (cantidadDistribuida > 0) {
                stockCell.textContent = Number(stockCell.textContent) - cantidadDistribuida;

                const newRow = sucursal.tabla.insertRow();
                newRow.innerHTML = `
                    <td>${inventario[i].getElementsByTagName('td')[0].textContent}</td>
                    <td>${inventario[i].getElementsByTagName('td')[1].textContent}</td>
                    <td>${inventario[i].getElementsByTagName('td')[2].textContent}</td>
                    <td>${inventario[i].getElementsByTagName('td')[3].textContent}</td>
                    <td>${inventario[i].getElementsByTagName('td')[4].textContent}</td>
                    <td>${inventario[i].getElementsByTagName('td')[5].textContent}</td>
                    <td>${cantidadDistribuida}</td>
                    <td>${codigo}</td>
                `;

                sucursal.inventario.push({
                    fechaActual: inventario[i].getElementsByTagName('td')[0].textContent,
                    nombre: inventario[i].getElementsByTagName('td')[1].textContent,
                    descripcion: inventario[i].getElementsByTagName('td')[2].textContent,
                    seccion: inventario[i].getElementsByTagName('td')[3].textContent,
                    compra: inventario[i].getElementsByTagName('td')[4].textContent,
                    venta: inventario[i].getElementsByTagName('td')[5].textContent,
                    stock: cantidadDistribuida,
                    codigo: codigo
                });

                alert(`Stock distribuido con éxito a la sucursal ${sucursalSeleccionada}`);
            } else {
                alert("La cantidad de stock a distribuir debe ser mayor que cero.");
            }

            return; // Salir después de realizar la distribución
        }
    }

    alert(`No se encontró ningún producto con el código proporcionado en la sucursal ${sucursalSeleccionada}`);
}

function eliminarProductoDeSucursal() {
    const sucursalSeleccionada = document.getElementById('selectSucursales').value;
    const sucursal = sucursales.find(s => s.nombre === sucursalSeleccionada);

    if (!sucursal) {
        alert("Por favor selecciona una sucursal válida.");
        return;
    }

    const codigo = prompt(`Ingrese el código del producto a eliminar de la sucursal ${sucursalSeleccionada}`);

    const indiceProducto = sucursal.inventario.findIndex(p => p.codigo === codigo);

    if (indiceProducto !== -1) {
        const productoEliminado = sucursal.inventario.splice(indiceProducto, 1)[0];

        // Agregar el producto de vuelta al inventario
        const inventario = document.getElementById('inventario').getElementsByTagName('tr');
        for (let i = 1; i < inventario.length; i++) {
            const codigoProducto = inventario[i].getElementsByTagName('td')[7].textContent;
            if (codigo === codigoProducto) {
                const stockCell = inventario[i].getElementsByTagName('td')[6];
                stockCell.textContent = Number(stockCell.textContent) + productoEliminado.stock;
                break;
            }
        }

        // Eliminar fila correspondiente en la tabla de la sucursal
        const filasTabla = sucursal.tabla.getElementsByTagName('tr');
        for (let i = 1; i < filasTabla.length; i++) {
            const codigoProducto = filasTabla[i].getElementsByTagName('td')[7].textContent;

            if (codigo === codigoProducto) {
                filasTabla[i].remove();

                alert(`Producto eliminado con éxito de la sucursal ${sucursalSeleccionada}`);
                return;
            }
        }
    } else {
        alert(`No se encontró ningún producto con el código proporcionado en la sucursal ${sucursalSeleccionada}`);
    }
}

function agregarPiezasASucursal() {
    const indiceSucursal = document.getElementById('selectSucursales').selectedIndex;
    const sucursal = sucursales[indiceSucursal];

    if (sucursal) {
        const codigo = prompt(`Ingrese el código del producto que desea agregar a la sucursal ${sucursal.nombre}`);
        const cantidad = parseInt(prompt(`Ingrese la cantidad de piezas que desea agregar a la sucursal ${sucursal.nombre}`));

        if (cantidad > 0) {
            const inventario = document.getElementById('inventario').getElementsByTagName('tr');
            for (let i = 1; i < inventario.length; i++) {
                const codigoProducto = inventario[i].getElementsByTagName('td')[7].textContent;
                if (codigo === codigoProducto) {
                    const stockCell = inventario[i].getElementsByTagName('td')[6];
                    if (Number(stockCell.textContent) >= cantidad) {
                        stockCell.textContent = Number(stockCell.textContent) - cantidad;

                        // Buscar si el producto ya existe en la sucursal
                        const indiceProducto = sucursal.inventario.findIndex(p => p.codigo === codigo);

                        if (indiceProducto !== -1) {
                            // Si existe, solo actualizar el stock
                            sucursal.inventario[indiceProducto].stock += cantidad;
                            const filaSucursal = sucursal.tabla.rows[indiceProducto + 1];
                            filaSucursal.cells[6].textContent = sucursal.inventario[indiceProducto].stock;
                        } else {
                            // Si no existe, agregar una nueva fila
                            const filaSucursal = sucursal.tabla.insertRow();
                            filaSucursal.innerHTML = `
                                <td>${inventario[i].getElementsByTagName('td')[0].textContent}</td>
                                <td>${inventario[i].getElementsByTagName('td')[1].textContent}</td>
                                <td>${inventario[i].getElementsByTagName('td')[2].textContent}</td>
                                <td>${inventario[i].getElementsByTagName('td')[3].textContent}</td>
                                <td>${inventario[i].getElementsByTagName('td')[4].textContent}</td>
                                <td>${inventario[i].getElementsByTagName('td')[5].textContent}</td>
                                <td>${cantidad}</td>
                                <td>${codigo}</td>
                            `;
                            sucursal.inventario.push({
                                fechaActual: inventario[i].getElementsByTagName('td')[0].textContent,
                                nombre: inventario[i].getElementsByTagName('td')[1].textContent,
                                descripcion: inventario[i].getElementsByTagName('td')[2].textContent,
                                seccion: inventario[i].getElementsByTagName('td')[3].textContent,
                                compra: inventario[i].getElementsByTagName('td')[4].textContent,
                                venta: inventario[i].getElementsByTagName('td')[5].textContent,
                                stock: cantidad,
                                codigo: codigo
                            });
                        }

                        // Mostrar alerta de éxito
                        alert(`Se agregaron ${cantidad} piezas a la sucursal ${sucursal.nombre}.`);
                        return;
                    } else {
                        alert(`No hay suficiente stock en el inventario principal para agregar a la sucursal ${sucursal.nombre}.`);
                        return;
                    }
                }
            }

            alert(`No se encontró ningún producto con el código proporcionado.`);
        }
    } else {
        alert("Por favor selecciona una sucursal antes de agregar piezas.");
    }
}

function restarPiezasDeSucursal() {
    const indiceSucursal = document.getElementById('selectSucursales').selectedIndex;
    const sucursal = sucursales[indiceSucursal];

    if (sucursal) {
        const codigo = prompt(`Ingrese el código del producto del cual desea restar piezas en la sucursal ${sucursal.nombre}`);
        const cantidad = parseInt(prompt(`Ingrese la cantidad de piezas que desea restar en la sucursal ${sucursal.nombre}`));

        if (cantidad > 0) {
            const inventario = sucursal.tabla.getElementsByTagName('tr');
            for (let i = 1; i < inventario.length; i++) {
                const codigoProducto = inventario[i].getElementsByTagName('td')[7].textContent;
                if (codigo === codigoProducto) {
                    const stockCell = inventario[i].getElementsByTagName('td')[6];
                    if (Number(stockCell.textContent) >= cantidad) {
                        stockCell.textContent = Number(stockCell.textContent) - cantidad;

                        // Actualizar el stock en la sucursal
                        const indiceProducto = sucursal.inventario.findIndex(p => p.codigo === codigo);
                        if (indiceProducto !== -1) {
                            sucursal.inventario[indiceProducto].stock -= cantidad;
                            const filaSucursal = sucursal.tabla.rows[indiceProducto + 1];
                            filaSucursal.cells[5].textContent = sucursal.inventario[indiceProducto].stock;

                            // Mostrar alerta de éxito
                            alert(`Se restaron ${cantidad} piezas de la sucursal ${sucursal.nombre}.`);
                            return;
                        }
                    } else {
                        alert(`No hay suficiente stock en la sucursal ${sucursal.nombre} para restar.`);
                        return;
                    }
                }
            }

            alert(`No se encontró ningún producto con el código proporcionado en la sucursal ${sucursal.nombre}.`);
        }
    } else {
        alert("Por favor selecciona una sucursal antes de restar piezas.");
    }
}

async function obtenerProductosDeHojaCalculo() {
    try {
        const respuesta = await fetch('https://sheet.best/api/sheets/88819217-85ef-4b96-85f4-e2966fc927c0', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const productos = await respuesta.json();
        return productos;
    } catch (error) {
        console.log(error);
        return [];
    }
}

async function cargarProductosEnTabla() {
    const inventarioTabla = document.getElementById('inventario');

    // Obtener los productos de la hoja de cálculo
    const productos = await obtenerProductosDeHojaCalculo();

    // Llenar la tabla con los productos
    productos.forEach(producto => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${producto.Fecha}</td>
            <td>${producto.Nombre}</td>
            <td>${producto.Descripción}</td>
            <td>${producto.Sección}</td>
            <td>${producto.Compra}</td>
            <td>${producto.Venta}</td>
            <td>${producto.Stock}</td>
            <td>${producto.Código}</td>
        `;
        inventarioTabla.appendChild(newRow);
    });
}

window.addEventListener('load', cargarProductosEnTabla);