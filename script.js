// Variables globales
let paisesActuales = [];
let paisesSeleccionados = [];
const CAMPOS_API = "name,translations,flags,capital,population,region,languages,currencies,cca2,cca3";
const API_URL = `https://restcountries.com/v3.1/all?fields=${CAMPOS_API}`;

// Función para normalizar texto (permite búsqueda sin tildes)
function normalizarTexto(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Cargar todos los países al iniciar
document.addEventListener("DOMContentLoaded", function() {
  cargarPaises();
  
  // Event listeners para búsqueda
  const inputBusqueda = document.getElementById("buscar-pais");
  inputBusqueda.addEventListener("input", mostrarSugerencias);
  inputBusqueda.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  });

  // Cerrar sugerencias al hacer click fuera
  document.addEventListener("click", function(e) {
    if (e.target.id !== "buscar-pais" && e.target.parentElement.id !== "sugerencias") {
      document.getElementById("sugerencias").style.display = "none";
    }
  });
});

function cargarPaises() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      paisesActuales = data.sort((a, b) => {
        const nombreA = getNombrePais(a);
        const nombreB = getNombrePais(b);
        return nombreA.localeCompare(nombreB);
      });
    })
    .catch(error => {
      console.error("Error cargando países:", error);
    });
}

function getNombrePais(pais) {
  if (pais.translations && pais.translations.spa) {
    return pais.translations.spa.common;
  }
  return pais.name.common;
}

function mostrarSugerencias() {
  const input = document.getElementById("buscar-pais");
  const busqueda = normalizarTexto(input.value);
  const sugerenciasDiv = document.getElementById("sugerencias");

  if (busqueda.length < 1) {
    sugerenciasDiv.style.display = "none";
    return;
  }

  const coincidencias = paisesActuales.filter(pais => {
    const nombreComun = normalizarTexto(pais.name.common);
    const nombreOficial = normalizarTexto(pais.name.official);
    const nombreEspanol = normalizarTexto(
      pais.translations?.spa?.common || ""
    );

    return (
      nombreComun.includes(busqueda) ||
      nombreOficial.includes(busqueda) ||
      nombreEspanol.includes(busqueda)
    );
  }).slice(0, 10); // Mostrar máximo 10 sugerencias

  if (coincidencias.length === 0) {
    sugerenciasDiv.innerHTML = "<li class='sin-resultados'>No se encontraron países</li>";
    sugerenciasDiv.style.display = "block";
    return;
  }

  sugerenciasDiv.innerHTML = coincidencias.map(pais => `
    <li onclick="seleccionarPais('${getNombrePais(pais)}', '${pais.name.common}')">
      <img src="${pais.flags.png}" alt="Bandera de ${getNombrePais(pais)}" class="mini-bandera">
      <span>${getNombrePais(pais)}</span>
    </li>
  `).join("");
  
  sugerenciasDiv.style.display = "block";
}

function seleccionarPais(nombreEspanol, nombreIngles) {
  // Verificar si ya está seleccionado
  if (paisesSeleccionados.some(p => p.name.common === nombreIngles)) {
    alert("Este país ya está seleccionado");
    return;
  }

  if (paisesSeleccionados.length >= 5) {
    alert("Máximo 5 países para comparar");
    return;
  }

  // Encontrar el país completo
  const pais = paisesActuales.find(p => p.name.common === nombreIngles);
  if (pais) {
    paisesSeleccionados.push(pais);
    actualizarListaPaises();
  }

  // Limpiar input y sugerencias
  document.getElementById("buscar-pais").value = "";
  document.getElementById("sugerencias").style.display = "none";
}

function actualizarListaPaises() {
  const lista = document.getElementById("lista-paises");
  const btnComparar = document.getElementById("btn-comparar");

  lista.innerHTML = paisesSeleccionados.map((pais, index) => `
    <div class="pais-tag">
      <img src="${pais.flags.png}" alt="Bandera" class="tag-bandera">
      <span>${getNombrePais(pais)}</span>
      <button class="btn-eliminar" onclick="eliminarPais(${index})">✕</button>
    </div>
  `).join("");

  // Habilitar botón comparar si hay mínimo 2 países
  btnComparar.disabled = paisesSeleccionados.length < 2;
}

function eliminarPais(index) {
  paisesSeleccionados.splice(index, 1);
  actualizarListaPaises();
  document.getElementById("resultado").innerHTML = "";
}

function limpiarSeleccion() {
  paisesSeleccionados = [];
  actualizarListaPaises();
  document.getElementById("resultado").innerHTML = "";
  document.getElementById("buscar-pais").value = "";
}

function compararPaises() {
  if (paisesSeleccionados.length < 2) {
    alert("Selecciona al menos 2 países para comparar");
    return;
  }

  const tabla = generarTablaComparacion();
  document.getElementById("resultado").innerHTML = tabla;
}

function generarTablaComparacion() {
  let html = '<div class="tabla-comparacion">';
  html += '<table>';
  
  // Encabezado
  html += '<thead><tr><th>Característica</th>';
  html += '</tr></thead>';

  // Body
  html += '<tbody>';

  // Paises
  html += '<tr><td><strong>Paises</strong></td>';
  paisesSeleccionados.forEach(pais => {
    html += `<th>${getNombrePais(pais)}</th>`;
  });
  html += '</tr>';


  // Bandera
  html += '<tr class="fila-bandera"><td><strong>Bandera</strong></td>';
  paisesSeleccionados.forEach(pais => {
    html += `<td><img src="${pais.flags.png}" alt="Bandera" class="bandera-comparacion"></td>`;
  });
  html += '</tr>';

  // Capital
  html += '<tr><td><strong>Capital</strong></td>';
  paisesSeleccionados.forEach(pais => {
    const capital = pais.capital ? pais.capital[0] : "N/A";
    html += `<td>${capital}</td>`;
  });
  html += '</tr>';

  // Región
  html += '<tr><td><strong>Región</strong></td>';
  paisesSeleccionados.forEach(pais => {
    html += `<td>${pais.region || "N/A"}</td>`;
  });
  html += '</tr>';

  // Población
  html += '<tr><td><strong>Población</strong></td>';
  paisesSeleccionados.forEach(pais => {
    const poblacion = pais.population ? formatearNumero(pais.population) : "N/A";
    html += `<td>${poblacion}</td>`;
  });
  html += '</tr>';

  // Idioma(s)
  html += '<tr><td><strong>Idioma(s)</strong></td>';
  paisesSeleccionados.forEach(pais => {
    const idioma = pais.languages
      ? Object.values(pais.languages).join(", ")
      : "N/A";
    html += `<td>${idioma}</td>`;
  });
  html += '</tr>';

  // Código de país
  html += '<tr><td><strong>Código</strong></td>';
  paisesSeleccionados.forEach(pais => {
    html += `<td>${pais.cca2 || pais.cca3 || "N/A"}</td>`;
  });
  html += '</tr>';

  html += '</tbody>';
  html += '</table>';
  html += '</div>';

  return html;
}

function formatearNumero(numero) {
  return new Intl.NumberFormat("es-ES").format(numero);
}
