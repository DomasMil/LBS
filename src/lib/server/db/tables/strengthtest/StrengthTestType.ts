import type { CompanyType } from "../company/CompanyType"
import type { ConstructionSiteType } from "../constructionsite/ConstructionSiteType"
import type { MyUserType } from "../user/UserType"

export type StrengthTestType = {
    Id:            number,
    TestProtocolNumber: string,
    ClientCompanyId: number,
    EmployeeCompanyId: number,
    TestExecutionDate: Date,
    TestSamplesReceivedDate: Date,
    TestSamplesDeliveredBy: string,
    TestSamplesReceivedComment: string,
    TestSamplesReceivedCount: number,
    TestExecutedByUserId: number,
    ProtocolCreatedByUserId: number,
    TestType: string,
    ConcreteType: string,
    AcceptedSampleCount: number,
    RejectedSampleCount: number,
    AverageCrushForce: number,
    StandardDeviation: number,
    CharacteristicStrength: number,
    ConcreteRating: string,
    ClientConstructionSiteId: number,
}

export type StrengthTestListType = {
    Id:            number,
    TestProtocolNumber: string,
    ClientCompanyId: CompanyType,
    EmployeeCompanyId: CompanyType,
    TestExecutionDate: Date,
    TestSamplesReceivedDate: Date,
    TestSamplesDeliveredBy: string,
    TestSamplesReceivedComment: string,
    TestSamplesReceivedCount: number,
    TestExecutedByUserId: MyUserType,
    ProtocolCreatedByUserId: MyUserType,
    TestType: string,
    ConcreteType: string,
    AcceptedSampleCount: number,
    RejectedSampleCount: number,
    AverageCrushForce: number,
    StandardDeviation: number,
    CharacteristicStrength: number,
    ConcreteRating: string,
    ClientConstructionSiteId: ConstructionSiteType,
}