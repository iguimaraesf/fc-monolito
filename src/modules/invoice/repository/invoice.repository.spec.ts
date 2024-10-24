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
        compararDb(itemsDb[0], i1)
        compararDb(itemsDb[1], i2)
    })

    it("should find an invoice", async () => {
        const invDb = await InvoiceModel.create({
            id: "1",
            name: "Testando",
            document: "12345-9",
            street: "Rua das Festas",
            number: "101",
            complement: "ap. 1050",
            city: "Rio de Janeiro",
            state: "RJ",
            zipCode: "11111222",
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        const i1Db = await InvoiceItemModel.create({
            id: "aa1",
            name: "Vodka",
            price: 85.69,
            invoiceId: invDb.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        const i2Db = await InvoiceItemModel.create({
            id: "aa2",
            name: "Energético",
            price: 12.55,
            invoiceId: invDb.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        const repository = new InvoiceRepository()
        const res = await repository.find(invDb.id)

        //console.log(invDb)
        expect(res.id.id).toBe(invDb.id)
        expect(res.name).toBe(invDb.name)
        expect(res.document).toBe(invDb.document)
        expect(res.createdAt).toBeDefined()
        expect(res.updatedAt).toBeDefined()
        const addr = res.address
        expect(addr.street).toBe(invDb.street)
        expect(addr.number).toBe(invDb.number)
        expect(addr.complement).toBe(invDb.complement)
        expect(addr.city).toBe(invDb.city)
        expect(addr.state).toBe(invDb.state)
        expect(addr.zipCode).toBe(invDb.zipCode)

        expect(res.items.length).toBe(2)
        compararBean(res.items[0], i1Db)
        compararBean(res.items[1], i2Db)
    })
})

function compararDb(db: InvoiceItemModel, item: InvoiceItems) {
    expect(db.id).toBe(item.id.id)
    expect(db.name).toBe(item.name)
    expect(db.price).toBe(item.price)
    expect(db.invoiceId).toBeDefined()
}

function compararBean(item: InvoiceItems, db: InvoiceItemModel) {
    expect(item.id.id).toBe(db.id)
    expect(item.name).toBe(db.name)
    expect(item.price).toBe(db.price)
    expect(item.createdAt).toBeDefined()
    expect(item.updatedAt).toBeDefined()
}
