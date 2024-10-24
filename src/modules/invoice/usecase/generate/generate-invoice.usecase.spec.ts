import Address from "../../../@shared/domain/value-object/address"
import Id from "../../../@shared/domain/value-object/id.value-object"
import Invoice, { InvoiceItems } from "../../domain/invoice.entity"
import InvoiceGateway from "../../gateway/invoice.gateway"
import GenerateInvoiceUsecase from "./generate-invoice.usecase"
import { GenerateInvoiceUseCaseInputDto } from "./generate-invoice.usecase.dto"

const item1 = new InvoiceItems({
    name: "item 1",
    price: 1049.49,
})
const item2 = new InvoiceItems({
    name: "item 2",
    price: 855.19,
})
const invoice = new Invoice({
    id: new Id("1"),
    name: "Contas",
    document: "1234-5678",
    address: new Address(
      "Rua A",
      "1",
      "fundos",
      "Não Me Toque",
      "SC",
      "88888-888",
    ),
    items: [item1, item2],
  })
  
  const MockRepository = (): InvoiceGateway => {
  
    return {
      generate: jest.fn().mockReturnValue(Promise.resolve(invoice)),
      find: jest.fn(),
    }
  }
  
  describe("Generate Invoice use case unit test", () => {
  
    it("should generate an invoice", async () => {
  
      const repository = MockRepository()
      const usecase = new GenerateInvoiceUsecase(repository)
  
      const input: GenerateInvoiceUseCaseInputDto = {
        name: invoice.name,
        document: invoice.document,
        street: invoice.address.street,
        number: invoice.address.number,
        complement: invoice.address.complement,
        city: invoice.address.city,
        state: invoice.address.state,
        zipCode: invoice.address.zipCode,
        items: [{
            id: item1.id.id,
            name: item1.name,
            price: item1.price,
        }, {
            id: item2.id.id,
            name: item2.name,
            price: item2.price,
        }]
      }
  
      const result = await usecase.execute(input)
  
      expect(repository.generate).toHaveBeenCalled()
      expect(result.id).toBeDefined()
      expect(result.name).toEqual(invoice.name)
      expect(result.document).toEqual(invoice.document)
      expect(result.street).toEqual(invoice.address.street)
      expect(result.number).toEqual(invoice.address.number)
      expect(result.complement).toEqual(invoice.address.complement)
      expect(result.city).toEqual(invoice.address.city)
      expect(result.state).toEqual(invoice.address.state)
      expect(result.zipCode).toEqual(invoice.address.zipCode)
      expect(result.total).toBe(item1.price + item2.price)
      compararItem(result.items[0], item1)
      compararItem(result.items[1], item2)
    })
  })

function compararItem(arg0: { id: string; name: string; price: number }, item: InvoiceItems) {
    expect(arg0.id).toBe(item.id.id)
    expect(arg0.name).toBe(item.name)
    expect(arg0.price).toBe(item.price)
}
