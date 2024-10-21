import { Sequelize } from "sequelize-typescript";
import { InvoiceItemModel, InvoiceModel } from "./invoice.model";

describe('InvoiceModel and InvoiceItemModel Tests', () => {
    let sequelize: Sequelize;

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: ':memory:',
            logging: true,
            sync: { force: true },
        });
        sequelize.addModels([InvoiceModel, InvoiceItemModel])
        InvoiceItemModel.belongsTo(InvoiceModel, {
            foreignKey: 'invoiceId'
        })
        InvoiceModel.hasMany(InvoiceItemModel, {
            foreignKey: 'invoiceId'
        })
        await sequelize.sync({ force: true });
    });

    afterEach(async () => {
        await sequelize.close();
    });

    it('should create an invoice and its items', async () => {
        const invoice = await InvoiceModel.create({
            id: '1',
            name: 'name 1',
            document: 'doc 1',
            street: 'st 1',
            number: 44,
            city: 'new york',
            state: 'NY',
            zipCode: '55555',
        })
        const invoiceItem1 = await InvoiceItemModel.create({
            id: '101',
            name: 'item 1',
            price: 10.0,
            invoiceId: '1',
        })
        const invoiceItem2 = await InvoiceItemModel.create({
            id: '102',
            name: 'item 2',
            price: 13.99,
            invoiceId: '1',
        })

        const invoiceDb = await InvoiceModel.findOne({
            where: { id: '1' },
            include: [InvoiceItemModel],
        })

        expect(invoiceDb).toBeDefined()
        expect(invoiceDb.id).toBe('1')
        expect(invoiceDb.name).toBe('name 1')
        expect(invoiceDb.document).toBe('doc 1')
        expect(invoiceDb.street).toBe('st 1')
        expect(invoiceDb.complement).toBeNull()
        expect(invoiceDb.city).toBe('new york')
        expect(invoiceDb.state).toBe('NY')
        expect(invoiceDb.zipCode).toBe('55555')

        const itemsDb = await InvoiceItemModel.findAll({
            where: { invoiceId: '1' }
        })
        expect(itemsDb).toBeDefined()
        expect(itemsDb.length).toBe(2)
        expect(itemsDb[0].id).toBe('101')
        expect(itemsDb[0].name).toBe('item 1')
        expect(itemsDb[0].price).toBe(10.0)
        expect(itemsDb[0].invoiceId).toBe('1')
        expect(itemsDb[1].id).toBe('102')
        expect(itemsDb[1].name).toBe('item 2')
        expect(itemsDb[1].price).toBe(13.99)
        expect(itemsDb[1].invoiceId).toBe('1')
    })
})

