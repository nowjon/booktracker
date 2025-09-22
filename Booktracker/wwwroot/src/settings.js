function getExportData(format) {
    let sessionKey = localStorage.getItem("sessionKey");
    fetch(`/api/data/export?format=${format}&sessionKey=${sessionKey}`)
  .then(response => response.blob())
  .then(blob => {
    // Create a temporary URL for the blob object
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = `export.${format}`;

    // Append the link to the document body
    document.body.appendChild(link);

    // Programmatically click the link to trigger the file download
    link.click();

    // Clean up the temporary URL and remove the link element
    URL.revokeObjectURL(url);
    link.remove();
  })
  .catch(error => {
    // Handle any errors
    console.error('Error downloading file:', error);
  });
}

function submitDataImport() {
    let format = document.getElementById("importFormat").value;
    let sessionKey = localStorage.getItem("sessionKey");
    let fileInput = document.getElementById("fileInput");
    let file = fileInput.files[0];
    let formData = new FormData();
    formData.append('file', file);
    fetch(`/api/data/import?format=${format}&sessionKey=${sessionKey}`, {
        method: 'POST',
        body: formData
      })
        .then(response => {
          // Handle the response
          if (response.ok) {
            alert("Import completed successfully.");
            console.log('File uploaded successfully');
          } else {
            // File upload failed
            alert("Import failed");
            console.error('File upload failed');
          }
        })
        .catch(error => {
          // Handle any errors
          alert("Import failed");
          console.error('Error uploading file:', error);
        });
}
getMostRecentVersion();
function getMostRecentVersion() {
  fetch(`https://api.github.com/repos/wars2k/booktracker/releases`, {
    method: 'GET',
    })
    .then(response => response.json())
    .then(data => displayMostRecentVersion(data))
    .catch(error => console.error(error));
}

function displayMostRecentVersion(data) {
  let version = document.getElementById("mostRecentVersion");
  version.innerText = data[0].tag_name;
}

function displayErrorGettingVersion(error) {
  let version = document.getElementById("mostRecentVersion");
  version.innerText = "Error getting latest version from Github.";
  console.error(error);
}

function getCurrentLoggingLevel() {
  let sessionKey = localStorage.getItem("sessionKey");
  fetch(`/api/settings/loggingLevel?sessionKey=${sessionKey}`, {
    method: 'GET',
    })
    .then(response => response.json())
    .then(data => displayLoggingLevel(data))
    .catch(error => console.error(error));
}

function displayLoggingLevel(data) {
  document.getElementById("loggingLevel").value = data;
}

getCurrentLoggingLevel();
getCurrentProgressMode();

function updateLoggingLevel() {
  let sessionKey = localStorage.getItem("sessionKey");
  let level = document.getElementById("loggingLevel").value;
  fetch(`/api/settings/loggingLevel?level=${level}&sessionKey=${sessionKey}`, {
    method: 'PUT',
  })
  .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
}

function getCurrentProgressMode() {
  let sessionKey = localStorage.getItem("sessionKey");
  fetch(`/api/settings/progressTrackingMode?sessionKey=${sessionKey}`, {
    method: 'GET',
  })
  .then(response => response.text())
  .then(data => displayProgressMode(data))
  .catch(error => console.error(error));
}

function displayProgressMode(mode) {
  const toggle = document.getElementById("progressModeToggle");
  const label = document.getElementById("progressModeLabel");
  
  if (mode === 'percentage') {
    toggle.checked = true;
    label.textContent = "Percentage Mode";
  } else {
    toggle.checked = false;
    label.textContent = "Page Mode";
  }
}

function updateProgressMode() {
  let sessionKey = localStorage.getItem("sessionKey");
  let toggle = document.getElementById("progressModeToggle");
  let mode = toggle.checked ? 'percentage' : 'page';
  
  fetch(`/api/settings/progressTrackingMode?mode=${mode}&sessionKey=${sessionKey}`, {
    method: 'PUT',
  })
  .then(response => {
    if (response.ok) {
      displayProgressMode(mode);
      alert(`Progress tracking mode updated to ${mode} mode.`);
    } else {
      alert("Failed to update progress tracking mode.");
    }
  })
  .catch(error => {
    console.error(error);
    alert("Failed to update progress tracking mode.");
  });
}