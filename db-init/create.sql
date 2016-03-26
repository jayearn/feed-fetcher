DROP DATABASE IF EXISTS feeds;

CREATE DATABASE feeds
  DEFAULT CHARACTER SET utf8
  DEFAULT COLLATE utf8_general_ci;

USE feeds;

CREATE TABLE feed_item (
    id_feed_item BIGINT AUTO_INCREMENT PRIMARY KEY,
    guid CHAR(40) NOT NULL UNIQUE KEY,
    title VARCHAR(1024),
    summary VARCHAR(4096),
    link VARCHAR(2048),
    image_url VARCHAR(1024),
    `date` DATETIME,
    pubdate DATETIME

) ENGINE InnoDB;



COMMIT;

