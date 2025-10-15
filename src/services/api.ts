import { type DropdownOptions } from '../interfaces';

export const mockFetchDropdownData = async (): Promise<DropdownOptions> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    types: ['For rent', 'For sale', 'Investment'],
    propertyTypes: ['Apartment', 'Villa', 'Chalet', 'Studio', 'Office', 'Town House', 'Twin House', 'House'],
    furnishTypes: ['Furnished', 'Unfurnished', 'Semi-Furnished'],
    currencies: ['EGP', 'USD', 'EUR'],
    durationTypes: ['Months', 'Years'],
    tags: ['Premium', 'Exclusive', 'Standard', 'Urgent'],
    dealTypes: ['Side-by-Side', 'Direct'],
    listedByUsers: ['User 1 (Admin)', 'User 2 (Agent)', 'User 3 (Associate)', 'John Doe', 'Jane Smith', 'The Listing Team'],
    locations: ['Zamalek', 'New Cairo', 'Sheikh Zayed', 'Madinaty', '6th of October', 'Shorouk City', 'Heliopolis'],
    clientNames: ['Ahmed Said (01012345678)', 'Jane Doe (01198765432)', 'Mohamed Ali (01234567890)', 'New Client'],
    forRentTransactionTypes: ['Monthly', 'Yearly', 'Total'],
    forSaleTransactionTypes: ['Cash', 'Installment'],
    requestStatuses: ['Pending', 'Active', 'Closed'],
    requestPrivacy: ['Public', 'Private'],
    assignmentUsers: ['None', 'Agent A', 'Agent B', 'Owner C'],
    requestOptions: ['Pool', 'Garden', 'Security', 'AC', 'Elevator'],
  };
};