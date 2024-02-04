let toasting = false;

function showToast(text) {
    if (toasting) return;

    const toast = $("#toast");
    toast[0].textContent = text;
    toast.addClass("show-toast")
    toasting = true;

    setTimeout(function() {
        toast.removeClass("show-toast");
        toasting = false;
    }, 3000)

}