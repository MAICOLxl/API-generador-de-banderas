/*funcion para poder buscar en español y sin tilde*/
function normalizarTexto(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function buscarPais() {
  const nombre = document.getElementById("pais").value;
  const nombreBuscado = normalizarTexto(nombre);

  if (nombreBuscado === "") {
    document.getElementById("resultado").innerHTML = "<p>Escribe un pais.</p>";
    return;
  }
  /*api de rest countries*/
  fetch("https://restcountries.com/v3.1/all?fields=name,translations,flags,capital,population,region,maps,languages,currencies")
    .then(res => res.json())
    .then(data => {
      const pais = data.find(item => {
        const nombreComun = normalizarTexto(item.name && item.name.common);
        const nombreOficial = normalizarTexto(item.name && item.name.official);
        const nombreEspanol = normalizarTexto(
          item.translations &&
          item.translations.spa &&
          item.translations.spa.common
        );

        return (
          nombreComun.includes(nombreBuscado) ||
          nombreOficial.includes(nombreBuscado) ||
          nombreEspanol.includes(nombreBuscado)
        );
      });

      if (!pais) {
        document.getElementById("resultado").innerHTML = "<p>No se encontro el pais.</p>";
        return;
      }

      const bandera = pais.flags ? pais.flags.png : "";
      const nombrePais = pais.translations && pais.translations.spa
        ? pais.translations.spa.common
        : pais.name.common;
      const capital = pais.capital ? pais.capital[0] : "N/A";
      const poblacion = pais.population || "N/A";
      const region = pais.region || "N/A";
      const mapa = pais.maps ? pais.maps.googleMaps : "#";
      const lenguaje = pais.languages
        ? Object.values(pais.languages).join(", ")
        : "N/A";
      const moneda = pais.currencies
        ? Object.values(pais.currencies).map(item => item.name).join(", ")
        : "N/A";

      /*chequear en la pagina las demas funciones en caso de que quieran agregar mass*/

      document.getElementById("resultado").innerHTML = `
        <h2>${nombrePais}</h2>
        <img src="${bandera}" width="150">
        <p><b>Capital:</b> ${capital}</p>
        <p><b>Poblacion:</b> ${poblacion}</p>
        <p><b>Region:</b> ${region}</p>
        <p><b>Lenguaje:</b> ${lenguaje}</p>
        <p><b>Moneda:</b> ${moneda}</p>
        <p><b>Mapa:</b> <a href="${mapa}" target="_blank">Ver en Google Maps</a></p>
      `;
    })
    .catch(error => {
      document.getElementById("resultado").innerHTML = "<p>Ocurrio un error al buscar el pais.</p>";
      console.log("Error:", error);
    });
}
