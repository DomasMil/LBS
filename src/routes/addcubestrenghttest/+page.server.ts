import type { PageServerLoad } from '../$types';
import { error } from '@sveltejs/kit';
import type { MyUserType } from '$lib/server/db/tables/user/UserType';
import type { CompanyType } from '$lib/server/db/tables/company/CompanyType';
import { getUsers } from '$lib/server/db/tables/user/User';
import { getCompanies } from '$lib/server/db/tables/company/Company';
import { getConstructionSites } from '$lib/server/db/tables/constructionsite/ConstructionSite';
import type { ConstructionSiteType } from '$lib/server/db/tables/constructionsite/ConstructionSiteType';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { createStrengthTest, updateStrengthTestTypeConstaint, updateStrengthTestTypeInitial } from '$lib/server/db/tables/strengthtest/StrengthTest';
import { parse } from 'cookie';
import type { StrengthTestType } from '$lib/server/db/tables/strengthtest/StrengthTestType';
import { createStrengthTestData, updateStrengthTestDataCrushingStrength } from '$lib/server/db/tables/strengthtestdata/StrengthTestData';
import type { StrengthTestDataType } from '$lib/server/db/tables/strengthtestdata/StrengthTestDataType';
import { createCrossSectionalDimension } from '$lib/server/db/tables/crosssectionaldimensions/CrossSectionalDimensions';

type ConcreteClass = {
    name: string;
    value: number;
  };
  const classes: ConcreteClass[] = [
    { name: 'C8/10', value: 10 },
    { name: 'C12/15', value: 15 },
    { name: 'C16/20', value: 20 },
    { name: 'C20/25', value: 25 },
    { name: 'C25/30', value: 30 },
    { name: 'C30/37', value: 37 },
    { name: 'C35/45', value: 45 },
    { name: 'C40/50', value: 50 },
    { name: 'C45/55', value: 55 },
    { name: 'C50/60', value: 60 },
    { name: 'C55/67', value: 67 },
    { name: 'C60/75', value: 75 },
    { name: 'C70/85', value: 85 },
    { name: 'C80/95', value: 95 },
    { name: 'C90/105', value: 105 },
    { name: 'C100/115', value: 115 },
    ];

function findClass(characteristicStrenght: number): string {
    for (let i = 0; i < classes.length; i++) {
      if (characteristicStrenght < classes[i].value) {
        return classes[i].name;
      }
    }
    return 'No class found';
  }


export const load = (({ request, depends }) => {
	depends('template:load');
    const cookies = request.headers.get('cookie');
    const { role } = parse(cookies || '');
	if (!role?.includes('admin') && !role?.includes('employee')) {
		throw error(404, 'Neteisėtas prisijungimas');
	}
    let users: MyUserType[] = getUsers();
    let companies: CompanyType[] = getCompanies();
    let constructionSites: ConstructionSiteType[] = getConstructionSites();

    return {
        users,
        companies,
        constructionSites
    };
}) satisfies PageServerLoad;

export const actions: Actions = {

    addStrengthTest: async ({ request, cookies }) => {
        const data = await request.formData();
        const clientCompany = data.get('clientCompany')?.toString();
        const companyConstructionSite = data.get('companyConstructionSite')?.toString();
        const receivedDate = data.get('receivedDate')?.toString();
        const deliveredBy = data.get('deliveredBy')?.toString();
        const sampleReceivedComment = data.get('sampleReceivedComment')?.toString();
        const sampleCount = data.get('sampleCount')?.toString();
        const testType = data.get('testType')?.toString();
        const acceptedSampleCount = data.get('acceptedSampleCount')?.toString();
        const rejectedSampleCount = data.get('rejectedSampleCount')?.toString();
        const concreteType = data.get('concreteType')?.toString();
        const testExecutionDate = data.get('testExecutionDate')?.toString();
        const testExecutorId = data.get('testExecutorId')?.toString();
        const testExecutorCompanyId = data.get('testExecutorCompanyId')?.toString();

let parsedData: { [key: string]: any } = {};

for (let entry of data) {
    const name = entry[0];
    const value = entry[1];

    if (!name.startsWith('crossSection') && !name.startsWith('destructivePower') && !name.startsWith('crushingStrength') && !name.startsWith('Comment')) {
        continue;
    }

    const nameParts = name.split('-');
    const category = nameParts[0];
    const index = nameParts[1];
    const subIndex = nameParts[2] || null;
    const subSubIndex = nameParts[3] || null;

    if (!parsedData[index]) {
        parsedData[index] = {};
    }

    if (subSubIndex) {
        if (!parsedData[index][category]) {
            parsedData[index][category] = {};
        }
        if (!parsedData[index][category][subIndex]) {
            parsedData[index][category][subIndex] = {};
        }
        parsedData[index][category][subIndex][subSubIndex] = value;
    } else if (subIndex) {
        if (!parsedData[index][category]) {
            parsedData[index][category] = {};
        }
        parsedData[index][category][subIndex] = value;
    } else {
        parsedData[index][category] = value;
    }
}

let data0 = [];
let data1 = [];
let data2 = [];

for (let index in parsedData) {
    if (index === 'a' || index === 'b') {
        for (let subIndex in parsedData[index]['crossSection']) {
            for (let subSubIndex in parsedData[index]['crossSection'][subIndex]) {
                let value = parsedData[index]['crossSection'][subIndex][subSubIndex];
                let name = `crossSection-${index}-${subIndex}-${subSubIndex}`;
                switch(subIndex) {
                    case '0':
                        data0.push({ name, value });
                        break;
                    case '1':
                        data1.push({ name, value });
                        break;
                    case '2':
                        data2.push({ name, value });
                        break;
                }
            }
        }
    } else {
        for (let category in parsedData[index]) {
            let value = parsedData[index][category];
            let name = `${category}-${index}`;
            switch(index) {
                case '0':
                    data0.push({ name, value });
                    break;
                case '1':
                    data1.push({ name, value });
                    break;
                case '2':
                    data2.push({ name, value });
                    break;
            }
        }
    }
}

        if (clientCompany && companyConstructionSite && receivedDate && deliveredBy && sampleReceivedComment && sampleCount && testType && acceptedSampleCount && rejectedSampleCount && concreteType && testExecutionDate && testExecutorId && testExecutorCompanyId) {
            let sumA1 = 0;
            let sumB1 = 0;
            let sumA2 = 0;
            let sumB2 = 0;
            let SumA3 = 0;
            let SumB3 = 0;
            let [strengthTest] : StrengthTestType[] = await createStrengthTest(Number(clientCompany), Number(companyConstructionSite), new Date(receivedDate), deliveredBy, sampleReceivedComment, Number(sampleCount), testType, Number(acceptedSampleCount), Number(rejectedSampleCount), concreteType, new Date(testExecutionDate), Number(testExecutorId), Number(testExecutorCompanyId)) as StrengthTestType[];
            let [strengthTestData] : StrengthTestDataType[] = await createStrengthTestData(strengthTest.Id, data0[2].value, Number(data0[0].value), Number(data0[1].value)) as StrengthTestDataType[];
            for(let i = 0; i < 12; i++) {

                if(i < 6) {
                    await createCrossSectionalDimension(strengthTestData.Id, 'a', Number(data0[i+3].value))
                    sumA1 += Number(data0[i+3].value);
                } else {
                    await createCrossSectionalDimension(strengthTestData.Id, 'b', Number(data0[i+3].value))
                    sumB1 += Number(data0[i+3].value);
                }        
            }
            sumA1 /= 6;
            sumB1 /= 6;
            if (data1.length !== 0 && data2.length !== 0) {

                let [strengthTestData1] : StrengthTestDataType[] = await createStrengthTestData(strengthTest.Id, data1[2].value, Number(data1[0].value), Number(data1[1].value)) as StrengthTestDataType[];
                for(let i = 0; i < 12; i++) {
                    if(i < 6) {
                        await createCrossSectionalDimension(strengthTestData1.Id, 'a', Number(data1[i+3].value))
                        sumA2 += Number(data1[i+3].value);
                    } else {
                        await createCrossSectionalDimension(strengthTestData1.Id, 'b', Number(data1[i+3].value))
                        sumB2 += Number(data1[i+3].value);
                    }            
                }
                let [strengthTestData2] = await createStrengthTestData(strengthTest.Id, data2[2].value, Number(data2[0].value), Number(data2[1].value)) as StrengthTestDataType[];
                for(let i = 0; i < 12; i++) {
                    if(i < 6) {
                        await createCrossSectionalDimension(strengthTestData2.Id, 'a', Number(data2[i+3].value))
                        SumA3 += Number(data2[i+3].value);
                    } else {
                        await createCrossSectionalDimension(strengthTestData2.Id, 'b', Number(data2[i+3].value))
                        SumB3 += Number(data2[i+3].value);
                    }            
                }
                sumA2 /= 6;
                sumB2 /= 6;
                SumA3 /= 6;
                SumB3 /= 6;
                let avgCubeStrength1 = Number(data0[0].value*1000)/(sumA1*sumB1);
                await updateStrengthTestDataCrushingStrength(Number(avgCubeStrength1.toFixed(3)), strengthTestData.Id)
                let avgCubeStrength2 = Number(data1[0].value*1000)/(sumA2*sumB2);
                await updateStrengthTestDataCrushingStrength(Number(avgCubeStrength2.toFixed(3)), strengthTestData1.Id)
                let avgCubeStrength3 = Number(data2[0].value*1000)/(SumA3*SumB3);
                await updateStrengthTestDataCrushingStrength(Number(avgCubeStrength3.toFixed(3)), strengthTestData2.Id)
                let avgCubeStrengthTotal = (avgCubeStrength1 + avgCubeStrength2 + avgCubeStrength3)/3;
                let characteristicStrenght = Math.min(avgCubeStrengthTotal-4,Math.min(avgCubeStrength1,avgCubeStrength2,avgCubeStrength3)+4);
                let concreteClass = findClass(characteristicStrenght);
                await updateStrengthTestTypeInitial(strengthTest.Id, Number(characteristicStrenght.toFixed(3)), avgCubeStrengthTotal, concreteClass)
            } else {

                let avgCubeStrengthTotal = Number(data0[0].value*1000)/(sumA1*sumB1);
                await updateStrengthTestDataCrushingStrength(Number(avgCubeStrengthTotal.toFixed(3)), strengthTestData.Id)
                let StandardDeviation = Math.sqrt(Math.pow(((Math.pow(((1-0.0009)),2))),2));
                let characteristicStrenght = Math.min(avgCubeStrengthTotal+1.48*StandardDeviation,Math.min(avgCubeStrengthTotal)+4);
                let concreteClass = findClass(characteristicStrenght);
                await updateStrengthTestTypeInitial(strengthTest.Id, avgCubeStrengthTotal, Number(characteristicStrenght.toFixed(3)), concreteClass)
            }

            
            throw redirect(303, '/addcubestrenghttest?success');
        } else {
            return fail(400, { errorMessage: 'Missing information' });
        }
    },

}