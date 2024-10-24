import FindInvoiceUseCase from "../usecase/find-invoice/find-invoice.usecase";
import GenerateInvoiceUsecase from "../usecase/generate/generate-invoice.usecase";
import InvoiceFacadeInterface, { FindInvoiceFacadeInputDto, FindInvoiceFacadeOutputDto, GenerateInvoiceFacadeInputDto, GenerateInvoiceFacadeOutputDto } from "./invoice.facade.interface";

export default class InvoiceFacade implements InvoiceFacadeInterface {
    constructor(private genUseCase: GenerateInvoiceUsecase, private findUseCase: FindInvoiceUseCase) {}

    async generate(input: GenerateInvoiceFacadeInputDto): Promise<GenerateInvoiceFacadeOutputDto> {
        const res = await this.genUseCase.execute(input)
        return {
            id: res.id,
            name: res.name,
            document: res.document,
            address: {
                street: res.street,
                number: res.number,
                complement: res.complement,
                city: res.city,
                state: res.state,
                zipCode: res.zipCode,
            },
            items: res.items,
            total: res.total,
        }
    }

    async find(input: FindInvoiceFacadeInputDto): Promise<FindInvoiceFacadeOutputDto> {
        return await this.findUseCase.execute(input)
    }
    
}