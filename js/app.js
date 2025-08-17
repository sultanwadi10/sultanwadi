(function() {
	"use strict";

	const USERS_KEY = "ride_app_users"; // { passenger: { email: {...} }, driver: { email: {...} } }
	const SESSION_KEY = "ride_app_session"; // { role, email }
	const AVAILABLE_TRIPS_KEY = "ride_app_available_trips"; // [trip, ...]
	const DRIVER_TRIPS_KEY = "ride_app_driver_trips"; // { email: [trip, ...] }
	const BOOKINGS_KEY = "ride_app_bookings"; // { email: [tripId, ...] }

	function readJson(key, fallback) {
		try {
			const raw = localStorage.getItem(key);
			return raw ? JSON.parse(raw) : fallback;
		} catch (err) {
			console.error("Failed to parse localStorage for", key, err);
			return fallback;
		}
	}

	function writeJson(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}

	function ensureUsersShape() {
		const users = readJson(USERS_KEY, null);
		if (!users || typeof users !== "object") {
			writeJson(USERS_KEY, { passenger: {}, driver: {} });
			return { passenger: {}, driver: {} };
		}
		if (!users.passenger) users.passenger = {};
		if (!users.driver) users.driver = {};
		writeJson(USERS_KEY, users);
		return users;
	}

	function getUsersByRole(role) {
		const users = ensureUsersShape();
		return users[role] || {};
	}

	function saveUsersByRole(role, roleUsers) {
		const users = ensureUsersShape();
		users[role] = roleUsers;
		writeJson(USERS_KEY, users);
	}

	function setSession(session) {
		writeJson(SESSION_KEY, session);
	}

	function getSession() {
		return readJson(SESSION_KEY, null);
	}

	function clearSession() {
		localStorage.removeItem(SESSION_KEY);
	}

	function getDriverTripsMap() {
		return readJson(DRIVER_TRIPS_KEY, {});
	}

	function saveDriverTripsMap(map) {
		writeJson(DRIVER_TRIPS_KEY, map);
	}

	function getAvailableTrips() {
		return readJson(AVAILABLE_TRIPS_KEY, []);
	}

	function saveAvailableTrips(trips) {
		writeJson(AVAILABLE_TRIPS_KEY, trips);
	}

	function ensureDefaultTrips() {
		const current = getAvailableTrips();
		if (Array.isArray(current) && current.length > 0) return current;
		const defaults = [
			{ id: cryptoRandomId(), from: "الرياض", to: "جدة", date: "2025-08-20", time: "09:00", price: 150, seats: 3, driver: "مثال" },
			{ id: cryptoRandomId(), from: "جدة", to: "مكة", date: "2025-08-21", time: "15:30", price: 60, seats: 2, driver: "مثال" },
			{ id: cryptoRandomId(), from: "الدمام", to: "الخبر", date: "2025-08-22", time: "18:00", price: 25, seats: 4, driver: "مثال" }
		];
		saveAvailableTrips(defaults);
		return defaults;
	}

	function cryptoRandomId() {
		try {
			return (self.crypto || window.crypto).randomUUID();
		} catch (_) {
			return "id-" + Math.random().toString(36).slice(2);
		}
	}

	function getBookingsMap() {
		return readJson(BOOKINGS_KEY, {});
	}
	function saveBookingsMap(map) { writeJson(BOOKINGS_KEY, map); }

	function addBookingForUser(email, tripId) {
		const map = getBookingsMap();
		if (!map[email]) map[email] = [];
		if (!map[email].includes(tripId)) map[email].push(tripId);
		saveBookingsMap(map);
	}

	function logoutAndRedirect(toPath) {
		clearSession();
		window.location.href = toPath;
	}

	// Expose globally
	window.RideApp = {
		getUsersByRole,
		saveUsersByRole,
		setSession,
		getSession,
		clearSession,
		getDriverTripsMap,
		saveDriverTripsMap,
		getAvailableTrips,
		saveAvailableTrips,
		ensureDefaultTrips,
		cryptoRandomId,
		addBookingForUser,
		logoutAndRedirect
	};
})();