const urlMascotas = "https://6b06ea8157fa1297bb566cd8.mockapi.io/pets";
const listaMascotas = document.getElementById("lista-mascotas");
const plantillaMascota = document.getElementById("plantilla-mascota");
const mensajeCatalogo = document.getElementById("mensaje-catalogo");

const cargarCatalogo = async () => {
  mensajeCatalogo.textContent = "Cargando mascotas...";

  try {
    const respuesta = await fetch(urlMascotas);

    if (!respuesta.ok) {
      throw new Error(`Error al consultar mascotas: ${respuesta.status}`);
    }

    const mascotas = await respuesta.json();
    const disponibles = mascotas.filter(
      (mascota) => mascota.disponible === true
    );

    listaMascotas.replaceChildren();

    for (const mascota of disponibles) {
      const tarjeta = plantillaMascota.content.cloneNode(true);
      const foto = tarjeta.querySelector(".mascota-foto");

      foto.src = mascota.foto;
      foto.alt = `Foto de ${mascota.nombre}`;

      tarjeta.querySelector(".mascota-nombre").textContent = mascota.nombre;
      tarjeta.querySelector(".mascota-especie").textContent = mascota.especie;
      tarjeta.querySelector(".mascota-edad").textContent = `Edad: ${mascota.edad} años`;
      tarjeta.querySelector(".mascota-tamano").textContent =
        `Tamaño: ${mascota.tamano === "pequeno" ? "pequeño" : mascota.tamano}`;
      tarjeta.querySelector(".mascota-vacuna").textContent = mascota.vacuna
        ? "Vacunada"
        : "Sin vacuna registrada";

      tarjeta.querySelector(".boton-postular").dataset.petId = mascota.id;
      listaMascotas.appendChild(tarjeta);
    }

    mensajeCatalogo.textContent = disponibles.length
      ? ""
      : "Por ahora no hay mascotas disponibles.";
  } catch (error) {
    console.error(error);
    mensajeCatalogo.textContent = "No se pudieron cargar las mascotas.";
  }
};

cargarCatalogo();