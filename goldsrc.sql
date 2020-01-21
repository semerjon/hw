-- phpMyAdmin SQL Dump
-- version 3.5.1
-- http://www.phpmyadmin.net
--
-- Хост: 127.0.0.1
-- Время создания: Янв 21 2020 г., 08:12
-- Версия сервера: 5.5.25
-- Версия PHP: 5.2.12

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- База данных: `goldsrc`
--

-- --------------------------------------------------------

--
-- Структура таблицы `articles`
--

CREATE TABLE IF NOT EXISTS `articles` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `idAccount` smallint(5) unsigned NOT NULL,
  `category` smallint(5) unsigned NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `name` tinytext NOT NULL,
  `preview` tinyint(1) NOT NULL DEFAULT '0',
  `description` tinyint(1) NOT NULL DEFAULT '0',
  `contentsFile` tinytext NOT NULL,
  `comments` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=12 ;

--
-- Дамп данных таблицы `articles`
--

INSERT INTO `articles` (`id`, `idAccount`, `category`, `date`, `name`, `preview`, `description`, `contentsFile`, `comments`) VALUES
(8, 5, 4, '2020-01-24 04:42:30', 'Надземное метро в GTA III', 1, 1, 'article.txt', NULL),
(9, 5, 2, '2020-01-24 04:51:28', 'Open IV', 1, 1, 'article.txt', NULL),
(10, 5, 4, '2020-01-24 04:58:22', '2F2F Toyota Supra  ', 1, 1, 'article.txt', NULL),
(11, 5, 1, '2020-01-24 05:08:04', 'Открытие сайта', 1, 1, 'article.txt', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `categoriesarticles`
--

CREATE TABLE IF NOT EXISTS `categoriesarticles` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `name` tinytext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

--
-- Дамп данных таблицы `categoriesarticles`
--

INSERT INTO `categoriesarticles` (`id`, `name`) VALUES
(1, 'Новости'),
(2, 'Проекты'),
(3, 'Туториалы'),
(4, 'Разное');

-- --------------------------------------------------------

--
-- Структура таблицы `categoriesresources`
--

CREATE TABLE IF NOT EXISTS `categoriesresources` (
  `id` smallint(6) unsigned NOT NULL AUTO_INCREMENT,
  `name` tinytext NOT NULL,
  `type` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `id_2` (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=20 ;

--
-- Дамп данных таблицы `categoriesresources`
--

INSERT INTO `categoriesresources` (`id`, `name`, `type`) VALUES
(1, 'Half-Life', 1),
(2, 'Counter-Strike', 1),
(3, 'Модели оружия', 2),
(4, 'Модели игроков', 2),
(5, 'Другие модели', 2),
(6, 'Прицелы для винтовок', 3),
(7, 'Подсветка бомбы', 3),
(8, 'Болевые иконки', 3),
(9, 'Выстрелы', 3),
(10, 'HUD', 3),
(11, 'Взрывы', 3),
(12, 'Кровь', 3),
(13, 'Для карт', 4),
(14, 'Для моделей', 4),
(15, 'Для текстур', 4),
(16, 'Для спрайтов', 4),
(17, 'SDK', 4),
(18, 'Разное', 4),
(19, 'Общее', 5);

-- --------------------------------------------------------

--
-- Структура таблицы `resources`
--

CREATE TABLE IF NOT EXISTS `resources` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `name` tinytext NOT NULL,
  `idTypeResource` smallint(5) unsigned NOT NULL,
  `idCategory` smallint(5) unsigned NOT NULL,
  `idAccount` smallint(5) unsigned NOT NULL,
  `dateUpload` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `preview` tinytext,
  `description` tinyint(1) NOT NULL DEFAULT '0',
  `srcScreenshots` text,
  `srcFile` tinytext,
  `fileSize` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=26 ;

--
-- Дамп данных таблицы `resources`
--

INSERT INTO `resources` (`id`, `name`, `idTypeResource`, `idCategory`, `idAccount`, `dateUpload`, `preview`, `description`, `srcScreenshots`, `srcFile`, `fileSize`) VALUES
(1, 'crossfire', 2, 1, 1, '2017-12-07 16:34:00', 'preview.jpg', 1, '["img1.jpg","img2.jpg","img3.jpg","img4.jpg","img5.jpg"]', 'crossfire.bsp', NULL),
(2, 'cs_assault', 2, 2, 1, '2017-12-07 16:34:00', 'preview.jpg', 0, NULL, 'cs_assault.bsp', NULL),
(3, 'de_dust2', 2, 2, 1, '2017-12-07 16:34:00', 'preview.jpg', 0, NULL, 'de_dust2.bsp', NULL),
(4, 'cs_747', 2, 2, 1, '2017-11-27 16:15:15', '20171127191449_1.jpg', 1, '["img1.jpg","img2.jpg","img3.jpg","img4.jpg"]', 'cs_747.bsp', 1702788),
(5, 'Xash3D SDK', 7, 17, 1, '2017-12-08 07:22:51', 'logo.png', 1, NULL, 'xash_extras.7z', 3084767),
(6, 'Учебники по Hammer Editor (Русская версия)', 7, 13, 1, '2017-12-08 07:29:57', '34.jpg', 1, NULL, '2443_Rus_Help_VHE.rar', 4015822),
(7, 'Silver Compact AK-47', 3, 3, 1, '2017-12-10 21:29:55', '1477.jpg', 0, '["screenshot.jpg"]', '337_1477_ak47_12.rar', 1334651),
(8, 'Black Solid M4A1', 3, 3, 1, '2017-12-10 21:36:17', '1465.jpg', 0, '["screenshot.jpg"]', '328_1465_m4a1_06.rar', 1969551),
(9, 'Valmet M7883s.308', 3, 3, 1, '2017-12-10 21:39:47', '1471.jpg', 0, '["screenshot.jpg"]', '340_1471_ak47_27.rar', 1790038),
(10, 'arctic front gsg9 unit', 3, 4, 1, '2017-12-10 21:47:07', '2340.jpg', 0, '["screenshot1.jpg","screenshot2.jpg","screenshot3.jpg"]', '497_2340_gsg9_04.rar', 1469135),
(11, 'Improved Night Ops Terror', 3, 4, 1, '2017-12-10 21:54:21', '2417.jpg', 0, '["screenshot1.jpg","screenshot2.jpg"]', '517_2417_night_ops_.rar', 1456015),
(12, 'gign urban warfare unit', 3, 4, 1, '2017-12-10 21:57:18', '2393.jpg', 0, NULL, '513_2393_gign_9.rar', 1696311),
(13, 'White winter camo Arctic!', 3, 4, 1, '2017-12-10 21:57:46', '2488.jpg', 0, NULL, '531_2488_arctic_8.rar', 1445524),
(14, 'Красные T и синие CT', 3, 4, 1, '2017-12-10 22:00:17', '6153.jpg', 1, NULL, '6153_Blue_and_Red_mo.rar', 11587277),
(15, 'Звуки от Бивиса и Баттхеда', 4, 19, 1, '2017-12-10 22:08:38', '5907.jpg', 0, NULL, '5907_4340_bb.rar', 1833010),
(16, 'Озвучка из СТАЛКЕРА (Бандиты)', 4, 19, 1, '2017-12-10 22:25:46', '5903.jpg', 0, NULL, '5903_3874_banditi_ra.rar', 527334),
(17, 'cs_assault.wad', 5, 19, 1, '2017-12-10 22:32:48', NULL, 1, NULL, 'cs_assault.wad', 517360),
(18, 'cs_dust.wad', 5, 19, 1, '2017-12-10 22:33:25', NULL, 1, NULL, 'cs_dust.wad', 1055884),
(19, 'cs_office.wad', 5, 19, 1, '2017-12-10 22:33:47', NULL, 1, NULL, 'cs_office.wad', 3405860),
(20, 'Realistic blood', 6, 12, 1, '2017-12-10 22:27:26', '948.jpg', 0, NULL, '277_948_decals_3.rar', 310152),
(21, 'Blue muzzleflashes', 6, 9, 1, '2017-12-10 22:28:39', '1010.jpg', 0, NULL, '254_1010_bluemuzzle.rar', 13129),
(22, 'Standard Green Replacement HUD', 6, 10, 1, '2017-12-10 22:29:35', '1338.jpg', 0, NULL, '274_1338_Standard_G.rar', 324313),
(23, 'I''m Here LedGlow', 6, 7, 1, '2017-12-10 22:30:36', '988.jpg', 0, NULL, '281_988_im_here_-_l.rar', 6791),
(24, 'Wally 1.55b', 7, 15, 1, '2017-12-10 22:54:49', 'preview.jpg', 1, NULL, '4944_wally_155b.rar', 949930),
(25, 'Half-Life 1 engine based games', 7, 17, 1, '2017-12-10 22:58:03', NULL, 1, NULL, 'halflife-master.zip', 6677153);

-- --------------------------------------------------------

--
-- Структура таблицы `typesresources`
--

CREATE TABLE IF NOT EXISTS `typesresources` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `name` tinytext NOT NULL,
  `typeCategory` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=8 ;

--
-- Дамп данных таблицы `typesresources`
--

INSERT INTO `typesresources` (`id`, `name`, `typeCategory`) VALUES
(1, 'games', 1),
(2, 'maps', 1),
(3, 'models', 2),
(4, 'sound', 5),
(5, 'textures', 5),
(6, 'sprites', 3),
(7, 'programs', 4);

-- --------------------------------------------------------

--
-- Структура таблицы `uploadedresources`
--

CREATE TABLE IF NOT EXISTS `uploadedresources` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `name` tinytext NOT NULL,
  `idTypeResource` smallint(5) unsigned NOT NULL,
  `idCategory` smallint(5) unsigned NOT NULL,
  `idAccount` smallint(5) unsigned NOT NULL,
  `dateUpload` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `preview` tinytext,
  `description` tinyint(1) NOT NULL DEFAULT '0',
  `srcScreenshots` text,
  `srcFile` tinytext,
  `fileSize` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `email` text NOT NULL,
  `password` varchar(32) NOT NULL,
  `specialMode` tinyint(1) NOT NULL DEFAULT '0',
  `nickname` text NOT NULL,
  `avatar` tinyint(1) NOT NULL DEFAULT '0',
  `hash` varchar(32) DEFAULT NULL,
  `endAuth` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=6 ;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `specialMode`, `nickname`, `avatar`, `hash`, `endAuth`) VALUES
(1, 'root@localhost', '421aa90e079fa326b6494f812ad13e79', 1, 'Smykov', 1, NULL, NULL),
(5, 'dmitriy@localhost', 'bd80c96400c0e0d01df3bddc8229e30d', 0, 'ON_VAM_NE_D1M0N', 1, 'a0ac804445b3865b0ad2c7ce5e992f7e', '2020-01-24 04:19:32');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
