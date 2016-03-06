DROP DATABASE IF EXISTS feeds;

CREATE DATABASE feeds;

USE feeds;

CREATE TABLE feed_item (
    id_feed_item BIGINT AUTO_INCREMENT PRIMARY KEY,
    guid VARCHAR(512) NOT NULL UNIQUE KEY,
    title VARCHAR(1024),
    summary VARCHAR(4096),
    image_url VARCHAR(1024),
    `date` VARCHAR(128),
    pubdate VARCHAR(128)

) ENGINE InnoDB;



COMMIT;

