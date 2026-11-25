const urlUsuarios = "https://6b06ea8157fa1297bb566cd8.mockapi.io/users";

const formulario = document.getElementById("form-login");
const campoEmail = document.getElementById("email");
const campoPassword = document.getElementById("password");

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const email = campoEmail.value.trim().toLowerCase();
  const password = campoPassword.value;

  try {
    const respuesta = await fetch(urlUsuarios);

    if (!respuesta.ok) {
      throw new Error(`MockAPI respondió con el código ${respuesta.status}`);
    }

    const usuarios = await respuesta.json();
    const usuario = usuarios.find(
      (cuenta) =>
        cuenta.email.trim().toLowerCase() === email &&
        cuenta.password === password
    );

    if (!usuario) {
      alert("El correo o la contraseña son incorrectos.");
      return;
    }

    sessionStorage.setItem(
      "sesion",
      JSON.stringify({
        id: usuario.id,
        nombre: usuario.nombre,
        role: usuario.role
      })
    );

    window.location.href = usuario.role === "ADMIN"
      ? "admin.html"
      : "index.html";
  } catch (error) {
    console.error(error);
    alert("No se pudo consultar MockAPI. Revisá la URL y la consola.");
  }
});