// join.js

const form      = document.getElementById("joinForm");
const submitBtn = form.querySelector("button[type='submit']");
submitBtn.disabled = true;

// INPUTS
const fullName = document.getElementById("fullName");
const email    = document.getElementById("email");
const phone    = document.getElementById("phone");
const plan     = document.getElementById("plan");
const card     = document.getElementById("card");
const expiry   = document.getElementById("expiry");
const cvv      = document.getElementById("cvv");

// REGEX
const nameRegex  = /^[A-Za-z ]+$/;
const emailRegex = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
const phoneRegex = /^[6-9]\d{9}$/;

// STYLE HELPERS
function setValid(el)   { el.style.border = "2px solid #00ff94"; hideErr(el); }
function setInvalid(el) { el.style.border = "2px solid red"; }

function showErr(el, msg) {
    let err = el.parentElement.querySelector(".field-error");
    if (!err) { err = document.createElement("div"); err.className = "field-error"; el.after(err); }
    err.textContent = msg;
    err.classList.add("visible");
}
function hideErr(el) {
    const err = el.parentElement.querySelector(".field-error");
    if (err) err.classList.remove("visible");
}

// VALIDATIONS
function validateName() {
    if (!fullName.value.trim() || !nameRegex.test(fullName.value)) {
        setInvalid(fullName); showErr(fullName, "Only letters and spaces allowed."); return false;
    }
    setValid(fullName); return true;
}
function validateEmail() {
    if (!emailRegex.test(email.value)) {
        setInvalid(email); showErr(email, "Enter a valid email address."); return false;
    }
    setValid(email); return true;
}
function validatePhone() {
    if (!phoneRegex.test(phone.value)) {
        setInvalid(phone); showErr(phone, "Enter a valid 10-digit Indian mobile number."); return false;
    }
    setValid(phone); return true;
}
function validatePlan() { return plan.value !== ""; }
function validateCard() {
    const raw = card.value.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(raw)) { setInvalid(card); showErr(card, "Card must be exactly 16 digits."); return false; }
    setValid(card); return true;
}
function validateExpiry() {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.value)) {
        setInvalid(expiry); showErr(expiry, "Use MM/YY format."); return false;
    }
    const [m, y] = expiry.value.split("/");
    const expDate = new Date(2000 + parseInt(y), parseInt(m) - 1, 1);
    const now     = new Date(); now.setDate(1); now.setHours(0,0,0,0);
    if (expDate < now) { setInvalid(expiry); showErr(expiry, "Card has expired."); return false; }
    setValid(expiry); return true;
}
function validateCVV() {
    if (!/^\d{3}$/.test(cvv.value)) { setInvalid(cvv); showErr(cvv, "CVV must be 3 digits."); return false; }
    setValid(cvv); return true;
}

function checkForm() {
    const valid =
        validateName() && validateEmail() && validatePhone() && validatePlan() &&
        validateCard() && validateExpiry() && validateCVV();
    submitBtn.disabled = !valid;
}

// AUTO-FORMAT CARD NUMBER with spaces
card.addEventListener("input", function () {
    const raw = card.value.replace(/\D/g, "").substring(0, 16);
    card.value = raw.match(/.{1,4}/g)?.join(" ") || raw;
});

// AUTO-FORMAT EXPIRY with slash
expiry.addEventListener("input", function () {
    const raw = expiry.value.replace(/\D/g, "").substring(0, 4);
    expiry.value = raw.length >= 3 ? raw.substring(0,2) + "/" + raw.substring(2) : raw;
});

form.addEventListener("input",  checkForm);
form.addEventListener("change", checkForm);

form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (submitBtn.disabled) return;
    const planText = plan.options[plan.selectedIndex].text;
    showToast(`🎉 Welcome to NeoPaws! Your ${planText} membership is now active.`, "success");
    form.reset();
    submitBtn.disabled = true;
    document.querySelectorAll("input, textarea, select").forEach(el => { el.style.border = ""; });
    document.querySelectorAll(".field-error").forEach(el => el.classList.remove("visible"));
});
