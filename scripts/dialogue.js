const lineTemplate = {
    actor: "",
    targetChannel: "",
    sticker: "",
    reaction: "",
    typeSpeed: 1.0,
    readSpeed: 1.0,
    line: ""
};

const dialogueTemplate = {
    chance: 100,
    lines: []
}

function newLine(onclickDelete) {
    $.get("../components/line.html", function(lineResponse) {
        // Get line object
        let lineObj = $(lineResponse);
        lineObj = setupLineObj(lineObj, onclickDelete);
        $("#lines-list").append(lineObj)
    });
}

function loadDialoguePane(onclickFunction, lines, onclickDelete) {
    // Remove lines if dialogue is already loaded
    let lineList = $("#lines-list");
    if (lineList.length) {
        lineList.empty();

        for (let i = 0; i < lines.length; i++) {
            loadLine(lines[i], lineList, onclickDelete);
        }
        return;
    }

    $.get("../components/dialogue.html", function (dialogueResponse) {
        // Get dialogue object
        let dialogueObj = $(dialogueResponse);

        // Update new line button to target function
        dialogueObj.find("#add-new-line").attr("onclick", onclickFunction);

        // Append dialogue to location
        $("#dialogue").append(dialogueObj);



        // Update dialogue with lines
        for (let i = 0; i < lines.length; i++) {
            loadLine(lines[i], lineList, onclickDelete)
        }
    });
}

function loadLine(line, lineList, onclickDelete) {
    $.get("../components/line.html").done(function(lineResponse) {
        // Get line object
        let lineObj = $(lineResponse);

        for (let i = 0; i < lineList.length; i++) {
            let currentLine = lineObj.clone();

            // Setup input
            currentLine = setupLineObj(lineObj, onclickDelete);

            // Handle data
            currentLine.find("#actor").val(line.actor);
            currentLine.find("#custom-channel").val(line.targetChannel);
            currentLine.find("#sticker").val(line.sticker);
            currentLine.find("#reaction").val(line.reaction);
            currentLine.find("#type-speed").val(line.typeSpeed);
            currentLine.find("#read-speed").val(line.readSpeed);
            currentLine.find("#line").val(line.line);

            lineList.append(currentLine);
        }
    })
}

function setupLineObj(lineObj, onclickDelete) {
    // Setup input
    lineObj.find("#type-speed").on("keydown", function(event) {
        event.preventDefault();
    });

    lineObj.find("#read-speed").on("keydown", function(event) {
        event.preventDefault();
    });

    lineObj.find("#custom-channel").on("keypress", function(event) {
        if (event.which < 48 || event.which > 58) {
            event.preventDefault();
        }
    });

    lineObj.find("#custom-channel").on("paste", function(event) {
        if (event.originalEvent.clipboardData.getData("Text").match(/[^\d]/)) {
            event.preventDefault();
        }
    });

    lineObj.find("#delete").attr("onclick", onclickDelete);

    return lineObj;
}

function addNewLine(lineObj, lineList, data, saveFunction) {
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