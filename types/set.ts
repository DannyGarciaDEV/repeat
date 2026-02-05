export interface Set {
  _id?: string;
  name: string;
  description?: string;
  userId: string;
  color?: string; // For UI customization
  isPublic?: boolean; // Whether set is publicly shareable
  createdAt: Date;
  updatedAt: Date;
  cardCount?: number; // Virtual field for card count
  ownerName?: string; // Name of set owner (for public sets)
}

