<?php
/**
 * CodFlow OMS - MySQL High-Performance Database API
 * Database: CodFlow-353130305fd5
 * Host: sdb-86.hosting.stackcp.net
 * Storage Optimization: InnoDB ROW_FORMAT=COMPRESSED + Compact JSON serialization
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

// Helper: Read JSON input
function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// Ensure Database Tables Exist with InnoDB Compression
function autoMigrateTables($pdo) {
    static $migrated = false;
    if ($migrated) return;

    $schema = [
        "CREATE TABLE IF NOT EXISTS `users` (
            `id` VARCHAR(32) NOT NULL,
            `name` VARCHAR(100) NOT NULL,
            `store_name` VARCHAR(100) NOT NULL,
            `email` VARCHAR(100) NOT NULL,
            `phone` VARCHAR(15) NOT NULL,
            `password` VARCHAR(255) NOT NULL,
            `role` VARCHAR(20) NOT NULL DEFAULT 'merchant',
            `status` VARCHAR(20) NOT NULL DEFAULT 'trial',
            `plan` VARCHAR(50) NOT NULL DEFAULT '10-Day Free Trial',
            `registered_at` BIGINT NOT NULL,
            `expires_at` BIGINT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `idx_users_email` (`email`),
            KEY `idx_users_phone` (`phone`),
            KEY `idx_users_status` (`status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;",

        "CREATE TABLE IF NOT EXISTS `orders` (
            `id` VARCHAR(32) NOT NULL,
            `merchant_id` VARCHAR(32) NOT NULL DEFAULT 'usr_admin',
            `customer` VARCHAR(100) NOT NULL,
            `phone` VARCHAR(15) NOT NULL,
            `phone2` VARCHAR(15) NULL,
            `address` VARCHAR(255) NOT NULL,
            `city` VARCHAR(50) NOT NULL,
            `email` VARCHAR(100) NULL,
            `service_id` VARCHAR(32) NULL,
            `provider` VARCHAR(40) NOT NULL DEFAULT 'Pending Dispatch',
            `client_id` VARCHAR(30) NULL,
            `waybill` VARCHAR(40) NULL,
            `weight` DECIMAL(5,2) NOT NULL DEFAULT 0.50,
            `delivery_charge` INT NOT NULL DEFAULT 500,
            `total` INT NOT NULL DEFAULT 0,
            `paid` VARCHAR(10) NOT NULL DEFAULT 'Unpaid',
            `status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
            `origin` VARCHAR(30) NOT NULL DEFAULT 'Web Storefront',
            `courier_location` VARCHAR(60) NULL,
            `items` TEXT NOT NULL,
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_orders_merchant` (`merchant_id`),
            KEY `idx_orders_status` (`status`),
            KEY `idx_orders_waybill` (`waybill`),
            KEY `idx_orders_phone` (`phone`),
            KEY `idx_orders_date` (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;",

        "CREATE TABLE IF NOT EXISTS `products` (
            `id` VARCHAR(32) NOT NULL,
            `merchant_id` VARCHAR(32) NOT NULL DEFAULT 'usr_admin',
            `name` VARCHAR(150) NOT NULL,
            `price` INT NOT NULL DEFAULT 0,
            `cost` INT NOT NULL DEFAULT 0,
            `stock` INT NOT NULL DEFAULT 0,
            `weight` DECIMAL(5,2) NOT NULL DEFAULT 0.50,
            `sku` VARCHAR(50) NULL,
            `category` VARCHAR(50) NULL,
            `image` MEDIUMTEXT NULL,
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_prod_merchant` (`merchant_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;",

        "CREATE TABLE IF NOT EXISTS `delivery_services` (
            `id` VARCHAR(32) NOT NULL,
            `merchant_id` VARCHAR(32) NOT NULL DEFAULT 'usr_admin',
            `name` VARCHAR(100) NOT NULL,
            `provider` VARCHAR(50) NOT NULL,
            `base_cost` INT NOT NULL DEFAULT 500,
            `extra_cost_kg` INT NOT NULL DEFAULT 50,
            `base_charge` INT NOT NULL DEFAULT 500,
            `extra_charge_kg` INT NOT NULL DEFAULT 50,
            `api_key` VARCHAR(150) NULL,
            `client_id` VARCHAR(50) NULL,
            `is_default` TINYINT(1) NOT NULL DEFAULT 0,
            PRIMARY KEY (`id`),
            KEY `idx_ds_merchant` (`merchant_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;",

        "CREATE TABLE IF NOT EXISTS `sms_settings` (
            `merchant_id` VARCHAR(32) NOT NULL,
            `enabled` TINYINT(1) NOT NULL DEFAULT 0,
            `template` TEXT NOT NULL,
            `gateway` VARCHAR(30) NOT NULL DEFAULT 'SMSLENZ',
            `user_id` VARCHAR(50) NULL,
            `api_key` VARCHAR(100) NULL,
            `sender_id` VARCHAR(50) NULL,
            `base_url` VARCHAR(100) NOT NULL DEFAULT 'https://smslenz.lk/api',
            `balance` VARCHAR(50) NULL,
            `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`merchant_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;",

        "CREATE TABLE IF NOT EXISTS `payments` (
            `id` VARCHAR(32) NOT NULL,
            `user_id` VARCHAR(32) NOT NULL,
            `store_name` VARCHAR(100) NOT NULL,
            `plan` VARCHAR(50) NOT NULL,
            `amount` INT NOT NULL,
            `payment_method` VARCHAR(30) NOT NULL DEFAULT 'Bank Transfer',
            `ref` VARCHAR(50) NOT NULL,
            `slip_image` MEDIUMTEXT NULL,
            `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
            `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `reviewed_at` DATETIME NULL,
            PRIMARY KEY (`id`),
            KEY `idx_pay_user` (`user_id`),
            KEY `idx_pay_status` (`status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;",

        "CREATE TABLE IF NOT EXISTS `settings` (
            `key_name` VARCHAR(64) NOT NULL,
            `merchant_id` VARCHAR(32) NOT NULL DEFAULT 'usr_admin',
            `value_json` MEDIUMTEXT NOT NULL,
            `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`key_name`, `merchant_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;",

        "CREATE TABLE IF NOT EXISTS `brands` (
            `id` VARCHAR(32) NOT NULL,
            `merchant_id` VARCHAR(32) NOT NULL DEFAULT 'usr_admin',
            `name` VARCHAR(100) NOT NULL,
            `slogan` VARCHAR(255) NULL,
            `address` VARCHAR(255) NULL,
            `email` VARCHAR(100) NULL,
            `phone1` VARCHAR(20) NULL,
            `phone2` VARCHAR(20) NULL,
            `phone3` VARCHAR(20) NULL,
            `logo` MEDIUMTEXT NULL,
            `delivery_services` VARCHAR(255) NOT NULL DEFAULT 'Default',
            `is_default` TINYINT(1) NOT NULL DEFAULT 0,
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_brand_merchant` (`merchant_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;",

        "CREATE TABLE IF NOT EXISTS `expenses` (
            `id` VARCHAR(32) NOT NULL,
            `merchant_id` VARCHAR(32) NOT NULL DEFAULT 'usr_admin',
            `date` DATE NOT NULL,
            `brand` VARCHAR(100) NOT NULL DEFAULT 'SmartZone',
            `note` VARCHAR(255) NOT NULL,
            `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            `payment_method` VARCHAR(50) NOT NULL DEFAULT 'Cash',
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_exp_merchant` (`merchant_id`),
            KEY `idx_exp_date` (`date`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;",

        "CREATE TABLE IF NOT EXISTS `team_members` (
            `id` VARCHAR(32) NOT NULL,
            `merchant_id` VARCHAR(32) NOT NULL DEFAULT 'usr_admin',
            `name` VARCHAR(100) NOT NULL,
            `email` VARCHAR(100) NOT NULL,
            `phone` VARCHAR(20) NULL,
            `role` VARCHAR(50) NOT NULL DEFAULT 'Staff',
            `access_level` VARCHAR(50) NOT NULL DEFAULT 'FULL ACCESS',
            `brand_access` VARCHAR(100) NOT NULL DEFAULT 'No restriction',
            `avatar` VARCHAR(10) NOT NULL DEFAULT 'PM',
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_team_merchant` (`merchant_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;"
    ];

    foreach ($schema as $sql) {
        try {
            $pdo->exec($sql);
        } catch (Exception $e) {
            // Ignore if already exists
        }
    }
    $migrated = true;
}

// Space-saving: Compact item representation to reduce bytes
function compactItems($items) {
    if (is_string($items)) {
        $decoded = json_decode($items, true);
        if (is_array($decoded)) $items = $decoded;
        else return $items;
    }
    if (!is_array($items)) return '[]';

    $compact = [];
    foreach ($items as $item) {
        $compact[] = [
            'id' => $item['id'] ?? $item['productId'] ?? '',
            'n'  => mb_substr($item['name'] ?? '', 0, 100),
            'p'  => (int)($item['price'] ?? 0),
            'q'  => (int)($item['qty'] ?? 1),
            'w'  => (float)($item['weight'] ?? 0.5)
        ];
    }
    return json_encode($compact, JSON_UNESCAPED_UNICODE);
}

// Restore expanded item representation for frontend compatibility
function expandItems($itemsJson) {
    if (!is_string($itemsJson)) return is_array($itemsJson) ? $itemsJson : [];
    $raw = json_decode($itemsJson, true);
    if (!is_array($raw)) return [];

    $expanded = [];
    foreach ($raw as $it) {
        $expanded[] = [
            'productId' => $it['id'] ?? $it['productId'] ?? '',
            'id'        => $it['id'] ?? $it['productId'] ?? '',
            'name'      => $it['n'] ?? $it['name'] ?? '',
            'price'     => (float)($it['p'] ?? $it['price'] ?? 0),
            'qty'       => (int)($it['q'] ?? $it['qty'] ?? 1),
            'weight'    => (float)($it['w'] ?? $it['weight'] ?? 0.5)
        ];
    }
    return $expanded;
}

// Compute live storage stats and remaining capacity on 1024 MB quota
function getStorageStats($pdo) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                COUNT(*) as table_count,
                COALESCE(SUM(data_length + index_length), 0) as total_bytes,
                COALESCE(SUM(table_rows), 0) as total_rows
            FROM information_schema.TABLES 
            WHERE table_schema = :dbname
        ");
        $stmt->execute([':dbname' => DB_NAME]);
        $row = $stmt->fetch();

        $bytes = (float)($row['total_bytes'] ?? 0);
        $usedMb = round($bytes / (1024 * 1024), 3);
        $quotaMb = (float)MAX_QUOTA_MB;
        $pct = round(($usedMb / $quotaMb) * 100, 2);
        $freeMb = round($quotaMb - $usedMb, 2);

        // Approximate average order row size in compressed InnoDB: ~220 bytes
        $remainingEstOrders = floor(($freeMb * 1024 * 1024) / 220);

        return [
            'used_mb' => $usedMb,
            'quota_mb' => $quotaMb,
            'free_mb' => $freeMb,
            'used_percent' => $pct,
            'total_rows' => (int)($row['total_rows'] ?? 0),
            'compression' => 'InnoDB ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8 (Active)',
            'est_orders_capacity' => $remainingEstOrders
        ];
    } catch (Exception $e) {
        return [
            'used_mb' => 0.05,
            'quota_mb' => 1024,
            'free_mb' => 1023.95,
            'used_percent' => 0.01,
            'compression' => 'InnoDB ROW_FORMAT=COMPRESSED',
            'est_orders_capacity' => 2500000
        ];
    }
}

// Action Dispatcher
$action = $_GET['action'] ?? $_POST['action'] ?? '';
if (!$action) {
    $input = getJsonInput();
    $action = $input['action'] ?? 'ping';
}

$pdo = getDbConnection();
autoMigrateTables($pdo);

switch ($action) {

    // 1. PING & STORAGE HEALTH
    case 'ping':
    case 'stats':
        $stats = getStorageStats($pdo);
        echo json_encode([
            'success'   => true,
            'message'   => 'Connected to MySQL database on StackCP successfully',
            'host'      => DB_HOST,
            'database'  => DB_NAME,
            'storage'   => $stats,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        break;

    // 2. OPTIMIZE TABLES (Reclaim freed disk space & shrink file)
    case 'optimize':
        try {
            $pdo->exec("OPTIMIZE TABLE `users`, `orders`, `products`, `delivery_services`, `sms_settings`, `payments`, `settings`");
            $stats = getStorageStats($pdo);
            echo json_encode([
                'success' => true,
                'message' => 'Database tables defragmented and storage shrunk successfully!',
                'storage' => $stats
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    // 3. GET ALL DATA FOR MERCHANT (Initial Sync)
    case 'get_all':
        $merchantId = $_GET['merchant_id'] ?? 'usr_admin';

        // Orders
        $stmtOrders = $pdo->prepare("SELECT * FROM `orders` WHERE `merchant_id` = :mid ORDER BY `created_at` DESC");
        $stmtOrders->execute([':mid' => $merchantId]);
        $ordersRaw = $stmtOrders->fetchAll();
        $orders = [];
        foreach ($ordersRaw as $o) {
            $orders[] = [
                'id'              => $o['id'],
                'customer'        => $o['customer'],
                'phone'           => $o['phone'],
                'phone2'          => $o['phone2'] ?? '',
                'address'         => $o['address'],
                'city'            => $o['city'],
                'email'           => $o['email'] ?? '',
                'serviceId'       => $o['service_id'] ?? '',
                'provider'        => $o['provider'],
                'clientId'        => $o['client_id'] ?? '',
                'waybill'         => $o['waybill'] ?? '',
                'weight'          => (float)$o['weight'],
                'deliveryCharge'  => (int)$o['delivery_charge'],
                'total'           => (int)$o['total'],
                'paid'            => $o['paid'],
                'status'          => $o['status'],
                'origin'          => $o['origin'],
                'courierLocation' => $o['courier_location'] ?? '',
                'items'           => expandItems($o['items']),
                'date'            => $o['created_at']
            ];
        }

        // Products
        $stmtProd = $pdo->prepare("SELECT * FROM `products` WHERE `merchant_id` = :mid ORDER BY `created_at` DESC");
        $stmtProd->execute([':mid' => $merchantId]);
        $productsRaw = $stmtProd->fetchAll();
        $products = [];
        foreach ($productsRaw as $p) {
            $products[] = [
                'id'       => $p['id'],
                'name'     => $p['name'],
                'price'    => (int)$p['price'],
                'cost'     => (int)$p['cost'],
                'stock'    => (int)$p['stock'],
                'weight'   => (float)$p['weight'],
                'sku'      => $p['sku'] ?? '',
                'category' => $p['category'] ?? '',
                'image'    => $p['image'] ?? ''
            ];
        }

        // Delivery Services
        $stmtDs = $pdo->prepare("SELECT * FROM `delivery_services` WHERE `merchant_id` = :mid");
        $stmtDs->execute([':mid' => $merchantId]);
        $services = $stmtDs->fetchAll();

        // SMS Settings
        $stmtSms = $pdo->prepare("SELECT * FROM `sms_settings` WHERE `merchant_id` = :mid");
        $stmtSms->execute([':mid' => $merchantId]);
        $sms = $stmtSms->fetch();

        // Users (For admin/auth)
        $users = [];
        $stmtUsers = $pdo->query("SELECT `id`, `name`, `store_name`, `email`, `phone`, `password`, `role`, `status`, `plan`, `registered_at`, `expires_at` FROM `users`");
        while ($u = $stmtUsers->fetch()) {
            $users[] = [
                'id'           => $u['id'],
                'name'         => $u['name'],
                'storeName'    => $u['store_name'],
                'email'        => $u['email'],
                'phone'        => $u['phone'],
                'password'     => $u['password'],
                'role'         => $u['role'],
                'status'       => $u['status'],
                'plan'         => $u['plan'],
                'registeredAt' => (int)$u['registered_at'],
                'expiresAt'    => $u['expires_at'] ? (int)$u['expires_at'] : null
            ];
        }

        // Payments
        $payments = [];
        $stmtPay = $pdo->query("SELECT * FROM `payments` ORDER BY `submitted_at` DESC");
        while ($p = $stmtPay->fetch()) {
            $payments[] = [
                'id'            => $p['id'],
                'userId'        => $p['user_id'],
                'storeName'     => $p['store_name'],
                'plan'          => $p['plan'],
                'amount'        => (int)$p['amount'],
                'paymentMethod' => $p['payment_method'],
                'ref'           => $p['ref'],
                'slipImage'     => $p['slip_image'],
                'status'        => $p['status'],
                'submittedAt'   => $p['submitted_at'],
                'reviewedAt'    => $p['reviewed_at']
            ];
        }

        // Brands (Screenshot 1 Match)
        $brands = [];
        $stmtBrands = $pdo->prepare("SELECT * FROM `brands` WHERE `merchant_id` = :mid ORDER BY `is_default` DESC, `created_at` ASC");
        $stmtBrands->execute([':mid' => $merchantId]);
        while ($b = $stmtBrands->fetch()) {
            $brands[] = [
                'id'               => $b['id'],
                'name'             => $b['name'],
                'slogan'           => $b['slogan'] ?? '',
                'address'          => $b['address'] ?? '',
                'email'            => $b['email'] ?? '',
                'phone1'           => $b['phone1'] ?? '',
                'phone2'           => $b['phone2'] ?? '',
                'phone3'           => $b['phone3'] ?? '',
                'logo'             => $b['logo'] ?? '',
                'deliveryServices' => !empty($b['delivery_services']) ? explode(',', $b['delivery_services']) : ['Default'],
                'isDefault'        => (bool)$b['is_default']
            ];
        }

        // Expenses (Screenshot 3 Match)
        $expenses = [];
        $stmtExp = $pdo->prepare("SELECT * FROM `expenses` WHERE `merchant_id` = :mid ORDER BY `date` DESC, `created_at` DESC");
        $stmtExp->execute([':mid' => $merchantId]);
        while ($e = $stmtExp->fetch()) {
            $expenses[] = [
                'id'            => $e['id'],
                'date'          => $e['date'],
                'brand'         => $e['brand'],
                'note'          => $e['note'],
                'amount'        => (float)$e['amount'],
                'paymentMethod' => $e['payment_method']
            ];
        }

        // Team Members (Screenshot 2 Match)
        $team = [];
        $stmtTeam = $pdo->prepare("SELECT * FROM `team_members` WHERE `merchant_id` = :mid ORDER BY `created_at` ASC");
        $stmtTeam->execute([':mid' => $merchantId]);
        while ($t = $stmtTeam->fetch()) {
            $team[] = [
                'id'          => $t['id'],
                'name'        => $t['name'],
                'email'       => $t['email'],
                'phone'       => $t['phone'] ?? '',
                'role'        => $t['role'],
                'accessLevel' => $t['access_level'],
                'brandAccess' => $t['brand_access'],
                'avatar'      => $t['avatar']
            ];
        }

        echo json_encode([
            'success'          => true,
            'orders'           => $orders,
            'products'         => $products,
            'deliveryServices' => $services,
            'smsSettings'      => $sms ?: null,
            'users'            => $users,
            'payments'         => $payments,
            'brands'           => $brands,
            'expenses'         => $expenses,
            'team'             => $team,
            'storage'          => getStorageStats($pdo)
        ]);
        break;

    // 4. SAVE SINGLE ORDER (With automatic size reduction)
    case 'save_order':
        $data = getJsonInput();
        $order = $data['order'] ?? $data;
        $merchantId = $data['merchant_id'] ?? $order['merchant_id'] ?? 'usr_admin';

        if (empty($order['id'])) {
            echo json_encode(['success' => false, 'error' => 'Missing order ID']);
            exit;
        }

        $itemsJson = compactItems($order['items'] ?? []);

        $sql = "INSERT INTO `orders` (
                    `id`, `merchant_id`, `customer`, `phone`, `phone2`, `address`, `city`, `email`,
                    `service_id`, `provider`, `client_id`, `waybill`, `weight`, `delivery_charge`,
                    `total`, `paid`, `status`, `origin`, `courier_location`, `items`, `created_at`
                ) VALUES (
                    :id, :merchant_id, :customer, :phone, :phone2, :address, :city, :email,
                    :service_id, :provider, :client_id, :waybill, :weight, :delivery_charge,
                    :total, :paid, :status, :origin, :courier_location, :items, :created_at
                ) ON DUPLICATE KEY UPDATE
                    `customer` = VALUES(`customer`),
                    `phone` = VALUES(`phone`),
                    `phone2` = VALUES(`phone2`),
                    `address` = VALUES(`address`),
                    `city` = VALUES(`city`),
                    `email` = VALUES(`email`),
                    `service_id` = VALUES(`service_id`),
                    `provider` = VALUES(`provider`),
                    `client_id` = VALUES(`client_id`),
                    `waybill` = VALUES(`waybill`),
                    `weight` = VALUES(`weight`),
                    `delivery_charge` = VALUES(`delivery_charge`),
                    `total` = VALUES(`total`),
                    `paid` = VALUES(`paid`),
                    `status` = VALUES(`status`),
                    `origin` = VALUES(`origin`),
                    `courier_location` = VALUES(`courier_location`),
                    `items` = VALUES(`items`),
                    `updated_at` = NOW()";

        $stmt = $pdo->prepare($sql);
        $dateStr = $order['date'] ?? date('Y-m-d H:i:s');
        if (strlen($dateStr) == 16) $dateStr .= ':00';

        $stmt->execute([
            ':id'              => mb_substr(trim($order['id']), 0, 32),
            ':merchant_id'     => mb_substr(trim($merchantId), 0, 32),
            ':customer'        => mb_substr(trim($order['customer'] ?? ''), 0, 100),
            ':phone'           => mb_substr(trim($order['phone'] ?? ''), 0, 15),
            ':phone2'          => mb_substr(trim($order['phone2'] ?? ''), 0, 15),
            ':address'         => mb_substr(trim($order['address'] ?? ''), 0, 255),
            ':city'            => mb_substr(trim($order['city'] ?? ''), 0, 50),
            ':email'           => mb_substr(trim($order['email'] ?? ''), 0, 100),
            ':service_id'      => mb_substr(trim($order['serviceId'] ?? ''), 0, 32),
            ':provider'        => mb_substr(trim($order['provider'] ?? 'Pending Dispatch'), 0, 40),
            ':client_id'       => mb_substr(trim($order['clientId'] ?? ''), 0, 30),
            ':waybill'         => mb_substr(trim($order['waybill'] ?? ''), 0, 40),
            ':weight'          => (float)($order['weight'] ?? 0.5),
            ':delivery_charge' => (int)($order['deliveryCharge'] ?? 500),
            ':total'           => (int)($order['total'] ?? 0),
            ':paid'            => mb_substr(trim($order['paid'] ?? 'Unpaid'), 0, 10),
            ':status'          => mb_substr(trim($order['status'] ?? 'Pending'), 0, 20),
            ':origin'          => mb_substr(trim($order['origin'] ?? 'Web Storefront'), 0, 30),
            ':courier_location'=> mb_substr(trim($order['courierLocation'] ?? ''), 0, 60),
            ':items'           => $itemsJson,
            ':created_at'      => $dateStr
        ]);

        echo json_encode(['success' => true, 'order_id' => $order['id'], 'compressed_bytes' => strlen($itemsJson)]);
        break;

    // 5. BULK SYNC ORDERS (Upload from localStorage)
    case 'save_orders_bulk':
        $data = getJsonInput();
        $orders = $data['orders'] ?? [];
        $merchantId = $data['merchant_id'] ?? 'usr_admin';

        if (empty($orders)) {
            echo json_encode(['success' => true, 'saved_count' => 0]);
            exit;
        }

        $pdo->beginTransaction();
        try {
            $sql = "INSERT INTO `orders` (
                        `id`, `merchant_id`, `customer`, `phone`, `phone2`, `address`, `city`, `email`,
                        `service_id`, `provider`, `client_id`, `waybill`, `weight`, `delivery_charge`,
                        `total`, `paid`, `status`, `origin`, `courier_location`, `items`, `created_at`
                    ) VALUES (
                        :id, :merchant_id, :customer, :phone, :phone2, :address, :city, :email,
                        :service_id, :provider, :client_id, :waybill, :weight, :delivery_charge,
                        :total, :paid, :status, :origin, :courier_location, :items, :created_at
                    ) ON DUPLICATE KEY UPDATE
                        `customer` = VALUES(`customer`),
                        `phone` = VALUES(`phone`),
                        `status` = VALUES(`status`),
                        `waybill` = VALUES(`waybill`),
                        `paid` = VALUES(`paid`),
                        `total` = VALUES(`total`),
                        `items` = VALUES(`items`),
                        `updated_at` = NOW()";
            $stmt = $pdo->prepare($sql);

            $count = 0;
            foreach ($orders as $order) {
                if (empty($order['id'])) continue;
                $dateStr = $order['date'] ?? date('Y-m-d H:i:s');
                if (strlen($dateStr) == 16) $dateStr .= ':00';

                $stmt->execute([
                    ':id'              => mb_substr(trim($order['id']), 0, 32),
                    ':merchant_id'     => mb_substr(trim($merchantId), 0, 32),
                    ':customer'        => mb_substr(trim($order['customer'] ?? ''), 0, 100),
                    ':phone'           => mb_substr(trim($order['phone'] ?? ''), 0, 15),
                    ':phone2'          => mb_substr(trim($order['phone2'] ?? ''), 0, 15),
                    ':address'         => mb_substr(trim($order['address'] ?? ''), 0, 255),
                    ':city'            => mb_substr(trim($order['city'] ?? ''), 0, 50),
                    ':email'           => mb_substr(trim($order['email'] ?? ''), 0, 100),
                    ':service_id'      => mb_substr(trim($order['serviceId'] ?? ''), 0, 32),
                    ':provider'        => mb_substr(trim($order['provider'] ?? 'Pending Dispatch'), 0, 40),
                    ':client_id'       => mb_substr(trim($order['clientId'] ?? ''), 0, 30),
                    ':waybill'         => mb_substr(trim($order['waybill'] ?? ''), 0, 40),
                    ':weight'          => (float)($order['weight'] ?? 0.5),
                    ':delivery_charge' => (int)($order['deliveryCharge'] ?? 500),
                    ':total'           => (int)($order['total'] ?? 0),
                    ':paid'            => mb_substr(trim($order['paid'] ?? 'Unpaid'), 0, 10),
                    ':status'          => mb_substr(trim($order['status'] ?? 'Pending'), 0, 20),
                    ':origin'          => mb_substr(trim($order['origin'] ?? 'Direct OMS'), 0, 30),
                    ':courier_location'=> mb_substr(trim($order['courierLocation'] ?? ''), 0, 60),
                    ':items'           => compactItems($order['items'] ?? []),
                    ':created_at'      => $dateStr
                ]);
                $count++;
            }
            $pdo->commit();
            echo json_encode(['success' => true, 'saved_count' => $count]);
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    // 6. DELETE ORDER
    case 'delete_order':
        $data = getJsonInput();
        $id = $data['id'] ?? $_GET['id'] ?? '';
        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM `orders` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Missing ID']);
        }
        break;

    // 7. SAVE / UPDATE PRODUCT
    case 'save_product':
        $data = getJsonInput();
        $prod = $data['product'] ?? $data;
        $merchantId = $data['merchant_id'] ?? $prod['merchant_id'] ?? 'usr_admin';

        if (empty($prod['id'])) {
            echo json_encode(['success' => false, 'error' => 'Missing product ID']);
            exit;
        }

        $sql = "INSERT INTO `products` (`id`, `merchant_id`, `name`, `price`, `cost`, `stock`, `weight`, `sku`, `category`, `image`)
                VALUES (:id, :merchant_id, :name, :price, :cost, :stock, :weight, :sku, :category, :image)
                ON DUPLICATE KEY UPDATE
                    `name` = VALUES(`name`),
                    `price` = VALUES(`price`),
                    `cost` = VALUES(`cost`),
                    `stock` = VALUES(`stock`),
                    `weight` = VALUES(`weight`),
                    `sku` = VALUES(`sku`),
                    `category` = VALUES(`category`),
                    `image` = VALUES(`image`)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id'          => $prod['id'],
            ':merchant_id' => $merchantId,
            ':name'        => mb_substr(trim($prod['name'] ?? ''), 0, 150),
            ':price'       => (int)($prod['price'] ?? 0),
            ':cost'        => (int)($prod['cost'] ?? 0),
            ':stock'       => (int)($prod['stock'] ?? 0),
            ':weight'      => (float)($prod['weight'] ?? 0.5),
            ':sku'         => mb_substr(trim($prod['sku'] ?? ''), 0, 50),
            ':category'    => mb_substr(trim($prod['category'] ?? ''), 0, 50),
            ':image'       => $prod['image'] ?? ''
        ]);

        echo json_encode(['success' => true, 'id' => $prod['id']]);
        break;

    // 8. DELETE PRODUCT
    case 'delete_product':
        $data = getJsonInput();
        $id = $data['id'] ?? $_GET['id'] ?? '';
        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM `products` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Missing ID']);
        }
        break;

    // 9. SAVE / REGISTER USER
    case 'save_user':
        $data = getJsonInput();
        $u = $data['user'] ?? $data;

        if (empty($u['id'])) {
            echo json_encode(['success' => false, 'error' => 'Missing user ID']);
            exit;
        }

        $sql = "INSERT INTO `users` (`id`, `name`, `store_name`, `email`, `phone`, `password`, `role`, `status`, `plan`, `registered_at`, `expires_at`)
                VALUES (:id, :name, :store_name, :email, :phone, :password, :role, :status, :plan, :registered_at, :expires_at)
                ON DUPLICATE KEY UPDATE
                    `name` = VALUES(`name`),
                    `store_name` = VALUES(`store_name`),
                    `phone` = VALUES(`phone`),
                    `password` = VALUES(`password`),
                    `role` = VALUES(`role`),
                    `status` = VALUES(`status`),
                    `plan` = VALUES(`plan`),
                    `expires_at` = VALUES(`expires_at`)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id'            => $u['id'],
            ':name'          => mb_substr(trim($u['name'] ?? ''), 0, 100),
            ':store_name'    => mb_substr(trim($u['storeName'] ?? $u['name'] ?? ''), 0, 100),
            ':email'         => mb_substr(strtolower(trim($u['email'] ?? '')), 0, 100),
            ':phone'         => mb_substr(trim($u['phone'] ?? ''), 0, 15),
            ':password'      => $u['password'] ?? '123456',
            ':role'          => mb_substr(trim($u['role'] ?? 'merchant'), 0, 20),
            ':status'        => mb_substr(trim($u['status'] ?? 'trial'), 0, 20),
            ':plan'          => mb_substr(trim($u['plan'] ?? '10-Day Free Trial'), 0, 50),
            ':registered_at' => (int)($u['registeredAt'] ?? (time() * 1000)),
            ':expires_at'    => !empty($u['expiresAt']) ? (int)$u['expiresAt'] : null
        ]);

        echo json_encode(['success' => true, 'id' => $u['id']]);
        break;

    // 10. SAVE SUBSCRIPTION PAYMENT
    case 'save_payment':
        $data = getJsonInput();
        $p = $data['payment'] ?? $data;

        if (empty($p['id'])) {
            echo json_encode(['success' => false, 'error' => 'Missing payment ID']);
            exit;
        }

        $sql = "INSERT INTO `payments` (`id`, `user_id`, `store_name`, `plan`, `amount`, `payment_method`, `ref`, `slip_image`, `status`, `submitted_at`)
                VALUES (:id, :user_id, :store_name, :plan, :amount, :payment_method, :ref, :slip_image, :status, NOW())
                ON DUPLICATE KEY UPDATE
                    `status` = VALUES(`status`),
                    `reviewed_at` = NOW()";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id'             => $p['id'],
            ':user_id'        => mb_substr(trim($p['userId'] ?? ''), 0, 32),
            ':store_name'     => mb_substr(trim($p['storeName'] ?? ''), 0, 100),
            ':plan'           => mb_substr(trim($p['plan'] ?? ''), 0, 50),
            ':amount'         => (int)($p['amount'] ?? 0),
            ':payment_method' => mb_substr(trim($p['paymentMethod'] ?? 'Bank Transfer'), 0, 30),
            ':ref'            => mb_substr(trim($p['ref'] ?? ''), 0, 50),
            ':slip_image'     => $p['slipImage'] ?? null,
            ':status'         => mb_substr(trim($p['status'] ?? 'pending'), 0, 20)
        ]);

        echo json_encode(['success' => true, 'id' => $p['id']]);
        break;

    // 11. SAVE BRAND (Screenshot 1 Match)
    case 'save_brand':
        $data = getJsonInput();
        $b = $data['brand'] ?? $data;
        $merchantId = $data['merchant_id'] ?? $b['merchant_id'] ?? 'usr_admin';

        if (empty($b['id'])) {
            $b['id'] = 'brd_' . bin2hex(random_bytes(6));
        }

        // If setting as default, unset other defaults
        if (!empty($b['isDefault'])) {
            $stmtUnset = $pdo->prepare("UPDATE `brands` SET `is_default` = 0 WHERE `merchant_id` = :mid");
            $stmtUnset->execute([':mid' => $merchantId]);
        }

        $dsStr = is_array($b['deliveryServices'] ?? null) ? implode(',', $b['deliveryServices']) : ($b['deliveryServices'] ?? 'Default');

        $sql = "INSERT INTO `brands` (`id`, `merchant_id`, `name`, `slogan`, `address`, `email`, `phone1`, `phone2`, `phone3`, `logo`, `delivery_services`, `is_default`, `created_at`)
                VALUES (:id, :merchant_id, :name, :slogan, :address, :email, :phone1, :phone2, :phone3, :logo, :delivery_services, :is_default, NOW())
                ON DUPLICATE KEY UPDATE
                    `name` = VALUES(`name`),
                    `slogan` = VALUES(`slogan`),
                    `address` = VALUES(`address`),
                    `email` = VALUES(`email`),
                    `phone1` = VALUES(`phone1`),
                    `phone2` = VALUES(`phone2`),
                    `phone3` = VALUES(`phone3`),
                    `logo` = VALUES(`logo`),
                    `delivery_services` = VALUES(`delivery_services`),
                    `is_default` = VALUES(`is_default`)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id'                => $b['id'],
            ':merchant_id'       => $merchantId,
            ':name'              => mb_substr(trim($b['name'] ?? ''), 0, 100),
            ':slogan'            => mb_substr(trim($b['slogan'] ?? ''), 0, 255),
            ':address'           => mb_substr(trim($b['address'] ?? ''), 0, 255),
            ':email'             => mb_substr(trim($b['email'] ?? ''), 0, 100),
            ':phone1'            => mb_substr(trim($b['phone1'] ?? ''), 0, 20),
            ':phone2'            => mb_substr(trim($b['phone2'] ?? ''), 0, 20),
            ':phone3'            => mb_substr(trim($b['phone3'] ?? ''), 0, 20),
            ':logo'              => $b['logo'] ?? null,
            ':delivery_services' => $dsStr,
            ':is_default'        => !empty($b['isDefault']) ? 1 : 0
        ]);

        echo json_encode(['success' => true, 'id' => $b['id']]);
        break;

    // 12. DELETE BRAND
    case 'delete_brand':
        $data = getJsonInput();
        $id = $data['id'] ?? $_GET['id'] ?? '';
        $merchantId = $data['merchant_id'] ?? $_GET['merchant_id'] ?? 'usr_admin';

        $stmt = $pdo->prepare("DELETE FROM `brands` WHERE `id` = :id AND `merchant_id` = :mid");
        $stmt->execute([':id' => $id, ':mid' => $merchantId]);
        echo json_encode(['success' => true, 'deleted' => $stmt->rowCount()]);
        break;

    // 13. SAVE EXPENSE (Screenshot 3 Match)
    case 'save_expense':
        $data = getJsonInput();
        $e = $data['expense'] ?? $data;
        $merchantId = $data['merchant_id'] ?? $e['merchant_id'] ?? 'usr_admin';

        if (empty($e['id'])) {
            $e['id'] = 'exp_' . bin2hex(random_bytes(6));
        }

        $sql = "INSERT INTO `expenses` (`id`, `merchant_id`, `date`, `brand`, `note`, `amount`, `payment_method`, `created_at`)
                VALUES (:id, :merchant_id, :date, :brand, :note, :amount, :payment_method, NOW())
                ON DUPLICATE KEY UPDATE
                    `date` = VALUES(`date`),
                    `brand` = VALUES(`brand`),
                    `note` = VALUES(`note`),
                    `amount` = VALUES(`amount`),
                    `payment_method` = VALUES(`payment_method`)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id'             => $e['id'],
            ':merchant_id'    => $merchantId,
            ':date'           => $e['date'] ?? date('Y-m-d'),
            ':brand'          => mb_substr(trim($e['brand'] ?? 'SmartZone'), 0, 100),
            ':note'           => mb_substr(trim($e['note'] ?? ''), 0, 255),
            ':amount'         => (float)($e['amount'] ?? 0),
            ':payment_method' => mb_substr(trim($e['paymentMethod'] ?? 'Cash'), 0, 50)
        ]);

        echo json_encode(['success' => true, 'id' => $e['id']]);
        break;

    // 14. DELETE EXPENSE
    case 'delete_expense':
        $data = getJsonInput();
        $id = $data['id'] ?? $_GET['id'] ?? '';
        $merchantId = $data['merchant_id'] ?? $_GET['merchant_id'] ?? 'usr_admin';

        $stmt = $pdo->prepare("DELETE FROM `expenses` WHERE `id` = :id AND `merchant_id` = :mid");
        $stmt->execute([':id' => $id, ':mid' => $merchantId]);
        echo json_encode(['success' => true, 'deleted' => $stmt->rowCount()]);
        break;

    // 15. SAVE TEAM MEMBER (Screenshot 2 Match)
    case 'save_team_member':
        $data = getJsonInput();
        $t = $data['member'] ?? $data;
        $merchantId = $data['merchant_id'] ?? $t['merchant_id'] ?? 'usr_admin';

        if (empty($t['id'])) {
            $t['id'] = 'tm_' . bin2hex(random_bytes(6));
        }

        $avatar = $t['avatar'] ?? '';
        if (!$avatar && !empty($t['name'])) {
            $words = explode(' ', trim($t['name']));
            $avatar = strtoupper(substr($words[0], 0, 1) . (isset($words[1]) ? substr($words[1], 0, 1) : ''));
        }

        $sql = "INSERT INTO `team_members` (`id`, `merchant_id`, `name`, `email`, `phone`, `role`, `access_level`, `brand_access`, `avatar`, `created_at`)
                VALUES (:id, :merchant_id, :name, :email, :phone, :role, :access_level, :brand_access, :avatar, NOW())
                ON DUPLICATE KEY UPDATE
                    `name` = VALUES(`name`),
                    `email` = VALUES(`email`),
                    `phone` = VALUES(`phone`),
                    `role` = VALUES(`role`),
                    `access_level` = VALUES(`access_level`),
                    `brand_access` = VALUES(`brand_access`),
                    `avatar` = VALUES(`avatar`)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id'           => $t['id'],
            ':merchant_id'  => $merchantId,
            ':name'         => mb_substr(trim($t['name'] ?? ''), 0, 100),
            ':email'        => mb_substr(trim($t['email'] ?? ''), 0, 100),
            ':phone'        => mb_substr(trim($t['phone'] ?? ''), 0, 20),
            ':role'         => mb_substr(trim($t['role'] ?? 'Staff'), 0, 50),
            ':access_level' => mb_substr(trim($t['accessLevel'] ?? 'FULL ACCESS'), 0, 50),
            ':brand_access' => mb_substr(trim($t['brandAccess'] ?? 'No restriction'), 0, 100),
            ':avatar'       => mb_substr(trim($avatar ?: 'U'), 0, 10)
        ]);

        echo json_encode(['success' => true, 'id' => $t['id']]);
        break;

    // 16. DELETE TEAM MEMBER
    case 'delete_team_member':
        $data = getJsonInput();
        $id = $data['id'] ?? $_GET['id'] ?? '';
        $merchantId = $data['merchant_id'] ?? $_GET['merchant_id'] ?? 'usr_admin';

        $stmt = $pdo->prepare("DELETE FROM `team_members` WHERE `id` = :id AND `merchant_id` = :mid");
        $stmt->execute([':id' => $id, ':mid' => $merchantId]);
        echo json_encode(['success' => true, 'deleted' => $stmt->rowCount()]);
        break;

    default:
        echo json_encode([
            'success' => false,
            'error'   => 'Unknown action: ' . htmlspecialchars($action),
            'supported_actions' => ['ping', 'get_all', 'save_order', 'save_orders_bulk', 'delete_order', 'save_product', 'delete_product', 'save_user', 'save_payment', 'save_brand', 'delete_brand', 'save_expense', 'delete_expense', 'save_team_member', 'delete_team_member', 'optimize', 'stats']
        ]);
        break;
}
