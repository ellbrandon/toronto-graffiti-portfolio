<?php
/**
 * photos.php
 * Returns JSON array of all photos from /photos/ directory.
 * Reads XMP dc:subject keywords (Windows "Tags" field) from each JPG.
 *
 * Each keyword is one tag, e.g: ["2025", "Yetie", "graffiti", "highway"]
 * - 4-digit years and the word "graffiti" are ignored (case-insensitive).
 * - Known "what" values matched case-insensitively.
 * - Known "where" values matched case-insensitively.
 * - Everything else becomes a writer name.
 *
 * Returns: [{id, filename, url, writers, what, where, uploaded}]
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// --- Canonical tag lists (lowercase for matching) ---
const WHAT_TAGS = [
    'character', 'handstyle', 'hollow', 'throw', 'extinguisher',
    'piece', 'roller', 'detail', 'nocturnal', 'stich', 'pano', 'slap',
];

const WHERE_TAGS = [
    'urbex', 'tunnel', 'rooftop', 'bridge', 'trackside',
    'alley', 'highway', 'river', 'freight', 'truck',
    'door', 'rappel', 'bando', 'subway',
];

$whatDisplay  = [];
foreach (WHAT_TAGS  as $t) $whatDisplay[$t]  = ucfirst($t);
$whereDisplay = [];
foreach (WHERE_TAGS as $t) $whereDisplay[$t] = ucfirst($t);

// --- Read XMP block from a JPG file, return raw XML string or '' ---
function readXmp(string $filepath): string {
    $fh = @fopen($filepath, 'rb');
    if (!$fh) return '';

    // XMP is embedded as a JPEG APP1 segment starting with the XMP header
    $xmpHeader = "http://ns.adobe.com/xap/1.0/\x00";
    $content = fread($fh, 131072); // Read first 128 KB — XMP is always near the start
    fclose($fh);

    $start = strpos($content, $xmpHeader);
    if ($start === false) return '';

    $start += strlen($xmpHeader);
    $end = strpos($content, '</x:xmpmeta>', $start);
    if ($end === false) return '';

    return substr($content, $start, $end - $start + strlen('</x:xmpmeta>'));
}

// --- Extract dc:subject keywords from XMP XML ---
function extractXmpKeywords(string $xmp): array {
    if ($xmp === '') return [];

    // Suppress XML errors for malformed XMP
    $prev = libxml_use_internal_errors(true);
    $xml = @simplexml_load_string($xmp);
    libxml_use_internal_errors($prev);

    if (!$xml) return [];

    // Register namespaces
    $xml->registerXPathNamespace('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');
    $xml->registerXPathNamespace('dc',  'http://purl.org/dc/elements/1.1/');

    // dc:subject/rdf:Bag/rdf:li  — the standard location for keywords
    $items = $xml->xpath('//dc:subject/rdf:Bag/rdf:li');
    if (!$items) return [];

    return array_map('strval', $items);
}

// --- Photos directory ---
$photosDir = __DIR__ . '/photos/';
$baseUrl   = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
           . '://' . $_SERVER['HTTP_HOST'] . '/photos/';

if (!is_dir($photosDir)) {
    echo json_encode(['error' => 'Photos directory not found', 'path' => $photosDir]);
    exit;
}

$files = glob($photosDir . '*.{jpg,jpeg,JPG,JPEG}', GLOB_BRACE);
sort($files);

// --- Debug mode ---
if (isset($_GET['debug']) && $files) {

    // ?debug=1  → single file detail (first photo)
    // ?debug=keywords → all files, keywords only
    if ($_GET['debug'] === 'keywords') {
        $out = [];
        foreach ($files as $fp) {
            $info = [];
            @getimagesize($fp, $info);
            $kw = [];
            if (isset($info['APP13'])) {
                $iptc = iptcparse($info['APP13']);
                if (!empty($iptc['2#025'])) $kw = $iptc['2#025'];
            }
            if (empty($kw)) $kw = extractXmpKeywords(readXmp($fp));
            $out[] = ['file' => basename($fp), 'keywords' => $kw];
        }
        echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    // Default: single file detail
    $fp  = $files[0];
    $xmp = readXmp($fp);
    $kw  = extractXmpKeywords($xmp);
    $info = [];
    @getimagesize($fp, $info);
    $iptc = isset($info['APP13']) ? iptcparse($info['APP13']) : null;

    echo json_encode([
        'file'                => basename($fp),
        'xmp_found'           => $xmp !== '',
        'xmp_keywords'        => $kw,
        'iptc_2#025_keywords' => $iptc['2#025'] ?? null,
        'iptc_2#120_caption'  => $iptc['2#120'] ?? null,
        'xmp_snippet'         => substr($xmp, 0, 500),
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// --- Build photo list ---
$photos = [];
$id = 1;

foreach ($files as $filepath) {
    $filename = basename($filepath);
    $mtime    = filemtime($filepath);
    $uploaded = date('c', $mtime);

    // Read IPTC 2#025 Keywords (where Lightroom stores keyword tags)
    $keywords = [];
    $info = [];
    @getimagesize($filepath, $info);
    if (isset($info['APP13'])) {
        $iptc = iptcparse($info['APP13']);
        if (!empty($iptc['2#025'])) {
            $keywords = $iptc['2#025'];
        }
    }

    // Fallback: XMP dc:subject
    if (empty($keywords)) {
        $keywords = extractXmpKeywords(readXmp($filepath));
    }

    // Parse keywords into writer/what/where
    $writers = [];
    $what    = null;
    $where   = null;

    foreach ($keywords as $kw) {
        $kw    = trim($kw);
        $lower = strtolower($kw);

        if ($kw === '') continue;
        if (preg_match('/^\d{4}$/', $kw)) continue;   // skip year
        if ($lower === 'graffiti') continue;            // skip literal "graffiti"

        if (array_key_exists($lower, $whatDisplay)) {
            $what = $whatDisplay[$lower];
            continue;
        }

        if (array_key_exists($lower, $whereDisplay)) {
            $where = $whereDisplay[$lower];
            continue;
        }

        $writers[] = $kw;
    }

    $photos[] = [
        'id'       => $id++,
        'filename' => $filename,
        'url'      => $baseUrl . $filename,
        'writers'  => $writers,
        'what'     => $what,
        'where'    => $where,
        'uploaded' => $uploaded,
    ];
}

echo json_encode($photos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
