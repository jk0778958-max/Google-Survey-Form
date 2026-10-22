
const questionsContainer = document.getElementById("questionsContainer");
const surveyForm = document.getElementById("surveyForm");
const surveyTitle = document.getElementById("surveyTitle");
const surveyDescription = document.getElementById("surveyDescription");

const addQuestionBtn = document.getElementById("addQuestionBtn");
const previewBtn = document.getElementById("previewBtn");
const backToEditBtn = document.getElementById("backToEditBtn");

const editorActions = document.getElementById("editorActions");
const previewActions = document.getElementById("previewActions");
const message = document.getElementById("message");

let nextQuestionId = 1;
let previewMode = false;

// Question types supported by the application
const questionTypes = [
    { value: "short", label: "Short answer" },
    { value: "paragraph", label: "Paragraph" },
    { value: "radio", label: "Multiple choice" },
    { value: "checkbox", label: "Checkboxes" },
    { value: "select", label: "Dropdown" }
];

// Create a question object
function createQuestion(type = "radio", title = "") {
    return {
        id: nextQuestionId++,
        title,
        type,
        required: false,
        options: ["Option 1", "Option 2", "Option 3"]
    };
}

// Create the HTML for one question
function renderQuestion(question, index) {
    const card = document.createElement("section");
    card.className = "question-card";
    card.dataset.id = question.id;

    // Question heading
    const heading = document.createElement("div");
    heading.className = "question-heading";

    const headingTitle = document.createElement("h2");
    headingTitle.textContent = `Question ${index + 1}`;

    heading.appendChild(headingTitle);

    // Editor controls are not shown in preview mode
    if (!previewMode) {
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger btn-small";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            card.remove();
            updateQuestionNumbers();
            showMessage("Question deleted.", "success");
        });

        heading.appendChild(deleteButton);
    }

    card.appendChild(heading);

    // Question text
    if (previewMode) {
        const questionText = document.createElement("h3");
        questionText.className = "field-label";
        questionText.textContent =
            question.title || "Untitled question";

        if (question.required) {
            questionText.textContent += " *";
        }

        card.appendChild(questionText);
    } else {
        const titleLabel = document.createElement("label");
        titleLabel.textContent = "Question text";

        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.className = "question-title";
        titleInput.placeholder = "Enter your question";
        titleInput.value = question.title;
        titleInput.required = true;

        titleInput.addEventListener("input", () => {
            question.title = titleInput.value;
        });

        titleLabel.appendChild(titleInput);
        card.appendChild(titleLabel);

        // Question type selector
        const typeLabel = document.createElement("label");
        typeLabel.textContent = "Question type";

        const typeSelect = document.createElement("select");
        typeSelect.className = "question-type";

        questionTypes.forEach(typeOption => {
            const option = document.createElement("option");
            option.value = typeOption.value;
            option.textContent = typeOption.label;
            typeSelect.appendChild(option);
        });

        typeSelect.value = question.type;

        typeSelect.addEventListener("change", () => {
            question.type = typeSelect.value;
            renderAllQuestions();
        });

        typeLabel.appendChild(typeSelect);
        card.appendChild(typeLabel);
    }

    // Render the appropriate answer input
    if (["radio", "checkbox", "select"].includes(question.type)) {
        renderChoiceInputs(card, question);
    } else {
        const answer = question.type === "paragraph"
            ? document.createElement("textarea")
            : document.createElement("input");

        answer.className = "respondent-answer";
        answer.placeholder = "Your answer";

        if (question.type === "short") {
            answer.type = "text";
        } else {
            answer.rows = 3;
        }

        if (previewMode) {
            answer.name = `answer-${question.id}`;
            answer.required = question.required;
        } else {
            answer.disabled = true;
        }

        card.appendChild(answer);
    }

    // Required checkbox in editor mode
    if (!previewMode) {
        const requiredLabel = document.createElement("label");
        requiredLabel.className = "required-label";

        const requiredCheckbox = document.createElement("input");
        requiredCheckbox.type = "checkbox";
        requiredCheckbox.checked = question.required;

        requiredCheckbox.addEventListener("change", () => {
            question.required = requiredCheckbox.checked;
        });

        requiredLabel.appendChild(requiredCheckbox);
        requiredLabel.append(" Required question");
        card.appendChild(requiredLabel);
    }

    // Add-option button
    if (!previewMode && ["radio", "checkbox", "select"].includes(question.type)) {
        const addOptionButton = document.createElement("button");
        addOptionButton.type = "button";
        addOptionButton.className = "btn btn-secondary btn-small";
        addOptionButton.textContent = "+ Add option";

        addOptionButton.addEventListener("click", () => {
            question.options.push(`Option ${question.options.length + 1}`);
            renderAllQuestions();
        });

        const tools = document.createElement("div");
        tools.className = "question-tools";
        tools.appendChild(addOptionButton);
        card.appendChild(tools);
    }

    return card;
}

// Render choices in both editor and preview modes
function renderChoiceInputs(card, question) {
    if (previewMode && question.type === "select") {
        const select = document.createElement("select");
        select.name = `answer-${question.id}`;
        select.className = "respondent-answer";
        select.required = question.required;

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Choose an option";
        select.appendChild(placeholder);

        question.options.forEach((text, index) => {
            const option = document.createElement("option");
            option.value = text;
            option.textContent = text || `Option ${index + 1}`;
            select.appendChild(option);
        });

        card.appendChild(select);
        return;
    }

    question.options.forEach((text, index) => {
        const row = document.createElement("div");
        row.className = "option-row";

        if (previewMode) {
            const input = document.createElement("input");
            input.type = question.type === "radio" ? "radio" : "checkbox";
            input.name = question.type === "radio"
                ? `answer-${question.id}`
                : `answer-${question.id}[]`;
            input.value = text;
            input.required = question.required &&
                question.type === "radio" && index === 0;

            const label = document.createElement("label");
            label.textContent = text || `Option ${index + 1}`;

            row.append(input, label);
        } else {
            const optionInput = document.createElement("input");
            optionInput.type = "text";
            optionInput.value = text;
            optionInput.placeholder = `Option ${index + 1}`;
            optionInput.required = true;

            optionInput.addEventListener("input", () => {
                question.options[index] = optionInput.value;
            });

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "btn btn-danger btn-small remove-option";
            removeButton.textContent = "×";
            removeButton.setAttribute("aria-label", "Remove option");

            removeButton.addEventListener("click", () => {
                if (question.options.length <= 1) {
                    showMessage("Keep at least one option.", "error");
                    return;
                }

                question.options.splice(index, 1);
                renderAllQuestions();
            });

            row.append(optionInput, removeButton);
        }

        card.appendChild(row);
    });
}

// Render every question from the current question data
function renderAllQuestions() {
    questionsContainer.replaceChildren();

    const questions = getQuestions();

    questions.forEach((question, index) => {
        questionsContainer.appendChild(
            renderQuestion(question, index)
        );
    });
}

// Read current question cards into structured data
function getQuestions() {
    // Maintain question objects across renders.
    return questionList;
}

const questionList = [
    createQuestion("radio", "How satisfied are you with your university?"),
    createQuestion("paragraph", "What would you like the university to improve?")
];

// Renumber visible questions
function updateQuestionNumbers() {
    const cards = questionsContainer.querySelectorAll(".question-card");

    cards.forEach((card, index) => {
        const heading = card.querySelector(".question-heading h2");

        if (heading) {
            heading.textContent = `Question ${index + 1}`;
        }
    });

    const remainingIds = new Set(
        [...cards].map(card => Number(card.dataset.id))
    );

    for (let i = questionList.length - 1; i >= 0; i--) {
        if (!remainingIds.has(questionList[i].id)) {
            questionList.splice(i, 1);
        }
    }
}

// Display a status message
function showMessage(text, type = "") {
    message.textContent = text;
    message.className = `message ${type}`;
}

// Add a new question
addQuestionBtn.addEventListener("click", () => {
    questionList.push(createQuestion());
    renderAllQuestions();
    showMessage("New question added.", "success");
});

// Switch to respondent preview
previewBtn.addEventListener("click", () => {
    if (!surveyTitle.value.trim()) {
        showMessage("Please enter a survey title first.", "error");
        surveyTitle.focus();
        return;
    }

    if (questionList.length === 0) {
        showMessage("Please add at least one question.", "error");
        return;
    }

    for (const question of questionList) {
        if (!question.title.trim()) {
            showMessage("Please fill in every question title.", "error");
            return;
        }

        if (["radio", "checkbox", "select"].includes(question.type)) {
            if (question.options.some(option => !option.trim())) {
                showMessage("Please complete or remove empty options.", "error");
                return;
            }
        }
    }

    previewMode = true;
    editorActions.classList.add("hidden");
    previewActions.classList.remove("hidden");

    // Show the description and questions as respondents see them.
    surveyTitle.readOnly = true;
    surveyDescription.readOnly = true;

    renderAllQuestions();
    showMessage("Preview mode: test your answers below.", "");
});

// Return to the editor
backToEditBtn.addEventListener("click", () => {
    previewMode = false;
    editorActions.classList.remove("hidden");
    previewActions.classList.add("hidden");

    surveyTitle.readOnly = false;
    surveyDescription.readOnly = false;

    renderAllQuestions();
    showMessage("You are back in the editor.", "");
});

// Submit the sample survey
surveyForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!previewMode) {
        showMessage("Open preview mode before submitting.", "error");
        return;
    }

    const answers = [];

    for (const question of questionList) {
        const card = questionsContainer.querySelector(
            `[data-id="${question.id}"]`
        );

        let value;

        if (question.type === "checkbox") {
            value = [...card.querySelectorAll(
                'input[type="checkbox"]:checked'
            )].map(input => input.value);
        } else if (question.type === "radio") {
            value = card.querySelector(
                'input[type="radio"]:checked'
            )?.value || "";
        } else {
            value = card.querySelector(".respondent-answer")?.value || "";
        }

        const isEmpty = Array.isArray(value)
            ? value.length === 0
            : !String(value).trim();

        if (question.required && isEmpty) {
            showMessage(
                `Please answer: ${question.title}`,
                "error"
            );
            return;
        }

        answers.push({
            question: question.title,
            answer: value
        });
    }

    console.log("Survey submission:", {
        title: surveyTitle.value,
        description: surveyDescription.value,
        answers
    });

    previewMode = false;
    editorActions.classList.remove("hidden");
    previewActions.classList.add("hidden");

    surveyTitle.readOnly = false;
    surveyDescription.readOnly = false;

    renderAllQuestions();
    showMessage(
        "Demo submission successful! Answers are in the browser console only.",
        "success"
    );
});

// Display the initial questions
renderAllQuestions();
    