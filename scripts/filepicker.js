

function addFile(fileObj, onclickFunction, name) {
    // Update name of object
    $(fileObj).find("#file-name").text(name);

    // Update values
    const radio = $(fileObj).find("#file-radio");
    radio.on("click", onclickFunction);
    radio.val(name);



    $("#files").append(fileObj);
}