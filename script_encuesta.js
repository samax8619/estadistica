/* script_encuesta.js
   Logica del formulario asistente (una pregunta a la vez).
   Guarda en localStorage bajo clave "encuesta_personas".
   Evitar tildes en textos dentro del codigo cuando posible.
*/

const STORAGE_KEY = "encuesta_personas";

// Definicion de preguntas (las opciones se muestran tal como se piden).
// Tipo: "single" (una opcion), "multi" (varias opciones), "numeric" (entrada libre)
const PREGUNTAS = [
  { id: "edad", text: "Edad (anos)", type: "numeric" },
  { id: "sexo", text: "Sexo", type: "single", options: ["Hombre", "Mujer"] },
  { id: "estadoCivil", text: "Estado civil", type: "single", options: ["Soltero(a)", "Casado(a)", "Union libre", "Separado(a)", "Viudo(a)"] },
  { id: "nivelEducativo", text: "Nivel educativo", type: "single", options: ["Ninguno", "Primaria", "Secundaria", "Tecnica", "Profesional"] },
  { id: "numeroHogar", text: "Numero de personas que viven en su hogar", type: "numeric" },
  { id: "gastoDiario", text: "Cuanto gasta en promedio al dia para su negocio (valor en moneda)", type: "numeric" },
  { id: "tipoVivienda", text: "Tipo de vivienda", type: "single", options: ["Propia", "En arriendo", "Familiar", "No tiene"] },
  { id: "afiliacionSalud", text: "Afiliacion a salud", type: "single", options: ["Si", "No"] },
  { id: "estrato", text: "Estrato socioeconomico", type: "single", options: ["1", "2", "3", "4 o mas"] },
  { id: "recibeSubsidio", text: "Recibe algun tipo de subsidio o ayuda estatal", type: "single", options: ["Si", "No"] },

  { id: "anosComercio", text: "Hace cuanto tiempo se dedica al comercio ambulante (anos)", type: "numeric" },
  { id: "productosPorDia", text: "Cuantos productos vende al dia", type: "numeric" },
  { id: "estabilidadIngresos", text: "Como califica la estabilidad de sus ingresos", type: "single", options: ["Muy estables", "Estables", "Irregulares", "Muy inestables"] },
  { id: "ingresoPromedio", text: "Ingreso promedio diario (valor en moneda)", type: "numeric" },
  { id: "diasPorSemana", text: "Cuantos dias a la semana trabaja", type: "numeric" },
  { id: "lugarFijo", text: "Cuenta con un lugar fijo para vender", type: "single", options: ["Si", "No"] },
  { id: "permisoMunicipal", text: "Tiene permiso municipal para ejercer su actividad", type: "single", options: ["Si", "No"] },
  { id: "gastosPrincipales", text: "Que gastos principales debe cubrir con sus ingresos (marca los que apliquen)", type: "multi", options: ["Alimentacion", "Vivienda", "Educacion", "Salud", "Transporte", "Ninguno"] },
  { id: "haMejorado", text: "Su actividad economica ha mejorado en el ultimo ano", type: "single", options: ["Si", "No", "Se ha mantenido igual"] },
  { id: "ingresosSuficientes", text: "Considera que sus ingresos son suficientes para cubrir las necesidades basicas", type: "single", options: ["Si", "Parcialmente", "No"] },

  { id: "actividadUnica", text: "Esta actividad es su unica fuente de ingresos", type: "single", options: ["Si", "No"] },
  { id: "otroEmpleo", text: "Cuenta con otro empleo o fuente de ingreso adicional", type: "single", options: ["Si", "No"] },
  { id: "horasPorDia", text: "Horas promedio que trabaja al dia", type: "numeric" },
  { id: "seguroProteccion", text: "Tiene algun tipo de seguro o proteccion laboral", type: "single", options: ["Si", "No"] },
  { id: "afiliadoPension", text: "Esta afiliado a algun fondo de pension", type: "single", options: ["Si", "No"] },

  { id: "apoyoAsociaciones", text: "Recibe apoyo de organizaciones o asociaciones de vendedores informales", type: "single", options: ["Si", "No"] },
  { id: "haRecibidoCapacitaciones", text: "Ha recibido capacitaciones o formacion relacionada con su actividad", type: "single", options: ["Si", "No"] },
  { id: "nivelSatisfaccion", text: "Nivel de satisfaccion con su trabajo (1 = muy bajo, 5 = muy alto)", type: "single", options: ["1","2","3","4","5"] },
  { id: "dificultades", text: "Cuales son las principales dificultades que enfrenta (marca los que apliquen)", type: "multi", options: ["Inseguridad", "Falta de clientes", "Condiciones climaticas", "Competencia", "Otra"] },
  { id: "tipoApoyo", text: "Que tipo de apoyo considera necesario (marca los que apliquen)", type: "multi", options: ["Creditos o ayudas financieras", "Espacios regulados para vender", "Capacitaciones", "Apoyo de la Alcaldia", "Ninguno"] }
];

// estado de la aplicacion
let totalPersonas = 0;
let indicePersonaActual = 0; // 0..totalPersonas-1
let respuestasActual = {}; // objeto temporal para la persona en curso
let personaIndex = 0; // indice de persona en proceso (para mostrar progreso)
let preguntaActual = 0; // indice de pregunta en PREGUNTAS
let personasGuardadas = []; // array donde se almacenan objetos de personas

// elementos DOM
const btnIniciar = document.getElementById("btnIniciar");
const numeroPersonasInput = document.getElementById("numeroPersonas");
const formCard = document.getElementById("formCard");
const preguntaContainer = document.getElementById("preguntaContainer");
const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");
const btnGuardarPersona = document.getElementById("btnGuardarPersona");
const btnFinalizar = document.getElementById("btnFinalizar");
const progresoP = document.getElementById("progreso");
const mensajeGuardado = document.getElementById("mensajeGuardado");
const mensajeError = document.getElementById("mensajeError");

btnIniciar.addEventListener("click", () => {
  const n = parseInt(numeroPersonasInput.value);
  if (!n || n < 1) {
    alert("Indica un numero valido de personas (>=1).");
    return;
  }
  totalPersonas = n;
  indicePersonaActual = 0;
  personaIndex = 1;
  respuestasActual = {};
  personasGuardadas = [];
  preguntaActual = 0;
  formCard.style.display = "block";
  updateProgreso();
  renderPregunta();
  window.scrollTo(0,0);
});

btnAnterior.addEventListener("click", () => {
  if (preguntaActual > 0) {
    guardarRespuestaTemporal();
    preguntaActual--;
    renderPregunta();
  }
});

btnSiguiente.addEventListener("click", () => {
  if (preguntaActual < PREGUNTAS.length - 1) {
    if (!validarRespuestaActual()) return;
    guardarRespuestaTemporal();
    preguntaActual++;
    renderPregunta();
  } else {
    // ultimo
    if (!validarRespuestaActual()) return;
    guardarRespuestaTemporal();
    mensajeGuardado.style.display = "none";
    mensajeError.style.display = "none";
    alert("Ya llegaste al final de las preguntas. Puedes guardar la persona.");
  }
});

btnGuardarPersona.addEventListener("click", () => {
  if (!validarTodasRespuestas()) return;
  // guardar la persona
  personasGuardadas.push(JSON.parse(JSON.stringify(respuestasActual)));
  // reset para siguiente persona
  respuestasActual = {};
  preguntaActual = 0;
  personaIndex++;
  updateProgreso();
  renderPregunta();
  mensajeGuardado.style.display = "block";
  mensajeGuardado.textContent = "Persona guardada correctamente.";
  mensajeError.style.display = "none";

  // si ya guardamos todas
  if (personasGuardadas.length >= totalPersonas) {
    alert("Se han registrado todas las personas. Seras redirigido a resultados.");
    // guardar en localStorage y redirigir
    localStorage.setItem(STORAGE_KEY, JSON.stringify(personasGuardadas));
    window.location.href = "resultados.html";
  }
});

btnFinalizar.addEventListener("click", () => {
  if (personasGuardadas.length === 0) {
    if (!confirm("No hay personas guardadas. Deseas guardar la persona actual antes de finalizar?")) {
      // se guarda lo que haya en respuestasActual si esta completa
      if (Object.keys(respuestasActual).length > 0) {
        if (validarTodasRespuestas()) {
          personasGuardadas.push(JSON.parse(JSON.stringify(respuestasActual)));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(personasGuardadas));
        }
      }
      window.location.href = "resultados.html";
      return;
    } else {
      // intentar guardar actual
      if (!validarTodasRespuestas()) return;
      personasGuardadas.push(JSON.parse(JSON.stringify(respuestasActual)));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(personasGuardadas));
      window.location.href = "resultados.html";
    }
  } else {
    // ya hay personas guardadas
    localStorage.setItem(STORAGE_KEY, JSON.stringify(personasGuardadas));
    window.location.href = "resultados.html";
  }
});

function updateProgreso() {
  progresoP.textContent = `Entrevistado ${personasGuardadas.length + (Object.keys(respuestasActual).length > 0 ? 1 : 0)} / ${totalPersonas}`;
  // habilitar/deshabilitar botones segun estado
  btnAnterior.disabled = preguntaActual === 0;
}

function renderPregunta() {
  updateProgreso();
  const q = PREGUNTAS[preguntaActual];
  preguntaContainer.innerHTML = "";

  const titulo = document.createElement("h3");
  titulo.textContent = `${preguntaActual + 1}. ${q.text}`;
  preguntaContainer.appendChild(titulo);

  // si ya hay valor en respuestasActual para esta pregunta, cargarlo
  const valorActual = respuestasActual[q.id];

  if (q.type === "single") {
    q.options.forEach(opt => {
      const label = document.createElement("label");
      label.className = "opcion";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "respuesta";
      input.value = opt;
      if (valorActual === opt) input.checked = true;
      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + opt));
      preguntaContainer.appendChild(label);
    });
  } else if (q.type === "multi") {
    const info = document.createElement("p");
    info.textContent = "Selecciona las opciones que apliquen:";
    preguntaContainer.appendChild(info);
    q.options.forEach(opt => {
      const label = document.createElement("label");
      label.className = "opcion";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "respuesta_multi";
      input.value = opt;
      if (Array.isArray(valorActual) && valorActual.includes(opt)) input.checked = true;
      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + opt));
      preguntaContainer.appendChild(label);
    });
  } else if (q.type === "numeric") {
    const input = document.createElement("input");
    input.type = "text";
    input.name = "respuesta_num";
    input.placeholder = "Escribe el valor aqui";
    input.value = valorActual !== undefined ? valorActual : "";
    preguntaContainer.appendChild(input);
  }

  // mostrar area de notas opcional
  const notas = document.createElement("textarea");
  notas.placeholder = "Observaciones (opcional)";
  notas.rows = 3;
  notas.style.width = "100%";
  notas.value = respuestasActual[ q.id + "_obs" ] || "";
  notas.addEventListener("input", (e) => {
    respuestasActual[ q.id + "_obs" ] = e.target.value;
  });
  preguntaContainer.appendChild(document.createElement("hr"));
  preguntaContainer.appendChild(notas);

  btnAnterior.disabled = preguntaActual === 0;
  btnGuardarPersona.disabled = false;
  btnSiguiente.textContent = preguntaActual < PREGUNTAS.length - 1 ? "Siguiente" : "Ultima";
}

function guardarRespuestaTemporal() {
  const q = PREGUNTAS[preguntaActual];
  if (q.type === "single") {
    const radios = document.getElementsByName("respuesta");
    let sel = null;
    for (const r of radios) if (r.checked) sel = r.value;
    respuestasActual[q.id] = sel;
  } else if (q.type === "multi") {
    const checks = document.getElementsByName("respuesta_multi");
    const lista = [];
    for (const c of checks) if (c.checked) lista.push(c.value);
    respuestasActual[q.id] = lista;
  } else if (q.type === "numeric") {
    const input = document.querySelector("input[name='respuesta_num']");
    const val = input ? input.value.trim() : "";
    respuestasActual[q.id] = val;
  }
}

function validarRespuestaActual() {
  const q = PREGUNTAS[preguntaActual];
  // algunas validaciones simples: no dejar vacio
  if (q.type === "single") {
    const radios = document.getElementsByName("respuesta");
    let sel = null;
    for (const r of radios) if (r.checked) sel = r.value;
    if (!sel) {
      mensajeError.style.display = "block";
      mensajeError.textContent = "Selecciona una opcion antes de continuar.";
      return false;
    }
  } else if (q.type === "multi") {
    // multi puede quedar vacio (ninguno), aceptamos vacio
    mensajeError.style.display = "none";
  } else if (q.type === "numeric") {
    const input = document.querySelector("input[name='respuesta_num']");
    const val = input ? input.value.trim() : "";
    if (val === "") {
      mensajeError.style.display = "block";
      mensajeError.textContent = "Ingresa un valor numerico o texto segun corresponda.";
      return false;
    }
    // no forzamos formato numerico para campos que podrian aceptar texto
    mensajeError.style.display = "none";
  }
  mensajeError.style.display = "none";
  return true;
}

function validarTodasRespuestas() {
  // recorre todas las preguntas y valida que existan respuestas en respuestasActual
  for (const q of PREGUNTAS) {
    const val = respuestasActual[q.id];
    if (val === undefined || val === null || (q.type !== "multi" && String(val).trim() === "")) {
      mensajeError.style.display = "block";
      mensajeError.textContent = `Falta responder: ${q.text}`;
      return false;
    }
  }
  mensajeError.style.display = "none";
  return true;
}

// permitir guardar avance al moverse de pregunta
window.addEventListener("beforeunload", function () {
  // no hacemos guardado automatico para no sobreescribir, usuario debe guardar personas manualmente
});
