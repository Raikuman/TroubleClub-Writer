let currentConversation = null;
let conversations = [];

const conversationTemplate = {
    fileName: "",
    dialogue: structuredClone(dialogueTemplate)
};

const conversationWriterDiv = $("#conversation-writer");
conversationWriterDiv.hide();

loadConversationData();

function loadConversationData() {
    $("#file-picker").load("../components/filePicker.html", function() {
        // Load conversations into array
        conversations = JSON.parse(localStorage.getItem("conversations"));

        // If conversations could not be parsed, use an empty array
        if (conversations === null) {
            conversations = [];
        }

        // Load file.html component and populate the file list
        $.get("../components/file.html").done(function (fileResponse) {
            const fileObj = $(fileResponse);
            for (let i = 0; i < conversations.length; i++) {
                addFile(fileObj.clone(), loadConversationFromFile, conversations[i].fileName);
            }
        });
    });
}

function addNewFile() {
    // Ensure writer div is shown
    conversationWriterDiv.show();

    // Create new file object
    $.get("../components/file.html", function(fileResponse) {
        const fileObj = $(fileResponse);

        // Create file in file list;
        const fileName = "File-" + $("#files").children().length;
        addFile(fileObj, loadConversationFromFile, fileName);

        // Construct new conversation
        const newConversation = structuredClone(conversationTemplate);
        newConversation.fileName = fileName;

        // Handle state
        currentConversation = newConversation;
        conversations.push(currentConversation);

        // Instantiate conversation if not existing
        instantiateConversation(currentConversation);

        saveConversations()
    });
}

function loadConversationFromFile() {
    conversationWriterDiv.show();
    // Get value from radio
    const value = $(this).val();

    // Get conversation from array using file name
    let foundConversation = null;
    for (let i = 0; i < conversations.length; i++) {
        if (conversations[i].fileName === value) {
            foundConversation = conversations[i];
            break;
        }
    }

    // Check found conversation and set current conversation
    if (foundConversation == null) {
        return;
    } else {
        currentConversation = foundConversation;
    }

    // Load conversation to screen
    $("#lines-list").empty();
    instantiateConversation(currentConversation);
}

function deleteConversation() {
    // Save file name to delete file in file picker
    const fileName = currentConversation.fileName;

    if (!confirm("Do you want to delete " + fileName + "?")) {
        return;
    }

    // Remove current conversation from data
    const index = conversations.indexOf(currentConversation);
    if (index > -1) {
        conversations.splice(index, 1);
        saveConversations();
    } else {
        showToast("Unable to delete conversation");
        return;
    }

    // Find and delete the file object
    const files = $("#files").children();
    for (let i = 0; i < files.length; i++) {
        let currentFile = files.eq(i);

        // Check if child has the file id
        if (currentFile.is("#file")) {
            // Check if file name matches the deletion name
            if (currentFile.find("#file-name").text() === fileName) {
                currentFile.remove();
                break;
            }
        }
    }

    // Hide div
    conversationWriterDiv.hide();
}

function deleteConversationLine(dataObj) {
    currentConversation.dialogue.lines.splice(dataObj.index, 1);
}

function saveConversations() {
    // Stringify conversations & update local storage
    localStorage.setItem("conversations", JSON.stringify(conversations));

    showToast("Saved conversations");
}

function instantiateConversation(data) {
    // Handle conversation object
    const conversationSettings = $("#conversation-settings");
    if (conversationSettings.children().length === 0) {
        conversationSettings.load("../components/conversationSettings.html", function() {
            // Load conversation settings data
            loadConversationSettings($(this));
            loadConversationSettingsData($(this), data);
        });
    } else {
        loadConversationSettingsData(conversationSettings, data);
    }

    // Handle dialogue object
    const dialogue = $("#dialogue");
    if (dialogue.children().length === 0) {
        dialogue.load("../components/dialogue.html", function() {
            // Setup dialogue new line button
            $("#add-new-line").on("click", instantiateConversationLine);

            // Make dialogue sortable
            $("#lines-list").sortable({
                tolerance: 'pointer'
            });

            // Load dialogue data
            loadConversationDialogue();
        });
    } else {
        loadConversationDialogue();
    }
}

function loadConversationSettings(settingObj) {
    // Update listeners
    const input = settingObj.find("#file-name");
    const fileChildren = $("#files").children();

    input.on("focusout", function(event) {
        // Skip spaces and .
        if (event.which === 32 || event.which === 46) {
            event.preventDefault();
        }
    }).on("focusout", function() {
        const input = $(this);

        if (!input.val()) {
            // Set default file name
            let finalName = "File-" + (conversations.indexOf(currentConversation) + 1);

            input.val(finalName);
            fileChildren.eq(conversations.indexOf(currentConversation) + 1).find("#file-name").text(finalName);
        }

        currentConversation.fileName = input.val();
        saveConversations();
    }).on("keyup", function(event) {
        const input = $(this);

        // Save when pressing enter
        if (event.which === 13) {
            if (!input.val()) {
                // Set default file name
                let finalName = "File-" + (conversations.indexOf(currentConversation) + 1);

                input.val(finalName);
                fileChildren.eq(conversations.indexOf(currentConversation) + 1).find("#file-name").text(finalName);
            }

            input.trigger("blur");
            saveConversations();
            return;
        }

        // Check for correct file naming
        const inputText = input.val();
        let finalName = inputText;

        // Update name from input
        input.val(finalName);

        // Update file obj
        const fileObj = fileChildren.eq(conversations.indexOf(currentConversation) + 1);
        if (!inputText) {
            fileObj.find("#file-name").text(" ");
        } else {
            fileObj.find("#file-name").text(finalName);
        }
        fileObj.find("#file-radio").val(finalName);
    });
}

function loadConversationSettingsData(settingObj, data) {
    if (data === undefined) {
        return;
    }
    const input = settingObj.find("#file-name");

    // Get file object
    const fileObj = $("#files").children().eq(conversations.indexOf(currentConversation) + 1);

    // Update file name
    input.val(currentConversation.fileName);
    fileObj.find("#file-name").text(currentConversation.fileName);
    fileObj.find("#file-radio").val(currentConversation.fileName);
}

function loadConversationDialogue() {
    // Load lines into dialogue
    $.get("../components/line.html", function(lineResponse) {
        const lineObj = $(lineResponse);
        for (let i = 0; i < currentConversation.dialogue.lines.length; i++) {
            addNewLine(lineObj.clone(), $("#lines-list"), currentConversation.dialogue.lines[i], saveConversations, deleteConversationLine);
        }
    });
}

function instantiateConversationLine() {
    // Create new line object
    $.get("../components/line.html", function(lineResponse) {
        let lineData = structuredClone(lineTemplate);
        currentConversation.dialogue.lines.push(lineData);
        addNewLine($(lineResponse), $("#lines-list"), lineData, saveConversations, deleteConversationLine);
        saveConversations();
    });
}

function forceSaveConversations() {
    // Retrieve data from settings
    currentConversation.fileName = $("#file-name").text();

    // Retrieve data from dialogue
    $("#lines-list").children().each(function(lineIterator) {
        const line = $(this);
        const lineData = currentConversation.dialogue.lines[lineIterator];

        lineData.sticker = line.find("#sticker").val();
        lineData.reaction = line.find("#reaction").val();
        lineData.actor = line.find("#actor").val();
        lineData.targetChannel = line.find("#custom-channel").val();
        lineData.typeSpeed = line.find("#type-speed").val();
        lineData.readSpeed = line.find("#read-speed").val();
        lineData.line = line.find("#line").val();
    });

    saveConversations();
}

function downloadConversation(data) {
    let targetData;
    if (data === undefined) {
        targetData = currentConversation;
    } else {
        targetData = data;
    }

    $("<a />", {
        "download": targetData.fileName + ".json",
        "href": "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(targetData)),
    }).appendTo("body").click(function() { $(this).remove(); })[0].click();
}

function downloadAllFiles() {
    if (!confirm("Do you want to download all conversations?")) {
        return;
    }

    for (let i = 0; i < conversations.length; i++) {
        downloadConversation(conversations[i]);
    }
}