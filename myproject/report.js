// report.js

const form      = document.getElementById("reportForm");
const submitBtn = form.querySelector("button[type='submit']");
submitBtn.disabled = true;

// INPUTS
const ownerName         = document.getElementById("ownerName");
const phone             = document.getElementById("phone");
const email             = document.getElementById("email");
const city              = document.getElementById("city");
const breed             = document.getElementById("breed");
const petAge            = document.getElementById("petAge");
const colorMarks        = document.getElementById("colorMarks");
const lastSeen          = document.getElementById("lastSeen");
const dateMissing       = document.getElementById("dateMissing");
const additionalDetails = document.getElementById("additionalDetails");
const petImage          = document.getElementById("petImage");
const confirmInfo       = document.getElementById("confirmInfo");

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

// CHARACTER COUNTER for additionalDetails
(function () {
    const min = 20;
    const counter = document.createElement("div");
    counter.className = "char-counter";
    additionalDetails.after(counter);
    additionalDetails.addEventListener("input", () => {
        const len = additionalDetails.value.trim().length;
        counter.textContent = `${len} / ${min} min`;
        counter.className = "char-counter " + (len >= min ? "good" : len > 5 ? "warn" : "");
    });
})();

// VALIDATIONS
function validateOwnerName() {
    if (!ownerName.value.trim() || !nameRegex.test(ownerName.value)) {
        setInvalid(ownerName); showErr(ownerName, "Only letters and spaces allowed."); return false;
    }
    setValid(ownerName); return true;
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
    if (!city.value.trim()) { setInvalid(city); showErr(city, "City is required."); return false; }
    setValid(city); return true;
}
function validateBreed() {
    if (!breed.value.trim()) { setInvalid(breed); showErr(breed, "Breed is required."); return false; }
    setValid(breed); return true;
}
function validatePetAge() {
    const val = parseInt(petAge.value);
    if (isNaN(val) || val < 0 || val > 30) {
        setInvalid(petAge); showErr(petAge, "Pet age must be 0–30 years."); return false;
    }
    setValid(petAge); return true;
}
function validateColorMarks() {
    if (colorMarks.value.trim().length < 5) {
        setInvalid(colorMarks); showErr(colorMarks, "At least 5 characters required."); return false;
    }
    setValid(colorMarks); return true;
}
function validateLastSeen() {
    if (lastSeen.value.trim().length < 5) {
        setInvalid(lastSeen); showErr(lastSeen, "Please describe the last seen location."); return false;
    }
    setValid(lastSeen); return true;
}
function validateDateMissing() {
    if (!dateMissing.value) { setInvalid(dateMissing); showErr(dateMissing, "Date is required."); return false; }
    if (new Date(dateMissing.value) > new Date()) {
        setInvalid(dateMissing); showErr(dateMissing, "Date cannot be in the future."); return false;
    }
    setValid(dateMissing); return true;
}
function validateAdditionalDetails() {
    if (additionalDetails.value.trim().length < 20) {
        setInvalid(additionalDetails); showErr(additionalDetails, "At least 20 characters required."); return false;
    }
    setValid(additionalDetails); return true;
}
function validatePetImage() {
    const file = petImage.files[0];
    if (!file) { setInvalid(petImage); showErr(petImage, "Please upload a photo of your pet."); return false; }
    const allowed = ["image/jpeg","image/png","image/gif","image/webp"];
    if (!allowed.includes(file.type) || file.size > 5*1024*1024) {
        setInvalid(petImage); showErr(petImage, "JPG, PNG, GIF or WEBP only, max 5 MB."); return false;
    }
    setValid(petImage); return true;
}
function validateConfirmInfo() { return confirmInfo.checked; }

function checkForm() {
    const valid =
        validateOwnerName() && validatePhone() && validateEmail() && validateCity() &&
        validateBreed() && validatePetAge() && validateColorMarks() && validateLastSeen() &&
        validateDateMissing() && validateAdditionalDetails() && validatePetImage() && validateConfirmInfo();
    submitBtn.disabled = !valid;
}

form.addEventListener("input",  checkForm);
form.addEventListener("change", checkForm);

form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (submitBtn.disabled) return;
    showToast("🐾 Missing pet report submitted! Our team will begin searching immediately.", "success");
    form.reset();
    submitBtn.disabled = true;
    document.querySelectorAll("input, textarea, select").forEach(el => { el.style.border = ""; });
    document.querySelectorAll(".field-error").forEach(el => el.classList.remove("visible"));
    document.querySelectorAll(".char-counter").forEach(el => { el.textContent = ""; el.className = "char-counter"; });
});
