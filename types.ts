export interface StockMovementDto {
    productId: string; // This ID is the ID inside the catalogue
    quantity: number;
    status: StockMovementType;
  }
  
  enum StockMovementType {
    Supply = 'Supply',
    Reserve = 'Reserve',
    Removal = 'Removal',
  }
  
  export interface StockProductDto {
    productId: "string";
    quantity: 1;
  }