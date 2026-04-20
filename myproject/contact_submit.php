<?php
// contact_submit.php — handles Contact form submission

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
    exit;
}

function sanitize($val) {
    return htmlspecialchars(strip_tags(trim($val)));
}

$errors = [];

$name     = sanitize($_POST["name"]     ?? "");
$email    = sanitize($_POST["email"]    ?? "");
$password = $_POST["password"]          ?? "";   // not stored, only validated
$phone    = sanitize($_POST["phone"]    ?? "");
$age      = sanitize($_POST["age"]      ?? "");
$dob      = sanitize($_POST["dob"]      ?? "");
$subject  = sanitize($_POST["subject"]  ?? "");
$gender   = sanitize($_POST["gender"]   ?? "");
$address  = sanitize($_POST["address"]  ?? "");
$feedback = sanitize($_POST["feedback"] ?? "");

// Name
if (empty($name) || !preg_match('/^[A-Za-z ]+$/', $name)) {
    $errors[] = "Full name is invalid.";
}

// Email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Email address is invalid.";
}

// Password (strong password: uppercase, lowercase, digit, special char, min 8)
if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/', $password)) {
    $errors[] = "Password does not meet strength requirements.";
}

// Phone
if (!preg_match('/^[6-9]\d{9}$/', $phone)) {
    $errors[] = "Phone must be a valid 10-digit Indian mobile number.";
}

// Age
$ageInt = (int) $age;
if ($ageInt < 18 || $ageInt > 89) {
    $errors[] = "Age must be between 18 and 89.";
}

// DOB matches age
if (empty($dob)) {
    $errors[] = "Date of birth is required.";
} else {
    $birthDate = new DateTime($dob);
    $today     = new DateTime();
    $calcAge   = (int) $today->diff($birthDate)->y;
    if ($calcAge < 18 || $calcAge > 89 || $calcAge !== $ageInt) {
        $errors[] = "Date of birth does not match the entered age.";
    }
}

// Subject
if (empty($subject)) {
    $errors[] = "Subject is required.";
}

// Gender
if (!in_array($gender, ["Male", "Female"])) {
    $errors[] = "Gender selection is required.";
}

// Interests (at least one checkbox)
$interests = $_POST["interest"] ?? [];
if (empty($interests)) {
    $errors[] = "Please select at least one interest.";
}

// Address (min 10 chars)
if (strlen($address) < 10) {
    $errors[] = "Address must be at least 10 characters.";
}

// Feedback (min 20 chars)
if (strlen($feedback) < 20) {
    $errors[] = "Feedback must be at least 20 characters.";
}

// File upload
$uploadDir    = __DIR__ . "/uploads/contact_files/";
$uploadedFile = "";

if (!empty($_FILES["file"]["name"])) {
    $allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    $maxSize = 5 * 1024 * 1024;

    if (!in_array($_FILES["file"]["type"], $allowedTypes)) {
        $errors[] = "File must be a PDF or Word document.";
    } elseif ($_FILES["file"]["size"] > $maxSize) {
        $errors[] = "File must be smaller than 5 MB.";
    } else {
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
        $safeName     = time() . "_" . preg_replace('/[^a-zA-Z0-9._-]/', '_', basename($_FILES["file"]["name"]));
        $uploadedFile = $uploadDir . $safeName;
        if (!move_uploaded_file($_FILES["file"]["tmp_name"], $uploadedFile)) {
            $errors[] = "Failed to save the uploaded file.";
        }
    }
} else {
    $errors[] = "A file upload is required.";
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(["status" => "error", "errors" => $errors]);
    exit;
}

// ── Store submission ──────────────────────────────────────────────────────────
$logFile = __DIR__ . "/data/contact_messages.csv";
if (!is_dir(__DIR__ . "/data")) mkdir(__DIR__ . "/data", 0755, true);

$row = [
    date("Y-m-d H:i:s"),
    $name, $email, $phone, $ageInt, $dob,
    $subject, $gender, implode("|", $interests),
    $address, $feedback,
    basename($uploadedFile)
];

$fp = fopen($logFile, "a");
if ($fp) { fputcsv($fp, $row); fclose($fp); }

// ── Email notification ────────────────────────────────────────────────────────
$to      = $email;
$subject_mail = "NeoPaws – We received your message!";
$body    = "Dear $name,\n\nThank you for contacting NeoPaws. "
         . "We have received your message and will respond within 2 business days.\n\n"
         . "Warm regards,\nThe NeoPaws Team";
$headers = "From: no-reply@neopaws.org\r\nContent-Type: text/plain; charset=UTF-8";
@mail($to, $subject_mail, $body, $headers);

echo json_encode([
    "status"  => "success",
    "message" => "Your message has been sent successfully!"
]);
?>
