// volunteer.js

const form      = document.getElementById("volunteerForm");
const submitBtn = form.querySelector("button[type='submit']");
submitBtn.disabled = true;

// INPUTS
const fullName     = document.getElementById("fullName");
const phone        = document.getElementById("phone");
const email        = document.getElementById("email");
const city         = document.getElementById("city");
const dob          = document.getElementById("dob");
const occupation   = document.getElementById("occupation");
const role         = document.getElementById("role");
const availability = document.getElementById("availability");
const whyVolunteer = document.getElementById("whyVolunteer");
const idProof      = document.getElementById("idProof");
const terms        = document.getElementById("terms");

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

// CHARACTER COUNTER for whyVolunteer
(function () {
    const min = 30;
    const counter = document.createElement("div");
    counter.className = "char-counter";
    whyVolunteer.after(counter);
    whyVolunteer.addEventListener("input", () => {
        const len = whyVolunteer.value.trim().length;
        counter.textContent = `${len} / ${min} min`;
        counter.className = "char-counter " + (len >= min ? "good" : len > 10 ? "warn" : "");
    });
})();

// VALIDATIONS
function validateName() {
    if (!fullName.value.trim() || !nameRegex.test(fullName.value)) {
        setInvalid(fullName); showErr(fullName, "Only letters and spaces allowed."); return false;
    }
    setValid(fullName); return true;
}
function validatePhone() {
    if (!phoneRegex.test(phone.value)) {
        setInvalid(phone); showErr(phone, "Enter a valid 10-digit Indian mobile number."); return false;
    }
    setValid(phone); return true;
}
function validateEmail() {
    if (!emailRegex.test(email.value)) {
        setInvalid(email); showErr(email, "Enter a valid email address."); return false;
    }
    setValid(email); return true;
}
function validateCity() {
    if (!city.value.trim()) {
        setInvalid(city); showErr(city, "City is required."); return false;
    }
    setValid(city); return true;
}
function validateDOB() {
    if (!dob.value) { setInvalid(dob); showErr(dob, "Date of birth is required."); return false; }
    const birth = new Date(dob.value), today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 18 || age > 65) { setInvalid(dob); showErr(dob, "Volunteer must be 18–65 years old."); return false; }
    setValid(dob); return true;
}
function validateOccupation() {
    if (!occupation.value.trim()) {
        setInvalid(occupation); showErr(occupation, "Occupation is required."); return false;
    }
    setValid(occupation); return true;
}
function validateRole()         { return role.value !== ""; }
function validateAvailability() { return availability.value !== ""; }
function validateWhyVolunteer() {
    if (whyVolunteer.value.trim().length < 30) {
        setInvalid(whyVolunteer); showErr(whyVolunteer, "Please write at least 30 characters."); return false;
    }
    setValid(whyVolunteer); return true;
}
function validateIDProof() {
    const file = idProof.files[0];
    if (!file) { setInvalid(idProof); showErr(idProof, "Please upload your ID proof."); return false; }
    const allowed = ["image/jpeg","image/png","application/pdf"];
    if (!allowed.includes(file.type) || file.size > 5*1024*1024) {
        setInvalid(idProof); showErr(idProof, "JPG, PNG or PDF only, max 5 MB."); return false;
    }
    setValid(idProof); return true;
}
function validateTerms() { return terms.checked; }

function checkForm() {
    const valid =
        validateName() && validatePhone() && validateEmail() && validateCity() &&
        validateDOB() && validateOccupation() && validateRole() && validateAvailability() &&
        validateWhyVolunteer() && validateIDProof() && validateTerms();
    submitBtn.disabled = !valid;
}

form.addEventListener("input",  checkForm);
form.addEventListener("change", checkForm);

form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (submitBtn.disabled) return;
    showToast("Volunteer application submitted successfully!", "success");
    form.reset();
    submitBtn.disabled = true;
    document.querySelectorAll("input, textarea, select").forEach(el => { el.style.border = ""; });
    document.querySelectorAll(".field-error").forEach(el => el.classList.remove("visible"));
    document.querySelectorAll(".char-counter").forEach(el => { el.textContent = ""; el.className = "char-counter"; });
});
