<?php
/**
 * generate-cache.php
 *
 * Regenerates photos-cache.json by scanning all photos and writing the
 * result to disk. Run this via cron whenever photos are added/changed.
 *
 * Usage:
 *   curl "https://torontograff.com/generate-cache.php?key=YOUR_SECRET_KEY"
 *
 * Cron example (daily at 3am):
 *   0 3 * * * curl -s "https://torontograff.com/generate-cache.php?key=YOUR_SECRET_KEY" >> /dev/null
 *
 * IMPORTANT: Change the secret key below before deploying.
 */

// ----------------------------------------------------------------
// Secret key — change this before uploading to production
// ----------------------------------------------------------------
define('SECRET_KEY', 'BUTLERISCOOL');

// Check key
if (!isset($_GET['key']) || $_GET['key'] !== SECRET_KEY) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

// Raise time + memory limits for large photo sets
set_time_limit(300);     // 5 minutes
ini_set('memory_limit', '256M');

header('Content-Type: application/json');

// ----------------------------------------------------------------
// Tag lookup tables (keep in sync with photos.php)
// ----------------------------------------------------------------
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
    'slap'         => 'Slaps',
    'can'          => 'Cans',
    'beef'         => 'Beefs',
    'wallwisdom'   => 'Wall Wisdoms', 
    'inaction'     => 'inaction', 
];

const WHERE_TAGS = [
    'alley', 'bridge', 'tunnel', 'trackside', 'freight',
    'truck', 'door', 'river', 'gulley', 'highway',
    'rooftop', 'subway', 'bando', 'urbex',
];

const WHAT_EXCLUDED = ['nocturnal', 'nocturnals', 'stich', 'stiches', 'pano', 'panos', 'inaction' , 'inaction'];

$whatDisplay = [];
foreach (WHAT_SINGULAR_TO_PLURAL as $singular => $plural) {
    $whatDisplay[$singular]          = $plural;
    $whatDisplay[strtolower($plural)] = $plural;
}

$whereDisplay = [];
foreach (WHERE_TAGS as $t) $whereDisplay[$t] = ucfirst($t);

// ----------------------------------------------------------------
// Helpers (copied from photos.php)
// ----------------------------------------------------------------
function readXmp(string $filepath): string {
    $fh = @fopen($filepath, 'rb');
    if (!$fh) return '';
    $xmpHeader = "http://ns.adobe.com/xap/1.0/\x00";
    $content = fread($fh, 131072);
    fclose($fh);
    $start = strpos($content, $xmpHeader);
    if ($start === false) return '';
    $start += strlen($xmpHeader);
    $end = strpos($content, '</x:xmpmeta>', $start);
    if ($end === false) return '';
    return substr($content, $start, $end - $start + strlen('</x:xmpmeta>'));
}

function extractXmpKeywords(string $xmp): array {
    if ($xmp === '') return [];
    $prev = libxml_use_internal_errors(true);
    $xml = @simplexml_load_string($xmp);
    libxml_use_internal_errors($prev);
    if (!$xml) return [];
    $xml->registerXPathNamespace('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');
    $xml->registerXPathNamespace('dc',  'http://purl.org/dc/elements/1.1/');
    $items = $xml->xpath('//dc:subject/rdf:Bag/rdf:li');
    if (!$items) return [];
    return array_map('strval', $items);
}

// ----------------------------------------------------------------
// Scan photos directory
// ----------------------------------------------------------------
$photosDir = __DIR__ . '/photos/';
$baseUrl   = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
           . '://' . $_SERVER['HTTP_HOST'] . '/photos/';

if (!is_dir($photosDir)) {
    echo json_encode(['error' => 'Photos directory not found']);
    exit;
}

$files = [];
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($photosDir));
foreach ($iterator as $file) {
    if ($file->isFile() && preg_match('/\.(jpg|jpeg)$/i', $file->getFilename())) {
        $files[] = $file->getPathname();
    }
}
sort($files);

// ----------------------------------------------------------------
// Build photo list
// ----------------------------------------------------------------
$photos = [];
$id = 1;

foreach ($files as $filepath) {
    $filename     = basename($filepath);
    $relativePath = ltrim(str_replace($photosDir, '', $filepath), '/\\');

    // Sort by file modification time (when the file was added/changed on disk)
    $uploaded  = date('c', filemtime($filepath));
    $imgWidth  = null;
    $imgHeight = null;

    $exif = @exif_read_data($filepath);

    $sz = @getimagesize($filepath);
    if ($sz) {
        $imgWidth  = (int) $sz[0];
        $imgHeight = (int) $sz[1];
        $orientation = $exif['Orientation'] ?? 1;
        if (in_array($orientation, [5, 6, 7, 8], true)) {
            [$imgWidth, $imgHeight] = [$imgHeight, $imgWidth];
        }
    }

    $keywords = [];
    $info = [];
    @getimagesize($filepath, $info);
    if (isset($info['APP13'])) {
        $iptc = iptcparse($info['APP13']);
        if (!empty($iptc['2#025'])) {
            $keywords = $iptc['2#025'];
        }
    }
    if (empty($keywords)) {
        $keywords = extractXmpKeywords(readXmp($filepath));
    }

    $lowerKeywords = array_map(fn($k) => strtolower(trim($k)), $keywords);
    if (array_intersect($lowerKeywords, WHAT_EXCLUDED)) continue;

    $writers = [];
    // beef always wins as the what tag — set it upfront so other what-tags can't overwrite it
    $what    = in_array('beef', $lowerKeywords) ? 'Beefs' : null;
    $where   = null;
    $places  = false;

    foreach ($keywords as $kw) {
        $kw    = trim($kw);
        $lower = strtolower($kw);
        if ($kw === '') continue;
        if (preg_match('/^\d{4}$/', $kw)) continue;
        if ($lower === 'graffiti' || $lower === 'graff') continue;
        if ($lower === 'beef') continue; // already handled above
        if ($lower === 'placesandspaces') { $places = true; continue; }
        if (array_key_exists($lower, $whatDisplay)) { if ($what === null) $what = $whatDisplay[$lower]; continue; }
        if (array_key_exists($lower, $whereDisplay)) { $where = $whereDisplay[$lower]; continue; }
        $writers[] = ($lower === 'unknown') ? 'Unknown' : ucwords($lower);
    }

    $photos[] = [
        'id'       => $id++,
        'filename' => $filename,
        'url'      => $baseUrl . str_replace('\\', '/', $relativePath),
        'writers'  => $writers ?: ['Unknown'],
        'what'     => $what,
        'where'    => $where,
        'places'   => $places,
        'uploaded' => $uploaded,
        'width'    => $imgWidth,
        'height'   => $imgHeight,
    ];
}

// ----------------------------------------------------------------
// Write cache atomically (temp file → rename avoids partial reads)
// ----------------------------------------------------------------
$cacheFile = __DIR__ . '/photos-cache.json';
$tmpFile   = $cacheFile . '.tmp';
$json      = json_encode($photos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if (file_put_contents($tmpFile, $json) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to write cache file']);
    exit;
}
rename($tmpFile, $cacheFile);

echo json_encode([
    'ok'      => true,
    'photos'  => count($photos),
    'cached'  => $cacheFile,
    'generated'  => date('c'),
]);
