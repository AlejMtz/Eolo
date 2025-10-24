-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-10-2025 a las 21:19:35
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
(10, 'N150GB', 'Avion', 'Gulfstream G150');

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
(59, 'parabrisas_limpiadores', 5, 5, 1, 1, 0, 1, 0, 0, 0, 0),
(60, 'radomo', 5, 5, 1, 1, 0, 1, 0, 0, 0, 0),
(61, 'fuselaje', 5, 5, 1, 1, 0, 1, 0, 0, 0, 0),
(62, 'borde_ataque', 5, 5, 1, 1, 0, 1, 0, 0, 0, 0),
(63, 'motor', 5, 5, 1, 1, 0, 1, 0, 0, 0, 0),
(64, 'borde_empenaje', 5, 5, 1, 1, 0, 1, 0, 0, 0, 0),
(65, 'tren_nariz', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(66, 'compuertas_tren', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(67, 'tubo_pitot', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(68, 'antena', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(69, 'aleta', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(70, 'aleron', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(71, 'compensador_aleron', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(72, 'mechas_descarga', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(73, 'punta_ala', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(74, 'luces_carretero', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(75, 'luces_navegacion', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(76, 'tren_principal', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(77, 'valvulas_servicio', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(78, 'estabilizador_vertical', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(79, 'timon_direccion', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(80, 'compensador_timon_direccion', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(81, 'estabilizador_horizontal', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(82, 'timon_profundidad', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(83, 'compensador_timon_profundidad', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
(84, 'alas_delta', 5, 5, 0, 0, 0, 0, 0, 0, 0, 0),
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
(367, 'tren_nariz', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(368, 'compuertas_tren', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(369, 'parabrisas_limpiadores', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(370, 'radomo', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(371, 'tubo_pitot', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(372, 'fuselaje', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(373, 'antena', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(374, 'aleta', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(375, 'aleron', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(376, 'compensador_aleron', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(377, 'mechas_descarga', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(378, 'punta_ala', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(379, 'luces_carretero', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(380, 'luces_navegacion', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(381, 'borde_ataque', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(382, 'tren_principal', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(383, 'valvulas_servicio', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(384, 'motor', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(385, 'estabilizador_vertical', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(386, 'timon_direccion', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(387, 'compensador_timon_direccion', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(388, 'estabilizador_horizontal', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(389, 'timon_profundidad', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(390, 'compensador_timon_profundidad', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(391, 'borde_empenaje', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(392, 'alas_delta', 15, 6, 0, 0, 0, 0, 0, 0, 0, 0),
(393, 'fuselaje', 16, 2, 1, 0, 0, 0, 0, 0, 0, 0),
(394, 'palas', 16, 2, 0, 1, 0, 1, 0, 0, 0, 0),
(395, 'rotor', 16, 2, 0, 1, 0, 0, 0, 0, 0, 0),
(396, 'puertas', 16, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(397, 'esqui', 16, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(398, 'boom', 16, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(399, 'estabilizadores', 16, 2, 0, 0, 0, 0, 0, 0, 0, 0),
(400, 'parabrisas', 16, 2, 0, 0, 0, 0, 0, 0, 0, 0);

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
(1, '2025-10-10', 22, 1, 22, 20, '22', 22, 22, 'Sin cambio', 'Sin fallas', 'Ninguna', 'ALEJANDRO', 2222.00, 'ALEJANDRO', 'JUAN', '22', 22, 11);

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
(4, 1, 1, 0, 0, 'RADIO VHF Fijo');

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
(3, 1, 1, 1, 1, 'COPIADORAS', 1, 'bueno');

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
(9, 16, 2, '/Eolo/public/assets/evidencias/68fa715119ec3_16_2025-10-2312.17.234687013077887380006.jpg', '2025-10-2312.17.234687013077887380006.jpg');

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
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador Principal', 'admin', 1, '2025-10-02 15:53:30', '2025-10-23 16:16:21'),
(2, 'usuario', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Usuario Regular', 'usuario', 1, '2025-10-02 15:53:30', '2025-10-23 18:16:21'),
(4, 'usuarioP', '$2y$10$hReg3PcLmcMFbmvEjoZ1MenUF.Qxt1FPVndX8vmWBLWJcz61mUlgi', 'Usuario Nuevo', 'usuario', 1, '2025-10-17 16:56:47', '2025-10-20 18:15:53');

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
(5, '2025-10-10 17:46:00', 5, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', '', '', 'SLP', 0, 1),
(6, '2025-10-10 18:01:00', 6, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', '', '', 'D60', 0, 1),
(7, '2025-10-10 18:08:00', 7, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', '', '', 'MGGT', 0, 1),
(8, '2025-10-10 18:24:00', 8, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', '', '', 'SLW', 0, 1),
(9, '2025-10-10 18:53:00', 9, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', '', '', 'ACA', 0, 1),
(10, '2025-10-11 01:19:00', 10, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', 'Daños en ala derecha y estetica de lado derecho dañado', 'MTY', '', 1, 0),
(12, '2025-10-14 21:28:00', 2, 'JUAN LOPEZ', 'MARTHA GARCÍA', 'PACO PEREZ', 'JULIO JARRAMILLO', 'No hay observaciones ', 'CUN', '', 1, 0),
(13, '2025-10-23 15:16:00', 2, 'JUAN', 'PEDRO', 'SOFIA', 'RAMON', 'daño en rotor derecho', 'MTT', '', 1, 0),
(14, '2025-10-23 16:10:00', 4, 'aaa', 'aaa', 'aaa', 'aaa', '', 'SLW', '', 1, 0),
(15, '2025-10-23 16:42:00', 6, 'ss', 'ss', 'ss', 'ss', 'sss', 'GDL', '', 1, 0),
(16, '2025-10-23 12:16:00', 2, 'Juan', 'Alma ', 'Pedro', 'Jesus', 'Golpes es la parte derecha ', 'NDA', '', 1, 0);

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
-- Indices de la tabla `componentewk`
--
ALTER TABLE `componentewk`
  ADD PRIMARY KEY (`Id_Componete_Wk`),
  ADD KEY `Id_Aeronave_2` (`Id_Aeronave`),
  ADD KEY `Id_Aeronave_3` (`Id_Aeronave`),
  ADD KEY `Id_Walk` (`Id_Walk`);

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
  MODIFY `Id_Aeronave` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `aeropuertos`
--
ALTER TABLE `aeropuertos`
  MODIFY `Id_Aeropuerto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT de la tabla `componentewk`
--
ALTER TABLE `componentewk`
  MODIFY `Id_Componete_Wk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=401;

--
-- AUTO_INCREMENT de la tabla `entregaturno`
--
ALTER TABLE `entregaturno`
  MODIFY `Id_EntregaTurno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `equipocomunicacion`
--
ALTER TABLE `equipocomunicacion`
  MODIFY `Id_Equipo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `equipooficina`
--
ALTER TABLE `equipooficina`
  MODIFY `Id_Equipo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `evidencias`
--
ALTER TABLE `evidencias`
  MODIFY `Id_Evidencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `Id_Usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `walkaround`
--
ALTER TABLE `walkaround`
  MODIFY `Id_Walk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `componentewk`
--
ALTER TABLE `componentewk`
  ADD CONSTRAINT `componentewk_ibfk_1` FOREIGN KEY (`Id_Aeronave`) REFERENCES `aeronave` (`Id_Aeronave`) ON DELETE CASCADE,
  ADD CONSTRAINT `componentewk_ibfk_3` FOREIGN KEY (`Id_Walk`) REFERENCES `walkaround` (`Id_Walk`) ON DELETE CASCADE;

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
-- Filtros para la tabla `walkaround`
--
ALTER TABLE `walkaround`
  ADD CONSTRAINT `walkaround_ibfk_1` FOREIGN KEY (`Id_Aeronave`) REFERENCES `aeronave` (`Id_Aeronave`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
