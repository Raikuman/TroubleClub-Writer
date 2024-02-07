let currentInteraction = null;
let interactions = [];

const interactionTemplate = {
    fileName: "",
    reqWords: 1,
    words: [],
    dialogues: []
}

const interactionWriterDiv = $("#interactions-writer");
interactionWriterDiv.hide();

loadInteractionData();

function loadInteractionData() {
    $("#file-picker").load("../components/filePicker.html", function() {
        // Load interactions into array
        interactions = JSON.parse(localStorage.getItem("interactions"));

        // If interactions could not be parsed, use an empty array
        if (interactions === null) {
            interactions = [];
        }

        // Load file.html component and populate the file list
        $.get("../components/file.html").done(function(fileResponse) {
            const fileObj = $(fileResponse);
            for (let i = 0; i < interactions.length; i++) {
                addFileNew(fileObj.clone(), loadInteractionFromFile, interactions[i].fileName);
            }
        });
    });
}

function addNewFile() {
    // Ensure writer div is shown
    interactionWriterDiv.show();

    // Create new file object
    $.get("../components/file.html", function(fileResponse) {
        const fileObj = $(fileResponse);

        // Create file in file list
        const fileName = handleInteractionFile(fileObj, true);

        // Construct new interaction
        const newInteraction = structuredClone(interactionTemplate);
        newInteraction.fileName = fileName;

        // Handle state
        currentInteraction = newInteraction;
        interactions.push(currentInteraction);

        // Instantiate interaction if not existing
        instantiateInteraction(currentInteraction);

        saveInteractions();
    });
}

function loadInteractionFromFile() {
    interactionWriterDiv.show();

    // Get value from radio
    const value = $(this).val();

    // Get interaction from array using file name
    let foundInteraction = null;
    for (let i = 0; i < interactions.length; i++) {
        if (interactions[i].fileName === value) {
            foundInteraction = interactions[i];
            break;
        }
    }

    // Check found interaction and set current interaction
    if (foundInteraction == null) {
        return;
    } else {
        currentInteraction = foundInteraction;
    }

    // Load interaction to screen
    instantiateInteraction(currentInteraction);
}

function handleInteractionFile(fileObj, isCurrent, customName) {
    const fileList = $("#files");

    // Construct file name
    let fileName = customName;
    if (!fileName) {
        fileName = "File-" + fileList.children().length;
    }

    // Add file to list
    addFileNew(fileObj, loadInteractionFromFile, fileName);

    return fileName;
}

function deleteInteraction() {
    // Save file name to delete file in file picker
    const fileName = currentInteraction.fileName;

    // Remove current interaction from data
    const index = interactions.indexOf(currentInteraction);
    if (index > -1) {
        interactions.splice(index, 1);
    } else {
        showToast("Unable to delete interaction")
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
    interactionWriterDiv.hide();
    saveInteractions();
}

function saveInteractions() {
    // Stringify interactions & update local storage
    localStorage.setItem("interactions", JSON.stringify(interactions));

    showToast("Saved interactions");
}

function instantiateInteraction(data) {
    // Handle interaction object
    const interactionSettings = $("#interaction-settings");
    if (interactionSettings.children().length === 0) {
        interactionSettings.load("../components/interactionSettings.html", function() {
            // Load interaction settings data
            loadInteractionSettings($(this));
            loadInteractionSettingsData($(this), data);
        });
    } else {
        loadInteractionSettingsData(interactionSettings, data);
    }

    // Handle dialogue object
    const dialogues = $("#dialogues");
    if (dialogues.children().length === 0) {
        dialogues.load("../components/interactionDialogues.html", function() {
            // Load dialogues data
            loadInteractionDialogues();
        });
    } else {
        const dialogueList = dialogues.find("#dialogue-list");
        dialogues.find("#dialogue-list").children().slice(0, dialogueList.children().length - 1).remove();
        loadInteractionDialogues();
    }
}

function loadInteractionSettings(settingObj) {
    // Update listeners
    const input = settingObj.find("#file-name");
    const fileChildren = $("#files").children();

    input.on("keypress", function(event) {
        // Skip spaces and .
        if (event.which === 32 || event.which === 46) {
            event.preventDefault();
        }
    }).on("focusout", function() {
        const input = $(this);

        if (!input.val()) {
            // Set default file name
            let finalName = "File-" + (interactions.indexOf(currentInteraction) + 1);

            input.val(finalName);
            fileChildren.eq(interactions.indexOf(currentInteraction) + 1).find("#file-name").text(finalName);
        }

        currentInteraction.fileName = input.val();
        saveInteractions();
    }).on("keyup", function(event) {
        const input = $(this);

        // Check for correct file naming
        const inputText = input.val();
        let finalName = inputText;

        // Update name from input
        input.val(finalName);

        // Update file obj
        const fileObj = fileChildren.eq(interactions.indexOf(currentInteraction) + 1);
        if (!inputText) {
            fileObj.find("#file-name").text(" ");
        } else {
            fileObj.find("#file-name").text(finalName);
        }
        fileObj.find("#file-radio").val(finalName);

        // Save when pressing enter
        if (event.which === 13) {
            if (!input.val()) {
                // Set default file name
                let finalName = "File-" + (interactions.indexOf(currentInteraction) + 1);

                input.val(finalName);
                fileChildren.eq(interactions.indexOf(currentInteraction) + 1).find("#file-name").text(finalName);
            }

            input.trigger("blur");
            saveInteractions();
        }
    });

    // Handle adding words
    $("#add-word").on("click", function() {
        // Check input from field
        const input = $("#words-input");
        addWordInput(input)
    });

    $("#words-input").on("keyup", function(event) {
        // Add word when pressing enter
        if (event.which === 13) {
            const input = $(this);
            addWordInput(input)
        }
    });

    // Handle req words spinbox
    $("#req-words").on("keydown", function(event) {
        event.preventDefault();
    }).on("click", function() {
        currentInteraction.reqWords = $(this).val();
        saveInteractions();
    });

}

function addWordInput(input) {
    if (input.val()) {
        $.get("../components/requiredWord.html").done(function(wordResponse) {
            addRequiredWord($(wordResponse), $("#words-table"), input.val());
            currentInteraction.words.push(input.val());
            input.val("");
            saveInteractions();
        });
    }
}

function loadInteractionSettingsData(settingObj, data) {
    if (data === undefined) {
        return;
    }
    const input = settingObj.find("#file-name");

    // Get file object
    const fileObj = $("#files").children().eq(interactions.indexOf(currentInteraction) + 1);

    // Update file name
    input.val(currentInteraction.fileName);
    fileObj.find("#file-name").text(currentInteraction.fileName);
    fileObj.find("#file-radio").val(currentInteraction.fileName);

    // Update req words object
    $("#req-words").val(currentInteraction.reqWords);

    // Load word table row object
    $.get("../components/requiredWord.html").done(function(wordResponse) {
        const wordObj = $(wordResponse);

        // Update words table object
        const wordsTable = $("#words-table");
        wordsTable.empty();
        currentInteraction.words.forEach(word => {
            addRequiredWord(wordObj, wordsTable, word);
        });
    });
}

function loadInteractionDialogues() {
    for (let i = 0; i < currentInteraction.dialogues.length; i++) {
        instantiateInteractionDialogue(currentInteraction.dialogues[i]);
    }
}

function addRequiredWord(wordObj, wordTable, word) {
    const currentWord = wordObj.clone();
    currentWord.find("#word").text(word);
    wordTable.append(currentWord);
}

function deleteRequiredWord(wordObj) {
    const word = $(wordObj);

    // Retrieve word from object and delete in interaction
    const value = word.parent().find("#word").text();
    currentInteraction.words.splice(currentInteraction.words.indexOf(value), 1);

    // Delete object
    word.parent().parent().remove();

    saveInteractions();
}

function instantiateInteractionDialogue(data) {
    // Handle data
    let dialogueData;
    if (data === undefined) {
        dialogueData = structuredClone(dialogueTemplate);
        currentInteraction.dialogues.push(dialogueData);
        saveInteractions();
    } else {
        dialogueData = data;
    }

    // Create new dialogue object
    $.get("../components/dialogue.html", function(dialogueResponse) {
        const dialogueObj = $(dialogueResponse);

        // Prepend chance to dialogue for interactions
        $.get("../components/dialogueSettings.html").done(function(chanceResponse) {
            const chanceObj = $(chanceResponse);

            // Setup dialogue delete button
            chanceObj.find("#delete-dialogue").on("click", deleteInteractionDialogue);

            // Set value of chance spinbox
            const spinbox = chanceObj.find("#dialogue-chance");
            spinbox.val(dialogueData.chance);

            // Set spinbox events
            spinbox.on("keydown", function(event) {
                event.preventDefault();
            }).on("click", function() {
                dialogueData.chance = $(this).val();
                saveInteractions();
            });

            $(dialogueObj).find("#dialogue-holder").prepend(chanceObj);
        })

        // Setup dialogue new line button
        dialogueObj.find("#add-new-line").on("click", instantiateInteractionLine);

        // Add to dialogue list
        dialogueObj.insertBefore($("#add-new-dialogue"));

        // Load lines into dialogue
        $.get("../components/line.html", function(lineResponse) {
            const lineObj = $(lineResponse);
            for (let i = 0; i < dialogueData.lines.length; i++) {
                addNewLine(lineObj.clone(), dialogueObj.find("#lines-list"), dialogueData.lines[i], saveInteractions);
            }
        });
    })
}

function deleteInteractionDialogue() {
    // Get dialogue number
    const currentDialogue = $(this).parent().parent().parent().parent();
    const dialogueIndex = $(currentDialogue.parent()).children().index(currentDialogue);
    if (dialogueIndex < 0) {
        showToast("Unable to delete interaction")
        return;
    }

    // Delete dialogue from interaction
    currentInteraction.dialogues.splice(dialogueIndex, 1);

    // Remove dialogue object
    currentDialogue.remove();

    saveInteractions();
}

function instantiateInteractionLine() {
    // Get dialogue number
    const currentDialogue = $(this).parent().parent();
    const dialogueIndex = $(currentDialogue.parent()).children().index(currentDialogue);
    if (dialogueIndex < 0) {
        showToast("Unable to add interaction")
        return;
    }

    // Create new line object
    $.get("../components/line.html", function(lineResponse) {
        let lineData = structuredClone(lineTemplate);
        currentInteraction.dialogues[dialogueIndex].lines.push(lineData);
        addNewLine($(lineResponse), currentDialogue.find("#lines-list"), lineData, saveInteractions);

        saveInteractions();
    });
}

function forceSaveInteractions() {
    // Retrieve data from settings
    currentInteraction.fileName = $("#file-name").val();
    currentInteraction.reqWords = $("#req-words").val();
    currentInteraction.words = [];
    $("#words-table").children().each(function() {
        currentInteraction.words.push($(this).find("#word").text());
    });

    // Retrieve data from dialogues
    $("#dialogues").children().forEach(function(dialogueIterator) {
        const dialogue = $(this);
        const dialogueData = currentInteraction.dialogues[dialogueIterator];
        dialogueData.chance = dialogue.find("#dialogue-chance").val();

        // Retrieve data from lines
        dialogue.find("#lines-list").children().each(function(lineIterator) {
            const line = $(this);
            const lineData = dialogueData.lines[lineIterator];

            lineData.sticker = line.find("#sticker").val();
            lineData.reaction = line.find("#reaction").val();
            lineData.actor = line.find("#actor").val();
            lineData.targetChannel = line.find("#custom-channel").val();
            lineData.typeSpeed = line.find("#type-speed").val();
            lineData.readSpeed = line.find("#read-speed").val();
            lineData.line = line.find("#line").val();
        });
    });

    saveInteractions();
}