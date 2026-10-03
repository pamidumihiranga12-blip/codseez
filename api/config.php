<?php
/**
 * CodFlow OMS - MySQL Database Configuration
 * Host: sdb-86.hosting.stackcp.net
 * Database: CodFlow-353130305fd5
 * User: CodFlow-353130305fd5
 * Storage Quota: 1024 MB (Maximized with InnoDB ROW_FORMAT=COMPRESSED)
 */

define('DB_HOST', getenv('DB_HOST') ?: 'sdb-86.hosting.stackcp.net');
define('DB_PORT', getenv('DB_PORT') ?: 3306);
define('DB_NAME', getenv('DB_NAME') ?: 'CodFlow-353130305fd5');
define('DB_USER', getenv('DB_USER') ?: 'CodFlow-353130305fd5');
define('DB_PASS', getenv('DB_PASS') ?: 'codflow12345');
define('DB_CHARSET', 'utf8mb4');
define('MAX_QUOTA_MB', 1024);

function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error'   => 'Database connection error: ' . $e->getMessage(),
            'host'    => DB_HOST,
            'db'      => DB_NAME
        ]);
        exit;
    }
}
