import { Sequelize } from "sequelize-typescript"
import { InvoiceItemModel, InvoiceModel } from "../repository/invoice.model"
import InvoiceFacadeFactory from "../factory/invoice.facade.factory"
import { FindInvoiceFacadeInputDto, GenerateInvoiceFacadeInputDto } from "./invoice.facade.interface"
import Invoice, { InvoiceItems } from "../domain/invoice.entity"
import Id from "../../@shared/domain/value-object/id.value-object"
import Address from "../../@shared/domain/value-object/address"

let sequelize: Sequelize

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
const input: GenerateInvoiceFacadeInputDto = {
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

describe("Invoice Facade test", () => {

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: ':memory:',
            logging: false,
            sync: { force: true }
        })
        sequelize.addModels([InvoiceModel, InvoiceItemModel])
        await sequelize.sync()
    })
  
    afterEach(async () => {
        await sequelize.close()
    })
  
    it("should generate an invoice", async () => {
        const facade = InvoiceFacadeFactory.create()
        const output = await facade.generate(input)
        expect(output.id).toBeDefined()
        expect(output.name).toBe(input.name)
        expect(output.document).toBe(input.document)
        expect(output.address.street).toBe(input.street)
        expect(output.address.number).toBe(input.number)
        expect(output.address.complement).toBe(input.complement)
        expect(output.address.state).toBe(input.state)
        expect(output.address.city).toBe(input.city)
        expect(output.address.zipCode).toBe(input.zipCode)
        expect(output.total).toBe(item1.price + item2.price)
        expect(output.items[0].id).toBe(item1.id.id)
        expect(output.items[0].name).toBe(item1.name)
        expect(output.items[0].price).toBe(item1.price)
        expect(output.items[1].id).toBe(item2.id.id)
        expect(output.items[1].name).toBe(item2.name)
        expect(output.items[1].price).toBe(item2.price)
    })

    it("should find an invoice", async () => {
        const facade = InvoiceFacadeFactory.create()
        const res = await facade.generate(input)
        const parm: FindInvoiceFacadeInputDto = {
            id: res.id,
        }
        const output = await facade.find(parm)
        expect(output.id).toBe(res.id)
        expect(output.name).toBe(input.name)
        expect(output.document).toBe(input.document)
        expect(output.address.street).toBe(input.street)
        expect(output.address.number).toBe(input.number)
        expect(output.address.complement).toBe(input.complement)
        expect(output.address.state).toBe(input.state)
        expect(output.address.city).toBe(input.city)
        expect(output.address.zipCode).toBe(input.zipCode)
        expect(output.total).toBe(item1.price + item2.price)
        expect(output.items[0].id).toBe(item1.id.id)
        expect(output.items[0].name).toBe(item1.name)
        expect(output.items[0].price).toBe(item1.price)
        expect(output.items[1].id).toBe(item2.id.id)
        expect(output.items[1].name).toBe(item2.name)
        expect(output.items[1].price).toBe(item2.price)
    })
})

