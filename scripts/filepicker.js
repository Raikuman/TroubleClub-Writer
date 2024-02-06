function addFile(fileObj, onclickFunction, name) {
    const fileList = $("#files");
    const objName = $(fileObj.find("#file-name"));

    if (name) {
        objName.text(name);
    } else {
        objName.text("File-" + fileList.children().length);
    }

    let input = fileObj[0].children[1];
    input.setAttribute("onclick", onclickFunction);
    input.setAttribute("value", objName.text());

    fileList.append(fileObj);
}

function addFileNew(fileObj, onclickFunction, name) {
    // Update name of object
    $(fileObj).find("#file-name").text(name);



    // Update values
    const radio = $(fileObj).find("#file-radio");
    // TODO: Remove this!
    radio.attr("onclick", "");
    radio.on("click", onclickFunction);
    radio.val(name);



    $("#files").append(fileObj);
}