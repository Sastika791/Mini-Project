// GET ELEMENTS
const form = document.getElementById("contactForm");
const submitBtn = document.querySelector("button[type='submit']");

// INPUTS
const name = document.getElementById("name");
const email = document.getElementById("email");
const password = document.getElementById("password");
const phone = document.getElementById("phone");
const age = document.getElementById("age");
const dob = document.getElementById("dob");
const address = document.getElementById("address");
const feedback = document.getElementById("feedback");
const subject = document.getElementById("subject");
const fileInput = document.getElementById("file");

// DISABLE BUTTON INITIALLY
submitBtn.disabled = true;

// REGEX
const nameRegex = /^[A-Za-z ]+$/;
const emailRegex = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

// STYLE
function setValid(input) {
    input.style.border = "2px solid #00ff94";
}

function setInvalid(input) {
    input.style.border = "2px solid red";
}

// VALIDATIONS

function validateName() {
    if (!name.value.trim() || !nameRegex.test(name.value)) {
        setInvalid(name);
        return false;
    }
    setValid(name);
    return true;
}

function validateEmail() {
    if (!emailRegex.test(email.value)) {
        setInvalid(email);
        return false;
    }
    setValid(email);
    return true;
}

function validatePassword() {
    if (!passwordRegex.test(password.value)) {
        setInvalid(password);
        return false;
    }
    setValid(password);
    return true;
}

function validatePhone() {
    if (!phoneRegex.test(phone.value)) {
        setInvalid(phone);
        return false;
    }
    setValid(phone);
    return true;
}

function validateAge() {
    let ageVal = parseInt(age.value);

    if (isNaN(ageVal) || ageVal < 18 || ageVal > 89) {
        setInvalid(age);
        return false;
    }

    setValid(age);
    return true;
}

function validateDOB() {
    if (!dob.value) {
        setInvalid(dob);
        return false;
    }

    let today = new Date();
    let birthDate = new Date(dob.value);

    let calculatedAge = today.getFullYear() - birthDate.getFullYear();

    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
    }

    if (calculatedAge < 18 || calculatedAge > 89) {
        setInvalid(dob);
        return false;
    }

    if (parseInt(age.value) !== calculatedAge) {
        setInvalid(dob);
        setInvalid(age);
        return false;
    }

    setValid(dob);
    setValid(age);
    return true;
}

function validateAddress() {
    if (address.value.trim().length < 10) {
        setInvalid(address);
        return false;
    }
    setValid(address);
    return true;
}

function validateFeedback() {
    if (feedback.value.trim().length < 20) {
        setInvalid(feedback);
        return false;
    }
    setValid(feedback);
    return true;
}

function validateDropdowns() {
    return subject.value !== "";
}

function validateRadio() {
    return document.querySelector('input[name="gender"]:checked');
}

function validateCheckbox() {
    return document.querySelectorAll('input[name="interest"]:checked').length > 0;
}

function validateFile() {
    let file = fileInput.files[0];
    if (!file) return false;

    let allowed = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
        setInvalid(fileInput);
        return false;
    }

    setValid(fileInput);
    return true;
}

// PASSWORD STRENGTH
password.addEventListener("input", () => {
    let val = password.value;
    let msg = document.getElementById("strengthMsg");

    if (val.length < 6) msg.innerText = "Weak";
    else if (passwordRegex.test(val)) msg.innerText = "Strong";
    else msg.innerText = "Medium";
});

// CHECK FORM
function checkForm() {
    let valid =
        validateName() &&
        validateEmail() &&
        validatePassword() &&
        validatePhone() &&
        validateAge() &&
        validateDOB() &&
        validateAddress() &&
        validateFeedback() &&
        validateDropdowns() &&
        validateRadio() &&
        validateCheckbox() &&
        validateFile();

    submitBtn.disabled = !valid;
}

// RUN VALIDATION ON INPUT
form.addEventListener("input", checkForm);

// SUBMIT
form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (submitBtn.disabled) return;

    showToast("Message sent successfully!", "success");

    form.reset();
    submitBtn.disabled = true;

    document.querySelectorAll("input, textarea, select").forEach(el => {
        el.style.border = "";
    });

    document.getElementById("strengthMsg").innerText = "";
});