import InvoiceFacade from "../facade/invoice.facade";
import InvoiceFacadeInterface from "../facade/invoice.facade.interface";
import InvoiceRepository from "../repository/invoice.repository";
import FindInvoiceUseCase from "../usecase/find-invoice/find-invoice.usecase";
import GenerateInvoiceUsecase from "../usecase/generate/generate-invoice.usecase";

export default class InvoiceFacadeFactory {
    static create(): InvoiceFacadeInterface {
      const repository = new InvoiceRepository();
      const findUsecase = new FindInvoiceUseCase(repository);
      const generateUsecase = new GenerateInvoiceUsecase(repository);
      const facade = new InvoiceFacade(
        generateUsecase,
        findUsecase,
      )
  
      return facade;
    }
}
  