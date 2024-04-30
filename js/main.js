let allBooks = [];

// search btn click
document.getElementById("search-btn").addEventListener("click", function () {
  const searchValue = document
    .getElementById("search-field")
    .value.toLowerCase();
  filterBooks(searchValue);

  var event = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  var tabLink = document.getElementById("livros-tab");
  tabLink.dispatchEvent(event);
});

// create a book submit
document
  .getElementById("book-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    postBook({
      title: document.getElementById("title").value,
      author: document.getElementById("author").value,
      publication_year: document.getElementById("publication_year").value,
      isbn: document.getElementById("isbn").value,
      publisher: document.getElementById("publisher").value,
    });
  });

// get resenhas data when tab clicked
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("livros-tab").click();
  mockResenhasData();
});

// get user data and store
document.addEventListener("DOMContentLoaded", function () {
  const userString = localStorage.getItem("user");
  let user = null;
  if (userString) {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
  }

  if (user) {
    const sellerAvatar = document.querySelector(".seller-avatar");
    const sellerName = document.querySelector(".seller-name");

    if (user.username) {
      const initial = user.username[0].toUpperCase();
      sellerAvatar.textContent = initial;
      sellerName.textContent = user.username;
    }
  }

  fetchBooks();
});

document.addEventListener("DOMContentLoaded", function () {
  var spans = document.getElementsByClassName("close");

  for (var i = 0; i < spans.length; i++) {
    const span = spans[i];
    const modal = span.parentElement.parentElement.parentElement;

    span.onclick = function () {
      modal.style.display = "none";
    };

    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  }
});

document
  .getElementById("rating-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const rating = formData.get("rating");
    console.log("Rating submitted:", rating);
    document.getElementById("ratingModal").style.display = "none";

    // send the rating to the server
  });

document.querySelector(".close").onclick = function () {
  document.getElementById("ratingModal").style.display = "none";
};

document.querySelectorAll("#star-rating input").forEach((input) => {
  input.onchange = function () {
    updateStars(input.value);
  };
});

function filterBooks(query) {
  const bookListElement = document.getElementById("book-list");
  const booksHeaderText = document.getElementById("books-header-text");
  bookListElement.innerHTML = "";

  const filteredBooks = allBooks.filter((book) => {
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.publication_year.toString().includes(query) ||
      book.isbn.includes(query) ||
      book.publisher.toLowerCase().includes(query)
    );
  });

  booksHeaderText.textContent = `${filteredBooks.length} livro(s) encontrado(s)`;

  displayBooks(filteredBooks);
}

function displayBooks(books) {
  const bookListElement = document.getElementById("book-list");

  for (let i = 0; i < bookListElement.children.length; i++) {
    bookListElement.children[i].style.display = "none";
  }

  books.forEach((book) => {
    const row = bookListElement.insertRow();
    row.insertCell(0).textContent = book.title;
    row.insertCell(1).textContent = book.author;
    row.insertCell(2).textContent = book.publication_year;
    row.insertCell(3).textContent = book.isbn;
    row.insertCell(4).textContent = book.publisher;

    const reviewCell = row.insertCell(5);
    const eyeIcon = document.createElement("i");
    eyeIcon.className = "fas fa-pen";
    eyeIcon.setAttribute("data-book-id", book.id);
    eyeIcon.onclick = function () {
      reviewBook(this.getAttribute("data-book-id"));
    };
    reviewCell.appendChild(eyeIcon);
  });
}

function reviewBook(bookId) {
  const reviewModal = document.getElementById("reviewModal");
  reviewModal.style.display = "block";

  reviewModal
    .querySelector("button[type='submit']")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      const reviewData = new FormData(reviewModal.querySelector("form"));
      const content = reviewData.get("content");
      const title = reviewData.get("title");

      await postReview(bookId, content, title);

      reviewModal.querySelector("form").reset();
    });
}

async function postReview(bookId, content, title) {
  const token = localStorage.getItem("token");

  const response = await fetch("http://127.0.0.1:8000/reviews/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      book_id: bookId,
      content: content,
      title: title,
    }),
  });

  const result = await response.json();

  if (!result.success) {
    console.error("Failed to post review:", result.detail);
  }

  document.getElementById("reviewModal").style.display = "none";

  mockResenhasData();
}

async function fetchBooks() {
  const token = localStorage.getItem("token");
  const spinner = document.getElementById("table-spinner");
  const booksHeaderText = document.getElementById("books-header-text");
  spinner.style.display = "block";

  try {
    const response = await fetch("http://127.0.0.1:8000/books/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    if (response.ok && result.detail === "Books listed successfully") {
      allBooks = result.books;
      booksHeaderText.textContent = `${allBooks.length} livro(s) encontrado(s)`;

      displayBooks(allBooks);
    } else {
      console.error("Failed to fetch books:", result.detail);
      booksHeaderText.textContent = "Nenhum livro encontrado";
    }
  } catch (error) {
    console.error("Error fetching books:", error);
    booksHeaderText.textContent = "Nenhum livro encontrado";
  } finally {
    spinner.style.display = "none";
  }
}

async function postBook(bookData) {
  const token = localStorage.getItem("token");
  const spinner = document.getElementById("add-book-spinner");

  spinner.style.display = "block";

  try {
    const response = await fetch("http://127.0.0.1:8000/books/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookData),
    });

    const result = await response.json();

    if (response.ok) {
      // alert("Book added successfully!");

      fetchBooks();
    } else {
      console.error("Book addition failed:", result.detail);
    }
  } catch (error) {
    console.error("Error during book addition:", error);
  } finally {
    spinner.style.display = "none";
  }
}

async function mockResenhasData() {
  const resenhasTable = document.querySelector("#Resenhas tbody");
  resenhasTable.innerHTML = "";

  const res = await fetch("http://127.0.0.1:8000/reviews/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const json = await res.json();

  if (!res.ok) {
    console.error("Failed to fetch reviews:", json.detail);
    return;
  }

  const data = json.reviews.map((review) => ({
    livro: review.book_title,
    resenhista: review.author,
    visualizacoes: parseInt(Math.random() * 1000),
    avaliacao: review.rating,
    texto: review.review.content,
    titulo: review.review.title,
  }));

  data.forEach((entry) => {
    const row = resenhasTable.insertRow();
    row.insertCell(0).textContent = entry.livro;
    row.insertCell(1).textContent = entry.resenhista;
    row.insertCell(2).textContent = entry.visualizacoes;
    const el = document.createElement("div");
    el.innerHTML =
      '<i class="fa-solid fa-eye" style="color: #0a817f; cursor: pointer;"></i>';

    el.addEventListener("click", function () {
      const modal = document.getElementById("viewReviewModal");
      modal.style.display = "block";

      modal.querySelector("h3").textContent = entry.titulo;
      modal.querySelector(".content").textContent = entry.texto;
    });

    row.insertCell(3).appendChild(el);
  });
}

function openTab(evt, tabName) {
  var tabcontent = document.getElementsByClassName("tabcontent");
  for (var i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  var tablinks = document.getElementsByClassName("tablinks");
  for (var i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";

  if (tabName === "Resenhas") {
    mockResenhasData();
  }
}

function createStars(rating) {
  let starsHtml = "";
  for (let i = 0; i < rating; i++) {
    starsHtml += '<i class="fa-solid fa-star"></i>';
  }
  for (let i = rating; i < 5; i++) {
    starsHtml += '<i class="fa-regular fa-star"></i>';
  }
  return starsHtml;
}

function updateStars(rating) {
  document.querySelectorAll("#star-rating i").forEach((star, index) => {
    star.style.color = index < rating ? "#DD6B20" : "#ccc";
  });
}
