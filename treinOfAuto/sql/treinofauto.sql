-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Jan 26, 2016 at 09:33 AM
-- Server version: 5.6.17
-- PHP Version: 5.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `treinofauto`
--

-- --------------------------------------------------------

--
-- Table structure for table `gas_prices`
--

CREATE TABLE IF NOT EXISTS `gas_prices` (
  `gas_type` varchar(16) NOT NULL,
  `average` decimal(4,3) DEFAULT NULL,
  `bp` decimal(4,3) DEFAULT NULL,
  `esso` decimal(4,3) DEFAULT NULL,
  `shell` decimal(4,3) DEFAULT NULL,
  `texaco` decimal(4,3) DEFAULT NULL,
  `total` decimal(4,3) DEFAULT NULL,
  PRIMARY KEY (`gas_type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `gas_prices`
--

INSERT INTO `gas_prices` (`gas_type`, `average`, `bp`, `esso`, `shell`, `texaco`, `total`) VALUES
('benzine', '1.534', '1.539', '1.534', '1.529', '1.529', '1.539'),
('diesel', '1.144', '1.149', '1.144', '1.139', '1.139', '1.149'),
('lpg', '0.754', '0.759', '0.754', '0.739', '0.769', '0.749');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
