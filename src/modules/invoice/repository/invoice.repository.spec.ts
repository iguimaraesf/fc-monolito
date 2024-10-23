import { Sequelize } from "sequelize-typescript"
import Address from "../../@shared/domain/value-object/address"
import Id from "../../@shared/domain/value-object/id.value-object"
import Invoice, { InvoiceItems } from "../domain/invoice.entity"
import { InvoiceItemModel, InvoiceModel } from "./invoice.model"
import InvoiceRepository from "./invoice.repository"

describe("InvoiceRepositoryTest", () => {
    let sequelize: Sequelize

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
  
    it("should create an invoice", async () => {
        const i1 = new InvoiceItems({
            id: new Id(),
            name: "i1",
            price: 4.99,
        })
        const i2 = new InvoiceItems({
            id: new Id(),
            name: "i2",
            price: 13.49,
        })
        const invoice = new Invoice({
            id: new Id(),
            name: "invoice 1",
            document: "123",
            address: new Address(
                "Rua 1",
                "1000",
                "",
                "Narnia",
                "AR",
                "00123"
            ),
            items: [i1, i2],
        })

        const repository = new InvoiceRepository()
        await repository.generate(invoice)

        const invDb = await InvoiceModel.findOne({
            where: { id: invoice.id.id },
        })

        expect(invDb).toBeDefined()
        expect(invDb.id).toBe(invoice.id.id)
        expect(invDb.name).toBe(invoice.name)
        expect(invDb.document).toBe(invoice.document)
        expect(invDb.street).toBe(invoice.address.street)
        expect(invDb.number).toBe(invoice.address.number)
        expect(invDb.complement).toBe(invoice.address.complement)
        expect(invDb.city).toBe(invoice.address.city)
        expect(invDb.state).toBe(invoice.address.state)
        expect(invDb.zipCode).toBe(invoice.address.zipCode)

        const itemsDb = await InvoiceItemModel.findAll({
            where: { invoiceId: invoice.id.id }
        })
        expect(itemsDb.length).toBe(2)
    })
})