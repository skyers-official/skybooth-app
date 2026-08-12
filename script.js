console.log("Sky Booth + Supabase berhasil terhubung!");


// =========================
// SUPABASE CONFIG
// =========================

const SUPABASE_URL =
    "https://bhdeyuddovnptfhilslm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_dDeBrxwCiSii6eyAjl3N9g_jU8FZoUh";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =========================
// FORMAT RUPIAH
// =========================

function formatRupiah(value) {
    return "Rp" +
        (Number(value) || 0).toLocaleString("id-ID");
}


// =========================
// NAVIGASI
// =========================

async function showPage(page) {

    const pages = [
        "dashboard",
        "event",
        "schedule",
        "inventory",
        "finance"
    ];

    pages.forEach(function(name) {

        const pageElement =
            document.getElementById(name + "-page");

        if (pageElement) {
            pageElement.style.display = "none";
        }

    });


    const selectedPage =
        document.getElementById(page + "-page");

    if (selectedPage) {
        selectedPage.style.display = "block";
    }


    const buttons =
        document.querySelectorAll(".menu button");

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
        await updateDashboard();
    }

    if (page === "event") {
        await loadEvents();
    }

    if (page === "schedule") {
        await loadSchedule();
    }

    if (page === "inventory") {
        await loadInventory();
    }

    if (page === "finance") {
        await loadFinance();
    }
}


// =========================
// DASHBOARD
// =========================

async function updateDashboard() {

    const {
        data: events,
        error
    } = await supabaseClient
        .from("events")
        .select("*");

    if (error) {
        console.error("Dashboard error:", error);
        return;
    }

    const allEvents = events || [];

    const activeEvents =
        allEvents.filter(function(event) {
            return event.status === "aktif";
        });

    const finishedEvents =
        allEvents.filter(function(event) {
            return event.status === "selesai";
        });


    const totalEventElement =
        document.getElementById("total-event");

    const totalFinishedElement =
        document.getElementById("total-finished");

    const totalFullIncomeElement =
        document.getElementById("total-full-income");

    const totalPersonIncomeElement =
        document.getElementById("total-person-income");


    if (totalEventElement) {
        totalEventElement.textContent =
            activeEvents.length;
    }

    if (totalFinishedElement) {
        totalFinishedElement.textContent =
            finishedEvents.length;
    }


    let totalFullIncome = 0;
    let totalPersonIncome = 0;


    finishedEvents.forEach(function(event) {

        const income =
            Number(event.pendapatan_final) || 0;


        if (event.income_type === "full") {
            totalFullIncome += income;
        }


        if (event.income_type === "per-person") {
            totalPersonIncome += income;
        }

    });


    if (totalFullIncomeElement) {

        totalFullIncomeElement.textContent =
            formatRupiah(totalFullIncome);

    }


    if (totalPersonIncomeElement) {

        totalPersonIncomeElement.textContent =
            formatRupiah(totalPersonIncome);

    }
}


// =========================
// FORM EVENT
// =========================

function showForm() {

    const form =
        document.getElementById("event-form");

    if (form) {
        form.style.display = "block";
    }

    toggleIncomeType();
}


function hideForm() {

    const form =
        document.getElementById("event-form");

    if (form) {
        form.style.display = "none";
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
        document.getElementById("income-type");

    if (incomeType) {
        incomeType.value = "full";
    }

    toggleIncomeType();
}


// =========================
// JENIS PENDAPATAN
// =========================

function toggleIncomeType() {

    const incomeType =
        document.getElementById("income-type");

    const fullPriceBox =
        document.getElementById("full-price-box");

    const perPersonPriceBox =
        document.getElementById("per-person-price-box");


    if (
        !incomeType ||
        !fullPriceBox ||
        !perPersonPriceBox
    ) {
        return;
    }


    if (incomeType.value === "full") {

        fullPriceBox.style.display = "block";
        perPersonPriceBox.style.display = "none";

    } else {

        fullPriceBox.style.display = "none";
        perPersonPriceBox.style.display = "block";

    }
}


// =========================
// SIMPAN EVENT
// =========================

async function saveEvent() {

    const namaEvent =
        document.getElementById("event-name").value.trim();

    const klien =
        document.getElementById("event-client").value.trim();

    const tanggal =
        document.getElementById("event-date").value;

    const lokasi =
        document.getElementById("event-location").value.trim();

    const incomeType =
        document.getElementById("income-type").value;

    const hargaFull =
        Number(
            document.getElementById("event-price").value
        ) || 0;

    const hargaPerPerson =
        Number(
            document.getElementById("price-per-person").value
        ) || 0;


    if (
        !namaEvent ||
        !klien ||
        !tanggal ||
        !lokasi
    ) {

        alert("Mohon isi data event terlebih dahulu.");
        return;
    }


    if (
        incomeType === "full" &&
        hargaFull <= 0
    ) {

        alert("Masukkan harga event.");
        return;
    }


    if (
        incomeType === "per-person" &&
        hargaPerPerson <= 0
    ) {

        alert("Masukkan harga per orang.");
        return;
    }


    const harga =
        incomeType === "full"
            ? hargaFull
            : hargaPerPerson;


    const {
        error
    } = await supabaseClient
        .from("events")
        .insert([
            {
                id: Date.now(),
                nama_event: namaEvent,
                klien: klien,
                tanggal: tanggal,
                lokasi: lokasi,
                income_type: incomeType,
                harga: harga,
                jumlah_orang: 0,
                pendapatan_final:
                    incomeType === "full" ? harga : 0,
                status: "aktif"
            }
        ]);


    if (error) {

        console.error(error);

        alert(
            "Gagal menyimpan event: " +
            error.message
        );

        return;
    }


    hideForm();

    await loadEvents();
    await updateDashboard();
    await loadSchedule();
}


// =========================
// LOAD EVENT
// =========================

async function loadEvents() {

    const eventList =
        document.getElementById("event-list");

    if (!eventList) {
        return;
    }


    const {
        data: events,
        error
    } = await supabaseClient
        .from("events")
        .select("*")
        .eq("status", "aktif")
        .order("tanggal", {
            ascending: true
        });


    if (error) {

        console.error(error);
        return;
    }


    eventList.innerHTML = "";


    if (!events || events.length === 0) {

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


    events.forEach(function(event) {

        const card =
            document.createElement("div");

        card.className = "event";


        let incomeInfo = "";


        if (event.income_type === "full") {

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
                📸 ${event.nama_event}
            </div>

            <div class="event-info">
                👤 Klien: ${event.klien || "-"}
            </div>

            <div class="event-info">
                📅 ${event.tanggal || "-"}
            </div>

            <div class="event-info">
                📍 ${event.lokasi || "-"}
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

async function finishEvent(id) {

    const {
        data: event,
        error
    } = await supabaseClient
        .from("events")
        .select("*")
        .eq("id", id)
        .single();


    if (error || !event) {

        console.error(error);
        return;
    }


    let jumlahOrang =
        Number(event.jumlah_orang) || 0;

    let pendapatanFinal =
        Number(event.pendapatan_final) || 0;


    if (event.income_type === "per-person") {

        const inputJumlah =
            prompt("Berapa jumlah orang yang foto?");


        if (inputJumlah === null) {
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


    if (event.income_type === "full") {

        pendapatanFinal =
            Number(event.harga) || 0;
    }


    const {
        error: updateError
    } = await supabaseClient
        .from("events")
        .update({
            jumlah_orang: jumlahOrang,
            pendapatan_final: pendapatanFinal,
            status: "selesai",
            tanggal_selesai:
                new Date().toISOString()
        })
        .eq("id", id);


    if (updateError) {

        console.error(updateError);

        alert("Gagal menyelesaikan event.");
        return;
    }


    await loadEvents();
    await updateDashboard();
    await loadSchedule();
    await loadFinance();
}


// =========================
// BATALKAN EVENT
// =========================

async function cancelEvent(id) {

    const confirmCancel =
        confirm(
            "Yakin ingin membatalkan event ini?"
        );


    if (!confirmCancel) {
        return;
    }


    const {
        error
    } = await supabaseClient
        .from("events")
        .update({
            status: "batal",
            pendapatan_final: 0,
            tanggal_selesai:
                new Date().toISOString()
        })
        .eq("id", id);


    if (error) {

        console.error(error);

        alert("Gagal membatalkan event.");
        return;
    }


    await loadEvents();
    await updateDashboard();
    await loadSchedule();
    await loadFinance();
}


// =========================
// HAPUS EVENT
// =========================

async function deleteEvent(id) {

    const confirmDelete =
        confirm("Hapus event ini?");


    if (!confirmDelete) {
        return;
    }


    const {
        error
    } = await supabaseClient
        .from("events")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(error);

        alert("Gagal menghapus event.");
        return;
    }


    await loadEvents();
    await updateDashboard();
    await loadSchedule();
}


// =========================
// JADWAL
// =========================

async function loadSchedule() {

    const scheduleList =
        document.getElementById("schedule-list");

    const scheduleMonth =
        document.getElementById("schedule-month");


    if (
        !scheduleList ||
        !scheduleMonth
    ) {
        return;
    }


    const selectedMonth =
        scheduleMonth.value;


    let query =
        supabaseClient
            .from("events")
            .select("*")
            .eq("status", "aktif")
            .order("tanggal", {
                ascending: true
            });


    if (selectedMonth) {

        query =
            query
                .gte(
                    "tanggal",
                    selectedMonth + "-01"
                )
                .lt(
                    "tanggal",
                    getNextMonth(selectedMonth)
                );
    }


    const {
        data: events,
        error
    } = await query;


    if (error) {

        console.error(error);
        return;
    }


    scheduleList.innerHTML = "";


    if (!events || events.length === 0) {

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


    events.forEach(function(event) {

        const card =
            document.createElement("div");

        card.className = "event";


        card.innerHTML = `

            <div class="event-name">
                📸 ${event.nama_event}
            </div>

            <div class="event-info">
                📅 ${event.tanggal}
            </div>

            <div class="event-info">
                👤 ${event.klien || "-"}
            </div>

            <div class="event-info">
                📍 ${event.lokasi || "-"}
            </div>

        `;


        scheduleList.appendChild(card);

    });
}


function getNextMonth(month) {

    const parts =
        month.split("-");

    let year =
        Number(parts[0]);

    let monthNumber =
        Number(parts[1]);


    monthNumber++;


    if (monthNumber === 13) {
        monthNumber = 1;
        year++;
    }


    return (
        year +
        "-" +
        String(monthNumber).padStart(2, "0") +
        "-01"
    );
}


// =========================
// FORM INVENTARIS
// =========================

function showInventoryForm() {

    const form =
        document.getElementById("inventory-form");

    if (form) {
        form.style.display = "block";
    }
}


function hideInventoryForm() {

    const form =
        document.getElementById("inventory-form");

    if (form) {
        form.style.display = "none";
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
        document.getElementById("item-category");

    if (category) {
        category.value = "cetak";
    }
}


// =========================
// SIMPAN INVENTARIS
// =========================

async function saveInventory() {

    const nama =
        document.getElementById("item-name").value.trim();

    const merk =
        document.getElementById("item-brand").value.trim();

    const kategori =
        document.getElementById("item-category").value;

    const jumlah =
        Number(
            document.getElementById("item-quantity").value
        ) || 0;

    const harga =
        Number(
            document.getElementById("item-price").value
        ) || 0;


    if (!nama) {

        alert("Masukkan nama barang.");
        return;
    }


    const {
        error
    } = await supabaseClient
        .from("inventory")
        .insert([
            {
                id: Date.now(),
                nama: nama,
                merk: merk,
                kategori: kategori,
                jumlah: jumlah,
                harga: harga
            }
        ]);


    if (error) {

        console.error(error);

        alert(
            "Gagal menyimpan barang: " +
            error.message
        );

        return;
    }


    hideInventoryForm();
    await loadInventory();
}


// =========================
// LOAD INVENTARIS
// =========================

async function loadInventory() {

    const inventoryList =
        document.getElementById("inventory-list");

    if (!inventoryList) {
        return;
    }

    const {
        data: inventory,
        error
    } = await supabaseClient
        .from("inventory")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error("Load inventory error:", error);
        return;
    }

    inventoryList.innerHTML = "";

    if (!inventory || inventory.length === 0) {

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

        card.className = "event";

        let kategoriText = "";

        if (item.kategori === "cetak") {
            kategoriText = "🖨️ Cetak";
        } else if (item.kategori === "kamera") {
            kategoriText = "📷 Kamera";
        } else {
            kategoriText = "🎭 Properti";
        }

        let stockControls = "";

        if (item.kategori === "cetak") {

            stockControls = `
                <div class="event-actions">

                    <input
                        type="number"
                        min="1"
                        id="stock-input-${item.id}"
                        placeholder="Jumlah"
                        style="width: 120px;"
                    >

                    <button
                        type="button"
                        onclick="updateInventoryStock(${item.id}, 'add')"
                    >
                        ➕ Tambah
                    </button>

                    <button
                        type="button"
                        onclick="updateInventoryStock(${item.id}, 'subtract')"
                    >
                        ➖ Kurangi
                    </button>

                </div>
            `;
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

            ${stockControls}

            <div class="event-info">
                💰 Harga Satuan:
                ${formatRupiah(item.harga)}
            </div>

            <div class="event-actions">

                <button
                    type="button"
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
// TAMBAH / KURANG STOK
// =========================

async function updateInventoryStock(id, mode) {

    const input =
        document.getElementById(
            "stock-input-" + id
        );

    if (!input) {
        return;
    }

    const jumlah =
        Number(input.value);

    if (
        !Number.isFinite(jumlah) ||
        jumlah <= 0
    ) {
        alert("Masukkan jumlah yang valid.");
        return;
    }

    const {
        data: item,
        error
    } = await supabaseClient
        .from("inventory")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !item) {
        console.error(error);
        alert("Barang tidak ditemukan.");
        return;
    }

    let jumlahBaru =
        Number(item.jumlah) || 0;

    if (mode === "add") {
        jumlahBaru += jumlah;
    }

    if (mode === "subtract") {
        jumlahBaru -= jumlah;
    }

    if (jumlahBaru < 0) {
        alert("Stok tidak boleh kurang dari 0.");
        return;
    }

    const {
        error: updateError
    } = await supabaseClient
        .from("inventory")
        .update({
            jumlah: jumlahBaru
        })
        .eq("id", id);

    if (updateError) {
        console.error(updateError);
        alert("Gagal mengubah stok.");
        return;
    }

    await loadInventory();
}


// =========================
// HAPUS INVENTARIS
// =========================

async function deleteInventory(id) {

    const confirmDelete =
        confirm(
            "Hapus barang ini dari inventaris?"
        );


    if (!confirmDelete) {
        return;
    }


    const {
        error
    } = await supabaseClient
        .from("inventory")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(error);

        alert("Gagal menghapus barang.");
        return;
    }


    await loadInventory();
}


// =========================
// KEUANGAN
// =========================

async function loadFinance() {

    const financeList =
        document.getElementById("finance-list");

    const financeMonth =
        document.getElementById("finance-month");

    const totalEventsElement =
        document.getElementById("finance-total-events");

    const totalIncomeElement =
        document.getElementById("finance-total-income");


    if (
        !financeList ||
        !financeMonth ||
        !totalEventsElement ||
        !totalIncomeElement
    ) {
        return;
    }


    const selectedMonth =
        financeMonth.value;


    let query =
        supabaseClient
            .from("events")
            .select("*")
            .eq("status", "selesai")
            .order("tanggal", {
                ascending: false
            });


    if (selectedMonth) {

        query =
            query
                .gte(
                    "tanggal",
                    selectedMonth + "-01"
                )
                .lt(
                    "tanggal",
                    getNextMonth(selectedMonth)
                );
    }


    const {
        data: events,
        error
    } = await query;


    if (error) {

        console.error(error);
        return;
    }


    const finishedEvents =
        events || [];


    let totalIncome = 0;


    finishedEvents.forEach(function(event) {

        totalIncome +=
            Number(event.pendapatan_final) || 0;

    });


    totalEventsElement.textContent =
        finishedEvents.length;

    totalIncomeElement.textContent =
        formatRupiah(totalIncome);


    financeList.innerHTML = "";


    if (finishedEvents.length === 0) {

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


    finishedEvents.forEach(function(event) {

        const card =
            document.createElement("div");

        card.className = "finance-card";


        let tipeText = "";


        if (event.income_type === "full") {

            tipeText = "💼 Full Event";

        } else {

            tipeText =
                "👥 Per Orang • " +
                (Number(event.jumlah_orang) || 0) +
                " orang";

        }


        card.innerHTML = `

            <div class="finance-name">
                📸 ${event.nama_event}
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
                💰 Pendapatan:
                ${formatRupiah(event.pendapatan_final)}
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
    async function() {

        await updateDashboard();
        await loadEvents();
        await loadSchedule();
        await loadInventory();
        await loadFinance();

    }
);
