import UseCaseInterface from "../../../@shared/usecase/use-case.interface";
import { InvoiceItems } from "../../domain/invoice.entity";
import InvoiceGateway from "../../gateway/invoice.gateway";
import { FindInvoiceUseCaseInputDto, FindInvoiceUseCaseOutputDto } from "./find-invoice.usecase.dto";

export default class FindInvoiceUseCase implements UseCaseInterface {
    constructor(private repository: InvoiceGateway) {}
    async execute(input: FindInvoiceUseCaseInputDto): Promise<FindInvoiceUseCaseOutputDto> {
        const inv = await this.repository.find(input.id)
        return {
            id: inv.id.id,
            name: inv.name,
            address: inv.address,
            document: inv.document,
            createdAt: inv.createdAt,
            items: convertItems(inv.items),
            total: itemsSum(inv.items),
        }
    }

}

function convertItems(items: InvoiceItems[]): { id: string; name: string; price: number; }[] {
    const res = items.map((i) => {
        return {
            id: i.id.id,
            name: i.name,
            price: i.price,
        }
    })
    return res;
}

function itemsSum(items: InvoiceItems[]): number {
    return items.reduce((sum, item) => sum + item.price, 0);
}
  

