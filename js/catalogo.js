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

const urlSolicitudes = "https://6b06ea8157fa1297bb566cd8.mockapi.io/adoptions";

const dialogoPostulacion = document.getElementById("dialogo-postulacion");
const formularioPostulacion = document.getElementById("form-postulacion");
const nombrePostulacion = document.getElementById("nombre-postulacion");
const mensajePostulacion = document.getElementById("mensaje-postulacion");
const botonConfirmar = document.getElementById("confirmar-postulacion");
const botonCancelar = document.getElementById("cancelar-postulacion");

let mascotaSeleccionada = null;

listaMascotas.addEventListener("click", (evento) => {
  const boton = evento.target.closest(".boton-postular");
  if (!boton) return;

  const sesion = JSON.parse(sessionStorage.getItem("sesion"));

  if (!sesion) {
    window.location.href = "login.html";
    return;
  }

  if (sesion.role !== "USUARIO") {
    mensajeCatalogo.textContent = "Ingresá con una cuenta de adoptante para postularte.";
    return;
  }

  mascotaSeleccionada = mascotasDisponibles.find(
    (mascota) => String(mascota.id) === boton.dataset.petId
  );

  if (!mascotaSeleccionada) return;

  nombrePostulacion.textContent = mascotaSeleccionada.nombre;
  mensajePostulacion.textContent = "";
  dialogoPostulacion.showModal();
});

botonCancelar.addEventListener("click", () => {
  dialogoPostulacion.close();
});

dialogoPostulacion.addEventListener("cancel", (evento) => {
  if (botonConfirmar.disabled) evento.preventDefault();
});

formularioPostulacion.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const sesion = JSON.parse(sessionStorage.getItem("sesion"));
  if (sesion?.role !== "USUARIO" || !mascotaSeleccionada) return;

  botonConfirmar.disabled = true;
  botonCancelar.disabled = true;
  mensajePostulacion.textContent = "Enviando solicitud...";

  try {
    const urlMascota = `${urlMascotas}/${encodeURIComponent(mascotaSeleccionada.id)}`;
    const respuestaMascota = await fetch(urlMascota);

    if (respuestaMascota.status === 404) {
      mensajePostulacion.textContent = "Esta mascota ya no está disponible.";
      return;
    }

    if (!respuestaMascota.ok) {
      throw new Error(`Error al consultar la mascota: ${respuestaMascota.status}`);
    }

    const mascotaActual = await respuestaMascota.json();

    if (mascotaActual.disponible !== true) {
      mensajePostulacion.textContent = "Esta mascota ya no está disponible.";
      return;
    }

    const respuesta = await fetch(urlSolicitudes, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: sesion.id,
        petId: mascotaActual.id,
        fechaSolicitud: new Date().toISOString(),
        estado: "En revisión"
      })
    });

    if (!respuesta.ok) {
      throw new Error(`Error al enviar la solicitud: ${respuesta.status}`);
    }

    dialogoPostulacion.close();
    mensajeCatalogo.textContent = "Tu solicitud quedó en revisión.";
  } catch (error) {
    console.error(error);
    mensajePostulacion.textContent = "No se pudo enviar la solicitud. Volvé a intentar.";
  } finally {
    botonConfirmar.disabled = false;
    botonCancelar.disabled = false;
  }
});

const sesionCatalogo = JSON.parse(sessionStorage.getItem("sesion"));
const haySesion = Boolean(sesionCatalogo);
const botonCerrarSesion = document.getElementById("cerrar-sesion");

document.getElementById("enlace-login").hidden = haySesion;
document.getElementById("enlace-registro").hidden = haySesion;
document.getElementById("enlace-admin").hidden = sesionCatalogo?.role !== "ADMIN";
botonCerrarSesion.hidden = !haySesion;

botonCerrarSesion.addEventListener("click", () => {
  sessionStorage.removeItem("sesion");
  window.location.replace("login.html");
});