export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Appointments' | 'Services' | 'Payment & Insurance';
}
