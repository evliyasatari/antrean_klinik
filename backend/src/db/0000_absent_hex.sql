-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `antrean` (
	`id_antrean` int NOT NULL,
	`id_pendaftaran` int,
	`nomor_antrean` varchar(10),
	`tgl_antrean` date,
	`status_antrean` enum('menunggu','dipanggil','selesai'),
	`waktu_panggil` datetime,
	CONSTRAINT `antrean_id_antrean` PRIMARY KEY(`id_antrean`),
	CONSTRAINT `id_pendaftaran` UNIQUE(`id_pendaftaran`)
);
--> statement-breakpoint
CREATE TABLE `dokter` (
	`id_dokter` int NOT NULL,
	`nama_dokter` varchar(50),
	`id_poli` int,
	`no_hp` varchar(15),
	CONSTRAINT `dokter_id_dokter` PRIMARY KEY(`id_dokter`)
);
--> statement-breakpoint
CREATE TABLE `pasien` (
	`id_pasien` int NOT NULL,
	`nik` varchar(20),
	`nama_pasien` varchar(50),
	`jenis_kelamin` enum('L','P'),
	`tanggal_lahir` date,
	`no_hp` varchar(15),
	`alamat` varchar(50),
	CONSTRAINT `pasien_id_pasien` PRIMARY KEY(`id_pasien`),
	CONSTRAINT `nik` UNIQUE(`nik`)
);
--> statement-breakpoint
CREATE TABLE `pendaftaran` (
	`id_pendaftaran` int NOT NULL,
	`id_pasien` int,
	`id_dokter` int,
	`tgl_kunjungan` date,
	`tgl_daftar` datetime,
	`keluhan` text,
	`status` enum('terdaftar','dibatalkan'),
	CONSTRAINT `pendaftaran_id_pendaftaran` PRIMARY KEY(`id_pendaftaran`)
);
--> statement-breakpoint
CREATE TABLE `petugas` (
	`id_petugas` int NOT NULL,
	`nama_petugas` varchar(50),
	`no_hp` varchar(15),
	CONSTRAINT `petugas_id_petugas` PRIMARY KEY(`id_petugas`)
);
--> statement-breakpoint
CREATE TABLE `poli` (
	`id_poli` int NOT NULL,
	`nama_poli` varchar(50),
	CONSTRAINT `poli_id_poli` PRIMARY KEY(`id_poli`)
);
--> statement-breakpoint
ALTER TABLE `antrean` ADD CONSTRAINT `fk_antrean_pendaftaran` FOREIGN KEY (`id_pendaftaran`) REFERENCES `pendaftaran`(`id_pendaftaran`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `dokter` ADD CONSTRAINT `fk_dokter_poli` FOREIGN KEY (`id_poli`) REFERENCES `poli`(`id_poli`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `pendaftaran` ADD CONSTRAINT `fk_pendaftaran_dokter` FOREIGN KEY (`id_dokter`) REFERENCES `dokter`(`id_dokter`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `pendaftaran` ADD CONSTRAINT `fk_pendaftaran_pasien` FOREIGN KEY (`id_pasien`) REFERENCES `pasien`(`id_pasien`) ON DELETE restrict ON UPDATE cascade;
*/