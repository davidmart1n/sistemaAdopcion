const urlUsuarios = "https://6b06ea8157fa1297bb566cd8.mockapi.io/users";

const formulario = document.getElementById("form-registro");
const botonRegistrar = formulario.querySelector('button[type="submit"]');

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const datos = new FormData(formulario);
  const nombre = datos.get("nombre").trim();
  const email = datos.get("email").trim().toLowerCase();
  const password = datos.get("password");

  if (!nombre || !password.trim()) {
    alert("Completá el nombre y la contraseña.");
    return;
  }

  botonRegistrar.disabled = true;

  try {
    const respuesta = await fetch(urlUsuarios);

    if (!respuesta.ok) {
      throw new Error(`Error al consultar usuarios: ${respuesta.status}`);
    }

    const usuarios = await respuesta.json();
    const correoOcupado = usuarios.some(
      (usuario) => usuario.email?.trim().toLowerCase() === email
    );

    if (correoOcupado) {
      alert("Ese correo ya está registrado.");
      return;
    }

    const respuestaRegistro = await fetch(urlUsuarios, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        email,
        password,
        role: "USUARIO"
      })
    });

    if (!respuestaRegistro.ok) {
      throw new Error(`Error al crear el usuario: ${respuestaRegistro.status}`);
    }

    alert("Cuenta creada. Ya podés iniciar sesión.");
    window.location.href = "login.html";
  } catch (error) {
    console.error(error);
    alert("No se pudo completar el registro. Revisá la consola.");
  } finally {
    botonRegistrar.disabled = false;
  }
});