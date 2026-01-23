import moment from "moment";
import type { PoolClient } from "pg";
import format from "pg-format";

export interface InventoryItemDbStructure {
	id: string;
	sku: string;
	total_quantity: number;
	available_quantity: number;
	reserved_quantity: number;
}

export interface ReservationDbStructure {
	id: string;
	order_id: string;
	status: string;
	expires_at: Date | null;
}

export interface ReservationItemDbStructure {
	id: string;
	reservation_id: string;
	item_id: string;
	quantity: number;
}

export type entitiesDbStructure =
	| InventoryItemDbStructure
	| ReservationDbStructure
	| ReservationItemDbStructure;

export const saveStructures = async (
	structures: entitiesDbStructure[],
	tableName: string,
	client: PoolClient
): Promise<any> => {
	return saveStructuresWithConflictKey(structures, tableName, "(id)", client);
};

export const saveStructuresWithConflictKey = async (
	structures: entitiesDbStructure[],
	tableName: string,
	onConflictStatement: string,
	client: PoolClient
): Promise<any> => {
	if (structures.length === 0) {
		return;
	}

	structures.forEach((structure) => {
		// reservation_items no tiene updated_at, manejamos esto con cuidado
		if ("updated_at" in structure || !tableName.includes("reservation_items")) {
			(structure as any).updated_at = moment.utc().toDate();
		}
	});

	const columns = Object.keys(structures[0])
		.map((key) => {
			return `"${key}"`;
		})
		.join(",");
	const conflict = Object.keys(structures[0])
		.map((key) => {
			return `"${key}" = excluded."${key}"`;
		})
		.join(",");
	try {
		const sql = format(
			`
        INSERT INTO ${tableName} (${columns})
        VALUES %L
        ON CONFLICT ${onConflictStatement} DO UPDATE
        SET ${conflict}
      `,
			structures.map((structure) => {
				return Object.keys(structure).map((key) => {
					return (structure as any)[key];
				});
			})
		);

		await client.query(sql);
	} catch (error) {
		console.error("DB Error in saveStructures:", error);
		throw new Error("COULD_NOT_SAVE_DB_STRUCTURE");
	}
};
