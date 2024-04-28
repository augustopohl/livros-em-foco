document
  .getElementById("login-form")
  ?.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;

    login(email, password);
  });

async function login(email, password) {
  const spinner = document.getElementById("loading-spinner");
  const errorMessage = document.getElementById("error-message");
  const button = document.getElementById("login-btn");
  spinner.style.display = "block";
  errorMessage.style.display = "none";
  button.style.display = "none";

  try {
    const response = await fetch("http://127.0.0.1:8000/auth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "index.html";
    } else {
      errorMessage.textContent =
        data.detail === "Invalid password" ? "Senha inválida" : data.detail;
      errorMessage.style.display = "block";
    }
  } catch (error) {
    console.error("Error during login:", error);
  } finally {
    spinner.style.display = "none";
    button.style.display = "block";
  }
}
