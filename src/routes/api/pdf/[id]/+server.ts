import { exec } from 'child_process';
import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import type { StrengthTestListType } from '$lib/server/db/tables/strengthtest/StrengthTestType';
import type { CompanyType } from '$lib/server/db/tables/company/CompanyType';
import { getStrengthTestById } from '$lib/server/db/tables/strengthtest/StrengthTest';
import { getCompanyById } from '$lib/server/db/tables/company/Company';
import type { MyUserType } from '$lib/server/db/tables/user/UserType';
import { getUserById } from '$lib/server/db/tables/user/User';
import { getConstructionSiteById } from '$lib/server/db/tables/constructionsite/ConstructionSite';
import type { ConstructionSiteType } from '$lib/server/db/tables/constructionsite/ConstructionSiteType';
import type { StrengthTestDataType } from '$lib/server/db/tables/strengthtestdata/StrengthTestDataType';
import { getStrengthTestDataByStrengthTestId } from '$lib/server/db/tables/strengthtestdata/StrengthTestData';
import type { crossSectionalDimensionsType } from '$lib/server/db/tables/crosssectionaldimensions/CrossSectionalDimensionsType';
import { getCrossSectionalDimensionsBycubestrenghttestDataId } from '$lib/server/db/tables/crosssectionaldimensions/CrossSectionalDimensions';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getProjectRoot(): string {
    // console.log(__dirname);
    return path.resolve(__dirname, '..', '..', '..', '..', '..');
}

function compileLatexFile(filePath: string): Promise<string> {
    const pdflatexPath = 'pdflatex';
    const outputDirectory = path.join(getProjectRoot(), 'tex');

    return new Promise((resolve, reject) => {
        exec(
            `${pdflatexPath} -output-directory="${outputDirectory}" "${filePath}"`,
            (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`pdflatex failed: ${stderr}`));
                    return;
                }
                resolve(stdout);
            }
        );
    });
}

async function retrieveStrengthTestData(testId: number) {
    let [strengthTest]: StrengthTestListType[] = await getStrengthTestById(testId) as StrengthTestListType;
    let [clientCompany]: CompanyType[] = await getCompanyById(Number(strengthTest.ClientCompanyId)) as CompanyType[];
    strengthTest.ClientCompanyId = clientCompany;
    let [employeeCompany]: CompanyType[] = await getCompanyById(Number(strengthTest.EmployeeCompanyId)) as CompanyType[];
    strengthTest.EmployeeCompanyId = employeeCompany;
    let [testExecutedByUser]: MyUserType[] = await getUserById(Number(strengthTest.TestExecutedByUserId)) as MyUserType[];
    strengthTest.TestExecutedByUserId = testExecutedByUser;
    let [protocolCreatedByUser]: MyUserType[] = await getUserById(Number(strengthTest.ProtocolCreatedByUserId)) as MyUserType[];
    strengthTest.ProtocolCreatedByUserId = protocolCreatedByUser;
    let [clientConstructionSite]: ConstructionSiteType[] = await getConstructionSiteById(Number(strengthTest.ClientConstructionSiteId)) as ConstructionSiteType[];
    strengthTest.ClientConstructionSiteId = clientConstructionSite;
    let strengthTestData: StrengthTestDataType[] = await getStrengthTestDataByStrengthTestId(strengthTest.Id) as StrengthTestDataType[];
    let crossSectionalDimensions: crossSectionalDimensionsType[][] = [];
    for (let data of strengthTestData) {
        let temp: crossSectionalDimensionsType[] = await getCrossSectionalDimensionsBycubestrenghttestDataId(data.Id) as crossSectionalDimensionsType[];
        crossSectionalDimensions.push(temp);
    }

    return {
        strengthTest,
        strengthTestData,
        crossSectionalDimensions
    };
}

export const GET: RequestHandler = async ({ request, params }) => {
    const id = params.id;
    console.log("id yra ", id)
    const result = await retrieveStrengthTestData(Number(id));
    const { strengthTest, strengthTestData, crossSectionalDimensions } = result;
    console.log("*********CROSSDATA***********", crossSectionalDimensions);
    console.log("*********TESTDATA***********", strengthTestData);
    console.log("*********STRENGTHTEST***********", strengthTest);

    const filename1 = 'Betono kubelinio stiprio nustatymas LST EN 12390-3';
    const filename2 = 'Betono kubelinio stiprio nustatymas, nuolatine gamyba LST EN 12390-3';
    const latexExtension = '.tex';
    const pdfExtension = '.pdf';

    let filePath = '';
    let latexTemplate = '';
    let latexTemplate1 = path.join(getProjectRoot(), filename1 + latexExtension);
    let latexTemplate2 = path.join(getProjectRoot(), filename2 + latexExtension);
    let editedTexOutput = '';
    let outputPath = '';


    if (strengthTest.TestType === 'Tipo bandymas') {
        latexTemplate = latexTemplate1;
        editedTexOutput = path.join(getProjectRoot(), 'tex', filename1 + latexExtension);
        outputPath = path.join(getProjectRoot(), 'tex', filename1 + pdfExtension);
        filePath = path.join(getProjectRoot(), 'tex', filename1 + latexExtension);
    } else {
        latexTemplate = latexTemplate2;
        editedTexOutput = path.join(getProjectRoot(), 'tex', filename2 + latexExtension);
        outputPath = path.join(getProjectRoot(), 'tex', filename2 + pdfExtension);
        filePath = path.join(getProjectRoot(), 'tex', filename2 + latexExtension);
    }

    let data = fs.readFileSync(path.basename(latexTemplate), 'utf8');

    data = data.replace('{{STRENGTHTESTID}}', strengthTest.Id.toString());
    data = data.replace('{{STRENGTHTESTID2}}', strengthTest.Id.toString());
    data = data.replace('{{STRENGTHTESTCLIENTCOMPANYNAME}}', strengthTest.ClientCompanyId.Name);
    data = data.replace('{{STRENGTHTESTCLIENTCOMPANYADDRESS}}', strengthTest.ClientCompanyId.Address);
    data = data.replace('{{STRENGTHTESTCLIENTCOMPANYCODE}}', strengthTest.ClientCompanyId.CompanyCode);
    data = data.replace('{{STRENGTHTESTEMPLOYEECOMPANYNAME}}', strengthTest.EmployeeCompanyId.Name);
    data = data.replace('{{STRENGTHTESTEMPLOYEECOMPANYADDRESS}}', strengthTest.EmployeeCompanyId.Address);
    data = data.replace('{{STRENGTHTESTEMPLOYEECOMPANYCODE}}', strengthTest.EmployeeCompanyId.CompanyCode);

    let formattedDate = new Intl.DateTimeFormat('lt-LT', {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
    }).format(new Date(strengthTest.TestExecutionDate));

    data = data.replace('{{TESTEXECUTIONDATE}}', formattedDate);

    formattedDate = new Intl.DateTimeFormat('lt-LT', {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
    }).format(new Date(strengthTest.TestSamplesReceivedDate));

    data = data.replace('{{TESTSAMPLESRECEIVEDDATE}}', formattedDate);
    data = data.replace('{{TESTSAMPLESDELIVEREDBY}}', strengthTest.TestSamplesDeliveredBy);
    data = data.replace('{{STRENGTHTESTEXECUTEDBYNAME}}', strengthTest.TestExecutedByUserId.name);
    data = data.replace('{{STRENGTHTESTPROTOCOLCREATEDBYNAME}}', strengthTest.ProtocolCreatedByUserId.name);
    data = data.replace('{{TESTTYPE}}', strengthTest.TestType);
    data = data.replace('{{CONCRETETYPE}}', strengthTest.ConcreteType);
    data = data.replace('{{TESTSAMPLESRECEIVEDCOUNT}}', strengthTest.TestSamplesReceivedCount.toString());
    data = data.replace('{{TESTSAMPLESRECEIVEDCOMMENT}}', strengthTest.TestSamplesReceivedComment);
    data = data.replace('{{ACCEPTEDSAMPLECOUNT}}', strengthTest.AcceptedSampleCount.toString());
    data = data.replace('{{REJECTEDSAMPLECOUNT}}', strengthTest.RejectedSampleCount.toString());
    data = data.replace('{{AVERAGECRUSHFORCE}}', strengthTest.AverageCrushForce.toString());
    data = data.replace('{{CHARACTERISTICSTRENGTH}}', strengthTest.CharacteristicStrenght.toString());
    data = data.replace('{{CONCRETERATING}}', strengthTest.ConcreteRating);

    data = data.replace('{{DESTRUCTIVEPOWER1}}', strengthTestData[0].DestructivePower.toString());
    data = data.replace('{{CRUSHINGSTRENGTH1}}', strengthTestData[0].CrushingStrength.toString());
    data = data.replace('{{DATACOMMENT1}}', strengthTestData[0].Comment);

    data = data.replace('{{CROSSDATA11}}', crossSectionalDimensions[0][0].Value.toString());
    data = data.replace('{{CROSSDATA12}}', crossSectionalDimensions[0][1].Value.toString());
    data = data.replace('{{CROSSDATA13}}', crossSectionalDimensions[0][2].Value.toString());
    data = data.replace('{{CROSSDATA14}}', crossSectionalDimensions[0][3].Value.toString());
    data = data.replace('{{CROSSDATA15}}', crossSectionalDimensions[0][4].Value.toString());
    data = data.replace('{{CROSSDATA16}}', crossSectionalDimensions[0][5].Value.toString());
    data = data.replace('{{CROSSDATA17}}', crossSectionalDimensions[0][6].Value.toString());
    data = data.replace('{{CROSSDATA18}}', crossSectionalDimensions[0][7].Value.toString());
    data = data.replace('{{CROSSDATA19}}', crossSectionalDimensions[0][8].Value.toString());
    data = data.replace('{{CROSSDATA110}}', crossSectionalDimensions[0][9].Value.toString());
    data = data.replace('{{CROSSDATA111}}', crossSectionalDimensions[0][10].Value.toString());
    data = data.replace('{{CROSSDATA112}}', crossSectionalDimensions[0][11].Value.toString());

    if (strengthTest.TestType === 'Tipo bandymas') {

        data = data.replace('{{DESTRUCTIVEPOWER2}}', strengthTestData[1].DestructivePower.toString());
        data = data.replace('{{DESTRUCTIVEPOWER3}}', strengthTestData[2].DestructivePower.toString());
        data = data.replace('{{CRUSHINGSTRENGTH2}}', strengthTestData[1].CrushingStrength.toString());
        data = data.replace('{{CRUSHINGSTRENGTH3}}', strengthTestData[2].CrushingStrength.toString());
        data = data.replace('{{DATACOMMENT2}}', strengthTestData[1].Comment);
        data = data.replace('{{DATACOMMENT3}}', strengthTestData[2].Comment);

        data = data.replace('{{CROSSDATA21}}', crossSectionalDimensions[1][0].Value.toString());
        data = data.replace('{{CROSSDATA22}}', crossSectionalDimensions[1][1].Value.toString());
        data = data.replace('{{CROSSDATA23}}', crossSectionalDimensions[1][2].Value.toString());
        data = data.replace('{{CROSSDATA24}}', crossSectionalDimensions[1][3].Value.toString());
        data = data.replace('{{CROSSDATA25}}', crossSectionalDimensions[1][4].Value.toString());
        data = data.replace('{{CROSSDATA26}}', crossSectionalDimensions[1][5].Value.toString());
        data = data.replace('{{CROSSDATA27}}', crossSectionalDimensions[1][6].Value.toString());
        data = data.replace('{{CROSSDATA28}}', crossSectionalDimensions[1][7].Value.toString());
        data = data.replace('{{CROSSDATA29}}', crossSectionalDimensions[1][8].Value.toString());
        data = data.replace('{{CROSSDATA210}}', crossSectionalDimensions[1][9].Value.toString());
        data = data.replace('{{CROSSDATA211}}', crossSectionalDimensions[1][10].Value.toString());
        data = data.replace('{{CROSSDATA212}}', crossSectionalDimensions[1][11].Value.toString());

        data = data.replace('{{CROSSDATA31}}', crossSectionalDimensions[2][0].Value.toString());
        data = data.replace('{{CROSSDATA32}}', crossSectionalDimensions[2][1].Value.toString());
        data = data.replace('{{CROSSDATA33}}', crossSectionalDimensions[2][2].Value.toString());
        data = data.replace('{{CROSSDATA34}}', crossSectionalDimensions[2][3].Value.toString());
        data = data.replace('{{CROSSDATA35}}', crossSectionalDimensions[2][4].Value.toString());
        data = data.replace('{{CROSSDATA36}}', crossSectionalDimensions[2][5].Value.toString());
        data = data.replace('{{CROSSDATA37}}', crossSectionalDimensions[2][6].Value.toString());
        data = data.replace('{{CROSSDATA38}}', crossSectionalDimensions[2][7].Value.toString());
        data = data.replace('{{CROSSDATA39}}', crossSectionalDimensions[2][8].Value.toString());
        data = data.replace('{{CROSSDATA310}}', crossSectionalDimensions[2][9].Value.toString());
        data = data.replace('{{CROSSDATA311}}', crossSectionalDimensions[2][10].Value.toString());
        data = data.replace('{{CROSSDATA312}}', crossSectionalDimensions[2][11].Value.toString());

    }

    data = data.replace('{{STRENGTHTESTPROTOCOLCREATEDBYNAME1}}', strengthTest.ProtocolCreatedByUserId.name);
    data = data.replace('{{STRENGTHTESTCLIENTCOMPANYNAME1}}', strengthTest.ClientCompanyId.Name);
    fs.writeFileSync(editedTexOutput, data);

    try {
        await compileLatexFile(filePath);

        const pdfBuffer = fs.readFileSync(outputPath);
        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${path.basename(outputPath)}"`
            }
        });
    } catch (error) {
        console.error(error);
        return new Response(`Error creating PDF: ${error.message}`, {
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
};