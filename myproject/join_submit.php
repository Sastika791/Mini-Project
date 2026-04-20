<?php
// join_submit.php — handles Membership Registration form submission

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

$fullName = sanitize($_POST["fullName"] ?? "");
$email    = sanitize($_POST["email"]    ?? "");
$phone    = sanitize($_POST["phone"]    ?? "");
$plan     = sanitize($_POST["plan"]     ?? "");
$card     = preg_replace('/\s+/', '', sanitize($_POST["card"]   ?? ""));
$expiry   = sanitize($_POST["expiry"]  ?? "");
$cvv      = sanitize($_POST["cvv"]     ?? "");

// Name
if (empty($fullName) || !preg_match('/^[A-Za-z ]+$/', $fullName)) {
    $errors[] = "Full name is invalid.";
}

// Email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Email address is invalid.";
}

// Phone
if (!preg_match('/^[6-9]\d{9}$/', $phone)) {
    $errors[] = "Phone must be a valid 10-digit Indian mobile number.";
}

// Plan
$validPlans = ["basic", "premium", "elite"];
if (!in_array($plan, $validPlans)) {
    $errors[] = "Please select a valid membership plan.";
}

// Card — 16 digits
if (!preg_match('/^\d{16}$/', $card)) {
    $errors[] = "Card number must be exactly 16 digits.";
}

// Expiry — MM/YY format, not in the past
if (!preg_match('/^(0[1-9]|1[0-2])\/\d{2}$/', $expiry)) {
    $errors[] = "Expiry must be in MM/YY format.";
} else {
    [$expMonth, $expYear] = explode("/", $expiry);
    $expDate  = DateTime::createFromFormat("m/y", $expiry);
    $expDate->modify("first day of this month");
    $today    = new DateTime("first day of this month");
    if ($expDate < $today) {
        $errors[] = "Card expiry date is in the past.";
    }
}

// CVV — 3 digits
if (!preg_match('/^\d{3}$/', $cvv)) {
    $errors[] = "CVV must be exactly 3 digits.";
}

// ── Return errors ─────────────────────────────────────────────────────────────
if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(["status" => "error", "errors" => $errors]);
    exit;
}

// ── Map plan to amount ────────────────────────────────────────────────────────
$planAmounts = ["basic" => 2000, "premium" => 5000, "elite" => 10000];
$amount      = $planAmounts[$plan];

// ── Store membership record ───────────────────────────────────────────────────
$memberId = "MEM-" . strtoupper(substr(md5(uniqid()), 0, 8));
$logFile  = __DIR__ . "/data/memberships.csv";

if (!is_dir(__DIR__ . "/data")) {
    mkdir(__DIR__ . "/data", 0755, true);
}

// Store only last 4 digits of card for safety
$maskedCard = "****-****-****-" . substr($card, -4);

$row = [
    $memberId,
    date("Y-m-d H:i:s"),
    $fullName, $email, $phone,
    ucfirst($plan), "₹$amount",
    $maskedCard, $expiry
];

$fp = fopen($logFile, "a");
if ($fp) {
    fputcsv($fp, $row);
    fclose($fp);
}

// ── Send confirmation email ───────────────────────────────────────────────────
$to      = $email;
$subject = "NeoPaws – Welcome, $fullName! Your membership is active.";
$body    = "Dear $fullName,\n\n"
         . "Welcome to the NeoPaws family! 🐾\n\n"
         . "Membership ID : $memberId\n"
         . "Plan          : " . ucfirst($plan) . "\n"
         . "Amount Paid   : ₹$amount\n\n"
         . "You now have full access to all " . ucfirst($plan) . " member benefits.\n"
         . "Thank you for supporting our mission!\n\n"
         . "Warm regards,\nThe NeoPaws Team";
$headers = "From: no-reply@neopaws.org\r\nContent-Type: text/plain; charset=UTF-8";
@mail($to, $subject, $body, $headers);

// ── Success ───────────────────────────────────────────────────────────────────
echo json_encode([
    "status"     => "success",
    "memberId"   => $memberId,
    "message"    => "Welcome to NeoPaws! Your $plan membership is now active. Member ID: $memberId"
]);
?>
