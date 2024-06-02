import { pool } from '../../index';

export async function getCompanies() {
    const [result] = await pool.query('SELECT * FROM companies')
	console.log(result)
    return result
}

export async function getCompanyById(id: number) {
    const [result] = await pool.query('SELECT * FROM companies WHERE id = ?', [id]);
    return result;
}

export async function getCompanyNameById(id: number) {
    const [result] = await pool.query('SELECT name FROM companies WHERE id = ?', [id]);
    return result;
}

export async function createCompany(name: string, address: string, companyCode: string) {
	try {
		const [result]: any[] = await pool.query("INSERT INTO companies (Name, Address, CompanyCode) VALUES(?, ?, ?)", [name, address, companyCode]);
		const id = result.id;
		return getCompanyById(id);
	} catch (error: any) {
		if (error.code === 'ER_DUP_ENTRY') {
			throw new Error('Company already exists.');
		} else {
			throw new Error('Error creating company.');
		}
	}
}

export async function updateCompany(id: number, name: string, address: string, companyCode: string) {
	const [result] = await pool.query('UPDATE companies SET Name = ?, Address = ?, CompanyCode = ? WHERE id = ?', [name, address, companyCode, id]);
	return result;
}