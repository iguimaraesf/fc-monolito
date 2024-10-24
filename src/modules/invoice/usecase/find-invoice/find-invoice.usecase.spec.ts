import Address from "../../../@shared/domain/value-object/address"
import Id from "../../../@shared/domain/value-object/id.value-object"
import Invoice, { InvoiceItems } from "../../domain/invoice.entity"
import InvoiceGateway from "../../gateway/invoice.gateway"
import InvoiceRepository from "../../repository/invoice.repository"
import FindInvoiceUseCase from "./find-invoice.usecase"

const item1 = new InvoiceItems({
    id: new Id(),
    name: "item 1",
    price: 1049.49,
    createdAt: new Date(),
    updatedAt: new Date(),
})
const item2 = new InvoiceItems({
    id: new Id(),
    name: "item 2",
    price: 855.19,
    createdAt: new Date(),
    updatedAt: new Date(),
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
      generate: jest.fn(),
      find: jest.fn().mockReturnValue(Promise.resolve(invoice)),
    }
  }
  
  describe("Find Invoice use case unit test", () => {
  
    it("should find an invoice", async () => {
  
      const repository = MockRepository()
      const usecase = new FindInvoiceUseCase(repository)
  
      const input = {
        id: "1"
      }
  
      const result = await usecase.execute(input)
  
      expect(repository.find).toHaveBeenCalled()
      expect(result.id).toEqual(input.id)
      expect(result.name).toEqual(invoice.name)
      expect(result.document).toEqual(invoice.document)
      expect(result.address).toEqual(invoice.address)
      expect(result.createdAt).toEqual(invoice.createdAt)
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
