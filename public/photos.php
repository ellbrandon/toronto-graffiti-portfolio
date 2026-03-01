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

// --- Canonical what tags: singular => plural display label ---
// Both singular and plural forms in tags are accepted and normalized to the plural label.
const WHAT_SINGULAR_TO_PLURAL = [
    'handstyle'    => 'Handstyles',
    'hollow'       => 'Hollows',
    'throw'        => 'Throws',
    'piece'        => 'Pieces',
    'roller'       => 'Rollers',
    'extinguisher' => 'Extinguishers',
    'rappel'       => 'Rappels',
    'character'    => 'Characters',
    'detail'       => 'Details',
    'wall wisdom'  => 'Wall Wisdoms',
    'slap'         => 'Slaps',
    'can'          => 'Cans',
];

const WHERE_TAGS = [
    'alley', 'bridge', 'tunnel', 'trackside', 'freight',
    'truck', 'door', 'river', 'gulley', 'highway',
    'rooftop', 'subway', 'bando', 'urbex',
];

// Build what lookup: accepts both singular and plural (lowercase) → plural display label
$whatDisplay = [];
foreach (WHAT_SINGULAR_TO_PLURAL as $singular => $plural) {
    $whatDisplay[$singular]          = $plural;           // e.g. 'throw'  → 'Throws'
    $whatDisplay[strtolower($plural)] = $plural;           // e.g. 'throws' → 'Throws'
}

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

// Collect JPGs from /photos/ and any subdirectories (e.g. /photos/2025/)
$files = [];
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($photosDir));
foreach ($iterator as $file) {
    if ($file->isFile() && preg_match('/\.(jpg|jpeg)$/i', $file->getFilename())) {
        $files[] = $file->getPathname();
    }
}
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
    // Relative path from the photos dir, e.g. "2025/DSC_0082.jpg"
    $relativePath = ltrim(str_replace($photosDir, '', $filepath), '/\\');

    // Use Exif DateTimeOriginal (when photo was taken) — fall back to file mtime
    $uploaded = null;
    $exif = @exif_read_data($filepath);
    if (!empty($exif['DateTimeOriginal'])) {
        // Exif format: "2025:10:11 19:29:00"
        $dt = DateTime::createFromFormat('Y:m:d H:i:s', $exif['DateTimeOriginal']);
        if ($dt) $uploaded = $dt->format('c');
    }
    if (!$uploaded) {
        $uploaded = date('c', filemtime($filepath));
    }

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
        'url'      => $baseUrl . str_replace('\\', '/', $relativePath),
        'writers'  => $writers,
        'what'     => $what,
        'where'    => $where,
        'uploaded' => $uploaded,
    ];
}

echo json_encode($photos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
