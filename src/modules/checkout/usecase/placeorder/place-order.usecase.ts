import Id from "../../../@shared/domain/value-object/id.value-object";
import UseCaseInterface from "../../../@shared/usecase/use-case.interface";
import ClientAdmFacadeInterface from "../../../client-adm/facade/client-adm.facade.interface";
import InvoiceFacadeInterface from "../../../invoice/facade/invoice.facade.interface";
import PaymentFacadeInterface from "../../../payment/facade/facade.interface";
import ProductAdmFacadeInterface from "../../../product-adm/facade/product-adm.facade.interface";
import StoreCatalogFacadeInterface from "../../../store-catalog/facade/store-catalog.facade.interface";
import ClientEntity from "../../domain/client.entity";
import Order from "../../domain/order.entity";
import Product from "../../domain/product.entity";
import CheckoutGateway from "../../gateway/checkout.gateway";
import { PlaceOrderInputDto, PlaceOrderOutputDto } from "./place-order.dto";

export default class PlaceOrderUseCase implements UseCaseInterface {

    constructor(private _clientFacade: ClientAdmFacadeInterface,
        private _productFacade: ProductAdmFacadeInterface,
        private _catalogFacade: StoreCatalogFacadeInterface,
        private _repository: CheckoutGateway,
        private _invoiceFacade: InvoiceFacadeInterface,
        private _paymentFacade: PaymentFacadeInterface
    ) {
    }
    async execute(input: PlaceOrderInputDto): Promise<PlaceOrderOutputDto> {
        // buscar o cliente. Não acha => client not found
        const client = await this._clientFacade.find({ id: input.clientId })
        if (!client) {
            throw new Error("Client not found")
        }
        // validar produtos
        await this.validateProducts(input)
        // recuperar os produtos
        const products = await Promise.all(
            input.products.map((p) => this.getProductCatalog(p.productId))
        )
        // criar objeto do client
        const myClient = new ClientEntity({
            id: new Id(client.id),
            name: client.name,
            email: client.email,
            address: client.address.street,
        })
        // criar objeto da order
        const order = new Order({
            client: myClient,
            products,
        })

        // paymentfacade.process(orderid, amount)
        const payment = await this._paymentFacade.process({
            orderId: order.id.id,
            amount: order.total,
        })
        // se aprovado, gerar invoice (fatura), status=approved
        const invoice =
            payment.status === "approved" ?
                await this._invoiceFacade.generate({
                    name: client.name,
                    document: client.document,
                    street: client.address.street,
                    number: client.address.number,
                    complement: client.address.complement,
                    city: client.address.city,
                    state: client.address.state,
                    zipCode: client.address.zipCode,
                    items: products.map((p) => {
                        return {
                            id: p.id.id,
                            name: p.name,
                            price: p.salesPrice,
                        }
                    })
                })
                : null
        payment.status === "approved" && order.approved()
        this._repository.addOrder(order)
        // retornar dto
        return {
            id: order.id.id,
            invoiceId: invoice?.id || null,
            status: order.status,
            total: order.total,
            products: order.products.map((p) => {
                return {
                    productId: p.id.id
                }
            })
        }
    }
    
    private async validateProducts(input: PlaceOrderInputDto): Promise<void> {
        if (input.products.length === 0) {
            throw new Error("No products selected")
        }
        await this.checkStock(input);
    }

    private async checkStock(input: PlaceOrderInputDto) {
        for (const p of input.products) {
            const product = await this._productFacade.checkStock({
                productId: p.productId
            })
            if (product.stock <= 0) {
                throw new Error(`Product ${product.productId} is not available in stock`);
            }
        }
    }

    private async getProductCatalog(productId: string): Promise<Product> {
        const product = await this._catalogFacade.find({id: productId})
        if (!product) {
            throw new Error(`Product ${productId} not found`)
        }
        const productProps = {
            id: new Id(product.id),
            name: product.name,
            description: product.description,
            salesPrice: product.salesPrice,
        }
        return new Product(productProps)
    }
}