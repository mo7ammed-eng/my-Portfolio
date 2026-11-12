<?php

namespace App\Support;

class UserAgent
{
    public static function parse(?string $ua): array
    {
        $ua = (string) $ua;
        $lower = strtolower($ua);

        $browser = 'Unknown';
        $version = null;

        $browsers = [
            'Edg' => 'Edge',
            'OPR' => 'Opera',
            'SamsungBrowser' => 'Samsung Internet',
            'Firefox' => 'Firefox',
            'Chrome' => 'Chrome',
            'Safari' => 'Safari',
            'MSIE' => 'Internet Explorer',
            'Trident' => 'Internet Explorer',
        ];

        foreach ($browsers as $needle => $name) {
            if (str_contains($ua, $needle)) {
                $browser = $name;
                if (preg_match('/'.preg_quote($needle, '/').'[\/ ]([\d.]+)/', $ua, $m)) {
                    $version = $m[1];
                }
                break;
            }
        }

        if ($browser === 'Safari' && preg_match('/Version\/([\d.]+)/', $ua, $m)) {
            $version = $m[1];
        }

        $os = 'Unknown';
        $osMap = [
            'Windows NT 10' => 'Windows',
            'Windows NT 6.3' => 'Windows',
            'Windows' => 'Windows',
            'iPhone' => 'iOS',
            'iPad' => 'iPadOS',
            'Android' => 'Android',
            'Mac OS X' => 'macOS',
            'Macintosh' => 'macOS',
            'CrOS' => 'ChromeOS',
            'Linux' => 'Linux',
        ];

        foreach ($osMap as $needle => $name) {
            if (str_contains($ua, $needle)) {
                $os = $name;
                break;
            }
        }

        $device = 'desktop';
        if (preg_match('/ipad|tablet|playbook|silk/i', $ua)) {
            $device = 'tablet';
        } elseif (preg_match('/mobi|iphone|ipod|android.*mobile|windows phone/i', $ua)) {
            $device = 'mobile';
        } elseif (preg_match('/laptop|macbook|notebook/i', $ua)) {
            $device = 'laptop';
        }

        $isBot = (bool) preg_match('/bot|crawl|spider|slurp|gptbot|claudebot|perplexitybot|facebookexternalhit|headless/i', $ua);

        return [
            'browser' => $browser,
            'browser_version' => $version,
            'os' => $os,
            'device_type' => $device,
            'is_bot' => $isBot,
        ];
    }
}
