const sesion = JSON.parse(sessionStorage.getItem("sesion"));

if (sesion?.role !== "ADMIN") {
  window.location.replace("login.html");
} else {
  const botonCerrarSesion = document.getElementById("cerrar-sesion");

  botonCerrarSesion.addEventListener("click", () => {
    sessionStorage.removeItem("sesion");
    window.location.replace("login.html");
  });

  const urlMascotas = "https://6b06ea8157fa1297bb566cd8.mockapi.io/pets";
  const listaMascotas = document.getElementById("lista-mascotas");
  const mensajeAdmin = document.getElementById("mensaje-admin");

  const cargarMascotas = async () => {
    mensajeAdmin.textContent = "Cargando mascotas...";

    try {
      const respuesta = await fetch(urlMascotas);

      if (!respuesta.ok) {
        throw new Error(`MockAPI respondió con el código ${respuesta.status}`);
      }

      const mascotas = await respuesta.json();
      listaMascotas.replaceChildren();

      for (const mascota of mascotas) {
        const fila = listaMascotas.insertRow();

        fila.insertCell().textContent = mascota.nombre;
        fila.insertCell().textContent = mascota.especie;
        fila.insertCell().textContent = mascota.edad;
        fila.insertCell().textContent = mascota.tamano;
        fila.insertCell().textContent = mascota.disponible
          ? "Disponible"
          : "No disponible";

        fila.insertCell();
      }

      mensajeAdmin.textContent = mascotas.length
        ? ""
        : "Todavía no hay mascotas cargadas.";
    } catch (error) {
      console.error(error);
      mensajeAdmin.textContent = "No se pudieron cargar las mascotas.";
    }
  };

const formularioMascota = document.getElementById("form-mascota");
const botonGuardar = formularioMascota.querySelector('button[type="submit"]');

formularioMascota.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const datos = new FormData(formularioMascota);
  const mascota = {
    nombre: datos.get("nombre").trim(),
    especie: datos.get("especie"),
    edad: Number(datos.get("edad")),
    tamano: datos.get("tamano"),
    foto: datos.get("foto").trim(),
    vacuna: datos.has("vacuna"),
    disponible: datos.has("disponible")
  };

  if (!mascota.nombre) {
    mensajeAdmin.textContent = "Escribí el nombre de la mascota.";
    return;
  }

  botonGuardar.disabled = true;
  mensajeAdmin.textContent = "Guardando mascota...";

  try {
    const respuesta = await fetch(urlMascotas, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mascota)
    });

    if (!respuesta.ok) {
      throw new Error(`MockAPI respondió con el código ${respuesta.status}`);
    }

    formularioMascota.reset();
    await cargarMascotas();
  } catch (error) {
    console.error(error);
    mensajeAdmin.textContent = "No se pudo guardar la mascota.";
  } finally {
    botonGuardar.disabled = false;
  }
});

  cargarMascotas();
}