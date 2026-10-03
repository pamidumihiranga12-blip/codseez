-- ====================================================================
-- CodFlow OMS - MySQL High-Efficiency Compressed Database Schema
-- Database: CodFlow-353130305fd5
-- Host: sdb-86.hosting.stackcp.net
-- Storage Quota: 1024 MB
-- Design Optimization: InnoDB ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8
-- Estimated capacity on 1024 MB quota: 2,500,000+ Orders
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- 1. USERS & MERCHANTS TABLE
CREATE TABLE IF NOT EXISTS `users` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;

-- 2. ORDERS TABLE (High compression for high volume orders)
CREATE TABLE IF NOT EXISTS `orders` (
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
    `items` TEXT NOT NULL, -- Compressed compact JSON: [{"id":"..","n":"..","p":1200,"q":1,"w":0.5}]
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_orders_merchant` (`merchant_id`),
    KEY `idx_orders_status` (`status`),
    KEY `idx_orders_waybill` (`waybill`),
    KEY `idx_orders_phone` (`phone`),
    KEY `idx_orders_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS `products` (
    `id` VARCHAR(32) NOT NULL,
    `merchant_id` VARCHAR(32) NOT NULL DEFAULT 'usr_admin',
    `name` VARCHAR(150) NOT NULL,
    `price` INT NOT NULL DEFAULT 0,
    `cost` INT NOT NULL DEFAULT 0,
    `stock` INT NOT NULL DEFAULT 0,
    `weight` DECIMAL(5,2) NOT NULL DEFAULT 0.50,
    `sku` VARCHAR(50) NULL,
    `category` VARCHAR(50) NULL,
    `image` MEDIUMTEXT NULL, -- Compressed data or image URL
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_prod_merchant` (`merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;

-- 4. DELIVERY SERVICES CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS `delivery_services` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;

-- 5. SMS SETTINGS TABLE
CREATE TABLE IF NOT EXISTS `sms_settings` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;

-- 6. SUBSCRIPTION PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS `payments` (
    `id` VARCHAR(32) NOT NULL,
    `user_id` VARCHAR(32) NOT NULL,
    `store_name` VARCHAR(100) NOT NULL,
    `plan` VARCHAR(50) NOT NULL,
    `amount` INT NOT NULL,
    `payment_method` VARCHAR(30) NOT NULL DEFAULT 'Bank Transfer',
    `ref` VARCHAR(50) NOT NULL,
    `slip_image` MEDIUMTEXT NULL, -- Compressed canvas JPEG (approx ~35KB)
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `reviewed_at` DATETIME NULL,
    PRIMARY KEY (`id`),
    KEY `idx_pay_user` (`user_id`),
    KEY `idx_pay_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;

-- 7. GENERAL SETTINGS / KEY-VALUE STORE
CREATE TABLE IF NOT EXISTS `settings` (
    `key_name` VARCHAR(64) NOT NULL,
    `merchant_id` VARCHAR(32) NOT NULL DEFAULT 'usr_admin',
    `value_json` MEDIUMTEXT NOT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`key_name`, `merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;

-- 8. BRANDS TABLE (Screenshot 1 Match)
CREATE TABLE IF NOT EXISTS `brands` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;

-- 9. EXPENSES TABLE (Screenshot 3 Match)
CREATE TABLE IF NOT EXISTS `expenses` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;

-- 10. TEAM MEMBERS TABLE (Screenshot 2 Match)
CREATE TABLE IF NOT EXISTS `team_members` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;

-- SEED INITIAL SUPER ADMIN USER (IF NOT EXISTS)
INSERT IGNORE INTO `users` (`id`, `name`, `store_name`, `email`, `phone`, `password`, `role`, `status`, `plan`, `registered_at`, `expires_at`)
VALUES (
    'usr_admin',
    'SmartZone Admin',
    'SmartZone Head Office',
    'smartzonelk101@gmail.com',
    '0786800086',
    '2007admin@',
    'admin',
    'active',
    'Enterprise Lifetime',
    1727800000000,
    NULL
);

SET FOREIGN_KEY_CHECKS = 1;
