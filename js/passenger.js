(function() {
	"use strict";

	document.addEventListener("DOMContentLoaded", function() {
		const session = window.RideApp.getSession();
		if (!session || session.role !== "passenger") {
			window.location.href = "passenger-auth.html";
			return;
		}

		document.getElementById("logout-btn").addEventListener("click", function() {
			window.RideApp.logoutAndRedirect("passenger-auth.html");
		});

		const trips = window.RideApp.ensureDefaultTrips();
		renderTrips(trips);
	});

	function renderTrips(trips) {
		const list = document.getElementById("trips-list");
		list.innerHTML = "";
		if (!trips || trips.length === 0) {
			list.innerHTML = '<div class="card">لا توجد رحلات الآن</div>';
			return;
		}
		for (const trip of trips) {
			const card = document.createElement("div");
			card.className = "card trip-item";
			card.innerHTML = `
				<h3>من ${escapeHtml(trip.from)} إلى ${escapeHtml(trip.to)}</h3>
				<div class="trip-meta">التاريخ: ${escapeHtml(trip.date)} — الوقت: ${escapeHtml(trip.time)}</div>
				<div class="trip-meta">السعر: ${Number(trip.price).toFixed(0)} ريال — المقاعد المتاحة: ${escapeHtml(String(trip.seats))}</div>
				<div class="trip-meta">السائق: ${escapeHtml(trip.driver || "-")}</div>
				<div style="display:flex; gap:8px; margin-top: 6px;">
					<button class="button" data-trip-id="${trip.id}">احجز</button>
				</div>
			`;
			list.appendChild(card);
		}
		list.querySelectorAll("button[data-trip-id]").forEach(function(btn) {
			btn.addEventListener("click", function() {
				const tripId = btn.getAttribute("data-trip-id");
				const session = window.RideApp.getSession();
				if (!session) { alert("الرجاء تسجيل الدخول"); return; }
				window.RideApp.addBookingForUser(session.email, tripId);
				alert("تم الحجز بنجاح");
			});
		});
	}

	function escapeHtml(str) {
		return String(str)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/\"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}
})();