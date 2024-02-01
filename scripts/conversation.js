var currentFile = null;

function newConversation() {



    // Add new file to list
    addFile();

    // Create new object and add it to localStorage
}

function addFile() {
    $("#conversation-writer").show();

    $.get("../components/file.html", function (fileResponse) {
        $("#conversation-settings").load("../components/conversationSettings.html", function(settingResponse) {
            const fileNameInput = $("#file-name");

            const fileObj = jQuery.parseHTML(fileResponse);
            const fileList = $("#files");

            currentFile = fileObj[0];

            fileObj[0].textContent = "File " + fileList.children().length;
            fileList.append(fileObj[0])

            fileNameInput.val(fileObj[0].textContent);

            fileNameInput.on("input", function () {
                var currentVal = $(this).val();

                if (!currentVal) {
                    // Set file name to default file name
                    fileObj[0].textContent = "File " + fileList.children().index(currentFile);
                } else {
                    // Set file name to new file name
                    fileObj[0].textContent = currentVal;
                }
            })

            const data = { fileName: fileObj[0].textContent };
            loadDialogue(data);
        });
    });
}

function loadConversations() {

}

function displayConversation(conversation) {

}

$("#file-picker").load("../components/filePicker.html", function() {
    const conversations = loadConversations();

    const conversationDiv = $("#conversation-writer");
    if (conversations === undefined || conversations.constructor !== Array) {
        //conversationDiv.hide();
    } else {
        conversationDiv.show();
        for (let i = 0; i < conversations.length; i++) {
            displayConversation(conversations[i]);
        }
    }
});