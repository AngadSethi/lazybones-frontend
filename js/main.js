$(window).on("blur focus", function(e) {
    var prevType = $(this).data("prevType");

    if (prevType != e.type) {   //  reduce double fire issues
        switch (e.type) {
            case "blur":
                $('div').text("ALERT TEACHER!!! Student made unexpected attempt."); // modify text to display status
                break;
            case "focus":
                $('div').text("Focused! Student is paying attention."); // modify text to display status
                break;
        }
    }

    $(this).data("prevType", e.type);
})

