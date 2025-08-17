(function() {
	"use strict";

	document.addEventListener("DOMContentLoaded", function() {
		const role = document.body.dataset.role === "driver" ? "driver" : "passenger";

		const tabLogin = document.getElementById("tab-login");
		const tabSignup = document.getElementById("tab-signup");
		const viewLogin = document.getElementById("view-login");
		const viewSignup = document.getElementById("view-signup");

		function setActive(tab) {
			if (tab === "login") {
				tabLogin.classList.add("active");
				tabSignup.classList.remove("active");
				viewLogin.style.display = "block";
				viewSignup.style.display = "none";
			} else {
				tabSignup.classList.add("active");
				tabLogin.classList.remove("active");
				viewSignup.style.display = "block";
				viewLogin.style.display = "none";
			}
		}

		// Auto-redirect if already logged in on this role
		const existingSession = window.RideApp.getSession();
		if (existingSession && existingSession.role === role) {
			window.location.href = role === "passenger" ? "passenger.html" : "driver.html";
			return;
		}

		// Default to login
		setActive("login");
		tabLogin.addEventListener("click", function() { setActive("login"); });
		tabSignup.addEventListener("click", function() { setActive("signup"); });

		// Forms
		const loginForm = document.getElementById("login-form");
		const signupForm = document.getElementById("signup-form");

		loginForm.addEventListener("submit", function(e) {
			e.preventDefault();
			const email = loginForm.querySelector("input[name=email]").value.trim().toLowerCase();
			const password = loginForm.querySelector("input[name=password]").value;

			if (!email || !password) { alert("فضلاً أدخل البريد وكلمة المرور"); return; }
			const roleUsers = window.RideApp.getUsersByRole(role);
			const user = roleUsers[email];
			if (!user || user.password !== password) {
				alert("بيانات الدخول غير صحيحة");
				return;
			}
			window.RideApp.setSession({ role, email });
			window.location.href = role === "passenger" ? "passenger.html" : "driver.html";
		});

		signupForm.addEventListener("submit", function(e) {
			e.preventDefault();
			const fullName = signupForm.querySelector("input[name=fullName]").value.trim();
			const email = signupForm.querySelector("input[name=email]").value.trim().toLowerCase();
			const phone = signupForm.querySelector("input[name=phone]").value.trim();
			const password = signupForm.querySelector("input[name=password]").value;
			const confirmPassword = signupForm.querySelector("input[name=confirmPassword]").value;

			if (!fullName || !email || !phone || !password) { alert("فضلاً أكمل جميع الحقول"); return; }
			if (password !== confirmPassword) { alert("كلمتا المرور غير متطابقتين"); return; }
			const roleUsers = window.RideApp.getUsersByRole(role);
			if (roleUsers[email]) { alert("البريد مستخدم مسبقاً"); return; }

			roleUsers[email] = { fullName, email, phone, password, createdAt: Date.now() };
			window.RideApp.saveUsersByRole(role, roleUsers);

			window.RideApp.setSession({ role, email });
			window.location.href = role === "passenger" ? "passenger.html" : "driver.html";
		});
	});
})();