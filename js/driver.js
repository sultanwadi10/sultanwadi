(function() {
	"use strict";

	document.addEventListener("DOMContentLoaded", function() {
		const session = window.RideApp.getSession();
		if (!session || session.role !== "driver") {
			window.location.href = "driver-auth.html";
			return;
		}

		document.getElementById("logout-btn").addEventListener("click", function() {
			window.RideApp.logoutAndRedirect("driver-auth.html");
		});

		const form = document.getElementById("create-trip-form");
		form.addEventListener("submit", function(e) {
			e.preventDefault();
			const from = form.querySelector('input[name="from"]').value.trim();
			const to = form.querySelector('input[name="to"]').value.trim();
			const date = form.querySelector('input[name="date"]').value;
			const time = form.querySelector('input[name="time"]').value;
			const price = Number(form.querySelector('input[name="price"]').value);
			const seats = Number(form.querySelector('input[name="seats"]').value);

			if (!from || !to || !date || !time || !(price >= 0) || !(seats >= 1)) {
				alert("تحقق من الحقول");
				return;
			}

			const users = window.RideApp.getUsersByRole("driver");
			const me = users[session.email];
			const driverName = me && me.fullName ? me.fullName : session.email;

			const newTrip = {
				id: window.RideApp.cryptoRandomId(),
				from, to, date, time,
				price: Math.round(price),
				seats: Math.round(seats),
				driver: driverName
			};

			// Save to available trips
			const allTrips = window.RideApp.getAvailableTrips();
			allTrips.push(newTrip);
			window.RideApp.saveAvailableTrips(allTrips);

			// Save under driver
			const driverTripsMap = window.RideApp.getDriverTripsMap();
			if (!driverTripsMap[session.email]) driverTripsMap[session.email] = [];
			driverTripsMap[session.email].push(newTrip);
			window.RideApp.saveDriverTripsMap(driverTripsMap);

			form.reset();
			renderMyTrips(driverTripsMap[session.email]);
			alert("تم إنشاء الرحلة");
		});

		// Initial render
		const driverTripsMap = window.RideApp.getDriverTripsMap();
		renderMyTrips(driverTripsMap[session.email] || []);
	});

	function renderMyTrips(trips) {
		const list = document.getElementById("my-trips-list");
		list.innerHTML = "";
		if (!trips || trips.length === 0) {
			list.innerHTML = '<div class="card">لا توجد رحلات بعد</div>';
			return;
		}
		for (const trip of trips) {
			const card = document.createElement("div");
			card.className = "card trip-item";
			card.innerHTML = `
				<h3>من ${escapeHtml(trip.from)} إلى ${escapeHtml(trip.to)}</h3>
				<div class="trip-meta">${escapeHtml(trip.date)} — ${escapeHtml(trip.time)}</div>
				<div class="trip-meta">${Number(trip.price).toFixed(0)} ريال — مقاعد: ${escapeHtml(String(trip.seats))}</div>
			`;
			list.appendChild(card);
		}
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