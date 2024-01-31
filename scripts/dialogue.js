function newLine() {
    $.get("../components/line.html", function (response) {
        const lineObj = jQuery.parseHTML(response);
        $("#lines-list").append(lineObj);
    });
}

function loadDialogue() {
    $("#dialogue").load("../components/dialogue.html", function () {
        // Make dialogue sortable
        $("#lines-list").sortable({
            tolerance: 'pointer'
        })
    });
}

function loadNew(data) {

}

function loadExisting(data) {

}
