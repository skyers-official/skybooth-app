console.log("Sky Booth + Supabase berhasil terhubung!");


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://bhdeyuddovnptfhilslm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_dDeBrxwCiSii6eyAjl3N9g_jU8FZoUh";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   WELCOME
========================================================= */

function enterDashboard() {

    const welcome =
        document.getElementById(
            "welcome-screen"
        );

    if (!welcome) {
        return;
    }

    welcome.style.opacity =
        "0";

    setTimeout(
        function() {

            welcome.style.display =
                "none";

            welcome.style.opacity =
                "1";

        },
        250
    );

}


/* =========================================================
   UTIL
========================================================= */

function formatRupiah(value) {

    return "Rp" +
        (Number(value) || 0)
            .toLocaleString("id-ID");

}


function getToday() {

    const now =
        new Date();

    return (
        now.getFullYear() +
        "-" +
        String(
            now.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            now.getDate()
        ).padStart(2, "0")
    );

}


function getCurrentMonth() {

    const now =
        new Date();

    return (
        now.getFullYear() +
        "-" +
        String(
            now.getMonth() + 1
        ).padStart(2, "0")
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

    if (
        monthNumber === 13
    ) {

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


/* =========================================================
   NAVIGATION
========================================================= */

async function showPage(page) {

    const pages = [
        "dashboard",
        "event",
        "schedule",
        "inventory",
        "finance"
    ];


    pages.forEach(
        function(name) {

            const element =
                document.getElementById(
                    name + "-page"
                );

            if (element) {

                element.style.display =
                    "none";

            }

        }
    );


    const selected =
        document.getElementById(
            page + "-page"
        );


    if (selected) {

        selected.style.display =
            "block";

    }


    document
        .querySelectorAll(
            ".menu button"
        )
        .forEach(
            function(button) {

                button.classList.remove(
                    "active"
                );

            }
        );


    const clicked =
        document.querySelector(
            `.menu button[onclick="showPage('${page}')"]`
        );


    if (clicked) {

        clicked.classList.add(
            "active"
        );

    }


    if (
        page === "dashboard"
    ) {

        await updateDashboard();

    }


    if (
        page === "event"
    ) {

        await loadEvents();

    }


    if (
        page === "schedule"
    ) {

        const monthInput =
            document.getElementById(
                "schedule-month"
            );

        if (
            monthInput &&
            !monthInput.value
        ) {

            monthInput.value =
                getCurrentMonth();

        }

        await loadSchedule();

    }


    if (
        page === "inventory"
    ) {

        await loadInventory();

    }


    if (
        page === "finance"
    ) {

        await loadFinancePage();

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

async function updateDashboard() {

    const {
        data: events,
        error
    } =
        await supabaseClient
            .from("events")
            .select("*");


    if (error) {

        console.error(
            "Dashboard error:",
            error
        );

        return;

    }


    const list =
        events || [];


    const activeEvents =
        list.filter(
            function(event) {

                return (
                    event.status ===
                    "aktif"
                );

            }
        );


    const finishedEvents =
        list.filter(
            function(event) {

                return (
                    event.status ===
                    "selesai"
                );

            }
        );


    const totalEvent =
        document.getElementById(
            "total-event"
        );


    const totalFinished =
        document.getElementById(
            "total-finished"
        );


    const totalFullIncome =
        document.getElementById(
            "total-full-income"
        );


    const totalPersonIncome =
        document.getElementById(
            "total-person-income"
        );


    if (totalEvent) {

        totalEvent.textContent =
            activeEvents.length;

    }


    if (totalFinished) {

        totalFinished.textContent =
            finishedEvents.length;

    }


    let fullIncome =
        0;

    let personIncome =
        0;


    finishedEvents.forEach(
        function(event) {

            const amount =
                Number(
                    event.pendapatan_final
                ) || 0;


            if (
                event.income_type ===
                "full"
            ) {

                fullIncome +=
                    amount;

            }


            if (
                event.income_type ===
                "per-person"
            ) {

                personIncome +=
                    amount;

            }

        }
    );


    if (totalFullIncome) {

        totalFullIncome.textContent =
            formatRupiah(
                fullIncome
            );

    }


    if (totalPersonIncome) {

        totalPersonIncome.textContent =
            formatRupiah(
                personIncome
            );

    }

}


/* =========================================================
   EVENT
========================================================= */

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

    [
        "event-name",
        "event-client",
        "event-date",
        "event-location",
        "event-price",
        "price-per-person"
    ].forEach(
        function(id) {

            const element =
                document.getElementById(
                    id
                );

            if (element) {

                element.value =
                    "";

            }

        }
    );


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


function toggleIncomeType() {

    const incomeType =
        document.getElementById(
            "income-type"
        );


    const fullBox =
        document.getElementById(
            "full-price-box"
        );


    const perPersonBox =
        document.getElementById(
            "per-person-price-box"
        );


    if (
        !incomeType ||
        !fullBox ||
        !perPersonBox
    ) {

        return;

    }


    if (
        incomeType.value ===
        "full"
    ) {

        fullBox.style.display =
            "block";

        perPersonBox.style.display =
            "none";

    } else {

        fullBox.style.display =
            "none";

        perPersonBox.style.display =
            "block";

    }

}


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
        incomeType ===
        "full"
            ? hargaFull
            : hargaPerPerson;


    const {
        error
    } =
        await supabaseClient
            .from("events")
            .insert([
                {

                    id:
                        Date.now(),

                    nama_event:
                        namaEvent,

                    klien:
                        klien,

                    tanggal:
                        tanggal,

                    lokasi:
                        lokasi,

                    income_type:
                        incomeType,

                    harga:
                        harga,

                    jumlah_orang:
                        0,

                    pendapatan_final:
                        incomeType ===
                        "full"
                            ? hargaFull
                            : 0,

                    status:
                        "aktif"

                }
            ]);


    if (error) {

        console.error(
            error
        );

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
    } =
        await supabaseClient
            .from("events")
            .select("*")
            .eq(
                "status",
                "aktif"
            )
            .order(
                "tanggal",
                {
                    ascending:
                        true
                }
            );


    if (error) {

        console.error(
            error
        );

        return;

    }


    eventList.innerHTML =
        "";


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


    events.forEach(
        function(event) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "event";


            const incomeInfo =
                event.income_type === "full"
                    ? "💼 Full Event • " +
                      formatRupiah(
                          event.harga
                      )
                    : "👥 Per Orang • " +
                      formatRupiah(
                          event.harga
                      ) +
                      " / orang";


            card.innerHTML = `

                <div class="event-name">
                    📸 ${event.nama_event}
                </div>

                <div class="event-info">
                    👤 Klien:
                    ${event.klien || "-"}
                </div>

                <div class="event-info">
                    📅
                    ${event.tanggal || "-"}
                </div>

                <div class="event-info">
                    📍
                    ${event.lokasi || "-"}
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


            eventList.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   FINISH EVENT
========================================================= */

async function finishEvent(id) {

    const {
        data: event,
        error
    } =
        await supabaseClient
            .from("events")
            .select("*")
            .eq(
                "id",
                id
            )
            .single();


    if (
        error ||
        !event
    ) {

        alert(
            "Event tidak ditemukan."
        );

        return;

    }


    let jumlahOrang =
        Number(
            event.jumlah_orang
        ) || 0;


    let pendapatanFinal =
        Number(
            event.pendapatan_final
        ) || 0;


    if (
        event.income_type ===
        "per-person"
    ) {

        const jumlah =
            prompt(
                "Berapa jumlah orang yang foto?"
            );


        if (
            jumlah ===
            null
        ) {

            return;

        }


        jumlahOrang =
            Number(jumlah) || 0;


        if (
            jumlahOrang <= 0
        ) {

            alert(
                "Jumlah orang harus lebih dari 0."
            );

            return;

        }


        pendapatanFinal =
            jumlahOrang *
            (
                Number(
                    event.harga
                ) || 0
            );

    }


    if (
        event.income_type ===
        "full"
    ) {

        pendapatanFinal =
            Number(
                event.harga
            ) || 0;

    }


    if (
        pendapatanFinal <= 0
    ) {

        alert(
            "Pendapatan event belum valid."
        );

        return;

    }


    const {
        error:
            updateError
    } =
        await supabaseClient
            .from("events")
            .update({

                jumlah_orang:
                    jumlahOrang,

                pendapatan_final:
                    pendapatanFinal,

                status:
                    "selesai",

                tanggal_selesai:
                    new Date().toISOString()

            })
            .eq(
                "id",
                id
            );


    if (updateError) {

        console.error(
            updateError
        );

        alert(
            "Gagal menyelesaikan event."
        );

        return;

    }


    const {
        data: existingTransaction
    } =
        await supabaseClient
            .from("transactions")
            .select("id")
            .eq(
                "type",
                "income"
            )
            .eq(
                "category",
                "event"
            )
            .eq(
                "event_id",
                event.id
            )
            .limit(1);


    if (
        !existingTransaction ||
        existingTransaction.length === 0
    ) {

        const {
            error:
                transactionError
        } =
            await supabaseClient
                .from("transactions")
                .insert([
                    {

                        id:
                            Date.now(),

                        type:
                            "income",

                        category:
                            "event",

                        amount:
                            pendapatanFinal,

                        description:
                            "Pendapatan event: " +
                            event.nama_event,

                        event_id:
                            event.id,

                        transaction_date:
                            event.tanggal ||
                            getToday()

                    }
                ]);


        if (transactionError) {

            console.error(
                transactionError
            );

            alert(
                "Event selesai, tetapi pemasukan gagal dibuat."
            );

        }

    }


    await loadEvents();

    await updateDashboard();

    await loadSchedule();

    await loadFinanceSummary();

}


/* =========================================================
   CANCEL / DELETE EVENT
========================================================= */

async function cancelEvent(id) {

    const ok =
        confirm(
            "Yakin ingin membatalkan event ini?"
        );


    if (!ok) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("events")
            .update({

                status:
                    "batal",

                pendapatan_final:
                    0,

                tanggal_selesai:
                    new Date().toISOString()

            })
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            error
        );

        alert(
            "Gagal membatalkan event."
        );

        return;

    }


    await loadEvents();

    await updateDashboard();

    await loadSchedule();

}


async function deleteEvent(id) {

    const ok =
        confirm(
            "Hapus event ini?"
        );


    if (!ok) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("events")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            error
        );

        alert(
            "Gagal menghapus event."
        );

        return;

    }


    await loadEvents();

    await updateDashboard();

    await loadSchedule();

}


/* =========================================================
   SCHEDULE
========================================================= */

async function loadSchedule() {

    const calendarGrid =
        document.getElementById(
            "schedule-calendar-grid"
        );


    const monthInput =
        document.getElementById(
            "schedule-month"
        );


    const monthTitle =
        document.getElementById(
            "schedule-month-title"
        );


    if (
        !calendarGrid ||
        !monthInput ||
        !monthTitle
    ) {

        return;

    }


    if (!monthInput.value) {

        monthInput.value =
            getCurrentMonth();

    }


    const selectedMonth =
        monthInput.value;


    const [
        year,
        month
    ] =
        selectedMonth
            .split("-")
            .map(Number);


    const firstDay =
        new Date(
            Date.UTC(
                year,
                month - 1,
                1
            )
        );


    const daysInMonth =
        new Date(
            Date.UTC(
                year,
                month,
                0
            )
        ).getUTCDate();


    const firstWeekday =
        (
            firstDay.getUTCDay() +
            6
        ) % 7;


    monthTitle.textContent =
        new Intl.DateTimeFormat(
            "id-ID",
            {
                month:
                    "long",

                year:
                    "numeric"
            }
        )
            .format(
                new Date(
                    year,
                    month - 1,
                    1
                )
            )
            .toUpperCase();


    const {
        data: events,
        error
    } =
        await supabaseClient
            .from("events")
            .select("*")
            .in(
                "status",
                [
                    "aktif",
                    "selesai"
                ]
            )
            .gte(
                "tanggal",
                selectedMonth +
                "-01"
            )
            .lt(
                "tanggal",
                getNextMonth(
                    selectedMonth
                )
            )
            .order(
                "tanggal",
                {
                    ascending:
                        true
                }
            );


    if (error) {

        console.error(
            error
        );

        calendarGrid.innerHTML = `

            <div
                style="
                    grid-column:1/-1;
                    padding:30px;
                    text-align:center;
                "
            >
                Gagal memuat kalender.
            </div>

        `;

        return;

    }


    const grouped =
        {};


    (events || [])
        .forEach(
            function(event) {

                if (
                    !grouped[event.tanggal]
                ) {

                    grouped[event.tanggal] =
                        [];

                }


                grouped[event.tanggal]
                    .push(event);

            }
        );


    calendarGrid.innerHTML =
        "";


    for (
        let i = 0;
        i < firstWeekday;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "schedule-day empty";

        calendarGrid.appendChild(
            empty
        );

    }


    const now =
        new Date();


    const today =
        now.getFullYear() +
        "-" +
        String(
            now.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            now.getDate()
        ).padStart(2, "0");


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dateString =
            selectedMonth +
            "-" +
            String(day).padStart(
                2,
                "0"
            );


        const dayBox =
            document.createElement(
                "div"
            );


        dayBox.className =
            "schedule-day";


        if (
            dateString ===
            today
        ) {

            dayBox.classList.add(
                "today"
            );

        }


        const number =
            document.createElement(
                "div"
            );


        number.className =
            "schedule-day-number";


        number.textContent =
            day;


        dayBox.appendChild(
            number
        );


        (
            grouped[dateString] ||
            []
        )
            .forEach(
                function(event) {

                    const eventCard =
                        document.createElement(
                            "div"
                        );


                    eventCard.className =
                        "schedule-event-card";


                    const eventName =
                        document.createElement(
                            "div"
                        );


                    eventName.className =
                        "schedule-event-name";


                    eventName.textContent =
                        event.nama_event ||
                        "-";


                    const location =
                        document.createElement(
                            "div"
                        );


                    location.className =
                        "schedule-event-location";


                    location.textContent =
                        event.lokasi ||
                        "-";


                    const client =
                        document.createElement(
                            "div"
                        );


                    client.className =
                        "schedule-event-client";


                    client.textContent =
                        event.klien ||
                        "-";


                    eventCard.appendChild(
                        eventName
                    );

                    eventCard.appendChild(
                        location
                    );

                    eventCard.appendChild(
                        client
                    );

                    dayBox.appendChild(
                        eventCard
                    );

                }
            );


        calendarGrid.appendChild(
            dayBox
        );

    }

}


function changeScheduleMonth(
    offset
) {

    const monthInput =
        document.getElementById(
            "schedule-month"
        );


    if (!monthInput) {

        return;

    }


    const current =
        monthInput.value ||
        getCurrentMonth();


    const [
        year,
        month
    ] =
        current
            .split("-")
            .map(Number);


    const nextDate =
        new Date(
            year,
            month - 1 + offset,
            1
        );


    monthInput.value =
        nextDate.getFullYear() +
        "-" +
        String(
            nextDate.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    loadSchedule();

}


/* =========================================================
   INVENTORY
========================================================= */

let activeInventoryCategory =
    "cetak";


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

    [
        "item-name",
        "item-brand",
        "item-quantity",
        "item-price"
    ].forEach(
        function(id) {

            const element =
                document.getElementById(
                    id
                );

            if (element) {

                element.value =
                    "";

            }

        }
    );


    const category =
        document.getElementById(
            "item-category"
        );


    if (category) {

        category.value =
            activeInventoryCategory;

    }

}


function filterInventory(
    category
) {

    activeInventoryCategory =
        category;


    document
        .querySelectorAll(
            ".inventory-category-tab"
        )
        .forEach(
            function(button) {

                button.classList.toggle(
                    "active",
                    button.dataset.category ===
                    category
                );

            }
        );


    loadInventory();

}


function getInventoryCategoryLabel(
    category
) {

    const labels = {

        cetak:
            "🖨️ Cetak",

        kamera:
            "📷 Kamera",

        properti:
            "🎭 Properti",

        other:
            "➕ Lainnya"

    };


    return (
        labels[category] ||
        category ||
        "-"
    );

}


function setInventoryActiveTab(
    category
) {

    activeInventoryCategory =
        category;


    document
        .querySelectorAll(
            ".inventory-category-tab"
        )
        .forEach(
            function(button) {

                button.classList.toggle(
                    "active",
                    button.dataset.category ===
                    category
                );

            }
        );

}


async function saveInventory() {

    const name =
        document.getElementById(
            "item-name"
        ).value.trim();


    const brand =
        document.getElementById(
            "item-brand"
        ).value.trim();


    const category =
        document.getElementById(
            "item-category"
        ).value;


    const quantity =
        Number(
            document.getElementById(
                "item-quantity"
            ).value
        ) || 0;


    const price =
        Number(
            document.getElementById(
                "item-price"
            ).value
        ) || 0;


    if (!name) {

        alert(
            "Masukkan nama barang."
        );

        return;

    }


    if (quantity < 0) {

        alert(
            "Jumlah tidak boleh kurang dari 0."
        );

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("inventory")
            .insert([
                {

                    id:
                        Date.now(),

                    nama:
                        name,

                    merk:
                        brand,

                    kategori:
                        category,

                    jumlah:
                        quantity,

                    harga:
                        price

                }
            ]);


    if (error) {

        console.error(
            error
        );

        alert(
            "Gagal menyimpan barang: " +
            error.message
        );

        return;

    }


    setInventoryActiveTab(
        category
    );


    hideInventoryForm();

    await loadInventory();

}


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
    } =
        await supabaseClient
            .from("inventory")
            .select("*")
            .eq(
                "kategori",
                activeInventoryCategory
            )
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


    if (error) {

        console.error(
            "Inventory error:",
            error
        );

        inventoryList.innerHTML = `

            <div class="event">

                <div class="event-name">
                    GAGAL MEMUAT INVENTARIS
                </div>

                <div class="event-info">
                    ${error.message}
                </div>

            </div>

        `;

        return;

    }


    inventoryList.innerHTML =
        "";


    if (
        !inventory ||
        inventory.length ===
        0
    ) {

        inventoryList.innerHTML = `

            <div class="event">

                <div class="event-name">
                    BELUM ADA BARANG
                </div>

                <div class="event-info">
                    Belum ada barang di kategori ini.
                </div>

            </div>

        `;

        return;

    }


    inventory.forEach(
        function(item) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "inventory-item";


            card.innerHTML = `

                <button
                    type="button"
                    class="inventory-item-button"
                    onclick="toggleInventoryDetail(${item.id})"
                >
                    ${item.nama}
                </button>


                <div
                    id="inventory-detail-${item.id}"
                    class="inventory-detail"
                >

                    <div
                        class="inventory-detail-divider"
                    ></div>


                    <div
                        class="inventory-detail-row"
                    >

                        <span
                            class="inventory-detail-label"
                        >
                            Merk
                        </span>

                        <span
                            class="inventory-detail-value"
                        >
                            ${item.merk || "-"}
                        </span>

                    </div>


                    <div
                        class="inventory-detail-row"
                    >

                        <span
                            class="inventory-detail-label"
                        >
                            Kategori
                        </span>

                        <span
                            class="inventory-detail-value"
                        >
                            ${getInventoryCategoryLabel(
                                item.kategori
                            )}
                        </span>

                    </div>


                    <div
                        class="inventory-detail-row"
                    >

                        <span
                            class="inventory-detail-label"
                        >
                            Harga
                        </span>

                        <span
                            class="inventory-detail-value"
                        >
                            ${formatRupiah(
                                item.harga
                            )}
                        </span>

                    </div>


                    <div
                        class="inventory-stock-controls"
                    >

                        <button
                            type="button"
                            class="inventory-stock-button"
                            onclick="updateInventoryStock(${item.id}, 'subtract')"
                        >
                            −
                        </button>


                        <div
                            class="inventory-stock-value"
                        >
                            ${item.jumlah}
                        </div>


                        <button
                            type="button"
                            class="inventory-stock-button"
                            onclick="updateInventoryStock(${item.id}, 'add')"
                        >
                            +
                        </button>

                    </div>


                    <div
                        class="inventory-delete-row"
                    >

                        <button
                            type="button"
                            class="inventory-delete-button"
                            onclick="deleteInventory(${item.id})"
                        >
                            🗑️ HAPUS BARANG
                        </button>

                    </div>

                </div>

            `;


            inventoryList.appendChild(
                card
            );

        }
    );

}


function toggleInventoryDetail(
    id
) {

    const detail =
        document.getElementById(
            "inventory-detail-" +
            id
        );


    if (!detail) {

        return;

    }


    const item =
        detail.closest(
            ".inventory-item"
        );


    if (!item) {

        return;

    }


    item.classList.toggle(
        "open"
    );

}


async function updateInventoryStock(
    id,
    mode
) {

    const {
        data: item,
        error
    } =
        await supabaseClient
            .from("inventory")
            .select("*")
            .eq(
                "id",
                id
            )
            .single();


    if (
        error ||
        !item
    ) {

        console.error(
            error
        );

        alert(
            "Barang tidak ditemukan."
        );

        return;

    }


    let newQuantity =
        Number(
            item.jumlah
        ) || 0;


    if (
        mode ===
        "add"
    ) {

        newQuantity +=
            1;

    }


    if (
        mode ===
        "subtract"
    ) {

        newQuantity -=
            1;

    }


    if (
        newQuantity <
        0
    ) {

        alert(
            "Stok tidak boleh kurang dari 0."
        );

        return;

    }


    const {
        error:
            updateError
    } =
        await supabaseClient
            .from("inventory")
            .update({
                jumlah:
                    newQuantity
            })
            .eq(
                "id",
                id
            );


    if (updateError) {

        console.error(
            updateError
        );

        alert(
            "Gagal mengubah stok: " +
            updateError.message
        );

        return;

    }


    await loadInventory();

}


async function deleteInventory(
    id
) {

    const ok =
        confirm(
            "Hapus barang ini dari inventaris?"
        );


    if (!ok) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("inventory")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            error
        );

        alert(
            "Gagal menghapus barang: " +
            error.message
        );

        return;

    }


    await loadInventory();

}


/* =========================================================
   FINANCE
========================================================= */

async function showFinanceType(
    type
) {

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


    if (
        type ===
        "income"
    ) {

        incomeSection.style.display =
            "block";

        expenseSection.style.display =
            "none";

        incomeTab.classList.add(
            "active"
        );

        expenseTab.classList.remove(
            "active"
        );

    } else {

        incomeSection.style.display =
            "none";

        expenseSection.style.display =
            "block";

        incomeTab.classList.remove(
            "active"
        );

        expenseTab.classList.add(
            "active"
        );

    }

}


function showExpenseCategory(
    category
) {

    const select =
        document.getElementById(
            "expense-category"
        );


    if (select) {

        select.value =
            category;

    }


    const cards =
        document.querySelectorAll(
            "#expense-section .finance-category-card"
        );


    cards.forEach(
        function(card) {

            card.classList.remove(
                "active"
            );

        }
    );


    const indexMap = {

        cetak:
            0,

        kamera:
            1,

        properti:
            2,

        other:
            3

    };


    if (
        cards[
            indexMap[category]
        ]
    ) {

        cards[
            indexMap[category]
        ]
            .classList.add(
                "active"
            );

    }

}


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
    } =
        await supabaseClient
            .from("transactions")
            .insert([
                {

                    id:
                        Date.now(),

                    type:
                        "income",

                    category:
                        "other",

                    amount:
                        amount,

                    description:
                        description,

                    event_id:
                        null,

                    transaction_date:
                        date

                }
            ]);


    if (error) {

        console.error(
            error
        );

        alert(
            "Gagal menyimpan pemasukan: " +
            error.message
        );

        return;

    }


    document.getElementById(
        "income-other-description"
    ).value =
        "";


    document.getElementById(
        "income-other-amount"
    ).value =
        "";


    document.getElementById(
        "income-other-date"
    ).value =
        "";


    await loadFinanceSummary();


    alert(
        "Pemasukan berhasil disimpan."
    );

}


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
    } =
        await supabaseClient
            .from("transactions")
            .insert([
                {

                    id:
                        Date.now(),

                    type:
                        "expense",

                    category:
                        category,

                    amount:
                        amount,

                    description:
                        description,

                    event_id:
                        null,

                    transaction_date:
                        date

                }
            ]);


    if (error) {

        console.error(
            error
        );

        alert(
            "Gagal menyimpan pengeluaran: " +
            error.message
        );

        return;

    }


    document.getElementById(
        "expense-description"
    ).value =
        "";


    document.getElementById(
        "expense-amount"
    ).value =
        "";


    document.getElementById(
        "expense-date"
    ).value =
        "";


    await loadFinanceSummary();


    alert(
        "Pengeluaran berhasil disimpan."
    );

}


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


    await showFinanceType(
        "income"
    );


    await loadFinanceSummary();

}


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
    } =
        await supabaseClient
            .from("transactions")
            .select("*")
            .gte(
                "transaction_date",
                selectedMonth +
                "-01"
            )
            .lt(
                "transaction_date",
                getNextMonth(
                    selectedMonth
                )
            )
            .order(
                "transaction_date",
                {
                    ascending:
                        false
                }
            );


    if (error) {

        console.error(
            "Finance error:",
            error
        );

        return;

    }


    const list =
        transactions || [];


    let totalIncome =
        0;


    let totalExpense =
        0;


    const expenseByCategory = {

        cetak:
            0,

        kamera:
            0,

        properti:
            0,

        other:
            0

    };


    list.forEach(
        function(transaction) {

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type ===
                "income"
            ) {

                totalIncome +=
                    amount;

            }


            if (
                transaction.type ===
                "expense"
            ) {

                totalExpense +=
                    amount;


                if (
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            expenseByCategory,
                            transaction.category
                        )
                ) {

                    expenseByCategory[
                        transaction.category
                    ] +=
                        amount;

                }

            }

        }
    );


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
        totalExpense,
        profit,
        expenseByCategory
    );


    await renderFinanceTransactions(
        list
    );

}


function renderFinanceChart(
    totalIncome,
    totalExpense,
    profit,
    expenseByCategory
) {

    const chart =
        document.getElementById(
            "finance-chart"
        );


    if (!chart) {

        return;

    }


    const max =
        Math.max(
            totalIncome,
            totalExpense,
            Math.abs(profit),
            1
        );


    function height(value) {

        return Math.max(
            18,
            Math.round(
                value /
                max *
                170
            )
        );

    }


    const profitColor =
        profit >= 0
            ? "#4ca879"
            : "#d85b5b";


    const rows = [

        [
            "🖨️ CETAK",
            expenseByCategory.cetak
        ],

        [
            "📷 KAMERA",
            expenseByCategory.kamera
        ],

        [
            "🎭 PROPERTI",
            expenseByCategory.properti
        ],

        [
            "➕ LAINNYA",
            expenseByCategory.other
        ]

    ];


    const maxCategory =
        Math.max(
            ...rows.map(
                function(row) {

                    return row[1];

                }
            ),

            1
        );


    chart.innerHTML = `

        <div
            style="
                width:100%;
                display:flex;
                flex-direction:column;
                gap:28px;
            "
        >

            <div
                style="
                    width:100%;
                    height:240px;
                    display:flex;
                    justify-content:center;
                    align-items:flex-end;
                    gap:28px;
                "
            >

                <div
                    style="
                        height:100%;
                        display:flex;
                        flex-direction:column;
                        align-items:center;
                        justify-content:flex-end;
                        gap:7px;
                        min-width:80px;
                    "
                >

                    <div
                        style="
                            font-family:Poppins,sans-serif;
                            font-size:11px;
                            font-weight:700;
                            color:#2877c8;
                        "
                    >
                        ${formatRupiah(
                            totalIncome
                        )}
                    </div>


                    <div
                        style="
                            width:65px;
                            height:${height(
                                totalIncome
                            )}px;
                            border-radius:14px 14px 6px 6px;
                            background:linear-gradient(
                                180deg,
                                #69b7ff,
                                #2f7fd1
                            );
                        "
                    ></div>


                    <div
                        style="
                            font-family:Poppins,sans-serif;
                            font-size:11px;
                            font-weight:700;
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
                        gap:7px;
                        min-width:80px;
                    "
                >

                    <div
                        style="
                            font-family:Poppins,sans-serif;
                            font-size:11px;
                            font-weight:700;
                            color:#a83d3d;
                        "
                    >
                        ${formatRupiah(
                            totalExpense
                        )}
                    </div>


                    <div
                        style="
                            width:65px;
                            height:${height(
                                totalExpense
                            )}px;
                            border-radius:14px 14px 6px 6px;
                            background:linear-gradient(
                                180deg,
                                #f49a9a,
                                #d85b5b
                            );
                        "
                    ></div>


                    <div
                        style="
                            font-family:Poppins,sans-serif;
                            font-size:11px;
                            font-weight:700;
                        "
                    >
                        PENGELUARAN
                    </div>

                </div>


                <div
                    style="
                        height:100%;
                        display:flex;
                        flex-direction:column;
                        align-items:center;
                        justify-content:flex-end;
                        gap:7px;
                        min-width:80px;
                    "
                >

                    <div
                        style="
                            font-family:Poppins,sans-serif;
                            font-size:11px;
                            font-weight:700;
                            color:${profitColor};
                        "
                    >
                        ${formatRupiah(
                            profit
                        )}
                    </div>


                    <div
                        style="
                            width:65px;
                            height:${height(
                                Math.abs(
                                    profit
                                )
                            )}px;
                            border-radius:14px 14px 6px 6px;
                            background:${profitColor};
                        "
                    ></div>


                    <div
                        style="
                            font-family:Poppins,sans-serif;
                            font-size:11px;
                            font-weight:700;
                        "
                    >
                        LABA BERSIH
                    </div>

                </div>

            </div>


            <div>

                <div
                    style="
                        font-family:Chicken Pie,sans-serif;
                        font-size:18px;
                        color:#173b68;
                        margin-bottom:12px;
                    "
                >
                    RINCIAN PENGELUARAN
                </div>


                ${
                    rows.map(
                        function(row) {

                            const width =
                                Math.max(
                                    0,
                                    Math.round(
                                        row[1] /
                                        maxCategory *
                                        100
                                    )
                                );


                            return `

                                <div
                                    style="
                                        display:grid;
                                        grid-template-columns:115px 1fr auto;
                                        align-items:center;
                                        gap:9px;
                                        margin-bottom:10px;
                                    "
                                >

                                    <div
                                        style="
                                            font-size:11px;
                                            font-weight:700;
                                        "
                                    >
                                        ${row[0]}
                                    </div>


                                    <div
                                        style="
                                            width:100%;
                                            height:10px;
                                            border-radius:999px;
                                            background:rgba(47,127,209,0.10);
                                            overflow:hidden;
                                        "
                                    >

                                        <div
                                            style="
                                                width:${width}%;
                                                height:100%;
                                                border-radius:999px;
                                                background:linear-gradient(
                                                    90deg,
                                                    #69b7ff,
                                                    #2f7fd1
                                                );
                                            "
                                        ></div>

                                    </div>


                                    <div
                                        style="
                                            font-size:11px;
                                            font-weight:700;
                                            text-align:right;
                                        "
                                    >
                                        ${formatRupiah(
                                            row[1]
                                        )}
                                    </div>

                                </div>

                            `;

                        }
                    ).join("")
                }

            </div>

        </div>

    `;

}


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


    financeList.innerHTML =
        "";


    if (
        !transactions ||
        transactions.length ===
        0
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


    const eventIds =
        transactions
            .map(
                function(item) {

                    return item.event_id;

                }
            )
            .filter(
                function(id) {

                    return (
                        id !== null &&
                        id !== undefined
                    );

                }
            );


    const eventsMap =
        new Map();


    if (
        eventIds.length > 0
    ) {

        const {
            data: events
        } =
            await supabaseClient
                .from("events")
                .select(
                    "id,nama_event"
                )
                .in(
                    "id",
                    [
                        ...new Set(
                            eventIds
                        )
                    ]
                );


        (
            events || []
        ).forEach(
            function(event) {

                eventsMap.set(
                    event.id,
                    event.nama_event
                );

            }
        );

    }


    transactions.forEach(
        function(transaction) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "finance-card";


            const income =
                transaction.type ===
                "income";


            let category =
                transaction.category;


            if (
                income &&
                transaction.category ===
                "event"
            ) {

                category =
                    "📸 PENDAPATAN EVENT";

            }


            if (
                income &&
                transaction.category ===
                "other"
            ) {

                category =
                    "➕ PEMASUKAN LAINNYA";

            }


            if (
                transaction.category ===
                "cetak"
            ) {

                category =
                    "🖨️ KEBUTUHAN CETAK";

            }


            if (
                transaction.category ===
                "kamera"
            ) {

                category =
                    "📷 KEBUTUHAN KAMERA";

            }


            if (
                transaction.category ===
                "properti"
            ) {

                category =
                    "🎭 KEBUTUHAN PROPERTI";

            }


            if (
                !income &&
                transaction.category ===
                "other"
            ) {

                category =
                    "➕ PENGELUARAN LAINNYA";

            }


            const color =
                income
                    ? "#2877c8"
                    : "#a83d3d";


            const prefix =
                income
                    ? "+"
                    : "-";


            const eventName =
                transaction.event_id !== null
                    ? eventsMap.get(
                        transaction.event_id
                    )
                    : "";


            card.innerHTML = `

                <div class="finance-name">
                    ${category}
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
                    style="color:${color};"
                >
                    ${prefix}
                    ${formatRupiah(
                        transaction.amount
                    )}
                </div>

            `;


            financeList.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   INITIAL LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        const scheduleMonth =
            document.getElementById(
                "schedule-month"
            );


        if (
            scheduleMonth &&
            !scheduleMonth.value
        ) {

            scheduleMonth.value =
                getCurrentMonth();

        }


        await updateDashboard();

        await loadEvents();

        await loadSchedule();

        await loadInventory();

        await loadFinancePage();

    }
);
