const STORAGE_API_HOST = `http://localhost:3000`;

const letterGrades = {
  4: "A",
  3.5: "B+",
  3: "B",
  2.5: "C+",
  2: "C",
  1.5: "D+",
  1.0: "D",
  0.5: "D-",
  0: "F",
};
const modules = {};

window.addEventListener("DOMContentLoaded", function () {
  // Table
  const moduleTableBody = document.querySelector("#module-table tbody");
  const moduleRowTemplate = document.querySelector("#module-row-template");

  // Result
  const gpaResult = document.querySelector("#gpa-result");
  const chickenRiceResult = document.querySelector("#chicken-rice-result");

  // Add module
  const addModuleForm = document.querySelector("#new-module-form");
  const moduleNameInput = addModuleForm.querySelector("#module-name");
  const creditInput = addModuleForm.querySelector("#credit");
  const gradeInput = addModuleForm.querySelector("#grade");

  // Generate sharing link and delete old data
  const generateLinkButton = document.querySelector("#generate-link");
  const deletionButton = document.querySelector("#delete-link");
  const shareLinkInput = document.querySelector("#share-link");
  const output = document.querySelector("#output");
  const timeGeneratedField = document.querySelector("#time-generated");

  // All interactable controls (e.g. input, buttons, etc...)
  const controls = [
    addModuleForm.querySelector("button"),
    moduleNameInput,
    creditInput,
    gradeInput,
    deletionButton,
    generateLinkButton,
    output,
    shareLinkInput,
  ];

  /**
   * Disable controls in page
   */
  function disablePage() {
    controls.forEach((control) => (control.disabled = true));
  }

  /**
   * Enables controls in page
   */
  function enablePage() {
    controls.forEach((control) => (control.disabled = false));
  }

  /**
   * Create a new row with delete button
   */
  function createRow(moduleName, credit, grade, onDelete) {
    const newRow = moduleRowTemplate.content.firstElementChild.cloneNode(true);
    newRow.querySelector(".row-name").textContent = moduleName;
    newRow.querySelector(".row-credit").textContent = credit;
    newRow.querySelector(".row-grade").textContent = grade;
    newRow.querySelector(".row-delete").onclick = () => onDelete(newRow);
    return newRow;
  }

  /**
   * Create a new row and update modules object
   */
  function createModuleWithId(moduleName, credit, grade) {
    const id = Date.now();
    modules[id] = { name: moduleName, credit, grade };
    const newRow = createRow(moduleName, credit, grade, (newRow) => {
      moduleTableBody.removeChild(newRow);
      delete modules[id];
      updateResult();
    });
    newRow.id = id;
    return newRow;
  }

  /**
   * Create an array of module based on the table
   */
  function getModules() {
    const rows = moduleTableBody.querySelectorAll("tr");
    const result = [];
    rows.forEach((row) => {
      const id = row.id;
      result.push(modules[id]);
    });
    return result;
  }

  /**
   * Compute GPA based on the modules provided
   */
  function computeGpa(modules) {
    let totalCredit = 0;
    let totalScore = 0;
    modules.forEach((module) => {
      const { credit, grade } = module;
      totalScore += credit * grade;
      totalCredit += credit;
    });
    if (totalCredit === 0) return 0;
    return totalScore / totalCredit;
  }

  /**
   * Computes GPA based on the modules in the table and update the result
   */
  function updateResult() {
    const modules = getModules();
    const gpa = computeGpa(modules);
    const canBuyChickenRice = gpa >= 3.5;
    gpaResult.textContent = gpa.toFixed(2);
    chickenRiceResult.textContent = canBuyChickenRice ? "YES" : "NO";
  }

  /**
   * Add a new row to the table.
   */
  addModuleForm.onsubmit = function (e) {
    e.preventDefault();
    const moduleName = moduleNameInput.value;
    const credit = +creditInput.value;
    const grade = +gradeInput.value;

    const newRow = createModuleWithId(moduleName, credit, grade);
    moduleTableBody.appendChild(newRow);
    updateResult();
    return false;
  };

  /**
   * Uploads modules data to storage and generate sharing link based on returned key
   */
  generateLinkButton.onclick = function () {
    disablePage();
    const modules = getModules();
    const userInput = shareLinkInput.value;
    fetch(
      userInput
        ? `${STORAGE_API_HOST}/storage?key=${userInput}`
        : `${STORAGE_API_HOST}/storage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(modules),
      }
    )
      .then((response) => response.json())
      .then((json) => {
        const key = json.key;
        const url = new URL(window.location.href);
        url.searchParams.set("key", key);
        output.value = url.toString();
        timeGeneratedField.textContent = new Date().toLocaleString();
      })
      .catch((error) => {
        if ((error.message = `BadRequestError: Key ${key} already exists`)) {
          alert(`This key is already in use! Try another ;)`);
        } else {
          alert(error.message);
        }
      })
      .finally(() => enablePage());
  };

  /**
   * Loads modules data from storage and populate page
   */
  function loadDataFromKey(key) {
    disablePage();
    fetch(`${STORAGE_API_HOST}/storage?key=${key}`)
      .then((response) => response.json())
      .then((json) => {
        json.forEach((module) => {
          const { name: moduleName, credit, grade } = module;
          const newRow = createModuleWithId(moduleName, credit, grade);
          moduleTableBody.appendChild(newRow);
        });
        updateResult();
      })
      .catch((error) => {
        if ((error.message = `NotFoundError: Key ${key} not found`)) {
          alert(`There is no data for this key, you've been je-baited!`);
        } else {
          alert(error.message);
        }
      })
      .finally(() => enablePage());
  }

  deletionButton.onclick = function () {
    disablePage();
    fetch(`${STORAGE_API_HOST}/storage`, { method: "DELETE" })
      .then(() => {
        deletionOutput.textContent = `Thank you!`;
      })
      .catch((error) => {
        alert(error.message);
      })
      .finally(() => enablePage());
  };

  /**
   * Check for key in url and loads module data
   */
  const currentUrl = new URL(window.location.href);
  const key = currentUrl.searchParams.get("key");
  if (key) loadDataFromKey(key);
});
