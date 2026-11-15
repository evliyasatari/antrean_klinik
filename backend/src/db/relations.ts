import { relations } from "drizzle-orm/relations";
import { pendaftaran, antrean, petugas, poli, dokter, pasien } from "./schema";

export const antreanRelations = relations(antrean, ({one}) => ({
	pendaftaran: one(pendaftaran, {
		fields: [antrean.idPendaftaran],
		references: [pendaftaran.idPendaftaran]
	}),
	petugas: one(petugas, {
		fields: [antrean.idPetugas],
		references: [petugas.idPetugas]
	}),
}));

export const pendaftaranRelations = relations(pendaftaran, ({one, many}) => ({
	antreans: many(antrean),
	dokter: one(dokter, {
		fields: [pendaftaran.idDokter],
		references: [dokter.idDokter]
	}),
	pasien: one(pasien, {
		fields: [pendaftaran.idPasien],
		references: [pasien.idPasien]
	}),
}));

export const petugasRelations = relations(petugas, ({many}) => ({
	antreans: many(antrean),
}));

export const dokterRelations = relations(dokter, ({one, many}) => ({
	poli: one(poli, {
		fields: [dokter.idPoli],
		references: [poli.idPoli]
	}),
	pendaftarans: many(pendaftaran),
}));

export const poliRelations = relations(poli, ({many}) => ({
	dokters: many(dokter),
}));

export const pasienRelations = relations(pasien, ({many}) => ({
	pendaftarans: many(pendaftaran),
}));