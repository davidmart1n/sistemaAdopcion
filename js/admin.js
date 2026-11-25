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

  const urlUsuarios = "https://6b06ea8157fa1297bb566cd8.mockapi.io/users";
  const listaSolicitudes = document.getElementById("lista-solicitudes");
  const estadosSolicitud = ["En revisión", "Aprobada", "Rechazada"];

  const leerDatos = async (url) => {
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error(`Error al consultar los datos: ${respuesta.status}`);
    }

    return respuesta.json();
  };

  const graficoSolicitudes = document.getElementById("grafico-solicitudes");
  const filtroDashboard = document.getElementById("filtro-dashboard");
  const resumenDashboard = document.getElementById("resumen-dashboard");
  const contextoGrafico = graficoSolicitudes.getContext("2d");

  const coloresEstado = {
    "En revisión": "#b45309",
    "Aprobada": "#15803d",
    "Rechazada": "#b91c1c"
  };

  let solicitudesDashboard = [];

  const dibujarDashboard = () => {
    const filtro = filtroDashboard.value;
    const estados = filtro ? [filtro] : estadosSolicitud;

    const totales = estados.map((estado) => ({
      estado,
      cantidad: solicitudesDashboard.filter(
        (solicitud) => solicitud.estado === estado
      ).length
    }));

    graficoSolicitudes.width = 320;
    graficoSolicitudes.height = totales.length * 56 + 12;

    const maximo = Math.max(1, ...totales.map((total) => total.cantidad));

    contextoGrafico.font = "14px sans-serif";

    totales.forEach(({ estado, cantidad }, indice) => {
      const y = 24 + indice * 56;

      contextoGrafico.fillStyle = "#1f2937";
      contextoGrafico.fillText(`${estado}: ${cantidad}`, 12, y);

      contextoGrafico.fillStyle = coloresEstado[estado];
      contextoGrafico.fillRect(12, y + 8, (cantidad / maximo) * 296, 16);
    });

    resumenDashboard.textContent = totales
      .map(({ estado, cantidad }) => `${estado}: ${cantidad}`)
      .join(" · ");
  };

  filtroDashboard.addEventListener("change", dibujarDashboard);

  const cargarSolicitudes = async () => {
    try {
      const [solicitudes, usuarios, mascotas] = await Promise.all([
        leerDatos(urlSolicitudes),
        leerDatos(urlUsuarios),
        leerDatos(urlMascotas)
      ]);

      solicitudesDashboard = solicitudes;
      dibujarDashboard();

      listaSolicitudes.replaceChildren();

      if (solicitudes.length === 0) {
        const celda = listaSolicitudes.insertRow().insertCell();
        celda.colSpan = 6;
        celda.textContent = "Todavía no hay solicitudes.";
        return;
      }

      for (const solicitud of solicitudes) {
        const usuario = usuarios.find(
          (cuenta) => String(cuenta.id) === String(solicitud.userId)
        );
        const mascota = mascotas.find(
          (ficha) => String(ficha.id) === String(solicitud.petId)
        );

        const fila = listaSolicitudes.insertRow();
        fila.insertCell().textContent = usuario?.nombre ?? "Usuario no encontrado";
        fila.insertCell().textContent = usuario?.email ?? "—";
        fila.insertCell().textContent = mascota?.nombre ?? "Mascota no encontrada";
        fila.insertCell().textContent = solicitud.fechaSolicitud?.slice(0, 10) ?? "—";

        const selector = document.createElement("select");
        selector.setAttribute("aria-label", `Estado de la solicitud ${solicitud.id}`);

        for (const estado of estadosSolicitud) {
          selector.add(new Option(estado, estado));
        }

        selector.value = solicitud.estado;
        fila.insertCell().appendChild(selector);

        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = "Guardar";
        fila.insertCell().appendChild(boton);

        boton.addEventListener("click", async () => {
          const estado = selector.value;

          if (!estado) {
            alert("Elegí un estado.");
            return;
          }

          boton.disabled = true;
          selector.disabled = true;

          try {
            const url = `${urlSolicitudes}/${encodeURIComponent(solicitud.id)}`;
            if (estado === "Rechazada") {
              if (!window.confirm("¿Rechazar y eliminar definitivamente esta solicitud?")) {
                selector.value = solicitud.estado;
                return;
              }

              const respuestaBaja = await fetch(url, { method: "DELETE" });

              if (!respuestaBaja.ok) {
                throw new Error(`Error al eliminar la solicitud: ${respuestaBaja.status}`);
              }

              await cargarSolicitudes();
              return;
            }
            const respuesta = await fetch(url, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ estado })
            });

            if (!respuesta.ok) {
              throw new Error(`Error al guardar el estado: ${respuesta.status}`);
            }

            solicitud.estado = estado;
            dibujarDashboard();

            if (estado === "Aprobada") {
              const urlMascota = `${urlMascotas}/${encodeURIComponent(solicitud.petId)}`;

              try {
                const respuestaMascota = await fetch(urlMascota, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ disponible: false })
                });

                if (!respuestaMascota.ok) {
                  throw new Error(`Error al actualizar la mascota: ${respuestaMascota.status}`);
                }
              } catch (error) {
                console.error(error);
                alert(
                  "La solicitud quedó aprobada, pero no se pudo actualizar la mascota. " +
                  "Pulsá Guardar otra vez para reintentar."
                );
                return;
              }

              await cargarMascotas();
              alert("Solicitud aprobada. La mascota quedó como No disponible.");
            } else {
              alert("Estado actualizado.");
            }
          } catch (error) {
            console.error(error);
            alert("No se pudo guardar el estado.");
          } finally {
            boton.disabled = false;
            selector.disabled = false;
          }
        });
      }
    } catch (error) {
      console.error(error);
      listaSolicitudes.replaceChildren();

      const celda = listaSolicitudes.insertRow().insertCell();
      celda.colSpan = 6;
      celda.textContent = "No se pudieron cargar las solicitudes.";
    }
  };

  cargarSolicitudes();

  const formularioUsuario = document.getElementById("form-usuario");
  const formularioPassword = document.getElementById("form-cambiar-password");
  const selectorUsuario = document.getElementById("usuario-seleccionado");

  const cargarSelectorUsuarios = async () => {
    selectorUsuario.disabled = true;
    selectorUsuario.replaceChildren(new Option("Elegí un usuario", ""));

    try {
      const usuarios = await leerDatos(urlUsuarios);

      for (const usuario of usuarios) {
        const etiqueta = `${usuario.nombre} (${usuario.email})`;
        selectorUsuario.add(new Option(etiqueta, usuario.id));
      }
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar la lista de usuarios.");
    } finally {
      selectorUsuario.disabled = false;
    }
  };

  formularioUsuario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const datos = new FormData(formularioUsuario);
    const nombre = datos.get("nombre").trim();
    const email = datos.get("email").trim().toLowerCase();
    const password = datos.get("password");
    const role = datos.get("role");

    if (!nombre || !password.trim()) {
      alert("Completá el nombre y la contraseña.");
      return;
    }

    const boton = formularioUsuario.querySelector('button[type="submit"]');
    boton.disabled = true;

    try {
      const usuarios = await leerDatos(urlUsuarios);
      const correoOcupado = usuarios.some(
        (usuario) => usuario.email?.trim().toLowerCase() === email
      );

      if (correoOcupado) {
        alert("Ese correo ya está registrado.");
        return;
      }

      const respuesta = await fetch(urlUsuarios, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password, role })
      });

      if (!respuesta.ok) {
        throw new Error(`Error al crear el usuario: ${respuesta.status}`);
      }

      formularioUsuario.reset();
      alert("Usuario creado.");
      await cargarSelectorUsuarios();
    } catch (error) {
      console.error(error);
      alert("No se pudo crear el usuario.");
    } finally {
      boton.disabled = false;
    }
  });

  formularioPassword.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const datos = new FormData(formularioPassword);
    const id = datos.get("userId");
    const password = datos.get("password");

    if (!id || !password.trim()) {
      alert("Elegí un usuario y escribí la nueva contraseña.");
      return;
    }

    const boton = formularioPassword.querySelector('button[type="submit"]');
    boton.disabled = true;

    try {
      const url = `${urlUsuarios}/${encodeURIComponent(id)}`;
      const respuesta = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (!respuesta.ok) {
        throw new Error(`Error al cambiar la contraseña: ${respuesta.status}`);
      }

      formularioPassword.reset();
      alert("Contraseña actualizada.");
    } catch (error) {
      console.error(error);
      alert("No se pudo cambiar la contraseña.");
    } finally {
      boton.disabled = false;
    }
  });

  cargarSelectorUsuarios();
}