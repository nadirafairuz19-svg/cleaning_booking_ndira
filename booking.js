const API_BASE = "http://localhost:3000/api"; 
// Change this if your backend uses another port, for example:
// http://localhost:5000/api
// http://localhost:8080/api

document.addEventListener("DOMContentLoaded", () => {
    loadServices();
    setupLiveSummary();
    setMinDate();
});

function setMinDate() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("booking_date").setAttribute("min", today);
}

function loadServices() {
    fetch(`${API_BASE}/services`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load services");
            }
            return response.json();
        })
        .then(data => {
            const services = Array.isArray(data) ? data : data.data || [];
            renderServiceCards(services);
        })
        .catch(error => {
            document.getElementById("serviceCards").innerHTML =
                `<p style="color:red;">Unable to load services.</p>`;
            console.error(error);
        });
}

function renderServiceCards(services) {
    const container = document.getElementById("serviceCards");
    container.innerHTML = "";

    if (!services.length) {
        container.innerHTML = `<p>No services available.</p>`;
        return;
    }

    services.forEach(service => {
        const card = document.createElement("div");
        card.className = "service-card";
        card.innerHTML = `
            <div style="font-size: 24px;">🧼</div>
            <h3>${service.name}</h3>
        `;

        card.addEventListener("click", () => {
            document.querySelectorAll(".service-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");

            document.getElementById("service_id").value = service.id || service.service_id;
            document.getElementById("service_name").value = service.name || service.service_name || "Service";

            updateSummary();
        });

        container.appendChild(card);
    });
}

function setupLiveSummary() {
    const fields = ["booking_date", "booking_time", "phone", "address", "notes"];
    fields.forEach(id => {
        document.getElementById(id).addEventListener("input", updateSummary);
    });
}

function updateSummary() {
    document.getElementById("summaryService").textContent =
        document.getElementById("service_name").value || "-";

    document.getElementById("summaryDate").textContent =
        document.getElementById("booking_date").value || "-";

    document.getElementById("summaryTime").textContent =
        document.getElementById("booking_time").value || "-";

    document.getElementById("summaryPhone").textContent =
        document.getElementById("phone").value || "-";

    document.getElementById("summaryAddress").textContent =
        document.getElementById("address").value || "-";

    document.getElementById("summaryNotes").textContent =
        document.getElementById("notes").value || "-";
}

document.getElementById("bookingForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const service_id = document.getElementById("service_id").value;
    const booking_date = document.getElementById("booking_date").value;
    const booking_time = document.getElementById("booking_time").value;
    const address = document.getElementById("address").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const notes = document.getElementById("notes").value.trim();
    const message = document.getElementById("message");

    message.textContent = "";
    message.className = "message";

    if (!service_id || !booking_date || !booking_time || !address || !phone) {
        message.textContent = "Please fill in all required fields.";
        message.classList.add("error");
        return;
    }

    const token = localStorage.getItem("token");

    const bookingData = {
        service_id: service_id,
        booking_date: booking_date,
        booking_time: booking_time,
        address: address,
        phone: phone,
        notes: notes
    };

    fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(bookingData)
    })
        .then(async response => {
            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.message || "Booking failed");
            }

            message.textContent = "Booking submitted successfully!";
            message.classList.add("success");

            document.getElementById("bookingForm").reset();
            document.getElementById("service_id").value = "";
            document.getElementById("service_name").value = "";
            document.querySelectorAll(".service-card").forEach(c => c.classList.remove("selected"));
            updateSummary();
        })
        .catch(error => {
            message.textContent = error.message || "Something went wrong.";
            message.classList.add("error");
            console.error(error);
        });
});

function resetForm() {
    document.getElementById("bookingForm").reset();
    document.getElementById("service_id").value = "";
    document.getElementById("service_name").value = "";
    document.querySelectorAll(".service-card").forEach(c => c.classList.remove("selected"));
    document.getElementById("message").textContent = "";
    document.getElementById("message").className = "message";
    updateSummary();
}