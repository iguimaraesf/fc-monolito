import { Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
  tableName: 'invoice',
  timestamps: false
})
export class InvoiceModel extends Model {
    @PrimaryKey
    @Column({ allowNull: false })
    id: string

    @Column({ allowNull: false })
    name: string

    @Column({ allowNull: false })
    document: string

    @Column({ allowNull: false })
    street: string

    @Column({ allowNull: false })
    number: string

    @Column({ allowNull: true })
    complement: string

    @Column({ allowNull: false })
    city: string

    @Column({ allowNull: false })
    state: string

    @Column({ allowNull: false })
    zipCode: string
}

@Table({
    tableName: 'invoice_item',
    timestamps: false
})
export class InvoiceItemModel extends Model {
    @PrimaryKey
    @Column({ allowNull: false })
    id: string

    @Column({ allowNull: false })
    name: string

    @Column({ allowNull: false })
    price: number

    @ForeignKey(() => InvoiceModel)
    @Column({ allowNull: false })
    invoiceId: string
}
