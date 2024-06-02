import { pool } from '../../index';

export async function getStrengthTestDataById(Id: number) {
    const [result] = await pool.query('SELECT * FROM strength_test_data WHERE id = ?', [Id]);
    return result;

}

export async function getStrengthTestDataByStrengthTestId(strengthTestId: number) {
    const [result] = await pool.query('SELECT * FROM strength_test_data WHERE ConcreteCubeStrengthTestId = ?', [strengthTestId]);
    
    return result;
}

export async function createStrengthTestData(strengthTestId: number, comment: string, destructivePower: number, crushingStrength: number) {
    try {
        const [result]: any[] = await pool.query("INSERT INTO strength_test_data (ConcreteCubeStrengthTestId, Comment, DestructivePower) VALUES(?, ?, ?)", [strengthTestId, comment, destructivePower]);
        const id = result.insertId;
        return getStrengthTestDataById(id);
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('strengthtestdata site already exists.');
        } else {
            throw new Error('Error creating strengthtestdata site.');
        }
    }
}

export async function updateStrengthTestDataCrushingStrength(crushingStrength: number, id: number) {
    const [result] = await pool.query('UPDATE strength_test_data SET CrushingStrength = ? WHERE id = ?', [crushingStrength, id]);
}