import ClientAdmFacadeInterface, { FindClientFacadeOutputDto } from "../../../client-adm/facade/client-adm.facade.interface";
import InvoiceFacadeInterface from "../../../invoice/facade/invoice.facade.interface";
import PaymentFacadeInterface from "../../../payment/facade/facade.interface";
import ProductAdmFacadeInterface, { CheckStockFacadeOutputDto } from "../../../product-adm/facade/product-adm.facade.interface";
import StoreCatalogFacadeInterface, { FindStoreCatalogFacadeOutputDto } from "../../../store-catalog/facade/store-catalog.facade.interface";
import CheckoutGateway from "../../gateway/checkout.gateway";

type ClientFacadeProps = {
    findReturnValue?: FindClientFacadeOutputDto
}
type ProductFacadeProps = {
    checkStockReturnValue?: CheckStockFacadeOutputDto
}
type CatalogFacadeProps = {
    findReturnValues?: FindStoreCatalogFacadeOutputDto[]
}
type CheckoutGatewayProps = {

}
type InvoiceFacadeProps = {

}
type PaymentFacadeProps = {
    approved: boolean
}
export class Cenarios {
    static newProductAdmFacade(props: ProductFacadeProps): ProductAdmFacadeInterface {
        const MockType = () => {
            return {
                addProduct: jest.fn(),
                checkStock: jest.fn(),
            }
        }
        const mock = MockType()
        if (props.checkStockReturnValue !== undefined) {
            mock.checkStock.mockReturnValue(props.checkStockReturnValue)
        }
        return mock as ProductAdmFacadeInterface
    }

    static newClientFacade(props: ClientFacadeProps): ClientAdmFacadeInterface {
        const MockType = () => {
            return {
                find: jest.fn(),
                add: jest.fn(),
            }
        }
        const mock = MockType()
        if (props.findReturnValue !== undefined) {
            mock.find.mockReturnValue(props.findReturnValue)
        }
        return mock as ClientAdmFacadeInterface
    }

    static newCatalogFacade(props: CatalogFacadeProps): StoreCatalogFacadeInterface {
        const MockType = () => {
            return {
                find: jest.fn(),
                findAll: jest.fn(),
            }
        }
        const mock = MockType()
        if (props.findReturnValues !== undefined) {
            props.findReturnValues.forEach(p => {
                mock.find.mockReturnValueOnce(p)
            })
        }
        return mock as StoreCatalogFacadeInterface
    }

    static newCheckoutGateway(props: CheckoutGatewayProps): CheckoutGateway {
        const MockType = () => {
            return {
                addOrder: jest.fn(),
                findOrder: jest.fn(),
            }
        }
        const mock = MockType()
        return mock as CheckoutGateway
    }

    static newInvoiceFacade(props: InvoiceFacadeProps): InvoiceFacadeInterface {
        const MockType = () => {
            return {
                generate: jest.fn(),
                find: jest.fn(),
            }
        }
        const mock = MockType()
        return mock as InvoiceFacadeInterface
    }

    static newPaymentFacade(props: PaymentFacadeProps): PaymentFacadeInterface {
        const MockType = () => {
            return {
                process: jest.fn(),
            }
        }
        const mock = MockType()
        mock.process.mockReturnValue({
            transactionId: "1",
            orderId: "1",
            amount: 10,
            status: props.approved ? "approved" : "rejected",
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        return mock as PaymentFacadeInterface
    }
}