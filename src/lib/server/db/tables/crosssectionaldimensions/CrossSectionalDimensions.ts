import { pool } from '../../index';

export async function getCrossSectionalDimensionsById(Id: number) {
    const [result] = await pool.query('SELECT * FROM cross_sectional_dimensions WHERE id = ?', [Id]);
    return result;
}

export async function getCrossSectionalDimensionsBycubestrenghttestDataId(cubestrenghttestDataId: number) {
    const [result] = await pool.query('SELECT * FROM cross_sectional_dimensions WHERE ConcreteCubeStrenghtTestDataId = ?', [cubestrenghttestDataId]); 
    return result;
}

export async function createCrossSectionalDimension(cubestrenghttestDataId : number, dimension: string, value: number) {
    const [result]: any[] = await pool.query("INSERT INTO cross_sectional_dimensions (ConcreteCubeStrenghtTestDataId, Dimension, Value) VALUES(?, ?, ?)", [cubestrenghttestDataId, dimension, value]);
}