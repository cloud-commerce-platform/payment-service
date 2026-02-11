import type { PoolClient } from "pg";
import format from "pg-format";

export interface PaymentDbStructure {
	id: string;
	order_id: string;
	customer_id: string;
	amount: number;
	status: string;
}

export type entitiesDbStructure = PaymentDbStructure;

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
