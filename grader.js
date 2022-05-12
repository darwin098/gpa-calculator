const gradeContainer = document.createElement("div");
gradeContainer.style.position = "absolute";
gradeContainer.style.right = "30px";
gradeContainer.style.top = "30px";
document.querySelector("body").appendChild(gradeContainer);

// Share link input field
const serverPortLabel = document.createElement("label");
serverPortLabel.textContent = "local server port number (default: 3000)";
const serverPortInput = document.createElement("input");
serverPortInput.setAttribute("type", "text");
serverPortInput.placeholder = "3000";
serverPortInput.value = "3000";

// Share link input field
const shareLinkInputLabel = document.createElement("label");
shareLinkInputLabel.textContent =
  "Id of generated sharing link (default: share-link)";
const shareLinkInput = document.createElement("input");
shareLinkInput.setAttribute("type", "text");
shareLinkInput.placeholder = "share-link";
shareLinkInput.value = "share-link";

// User Defined Sharing Id
const userDefinedSharingIdLabel = document.createElement("label");
userDefinedSharingIdLabel.textContent =
  "Id of User Defined Sharing Id input (e.g. user-defined-id)";
const userDefinedSharingIdInput = document.createElement("input");
userDefinedSharingIdInput.setAttribute("type", "text");
userDefinedSharingIdInput.placeholder = "user-defined-id";

// Generate User Defined Sharing Link
const generateUserDefinedSharingLinkLabel = document.createElement("label");
generateUserDefinedSharingLinkLabel.textContent =
  "Id of button to generate link with user defined sharing id (e.g. user-defined-generate)";
const generateUserDefinedSharingLinkInput = document.createElement("input");
generateUserDefinedSharingLinkInput.setAttribute("type", "text");
generateUserDefinedSharingLinkInput.placeholder = "user-defined-generate";

// Delete Expired Ids
const deleteExpiredIdLabel = document.createElement("label");
deleteExpiredIdLabel.textContent =
  "Id of button to delete expired sharing id (e.g. delete-expired)";
const deleteExpiredIdButtonInput = document.createElement("input");
deleteExpiredIdButtonInput.setAttribute("type", "text");
deleteExpiredIdButtonInput.placeholder = "delete-expired";

// The form
const infoForm = document.createElement("form");
infoForm.style.display = "flex";
infoForm.style.flexDirection = "column";
infoForm.appendChild(serverPortLabel);
infoForm.appendChild(serverPortInput);
infoForm.appendChild(shareLinkInputLabel);
infoForm.appendChild(shareLinkInput);
infoForm.appendChild(userDefinedSharingIdLabel);
infoForm.appendChild(userDefinedSharingIdInput);
infoForm.appendChild(generateUserDefinedSharingLinkLabel);
infoForm.appendChild(generateUserDefinedSharingLinkInput);
infoForm.appendChild(deleteExpiredIdLabel);
infoForm.appendChild(deleteExpiredIdButtonInput);
gradeContainer.appendChild(infoForm);

// Populate with cache
const storageKeys = [
  ["portNumber", serverPortInput],
  ["shareLink", shareLinkInput],
  ["userKeyInput", userDefinedSharingIdInput],
  ["userKeyButton", generateUserDefinedSharingLinkInput],
  ["deleteButton", deleteExpiredIdButtonInput],
];
storageKeys.forEach(([key, input]) => {
  input.required = true;
  const value = localStorage.getItem(key);
  if (!value) return;
  input.value = value;
});

// Grade button
const gradeButton = document.createElement("button");
gradeButton.textContent = "Grade 💯";
gradeButton.style.fontSize = "2em";
gradeContainer.appendChild(gradeButton);

function timeoutPromise(resolvedValue, duration = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(
      () =>
        resolvedValue.error ? reject(resolvedValue) : resolve(resolvedValue),
      duration
    );
  });
}

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const charactersLength = characters.length;
function makeId(length) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const generatedModules = {};
function generateModules(n = 5) {
  const moduleNameInput = document.querySelector("#module-name");
  const creditUnitInput = document.querySelector("#credit");
  const gradeInput = document.querySelector("#grade");
  const createModuleButton = document.querySelector("#new-module-form button");

  for (let i = 0; i < n; i++) {
    moduleNameInput.value = makeId(4);
    creditUnitInput.value = getRandomInt(4, 7);
    gradeInput.value = getRandomInt(4, 9) / 2;
    createModuleButton.click();
    generatedModules[moduleNameInput.value] = {
      credit: creditUnitInput.value,
      grade: gradeInput.value,
    };
  }
}

const userDefinedInputStatus = {
  beforeSend: null,
  pending: null,
  complete: null,
};
const userDefinedButtonStatus = {
  beforeSend: null,
  pending: null,
  complete: null,
};

const expectedUserDefinedControlsIsDisabled = [
  ["beforeSend", false],
  ["pending", true],
  ["complete", false],
];

function initTests() {
  const randomKey = makeId(10);

  function updateUserDefinedControlIsDisabled(event) {
    const userDefinedIdInput = document.getElementById(
      userDefinedSharingIdInput.value
    );
    const userDefinedSubmitButton = document.getElementById(
      generateUserDefinedSharingLinkInput.value
    );
    userDefinedInputStatus[event] = userDefinedIdInput.disabled;
    userDefinedButtonStatus[event] = userDefinedSubmitButton.disabled;
    console.log(userDefinedInputStatus);
  }

  function getStorageUrl(key, expireDuration = 1) {
    const port = +serverPortInput.value;
    return `http://localhost:${port}/storage?key=${key}&expireDuration=${expireDuration}`;
  }

  function allowUserDefinedSharingId() {
    const userDefinedIdInput = document.getElementById(
      userDefinedSharingIdInput.value
    );
    const userDefinedSubmitButton = document.getElementById(
      generateUserDefinedSharingLinkInput.value
    );
    const generatedLinkInput = document.getElementById(shareLinkInput.value);

    userDefinedIdInput.value = randomKey;
    generatedLinkInput.value = "";

    const resultPromise = timeoutPromise({}, 1000)
      .then(function () {
        const url = new URL(generatedLinkInput.value);
        const searchParams = url.searchParams;
        const key = searchParams.get("key");
        if (key === randomKey) {
          return key;
        } else {
          throw new Error(
            `Returned key (${key}) does not match given key (${randomKey})`
          );
        }
      })
      .then((key) => fetch(getStorageUrl(key)))
      .then((res) => res.json())
      .then((json) =>
        json.every(
          ({ name, credit, grade }) =>
            generatedModules[name]?.credit === credit &&
            generatedModules[name]?.grade === grade
        )
      )
      .then((result) => {
        if (!result)
          return { error: "Stored module does not match expected modules" };
      })
      .finally(() =>
        updateUserDefinedControlIsDisabled(
          expectedUserDefinedControlsIsDisabled[2][0]
        )
      );

    updateUserDefinedControlIsDisabled(
      expectedUserDefinedControlsIsDisabled[0][0]
    );
    userDefinedSubmitButton.click();
    updateUserDefinedControlIsDisabled(
      expectedUserDefinedControlsIsDisabled[1][0]
    );
    return resultPromise;
  }

  async function userDefinedControlsShouldBeDisabled() {
    const useDefinedInputIsDisabledCorrectly =
      expectedUserDefinedControlsIsDisabled.every(
        ([key, value]) => userDefinedInputStatus[key] === value
      );
    const useDefinedButtonIsDisabledCorrectly =
      expectedUserDefinedControlsIsDisabled.every(
        ([key, value]) => userDefinedButtonStatus[key] === value
      );
    if (
      !useDefinedInputIsDisabledCorrectly ||
      !useDefinedButtonIsDisabledCorrectly
    ) {
      throw { error: "User defined controls not disabled correctly" };
    }
  }

  async function duplicateKeyShouldReject() {
    return fetch(getStorageUrl(randomKey), {
      method: "POST",
      body: JSON.stringify({ error: "I should not be added" }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (response.status === 400) {
        return true;
      } else {
        throw new Error(
          `Reused, unexpired key (${randomKey}, from first test) not rejectedd`
        );
      }
    });
  }

  const secondsToWait = 5;
  const expiryDuration = (secondsToWait - 1) / (24 * 60 * 60);

  const expiringRandomKey = makeId(10);
  const createUrl = getStorageUrl(expiringRandomKey, expiryDuration);
  const createOptions = {
    method: "POST",
    body: JSON.stringify({ key: expiringRandomKey }),
    headers: {
      "Content-Type": "application/json",
    },
  };
  async function shouldDeleteExpiredKey() {
    return fetch(createUrl, createOptions)
      .then((response) => {
        if (response.status !== 201) {
          response.json().then((json) => console.error(json));
          throw new Error(
            `Something else went wrong during first insertion | key: ${expiringRandomKey}`
          );
        }
      })
      .then(() => timeoutPromise({}, secondsToWait * 1000)) //milliseconds
      .then(() =>
        document.getElementById(deleteExpiredIdButtonInput.value).click()
      )
      .then(() => timeoutPromise({}, 1000)) //milliseconds
      .then(() => fetch(createUrl, createOptions))
      .then((response) => {
        if (response.status !== 201) {
          response.json().then((json) => console.error(json));
          throw new Error(
            `Failed to create with even after deleting expired key | key: ${expiringRandomKey}`
          );
        }
      });
  }

  const criterias = [
    [`It should allow user defined sharing id`, allowUserDefinedSharingId],
    [
      `It should disable user defined controls when loading`,
      userDefinedControlsShouldBeDisabled,
    ],
    [
      `It should reject when sharing id current exists`,
      duplicateKeyShouldReject,
    ],
    [
      `It should delete expired sharing id and allow adding again (Waits ${secondsToWait}s)`,
      shouldDeleteExpiredKey,
    ],
  ];

  return criterias;
}

const criterias = initTests();

const statusEnum = {
  PENDING: "🔸",
  RUNNING: "⏳",
  SUCCESS: "✔️",
  FAIL: "❌",
  CANCELLED: "✖️",
};

const checklist = document.createElement("ol");
checklist.style.fontSize = "1.5em";
criterias.forEach(([description], index) => {
  const listItem = document.createElement("li");
  const statusSpan = document.createElement("span");
  statusSpan.textContent = statusEnum.PENDING;
  const descriptionSpan = document.createElement("span");
  descriptionSpan.textContent = description;
  listItem.appendChild(statusSpan);
  listItem.appendChild(descriptionSpan);
  checklist.appendChild(listItem);
  criterias[index][2] = statusSpan;
});

gradeContainer.appendChild(checklist);

gradeButton.onclick = async function () {
  if (!Object.keys(generatedModules).length) generateModules(5);

  const allInputExists = storageKeys.every(([key, input]) => {
    const value = input.value;
    if (!input.reportValidity()) return false;
    localStorage.setItem(key, value);
    return true;
  });
  if (!allInputExists) return;

  criterias.forEach(([_, __, descriptionSpan]) => {
    descriptionSpan.textContent = statusEnum.RUNNING;
  });

  let failed = false;
  for (let i = 0; i < criterias.length; i++) {
    const [_, testRunner, statusSpan] = criterias[i];

    if (failed) {
      statusSpan.textContent = statusEnum.CANCELLED;
      continue;
    }

    try {
      await testRunner();
      statusSpan.textContent = statusEnum.SUCCESS;
    } catch (error) {
      statusSpan.textContent = statusEnum.FAIL;
      failed = true;
      console.log(error);
      continue;
    }
  }
};
