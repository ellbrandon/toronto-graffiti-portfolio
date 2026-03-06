<?php
define('UNLOCK_SECRET', 'butleriscool');
define('COOKIE_NAME',   'tg_access');
define('COOKIE_VALUE',  'granted');

// Set cookie if unlock param matches
if (isset($_GET['unlock']) && $_GET['unlock'] === UNLOCK_SECRET) {
    setcookie(COOKIE_NAME, COOKIE_VALUE, [
        'expires'  => time() + 60 * 60 * 24 * 365,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    // Redirect to clean URL (strip the unlock param)
    $redirect = strtok($_SERVER['REQUEST_URI'], '?');
    header('Location: ' . $redirect);
    exit;
}

// Allow access if cookie is set — serve the SPA
if (isset($_COOKIE[COOKIE_NAME]) && $_COOKIE[COOKIE_NAME] === COOKIE_VALUE) {
    readfile(__DIR__ . '/index.html');
    exit;
}

// Otherwise show coming soon page
http_response_code(200);
header('Content-Type: text/html; charset=utf-8');
?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TorontoGraff.com</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      height: 100%;
      background: #000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: Georgia, serif;
      color: #fff;
    }
    img {
      max-width: min(600px, 90vw);
      height: auto;
      display: block;
    }
    p {
      margin-top: 2rem;
      font-size: 1.5rem;
      letter-spacing: 0.15em;
      text-transform: lowercase;
    }
  </style>
</head>
<body>
  <img src="/comingsoon.jpeg" alt="TorontoGraff.com">
  <p>coming soon</p>
</body>
</html>
<?php exit; ?>
