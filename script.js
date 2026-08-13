console.log("Sky Booth + Supabase berhasil terhubung!");


// =========================================================
// SUPABASE
// =========================================================

const SUPABASE_URL =
    "https://bhdeyuddovnptfhilslm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_dDeBrxwCiSii6eyAjl3N9g_jU8FZoUh";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =========================================================
// UTILITAS
// =========================================================

function formatRupiah(value) {

    return "Rp" +
        (Number(value) || 0).toLocaleString("id-ID");

}


function getCurrentMonth() {

    const now = new Date();

    return (
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0")
    );

}


function getToday() {

    const now = new Date();

    return (
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0")
    );

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


// =========================================================
// NAVIGASI
// =========================================================

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
            document.getElementById(
                name + "-page"
            );

        if (pageElement) {
            pageElement.style.display = "none";
        }

    });


    const selectedPage =
        document.getElementById(
            page + "-page"
        );


    if (selectedPage) {
        selectedPage.style.display = "block";
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
        await loadFinancePage();
    }

}


// =========================================================
// DASHBOARD
// =========================================================

async function updateDashboard() {

    const {
        data: events,
        error
    } = await supabaseClient
        .from("events")
        .select("*");


    if (error) {

        console.error(
            "Dashboard error:",
            error
        );

        return;
    }


    const allEvents =
        events || [];


    const activeEvents =
        allEvents.filter(function(event) {
            return event.status === "aktif";
        });


    const finishedEvents =
        allEvents.filter(function(event) {
            return event.status === "selesai";
        });


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


// =========================================================
// EVENT FORM
// =========================================================

function showForm() {

    const form =
        document.getElementById(
            "event-form"
        );


    if (form) {
        form.style.display = "block";
    }


    toggleIncomeType();

}


function hideForm() {

    const form =
        document.getElementById(
            "event-form"
        );


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
        document.getElementById(
            "income-type"
        );


    if (incomeType) {
        incomeType.value = "full";
    }


    toggleIncomeType();

}


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


// =========================================================
// SIMPAN EVENT
// =========================================================

async function saveEvent() {

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
                    incomeType === "full"
                        ? hargaFull
                        : 0,
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


// =========================================================
// LOAD EVENTS
// =========================================================

async function loadEvents() {

    const eventList =
        document.getElementById(
            "event-list"
        );


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


    if (
        !events ||
        events.length === 0
    ) {

        eventList.innerHTML = `
            <div class="event">

                <div class="event-name">
                    BELUM ADA EVENT
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


        card.className =
            "event";


        let incomeInfo = "";


        if (
            event.income_type === "full"
        ) {

            incomeInfo =
                "💼 Full Event • " +
                formatRupiah(
                    event.harga
                );

        } else {

            incomeInfo =
                "👥 Per Orang • " +
                formatRupiah(
                    event.harga
                ) +
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
                    type="button"
                    class="finish-event-button"
                    onclick="finishEvent(${event.id})"
                >
                    ✓ SELESAI
                </button>


                <button
                    type="button"
                    class="cancel-event-button"
                    onclick="cancelEvent(${event.id})"
                >
                    ✕ BATAL
                </button>


                <button
                    type="button"
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


// =========================================================
// FINISH EVENT
// =========================================================

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


    if (
        event.income_type === "per-person"
    ) {

        const inputJumlah =
            prompt(
                "Berapa jumlah orang yang foto?"
            );


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


    if (
        event.income_type === "full"
    ) {

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

        alert(
            "Gagal menyelesaikan event."
        );

        return;
    }


    await loadEvents();
    await updateDashboard();
    await loadSchedule();
    await loadFinancePage();

}


// =========================================================
// CANCEL EVENT
// =========================================================

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

        alert(
            "Gagal membatalkan event."
        );

        return;
    }


    await loadEvents();
    await updateDashboard();
    await loadSchedule();
    await loadFinancePage();

}


// =========================================================
// DELETE EVENT
// =========================================================

async function deleteEvent(id) {

    const confirmDelete =
        confirm(
            "Hapus event ini?"
        );


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

        alert(
            "Gagal menghapus event."
        );

        return;
    }


    await loadEvents();
    await updateDashboard();
    await loadSchedule();

}


// =========================================================
// JADWAL
// =========================================================

async function loadSchedule() {

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
                    getNextMonth(
                        selectedMonth
                    )
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


    if (
        !events ||
        events.length === 0
    ) {

        scheduleList.innerHTML = `
            <div class="event">

                <div class="event-name">
                    BELUM ADA JADWAL
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
            document.createElement(
                "div"
            );


        card.className =
            "event";


        card.innerHTML = `

            <div class="event-name">
                📸 ${event.nama_event}
            </div>


            <div class="event-info">
                📅 ${event.tanggal || "-"}
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


// =========================================================
// INVENTORY FORM
// =========================================================

function showInventoryForm() {

    const form =
        document.getElementById(
            "inventory-form"
        );


    if (form) {
        form.style.display = "block";
    }

}


function hideInventoryForm() {

    const form =
        document.getElementById(
            "inventory-form"
        );


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
        document.getElementById(
            "item-category"
        );


    if (category) {
        category.value = "cetak";
    }

}


// =========================================================
// SAVE INVENTORY
// =========================================================

async function saveInventory() {

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


// =========================================================
// LOAD INVENTORY
// =========================================================

async function loadInventory() {

    const inventoryList =
        document.getElementById(
            "inventory-list"
        );


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

        console.error(
            "Load inventory error:",
            error
        );

        return;
    }


    inventoryList.innerHTML = "";


    if (
        !inventory ||
        inventory.length === 0
    ) {

        inventoryList.innerHTML = `
            <div class="event">

                <div class="event-name">
                    BELUM ADA BARANG
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
            document.createElement(
                "div"
            );


        card.className =
            "event";


        let kategoriText = "";


        if (
            item.kategori === "cetak"
        ) {

            kategoriText =
                "🖨️ Cetak";

        } else if (
            item.kategori === "kamera"
        ) {

            kategoriText =
                "📷 Kamera";

        } else {

            kategoriText =
                "🎭 Properti";

        }


        let stockControls = "";


        if (
            item.kategori === "cetak"
        ) {

            stockControls = `

                <div class="event-actions">

                    <input
                        type="number"
                        min="1"
                        id="stock-input-${item.id}"
                        placeholder="Jumlah"
                        style="width:120px;"
                    >


                    <button
                        type="button"
                        onclick="updateInventoryStock(
                            ${item.id},
                            'add'
                        )"
                    >
                        ➕ TAMBAH
                    </button>


                    <button
                        type="button"
                        onclick="updateInventoryStock(
                            ${item.id},
                            'subtract'
                        )"
                    >
                        ➖ KURANGI
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
                >
                    🗑️
                </button>

            </div>

        `;


        inventoryList.appendChild(card);

    });

}


// =========================================================
// UPDATE STOCK
// =========================================================

async function updateInventoryStock(
    id,
    mode
) {

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

        alert(
            "Masukkan jumlah yang valid."
        );

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


    if (
        error ||
        !item
    ) {

        console.error(error);

        alert(
            "Barang tidak ditemukan."
        );

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

        alert(
            "Stok tidak boleh kurang dari 0."
        );

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

        alert(
            "Gagal mengubah stok."
        );

        return;
    }


    await loadInventory();

}


// =========================================================
// DELETE INVENTORY
// =========================================================

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

        alert(
            "Gagal menghapus barang."
        );

        return;
    }


    await loadInventory();

}


// =========================================================
// FINANCE UI
// =========================================================

async function showFinanceType(type) {

    const incomeSection =
        document.getElementById(
            "income-section"
        );


    const expenseSection =
        document.getElementById(
            "expense-section"
        );


    const incomeTab =
        document.getElementById(
            "income-tab"
        );


    const expenseTab =
        document.getElementById(
            "expense-tab"
        );


    if (
        !incomeSection ||
        !expenseSection
    ) {
        return;
    }


    if (type === "income") {

        incomeSection.style.display =
            "block";

        expenseSection.style.display =
            "none";


        if (incomeTab) {
            incomeTab.classList.add("active");
        }


        if (expenseTab) {
            expenseTab.classList.remove("active");
        }


        await loadFinishedEventsForFinance();

    } else {

        incomeSection.style.display =
            "none";

        expenseSection.style.display =
            "block";


        if (incomeTab) {
            incomeTab.classList.remove("active");
        }


        if (expenseTab) {
            expenseTab.classList.add("active");
        }

    }

}


function showIncomeCategory(category) {

    const eventSection =
        document.getElementById(
            "income-event-section"
        );


    const otherSection =
        document.getElementById(
            "income-other-section"
        );


    const cards =
        document.querySelectorAll(
            "#income-section .finance-category-card"
        );


    cards.forEach(function(card) {
        card.classList.remove("active");
    });


    if (category === "event") {

        if (eventSection) {
            eventSection.style.display =
                "block";
        }


        if (otherSection) {
            otherSection.style.display =
                "none";
        }


        if (cards[0]) {
            cards[0].classList.add("active");
        }


        loadFinishedEventsForFinance();

    } else {

        if (eventSection) {
            eventSection.style.display =
                "none";
        }


        if (otherSection) {
            otherSection.style.display =
                "block";
        }


        if (cards[1]) {
            cards[1].classList.add("active");
        }

    }

}


function showExpenseCategory(category) {

    const select =
        document.getElementById(
            "expense-category"
        );


    if (select) {

        select.value =
            category === "other"
                ? "other"
                : category;

    }


    const cards =
        document.querySelectorAll(
            "#expense-section .finance-category-card"
        );


    cards.forEach(function(card) {
        card.classList.remove("active");
    });


    const indexMap = {
        cetak: 0,
        kamera: 1,
        properti: 2,
        other: 3
    };


    const index =
        indexMap[category];


    if (
        typeof index === "number" &&
        cards[index]
    ) {

        cards[index].classList.add("active");

    }

}


// =========================================================
// LOAD FINANCE PAGE
// =========================================================

async function loadFinancePage() {

    const monthInput =
        document.getElementById(
            "finance-month"
        );


    if (
        monthInput &&
        !monthInput.value
    ) {

        monthInput.value =
            getCurrentMonth();

    }


    await showFinanceType("income");

    await loadFinishedEventsForFinance();

    await loadFinanceSummary();

}


// =========================================================
// LOAD FINISHED EVENTS FOR INCOME
// =========================================================

async function loadFinishedEventsForFinance() {

    const select =
        document.getElementById(
            "finance-event-select"
        );


    if (!select) {
        return;
    }


    const {
        data: events,
        error
    } = await supabaseClient
        .from("events")
        .select("*")
        .eq("status", "selesai")
        .order("tanggal", {
            ascending: false
        });


    if (error) {

        console.error(error);

        select.innerHTML =
            `
            <option value="">
                Gagal memuat event
            </option>
            `;

        return;
    }


    if (
        !events ||
        events.length === 0
    ) {

        select.innerHTML =
            `
            <option value="">
                Belum ada event selesai
            </option>
            `;

        return;
    }


    const eventIds =
        events.map(function(event) {
            return event.id;
        });


    const {
        data: transactions,
        error: transactionError
    } = await supabaseClient
        .from("transactions")
        .select("event_id")
        .eq("type", "income")
        .eq("category", "event");


    if (transactionError) {

        console.error(transactionError);
    }


    const usedEventIds =
        new Set(
            (transactions || [])
                .map(function(item) {
                    return item.event_id;
                })
                .filter(function(id) {
                    return id !== null;
                })
        );


    select.innerHTML =
        `
        <option value="">
            Pilih Event
        </option>
        `;


    events.forEach(function(event) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            event.id;


        const amount =
            Number(
                event.pendapatan_final
            ) || 0;


        const alreadyAdded =
            usedEventIds.has(event.id);


        option.textContent =
            alreadyAdded
                ? "✓ " +
                  event.nama_event +
                  " — " +
                  formatRupiah(amount) +
                  " (sudah masuk)"
                : event.nama_event +
                  " — " +
                  formatRupiah(amount);


        option.disabled =
            alreadyAdded;


        select.appendChild(option);

    });

}


// =========================================================
// SAVE EVENT INCOME
// =========================================================

async function saveEventIncome() {

    const select =
        document.getElementById(
            "finance-event-select"
        );


    if (!select) {
        return;
    }


    const eventId =
        Number(select.value);


    if (!eventId) {

        alert(
            "Pilih event terlebih dahulu."
        );

        return;
    }


    const {
        data: event,
        error
    } = await supabaseClient
        .from("events")
        .select("*")
        .eq("id", eventId)
        .eq("status", "selesai")
        .single();


    if (
        error ||
        !event
    ) {

        console.error(error);

        alert(
            "Event tidak ditemukan."
        );

        return;
    }


    const {
        data: existingTransaction,
        error: checkError
    } = await supabaseClient
        .from("transactions")
        .select("id")
        .eq("type", "income")
        .eq("category", "event")
        .eq("event_id", eventId)
        .limit(1);


    if (checkError) {

        console.error(checkError);

        alert(
            "Gagal mengecek transaksi."
        );

        return;
    }


    if (
        existingTransaction &&
        existingTransaction.length > 0
    ) {

        alert(
            "Pendapatan event ini sudah masuk ke Keuangan."
        );

        await loadFinishedEventsForFinance();

        return;
    }


    const amount =
        Number(
            event.pendapatan_final
        ) || 0;


    if (amount <= 0) {

        alert(
            "Event ini belum memiliki pendapatan."
        );

        return;
    }


    const {
        error: insertError
    } = await supabaseClient
        .from("transactions")
        .insert([
            {
                id: Date.now(),
                type: "income",
                category: "event",
                amount: amount,
                description:
                    "Pendapatan event: " +
                    event.nama_event,
                event_id: event.id,
                transaction_date:
                    event.tanggal || getToday()
            }
        ]);


    if (insertError) {

        console.error(insertError);

        alert(
            "Gagal menyimpan pendapatan event: " +
            insertError.message
        );

        return;
    }


    alert(
        "Pendapatan event berhasil dimasukkan ke Keuangan."
    );


    await loadFinishedEventsForFinance();

    await loadFinanceSummary();

}


// =========================================================
// SAVE OTHER INCOME
// =========================================================

async function saveOtherIncome() {

    const description =
        document.getElementById(
            "income-other-description"
        ).value.trim();


    const amount =
        Number(
            document.getElementById(
                "income-other-amount"
            ).value
        ) || 0;


    const date =
        document.getElementById(
            "income-other-date"
        ).value ||
        getToday();


    if (!description) {

        alert(
            "Masukkan keterangan pemasukan."
        );

        return;
    }


    if (amount <= 0) {

        alert(
            "Masukkan nominal pemasukan."
        );

        return;
    }


    const {
        error
    } = await supabaseClient
        .from("transactions")
        .insert([
            {
                id: Date.now(),
                type: "income",
                category: "other",
                amount: amount,
                description: description,
                event_id: null,
                transaction_date: date
            }
        ]);


    if (error) {

        console.error(error);

        alert(
            "Gagal menyimpan pemasukan: " +
            error.message
        );

        return;
    }


    document.getElementById(
        "income-other-description"
    ).value = "";


    document.getElementById(
        "income-other-amount"
    ).value = "";


    document.getElementById(
        "income-other-date"
    ).value = "";


    alert(
        "Pemasukan berhasil disimpan."
    );


    await loadFinanceSummary();

}


// =========================================================
// SAVE EXPENSE
// =========================================================

async function saveExpense() {

    const category =
        document.getElementById(
            "expense-category"
        ).value;


    const description =
        document.getElementById(
            "expense-description"
        ).value.trim();


    const amount =
        Number(
            document.getElementById(
                "expense-amount"
            ).value
        ) || 0;


    const date =
        document.getElementById(
            "expense-date"
        ).value ||
        getToday();


    if (!category) {

        alert(
            "Pilih kategori pengeluaran."
        );

        return;
    }


    if (!description) {

        alert(
            "Masukkan keterangan pengeluaran."
        );

        return;
    }


    if (amount <= 0) {

        alert(
            "Masukkan nominal pengeluaran."
        );

        return;
    }


    const {
        error
    } = await supabaseClient
        .from("transactions")
        .insert([
            {
                id: Date.now(),
                type: "expense",
                category: category,
                amount: amount,
                description: description,
                event_id: null,
                transaction_date: date
            }
        ]);


    if (error) {

        console.error(error);

        alert(
            "Gagal menyimpan pengeluaran: " +
            error.message
        );

        return;
    }


    document.getElementById(
        "expense-description"
    ).value = "";


    document.getElementById(
        "expense-amount"
    ).value = "";


    document.getElementById(
        "expense-date"
    ).value = "";


    alert(
        "Pengeluaran berhasil disimpan."
    );


    await loadFinanceSummary();

}


// =========================================================
// FINANCE SUMMARY
// =========================================================

async function loadFinanceSummary() {

    const monthInput =
        document.getElementById(
            "finance-month"
        );


    if (!monthInput) {
        return;
    }


    const selectedMonth =
        monthInput.value ||
        getCurrentMonth();


    const {
        data: transactions,
        error
    } = await supabaseClient
        .from("transactions")
        .select("*")
        .gte(
            "transaction_date",
            selectedMonth + "-01"
        )
        .lt(
            "transaction_date",
            getNextMonth(selectedMonth)
        )
        .order(
            "transaction_date",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Finance summary error:",
            error
        );

        return;
    }


    const list =
        transactions || [];


    let totalIncome = 0;

    let totalExpense = 0;


    list.forEach(function(transaction) {

        const amount =
            Number(
                transaction.amount
            ) || 0;


        if (
            transaction.type === "income"
        ) {

            totalIncome += amount;

        }


        if (
            transaction.type === "expense"
        ) {

            totalExpense += amount;

        }

    });


    const profit =
        totalIncome -
        totalExpense;


    const incomeElement =
        document.getElementById(
            "finance-summary-income"
        );


    const expenseElement =
        document.getElementById(
            "finance-summary-expense"
        );


    const profitElement =
        document.getElementById(
            "finance-summary-profit"
        );


    if (incomeElement) {

        incomeElement.textContent =
            formatRupiah(
                totalIncome
            );

    }


    if (expenseElement) {

        expenseElement.textContent =
            formatRupiah(
                totalExpense
            );

    }


    if (profitElement) {

        profitElement.textContent =
            formatRupiah(
                profit
            );

    }


    renderFinanceChart(
        totalIncome,
        totalExpense
    );


    renderFinanceTransactions(
        list
    );

}


// =========================================================
// FINANCE CHART
// =========================================================

function renderFinanceChart(
    totalIncome,
    totalExpense
) {

    const chart =
        document.getElementById(
            "finance-chart"
        );


    if (!chart) {
        return;
    }


    const maximum =
        Math.max(
            totalIncome,
            totalExpense,
            1
        );


    const incomeHeight =
        Math.max(
            18,
            Math.round(
                (totalIncome / maximum) *
                180
            )
        );


    const expenseHeight =
        Math.max(
            18,
            Math.round(
                (totalExpense / maximum) *
                180
            )
        );


    chart.innerHTML = `

        <div
            style="
                width:100%;
                display:flex;
                flex-direction:column;
                gap:16px;
                align-items:center;
            "
        >

            <div
                style="
                    width:100%;
                    display:flex;
                    justify-content:center;
                    align-items:flex-end;
                    gap:36px;
                    height:210px;
                "
            >

                <div
                    style="
                        height:100%;
                        display:flex;
                        flex-direction:column;
                        align-items:center;
                        justify-content:flex-end;
                        gap:8px;
                    "
                >

                    <div
                        style="
                            font-family:Poppins,sans-serif;
                            font-weight:700;
                            font-size:12px;
                            color:#2877c8;
                        "
                    >
                        ${formatRupiah(totalIncome)}
                    </div>

                    <div
                        style="
                            width:70px;
                            height:${incomeHeight}px;
                            border-radius:14px 14px 6px 6px;
                            background:linear-gradient(
                                180deg,
                                #69b7ff,
                                #2f7fd1
                            );
                            box-shadow:
                                0 8px 18px
                                rgba(40,119,200,0.18);
                        "
                    ></div>

                    <div
                        style="
                            font-family:Poppins,sans-serif;
                            font-weight:700;
                            font-size:12px;
                            color:#21456f;
                        "
                    >
                        PEMASUKAN
                    </div>

                </div>


                <div
                    style="
                        height:100%;
                        display:flex;
                        flex-direction:column;
                        align-items:center;
                        justify-content:flex-end;
                        gap:8px;
                    "
                >

                    <div
                        style="
                            font-family:Poppins,sans-serif;
                            font-weight:700;
                            font-size:12px;
                            color:#a83d3d;
                        "
                    >
                        ${formatRupiah(totalExpense)}
                    </div>

                    <div
                        style="
                            width:70px;
                            height:${expenseHeight}px;
                            border-radius:14px 14px 6px 6px;
                            background:linear-gradient(
                                180deg,
                                #f49a9a,
                                #d85b5b
                            );
                            box-shadow:
                                0 8px 18px
                                rgba(180,70,70,0.15);
                        "
                    ></div>

                    <div
                        style="
                            font-family:Poppins,sans-serif;
                            font-weight:700;
                            font-size:12px;
                            color:#21456f;
                        "
                    >
                        PENGELUARAN
                    </div>

                </div>

            </div>

        </div>
    `;

}


// =========================================================
// RENDER TRANSACTIONS
// =========================================================

async function renderFinanceTransactions(
    transactions
) {

    const financeList =
        document.getElementById(
            "finance-list"
        );


    if (!financeList) {
        return;
    }


    financeList.innerHTML = "";


    if (
        !transactions ||
        transactions.length === 0
    ) {

        financeList.innerHTML = `

            <div class="finance-card">

                <div class="finance-name">
                    BELUM ADA TRANSAKSI
                </div>

                <div class="finance-info">
                    Pemasukan dan pengeluaran akan muncul di sini.
                </div>

            </div>

        `;

        return;
    }


    let eventIds = [];


    transactions.forEach(function(item) {

        if (
            item.event_id !== null &&
            item.event_id !== undefined
        ) {

            eventIds.push(
                item.event_id
            );

        }

    });


    let eventsMap = new Map();


    if (eventIds.length > 0) {

        const uniqueEventIds =
            [...new Set(eventIds)];


        const {
            data: events,
            error
        } = await supabaseClient
            .from("events")
            .select(
                "id,nama_event"
            )
            .in(
                "id",
                uniqueEventIds
            );


        if (!error && events) {

            events.forEach(function(event) {

                eventsMap.set(
                    event.id,
                    event.nama_event
                );

            });

        }

    }


    transactions.forEach(function(transaction) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "finance-card";


        const amount =
            Number(
                transaction.amount
            ) || 0;


        const isIncome =
            transaction.type === "income";


        let categoryText =
            transaction.category;


        if (
            transaction.category === "event"
        ) {

            categoryText =
                "📸 PENDAPATAN EVENT";

        }


        if (
            transaction.category === "other" &&
            transaction.type === "income"
        ) {

            categoryText =
                "➕ PEMASUKAN LAINNYA";

        }


        if (
            transaction.category === "cetak"
        ) {

            categoryText =
                "🖨️ KEBUTUHAN CETAK";

        }


        if (
            transaction.category === "kamera"
        ) {

            categoryText =
                "📷 KEBUTUHAN KAMERA";

        }


        if (
            transaction.category === "properti"
        ) {

            categoryText =
                "🎭 KEBUTUHAN PROPERTI";

        }


        if (
            transaction.category === "other" &&
            transaction.type === "expense"
        ) {

            categoryText =
                "➕ PENGELUARAN LAINNYA";

        }


        const eventName =
            transaction.event_id !== null
                ? eventsMap.get(
                    transaction.event_id
                )
                : "";


        const amountColor =
            isIncome
                ? "#2877c8"
                : "#a83d3d";


        const amountPrefix =
            isIncome
                ? "+ "
                : "- ";


        card.innerHTML = `

            <div class="finance-name">
                ${categoryText}
            </div>


            <div class="finance-info">
                📅 ${transaction.transaction_date}
            </div>


            <div class="finance-info">
                ${transaction.description || "-"}
            </div>


            ${
                eventName
                    ? `
                        <div class="finance-info">
                            📸 EVENT:
                            ${eventName}
                        </div>
                    `
                    : ""
            }


            <div
                class="finance-income"
                style="color:${amountColor};"
            >
                ${amountPrefix}${formatRupiah(amount)}
            </div>

        `;


        financeList.appendChild(card);

    });

}


// =========================================================
// FINANCE INITIAL STATE
// =========================================================

function setDefaultFinanceDate() {

    const incomeDate =
        document.getElementById(
            "income-other-date"
        );


    const expenseDate =
        document.getElementById(
            "expense-date"
        );


    if (
        incomeDate &&
        !incomeDate.value
    ) {

        incomeDate.value =
            getToday();

    }


    if (
        expenseDate &&
        !expenseDate.value
    ) {

        expenseDate.value =
            getToday();

    }

}


// =========================================================
// LOAD FINANCE OLD COMPATIBILITY
// =========================================================

async function loadFinance() {

    await loadFinanceSummary();

}


// =========================================================
// INITIAL LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        setDefaultFinanceDate();

        await updateDashboard();

        await loadEvents();

        await loadSchedule();

        await loadInventory();

        await loadFinancePage();

    }
);

