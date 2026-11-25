const sesion = JSON.parse(sessionStorage.getItem("sesion"));

if (sesion?.role !== "ADMIN") {
  window.location.replace("login.html");
} else {
  const botonCerrarSesion = document.getElementById("cerrar-sesion");

  botonCerrarSesion.addEventListener("click", () => {
    sessionStorage.removeItem("sesion");
    window.location.replace("login.html");
  });
}