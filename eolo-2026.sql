-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 21-01-2026 a las 23:56:53
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `eolo`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aeronave`
--

CREATE TABLE `aeronave` (
  `Id_Aeronave` int(11) NOT NULL,
  `Matricula` varchar(20) NOT NULL,
  `Tipo` varchar(20) NOT NULL,
  `Equipo` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `aeronave`
--

INSERT INTO `aeronave` (`Id_Aeronave`, `Matricula`, `Tipo`, `Equipo`) VALUES
(1, 'XB-MMO', 'Helicoptero', 'B429'),
(2, 'XA-BBW', 'Helicoptero', 'B407'),
(3, 'N838BB', 'Avion', 'H2SB'),
(4, 'XA-FD6', 'Helicoptero', 'AI09'),
(5, 'N424T6', 'Avion', 'J45'),
(6, 'XA-RDL', 'Avion', 'LJ31'),
(7, 'N406P', 'Avion', 'LJ40'),
(8, 'XA-UBI', 'Avion', 'LJ31'),
(9, 'N323AA', 'Avion', 'H2SB'),
(10, 'N150GB', 'Avion', 'Gulfstream G150'),
(13, 'XA-PRR', 'Avion', 'DASAUL FALCON JET 50'),
(14, 'XA-LEX', 'Avion', 'LEARJET PRUEBA 1'),
(15, 'XA-ELX', 'Avion', 'LEARJET PRUEBA 2'),
(16, 'XA-UME', 'Avion', 'LEARJET PRUEBA 3'),
(17, 'XA-CLL', 'Avion', 'LEARJET PRUEBA 4'),
(19, 'XA-TRY', 'Avion', 'LEARJET PRUEBA 6'),
(20, 'N150WJ', 'Helicoptero', 'BELL PRUEBA 6'),
(21, 'XA-LMV', 'Avion', 'LEARJET PRUEBA 7'),
(22, 'XB-GTH', 'Avion', 'LEARJET PRUEBA 8'),
(23, 'XA-UJR', 'Avion', 'LEARJET PRUEBA 9'),
(25, 'XA-PED', 'Avion', 'LEARJET PRUEBA 11'),
(26, 'N40GP', 'Helicoptero', 'BELL PRUEBA 12'),
(27, 'N245MS', 'Helicoptero', 'BELL PRUEBA 13'),
(28, 'XA-XAX', 'Avion', 'LEARJET PRUEBA 13'),
(29, 'XA-VID', 'Avion', 'LEARJET PRUEBA 14'),
(30, 'N599PC', 'Helicoptero', 'BELL PRUEBA 15'),
(31, 'N578RL', 'Helicoptero', 'BELL PRUEBA 16'),
(32, 'N707MZ', 'Helicoptero', 'BELL PRUEBA 17'),
(33, 'XB-SYJ', 'Avion', 'DASAUL FALCON JET 50'),
(34, 'XA-FFU', 'Avion', 'LEARJET PRUEBA 17'),
(35, 'XA-PEM', 'Avion', 'LEARJET PRUEBA 18'),
(36, 'XA-ESE', 'Avion', 'LEARJET PRUEBA 19'),
(37, 'N97LE', 'Helicoptero', 'BELL PRUEBA 19'),
(38, 'N629MD', 'Helicoptero', 'BELL PRUEBA 20'),
(39, 'N117ME', 'Helicoptero', 'BELL PRUEBA 21'),
(40, 'N2033', 'Helicoptero', 'BELL PRUEBA 22'),
(41, 'XA-MHH', 'Avion', 'DASAULT PRUEBA 24'),
(42, 'N375DS', 'Helicoptero', 'BELL PRUEBA 24'),
(43, 'XB-SGH', 'Avion', 'DASAUL FALCON JET 50'),
(44, 'N2211LM', 'Avion', 'DASAULT PRUEBA 25'),
(47, 'XA-CHT', 'Avion', 'DASAUL FALCON JET 50'),
(48, 'XA-FFD', 'Avion', 'LEARJET PRUEBA 60'),
(49, 'XA-FFF', 'Helicoptero', 'LEARJET PRUEBA 35'),
(51, 'XA-AAA', 'Helicoptero', 'LEARJET PRUEBA 99'),
(52, 'XA-CCC', 'Helicoptero', 'LEARJET PRUEBA 98'),
(54, 'XA-BBB', 'Helicoptero', 'LEARJET PRUEBA 100'),
(55, 'XA-DDD', 'Helicoptero', 'LEARJET PRUEBA 101'),
(56, 'XA-EEE', 'Helicoptero', 'LEARJET PRUEBA 102'),
(57, 'xa-vvv', 'Helicoptero', 'LEARJET PRUEBA 90'),
(58, 'XA-RRR', 'Helicoptero', 'LEARJET PRUEBA 00'),
(60, 'XA-PPP', 'Helicoptero', 'LEARJET 91'),
(61, 'XA-NNN', 'Helicoptero', 'LEARJET 96');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aeropuertos`
--

CREATE TABLE `aeropuertos` (
  `Id_Aeropuerto` int(11) NOT NULL,
  `Codigo_IATA` varchar(3) NOT NULL,
  `Codigo_OACI` varchar(4) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Estado` varchar(50) NOT NULL,
  `Pais` varchar(50) NOT NULL,
  `Activo` tinyint(1) DEFAULT 1,
  `Fecha_Creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `aeropuertos`
--

INSERT INTO `aeropuertos` (`Id_Aeropuerto`, `Codigo_IATA`, `Codigo_OACI`, `Nombre`, `Estado`, `Pais`, `Activo`, `Fecha_Creacion`) VALUES
(1, 'ACA', 'MMAA', 'ACAPULCO', 'GUERRERO', 'Mexico', 1, '2025-10-14 06:49:38'),
(2, 'AGU', 'MMAS', 'AGUASCALIENTES', 'AGUASCALIENTES', 'Mexico', 1, '2025-10-14 06:49:38'),
(3, 'AZP', 'MMJC', 'ATIZAPÁN', 'ESTADO DE MÉXICO', 'Mexico', 1, '2025-10-14 06:49:38'),
(4, 'CSL', 'MMSL', 'CABO SAN LUCAS', 'BAJA CALIFORNIA SUR', 'Mexico', 1, '2025-10-14 06:49:38'),
(5, 'CPE', 'MMCP', 'CAMPECHE', 'CAMPECHE', 'Mexico', 1, '2025-10-14 06:49:38'),
(6, 'CUN', 'MMUN', 'CANCÚN', 'QUINTANA ROO', 'Mexico', 1, '2025-10-14 06:49:38'),
(7, 'CYW', 'MMCY', 'CELAYA', 'GUANAJUATO', 'Mexico', 1, '2025-10-14 06:49:38'),
(8, 'CTM', 'MMCM', 'CHETUMAL', 'QUINTANA ROO', 'Mexico', 1, '2025-10-14 06:49:38'),
(9, 'CZA', 'MMCT', 'CHICHEN ITZA', 'YUCATÁN', 'Mexico', 1, '2025-10-14 06:49:38'),
(10, 'CUU', 'MMCU', 'CHIHUAHUA', 'CHIHUAHUA', 'Mexico', 1, '2025-10-14 06:49:38'),
(11, 'ACN', 'MMCC', 'CIUDAD ACUÑA', 'COAHUILA', 'Mexico', 1, '2025-10-14 06:49:38'),
(12, 'CME', 'MMCE', 'CIUDAD DEL CARMEN', 'CAMPECHE', 'Mexico', 1, '2025-10-14 06:49:38'),
(13, 'CJS', 'MMCS', 'CIUDAD JUÁREZ', 'CHIHUAHUA', 'Mexico', 1, '2025-10-14 06:49:38'),
(14, 'CEN', 'MMCN', 'CIUDAD OBREGÓN', 'SONORA', 'Mexico', 1, '2025-10-14 06:49:38'),
(15, 'CVM', 'MMCV', 'CIUDAD VICTORIA', 'TAMAULIPAS', 'Mexico', 1, '2025-10-14 06:49:38'),
(16, 'CLQ', 'MMIA', 'COLIMA', 'COLIMA', 'Mexico', 1, '2025-10-14 06:49:38'),
(17, 'CZM', 'MMCZ', 'COZUMEL', 'QUINTANA ROO', 'Mexico', 1, '2025-10-14 06:49:38'),
(18, 'CVJ', 'MMCB', 'CUERNAVACA', 'MORELOS', 'Mexico', 1, '2025-10-14 06:49:38'),
(19, 'CUL', 'MMCL', 'CULIACÁN', 'SINALOA', 'Mexico', 1, '2025-10-14 06:49:38'),
(20, 'NTR', 'MMAN', 'DEL NORTE', 'NUEVO LEÓN', 'Mexico', 1, '2025-10-14 06:49:38'),
(21, 'DGO', 'MMDO', 'DURANGO', 'DURANGO', 'Mexico', 1, '2025-10-14 06:49:38'),
(22, 'ESE', 'MMES', 'ENSENADA', 'BAJA CALIFORNIA', 'Mexico', 1, '2025-10-14 06:49:38'),
(23, 'GDL', 'MMGL', 'GUADALAJARA', 'JALISCO', 'Mexico', 1, '2025-10-14 06:49:38'),
(24, 'BJX', 'MMLO', 'GUANAJUATO', 'GUANAJUATO', 'Mexico', 1, '2025-10-14 06:49:38'),
(25, 'GYM', 'MMGM', 'GUAYMAS', 'SONORA', 'Mexico', 1, '2025-10-14 06:49:38'),
(26, 'HMO', 'MMHO', 'HERMOSILLO', 'SONORA', 'Mexico', 1, '2025-10-14 06:49:38'),
(27, 'HUX', 'MMBT', 'HUATULCO', 'OAXACA', 'Mexico', 1, '2025-10-14 06:49:38'),
(28, 'ZIH', 'MMZH', 'IXTAPA - ZIHUATANEJO', 'GUERRERO', 'Mexico', 1, '2025-10-14 06:49:38'),
(29, 'IZT', 'MMIT', 'IXTEPEC', 'OAXACA', 'Mexico', 1, '2025-10-14 06:49:38'),
(30, 'JAL', 'MMJA', 'JALAPA', 'VERACRUZ', 'Mexico', 1, '2025-10-14 06:49:38'),
(31, 'LAP', 'MMLP', 'LA PAZ', 'BAJA CALIFORNIA SUR', 'Mexico', 1, '2025-10-14 06:49:38'),
(32, 'LZC', 'MMLC', 'LÁZARO CÁRDENAS', 'MICHOACAN', 'Mexico', 1, '2025-10-14 06:49:38'),
(33, 'LTO', 'MMLT', 'LORETO', 'BAJA CALIFORNIA SUR', 'Mexico', 1, '2025-10-14 06:49:38'),
(34, 'LMM', 'MMLM', 'LOS MOCHIS', 'SINALOA', 'Mexico', 1, '2025-10-14 06:49:38'),
(35, 'ZLO', 'MMZO', 'MANZANILLO', 'COLIMA', 'Mexico', 1, '2025-10-14 06:49:38'),
(36, 'MAM', 'MMMA', 'MATAMOROS', 'TAMAULIPAS', 'Mexico', 1, '2025-10-14 06:49:38'),
(37, 'MZT', 'MMMZ', 'MAZATLÁN', 'SINALOA', 'Mexico', 1, '2025-10-14 06:49:38'),
(38, 'MID', 'MMMD', 'MÉRIDA', 'YUCATÁN', 'Mexico', 1, '2025-10-14 06:49:38'),
(39, 'MXL', 'MMML', 'MEXICALI', 'BAJA CALIFORNIA', 'Mexico', 1, '2025-10-14 06:49:38'),
(40, 'MEX', 'MMMX', 'MÉXICO', 'CIUDAD DE MEXICO', 'Mexico', 1, '2025-10-14 06:49:38'),
(41, 'MTT', 'MMMT', 'MINATITLÁN', 'VERACRUZ', 'Mexico', 1, '2025-10-14 06:49:38'),
(42, 'LOV', 'MMMV', 'MONCLOVA', 'COAHUILA', 'Mexico', 1, '2025-10-14 06:49:38'),
(43, 'MTY', 'MMMY', 'MONTERREY', 'NUEVO LEÓN', 'Mexico', 1, '2025-10-14 06:49:38'),
(44, 'MLM', 'MMMM', 'MORELIA', 'MICHOACAN', 'Mexico', 1, '2025-10-14 06:49:38'),
(45, 'NOG', 'MMNG', 'NOGALES', 'SONORA', 'Mexico', 1, '2025-10-14 06:49:38'),
(46, 'NLD', 'MMNL', 'NUEVO LAREDO', 'TAMAULIPAS', 'Mexico', 1, '2025-10-14 06:49:38'),
(47, 'OAX', 'MMOX', 'OAXACA', 'OAXACA', 'Mexico', 1, '2025-10-14 06:49:38'),
(48, 'PCA', 'MMPC', 'PACHUCA', 'HIDALGO', 'Mexico', 1, '2025-10-14 06:49:38'),
(49, 'PQM', 'MMPQ', 'PALENQUE', 'CHIAPAS', 'Mexico', 1, '2025-10-14 06:49:38'),
(50, 'PDS', 'MMPG', 'PIEDRAS NEGRAS', 'COAHUILA', 'Mexico', 1, '2025-10-14 06:49:38'),
(51, 'PAZ', 'MMPA', 'POZA RICA', 'VERACRUZ', 'Mexico', 1, '2025-10-14 06:49:38'),
(52, 'PBC', 'MMPB', 'PUEBLA', 'PUEBLA', 'Mexico', 1, '2025-10-14 06:49:38'),
(53, 'PXM', 'MMPS', 'PUERTO ESCONDIDO', 'OAXACA', 'Mexico', 1, '2025-10-14 06:49:38'),
(54, 'PPE', 'MMPE', 'PUERTO PEÑASCO', 'SONORA', 'Mexico', 1, '2025-10-14 06:49:38'),
(55, 'PVR', 'MMPR', 'PUERTO VALLARTA', 'JALISCO', 'Mexico', 1, '2025-10-14 06:49:38'),
(56, 'QET', 'MMQT', 'QUERÉTARO', 'QUERÉTARO', 'Mexico', 1, '2025-10-14 06:49:38'),
(57, 'REX', 'MMRX', 'REYNOSA', 'TAMAULIPAS', 'Mexico', 1, '2025-10-14 06:49:38'),
(58, 'SLW', 'MMIO', 'SALTILLO', 'COAHUILA', 'Mexico', 1, '2025-10-14 06:49:38'),
(59, 'SFH', 'MMSF', 'SAN FELIPE', 'BAJA CALIFORNIA', 'Mexico', 1, '2025-10-14 06:49:38'),
(60, 'SJD', 'MMSD', 'SAN JOSÉ DEL CABO', 'BAJA CALIFORNIA SUR', 'Mexico', 1, '2025-10-14 06:49:38'),
(61, 'SLP', 'MMSP', 'SAN LUIS POTOSÍ', 'SAN LUIS POTOSÍ', 'Mexico', 1, '2025-10-14 06:49:38'),
(62, 'TAM', 'MMTM', 'TAMPICO', 'TAMAULIPAS', 'Mexico', 1, '2025-10-14 06:49:38'),
(63, 'TSL', 'MMTN', 'TAMUÍN', 'SAN LUIS POTOSÍ', 'Mexico', 1, '2025-10-14 06:49:38'),
(64, 'TAP', 'MMTP', 'TAPACHULA', 'CHIAPAS', 'Mexico', 1, '2025-10-14 06:49:38'),
(65, 'TCN', 'MMHC', 'TEHUACÁN', 'PUEBLA', 'Mexico', 1, '2025-10-14 06:49:38'),
(66, 'TPQ', 'MMEP', 'TEPIC', 'NAYARIT', 'Mexico', 1, '2025-10-14 06:49:38'),
(67, 'TIJ', 'MMTJ', 'TIJUANA', 'BAJA CALIFORNIA', 'Mexico', 1, '2025-10-14 06:49:38'),
(68, 'TLC', 'MMTO', 'TOLUCA', 'ESTADO DE MÉXICO', 'Mexico', 1, '2025-10-14 06:49:38'),
(69, 'TRC', 'MMTC', 'TORREÓN', 'COAHUILA', 'Mexico', 1, '2025-10-14 06:49:38'),
(70, 'TGZ', 'MMTG', 'TUXTLA GUTIÉRREZ', 'CHIAPAS', 'Mexico', 1, '2025-10-14 06:49:38'),
(71, 'UPN', 'MMPN', 'URUAPAN', 'MICHOACAN', 'Mexico', 1, '2025-10-14 06:49:38'),
(72, 'VER', 'MMVR', 'VERACRUZ', 'VERACRUZ', 'Mexico', 1, '2025-10-14 06:49:38'),
(73, 'VSA', 'MMVA', 'VILLAHERMOSA', 'TABASCO', 'Mexico', 1, '2025-10-14 06:49:38'),
(74, 'ZCL', 'MMZC', 'ZACATECAS', 'ZACATECAS', 'Mexico', 1, '2025-10-14 06:49:38'),
(75, 'ZMM', 'MMZM', 'ZAMORA', 'MICHOACAN', 'Mexico', 1, '2025-10-14 06:49:38'),
(76, 'SLM', 'MMSM', 'SANTA LUCÍA', 'ESTADO DE MÉXICO', 'Mexico', 1, '2025-10-14 06:49:38'),
(79, 'NDA', 'NDAA', 'CORDOBA', 'VERACRUZ', 'Mexico', 1, '2025-10-16 17:21:24'),
(80, 'PPP', 'PPPP', '', 'pppp', 'Mexico', 1, '2025-10-16 19:07:16'),
(81, 'MSM', 'MSMS', '', 'LUSIANA', 'USA', 1, '2025-10-23 19:16:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignacion_mantenimiento`
--

CREATE TABLE `asignacion_mantenimiento` (
  `Id_Asignacion` int(11) NOT NULL,
  `Fecha` date NOT NULL,
  `Hora` time NOT NULL,
  `Id_Aeronave` int(11) NOT NULL,
  `Id_Ultimo_Registro` int(11) NOT NULL,
  `Tipo_Cliente` varchar(100) DEFAULT NULL,
  `Tipo_Mantenimiento` enum('0','1') DEFAULT NULL,
  `Estado_Registro` enum('activo','inactivo') DEFAULT 'activo',
  `Fecha_Registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asignacion_mantenimiento`
--

INSERT INTO `asignacion_mantenimiento` (`Id_Asignacion`, `Fecha`, `Hora`, `Id_Aeronave`, `Id_Ultimo_Registro`, `Tipo_Cliente`, `Tipo_Mantenimiento`, `Estado_Registro`, `Fecha_Registro`) VALUES
(1, '2025-11-20', '23:20:00', 21, 14, 'Guarda', '0', 'inactivo', '2025-11-21 16:55:13'),
(2, '2025-11-21', '10:55:00', 28, 15, 'Aerotaxi', '1', 'activo', '2025-11-24 18:50:17'),
(3, '2025-11-24', '10:35:00', 41, 18, 'Transito', '1', 'activo', '2025-11-24 19:30:19'),
(4, '2025-11-24', '11:48:00', 15, 24, 'Handling', '0', 'activo', '2025-11-25 15:30:44'),
(5, '2025-11-26', '10:14:00', 4, 30, 'Transito', '1', 'activo', '2025-11-27 19:24:26'),
(6, '2025-11-26', '10:13:00', 15, 29, 'Handling', '1', 'activo', '2025-12-08 20:03:02'),
(7, '2025-11-25', '11:10:00', 34, 27, NULL, NULL, 'activo', '2025-11-26 16:31:47'),
(8, '2025-11-25', '11:07:00', 16, 26, NULL, NULL, 'activo', '2025-11-26 16:31:47'),
(9, '2025-11-25', '10:25:00', 23, 25, 'Aerotaxi', '0', 'activo', '2025-11-26 16:52:41'),
(10, '2025-11-20', '23:20:00', 21, 14, 'Transito', '0', 'activo', '2025-11-26 16:36:48'),
(11, '2025-11-08', '10:06:00', 47, 9, 'Guarda', '1', 'activo', '2025-11-26 16:36:55'),
(12, '2025-11-07', '10:02:00', 2, 8, NULL, NULL, 'activo', '2025-11-26 16:31:47'),
(13, '2025-11-07', '09:54:00', 36, 5, NULL, NULL, 'activo', '2025-11-26 16:31:47'),
(14, '2025-11-07', '09:53:00', 17, 3, NULL, NULL, 'activo', '2025-11-26 16:31:47'),
(15, '2025-11-27', '13:18:00', 49, 31, 'Transito', '1', 'activo', '2025-11-27 19:24:44'),
(16, '2025-12-02', '12:27:00', 51, 33, 'Guarda', '0', 'inactivo', '2025-12-02 07:32:40'),
(17, '2025-12-02', '02:51:00', 52, 35, 'Transito', '0', 'inactivo', '2025-12-02 07:54:25'),
(18, '2025-12-02', '12:43:00', 51, 38, 'Transito', '0', 'activo', '2025-12-03 05:47:38'),
(19, '2025-12-03', '00:20:00', 54, 43, 'Transito', '1', 'activo', '2025-12-03 07:02:48'),
(20, '2025-12-03', '00:14:00', 54, 42, NULL, NULL, 'inactivo', '2025-12-03 06:24:03'),
(21, '2025-12-03', '00:05:00', 49, 41, 'Guarda', '0', 'activo', '2025-12-03 07:02:42'),
(22, '2025-12-02', '23:52:00', 48, 40, 'Transito', '0', 'activo', '2025-12-03 07:02:34'),
(23, '2025-12-02', '23:51:00', 52, 39, 'Transito', '1', 'activo', '2025-12-03 07:02:27'),
(24, '2025-11-24', '10:40:00', 15, 22, NULL, NULL, 'inactivo', '2025-12-03 06:24:03'),
(25, '2025-11-24', '10:40:00', 15, 20, NULL, NULL, 'inactivo', '2025-12-03 06:24:03'),
(26, '2025-11-24', '10:30:00', 41, 16, NULL, NULL, 'inactivo', '2025-12-03 06:24:03'),
(27, '2025-11-13', '10:20:00', 21, 12, NULL, NULL, 'inactivo', '2025-12-03 06:24:03'),
(28, '2025-11-08', '10:12:00', 15, 11, NULL, NULL, 'activo', '2025-12-03 06:24:04'),
(29, '2025-11-07', '09:53:00', 15, 4, NULL, NULL, 'activo', '2025-12-03 06:24:04'),
(30, '2025-11-07', '09:51:00', 47, 2, NULL, NULL, 'activo', '2025-12-03 06:24:04'),
(31, '2025-11-07', '09:51:00', 2, 1, NULL, NULL, 'activo', '2025-12-03 06:24:04'),
(32, '2025-12-03', '00:31:00', 52, 44, 'Guarda', '0', 'activo', '2025-12-03 07:02:54'),
(33, '2025-12-03', '00:47:00', 6, 45, 'Aerotaxi', '0', 'activo', '2025-12-08 20:02:31'),
(34, '2025-12-03', '01:01:00', 15, 51, 'Handling', '0', 'activo', '2025-12-08 16:04:26'),
(35, '2025-12-03', '00:55:00', 35, 49, 'Transito', '0', 'activo', '2025-12-04 07:14:50'),
(36, '2025-12-03', '00:50:00', 14, 48, 'Aerotaxi', '1', 'activo', '2025-12-08 20:02:12'),
(37, '2025-12-03', '00:49:00', 6, 47, 'Aerotaxi', '1', 'activo', '2025-12-08 20:02:21'),
(38, '2025-12-03', '01:18:00', 55, 52, 'Aerotaxi', '0', 'activo', '2025-12-03 07:23:32'),
(39, '2025-12-03', '01:41:00', 56, 53, 'Transito', '0', 'activo', '2025-12-03 07:46:35'),
(40, '2025-12-03', '02:08:00', 57, 54, 'Transito', '1', 'activo', '2025-12-03 08:12:39'),
(41, '2025-12-04', '23:31:00', 58, 56, 'Aerotaxi', '1', 'activo', '2025-12-04 07:14:40'),
(42, '2025-12-04', '00:47:00', 60, 64, 'Transito', '1', 'activo', '2025-12-04 16:27:12'),
(43, '2025-12-04', '01:10:00', 54, 65, 'Transito', '1', 'activo', '2025-12-04 07:58:57'),
(44, '2025-12-04', '22:23:00', 15, 67, 'Guarda', '0', 'activo', '2025-12-04 16:27:02'),
(45, '2025-12-08', '10:02:00', 51, 73, 'Guarda', '0', 'activo', '2025-12-08 20:01:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `componentewk`
--

CREATE TABLE `componentewk` (
  `Id_Componete_Wk` int(11) NOT NULL,
  `Identificador_Componente` varchar(100) NOT NULL,
  `Id_Walk` int(11) DEFAULT NULL,
  `Id_Aeronave` int(11) NOT NULL,
  `derecho` tinyint(1) DEFAULT 0,
  `izquierdo` tinyint(1) DEFAULT 0,
  `golpe` tinyint(1) DEFAULT 0,
  `rayon` tinyint(1) DEFAULT 0,
  `fisura` tinyint(1) DEFAULT 0,
  `quebrado` tinyint(1) DEFAULT 0,
  `pinturaCuarteada` tinyint(4) DEFAULT 0,
  `otroDano` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `componentewk`
--

INSERT INTO `componentewk` (`Id_Componete_Wk`, `Identificador_Componente`, `Id_Walk`, `Id_Aeronave`, `derecho`, `izquierdo`, `golpe`, `rayon`, `fisura`, `quebrado`, `pinturaCuarteada`, `otroDano`) VALUES
(1, 'puertas', 1, 1, 1, 1, 0, 1, 0, 0, 0, 0),
(2, 'esqui', 1, 1, 1, 1, 0, 1, 0, 0, 0, 0),
(3, 'palas', 1, 1, 1, 1, 0, 0, 0, 0, 1, 0),
(4, 'rotor', 1, 1, 0, 0, 0, 1, 0, 0, 0, 0),
(5, 'fuselaje', 1, 1, 0, 0, 0, 0, 0, 0, 0, 0),
(6, 'boom', 1, 1, 0, 0, 0, 0, 0, 0, 0, 0),
(7, 'estabilizadores', 1, 1, 0, 0, 0, 0, 0, 0, 0, 0),
(8, 'parabrisas', 1, 1, 0, 0, 0, 0, 0, 0, 0, 0),
(17, 'fuselaje', 2, 2, 1, 1, 0, 1, 0, 0, 0, 0),
(18, 'puertas', 2, 2, 1, 1, 0, 1, 0, 0, 0, 0),
(19, 'esqui', 2, 2, 1, 1, 0, 1, 0, 0, 0, 0),
(20, 'palas', 2, 2, 0, 0, 0, 1, 0, 0, 0, 0),
(21, 'estabilizadores', 2, 2, 0, 0, 0, 1, 0, 0, 0, 0),
(22, 'rotor', 2, 2, 0, 0, 0, 1, 0, 0, 0, 0),
(23, 'parabrisas', 2, 2, 1, 1, 0, 1, 0, 0, 0, 0),
(24, 'boom', 2, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(25, 'tren_nariz', 3, 3, 0, 0, 0, 1, 0, 0, 0, 0),
(26, 'parabrisas_limpiadores', 3, 3, 1, 1, 0, 1, 0, 0, 0, 0),
(27, 'radomo', 3, 3, 1, 1, 0, 1, 1, 1, 1, 0),
(28, 'fuselaje', 3, 3, 1, 0, 0, 1, 0, 1, 1, 0),
(29, 'aleta', 3, 3, 1, 1, 0, 1, 1, 1, 1, 0),
(30, 'punta_ala', 3, 3, 1, 1, 0, 1, 0, 1, 1, 0),
(31, 'borde_ataque', 3, 3, 1, 1, 0, 1, 1, 1, 1, 0),
(32, 'motor', 3, 3, 1, 0, 0, 1, 0, 0, 1, 0),
(33, 'estabilizador_vertical', 3, 3, 1, 1, 0, 1, 0, 0, 1, 0),
(34, 'compuertas_tren', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(35, 'tubo_pitot', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(36, 'antena', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(37, 'aleron', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(38, 'compensador_aleron', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(39, 'mechas_descarga', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(40, 'luces_carretero', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(41, 'luces_navegacion', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(42, 'tren_principal', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(43, 'valvulas_servicio', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(44, 'timon_direccion', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(45, 'compensador_timon_direccion', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(46, 'estabilizador_horizontal', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(47, 'timon_profundidad', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(48, 'compensador_timon_profundidad', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(49, 'borde_empenaje', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(50, 'alas_delta', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0),
(51, 'fuselaje', 4, 4, 1, 1, 0, 1, 0, 0, 0, 0),
(52, 'esqui', 4, 4, 1, 1, 0, 1, 0, 0, 0, 0),
(53, 'palas', 4, 4, 1, 1, 0, 1, 0, 0, 0, 0),
(54, 'rotor', 4, 4, 1, 1, 0, 1, 0, 0, 0, 0),
(55, 'parabrisas', 4, 4, 1, 1, 0, 1, 0, 0, 0, 0),
(56, 'puertas', 4, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(57, 'boom', 4, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(58, 'estabilizadores', 4, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(85, 'tren_nariz', 6, 6, 0, 0, 0, 1, 0, 0, 0, 0),
(86, 'radomo', 6, 6, 1, 1, 0, 1, 0, 0, 1, 0),
(87, 'fuselaje', 6, 6, 1, 0, 0, 0, 0, 0, 1, 0),
(88, 'aleta', 6, 6, 1, 1, 0, 1, 0, 0, 1, 0),
(89, 'punta_ala', 6, 6, 1, 1, 0, 0, 0, 0, 1, 0),
(90, 'borde_ataque', 6, 6, 1, 1, 0, 1, 0, 0, 0, 0),
(91, 'motor', 6, 6, 1, 1, 0, 1, 0, 0, 1, 0),
(92, 'borde_empenaje', 6, 6, 1, 1, 0, 1, 0, 0, 1, 0),
(93, 'compuertas_tren', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(94, 'parabrisas_limpiadores', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(95, 'tubo_pitot', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(96, 'antena', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(97, 'aleron', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(98, 'compensador_aleron', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(99, 'mechas_descarga', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(100, 'luces_carretero', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(101, 'luces_navegacion', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(102, 'tren_principal', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(103, 'valvulas_servicio', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(104, 'estabilizador_vertical', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(105, 'timon_direccion', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(106, 'compensador_timon_direccion', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(107, 'estabilizador_horizontal', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(108, 'timon_profundidad', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(109, 'compensador_timon_profundidad', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(110, 'alas_delta', 6, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(111, 'parabrisas_limpiadores', 7, 7, 1, 1, 0, 1, 0, 0, 0, 0),
(112, 'radomo', 7, 7, 1, 1, 0, 1, 0, 0, 0, 0),
(113, 'fuselaje', 7, 7, 1, 1, 0, 1, 0, 0, 0, 0),
(114, 'aleta', 7, 7, 1, 1, 0, 1, 0, 0, 0, 0),
(115, 'punta_ala', 7, 7, 1, 1, 0, 1, 0, 0, 1, 0),
(116, 'borde_ataque', 7, 7, 1, 1, 0, 1, 0, 0, 0, 0),
(117, 'motor', 7, 7, 1, 1, 0, 1, 0, 0, 0, 0),
(118, 'borde_empenaje', 7, 7, 1, 1, 0, 1, 0, 0, 0, 0),
(119, 'tren_nariz', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(120, 'compuertas_tren', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(121, 'tubo_pitot', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(122, 'antena', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(123, 'aleron', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(124, 'compensador_aleron', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(125, 'mechas_descarga', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(126, 'luces_carretero', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(127, 'luces_navegacion', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(128, 'tren_principal', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(129, 'valvulas_servicio', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(130, 'estabilizador_vertical', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(131, 'timon_direccion', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(132, 'compensador_timon_direccion', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(133, 'estabilizador_horizontal', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(134, 'timon_profundidad', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(135, 'compensador_timon_profundidad', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(136, 'alas_delta', 7, 7, 0, 0, 0, 0, 0, 0, 0, 0),
(189, 'tren_nariz', 9, 9, 0, 0, 0, 1, 0, 0, 1, 0),
(190, 'parabrisas_limpiadores', 9, 9, 1, 1, 0, 1, 0, 0, 0, 0),
(191, 'radomo', 9, 9, 1, 1, 0, 1, 0, 0, 1, 0),
(192, 'fuselaje', 9, 9, 1, 1, 0, 1, 0, 0, 1, 0),
(193, 'aleta', 9, 9, 1, 1, 1, 1, 0, 0, 1, 0),
(194, 'aleron', 9, 9, 1, 0, 1, 1, 0, 0, 1, 0),
(195, 'punta_ala', 9, 9, 1, 1, 0, 1, 0, 0, 1, 0),
(196, 'borde_ataque', 9, 9, 1, 1, 0, 1, 0, 0, 0, 0),
(197, 'motor', 9, 9, 1, 1, 0, 1, 0, 0, 1, 0),
(198, 'borde_empenaje', 9, 9, 1, 1, 0, 1, 0, 0, 0, 0),
(199, 'compuertas_tren', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0),
(200, 'tubo_pitot', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0),
(201, 'antena', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0),
(202, 'compensador_aleron', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0),
(203, 'mechas_descarga', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0),
(204, 'luces_carretero', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0),
(205, 'luces_navegacion', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0),
(206, 'tren_principal', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0),
(207, 'valvulas_servicio', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0),
(208, 'estabilizador_vertical', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0),
(209, 'timon_direccion', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0),
(210, 'compensador_timon_direccion', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0),
(211, 'estabilizador_horizontal', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0),
(212, 'timon_profundidad', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0),
(213, 'compensador_timon_profundidad', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0),
(214, 'alas_delta', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0),
(241, 'tren_nariz', 8, 8, 0, 0, 1, 1, 0, 0, 0, 0),
(242, 'compuertas_tren', 8, 8, 0, 0, 0, 1, 0, 0, 0, 0),
(243, 'radomo', 8, 8, 0, 0, 0, 1, 0, 0, 1, 0),
(244, 'fuselaje', 8, 8, 1, 1, 0, 1, 0, 0, 1, 0),
(245, 'aleta', 8, 8, 1, 1, 0, 1, 0, 0, 1, 0),
(246, 'punta_ala', 8, 8, 1, 1, 0, 1, 0, 0, 1, 0),
(247, 'borde_ataque', 8, 8, 1, 1, 0, 1, 0, 0, 0, 0),
(248, 'motor', 8, 8, 1, 1, 0, 1, 0, 0, 1, 0),
(249, 'borde_empenaje', 8, 8, 1, 0, 0, 1, 0, 0, 0, 0),
(250, 'parabrisas_limpiadores', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(251, 'tubo_pitot', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(252, 'antena', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(253, 'aleron', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(254, 'compensador_aleron', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(255, 'mechas_descarga', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(256, 'luces_carretero', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(257, 'luces_navegacion', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(258, 'tren_principal', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(259, 'valvulas_servicio', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(260, 'estabilizador_vertical', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(261, 'timon_direccion', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(262, 'compensador_timon_direccion', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(263, 'estabilizador_horizontal', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(264, 'timon_profundidad', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(265, 'compensador_timon_profundidad', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(266, 'alas_delta', 8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(317, 'fuselaje', 12, 2, 1, 0, 0, 0, 0, 0, 0, 0),
(318, 'puertas', 12, 2, 0, 1, 0, 0, 0, 0, 0, 0),
(319, 'boom', 12, 2, 0, 0, 0, 0, 0, 1, 0, 0),
(320, 'estabilizadores', 12, 2, 0, 0, 0, 0, 0, 1, 0, 0),
(321, 'rotor', 12, 2, 1, 0, 1, 0, 0, 0, 0, 0),
(322, 'esqui', 12, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(323, 'palas', 12, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(324, 'parabrisas', 12, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(325, 'tren_nariz', 10, 10, 0, 0, 0, 1, 0, 0, 0, 0),
(326, 'parabrisas_limpiadores', 10, 10, 1, 1, 0, 1, 0, 0, 0, 0),
(327, 'radomo', 10, 10, 1, 1, 0, 1, 1, 1, 1, 0),
(328, 'fuselaje', 10, 10, 1, 1, 1, 1, 1, 1, 1, 1),
(329, 'borde_empenaje', 10, 10, 1, 1, 1, 1, 1, 1, 1, 1),
(330, 'alas_delta', 10, 10, 1, 1, 1, 1, 1, 1, 1, 1),
(331, 'compuertas_tren', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(332, 'tubo_pitot', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(333, 'antena', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(334, 'aleta', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(335, 'aleron', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(336, 'compensador_aleron', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(337, 'mechas_descarga', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(338, 'punta_ala', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(339, 'luces_carretero', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(340, 'luces_navegacion', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(341, 'borde_ataque', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(342, 'tren_principal', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(343, 'valvulas_servicio', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(344, 'motor', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(345, 'estabilizador_vertical', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(346, 'timon_direccion', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(347, 'compensador_timon_direccion', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(348, 'estabilizador_horizontal', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(349, 'timon_profundidad', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(350, 'compensador_timon_profundidad', 10, 10, 0, 0, 0, 0, 0, 0, 0, 0),
(351, 'fuselaje', 13, 2, 1, 0, 0, 0, 0, 0, 0, 0),
(352, 'esqui', 13, 2, 0, 0, 0, 1, 0, 0, 0, 0),
(353, 'boom', 13, 2, 0, 1, 0, 0, 0, 0, 0, 0),
(354, 'parabrisas', 13, 2, 0, 0, 0, 1, 0, 0, 0, 0),
(355, 'puertas', 13, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(356, 'palas', 13, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(357, 'estabilizadores', 13, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(358, 'rotor', 13, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(359, 'fuselaje', 14, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(360, 'puertas', 14, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(361, 'esqui', 14, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(362, 'palas', 14, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(363, 'boom', 14, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(364, 'estabilizadores', 14, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(365, 'rotor', 14, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(366, 'parabrisas', 14, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(393, 'fuselaje', 16, 2, 1, 0, 0, 0, 0, 0, 0, 0),
(394, 'palas', 16, 2, 0, 1, 0, 1, 0, 0, 0, 0),
(395, 'rotor', 16, 2, 0, 1, 0, 0, 0, 0, 0, 0),
(396, 'puertas', 16, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(397, 'esqui', 16, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(398, 'boom', 16, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(399, 'estabilizadores', 16, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(400, 'parabrisas', 16, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(531, 'compuertas_tren', 15, 6, 1, 0, 0, 0, 0, 0, 0, 0),
(532, 'tubo_pitot', 15, 6, 0, 1, 0, 0, 0, 0, 0, 0),
(533, 'valvulas_servicio', 15, 6, 0, 0, 1, 0, 0, 0, 0, 0),
(534, 'compensador_timon_direccion', 15, 6, 0, 0, 0, 1, 0, 0, 0, 0),
(535, 'tren_nariz', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(536, 'parabrisas_limpiadores', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(537, 'radomo', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(538, 'fuselaje', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(539, 'antena', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(540, 'aleta', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(541, 'aleron', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(542, 'compensador_aleron', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(543, 'mechas_descarga', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(544, 'punta_ala', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(545, 'luces_carretero', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(546, 'luces_navegacion', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(547, 'borde_ataque', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(548, 'tren_principal', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(549, 'motor', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(550, 'estabilizador_vertical', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(551, 'timon_direccion', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(552, 'estabilizador_horizontal', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(553, 'timon_profundidad', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(554, 'compensador_timon_profundidad', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(555, 'borde_empenaje', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(556, 'alas_delta', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(565, 'fuselaje', 17, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(566, 'puertas', 17, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(567, 'esqui', 17, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(568, 'palas', 17, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(569, 'boom', 17, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(570, 'estabilizadores', 17, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(571, 'rotor', 17, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(572, 'parabrisas', 17, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(625, 'tren_nariz', 18, 6, 1, 0, 0, 0, 0, 0, 0, 0),
(626, 'compuertas_tren', 18, 6, 0, 1, 0, 0, 0, 0, 0, 0),
(627, 'fuselaje', 18, 6, 1, 0, 0, 0, 0, 0, 0, 0),
(628, 'aleron', 18, 6, 0, 1, 0, 0, 0, 0, 0, 0),
(629, 'motor', 18, 6, 0, 1, 0, 0, 0, 0, 0, 0),
(630, 'estabilizador_vertical', 18, 6, 1, 0, 0, 0, 0, 0, 0, 0),
(631, 'compensador_timon_profundidad', 18, 6, 0, 1, 0, 0, 0, 0, 0, 0),
(632, 'parabrisas_limpiadores', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(633, 'radomo', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(634, 'tubo_pitot', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(635, 'antena', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(636, 'aleta', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(637, 'compensador_aleron', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(638, 'mechas_descarga', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(639, 'punta_ala', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(640, 'luces_carretero', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(641, 'luces_navegacion', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(642, 'borde_ataque', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(643, 'tren_principal', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(644, 'valvulas_servicio', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(645, 'timon_direccion', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(646, 'compensador_timon_direccion', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(647, 'estabilizador_horizontal', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(648, 'timon_profundidad', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(649, 'borde_empenaje', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(650, 'alas_delta', 18, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(659, 'fuselaje', 19, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(660, 'puertas', 19, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(661, 'esqui', 19, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(662, 'palas', 19, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(663, 'boom', 19, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(664, 'estabilizadores', 19, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(665, 'rotor', 19, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(666, 'parabrisas', 19, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(745, 'tren_nariz', 20, 8, 0, 1, 0, 0, 0, 0, 0, 0),
(746, 'fuselaje', 20, 8, 0, 1, 0, 0, 0, 0, 0, 0),
(747, 'aleta', 20, 8, 0, 1, 0, 0, 0, 0, 0, 0),
(748, 'motor', 20, 8, 0, 1, 0, 0, 0, 0, 0, 0),
(749, 'estabilizador_vertical', 20, 8, 0, 1, 0, 0, 0, 0, 0, 0),
(750, 'compuertas_tren', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(751, 'parabrisas_limpiadores', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(752, 'radomo', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(753, 'tubo_pitot', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(754, 'antena', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(755, 'aleron', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(756, 'compensador_aleron', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(757, 'mechas_descarga', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(758, 'punta_ala', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(759, 'luces_carretero', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(760, 'luces_navegacion', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(761, 'borde_ataque', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(762, 'tren_principal', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(763, 'valvulas_servicio', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(764, 'timon_direccion', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(765, 'compensador_timon_direccion', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(766, 'estabilizador_horizontal', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(767, 'timon_profundidad', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(768, 'compensador_timon_profundidad', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(769, 'borde_empenaje', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(770, 'alas_delta', 20, 8, 0, 0, 0, 0, 0, 0, 0, 0),
(771, 'fuselaje', 21, 2, 1, 0, 0, 0, 0, 0, 0, 0),
(772, 'palas', 21, 2, 0, 1, 0, 0, 0, 0, 0, 0),
(773, 'boom', 21, 2, 0, 0, 0, 0, 1, 1, 0, 0),
(774, 'parabrisas', 21, 2, 0, 0, 0, 0, 0, 0, 0, 1),
(775, 'puertas', 21, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(776, 'esqui', 21, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(777, 'estabilizadores', 21, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(778, 'rotor', 21, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(779, 'fuselaje', 22, 49, 1, 0, 0, 0, 0, 0, 0, 0),
(780, 'esqui', 22, 49, 0, 1, 0, 0, 0, 0, 0, 0),
(781, 'estabilizadores', 22, 49, 1, 1, 0, 0, 1, 0, 0, 0),
(782, 'puertas', 22, 49, 0, 0, 0, 0, 0, 0, 0, 0),
(783, 'palas', 22, 49, 0, 0, 0, 0, 0, 0, 0, 0),
(784, 'boom', 22, 49, 0, 0, 0, 0, 0, 0, 0, 0),
(785, 'rotor', 22, 49, 0, 0, 0, 0, 0, 0, 0, 0),
(786, 'parabrisas', 22, 49, 0, 0, 0, 0, 0, 0, 0, 0),
(787, 'fuselaje', 23, 49, 1, 0, 0, 0, 0, 0, 0, 0),
(788, 'parabrisas', 23, 49, 0, 0, 1, 0, 0, 0, 0, 0),
(789, 'puertas', 23, 49, 0, 0, 0, 0, 0, 0, 0, 0),
(790, 'esqui', 23, 49, 0, 0, 0, 0, 0, 0, 0, 0),
(791, 'palas', 23, 49, 0, 0, 0, 0, 0, 0, 0, 0),
(792, 'boom', 23, 49, 0, 0, 0, 0, 0, 0, 0, 0),
(793, 'estabilizadores', 23, 49, 0, 0, 0, 0, 0, 0, 0, 0),
(794, 'rotor', 23, 49, 0, 0, 0, 0, 0, 0, 0, 0),
(803, 'fuselaje', 24, 51, 1, 0, 0, 0, 0, 0, 0, 0),
(804, 'esqui', 24, 51, 0, 0, 1, 0, 0, 0, 0, 0),
(805, 'parabrisas', 24, 51, 1, 0, 0, 0, 0, 0, 0, 0),
(806, 'puertas', 24, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(807, 'palas', 24, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(808, 'boom', 24, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(809, 'estabilizadores', 24, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(810, 'rotor', 24, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(819, 'fuselaje', 25, 51, 1, 0, 0, 0, 0, 0, 0, 0),
(820, 'parabrisas', 25, 51, 0, 0, 0, 0, 0, 0, 1, 0),
(821, 'puertas', 25, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(822, 'esqui', 25, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(823, 'palas', 25, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(824, 'boom', 25, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(825, 'estabilizadores', 25, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(826, 'rotor', 25, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(827, 'fuselaje', 26, 51, 1, 0, 0, 0, 0, 0, 0, 0),
(828, 'parabrisas', 26, 51, 0, 1, 0, 0, 0, 0, 0, 0),
(829, 'puertas', 26, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(830, 'esqui', 26, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(831, 'palas', 26, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(832, 'boom', 26, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(833, 'estabilizadores', 26, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(834, 'rotor', 26, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(835, 'fuselaje', 27, 55, 1, 0, 0, 0, 0, 0, 0, 0),
(836, 'esqui', 27, 55, 0, 1, 0, 0, 0, 0, 0, 0),
(837, 'estabilizadores', 27, 55, 0, 0, 1, 0, 0, 0, 0, 0),
(838, 'puertas', 27, 55, 0, 0, 0, 0, 0, 0, 0, 0),
(839, 'palas', 27, 55, 0, 0, 0, 0, 0, 0, 0, 0),
(840, 'boom', 27, 55, 0, 0, 0, 0, 0, 0, 0, 0),
(841, 'rotor', 27, 55, 0, 0, 0, 0, 0, 0, 0, 0),
(842, 'parabrisas', 27, 55, 0, 0, 0, 0, 0, 0, 0, 0),
(851, 'fuselaje', 28, 56, 1, 0, 0, 0, 0, 0, 0, 0),
(852, 'palas', 28, 56, 0, 1, 1, 0, 0, 0, 0, 0),
(853, 'estabilizadores', 28, 56, 1, 0, 0, 0, 0, 0, 0, 0),
(854, 'parabrisas', 28, 56, 0, 0, 0, 1, 0, 0, 0, 0),
(855, 'puertas', 28, 56, 0, 0, 0, 0, 0, 0, 0, 0),
(856, 'esqui', 28, 56, 0, 0, 0, 0, 0, 0, 0, 0),
(857, 'boom', 28, 56, 0, 0, 0, 0, 0, 0, 0, 0),
(858, 'rotor', 28, 56, 0, 0, 0, 0, 0, 0, 0, 0),
(867, 'fuselaje', 29, 57, 1, 0, 0, 0, 0, 0, 0, 0),
(868, 'esqui', 29, 57, 0, 1, 0, 0, 0, 0, 0, 0),
(869, 'boom', 29, 57, 0, 1, 0, 0, 0, 0, 0, 0),
(870, 'estabilizadores', 29, 57, 0, 1, 1, 0, 0, 0, 0, 0),
(871, 'puertas', 29, 57, 0, 0, 0, 0, 0, 0, 0, 0),
(872, 'palas', 29, 57, 0, 0, 0, 0, 0, 0, 0, 0),
(873, 'rotor', 29, 57, 0, 0, 0, 0, 0, 0, 0, 0),
(874, 'parabrisas', 29, 57, 0, 0, 0, 0, 0, 0, 0, 0),
(875, 'fuselaje', 30, 58, 1, 0, 0, 0, 0, 0, 0, 0),
(876, 'esqui', 30, 58, 0, 1, 0, 0, 0, 0, 0, 0),
(877, 'boom', 30, 58, 0, 0, 1, 0, 0, 0, 0, 0),
(878, 'estabilizadores', 30, 58, 0, 1, 0, 0, 0, 0, 0, 0),
(879, 'puertas', 30, 58, 0, 0, 0, 0, 0, 0, 0, 0),
(880, 'palas', 30, 58, 0, 0, 0, 0, 0, 0, 0, 0),
(881, 'rotor', 30, 58, 0, 0, 0, 0, 0, 0, 0, 0),
(882, 'parabrisas', 30, 58, 0, 0, 0, 0, 0, 0, 0, 0),
(891, 'fuselaje', 31, 51, 1, 0, 0, 0, 0, 0, 0, 0),
(892, 'esqui', 31, 51, 0, 1, 0, 0, 0, 0, 0, 0),
(893, 'palas', 31, 51, 0, 1, 1, 0, 0, 0, 0, 0),
(894, 'estabilizadores', 31, 51, 0, 1, 0, 0, 0, 0, 0, 0),
(895, 'puertas', 31, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(896, 'boom', 31, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(897, 'rotor', 31, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(898, 'parabrisas', 31, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(899, 'fuselaje', 32, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(900, 'puertas', 32, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(901, 'esqui', 32, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(902, 'palas', 32, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(903, 'boom', 32, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(904, 'estabilizadores', 32, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(905, 'rotor', 32, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(906, 'parabrisas', 32, 4, 0, 0, 0, 0, 0, 0, 0, 0),
(915, 'puertas', 33, 51, 0, 1, 1, 0, 0, 0, 0, 0),
(916, 'palas', 33, 51, 0, 1, 0, 0, 0, 0, 0, 0),
(917, 'fuselaje', 33, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(918, 'esqui', 33, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(919, 'boom', 33, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(920, 'estabilizadores', 33, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(921, 'rotor', 33, 51, 0, 0, 0, 0, 0, 0, 0, 0),
(922, 'parabrisas', 33, 51, 0, 0, 0, 0, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `control_pernocta`
--

CREATE TABLE `control_pernocta` (
  `Id_Control` int(11) NOT NULL,
  `Fecha` date NOT NULL,
  `HoraInicial` time DEFAULT NULL,
  `HoraFinal` time DEFAULT NULL,
  `Id_Aeronave` int(11) NOT NULL,
  `Hangar` enum('H1','H2') DEFAULT NULL,
  `Id_Ultimo_Registro` int(11) DEFAULT NULL,
  `EmpresaProcedencia` varchar(255) DEFAULT NULL,
  `Observaciones` varchar(500) DEFAULT NULL,
  `Persona_Registro` varchar(100) DEFAULT NULL,
  `Estado_Registro` enum('activo','inactivo') DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `control_pernocta`
--

INSERT INTO `control_pernocta` (`Id_Control`, `Fecha`, `HoraInicial`, `HoraFinal`, `Id_Aeronave`, `Hangar`, `Id_Ultimo_Registro`, `EmpresaProcedencia`, `Observaciones`, `Persona_Registro`, `Estado_Registro`) VALUES
(1, '2025-11-07', '10:02:00', '10:03:00', 2, 'H2', 8, '', '', 'JUAN PEREZ', 'inactivo'),
(2, '2025-11-07', '09:54:00', '10:03:00', 36, 'H2', 5, '', '', 'Julio', 'activo'),
(3, '2025-11-07', '09:53:00', '10:03:00', 17, 'H1', 3, '', '', 'JOSE JOSE', 'activo'),
(4, '2025-11-07', '09:53:00', '10:03:00', 15, 'H1', 4, '', '', 'Julio', 'activo'),
(5, '2025-11-07', '09:51:00', '10:03:00', 47, 'H1', 2, '', '', 'JOSE JOSE', 'activo'),
(6, '2025-11-08', '10:06:00', '10:07:00', 47, 'H2', 9, '', '', 'Jose Perez', 'activo'),
(7, '2025-11-08', '10:02:00', '10:10:00', 2, 'H1', 8, '', '', 'JOSE JOSE', 'activo'),
(8, '2025-11-08', '09:53:00', '10:10:00', 17, 'H2', 3, '', '', 'JUAN PEREZ', 'activo'),
(9, '2025-11-08', '10:12:00', '10:12:00', 15, 'H1', 11, '', '', 'JUAN PEREZ', 'activo'),
(10, '2025-11-08', '09:54:00', '10:13:00', 36, 'H1', 5, '', '', 'JUAN PEREZ', 'activo'),
(11, '2025-11-13', '10:20:00', '10:21:00', 21, 'H2', 12, '', '', 'Renato', 'activo'),
(12, '2025-11-20', '23:20:00', '10:56:00', 21, 'H1', 14, '', '', 'Renato ', 'activo'),
(13, '2025-11-24', '11:48:00', '13:23:00', 15, 'H2', 24, '', '', 'Renato', 'activo'),
(14, '2025-11-24', '10:35:00', '13:23:00', 41, 'H2', 18, '', '', 'Renato', 'activo'),
(15, '2025-11-21', '10:55:00', '13:23:00', 28, 'H2', 15, '', '', 'Renato ', 'activo'),
(16, '2025-11-25', '11:10:00', '11:16:00', 34, 'H1', 27, '', '', 'Renato ', 'activo'),
(17, '2025-11-25', '11:07:00', '11:16:00', 16, 'H2', 26, '', '', 'Renato', 'activo'),
(18, '2025-11-25', '10:25:00', '11:16:00', 23, 'H2', 25, '', '', 'Renato', 'activo'),
(19, '2025-11-26', '10:14:00', '10:19:00', 4, 'H1', 30, '', '', 'Renato', 'activo'),
(20, '2025-11-26', '10:13:00', '10:19:00', 15, 'H2', 29, '', '', 'RENATO', 'activo'),
(21, '2025-11-27', '13:18:00', '13:21:00', 49, 'H1', 31, 'EOLO', '', 'RENATO', 'inactivo'),
(22, '2025-12-02', '12:27:00', '01:29:00', 51, 'H2', 33, '', '', 'Renato', 'activo'),
(24, '2025-12-02', '02:51:00', '01:51:00', 52, 'H1', 35, '', '', 'Renato', 'activo'),
(26, '2025-12-02', '10:02:00', '01:52:00', 2, 'H1', 8, '', '', 'RENATO', 'activo'),
(29, '2025-12-03', '10:55:00', '23:46:00', 28, 'H2', 15, '', '', 'RENATP', 'activo'),
(31, '2025-12-02', '23:52:00', '23:52:00', 48, 'H2', 40, '', '', 'Renato', 'activo'),
(33, '2025-12-03', '00:05:00', '00:05:00', 49, 'H2', 41, '', '', 'Renato', 'activo'),
(34, '2025-12-03', '00:14:00', '00:14:00', 54, 'H2', 42, '', '', 'Renato', 'activo'),
(35, '2025-12-03', '00:31:00', '00:32:00', 52, 'H1', 44, '', '', 'Renato', 'activo'),
(36, '2025-12-03', '00:47:00', '00:47:00', 6, 'H1', 45, '', '', 'Renato', 'activo'),
(37, '2025-12-03', '00:50:00', '00:51:00', 14, 'H1', 48, '', '', 'Renato', 'activo'),
(38, '2025-12-03', '00:55:00', '00:55:00', 35, 'H2', 49, '', '', 'Renato', 'activo'),
(39, '2025-12-03', '01:01:00', '01:02:00', 15, 'H2', 51, '', '', 'Renato', 'activo'),
(40, '2025-12-03', '01:18:00', '01:20:00', 55, 'H1', 52, '', '', 'Renato', 'activo'),
(41, '2025-12-03', '12:43:00', '01:21:00', 51, 'H1', 38, '', '', 'RENATO', 'activo'),
(42, '2025-12-03', '01:41:00', '01:42:00', 56, 'H1', 53, '', '', 'RENATO', 'activo'),
(43, '2025-12-03', '02:08:00', '02:10:00', 57, 'H1', 54, '', '', 'RENATO', 'activo'),
(60, '2025-12-04', '23:31:00', '00:48:00', 58, 'H1', 56, '', '', 'Renato', 'activo'),
(61, '2025-12-04', '00:47:00', '00:48:00', 60, 'H2', 64, '', '', 'Renato', 'activo'),
(62, '2025-12-04', '01:10:00', '01:12:00', 54, 'H2', 65, '', '', 'renato', 'activo'),
(63, '2025-12-04', '22:23:00', '10:24:00', 15, 'H2', 67, '', '', 'Renato', 'activo'),
(64, '2025-12-08', '10:02:00', '10:02:00', 51, 'H1', 73, '', '', 'Renato', 'activo'),
(65, '2025-12-09', '08:00:00', '10:21:00', 51, 'H1', NULL, '', '', 'Renato', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entregaturno`
--

CREATE TABLE `entregaturno` (
  `Id_EntregaTurno` int(11) NOT NULL,
  `Fecha` date NOT NULL,
  `Vales_Gasolina` int(11) NOT NULL,
  `Reporte_Aterrizaje` tinyint(1) NOT NULL,
  `Total_Operaciones_Llegadas` int(11) NOT NULL,
  `Total_Operaciones_Salidas` int(11) NOT NULL,
  `Reporte_Operaciones_Correo` varchar(300) NOT NULL,
  `Operaciones_Coordinadas` int(11) NOT NULL,
  `Walk_Arounds` int(11) DEFAULT NULL,
  `Caja_Fuerte_Contenido` varchar(300) NOT NULL,
  `Fallas_Comunicaciones` varchar(300) NOT NULL,
  `Fallas_Copiadoras` varchar(300) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Fondo` double(10,2) NOT NULL,
  `Firma_Entrega` varchar(100) NOT NULL,
  `Firma_Recibe` varchar(100) NOT NULL,
  `Vales_Gasolina_Folio` varchar(50) DEFAULT NULL,
  `Aterrizajes_Cantidad` int(11) DEFAULT NULL,
  `Paquetes_Hojas` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `entregaturno`
--

INSERT INTO `entregaturno` (`Id_EntregaTurno`, `Fecha`, `Vales_Gasolina`, `Reporte_Aterrizaje`, `Total_Operaciones_Llegadas`, `Total_Operaciones_Salidas`, `Reporte_Operaciones_Correo`, `Operaciones_Coordinadas`, `Walk_Arounds`, `Caja_Fuerte_Contenido`, `Fallas_Comunicaciones`, `Fallas_Copiadoras`, `Nombre`, `Fondo`, `Firma_Entrega`, `Firma_Recibe`, `Vales_Gasolina_Folio`, `Aterrizajes_Cantidad`, `Paquetes_Hojas`) VALUES
(1, '2025-10-10', 22, 1, 22, 20, '22', 22, 22, 'Sin cambio', 'Sin fallas', 'Ninguna', 'ALEJANDRO', 2222.00, 'ALEJANDRO', 'JUAN', '22', 22, 11),
(4, '2025-11-25', 20, 1, 12, 12, '123', 123, 25, 'Sin cambios en caja fuerte', 'Sin fallas encontradas', 'Sin fallas encontradas', 'juan', 1000.00, 'Juan José', 'Luis Antonio', '20', 2, 12),
(5, '2025-11-27', 55, 1, 11, 11, '33', 11, 33, 'Sin cambios en caja', 'Sin fallas presentes', 'Sin fallas', 'JUAN MANUEL', 220.00, 'JUAN', 'FERNANDO', '22', 22, 22),
(6, '2025-12-02', 11, 1, 11, 11, '11', 11, 11, 'Sin cambios', 'Sin fallas', 'Sin falas', 'alex', 11.00, 'alex', 'alex', '11', 11, 20),
(7, '2025-12-03', 11, 1, 11, 11, '11', 11, 11, '...', '...', '...', 'ALEX', 11.00, 'ALEX', 'alex', '11', 11, 22),
(9, '2025-12-03', 22, 1, 11, 11, '11', 11, 11, '...', '...', '...', 'ALEX', 11.00, 'KAREN', 'KAREN', '11', 11, 22),
(10, '2025-12-03', 22, 1, 22, 22, '22', 11, 22, '...', '...', '...', 'RENATA', 11.00, 'RENATA', 'RENATA', '22', 22, 22),
(12, '2025-12-04', 11, 1, 11, 11, '11', 11, 11, '...', '...', '...', 'perez', 11.00, 'Perez', 'Perez', '11', 11, 11),
(13, '2025-12-04', 11, 1, 11, 11, '11', 11, 11, '..', '..', '...', 'ALEX', 11.00, 'ALEX', 'ALEX', '11', 11, 11);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipocomunicacion`
--

CREATE TABLE `equipocomunicacion` (
  `Id_Equipo` int(11) NOT NULL,
  `Entrega_Turno_Id` int(11) NOT NULL,
  `Cantidad` int(11) NOT NULL,
  `Cargado` tinyint(1) NOT NULL,
  `Fallas` tinyint(1) NOT NULL,
  `Nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `equipocomunicacion`
--

INSERT INTO `equipocomunicacion` (`Id_Equipo`, `Entrega_Turno_Id`, `Cantidad`, `Cargado`, `Fallas`, `Nombre`) VALUES
(1, 1, 1, 1, 0, 'CELULAR ZTE'),
(2, 1, 2, 1, 0, 'RADIO MOTOROLA'),
(3, 1, 2, 1, 0, 'RADIO VHF Portátil'),
(4, 1, 1, 0, 0, 'RADIO VHF Fijo'),
(13, 4, 1, 1, 0, 'CELULAR ZTE'),
(14, 4, 2, 1, 0, 'RADIO MOTOROLA'),
(15, 4, 2, 1, 0, 'RADIO VHF Portátil'),
(16, 4, 1, 0, 0, 'RADIO VHF Fijo'),
(17, 5, 1, 1, 0, 'CELULAR ZTE'),
(18, 5, 2, 1, 0, 'RADIO MOTOROLA'),
(19, 5, 2, 1, 0, 'RADIO VHF Portátil'),
(20, 5, 1, 0, 0, 'RADIO VHF Fijo'),
(21, 6, 1, 1, 0, 'CELULAR ZTE'),
(22, 6, 2, 1, 0, 'RADIO MOTOROLA'),
(23, 6, 2, 1, 0, 'RADIO VHF Portátil'),
(24, 6, 1, 0, 0, 'RADIO VHF Fijo'),
(25, 7, 1, 1, 0, 'CELULAR ZTE'),
(26, 7, 2, 1, 0, 'RADIO MOTOROLA'),
(27, 7, 2, 1, 0, 'RADIO VHF Portátil'),
(28, 7, 1, 0, 0, 'RADIO VHF Fijo'),
(33, 9, 1, 1, 0, 'CELULAR ZTE'),
(34, 9, 2, 1, 0, 'RADIO MOTOROLA'),
(35, 9, 2, 1, 0, 'RADIO VHF Portátil'),
(36, 9, 1, 0, 0, 'RADIO VHF Fijo'),
(37, 10, 1, 1, 0, 'CELULAR ZTE'),
(38, 10, 2, 1, 0, 'RADIO MOTOROLA'),
(39, 10, 2, 1, 0, 'RADIO VHF Portátil'),
(40, 10, 1, 0, 0, 'RADIO VHF Fijo'),
(45, 12, 1, 1, 0, 'CELULAR ZTE'),
(46, 12, 2, 1, 0, 'RADIO MOTOROLA'),
(47, 12, 2, 1, 0, 'RADIO VHF Portátil'),
(48, 12, 1, 0, 0, 'RADIO VHF Fijo'),
(49, 13, 1, 1, 0, 'CELULAR ZTE'),
(50, 13, 2, 1, 0, 'RADIO MOTOROLA'),
(51, 13, 2, 1, 0, 'RADIO VHF Portátil'),
(52, 13, 1, 0, 0, 'RADIO VHF Fijo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipooficina`
--

CREATE TABLE `equipooficina` (
  `Id_Equipo` int(11) NOT NULL,
  `Entrega_Turno_Id` int(11) NOT NULL,
  `Existencias` int(11) NOT NULL,
  `Entregadas` int(11) NOT NULL,
  `Recibidas` int(11) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Funciona` tinyint(1) DEFAULT 1,
  `Toner_Estado` varchar(10) DEFAULT 'bueno'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `equipooficina`
--

INSERT INTO `equipooficina` (`Id_Equipo`, `Entrega_Turno_Id`, `Existencias`, `Entregadas`, `Recibidas`, `Nombre`, `Funciona`, `Toner_Estado`) VALUES
(1, 1, 1, 1, 1, 'ENGRAPADORAS', NULL, NULL),
(2, 1, 2, 2, 2, 'PERFORADORAS', NULL, NULL),
(3, 1, 1, 1, 1, 'COPIADORAS', 1, 'bueno'),
(10, 4, 1, 1, 1, 'ENGRAPADORAS', NULL, NULL),
(11, 4, 2, 2, 2, 'PERFORADORAS', NULL, NULL),
(12, 4, 1, 1, 1, 'COPIADORAS', 1, 'bueno'),
(13, 5, 1, 1, 1, 'ENGRAPADORAS', NULL, NULL),
(14, 5, 2, 2, 2, 'PERFORADORAS', NULL, NULL),
(15, 5, 1, 1, 1, 'COPIADORAS', 1, 'bueno'),
(16, 6, 1, 1, 1, 'ENGRAPADORAS', NULL, NULL),
(17, 6, 2, 2, 2, 'PERFORADORAS', NULL, NULL),
(18, 6, 1, 1, 1, 'COPIADORAS', 1, 'bueno'),
(19, 7, 1, 1, 1, 'ENGRAPADORAS', NULL, NULL),
(20, 7, 2, 2, 2, 'PERFORADORAS', NULL, NULL),
(21, 7, 1, 1, 1, 'COPIADORAS', 1, 'bueno'),
(25, 9, 1, 1, 1, 'ENGRAPADORAS', NULL, NULL),
(26, 9, 2, 2, 2, 'PERFORADORAS', NULL, NULL),
(27, 9, 1, 1, 1, 'COPIADORAS', 1, 'bueno'),
(28, 10, 1, 1, 1, 'ENGRAPADORAS', NULL, NULL),
(29, 10, 2, 2, 2, 'PERFORADORAS', NULL, NULL),
(30, 10, 1, 1, 1, 'COPIADORAS', 1, 'bueno'),
(34, 12, 1, 1, 1, 'ENGRAPADORAS', NULL, NULL),
(35, 12, 2, 2, 2, 'PERFORADORAS', NULL, NULL),
(36, 12, 1, 1, 1, 'COPIADORAS', 1, 'bueno'),
(37, 13, 1, 1, 1, 'ENGRAPADORAS', NULL, NULL),
(38, 13, 2, 2, 2, 'PERFORADORAS', NULL, NULL),
(39, 13, 1, 1, 1, 'COPIADORAS', 1, 'bueno');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evidencias`
--

CREATE TABLE `evidencias` (
  `Id_Evidencia` int(11) NOT NULL,
  `Id_Wk` int(11) NOT NULL,
  `Id_Aeronave` int(11) NOT NULL,
  `Ruta` varchar(100) NOT NULL,
  `FileName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `evidencias`
--

INSERT INTO `evidencias` (`Id_Evidencia`, `Id_Wk`, `Id_Aeronave`, `Ruta`, `FileName`) VALUES
(1, 2, 2, 'evidencias/68e928e3d99c2_2_Sin_t__tulo.jpeg', 'Sin título.jpeg'),
(2, 1, 1, 'evidencias/68e9376208b05_1_Sin_t__tulo.jpeg', 'Sin título.jpeg'),
(3, 10, 10, 'evidencias/68e95d3af07d2_10_Sin_t__tulo.jpeg', 'Sin título.jpeg'),
(5, 10, 10, 'evidencias/68f935dd1c975_10_avion.jpg', 'avion.jpg'),
(6, 13, 2, '../public/assets/evidencias/68fa46ec7275f_13_avion.jpg', 'avion.jpg'),
(7, 14, 4, '/Eolo/public/assets/evidencias/68fa5377f199a_14_avion.jpg', 'avion.jpg'),
(8, 15, 6, '/Eolo/public/assets/evidencias/68fa5afb07340_15_c12.jpg', 'c12.jpg'),
(9, 16, 2, '/Eolo/public/assets/evidencias/68fa715119ec3_16_2025-10-2312.17.234687013077887380006.jpg', '2025-10-2312.17.234687013077887380006.jpg'),
(10, 15, 6, 'evidencias/68fa8a30d3219_15_2025-10-2314.03.51927963003632875280.jpg', '2025-10-2314.03.51927963003632875280.jpg'),
(11, 15, 6, '/Eolo/public/assets/evidencias/68fa8b039ee70_15_2025-10-2314.07.131211579313080674144.jpg', '2025-10-2314.07.131211579313080674144.jpg'),
(12, 15, 6, '/Eolo/public/assets/evidencias/68fb02bbce884_15_diagrama_helicoptero.jpg', 'diagrama_helicoptero.jpg'),
(13, 15, 6, '/Eolo/public/assets/evidencias/68fb03d47fb4c_15_2025-10-2322.42.422949280998703448722.jpg', '2025-10-2322.42.422949280998703448722.jpg'),
(14, 15, 6, '/Eolo/public/assets/evidencias/68fb9ad9a1e8a_15_DIAGRAMA-H1.jpg', 'DIAGRAMA-H1.jpg'),
(15, 17, 4, '/Eolo/public/assets/evidencias/68fb9e5659595_17_diagrama_helicoptero.jpg', 'diagrama_helicoptero.jpg'),
(16, 17, 4, '/Eolo/public/assets/evidencias/68fb9e82c0982_17_avion.jpg', 'avion.jpg'),
(17, 18, 6, '/Eolo/public/assets/evidencias/68fba0f53fc8b_18_diagrama_helicoptero.jpg', 'diagrama_helicoptero.jpg'),
(18, 18, 6, '/Eolo/public/assets/evidencias/68fba10f9e7a5_18_DIAGRAMA-H2.jpg', 'DIAGRAMA-H2.jpg'),
(19, 18, 6, '/Eolo/public/assets/evidencias/68fba3184b4e2_18_avion.jpg', 'avion.jpg'),
(20, 19, 2, '/Eolo/public/assets/evidencias/68fba4463acd9_19_c12.png', 'c12.png'),
(21, 19, 2, '/Eolo/public/assets/evidencias/68fba71162cf0_19_Sin_t__tulo.jpeg', 'Sin título.jpeg'),
(22, 20, 8, '/Eolo/public/assets/evidencias/68fba74cd6959_20_avion.jpg', 'avion.jpg'),
(23, 20, 8, '/Eolo/public/assets/evidencias/68fba76972e04_20_47da6c6225c06894fdabe1bef76feffc.jpg', '47da6c6225c06894fdabe1bef76feffc.jpg'),
(24, 20, 8, '/Eolo/public/assets/evidencias/68fba7cc310e5_20_2025-10-2410.22.214148180097621703453.jpg', '2025-10-2410.22.214148180097621703453.jpg'),
(25, 20, 8, '/Eolo/public/assets/evidencias/68fba7f011de6_20_VID_20251024_102254.mp4', 'VID_20251024_102254.mp4'),
(26, 21, 2, '/Eolo/public/assets/evidencias/6925d0e6aef9a_21_2025-11-2509.52.112164465381984041884.jpg', '2025-11-2509.52.112164465381984041884.jpg'),
(27, 22, 49, '/Eolo/public/assets/evidencias/6928a2863402c_22_diagrama_helicoptero.jpg', 'diagrama_helicoptero.jpg'),
(28, 23, 49, '/Eolo/public/assets/evidencias/692e907720a0d_23_diagrama_helicoptero.jpg', 'diagrama_helicoptero.jpg'),
(29, 24, 51, '/Eolo/public/assets/evidencias/692e942d2d70b_24_diagrama_helicoptero.jpg', 'diagrama_helicoptero.jpg'),
(30, 25, 51, '/Eolo/public/assets/evidencias/692e99658be39_25_DIAGRAMA-H2.jpg', 'DIAGRAMA-H2.jpg'),
(31, 26, 51, '/Eolo/public/assets/evidencias/692fcd0f1ab73_26_avion.jpg', 'avion.jpg'),
(32, 27, 55, '/Eolo/public/assets/evidencias/692fe3961ef39_27_avion.jpg', 'avion.jpg'),
(33, 28, 56, '/Eolo/public/assets/evidencias/692fe8efa05a2_28_avion.jpg', 'avion.jpg'),
(34, 29, 57, '/Eolo/public/assets/evidencias/692fef51cc87d_29_c12.jpg', 'c12.jpg'),
(35, 30, 58, '/Eolo/public/assets/evidencias/69311ad792cd6_30_avion.jpg', 'avion.jpg'),
(36, 31, 51, '/Eolo/public/assets/evidencias/6931333663bf7_31_avion.jpg', 'avion.jpg'),
(37, 32, 4, '/Eolo/public/assets/evidencias/69313d5f993e6_32_avion.jpg', 'avion.jpg'),
(38, 33, 51, '/Eolo/public/assets/evidencias/6931b48c32cdc_33_avion.jpg', 'avion.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pernocta_diaria`
--

CREATE TABLE `pernocta_diaria` (
  `Id_Pernocta` int(11) NOT NULL,
  `Fecha` date NOT NULL,
  `Hora` time NOT NULL,
  `Id_Aeronave` int(11) NOT NULL,
  `Tipo_Movimiento` enum('entrada','salida') NOT NULL,
  `Procedencia` varchar(100) DEFAULT NULL,
  `Destino` varchar(100) DEFAULT NULL,
  `Tripulacion` varchar(200) DEFAULT NULL,
  `Pasajeros` varchar(50) DEFAULT '0',
  `Persona_Registro` varchar(100) NOT NULL,
  `Activo` tinyint(1) DEFAULT 1,
  `Fecha_Creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `Estado_Registro` enum('activo','inactivo') DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pernocta_diaria`
--

INSERT INTO `pernocta_diaria` (`Id_Pernocta`, `Fecha`, `Hora`, `Id_Aeronave`, `Tipo_Movimiento`, `Procedencia`, `Destino`, `Tripulacion`, `Pasajeros`, `Persona_Registro`, `Activo`, `Fecha_Creacion`, `Estado_Registro`) VALUES
(1, '2025-11-07', '09:51:00', 2, 'entrada', 'LZC', 'TLC', 'Cap. Pepe', '2', 'Renato', 1, '2025-11-07 15:51:42', 'activo'),
(2, '2025-11-07', '09:51:00', 47, 'entrada', 'SLP', 'TLC', 'CAP. JAHIR', '2', 'RENATO', 1, '2025-11-07 15:53:01', 'activo'),
(3, '2025-11-07', '09:53:00', 17, 'entrada', 'CVM', '', 'Cap. Corrion', '3', 'RENATO', 1, '2025-11-07 15:53:39', 'activo'),
(4, '2025-11-07', '09:53:00', 15, 'entrada', 'DGO', 'TLC', 'CAP. JAHIR', '5', 'RENATO', 1, '2025-11-07 15:54:50', 'inactivo'),
(5, '2025-11-07', '09:54:00', 36, 'entrada', 'TLC', '', 'Cap. Pepe', 'Ferry', 'Renato', 1, '2025-11-07 15:55:27', 'activo'),
(6, '2025-11-07', '10:00:00', 2, 'salida', 'TLC', 'MSM', 'CAP. JAHIR', '2', 'Renato', 0, '2025-11-07 16:00:30', 'activo'),
(7, '2025-11-07', '10:00:00', 47, 'salida', 'HUX', 'TLC', 'Cap. Ortiz', '1', 'Renato', 0, '2025-11-07 16:01:11', 'activo'),
(8, '2025-11-07', '10:02:00', 2, 'entrada', 'IZT', 'TLC', 'Cap. Antonio', '1', 'RENATO', 1, '2025-11-07 16:03:40', 'activo'),
(9, '2025-11-08', '10:06:00', 47, 'entrada', 'SFH', 'TLC', 'Cap. Ortiz', '2', 'RENATO', 1, '2025-11-08 16:07:43', 'activo'),
(10, '2025-11-08', '10:11:00', 15, 'salida', 'TLC', 'BJX', 'Cap. Pepe', '1', 'RENATO', 0, '2025-11-08 16:11:55', 'activo'),
(11, '2025-11-08', '10:12:00', 15, 'entrada', 'BJX', 'TLC', 'Cap. Pepe', '1', 'Renato', 1, '2025-11-08 16:12:36', 'activo'),
(12, '2025-11-13', '10:20:00', 21, 'entrada', 'LTO', '', 'Cap. Pepe', '2', 'Renato', 1, '2025-11-13 16:20:56', 'activo'),
(13, '2025-11-14', '10:50:00', 21, 'salida', '', '', '', '0', 'juan', 0, '2025-11-14 16:50:57', 'activo'),
(14, '2025-11-20', '23:20:00', 21, 'entrada', 'TLC', '', 'CAP. JAHIR', '1', 'Renato', 1, '2025-11-20 17:23:24', 'activo'),
(15, '2025-11-21', '10:55:00', 28, 'entrada', 'CSL', '', 'Cap. Ortiz', '1', 'RENATO', 1, '2025-11-21 16:56:32', 'activo'),
(16, '2025-11-24', '10:30:00', 41, 'entrada', 'TLC', 'CSL', 'Cap. Pepe', '2', 'Renato', 1, '2025-11-24 16:35:14', 'activo'),
(17, '2025-11-24', '10:35:00', 41, 'salida', 'CSL', 'GDL', 'Cap. Pepe', '1', 'Renato', 0, '2025-11-24 16:35:52', 'activo'),
(18, '2025-11-24', '10:35:00', 41, 'entrada', 'GDL', 'TIJ', 'Cap. Pepe', '3', 'Renato', 1, '2025-11-24 16:36:23', 'inactivo'),
(19, '2025-11-24', '10:35:00', 15, 'salida', 'TLC', 'CUN', 'Cap. Antonio', '1', 'Renato', 0, '2025-11-24 16:38:13', 'activo'),
(20, '2025-11-24', '10:40:00', 15, 'entrada', 'TLC', 'CJS', 'Cap. Pepe', '2', 'Renato', 1, '2025-11-24 16:43:36', 'activo'),
(21, '2025-11-24', '10:40:00', 15, 'salida', 'CSL', 'CPE', 'Cap. Corrion', '1', 'Renato', 0, '2025-11-24 16:44:19', 'activo'),
(22, '2025-11-24', '10:40:00', 15, 'entrada', 'CPE', 'HUX', 'Cap. Pepe', '3', 'Renato', 1, '2025-11-24 16:44:48', 'activo'),
(23, '2025-11-24', '10:45:00', 15, 'salida', 'SLW', '', 'Cap. Pepe', '2', 'Renato', 0, '2025-11-24 16:46:34', 'activo'),
(24, '2025-11-24', '11:48:00', 15, 'entrada', 'TLC', 'ESE', 'Cap. Pepe', '1', 'Renato', 1, '2025-11-24 17:30:31', 'activo'),
(25, '2025-11-25', '10:25:00', 23, 'entrada', 'TLC', 'CSL', 'Cap. Ortiz', '2', 'RENATO', 1, '2025-11-25 16:26:33', 'activo'),
(26, '2025-11-25', '11:07:00', 16, 'entrada', 'TLC', 'CSL', 'cap.pedro', '3', 'Renato ', 1, '2025-11-25 17:07:57', 'activo'),
(27, '2025-11-25', '11:10:00', 34, 'entrada', 'CSL', 'SFH', 'Cap. Pepe', '2', 'Renato ', 1, '2025-11-25 17:11:12', 'activo'),
(28, '2025-11-26', '10:12:00', 15, 'salida', 'SFH', 'MEX', 'Cap. Pepe', '2', 'Renato', 0, '2025-11-26 16:12:34', 'activo'),
(29, '2025-11-26', '10:13:00', 15, 'entrada', 'CSL', 'CME', 'Cap. Pepe', '2', 'Renato', 1, '2025-11-26 16:13:22', 'activo'),
(30, '2025-11-26', '10:14:00', 4, 'entrada', 'ACN', 'NLD', 'Cap. Pepe', '2', 'Renato', 1, '2025-11-26 16:14:11', 'activo'),
(31, '2025-11-27', '13:18:00', 49, 'entrada', 'TLC', 'SFH', 'Cap. Pepe', '3', 'RENATO', 1, '2025-11-27 19:18:49', 'activo'),
(33, '2025-12-02', '12:27:00', 51, 'entrada', 'TLC', 'CSL', 'Cap. Ortiz', '1', 'Renatoooo', 1, '2025-12-02 07:28:22', 'inactivo'),
(35, '2025-12-02', '02:51:00', 52, 'entrada', 'TAM', 'ACA', 'Cap. Pepe', '10', 'Renato', 1, '2025-12-02 07:50:24', 'inactivo'),
(38, '2025-12-02', '12:43:00', 51, 'entrada', 'CSL', 'TLC', 'Cap. Pepe', '3', 'Renato', 1, '2025-12-03 05:44:28', 'inactivo'),
(39, '2025-12-02', '23:51:00', 52, 'entrada', 'TLC', '', 'Cap. Carrion', '1', 'Renato', 1, '2025-12-03 05:51:11', 'inactivo'),
(40, '2025-12-02', '23:52:00', 48, 'entrada', 'TLC', '', 'Cap. Pepe', '3', 'Renato', 1, '2025-12-03 05:52:13', 'activo'),
(41, '2025-12-03', '00:05:00', 49, 'entrada', 'CSL', 'TLC', 'Cap. Ortiz', '2', 'Renato', 1, '2025-12-03 06:05:38', 'activo'),
(42, '2025-12-03', '00:14:00', 54, 'entrada', 'CSL', 'SFH', 'Cap. Pepe', '2', 'Renato', 1, '2025-12-03 06:14:42', 'inactivo'),
(43, '2025-12-03', '00:20:00', 54, 'entrada', 'VSA', 'TLC', 'Cap. Pepe', '1', 'Renato', 1, '2025-12-03 06:20:32', 'inactivo'),
(44, '2025-12-03', '00:31:00', 52, 'entrada', 'TLC', 'VSA', 'Cap. Pepe', '2', 'Renato', 1, '2025-12-03 06:32:06', 'activo'),
(45, '2025-12-03', '00:47:00', 6, 'entrada', 'CSL', 'TLC', 'Cap. Pepe', '1', 'Renato', 1, '2025-12-03 06:47:50', 'activo'),
(46, '2025-12-03', '00:48:00', 6, 'salida', 'MSM', '', 'Cap. Ortiz', '1', 'Renato', 0, '2025-12-03 06:49:02', 'activo'),
(47, '2025-12-03', '00:49:00', 6, 'entrada', 'VSA', 'ACA', 'Cap. Ortiz', '1', 'Renato', 1, '2025-12-03 06:49:41', 'inactivo'),
(48, '2025-12-03', '00:50:00', 14, 'entrada', 'ACA', 'IZT', 'Cap. Pepe', '2', 'Renato', 1, '2025-12-03 06:51:08', 'activo'),
(49, '2025-12-03', '00:55:00', 35, 'entrada', 'CSL', 'OAX', 'Cap. Pepe', '1', 'Renato', 1, '2025-12-03 06:55:42', 'activo'),
(50, '2025-12-03', '01:00:00', 15, 'salida', 'ACA', 'OAX', 'Cap. Ortiz', '1', 'Renato', 0, '2025-12-03 07:01:29', 'activo'),
(51, '2025-12-03', '01:01:00', 15, 'entrada', 'TLC', 'REX', 'Cap. Ortiz', '3', 'Renato', 1, '2025-12-03 07:01:59', 'activo'),
(52, '2025-12-03', '01:18:00', 55, 'entrada', 'CSL', 'TLC', 'Cap. Pepe', '3', 'RENATO', 1, '2025-12-03 07:19:21', 'inactivo'),
(53, '2025-12-03', '01:41:00', 56, 'entrada', 'ACA', 'LTO', 'Cap. Pepe', '2', 'RENATO', 1, '2025-12-03 07:42:31', 'inactivo'),
(54, '2025-12-03', '02:08:00', 57, 'entrada', 'CEN', 'SFH', 'Cap. Pepe', '2', 'RENATO', 1, '2025-12-03 08:09:19', 'inactivo'),
(55, '2025-12-03', '23:27:00', 58, 'entrada', 'CSL', 'TLC', 'Cap. Pepe', '2', 'Renato', 1, '2025-12-04 05:27:21', 'inactivo'),
(56, '2025-12-04', '23:31:00', 58, 'entrada', 'TLC', 'VSA', 'Cap. Pepe', '2', 'Renato', 1, '2025-12-05 05:31:06', 'inactivo'),
(57, '2025-12-04', '00:02:00', 58, 'entrada', 'TLC', '', 'Cap. Pepe', '2', 'Renato', 1, '2025-12-04 06:03:42', 'inactivo'),
(64, '2025-12-04', '00:47:00', 60, 'entrada', 'IZT', '', 'CAP. JAHIR', '2', 'Renato', 1, '2025-12-04 06:48:09', 'activo'),
(65, '2025-12-04', '01:10:00', 54, 'entrada', 'HUX', 'CPE', 'Cap. Pepe', '2', 'RENATO', 1, '2025-12-04 07:10:59', 'activo'),
(66, '2025-12-04', '01:54:00', 15, 'salida', 'TLC', 'NOG', 'cap', '2', 'renato', 0, '2025-12-04 07:54:42', 'activo'),
(67, '2025-12-04', '22:23:00', 15, 'entrada', 'TLC', 'CME', 'Cap. Pepe', '2', 'Renato', 1, '2025-12-04 16:23:36', 'activo'),
(68, '2025-12-04', '10:33:00', 51, 'entrada', 'TLC', 'CSL', 'Cap. Pepe', '2', 'RENATO.$Q', 1, '2025-12-04 16:33:41', 'inactivo'),
(69, '2025-12-08', '09:55:00', 51, 'entrada', 'TLC', 'SLP', 'Cap. Pepe', '3', 'Renato', 1, '2025-12-08 15:56:09', 'activo'),
(70, '2025-12-08', '09:56:00', 51, 'salida', 'CSL', 'LTO', 'Cap. Pepe', '3', 'Renato', 0, '2025-12-08 15:56:54', 'activo'),
(71, '2025-12-08', '10:00:00', 51, 'entrada', 'SFH', 'TLC', 'Cap. Pepe', '2', 'Renato', 1, '2025-12-08 16:00:38', 'activo'),
(72, '2025-12-08', '10:01:00', 51, 'salida', 'SJD', 'ACA', 'Cap. Pepe', '2', 'Renato', 0, '2025-12-08 16:01:13', 'activo'),
(73, '2025-12-08', '10:02:00', 51, 'entrada', 'SFH', 'TLC', 'Cap. Pepe', '4', 'Renato', 1, '2025-12-08 16:02:04', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `remision`
--

CREATE TABLE `remision` (
  `Id_Remision` int(11) NOT NULL,
  `Ov` varchar(10) DEFAULT NULL,
  `Operador` varchar(100) NOT NULL,
  `Fecha` date NOT NULL,
  `Cliente` varchar(100) NOT NULL,
  `Requision` varchar(100) DEFAULT NULL,
  `FormaPago` varchar(100) NOT NULL,
  `Id_Aeronave` int(11) NOT NULL,
  `HoraLlegada` time NOT NULL,
  `HoraInicial` time NOT NULL,
  `LecInicial` double NOT NULL,
  `HoraFinal` time NOT NULL,
  `LecFinal` double NOT NULL,
  `LitrosTot` double NOT NULL,
  `Observaciones` varchar(200) DEFAULT NULL,
  `Cobranza` varchar(100) NOT NULL,
  `ServiciosCom` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `remision`
--

INSERT INTO `remision` (`Id_Remision`, `Ov`, `Operador`, `Fecha`, `Cliente`, `Requision`, `FormaPago`, `Id_Aeronave`, `HoraLlegada`, `HoraInicial`, `LecInicial`, `HoraFinal`, `LecFinal`, `LitrosTot`, `Observaciones`, `Cobranza`, `ServiciosCom`) VALUES
(2, '', 'Julio', '2025-12-16', 'Eolo Plus', '', 'efectivo', 54, '11:22:00', '11:23:00', 120, '11:30:00', 100, 20, '', 'Luis', 'Luis'),
(3, 'gg', 'JULIAN', '2025-12-16', 'Eolo Plus', 'gg', 'deposito', 2, '11:30:00', '11:31:00', 200, '12:00:00', 140, 60, 'GGGGG', 'LUIS', 'LUIS'),
(4, '5434', 'Julio', '2026-01-05', 'Eolo Plus', '', 'tarjeta', 52, '09:27:00', '09:28:00', 1000, '10:00:00', 920, 80, 'sin observaciones', 'Juan', 'Juan');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `Id_Usuario` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Nombre_Completo` varchar(100) NOT NULL,
  `Tipo_Usuario` enum('admin','usuario') DEFAULT 'usuario',
  `Activo` tinyint(1) DEFAULT 1,
  `Fecha_Creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `Ultimo_Acceso` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`Id_Usuario`, `Username`, `Password`, `Nombre_Completo`, `Tipo_Usuario`, `Activo`, `Fecha_Creacion`, `Ultimo_Acceso`) VALUES
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador Principal', 'admin', 1, '2025-10-02 15:53:30', '2025-12-19 17:44:35'),
(2, 'usuario', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Usuario Regular', 'usuario', 1, '2025-10-02 15:53:30', '2025-12-19 17:44:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `walkaround`
--

CREATE TABLE `walkaround` (
  `Id_Walk` int(11) NOT NULL,
  `FechaHora` datetime NOT NULL,
  `Id_Aeronave` int(11) NOT NULL,
  `Elaboro` varchar(100) NOT NULL,
  `Responsable` varchar(100) NOT NULL,
  `JefeArea` varchar(100) NOT NULL,
  `VoBo` varchar(100) NOT NULL,
  `observaciones` varchar(300) NOT NULL,
  `Procedencia` varchar(255) DEFAULT NULL,
  `Destino` varchar(255) DEFAULT NULL,
  `entrada` tinyint(1) DEFAULT 0,
  `salida` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `walkaround`
--

INSERT INTO `walkaround` (`Id_Walk`, `FechaHora`, `Id_Aeronave`, `Elaboro`, `Responsable`, `JefeArea`, `VoBo`, `observaciones`, `Procedencia`, `Destino`, `entrada`, `salida`) VALUES
(1, '2025-10-10 16:39:00', 1, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', '', '', 'MDA', 0, 1),
(2, '2025-10-10 17:07:00', 2, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', '', '', 'GDL', 0, 1),
(3, '2025-10-10 17:08:00', 3, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', 'Daños en estetica del lado derecho del estabilizador', '', 'MTY', 0, 1),
(4, '2025-10-10 17:15:00', 4, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', '', '', 'AEROMANN', 0, 1),
(6, '2025-10-10 18:01:00', 6, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', '', '', 'D60', 0, 1),
(7, '2025-10-10 18:08:00', 7, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', '', '', 'MGGT', 0, 1),
(8, '2025-10-10 18:24:00', 8, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', '', '', 'SLW', 0, 1),
(9, '2025-10-10 18:53:00', 9, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', '', '', 'ACA', 0, 1),
(10, '2025-10-11 01:19:00', 10, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', 'Daños en ala derecha y estetica de lado derecho dañado', 'MTY', '', 1, 0),
(12, '2025-10-14 21:28:00', 2, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', 'No hay observaciones ', 'CUN', '', 1, 0),
(13, '2025-10-23 15:16:00', 2, 'JUAN', 'PEDRO', 'SOFIA', 'RAMON', 'daño en rotor derecho', 'MTT', '', 1, 0),
(14, '2025-10-23 16:10:00', 4, 'aaa', 'aaa', 'aaa', 'aaa', '', 'SLW', '', 1, 0),
(15, '2025-10-25 04:42:00', 6, 'ss', 'ss', 'ss', 'ss', 'sss', 'GDL', '', 1, 0),
(16, '2025-10-23 12:16:00', 2, 'Juan', 'Alma ', 'Pedro', 'Jesus', 'Golpes es la parte derecha ', 'NDA', '', 1, 0),
(17, '2025-10-24 15:41:00', 4, 'QQQ', 'QQQ', 'QQQ', 'QQQ', 'QQQ', 'NDA', '', 1, 0),
(18, '2025-10-24 18:02:32', 6, 'gg', 'gg', 'gg', 'gg', 'gg', '', '', 1, 0),
(19, '2025-10-24 10:07:00', 2, 'FF', 'FF', 'FF', 'FF', 'FF', 'SLW', '', 1, 0),
(20, '2025-10-24 10:19:00', 8, 'ww', 'ww', 'ww', 'ww', 'ww', '', 'JAL', 0, 1),
(21, '2025-11-25 09:51:00', 2, 'Alejandro ', 'José Luis', 'Pedro', 'Pedro', 'Sin observaciones ', 'SJD - SAN JOSÉ DEL CABO', 'ESE - ENSENADA', 1, 0),
(22, '2025-11-27 13:09:00', 49, 'Renato', 'Juan', 'Luis', 'Mariana', '', 'CSL - CABO SAN LUCAS', 'TLC - TOLUCA', 1, 0),
(23, '2025-12-02 01:06:00', 49, 'Alejandro', 'Alejandro', 'Alejandro', 'Ale', '', 'CSL - CABO SAN LUCAS', 'TLC - TOLUCA', 1, 0),
(24, '2025-12-02 01:22:00', 51, 'ALEX', 'ALEX', 'alex', 'ALEX', '', 'TLC - TOLUCA', 'CSL - CABO SAN LUCAS', 1, 0),
(25, '2025-12-02 01:44:00', 51, 'ALEX', 'ALEX', 'ALEX', 'ALEX', '', 'TLC - TOLUCA', 'ACA - ACAPULCO', 1, 0),
(26, '2025-12-02 23:37:00', 51, 'ALEX', 'ALEX', 'ALEX', 'ALEX', '', 'TLC - TOLUCA', 'ACA - ACAPULCO', 1, 0),
(27, '2025-12-03 01:13:00', 55, 'ALICIA', 'ALICIA', 'ALICIA', 'ALICIA', '', 'MEX - MÉXICO', 'ACA - ACAPULCO', 1, 0),
(28, '2025-12-03 01:36:00', 56, 'KAREN', 'KAREN', 'KAREN', 'KAREN', '', 'VSA - VILLAHERMOSA', 'TLC - TOLUCA', 1, 0),
(29, '2025-12-03 02:03:00', 57, 'ALICIA', 'ALICIA', 'ALICIA', 'ALICIA', '', 'CSL - CABO SAN LUCAS', 'CTM - CHETUMAL', 1, 0),
(30, '2025-12-03 23:21:00', 58, 'karen', 'karen', 'karen', 'KAREN', '...', 'CSL - CABO SAN LUCAS', 'TLC - TOLUCA', 1, 0),
(31, '2025-12-04 01:04:00', 51, 'juan', 'juan', 'juan', 'juan', '', 'VSA - VILLAHERMOSA', 'HUX - HUATULCO', 1, 0),
(32, '2025-12-04 01:48:00', 4, 'alex', 'alex', 'alex', 'alex', '..', '', '', 1, 0),
(33, '2025-12-04 10:17:00', 51, 'ALEX', 'ALEX', 'ALEX', 'ALEX', '', 'VSA - VILLAHERMOSA', 'TLC - TOLUCA', 1, 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `aeronave`
--
ALTER TABLE `aeronave`
  ADD PRIMARY KEY (`Id_Aeronave`),
  ADD UNIQUE KEY `idx_matricula_unique` (`Matricula`);

--
-- Indices de la tabla `aeropuertos`
--
ALTER TABLE `aeropuertos`
  ADD PRIMARY KEY (`Id_Aeropuerto`),
  ADD UNIQUE KEY `unique_iata` (`Codigo_IATA`),
  ADD UNIQUE KEY `unique_oaci` (`Codigo_OACI`),
  ADD KEY `idx_busqueda` (`Codigo_IATA`,`Codigo_OACI`,`Nombre`);

--
-- Indices de la tabla `asignacion_mantenimiento`
--
ALTER TABLE `asignacion_mantenimiento`
  ADD PRIMARY KEY (`Id_Asignacion`),
  ADD KEY `Id_Aeronave` (`Id_Aeronave`),
  ADD KEY `Id_Ultimo_Registro` (`Id_Ultimo_Registro`);

--
-- Indices de la tabla `componentewk`
--
ALTER TABLE `componentewk`
  ADD PRIMARY KEY (`Id_Componete_Wk`),
  ADD KEY `Id_Aeronave_2` (`Id_Aeronave`),
  ADD KEY `Id_Aeronave_3` (`Id_Aeronave`),
  ADD KEY `Id_Walk` (`Id_Walk`);

--
-- Indices de la tabla `control_pernocta`
--
ALTER TABLE `control_pernocta`
  ADD PRIMARY KEY (`Id_Control`),
  ADD UNIQUE KEY `unique_aeronave_fecha` (`Id_Aeronave`,`Fecha`),
  ADD KEY `Id_Aeronave` (`Id_Aeronave`),
  ADD KEY `Fecha` (`Fecha`),
  ADD KEY `control_pernocta_ibfk_2` (`Id_Ultimo_Registro`);

--
-- Indices de la tabla `entregaturno`
--
ALTER TABLE `entregaturno`
  ADD PRIMARY KEY (`Id_EntregaTurno`);

--
-- Indices de la tabla `equipocomunicacion`
--
ALTER TABLE `equipocomunicacion`
  ADD PRIMARY KEY (`Id_Equipo`),
  ADD KEY `Entrega_Turno_Id` (`Entrega_Turno_Id`);

--
-- Indices de la tabla `equipooficina`
--
ALTER TABLE `equipooficina`
  ADD PRIMARY KEY (`Id_Equipo`),
  ADD KEY `Entrega_Turno_Id` (`Entrega_Turno_Id`);

--
-- Indices de la tabla `evidencias`
--
ALTER TABLE `evidencias`
  ADD PRIMARY KEY (`Id_Evidencia`),
  ADD KEY `Id_Wk` (`Id_Wk`),
  ADD KEY `Id_Aeronave` (`Id_Aeronave`);

--
-- Indices de la tabla `pernocta_diaria`
--
ALTER TABLE `pernocta_diaria`
  ADD PRIMARY KEY (`Id_Pernocta`),
  ADD KEY `Id_Aeronave` (`Id_Aeronave`),
  ADD KEY `Fecha` (`Fecha`),
  ADD KEY `Tipo_Movimiento` (`Tipo_Movimiento`);

--
-- Indices de la tabla `remision`
--
ALTER TABLE `remision`
  ADD PRIMARY KEY (`Id_Remision`),
  ADD KEY `Id_Aeroanve_2` (`Id_Aeronave`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`Id_Usuario`),
  ADD UNIQUE KEY `Username` (`Username`);

--
-- Indices de la tabla `walkaround`
--
ALTER TABLE `walkaround`
  ADD PRIMARY KEY (`Id_Walk`),
  ADD KEY `Id_Aeronave` (`Id_Aeronave`),
  ADD KEY `Id_Aeronave_2` (`Id_Aeronave`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `aeronave`
--
ALTER TABLE `aeronave`
  MODIFY `Id_Aeronave` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT de la tabla `aeropuertos`
--
ALTER TABLE `aeropuertos`
  MODIFY `Id_Aeropuerto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=105;

--
-- AUTO_INCREMENT de la tabla `asignacion_mantenimiento`
--
ALTER TABLE `asignacion_mantenimiento`
  MODIFY `Id_Asignacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT de la tabla `componentewk`
--
ALTER TABLE `componentewk`
  MODIFY `Id_Componete_Wk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=923;

--
-- AUTO_INCREMENT de la tabla `control_pernocta`
--
ALTER TABLE `control_pernocta`
  MODIFY `Id_Control` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT de la tabla `entregaturno`
--
ALTER TABLE `entregaturno`
  MODIFY `Id_EntregaTurno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `equipocomunicacion`
--
ALTER TABLE `equipocomunicacion`
  MODIFY `Id_Equipo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT de la tabla `equipooficina`
--
ALTER TABLE `equipooficina`
  MODIFY `Id_Equipo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT de la tabla `evidencias`
--
ALTER TABLE `evidencias`
  MODIFY `Id_Evidencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT de la tabla `pernocta_diaria`
--
ALTER TABLE `pernocta_diaria`
  MODIFY `Id_Pernocta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT de la tabla `remision`
--
ALTER TABLE `remision`
  MODIFY `Id_Remision` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `Id_Usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `walkaround`
--
ALTER TABLE `walkaround`
  MODIFY `Id_Walk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asignacion_mantenimiento`
--
ALTER TABLE `asignacion_mantenimiento`
  ADD CONSTRAINT `asignacion_mantenimiento_ibfk_1` FOREIGN KEY (`Id_Aeronave`) REFERENCES `aeronave` (`Id_Aeronave`),
  ADD CONSTRAINT `asignacion_mantenimiento_ibfk_2` FOREIGN KEY (`Id_Ultimo_Registro`) REFERENCES `pernocta_diaria` (`Id_Pernocta`);

--
-- Filtros para la tabla `componentewk`
--
ALTER TABLE `componentewk`
  ADD CONSTRAINT `componentewk_ibfk_1` FOREIGN KEY (`Id_Aeronave`) REFERENCES `aeronave` (`Id_Aeronave`) ON DELETE CASCADE,
  ADD CONSTRAINT `componentewk_ibfk_3` FOREIGN KEY (`Id_Walk`) REFERENCES `walkaround` (`Id_Walk`) ON DELETE CASCADE;

--
-- Filtros para la tabla `control_pernocta`
--
ALTER TABLE `control_pernocta`
  ADD CONSTRAINT `control_pernocta_ibfk_1` FOREIGN KEY (`Id_Aeronave`) REFERENCES `aeronave` (`Id_Aeronave`) ON DELETE CASCADE,
  ADD CONSTRAINT `control_pernocta_ibfk_2` FOREIGN KEY (`Id_Ultimo_Registro`) REFERENCES `pernocta_diaria` (`Id_Pernocta`) ON DELETE CASCADE;

--
-- Filtros para la tabla `equipocomunicacion`
--
ALTER TABLE `equipocomunicacion`
  ADD CONSTRAINT `equipocomunicacion_ibfk_1` FOREIGN KEY (`Entrega_Turno_Id`) REFERENCES `entregaturno` (`Id_EntregaTurno`) ON DELETE CASCADE;

--
-- Filtros para la tabla `equipooficina`
--
ALTER TABLE `equipooficina`
  ADD CONSTRAINT `equipooficina_ibfk_1` FOREIGN KEY (`Entrega_Turno_Id`) REFERENCES `entregaturno` (`Id_EntregaTurno`) ON DELETE CASCADE;

--
-- Filtros para la tabla `evidencias`
--
ALTER TABLE `evidencias`
  ADD CONSTRAINT `evidencias_ibfk_1` FOREIGN KEY (`Id_Wk`) REFERENCES `walkaround` (`Id_Walk`) ON DELETE CASCADE,
  ADD CONSTRAINT `evidencias_ibfk_2` FOREIGN KEY (`Id_Aeronave`) REFERENCES `aeronave` (`Id_Aeronave`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pernocta_diaria`
--
ALTER TABLE `pernocta_diaria`
  ADD CONSTRAINT `pernocta_diaria_ibfk_1` FOREIGN KEY (`Id_Aeronave`) REFERENCES `aeronave` (`Id_Aeronave`) ON DELETE CASCADE;

--
-- Filtros para la tabla `walkaround`
--
ALTER TABLE `walkaround`
  ADD CONSTRAINT `walkaround_ibfk_1` FOREIGN KEY (`Id_Aeronave`) REFERENCES `aeronave` (`Id_Aeronave`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
