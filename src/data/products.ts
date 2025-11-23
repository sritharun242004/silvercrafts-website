export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  weightRange: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export const categories: Category[] = [
  { id: 'vessels', name: 'Vessels', image: '/Products/Vessels/ADDUKU.jpg' },
  { id: 'lamps', name: 'Lamps', image: '/Products/Lamps/AGUL.jpg' },
  { id: 'coins', name: 'Coins & Bars', image: '/Products/Coins/BAR 1.jpg' },
  { id: 'bowl', name: 'Bowl', image: '/Products/Bowl/BOWL PLAIN.jpg' },
  { id: 'boxes', name: 'Boxes', image: '/Products/Boxes/BOX 1.jpg' },
  { id: 'chombu', name: 'Chombu', image: '/Products/Chombu/CHOMBU PLAIN.jpg' },
  { id: 'cups', name: 'Cups', image: '/Products/Cup/CUP FRUIT 1.jpg' },
  { id: 'glass', name: 'Glass', image: '/Products/Glass/GLASS PLAIN 1.jpg' },
  { id: 'kamakshi', name: 'Kamakshi', image: '/Products/Kamakshi/KAMAKSHI 2.jpg' },
  { id: 'kodam', name: 'Kodam', image: '/Products/Kodam/kodam plain.jpg' },
  { id: 'others', name: 'Others', image: '/Products/Others/GHEE JADI 2.jpg' },
  { id: 'panchapathram', name: 'Panchapathram', image: '/Products/Panchapathram/PANCHAPATHRAM.jpg' },
  { id: 'plates', name: 'Plates', image: '/Products/Plates/PLATE S D PLAIN.jpg' },
  { id: 'simil', name: 'Simil', image: '/Products/Simil/Design Chennai Simil.jpg' },
  { id: 'trays', name: 'Trays', image: '/Products/Trays/tray ashtalaksmi 2.jpg' },
  { id: 'vel', name: 'Vel', image: '/Products/Vel/VEL HOLLOW.jpg' }
];

export const products: Product[] = [
  // Vessels
  { id: 'v1', name: 'Adukku', category: 'vessels', image: '/Products/Vessels/ADDUKU.jpg', weightRange: '150-300g' },
  { id: 'v2', name: 'Nagas Basket', category: 'vessels', image: '/Products/Vessels/BASKET NAGAS 1 .jpg', weightRange: '200-400g' },
  { id: 'v3', name: 'Nagas Bucket', category: 'vessels', image: '/Products/Vessels/BUCKET NAGAS 1.jpg', weightRange: '250-500g' },
  { id: 'v4', name: 'Mysore Chatti', category: 'vessels', image: '/Products/Vessels/MUSURE CHATTI.jpg', weightRange: '300-600g' },
  { id: 'v5', name: 'Hand Engraving Pot', category: 'vessels', image: '/Products/Vessels/POT HAND ENGRAVING .jpg', weightRange: '250-500g' },
  { id: 'v6', name: 'Matte Finish Pot', category: 'vessels', image: '/Products/Vessels/pot matte finish 1.jpg', weightRange: '200-450g' },
  { id: 'v7', name: 'Machine Engraving Thooku', category: 'vessels', image: '/Products/Vessels/THOOKU MACHINE ENGRAVING 1 .jpg', weightRange: '150-300g' },

  // Lamps
  { id: 'l1', name: 'Agul', category: 'lamps', image: '/Products/Lamps/AGUL.jpg', weightRange: '100-250g' },
  { id: 'l2', name: 'Jothi 1 Face', category: 'lamps', image: '/Products/Lamps/jothi 1 face.jpg', weightRange: '150-300g' },
  { id: 'l3', name: 'Jothi 5 Face', category: 'lamps', image: '/Products/Lamps/jothi 5 face.jpg', weightRange: '200-400g' },
  { id: 'l4', name: 'Round Jothi', category: 'lamps', image: '/Products/Lamps/jothi round.jpg', weightRange: '180-350g' },
  { id: 'l5', name: 'Kuthuvizhaku Manglore', category: 'lamps', image: '/Products/Lamps/KUTHUVIZHAKU MANGLORE.jpg', weightRange: '250-500g' },
  { id: 'l6', name: 'Plain Kuthuvizhaku', category: 'lamps', image: '/Products/Lamps/KUTHUVIZHAKU PLAIN.jpg', weightRange: '200-400g' },
  { id: 'l7', name: 'Manglore Annam Lamp', category: 'lamps', image: '/Products/Lamps/LAMP ANNAM MANGLORE.jpg', weightRange: '300-600g' },
  { id: 'l8', name: 'Annam Nagas Lamp', category: 'lamps', image: '/Products/Lamps/LAMP ANNAM NAGAS.jpg', weightRange: '280-550g' },
  { id: 'l9', name: 'karaikudi Lamp', category: 'lamps', image: '/Products/Lamps/LAMP KARAIKUDI.jpg', weightRange: '220-450g' },
  { id: 'l10', name: 'Malabar Lamp', category: 'lamps', image: '/Products/Lamps/LAMP MALABAR.jpg', weightRange: '250-500g' },

  // Coins & Bars
  { id: 'c1', name: 'Bar', category: 'coins', image: '/Products/Coins/BAR 1.jpg', weightRange: '50-200g' },
  { id: 'c2', name: 'Coins', category: 'coins', image: '/Products/Coins/COINS 1.jpg', weightRange: '10-50g' },

  // Bowl
  { id: 'b1', name: 'Machine Engraving Bowl', category: 'bowl', image: '/Products/Bowl/BOWL MACHINE ENGRAVING.jpg', weightRange: '200-400g' },
  { id: 'b2', name: 'Nagas Bowl', category: 'bowl', image: '/Products/Bowl/BOWL NAGAS.jpg', weightRange: '180-350g' },
  { id: 'b3', name: 'Design Matte Finish Bowl', category: 'bowl', image: '/Products/Bowl/BOWL MATTE FINISH.jpg', weightRange: '250-500g' },
  { id: 'b4', name: 'Plain Bowl', category: 'bowl', image: '/Products/Bowl/BOWL PLAIN.jpg', weightRange: '150-300g' },
  { id: 'b5', name: 'Pumpkin Bowl', category: 'bowl', image: '/Products/Bowl/PUMPKIN BOWL.jpg', weightRange: '300-600g' },

  // Boxes
  { id: 'bx1', name: 'Box', category: 'boxes', image: '/Products/Boxes/BOX 1.jpg', weightRange: '100-250g' },
  { id: 'bx2', name: 'Powder Box', category: 'boxes', image: '/Products/Boxes/Powder box 1.jpeg', weightRange: '80-200g' },
  { id: 'bx3', name: 'Tin Box', category: 'boxes', image: '/Products/Boxes/TIN BOX.jpg', weightRange: '120-280g' },

  // Chombu
  { id: 'ch1', name: 'Ashtalakshmi Chombu', category: 'chombu', image: '/Products/Chombu/CHOMBU ASHTALAKSHMI.jpg', weightRange: '250-500g' },
  { id: 'ch2', name: 'Hand Engraving Chombu', category: 'chombu', image: '/Products/Chombu/CHOMBU HAND ENGRAVING 1.jpg', weightRange: '200-400g' },
  { id: 'ch3', name: 'Machine Engraving Chombu', category: 'chombu', image: '/Products/Chombu/Chombu Machine engraving.jpg', weightRange: '220-450g' },
  { id: 'ch4', name: 'Nagas Chombu', category: 'chombu', image: '/Products/Chombu/CHOMBU NAGAS.jpg', weightRange: '180-350g' },
  { id: 'ch5', name: 'Plain Chombu', category: 'chombu', image: '/Products/Chombu/CHOMBU PLAIN.jpg', weightRange: '150-300g' },

  // Cups
  { id: 'cu1', name: 'Cup Fruit', category: 'cups', image: '/Products/Cup/CUP FRUIT 1.jpg', weightRange: '100-200g' },
  { id: 'cu2', name: 'Chandanam Pela', category: 'cups', image: '/Products/Cup/PELA CHANDANAM 1.jpg', weightRange: '80-180g' },
  { id: 'cu3', name: 'Pela Kolavu', category: 'cups', image: '/Products/Cup/PELA KOLAVU .jpg', weightRange: '90-190g' },
  { id: 'cu4', name: 'Spoon', category: 'cups', image: '/Products/Cup/SPOON.jpg', weightRange: '20-50g' },
  { id: 'cu5', name: 'Vatil', category: 'cups', image: '/Products/Cup/VATIL.jpg', weightRange: '120-250g' },

  // Glass
  { id: 'g1', name: 'Coffee Glass', category: 'glass', image: '/Products/Glass/Coffee Glass (1).jpg', weightRange: '60-120g' },
  { id: 'g2', name: 'Coke Glass', category: 'glass', image: '/Products/Glass/GLASS COKE 1.jpg', weightRange: '70-130g' },
  { id: 'g3', name: 'Milk Glass', category: 'glass', image: '/Products/Glass/GLASS MILK.jpg', weightRange: '65-125g' },
  { id: 'g4', name: 'Plain Glass', category: 'glass', image: '/Products/Glass/GLASS PLAIN 1.jpg', weightRange: '50-100g' },
  { id: 'g5', name: 'Runner Glass', category: 'glass', image: '/Products/Glass/glass runner.jpg', weightRange: '80-150g' },
  { id: 'g6', name: 'Regular Tumbler', category: 'glass', image: '/Products/Glass/Regular tumbler .jpg', weightRange: '90-170g' },

  // Kamakshi
  { id: 'k1', name: 'Kamakshi', category: 'kamakshi', image: '/Products/Kamakshi/KAMAKSHI 2.jpg', weightRange: '300-600g' },
  { id: 'k2', name: 'Ashtalakshmi Kamakshi', category: 'kamakshi', image: '/Products/Kamakshi/KAMAKSHI ASHTALAKSHMI.jpg', weightRange: '350-700g' },
  { id: 'k3', name: 'DOUBLE SHEET KAMAKSHI', category: 'kamakshi', image: '/Products/Kamakshi/Kamakshi Double Sheet.jpg', weightRange: '400-800g' },
  { id: 'k4', name: 'Karumbu Kamakshi', category: 'kamakshi', image: '/Products/Kamakshi/KAMAKSHI KARUMBU.jpg', weightRange: '320-650g' },
  { id: 'k5', name: 'Lotus Kamatchi', category: 'kamakshi', image: '/Products/Kamakshi/KAMAKSHI LOTUS.jpg', weightRange: '280-550g' },
  { id: 'k6', name: 'Special Elephant Kamatchi', category: 'kamakshi', image: '/Products/Kamakshi/KAMAKSHI SPECIAL ELEPHANT.jpg', weightRange: '500-1000g' },

  // Kodam
  { id: 'ko1', name: 'Ashtalakshmi Kodam', category: 'kodam', image: '/Products/Kodam/kodam ashtalakshmi 2.jpg', weightRange: '300-600g' },
  { id: 'ko2', name: 'Machine Engraving Kodam', category: 'kodam', image: '/Products/Kodam/Kodam machine engraving 1.jpg', weightRange: '250-500g' },
  { id: 'ko3', name: 'Nagas Kodam', category: 'kodam', image: '/Products/Kodam/kodam nagas 2.jpg', weightRange: '220-450g' },
  { id: 'ko4', name: 'Plain Kodam', category: 'kodam', image: '/Products/Kodam/kodam plain.jpg', weightRange: '200-400g' },
  { id: 'ko5', name: 'Special Nagas Kodam', category: 'kodam', image: '/Products/Kodam/kodam SPECIAL NAGAS.jpg', weightRange: '280-550g' },

  // Others
  { id: 'o1', name: 'Ghee Jadi', category: 'others', image: '/Products/Others/GHEE JADI 2.jpg', weightRange: '150-300g' },
  { id: 'o2', name: 'Pal Kendi', category: 'others', image: '/Products/Others/PAAL KENDI.jpg', weightRange: '200-400g' },
  { id: 'o3', name: 'Paladai', category: 'others', image: '/Products/Others/PALADAI .jpg', weightRange: '180-350g' },
  { id: 'o4', name: 'Paladai with Padham', category: 'others', image: '/Products/Others/PALADAI .jpg', weightRange: '200-400g' },
  { id: 'o5', name: 'Paneer Chombu', category: 'others', image: '/Products/Others/paneer chombu.jpg', weightRange: '250-500g' },

  // Panchapathram
  { id: 'p1', name: 'Panchapathram', category: 'panchapathram', image: '/Products/Panchapathram/PANCHAPATHRAM.jpg', weightRange: '400-800g' },
  { id: 'p2', name: 'Uthrani', category: 'panchapathram', image: '/Products/Panchapathram/UTHRANI.jpg', weightRange: '350-700g' },

  // Plates
  { id: 'pl1', name: 'S D Plate Plain', category: 'plates', image: '/Products/Plates/PLATE S D PLAIN.jpg', weightRange: '200-400g' },
  { id: 'pl2', name: 'Lunch Plate', category: 'plates', image: '/Products/Plates/PLATE LUNCH 1.jpg', weightRange: '250-500g' },
  { id: 'pl3', name: 'Poona Plate', category: 'plates', image: '/Products/Plates/PLATE POONA 1.jpg', weightRange: '220-450g' },
  { id: 'pl4', name: 'S D Plate Engraving', category: 'plates', image: '/Products/Plates/PLATE S D ENGRAVING.jpg', weightRange: '230-470g' },
  { id: 'pl5', name: 'Oval Tele Plate', category: 'plates', image: '/Products/Plates/plate TELEPHONE OVAL.jpg', weightRange: '180-360g' },
  { id: 'pl6', name: 'Round Tele Plate', category: 'plates', image: '/Products/Plates/PLATE TELEPHONE ROUND.jpg', weightRange: '190-380g' },

  // Simil
  { id: 's1', name: 'Chennai Design Simil', category: 'simil', image: '/Products/Simil/Design Chennai Simil.jpg', weightRange: '300-600g' },
  { id: 's2', name: 'Chennai Nagas Simil', category: 'simil', image: '/Products/Simil/SIMIL CHENNAI NAGAS.jpg', weightRange: '280-550g' },
  { id: 's3', name: 'Round Design Simil', category: 'simil', image: '/Products/Simil/Design Round Simil.jpg', weightRange: '250-500g' },
  { id: 's4', name: 'Round Nagas Simil', category: 'simil', image: '/Products/Simil/SIMIL ROUND NAGAS.jpg', weightRange: '270-540g' },

  // Trays
  { id: 't1', name: 'Ashtalakshmi Tray', category: 'trays', image: '/Products/Trays/tray ashtalaksmi 2.jpg', weightRange: '300-600g' },
  { id: 't2', name: 'Nappu Tray', category: 'trays', image: '/Products/Trays/tray NAPPU 2.jpg', weightRange: '250-500g' },
  { id: 't3', name: 'Shell Elephant Leg Tray', category: 'trays', image: '/Products/Trays/Silver Elephant Leg Tray.jpg', weightRange: '400-800g' },

  // Vel
  { id: 've1', name: 'Hollow Vel', category: 'vel', image: '/Products/Vel/VEL HOLLOW.jpg', weightRange: '200-400g' },
  { id: 've2', name: 'Vel Stand', category: 'vel', image: '/Products/Vel/IMG_20250104_175504.jpg', weightRange: '150-300g' }
];
