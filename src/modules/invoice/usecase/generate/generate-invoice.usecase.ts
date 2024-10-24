import Address from "../../../@shared/domain/value-object/address";
import Id from "../../../@shared/domain/value-object/id.value-object";
import UseCaseInterface from "../../../@shared/usecase/use-case.interface";
import Invoice, { InvoiceItems } from "../../domain/invoice.entity";
import InvoiceGateway from "../../gateway/invoice.gateway";
import { GenerateInvoiceUseCaseInputDto, GenerateInvoiceUseCaseOutputDto } from "./generate-invoice.usecase.dto";

export default class GenerateInvoiceUsecase implements UseCaseInterface {
    constructor(private repository: InvoiceGateway) {
    }
    
    async execute(input: GenerateInvoiceUseCaseInputDto): Promise<GenerateInvoiceUseCaseOutputDto> {
        const props = {
            id: new Id(),
            name: input.name,
            document: input.document,
            address: new Address(
                input.street,
                input.number,
                input.complement,
                input.city,
                input.state,
                input.zipCode,
            ),
            items: getItems(input)
          }
      
          const invoice = new Invoice(props)
          await this.repository.generate(invoice)
      
          return {
            id: invoice.id.id,
            name: invoice.name,
            document: invoice.document,
            street: invoice.address.street,
            number: invoice.address.number,
            complement: invoice.address.complement,
            city: invoice.address.city,
            state: invoice.address.state,
            zipCode: invoice.address.zipCode,
            items: getUsecaseItems(invoice.items),
            total: getTotal(invoice.items),
          }
    }
    
}

function getUsecaseItems(items: InvoiceItems[]) {
    return items.map((i) => {
        return {
            id: i.id.id,
            name: i.name,
            price: i.price,
        }
    })
}

function getItems(input: GenerateInvoiceUseCaseInputDto): InvoiceItems[] {
    return input.items.map((i) => {
        return new InvoiceItems({
            id: new Id(i.id),
            name: i.name,
            price: i.price,
        })
    })
}

function getTotal(items: InvoiceItems[]): number {
    return items.reduce((last, current) => last + current.price, 0)
}
