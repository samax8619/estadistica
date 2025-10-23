/* script_resultados.js
   Calcula y muestra tablas de frecuencia no agrupadas para cada pregunta.
*/

const STORAGE_KEY = "encuesta_personas";
const tablasContainer = document.getElementById("tablasContainer");
const infoResumen = document.getElementById("infoResumen");
const btnReiniciar = document.getElementById("btnReiniciar");

btnReiniciar.addEventListener("click", () => {
  if (confirm("Estas seguro de reiniciar todos los datos guardados? Esta accion borrara todo.")) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
});

function cargarDatos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error parseando datos:", e);
    return [];
  }
}

function generarTablas() {
  const datos = cargarDatos();
  tablasContainer.innerHTML = "";

  if (!datos || datos.length === 0) {
    infoResumen.textContent = "No hay datos registrados. Registra entrevistas desde 'Iniciar registro de entrevistas'.";
    return;
  }

  infoResumen.textContent = `Total de entrevistas registradas: ${datos.length}`;

  // Para cada pregunta en PREGUNTAS (definidas en script_encuesta.js),
  // calculamos frecuencia. Como script_encuesta.js no esta disponible aqui,
  // volvemos a declarar la lista de preguntas identica (solo para encabezados).
  const PREG = [
    { id: "edad", text: "Edad (anos)", type: "numeric" },
    { id: "sexo", text: "Sexo", type: "single" },
    { id: "estadoCivil", text: "Estado civil", type: "single" },
    { id: "nivelEducativo", text: "Nivel educativo", type: "single" },
    { id: "numeroHogar", text: "Numero de personas que viven en su hogar", type: "numeric" },
    { id: "gastoDiario", text: "Gasto diario promedio", type: "numeric" },
    { id: "tipoVivienda", text: "Tipo de vivienda", type: "single" },
    { id: "afiliacionSalud", text: "Afiliacion a salud", type: "single" },
    { id: "estrato", text: "Estrato socioeconomico", type: "single" },
    { id: "recibeSubsidio", text: "Recibe subsidio", type: "single" },

    { id: "anosComercio", text: "Anos dedicados al comercio ambulante", type: "numeric" },
    { id: "productosPorDia", text: "Productos vendidos por dia", type: "numeric" },
    { id: "estabilidadIngresos", text: "Estabilidad de ingresos", type: "single" },
    { id: "ingresoPromedio", text: "Ingreso promedio diario", type: "numeric" },
    { id: "diasPorSemana", text: "Dias trabajados por semana", type: "numeric" },
    { id: "lugarFijo", text: "Cuenta con lugar fijo para vender", type: "single" },
    { id: "permisoMunicipal", text: "Tiene permiso municipal", type: "single" },
    { id: "gastosPrincipales", text: "Gastos principales (multi)", type: "multi" },
    { id: "haMejorado", text: "Actividad ha mejorado", type: "single" },
    { id: "ingresosSuficientes", text: "Ingresos suficientes", type: "single" },

    { id: "actividadUnica", text: "Actividad unica fuente de ingresos", type: "single" },
    { id: "otroEmpleo", text: "Cuenta con otro empleo", type: "single" },
    { id: "horasPorDia", text: "Horas promedio por dia", type: "numeric" },
    { id: "seguroProteccion", text: "Tiene seguro o proteccion laboral", type: "single" },
    { id: "afiliadoPension", text: "Afiliado a fondo de pension", type: "single" },

    { id: "apoyoAsociaciones", text: "Recibe apoyo de asociaciones", type: "single" },
    { id: "haRecibidoCapacitaciones", text: "Ha recibido capacitaciones", type: "single" },
    { id: "nivelSatisfaccion", text: "Nivel de satisfaccion (1-5)", type: "single" },
    { id: "dificultades", text: "Principales dificultades (multi)", type: "multi" },
    { id: "tipoApoyo", text: "Tipo de apoyo necesario (multi)", type: "multi" }
  ];

  // para cada pregunta calculamos frecuencias
  PREG.forEach(p => {
    // acumulador
    const freq = {};
    let totalRegistros = datos.length;

    if (p.type === "multi") {
      // cada registro tiene un array
      datos.forEach(r => {
        const arr = r[p.id];
        if (!Array.isArray(arr)) return;
        arr.forEach(op => {
          if (!op) return;
          freq[op] = (freq[op] || 0) + 1;
        });
      });
    } else {
      datos.forEach(r => {
        let v = r[p.id];
        if (v === undefined || v === null || String(v).trim() === "") {
          v = "(Sin dato)";
        }
        freq[v] = (freq[v] || 0) + 1;
      });
    }

    // construir tabla HTML
    const section = document.createElement("section");
    section.className = "card";
    const h3 = document.createElement("h3");
    h3.textContent = p.text;
    section.appendChild(h3);

    const tabla = document.createElement("table");
    tabla.style.width = "100%";
    tabla.style.borderCollapse = "collapse";

    const thead = document.createElement("thead");
    thead.innerHTML = `<tr style="background:#0352A6;color:#fff">
                         <th style="padding:8px;border:1px solid #ddd;text-align:left">Categoria</th>
                         <th style="padding:8px;border:1px solid #ddd;text-align:right">Frecuencia (f)</th>
                         <th style="padding:8px;border:1px solid #ddd;text-align:right">Porcentaje (%)</th>
                       </tr>`;
    tabla.appendChild(thead);

    const tbody = document.createElement("tbody");

    // convertir freq a array ordenado (por frecuencia descendente)
    const items = Object.keys(freq).map(k => ({ categoria: k, f: freq[k] }));
    // ordenar: si es numeric, tratar de ordenar por valor; sino por f desc
    const todosValoresNumericos = items.every(it => !isNaN(Number(it.categoria)));
    if (todosValoresNumericos) {
      items.sort((a,b) => Number(a.categoria) - Number(b.categoria));
    } else {
      items.sort((a,b) => b.f - a.f);
    }

    let sumaF = 0;
    items.forEach(it => sumaF += it.f);

    items.forEach(it => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td style="padding:8px;border:1px solid #ddd;text-align:left">${it.categoria}</td>
                      <td style="padding:8px;border:1px solid #ddd;text-align:right">${it.f}</td>
                      <td style="padding:8px;border:1px solid #ddd;text-align:right">${((it.f / totalRegistros) * 100).toFixed(1)}</td>`;
      tbody.appendChild(tr);
    });

    // fila total
    const trTotal = document.createElement("tr");
    trTotal.innerHTML = `<td style="padding:8px;border:1px solid #ddd;font-weight:bold">Total (N)</td>
                         <td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold">${totalRegistros}</td>
                         <td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold">100.0</td>`;
    tbody.appendChild(trTotal);

    tabla.appendChild(tbody);
    section.appendChild(tabla);

    tablasContainer.appendChild(section);
  });
}

document.addEventListener("DOMContentLoaded", generarTablas);
  