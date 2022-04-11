let profileOpened = false
async function openProfilePopup() {
    if (profileOpened === false) {
        document.getElementById("popupMenuProfile").style.display = "block";
        profileOpened = true
    } else {
        document.getElementById("popupMenuProfile").style.display = "none";
        profileOpened = false
    }
}

let charactersOpened = false
async function openCharactersPopup() {
    if (charactersOpened === false) {
        document.getElementById("popupMenuCharacters").style.display = "block";
        charactersOpened = true
    } else {
        document.getElementById("popupMenuCharacters").style.display = "none";
        charactersOpened = false
    }
}

async function switchCharacter(id) {
    const res = await fetch(`/dashboard/characters/switch`, {
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({
            id: id
        })
    });
    const response = await res.json();
    if (!response.error) {
        if (response.success === true) {
            return location.reload();
        } else {
            return location.reload();
        }
    } else {
        if (response.error === "invalidsession") {
            return window.location.href = "/login";
        } else {
            return location.reload();
        }
    }
}

const webSocketProtocol = window.location.protocol == "https:" ? "wss://" : "ws://";

const socket = new WebSocket(`${webSocketProtocol}${window.location.host}${window.location.pathname}`);

const table = new DataTable('#leoTable', {
    "ajax": "/dashboard/leo/ajax",
    responsive: true,
    "columns": [{
        "data": "Callsign"
    },
    {
        "data": "Name"
    },
    {
        "data": "Department"
    },
    {
        "data": "Status"
    },
    ],
    "oLanguage": {
        "sEmptyTable": "There are no officers on duty.",
    },
    "fnRowCallback": function (nRow, data) {
        $(nRow).find('td:eq(3)').addClass("preventInvert")
        if (data['Status'] === "10-8") {
            $(nRow).find('td:eq(3)').css('background-color', '#69ff69');
        } else if (data['Status'] === "10-6") {
            $(nRow).find('td:eq(3)').css('background-color', '#f0fc03');
        } else if (data['Status'] === "10-7") {
            $(nRow).find('td:eq(3)').css('background-color', '#fc6b03');
        } else if (data['Status'] === "PANIC") {
            $(nRow).addClass('preventInvert')
            $(nRow).css('background-color', '#ff0000');
        } else if (data['Status'] === "10-11") {
            $(nRow).find('td:eq(3)').css('background-color', '#0000cc');
        } else if (data['Status'] === "10-23") {
            $(nRow).find('td:eq(3)').css('background-color', '#cc00ff');
        }
    },
}).columns.adjust().responsive.recalc();

setInterval(function () {

}, 10000)

function reloadAjax() {
    table.ajax.reload(null, false);
    setTimeout(reloadAjax, 10000);
}
reloadAjax();

socket.onmessage = function (event) {
    if (JSON.parse(event.data.toString("utf8")).type === "PANIC") {
        const data = JSON.parse(event.data.toString("utf8"))
        Swal.fire(
            `${data.officer} just pressed their panic!`,
            `Location: ${data.location}`,
            'warning'
        )
        const music = new Audio('/static/sounds/panic-button.mp3');
        music.play();
        setTimeout(function () {
            music.play();
            setTimeout(function () {
                music.play();
                setTimeout(function () {
                    music.play();
                    setTimeout(function () {
                        music.play();
                    }, 3000);
                }, 3000);
            }, 3000);
        }, 3000);
    } else if (JSON.parse(event.data.toString("utf8")).action === "UPDATE") {
        table.ajax.reload(null, false);
    } else {
        location.reload()
    }
}

async function goOffduty(id) {
    document.getElementById("1041").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("1041").disabled = false;
    document.getElementById("1042").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("1042").disabled = true;
    document.getElementById("107").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("107").disabled = true;
    document.getElementById("106").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("106").disabled = true;
    document.getElementById("1023").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("1023").disabled = true;
    document.getElementById("1011").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("1011").disabled = true;
    document.getElementById("PANIC").className =
        "h-12 px-6 m-2 text-lg text-red-100 transition-colors duration-150 bg-red-300 rounded-lg";
    document.getElementById("PANIC").disabled = true;
    const res = await fetch(`/dashboard/leo/setStatus/10-42`, {
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({
            "id": id
        })
    });
    const response = await res.json();
    if (response.success === true) {
        socket.send("UPDATE")
    } else {
        location.reload()
    }
}

async function go108(id) {
    document.getElementById("1041").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("1041").disabled = true;
    document.getElementById("1042").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("1042").disabled = false;
    document.getElementById("108").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("108").disabled = true;
    document.getElementById("107").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("107").disabled = false;
    document.getElementById("106").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("106").disabled = false;
    document.getElementById("1023").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("1023").disabled = false;
    document.getElementById("1011").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("1011").disabled = false;
    document.getElementById("PANIC").className =
        "h-12 px-6 m-2 text-lg text-red-100 transition-colors duration-150 bg-red-700 rounded-lg focus:shadow-outline hover:bg-red-800";
    document.getElementById("PANIC").disabled = false;
    const res = await fetch(`/dashboard/leo/setStatus/10-8`, {
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({
            "id": id
        })
    });
    const response = await res.json();
    if (response.success === true) {
        socket.send("UPDATE")
    } else {
        location.reload()
    }
}

async function go107(id) {
    document.getElementById("1041").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("1041").disabled = true;
    document.getElementById("1042").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("1042").disabled = false;
    document.getElementById("108").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("108").disabled = false;
    document.getElementById("107").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("107").disabled = true;
    document.getElementById("106").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("106").disabled = false;
    document.getElementById("1023").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("1023").disabled = false;
    document.getElementById("1011").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("1011").disabled = false;
    document.getElementById("PANIC").className =
        "h-12 px-6 m-2 text-lg text-red-100 transition-colors duration-150 bg-red-700 rounded-lg focus:shadow-outline hover:bg-red-800";
    document.getElementById("PANIC").disabled = false;
    const res = await fetch(`/dashboard/leo/setStatus/10-7`, {
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({
            "id": id
        })
    });
    const response = await res.json();
    if (response.success === true) {
        socket.send("UPDATE")
    } else {
        location.reload()
    }
}

async function go106(id) {
    document.getElementById("1041").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("1041").disabled = true;
    document.getElementById("1042").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("1042").disabled = false;
    document.getElementById("108").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("108").disabled = false;
    document.getElementById("107").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("107").disabled = false;
    document.getElementById("106").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("106").disabled = true;
    document.getElementById("1023").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("1023").disabled = false;
    document.getElementById("1011").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("1011").disabled = false;
    document.getElementById("PANIC").className =
        "h-12 px-6 m-2 text-lg text-red-100 transition-colors duration-150 bg-red-700 rounded-lg focus:shadow-outline hover:bg-red-800";
    document.getElementById("PANIC").disabled = false;
    const res = await fetch(`/dashboard/leo/setStatus/10-6`, {
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({
            "id": id
        })
    });
    const response = await res.json();
    if (response.success === true) {
        socket.send("UPDATE")
    } else {
        location.reload()
    }
}

async function go1023(id) {
    document.getElementById("1041").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("1041").disabled = true;
    document.getElementById("1042").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("1042").disabled = false;
    document.getElementById("108").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("108").disabled = false;
    document.getElementById("107").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("107").disabled = false;
    document.getElementById("106").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("106").disabled = false;
    document.getElementById("1023").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("1023").disabled = true;
    document.getElementById("1011").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("1011").disabled = false;
    document.getElementById("PANIC").className =
        "h-12 px-6 m-2 text-lg text-red-100 transition-colors duration-150 bg-red-700 rounded-lg focus:shadow-outline hover:bg-red-800";
    document.getElementById("PANIC").disabled = false;
    const res = await fetch(`/dashboard/leo/setStatus/10-23`, {
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({
            "id": id
        })
    });
    const response = await res.json();
    if (response.success === true) {
        socket.send("UPDATE")
    } else {
        location.reload()
    }
}

async function go1011(id) {
    document.getElementById("1041").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("1041").disabled = true;
    document.getElementById("1042").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("1042").disabled = false;
    document.getElementById("108").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("108").disabled = false;
    document.getElementById("107").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("107").disabled = false;
    document.getElementById("106").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("106").disabled = false;
    document.getElementById("1023").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
    document.getElementById("1023").disabled = false;
    document.getElementById("1011").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("1011").disabled = true;
    document.getElementById("PANIC").className =
        "h-12 px-6 m-2 text-lg text-red-100 transition-colors duration-150 bg-red-700 rounded-lg focus:shadow-outline hover:bg-red-800";
    document.getElementById("PANIC").disabled = false;
    const res = await fetch(`/dashboard/leo/setStatus/10-11`, {
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({
            "id": id
        })
    });
    const response = await res.json();
    if (response.success === true) {
        socket.send("UPDATE")
    } else {
        location.reload()
    }
}

async function panic(id) {
    const {
        value: location
    } = await Swal.fire({
        title: 'Enter your location',
        input: 'text',
        inputLabel: 'Your location',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return 'You need to put a location!'
            } else {
                socket.send(JSON.stringify({
                    "type": "PANIC",
                    "id": id,
                    "location": value
                }))
                document.getElementById("PANIC").className =
                    "h-12 px-6 m-2 text-lg text-red-100 transition-colors duration-150 bg-red-300 rounded-lg";
                document.getElementById("PANIC").disabled = true;
                document.getElementById("108").className =
                    "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
                document.getElementById("108").disabled = false;
                document.getElementById("107").className =
                    "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
                document.getElementById("107").disabled = false;
                document.getElementById("106").className =
                    "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
                document.getElementById("106").disabled = false;
                document.getElementById("1023").className =
                    "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
                document.getElementById("1023").disabled = false;
                document.getElementById("1011").className =
                    "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800";
                document.getElementById("1011").disabled = false;
                socket.send("UPDATE")
            }
        }
    })
}

async function personSearch() {
    return window.location.href = "/dashboard/leo/search/person";
}

async function vehicleSearch() {
    return window.location.href = "/dashboard/leo/search/vehicle";
}

socket.addEventListener('error', function (event) {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong with the websocket server! Please contact an administrator.'
    })
});

socket.addEventListener('close', (event) => {
    document.getElementById("PANIC").className =
        "h-12 px-6 m-2 text-lg text-red-100 transition-colors duration-150 bg-red-300 rounded-lg";
    document.getElementById("PANIC").disabled = true;
    document.getElementById("1042").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("1042").disabled = true;
    document.getElementById("1041").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("1041").disabled = true;
    document.getElementById("108").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("108").disabled = true;
    document.getElementById("107").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("107").disabled = true;
    document.getElementById("106").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("106").disabled = true;
    document.getElementById("1023").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("1023").disabled = true;
    document.getElementById("1011").className =
        "h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-300 rounded-lg";
    document.getElementById("1011").disabled = true;
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong with the websocket server! Please contact an administrator.'
    })
});