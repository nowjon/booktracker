//Calling this so that the journal select is populated on load. 
//This is also called anytime a new journal entry is created in journal.js.
fillJournalEntries()

//Load the progress tracking mode setting
loadProgressTrackingMode()

/**
 * True if the current progress will equal 100% (or last page in page mode). This
 * affects whether or not we update status and date finished. 
 */
let isComplete = false;

/**
 * Current progress tracking mode: 'page' or 'percentage'
 */
let progressMode = 'percentage';

/**
 * Current progress value (page number or percentage)
 */
let currentProgressValue = 0;

/**
 * True if Linked Journal Entry is set to Create New. This is used to
 * make sure we create the journal entry before creating the progress update.
 */
let shouldCreateJournal = false;

/**
 * Loads the progress tracking mode from the server
 */
async function loadProgressTrackingMode() {
    try {
        const sessionKey = localStorage.getItem("sessionKey");
        const response = await fetch(`/api/settings/progressTrackingMode?sessionKey=${sessionKey}`);
        if (response.ok) {
            progressMode = await response.text();
            updateProgressModeUI();
        }
    } catch (error) {
        console.error("Error loading progress tracking mode:", error);
        progressMode = 'percentage'; // default fallback
        updateProgressModeUI();
    }
}

/**
 * Updates the UI based on the current progress tracking mode
 */
function updateProgressModeUI() {
    const toggle = document.getElementById("progressModeToggle");
    const label = document.getElementById("progressLabel");
    const modeLabel = document.getElementById("progressModeLabel");
    const input = document.getElementById("currentProgress");
    const completeButton = document.getElementById("completeButton");
    
    if (progressMode === 'percentage') {
        toggle.checked = true;
        label.textContent = "Progress Percentage";
        modeLabel.textContent = "Percentage Mode";
        input.step = "0.1";
        input.min = "0";
        input.max = "100";
        completeButton.textContent = "100%";
    } else {
        toggle.checked = false;
        label.textContent = "Current Page";
        modeLabel.textContent = "Page Mode";
        input.step = "1";
        input.min = "1";
        input.max = globalPageCount || "1000";
        completeButton.textContent = "Last Page";
    }
    
    // Clear any existing validation and progress display
    input.classList.remove("is-invalid");
    document.getElementById("extraProgressElements").innerHTML = "";
    document.getElementById("progressText").textContent = "";
    isComplete = false;
}

/**
 * Toggles between page and percentage mode
 */
async function toggleProgressMode() {
    const toggle = document.getElementById("progressModeToggle");
    const newMode = toggle.checked ? 'percentage' : 'page';
    
    try {
        const sessionKey = localStorage.getItem("sessionKey");
        const response = await fetch(`/api/settings/progressTrackingMode?mode=${newMode}&sessionKey=${sessionKey}`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            progressMode = newMode;
            updateProgressModeUI();
        } else {
            // Revert toggle if update failed
            toggle.checked = !toggle.checked;
        }
    } catch (error) {
        console.error("Error updating progress tracking mode:", error);
        // Revert toggle if update failed
        toggle.checked = !toggle.checked;
    }
}

/**
 * Called when the currentProgress field changes. Validates the input based on the current mode
 * and also builds dateFinished row if documenting progress at completion.
 * @returns 0 if invalid. 
 */
function validateCurrentProgress(isSubmission) {
    let input = document.getElementById("currentProgress");
    input.classList.remove("is-invalid");
    let currentEntry = parseFloat(input.value);
    currentProgressValue = currentEntry;

    if (!isSubmission) {
        //reset to false and only change to true if conditions are met. 
        isComplete = false;

        let div = document.getElementById("extraProgressElements");
        div.innerHTML = "";
        document.getElementById("progressText").textContent = "";
    }
    
    if (isNaN(currentEntry)) {
        input.classList.add("is-invalid");
        return 0;
    }
    
    if (progressMode === 'percentage') {
        if (currentEntry > 100) {
            input.classList.add("is-invalid");
            return 0;
        }
        if (currentEntry <= 0) {
            input.classList.add("is-invalid");
            return 0;
        }
        if (currentEntry == 100 && !isSubmission) {
            isComplete = true;
            buildCompletionRows();
        }
        // Update progress display
        if (!isSubmission && currentEntry > 0) {
            updateProgressDisplay();
        }
    } else {
        // Page mode
        if (currentEntry > parseInt(globalPageCount)) {
            input.classList.add("is-invalid");
            return 0;
        }
        if (currentEntry <= 0) {
            input.classList.add("is-invalid");
            return 0;
        }
        if (currentEntry == parseInt(globalPageCount) && !isSubmission) {
            isComplete = true;
            buildCompletionRows();
        }
        // Update progress display
        if (!isSubmission && currentEntry > 0) {
            updateProgressDisplay();
        }
    }
}

/**
 * Updates the progress display text
 */
function updateProgressDisplay() {
    const progressText = document.getElementById("progressText");
    if (progressMode === 'percentage') {
        const pageEquivalent = Math.round((currentProgressValue / 100) * parseInt(globalPageCount));
        progressText.textContent = `Equivalent to page ${pageEquivalent} of ${globalPageCount}`;
    } else {
        const percentage = Math.round((currentProgressValue / parseInt(globalPageCount)) * 100 * 10) / 10;
        progressText.textContent = `${percentage}% complete`;
    }
}

/**
 * Called when "100%" or "Last Page" quick button is pressed. Automatically fills in
 * the completion value based on current mode.
 */
function inputCompleteProgress() {
    let input = document.getElementById("currentProgress");
    if (progressMode === 'percentage') {
        input.value = 100;
    } else {
        input.value = parseInt(globalPageCount);
    }
    isComplete = true;
    buildCompletionRows();
}

/**
 * Builds the "Date Finished" field. Only appears when progress reaches completion.
 */
function buildCompletionRows() {
    let div = document.getElementById("extraProgressElements");
    div.innerHTML = "";
    let dateFinished = document.createElement("div");
    dateFinished.classList.add("mb-3");
    let details = document.createElement("p");
    
    if (progressMode === 'percentage') {
        details.innerHTML = "Progress that reaches 100% will automatically change the status to <span class='badge bg-purple-lt'>FINISHED</span>. Please enter the date the book was finished.";
    } else {
        details.innerHTML = "Progress that ends on a book's last page will automatically change the status to <span class='badge bg-purple-lt'>FINISHED</span>. Please enter the date the book was finished.";
    }

    let input = document.createElement("input");
    input.classList.add("form-control");
    input.style.marginRight = "10px";
    input.type = "date";
    input.id = "date";
    if (globalFinishedDate == null) {
        input.value = new Date().toLocaleDateString('sv');
    } else {
        input.value = globalFinishedDate;
    }
    
    let label = document.createElement("label");
    label.classList.add("form-label", "required");
    label.innerHTML = "Date Finished";

    dateFinished.append(label);
    dateFinished.append(details);
    dateFinished.append(input);

    div.append(dateFinished);
}

/**
 * Uses functionality from journal.js to get journal data, then creates an option
 * in the Linked Journal Entry drop-down for each jourrnal entry. 
 */
async function fillJournalEntries() {
    let bookListId = getBookIDfromURL();
    let data = await getJournalData(bookListId);
    let journalSelect = document.getElementById("journalSelect");

    journalSelect.innerHTML = '<option value="none">None</option> \
    <option value="new">Create New Journal Entry</option>'

    for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        let selectOption = document.createElement("option");
        selectOption.value = entry.id;
        selectOption.innerText = entry.title;
        journalSelect.append(selectOption);   
    }
}

/**
 * Called anytime the Linked Journal Entry field changes. If it's chaanged to "new",
 * then a new field is created that prompts the user for a new journal entry title.
 * @returns null
 */
function updateJournalQuestions() {
    let journalSelect = document.getElementById("journalSelect");
    let journalSection = document.getElementById("journalSection");
    journalSection.innerHTML = "";
    if (journalSelect.value != "new") {
        shouldCreateJournal = false;
        return;
    }

    shouldCreateJournal = true;

    let container = document.createElement("div");
    container.classList.add("mb-3");

    let label = document.createElement("label");
    label.classList.add("form-label", "required");
    label.innerText = "Journal Title";
    container.append(label);

    let title = document.createElement("input");
    title.type = "text";
    title.id = "titleInput";
    title.classList.add("form-control");
    container.append(title);

    journalSection.append(container);
}

/**
 * Called when the user clicks the submit button on the document progress form.
 * Validates the submission, then makes status/date updates, creates journal entries
 * where necessary, and submits progress data to the server. Reloads the page after. 
 * @returns null
 */
async function submissionHandler() {
    let isValid = validateSubmission();
    if (!isValid) {
        return;
    }

    let submissionData = gatherSubmissionData()

    if (isComplete) {
        lastPageSubmissionHandler(submissionData.dateFinished);
    }

    if (shouldCreateJournal) {
        submissionData.journal = await journalCreationHandler(submissionData.entryTitle);
    } else {
        //submissionData.journal = null;
    }

    await submitProgress(submissionData);

    location.reload();
}

/**
 * Evaluates the reading progress submission form and highlights errors.
 * @returns True for valid submissions, false otherwise.
 */
function validateSubmission() {
    let isValid = true;

    let currentProgress = document.getElementById("currentProgress");
    currentProgress.classList.remove("is-invalid");
    validateCurrentProgress(true);

    if (currentProgress.value == "") {
        currentProgress.classList.add("is-invalid");
        isValid = false;
    }

    if (isComplete) {
        let dateEntry = document.getElementById("date");
        dateEntry.classList.remove("is-invalid");

        if (dateEntry.value == "") {
            dateEntry.classList.add("is-invalid");
            isValid = false;
        }
    }

    if (shouldCreateJournal) {
        let title = document.getElementById("titleInput");
        title.classList.remove("is-invalid");

        if (title.value == "") {
            title.classList.add("is-invalid");
            isValid = false;
        }
    }

    return isValid;
}

/**
 * Gathers Reading Progress submission data and conditionally builds an object
 * to store it. 
 * @returns An object holding all Reading Progress submission data. 
 */
function gatherSubmissionData() {
    let data = {};
    
    data.currentProgress = document.getElementById("currentProgress").value;

    if (isComplete) {
        data.dateFinished = document.getElementById("date").value;
    }
    
    let linkedJournal = document.getElementById("journalSelect");
    if (linkedJournal.value != "none" && linkedJournal.value != "new") {
        data.journal = linkedJournal.value;
    }

    if (shouldCreateJournal) {
        data.entryTitle = document.getElementById("titleInput").value;
    }

    data.comment = document.getElementById("progressComment").value;

    return data;
}

/**
 * Submits a bookList update that changes status to "FINISHED" and updates the finish date
 * to the user-provided date. 
 * @param {*} dateFinished The date finished that the user provides in the reading progress form.
 */
function lastPageSubmissionHandler(dateFinished) {
    let body = {};
    body.sessionKey = localStorage.getItem("sessionKey");

    let data = {
        "id": getBookIDfromURL(),
        "rating": null,
        "status": "FINISHED",
        "startDate": null,
        "finishedDate": dateFinished
    };

    if (globalStatus == "FINISHED") {
        data.status = null;
    }

    body.data = data;
    
    fetch(`/api/BookList/${body.data.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.status === 401) {
            console.log("ERROR");
        }
        return
    })
    .then(data => {
      //console.log(data);
      
    })
    .catch(error => console.error(error));
    

}

/**
 * Creates an empty journal entry.
 * @param {string} title The title of the journal entry that the user enters.
 */
async function journalCreationHandler(title) {
    let sessionKey = localStorage.getItem("sessionKey");
    let bookListID = getBookIDfromURL();
    let data = {
        "title": title,
        "htmlContent": ""
    }
    try {
        const response = await fetch(`/api/journal/${bookListID}/entries?sessionKey=${sessionKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        });
        const statusCode = response.status;
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Submits the progress update to the server. 
 * @param {Object} data Data pulled from gatherSubmissionData(). 
 */
async function submitProgress(data) {
    let sessionKey = localStorage.getItem("sessionKey");
    let bookListID = getBookIDfromURL();
    
    // Convert progress value based on mode
    let progressValue = parseFloat(data.currentProgress);
    if (progressMode === 'page') {
        // Convert page to percentage for storage
        progressValue = (progressValue / parseInt(globalPageCount)) * 100;
    }
    
    let body = {
        "currentPosition": progressValue,
        "journal": data.journal,
        "comment": data.comment
    }
    if (body.comment == "") {
        body.comment = null;
    }
    
    try {
        const response = await fetch(`/api/BookList/${bookListID}/progress?sessionKey=${sessionKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
        });
        const statusCode = response.status;
    } catch (error) {
        console.error(error);
        throw error;
    }
}