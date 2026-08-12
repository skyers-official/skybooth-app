console.log("Sky Booth berhasil terhubung!");


// =========================
// DATA LOCAL STORAGE
// =========================

function getEvents() {

    return JSON.parse(
        localStorage.getItem("skyboothEvents")
    ) || [];

}


function saveEvents(events) {

    localStorage.setItem(
        "skyboothEvents",
        JSON.stringify(events)
    );

}


function getHistory() {

    return JSON.parse(
        localStorage.getItem("skyboothHistory")
    ) || [];

}


function saveHistory(history) {

    localStorage.setItem(
        "skyboothHistory",
        JSON.stringify(history)
    );

}


function getInventory() {

    return JSON.parse(
        localStorage.getItem("skyboothInventory")
    ) || [];

}


function saveInventory(items) {

    localStorage.setItem(
        "skyboothInventory",
        JSON.stringify(items)
    );

}


// =========================
// FORMAT RUPIAH
// =========================

function formatRupiah(value) {

    return "Rp" +
        (Number(value) || 0).toLocaleString("id-ID");

}


// =========================
// NAVIGASI HALAMAN
// =========================

function showPage(page) {

    const pages = [
        "dashboard",
        "event",
        "schedule",
        "inventory",
        "finance"
    ];


    pages.forEach(function(name) {

        const pageElement =
            document.getElementById(
                name + "-page"
            );

        if (pageElement) {

            pageElement.style.display =
                "none";

        }

    });


    const selectedPage =
        document.getElementById(
            page + "-page"
        );


    if (selectedPage) {

        selectedPage.style.display =
            "block";

    }


    const buttons =
        document.querySelectorAll(
            ".menu button"
        );


    buttons.forEach(function(button) {

        button.classList.remove("active");

    });


    const clickedButton =
        Array.from(buttons).find(function(button) {

            return button.getAttribute("onclick") ===
                "showPage('" + page + "')";

        });


    if (clickedButton) {

        clickedButton.classList.add("active");

    }


    if (page === "dashboard") {

        updateDashboard();

    }


    if (page === "event") {

        loadEvents();

    }


    if (page === "schedule") {

        loadSchedule();

    }


    if (page === "inventory") {

        loadInventory();

    }


    if (page === "finance") {

        loadFinance();

    }

}


// =========================
// DASHBOARD
// =========================

function updateDashboard() {

    const events =
        getEvents();

    const history =
        getHistory();


    const totalEventElement =
        document.getElementById(
            "total-event"
        );

    const totalFinishedElement =
        document.getElementById(
            "total-finished"
        );

    const totalFullIncomeElement =
        document.getElementById(
            "total-full-income"
        );

    const totalPersonIncomeElement =
        document.getElementById(
            "total-person-income"
        );


    if (
        !totalEventElement ||
        !totalFinishedElement ||
        !totalFullIncomeElement ||
        !totalPersonIncomeElement
    ) {
        return;
    }


    // Semua event aktif
    totalEventElement.textContent =
        events.length;


    // Event selesai dari history
    const finishedEvents =
        history.filter(function(event) {

            return event.status === "selesai";

        });


    totalFinishedElement.textContent =
        finishedEvents.length;


    let totalFullIncome = 0;
    let totalPersonIncome = 0;


    finishedEvents.forEach(function(event) {

        const income =
            Number(event.pendapatanFinal) || 0;


        if (event.incomeType === "full") {

            totalFullIncome += income;

        }


        if (
            event.incomeType === "per-person" ||
            event.incomeType === "perPerson" ||
            event.incomeType === "perOrang"
        ) {

            totalPersonIncome += income;

        }

    });


    totalFullIncomeElement.textContent =
        formatRupiah(totalFullIncome);


    totalPersonIncomeElement.textContent =
        formatRupiah(totalPersonIncome);

}


// =========================
// FORM EVENT
// =========================

function showForm() {

    const form =
        document.getElementById(
            "event-form"
        );


    if (form) {

        form.style.display =
            "block";

    }


    toggleIncomeType();

}


function hideForm() {

    const form =
        document.getElementById(
            "event-form"
        );


    if (form) {

        form.style.display =
            "none";

    }


    clearEventForm();

}


function clearEventForm() {

    const ids = [
        "event-name",
        "event-client",
        "event-date",
        "event-location",
        "event-price",
        "price-per-person"
    ];


    ids.forEach(function(id) {

        const element =
            document.getElementById(id);

        if (element) {

            element.value = "";

        }

    });


    const incomeType =
        document.getElementById(
            "income-type"
        );


    if (incomeType) {

        incomeType.value =
            "full";

    }


    toggleIncomeType();

}


// =========================
// JENIS PENDAPATAN
// =========================

function toggleIncomeType() {

    const incomeType =
        document.getElementById(
            "income-type"
        );

    const fullPriceBox =
        document.getElementById(
            "full-price-box"
        );

    const perPersonPriceBox =
        document.getElementById(
            "per-person-price-box"
        );


    if (
        !incomeType ||
        !fullPriceBox ||
        !perPersonPriceBox
    ) {
        return;
    }


    if (incomeType.value === "full") {

        fullPriceBox.style.display =
            "block";

        perPersonPriceBox.style.display =
            "none";

    } else {

        fullPriceBox.style.display =
            "none";

        perPersonPriceBox.style.display =
            "block";

    }

}


// =========================
// SIMPAN EVENT
// =========================

function saveEvent() {

    const namaEvent =
        document.getElementById(
            "event-name"
        ).value.trim();

    const klien =
        document.getElementById(
            "event-client"
        ).value.trim();

    const tanggal =
        document.getElementById(
            "event-date"
        ).value;

    const lokasi =
        document.getElementById(
            "event-location"
        ).value.trim();

    const incomeType =
        document.getElementById(
            "income-type"
        ).value;

    const hargaFull =
        Number(
            document.getElementById(
                "event-price"
            ).value
        ) || 0;

    const hargaPerPerson =
        Number(
            document.getElementById(
                "price-per-person"
            ).value
        ) || 0;


    if (
        !namaEvent ||
        !klien ||
        !tanggal ||
        !lokasi
    ) {

        alert(
            "Mohon isi data event terlebih dahulu."
        );

        return;

    }


    if (
        incomeType === "full" &&
        hargaFull <= 0
    ) {

        alert(
            "Masukkan harga event."
        );

        return;

    }


    if (
        incomeType === "per-person" &&
        hargaPerPerson <= 0
    ) {

        alert(
            "Masukkan harga per orang."
        );

        return;

    }


    const events =
        getEvents();


    const newEvent = {

        id: Date.now(),

        namaEvent: namaEvent,

        klien: klien,

        tanggal: tanggal,

        lokasi: lokasi,

        incomeType: incomeType,

        harga:
            incomeType === "full"
                ? hargaFull
                : hargaPerPerson,

        jumlahOrang: 0,

        pendapatanFinal:
            incomeType === "full"
                ? hargaFull
                : 0,

        status: "aktif"

    };


    events.push(newEvent);

    saveEvents(events);


    hideForm();

    loadEvents();

    updateDashboard();

    loadSchedule();

}


// =========================
// LOAD EVENT
// =========================

function loadEvents() {

    const eventList =
        document.getElementById(
            "event-list"
        );


    if (!eventList) {
        return;
    }


    const events =
        getEvents();


    eventList.innerHTML = "";


    if (events.length === 0) {

        eventList.innerHTML = `
            <div class="event">
                <div class="event-name">
                    Belum ada event
                </div>

                <div class="event-info">
                    Tambahkan event pertama kamu.
                </div>
            </div>
        `;

        return;

    }


    events.sort(function(a, b) {

        return new Date(a.tanggal) -
            new Date(b.tanggal);

    });


    events.forEach(function(event) {

        const card =
            document.createElement("div");

        card.className =
            "event";


        let incomeInfo = "";


        if (event.incomeType === "full") {

            incomeInfo =
                "💼 Full Event • " +
                formatRupiah(event.harga);

        } else {

            incomeInfo =
                "👥 Per Orang • " +
                formatRupiah(event.harga) +
                " / orang";

        }


        card.innerHTML = `

            <div class="event-name">
                📸 ${event.namaEvent}
            </div>

            <div class="event-info">
                👤 Klien: ${event.klien}
            </div>

            <div class="event-info">
                📅 ${event.tanggal}
            </div>

            <div class="event-info">
                📍 ${event.lokasi}
            </div>

            <div class="event-info">
                ${incomeInfo}
            </div>

            <div class="event-actions">

                <button
                    class="finish-event-button"
                    onclick="finishEvent(${event.id})"
                >
                    ✓ Selesai
                </button>

                <button
                    class="cancel-event-button"
                    onclick="cancelEvent(${event.id})"
                >
                    ✕ Batal
                </button>

                <button
                    class="delete-event-button"
                    onclick="deleteEvent(${event.id})"
                    title="Hapus event"
                >
                    🗑️
                </button>

            </div>

        `;


        eventList.appendChild(card);

    });

}


// =========================
// SELESAIKAN EVENT
// =========================

function finishEvent(id) {

    const events =
        getEvents();

    const eventIndex =
        events.findIndex(function(event) {

            return event.id === id;

        });


    if (eventIndex === -1) {
        return;
    }


    const event =
        events[eventIndex];


    let jumlahOrang =
        Number(event.jumlahOrang) || 0;

    let pendapatanFinal =
        Number(event.pendapatanFinal) || 0;


    // Jika per orang, tanya jumlah orang
    if (
        event.incomeType === "per-person" ||
        event.incomeType === "perPerson" ||
        event.incomeType === "perOrang"
    ) {

        const inputJumlah =
            prompt(
                "Berapa jumlah orang yang foto?"
            );


        if (
            inputJumlah === null
        ) {
            return;
        }


        jumlahOrang =
            Number(inputJumlah) || 0;


        if (jumlahOrang <= 0) {

            alert(
                "Jumlah orang harus lebih dari 0."
            );

            return;

        }


        pendapatanFinal =
            jumlahOrang *
            (Number(event.harga) || 0);

    }


    // Jika full event
    if (event.incomeType === "full") {

        pendapatanFinal =
            Number(event.harga) || 0;

    }


    const history =
        getHistory();


    const finishedEvent = {

        ...event,

        jumlahOrang: jumlahOrang,

        pendapatanFinal: pendapatanFinal,

        status: "selesai",

        tanggalSelesai:
            new Date().toISOString()

    };


    history.push(finishedEvent);

    saveHistory(history);


    // Hapus dari event aktif
    events.splice(
        eventIndex,
        1
    );

    saveEvents(events);


    loadEvents();

    updateDashboard();

    loadSchedule();

    loadFinance();

}


// =========================
// BATALKAN EVENT
// =========================

function cancelEvent(id) {

    const events =
        getEvents();

    const eventIndex =
        events.findIndex(function(event) {

            return event.id === id;

        });


    if (eventIndex === -1) {
        return;
    }


    const confirmCancel =
        confirm(
            "Yakin ingin membatalkan event ini?"
        );


    if (!confirmCancel) {
        return;
    }


    const event =
        events[eventIndex];


    const history =
        getHistory();


    const cancelledEvent = {

        ...event,

        status: "batal",

        pendapatanFinal: 0,

        tanggalSelesai:
            new Date().toISOString()

    };


    history.push(cancelledEvent);

    saveHistory(history);


    // Hapus dari event aktif
    events.splice(
        eventIndex,
        1
    );

    saveEvents(events);


    loadEvents();

    updateDashboard();

    loadSchedule();

    loadFinance();

}


// =========================
// HAPUS EVENT AKTIF
// =========================

function deleteEvent(id) {

    const events =
        getEvents();


    const confirmDelete =
        confirm(
            "Hapus event ini?"
        );


    if (!confirmDelete) {
        return;
    }


    const filteredEvents =
        events.filter(function(event) {

            return event.id !== id;

        });


    saveEvents(filteredEvents);


    loadEvents();

    updateDashboard();

    loadSchedule();

}


// =========================
// JADWAL
// =========================

function loadSchedule() {

    const scheduleList =
        document.getElementById(
            "schedule-list"
        );

    const scheduleMonth =
        document.getElementById(
            "schedule-month"
        );


    if (
        !scheduleList ||
        !scheduleMonth
    ) {
        return;
    }


    const events =
        getEvents();

    const selectedMonth =
        scheduleMonth.value;


    let filteredEvents =
        events;


    if (selectedMonth !== "") {

        filteredEvents =
            events.filter(function(event) {

                return event.tanggal &&
                    event.tanggal.startsWith(
                        selectedMonth
                    );

            });

    }


    scheduleList.innerHTML = "";


    if (filteredEvents.length === 0) {

        scheduleList.innerHTML = `
            <div class="event">
                <div class="event-name">
                    Belum ada jadwal
                </div>

                <div class="event-info">
                    ${
                        selectedMonth
                            ? "Tidak ada event pada bulan ini."
                            : "Pilih bulan untuk melihat jadwal event."
                    }
                </div>
            </div>
        `;

        return;

    }


    filteredEvents.sort(function(a, b) {

        return new Date(a.tanggal) -
            new Date(b.tanggal);

    });


    filteredEvents.forEach(function(event) {

        const card =
            document.createElement("div");

        card.className =
            "event";


        card.innerHTML = `

            <div class="event-name">
                📸 ${event.namaEvent}
            </div>

            <div class="event-info">
                📅 ${event.tanggal}
            </div>

            <div class="event-info">
                👤 ${event.klien}
            </div>

            <div class="event-info">
                📍 ${event.lokasi}
            </div>

        `;


        scheduleList.appendChild(card);

    });

}


// =========================
// FORM INVENTARIS
// =========================

function showInventoryForm() {

    const form =
        document.getElementById(
            "inventory-form"
        );


    if (form) {

        form.style.display =
            "block";

    }

}


function hideInventoryForm() {

    const form =
        document.getElementById(
            "inventory-form"
        );


    if (form) {

        form.style.display =
            "none";

    }


    clearInventoryForm();

}


function clearInventoryForm() {

    const ids = [
        "item-name",
        "item-brand",
        "item-quantity",
        "item-price"
    ];


    ids.forEach(function(id) {

        const element =
            document.getElementById(id);

        if (element) {

            element.value = "";

        }

    });


    const category =
        document.getElementById(
            "item-category"
        );


    if (category) {

        category.value =
            "cetak";

    }

}


// =========================
// SIMPAN INVENTARIS
// =========================

function saveInventory() {

    const nama =
        document.getElementById(
            "item-name"
        ).value.trim();

    const merk =
        document.getElementById(
            "item-brand"
        ).value.trim();

    const kategori =
        document.getElementById(
            "item-category"
        ).value;

    const jumlah =
        Number(
            document.getElementById(
                "item-quantity"
            ).value
        ) || 0;

    const harga =
        Number(
            document.getElementById(
                "item-price"
            ).value
        ) || 0;


    if (!nama) {

        alert(
            "Masukkan nama barang."
        );

        return;

    }


    if (jumlah < 0) {

        alert(
            "Jumlah barang tidak valid."
        );

        return;

    }


    const inventory =
        getInventory();


    inventory.push({

        id: Date.now(),

        nama: nama,

        merk: merk,

        kategori: kategori,

        jumlah: jumlah,

        harga: harga

    });


    saveInventory(inventory);


    hideInventoryForm();

    loadInventory();

}


// =========================
// LOAD INVENTARIS
// =========================

function loadInventory() {

    const inventoryList =
        document.getElementById(
            "inventory-list"
        );


    if (!inventoryList) {
        return;
    }


    const inventory =
        getInventory();


    inventoryList.innerHTML = "";


    if (inventory.length === 0) {

        inventoryList.innerHTML = `
            <div class="event">
                <div class="event-name">
                    Belum ada barang
                </div>

                <div class="event-info">
                    Tambahkan barang pertama kamu.
                </div>
            </div>
        `;

        return;

    }


    inventory.forEach(function(item) {

        const card =
            document.createElement("div");

        card.className =
            "event";


        let kategoriText = "";


        if (item.kategori === "cetak") {

            kategoriText = "🖨️ Cetak";

        }

        else if (item.kategori === "kamera") {

            kategoriText = "📷 Kamera";

        }

        else {

            kategoriText = "🎭 Properti";

        }


        card.innerHTML = `

            <div class="event-name">
                ${item.nama}
            </div>

            <div class="event-info">
                🏷️ Merk: ${item.merk || "-"}
            </div>

            <div class="event-info">
                📂 Kategori: ${kategoriText}
            </div>

            <div class="event-info">
                📦 Jumlah: ${item.jumlah}
            </div>

            <div class="event-info">
                💰 Harga Satuan: ${formatRupiah(item.harga)}
            </div>

            <div class="event-actions">

                <button
                    class="delete-event-button"
                    onclick="deleteInventory(${item.id})"
                    title="Hapus barang"
                >
                    🗑️
                </button>

            </div>

        `;


        inventoryList.appendChild(card);

    });

}


// =========================
// HAPUS INVENTARIS
// =========================

function deleteInventory(id) {

    const confirmDelete =
        confirm(
            "Hapus barang ini dari inventaris?"
        );


    if (!confirmDelete) {
        return;
    }


    const inventory =
        getInventory();


    const filteredInventory =
        inventory.filter(function(item) {

            return item.id !== id;

        });


    saveInventory(filteredInventory);

    loadInventory();

}


// =========================
// LOAD KEUANGAN
// =========================

function loadFinance() {

    const financeList =
        document.getElementById(
            "finance-list"
        );

    const financeMonth =
        document.getElementById(
            "finance-month"
        );

    const totalEventsElement =
        document.getElementById(
            "finance-total-events"
        );

    const totalIncomeElement =
        document.getElementById(
            "finance-total-income"
        );


    if (
        !financeList ||
        !financeMonth ||
        !totalEventsElement ||
        !totalIncomeElement
    ) {
        return;
    }


    const history =
        getHistory();


    const selectedMonth =
        financeMonth.value;


    // Hanya event yang selesai
    let filteredHistory =
        history.filter(function(event) {

            return event.status === "selesai";

        });


    // Filter berdasarkan bulan event
    if (selectedMonth !== "") {

        filteredHistory =
            filteredHistory.filter(function(event) {

                return event.tanggal &&
                    event.tanggal.startsWith(
                        selectedMonth
                    );

            });

    }


    const totalEvents =
        filteredHistory.length;


    let totalIncome = 0;


    filteredHistory.forEach(function(event) {

        totalIncome +=
            Number(event.pendapatanFinal) || 0;

    });


    totalEventsElement.textContent =
        totalEvents;

    totalIncomeElement.textContent =
        formatRupiah(totalIncome);


    financeList.innerHTML = "";


    if (filteredHistory.length === 0) {

        financeList.innerHTML = `

            <div class="finance-card">

                <div class="finance-name">
                    Belum ada pendapatan
                </div>

                <div class="finance-info">
                    Event selesai akan muncul di sini.
                </div>

            </div>

        `;

        return;

    }


    filteredHistory.sort(function(a, b) {

        return new Date(b.tanggal) -
            new Date(a.tanggal);

    });


    filteredHistory.forEach(function(event) {

        const card =
            document.createElement("div");

        card.className =
            "finance-card";


        let tipeText = "";


        if (event.incomeType === "full") {

            tipeText =
                "💼 Full Event";

        }


        else if (
            event.incomeType === "per-person" ||
            event.incomeType === "perPerson" ||
            event.incomeType === "perOrang"
        ) {

            tipeText =
                "👥 Per Orang • " +
                (Number(event.jumlahOrang) || 0) +
                " orang";

        }


        card.innerHTML = `

            <div class="finance-name">
                📸 ${event.namaEvent}
            </div>

            <div class="finance-info">
                ${tipeText}
            </div>

            <div class="finance-info">
                👤 Klien: ${event.klien || "-"}
            </div>

            <div class="finance-info">
                📅 ${event.tanggal}
            </div>

            <div class="finance-income">
                💰 Pendapatan: ${formatRupiah(event.pendapatanFinal)}
            </div>

        `;


        financeList.appendChild(card);

    });

}


// =========================
// LOAD AWAL
// =========================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateDashboard();

        loadEvents();

        loadSchedule();

        loadInventory();

        loadFinance();

    }
);