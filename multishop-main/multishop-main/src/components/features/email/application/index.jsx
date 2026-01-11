/**
 * 📧 Email Module - Application Layer Index
 */

export { EmailServiceFacade } from './EmailServiceFacade';
export { 
  sendTransactionalEmail, 
  sendMarketingEmail, 
  previewTemplate,
  getSampleData 
} from './use-cases';