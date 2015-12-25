<?php
$res = file_get_contents('resources.txt');
$lines = explode(PHP_EOL, $res);
$n = count($lines);
$loaded = '<ul class="loaded">';
$untouched = '<ul class="untouched">';
for ($i = 0; $i < $n; $i += 2) {
    $href = escapeshellarg($lines[$i]);
    $file = escapeshellarg($lines[$i + 1]);
    if (file_exists($file) ) {
        $untouched .= '<li>$file</li>';
        array_push($untouched, $file);
    } else {
        unset($output);
        exec("wget $href -O $file", $output);
        $out = implode(PHP_EOL, $output);
        $loaded .= "<li>$file loaded from $href: $out </li>";
        array_push($loaded, $file, $output);
    }
} 
echo "$loaded </ul> $untouched </ul>";
echo '<iframe src="index.html"></iframe>';
?>
