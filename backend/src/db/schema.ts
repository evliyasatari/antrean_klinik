import {
	pgTable,
	integer,
	varchar,
	date,
	timestamp,
	text,
} from "drizzle-orm/pg-core";

export const poli = pgTable("poli", {
	idPoli: integer("id_poli").primaryKey().generatedByDefaultAsIdentity(),
	namaPoli: varchar("nama_poli", { length: 50 }),
	kodeAntrean: varchar("kode_antrean", { length: 5 }),
});

export const dokter = pgTable("dokter", {
	idDokter: integer("id_dokter").primaryKey().generatedByDefaultAsIdentity(),
	namaDokter: varchar("nama_dokter", { length: 50 }),
	idPoli: integer("id_poli").references(() => poli.idPoli, { onDelete: "restrict", onUpdate: "cascade" }),
	noHp: varchar("no_hp", { length: 15 }),
});

export const pasien = pgTable("pasien", {
	idPasien: integer("id_pasien").primaryKey().generatedByDefaultAsIdentity(),
	nik: varchar("nik", { length: 20 }),
	namaPasien: varchar("nama_pasien", { length: 50 }),
	jenisKelamin: varchar("jenis_kelamin", { length: 10 }),
	tanggalLahir: date("tanggal_lahir", { mode: 'string' }),
	noHp: varchar("no_hp", { length: 15 }),
	alamat: varchar("alamat", { length: 50 }),
});

export const pendaftaran = pgTable("pendaftaran", {
	idPendaftaran: integer("id_pendaftaran").primaryKey().generatedByDefaultAsIdentity(),
	idPasien: integer("id_pasien").references(() => pasien.idPasien, { onDelete: "restrict", onUpdate: "cascade" }),
	idDokter: integer("id_dokter").references(() => dokter.idDokter, { onDelete: "restrict", onUpdate: "cascade" }),
	tglKunjungan: date("tgl_kunjungan", { mode: 'string' }),
	tglDaftar: timestamp("tgl_daftar", { mode: 'string' }),
	keluhan: text("keluhan"),
	status: varchar("status", { length: 20 }),
});

export const petugas = pgTable("petugas", {
	idPetugas: integer("id_petugas").primaryKey().generatedByDefaultAsIdentity(),
	nip: varchar("nip", { length: 25 }),
	namaPetugas: varchar("nama_petugas", { length: 50 }),
	noHp: varchar("no_hp", { length: 15 }),
});

export const antrean = pgTable("antrean", {
	idAntrean: integer("id_antrean").primaryKey().generatedByDefaultAsIdentity(),
	idPendaftaran: integer("id_pendaftaran").references(() => pendaftaran.idPendaftaran, { onDelete: "restrict", onUpdate: "cascade" }),
	idPetugas: integer("id_petugas").references(() => petugas.idPetugas, { onDelete: "restrict", onUpdate: "cascade" }),
	nomorAntrean: varchar("nomor_antrean", { length: 10 }),
	tglAntrean: date("tgl_antrean", { mode: 'string' }),
	statusAntrean: varchar("status_antrean", { length: 20 }),
	waktuPanggil: timestamp("waktu_panggil", { mode: 'string' }),
});
