let chapters = [];
let currentChapter = null;
let quizData = null;
let userAnswers = [];

async function loadChapters() {
  try {
    const response = await fetch("chapters.json");
    chapters = await response.json();
    populateChapterSelect();
  } catch (error) {
    console.error("Error loading chapters:", error);
    const ErrorElement = document.createElement("div");
    ErrorElement.classList.add("error");
    ErrorElement.textContent = "Error loading chapters";
    document.body.appendChild(ErrorElement);
  }
}

function populateChapterSelect() {
  const select = document.getElementById("chapter-select");
  chapters.forEach((chapter, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = chapter.name;
    select.appendChild(option);
  });
}

async function loadQuizData(chapterIndex) {
  try {
    console.log("Loading quiz data for chapter:", chapterIndex);
    if (chapterIndex < 0 || chapterIndex >= chapters.length) {
      throw new Error("Invalid chapter index");
    }
    const response = await fetch(chapters[chapterIndex].quizFile);
    if (!response.ok) {
      throw new Error("Failed to load quiz data");
    }
    quizData = await response.json();
    console.log("Quiz data loaded:", quizData);
    displayAllQuestions();
    document.getElementById("quiz-container").style.display = "block";
  } catch (error) {
    console.error("Error loading quiz data:", error);
    const questionsContainer = document.getElementById("questions-container");
    questionsContainer.innerHTML = `<p class="error">Không thể tải dữ liệu cho chương này. Vui lòng chọn chương khác.</p>`;
    document.getElementById("quiz-container").style.display = "block";
    document.getElementById("submit-btn").style.display = "none";
  }
}

function displayAllQuestions() {
  console.log("Displaying questions");
  console.log(quizData);
  const questionsContainer = document.getElementById("questions-container");
  questionsContainer.innerHTML = "";
  userAnswers = [];

  if (!quizData) {
    console.error("Quiz data is not in the expected format:", quizData);
    return;
  }

  quizData.forEach((questionData, index) => {
    const questionElement = document.createElement("div");
    questionElement.classList.add("question");
    questionElement.innerHTML = `
      <h3>Câu ${index + 1}:</h3>
      <pre class="question-text">${questionData.question}</pre>
      <div class="options-container" id="options-container-${index}"></div>
    `;
    questionsContainer.appendChild(questionElement);

    const optionsContainer = document.getElementById(
      `options-container-${index}`
    );
    questionData.options.forEach((option, optionIndex) => {
      const optionElement = document.createElement("div");
      optionElement.classList.add("option");
      optionElement.textContent = option;
      optionElement.addEventListener("click", () =>
        selectOption(index, optionIndex)
      );
      optionsContainer.appendChild(optionElement);
    });
  });
}

function selectOption(questionIndex, optionIndex) {
  const options = document.querySelectorAll(
    `#options-container-${questionIndex} .option`
  );
  options.forEach((option) => option.classList.remove("selected"));
  options[optionIndex].classList.add("selected");
  userAnswers[questionIndex] = optionIndex;
}

function submitQuiz() {
  let correctAnswers = 0;
  quizData.forEach((question, index) => {
    if (userAnswers[index] === question.correctAnswer) {
      correctAnswers++;
    }
  });

  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("results").style.display = "block";
  document.getElementById("correct-answers").textContent = correctAnswers;
  document.getElementById("total-questions").textContent = quizData.length;
}

document.addEventListener("DOMContentLoaded", () => {
  loadChapters();
  document.getElementById("chapter-select").addEventListener("change", (e) => {
    const selectedIndex = parseInt(e.target.value);
    if (!isNaN(selectedIndex)) {
      loadQuizData(selectedIndex);
    } else {
      // Reset quiz container when no chapter is selected
      document.getElementById("quiz-container").style.display = "none";
      document.getElementById("questions-container").innerHTML = "";
      document.getElementById("submit-btn").style.display = "none";
    }
  });
  document.getElementById("submit-btn").addEventListener("click", submitQuiz);
});
