document
  .getElementById("register-form")
  ?.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = event.target.name.value;
    const email = event.target.email.value;
    const password = event.target.password.value;

    createUser(name, email, password);
  });

async function createUser(name, email, password) {
  const spinner = document.getElementById("loading-spinner");
  const errorMessage = document.getElementById("error-message");
  const button = document.getElementById("register-btn");
  spinner.style.display = "block";
  errorMessage.style.display = "none";
  button.style.display = "none";

  try {
    const response = await fetch("http://127.0.0.1:8000/auth/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("token", data.user.token);
      window.location.href = "index.html";
    } else {
      const messageTranslation = {
        "Name is required": "Nome é obrigatório",
        "Email is required": "Email é obrigatório",
        "Password is required": "Senha é obrigatória",
        "A user with that email already exists.":
          "Um usuário com esse email já existe.",
      };

      errorMessage.innerHTML = "";

      data.detail.split(",").forEach((errorMsg) => {
        const errorDiv = document.createElement("div");
        errorDiv.textContent =
          messageTranslation[errorMsg.trim()] || errorMsg.trim();
        errorDiv.classList.add("error-message");
        errorMessage.appendChild(errorDiv);
      });

      errorMessage.style.display = "block";
      errorMessage.style.display = "block";
    }
  } catch (error) {
    console.error("Error during registering:", error);
    errorMessage.textContent =
      "Erro ao registrar usuário. Por favor, tente novamente.";
    errorMessage.style.display = "block";
  } finally {
    spinner.style.display = "none";
    button.style.display = "block";
  }
}
