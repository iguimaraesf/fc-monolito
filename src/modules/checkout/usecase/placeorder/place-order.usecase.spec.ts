import Address from "../../../@shared/domain/value-object/address"
import ClientAdmFacadeInterface from "../../../client-adm/facade/client-adm.facade.interface"
import InvoiceFacadeInterface from "../../../invoice/facade/invoice.facade.interface"
import PaymentFacadeInterface from "../../../payment/facade/facade.interface"
import ProductAdmFacadeInterface from "../../../product-adm/facade/product-adm.facade.interface"
import StoreCatalogFacadeInterface from "../../../store-catalog/facade/store-catalog.facade.interface"
import CheckoutGateway from "../../gateway/checkout.gateway"
import { Cenarios } from "./place-order.cenarios"
import { PlaceOrderInputDto } from "./place-order.dto"
import PlaceOrderUseCase from "./place-order.usecase"

describe("Place order usecase test", () => {
    let catalogFacade: StoreCatalogFacadeInterface
    let clientFacade: ClientAdmFacadeInterface
    let productFacade: ProductAdmFacadeInterface
    let repository: CheckoutGateway
    let invoiceFacade: InvoiceFacadeInterface
    let paymentFacade: PaymentFacadeInterface

    beforeEach(() => {
        clientFacade = Cenarios.newClientFacade({
            findReturnValue: {
                id: "1",
                name: "Client 1",
                document: "1111",
                email: "client1@gmail.com",
                address: new Address("street", "1", "",
                    "City", "State", "11111"),
                createdAt: null,
                updatedAt: null,
            }
        })
        productFacade = Cenarios.newProductAdmFacade({
            checkStockReturnValue: {
                productId: "1",
                stock: 59,
            }
        })
        catalogFacade = Cenarios.newCatalogFacade({
            findReturnValues: [{
                id: "1",
                name: "Test 1",
                description: "description",
                salesPrice: 10,
            }]
        })
        repository = Cenarios.newCheckoutGateway({})
        invoiceFacade = Cenarios.newInvoiceFacade({})
        paymentFacade = Cenarios.newPaymentFacade({
            approved: true,
        })
    })
    
    describe("getProduct methods", () => {
        // const mockDate = new Date(2000, 1, 1)
        // beforeAll(() => {
        //     jest.useFakeTimers("modern")
        //     jest.setSystemTime(mockDate)
        // })
        // afterAll(() => {
        //     jest.useRealTimers()
        // })
        it("should throw an error when a product is not found", async() => {
            const catalogProductNotFound = Cenarios.newCatalogFacade({
                findReturnValues: [null]
            })
            const placeOrderUseCase = new PlaceOrderUseCase(
                clientFacade,
                productFacade,
                catalogProductNotFound,
                repository,
                invoiceFacade,
                paymentFacade)
            const input: PlaceOrderInputDto = {
                clientId: "1", products: [{productId: "2"}]
            }

            await expect(placeOrderUseCase.execute(input)).rejects.toThrow(
                new Error("Product 2 not found")
            )
            expect(catalogProductNotFound.find).toHaveBeenCalledTimes(1)
        })
    })
    describe("validate produts methods", () => {
        it("should throw an error when products are not valid", async() => {
            const placeOrderUseCase = new PlaceOrderUseCase(
                clientFacade,
                productFacade,
                catalogFacade,
                repository,
                invoiceFacade,
                paymentFacade)
            const mockValidate = jest
                // @ts-expect-error - spy on private method
                .spyOn(placeOrderUseCase, "validateProducts")
                // ts-expect-error - not return never
                //.mockRejectedValue(new Error("No products selected"))

            const input: PlaceOrderInputDto = {
                clientId: "1", products: []
            }

            await expect(placeOrderUseCase.execute(input)).rejects.toThrow(
                new Error("No products selected")
            )
            expect(mockValidate).toHaveBeenCalledTimes(1)
        })
        it("should throw an error if no products are selected", async() => {
            const placeOrderUseCase = new PlaceOrderUseCase(
                clientFacade,
                productFacade,
                catalogFacade,
                repository,
                invoiceFacade,
                paymentFacade)
            const input: PlaceOrderInputDto = {
                clientId: "1", products: []
            }

            await expect(placeOrderUseCase.execute(input)).rejects.toThrow(
                new Error("No products selected")
            )
        })

        it("should throw an error when a product is out of stock", async() => {
            const outOfStock = productFacade = Cenarios.newProductAdmFacade({
                checkStockReturnValue: {
                    productId: "1",
                    stock: 0,
                }
            })
            const placeOrderUseCase = new PlaceOrderUseCase(
                clientFacade,
                outOfStock,
                catalogFacade,
                repository,
                invoiceFacade,
                paymentFacade)
            const input: PlaceOrderInputDto = {
                clientId: "1", products: [{productId: "1"}]
            }
            await expect(placeOrderUseCase.execute(input)).rejects.toThrow(
                new Error("Product 1 is not available in stock")
            )
            expect(outOfStock.checkStock).toHaveBeenCalledTimes(1)
        })

    })
    describe("execute method", () => {
        it("should throw an error when client is not found", async() => {
            
            const clientFacadeFindReturnsNull: ClientAdmFacadeInterface = Cenarios.newClientFacade({
                findReturnValue: null,
            })

            const placeorderUseCase = new PlaceOrderUseCase(
                clientFacadeFindReturnsNull,
                productFacade,
                catalogFacade,
                repository,
                invoiceFacade,
                paymentFacade)

            const input: PlaceOrderInputDto = {
                clientId: "0", products: []
            }

            await expect(placeorderUseCase.execute(input)).rejects.toThrow(
                new Error("Client not found")
            )
        })
    })
    describe("place an order", () => {
        it("should not approve the order", async () => {
            const paymentFacade = Cenarios.newPaymentFacade({
                approved: false,
            })
            const catalogFacade = Cenarios.newCatalogFacade({
                findReturnValues: [{
                    id: "2",
                    name: "Test 2",
                    description: "description",
                    salesPrice: 50,
                }, {
                    id: "3",
                    name: "Test 3",
                    description: "description",
                    salesPrice: 20, 
                }]
            })
            const placeorderUseCase = new PlaceOrderUseCase(
                clientFacade,
                productFacade,
                catalogFacade,
                repository,
                invoiceFacade,
                paymentFacade)

            const input: PlaceOrderInputDto = {
                clientId: "1c", products: [{productId: "2"}, {productId: "3"}],
            }
            
            const mockValidate = jest
                // @ts-expect-error - spy on private method
                .spyOn(placeorderUseCase, "validateProducts")
                // ts-expect-error - not return never
                //.mockRejectedValue(new Error("No products selected"))
            const mockProduct = jest
                // @ts-expect-error - spy on private method
                .spyOn(placeorderUseCase, "getProductCatalog")

            const output = await placeorderUseCase.execute(input)
            expect(output.invoiceId).toBeNull()
            expect(output.total).toBe(70)
            expect(output.products).toStrictEqual([
                { productId: "2" },
                { productId: "3" },
            ])
            expect(clientFacade.find).toHaveBeenCalledTimes(1)
            expect(clientFacade.find).toHaveBeenCalledWith({ id: "1c" })
            expect(mockValidate).toHaveBeenCalledTimes(1)
            expect(mockValidate).toHaveBeenCalledWith(input)
            expect(mockProduct).toHaveBeenCalledTimes(2)
            expect(repository.addOrder).toHaveBeenCalledTimes(1)
            expect(paymentFacade.process).toHaveBeenCalledTimes(1)
            expect(paymentFacade.process).toHaveBeenCalledWith({
                orderId: output.id,
                amount: output.total,
            })
            expect(invoiceFacade.generate).toHaveBeenCalledTimes(0)
        })
        it("should approve the order", async () => {
            const products = [{
                id: "2",
                name: "Test 2",
                description: "description",
                salesPrice: 50,
            }, {
                id: "3",
                name: "Test 3",
                description: "description",
                salesPrice: 20, 
            }]
            const catalogFacade = Cenarios.newCatalogFacade({
                findReturnValues: products
            })
            const placeorderUseCase = new PlaceOrderUseCase(
                clientFacade,
                productFacade,
                catalogFacade,
                repository,
                invoiceFacade,
                paymentFacade)

            const input: PlaceOrderInputDto = {
                clientId: "1c", products: [{productId: "2"}, {productId: "3"}],
            }
            
            const mockValidate = jest
                // @ts-expect-error - spy on private method
                .spyOn(placeorderUseCase, "validateProducts")
                // ts-expect-error - not return never
                //.mockRejectedValue(new Error("No products selected"))
            const mockProduct = jest
                // @ts-expect-error - spy on private method
                .spyOn(placeorderUseCase, "getProductCatalog")

            const output = await placeorderUseCase.execute(input)
            expect(output.invoiceId).toBeNull()
            expect(output.total).toBe(70)
            expect(output.products).toStrictEqual([
                { productId: "2" },
                { productId: "3" },
            ])
            expect(clientFacade.find).toHaveBeenCalledTimes(1)
            expect(clientFacade.find).toHaveBeenCalledWith({ id: "1c" })
            expect(mockValidate).toHaveBeenCalledTimes(1)
            expect(mockValidate).toHaveBeenCalledWith(input)
            expect(mockProduct).toHaveBeenCalledTimes(2)
            expect(repository.addOrder).toHaveBeenCalledTimes(1)
            expect(paymentFacade.process).toHaveBeenCalledTimes(1)
            expect(paymentFacade.process).toHaveBeenCalledWith({
                orderId: output.id,
                amount: output.total,
            })
            expect(invoiceFacade.generate).toHaveBeenCalledTimes(1)
            expect(invoiceFacade.generate).toHaveBeenCalledWith({
                name: "Client 1",
                document: "1111",
                street: "street",
                number: "1",
                complement: "",
                city: "City",
                state: "State",
                zipCode: "11111",
                items: [
                    {
                        id: products[0].id,
                        name: products[0].name,
                        price: products[0].salesPrice,
                    },
                    {
                        id: products[1].id,
                        name: products[1].name,
                        price: products[1].salesPrice,
                    },
                ]
            })
        })
    })
})