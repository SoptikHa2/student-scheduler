﻿function checkForLSAlert() {
    if (localStorage["showLSAlert"] == "false")
        $('#localStorageAlert').remove();

    $('#localStorageAlert').on('closed.bs.alert', function () {
        localStorage["showLSAlert"] = "false";
    })
}

function loadSavedPlanes() {
    var saved = localStorage["savedPlans"];
    if (saved != undefined) {
        $('#empty-load').remove();
        var sp = $('#saved-plans')
        var infos = saved.split(';');
        var i = 0;
        var newHtml = "";
        infos.forEach(function (element) {
            i++;
            let inf = element.split('`');
            newHtml += '<div class="card card-body">Plán ' + i + ', který obsahuje ' + inf[0] + ' žáků.';
            if (inf[1] != '') {
                newHtml += '<br />Vlastní poznámka: ' + inf[1];
            }
            newHtml += '<button type="button" class="btn indigo" onclick="window.location.href=plan.html?load=' + (i - 1) + '">Načíst</button></div>';
        });
        sp.html(newHtml);
    }
}

function setButtonHrefs() {
    $('.create-new-plan-button').on('click', function () { window.location.href = 'plan.html'; });
}

function dontAllowNumberInputsOutOfRange() {
    var inps = $('input[type="number"]');
    inps.on("blur", function (e) {
        let min = parseInt(e.target.min);
        let val = parseInt(e.target.value);
        let max = parseInt(e.target.max);

        console.log(min);
        console.log(val);
        console.log(max);

        if (val < min)
            val = min;
        if (val > max)
            val = max;

        e.target.value = val;
    });
}