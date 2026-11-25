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
  const urlSolicitudes = "https://6b06ea8157fa1297bb566cd8.mockapi.io/adoptions";
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

        const celdaAcciones = fila.insertCell();
        const botonEditar = document.createElement("button");

        botonEditar.type = "button";
        botonEditar.textContent = "Editar";

        botonEditar.addEventListener("click", () => {
          const campos = formularioMascota.elements;

          campos.namedItem("id").value = mascota.id;
          campos.namedItem("nombre").value = mascota.nombre;
          campos.namedItem("especie").value = mascota.especie;
          campos.namedItem("edad").value = mascota.edad;
          campos.namedItem("tamano").value = mascota.tamano;
          campos.namedItem("foto").value = mascota.foto;
          campos.namedItem("vacuna").checked = mascota.vacuna === true;
          campos.namedItem("disponible").checked = mascota.disponible === true;

          botonGuardar.textContent = "Guardar cambios";
          campos.namedItem("nombre").focus();
        });

        celdaAcciones.appendChild(botonEditar);

        const botonBaja = document.createElement("button");
        botonBaja.type = "button";
        botonBaja.textContent = "Dar de baja";

        botonBaja.addEventListener("click", async () => {
          botonBaja.disabled = true;

          try {
            const respuestaSolicitudes = await fetch(urlSolicitudes);

            if (!respuestaSolicitudes.ok) {
              throw new Error(`Error al consultar solicitudes: ${respuestaSolicitudes.status}`);
            }

            const solicitudes = await respuestaSolicitudes.json();
            const tieneSolicitudes = solicitudes.some(
              (solicitud) => String(solicitud.petId) === String(mascota.id)
            );

            const confirmacion = tieneSolicitudes
              ? `¿Marcar a ${mascota.nombre} como no disponible? Se conservarán sus solicitudes.`
              : `¿Eliminar definitivamente la ficha de ${mascota.nombre}?`;

            if (!window.confirm(confirmacion)) {
              return;
            }

            const url = `${urlMascotas}/${encodeURIComponent(mascota.id)}`;
            const respuesta = await fetch(
              url,
              tieneSolicitudes
                ? {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ disponible: false })
                }
                : { method: "DELETE" }
            );

            if (!respuesta.ok) {
              throw new Error(`Error al dar de baja la mascota: ${respuesta.status}`);
            }

            const campoId = formularioMascota.elements.namedItem("id");
            if (campoId.value === String(mascota.id)) {
              formularioMascota.reset();
            }

            await cargarMascotas();
          } catch (error) {
            console.error(error);
            mensajeAdmin.textContent = "No se pudo completar la baja de la mascota.";
          } finally {
            botonBaja.disabled = false;
          }
        });

        celdaAcciones.appendChild(botonBaja);
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
    const id = datos.get("id");
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
      const url = id ? `${urlMascotas}/${encodeURIComponent(id)}` : urlMascotas;

      const respuesta = await fetch(url, {
        method: id ? "PUT" : "POST",
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