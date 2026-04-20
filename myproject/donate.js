const form = document.getElementById("donateForm");
const submitBtn = form.querySelector("button");

submitBtn.disabled = true;

// INPUTS
const fname = document.getElementById("fname");
const lname = document.getElementById("lname");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const address = document.getElementById("address");
const city = document.getElementById("city");
const state = document.getElementById("state");
const zip = document.getElementById("zip");

const payment = document.getElementById("payment");
const card = document.getElementById("card");
const expiry = document.getElementById("expiry");
const cvv = document.getElementById("cvv");

const customAmount = document.getElementById("customAmount");
const terms = document.getElementById("terms");

// REGEX
const nameRegex = /^[A-Za-z ]+$/;
const emailRegex = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
const phoneRegex = /^[6-9]\d{9}$/;

// STYLE
function setValid(el) { el.style.border = "2px solid #00ff94"; }
function setInvalid(el) { el.style.border = "2px solid red"; }

// VALIDATIONS
function validateName(el) {
    if (!el.value.trim() || !nameRegex.test(el.value)) {
        setInvalid(el); return false;
    }
    setValid(el); return true;
}

function validateEmail() {
    if (!emailRegex.test(email.value)) {
        setInvalid(email); return false;
    }
    setValid(email); return true;
}

function validatePhone() {
    if (!phoneRegex.test(phone.value)) {
        setInvalid(phone); return false;
    }
    setValid(phone); return true;
}

function validateAddress() {
    if (address.value.trim().length < 10) {
        setInvalid(address); return false;
    }
    setValid(address); return true;
}

function validateSimple(el) {
    if (!el.value.trim()) {
        setInvalid(el); return false;
    }
    setValid(el); return true;
}

function validateZip() {
    if (!/^\d{5,6}$/.test(zip.value)) {
        setInvalid(zip); return false;
    }
    setValid(zip); return true;
}

function validatePayment() {
    return payment.value !== "";
}

function validateCard() {
    if (!/^\d{16}$/.test(card.value)) {
        setInvalid(card); return false;
    }
    setValid(card); return true;
}

function validateExpiry() {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.value)) {
        setInvalid(expiry); return false;
    }
    setValid(expiry); return true;
}

function validateCVV() {
    if (!/^\d{3}$/.test(cvv.value)) {
        setInvalid(cvv); return false;
    }
    setValid(cvv); return true;
}

function validateAmount() {
    let radio = document.querySelector('input[name="amount"]:checked');
    return radio || customAmount.value.trim();
}

function validateTerms() {
    return terms.checked;
}

// MAIN CHECK
function checkForm() {
    let valid =
        validateName(fname) &&
        validateName(lname) &&
        validateEmail() &&
        validatePhone() &&
        validateAddress() &&
        validateSimple(city) &&
        validateSimple(state) &&
        validateZip() &&
        validatePayment() &&
        validateCard() &&
        validateExpiry() &&
        validateCVV() &&
        validateAmount() &&
        validateTerms();

    submitBtn.disabled = !valid;
}

// EVENTS
form.addEventListener("input", checkForm);

// SUBMIT
form.addEventListener("submit", function(e) {
    e.preventDefault();

    if (submitBtn.disabled) return;

    showToast("💚 Donation successful! Thank you for your support.", "success");

    form.reset();
    submitBtn.disabled = true;

    document.querySelectorAll("input, textarea, select").forEach(el => {
        el.style.border = "";
    });
});