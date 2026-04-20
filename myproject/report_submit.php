<?php
// report_submit.php — handles Missing Pet Report form submission

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
    exit;
}

// ── Sanitize helper ───────────────────────────────────────────────────────────
function sanitize($val) {
    return htmlspecialchars(strip_tags(trim($val)));
}

// ── Collect & validate ────────────────────────────────────────────────────────
$errors = [];

$ownerName         = sanitize($_POST["ownerName"]         ?? "");
$phone             = sanitize($_POST["phone"]             ?? "");
$email             = sanitize($_POST["email"]             ?? "");
$city              = sanitize($_POST["city"]              ?? "");
$petType           = sanitize($_POST["petType"]           ?? "");
$breed             = sanitize($_POST["breed"]             ?? "");
$petAge            = sanitize($_POST["petAge"]            ?? "");
$colorMarks        = sanitize($_POST["colorMarks"]        ?? "");
$microchipped      = sanitize($_POST["microchipped"]      ?? "");
$lastSeen          = sanitize($_POST["lastSeen"]          ?? "");
$dateMissing       = sanitize($_POST["dateMissing"]       ?? "");
$additionalDetails = sanitize($_POST["additionalDetails"] ?? "");
$confirmInfo       = isset($_POST["confirmInfo"]);

// Owner name
if (empty($ownerName) || !preg_match('/^[A-Za-z ]+$/', $ownerName)) {
    $errors[] = "Owner name is invalid.";
}

// Phone
if (!preg_match('/^[6-9]\d{9}$/', $phone)) {
    $errors[] = "Phone must be a valid 10-digit Indian mobile number.";
}

// Email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Email address is invalid.";
}

// City
if (empty($city)) {
    $errors[] = "City is required.";
}

// Breed
if (empty($breed)) {
    $errors[] = "Breed is required.";
}

// Pet age
$petAgeInt = (int) $petAge;
if ($petAgeInt < 0 || $petAgeInt > 30 || !is_numeric($petAge)) {
    $errors[] = "Pet age must be between 0 and 30.";
}

// Color/marks (min 5 chars)
if (strlen($colorMarks) < 5) {
    $errors[] = "Please provide at least 5 characters for color / identifying marks.";
}

// Last seen (min 5 chars)
if (strlen($lastSeen) < 5) {
    $errors[] = "Last seen location must be at least 5 characters.";
}

// Date missing — must not be in the future
if (empty($dateMissing)) {
    $errors[] = "Date missing is required.";
} else {
    $missingDate = new DateTime($dateMissing);
    $today       = new DateTime();
    if ($missingDate > $today) {
        $errors[] = "Date missing cannot be in the future.";
    }
}

// Additional details (min 20 chars)
if (strlen($additionalDetails) < 20) {
    $errors[] = "Additional details must be at least 20 characters.";
}

// Confirmation checkbox
if (!$confirmInfo) {
    $errors[] = "You must confirm the information is accurate.";
}

// ── Pet image upload ──────────────────────────────────────────────────────────
$uploadDir    = __DIR__ . "/uploads/pet_images/";
$uploadedFile = "";

if (!empty($_FILES["petImage"]["name"])) {
    $allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    $maxSize      = 5 * 1024 * 1024;

    if (!in_array($_FILES["petImage"]["type"], $allowedTypes)) {
        $errors[] = "Pet image must be JPG, PNG, GIF, or WEBP.";
    } elseif ($_FILES["petImage"]["size"] > $maxSize) {
        $errors[] = "Pet image must be smaller than 5 MB.";
    } else {
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        $safeName     = time() . "_" . preg_replace('/[^a-zA-Z0-9._-]/', '_', basename($_FILES["petImage"]["name"]));
        $uploadedFile = $uploadDir . $safeName;
        if (!move_uploaded_file($_FILES["petImage"]["tmp_name"], $uploadedFile)) {
            $errors[] = "Failed to save the pet image.";
        }
    }
} else {
    $errors[] = "A pet image is required.";
}

// ── Return errors if any ──────────────────────────────────────────────────────
if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(["status" => "error", "errors" => $errors]);
    exit;
}

// ── Generate a unique report ID ───────────────────────────────────────────────
$reportId = "RPT-" . strtoupper(substr(md5(uniqid()), 0, 8));

// ── Store submission in CSV log ───────────────────────────────────────────────
$logFile = __DIR__ . "/data/missing_pet_reports.csv";
if (!is_dir(__DIR__ . "/data")) {
    mkdir(__DIR__ . "/data", 0755, true);
}

$row = [
    $reportId,
    date("Y-m-d H:i:s"),
    $ownerName, $phone, $email, $city,
    $petType, $breed, $petAgeInt, $colorMarks, $microchipped,
    $lastSeen, $dateMissing, $additionalDetails,
    basename($uploadedFile)
];

$fp = fopen($logFile, "a");
if ($fp) {
    fputcsv($fp, $row);
    fclose($fp);
}

// ── Send confirmation email ───────────────────────────────────────────────────
$to      = $email;
$subject = "NeoPaws – Missing Pet Report Submitted ($reportId)";
$body    = "Dear $ownerName,\n\n"
         . "Your missing pet report has been submitted. Your report ID is: $reportId\n"
         . "Pet Type: $petType | Breed: $breed | Last Seen: $lastSeen\n\n"
         . "Our team and volunteers will begin searching immediately.\n"
         . "Please keep your phone accessible for updates.\n\n"
         . "Warm regards,\nThe NeoPaws Team";
$headers = "From: no-reply@neopaws.org\r\nContent-Type: text/plain; charset=UTF-8";
@mail($to, $subject, $body, $headers);

// ── Success ───────────────────────────────────────────────────────────────────
echo json_encode([
    "status"   => "success",
    "reportId" => $reportId,
    "message"  => "Your missing pet report has been submitted. Report ID: $reportId"
]);
?>
