const lineTemplate = {
    actor: "",
    targetChannel: "",
    sticker: "",
    reaction: "",
    typeSpeed: 1.0,
    readSpeed: 1.0,
    line: "",
    isCommand: false
};

const dialogueTemplate = {
    chance: 100,
    lines: []
}

function addNewLine(lineObj, lineList, data, saveFunction, deleteFunction, disableCommand) {
    // Setup inputs
    lineObj.find("#type-speed").on("keydown", function(event) {
        event.preventDefault();
    }).on("click", function() {
        data.typeSpeed = $(this).val();
        saveFunction();
    });

    lineObj.find("#read-speed").on("keydown", function(event) {
        event.preventDefault();
    }).on("click", function() {
        data.readSpeed = $(this).val();
        saveFunction();
    });

    if (disableCommand) {
        lineObj.find("#command-selector").remove();
    } else {
        lineObj.find("#command").on("change", function() {
            data.isCommand = this.checked;
            saveFunction();
        });
    }

    lineObj.find("#custom-channel").on("keypress", function(event) {
        if (event.which === 13) {
            data.targetChannel = $(this).val();
            $(this).trigger("blur");
            saveFunction();
        }

        if (event.which < 48 || event.which > 58) {
            event.preventDefault();
        }
    }).on("paste", function(event) {
        if (event.originalEvent.clipboardData.getData("Text").match(/[^\d]/)) {
            event.preventDefault();
        }
    }).on("focusout", function() {
        data.targetChannel = $(this).val();
        saveFunction();
    })

    lineObj.find("#sticker").on("focusout", function() {
        data.sticker = $(this).val();
        saveFunction();
    }).on("change", function() {
        data.sticker = $(this).val();
        saveFunction();
    });

    lineObj.find("#reaction").on("focusout", function() {
        data.reaction = $(this).val();
        saveFunction();
    }).on("keypress", function(event) {
        if (event.which === 13) {
            data.reaction = $(this).val();
            saveFunction();
            $(this).trigger("blur");
        }
    });

    lineObj.find("#actor").on("focusout", function() {
        data.actor = $(this).val();
        saveFunction();
    }).on("change", function() {
        data.actor = $(this).val();
        saveFunction();
    });

    lineObj.find("#line").on("focusout", function() {
        data.line = $(this).val();
        saveFunction();
    }).on("keypress", function(event) {
        if (event.which === 13) {
            data.targetChannel = $(this).val();
            saveFunction();
            $(this).trigger("blur");
        }
    });

    lineObj.find("#delete").on("click", function() {
        const lineParent = $(this).parent().parent();

        // Check if interaction or conversation
        if ($("#dialogues").length) {
            // Handle interaction

            // Retrieve line index
            let lineIndex = lineParent.parent().children().index(lineParent);

            // Retrieve dialogue index
            const dialogueList = lineParent.parent().parent().parent().parent();
            let dialogueIndex = dialogueList.children().index(lineParent.parent().parent().parent());

            deleteFunction({dialogueIndex: dialogueIndex, lineIndex: lineIndex});
        } else {
            // Handle conversations
            deleteFunction({index: lineParent.parent().children().index(lineParent)});
        }

        lineParent.remove();
        saveFunction();
    });

    // Handle data
    if (data === undefined) {
        lineList.append(lineObj);
        return;
    }

    lineObj.find("#actor").val(data.actor);
    lineObj.find("#custom-channel").val(data.targetChannel);
    lineObj.find("#sticker").val(data.sticker);
    lineObj.find("#reaction").val(data.reaction);
    lineObj.find("#type-speed").val(data.typeSpeed);
    lineObj.find("#read-speed").val(data.readSpeed);
    lineObj.find("#line").val(data.line);

    lineList.append(lineObj);
}

function moveLineData(initial, target, array) {
    // Store element to move
    let initialElement = array[initial];

    // Remove element to move
    array.splice(initial, 1);

    // Add element to move
    array.splice(target, 0, initialElement);
}