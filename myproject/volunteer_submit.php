<?php
// volunteer_submit.php — handles Volunteer Application form submission

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
    exit;
}

// ── Sanitize helpers ──────────────────────────────────────────────────────────
function sanitize($val) {
    return htmlspecialchars(strip_tags(trim($val)));
}

// ── Collect & validate inputs ─────────────────────────────────────────────────
$errors = [];

$fullName    = sanitize($_POST["fullName"]    ?? "");
$phone       = sanitize($_POST["phone"]       ?? "");
$email       = sanitize($_POST["email"]       ?? "");
$city        = sanitize($_POST["city"]        ?? "");
$dob         = sanitize($_POST["dob"]         ?? "");
$occupation  = sanitize($_POST["occupation"]  ?? "");
$role        = sanitize($_POST["role"]        ?? "");
$availability= sanitize($_POST["availability"]?? "");
$whyVolunteer= sanitize($_POST["whyVolunteer"]?? "");
$terms       = isset($_POST["terms"]);

// Name
if (empty($fullName) || !preg_match('/^[A-Za-z ]+$/', $fullName)) {
    $errors[] = "Full name is invalid.";
}

// Phone (Indian mobile: starts 6-9, 10 digits)
if (!preg_match('/^[6-9]\d{9}$/', $phone)) {
    $errors[] = "Phone number must be a valid 10-digit Indian mobile number.";
}

// Email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Email address is invalid.";
}

// City
if (empty($city)) {
    $errors[] = "City is required.";
}

// Date of birth — must be 18–65
if (empty($dob)) {
    $errors[] = "Date of birth is required.";
} else {
    $birthDate = new DateTime($dob);
    $today     = new DateTime();
    $age       = $today->diff($birthDate)->y;
    if ($age < 18 || $age > 65) {
        $errors[] = "Volunteer must be between 18 and 65 years old.";
    }
}

// Occupation
if (empty($occupation)) {
    $errors[] = "Occupation is required.";
}

// Role & availability
if (empty($role))         { $errors[] = "Preferred role is required."; }
if (empty($availability)) { $errors[] = "Availability is required."; }

// Why volunteer (min 30 chars)
if (strlen($whyVolunteer) < 30) {
    $errors[] = "Please write at least 30 characters about why you want to volunteer.";
}

// Terms
if (!$terms) {
    $errors[] = "You must agree to the volunteer guidelines.";
}

// ── ID Proof file upload ───────────────────────────────────────────────────────
$uploadDir  = __DIR__ . "/uploads/id_proofs/";
$uploadedFile = "";

if (!empty($_FILES["idProof"]["name"])) {
    $allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    $maxSize      = 5 * 1024 * 1024; // 5 MB

    if (!in_array($_FILES["idProof"]["type"], $allowedTypes)) {
        $errors[] = "ID proof must be a JPG, PNG, or PDF file.";
    } elseif ($_FILES["idProof"]["size"] > $maxSize) {
        $errors[] = "ID proof must be smaller than 5 MB.";
    } else {
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        $safeName     = time() . "_" . preg_replace('/[^a-zA-Z0-9._-]/', '_', basename($_FILES["idProof"]["name"]));
        $uploadedFile = $uploadDir . $safeName;
        if (!move_uploaded_file($_FILES["idProof"]["tmp_name"], $uploadedFile)) {
            $errors[] = "Failed to save the uploaded file.";
        }
    }
} else {
    $errors[] = "ID proof is required.";
}

// ── Return if errors ──────────────────────────────────────────────────────────
if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(["status" => "error", "errors" => $errors]);
    exit;
}

// ── Store submission (append to CSV log) ─────────────────────────────────────
$logFile = __DIR__ . "/data/volunteer_applications.csv";
if (!is_dir(__DIR__ . "/data")) {
    mkdir(__DIR__ . "/data", 0755, true);
}

$row = [
    date("Y-m-d H:i:s"),
    $fullName, $phone, $email, $city, $dob, $occupation,
    $role, $availability, $whyVolunteer,
    basename($uploadedFile)
];

$fp = fopen($logFile, "a");
if ($fp) {
    fputcsv($fp, $row);
    fclose($fp);
}

// ── Send confirmation email (optional — requires mail server) ─────────────────
$to      = $email;
$subject = "NeoPaws – Volunteer Application Received";
$body    = "Dear $fullName,\n\nThank you for applying to volunteer with NeoPaws!\n"
         . "We have received your application for the role of: $role.\n"
         . "Our team will review your details and get back to you shortly.\n\n"
         . "Warm regards,\nThe NeoPaws Team";
$headers = "From: no-reply@neopaws.org\r\nContent-Type: text/plain; charset=UTF-8";
@mail($to, $subject, $body, $headers);

// ── Success response ──────────────────────────────────────────────────────────
echo json_encode([
    "status"  => "success",
    "message" => "Your volunteer application has been submitted successfully!"
]);
?>
