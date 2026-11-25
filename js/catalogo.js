const urlMascotas = "https://6b06ea8157fa1297bb566cd8.mockapi.io/pets";

const listaMascotas = document.getElementById("lista-mascotas");
const plantillaMascota = document.getElementById("plantilla-mascota");
const mensajeCatalogo = document.getElementById("mensaje-catalogo");
const formularioFiltros = document.getElementById("form-filtros");

let mascotasDisponibles = [];

const mostrarMascotas = (mascotas) => {
  listaMascotas.replaceChildren();

  for (const mascota of mascotas) {
    const tarjeta = plantillaMascota.content.cloneNode(true);
    const foto = tarjeta.querySelector(".mascota-foto");
    const tamano = mascota.tamano === "pequeno" ? "pequeño" : mascota.tamano;

    foto.src = mascota.foto;
    foto.alt = `Foto de ${mascota.nombre}`;

    tarjeta.querySelector(".mascota-nombre").textContent = mascota.nombre;
    tarjeta.querySelector(".mascota-especie").textContent = mascota.especie;
    tarjeta.querySelector(".mascota-edad").textContent = `Edad: ${mascota.edad} años`;
    tarjeta.querySelector(".mascota-tamano").textContent = `Tamaño: ${tamano}`;
    tarjeta.querySelector(".mascota-vacuna").textContent = mascota.vacuna
      ? "Vacunada"
      : "Sin vacuna registrada";

    tarjeta.querySelector(".boton-postular").dataset.petId = mascota.id;
    listaMascotas.appendChild(tarjeta);
  }
};

const aplicarFiltros = () => {
  const datos = new FormData(formularioFiltros);
  const especie = datos.get("especie");
  const tamano = datos.get("tamano");
  const edadMaxima = datos.get("edad");

  const resultados = mascotasDisponibles.filter((mascota) => {
    const coincideEspecie = !especie || mascota.especie === especie;
    const coincideTamano = !tamano || mascota.tamano === tamano;
    const coincideEdad =
      edadMaxima === "" || Number(mascota.edad) <= Number(edadMaxima);

    return coincideEspecie && coincideTamano && coincideEdad;
  });

  mostrarMascotas(resultados);

  if (mascotasDisponibles.length === 0) {
    mensajeCatalogo.textContent = "Por ahora no hay mascotas disponibles.";
  } else {
    mensajeCatalogo.textContent = resultados.length
      ? ""
      : "No hay mascotas disponibles con esos filtros.";
  }
};

const cargarCatalogo = async () => {
  mensajeCatalogo.textContent = "Cargando mascotas...";

  try {
    const respuesta = await fetch(urlMascotas);

    if (!respuesta.ok) {
      throw new Error(`Error al consultar mascotas: ${respuesta.status}`);
    }

    const mascotas = await respuesta.json();
    mascotasDisponibles = mascotas.filter((mascota) => mascota.disponible === true);

    aplicarFiltros();

    formularioFiltros.addEventListener("submit", (evento) => {
      evento.preventDefault();
      aplicarFiltros();
    });

    formularioFiltros.addEventListener("reset", () => {
      setTimeout(aplicarFiltros, 0);
    });
  } catch (error) {
    console.error(error);
    mensajeCatalogo.textContent = "No se pudieron cargar las mascotas.";
  }
};

cargarCatalogo();