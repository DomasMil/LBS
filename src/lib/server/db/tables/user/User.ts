import bcrypt from 'bcrypt';

import { pool } from '../../index';


export async function getUsers() {
    const [result] = await pool.query('SELECT * FROM users')
    return result
}

export async function getUserById(id: number) {
    const [result] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    return result

}

export async function getUsersByCompanyId(id: number) {
	const [user]: any[] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    const companyId = user[0].companyId
	const [result] = await pool.query('SELECT * FROM users WHERE companyId = ?', [companyId])
	return result
}

export async function findUserByUsername(username: string) {
    const [result]: any[] = await pool.query('SELECT * FROM users WHERE username = ?', [username])
    const id = result[0].id
    return getUserById(id)
}

export async function createUser(username: string, password: string, name: string, email: string, companyId: number, role: string) {
	try {
		const salt = bcrypt.genSaltSync(12);
		const hashed_password = bcrypt.hashSync(password, salt);
		const [result]: any[] = await pool.query("INSERT INTO users (username, password, name, email, companyId, role) VALUES(?, ?, ?, ?, ?, ?)", [username, hashed_password, name, email, companyId, role]);
		const id = result.id;
		return getUserById(id);
	} catch (error: any) {
		if (error.code === 'ER_DUP_ENTRY') {
			throw new Error('Username already exists.');
		} else {
			throw new Error('Error creating user.');
		}
	}
}

export async function checkUserCredentials(username: string, password: string): Promise<boolean> {
    const sql = `
        SELECT password
        FROM users
        WHERE username = ?
    `;
    const [rows] = await pool.query(sql, [username]);
    const row = (rows as { password: string }[])[0];
    if (row) {
        return await bcrypt.compare(password, row.password);
    } else {
        return false;
    }
}

export async function updateUserPassword(username: string, password: string) {
    const salt = bcrypt.genSaltSync(12);
    const hashed_password = bcrypt.hashSync(password, salt);
    const [result] = await pool.query('UPDATE users SET password = ? WHERE username = ?', [hashed_password, username])
    return result
}