export interface NegotiationData {
  agentId: number;
  retailerName: string;
  retailerEmail: string;
  product: string;
  willSucceed: boolean;
  finalDiscount?: number;
  hardcodedRetailerResponse?: string;
}

export const negotiations: NegotiationData[] = [
  {
    agentId: 1,
    retailerName: "Gigatron",
    retailerEmail: "nabavka@gigatron.rs",
    product: "MacBook Pro M4 14\"",
    willSucceed: true,
    finalDiscount: 10,
  },
  {
    agentId: 2,
    retailerName: "Setec",
    retailerEmail: "prodaja@setec.rs",
    product: "MacBook Pro M4 14\"",
    willSucceed: false,
    hardcodedRetailerResponse: `Dear Cascada,

Thank you for your inquiry. Unfortunately, our current policy requires a minimum of 100 units for any volume discount consideration.

Additionally, our M4 inventory allocation is limited at this time. We would encourage you to reach out again next quarter when we expect new stock allocations.

We appreciate your understanding.

Regards,
Setec Sales Department`,
  },
  {
    agentId: 3,
    retailerName: "Anhoch",
    retailerEmail: "veleprodaja@anhoch.com",
    product: "MacBook Pro M4 14\"",
    willSucceed: true,
    finalDiscount: 5,
  },
  {
    agentId: 4,
    retailerName: "iStyle",
    retailerEmail: "b2b@istyle.hr",
    product: "MacBook Pro M4 14\"",
    willSucceed: false,
    hardcodedRetailerResponse: `Dear Sender,

Thank you for your inquiry. However, our compliance and legal departments require that all procurement negotiations exceeding €50,000 in value be conducted exclusively with authorized human representatives.

We are not able to proceed with AI-initiated transactions at this time. Please have a human coordinator contact us directly through our official B2B portal.

Regards,
iStyle Compliance Team`,
  },
];