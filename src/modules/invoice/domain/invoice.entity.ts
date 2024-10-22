import AggregateRoot from "../../@shared/domain/entity/aggregate-root.interface";
import BaseEntity from "../../@shared/domain/entity/base.entity";
import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";

type InvoiceItemsProps = {
    id?: Id
    name: string
    price: number
    createdAt?: Date
    updatedAt?: Date
}
type InvoiceProps = {
    id?: Id
    name: string
    document: string
    address: Address
    createdAt?: Date
    updatedAt?: Date
    items: InvoiceItems[]
}

export default class Invoice extends BaseEntity implements AggregateRoot {
    constructor(props: InvoiceProps) {
        super(props.id, props.createdAt, props.updatedAt)
        this.name = props.name
        this.document = props.document
        this.address = props.address
        this.items = props.items
    }
    name: string
    document: string
    address: Address // value object
    items: InvoiceItems[] // Invoice Items entity
}

export class InvoiceItems extends BaseEntity implements AggregateRoot {
    constructor(props: InvoiceItemsProps) {
        super(props.id, props.createdAt, props.updatedAt)
        this.name = props.name
        this.price = props.price
    }
    name: string
    price: number
}