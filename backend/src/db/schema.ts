import { mysqlTable, mysqlSchema, AnyMySqlColumn, foreignKey, primaryKey, unique, int, varchar, date, mysqlEnum, datetime, text } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const antrean = mysqlTable("antrean", {
	idAntrean: int("id_antrean").autoincrement().notNull(),
	idPendaftaran: int("id_pendaftaran").references(() => pendaftaran.idPendaftaran, { onDelete: "restrict", onUpdate: "cascade" } ),
	idPetugas: int("id_petugas").references(() => petugas.idPetugas, { onDelete: "restrict", onUpdate: "cascade" } ),
	nomorAntrean: varchar("nomor_antrean", { length: 10 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	tglAntrean: date("tgl_antrean", { mode: 'string' }),
	statusAntrean: mysqlEnum("status_antrean", ['menunggu','dipanggil','selesai']),
	waktuPanggil: datetime("waktu_panggil", { mode: 'string'}),
},
(table) => [
	primaryKey({ columns: [table.idAntrean], name: "antrean_id_antrean"}),
	unique("id_pendaftaran").on(table.idPendaftaran),
]);

export const dokter = mysqlTable("dokter", {
	idDokter: int("id_dokter").autoincrement().notNull(),
	namaDokter: varchar("nama_dokter", { length: 50 }),
	idPoli: int("id_poli").references(() => poli.idPoli, { onDelete: "restrict", onUpdate: "cascade" } ),
	noHp: varchar("no_hp", { length: 15 }),
},
(table) => [
	primaryKey({ columns: [table.idDokter], name: "dokter_id_dokter"}),
]);

export const pasien = mysqlTable("pasien", {
	idPasien: int("id_pasien").autoincrement().notNull(),
	nik: varchar({ length: 20 }),
	namaPasien: varchar("nama_pasien", { length: 50 }),
	jenisKelamin: mysqlEnum("jenis_kelamin", ['L','P']),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	tanggalLahir: date("tanggal_lahir", { mode: 'string' }),
	noHp: varchar("no_hp", { length: 15 }),
	alamat: varchar({ length: 50 }),
},
(table) => [
	primaryKey({ columns: [table.idPasien], name: "pasien_id_pasien"}),
	unique("nik").on(table.nik),
]);

export const pendaftaran = mysqlTable("pendaftaran", {
	idPendaftaran: int("id_pendaftaran").autoincrement().notNull(),
	idPasien: int("id_pasien").references(() => pasien.idPasien, { onDelete: "restrict", onUpdate: "cascade" } ),
	idDokter: int("id_dokter").references(() => dokter.idDokter, { onDelete: "restrict", onUpdate: "cascade" } ),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	tglKunjungan: date("tgl_kunjungan", { mode: 'string' }),
	tglDaftar: datetime("tgl_daftar", { mode: 'string'}),
	keluhan: text(),
	status: mysqlEnum(['terdaftar','dibatalkan']),
},
(table) => [
	primaryKey({ columns: [table.idPendaftaran], name: "pendaftaran_id_pendaftaran"}),
]);

export const petugas = mysqlTable("petugas", {
	idPetugas: int("id_petugas").autoincrement().notNull(),
	nip: varchar({ length: 25 }),
	namaPetugas: varchar("nama_petugas", { length: 50 }),
	noHp: varchar("no_hp", { length: 15 }),
},
(table) => [
	primaryKey({ columns: [table.idPetugas], name: "petugas_id_petugas"}),
	unique("nip").on(table.nip),
]);

export const poli = mysqlTable("poli", {
	idPoli: int("id_poli").autoincrement().notNull(),
	namaPoli: varchar("nama_poli", { length: 50 }),
	kodeAntrean: varchar("kode_antrean", { length: 5 }),
},
(table) => [
	primaryKey({ columns: [table.idPoli], name: "poli_id_poli"}),
	unique("kode_antrean").on(table.kodeAntrean),
]);
