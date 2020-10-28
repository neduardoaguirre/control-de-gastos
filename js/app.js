const formulario = document.querySelector('#agregar-mov');
const listaMovimientos = document.querySelector('#movimientos tbody');
const saldoActual = document.querySelector('#total');
const btnBorrarMov = document.querySelector('#caja-mov');
const btnBorrarCta = document.querySelector('#borrar-cta');

class cuentaCorriente {
    constructor() {
        this.saldo = 0;
        this.listado = [];
    }

    agregarMovimiento(movimiento) {
        this.listado.unshift(movimiento);
        this.calcular();
    }

    calcular() {
        const importes = this.listado.reduce((total, importes) => total + importes.cantidad, 0);
        this.saldo = importes;
        console.log(this.saldo);
    }

    eliminarMovimiento(id) {
        console.log(id);
        this.listado = this.listado.filter(elemento => elemento.id != id);
        this.calcular();
    }
    setearDesdeLs(objLs) {
        this.listado = objLs.listado;
        this.saldo = objLs.saldo;
    }

    limpiarCuenta() {
        this.saldo = 0;
        this.listado = [];
    }
}

class UI {
    imprimirMovimientos(listado, saldo) {
        this.limpiarHTML();
        listado.forEach(movimiento => {
            const {
                cantidad,
                nombre,
                fecha,
                id
            } = movimiento;

            const nuevoMov = document.createElement('tr');
            cantidad < 0 ? nuevoMov.className = 'egr' : nuevoMov.className = 'ing';
            nuevoMov.innerHTML = `
            <td>${fecha}</td>
            <td>${nombre}</td> 
            <td>$ ${cantidad}</td>
            <td>
                <a href="#"><i class="fas fa-trash borrar-mov" data-id="${id}"></i></a>
            </td>
            `;

            listaMovimientos.appendChild(nuevoMov);
            btnBorrarCta.classList.remove('disabled')
            btnBorrarCta.addEventListener('click', borrarCuenta);
        });

        this.actualizarSaldo(saldo);
        sincronizarStorage(ctaCorriente);
    }

    imprimirAlerta(msj, tipo) {
        const divMsj = document.createElement('div');

        if (tipo === 'error') {
            divMsj.classList.add('alerta', 'error');
        } else {
            divMsj.classList.add('alerta', 'exito');
        }

        divMsj.textContent = msj;
        formulario.appendChild(divMsj);
        setTimeout(() => {
            divMsj.remove();
        }, 500);
    }

    limpiarHTML() {
        while (listaMovimientos.firstChild) {
            listaMovimientos.removeChild(listaMovimientos.firstChild);
        }
    }

    actualizarSaldo(valor) {
        saldoActual.textContent = valor;
    }
}

const ui = new UI();
const ctaCorriente = new cuentaCorriente();
eventListeners();

function eventListeners() {
    formulario.addEventListener('submit', ingresarMovimiento);
    btnBorrarMov.addEventListener('click', borrarMovimiento);
    document.addEventListener('DOMContentLoaded', () => {
        if (localStorage.getItem('ctaCorriente')) {
            ctaCorriente.setearDesdeLs(JSON.parse(localStorage.getItem('ctaCorriente')))
            ui.imprimirMovimientos(ctaCorriente.listado, ctaCorriente.saldo)
        }
    })
}

function ingresarMovimiento(e) {
    e.preventDefault();
    const concepto = document.querySelector('#concepto').value;
    let importe = Number(document.querySelector('#importe').value);
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    if (tipo === 'egr') {
        importe = importe * -1;
    }

    if (concepto === '' || importe === '') {
        ui.imprimirAlerta('Ambos campos son Obligatorios', 'error');
        return;
    } else if (importe === 0 || isNaN(importe)) {
        ui.imprimirAlerta('Ingrese un importe válido', 'error');
        return;
    }

    const movimiento = {
        nombre: concepto,
        cantidad: importe,
        fecha: crearFecha(),
        id: Date.now()
    };

    ctaCorriente.agregarMovimiento(movimiento);
    ui.imprimirMovimientos(ctaCorriente.listado, ctaCorriente.saldo);
    ui.imprimirAlerta('Movimiento Agregado');
    formulario.reset();
}

function borrarMovimiento(e) {
    if (e.target.classList.contains('borrar-mov')) {
        const movId = e.target.getAttribute('data-id');
        ctaCorriente.eliminarMovimiento(movId);
        ui.imprimirMovimientos(ctaCorriente.listado, ctaCorriente.saldo);
    }
}

function borrarCuenta() {
    ctaCorriente.limpiarCuenta();
    sincronizarStorage(ctaCorriente);
    ui.limpiarHTML();
    ui.actualizarSaldo(ctaCorriente.saldo);
    btnBorrarCta.removeEventListener('click', borrarCuenta);
    btnBorrarCta.classList.add('disabled')
}

function crearFecha() {
    let hoy = new Date();
    let fecha = `${hoy.getUTCDate()}/${hoy.getMonth()+1}/${hoy.getFullYear()-2000}`;
    return fecha;
}

function sincronizarStorage(cuentaCorr) {
    localStorage.setItem('ctaCorriente', JSON.stringify(cuentaCorr))
}