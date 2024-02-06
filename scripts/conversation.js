let currentFile = null;
let currentConversation = null;
let conversationList = [];

const conversationTemplate = {
    fileName: "",
    lines: []
};

const conversationWriterDiv = $("#conversation-writer");
conversationWriterDiv.hide();

function addNewFile() {
    conversationWriterDiv.show();

    $.get("../components/file.html", function (fileResponse) {
        $("#conversation-settings").load("../components/conversationSettings.html", function(settingResponse) {
            const fileObj = $(fileResponse);
            const settingObj = $(this);
            const settingNameInput = settingObj.find("#file-name");
            const fileName = fileObj.find("#file-name");
            const fileList = $("#files");

            currentFile = fileObj;
            let currentName = "File-" + fileList.children().length;

            // Add file to list
            addFile(fileObj, "conversationLoadFromFile(this)", "");
            fileName.text(currentName);

            // Update file name in settings
            settingNameInput.val(currentName);

            // Create conversation object
            let conversation = structuredClone(conversationTemplate);
            conversation.fileName = currentName;

            // Set file input field as name
            settingNameInput.on("keyup", function(event) {
                renameConversationFile($(this), event);
            })

            // Handle data
            conversationList.push(conversation);

            // Save current
            if (fileList.children().length > 2) {
                saveConversations();
            }

            currentConversation = conversation;

            // Load dialogue pane
            loadDialoguePane("conversationNewLine()", currentConversation.lines, "conversationDeleteLine(this)");
        });
    });
}

function loadConversations() {
    conversationList = JSON.parse(localStorage.getItem("conversations"));
    if (conversationList === null) {
        conversationList = [];
    }

    $.get("../components/file.html").done(function(fileResponse) {
        const fileObj = $(fileResponse);

        for (let i = 0; i < conversationList.length; i++) {
            addFile(fileObj.clone(), "conversationLoadFromFile(this)", conversationList[i].fileName);
        }
    });
}

$("#file-picker").load("../components/filePicker.html", function() {
    loadConversations();
});

function conversationNewLine() {
    newLine("conversationDeleteLine(this)");
    currentConversation.lines.push({ ...lineTemplate });
    saveConversations();
}

function conversationDeleteLine(line) {
    if (currentConversation === null || currentFile === null) {
        showToast("Unable to delete line")
        return;
    }

    const lineList = $("#lines-list");
    const lineObj = $(line).parent().parent();
    const lineIndex = lineList.children().index(lineObj);

    if (!confirm("Are you sure you want to delete line #" + (lineIndex + 1))) {
        return;
    }

    // Delete data
    if (lineIndex > -1) {
        currentConversation.lines.splice(lineIndex, 1);
    } else {
        showToast("Unable to delete line")
        return;
    }

    // Remove line
    lineObj.remove();

    showToast("Deleted line #" + (lineIndex + 1))
    saveConversations();
}

function saveConversations() {
    saveLinesToObj(currentConversation);

    // Stringify conversation list & update local storage
    localStorage.setItem("conversations", JSON.stringify(conversationList));

    showToast("Saved conversations");
}

function conversationLoadFromFile(radio) {
    // Set current file & conversation
    currentFile = $(radio).parent();
    if (currentFile !== null && currentFile.find("#file-name").text() !== radio.value) {
        return;
    }

    conversationWriterDiv.show();
    saveConversations();

    for (let i = 0; i < conversationList.length; i++) {
        if (conversationList[i].fileName === radio.value) {
            currentConversation = conversationList[i];
            break;
        }
    }


    // Update information
    let convSettings = $("#conversation-settings");
    if (convSettings.children()) {
        // Load settings
        convSettings.load("../components/conversationSettings.html", function() {
            loadConversationSettings($(this), radio);
        });
    }

    let dialogue = $("#dialogue");
    if (dialogue.children()) {
        // Load dialogue
        loadDialoguePane("conversationNewLine()", currentConversation.lines, "conversationDeleteLine(this)");
    }
}

function loadConversationSettings(settingObj, radio) {
    const input = settingObj.find("#file-name");
    input.val(radio.value);

    // Set file input field as name
    input.on("keyup", function(event) {
        renameConversationFile($(this), event);
    });
}

function renameConversationFile(inputObj, event) {
    const eventKey = event.key;
    if (eventKey === " " || eventKey === "Tab" || eventKey === "Enter") {
        event.preventDefault();
        return;
    }
    let inputText = inputObj.val()

    let finalName;
    if (!inputText) {
        // Set default file name
        finalName = "File-" + $("#files").children().index(currentFile);
    } else {
        // Set name from input
        finalName = inputText;
    }

    // Update name from file picker
    currentFile.find("#file-name").text(finalName);

    // Update radio value
    currentFile.find("#file-radio")[0].value = finalName;

    // Update name in data
    currentConversation.fileName = finalName;
}

function deleteConversation() {
    if (currentConversation === null || currentFile === null) {
        showToast("Unable to delete conversation")
        return;
    }
    const fileName = currentFile.find("#file-name").text();

    if (!confirm("Are you sure you want to delete conversation: " + fileName)) {
        return;
    }

    // Delete data
    const index = conversationList.indexOf(currentConversation);
    if (index > -1) {
        conversationList.splice(index, 1);
    } else {
        showToast("Unable to delete conversation")
        return;
    }

    // Delete components
    currentFile.remove();
    $("#conversation-settings").empty();
    $("#dialogue").empty();

    showToast("Deleted conversation " + fileName)
    saveConversations();
}