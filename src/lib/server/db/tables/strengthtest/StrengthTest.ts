import { pool } from '../../index';
import { writable } from 'svelte/store';

export const strengthTestStore = writable({});

export async function getStrenghtTests() {
    const [result] = await pool.query('SELECT * FROM strength_test')
	console.log(result)
    return result
}

export async function getStrengthTestById(Id: number) {
    const [result] = await pool.query('SELECT * FROM strength_test WHERE id = ?', [Id]);
    return result;
}

export async function createStrengthTest(clientCompany: number, companyConstructionSite: number, receivedDate: Date, deliveredBy: String, sampleReceivedComment: string, sampleCount: number, testType: string, acceptedSampleCount: number, rejectedSampleCount: number, concreteType: string, testExecutionDate: Date, testExecutorId: Number, testExecutorCompanyId: Number) {
    try {
        const [result]: any[] = await pool.query("INSERT INTO strength_test (ClientCompanyId, ClientConstructionSiteId, EmployeeCompanyId, TestExecutedByUserId, ProtocolCreatedByUserId, TestSamplesReceivedDate, TestSamplesDeliveredBy, TestSamplesReceivedComment, TestSamplesReceivedCount, TestType, AcceptedSampleCount, RejectedSampleCount, ConcreteType, TestExecutionDate) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [clientCompany, companyConstructionSite, testExecutorCompanyId, testExecutorId, testExecutorId, receivedDate, deliveredBy, sampleReceivedComment, sampleCount, testType, acceptedSampleCount, rejectedSampleCount, concreteType, testExecutionDate]);
        const id = result.insertId;
        await pool.query("UPDATE strength_test SET TestProtocolNumber = ? WHERE id = ?", ["NR. "+id, id])
        return await getStrengthTestById(id);
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('StrengthTest already exists.');
        } else {
            throw new Error('Error creating StrengthTest site.');
        }
    }
}

export async function updateStrengthTestTypeInitial(id : number, characteristicStrenght : Number, avgCubeStrengthTotal : Number, concreteClass : String){
    try {
        const [result]: any[] = await pool.query("UPDATE strength_test SET CharacteristicStrenght = ?, AverageCrushForce = ?, ConcreteRating = ? WHERE id = ?", [characteristicStrenght, avgCubeStrengthTotal, concreteClass, id]);
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('StrengthTest already exists.');
        } else {
            throw new Error('Error updating StrengthTest Initial .');
        }
    }
}

export async function updateStrengthTestTypeConstaint(id : number, characteristicStrenght : Number, StandardDeviation : Number, concreteClass : String){
    try {
        const [result]: any[] = await pool.query("UPDATE strength_test SET CharacteristicStrenght = ?, StandardDeviation = ?, ConcreteRating = ? WHERE id = ?", [characteristicStrenght, StandardDeviation, concreteClass, id]);
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('StrengthTest already exists.');
        } else {
            throw new Error('Error updating StrengthTest Constaint.');
        }
    }
}