import Id from "../../@shared/domain/value-object/id.value-object";
import Invoice, { InvoiceItems } from "../domain/invoice.entity";
import InvoiceGateway from "../gateway/invoice.gateway";
import { InvoiceItemModel, InvoiceModel } from "./invoice.model";
import Address from "../../@shared/domain/value-object/address"

export default class InvoiceRepository implements InvoiceGateway {
    async generate(invoice: Invoice): Promise<Invoice> {
        const newInvoice = await InvoiceModel.create({
            id: invoice.id.id,
            name: invoice.name,
            document: invoice.document,
            street: invoice.address.street,
            number: invoice.address.number,
            complement: invoice.address.complement,
            city: invoice.address.city,
            state: invoice.address.state,
            zipCode: invoice.address.zipCode,
        })
        const createItemPromises = invoice.items.map(element => {
            return InvoiceItemModel.create({
                id: element.id.id,
                name: element.name,
                price: element.price,
                invoiceId: newInvoice.id,
            })
        })
        const items = await Promise.all(createItemPromises)
        return new Invoice({
            id: new Id(newInvoice.id),
            name: invoice.name,
            document: invoice.document,
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt,
            address: this.invoicesAddress(newInvoice),
            items: this.convertItems(items)
        })
    }

    async find(id: string): Promise<Invoice> {
        const invoice = await InvoiceModel.findOne({
            where: { id: id },
        })
        const result = new Invoice({
            id: new Id(invoice.id),
            name: invoice.name,
            document: invoice.document,
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt,
            address: this.invoicesAddress(invoice),
            items: await this.findItems(id),
        })
        return result
    }

    invoicesAddress(invoice: InvoiceModel): Address {
        return new Address(
            invoice.street,
            invoice.number,
            invoice.complement,
            invoice.city,
            invoice.state,
            invoice.zipCode)
    }
    async findItems(id: string): Promise<InvoiceItems[]> {
        const elements = await InvoiceItemModel.findAll({
            where: { invoiceId: id }
        })
        return this.convertItems(elements);
    }

    private convertItems(elements: InvoiceItemModel[]) {
        const items: InvoiceItems[] = [];
        elements.forEach(e => {
            const invoiceItem = new InvoiceItems({
                id: new Id(e.id),
                name: e.name,
                price: e.price,
                createdAt: e.createdAt,
                updatedAt: e.updatedAt,
            });
            items.push(invoiceItem);
        });
        return items;
    }
}